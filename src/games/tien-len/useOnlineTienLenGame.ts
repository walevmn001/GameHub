import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Card } from '@/types';
import { normalizeConfig, REALTIME_EVENTS } from '@/types';
import type { MatchView } from '@/types';
import { socketService } from '@/services/SocketService';
import {
  sortAscending,
  sortDescending,
  suggestMove,
  validateSelection,
  type PlayRecord,
  type TienLenPlayer,
  type TienLenState,
} from '@/game-engine/tienlen';
import type { MatchResult } from '@/games/types';
import type { GameIntro, SortMode, TienLenGameApi } from './useTienLenGame';

/**
 * Bàn chơi Tiến Lên TRỰC TUYẾN.
 *
 * Máy chủ là nguồn chân lý: client chỉ gửi hành động (đánh/bỏ lượt) và hiển thị trạng thái
 * nhận được qua Socket.IO. Bài của người khác được máy chủ ẩn, chỉ lộ số lá.
 */

const SUITS: Card['suit'][] = ['spade', 'club', 'diamond', 'heart'];

/** Bài úp của đối thủ — chỉ cần đúng số lượng để hiển thị chồng bài. */
function placeholderHand(count: number): Card[] {
  return Array.from({ length: Math.max(0, count) }, (_, i): Card => ({
    id: `hidden-${i}`,
    suit: SUITS[i % SUITS.length],
    rank: 3,
  }));
}

function viewToState(view: MatchView, startedAt: number): TienLenState {
  const players: TienLenPlayer[] = view.seats.map((seat) => ({
    id: seat.id,
    name: seat.name,
    avatar: seat.avatar,
    isBot: seat.isBot,
    coins: seat.coins,
    seat: seat.seat,
    hand: seat.isYou ? view.you.hand : placeholderHand(seat.handCount),
    placement: seat.placement,
  }));

  return {
    players,
    config: view.config,
    currentTurn: view.currentTurn,
    lastCombo: view.lastCombo,
    lastPlaySeat: view.lastPlaySeat,
    passCount: view.passCount,
    phase: view.phase,
    finishOrder: view.finishOrder,
    history: view.history,
    cutEvents: [],
    whiteWinSeat: view.whiteWinSeat,
    whiteWinLabel: view.whiteWinLabel,
    settlement: view.settlement,
    turnCount: 0,
    startedAt,
  };
}

/** Trạng thái rỗng hợp lệ dùng trước khi máy chủ phát ván đầu tiên. */
function emptyState(playerName: string, playerAvatar: string): TienLenState {
  return {
    players: [
      { id: 'me', name: playerName, avatar: playerAvatar, isBot: false, coins: 0, seat: 0, hand: [], placement: null },
    ],
    config: normalizeConfig(),
    currentTurn: 0,
    lastCombo: null,
    lastPlaySeat: null,
    passCount: 0,
    phase: 'playing',
    finishOrder: [],
    history: [],
    cutEvents: [],
    whiteWinSeat: null,
    whiteWinLabel: null,
    settlement: null,
    turnCount: 0,
    startedAt: Date.now(),
  };
}

interface UseOnlineTienLenGameOptions {
  roomId: string;
  playerName: string;
  playerAvatar: string;
  onMatchEnd: (result: MatchResult) => void;
}

