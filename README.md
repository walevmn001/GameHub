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
├── components/            # UI dùng chung (ui/, game/, layout/, common/)
├── pages/                 # Trang theo route
├── layouts/               # MainLayout, GameLayout
├── games/                 # Game Registry + bàn chơi từng game (tien-len/)
├── game-engine/           # Logic game thuần (tienlen/)
├── services/              # ApiService, SocketService, RoomService, AuthService, ...
├── contexts/              # Toast, Auth, Rooms
├── types/                 # Kiểu dữ liệu dùng chung (kể cả hợp đồng realtime)
└── utils/                 # constants, format, id, crypto, avatar, images, cn

server/                    # Backend Express + Socket.IO + Prisma
├── prisma/schema.prisma   # Mô hình dữ liệu (User, Room, RoomMember, MatchHistory, ...)
└── src/
    ├── auth/              # JWT + middleware
    ├── rooms/             # REST phòng chơi + service
    ├── matches/           # Quản lý ván online (engine, view, ghi lịch sử)
    ├── realtime/          # Socket.IO (socket.ts, broadcast.ts, io.ts)
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

## 8. Triển khai lên GitHub & Render

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

## 9. Tình hình hiện tại & nhật ký gần đây

- **Phiên bản:** 0.1.0. Backend đã hoạt động; chơi online realtime đã chạy được.
- **Kiểm tra chất lượng:** `npm run typecheck` ✅ · `npm run build` ✅ · `npm --prefix server run typecheck` ✅.

**Nhật ký sửa lỗi gần đây:**

| Commit | Nội dung |
| --- | --- |
| `ec466c8` | **fix:** lá bài đang chọn không còn che các lá sau; rời phòng (kể cả điều hướng/thoát bàn) xoá đúng người chơi khỏi phòng. Sửa: `PlayerHand.tsx` (z-index theo thứ tự DOM), `SocketService.ts`/`RoomsContext.tsx` (tự rời khi rời trang), `TienLenBoard.tsx` (thoát bàn → lobby khi đối thủ rời ván), `server/src/realtime/socket.ts` (đưa phòng về `waiting`, phát `server:error`). |
| `98b6fe9` | chore(render): tên service duy nhất (`-walevmn`) + chạy `prisma db push` lúc runtime. |

**Việc có thể làm tiếp:**
- Kiểm thử tự động (unit test) cho game engine và luồng phòng.
- Cân nhắc nhánh + PR thay vì push thẳng `main`.
- Các game khác: Phỏm, Xì Dách, Mậu Binh, Cờ Caro, Xếp Hình 2048.
- Đóng gói Android/iOS bằng Capacitor (xem [FUTURE_MOBILE_PLAN.md](./FUTURE_MOBILE_PLAN.md)).

## 10. Tài liệu dự án

| Tài liệu | Nội dung |
| --- | --- |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Kiến trúc tổng thể, phân tầng, luồng dữ liệu |
| [DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md) | Chức năng đã / chưa hoàn thành |
| [API_PLAN.md](./API_PLAN.md) | Thiết kế API backend |
| [GAME_REGISTRY.md](./GAME_REGISTRY.md) | Hướng dẫn thêm trò chơi mới |
| [FUTURE_MOBILE_PLAN.md](./FUTURE_MOBILE_PLAN.md) | Kế hoạch đóng gói thành app Android/iOS |

## 11. Giấy phép

Dự án cá nhân phục vụ mục đích học tập và thử nghiệm.
