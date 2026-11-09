# Trạng thái phát triển — Mini Game Hub

Cập nhật theo 6 giai đoạn trong yêu cầu dự án. Trạng thái: ✅ Hoàn thành · 🔄 Đang làm · ⬜ Chưa bắt đầu.

> **Phiên bản:** 0.1.0 (bản web, chạy cục bộ)
> **Kiểm tra chất lượng:** `npm run typecheck` ✅ · `npm run build` ✅

---

## 1. Giai đoạn 1 — Giao diện tổng thể và Trang chủ ✅

| Hạng mục | Trạng thái | Ghi chú |
| --- | --- | --- |
| Cấu hình React + Vite + TS + Tailwind | ✅ | Strict mode, alias `@/*` |
| Theme Dark Mode mặc định | ✅ | Nền xanh đen/đen than, nhấn tím neon + cyan |
| Logo + Navbar + Footer | ✅ | Navbar có dropdown người dùng và menu di động |
| Trang chủ dashboard | ✅ | Banner, game nổi bật/mới/phổ biến, phòng demo, hoạt động gần đây |
| Danh sách game + lọc/tìm kiếm | ✅ | Trang `/games` với SegmentedControl |
| Danh mục game | ✅ | Bài lá, Chiến thuật, Giải trí, Đối kháng, Nhiều người chơi |
| Hiển thị avatar, tên, số xu | ✅ | Khi đã đăng nhập; nút đăng nhập/đăng ký khi chưa |
| Trang 404 | ✅ | `NotFoundPage` |

## 2. Giai đoạn 2 — Tài khoản LocalStorage và Hồ sơ ✅

| Hạng mục | Trạng thái | Ghi chú |
| --- | --- | --- |
| Đăng ký tài khoản | ✅ | Kiểm tra định dạng username, độ dài mật khẩu |
| Đăng nhập / Đăng xuất | ✅ | `AuthContext` + `authService` |
| Chơi với tư cách khách | ✅ | Nút "Chơi ngay với tư cách khách" |
| Hồ sơ cá nhân | ✅ | Trang `/profile` |
| Đổi tên hiển thị & Avatar | ✅ | Modal chỉnh sửa, chọn avatar có sẵn + sinh tự động |
| Lịch sử chơi thử | ✅ | Lưu tối đa 50 trận gần nhất |
| Thống kê thắng/thua | ✅ | Số trận, thắng, thua, điểm, số xu |
| Cài đặt tài khoản | ✅ | Trang `/settings`: âm thanh, hiệu ứng, ưu tiên ngang, đổi mật khẩu |
| Băm mật khẩu (không lưu plaintext) | ✅ | PBKDF2 SHA-256, 100.000 vòng |
| Cảnh báo tài khoản chỉ lưu trên thiết bị | ✅ | `NoticeBanner` ở trang đăng nhập/đăng ký/cài đặt |
| Xoá dữ liệu thiết bị | ✅ | Vùng nguy hiểm trong `/settings` |

## 3. Giai đoạn 3 — Hệ thống phòng chơi thử nghiệm ✅

| Hạng mục | Trạng thái | Ghi chú |
| --- | --- | --- |
| Tạo phòng | ✅ | Modal: tên, game, số người, công khai/riêng, mật khẩu |
| Danh sách phòng | ✅ | Trang `/rooms` |
| Phòng công khai / riêng | ✅ | Lọc `all / public / private / mine` |
| Số lượng người chơi | ✅ | Hiển thị `đang có / tối đa` |
| Trạng thái phòng | ✅ | `waiting` / `playing` / `closed` |
| Mật khẩu phòng | ✅ | Yêu cầu nhập khi vào phòng riêng |
| Nút tham gia phòng | ✅ | Có kiểm tra sức chứa và mật khẩu |
| Trang phòng chờ (lobby) | ✅ | `/rooms/:roomId` — danh sách thành viên, ghế trống, chủ phòng bắt đầu ván |
| Ràng buộc số người theo trò chơi | ✅ | `minPlayers`/`maxPlayers` trong `GameMeta`; chặn bắt đầu khi chưa đủ người |
| Thêm / xoá người máy trong phòng | ✅ | Chủ phòng chủ động thêm AI vào ghế trống rồi mới bắt đầu |
| Phòng demo toàn AI | ✅ | Người thật vào đầu tiên tự trở thành chủ phòng |
| Dữ liệu mẫu khi khởi tạo | ✅ | 3 phòng demo (Bàn Cao Thủ, Sới Vui Vẻ, Phòng Tân Binh) |
| Cảnh báo phòng chỉ tồn tại cục bộ | ✅ | `LOCAL_NOTE` hiển thị trên giao diện |

> ⚠️ Phòng chơi **chưa kết nối nhiều người qua Internet**. Đây là mô phỏng dữ liệu trên thiết bị.

## 4. Giai đoạn 4 — Bàn chơi Tiến Lên Miền Nam và AI cơ bản ✅

