import { cn } from '@/utils/cn';

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        'flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-base-900/50 p-3.5',
        disabled ? 'opacity-50' : 'cursor-pointer hover:border-white/10',
      )}
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-slate-200">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-slate-500">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          checked ? 'bg-gradient-to-r from-neon-purple to-neon-violet' : 'bg-base-600',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-[1.375rem]' : 'translate-x-0.5',
          )}
        />
      </button>
    </label>
  );
}
