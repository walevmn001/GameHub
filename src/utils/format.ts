/** Các hàm định dạng hiển thị. */

export function formatCoins(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(Math.max(0, Math.round(value)));
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value);
}

export function formatDateTime(timestamp: number): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'vừa xong';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} phút trước`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour} giờ trước`;
  const day = Math.floor(hour / 24);
  if (day < 30) return `${day} ngày trước`;
  return formatDateTime(timestamp).split(' ')[0];
}

export function formatDuration(ms?: number): string {
  if (!ms || ms <= 0) return '--';
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}p ${sec.toString().padStart(2, '0')}s`;
}

/** Rút gọn chuỗi dài để hiển thị trong card. */
export function truncate(text: string, max = 120): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}\u2026`;
}
