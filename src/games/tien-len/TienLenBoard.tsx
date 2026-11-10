import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bot,
  Coins,
  Lightbulb,
  LogOut,
  MoveHorizontal,
  Shuffle,
  SkipForward,
  Swords,
} from 'lucide-react';
import type { GameBoardProps } from '@/games/types';
import { REALTIME_EVENTS } from '@/types';
import { describeCombo } from '@/game-engine/tienlen';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile, useIsPortrait } from '@/hooks/useMediaQuery';
import { makeAvatarDataUri } from '@/utils/avatar';
import { playSound, setSoundEnabled } from '@/utils/sound';
import { cn } from '@/utils/cn';
import { Badge, Button } from '@/components/ui';
import { socketService } from '@/services/SocketService';
import { useTienLenGame, type TienLenGameApi } from './useTienLenGame';
import { useOnlineTienLenGame } from './useOnlineTienLenGame';
import { SeatPanel } from './components/SeatPanel';
import { PlayerHand } from './components/PlayerHand';
import { TableCenter } from './components/TableCenter';
import { ResultModal } from './components/ResultModal';
import { LandscapeFrame } from './components/LandscapeFrame';
import {
  CoinBurst,
  Confetti,
  CutBanner,
  ShuffleOverlay,
  WhiteWinPopup,
} from './components/Effects';

type SeatPosition = 'top' | 'left' | 'right';

const POSITION_CLASS: Record<SeatPosition, string> = {
  top: 'absolute left-1/2 top-2 -translate-x-1/2',
  right: 'absolute right-2 top-1/2 -translate-y-1/2',
  left: 'absolute left-2 top-1/2 -translate-y-1/2',
};

/** Vị trí các ghế đối thủ quanh bàn theo số người (2–4). */
function opponentSlots(count: number): Array<{ seat: number; position: SeatPosition }> {
  const table: Record<number, SeatPosition[]> = {
    2: ['top'],
    3: ['right', 'left'],
    4: ['right', 'top', 'left'],
  };
  const positions = table[count] ?? ['right', 'top', 'left'];
  return positions.map((position, index) => ({ seat: index + 1, position }));
}

/**
 * Tiến Lên Miền Nam — bàn chơi 2–4 người.
 *
 * Có hai luồng dùng chung một giao diện:
 * - Cục bộ: bạn + AI chạy hoàn toàn trên thiết bị (mặc định).
 * - Trực tuyến: máy chủ là nguồn chân lý, trạng thái đồng bộ qua Socket.IO.
 */
export default function TienLenBoard(props: GameBoardProps) {
  if (props.online && props.roomId) {
    return <OnlineTienLenBoard {...props} roomId={props.roomId} />;
  }
  return <LocalTienLenBoard {...props} />;
}

/** Bàn chơi cục bộ — luật chạy tại chỗ với AI. */
function LocalTienLenBoard({ onExit, onMatchEnd, config, seats }: GameBoardProps) {
  const { user } = useAuth();
  const playerName = user?.displayName ?? 'Bạn';
  const playerAvatar = useMemo(
    () => (user?.avatar && user.avatar.length > 0 ? user.avatar : makeAvatarDataUri(playerName)),
    [user?.avatar, playerName],
  );

  const game = useTienLenGame({ playerName, playerAvatar, config, seats, onMatchEnd });
  return <TienLenBoardView game={game} onExit={onExit} onRematch={game.restart} />;
}

