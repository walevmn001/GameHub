# Mini Game Hub

Sảnh game mini trên trình duyệt, bắt đầu với **Tiến Lên Miền Nam**: chơi cùng AI, mở phòng trực tuyến
với bạn bè, sưu tầm nhãn dán và tùy chỉnh bộ bài. Giao diện dùng **React + Vite + TypeScript +
Tailwind CSS**; backend dùng **Node.js + Express + Socket.IO + PostgreSQL (Prisma)**.

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
- **Nhãn dán & Cửa hàng:** nhãn dán dùng trong chat riêng, phòng chờ và trận; shop có tab theo loại vật phẩm, gồm nhãn dán và skin bộ bài (chi tiết ở [mục 8](#8-nhãn-dán--cửa-hàng-shop)).
- **Hồ sơ:** đổi tên hiển thị + **tải ảnh đại diện lên** (data URI, tối đa 256 KB).
- **Bảng quản trị** (`/admin`, chỉ tài khoản có `role = admin`): số liệu tổng quan, tìm người dùng, **tặng/trừ xu**, **cấp/thu quyền admin**, **xoá tài khoản**. Quyền admin được bootstrap qua biến môi trường `ADMIN_USERNAMES`.

## 8. Nhãn dán & Cửa hàng (Shop)

Hệ thống nhãn dán dùng **file ảnh tĩnh** — có thể nằm trong `public/stickers/` (SVG/PNG/GIF) **hoặc host bên ngoài** (GitHub/CDN, xem [8.6](#86-host-ảnh-nhãn-dán-trên-github--cdn)). Không tốn RAM tiến trình Node, CSDL chỉ lưu **quyền sở hữu** chứ không lưu ảnh. Nhãn dán dùng chung cho **cả ba loại chat**: chat riêng (`ChatDock`), chat phòng chờ và chat trong trận (`RoomChat`).

### 8.1. Thành phần chính

| Tầng | Tệp | Vai trò |
| --- | --- | --- |
| **Danh mục (nguồn duy nhất)** | `src/data/shopCatalog.ts` | Khai báo gói, loại, vật phẩm, giá và file ảnh. **Dùng chung client + server** nên giá/quyền không bao giờ lệch. |
| Kiểu dữ liệu | `src/types/shop.ts` | `ShopItem`, `ShopItemKind`, `MessageType`. |
| Hiển thị/chọn | `src/components/chat/StickerPicker.tsx`, `StickerImage.tsx` | Bảng chọn nhãn dán (nhãn chưa mua hiện ổ khoá → dẫn tới `/shop`) và cách render ảnh (hỗ trợ cả tệp trong repo lẫn **URL ảnh host bên ngoài**). |
| Skin bộ bài | `src/utils/cardSkins.ts`, `src/components/game/CardSkinArtwork.tsx`, `src/components/game/PlayCard.tsx` | Họa tiết lưng và tranh vector mặt bài; hạng/chất ở góc không đổi. |
| Trạng thái/nghiệp vụ | `src/contexts/ShopContext.tsx`, `src/services/ShopService.ts` | Quyền sở hữu, mua vật phẩm và loadout đang trang bị. |
| Trang cửa hàng | `src/pages/ShopPage.tsx` (route `/shop`) | Tab theo loại vật phẩm, xem trước, mua và trang bị skin. |
| Backend | `server/src/shop/{service,routes}.ts`, models `Purchase`/`UserLoadout` | Mua + trừ xu; xác thực quyền sở hữu khi trang bị; xác thực quyền gửi nhãn dán. |

Hai chế độ hoạt động khác nhau (theo đúng kiến trúc chung):
- **Local/Demo:** quyền sở hữu và loadout lưu ở `LocalStorage` (key `shop-owned:<userId>` và `shop-loadout:<userId>`), mua thì trừ xu qua `AuthService.spendCoins`.
- **Trực tuyến:** mua qua `POST /api/shop/purchases`, loadout qua `/api/shop/loadout`; server là nguồn chân lý.

### 8.2. Thêm skin bộ bài

1. Thêm sản phẩm `kind: 'cardSkin'` vào `SHOP_ITEMS` trong `src/data/shopCatalog.ts`, đặt giá bằng xu.
2. Dùng id ổn định và thêm cùng id vào `CARD_SKINS` trong `src/utils/cardSkins.ts` (màu mặt/lưng và biểu tượng).
3. Thêm tranh SVG theo id trong `src/components/game/CardSkinArtwork.tsx`; component này vẽ art trên từng lá cả ở tay người chơi và bàn giữa.
4. Giữ hạng/chất ở góc lá trong `PlayCard.tsx`; không thay dữ liệu luật chơi khi thêm art.
5. Shop tự tạo tab “Skin bộ bài”. Người chơi mua rồi bấm **Trang bị**; ván online chốt skin theo từng ghế và chỉ phát cosmetic id công khai, không gửi bài kín.

Tab mới cần kind trong `ShopItemKind` và `SHOP_KINDS`; thêm loại equip thì bổ sung validator tại `server/src/shop/routes.ts`. Tab chưa có sản phẩm sẽ tự ẩn.

### 8.3. Thêm một nhãn dán mới

1. **Có ảnh** — chọn 1 trong 2 cách:
   - **Lưu trong repo:** thả file vào `public/stickers/` — tên file nên trùng `id` (ví dụ `star.svg`). Nếu là SVG thủ công, **nhúng id gradient riêng** để tránh trùng id khi nhiều ảnh cùng trang.
   - **Host bên ngoài (không lưu trên server web):** đưa ảnh lên GitHub/CDN rồi dùng **URL tuyệt đối** làm `file` (xem [8.6](#86-host-ảnh-nhãn-dán-trên-github--cdn)).
2. Thêm một mục vào `SHOP_ITEMS` trong `src/data/shopCatalog.ts`:

```ts
// Ảnh trong repo:
{ id: 'star', kind: 'sticker', pack: 'cute', name: 'Ngôi sao',
  description: 'Toả sáng rực rỡ', price: 500, file: 'stickers/star.svg' }

// Ảnh host bên ngoài (điền URL tuyệt đối):
{ id: 'star', kind: 'sticker', pack: 'cute', name: 'Ngôi sao',
  description: 'Toả sáng rực rỡ', price: 0, file: 'https://cdn.jsdelivr.net/gh/user/stickers@main/star.svg' }
```

- `price: 0` → **miễn phí**; `price > 0` → **bán bằng xu**.
- Đổi/tạo `pack` mới → cửa hàng tự có nhóm mới (không cần sửa component).
- **Không cần sửa server:** server chỉ xác thực theo `id` nhãn dán, không đọc/lưu ảnh.

Nhãn dán có thể miễn phí (`price: 0`) hoặc bán bằng xu (`price > 0`).

### 8.4. Mở rộng sang loại vật phẩm khác (khung chat, khung avatar)

1. Thêm giá trị mới vào `ShopItemKind` (`src/types/shop.ts`).
2. Thêm nhãn hiển thị tiếng Việt vào `SHOP_KINDS` (`src/data/shopCatalog.ts`).
3. Thêm vật phẩm cùng `kind` đó vào `SHOP_ITEMS`.

**Cửa hàng tự tạo tab theo loại và tự ẩn loại chưa có vật phẩm — không phải sửa `ShopPage`.**

### 8.5. Lưu ý khi đổi CSDL

Schema gồm `Purchase`, `UserLoadout` và 2 cột `type`/`stickerId` cho `DirectMessage`. Sau khi sửa schema, chạy:

```bash
npm --prefix server run prisma:generate   # sinh Prisma Client
npm --prefix server run prisma:push       # đồng bộ schema vào CSDL
```

> Khi deploy trên Render, Web Service đã tự chạy `prisma:push` lúc khởi động nên không cần làm tay.

### 8.6. Host ảnh nhãn dán trên GitHub / CDN

Ảnh nhãn dán **không bắt buộc** nằm trong `public/stickers/`. Bạn có thể host ở bên ngoài rồi điền **URL tuyệt đối** vào trường `file` của vật phẩm trong `src/data/shopCatalog.ts`.

**Vì sao làm được:** `stickerId` gửi đi vẫn là **`id`** của nhãn dán (`cat`, `dog`…), còn ảnh chỉ do **client** resolve từ `file`. Server chỉ xác thực theo `id` nên **không cần sửa backend**. Nhờ đó repo/deploy nhẹ hơn và có thể thêm/đổi ảnh mà không cần sửa code.

**Các nơi host:**

| Cách | URL mẫu | Ghi chú |
| --- | --- | --- |
| **GitHub + jsDelivr** (miễn phí, dễ nhất) | `https://cdn.jsdelivr.net/gh/<user>/<repo>@main/<file>.png` | Có cache CDN toàn cầu, **khuyến nghị** |
| GitHub raw (không qua CDN) | `https://raw.githubusercontent.com/<user>/<repo>/main/<file>.png` | Chạy được nhưng chậm hơn, dễ chạm giới hạn tốc độ |
| Cloudinary | `https://res.cloudinary.com/<cloud>/image/upload/<file>.png` | Tối ưu ảnh, biến đổi kích thước tự động |
| Cloudflare R2 / AWS S3 | `https://<bucket>.r2.dev/<file>.png` | Dung lượng lớn, cần tự cấu hình |

#### Hướng dẫn chi tiết — GitHub + jsDelivr

**Bước 1. Tạo repo chứa ảnh**
1. Trên GitHub, tạo một repo **Public** mới, ví dụ `sticker-pack` (nên tách riêng khỏi repo game để deploy game nhẹ).
2. Tải các ảnh nhãn dán lên repo (có thể đặt phẳng ở thư mục gốc, hoặc theo thư mục như `cute/cat.png`). Đặt tên file **không dấu, không khoảng trắng** (ví dụ `cat.png`, `dog.png`).

**Bước 2. Lấy URL cho từng ảnh**

Dùng cú pháp jsDelivr (thay `<user>`, `<repo>`, nhánh và tên file cho đúng):

```
https://cdn.jsdelivr.net/gh/<user>/sticker-pack@main/cat.png
```

- `@main` là **tag phiên bản** (ở đây là nhánh `main`). Nên dùng **tag/release** (ví dụ `@v1`) để tránh cache nhầm khi bạn đổi ảnh.
- Nếu ảnh nằm trong thư mục con: `...@main/cute/cat.png`.

> Mở từng URL trên trình duyệt để chắc chắn ảnh xem được trước khi nhập vào danh mục.

**Bước 3. Khai báo trong danh mục**

Mở `src/data/shopCatalog.ts` và thêm mục (hoặc đổi `file` của mục cũ):

```ts
{ id: 'cat', kind: 'sticker', pack: 'cute', name: 'Mèo con',
  description: 'Chú mèo đáng yêu', price: 0,
  file: 'https://cdn.jsdelivr.net/gh/user/sticker-pack@main/cat.png' }
```

- `id` phải **duy nhất** và **ngắn gọn** (đây là giá trị lưu trong tin nhắn, CSDL và LocalStorage).
- `price: 0` → miễn phí; `price > 0` → bán bằng xu.
- `pack` chưa có thì thêm nhãn hiển thị vào `SHOP_PACKS` (đầu file) — cửa hàng tự tạo nhóm.

**Bước 4. Kiểm tra & deploy**

```bash
npm run typecheck && npm run build   # chạy ở thư mục gốc
```

Sau đó commit/push `main` như bình thường — **Render tự deploy lại**. Không cần cấu hình gì thêm trên server.

**Lưu ý chung:**
- Ảnh phải **truy cập công khai** (không cần đăng nhập).
- jsDelivr/GitHub có thể **cache**; khi đổi nội dung ảnh cùng tên, hãy tạo tag mới (`@v2`) hoặc thêm `?v=2`.
- **Trộn được cả hai kiểu:** nhãn này lưu trong `public/stickers/`, nhãn khác trỏ ra CDN.

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
