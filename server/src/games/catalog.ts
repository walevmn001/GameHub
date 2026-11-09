/** Danh mục game phía server (giữ tối thiểu metadata cần cho nghiệp vụ phòng). */

export interface GameCatalogEntry {
  id: string;
  name: string;
  minPlayers: number;
  maxPlayers: number;
}

export const GAME_CATALOG: Record<string, GameCatalogEntry> = {
  'tien-len': { id: 'tien-len', name: 'Tiến Lên Miền Nam', minPlayers: 2, maxPlayers: 4 },
};

export function getGameEntry(id: string): GameCatalogEntry | undefined {
  return GAME_CATALOG[id];
}

export function gameNameOf(id: string): string {
  return GAME_CATALOG[id]?.name ?? id;
}
