import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Card, TienLenConfig } from '@/types';
import { TIEN_LEN_TURN_MS } from '@/utils/constants';
import { makeAvatarDataUri } from '@/utils/avatar';
import {
  chooseMove,
  createGame,
  passTurn,
  playCards,
  sortAscending,
  sortDescending,
  suggestMove,
  validateSelection,
  type PlayRecord,
  type TienLenSeatConfig,
  type TienLenState,
} from '@/game-engine/tienlen';
import type { MatchResult } from '@/games/types';

export const HUMAN_SEAT = 0;

const BOT_SEATS = [
  { name: 'Bảo Long', avatarSeed: 'bot-long' },
  { name: 'Thu Hà', avatarSeed: 'bot-ha' },
  { name: 'Minh Khoa', avatarSeed: 'bot-khoa' },
];

export type SortMode = 'asc' | 'desc';

/** Giai đoạn mở màn ván: xào bài → chia bài → vào chơi. */
export type GameIntro = 'shuffle' | 'deal' | 'done';

interface UseTienLenGameOptions {
  playerName: string;
  playerAvatar: string;
  /** Cấu hình bàn chơi (từ phòng); bỏ trống dùng mặc định. */
  config?: TienLenConfig;
  /** Danh sách chỗ ngồi (kèm số dư xu); bỏ trống dùng 1 người + 3 AI. */
  seats?: TienLenSeatConfig[];
  /** Skin áp dụng cho bài người chơi ở ghế đầu tiên trong chế độ cục bộ. */
  playerCardSkinId?: string | null;
  onMatchEnd: (result: MatchResult) => void;
}

/**
 * Hợp đồng chung cho logic bàn chơi Tiến Lên.
 * Cả bản cục bộ (AI) và bản trực tuyến (server-authoritative) đều trả về đúng cấu trúc này,
 * nhờ vậy giao diện bàn chơi dùng chung một component hiển thị.
 */
export interface TienLenGameApi {
  state: TienLenState;
  config: TienLenState['config'];
  settlement: TienLenState['settlement'];
  humanSeat: number;
  humanHand: Card[];
  displayHand: Card[];
  selected: string[];
  sortMode: SortMode;
  timeLeft: number;
  totalTurnSeconds: number;
  message: string;
  cardAnimKey: number;
  dealSeq: number;
  intro: GameIntro;
  dealing: boolean;
  isHumanTurn: boolean;
  selectionInfo: ReturnType<typeof validateSelection>;
  lastActionBySeat: Map<number, PlayRecord>;
  toggleSelect: (cardId: string) => void;
  clearSelection: () => void;
  playSelected: () => void;
  pass: () => void;
  toggleSort: () => void;
  hint: () => void;
  restart: () => void;
  dismissMessage: () => void;
}

function buildSeatConfig(
  playerName: string,
  playerAvatar: string,
  seats?: TienLenSeatConfig[],
): TienLenSeatConfig[] {
  if (seats && seats.length >= 2) {
    return seats.slice(0, 4).map((seat, index) => ({
      id: seat.id || `seat_${index}`,
      name: seat.name,
      avatar: seat.avatar,
      isBot: seat.isBot,
      coins: seat.coins,
    }));
  }

  const bots = BOT_SEATS.map((bot, index) => ({
    id: `bot_${index}`,
    name: bot.name,
    avatar: makeAvatarDataUri(bot.name, bot.avatarSeed),
    isBot: true,
  }));
  return [{ id: 'human', name: playerName, avatar: playerAvatar, isBot: false }, ...bots];
}

