# Kế hoạch nâng cấp thành ứng dụng Android / iOS

Website hiện tại đã được thiết kế **Cross-platform Ready** để có thể đóng gói thành ứng dụng di động
bằng **Capacitor** mà không cần viết lại giao diện hay logic game. Tài liệu này mô tả các bước,
điểm cần lưu ý và các thay đổi cần chuẩn bị.

> Giai đoạn hiện tại **chưa** triển khai đóng gói. Đây là kế hoạch cho giai đoạn tiếp theo.

---

## 1. Vì sao chọn Capacitor

- Đóng gói trực tiếp từ `dist/` của Vite — tận dụng toàn bộ mã web hiện có.
- Tách biệt rõ ràng: web là nguồn duy nhất, native chỉ là "vỏ" WebView + plugin.
- Hỗ trợ cả Android và iOS từ một codebase.
- Truy cập API thiết bị (lưu trữ, mạng, vòng đời app, chia sẻ) qua plugin.

## 2. Điểm đã sẵn sàng trong mã nguồn

| Yêu cầu | Đã chuẩn bị ở đâu |
| --- | --- |
| Routing thân thiện WebView | `HashRouter` trong `main.tsx` |
| Không phụ thuộc API trình duyệt trong logic game | `game-engine/` thuần túy, không DOM |
| Lưu trữ trừu tượng (đổi sang plugin native dễ dàng) | `KeyValueStore` + `StorageService` |
| Lớp gọi mạng riêng | `ApiService` |
| Kết nối realtime độc lập thư viện | `RealtimeClient` + `RealtimeService` |
| Safe-area cho thiết bị tai thỏ | `env(safe-area-inset-*)` trong `index.css` |
| Chế độ ngang cho bàn chơi | `LandscapeFrame` (xoay bằng CSS transform) |
| Tài nguyên tĩnh không phụ thuộc server rewrite | Build ra `dist/`, dùng hash route |

## 3. Các bước đóng gói với Capacitor

### 3.1. Cài đặt
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios
```

### 3.2. Khởi tạo Capacitor
```bash
npx cap init "Mini Game Hub" com.minigamehub.app --web-dir=dist
```

### 3.3. Thêm nền tảng
```bash
npm run build
npx cap add android
npx cap add ios   # cần macOS + Xcode
```

### 3.4. Đồng bộ sau mỗi lần build web
```bash
npm run build && npx cap sync
npx cap open android   # mở Android Studio
npx cap open ios       # mở Xcode
```

## 4. Thay đổi cần thực hiện trong mã nguồn

### 4.1. Lưu trữ: LocalStorage → plugin native (tuỳ chọn)
WebView thường lưu LocalStorage bền vững, nhưng để an toàn dữ liệu hơn có thể chuyển sang
`@capacitor/preferences` bằng cách viết một `KeyValueStore` mới:

```ts
import { Preferences } from '@capacitor/preferences';
import type { KeyValueStore } from '@/services/StorageService';

export class CapacitorStore implements KeyValueStore {
  readonly kind = 'local' as const;
  get<T>(key: string) { return Preferences.get({ key }).then(r => r.value ? JSON.parse(r.value) as T : null); }
  set<T>(key: string, value: T) { return Preferences.set({ key, value: JSON.stringify(value) }); }
  remove(key: string) { return Preferences.remove({ key }); }
  keys() { return Preferences.keys().then(r => r.keys); }
  clear() { return Preferences.clear(); }
}
```

Sau đó chỉ cần một dòng khi khởi động app:

```ts
storage.useStore(new CapacitorStore());
```

> `StorageService` đã có sẵn `useStore()` chính là để phục vụ việc hoán đổi này.

### 4.2. Phát hiện môi trường native
Thêm một tiện ích nhỏ để giao diện biết đang chạy trong app hay trên web (ví dụ để chỉ hiện
hướng dẫn "chuyển ngang" trên mobile native):

```ts
import { Capacitor } from '@capacitor/core';
export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform(); // 'android' | 'ios' | 'web'
```

### 4.3. Cấu hình hiển thị
Trong `capacitor.config.ts`:
- Đặt `backgroundColor` trùng màu nền dark (`#070b16`) để tránh nháy trắng khi khởi động.
- Cấu hình `StatusBar` / `SafeArea` để tôn trọng vùng an toàn.
- Bật khoá/mở khoá chiều xoay màn hình cho bàn chơi.

### 4.4. Icon & Splash
Dùng `@capacitor/assets` để sinh icon và splash từ một ảnh nguồn cho cả Android và iOS.

## 5. Khi nào cần backend (xem thêm API_PLAN.md)

Multiplayer thật và đồng bộ tài khoản cần backend:
- **Node.js + Express** cho REST API.
- **Socket.IO** cho realtime.
- **PostgreSQL + Prisma** cho dữ liệu trực tuyến.

Khi đó `ApiService.configure({ baseUrl, enabled: true })` và chuyển `createRealtimeClient('socketio')`.
UI và engine không phải sửa vì đã đi qua lớp trừu tượng.

## 6. Kiểm thử trên thiết bị

- **Android**: chạy qua Android Studio (emulator hoặc máy thật qua USB).
- **iOS**: cần macOS + Xcode.
- Kiểm tra: vùng safe-area, chế độ ngang của bàn chơi, hiệu ứng chuyển động, hành vi khi
  app bị đưa xuống nền rồi mở lại.

## 7. Lộ trình đề xuất

1. Bổ sung tiện ích phát hiện môi trường (`isNative`, `platform`).
2. Thêm `CapacitorStore` và gọi `storage.useStore()` khi chạy native.
3. `cap add android` + build thử APK nội bộ.
4. Tinh chỉnh StatusBar / SafeArea / Splash / Icon.
5. `cap add ios` khi có môi trường macOS.
6. Kết nối backend (REST + Socket.IO) và đồng bộ tài khoản/phòng chơi/lịch sử.

## 8. Lưu ý quan trọng

- Ứng dụng native **không** tự động tạo backend. Multiplayer và đồng bộ vẫn cần máy chủ thật.
- Không lưu token/mật khẩu dạng văn bản thuần; ở môi trường native nên dùng
  `@capacitor/preferences` kết hợp mã hoá hoặc secure storage khi cần.
- Giữ nguyên nguyên tắc: chức năng chưa có backend phải được dán nhãn **Demo/Local**.
