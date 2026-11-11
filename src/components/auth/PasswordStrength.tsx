import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface PasswordStrengthResult {
  /** 0 = rỗng/rất yếu … 4 = rất mạnh. */
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
}

const SCORE_LABELS = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'] as const;
const SCORE_COLORS = [
  'bg-rose-400',
  'bg-rose-400',
  'bg-amber-400',
  'bg-lime-400',
  'bg-brand-500',
] as const;

/** Chấm điểm độ mạnh mật khẩu dựa trên độ dài và thành phần ký tự. */
export function scorePassword(password: string): PasswordStrengthResult {
  if (!password) return { score: 0, label: SCORE_LABELS[0] };
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[a-zA-Z]/.test(password) && /\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password) || (/[a-z]/.test(password) && /[A-Z]/.test(password))) score += 1;
  const clamped = Math.min(score, 4) as PasswordStrengthResult['score'];
  return { score: clamped, label: SCORE_LABELS[clamped] };
}

function Hint({ ok, children }: { ok: boolean; children: string }) {
  return (
    <li className={cn('flex items-center gap-1.5', ok ? 'text-brand-600' : 'text-slate-500')}>
      <span
        className={cn(
          'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full',
          ok ? 'bg-brand-500 text-white' : 'border border-base-600 bg-white',
        )}
      >
        {ok && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
      </span>
      {children}
    </li>
  );
}

/** Thanh đo độ mạnh mật khẩu + checklist yêu cầu. Chỉ hiện khi đã nhập mật khẩu. */
export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const { score, label } = scorePassword(password);
  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {[1, 2, 3, 4].map((step) => (
            <span
              key={step}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                step <= score ? SCORE_COLORS[score] : 'bg-base-700',
              )}
            />
          ))}
        </div>
        <span className="w-16 text-right text-[11px] font-extrabold text-slate-500">{label}</span>
      </div>
      <ul className="mt-2 grid grid-cols-1 gap-1 text-[11px] font-semibold sm:grid-cols-2">
        <Hint ok={password.length >= 6}>Tối thiểu 6 ký tự</Hint>
        <Hint ok={/[a-zA-Z]/.test(password) && /\d/.test(password)}>Có chữ và số</Hint>
        <Hint ok={/[^a-zA-Z0-9]/.test(password)}>Có ký tự đặc biệt</Hint>
        <Hint ok={password.length >= 10}>Từ 10 ký tự trở lên</Hint>
      </ul>
    </div>
  );
}
