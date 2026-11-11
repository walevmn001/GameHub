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
        'flex items-center justify-between gap-4 rounded-xl2 border border-base-700 bg-base-900 p-4 transition-colors',
        disabled ? 'opacity-50' : 'cursor-pointer hover:border-brand-300',
      )}
    >
      <span className="min-w-0">
        <span className="block text-sm font-bold text-slate-200">{label}</span>
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
          'relative h-6 w-11 shrink-0 overflow-hidden rounded-full transition-colors',
          checked ? 'bg-gradient-to-r from-brand-500 to-brand-600' : 'bg-base-600',
        )}
      >
        <span
          className={cn(
            'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </button>
    </label>
  );
}
