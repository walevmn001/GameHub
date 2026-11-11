import { Crown, DoorOpen, Lock, LogOut, Play, Users } from 'lucide-react';
import type { Room } from '@/types';
import { Avatar, Badge, Button } from '@/components/ui';
import { cn } from '@/utils/cn';
import { formatRelativeTime } from '@/utils/format';

const STATUS_LABEL: Record<Room['status'], string> = {
  waiting: 'Đang chờ',
  playing: 'Đang chơi',
  closed: 'Đã đóng',
};

const STATUS_TONE: Record<Room['status'], 'green' | 'amber' | 'neutral'> = {
  waiting: 'green',
  playing: 'amber',
  closed: 'neutral',
};

export function RoomCard({
  room,
  currentUserId,
  onJoin,
  onLeave,
  onOpen,
  compact = false,
}: {
  room: Room;
  currentUserId?: string;
  onJoin: (room: Room) => void;
  onLeave: (room: Room) => void;
  onOpen?: (room: Room) => void;
  compact?: boolean;
}) {
  const joined = currentUserId ? room.players.some((p) => p.id === currentUserId) : false;
  const isFull = room.players.length >= room.maxPlayers;
  const isHost = currentUserId ? room.players.some((p) => p.id === currentUserId && p.isHost) : false;

  return (
    <div
      className={cn(
        'rounded-xl3 border border-base-700 bg-base-900 p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card-hover',
        compact && 'p-3',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 truncate text-sm font-bold text-slate-100">
            {room.visibility === 'private' && <Lock className="h-3.5 w-3.5 text-amber-500" />}
            {room.name}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-slate-500">
            {room.gameName} · {room.hostName}
          </p>
        </div>
        <Badge tone={STATUS_TONE[room.status]}>{STATUS_LABEL[room.status]}</Badge>
      </div>

      {!compact && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex -space-x-2">
            {room.players.slice(0, 4).map((player) => (
              <Avatar
                key={player.id}
                src={player.avatar}
                name={player.name}
                size="xs"
                className="ring-2 ring-base-900"
              />
            ))}
            {room.players.length === 0 && (
              <span className="text-[11px] text-slate-500">Chưa có người chơi</span>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <Users className="h-3.5 w-3.5" />
            {room.players.length}/{room.maxPlayers}
          </span>
          {isHost && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
              <Crown className="h-3.5 w-3.5" /> Chủ phòng
            </span>
          )}
        </div>
      )}

      <div className="mt-3.5 flex items-center justify-between gap-2">
        <span className="text-[10px] text-slate-600">
          Cập nhật {formatRelativeTime(room.updatedAt)}
        </span>
        <div className="flex items-center gap-2">
          {joined ? (
            <>
              {onOpen && (
                <Button
                  size="sm"
                  icon={<Play className="h-3.5 w-3.5" />}
                  disabled={room.status === 'closed'}
                  onClick={() => onOpen(room)}
                >
                  Vào phòng
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                icon={<LogOut className="h-3.5 w-3.5" />}
                onClick={() => onLeave(room)}
              >
                Rời phòng
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              icon={<DoorOpen className="h-3.5 w-3.5" />}
              disabled={isFull || room.status === 'closed'}
              onClick={() => onJoin(room)}
            >
              {isFull ? 'Đã đầy' : 'Tham gia'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
