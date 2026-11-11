import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { Button } from '@/components/ui';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink/5 text-neon-cyan">
        <Compass className="h-8 w-8" />
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
