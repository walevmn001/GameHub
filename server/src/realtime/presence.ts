/**
 * Theo dõi người dùng đang trực tuyến theo số kết nối Socket.IO.
 *
 * Một người dùng có thể mở nhiều tab/kết nối cùng lúc nên ta đếm số kết nối;
 * chỉ khi số kết nối về 0 mới coi là ngoại tuyến.
 */

const connections = new Map<string, number>();

export function addConnection(userId: string): void {
  connections.set(userId, (connections.get(userId) ?? 0) + 1);
}

export function removeConnection(userId: string): void {
  const next = (connections.get(userId) ?? 0) - 1;
  if (next <= 0) connections.delete(userId);
  else connections.set(userId, next);
}

export function isOnline(userId: string): boolean {
  return connections.has(userId);
}

export function onlineUserIds(): string[] {
  return [...connections.keys()];
}
