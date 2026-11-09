# Kế hoạch API — Mini Game Hub (khi có backend)

Tài liệu này mô tả **dự kiến** REST API và luồng realtime cho backend tương lai
(Node.js + Express + PostgreSQL/Prisma + Socket.IO).

> ⚠️ **Hiện tại CHƯA có backend.** `ApiService` chưa được cấu hình nên mọi lời gọi đều trả về
> thông báo `"Backend chưa được cấu hình. Ứng dụng đang chạy ở chế độ Local/Demo."`.
> Tài liệu này là **bản thiết kế** để đội phát triển triển khai sau, không phải mô tả hệ thống đang chạy.

---

## 1. Nguyên tắc

- REST cho dữ liệu bền vững (tài khoản, hồ sơ, lịch sử trận, phòng).
- Socket.IO cho trạng thái realtime (thành viên phòng, nước đi, đồng hồ lượt).
- `ApiService` là điểm nối duy nhất tới REST; `RealtimeService` là điểm nối duy nhất tới Socket.IO.
- Xác thực bằng **Bearer token** (JWT), gửi kèm qua header `Authorization`.
- Mọi phản hồi lỗi dùng cùng cấu trúc `{ error: { code, message } }`.

## 2. Cấu hình phía client (đã có sẵn)

```ts
import { api } from '@/services';
api.configure({ baseUrl: 'https://api.minigamehub.vn', enabled: true, timeoutMs: 15000 });
```

`ApiService.request<T>(path, { method, body, headers, token })` trả về
`ServiceResult<T>` = `{ ok: true, data } | { ok: false, error }`.

## 3. Dự kiến các nhóm endpoint

### 3.1. Xác thực — `/api/auth`
| Method | Endpoint | Mô tả |
| --- | --- | --- |
| POST | `/auth/register` | Đăng ký tài khoản mới |
| POST | `/auth/login` | Đăng nhập, trả về token + hồ sơ |
| POST | `/auth/guest` | Tạo phiên khách |
| POST | `/auth/logout` | Thu hồi token |
| POST | `/auth/refresh` | Làm mới token |
| POST | `/auth/change-password` | Đổi mật khẩu |

**Ví dụ — Đăng nhập**
```
POST /api/auth/login
{ "username": "player01", "password": "••••••" }

200 OK
{
  "token": "<jwt>",
  "user": {
    "id": "user_abc", "username": "player01", "displayName": "Player 01",
    "avatar": "https://cdn.../a.png", "coins": 5000,
    "stats": { "matches": 12, "wins": 7, "losses": 5, "score": 26 },
    "preferences": { "sound": true, "animations": true, "preferLandscape": false }
  }
}
```

### 3.2. Người dùng — `/api/users`
| Method | Endpoint | Mô tả |
| --- | --- | --- |
| GET | `/users/me` | Lấy hồ sơ người dùng hiện tại |
| PATCH | `/users/me` | Cập nhật `displayName` / `avatar` |
| PATCH | `/users/me/preferences` | Cập nhật tuỳ chọn |
| GET | `/users/me/matches` | Lịch sử trận (phân trang) |
| DELETE | `/users/me/matches` | Xoá lịch sử trận |
| DELETE | `/users/me` | Xoá tài khoản |

Cấu trúc `user` khớp `PublicUser` hiện tại:
```ts
interface PublicUser {
  id: string; username: string; displayName: string; avatar: string;
  coins: number; createdAt: number;
  stats: { matches: number; wins: number; losses: number; score: number };
  history: MatchRecord[];
  preferences: { sound: boolean; animations: boolean; preferLandscape: boolean };
}
```

### 3.3. Trò chơi — `/api/games`
| Method | Endpoint | Mô tả |
| --- | --- | --- |
| GET | `/games` | Danh sách game (thay thế/bổ sung Game Registry tĩnh) |
| GET | `/games/:id` | Chi tiết một game |
| POST | `/games/:id/matches` | Ghi nhận kết quả trận; server cập nhật stats + coins |

> Ghi chú: metadata game hiện được khai báo **tĩnh** trong `games/registry.ts`. Khi có backend,
> registry có thể giữ làm nguồn dự phòng và hợp nhất với dữ liệu từ `/games`.

### 3.4. Phòng chơi — `/api/rooms`
| Method | Endpoint | Mô tả |
| --- | --- | --- |
| GET | `/rooms` | Danh sách phòng (lọc `visibility`, `gameId`, `status`) |
| POST | `/rooms` | Tạo phòng |
| GET | `/rooms/:id` | Chi tiết phòng |
| POST | `/rooms/:id/join` | Tham gia (kèm `password` nếu phòng riêng) |
| POST | `/rooms/:id/leave` | Rời phòng |
| PATCH | `/rooms/:id` | Đổi trạng thái / cấu hình phòng |
| DELETE | `/rooms/:id` | Xoá phòng (chủ phòng) |

**Ví dụ — Tạo phòng**
```
POST /api/rooms
{ "name": "Bàn Cao Thủ", "gameId": "tien-len", "visibility": "private",
  "maxPlayers": 4, "password": "1234" }

201 Created
{ "id": "room_xyz", "name": "Bàn Cao Thủ", "gameId": "tien-len",
  "gameName": "Tiến Lên Miền Nam", "visibility": "private", "status": "waiting",
  "maxPlayers": 4, "players": [ { "id": "user_abc", "name": "Player 01", "isHost": true, "isBot": false } ],
  "hostName": "Player 01", "createdAt": 1730000000000 }
```
> ⚠️ Trường `password` **không bao giờ** được trả về trong response. Việc kiểm tra mật khẩu
> do server thực hiện (băm và so sánh), client chỉ gửi mật khẩu khi join.

