# Mini Game Hub

Nền tảng chơi game mini trên trình duyệt: **React + Vite + TypeScript + Tailwind CSS** (giao diện)
và **Node.js + Express + Socket.IO + PostgreSQL (Prisma)** (backend).

Ứng dụng có **hai chế độ** dùng chung một giao diện:

| Chế độ | Điều kiện | Đặc điểm |
| --- | --- | --- |
| **Local / Demo** (mặc định) | Không đặt `VITE_API_URL` | Tài khoản/phòng lưu trên thiết bị (`LocalStorage`), chơi với **AI cục bộ**. |
| **Trực tuyến (Online)** | Đặt `VITE_API_URL` trỏ tới backend | Tài khoản + phòng + **ván đấu nhiều người realtime** qua Socket.IO, máy chủ là nguồn chân lý. |

> Trò chơi đầu tiên: **Tiến Lên Miền Nam** — bàn 2–4 người, chơi với AI hoặc đấu online thật.

Repo: <https://github.com/walevmn001/GameHub> · Deploy: **Render** (Blueprint, xem [render.yaml](./render.yaml)).

---

## 1. Yêu cầu môi trường

- **Node.js** >= 18 (khuyến nghị 20 LTS)
- **npm** >= 9
- **PostgreSQL** — chỉ cần khi chạy chế độ Trực tuyến (local hoặc dùng dịch vụ Postgres trên Render).

## 2. Cài đặt

```bash
# Cài dependencies cho giao diện (thư mục gốc)
npm install

# Cài dependencies cho backend
npm --prefix server install
```

Nếu mạng bị ngắt kết nối (ECONNRESET), thử lại với cờ retry:

```bash
npm install --fetch-retries=5 --fetch-retry-maxtimeout=120000 --fetch-timeout=300000
```

## 3. Chạy môi trường phát triển

### 3.1. Chỉ giao diện (Local/Demo — không cần backend)

```bash
npm run dev          # http://localhost:5173/
npm run dev:host     # mở cổng ra mạng LAN (test trên điện thoại thật)
```

### 3.2. Full stack (Trực tuyến)

Cần 3 bước: chạy PostgreSQL → chạy backend → chạy giao diện với `VITE_API_URL`.

```bash
# 1) Backend: tạo server/.env từ mẫu rồi điền DATABASE_URL, JWT_SECRET
cp server/.env.example server/.env

# 2) Đồng bộ schema vào CSDL + chạy backend (cổng 4000)
npm --prefix server run prisma:push
npm --prefix server run dev

# 3) Giao diện: bật chế độ trực tuyến
#    - Cách khuyến nghị khi dev: VITE_API_URL="."  (dùng đúng origin hiện tại,
#      Vite tự proxy /api và /socket.io sang backend 4000 — không cần cấu hình CORS)
#    - Hoặc trỏ thẳng: VITE_API_URL="http://localhost:4000"
# Tạo file .env ở thư mục gốc từ mẫu rồi sửa giá trị, sau đó:
npm run dev
```

> Biến môi trường giao diện phải có tiền tố `VITE_` và **không kèm `/api`**.
> Ví dụ mẫu xem tại [.env.example](./.env.example) và [server/.env.example](./server/.env.example).

## 4. Build và xem trước bản production

```bash
# Giao diện
npm run typecheck               # kiểm tra TypeScript (không xuất file)
npm run build                   # build ra dist/
npm run preview                 # xem trước bản build

# Backend
npm --prefix server run typecheck
npm --prefix server run build   # bundle 1 file ra server/dist/index.js
npm --prefix server start       # chạy bản đã build
```

## 5. Các script có sẵn

**Giao diện (thư mục gốc):**

| Script | Mô tả |
| --- | --- |
| `npm run dev` | Dev server (local) |
| `npm run dev:host` | Dev server mở ra mạng LAN |
| `npm run typecheck` | Kiểm tra TypeScript app + node |
| `npm run build` | `tsc -b` rồi build production bằng Vite |
| `npm run preview` | Xem trước bản `dist/` |

**Backend (thư mục `server/`):**

| Script | Mô tả |
| --- | --- |
| `npm run dev` | Chạy server với `tsx watch` |
| `npm run build` | Bundle bằng esbuild → `server/dist/index.js` |
| `npm run start` | Chạy bản đã build |
| `npm run typecheck` | Kiểm tra TypeScript backend |
| `npm run prisma:generate` | Sinh Prisma Client |
| `npm run prisma:push` | Đồng bộ schema vào CSDL (`prisma db push`) |

