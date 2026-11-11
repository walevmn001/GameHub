import {
  fail,
  ok,
  toPublicUser,
  type AccountRecord,
  type MatchRecord,
  type PublicUser,
  type ServiceResult,
  type UserPreferences,
} from '@/types';
import { STARTING_COINS, STORAGE_KEYS } from '@/utils/constants';
import { generateSalt, hashPassword, verifyPassword } from '@/utils/crypto';
import { makeAvatarDataUri } from '@/utils/avatar';
import { createId } from '@/utils/id';
import { storage } from './StorageService';
import { api } from './ApiService';
import { clearToken, onlineEnabled, readToken, saveToken } from './backend';

/**
 * AuthService — tài khoản người dùng.
 *
 * Có hai chế độ:
 * - TRỰC TUYẾN (`VITE_API_URL` được cấu hình): tài khoản thật trên server, mật khẩu băm
 *   bằng bcrypt và xác thực bằng JWT. JWT được lưu cục bộ để tự đăng nhập lại.
 * - CỤC BỘ (mặc định khi chạy Local/Demo): tài khoản thử nghiệm trên thiết bị, mật khẩu
 *   băm bằng PBKDF2. KHÔNG phải hệ thống xác thực an toàn để triển khai thật.
 */

const DEFAULT_PREFERENCES: UserPreferences = {
  sound: true,
  animations: true,
  preferLandscape: false,
};

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

class AuthService {
  /** true khi nên gọi backend thay vì lưu cục bộ. */
  private get online(): boolean {
    return onlineEnabled;
  }

  private async readAccounts(): Promise<AccountRecord[]> {
    return (await storage.read<AccountRecord[]>(STORAGE_KEYS.accounts)) ?? [];
  }

  private async writeAccounts(accounts: AccountRecord[]): Promise<void> {
    await storage.write(STORAGE_KEYS.accounts, accounts);
  }

  private async readSession(): Promise<string | null> {
    return storage.read<string>(STORAGE_KEYS.session);
  }

  private async writeSession(userId: string | null): Promise<void> {
    if (userId) await storage.write(STORAGE_KEYS.session, userId);
    else await storage.remove(STORAGE_KEYS.session);
  }

  private async readCurrentAccount(): Promise<AccountRecord | null> {
    const sessionId = await this.readSession();
    if (!sessionId) return null;
    const accounts = await this.readAccounts();
    return accounts.find((a) => a.id === sessionId) ?? null;
  }

