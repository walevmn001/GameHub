import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui';
import { GameHubMascot } from '@/components/illustrations/GameHubMascot';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <GameHubMascot uid="notfound" className="h-28 w-28 animate-bob" wink />
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
