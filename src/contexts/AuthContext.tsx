import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { MatchRecord, PublicUser, ServiceResult, UserPreferences } from '@/types';
import { authService } from '@/services/AuthService';
import { activityService } from '@/services/ActivityService';
import { socketService } from '@/services/SocketService';
import { onlineEnabled } from '@/services/backend';

interface AuthContextValue {
  user: PublicUser | null;
  /** true khi đang đọc phiên đăng nhập từ thiết bị. */
  initializing: boolean;
  register: (input: {
    username: string;
    displayName: string;
    password: string;
  }) => Promise<ServiceResult<PublicUser>>;
  login: (username: string, password: string, remember?: boolean) => Promise<ServiceResult<PublicUser>>;
  loginAsGuest: () => Promise<ServiceResult<PublicUser>>;
  logout: () => Promise<void>;
  updateProfile: (patch: {
    displayName?: string;
    avatar?: string;
  }) => Promise<ServiceResult<PublicUser>>;
  updatePreferences: (patch: Partial<UserPreferences>) => Promise<ServiceResult<PublicUser>>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<ServiceResult<true>>;
  clearHistory: () => Promise<ServiceResult<PublicUser>>;
  recordMatch: (match: MatchRecord) => Promise<ServiceResult<PublicUser>>;
  eraseDeviceData: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Kết nối Socket.IO nếu đang ở chế độ trực tuyến và đã có JWT trên thiết bị. */
async function connectRealtime(): Promise<void> {
  if (!onlineEnabled) return;
  await socketService.connectWithStoredToken();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  const refresh = useCallback(async () => {
    const current = await authService.getCurrentUser();
    setUser(current);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const current = await authService.getCurrentUser();
      if (active) {
        setUser(current);
        setInitializing(false);
        // Khôi phục phiên trực tuyến: mở kết nối realtime cho các phòng chơi.
        if (current) await connectRealtime();
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const register = useCallback<AuthContextValue['register']>(async (input) => {
    const result = await authService.register(input);
    if (result.ok) {
      setUser(result.data);
      await connectRealtime();
      await activityService.log('auth', `Tạo tài khoản mới: ${result.data.displayName}.`);
    }
    return result;
  }, []);

  const login = useCallback<AuthContextValue['login']>(async (username, password, remember = true) => {
    const result = await authService.login(username, password, remember);
    if (result.ok) {
      setUser(result.data);
      await connectRealtime();
      await activityService.log('auth', `Đăng nhập: ${result.data.displayName}.`);
    }
    return result;
  }, []);

  const loginAsGuest = useCallback<AuthContextValue['loginAsGuest']>(async () => {
    const result = await authService.loginAsGuest();
    if (result.ok) {
      setUser(result.data);
      await connectRealtime();
      await activityService.log('auth', 'Đăng nhập nhanh với tư cách khách.');
    }
    return result;
  }, []);

  const logout = useCallback(async () => {
    if (user) await activityService.log('auth', `Đăng xuất: ${user.displayName}.`);
    socketService.disconnect();
    await authService.logout();
    setUser(null);
  }, [user]);

  const updateProfile = useCallback<AuthContextValue['updateProfile']>(async (patch) => {
    const result = await authService.updateProfile(patch);
    if (result.ok) {
      setUser(result.data);
      await activityService.log('profile', 'Cập nhật hồ sơ cá nhân.');
    }
    return result;
  }, []);

  const updatePreferences = useCallback<AuthContextValue['updatePreferences']>(async (patch) => {
    const result = await authService.updatePreferences(patch);
    if (result.ok) setUser(result.data);
    return result;
  }, []);

  const changePassword = useCallback<AuthContextValue['changePassword']>(
    async (oldPassword, newPassword) => authService.changePassword(oldPassword, newPassword),
    [],
  );

  const clearHistory = useCallback<AuthContextValue['clearHistory']>(async () => {
    const result = await authService.clearHistory();
    if (result.ok) setUser(result.data);
    return result;
  }, []);

  const recordMatch = useCallback<AuthContextValue['recordMatch']>(async (match) => {
    const result = await authService.recordMatch(match);
    if (result.ok) setUser(result.data);
    return result;
  }, []);

  const eraseDeviceData = useCallback(async () => {
    socketService.disconnect();
    await authService.eraseDeviceData();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      register,
      login,
      loginAsGuest,
      logout,
      updateProfile,
      updatePreferences,
      changePassword,
      clearHistory,
      recordMatch,
      eraseDeviceData,
      refresh,
    }),
    [
      user,
      initializing,
      register,
      login,
      loginAsGuest,
      logout,
      updateProfile,
      updatePreferences,
      changePassword,
      clearHistory,
      recordMatch,
      eraseDeviceData,
      refresh,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải được dùng bên trong AuthProvider.');
  return ctx;
}
