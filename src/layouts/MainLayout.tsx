import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

/** Bố cục chung cho các trang thông thường (có navbar + footer). */
export function MainLayout() {
  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-5 sm:px-5 sm:py-7">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

/** Bố cục tối giản cho bàn chơi: không navbar/footer, tối ưu diện tích màn hình. */
export function GameLayout() {
  return (
    <div className="relative z-10 h-[100dvh] w-full overflow-hidden">
      <Outlet />
    </div>
  );
}
