import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { createId } from '@/utils/id';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toast: (input: Omit<Toast, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<ToastVariant, { icon: ReactNode; ring: string }> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
    ring: 'ring-emerald-500/30',
  },
  error: { icon: <XCircle className="h-5 w-5 text-rose-400" />, ring: 'ring-rose-500/30' },
  info: { icon: <Info className="h-5 w-5 text-neon-cyan" />, ring: 'ring-neon-cyan/30' },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 text-amber-400" />,
    ring: 'ring-amber-500/30',
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (input: Omit<Toast, 'id'>) => {
      const id = createId('toast');
      setToasts((prev) => [...prev, { ...input, id }].slice(-4));
      const timer = setTimeout(() => dismiss(id), 4200);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      dismiss,
      success: (title, description) => toast({ variant: 'success', title, description }),
      error: (title, description) => toast({ variant: 'error', title, description }),
      info: (title, description) => toast({ variant: 'info', title, description }),
      warning: (title, description) => toast({ variant: 'warning', title, description }),
    }),
    [toast, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2 p-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:items-end"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl bg-base-800/95 p-3.5 shadow-soft ring-1 backdrop-blur animate-fade-in',
              VARIANT_STYLES[t.variant].ring,
            )}
            role="status"
          >
            <span className="mt-0.5 shrink-0">{VARIANT_STYLES[t.variant].icon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-100">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{t.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="shrink-0 rounded-lg p-1 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
              aria-label="Đóng thông báo"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast phải được dùng bên trong ToastProvider.');
  return ctx;
}
