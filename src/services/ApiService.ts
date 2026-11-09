import { fail, ok, type ServiceResult } from '@/types';

/**
 * ApiService: lớp gọi backend REST (Express).
 *
 * - Khi CHƯA cấu hình (`enabled = false`), mọi lời gọi trả về lỗi rõ ràng để tầng UI
 *   hiển thị đúng trạng thái "Local/Demo", KHÔNG giả lập thành công.
 * - Khi chạy trực tuyến, `backend.ts` gọi `api.configure(...)` và `api.setTokenProvider(...)`
 *   để mọi yêu cầu tự gắn JWT.
 * - Lỗi từ server luôn có dạng `{ error: { code, message } }` (xem server/http/errors.ts).
 */

export interface ApiConfig {
  baseUrl: string;
  enabled: boolean;
  timeoutMs: number;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  /** Token xác thực ghi đè token mặc định. */
  token?: string;
  /** Bỏ qua token mặc định (dùng cho endpoint công khai). */
  skipAuth?: boolean;
}

interface ApiErrorBody {
  error?: { code?: string; message?: string };
}

const NOT_CONFIGURED_MESSAGE =
  'Backend chưa được cấu hình. Ứng dụng đang chạy ở chế độ Local/Demo.';

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

class ApiService {
  private config: ApiConfig = {
    baseUrl: '',
    enabled: false,
    timeoutMs: 15000,
  };

  private tokenProvider: (() => Promise<string | null>) | null = null;

  configure(config: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): ApiConfig {
    return { ...this.config };
  }

  /** Đặt nguồn cung cấp JWT tự động cho mọi yêu cầu cần xác thực. */
  setTokenProvider(provider: (() => Promise<string | null>) | null): void {
    this.tokenProvider = provider;
  }

  get isConfigured(): boolean {
    return this.config.enabled && this.config.baseUrl.trim().length > 0;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<ServiceResult<T>> {
    if (!this.isConfigured) {
      return fail(NOT_CONFIGURED_MESSAGE);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);
    try {
      let token = options.token ?? null;
      if (!token && !options.skipAuth && this.tokenProvider) {
        token = await this.tokenProvider();
      }

      const response = await fetch(`${this.config.baseUrl}${path}`, {
        method: options.method ?? 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      const text = await response.text();
      const payload = text ? safeParse(text) : null;

      if (!response.ok) {
        const message = (payload as ApiErrorBody | null)?.error?.message;
        return fail(message?.trim() || `Yêu cầu thất bại (${response.status}).`);
      }

      return ok(payload as T);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return fail('Máy chủ phản hồi quá lâu. Vui lòng thử lại.');
      }
      const message = error instanceof Error ? error.message : 'Lỗi không xác định';
      return fail(message);
    } finally {
      clearTimeout(timer);
    }
  }
}

export const api = new ApiService();
