# Mini Game Hub

Nền tảng chơi game mini trên trình duyệt, xây dựng bằng **React + Vite + TypeScript + Tailwind CSS**.
Phiên bản hiện tại là **bản web chạy hoàn toàn cục bộ (Local/Demo)** — chưa có backend, chưa có máy chủ.
Kiến trúc mã nguồn được thiết kế sẵn để nâng cấp thành ứng dụng **Android/iOS (Capacitor)** và kết nối
**Node.js + Express + Socket.IO + PostgreSQL (Prisma)** trong tương lai.

> Trò chơi đầu tiên: **Tiến Lên Miền Nam** — bàn 4 người chơi với AI cơ bản.

---

## 1. Yêu cầu môi trường

- **Node.js** >= 18 (khuyến nghị 20 LTS)
- **npm** >= 9 (hoặc pnpm/yarn, ví dụ dưới đây dùng npm)

## 2. Cài đặt

```bash
# Cài dependencies
npm install
```

Nếu mạng bị ngắt kết nối (ECONNRESET), thử lại với cờ retry:

```bash
npm install --fetch-retries=5 --fetch-retry-maxtimeout=120000 --fetch-timeout=300000
```

## 3. Chạy môi trường phát triển

```bash
# Chạy dev server (chỉ máy local)
npm run dev

# Chạy dev server cho phép truy cập từ thiết bị khác trong mạng LAN
# (dùng để thử nghiệm giao diện trên điện thoại thật)
npm run dev:host
```

Dev server mặc định chạy tại: `http://localhost:5173/`

> **Lưu ý:** Website dùng `HashRouter` (đường dẫn dạng `/#/games`), nên có thể mở trực tiếp
> file tĩnh sau khi build mà không cần cấu hình rewrite phía server.

## 4. Build và xem trước bản production

```bash
# Kiểm tra lỗi TypeScript trước khi build
npm run typecheck

# Build ra thư mục dist/
npm run build

# Xem trước bản build
npm run preview
```

## 5. Các script có sẵn

| Script | Mô tả |
| --- | --- |
| `npm run dev` | Chạy dev server ở chế độ local |
| `npm run dev:host` | Chạy dev server, mở cổng ra mạng LAN (test trên điện thoại) |
| `npm run typecheck` | Kiểm tra lỗi TypeScript (không xuất file) |
| `npm run build` | Kiểm tra kiểu (`tsc -b`) rồi build production bằng Vite |
| `npm run preview` | Chạy server xem trước bản `dist/` |

## 6. Cấu trúc thư mục (tổng quan)

```
src/
├── assets/          # Tài nguyên tĩnh (nếu có)
├── components/      # Thành phần UI dùng chung
│   ├── ui/          # Button, Input, Modal, Badge, Avatar, ...
│   ├── game/        # PlayCard, GameCard, GameGrid, TurnTimer, RoomCard
│   ├── layout/      # Navbar, Footer
│   └── common/      # NoticeBanner (cảnh báo chế độ Local/Demo)
├── pages/           # Trang theo route
├── layouts/         # MainLayout, GameLayout
├── games/           # Đăng ký game + bàn chơi theo từng game
│   ├── registry.ts  # Game Registry (nguồn dữ liệu duy nhất về game)
│   └── tien-len/    # Bàn chơi Tiến Lên (UI)
├── game-engine/     # Logic game thuần, không phụ thuộc UI
│   └── tienlen/     # deck, rules, ai, engine
├── services/        # StorageService, ApiService, RealtimeService, Auth, Room, Game
├── hooks/           # useMediaQuery, useViewport
├── contexts/        # Toast, Auth, Rooms
├── types/           # Kiểu dữ liệu dùng chung
└── utils/           # constants, format, id, crypto, avatar, images, cn
```

Chi tiết kiến trúc xem tại [ARCHITECTURE.md](./ARCHITECTURE.md).

## 7. Tính năng hiện có (bản Local)

- **Trang chủ dashboard**: banner, game nổi bật / mới / phổ biến, danh mục, phòng chơi demo, hoạt động gần đây.
- **Tài khoản cục bộ**: đăng ký, đăng nhập, đăng xuất, chơi với tư cách khách, hồ sơ, đổi tên/avatar,
  lịch sử trận đấu, thống kê thắng/thua, cài đặt.
