import { AuthTitle } from '@/components/ui';

/** Tiêu đề + phụ đề của trang xác thực (dùng AuthTitle dạng cartoon có vương miện). */
export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6 text-center">
      <AuthTitle text={title} className="mb-2" />
      <p className="mx-auto max-w-xs text-sm font-semibold text-slate-400">{subtitle}</p>
    </div>
  );
}
