# Kiến trúc tổng thể — Mini Game Hub

Tài liệu này mô tả cách tổ chức mã nguồn, các tầng trách nhiệm và luồng dữ liệu của Mini Game Hub.
Mục tiêu thiết kế: **tách biệt rõ ràng giữa UI, logic game và tầng dữ liệu** để có thể thay thế
LocalStorage bằng backend thật, và đóng gói web thành ứng dụng di động mà không phải viết lại hệ thống.

---

## 1. Nguyên tắc thiết kế

1. **UI không truy cập dữ liệu trực tiếp.** Mọi thành phần giao diện đi qua Context → Service.
2. **Logic game thuần túy.** `game-engine/` không phụ thuộc React, DOM hay LocalStorage; chỉ nhận
   input và trả về state mới (hàm thuần, dễ kiểm thử).
3. **Một cổng lưu trữ duy nhất.** Toàn bộ ứng dụng chỉ làm việc với interface `KeyValueStore`.
4. **Không giả lập backend.** Chức năng chưa có máy chủ phải trả về thông báo rõ ràng là Demo/Local,
   tuyệt đối không "giả thành công".
5. **Mở rộng bằng đăng ký, không bằng sửa.** Trang chủ / danh mục / phòng chơi đọc từ **Game Registry**;
   thêm game mới chỉ cần khai báo một entry.

## 2. Sơ đồ phân tầng

```
┌─────────────────────────────────────────────────────────────┐
│  TẦNG GIAO DIỆN (Presentation)                              │
│  pages/ · layouts/ · components/                            │
│  - Trang theo route, layout, các UI component dùng chung    │
└───────────────▲─────────────────────────────┬───────────────┘
                │ (đọc state / gọi action)     │
┌───────────────┴─────────────────────────────▼───────────────┐
│  TẦNG ĐIỀU PHỐI (State / Context)                           │
│  contexts/ (Auth, Rooms, Toast) · hooks/                    │
│  - Giữ state toàn cục, gọi Service, phát thông báo           │
└───────────────▲─────────────────────────────┬───────────────┘
                │                              │
┌───────────────┴─────────────────────────────▼───────────────┐
│  TẦNG DỊCH VỤ (Service)                                     │
│  services/  Auth · Room · Game · Activity                   │
│  - Nghiệp vụ ứng dụng, kiểm tra hợp lệ, tổng hợp dữ liệu    │
└───────────────▲─────────────────────────────┬───────────────┘
                │                              │
┌───────────────┴──────────┐   ┌───────────────▼───────────────┐
│  StorageService          │   │  ApiService / RealtimeService │
│  (KeyValueStore)         │   │  (điểm nối backend tương lai) │
│  LocalStorage | Memory   │   │  Local | Socket.IO (placeholder)│
└──────────────────────────┘   └───────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  TẦNG GAME (độc lập, thuần túy)                             │
│  game-engine/tienlen/  deck · rules · ai · engine           │
│  games/tien-len/       UI bàn chơi + hook điều phối ván     │
│  games/registry.ts     đăng ký metadata + lazy-load board   │
└─────────────────────────────────────────────────────────────┘
```

## 3. Vai trò từng tầng

### 3.1. `types/` — Kiểu dữ liệu dùng chung
- `common.ts`: `RuntimeMode`, `DataSourceMeta`, `ServiceResult<T>` và helper `ok()` / `fail()`.
  Mọi hàm service trả về `ServiceResult` để không bao giờ "throw" ra UI.
- `user.ts`: `AccountRecord` (bản ghi đầy đủ, có `passwordHash`/`passwordSalt`), `PublicUser`
  (bản rút gọn an toàn để UI dùng), `PlayerStats`, `MatchRecord`, `UserPreferences`.
- `game.ts`: `Suit`, `Rank` (3–15, 15 = Heo/2), `Card`, `Combo`, `ComboType`, hằng số hiển thị.
- `game-registry.ts`: `GameMeta`, `GameCategory`, `GameStatus` và nhãn tiếng Việt tương ứng.
- `room.ts`: `Room`, `RoomStatus`, `RoomVisibility`, `RoomPlayerSlot`, `CreateRoomInput`.

### 3.2. `utils/` — Tiện ích thuần túy
- `constants.ts`: tên app, prefix khoá lưu trữ, số xu khởi tạo, thời lượng lượt, cảnh báo Local.
- `crypto.ts`: `generateSalt`, `hashPassword` (PBKDF2 SHA-256, 100.000 vòng), `verifyPassword`
  (so sánh constant-time). Có nhánh dự phòng FNV-1a khi môi trường thiếu `crypto.subtle`.
- `avatar.ts`: sinh avatar SVG dạng data-URI (không cần ảnh ngoài, hoạt động offline).
- `format.ts`, `id.ts`, `cn.ts`, `images.ts`: định dạng số/thời gian, sinh id, ghép class, tạo URL ảnh.

### 3.3. `services/` — Nghiệp vụ ứng dụng
| Service | Trách nhiệm |
| --- | --- |
| `StorageService` | Cổng truy cập lưu trữ. Duyệt qua interface `KeyValueStore` (`LocalStorageStore`, `MemoryStore`). Có `useStore()` để hoán đổi backend. |
| `ApiService` | Gọi HTTP tới backend tương lai. Khi chưa cấu hình, trả `fail(...)` với thông báo rõ ràng. |
| `RealtimeService` | Interface `RealtimeClient` độc lập. `LocalRealtimeClient` (bus trong bộ nhớ) và `SocketIORealtimeClient` (điểm nối, chưa kích hoạt). |
| `AuthService` | Đăng ký/đăng nhập/khách, hồ sơ, tuỳ chọn, đổi mật khẩu, ghi nhận trận đấu, xoá dữ liệu thiết bị. |
| `RoomService` | Tạo/sửa/xoá phòng, danh sách, tham gia/rời phòng, dữ liệu mẫu khi khởi tạo. |
| `GameService` | Trung gian giữa UI và Game Registry; ghi nhận kết quả trận (`completeMatch`). |
| `ActivityService` | Nhật ký hoạt động gần đây (tối đa 20 mục). |

