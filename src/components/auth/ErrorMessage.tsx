import { AlertCircle } from 'lucide-react';

/** Khối thông báo lỗi dạng banner, kèm hiệu ứng rung nhẹ khi xuất hiện. */
export function ErrorMessage({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <div
      role="alert"
      className="flex animate-shake items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-600"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
