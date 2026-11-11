import { cn } from '@/utils/cn';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  size = 'md',
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-base-700 bg-base-850/80 p-1 shadow-inner-soft backdrop-blur-sm',
        className,
      )}
      role="tablist"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-bold transition-all duration-200 ease-out active:scale-[0.96]',
              size === 'sm' ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2 text-xs sm:text-sm',
              active
                ? 'btn-shine bg-gradient-to-b from-brand-400 via-brand-500 to-brand-600 text-brand-900 shadow-pop'
                : 'text-slate-500 hover:bg-base-900 hover:text-brand-600 hover:shadow-soft',
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