### 3.4. `contexts/` — State toàn cục
- `AuthContext`: bọc `authService`, cung cấp `user`, `initializing` và các action cho UI.
- `RoomsContext`: bọc `roomService`, quản lý danh sách phòng và thao tác phòng.
- `ToastContext`: hệ thống thông báo (success / error / info / warning), tự ẩn sau ~4,2 giây.

Provider được lồng theo thứ tự trong `main.tsx`:
`HashRouter → ToastProvider → AuthProvider → RoomsProvider → App`.

### 3.5. `game-engine/` — Logic game thuần túy
Với Tiến Lên (`game-engine/tienlen/`):
- `deck.ts`: tạo bộ 52 lá, xáo trộn, sắp xếp, chia bài, xác định người đi trước (giữ 3♠).
- `rules.ts`: `parseCombo` (đơn/đôi/sám/tứ quý/sảnh/đôi thông), `canBeat` (tứ quý & đôi thông chặt Heo),
  `describeCombo`, `cardLabel`.
- `ai.ts`: `findAllCombos`, `findBeatingCombos`, `chooseMove`, `suggestMove` (AI cơ bản theo luật).
- `engine.ts`: state machine của ván — `createGame`, `playCards`, `passTurn`, `validateSelection`,
  `isPlayerTurn`, `mustFollow`, `getWinner`. Mọi thao tác trả về state mới (bất biến) + lỗi nếu có.

> Engine không biết gì về React, LocalStorage hay mạng. Có thể tái sử dụng nguyên vẹn cho
> chế độ multiplayer sau này (server chạy cùng bộ luật).

### 3.6. `games/` — Đăng ký và bàn chơi
- `registry.ts`: mảng `GameRegistryEntry` (metadata + loader lazy). Cung cấp `getAllGames`,
  `getPlayableGames`, `getGamesByCategory`, `getLazyBoard`.
- `tien-len/`: `useTienLenGame` (hook điều phối ván: state, chọn bài, sắp xếp, đồng hồ, lượt AI,
  hiệu ứng) + `TienLenBoard` và các component con (`SeatPanel`, `PlayerHand`, `TableCenter`,
  `ResultModal`, `LandscapeFrame`).
- `types.ts`: `GameBoardProps` (`onExit`, `onMatchEnd`) — hợp đồng chung cho mọi bàn chơi.

## 4. Luồng dữ liệu tiêu biểu

### 4.1. Đăng nhập
```
LoginPage → useAuth().login() → AuthContext → authService.login()
  → StorageService.read/write (KeyValueStore)
  → verifyPassword (PBKDF2) → toPublicUser() → setUser() → UI cập nhật Navbar
```

### 4.2. Một ván Tiến Lên
```
PlayGamePage → gameService.getBoardComponent(id) → lazy(TienLenBoard)
TienLenBoard → useTienLenGame()
  - Người chơi chọn bài → validateSelection() → hiển thị lý do nếu chưa hợp lệ
  - Bấm "Đánh bài" → engine.playCards() → state mới → hiệu ứng đánh bài
  - Đến lượt AI → useEffect hẹn giờ → ai.chooseMove() → engine.playCards()/passTurn()
  - Ván kết thúc → onMatchEnd(result)
      → gameService.completeMatch() → authService.recordMatch() (lịch sử + thống kê + xu)
      → activityService.log() → Toast + refresh hồ sơ
```

### 4.3. Tạo phòng chơi
```
RoomsPage → useRooms().createRoom() → roomService.createRoom()
  → StorageService.write (khoá "rooms") → cập nhật danh sách → UI render RoomCard
```
> Toàn bộ chỉ cục bộ. Khi có backend, `RoomService` sẽ gọi `ApiService` + `RealtimeService` thay vì
> đọc/ghi LocalStorage — giao diện không cần thay đổi.

## 5. Chuẩn bị nâng cấp (Cross-platform Ready)

- **Không phụ thuộc LocalStorage trong logic game**: engine thuần; mọi I/O đi qua `StorageService`.
- **ApiService riêng**: chỉ cần `api.configure({ baseUrl, enabled: true })` để bật.
- **Realtime interface độc lập**: UI/engine chỉ biết `RealtimeClient`, không biết Socket.IO.
- **Routing dùng HashRouter**: tương thích WebView (Capacitor) và hosting tĩnh.
- **Safe-area & landscape**: `index.css` dùng `env(safe-area-inset-*)`; bàn chơi có `LandscapeFrame`
  xoay 90° trên điện thoại khi bật chế độ ngang.
- **Game Registry + lazy loading**: thêm game mới tách bundle riêng, trang chủ không phải sửa.

Chi tiết kế hoạch di động: [FUTURE_MOBILE_PLAN.md](./FUTURE_MOBILE_PLAN.md).
Chi tiết API backend: [API_PLAN.md](./API_PLAN.md).

## 6. Quy ước mã nguồn

- TypeScript **strict**, alias đường dẫn `@/*` → `src/*`.
- Mỗi thư mục có `index.ts` re-export khi cần; UI dùng named export, bàn chơi dùng `default export`.
- Hàm service luôn trả `ServiceResult<T>` (`{ ok, data?, error? }`), không throw ra UI.
- Trước mỗi lần commit/bàn giao: chạy `npm run typecheck` và `npm run build`.
