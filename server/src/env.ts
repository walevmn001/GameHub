import 'dotenv/config';

function toNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  port: toNumber(process.env.PORT, 4000),
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-insecure-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? '').split(',').map((origin) => origin.trim()).filter(Boolean),
  startingCoins: toNumber(process.env.STARTING_COINS, 5000),
  adminUsernames: (process.env.ADMIN_USERNAMES ?? '').split(',').map((name) => name.trim().toLowerCase()).filter(Boolean),
  /**
   * API key của Stipop (https://dashboard.stipop.io). Để TRỐNG thì tính năng nhãn dán
   * Stipop tự động bị tắt (cửa hàng và bộ chọn nhãn dán ẩn phần Stipop, không báo lỗi).
   */
  stipopApiKey: process.env.STIPOP_API_KEY ?? '',
  isProd: process.env.NODE_ENV === 'production',
} as const;

if (!env.databaseUrl) console.warn('[env] Thiếu DATABASE_URL — server sẽ không truy cập được cơ sở dữ liệu.');
if (env.isProd && env.jwtSecret.startsWith('dev-insecure')) console.warn('[env] JWT_SECRET chưa được đổi khi chạy production!');