export function useOnlineTienLenGame({
  roomId,
  playerName,
  playerAvatar,
  onMatchEnd,
}: UseOnlineTienLenGameOptions): TienLenGameApi & { ready: boolean } {
  const [view, setView] = useState<MatchView | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('asc');
  const [message, setMessage] = useState('');
  const [cardAnimKey, setCardAnimKey] = useState(0);
  const [intro, setIntro] = useState<GameIntro>('shuffle');
  const [dealSeq, setDealSeq] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  const startedAtRef = useRef<number>(Date.now());
  const matchIdRef = useRef<string | null>(null);
  const reportedRef = useRef(false);
  const onMatchEndRef = useRef(onMatchEnd);
  onMatchEndRef.current = onMatchEnd;

  /** Vào kênh phòng + đồng bộ ván. Tự thử lại vài lần khi socket chưa kết nối xong. */
  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const join = async (): Promise<void> => {
      if (cancelled) return;
      const result = await socketService.joinRoom(roomId);
      if (cancelled) return;
      if (result.ok) {
        void socketService.sync();
        return;
      }
      attempts += 1;
      if (attempts < 10) timer = setTimeout(join, 1000);
    };

    void join();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [roomId]);

  /** Nhận trạng thái ván từ máy chủ. */
  useEffect(() => {
    const applyView = (next: MatchView): void => {
      if (matchIdRef.current !== next.matchId) {
        matchIdRef.current = next.matchId;
        startedAtRef.current = Date.now();
        reportedRef.current = false;
        setSelected([]);
        setMessage('');
        setDealSeq((seq) => seq + 1);
      }
      setCardAnimKey((key) => key + 1);
      setView(next);
    };

    const offStarted = socketService.on(REALTIME_EVENTS.matchStarted, applyView);
    const offState = socketService.on(REALTIME_EVENTS.matchState, applyView);
    const offEnded = socketService.on(REALTIME_EVENTS.matchEnded, applyView);
    const offError = socketService.on(REALTIME_EVENTS.serverError, ({ message: text }) => {
      setMessage(text);
    });

    return () => {
      offStarted();
      offState();
      offEnded();
      offError();
    };
  }, []);

  /** Hiệu ứng mở màn cho mỗi ván mới. */
  useEffect(() => {
    if (dealSeq === 0) return;
    setIntro('shuffle');
    const toDeal = setTimeout(() => setIntro('deal'), 1200);
    const toDone = setTimeout(() => setIntro('done'), 2200);
    return () => {
      clearTimeout(toDeal);
      clearTimeout(toDone);
    };
  }, [dealSeq]);

  /** Nhịp đếm cho đồng hồ lượt của người chơi. */
  useEffect(() => {
    if (!view || view.phase !== 'playing' || view.deadline === null) return;
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(interval);
  }, [view]);

  const state = useMemo<TienLenState>(
    () => (view ? viewToState(view, startedAtRef.current) : emptyState(playerName, playerAvatar)),
    [view, playerName, playerAvatar],
  );

  const humanSeat = view ? view.you.seat : 0;
  const humanHand = state.players[humanSeat]?.hand ?? [];
  const isHumanTurn = state.phase === 'playing' && state.currentTurn === humanSeat;

  const displayHand = useMemo<Card[]>(
    () => (sortMode === 'asc' ? sortAscending(humanHand) : sortDescending(humanHand)),
    [humanHand, sortMode],
  );

  const selectionInfo = useMemo(
    () => validateSelection(state, humanSeat, selected),
    [state, humanSeat, selected],
  );

  const lastActionBySeat = useMemo(() => {
    const map = new Map<number, PlayRecord>();
    for (const record of state.history) map.set(record.seat, record);
    return map;
  }, [state.history]);

  const totalTurnSeconds = state.config.turnMs / 1000;
  const timeLeft =
    view && view.deadline !== null
      ? Math.max(0, (view.deadline - now) / 1000)
      : totalTurnSeconds;

  /** Báo kết quả đúng một lần khi ván kết thúc (máy chủ đã ghi lịch sử, client chỉ hiển thị). */
  useEffect(() => {
    if (!view || view.phase !== 'finished' || reportedRef.current) return;
    reportedRef.current = true;
    const placement = state.players[humanSeat]?.placement ?? state.players.length;
    const coinDelta = view.settlement?.perSeat.find((s) => s.seat === humanSeat)?.net ?? 0;
    onMatchEndRef.current({
      gameId: view.gameId,
      win: placement === 1,
      placement,
      totalPlayers: state.players.length,
      score: placement === 1 ? 10 : -5,
      durationMs: Date.now() - startedAtRef.current,
      coinDelta,
    });
  }, [view, state, humanSeat]);

  const toggleSelect = useCallback((cardId: string) => {
    setSelected((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId],
    );
  }, []);

  const clearSelection = useCallback(() => setSelected([]), []);

  const playSelected = useCallback(() => {
    if (selected.length === 0) {
      setMessage('Hãy chọn bài để đánh.');
      return;
    }
    if (!isHumanTurn) return;
    void socketService.play(selected).then((result) => {
      if (result.ok) {
        setSelected([]);
        setMessage('');
      } else {
        setMessage(result.error);
      }
    });
  }, [selected, isHumanTurn]);

  const pass = useCallback(() => {
    if (!isHumanTurn) return;
    void socketService.pass().then((result) => {
      if (result.ok) {
        setSelected([]);
        setMessage('');
      } else {
        setMessage(result.error);
      }
    });
  }, [isHumanTurn]);

  const toggleSort = useCallback(() => {
    setSortMode((mode) => (mode === 'asc' ? 'desc' : 'asc'));
  }, []);

  const hint = useCallback(() => {
    const mustBeat = state.lastCombo && state.lastPlaySeat !== humanSeat ? state.lastCombo : null;
    const move = suggestMove(humanHand, mustBeat);
    if (!move) {
      setMessage('Không tìm được nước đi phù hợp.');
      return;
    }
    setSelected(move.cards.map((c) => c.id));
    setMessage('');
  }, [state.lastCombo, state.lastPlaySeat, humanSeat, humanHand]);

  const restart = useCallback(() => {
    setSelected([]);
    setMessage('Ván mới do chủ phòng bắt đầu từ phòng chờ.');
    void socketService.sync();
  }, []);

  const dismissMessage = useCallback(() => setMessage(''), []);

  return {
    state,
    config: state.config,
    settlement: state.settlement,
    humanSeat,
    humanHand,
    displayHand,
    selected,
    sortMode,
    timeLeft,
    totalTurnSeconds,
    message,
    cardAnimKey,
    dealSeq,
    intro,
    dealing: intro === 'deal',
    isHumanTurn,
    selectionInfo,
    lastActionBySeat,
    toggleSelect,
    clearSelection,
    playSelected,
    pass,
    toggleSort,
    hint,
    restart,
    dismissMessage,
    ready: view !== null,
  };
}
