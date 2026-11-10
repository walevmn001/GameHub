export { storage, LocalStorageStore, MemoryStore } from './StorageService';
export type { KeyValueStore } from './StorageService';
export { api } from './ApiService';
export type { ApiConfig, RequestOptions } from './ApiService';
export {
  localRealtime,
  createRealtimeClient,
  LocalRealtimeClient,
  SocketIORealtimeClient,
} from './RealtimeService';
export type { RealtimeClient, RealtimeStatus, Unsubscribe } from './RealtimeService';
export { authService } from './AuthService';
export { roomService } from './RoomService';
export { activityService } from './ActivityService';
export type { ActivityEntry, ActivityType } from './ActivityService';
export { gameService } from './GameService';
export type { CompleteMatchInput } from './GameService';
export { socialService } from './SocialService';
export { adminService } from './AdminService';
export { socketService } from './SocketService';