## 6. Cấu trúc thư mục (tổng quan)

```
src/                       # Giao diện React
├── components/            # UI dùng chung (ui/, game/, layout/, common/, social/, chat/)
├── pages/                 # Trang theo route (kể cả FriendsPage, AdminPage, ShopPage)
├── layouts/               # MainLayout, GameLayout
├── games/                 # Game Registry + bàn chơi từng game (tien-len/)
├── game-engine/           # Logic game thuần (tienlen/)
├── data/                  # Danh mục dùng chung client + server (gameRegistry, shopCatalog)
├── services/              # ApiService, SocketService, RoomService, AuthService, SocialService, ShopService, AdminService, ...
├── contexts/              # Toast, Auth, Rooms, Social, Shop
├── types/                 # Kiểu dữ liệu dùng chung (social, admin, shop, hợp đồng realtime)
└── utils/                 # constants, format, id, crypto, avatar, images, cn

server/                    # Backend Express + Socket.IO + Prisma
├── prisma/schema.prisma   # Mô hình dữ liệu (User, Room, RoomMember, MatchHistory, FriendRequest, Friendship, DirectMessage, Purchase, ...)
└── src/
    ├── auth/              # JWT + middleware (requireAuth, requireAdmin)
    ├── rooms/             # REST phòng chơi + service
    ├── matches/           # Quản lý ván online (engine, view, ghi lịch sử)
    ├── realtime/          # Socket.IO (socket.ts, broadcast.ts, io.ts, presence.ts)
    ├── social/            # REST bạn bè + tin nhắn riêng
    ├── shop/              # REST cửa hàng: mua vật phẩm + xác thực quyền sở hữu
    ├── admin/             # REST quản trị (số liệu, tặng xu, phân quyền, xoá tài khoản)
    ├── games/ users/      # Route danh mục game, hồ sơ người dùng
    └── app.ts index.ts    # Khởi tạo Express + server
```

Chi tiết kiến trúc xem tại [ARCHITECTURE.md](./ARCHITECTURE.md).

## 7. Tính năng hiện có

**Local/Demo:**
- Trang chủ dashboard, danh sách game + lọc/tìm kiếm, danh mục.
- Tài khoản cục bộ: đăng ký/đăng nhập/khách, hồ sơ, đổi tên/avatar, lịch sử trận, thống kê, cài đặt.
- Phòng chơi demo (tạo/danh sách/tham gia/mật khẩu) và bàn Tiến Lên với AI.

