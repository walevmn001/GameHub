import { prisma } from '../prisma';
import { badRequest, conflict, forbidden, notFound } from '../http/errors';
import { isOnline } from '../realtime/presence';
import type {
  ConversationSummary,
  DirectMessage,
  DirectoryUser,
  FriendRelation,
  FriendRequestInfo,
  SocialOverview,
  UserRole,
} from '@/types';

/**
 * Nghiệp vụ xã hội: bạn bè, tìm người chơi và tin nhắn riêng.
 * Tất cả chỉ hoạt động ở chế độ trực tuyến (cần CSDL + máy chủ).
 */

const MAX_MESSAGE_LENGTH = 500;

/** Chọn các trường công khai của người dùng để đưa vào danh bạ. */
const DIRECTORY_SELECT = {
  id: true,
  username: true,
  displayName: true,
  avatar: true,
  coins: true,
  role: true,
  createdAt: true,
} as const;

interface DirectoryRow {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  coins: number;
  role: string;
  createdAt: Date;
}

function toDirectoryUser(row: DirectoryRow, relation: FriendRelation): DirectoryUser {
  return {
    id: row.id,
    username: row.username,
    displayName: row.displayName,
    avatar: row.avatar ?? '',
    coins: row.coins,
    role: row.role === 'admin' ? 'admin' : ('user' as UserRole),
    online: isOnline(row.id),
    relation,
    createdAt: row.createdAt.getTime(),
  };
}

function toDirectMessage(row: {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  readAt: Date | null;
  createdAt: Date;
}): DirectMessage {
  return {
    id: row.id,
    fromId: row.senderId,
    toId: row.recipientId,
    text: row.text,
    at: row.createdAt.getTime(),
    readAt: row.readAt ? row.readAt.getTime() : null,
  };
}

/** Bối cảnh quan hệ của người dùng hiện tại với tất cả người khác. */
interface RelationContext {
  friends: Set<string>;
  outgoing: Set<string>;
  incoming: Set<string>;
}

async function loadRelationContext(userId: string): Promise<RelationContext> {
  const [friendships, requests] = await Promise.all([
    prisma.friendship.findMany({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
      select: { userAId: true, userBId: true },
    }),
    prisma.friendRequest.findMany({
      where: { status: 'pending', OR: [{ fromId: userId }, { toId: userId }] },
      select: { fromId: true, toId: true },
    }),
  ]);

  const friends = new Set(
    friendships.map((f) => (f.userAId === userId ? f.userBId : f.userAId)),
  );
  const outgoing = new Set(requests.filter((r) => r.fromId === userId).map((r) => r.toId));
  const incoming = new Set(requests.filter((r) => r.toId === userId).map((r) => r.fromId));
  return { friends, outgoing, incoming };
}

function relationOf(ctx: RelationContext, otherId: string): FriendRelation {
  if (ctx.friends.has(otherId)) return 'friend';
  if (ctx.outgoing.has(otherId)) return 'outgoing';
  if (ctx.incoming.has(otherId)) return 'incoming';
  return 'none';
}

/** Danh sách bạn bè của người dùng. */
export async function listFriends(userId: string): Promise<DirectoryUser[]> {
  const friendships = await prisma.friendship.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    orderBy: { createdAt: 'desc' },
  });
  const friendIds = friendships.map((f) => (f.userAId === userId ? f.userBId : f.userAId));
  if (friendIds.length === 0) return [];

  const users = await prisma.user.findMany({
    where: { id: { in: friendIds } },
    select: DIRECTORY_SELECT,
  });
  const byId = new Map(users.map((u) => [u.id, u]));
  return friendIds
    .map((id) => byId.get(id))
    .filter((u): u is DirectoryRow => Boolean(u))
    .map((u) => toDirectoryUser(u, 'friend'));
}

