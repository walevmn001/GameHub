import { REALTIME_EVENTS, type AckResult } from '@/types';
import type { TienLenConfig } from '@/types';
import { chooseMove } from '@/game-engine/tienlen/ai';
import { cardValue } from '@/game-engine/tienlen/deck';
import {
  createGame,
  passTurn,
  playCards,
  type TienLenSeatConfig,
  type TienLenState,
} from '@/game-engine/tienlen/engine';
import { getIo, roomChannel } from '../realtime/io';
import { broadcastRoomUpdate } from '../realtime/broadcast';
import { setStatus, type RoomRow } from '../rooms/service';
import { buildMatchView, type MatchMeta } from './view';
import { recordMatchForUser, trimHistory } from './persist';
import { getCardSkinsForUsers } from '../shop/service';

/** Thời gian chờ trước khi người máy tự đi (giữ nhịp nhanh, không bắt người thật chờ). */
const BOT_DELAY_MS = 900;

interface MatchRuntime {
  matchId: string;
  roomId: string;
  gameId: string;
  state: TienLenState;
  /** Thời điểm hết lượt hiện tại (ms epoch). */
  deadline: number | null;
  timer: ReturnType<typeof setTimeout> | null;
  startedAt: number;
  /** Ghế của từng người thật (dùng để gửi đúng trạng thái và ghi lịch sử). */
  seatByUserId: Map<string, number>;
}

/** Toàn bộ ván đang chạy, khoá theo roomId. Quy mô nhỏ nên giữ trong bộ nhớ. */
const matches = new Map<string, MatchRuntime>();

export function hasMatch(roomId: string): boolean {
  return matches.has(roomId);
}

function clearTimer(match: MatchRuntime): void {
  if (match.timer) {
    clearTimeout(match.timer);
    match.timer = null;
  }
}

function matchMeta(match: MatchRuntime): MatchMeta {
  return {
    matchId: match.matchId,
    roomId: match.roomId,
    gameId: match.gameId,
    deadline: match.deadline,
  };
}

/** Gửi trạng thái ván tới từng người thật đang có mặt trong kênh phòng. */
async function emitViews(match: MatchRuntime, kind: 'state' | 'ended'): Promise<void> {
  const io = getIo();
  if (!io) return;
  const meta = matchMeta(match);
  const sockets = await io.in(roomChannel(match.roomId)).fetchSockets();
  for (const socket of sockets) {
    const seat = match.seatByUserId.get(socket.data.userId);
    if (seat === undefined) continue;
    const view = buildMatchView(match.state, seat, meta);
    if (kind === 'state') socket.emit(REALTIME_EVENTS.matchState, view);
    else socket.emit(REALTIME_EVENTS.matchEnded, view);
  }
}

/** Lên lịch cho lượt hiện tại: người thật chờ hết đồng hồ, người máy đi sau một nhịp ngắn. */
function scheduleTurn(match: MatchRuntime): void {
  clearTimer(match);
  const { state } = match;
  if (state.phase !== 'playing') {
    match.deadline = null;
    return;
  }
  const player = state.players[state.currentTurn];
  const delay = player.isBot ? BOT_DELAY_MS : Math.max(3000, state.config.turnMs);
  match.deadline = Date.now() + delay;
  match.timer = setTimeout(() => {
    void autoAdvance(match);
  }, delay);
}

/** Xử lý khi hết thời gian lượt: người máy tự chọn nước, người thật bị bỏ lượt/đánh lá nhỏ nhất. */
async function autoAdvance(match: MatchRuntime): Promise<void> {
  const { state } = match;
  if (state.phase !== 'playing') return;
  const seat = state.currentTurn;
  const player = state.players[seat];

  if (player.isBot) {
    const following = state.lastCombo !== null && state.lastPlaySeat !== seat;
    const move = chooseMove(player.hand, following ? state.lastCombo : null, state.config.aiDifficulty);
    if (move) {
      applyResult(match, playCards(state, seat, move.cards.map((card) => card.id)));
    } else {
      applyResult(match, passTurn(state, seat));
    }
    return;
  }

  // Người thật hết thời gian: bắt buộc đè thì bỏ lượt, còn dẫn lượt thì đánh lá nhỏ nhất.
  const mustFollowNow = state.lastCombo !== null && state.lastPlaySeat !== seat;
  if (mustFollowNow) {
    applyResult(match, passTurn(state, seat));
  } else {
    const lowest = player.hand.reduce((a, b) => (cardValue(a) <= cardValue(b) ? a : b));
    applyResult(match, playCards(state, seat, [lowest.id]));
  }
}

function applyResult(match: MatchRuntime, result: { state: TienLenState; error?: string }): void {
  if (result.error) return;
  match.state = result.state;
  void afterMove(match);
}

/** Sau mỗi nước đi: kết thúc ván hoặc chuyển lượt và phát trạng thái mới. */
async function afterMove(match: MatchRuntime): Promise<void> {
  if (match.state.phase === 'finished') {
    clearTimer(match);
    match.deadline = null;
    await finishMatch(match);
    return;
  }
  scheduleTurn(match);
  await emitViews(match, 'state');
}

