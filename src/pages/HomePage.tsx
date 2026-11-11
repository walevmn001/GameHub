import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Clock3,
  Coins,
  Flame,
  Gamepad2,
  LayoutGrid,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { minCoinsToPlay, type GameCategory, type GameMeta } from '@/types';
import { GAME_CATEGORY_LABEL } from '@/types/game-registry';
import { gameService } from '@/services/GameService';
import { activityService, type ActivityEntry } from '@/services/ActivityService';
import { onlineEnabled } from '@/services/backend';
import { useAuth } from '@/contexts/AuthContext';
import { useRooms } from '@/contexts/RoomsContext';
import { useToast } from '@/contexts/ToastContext';
import { Avatar, Badge, Button, EmptyState, SectionHeader, Surface } from '@/components/ui';
import { GameGrid, GameRow } from '@/components/game/GameGrid';
import { RoomCard } from '@/components/game/RoomCard';
import { GameHubMascot } from '@/components/illustrations/GameHubMascot';
import { CloverArt, SparkleArt } from '@/components/illustrations/GameIllustrationAssets';
import { formatCoins, formatRelativeTime, formatNumber } from '@/utils/format';
import { cn } from '@/utils/cn';

const CATEGORY_ORDER: GameCategory[] = ['cards', 'strategy', 'casual', 'versus', 'multiplayer'];

const ACTIVITY_ICON: Record<ActivityEntry['type'], React.ReactNode> = {
  auth: <Users className="h-3.5 w-3.5" />,
  match: <Trophy className="h-3.5 w-3.5" />,
  room: <Gamepad2 className="h-3.5 w-3.5" />,
  profile: <Sparkles className="h-3.5 w-3.5" />,
  system: <Activity className="h-3.5 w-3.5" />,
};

