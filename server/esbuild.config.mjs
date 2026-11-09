import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

/**
 * Đóng gói server thành một file ESM chạy trên Node.
 * - Gộp cả mã dùng chung trong ../src (game-engine + types) để tái sử dụng đúng luật.
 * - Toàn bộ package trong node_modules giữ ở dạng external (không bundle).
 */
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');

await build({
  entryPoints: [path.join(here, 'src/index.ts')],
  outfile: path.join(here, 'dist/index.js'),
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  sourcemap: true,
  packages: 'external',
  alias: {
    '@': path.join(repoRoot, 'src'),
  },
  logLevel: 'info',
});

console.log('[esbuild] Đã đóng gói server -> server/dist/index.js');
