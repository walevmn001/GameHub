import { Link } from 'react-router-dom';

/** Dòng điều hướng dưới form: "Chưa có tài khoản? Đăng Kí ngay" và ngược lại. */
export function AuthFooter({
  prompt,
  linkLabel,
  to,
}: {
  prompt: string;
  linkLabel: string;
  to: string;
}) {
  return (
    <p className="mt-5 text-center text-sm font-semibold text-slate-500">
      {prompt}{' '}
      <Link
        to={to}
        className="font-extrabold text-brand-600 underline-offset-4 transition hover:text-brand-700 hover:underline"
      >
        {linkLabel}
      </Link>
    </p>
  );
}
