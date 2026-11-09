import { createId } from './id';

/**
 * Băm mật khẩu trước khi lưu cục bộ — KHÔNG bao giờ lưu mật khẩu thô.
 *
 * Dùng PBKDF2 (Web Crypto) khi khả dụng. Nếu môi trường không hỗ trợ
 * SubtleCrypto (ví dụ một số WebView cũ), hạ cấp về hàm băm nội bộ.
 * Lưu ý: đây vẫn chỉ là giải pháp cho bản demo cục bộ, KHÔNG thay thế
 * hệ thống xác thực phía máy chủ khi triển khai thật.
 */

const ITERATIONS = 100000;
const KEY_LENGTH = 32;

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fallbackHash(input: string): string {
  // FNV-1a mở rộng — chỉ nhằm tránh lưu mật khẩu thô trong môi trường thiếu Web Crypto.
  let h1 = 0x811c9dc5;
  let h2 = 0x1000193;
  for (let i = 0; i < input.length; i += 1) {
    const c = input.charCodeAt(i);
    h1 = (h1 ^ c) >>> 0;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 = (h2 + c) >>> 0;
    h2 = Math.imul(h2, 0x85ebca6b) >>> 0;
  }
  return `fnv$${(h1 >>> 0).toString(16)}${(h2 >>> 0).toString(16)}`;
}

function hasSubtleCrypto(): boolean {
  return typeof crypto !== 'undefined' && !!crypto.subtle;
}

export function generateSalt(): string {
  if (hasSubtleCrypto()) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return createId('salt');
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  if (!hasSubtleCrypto()) {
    return fallbackHash(`${salt}:${password}`);
  }
  try {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      'PBKDF2',
      false,
      ['deriveBits'],
    );
    const bits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: enc.encode(salt),
        iterations: ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      KEY_LENGTH * 8,
    );
    return `pbkdf2$${toHex(bits)}`;
  } catch {
    return fallbackHash(`${salt}:${password}`);
  }
}

/** So sánh mật khẩu người dùng nhập với hash đã lưu (so sánh hằng thời gian đơn giản). */
export async function verifyPassword(
  password: string,
  salt: string,
  expectedHash: string,
): Promise<boolean> {
  const actual = await hashPassword(password, salt);
  if (actual.length !== expectedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i += 1) {
    diff |= actual.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }
  return diff === 0;
}
