import type { ReactNode } from 'react';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

type Variant = 'info' | 'warning' | 'danger';

const VARIANT_STYLES: Record<Variant, { wrap: string; icon: ReactNode }> = {
  info: {
    wrap: 'border-neon-cyan/25 bg-neon-cyan/5 text-neon-cyan',
    icon: <Info className="h-4 w-4" />,
  },
  warning: {
    wrap: 'border-amber-500/25 bg-amber-500/5 text-amber-300',
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  danger: {
    wrap: 'border-rose-500/25 bg-rose-500/5 text-rose-300',
    icon: <ShieldAlert className="h-4 w-4" />,
  },
};

/** Khối thông báo minh bạch về giới hạn của bản Local/Demo. */
export function NoticeBanner({
  variant = 'warning',
  title,
  children,
  className,
}: {
  variant?: Variant;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const style = VARIANT_STYLES[variant];
  return (
    <div className={cn('flex items-start gap-2.5 rounded-2xl border p-3.5', style.wrap, className)}>
      <span className="mt-0.5 shrink-0">{style.icon}</span>
      <div className="min-w-0 text-xs leading-relaxed">
        {title && <p className="mb-0.5 font-semibold">{title}</p>}
        <div className="text-current/90">{children}</div>
      </div>
    </div>
  );
}
