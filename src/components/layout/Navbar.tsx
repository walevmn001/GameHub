import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Coins,
  Gamepad2,
  LogIn,
  LogOut,
  Menu,
  Settings,
  User as UserIcon,
  Users,
  X,
  ChevronDown,
} from 'lucide-react';
import { APP_NAME } from '@/utils/constants';
import { formatCoins } from '@/utils/format';
import { cn } from '@/utils/cn';
import { Avatar, Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

const NAV_LINKS = [
  { to: '/', label: 'Trang chủ', icon: <Gamepad2 className="h-4 w-4" /> },
  { to: '/games', label: 'Trò chơi', icon: <Gamepad2 className="h-4 w-4" /> },
  { to: '/rooms', label: 'Phòng chơi', icon: <Users className="h-4 w-4" /> },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    setMobileOpen(false);
    toast.info('Đã đăng xuất khỏi thiết bị này.');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-base-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 sm:px-5">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-neon-purple to-neon-cyan shadow-glow">
            <Gamepad2 className="h-5 w-5 text-white" />
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <span className="text-sm font-extrabold tracking-tight text-slate-100">
              {APP_NAME.toUpperCase()}
            </span>
            <span className="text-[10px] font-medium text-slate-500">Game mini trên web</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white/5 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
                )
              }
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden items-center gap-1.5 rounded-xl border border-white/5 bg-base-900/70 px-3 py-2 text-sm font-semibold text-amber-300 sm:inline-flex">
                <Coins className="h-4 w-4" />
                {formatCoins(user.coins)}
                <span className="text-[10px] font-normal text-slate-500">xu thử nghiệm</span>
              </span>

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-xl border border-white/5 bg-base-900/70 p-1 pr-2 transition-colors hover:border-white/10"
                >
                  <Avatar src={user.avatar} name={user.displayName} size="xs" />
                  <span className="hidden max-w-[8rem] truncate text-sm font-medium text-slate-200 sm:block">
                    {user.displayName}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-[calc(100%+0.5rem)] w-56 animate-fade-in overflow-hidden rounded-2xl border border-white/10 bg-base-850 shadow-soft">
                    <div className="border-b border-white/5 p-3">
                      <p className="truncate text-sm font-semibold text-slate-100">
                        {user.displayName}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">@{user.username}</p>
                    </div>
                    <div className="p-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          navigate('/profile');
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                      >
                        <UserIcon className="h-4 w-4" /> Hồ sơ cá nhân
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          navigate('/settings');
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                      >
                        <Settings className="h-4 w-4" /> Cài đặt tài khoản
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/10"
                      >
                        <LogOut className="h-4 w-4" /> Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
                className="hidden sm:inline-flex"
              >
                Đăng nhập
              </Button>
              <Button size="sm" icon={<LogIn className="h-4 w-4" />} onClick={() => navigate('/register')}>
                <span className="hidden sm:inline">Đăng ký</span>
                <span className="sm:hidden">Tạo tài khoản</span>
              </Button>
            </>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-base-900/70 text-slate-300 md:hidden"
            aria-label="Mở menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/5 bg-base-900/95 px-3 py-2 md:hidden">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium',
                  isActive ? 'bg-white/5 text-white' : 'text-slate-400',
                )
              }
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
          {!user && (
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                navigate('/login');
              }}
              className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300"
            >
              <LogIn className="h-4 w-4" /> Đăng nhập
            </button>
          )}
        </div>
      )}
    </header>
  );
}
