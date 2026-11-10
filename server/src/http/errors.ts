import type { NextFunction, Request, Response } from 'express';

/** Lỗi nghiệp vụ có mã trạng thái HTTP, được đưa ra response dạng JSON thống nhất. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code = 'error',
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function badRequest(message: string): ApiError {
  return new ApiError(400, message, 'bad_request');
}

export function unauthorized(message = 'Bạn cần đăng nhập để thực hiện thao tác này.'): ApiError {
  return new ApiError(401, message, 'unauthorized');
}

export function forbidden(message = 'Bạn không có quyền thực hiện thao tác này.'): ApiError {
  return new ApiError(403, message, 'forbidden');
}

export function notFound(message = 'Không tìm thấy dữ liệu.'): ApiError {
  return new ApiError(404, message, 'not_found');
}

export function conflict(message: string): ApiError {
  return new ApiError(409, message, 'conflict');
}

/** Middleware xử lý lỗi cuối chuỗi — luôn trả về `{ error: { code, message } }`. */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ApiError) {
    res.status(error.status).json({ error: { code: error.code, message: error.message } });
    return;
  }
  const message = error instanceof Error ? error.message : 'Lỗi không xác định.';
  console.error('[error]', error);
  res.status(500).json({ error: { code: 'internal', message } });
}

/** Bắt các route không khớp. */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: { code: 'not_found', message: 'Đường dẫn không tồn tại.' } });
}
