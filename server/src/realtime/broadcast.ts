import { REALTIME_EVENTS } from '@/types';
import { getIo } from './io';
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