### 3.5. Trận đấu / Multiplayer — `/api/matches`
| Method | Endpoint | Mô tả |
| --- | --- | --- |
| POST | `/matches` | Tạo bàn chơi trực tuyến từ phòng |
| GET | `/matches/:id` | Trạng thái bàn chơi hiện tại |
| POST | `/matches/:id/actions` | Gửi nước đi (đánh bài / bỏ lượt) |

> Với game nhiều người, **server là nguồn chân lý** (authoritative). Client gửi ý định,
> server áp dụng cùng bộ luật trong `game-engine/tienlen` và phát lại kết quả cho mọi người.

## 4. Sự kiện Realtime (Socket.IO)

`RealtimeClient` (đã có interface) sẽ được hiện thực bởi `SocketIORealtimeClient`.
Khi có backend: `createRealtimeClient('socketio')` và `connect(url, token)`.

### 4.1. Client → Server
| Sự kiện | Payload | Mô tả |
| --- | --- | --- |
| `room:join` | `{ roomId }` | Vào phòng |
| `room:leave` | `{ roomId }` | Rời phòng |
| `room:ready` | `{ roomId, ready }` | Sẵn sàng |
| `match:play` | `{ matchId, cardIds }` | Gửi nước đánh bài |
| `match:pass` | `{ matchId }` | Bỏ lượt |
| `chat:send` | `{ roomId, text }` | Tin nhắn phòng |

### 4.2. Server → Client
| Sự kiện | Payload | Mô tả |
| --- | --- | --- |
| `room:updated` | `Room` | Danh sách người chơi thay đổi |
| `room:closed` | `{ roomId }` | Phòng đóng |
| `match:started` | `{ matchId, players }` | Bắt đầu ván |
| `match:state` | `TienLenState` (ẩn bài người khác) | Trạng thái mới sau mỗi nước |
| `match:turn` | `{ seat, deadline }` | Thông báo lượt + hạn chót |
| `match:ended` | `{ finishOrder, matchId }` | Kết thúc ván |
| `chat:message` | `{ from, text, at }` | Tin nhắn mới |

> **Bảo mật:** server chỉ gửi cho mỗi client phần bài của chính họ; bài người khác chỉ gửi số lượng.
> `TienLenState` phía client vì vậy khác với state đầy đủ trên server.

## 5. Ánh xạ từ service cục bộ sang API

| Service hiện tại (Local) | Sẽ gọi API |
| --- | --- |
| `authService.register/login/loginAsGuest` | `POST /auth/*` |
| `authService.updateProfile/updatePreferences` | `PATCH /users/me*` |
| `authService.recordMatch` | `POST /games/:id/matches` |
| `authService.changePassword` | `POST /auth/change-password` |
| `roomService.listRooms/createRoom/joinRoom` | `GET/POST /rooms*` |
| `gameService.completeMatch` | `POST /games/:id/matches` |
| `gameService.joinOnlineMatch` | `POST /matches` + Socket.IO |
| `activityService` | Có thể giữ cục bộ hoặc `GET /users/me/activity` |

## 6. Mô hình dữ liệu PostgreSQL (Prisma — dự kiến)

```prisma
model User {
  id           String   @id @default(cuid())
  username     String   @unique
  displayName  String
  avatar       String?
  passwordHash String
  coins        Int      @default(5000)
  isGuest      Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  stats        Stats?
  matches      MatchRecord[]
  hostedRooms  Room[]   @relation("RoomHost")
}

model Stats {
  userId  String @id
  user    User   @relation(fields: [userId], references: [id])
  matches Int    @default(0)
  wins    Int    @default(0)
  losses  Int    @default(0)
  score   Int    @default(0)
}

model MatchRecord {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  gameId      String
  gameName    String
  placement   Int
  totalPlayers Int
  win         Boolean
  score       Int
  durationMs  Int?
  createdAt   DateTime @default(now())
}

model Room {
  id         String   @id @default(cuid())
  name       String
  gameId     String
  gameName   String
  visibility String   // public | private
  status     String   // waiting | playing | closed
  maxPlayers Int
  passwordHash String?
  hostId     String
  host       User     @relation("RoomHost", fields: [hostId], references: [id])
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

## 7. Bảo mật cần lưu ý khi triển khai thật

- Băm mật khẩu bằng **bcrypt/argon2** ở phía server (PBKDF2 phía client chỉ là biện pháp tạm cho bản Local).
- Dùng HTTPS bắt buộc; JWT có thời hạn ngắn + refresh token.
- Rate limiting cho `/auth/*`, `/rooms` và hành động trong trận.
- Kiểm tra quyền: chỉ chủ phòng xoá phòng; chỉ người trong ván gửi nước đi.
- **Không** trả về `passwordHash`/`passwordSalt` trong bất kỳ response nào.

## 8. Lộ trình triển khai backend (đề xuất)

1. Dựng Express + Prisma + PostgreSQL, hiện thực `/auth` và `/users/me`.
2. Hiện thực `/games` và ghi nhận kết quả trận.
3. Hiện thực `/rooms` + Socket.IO cho phòng chơi.
4. Hiện thực `/matches` với server authoritative, dùng lại bộ luật trong `game-engine/tienlen`.
5. Chuyển client: `api.configure(...)`, `createRealtimeClient('socketio')`, thay `AuthService`/`RoomService`
   sang gọi API (UI không đổi).
