# Hướng dẫn thêm trò chơi mới — Game Registry

**Game Registry** là nguồn dữ liệu duy nhất về các trò chơi trong Mini Game Hub.
Trang chủ, trang danh sách, bộ lọc danh mục và hệ thống phòng chơi đều đọc từ registry —
nghĩa là **thêm game mới KHÔNG cần sửa code trang chủ**.

- File registry: [`src/games/registry.ts`](./src/games/registry.ts)
- Hợp đồng bàn chơi: [`src/games/types.ts`](./src/games/types.ts)

---

## 1. Registry hoạt động thế nào

Mỗi game là một `GameRegistryEntry` gồm:

```ts
interface GameRegistryEntry {
  meta: GameMeta;                               // metadata hiển thị
  loadBoard?: () => Promise<{ default: React.ComponentType<GameBoardProps> }>; // loader lazy
}
```

- `meta` — thông tin hiển thị (tên, mô tả, thể loại, trạng thái, ảnh bìa, số người…).
- `loadBoard` — hàm **dynamic import** để tải component bàn chơi khi người dùng vào `/play/:id`.
  Dùng lazy loading giúp tách bundle riêng cho từng game.

Nếu game chưa triển khai, **bỏ trống `loadBoard`** và đặt `status` là `in-development` hoặc `planned`.
UI sẽ tự hiển thị "Trò chơi chưa sẵn sàng" thay vì lỗi.

## 2. Các hàm truy vấn registry

| Hàm | Mô tả |
| --- | --- |
| `getAllGames()` | Tất cả game (dùng cho trang danh sách) |
| `getGameMeta(id)` | Metadata của một game |
| `getGameEntry(id)` | Entry đầy đủ (gồm loader) |
| `getPlayableGames()` | Chỉ game `status === 'available'` và **có** `loadBoard` |
| `getGamesByCategory(category)` | Game theo thể loại |
| `getLazyBoard(id)` | Component bàn chơi dạng lazy (đã cache) |

> Tầng UI nên đi qua `gameService` (`listAllGames`, `listPlayableGames`, `getBoardComponent`…)
> thay vì gọi thẳng registry, để khi backend thay thế registry thì giao diện không phải sửa.

## 3. Ý nghĩa các trường `GameMeta`

| Trường | Kiểu | Ghi chú |
| --- | --- | --- |
| `id` | `string` | Duy nhất, dùng trong route `/play/:id`. Nên dùng kebab-case. |
| `name` | `string` | Tên hiển thị. |
| `tagline` | `string` | Mô tả ngắn (một dòng) trên card. |
| `description` | `string` | Mô tả đầy đủ. |
| `categories` | `GameCategory[]` | `cards` \| `strategy` \| `casual` \| `versus` \| `multiplayer`. |
| `status` | `GameStatus` | `available` \| `in-development` \| `planned`. |
| `maxPlayers` | `number` | Số người chơi tối đa (chế độ cục bộ). |
| `minPlayers` | `number` | Số người tối thiểu để **bắt đầu ván**. Dùng để chặn "Bắt đầu" khi phòng chưa đủ người. |
| `coverImage` | `string` | URL ảnh bìa (dùng `buildImageUrl(...)`). |
| `badge` | `string?` | Nhãn nhỏ, ví dụ "AI cục bộ", "Đang phát triển". |
| `onlineReady` | `boolean` | Có sẵn sàng cho multiplayer sau này hay không. |
| `rating` / `playCount` | `number` | Dữ liệu hiển thị (minh hoạ UI). |
| `releasedAt` / `updatedAt` | `number` | Dấu thời gian (ms) cho sắp xếp "mới cập nhật". |

## 4. Hợp đồng component bàn chơi

Mọi bàn chơi phải có `default export` và nhận đúng `GameBoardProps`:

```ts
export interface GameBoardProps {
  onExit: () => void;                     // gọi khi người chơi thoát bàn
  onMatchEnd: (result: MatchResult) => void; // gọi khi ván kết thúc
}

export interface MatchResult {
  gameId: string;
  win: boolean;
  placement: number;   // 1 = nhất
  totalPlayers: number;
  score: number;
  durationMs: number;
}
```

