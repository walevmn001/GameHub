/**
 * Kiểu dữ liệu dùng chung toàn hệ thống.
 * Tất cả kiểu ở đây độc lập với trình duyệt để sau này tái sử dụng cho app di động.
 */

/** Nhãn hiển thị cho các chức năng chỉ chạy cục bộ / chưa có backend. */
export type RuntimeMode = 'local' | 'demo' | 'online';

/** Phân biệt nguồn dữ liệu để UI hiển thị badge cảnh báo phù hợp. */
export interface DataSourceMeta {
  mode: RuntimeMode;
  /** Ghi chú hiển thị cho người dùng, ví dụ: "Chỉ lưu trên thiết bị". */
  note?: string;
}

/** Kết quả trả về thống nhất cho mọi thao tác service. */
export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function ok<T>(data: T): ServiceResult<T> {
  return { ok: true, data };
}

export function fail<T = never>(error: string): ServiceResult<T> {
  return { ok: false, error };
}
