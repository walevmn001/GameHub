/**
 * Tạo avatar dạng SVG data-URI ngay trong ứng dụng.
 * Không phụ thuộc mạng nên hiển thị ổn định trên mọi nền tảng (web, WebView, app di động).
 */

const PALETTES: Array<[string, string]> = [
  ['#a855f7', '#22d3ee'],
  ['#6366f1', '#22d3ee'],
  ['#8b5cf6', '#38bdf8'],
  ['#ec4899', '#8b5cf6'],
  ['#06b6d4', '#6366f1'],
  ['#f59e0b', '#a855f7'],
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function makeAvatarDataUri(name: string, seedKey?: string): string {
  const seed = seedKey ?? name;
  const [from, to] = PALETTES[hashString(seed) % PALETTES.length];
  const text = initials(name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/></linearGradient></defs>
<rect width="128" height="128" rx="64" fill="url(#g)"/>
<text x="64" y="64" text-anchor="middle" dominant-baseline="central" font-family="Inter, sans-serif" font-size="52" font-weight="700" fill="#0b1120">${text}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** Bộ avatar gợi ý cho người chơi chọn trong trang hồ sơ. */
export function getPresetAvatars(names: string[] = ['Player', 'Hero', 'Lucky', 'Ace', 'Star', 'Ninja']): string[] {
  return names.map((name) => makeAvatarDataUri(name, `${name}-preset`));
}
