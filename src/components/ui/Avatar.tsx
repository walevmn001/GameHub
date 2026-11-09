import { cn } from '@/utils/cn';
import { makeAvatarDataUri } from '@/utils/avatar';

export interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  ring?: boolean;
  /** Hiển thị chấm trạng thái (ví dụ: đang hoạt động). */
  status?: 'online' | 'offline' | 'none';
}

const SIZE_CLASSES = {
  xs: 'h-7 w-7 text-[10px]',
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-16 w-16 text-lg',
};

const STATUS_CLASSES: Record<'online' | 'offline', string> = {
  online: 'bg-emerald-400',
  offline: 'bg-slate-500',
};

export function Avatar({
  src,
  name,
  size = 'md',
  className,
  ring = false,
  status = 'none',
}: AvatarProps) {
  const resolved = src && src.length > 0 ? src : makeAvatarDataUri(name);
  return (
    <span className={cn('relative inline-block shrink-0', className)}>
      <img
        src={resolved}
        alt={name}
        loading="lazy"
        className={cn(
          'rounded-full object-cover',
          SIZE_CLASSES[size],
          ring && 'ring-2 ring-neon-purple/50 ring-offset-2 ring-offset-base-900',
        )}
      />
      {status !== 'none' && (
        <span
          className={cn(
            'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-base-850',
            STATUS_CLASSES[status],
          )}
        />
      )}
    </span>
  );
}