/** Bàn chơi trực tuyến — trạng thái đến từ máy chủ qua Socket.IO. */
function OnlineTienLenBoard({
  onExit,
  onMatchEnd,
  roomId,
}: GameBoardProps & { roomId: string }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const playerName = user?.displayName ?? 'Bạn';
  const playerAvatar = useMemo(
    () => (user?.avatar && user.avatar.length > 0 ? user.avatar : makeAvatarDataUri(playerName)),
    [user?.avatar, playerName],
  );

  const game = useOnlineTienLenGame({ roomId, playerName, playerAvatar, onMatchEnd });

  /**
   * Khi một người chơi khác rời ván giữa chừng, máy chủ dừng ván và phát `server:error`.
   * Đưa người còn lại về phòng chờ để không còn thấy ghế của người đã rời.
   */
  useEffect(() => {
    return socketService.on(REALTIME_EVENTS.serverError, () => {
      navigate(`/rooms/${roomId}`);
    });
  }, [navigate, roomId]);

  /** Thoát bàn chơi: rời phòng (máy chủ dừng ván) rồi mới điều hướng. */
  const handleExit = useCallback(() => {
    void socketService.leaveRoom(roomId);
    onExit();
  }, [roomId, onExit]);

  /** Chơi lại: quay về phòng chờ để chủ phòng mở ván mới (không rời phòng). */
  const handleRematch = useCallback(() => {
    navigate(`/rooms/${roomId}`);
  }, [navigate, roomId]);

  if (!game.ready) return <WaitingRoom onExit={handleExit} />;

  return (
    <TienLenBoardView
      game={game}
      onExit={handleExit}
      onRematch={handleRematch}
      online
    />
  );
}

/** Màn hình chờ khi chưa nhận được trạng thái ván từ máy chủ. */
function WaitingRoom({ onExit }: { onExit: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-base-950 p-6 text-center">
      <span className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-neon-cyan" />
      <div>
        <p className="text-sm font-semibold text-slate-100">Đang kết nối bàn chơi trực tuyến…</p>
        <p className="mt-1 text-xs text-slate-500">Đang chờ trạng thái ván từ máy chủ.</p>
      </div>
      <Button variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />} onClick={onExit}>
        Thoát
      </Button>
    </div>
  );
}