export function HomePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { rooms, joinRoom, leaveRoom } = useRooms();

  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [category, setCategory] = useState<GameCategory | 'all'>('all');

  const allGames = useMemo(() => gameService.listAllGames(), []);

  useEffect(() => {
    void activityService.list().then(setActivities);
  }, []);

  const featured = useMemo(
    () => allGames.filter((g) => g.status === 'available'),
    [allGames],
  );
  const filteredGames = useMemo(
    () =>
      category === 'all'
        ? allGames
        : allGames.filter((g) => g.categories.includes(category)),
    [allGames, category],
  );
  const newest = useMemo(
    () => [...allGames].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3),
    [allGames],
  );
  const popular = useMemo(
    () => [...allGames].sort((a, b) => b.playCount - a.playCount).slice(0, 3),
    [allGames],
  );
  const publicRooms = useMemo(
    () => rooms.filter((r) => r.visibility === 'public').slice(0, 3),
    [rooms],
  );

  const handleSelectGame = (game: GameMeta) => {
    if (gameService.isPlayable(game.id)) {
      navigate(`/play/${game.id}`);
      return;
    }
    toast.info(`${game.name} chưa mở`, 'Trò chơi này đang được phát triển hoặc sắp ra mắt.');
  };

  const handleJoinRoom = async (roomId: string) => {
    if (!user) {
      toast.info('Bạn cần đăng nhập để vào phòng.', 'Hãy đăng nhập hoặc tạo tài khoản để tiếp tục.');
      return;
    }
    const room = rooms.find((r) => r.id === roomId);
    if (room?.gameId === 'tien-len') {
      const required = minCoinsToPlay(room.config);
      const balance = user?.coins ?? 0;
      if (balance < required) {
        toast.error(
          'Không thể tham gia phòng',
          `Bạn cần tối thiểu ${required.toLocaleString('vi-VN')} xu để vào bàn này (đủ chịu một ván thua nặng, kể cả bị chặt/thối Heo). Số dư hiện tại: ${balance.toLocaleString('vi-VN')} xu.`,
        );
        return;
      }
    }
    const result = await joinRoom(roomId);
    if (!result.ok) {
      toast.error('Không thể tham gia phòng', result.error);
      return;
    }
    toast.success(`Đã tham gia phòng "${result.data.name}"`);
    navigate(`/rooms/${result.data.id}`);
  };

  return (
    <div className="flex flex-col gap-8">
      <HeroBanner
        userName={user?.displayName}
        coins={user?.coins}
        onPlay={() => handleSelectGame(featured[0] ?? allGames[0])}
      />

      {/* Danh mục */}
      <section>
        <SectionHeader
          title="Danh mục trò chơi"
          subtitle="Lọc theo thể loại bạn yêu thích"
          icon={<LayoutGrid className="h-5 w-5" />}
        />
        <div className="flex flex-wrap gap-2">
          <CategoryChip
            label="Tất cả"
            active={category === 'all'}
            onClick={() => setCategory('all')}
          />
          {CATEGORY_ORDER.map((cat) => (
            <CategoryChip
              key={cat}
              label={GAME_CATEGORY_LABEL[cat]}
              active={category === cat}
              onClick={() => setCategory(cat)}
            />
          ))}
        </div>
      </section>

      {/* Nổi bật */}
      <section>
        <SectionHeader
          title="Trò chơi nổi bật"
          subtitle="Có thể chơi ngay trên trình duyệt"
          icon={<Flame className="h-5 w-5" />}
          action={
            <Link
              to="/games"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700 hover:underline"
            >
              Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        {filteredGames.length === 0 ? (
          <EmptyState
            icon={<Gamepad2 className="h-6 w-6" />}
            title="Chưa có trò chơi trong danh mục này"
            description="Hãy chọn danh mục khác để khám phá."
          />
        ) : (
          <GameGrid games={filteredGames} onSelect={handleSelectGame} />
        )}
      </section>

      {/* Mới cập nhật / Phổ biến */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <SectionHeader
            title="Mới cập nhật"
            subtitle="Vừa được bổ sung gần đây"
            icon={<Clock3 className="h-5 w-5" />}
          />
          <GameRow games={newest} onSelect={handleSelectGame} />
        </section>
        <section>
          <SectionHeader
            title="Phổ biến"
            subtitle="Được người chơi yêu thích"
            icon={<Flame className="h-5 w-5" />}
          />
          <GameRow games={popular} onSelect={handleSelectGame} />
        </section>
      </div>

      {/* Phòng chơi */}
      <section>
        <SectionHeader
          title="Phòng chơi"
          subtitle={onlineEnabled ? 'Tạo phòng, mời bạn bè và tham gia ván trực tuyến.' : 'Tạo phòng và thử sức với AI.'}
          icon={<Users className="h-5 w-5" />}
          action={
            <Link
              to="/rooms"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700 hover:underline"
            >
              Tất cả phòng <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        {publicRooms.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="Chưa có phòng công khai"
            description={onlineEnabled ? 'Tạo phòng mới để bắt đầu chơi cùng bạn bè.' : 'Tạo phòng mới để bắt đầu ván với AI.'}
            action={
              <Button size="sm" onClick={() => navigate('/rooms')}>
                Tạo phòng
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {publicRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                currentUserId={user?.id}
                onJoin={(r) => void handleJoinRoom(r.id)}
                onLeave={(r) => void leaveRoom(r.id)}
                onOpen={(r) => navigate(`/rooms/${r.id}`)}
                compact
              />
            ))}
          </div>
        )}
      </section>

      {/* Hoạt động gần đây */}
      <section>
        <SectionHeader
          title="Hoạt động gần đây"
          subtitle="Những dấu ấn trong hành trình chơi game của bạn."
          icon={<Activity className="h-5 w-5" />}
        />
        <Surface className="p-2">
          {activities.length === 0 ? (
            <div className="p-5 text-center text-xs text-slate-500">
              Chưa có hoạt động nào. Hãy đăng nhập và chơi một ván để bắt đầu.
            </div>
          ) : (
            <ul className="divide-y divide-base-700">
              {activities.slice(0, 6).map((item) => (
                <li key={item.id} className="flex items-center gap-3 px-3 py-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                    {ACTIVITY_ICON[item.type]}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-xs text-slate-300">
                    {item.message}
                  </span>
                  <span className="shrink-0 text-[10px] text-slate-600">
                    {formatRelativeTime(item.at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Surface>
      </section>
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-4 py-1.5 text-xs font-bold shadow-soft transition-all hover:-translate-y-0.5',
        active
          ? 'border-brand-700/20 bg-gradient-to-b from-brand-400 via-brand-500 to-brand-600 text-white shadow-pop'
          : 'border-brand-200 bg-white text-slate-400 hover:border-brand-400 hover:text-brand-600',
      )}
    >
      {label}
    </button>
  );
}

function HeroBanner({
  userName,
  coins,
  onPlay,
}: {
  userName?: string;
  coins?: number;
  onPlay: () => void;
}) {
  return (
    <section className="relative overflow-hidden rounded-xl3 border border-base-700 bg-gradient-to-br from-brand-50 via-white to-brand-100 shadow-card">
      {/* Họa tiết trang trí */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-brand-300/40 blur-3xl" />
        <div className="absolute -right-8 top-10 h-40 w-40 rounded-full bg-brand-200/50 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-brand-400/20 blur-2xl" />
      </div>

      <div className="relative flex flex-col gap-5 p-5 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <Badge tone="purple" icon={<Sparkles className="h-3 w-3" />}>
            Sảnh game mini · Tiến Lên mỗi ngày
          </Badge>
          <h1 className="mt-3 text-2xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
            {userName ? (
              <>
                Chào {userName}, sẵn sàng <span className="neon-text">vào bàn</span> chưa?
              </>
            ) : (
              <>
                Khám phá thế giới <span className="neon-text">game mini</span> đỉnh cao
              </>
            )}
          </h1>
          <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-slate-500 sm:text-base">
            Sẵn sàng bước vào bàn Tiến Lên, thử chiến thuật qua từng lượt bài, sưu tầm vật phẩm cá
            tính và lưu lại những dấu ấn đáng nhớ của bạn.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <Button size="lg" icon={<Gamepad2 className="h-4 w-4" />} onClick={onPlay}>
              Chơi ngay
            </Button>
            <Link to="/rooms">
              <Button size="lg" variant="outline" icon={<Users className="h-4 w-4" />}>
                Vào phòng chơi
              </Button>
            </Link>
          </div>
        </div>

        {/* Mascot & vật thể trang trí */}
        <div className="relative flex h-44 w-full shrink-0 items-center justify-center sm:h-52 lg:h-60 lg:w-60">
          <HeroMascot />
        </div>

        {userName && (
          <div className="flex items-center gap-3 rounded-2xl border border-base-700 bg-base-900/85 p-3.5 shadow-card backdrop-blur-sm lg:hidden">
            <Avatar name={userName} size="lg" ring />
            <div>
              <p className="text-xs text-slate-500">Số dư thử nghiệm</p>
              <p className="flex items-center gap-1.5 text-lg font-bold text-amber-500">
                <Coins className="h-4 w-4" />
                {formatCoins(coins ?? 0)}
              </p>
              <p className="mt-0.5 text-[10px] text-slate-500">
                {formatNumber(coins ?? 0)} xu · không phải tiền thật
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Số dư trên desktop (bên phải dưới mascot) */}
      {userName && (
        <div className="relative hidden px-8 pb-6 lg:block">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-3 rounded-2xl border border-base-700 bg-base-900/85 p-3.5 shadow-card backdrop-blur-sm">
              <Avatar name={userName} size="md" ring />
              <div>
                <p className="text-xs text-slate-500">Số dư thử nghiệm</p>
                <p className="flex items-center gap-1.5 text-lg font-bold text-amber-500">
                  <Coins className="h-4 w-4" />
                  {formatCoins(coins ?? 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/** Mascot xanh lá dễ thương (slime) + vật thể game bay lượn. */
function HeroMascot() {
  return (
    <div className="relative h-44 w-44 sm:h-52 sm:w-52 lg:h-60 lg:w-60">
      {/* Vầng sáng nền */}
      <div className="absolute inset-4 rounded-full bg-brand-200/50 blur-2xl" />

      <div className="absolute -right-1 top-1 h-10 w-10 animate-float-y">
        <SparkleArt />
      </div>
      <div className="absolute -bottom-1 right-1 h-11 w-11 rotate-12">
        <CloverArt />
      </div>

      {/* Vật thể bay lượn */}
      <div className="absolute left-0 top-2 animate-float-y" style={{ animationDelay: '0.2s' }}>
        <MiniCard />
      </div>
      <div className="absolute right-0 top-8 animate-float-y" style={{ animationDelay: '0.8s' }}>
        <MiniDie />
      </div>
      <div className="absolute -bottom-1 left-6 animate-float-y" style={{ animationDelay: '0.5s' }}>
        <MiniCoin />
      </div>

      {/* Slime mascot */}
      <GameHubMascot uid="hero" pose="cards" className="absolute inset-0 m-auto h-36 w-36 animate-bob sm:h-40 sm:w-40 lg:h-48 lg:w-48" />
    </div>
  );
}

function MiniCard() {
  return (
    <div className="flex h-12 w-9 rotate-[-12deg] items-center justify-center rounded-lg border border-base-700 bg-white shadow-card">
      <span className="text-base font-bold text-rose-500">♥</span>
    </div>
  );
}

function MiniDie() {
  return (
    <svg viewBox="0 0 48 48" className="h-11 w-11 rotate-[10deg] drop-shadow-md" aria-hidden="true">
      <rect x="4" y="4" width="40" height="40" rx="12" fill="#FFF" stroke="#CFE8C5" strokeWidth="2" />
      <circle cx="15" cy="15" r="3.5" fill="#269B35" />
      <circle cx="33" cy="15" r="3.5" fill="#62D943" />
      <circle cx="24" cy="24" r="3.5" fill="#269B35" />
      <circle cx="15" cy="33" r="3.5" fill="#62D943" />
      <circle cx="33" cy="33" r="3.5" fill="#269B35" />
    </svg>
  );
}

function MiniCoin() {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-300/60 bg-gradient-to-br from-amber-300 to-amber-500 shadow-card">
      <Coins className="h-4 w-4 text-amber-900" />
    </div>
  );
}
