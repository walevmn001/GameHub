import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-neon-cyan', className)} />;
}

export function FullPageLoader({ label = 'Đang tải…' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-slate-400">
      <Spinner className="h-7 w-7" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