/** Giao diện bàn chơi dùng chung cho cả hai luồng cục bộ và trực tuyến. */
function TienLenBoardView({
  game,
  onExit,
  onRematch,
  online = false,
}: {
  game: TienLenGameApi;
  onExit: () => void;
  onRematch: () => void;
  online?: boolean;
}) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const isPortrait = useIsPortrait();

  const [landscape, setLandscape] = useState(
    () => Boolean(user?.preferences.preferLandscape) && isPortrait && isMobile,
  );
  const [resultOpen, setResultOpen] = useState(false);
  const [cutLabel, setCutLabel] = useState<string | null>(null);
  const [cutSeq, setCutSeq] = useState(0);

  const { state } = game;
  const players = state.players;
  const currentPlayer = players[state.currentTurn];
  const human = players[game.humanSeat];

  const interactive = game.intro === 'done';
  const humanNet = game.settlement?.perSeat.find((s) => s.seat === game.humanSeat)?.net ?? 0;
  const humanWon = human.placement === 1;

  // Tôn trọng tuỳ chọn âm thanh của người dùng.
  useEffect(() => {
    setSoundEnabled(user?.preferences.sound ?? true);
  }, [user?.preferences.sound]);

  // Âm thanh xào bài / chia bài.
  useEffect(() => {
    if (game.intro === 'shuffle') playSound('shuffle');
    if (game.intro === 'deal') playSound('deal');
  }, [game.intro]);

  // Hiệu ứng chặt: đọc bản ghi hành động mới nhất.
  const historyLen = state.history.length;
  useEffect(() => {
    const last = state.history[state.history.length - 1];
    if (!last || last.type !== 'cut') return;
    setCutLabel(last.effectLabel ?? 'Chặt!');
    setCutSeq((seq) => seq + 1);
    playSound('cut');
    const timer = setTimeout(() => setCutLabel(null), 1700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyLen]);

  useEffect(() => {
    if (state.phase === 'finished') {
      const timer = setTimeout(() => setResultOpen(true), 900);
      return () => clearTimeout(timer);
    }
    setResultOpen(false);
    return undefined;
  }, [state.phase]);

  // Âm thanh thắng/thua khi ván kết thúc.
  useEffect(() => {
    if (state.phase !== 'finished') return;
    playSound(humanWon ? 'win' : 'lose');
    playSound('coin');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  const centerPlayerName =
    state.lastPlaySeat !== null
      ? players[state.lastPlaySeat].name
      : currentPlayer?.name ?? null;

  const timer = game.isHumanTurn && interactive
    ? { progress: game.timeLeft / game.totalTurnSeconds, seconds: game.timeLeft }
    : null;
  const waitingLabel =
    interactive && !game.isHumanTurn && state.phase === 'playing' && currentPlayer
      ? `${currentPlayer.name} đang đi…`
      : null;

  const canPass = interactive && game.isHumanTurn && state.lastCombo !== null;
  const canPlay = interactive && game.isHumanTurn && game.selectionInfo.canPlay;

  const cardSize = landscape ? 'md' : isMobile ? 'sm' : 'lg';
  const overlap = landscape ? -34 : isMobile ? -30 : -42;

  const isPassed = (seat: number) => {
    const action = game.lastActionBySeat.get(seat);
    return Boolean(action && action.combo === null && state.lastCombo !== null);
  };

  const handleRematch = () => {
    setResultOpen(false);
    onRematch();
  };

  const slots = opponentSlots(players.length);

  const board = (
    <div className="flex h-full w-full flex-col bg-base-950">
      {/* Thanh trên cùng */}
      <header className="flex shrink-0 items-center gap-2 border-b border-white/5 px-2.5 py-2 sm:px-4">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft className="h-4 w-4" />}
          onClick={onExit}
          aria-label="Thoát bàn chơi"
        >
          <span className="hidden sm:inline">Thoát</span>
        </Button>

        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-sm font-bold text-slate-100 sm:text-base">
            Tiến Lên Miền Nam
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] text-slate-500">
            <Badge tone="amber" icon={<Coins className="h-3 w-3" />}>
              Cược {game.config.baseBet.toLocaleString('vi-VN')} xu
            </Badge>
            <Badge tone="cyan" icon={<Bot className="h-3 w-3" />}>
              {players.length} người · {online ? 'Trực tuyến' : 'AI cục bộ'}
            </Badge>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setLandscape((v) => !v)}
          className={cn(
            'inline-flex h-9 items-center gap-1.5 rounded-xl border px-2.5 text-[11px] font-semibold transition-colors sm:hidden',
            landscape
              ? 'border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan'
              : 'border-white/10 bg-base-900/70 text-slate-400',
          )}
          aria-label="Chuyển chế độ ngang"
        >
          <MoveHorizontal className="h-4 w-4" />
          Ngang
        </button>
      </header>

      {/* Sân bàn chơi */}
      <div className="relative min-h-0 flex-1">
        {slots.map(({ seat, position }) => (
          <div key={seat} className={POSITION_CLASS[position]}>
            <SeatPanel
              player={players[seat]}
              position={position}
              isTurn={state.currentTurn === seat && state.phase === 'playing'}
              passed={isPassed(seat)}
              isThinking={state.currentTurn === seat && players[seat].isBot}
              online={online}
            />
          </div>
        ))}

        {/* Trung tâm bàn */}
        <div className="absolute inset-0 flex items-center justify-center px-24 py-16 sm:px-40 sm:py-20">
          <TableCenter
            combo={state.lastCombo}
            playerName={centerPlayerName}
            comboLabel={state.lastCombo ? describeCombo(state.lastCombo) : null}
            animKey={game.cardAnimKey}
            timer={timer}
            waitingLabel={waitingLabel}
            animate={interactive && game.cardAnimKey > 0}
          />
        </div>

        {/* Hiệu ứng trên bàn */}
        <ShuffleOverlay visible={game.intro === 'shuffle'} />
        <CutBanner label={cutLabel} seq={cutSeq} />
        {state.phase === 'finished' && !resultOpen && (
          <WhiteWinPopup label={state.whiteWinLabel} />
        )}
        <Confetti show={resultOpen && humanWon} />
        <CoinBurst show={resultOpen} amount={humanNet} />
      </div>

      {/* Khu vực người chơi */}
      <div className="shrink-0 border-t border-white/5 bg-base-950/80 px-2 pb-2 pt-2 safe-bottom sm:px-4">
        {/* Thông báo / thông tin lựa chọn */}
        <div className="mb-1.5 flex h-6 items-center justify-center gap-2">
          {game.message ? (
            <button
              type="button"
              onClick={game.dismissMessage}
              className="rounded-full bg-rose-500/15 px-3 py-0.5 text-[11px] font-medium text-rose-300"
            >
              {game.message}
            </button>
          ) : game.selectionInfo.combo ? (
            <span className="rounded-full bg-neon-cyan/15 px-3 py-0.5 text-[11px] font-semibold text-neon-cyan">
              {describeCombo(game.selectionInfo.combo)}
              {game.selectionInfo.canPlay ? '' : ` · ${game.selectionInfo.reason ?? ''}`}
            </span>
          ) : (
            <span className="text-[11px] text-slate-500">
              {state.phase === 'playing'
                ? game.isHumanTurn
                  ? state.lastCombo
                    ? 'Chọn bài để đè, hoặc bỏ lượt'
                    : 'Bạn dẫn lượt — hãy đánh bài'
                  : 'Đang chờ đối thủ…'
                : 'Ván đấu đã kết thúc'}
            </span>
          )}
          {typeof human.coins === 'number' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
              <Coins className="h-3 w-3" />
              {human.coins.toLocaleString('vi-VN')} xu
            </span>
          )}
        </div>

        {/* Bài trên tay */}
        <div className="min-h-[4.5rem]">
          <PlayerHand
            cards={game.displayHand}
            selected={game.selected}
            onToggle={game.toggleSelect}
            size={cardSize}
            overlap={overlap}
            disabled={!interactive || !game.isHumanTurn}
            animateDeal={game.dealing}
            dealKey={game.dealSeq}
          />
        </div>

        {/* Nút hành động */}
        <div className="mt-2 flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Shuffle className="h-4 w-4" />}
            onClick={game.toggleSort}
            className="flex-1 sm:flex-none"
          >
            Sắp xếp
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Lightbulb className="h-4 w-4" />}
            onClick={game.hint}
            disabled={!canPlay && !interactive}
            className="flex-1 sm:flex-none"
          >
            Gợi ý
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<SkipForward className="h-4 w-4" />}
            onClick={game.pass}
            disabled={!canPass}
            className="flex-1 sm:flex-none"
          >
            Bỏ lượt
          </Button>
          <Button
            size="sm"
            icon={<Swords className="h-4 w-4" />}
            onClick={game.playSelected}
            disabled={!canPlay}
            className="flex-1 sm:flex-none"
          >
            Đánh bài
          </Button>
        </div>
      </div>

      {/* Bảng kết quả */}
      <ResultModal
        open={resultOpen}
        players={players}
        humanSeat={game.humanSeat}
        settlement={game.settlement}
        onRematch={handleRematch}
        onExit={onExit}
      />
    </div>
  );

  return (
    <LandscapeFrame enabled={landscape}>
      {landscape ? (
        <div className="relative h-full w-full">
          {board}
          <button
            type="button"
            onClick={() => setLandscape(false)}
            className="absolute right-3 top-3 z-50 inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-base-900/90 px-3 py-1.5 text-[11px] font-semibold text-slate-200"
          >
            <LogOut className="h-3.5 w-3.5" /> Thoát chế độ ngang
          </button>
        </div>
      ) : (
        board
      )}
    </LandscapeFrame>
  );
}
