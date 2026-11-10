import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../http/asyncHandler';
import { parseBody } from '../http/validation';
import { badRequest } from '../http/errors';
import { requireAuth } from '../auth/middleware';
import * as shop from './service';
import * as stipop from './stipop';

/**
 * Router cửa hàng: xem quyền sở hữu và mua vật phẩm bằng xu.
 * Mọi endpoint đều yêu cầu đăng nhập; chỉ chạy khi bật chế độ trực tuyến.
 */
export const shopRouter = Router();

shopRouter.use(requireAuth);

const purchaseBody = z.object({
  itemId: z.string().min(1, 'Thiếu mã vật phẩm.'),
});

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

/* --------------------------------------------------------------------------
 * Nhãn dán Stipop — server làm proxy để giữ API key bí mật.
 * Khi chưa cấu hình `STIPOP_API_KEY`, `listStipopPacks` trả `enabled: false`
 * để client tự ẩn phần này.
 * ------------------------------------------------------------------------ */

const stipopListQuery = z.object({
  sort: z.enum(['trending', 'new']).optional(),
  page: z.coerce.number().int().min(1).max(50).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

/** Danh sách gói nhãn dán Stipop (thịnh hành/mới nhất). */
shopRouter.get(
  '/stipop/packs',
  asyncHandler(async (req, res) => {
    const parsed = stipopListQuery.safeParse(req.query);
    if (!parsed.success) throw badRequest('Tham số truy vấn không hợp lệ.');
    res.json(await stipop.listStipopPacks(req.auth!.userId, parsed.data));
  }),
);

/** Chi tiết một gói Stipop kèm danh sách URL nhãn dán. */
shopRouter.get(
  '/stipop/packs/:packId',
  asyncHandler(async (req, res) => {
    res.json(await stipop.getStipopPack(req.auth!.userId, req.params.packId));
  }),
);