- **Phòng chơi demo**: tạo phòng công khai/riêng, danh sách phòng, mật khẩu phòng, tham gia/rời phòng.
- **Tiến Lên Miền Nam**: bàn 4 người, AI cơ bản, chọn/sắp xếp bài, đồng hồ lượt, hiệu ứng chia/đánh bài,
  bảng kết quả sau trận, chơi lại.

## 8. Giới hạn quan trọng của phiên bản hiện tại

- ⚠️ **Không có backend.** Mọi dữ liệu chỉ lưu trên thiết bị qua `LocalStorage`.
- ⚠️ Tài khoản **không phải tài khoản trực tuyến thật**, không đồng bộ giữa các thiết bị.
- ⚠️ Mật khẩu được **băm (PBKDF2)** trước khi lưu, **không lưu dạng văn bản thuần** — nhưng đây
  **không phải giải pháp xác thực an toàn để triển khai thật**.
- ⚠️ **Phòng chơi chưa kết nối nhiều người qua Internet** — chỉ là dữ liệu thử nghiệm trên thiết bị.
- ⚠️ Các tính năng nhiều người chơi trực tuyến được đánh dấu **Demo** và sẽ trả về thông báo rõ ràng
  khi cần tới backend.
- Không có chức năng thanh toán hoặc giao dịch tiền thật.

Tình trạng chi tiết xem tại [DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md).

## 9. Tài liệu dự án

| Tài liệu | Nội dung |
| --- | --- |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Kiến trúc tổng thể, phân tầng, luồng dữ liệu |
| [DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md) | Chức năng đã / chưa hoàn thành |
| [FUTURE_MOBILE_PLAN.md](./FUTURE_MOBILE_PLAN.md) | Kế hoạch đóng gói thành app Android/iOS |
| [API_PLAN.md](./API_PLAN.md) | Dự kiến API khi có backend |
| [GAME_REGISTRY.md](./GAME_REGISTRY.md) | Hướng dẫn thêm trò chơi mới |

## 10. Lộ trình phát triển

1. ✅ Giao diện tổng thể và trang chủ
2. ✅ Hệ thống tài khoản LocalStorage và hồ sơ người chơi
3. ✅ Hệ thống phòng chơi thử nghiệm
4. ✅ Bàn chơi Tiến Lên Miền Nam và AI cơ bản
5. 🔄 Hoàn thiện responsive, hiệu ứng và kiểm thử
6. 🔄 Tài liệu chuẩn bị nâng cấp ứng dụng di động (đang hoàn thiện)

## 11. Triển khai lên GitHub & Render

### 11.1. Đẩy mã nguồn lên GitHub

```bash
git init
git add .
git commit -m "Mini Game Hub: bản web đầu tiên"
git branch -M main
git remote add origin https://github.com/<tài-khoản>/<tên-repo>.git
git push -u origin main
```

### 11.2. Triển khai trên Render (Static Site)

Dự án đã kèm [render.yaml](./render.yaml) để deploy một lần bằng **Blueprint**:

1. Vào [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**.
2. Chọn repo GitHub vừa đẩy lên. Render tự đọc `render.yaml`.
3. Render build bằng `npm ci && npm run build` và phục vụ thư mục `dist/`.
4. Sau khi build xong, Render cấp một URL dạng `https://mini-game-hub.onrender.com` để chia sẻ cho bạn bè.

**Hoặc tạo thủ công** (không dùng Blueprint): **New** → **Static Site** → chọn repo → đặt
*Build Command* = `npm ci && npm run build`, *Publish Directory* = `dist`.

> Vì ứng dụng dùng `HashRouter`, các đường dẫn có dạng `/#/games` nên mọi người mở link đều vào được.

### 11.3. Lưu ý về phiên bản hiện tại

Bản deploy này là **web tĩnh, chơi cục bộ**: mỗi người mở link và chơi với AI trên máy mình.
Chưa có phòng nhiều người chơi online thật (sẽ bổ sung backend Node + Socket.IO trên Render ở giai đoạn sau).

## 12. Giấy phép

Dự án cá nhân phục vụ mục đích học tập và thử nghiệm.
