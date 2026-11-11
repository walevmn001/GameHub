import { Link } from 'react-router-dom';
import { Gamepad2, Home } from 'lucide-react';
import { Button } from '@/components/ui';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-3xl border border-brand-200 bg-brand-50 text-brand-600 shadow-soft">
        <Gamepad2 className="h-10 w-10" />
      </span>
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100">404</h1>
        <p className="mt-1 text-sm text-slate-400">
          Trang bạn tìm không tồn tại hoặc đã được di chuyển.
        </p>
      </div>
      <div className="flex gap-2">
        <Link to="/">
          <Button icon={<Home className="h-4 w-4" />}>Về trang chủ</Button>
        </Link>
        <Link to="/games">
          <Button variant="outline">Xem trò chơi</Button>
        </Link>
      </div>
    </div>
  );
}