| Hạng mục | Trạng thái | Ghi chú |
| --- | --- | --- |
| Bộ bài 52 lá, chia bài, xác định người đi trước | ✅ | `deck.ts` (người giữ 3♠ đi trước) |
| Luật tổ hợp bài | ✅ | Đơn/đôi/sám/tứ quý/sảnh/đôi thông |
| Luật chặt | ✅ | Tứ quý chặt Heo; đôi thông chặt Heo |
| Bàn chơi 4 người | ✅ | Người chơi + 3 đối thủ AI |
| Khu vực bài người chơi + 3 đối thủ | ✅ | `PlayerHand` + `SeatPanel` |
| Avatar từng người | ✅ | Sinh SVG tự động, hoạt động offline |
| Thứ tự lượt | ✅ | `engine` xử lý vòng và bỏ lượt |
| Đồng hồ lượt chơi | ✅ | 20 giây/lượt, vòng cung SVG (`TurnTimer`) |
| Nút Đánh bài / Bỏ lượt / Sắp xếp / Gợi ý | ✅ | Có kiểm tra hợp lệ trước khi cho đánh |
| Hiệu ứng chia bài / đánh bài | ✅ | Animation Tailwind (`deal-card`, `play-card`) |
| Hiệu ứng thắng / thua | ✅ | `ResultModal` đổi màu theo kết quả |
| Bảng kết quả sau trận + Chơi lại + Về trang chủ | ✅ | `ResultModal` |
| Chế độ ngang trên điện thoại | ✅ | `LandscapeFrame` (xoay 90° bằng CSS transform) |
| AI cơ bản | ✅ | `ai.ts` chọn tổ hợp đè nhỏ nhất / bỏ lượt hợp lý |
| Ghi nhận kết quả vào hồ sơ | ✅ | Cập nhật lịch sử, thống kê, xu |

> ⚠️ Đối thủ là **AI cục bộ**, không phải người chơi trực tuyến thật.

## 5. Giai đoạn 5 — Responsive, hiệu ứng và kiểm thử 🔄

| Hạng mục | Trạng thái | Ghi chú |
| --- | --- | --- |
| Responsive mobile / tablet / desktop | ✅ | Kiểm tra qua breakpoints Tailwind |
| Hỗ trợ safe-area (tai thỏ) | ✅ | `env(safe-area-inset-*)` trong `index.css` |
| Hiệu ứng chuyển động nhẹ, mượt | ✅ | Keyframes trong Tailwind config |
| Tôn trọng `prefers-reduced-motion` | ✅ | Đã bật |
| Điều hướng di động (menu thu gọn) | ✅ | Navbar mobile menu |
| Kiểm tra lỗi TypeScript | ✅ | `npm run typecheck` — pass |
| Build production | ✅ | `npm run build` — pass, có code splitting |
| Chạy thử dev server xác minh HTTP 200 | ✅ | Đã xác minh hoạt động |
| Kiểm thử tự động (unit test) | ⬜ | Chưa bổ sung test framework |

## 6. Giai đoạn 6 — Tài liệu chuẩn bị nâng cấp di động 🔄

| Tài liệu | Trạng thái |
| --- | --- |
| README.md (hướng dẫn chạy) | ✅ |
| ARCHITECTURE.md (kiến trúc) | ✅ |
| DEVELOPMENT_STATUS.md (tài liệu này) | ✅ |
| FUTURE_MOBILE_PLAN.md (kế hoạch Android/iOS) | ✅ |
| API_PLAN.md (dự kiến API backend) | ✅ |
| GAME_REGISTRY.md (thêm game mới) | ✅ |
| Cấu hình Capacitor thực tế | ⬜ (theo kế hoạch, chưa triển khai) |

---

## 7. Tổng hợp: Đã có / Chưa có

### ✅ Đã có (chạy thật trong phạm vi Local)
- Toàn bộ giao diện dark mode hiện đại, responsive.
- Hệ thống tài khoản cục bộ đầy đủ (đăng ký/đăng nhập/khách/hồ sơ/cài đặt).
- Ghi nhận lịch sử trận đấu, thống kê thắng/thua, số xu thử nghiệm.
- Hệ thống phòng chơi demo (tạo/danh sách/tham gia/mật khẩu).
- Game Tiến Lên Miền Nam với AI cơ bản và đầy đủ hiệu ứng.
- Lớp trừu tượng sẵn sàng nâng cấp: `StorageService`, `ApiService`, `RealtimeService`.
- Game Registry để thêm game mới không phải sửa trang chủ.

### ⬜ Chưa có (cần backend hoặc giai đoạn sau)
- Backend Node.js + Express, cơ sở dữ liệu PostgreSQL + Prisma.
- Xác thực thật, đồng bộ tài khoản giữa các thiết bị.
- Multiplayer realtime qua Socket.IO.
- Phòng chơi trực tuyến thật (nhiều người, cùng một ván).
- Các game khác: Phỏm, Xì Dách, Mậu Binh, Cờ Caro, Xếp Hình 2048.
- Đóng gói APK/IPA bằng Capacitor.
- Kiểm thử tự động, CI/CD.
- Thanh toán/giao dịch thật (**không nằm trong phạm vi dự án**).

## 8. Ghi chú minh bạch

Mọi tính năng chưa có máy chủ đều được dán nhãn **Demo** hoặc **Local** ngay trên giao diện.
Không có chức năng nào được tuyên bố "hoàn thành" dựa trên dữ liệu giả. Các nút không có chức năng
thật đều đã được loại bỏ hoặc thay bằng thông báo rõ ràng.