`PlayGamePage` sẽ tự động:
1. Lazy-load bàn chơi theo `id`.
2. Truyền `onExit` / `onMatchEnd`.
3. Khi `onMatchEnd` được gọi → `gameService.completeMatch()` → lưu lịch sử + thống kê + xu.

Bàn chơi **không** tự lưu dữ liệu; chỉ báo kết quả về.

## 5. Ví dụ: thêm một game mới (Cờ Caro)

### Bước 1 — Tạo thư mục game
```
src/
├── game-engine/
│   └── caro/            # logic thuần: bàn cờ, luật thắng, AI
│       ├── board.ts
│       ├── rules.ts
│       ├── ai.ts
│       └── index.ts
└── games/
    └── caro/
        ├── CaroBoard.tsx    # default export, nhận GameBoardProps
        └── useCaroGame.ts   # hook điều phối ván
```

### Bước 2 — Viết bàn chơi (khung tối thiểu)
```tsx
// src/games/caro/CaroBoard.tsx
import type { GameBoardProps } from '@/games/types';

export default function CaroBoard({ onExit, onMatchEnd }: GameBoardProps) {
  // ... vẽ bàn cờ, xử lý nước đi ...
  // khi ván kết thúc:
  // onMatchEnd({ gameId: 'co-caro', win, placement, totalPlayers, score, durationMs });
  return null;
}
```

### Bước 3 — Cập nhật entry trong registry
```ts
// src/games/registry.ts
{
  meta: {
    id: 'co-caro',
    name: 'Cờ Caro',
    tagline: 'Nối 5 quân để thắng',
    description: 'Đối kháng trên bàn cờ ô vuông.',
    categories: ['strategy', 'versus'],
    status: 'available',        // đổi từ 'in-development' sang 'available'
    maxPlayers: 2,
    minPlayers: 2,
    coverImage: buildImageUrl('...', 'landscape_4_3'),
    badge: 'AI cục bộ',
    onlineReady: true,
    rating: 4.2,
    playCount: 9900,
    releasedAt: Date.now(),
    updatedAt: Date.now(),
  },
  loadBoard: () => import('@/games/caro/CaroBoard'),   // thêm loader
}
```

### Bước 4 — Kiểm tra
```bash
npm run typecheck
npm run build
```

Vậy là xong. Trang chủ, trang `/games`, bộ lọc danh mục và `/play/co-caro` sẽ tự nhận game mới
**mà không cần sửa bất kỳ file nào** ở `pages/`.

## 6. Nguyên tắc tách biệt logic và giao diện

1. **Toàn bộ luật chơi nằm trong `game-engine/<game>/`**, không phụ thuộc React/DOM/LocalStorage.
   Nhờ vậy có thể tái sử dụng nguyên vẹn cho server authoritative khi làm multiplayer.
2. **Bàn chơi chỉ lo hiển thị và tương tác.** Nó gọi engine và báo kết quả qua `onMatchEnd`.
3. **Không lưu dữ liệu trong logic game.** Mọi I/O đi qua `services/`.
4. **Không đánh dấu "available" khi chưa có `loadBoard`.** Trạng thái phải phản ánh đúng thực tế.

## 7. Checklist thêm game

- [ ] Viết `game-engine/<game>/` (deck/rules/ai/engine) với hàm thuần.
- [ ] Viết `games/<game>/<Game>Board.tsx` (default export, nhận `GameBoardProps`).
- [ ] Viết hook điều phối ván (state, lượt, hiệu ứng, đồng hồ).
- [ ] Thêm entry vào `src/games/registry.ts`.
- [ ] Đặt `status: 'available'` và gán `loadBoard` khi đã chơi được.
- [ ] Thêm ảnh bìa qua `buildImageUrl(...)`, chọn `categories` phù hợp.
- [ ] Gọi `onMatchEnd(...)` khi ván kết thúc để lịch sử/thống kê hoạt động.
- [ ] Chạy `npm run typecheck` và `npm run build` cho tới khi pass.
- [ ] Cập nhật `DEVELOPMENT_STATUS.md`.
