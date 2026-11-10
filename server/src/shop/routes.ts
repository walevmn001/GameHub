import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../http/asyncHandler';
import { parseBody } from '../http/validation';
import { requireAuth } from '../auth/middleware';
import * as shop from './service';

/**
 * Router cửa hàng: xem quyền sở hữu và mua vật phẩm bằng xu.
 * Mọi endpoint đều yêu cầu đăng nhập; chỉ chạy khi bật chế độ trực tuyến.
 */
export const shopRouter = Router();

shopRouter.use(requireAuth);

const purchaseBody = z.object({
  itemId: z.string().min(1, 'Thiếu mã vật phẩm.'),
});
const loadoutBody = z.object({
  kind: z.enum(['sticker', 'chatFrame', 'cardSkin', 'avatarFrame']),
  itemId: z.string().min(1).nullable(),
});

/** Vật phẩm đang trang bị của người dùng. */
shopRouter.get(
  '/loadout',
  asyncHandler(async (req, res) => {
    res.json(await shop.getLoadout(req.auth!.userId));
  }),
);

/** Trang bị hoặc tháo một vật phẩm đã sở hữu. */
shopRouter.put(
  '/loadout',
  asyncHandler(async (req, res) => {
    const { kind, itemId } = parseBody(loadoutBody, req.body);
    res.json(await shop.setLoadoutItem(req.auth!.userId, kind, itemId));
  }),
);

/** Danh sách id vật phẩm người dùng đã mua. */
shopRouter.get(
  '/purchases',
  asyncHandler(async (req, res) => {
    res.json(await shop.listPurchases(req.auth!.userId));
  }),
);

/** Mua một vật phẩm bằng xu. */
shopRouter.post(
  '/purchases',
  asyncHandler(async (req, res) => {
    const { itemId } = parseBody(purchaseBody, req.body);
    res.status(201).json(await shop.purchaseItem(req.auth!.userId, itemId));
  }),
);
