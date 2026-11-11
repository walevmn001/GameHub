import { Check } from 'lucide-react';

/** Popup chúc mừng khi đăng nhập/đăng ký thành công, kèm animation pop-in. */
export function SuccessPopup({
  show,
  title,
  message,
}: {
  show: boolean;
  title: string;
  message?: string;
}) {
  if (!show) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-brand-900/25 px-6 backdrop-blur-sm"
    >
      <div className="flex w-full max-w-xs animate-pop-in flex-col items-center gap-3 rounded-[28px] border border-cute-inputBorder bg-white p-7 text-center shadow-[0_30px_60px_-24px_rgba(33,140,43,0.5)]">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-b from-cute-greenLight to-cute-green shadow-pop">
          <Check className="h-10 w-10 text-white" strokeWidth={3} />
        </span>
        <h3 className="text-lg font-extrabold text-slate-100">{title}</h3>
        {message && <p className="text-sm font-semibold text-slate-500">{message}</p>}
      </div>
    </div>
  );
}
