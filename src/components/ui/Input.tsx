import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, icon, trailing, className, id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name ?? undefined;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-xs font-semibold text-slate-300">
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex h-11 items-center gap-2 rounded-xl border bg-base-900/70 px-3 transition-colors',
          error ? 'border-rose-500/60' : 'border-white/10 focus-within:border-neon-purple/70',
        )}
      >
        {icon && <span className="shrink-0 text-slate-500">{icon}</span>}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-full w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500',
            'outline-none',
            className,
          )}
          {...rest}
        />
        {trailing}
      </div>
      {error ? (
        <p className="mt-1 text-xs text-rose-400">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
});
