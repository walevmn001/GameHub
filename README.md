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
| Cửa hàng & Tủ đồ | `src/pages/ShopPage.tsx` (route `/shop`) | Mua theo loại; Tủ đồ xem loadout hiện tại, chọn skin sở hữu hoặc trở về bộ tiêu chuẩn. Mua skin mới sẽ mở Tủ đồ. |
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
{ id: 'controller', kind: 'sticker', pack: 'cute', name: 'Tay cầm xanh',
  description: 'Nhãn dán tay cầm chơi game', price: 0,
  file: 'https://cdn.jsdelivr.net/gh/user/sticker-pack@main/controller.png' }
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

## 9. Tùy chỉnh giao diện (Auth UI, ChatDock, Card Skins)

Các thay đổi giao diện gần đây được tách thành component riêng để dễ sửa. Mục này ghi rõ chỗ nào sửa cho từng tính năng.

### 9.1. Giao diện Đăng nhập / Đăng ký (Cute Cartoon)

Toàn bộ hệ thống auth UI nằm trong `src/components/auth/` (xem [index.ts](./src/components/auth/index.ts) để biết danh sách component).

| Component | File | Vai trò | Chỉnh sửa gì |
| --- | --- | --- | --- |
| `AuthLayout` | `src/components/auth/AuthLayout.tsx` | Bố cục riêng cho `/login` & `/register` (nền gradient trắng→mint, lá góc, nút về trang chủ). | Đổi nền, các lá trang trí góc. |
| `AuthMascot` | `src/components/auth/AuthMascot.tsx` | Mascot mèo trắng đeo tai nghe gaming xanh lá (vẽ bằng **SVG nội tuyến**, không phải ảnh). | Đổi màu tai nghe, biểu cảm, kích thước. |
| `AuthDecorations` | `src/components/auth/AuthDecorations.tsx` | Các vật phẩm bay: lá bài, chip, vương miện, sao, clover, sparkle, hộp quà. | Thêm/bớt đồ trang trí, đổi vị trí bay. |
| `AuthCard` | `src/components/auth/AuthCard.tsx` | Card trắng bo 28px chứa form. | Bo góc, bóng đổ, padding. |
| `AuthHeader` | `src/components/auth/AuthHeader.tsx` | Tiêu đề trang + subtitle; dùng `AuthTitle` có vương miện. | Đổi text tiêu đề. |
| `AuthTitle` | `src/components/ui/AuthTitle.tsx` | Tiêu đề chữ lớn gradient xanh lá + bóng 3D. | **Đã bỏ `WebkitTextStroke`** (làm vỡ chữ tiếng Việt); hiện dùng `text-shadow` nhiều lớp + `drop-shadow`. Đổi gradient/bóng ở đây. |
| `AuthInput` | `src/components/auth/AuthInput.tsx` | Input bo góc, nền `#F7FFF4`, viền `#D5F0CA`, icon trái. | Chiều cao, màu nền, viền focus. |
| `PasswordInput` | `src/components/auth/PasswordInput.tsx` | Input mật khẩu có nút hiện/ẩn. | Icon mắt, logic ẩn/hiện. |
| `PasswordStrength` | `src/components/auth/PasswordStrength.tsx` | Thanh độ mạnh mật khẩu + checklist. | Quy tắc tính điểm, màu từng mức. |
| `PrimaryButton` | `src/components/auth/PrimaryButton.tsx` | Nút pill 56px, gradient xanh lá, bóng 3D, hover nâng/nhấn lún. | Gradient, chiều cao, hiệu ứng. |
| `AuthCheckbox`, `ErrorMessage`, `SuccessPopup`, `AuthFooter` | `src/components/auth/` | Checkbox ghi nhớ, thông báo lỗi (rung), popup thành công, link chuyển trang. | Text, màu, animation. |

**Trang:** [LoginPage.tsx](./src/pages/LoginPage.tsx), [RegisterPage.tsx](./src/pages/RegisterPage.tsx). Route khai báo tại [App.tsx](./src/App.tsx) (dùng `AuthLayout` riêng, không có navbar/footer).