**Trực tuyến (khi bật `VITE_API_URL`):**
- Tài khoản thật trên server (JWT), đồng bộ giữa các thiết bị.
- Phòng chơi realtime: tạo/join/rời, cập nhật thành viên qua `room:updated`.
- Ván Tiến Lên nhiều người: máy chủ chia bài, kiểm tra luật, quản lý lượt + đồng hồ, phát trạng thái riêng cho từng người (ẩn bài người khác).
- Rời phòng/ngắt kết nối: máy chủ xoá ghế; nếu đang chơi thì dừng ván và báo người còn lại.
- **Xã hội:** trang `/friends` (tìm người chơi, gửi/chấp nhận/từ chối lời mời, huỷ kết bạn), trạng thái online, **kết bạn ngay trong phòng chờ và trong trận**, **chat riêng** qua khung chat nổi (`ChatDock`) — có đếm tin chưa đọc.
- **Chat trong phòng:** khung trò chuyện chung cho mọi người đang ở cùng phòng/bàn (phòng chờ và trong ván đấu trực tuyến).
- **Nhãn dán & Cửa hàng:** nhãn dán dùng được ở **cả ba nơi** — chat riêng, chat phòng chờ và trong trận; **hiện tất cả nhãn dán đều miễn phí** (hệ thống vẫn hỗ trợ bán bằng xu khi đặt `price > 0`); kèm **cửa hàng riêng** tại `/shop`; hỗ trợ **thêm nhãn dán từ Stipop API** (bật bằng `STIPOP_API_KEY`, chi tiết ở [mục 8](#8-nhãn-dán--cửa-hàng-shop)).
- **Hồ sơ:** đổi tên hiển thị + **tải ảnh đại diện lên** (data URI, tối đa 256 KB).
- **Bảng quản trị** (`/admin`, chỉ tài khoản có `role = admin`): số liệu tổng quan, tìm người dùng, **tặng/trừ xu**, **cấp/thu quyền admin**, **xoá tài khoản**. Quyền admin được bootstrap qua biến môi trường `ADMIN_USERNAMES`.

## 8. Nhãn dán & Cửa hàng (Shop)

Hệ thống nhãn dán có **hai nguồn**:
1. **File ảnh tĩnh** trong `public/stickers/` (SVG/PNG/GIF) — không tốn RAM tiến trình Node, CSDL chỉ lưu **quyền sở hữu** chứ không lưu ảnh. Đây là danh mục do dự án tự quản lý.
2. **Nhãn dán Stipop** (API bên thứ ba) — server làm **proxy** giữ API key, client chỉ nhận metadata + URL ảnh trên CDN Stipop (xem [8.5](#85-nhãn-dán-stipop-api)).

Nhãn dán dùng chung cho **cả ba loại chat**: chat riêng (`ChatDock`), chat phòng chờ và chat trong trận (`RoomChat`).

### 8.1. Thành phần chính

| Tầng | Tệp | Vai trò |
| --- | --- | --- |
| **Danh mục (nguồn duy nhất)** | `src/data/shopCatalog.ts` | Khai báo gói, loại, vật phẩm, giá và file ảnh. **Dùng chung client + server** nên giá/quyền không bao giờ lệch. |
| Kiểu dữ liệu | `src/types/shop.ts` | `ShopItem`, `ShopItemKind`, `MessageType`, `StipopPack`, `StipopPackDetail`, `StipopFeed`. |
| Hiển thị/chọn | `src/components/chat/StickerPicker.tsx`, `StickerImage.tsx` | Bảng chọn nhãn dán (nhãn chưa mua hiện ổ khoá → dẫn tới `/shop`) và cách render ảnh (hỗ trợ cả `id` danh mục lẫn **URL ảnh Stipop**). |
| Nhãn dán Stipop | `src/components/chat/StipopStickers.tsx` | Duyệt gói/nhãn Stipop; có `onPick` ⇒ gửi (dùng trong bộ chọn), không có ⇒ chỉ xem (dùng ở cửa hàng). **Tự ẩn** khi chưa cấu hình key. |
| Trạng thái/nghiệp vụ | `src/contexts/ShopContext.tsx`, `src/services/ShopService.ts` | Quyền sở hữu, mua vật phẩm, đồng bộ số xu, gọi API Stipop (`stipopPacks`/`stipopPack`). |
| Trang cửa hàng | `src/pages/ShopPage.tsx` (route `/shop`) | Tab theo loại vật phẩm, nút mua, khu vực xem nhãn Stipop. |
| Backend | `server/src/shop/{service,routes,stipop}.ts`, model `Purchase` | Mua + trừ xu trong **một giao dịch**; socket/social **xác thực quyền sở hữu** trước khi cho gửi nhãn dán; `stipop.ts` làm **proxy** giữ API key. |

Hai chế độ hoạt động khác nhau (theo đúng kiến trúc chung):
- **Local/Demo:** quyền sở hữu lưu ở `LocalStorage` (key `shop-owned:<userId>`), mua thì trừ xu cục bộ qua `AuthService.spendCoins`.
- **Trực tuyến:** mua qua `POST /api/shop/purchases`, server là nguồn chân lý; vật phẩm **miễn phí không lưu** vào danh sách sở hữu.

### 8.2. Thêm một nhãn dán mới

1. Thả file vào `public/stickers/` — tên file nên trùng `id` (ví dụ `star.svg`). Nếu là SVG thủ công, **nhúng id gradient riêng** để tránh trùng id khi nhiều ảnh cùng trang.
2. Thêm một mục vào `SHOP_ITEMS` trong `src/data/shopCatalog.ts`:

```ts
{ id: 'star', kind: 'sticker', pack: 'cute', name: 'Ngôi sao',
  description: 'Toả sáng rực rỡ', price: 500, file: 'stickers/star.svg' }
```

- `price: 0` → **miễn phí**; `price > 0` → **bán bằng xu**.
- Đổi/tạo `pack` mới → cửa hàng tự có nhóm mới (không cần sửa component).

> Hiện tại **tất cả** nhãn dán trong danh mục đều đặt `price: 0` (miễn phí). Muốn bán thì chỉ cần sửa `price` của nhãn đó thành số xu mong muốn.

### 8.3. Mở rộng sang loại vật phẩm khác (khung chat, skin bài, khung avatar)

1. Thêm giá trị mới vào `ShopItemKind` (`src/types/shop.ts`).
2. Thêm nhãn hiển thị tiếng Việt vào `SHOP_KINDS` (`src/data/shopCatalog.ts`).
3. Thêm vật phẩm cùng `kind` đó vào `SHOP_ITEMS`.

**Cửa hàng tự tạo tab theo loại và tự ẩn loại chưa có vật phẩm — không phải sửa `ShopPage`.**

### 8.4. Lưu ý khi đổi CSDL

Schema thêm model `Purchase` và 2 cột `type`/`stickerId` cho `DirectMessage`. Sau khi sửa schema, chạy:

```bash
npm --prefix server run prisma:generate   # sinh Prisma Client
npm --prefix server run prisma:push       # đồng bộ schema vào CSDL
```

> Khi deploy trên Render, Web Service đã tự chạy `prisma:push` lúc khởi động nên không cần làm tay.

### 8.5. Nhãn dán Stipop (API)

Ngoài danh mục tĩnh, ứng dụng có thể lấy thêm nhãn dán từ **[Stipop](https://docs.stipop.io)**. Server đóng vai trò **proxy** để **API key không bao giờ lộ ra client**; ảnh nhãn dán nằm trên CDN `img.stipop.io` nên client tải trực tiếp.

**Bật tính năng** — chỉ cần đặt biến môi trường cho server:

```
STIPOP_API_KEY=<key lấy tại https://dashboard.stipop.io>
```

- **Để trống** ⇒ tính năng **tự tắt**: `GET /api/shop/stipop/packs` trả `{ enabled: false }`, và mọi nơi (cửa hàng, bộ chọn nhãn dán) **tự ẩn** phần Stipop, không báo lỗi.
- Trên Render: thêm biến này trong **Environment** của Web Service rồi deploy lại.

**Luồng dữ liệu:**

| Bước | Endpoint/Thành phần | Việc |
| --- | --- | --- |
| 1 | `GET /api/shop/stipop/packs?sort=trending&limit=24` | Server gọi Stipop `GET /package` (hoặc `/package/new`), trả `{ enabled, packs[] }`. |
| 2 | `GET /api/shop/stipop/packs/:packId` | Server gọi `GET /package/:id`, trả chi tiết gói + mảng `stickers[].url` (đã thêm `?d=300x300` để tối ưu ảnh). |
| 3 | `StipopStickers.tsx` | Hiển thị gói + grid nhãn. Chọn nhãn ⇒ `onPick(url)` gửi đi. |

**Gửi nhãn Stipop:** `stickerId` của tin nhắn chấp nhận **id danh mục** HOẶC **URL ảnh Stipop** (`https://...stipop.io/...`). Server cho phép URL Stipop hợp lệ mà không cần kiểm tra trong danh mục cửa hàng (`isStipopStickerUrl` trong `server/src/shop/stipop.ts`), nên gói/nhãn mới từ API dùng được ngay.

**Lưu ý bản quyền:** theo điều khoản Stipop, giao diện hiển thị nhãn dán **phải ghi rõ tên tác giả** — `StipopStickers` đã hiển thị `Tác giả: <artistName>`.

**Chỉnh sửa nhanh** (nếu cần):
- Đổi kích thước ảnh, timeout, base URL ⇒ sửa hằng số ở đầu `server/src/shop/stipop.ts`.
- Đổi số gói/sắp xếp ⇒ sửa tham số trong `StipopStickers.tsx` (`sort`, `limit`).

## 9. Triển khai lên GitHub & Render

Repo hiện tại: `walevmn001/GameHub`, nhánh `main`. **Render tự deploy lại mỗi khi push `main`.**

Dự án kèm [render.yaml](./render.yaml) để deploy bằng **Blueprint**, gồm 3 service:

1. `gamehub-walevmn-db` — PostgreSQL (free).
2. `gamehub-walevmn-api` — **Web Service** Node (`rootDir: server`), build `npm install --include=dev && npm run build`, start `npm run prisma:push && npm start`, health check `/api/health`.
3. `gamehub-walevmn` — **Static Site** (thư mục `dist/`), build `npm ci && npm run build`.

**Các bước:**

1. Vào [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint** → chọn repo.
2. Render đọc `render.yaml` và tạo 3 service. Chờ deploy xong.
3. **Kiểm tra biến môi trường cho khớp tên miền thực tế:**
   - Static Site: `VITE_API_URL` = địa chỉ backend (ví dụ `https://gamehub-walevmn-api.onrender.com`, **không kèm `/api`**).
   - Web Service: `ALLOWED_ORIGINS` = địa chỉ Static Site (ví dụ `https://gamehub-walevmn.onrender.com`).
   - Nếu đổi tên service, nhớ cập nhật lại 2 biến trên.
4. Sau khi deploy, mở URL Static Site, **hard-refresh** (`Ctrl+Shift+R`) để xoá cache.

> Khác biệt Web Service vs Blueprint: **Blueprint** tạo cả cụm (DB + backend + frontend) từ `render.yaml` trong một lần;
> **Web Service** chỉ tạo thủ công **một** service. Với dự án này nên dùng Blueprint.

## 10. Tình hình hiện tại & nhật ký gần đây

- **Phiên bản:** 0.1.0. Backend đã hoạt động; chơi online realtime đã chạy được.
- **Kiểm tra chất lượng:** `npm run typecheck` ✅ · `npm run build` ✅ · `npm --prefix server run typecheck` ✅.

**Nhật ký sửa lỗi gần đây:**

| Commit | Nội dung |
| --- | --- |
| `8647c25` | **feat(shop):** đặt toàn bộ nhãn dán hiện có thành **miễn phí** (`price: 0`). Giữ nguyên cơ chế bán — đặt `price > 0` là nhãn đó mua bằng xu. Sửa: `src/data/shopCatalog.ts`. |
| `b277859` | **feat:** nhãn dán + cửa hàng — nhãn dán dùng ở **cả 3 loại chat** (riêng / phòng chờ / trong trận), có loại miễn phí và loại **mua bằng xu**, kèm **cửa hàng `/shop`**. Thêm file tĩnh `public/stickers/*.svg`, danh mục chung `data/shopCatalog.ts`, `types/shop.ts`, `components/chat/*`, `ShopContext`, `ShopService`, `ShopPage`; thêm model `Purchase` + cột `type`/`stickerId` cho `DirectMessage`, xác thực quyền gửi nhãn dán ở socket/social. (Xem [mục 8](#8-nhãn-dán--cửa-hàng-shop).) |
| `ec466c8` | **fix:** lá bài đang chọn không còn che các lá sau; rời phòng (kể cả điều hướng/thoát bàn) xoá đúng người chơi khỏi phòng. Sửa: `PlayerHand.tsx` (z-index theo thứ tự DOM), `SocketService.ts`/`RoomsContext.tsx` (tự rời khi rời trang), `TienLenBoard.tsx` (thoát bàn → lobby khi đối thủ rời ván), `server/src/realtime/socket.ts` (đưa phòng về `waiting`, phát `server:error`). |
| `98b6fe9` | chore(render): tên service duy nhất (`-walevmn`) + chạy `prisma db push` lúc runtime. |

**Việc có thể làm tiếp:**
- Kiểm thử tự động (unit test) cho game engine và luồng phòng.
- Cân nhắc nhánh + PR thay vì push thẳng `main`.
- Các game khác: Phỏm, Xì Dách, Mậu Binh, Cờ Caro, Xếp Hình 2048.
- Đóng gói Android/iOS bằng Capacitor (xem [FUTURE_MOBILE_PLAN.md](./FUTURE_MOBILE_PLAN.md)).

## 11. Tài liệu dự án

| Tài liệu | Nội dung |
| --- | --- |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Kiến trúc tổng thể, phân tầng, luồng dữ liệu |
| [DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md) | Chức năng đã / chưa hoàn thành |
| [API_PLAN.md](./API_PLAN.md) | Thiết kế API backend |
| [GAME_REGISTRY.md](./GAME_REGISTRY.md) | Hướng dẫn thêm trò chơi mới |
| [FUTURE_MOBILE_PLAN.md](./FUTURE_MOBILE_PLAN.md) | Kế hoạch đóng gói thành app Android/iOS |

## 12. Giấy phép

Dự án cá nhân phục vụ mục đích học tập và thử nghiệm.
