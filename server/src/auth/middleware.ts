import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from './jwt';
import { prisma } from '../prisma';
import { forbidden, unauthorized } from '../http/errors';

export interface AuthInfo {
  userId: string;
  username: string;
  isGuest: boolean;
  role: string;
}

declare global {
  // Bổ sung trường `auth` vào Request của Express sau khi xác thực.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthInfo;
    }
  }
}

async function authenticate(req: Request): Promise<AuthInfo | null> {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  const payload = verifyToken(header.slice('Bearer '.length).trim());
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, username: true, isGuest: true, role: true },
  });
  if (!user) return null;
  return { userId: user.id, username: user.username, isGuest: user.isGuest, role: user.role };
}

/** Xác thực nếu có token, nhưng không chặn khi thiếu (dùng cho endpoint công khai). */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  authenticate(req)
    .then((info) => {
      if (info) req.auth = info;
      next();
    })
    .catch(next);
}

/** Bắt buộc phải có token hợp lệ. */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  authenticate(req)
    .then((info) => {
      if (!info) {
        next(unauthorized());
        return;
      }
      req.auth = info;
      next();
    })
    .catch(next);
}

/** Bắt buộc đăng nhập và có quyền quản trị. */
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  authenticate(req)
    .then((info) => {
      if (!info) {
        next(unauthorized());
        return;
      }
      if (info.role !== 'admin') {
        next(forbidden('Chỉ quản trị viên mới truy cập được khu vực này.'));
        return;
      }
      req.auth = info;
      next();
    })
    .catch(next);
}
