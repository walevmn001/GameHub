import { cn } from '@/utils/cn';

/**
 * Đồng hồ lượt chơi hình vòng cung.
 * progress = thời gian còn lại / tổng thời gian (0..1).
 */
export function TurnTimer({
  progress,
  seconds,
  size = 56,
  active = true,
}: {
  progress: number;
  seconds: number;
  size?: number;
  active?: boolean;
}) {
  const clamped = Math.max(0, Math.min(1, progress));
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clamped);
  const urgent = clamped <= 0.25;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={urgent ? '#f43f5e' : active ? '#22d3ee' : '#64748b'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.2s linear, stroke 0.3s' }}
        />
      </svg>
      <span
        className={cn(
          'absolute text-sm font-bold tabular-nums',
          urgent ? 'text-rose-400' : active ? 'text-neon-cyan' : 'text-slate-400',
        )}
      >
        {Math.ceil(seconds)}
      </span>
    </div>
  );
}
