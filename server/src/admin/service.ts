import { prisma } from '../prisma';
import { badRequest, notFound } from '../http/errors';
import { isOnline, onlineUserIds } from '../realtime/presence';
import type { AdminCoinResult, AdminStats, AdminUser, Room, UserRole } from '@/types';
import {
  getRoomRow,
  listRooms as listActiveRooms,
  toClientRoom,
} from '../rooms/service';

/**
 * Nghiệp vụ khu quản trị: liệt kê người dùng, tặng/trừ xu, đổi vai trò và xoá tài khoản.
 * Chỉ được gọi từ router đã qua middleware `requireAdmin`.
 */

const ADMIN_SELECT = {
  id: true,
  username: true,
  displayName: true,
  avatar: true,
  coins: true,
  role: true,
  isGuest: true,
  createdAt: true,
  stats: { select: { matches: true } },
} as const;

interface AdminRow {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  coins: number;
  role: string;
  isGuest: boolean;
  createdAt: Date;
  stats: { matches: number } | null;
}

function toAdminUser(row: AdminRow): AdminUser {
  return {
    id: row.id,
    username: row.username,
    displayName: row.displayName,
    avatar: row.avatar ?? '',
    coins: row.coins,
    role: row.role === 'admin' ? 'admin' : ('user' as UserRole),
    isGuest: row.isGuest,
    online: isOnline(row.id),
    createdAt: row.createdAt.getTime(),
    matches: row.stats?.matches ?? 0,
  };
}

/** Danh sách người dùng cho bảng quản trị (lọc theo username/tên hiển thị). */
export async function listUsers(query: string, take = 100, skip = 0): Promise<AdminUser[]> {
  const q = query.trim();
  const rows = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { username: { contains: q, mode: 'insensitive' } },
            { displayName: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {},
    select: ADMIN_SELECT,
    orderBy: { createdAt: 'desc' },
    take: Math.min(Math.max(take, 1), 200),
    skip: Math.max(skip, 0),
  });
  return rows.map(toAdminUser);
}

/** Số liệu tổng quan cho bảng quản trị. */
export async function adminStats(): Promise<AdminStats> {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [totalUsers, admins, guests, newUsersToday, coinAgg, matchAgg] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'admin' } }),
    prisma.user.count({ where: { isGuest: true } }),
    prisma.user.count({ where: { createdAt: { gte: dayAgo } } }),
    prisma.user.aggregate({ _sum: { coins: true } }),
    prisma.stats.aggregate({ _sum: { matches: true } }),
  ]);

  return {
    totalUsers,
    admins,
    guests,
    online: onlineUserIds().length,
    totalCoins: coinAgg._sum.coins ?? 0,
    totalMatches: matchAgg._sum.matches ?? 0,
    newUsersToday,
  };
}

/** Tặng (delta > 0) hoặc trừ (delta < 0) xu của một tài khoản. */
export async function giftCoins(userId: string, delta: number): Promise<AdminCoinResult> {
  if (!Number.isFinite(delta) || delta === 0) {
    throw badRequest('Số xu cần là một số nguyên khác 0.');
  }
  const rounded = Math.trunc(delta);

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { coins: true } });
  if (!user) throw notFound('Không tìm thấy người dùng.');

  const nextCoins = Math.max(0, user.coins + rounded);
  const applied = nextCoins - user.coins;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { coins: nextCoins },
    select: ADMIN_SELECT,
  });
  return { user: toAdminUser(updated), applied };
}

/** Đổi vai trò của một tài khoản. */
export async function setRole(userId: string, actorId: string, role: UserRole): Promise<AdminUser> {
  if (userId === actorId && role !== 'admin') {
    throw badRequest('Không thể tự hạ quyền quản trị của chính mình.');
  }
  const exists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!exists) throw notFound('Không tìm thấy người dùng.');

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role: role === 'admin' ? 'admin' : 'user' },
    select: ADMIN_SELECT,
  });
  return toAdminUser(updated);
}

/** Xoá tài khoản (dữ liệu liên quan xoá theo nhờ cascade). */
export async function deleteUser(userId: string, actorId: string): Promise<void> {
  if (userId === actorId) throw badRequest('Không thể xoá tài khoản đang đăng nhập.');
  const exists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!exists) throw notFound('Không tìm thấy người dùng.');
  await prisma.user.delete({ where: { id: userId } });
}

/** Danh sách phòng đang hoạt động cho bảng quản trị. */
export async function listRooms(): Promise<Room[]> {
  const rooms = await listActiveRooms();
  return rooms.map(toClientRoom);
}

/** Xoá phòng theo yêu cầu quản trị viên. */
export async function deleteRoom(roomId: string): Promise<void> {
  const room = await getRoomRow(roomId);
  if (!room) throw notFound('Không tìm thấy phòng.');
  await prisma.room.delete({ where: { id: roomId } });
}
