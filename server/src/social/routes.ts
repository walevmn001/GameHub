import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../http/asyncHandler';
import { parseBody } from '../http/validation';
import { requireAuth } from '../auth/middleware';
import { env } from '../env';
import { ApiError } from '../http/errors';
import { notifySocial, notifySocialUpdate, pushDirectMessage } from '../realtime/broadcast';
import * as social from './service';

export const socialRouter = Router();
socialRouter.use(requireAuth);

const sendRequestBody = z.object({ targetId: z.string().min(1, 'Thiếu người nhận lời mời.') });
const stickerSchema = z.object({ id: z.string().min(1).max(200), url: z.string().url().max(2048), previewUrl: z.string().url().max(2048), pageUrl: z.string().url().max(2048) });
const messageBody = z.object({ text: z.string().max(500).optional(), sticker: stickerSchema.optional() }).refine(
  (body) => Boolean(body.sticker) || Boolean(body.text?.trim()),
  'Nội dung tin nhắn trống.',
);

function isAllowedStickerUrl(value: string, hostname: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === hostname;
  } catch {
    return false;
  }
}

/** Trending stickers proxy: API key chỉ được dùng phía server, không lộ ra trình duyệt. */
socialRouter.get('/stickers/trending', asyncHandler(async (_req, res) => {
  if (!env.stickerApiKey) throw new ApiError(503, 'Chưa cấu hình STICKER_API_KEY cho sticker.', 'sticker_unavailable');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch('https://api.stickerapi.io/v2/stickers/trending?rating=g&lang=vi', {
      headers: { 'x-api-key': env.stickerApiKey, Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) throw new ApiError(502, 'Không tải được sticker từ MojiLaLa.', 'sticker_provider_error');
    const payload = await response.json() as { data?: Array<{ id?: unknown; url?: unknown; images?: { fixed_height?: { url?: unknown; webp?: unknown }; fixed_height_small?: { url?: unknown; webp?: unknown } }> }> };
    const stickers = (payload.data ?? []).flatMap((item) => {
      const image = typeof item.images?.fixed_height?.webp === 'string'
        ? item.images.fixed_height.webp
        : item.images?.fixed_height?.url;
      const preview = typeof item.images?.fixed_height_small?.webp === 'string'
        ? item.images.fixed_height_small.webp
        : item.images?.fixed_height_small?.url;
      if (typeof item.id !== 'string' || typeof item.url !== 'string' || typeof image !== 'string' || typeof preview !== 'string') return [];
      if (!isAllowedStickerUrl(image, 'cdn-stickers.mojilala.com') || !isAllowedStickerUrl(preview, 'cdn-stickers.mojilala.com') || !isAllowedStickerUrl(item.url, 'mojilala.com')) return [];
      return [{ id: item.id, url: image, previewUrl: preview, pageUrl: item.url }];
    }).slice(0, 50);
    res.setHeader('Cache-Control', 'private, max-age=300');
    res.json(stickers);
  } finally {
    clearTimeout(timeout);
  }
}));

socialRouter.get('/overview', asyncHandler(async (req, res) => { res.json(await social.socialOverview(req.auth!.userId)); }));
socialRouter.get('/friends', asyncHandler(async (req, res) => { res.json(await social.listFriends(req.auth!.userId)); }));
socialRouter.get('/search', asyncHandler(async (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q : '';
  res.json(await social.searchUsers(req.auth!.userId, query));
}));
socialRouter.get('/requests', asyncHandler(async (req, res) => { res.json(await social.listRequests(req.auth!.userId)); }));

socialRouter.post('/requests', asyncHandler(async (req, res) => {
  const { targetId } = parseBody(sendRequestBody, req.body);
  const userId = req.auth!.userId;
  await social.sendFriendRequest(userId, targetId);
  notifySocial(targetId, { kind: 'friend-request', fromId: userId, fromName: await social.displayNameOf(userId) });
  notifySocialUpdate(userId);
  notifySocialUpdate(targetId);
  res.json({ ok: true });
}));

socialRouter.post('/requests/:id/accept', asyncHandler(async (req, res) => {
  const userId = req.auth!.userId;
  const requesterId = await social.requesterOf(req.params.id);
  await social.acceptRequest(userId, req.params.id);
  if (requesterId) {
    notifySocial(requesterId, { kind: 'friend-accepted', fromId: userId, fromName: await social.displayNameOf(userId) });
    notifySocialUpdate(requesterId);
  }
  notifySocialUpdate(userId);
  res.json(await social.socialOverview(userId));
}));

socialRouter.post('/requests/:id/reject', asyncHandler(async (req, res) => {
  const userId = req.auth!.userId;
  await social.rejectRequest(userId, req.params.id);
  notifySocialUpdate(userId);
  res.json(await social.socialOverview(userId));
}));

socialRouter.delete('/friends/:friendId', asyncHandler(async (req, res) => {
  const userId = req.auth!.userId;
  const friendId = req.params.friendId;
  await social.unfriend(userId, friendId);
  notifySocialUpdate(userId);
  notifySocialUpdate(friendId);
  res.json(await social.socialOverview(userId));
}));

socialRouter.get('/conversations', asyncHandler(async (req, res) => { res.json(await social.listConversations(req.auth!.userId)); }));
socialRouter.get('/messages/:friendId', asyncHandler(async (req, res) => { res.json(await social.listMessages(req.auth!.userId, req.params.friendId)); }));

socialRouter.post('/messages/:friendId', asyncHandler(async (req, res) => {
  const { text, sticker } = parseBody(messageBody, req.body);
  const userId = req.auth!.userId;
  let messageText = text ?? '';
  if (sticker) {
    if (!isAllowedStickerUrl(sticker.url, 'cdn-stickers.mojilala.com') || !isAllowedStickerUrl(sticker.previewUrl, 'cdn-stickers.mojilala.com') || !isAllowedStickerUrl(sticker.pageUrl, 'mojilala.com')) {
      throw new ApiError(400, 'Sticker không hợp lệ.', 'invalid_sticker');
    }
    messageText = `[[gamehub-sticker:${encodeURIComponent(JSON.stringify(sticker))}]]`;
  }
  const message = await social.sendMessage(userId, req.params.friendId, messageText);
  pushDirectMessage(message);
  res.status(201).json(message);
}));

socialRouter.post('/messages/:friendId/read', asyncHandler(async (req, res) => {
  await social.markConversationRead(req.auth!.userId, req.params.friendId);
  res.json({ ok: true });
}));
