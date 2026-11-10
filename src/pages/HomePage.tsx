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
import { useAuth } from '@/contexts/AuthContext';
import { useRooms } from '@/contexts/RoomsContext';
import { useToast } from '@/contexts/ToastContext';
import { Avatar, Badge, Button, EmptyState, SectionHeader, Surface } from '@/components/ui';
import { GameGrid, GameRow } from '@/components/game/GameGrid';
import { RoomCard } from '@/components/game/RoomCard';
import { buildImageUrl } from '@/utils/images';
import { formatCoins, formatRelativeTime, formatNumber } from '@/utils/format';
import { cn } from '@/utils/cn';

const HERO_IMAGE = buildImageUrl(
  'cinematic dark hero banner for a premium online mini game platform, purple and cyan neon light, abstract playing cards and game controller silhouettes on deep navy background, ultra wide, modern, high detail',
  'landscape_16_9',
);

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
              className="inline-flex items-center gap-1 text-xs font-semibold text-neon-cyan hover:underline"
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

      {/* Phòng chơi Demo */}
      <section>
        <SectionHeader
          title="Phòng chơi"
          subtitle="Phòng thử nghiệm — dữ liệu cục bộ trên thiết bị"
          icon={<Users className="h-5 w-5" />}
          action={
            <Link
              to="/rooms"
              className="inline-flex items-center gap-1 text-xs font-semibold text-neon-cyan hover:underline"
            >
              Tất cả phòng <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        {publicRooms.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="Chưa có phòng công khai"
            description="Tạo phòng mới để bắt đầu chơi cùng bạn bè."
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
          subtitle="Nhật ký lưu cục bộ trên thiết bị này"
          icon={<Activity className="h-5 w-5" />}
        />
        <Surface className="p-2">
          {activities.length === 0 ? (
            <div className="p-5 text-center text-xs text-slate-500">
              Chưa có hoạt động nào. Hãy đăng nhập và chơi một ván để bắt đầu.
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {activities.slice(0, 6).map((item) => (
                <li key={item.id} className="flex items-center gap-3 px-3 py-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5 text-neon-cyan">
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
        'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all',
        active
          ? 'border-transparent bg-gradient-to-r from-neon-purple to-neon-violet text-white shadow-glow'
          : 'border-white/10 bg-base-900/60 text-slate-400 hover:border-white/20 hover:text-slate-200',
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
    <section className="relative overflow-hidden rounded-xl2 border border-white/5 shadow-soft">
      <img
        src={HERO_IMAGE}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-45"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-base-950 via-base-950/85 to-base-950/40" />

      <div className="relative flex flex-col gap-5 p-5 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <Badge tone="purple" icon={<Sparkles className="h-3 w-3" />}>
            Phiên bản web · Chơi cục bộ
          </Badge>
          <h1 className="mt-3 text-2xl font-extrabold leading-tight text-slate-50 sm:text-4xl">
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
          <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-slate-300 sm:text-base">
            Chơi Tiến Lên Miền Nam cùng AI, tạo phòng cùng bạn bè và theo dõi thành tích của bạn.
            Toàn bộ dữ liệu hiện được lưu trên chính thiết bị này.
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

        {userName && (
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-base-900/70 p-3.5 backdrop-blur-sm">
            <Avatar name={userName} size="lg" ring />
            <div>
              <p className="text-xs text-slate-400">Số dư thử nghiệm</p>
              <p className="flex items-center gap-1.5 text-lg font-bold text-amber-300">
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
    </section>
  );
}