export function useTienLenGame({
  playerName,
  playerAvatar,
  config,
  seats,
  playerCardSkinId,
  onMatchEnd,
}: UseTienLenGameOptions): TienLenGameApi {
  const turnMs = config?.turnMs ?? TIEN_LEN_TURN_MS;

  const makeState = useCallback(
    () => {
      const seatConfigs = buildSeatConfig(playerName, playerAvatar, seats);
      if (seatConfigs[0] && !seatConfigs[0].isBot) {
        seatConfigs[0].cardSkinId = playerCardSkinId ?? null;
      }
      return createGame(seatConfigs, config);
    },
    [playerName, playerAvatar, seats, playerCardSkinId, config],
  );

  const [state, setState] = useState<TienLenState>(() => makeState());
  const [selected, setSelected] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('asc');
  const [timeLeft, setTimeLeft] = useState(turnMs / 1000);
  const [message, setMessage] = useState<string>('');
  const [cardAnimKey, setCardAnimKey] = useState(0);
  const [dealSeq, setDealSeq] = useState(1);
  const [intro, setIntro] = useState<GameIntro>('shuffle');

  const guardRef = useRef<string>('');
  const reportedRef = useRef(false);
  const onMatchEndRef = useRef(onMatchEnd);
  onMatchEndRef.current = onMatchEnd;

  const runOnce = useCallback((signature: string, fn: () => void) => {
    if (guardRef.current === signature) return;
    guardRef.current = signature;
    fn();
  }, []);

  const humanHand = state.players[HUMAN_SEAT].hand;
  const isHumanTurn = state.phase === 'playing' && state.currentTurn === HUMAN_SEAT;
  const selectionInfo = useMemo(
    () => validateSelection(state, HUMAN_SEAT, selected),
    [state, selected],
  );

  /** Bàn chơi hiển thị bài của người chơi theo chế độ sắp xếp đang chọn. */
  const displayHand = useMemo<Card[]>(
    () => (sortMode === 'asc' ? sortAscending(humanHand) : sortDescending(humanHand)),
    [humanHand, sortMode],
  );

  /** Hành động cuối của mỗi ghế để hiển thị hiệu ứng "Bỏ lượt" / "Đánh". */
  const lastActionBySeat = useMemo(() => {
    const map = new Map<number, PlayRecord>();
    for (const record of state.history) map.set(record.seat, record);
    return map;
  }, [state.history]);

  const performPlay = useCallback((seat: number, cardIds: string[]) => {
    setState((prev) => {
      const result = playCards(prev, seat, cardIds);
      if (result.error) {
        if (seat === HUMAN_SEAT) setMessage(result.error);
        return prev;
      }
      if (seat === HUMAN_SEAT) {
        setMessage('');
        setSelected([]);
      }
      setCardAnimKey((key) => key + 1);
      return result.state;
    });
  }, []);

  const performPass = useCallback((seat: number) => {
    setState((prev) => {
      const result = passTurn(prev, seat);
      if (result.error) {
        if (seat === HUMAN_SEAT) setMessage(result.error);
        return prev;
      }
      if (seat === HUMAN_SEAT) {
        setMessage('');
        setSelected([]);
      }
      return result.state;
    });
  }, []);

  /** Lượt của AI: chờ một nhịp rồi tự động đánh/bỏ lượt theo độ khó đã cấu hình. */
  useEffect(() => {
    if (state.phase !== 'playing') return;
    if (intro !== 'done') return;
    const seat = state.currentTurn;
    if (seat === HUMAN_SEAT) return;

    const signature = `bot-${state.history.length}-${seat}`;
    const delay = 700 + Math.random() * 700;
    const timer = setTimeout(() => {
      runOnce(signature, () => {
        setState((prev) => {
          if (prev.phase !== 'playing' || prev.currentTurn !== seat) return prev;
          const mustBeat =
            prev.lastCombo && prev.lastPlaySeat !== seat ? prev.lastCombo : null;
          const move = chooseMove(
            prev.players[seat].hand,
            mustBeat,
            prev.config.aiDifficulty,
          );
          if (move) {
            const result = playCards(prev, seat, move.cards.map((c) => c.id));
            if (!result.error) {
              setCardAnimKey((key) => key + 1);
              return result.state;
            }
          }
          const passed = passTurn(prev, seat);
          return passed.error ? prev : passed.state;
        });
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [state, runOnce, intro]);

  /** Đồng hồ đếm ngược cho lượt của người chơi. */
  useEffect(() => {
    if (intro !== 'done' || state.phase !== 'playing' || state.currentTurn !== HUMAN_SEAT) {
      setTimeLeft(turnMs / 1000);
      return;
    }
    const start = Date.now();
    setTimeLeft(turnMs / 1000);
    const interval = setInterval(() => {
      const remain = Math.max(0, (turnMs - (Date.now() - start)) / 1000);
      setTimeLeft(remain);
      if (remain <= 0) {
        clearInterval(interval);
        const signature = `human-timeout-${state.history.length}`;
        runOnce(signature, () => {
          setState((prev) => {
            if (prev.phase !== 'playing' || prev.currentTurn !== HUMAN_SEAT) return prev;
            const hand = prev.players[HUMAN_SEAT].hand;
            if (prev.lastCombo && prev.lastPlaySeat !== HUMAN_SEAT) {
              const move = suggestMove(hand, prev.lastCombo);
              if (move) return playCards(prev, HUMAN_SEAT, move.cards.map((c) => c.id)).state;
              return passTurn(prev, HUMAN_SEAT).state;
            }
            const move = suggestMove(hand, null);
            if (move) return playCards(prev, HUMAN_SEAT, move.cards.map((c) => c.id)).state;
            return prev;
          });
          setSelected([]);
          setMessage('Hết thời gian — hệ thống tự động đi giúp bạn.');
        });
      }
    }, 200);
    return () => clearInterval(interval);
  }, [state, runOnce, intro, turnMs]);

  /** Báo kết quả khi ván kết thúc. */
  useEffect(() => {
    if (state.phase !== 'finished' || reportedRef.current) return;
    reportedRef.current = true;
    const human = state.players[HUMAN_SEAT];
    const placement = human.placement ?? state.players.length;
    const coinDelta = state.settlement?.perSeat.find((s) => s.seat === HUMAN_SEAT)?.net ?? 0;
    onMatchEndRef.current({
      gameId: 'tien-len',
      win: placement === 1,
      placement,
      totalPlayers: state.players.length,
      score: placement === 1 ? 10 : -5,
      durationMs: Date.now() - state.startedAt,
      coinDelta,
    });
  }, [state]);

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
    performPlay(HUMAN_SEAT, selected);
  }, [selected, performPlay]);

  const pass = useCallback(() => performPass(HUMAN_SEAT), [performPass]);

  const toggleSort = useCallback(() => {
    setSortMode((mode) => (mode === 'asc' ? 'desc' : 'asc'));
  }, []);

  const hint = useCallback(() => {
    const mustBeat =
      state.lastCombo && state.lastPlaySeat !== HUMAN_SEAT ? state.lastCombo : null;
    const move = suggestMove(humanHand, mustBeat);
    if (!move) {
      setMessage('Không tìm được nước đi phù hợp.');
      return;
    }
    setSelected(move.cards.map((c) => c.id));
    setMessage('');
  }, [state.lastCombo, state.lastPlaySeat, humanHand]);

  const restart = useCallback(() => {
    guardRef.current = '';
    reportedRef.current = false;
    setSelected([]);
    setMessage('');
    setCardAnimKey(0);
    setDealSeq((seq) => seq + 1);
    setState(makeState());
  }, [makeState]);

  /** Hiệu ứng mở màn: xào bài rồi chia bài, sau đó vào chơi. */
  useEffect(() => {
    setIntro('shuffle');
    const toDeal = setTimeout(() => setIntro('deal'), 1200);
    const toDone = setTimeout(() => setIntro('done'), 2200);
    return () => {
      clearTimeout(toDeal);
      clearTimeout(toDone);
    };
  }, [dealSeq]);

  const dismissMessage = useCallback(() => setMessage(''), []);

  return {
    state,
    config: state.config,
    settlement: state.settlement,
    humanSeat: HUMAN_SEAT,
    humanHand,
    displayHand,
    selected,
    sortMode,
    timeLeft,
    totalTurnSeconds: turnMs / 1000,
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
  };
}