**Design tokens** (màu + animation) thêm vào [tailwind.config.js](./tailwind.config.js) dưới key `cute`: `green`, `greenDark`, `mint`, `gold`, `inputBg`, `inputBorder`; keyframes `sparkle`, `drift`, `shake`. **Không đổi token cũ** nên không ảnh hưởng màn hình khác.

**Chức năng "Ghi nhớ đăng nhập":**
- Local: token lưu `LocalStorage` nếu nhớ; không nhớ thì dùng token tạm trong session (xem `AuthService.login` + `backend.ts` `TEMP_TOKENS`).
- Online: `AuthContext` gửi `remember` về API; token không nhớ chỉ tồn tại trong tab.

> Lưu ý: spec yêu cầu trường Email nhưng **backend hiện chỉ hỗ trợ username**, nên form đăng ký dùng `Tên đăng nhập / Tên hiển thị / Mật khẩu / Nhập lại mật khẩu`. Nút "Quên mật khẩu?" hiện chỉ hiển thị hướng dẫn (chưa có luồng reset ở backend).

### 9.2. Nút menu nổi ChatDock (góc dưới phải)

File: [src/components/social/ChatDock.tsx](./src/components/social/ChatDock.tsx).

- Nút dùng màu `#62D943`, bo tròn, bóng 3D, gờ trắng trên.
- Icon là **mặt mascot SVG** (mắt long lanh, má hồng, miệng cười) — sửa kích thước ở attribute `className="h-11 w-11"` của thẻ `<svg>`.
- Hiệu ứng: hover scale 1.1, nhấn scale 0.95.
- Badge chưa đọc có viền trắng.

### 9.3. Ô thống kê (StatTile)

File: [src/components/ui/StatTile.tsx](./src/components/ui/StatTile.tsx).

- Dòng tiêu đề có `min-h-9` và luôn giữ chỗ icon (kể cả ô không có icon) để các giá trị (Số trận, Thắng, Thua, Tỉ lệ thắng) **thẳng hàng** với nhau. Nếu thêm ô mới không icon, nhớ giữ placeholder `<span className="h-9 w-9 shrink-0" />`.

### 9.4. Thanh điều hướng & menu mobile

File: [src/components/layout/Navbar.tsx](./src/components/layout/Navbar.tsx) (và menu mobile tương ứng).

- **Đã bỏ link "Bạn bè"** khỏi navbar + menu mobile (chỉ còn trong dropdown avatar). Muốn khôi phục thì thêm lại `<NavLink to="/friends">`.

### 9.5. Skin bộ bài

- Danh mục & màu: [src/utils/cardSkins.ts](./src/utils/cardSkins.ts) (`CARD_SKINS`).
- Tranh SVG mặt bài: [src/components/game/CardSkinArtwork.tsx](./src/components/game/CardSkinArtwork.tsx).
- Render lá bài (áp dụng skin): [src/components/game/PlayCard.tsx](./src/components/game/PlayCard.tsx).
- Sản phẩm trong shop: `kind: 'cardSkin'` trong [src/data/shopCatalog.ts](./src/data/shopCatalog.ts).

