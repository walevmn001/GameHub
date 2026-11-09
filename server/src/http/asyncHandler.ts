import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Bọc một handler bất đồng bộ để mọi lỗi (throw) đều rơi vào middleware xử lý lỗi,
 * tránh việc promise bị treo và response không bao giờ trả về.
 */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