/** Ghi lịch sử cho mọi người thật, phát trạng thái kết thúc và đưa phòng về trạng thái chờ. */
async function finishMatch(match: MatchRuntime): Promise<void> {
  const { state } = match;
  const settlement = state.settlement;
  const durationMs = Date.now() - match.startedAt;
  const totalPlayers = state.players.length;

  for (const [userId, seat] of match.seatByUserId) {
    const player = state.players[seat];
    const placement = player.placement ?? totalPlayers;
    const win = placement === 1;
    const score = win ? 10 - Math.max(0, placement - 1) * 2 : -5;
    const coinDelta = settlement?.perSeat.find((entry) => entry.seat === seat)?.net ?? 0;
    await recordMatchForUser(userId, {
      gameId: match.gameId,
      placement,
      totalPlayers,
      win,
      score,
      coinDelta,
      durationMs,
    }).catch((error) => console.error('[match] không ghi được lịch sử', error));
    await trimHistory(userId).catch(() => undefined);
  }

  await emitViews(match, 'ended');
  await setStatus(match.roomId, 'waiting').catch(() => undefined);
  await broadcastRoomUpdate(match.roomId);
  matches.delete(match.roomId);
}

/** Bắt đầu một ván mới cho phòng; mọi ghế (người thật + người máy) đều tham gia. */
export async function startMatchForRoom(room: RoomRow): Promise<void> {
  abortMatch(room.id);

  const cardSkins = await getCardSkinsForUsers(
    room.members.flatMap((member) => (member.userId ? [member.userId] : [])),
  );
  const seats: TienLenSeatConfig[] = room.members.map((member) => ({
    id: member.userId ?? member.id,
    name: member.isBot ? (member.botName ?? 'Máy') : (member.user?.displayName ?? 'Người chơi'),
    avatar: member.user?.avatar ?? '',
    isBot: member.isBot,
    coins: member.coins,
    cardSkinId: member.userId ? cardSkins.get(member.userId) ?? null : null,
  }));

  const seatByUserId = new Map<string, number>();
  room.members.forEach((member, index) => {
    if (member.userId) seatByUserId.set(member.userId, index);
  });

  const match: MatchRuntime = {
    matchId: `match_${room.id}_${Date.now().toString(36)}`,
    roomId: room.id,
    gameId: room.gameId,
    state: createGame(seats, room.config as Partial<TienLenConfig>),
    deadline: null,
    timer: null,
    startedAt: Date.now(),
    seatByUserId,
  };
  matches.set(room.id, match);

  if (match.state.phase === 'playing') {
    scheduleTurn(match);
  }

  const io = getIo();
  if (io) {
    const meta = matchMeta(match);
    const sockets = await io.in(roomChannel(room.id)).fetchSockets();
    for (const socket of sockets) {
      const seat = seatByUserId.get(socket.data.userId);
      if (seat === undefined) continue;
      socket.emit(REALTIME_EVENTS.matchStarted, buildMatchView(match.state, seat, meta));
    }
  }

  if (match.state.phase === 'playing') {
    await emitViews(match, 'state');
  } else {
    await finishMatch(match);
  }
}

/** Người chơi đánh bài. Kiểm tra ở server (nguồn chân lý), không tin dữ liệu từ client. */
export async function playInMatch(
  roomId: string,
  userId: string,
  cardIds: string[],
): Promise<AckResult> {
  const match = matches.get(roomId);
  if (!match) return { ok: false, error: 'Ván đấu chưa bắt đầu.' };
  const seat = match.seatByUserId.get(userId);
  if (seat === undefined) return { ok: false, error: 'Bạn không ở trong ván này.' };

  const result = playCards(match.state, seat, cardIds);
  if (result.error) return { ok: false, error: result.error };

  match.state = result.state;
  await afterMove(match);
  return { ok: true };
}

/** Người chơi bỏ lượt. */
export async function passInMatch(roomId: string, userId: string): Promise<AckResult> {
  const match = matches.get(roomId);
  if (!match) return { ok: false, error: 'Ván đấu chưa bắt đầu.' };
  const seat = match.seatByUserId.get(userId);
  if (seat === undefined) return { ok: false, error: 'Bạn không ở trong ván này.' };

  const result = passTurn(match.state, seat);
  if (result.error) return { ok: false, error: result.error };

  match.state = result.state;
  await afterMove(match);
  return { ok: true };
}

/** Đồng bộ lại trạng thái ván cho cả phòng (dùng khi client mới kết nối lại). */
export async function syncMatch(roomId: string): Promise<void> {
  const match = matches.get(roomId);
  if (!match) return;
  await emitViews(match, match.state.phase === 'finished' ? 'ended' : 'state');
}

/** Dừng ván đang chạy (phòng đóng, người chơi rời, hoặc bắt đầu ván mới). */
export function abortMatch(roomId: string): void {
  const match = matches.get(roomId);
  if (!match) return;
  clearTimer(match);
  matches.delete(roomId);
}

/** Dọn dẹp khi phòng bị đóng/xoá. */
export function disposeRoom(roomId: string): void {
  abortMatch(roomId);
}