Hiện có 3 skin: **Hoa anh đào (sakura)**, **Rồng (dragon)**, **Hiệp sĩ (knight)**. Cách thêm skin mới xem [mục 8.2](#82-thêm-skin-bộ-bài).

## 10. Triển khai lên GitHub & Render

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

## 11. Tình hình hiện tại & nhật ký gần đây

- **Phiên bản:** 0.1.0. Backend đã hoạt động; chơi online realtime đã chạy được.
- **Kiểm tra chất lượng:** `npm run typecheck` ✅ · `npm run build` ✅ · `npm --prefix server run typecheck` ✅.

**Nhật ký thay đổi gần đây:**

| Commit | Nội dung |
| --- | --- |
| `1f0a778` → `a811214` | **feat(auth):** thiết kế lại **Đăng nhập / Đăng ký** phong cách Cute Cartoon xanh lá — bộ component `src/components/auth/` (AuthLayout, AuthMascot SVG, AuthDecorations, AuthCard, AuthInput, PasswordInput, PasswordStrength, PrimaryButton 3D, AuthCheckbox, ErrorMessage, SuccessPopup, AuthFooter), trang `LoginPage`/`RegisterPage`, route dùng AuthLayout riêng. Thêm token `cute.*` + keyframes `sparkle/drift/shake` vào `tailwind.config.js`. Tích hợp "Ghi nhớ đăng nhập" thật (token tạm khi không nhớ). |
| `c61b6f3` | **fix(auth):** sửa `AuthTitle` chữ tiếng Việt bị vỡ/trùng màu — bỏ `WebkitTextStroke`, dùng `text-shadow` + `drop-shadow`; bỏ vương miện dư thừa trong tiêu đề. |
| `4933af4` | **fix(ui):** `StatTile` các ô thống kê (Số trận/Thắng/Thua/Tỉ lệ thắng) bị lệch — thêm `min-h-9` + giữ chỗ icon để giá trị thẳng hàng. |
| `2cac28f` | **refactor(navbar):** bỏ link **"Bạn bè"** khỏi navbar + menu mobile (chỉ còn trong dropdown avatar). |
| `776b9a6` → `1f0a778` | **style(chatdock):** nút menu nổi góc dưới phải đổi sang **cartoon 3D xanh `#62D943`**, icon thay bằng mặt mascot SVG (mắt long lanh, má hồng), hiệu ứng hover scale/nhấn lún; phóng to icon lên `h-11 w-11`. |
| `8647c25` | **feat(shop):** đặt toàn bộ nhãn dán hiện có thành **miễn phí** (`price: 0`). Giữ nguyên cơ chế bán — đặt `price > 0` là nhãn đó mua bằng xu. Sửa: `src/data/shopCatalog.ts`. |
| `b277859` | **feat:** nhãn dán + cửa hàng — nhãn dán dùng ở **cả 3 loại chat** (riêng / phòng chờ / trong trận), có loại miễn phí và loại **mua bằng xu**, kèm **cửa hàng `/shop`**. Thêm file tĩnh `public/stickers/*.svg`, danh mục chung `data/shopCatalog.ts`, `types/shop.ts`, `components/chat/*`, `ShopContext`, `ShopService`, `ShopPage`; thêm model `Purchase` + cột `type`/`stickerId` cho `DirectMessage`, xác thực quyền gửi nhãn dán ở socket/social. (Xem [mục 8](#8-nhãn-dán--cửa-hàng-shop).) |
| `ec466c8` | **fix:** lá bài đang chọn không còn che các lá sau; rời phòng (kể cả điều hướng/thoát bàn) xoá đúng người chơi khỏi phòng. Sửa: `PlayerHand.tsx` (z-index theo thứ tự DOM), `SocketService.tsx`/`RoomsContext.tsx` (tự rời khi rời trang), `TienLenBoard.tsx` (thoát bàn → lobby khi đối thủ rời ván), `server/src/realtime/socket.ts` (đưa phòng về `waiting`, phát `server:error`). |
| `98b6fe9` | chore(render): tên service duy nhất (`-walevmn`) + chạy `prisma db push` lúc runtime. |

**Việc có thể làm tiếp:**
- Kiểm thử tự động (unit test) cho game engine và luồng phòng.
- Cân nhắc nhánh + PR thay vì push thẳng `main`.
- Các game khác: Phỏm, Xì Dách, Mậu Binh, Cờ Caro, Xếp Hình 2048.
- Đóng gói Android/iOS bằng Capacitor (xem [FUTURE_MOBILE_PLAN.md](./FUTURE_MOBILE_PLAN.md)).

## 12. Tài liệu dự án

| Tài liệu | Nội dung |
| --- | --- |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Kiến trúc tổng thể, phân tầng, luồng dữ liệu |
| [DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md) | Chức năng đã / chưa hoàn thành |
| [API_PLAN.md](./API_PLAN.md) | Thiết kế API backend |
| [GAME_REGISTRY.md](./GAME_REGISTRY.md) | Hướng dẫn thêm trò chơi mới |
| [FUTURE_MOBILE_PLAN.md](./FUTURE_MOBILE_PLAN.md) | Kế hoạch đóng gói thành app Android/iOS |

## 13. Giấy phép

Dự án cá nhân phục vụ mục đích học tập và thử nghiệm.