/** Tìm người chơi theo username/tên hiển thị (hoặc gợi ý mới nhất khi không nhập gì). */
export async function searchUsers(userId: string, query: string): Promise<DirectoryUser[]> {
  const q = query.trim();
  const users = await prisma.user.findMany({
    where: {
      id: { not: userId },
      ...(q
        ? {
            OR: [
              { username: { contains: q, mode: 'insensitive' as const } },
              { displayName: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    },
    select: DIRECTORY_SELECT,
    orderBy: { createdAt: 'desc' },
    take: 30,
  });

  const ctx = await loadRelationContext(userId);
  return users.map((u) => toDirectoryUser(u, relationOf(ctx, u.id)));
}

/** Lời mời kết bạn đang chờ (đến và đi). */
export async function listRequests(userId: string): Promise<{
  incoming: FriendRequestInfo[];
  outgoing: FriendRequestInfo[];
}> {
  const [incomingRows, outgoingRows] = await Promise.all([
    prisma.friendRequest.findMany({
      where: { toId: userId, status: 'pending' },
      orderBy: { createdAt: 'desc' },
      include: { from: { select: DIRECTORY_SELECT } },
    }),
    prisma.friendRequest.findMany({
      where: { fromId: userId, status: 'pending' },
      orderBy: { createdAt: 'desc' },
      include: { to: { select: DIRECTORY_SELECT } },
    }),
  ]);

  return {
    incoming: incomingRows.map((row) => ({
      id: row.id,
      user: toDirectoryUser(row.from, 'incoming'),
      createdAt: row.createdAt.getTime(),
    })),
    outgoing: outgoingRows.map((row) => ({
      id: row.id,
      user: toDirectoryUser(row.to, 'outgoing'),
      createdAt: row.createdAt.getTime(),
    })),
  };
}

/** Tổng hợp cho trang Bạn bè: bạn bè + lời mời. */
export async function socialOverview(userId: string): Promise<SocialOverview> {
  const [friends, requests] = await Promise.all([listFriends(userId), listRequests(userId)]);
  return { friends, incoming: requests.incoming, outgoing: requests.outgoing };
}

/** Gửi lời mời kết bạn. */
export async function sendFriendRequest(userId: string, targetId: string): Promise<void> {
  if (userId === targetId) throw badRequest('Không thể tự kết bạn với chính mình.');

  const target = await prisma.user.findUnique({ where: { id: targetId }, select: { id: true } });
  if (!target) throw notFound('Không tìm thấy người chơi.');

  const existingFriendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userAId: userId, userBId: targetId },
        { userAId: targetId, userBId: userId },
      ],
    },
  });
  if (existingFriendship) throw conflict('Hai bạn đã là bạn bè.');

  // Nếu người kia đã gửi lời mời trước đó → chấp nhận luôn.
  const reverse = await prisma.friendRequest.findUnique({
    where: { fromId_toId: { fromId: targetId, toId: userId } },
  });
  if (reverse && reverse.status === 'pending') {
    await acceptRequest(userId, reverse.id);
    return;
  }

  const existing = await prisma.friendRequest.findUnique({
    where: { fromId_toId: { fromId: userId, toId: targetId } },
  });
  if (existing) {
    if (existing.status === 'pending') throw conflict('Bạn đã gửi lời mời cho người này.');
    await prisma.friendRequest.update({
      where: { id: existing.id },
      data: { status: 'pending' },
    });
    return;
  }

  await prisma.friendRequest.create({ data: { fromId: userId, toId: targetId } });
}

/** Id người gửi của một lời mời (dùng để phát thông báo khi được chấp nhận). */
export async function requesterOf(requestId: string): Promise<string | null> {
  const request = await prisma.friendRequest.findUnique({
    where: { id: requestId },
    select: { fromId: true },
  });
  return request?.fromId ?? null;
}

/** Chấp nhận lời mời kết bạn. */
export async function acceptRequest(userId: string, requestId: string): Promise<void> {
  const request = await prisma.friendRequest.findUnique({ where: { id: requestId } });
  if (!request || request.toId !== userId) throw notFound('Không tìm thấy lời mời.');
  if (request.status !== 'pending') throw badRequest('Lời mời này đã được xử lý.');

  await prisma.$transaction([
    prisma.friendRequest.update({ where: { id: request.id }, data: { status: 'accepted' } }),
    prisma.friendship.upsert({
      where: {
        userAId_userBId: {
          userAId: request.fromId < request.toId ? request.fromId : request.toId,
          userBId: request.fromId < request.toId ? request.toId : request.fromId,
        },
      },
      create: {
        userAId: request.fromId < request.toId ? request.fromId : request.toId,
        userBId: request.fromId < request.toId ? request.toId : request.fromId,
      },
      update: {},
    }),
  ]);
}

/** Từ chối lời mời kết bạn. */
export async function rejectRequest(userId: string, requestId: string): Promise<void> {
  const request = await prisma.friendRequest.findUnique({ where: { id: requestId } });
  if (!request || request.toId !== userId) throw notFound('Không tìm thấy lời mời.');
  await prisma.friendRequest.update({ where: { id: request.id }, data: { status: 'rejected' } });
}

