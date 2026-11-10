import { REALTIME_EVENTS, type DirectMessage, type SocialNotification } from '@/types';
import { getIo, userChannel } from './io';
import { getRoomRow, toClientRoom, type RoomRow } from '../rooms/service';

/**
 * Phát thông báo cập nhật phòng cho mọi client đang kết nối.
 * Quy mô nhỏ nên phát toàn cục giúp danh sách phòng tự đồng bộ.
 */
export async function broadcastRoomUpdate(roomId: string): Promise<RoomRow | null> {
  const room = await getRoomRow(roomId);
  if (room) getIo()?.emit(REALTIME_EVENTS.roomUpdated, toClientRoom(room));
  return room;
}

/** Thông báo phòng đã đóng. */
export function broadcastRoomClosed(roomId: string): void {
  getIo()?.emit(REALTIME_EVENTS.roomClosed, { roomId });
}

/** Báo cho một người dùng tải lại danh sách bạn bè/lời mời. */
export function notifySocialUpdate(userId: string): void {
  getIo()?.to(userChannel(userId)).emit(REALTIME_EVENTS.socialUpdate);
}

/** Đẩy tin nhắn riêng tư tới cả người gửi (đa thiết bị) và người nhận. */
export function pushDirectMessage(message: DirectMessage): void {
  const io = getIo();
  if (!io) return;
  io.to(userChannel(message.toId)).emit(REALTIME_EVENTS.dmMessage, message);
  io.to(userChannel(message.fromId)).emit(REALTIME_EVENTS.dmMessage, message);
}

/** Đẩy thông báo xã hội (lời mời kết bạn, được chấp nhận) tới một người dùng. */
export function notifySocial(userId: string, notification: SocialNotification): void {
  getIo()?.to(userChannel(userId)).emit(REALTIME_EVENTS.socialNotification, notification);
}

/** Phát danh sách người dùng đang trực tuyến cho mọi client. */
export function broadcastPresence(userIds: string[]): void {
  getIo()?.emit(REALTIME_EVENTS.presenceUpdate, { userIds });
}
