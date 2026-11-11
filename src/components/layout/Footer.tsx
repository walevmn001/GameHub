import { Link } from 'react-router-dom';
import { Gamepad2, Github } from 'lucide-react';
import { APP_NAME, APP_TAGLINE, APP_VERSION } from '@/utils/constants';

export function Footer() {
  return (
    <footer className="mt-12 border-t border-ink/5 bg-base-950/60">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-neon-purple to-neon-cyan">
              <Gamepad2 className="h-5 w-5 text-white" />
            </span>
            <span className="text-sm font-extrabold tracking-tight text-slate-100">
              {APP_NAME.toUpperCase()}
            </span>
          </div>
          <p className="mt-3 max-w-md text-xs leading-relaxed text-slate-500">
            {APP_TAGLINE}. Khám phá Tiến Lên Miền Nam, thử chiến thuật qua từng lượt bài và sưu
            tầm vật phẩm theo phong cách của bạn.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">Khám phá</h3>
          <ul className="mt-3 space-y-2 text-xs text-slate-500">
            <li>
              <Link to="/games" className="transition-colors hover:text-slate-200">
                Tất cả trò chơi
              </Link>
            </li>
            <li>
              <Link to="/rooms" className="transition-colors hover:text-slate-200">
                Phòng chơi
              </Link>
            </li>
            <li>
              <Link to="/profile" className="transition-colors hover:text-slate-200">
                Hồ sơ người chơi
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">Dự án</h3>
          <ul className="mt-3 space-y-2 text-xs text-slate-500">
            <li className="flex items-center gap-1.5">
              <Github className="h-3.5 w-3.5" /> Mã nguồn mở nội bộ
            </li>
            <li>Phiên bản {APP_VERSION}</li>
            <li>Kiến trúc hướng ứng dụng di động</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink/5 px-4 py-4 text-center text-[11px] text-slate-600 sm:px-6">
        © {new Date().getFullYear()} {APP_NAME}. Sản phẩm demo — không có giao dịch tiền thật.
      </div>
    </footer>
  );
}
