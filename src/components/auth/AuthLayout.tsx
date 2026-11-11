import { Link, Outlet } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';
import { APP_NAME } from '@/utils/constants';
import { AuthDecorations } from './AuthDecorations';

/**
 * Bố cục riêng cho trang xác thực: nền gradient trắng → mint, mascot và vật phẩm game
 * bay xung quanh, form nằm chính giữa màn hình. Không dùng navbar/footer chung để tạo
 * không gian tập trung cho đăng nhập / đăng ký.
 */
export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-cute-bg via-white to-cute-mint">
      <AuthDecorations />

      <header className="relative z-20 flex items-center justify-center px-4 py-4 sm:justify-start sm:px-8">
        <Link
          to="/"
          className="flex items-center gap-2.5 transition-transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-b from-cute-greenLight to-cute-green shadow-pop">
            <Gamepad2 className="h-5 w-5 text-white" />
          </span>
          <span className="font-display text-lg font-black text-brand-700">{APP_NAME}</span>
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-10 pt-2">
        <Outlet />
      </main>
    </div>
  );
}
