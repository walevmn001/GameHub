import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { GameHubMascot } from '@/components/illustrations/GameHubMascot';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-brand-600', className)} />;
}

export function FullPageLoader({ label = 'Đang tải…' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-slate-500">
      <span className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-brand-50 via-white to-pastel-blue">
        <GameHubMascot uid="loader" pose="wave" className="h-28 w-28 animate-bob" />
      </span>
      <div className="flex items-center gap-2">
        <Spinner className="h-4 w-4" />
        <p className="text-sm font-medium">{label}</p>
      </div>
    </div>
  );
}
