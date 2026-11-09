import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { env } from '../env';

export interface TokenPayload {
  sub: string;
  username: string;
  isGuest: boolean;
}

/** Ký JWT cho người dùng. */
export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
  });
}

/** Kiểm tra và giải mã JWT; trả về null nếu token sai/hết hạn. */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    if (typeof decoded === 'string') return null;
    const record = decoded as Record<string, unknown>;
    if (typeof record.sub !== 'string' || typeof record.username !== 'string') return null;
    return {
      sub: record.sub,
      username: record.username,
      isGuest: Boolean(record.isGuest),
    };
  } catch {
    return null;
  }
}
