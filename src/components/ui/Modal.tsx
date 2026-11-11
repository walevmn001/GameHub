import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-emerald-950/25 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-10 w-full animate-pop-in rounded-t-4xl border border-brand-100 bg-white shadow-card-hover sm:rounded-4xl',
          SIZE_CLASSES[size],
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-brand-100 bg-brand-50/60 p-4 sm:p-5">
            <div className="min-w-0">
              {title && (
                <h3 className="text-base font-extrabold tracking-tight text-slate-100">{title}</h3>
              )}
              {description && (
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-100 bg-white text-slate-500 shadow-soft transition-colors hover:bg-brand-50 hover:text-brand-600"
              aria-label="Đóng hộp thoại"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="max-h-[70vh] overflow-y-auto p-4 scrollbar-thin sm:p-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-brand-100 bg-brand-50/50 p-4 sm:p-5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
