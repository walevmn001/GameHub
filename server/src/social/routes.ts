import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../http/asyncHandler';
import { parseBody } from '../http/validation';
import { requireAuth } from '../auth/middleware';
import { notifySocial, notifySocialUpdate, pushDirectMessage } from '../realtime/broadcast';
import * as social from './service';

/**
 * Router xã hội: bạn bè, tìm người chơi và tin nhắn riêng.
 * Mọi endpoint đều yêu cầu đăng nhập; chỉ chạy khi bật chế độ trực tuyến.
 */
export const socialRouter = Router();

socialRouter.use(requireAuth);

const sendRequestBody = z.object({
  targetId: z.string().min(1, 'Thiếu người nhận lời mời.'),
});

// Tin nhắn là VĂN BẢN hoặc NHÃN DÁN; phải có ít nhất một trong hai phần nội dung.
// `stickerId` có thể là id trong danh mục cửa hàng HOẶC URL ảnh Stipop (dài hơn 64 ký tự).
const messageBody = z
  .object({
    text: z.string().max(500).optional(),
    stickerId: z.string().max(512).optional(),
  })
  .refine((value) => Boolean(value.stickerId?.trim()) || Boolean(value.text?.trim()), {
    message: 'Nội dung tin nhắn trống.',
  });

/** Tổng hợp cho trang Bạn bè (bạn bè + lời mời đến/đi). */
socialRouter.get(
  '/overview',
  asyncHandler(async (req, res) => {
    res.json(await social.socialOverview(req.auth!.userId));
  }),
);

/** Danh sách bạn bè. */
socialRouter.get(
  '/friends',
  asyncHandler(async (req, res) => {
    res.json(await social.listFriends(req.auth!.userId));
  }),
);

/** Tìm người chơi theo username/tên hiển thị. */
socialRouter.get(
  '/search',
  asyncHandler(async (req, res) => {
    const query = typeof req.query.q === 'string' ? req.query.q : '';
    res.json(await social.searchUsers(req.auth!.userId, query));
  }),
);

/** Lời mời kết bạn đang chờ. */
socialRouter.get(
  '/requests',
  asyncHandler(async (req, res) => {
    res.json(await social.listRequests(req.auth!.userId));
  }),
);

/** Gửi lời mời kết bạn. */
socialRouter.post(
  '/requests',
  asyncHandler(async (req, res) => {
    const { targetId } = parseBody(sendRequestBody, req.body);
    const userId = req.auth!.userId;
    await social.sendFriendRequest(userId, targetId);
    notifySocial(targetId, {
      kind: 'friend-request',
      fromId: userId,
      fromName: await social.displayNameOf(userId),
    });
    notifySocialUpdate(userId);
    notifySocialUpdate(targetId);
    res.json({ ok: true });
  }),
);

/** Chấp nhận lời mời kết bạn. */
socialRouter.post(
  '/requests/:id/accept',
  asyncHandler(async (req, res) => {
    const userId = req.auth!.userId;
    const requesterId = await social.requesterOf(req.params.id);
    await social.acceptRequest(userId, req.params.id);
    if (requesterId) {
      notifySocial(requesterId, {
        kind: 'friend-accepted',
        fromId: userId,
        fromName: await social.displayNameOf(userId),
      });
      notifySocialUpdate(requesterId);
    }
    notifySocialUpdate(userId);
    res.json(await social.socialOverview(userId));
  }),
);

/** Từ chối lời mời kết bạn. */
socialRouter.post(
  '/requests/:id/reject',
  asyncHandler(async (req, res) => {
    const userId = req.auth!.userId;
    await social.rejectRequest(userId, req.params.id);
    notifySocialUpdate(userId);
    res.json(await social.socialOverview(userId));
  }),
);

/** Huỷ kết bạn. */
socialRouter.delete(
  '/friends/:friendId',
  asyncHandler(async (req, res) => {
    const userId = req.auth!.userId;
    const friendId = req.params.friendId;
    await social.unfriend(userId, friendId);
    notifySocialUpdate(userId);
    notifySocialUpdate(friendId);
    res.json(await social.socialOverview(userId));
  }),
);

/** Tóm tắt cuộc trò chuyện với bạn bè. */
socialRouter.get(
  '/conversations',
  asyncHandler(async (req, res) => {
    res.json(await social.listConversations(req.auth!.userId));
  }),
);

/** Lịch sử tin nhắn với một người bạn. */
socialRouter.get(
  '/messages/:friendId',
  asyncHandler(async (req, res) => {
    res.json(await social.listMessages(req.auth!.userId, req.params.friendId));
  }),
);

/** Gửi tin nhắn riêng cho bạn bè (văn bản hoặc nhãn dán). */
socialRouter.post(
  '/messages/:friendId',
  asyncHandler(async (req, res) => {
    const { text, stickerId } = parseBody(messageBody, req.body);
    const userId = req.auth!.userId;
    const message = await social.sendMessage(userId, req.params.friendId, { text, stickerId });
    pushDirectMessage(message);
    res.status(201).json(message);
  }),
);

/** Đánh dấu đã đọc toàn bộ tin nhắn từ một người bạn. */
socialRouter.post(
  '/messages/:friendId/read',
  asyncHandler(async (req, res) => {
    await social.markConversationRead(req.auth!.userId, req.params.friendId);
    res.json({ ok: true });
  }),
);