/** Huỷ kết bạn. */
export async function unfriend(userId: string, friendId: string): Promise<void> {
  await prisma.friendship.deleteMany({
    where: {
      OR: [
        { userAId: userId, userBId: friendId },
        { userAId: friendId, userBId: userId },
      ],
    },
  });
  // Xoá luôn lời mời đã chấp nhận để có thể gửi lại lời mời mới sau này.
  await prisma.friendRequest.deleteMany({
    where: {
      OR: [
        { fromId: userId, toId: friendId },
        { fromId: friendId, toId: userId },
      ],
    },
  });
}

/** Kiểm tra hai người có phải bạn bè. */
export async function areFriends(a: string, b: string): Promise<boolean> {
  const found = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userAId: a, userBId: b },
        { userAId: b, userBId: a },
      ],
    },
    select: { id: true },
  });
  return Boolean(found);
}

/** Lịch sử tin nhắn giữa hai người (cũ → mới). */
export async function listMessages(userId: string, otherId: string): Promise<DirectMessage[]> {
  const rows = await prisma.directMessage.findMany({
    where: {
      OR: [
        { senderId: userId, recipientId: otherId },
        { senderId: otherId, recipientId: userId },
      ],
    },
    orderBy: { createdAt: 'asc' },
    take: 200,
  });
  return rows.map(toDirectMessage);
}

/** Đánh dấu đã đọc toàn bộ tin nhắn do `otherId` gửi cho `userId`. */
export async function markConversationRead(userId: string, otherId: string): Promise<void> {
  await prisma.directMessage.updateMany({
    where: { senderId: otherId, recipientId: userId, readAt: null },
    data: { readAt: new Date() },
  });
}

/** Gửi tin nhắn riêng (chỉ cho bạn bè). */
export async function sendMessage(
  userId: string,
  otherId: string,
  text: string,
): Promise<DirectMessage> {
  const trimmed = text.trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!trimmed) throw badRequest('Nội dung tin nhắn trống.');
  if (userId === otherId) throw badRequest('Không thể tự nhắn tin cho chính mình.');

  const target = await prisma.user.findUnique({ where: { id: otherId }, select: { id: true } });
  if (!target) throw notFound('Không tìm thấy người nhận.');
  if (!(await areFriends(userId, otherId))) {
    throw forbidden('Bạn chỉ có thể nhắn tin cho bạn bè.');
  }

  const row = await prisma.directMessage.create({
    data: { senderId: userId, recipientId: otherId, text: trimmed },
  });
  return toDirectMessage(row);
}

/** Tóm tắt các cuộc trò chuyện (bạn bè + tin cuối + số chưa đọc). */
export async function listConversations(userId: string): Promise<ConversationSummary[]> {
  const friends = await listFriends(userId);
  if (friends.length === 0) return [];

  const friendIds = friends.map((f) => f.id);
  const messages = await prisma.directMessage.findMany({
    where: {
      OR: [
        { senderId: userId, recipientId: { in: friendIds } },
        { recipientId: userId, senderId: { in: friendIds } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 500,
  });

  const lastByFriend = new Map<string, DirectMessage>();
  const unreadByFriend = new Map<string, number>();
  for (const row of messages) {
    const otherId = row.senderId === userId ? row.recipientId : row.senderId;
    if (!lastByFriend.has(otherId)) lastByFriend.set(otherId, toDirectMessage(row));
    if (row.recipientId === userId && row.readAt === null) {
      unreadByFriend.set(otherId, (unreadByFriend.get(otherId) ?? 0) + 1);
    }
  }

  return friends
    .map((friend) => ({
      friend,
      lastMessage: lastByFriend.get(friend.id) ?? null,
      unread: unreadByFriend.get(friend.id) ?? 0,
    }))
    .sort((a, b) => (b.lastMessage?.at ?? 0) - (a.lastMessage?.at ?? 0));
}

/** Tên hiển thị của người dùng (dùng cho thông báo realtime). */
export async function displayNameOf(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { displayName: true },
  });
  return user?.displayName ?? 'Người chơi';
}

/** Id của tất cả bạn bè (dùng để phát thông báo realtime). */
export async function friendIdsOf(userId: string): Promise<string[]> {
  const friendships = await prisma.friendship.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    select: { userAId: true, userBId: true },
  });
  return friendships.map((f) => (f.userAId === userId ? f.userBId : f.userAId));
}
