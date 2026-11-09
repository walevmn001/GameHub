import type { Card, Combo } from './game';
import type { TienLenConfig } from './tienlen';
import type { Room } from './room';
import type { MatchSettlement } from '@/game-engine/tienlen/money';
import type { PlayRecord } from '@/game-engine/tienlen/engine';

/**
 * Hợp đồng realtime dùng chung cho cả client và server (Socket.IO).
 * Chỉ chứa kiểu dữ liệu nên không tạo phụ thuộc vòng khi chạy.
 */

/** Tên sự kiện Socket.IO — dùng hằng số để tránh gõ sai chuỗi. */
export const REALTIME_EVENTS = {
  roomJoin: 'room:join',
  roomLeave: 'room:leave',
  chatSend: 'chat:send',
  matchPlay: 'match:play',
  matchPass: 'match:pass',
  matchSync: 'match:sync',
  roomUpdated: 'room:updated',
  roomClosed: 'room:closed',
  chatMessage: 'chat:message',
  matchStarted: 'match:started',
  matchState: 'match:state',
  matchEnded: 'match:ended',
  serverError: 'server:error',
} as const;

/** Kết quả trả về tức thời cho một sự kiện từ client (ack). */
export type AckResult = { ok: true } | { ok: false; error: string };

export interface ChatMessage {
  roomId: string;
  fromId: string;
  from: string;
  text: string;
  at: number;
}

/** Ghế ngồi trong bàn online — ẩn bài của người khác, chỉ lộ số lá. */
export interface MatchSeatView {
  seat: number;
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  coins: number;
  handCount: number;
  placement: number | null;
  isYou: boolean;
}

/**
 * Trạng thái ván gửi tới một client cụ thể.
 * `you.hand` chỉ chứa bài của chính client nhận được sự kiện.
 */
export interface MatchView {
  matchId: string;
  roomId: string;
  gameId: string;
  config: TienLenConfig;
  seats: MatchSeatView[];
  you: { seat: number; hand: Card[] };
  currentTurn: number;
  lastCombo: Combo | null;
  lastPlaySeat: number | null;
  passCount: number;
  phase: 'playing' | 'finished';
  history: PlayRecord[];
  whiteWinSeat: number | null;
  whiteWinLabel: string | null;
  finishOrder: number[];
  settlement: MatchSettlement | null;
  /** Thời điểm hết lượt (ms epoch) của người đang tới lượt; null nếu ván đã kết thúc. */
  deadline: number | null;
}

/** Bản đồ sự kiện client → server. */
export interface ClientToServerEvents {
  'room:join': (payload: { roomId: string }, ack?: (result: AckResult) => void) => void;
  'room:leave': (payload: { roomId: string }, ack?: (result: AckResult) => void) => void;
  'chat:send': (payload: { text: string }, ack?: (result: AckResult) => void) => void;
  'match:play': (payload: { cardIds: string[] }, ack?: (result: AckResult) => void) => void;
  'match:pass': (payload: Record<string, never>, ack?: (result: AckResult) => void) => void;
  'match:sync': (payload: Record<string, never>, ack?: (result: AckResult) => void) => void;
}

/** Bản đồ sự kiện server → client. */
export interface ServerToClientEvents {
  'room:updated': (room: Room) => void;
  'room:closed': (payload: { roomId: string }) => void;
  'chat:message': (message: ChatMessage) => void;
  'match:started': (view: MatchView) => void;
  'match:state': (view: MatchView) => void;
  'match:ended': (view: MatchView) => void;
  'server:error': (payload: { message: string }) => void;
}

/** Dữ liệu gắn kèm mỗi kết nối Socket.IO sau khi xác thực. */
export interface SocketData {
  userId: string;
  displayName: string;
  roomId: string | null;
}
