import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../prisma';
import { env } from '../env';
import { asyncHandler } from '../http/asyncHandler';
import { parseBody } from '../http/validation';
import { badRequest, conflict, unauthorized } from '../http/errors';
import { signToken } from './jwt';
import { requireAuth } from './middleware';
import { loadPublicUser } from '../users/service';

export const authRouter = Router();

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

/** Username nằm trong danh sách cấu hình sẽ được cấp quyền admin. */
function bootstrapRole(username: string): 'admin' | 'user' {
  return env.adminUsernames.includes(username) ? 'admin' : 'user';
}

const registerSchema = z.object({
  username: z
    .string()
    .regex(USERNAME_PATTERN, 'Tên đăng nhập 3–20 ký tự, chỉ gồm chữ, số và dấu gạch dưới.'),
  displayName: z.string().trim().min(1).max(24).optional(),
  password: z.string().min(6, 'Mật khẩu cần tối thiểu 6 ký tự.'),
});

const loginSchema = z.object({
  username: z.string().min(1, 'Hãy nhập tên đăng nhập.'),
  password: z.string().min(1, 'Hãy nhập mật khẩu.'),
});

const guestSchema = z.object({
  displayName: z.string().trim().min(1).max(20).optional(),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Hãy nhập mật khẩu hiện tại.'),
  newPassword: z.string().min(6, 'Mật khẩu mới cần tối thiểu 6 ký tự.'),
});

/** Đăng ký tài khoản mới. */
authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const input = parseBody(registerSchema, req.body);
    const username = input.username.trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) throw conflict('Tên đăng nhập đã được dùng.');

    const passwordHash = await bcrypt.hash(input.password, 10);
    const displayName = (input.displayName?.trim() || input.username.trim()).slice(0, 24);

    const user = await prisma.user.create({
      data: {
        username,
        displayName,
        passwordHash,
        coins: env.startingCoins,
        role: bootstrapRole(username),
        stats: { create: {} },
      },
    });

    const token = signToken({ sub: user.id, username: user.username, isGuest: false });
    res.status(201).json({ token, user: await loadPublicUser(user.id) });
  }),
);

/** Đăng nhập bằng tên đăng nhập + mật khẩu. */
authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const input = parseBody(loginSchema, req.body);
    const username = input.username.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) throw unauthorized('Tên đăng nhập hoặc mật khẩu không đúng.');

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) throw unauthorized('Tên đăng nhập hoặc mật khẩu không đúng.');

    // Đồng bộ quyền admin cho username nằm trong danh sách cấu hình (bootstrap).
    const expectedRole = bootstrapRole(user.username);
    if (expectedRole === 'admin' && user.role !== 'admin') {
      await prisma.user.update({ where: { id: user.id }, data: { role: 'admin' } });
    }

    const token = signToken({ sub: user.id, username: user.username, isGuest: user.isGuest });
    res.json({ token, user: await loadPublicUser(user.id) });
  }),
);

/** Đăng nhập nhanh với tư cách khách (không cần mật khẩu do người dùng đặt). */
authRouter.post(
  '/guest',
  asyncHandler(async (req, res) => {
    const input = parseBody(guestSchema, req.body ?? {});
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const username = `guest_${suffix}_${Date.now().toString(36).slice(-4)}`;
    const displayName = input.displayName?.trim() || `Khách ${suffix}`;
    const passwordHash = await bcrypt.hash(`${username}-${Math.random()}`, 10);

    const user = await prisma.user.create({
      data: {
        username,
        displayName,
        passwordHash,
        coins: env.startingCoins,
        isGuest: true,
        stats: { create: {} },
      },
    });

    const token = signToken({ sub: user.id, username: user.username, isGuest: true });
    res.status(201).json({ token, user: await loadPublicUser(user.id) });
  }),
);

/** Đổi mật khẩu (yêu cầu đăng nhập). */
authRouter.post(
  '/change-password',
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = parseBody(changePasswordSchema, req.body);
    const user = await prisma.user.findUnique({ where: { id: req.auth!.userId } });
    if (!user) throw unauthorized();

    const valid = await bcrypt.compare(input.oldPassword, user.passwordHash);
    if (!valid) throw badRequest('Mật khẩu hiện tại không đúng.');

    const passwordHash = await bcrypt.hash(input.newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    res.json({ ok: true });
  }),
);

/** JWT là stateless: đăng xuất chủ yếu xoá token ở phía client. */
authRouter.post('/logout', (_req, res) => {
  res.json({ ok: true });
});