  async register(input: {
    username: string;
    displayName: string;
    password: string;
  }): Promise<ServiceResult<PublicUser>> {
    if (this.online) {
      const result = await api.request<{ token: string; user: PublicUser }>('/auth/register', {
        method: 'POST',
        skipAuth: true,
        body: {
          username: input.username.trim().toLowerCase(),
          displayName: input.displayName.trim() || undefined,
          password: input.password,
        },
      });
      if (!result.ok) return fail(result.error);
      await saveToken(result.data.token);
      return ok(result.data.user);
    }

    const username = input.username.trim().toLowerCase();
    const displayName = input.displayName.trim() || input.username.trim();

    if (!USERNAME_RE.test(username)) {
      return fail('Tên đăng nhập 3–20 ký tự, chỉ gồm chữ, số và dấu gạch dưới.');
    }
    if (input.password.length < 6) {
      return fail('Mật khẩu cần tối thiểu 6 ký tự.');
    }

    const accounts = await this.readAccounts();
    if (accounts.some((a) => a.username === username)) {
      return fail('Tên đăng nhập đã được dùng trên thiết bị này.');
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(input.password, salt);
    const now = Date.now();

    const account: AccountRecord = {
      id: createId('user'),
      username,
      displayName,
      avatar: makeAvatarDataUri(displayName),
      passwordHash,
      passwordSalt: salt,
      coins: STARTING_COINS,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      stats: { matches: 0, wins: 0, losses: 0, score: 0 },
      history: [],
      preferences: { ...DEFAULT_PREFERENCES },
    };

    await this.writeAccounts([...accounts, account]);
    await this.writeSession(account.id);
    return ok(toPublicUser(account));
  }

  async login(
    username: string,
    password: string,
    remember = true,
  ): Promise<ServiceResult<PublicUser>> {
    if (this.online) {
      const result = await api.request<{ token: string; user: PublicUser }>('/auth/login', {
        method: 'POST',
        skipAuth: true,
        body: { username: username.trim().toLowerCase(), password },
      });
      if (!result.ok) return fail(result.error);
      await saveToken(result.data.token, remember);
      return ok(result.data.user);
    }

    const normalized = username.trim().toLowerCase();
    const accounts = await this.readAccounts();
    const account = accounts.find((a) => a.username === normalized);
    if (!account) {
      return fail('Không tìm thấy tài khoản trên thiết bị này.');
    }
    const valid = await verifyPassword(password, account.passwordSalt, account.passwordHash);
    if (!valid) {
      return fail('Mật khẩu không đúng.');
    }
    account.lastLoginAt = Date.now();
    await this.writeAccounts(accounts);
    // Bỏ chọn "Ghi nhớ đăng nhập" thì không lưu phiên xuống thiết bị.
    await this.writeSession(remember ? account.id : null);
    return ok(toPublicUser(account));
  }

  /** Đăng nhập nhanh dưới dạng khách để trải nghiệm không cần đăng ký. */
  async loginAsGuest(): Promise<ServiceResult<PublicUser>> {
    if (this.online) {
      const result = await api.request<{ token: string; user: PublicUser }>('/auth/guest', {
        method: 'POST',
        skipAuth: true,
        body: {},
      });
      if (!result.ok) return fail(result.error);
      await saveToken(result.data.token);
      return ok(result.data.user);
    }

    const accounts = await this.readAccounts();
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const displayName = `Khách ${suffix}`;
    const username = `guest_${suffix}_${Date.now().toString(36).slice(-4)}`;
    const salt = generateSalt();
    const now = Date.now();

    const account: AccountRecord = {
      id: createId('user'),
      username,
      displayName,
      avatar: makeAvatarDataUri(displayName, username),
      passwordHash: await hashPassword(createId('pw'), salt),
      passwordSalt: salt,
      coins: STARTING_COINS,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      stats: { matches: 0, wins: 0, losses: 0, score: 0 },
      history: [],
      preferences: { ...DEFAULT_PREFERENCES },
      isGuest: true,
    };

    await this.writeAccounts([...accounts, account]);
    await this.writeSession(account.id);
    return ok(toPublicUser(account));
  }

  async logout(): Promise<void> {
    if (this.online) {
      await api.request('/auth/logout', { method: 'POST', body: {} });
      await clearToken();
    }
    await this.writeSession(null);
  }

  async getCurrentUser(): Promise<PublicUser | null> {
    if (this.online) {
      const token = await readToken();
      if (!token) return null;
      const result = await api.request<PublicUser>('/users/me');
      // Mất mạng tạm thời: giữ nguyên token, chỉ báo chưa có phiên trong phiên này.
      return result.ok ? result.data : null;
    }

    const account = await this.readCurrentAccount();
    return account ? toPublicUser(account) : null;
  }

  async updateProfile(patch: {
    displayName?: string;
    avatar?: string;
  }): Promise<ServiceResult<PublicUser>> {
    if (this.online) {
      const body: { displayName?: string; avatar?: string } = {};
      if (patch.displayName !== undefined) body.displayName = patch.displayName.trim();
      if (patch.avatar !== undefined) body.avatar = patch.avatar;
      const result = await api.request<PublicUser>('/users/me', { method: 'PATCH', body });
      return result.ok ? ok(result.data) : fail(result.error);
    }

    const account = await this.readCurrentAccount();
    if (!account) return fail('Bạn cần đăng nhập để cập nhật hồ sơ.');

    if (patch.displayName !== undefined) {
      const name = patch.displayName.trim();
      if (name.length < 2 || name.length > 24) {
        return fail('Tên hiển thị cần từ 2 đến 24 ký tự.');
      }
      account.displayName = name;
    }
    if (patch.avatar !== undefined) {
      account.avatar = patch.avatar;
    }
    account.updatedAt = Date.now();

    const accounts = await this.readAccounts();
    const index = accounts.findIndex((a) => a.id === account.id);
    accounts[index] = account;
    await this.writeAccounts(accounts);
    return ok(toPublicUser(account));
  }

  async updatePreferences(patch: Partial<UserPreferences>): Promise<ServiceResult<PublicUser>> {
    if (this.online) {
      const result = await api.request<PublicUser>('/users/me/preferences', {
        method: 'PATCH',
        body: patch,
      });
      return result.ok ? ok(result.data) : fail(result.error);
    }

    const account = await this.readCurrentAccount();
    if (!account) return fail('Bạn cần đăng nhập để lưu cài đặt.');
    account.preferences = { ...account.preferences, ...patch };
    account.updatedAt = Date.now();

    const accounts = await this.readAccounts();
    const index = accounts.findIndex((a) => a.id === account.id);
    accounts[index] = account;
    await this.writeAccounts(accounts);
    return ok(toPublicUser(account));
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<ServiceResult<true>> {
    if (this.online) {
      const result = await api.request('/auth/change-password', {
        method: 'POST',
        body: { oldPassword, newPassword },
      });
      return result.ok ? ok(true) : fail(result.error);
    }

    const account = await this.readCurrentAccount();
    if (!account) return fail('Bạn cần đăng nhập để đổi mật khẩu.');
    const valid = await verifyPassword(oldPassword, account.passwordSalt, account.passwordHash);
    if (!valid) return fail('Mật khẩu hiện tại không đúng.');
    if (newPassword.length < 6) return fail('Mật khẩu mới cần tối thiểu 6 ký tự.');

    const salt = generateSalt();
    account.passwordSalt = salt;
    account.passwordHash = await hashPassword(newPassword, salt);
    account.updatedAt = Date.now();

    const accounts = await this.readAccounts();
    const index = accounts.findIndex((a) => a.id === account.id);
    accounts[index] = account;
    await this.writeAccounts(accounts);
    return ok(true);
  }

  /** Ghi nhận kết quả trận đấu vào lịch sử và cập nhật thống kê. */
  async recordMatch(match: MatchRecord): Promise<ServiceResult<PublicUser>> {
    if (this.online) {
      const result = await api.request<PublicUser>(`/games/${match.gameId}/matches`, {
        method: 'POST',
        body: {
          win: match.win,
          placement: match.placement,
          totalPlayers: match.totalPlayers,
          durationMs: match.durationMs,
          coinDelta: match.coinDelta,
          score: match.score,
          gameName: match.gameName,
        },
      });
      return result.ok ? ok(result.data) : fail(result.error);
    }

    const account = await this.readCurrentAccount();
    if (!account) return fail('Bạn cần đăng nhập để lưu lịch sử trận đấu.');

    account.history = [match, ...account.history].slice(0, 50);
    account.stats = {
      matches: account.stats.matches + 1,
      wins: account.stats.wins + (match.win ? 1 : 0),
      losses: account.stats.losses + (match.win ? 0 : 1),
      score: account.stats.score + match.score,
    };
    account.coins = Math.max(0, account.coins + (match.coinDelta ?? (match.win ? 100 : -40)));
    account.updatedAt = Date.now();

    const accounts = await this.readAccounts();
    const index = accounts.findIndex((a) => a.id === account.id);
    accounts[index] = account;
    await this.writeAccounts(accounts);
    return ok(toPublicUser(account));
  }

  /**
   * Trừ xu cục bộ (chế độ Local/Demo) sau khi mua vật phẩm trong cửa hàng.
   * Ở chế độ trực tuyến, server tự trừ xu trong giao dịch mua — không dùng hàm này.
   */
  async spendCoins(amount: number): Promise<ServiceResult<PublicUser>> {
    if (amount <= 0) return fail('Số xu cần trừ không hợp lệ.');
    const account = await this.readCurrentAccount();
    if (!account) return fail('Bạn cần đăng nhập để mua vật phẩm.');
    if (account.coins < amount) return fail('Bạn không đủ xu để mua vật phẩm này.');

    account.coins -= amount;
    account.updatedAt = Date.now();
    const accounts = await this.readAccounts();
    const index = accounts.findIndex((a) => a.id === account.id);
    accounts[index] = account;
    await this.writeAccounts(accounts);
    return ok(toPublicUser(account));
  }

  async clearHistory(): Promise<ServiceResult<PublicUser>> {
    if (this.online) {
      const result = await api.request<PublicUser>('/users/me/matches', { method: 'DELETE' });
      return result.ok ? ok(result.data) : fail(result.error);
    }

    const account = await this.readCurrentAccount();
    if (!account) return fail('Bạn cần đăng nhập để thao tác.');
    account.history = [];
    account.updatedAt = Date.now();
    const accounts = await this.readAccounts();
    const index = accounts.findIndex((a) => a.id === account.id);
    accounts[index] = account;
    await this.writeAccounts(accounts);
    return ok(toPublicUser(account));
  }

  /** Xoá tài khoản đang đăng nhập (và dữ liệu cục bộ liên quan). */
  async eraseDeviceData(): Promise<void> {
    if (this.online) {
      await api.request('/users/me', { method: 'DELETE' });
      await clearToken();
    }
    await storage.remove(STORAGE_KEYS.accounts);
    await storage.remove(STORAGE_KEYS.session);
  }
}

export const authService = new AuthService();
