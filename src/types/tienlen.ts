/**
 * Kiểu dữ liệu cho trò chơi Tiến Lên Miền Nam.
 *
 * Toàn bộ luật/cấu hình được khai báo ở đây để tầng UI và game-engine dùng chung.
 * Khi có backend, cấu hình này sẽ được server gửi xuống cho từng bàn chơi.
 */

/** Độ khó của AI cục bộ. */
export type AiDifficulty = 'easy' | 'medium' | 'hard';

/** Cách chia tiền thắng thua cuối ván. */
export type PayoutMode = 'winner-takes-all' | 'top-two';

/** Chế độ chơi: tự do hoặc giới hạn số ván. */
export type TienLenRounds = number | 'free';

/**
 * Mức phạt/chặt tính theo "số lần mức cược cơ bản".
 * Ví dụ cược 1.000 xu, chặt heo đen = 2 lần → 2.000 xu.
 */
export interface CutRates {
  blackTwo: number;
  redTwo: number;
  pairTwo: number;
  triplePairs: number;
  fourOfKind: number;
  quadPairs: number;
}

/**
 * Cấu hình một bàn Tiến Lên.
 * Đây là nguồn chân lý duy nhất cho luật và cách tính tiền của bàn chơi.
 */
export interface TienLenConfig {
  /** Mức cược cơ bản (xu thử nghiệm). */
  baseBet: number;
  /** Số người tối thiểu để bắt đầu. */
  minPlayers: number;
  /** Số người tối đa của bàn. */
  maxPlayers: number;
  /** Thời gian mỗi lượt (ms): 10000 | 15000 | 20000 | 30000. */
  turnMs: number;
  /** Số ván tối đa hoặc chơi tự do. */
  rounds: TienLenRounds;
  /** Độ khó AI cục bộ. */
  aiDifficulty: AiDifficulty;
  /** "Nhất ăn tất" hoặc "Nhất và Nhì ăn". */
  payoutMode: PayoutMode;
  /** Bật/tắt luật Ăn trắng. */
  enableWhiteWin: boolean;
  /** Bật/tắt phạt Thối (bét còn bài). */
  enableThoiPenalty: boolean;
  /** Bật/tắt chặt cộng dồn (người bị chặt cuối chịu toàn bộ tổng). */
  enableStackedCut: boolean;
  /** Tỉ lệ ăn của Nhất/Nhì khi dùng chế độ "Nhất và Nhì ăn". */
  winnerShares: { first: number; second: number };
  /** Tỉ lệ mất của Ba/Bét khi dùng chế độ "Nhất và Nhì ăn". */
  loserShares: { third: number; last: number };
  /** Mức chặt/thối theo số lần cược. */
  cutRates: CutRates;
  /** Ăn trắng: 6 đôi bất kỳ (tùy cấu hình). */
  whiteWinSixPairs: boolean;
  /** Ăn trắng: 3 heo + 1 sảnh 3 lá (tùy cấu hình). */
  whiteWinThreeTwos: boolean;
}

export const BET_OPTIONS = [100, 500, 1000, 5000] as const;
export const TURN_TIME_OPTIONS = [10000, 15000, 20000, 30000] as const;
export const ROUNDS_OPTIONS: TienLenRounds[] = ['free', 1, 3, 5, 10];

export const AI_DIFFICULTY_LABEL: Record<AiDifficulty, string> = {
  easy: 'Dễ',
  medium: 'Trung bình',
  hard: 'Khó',
};

export const PAYOUT_MODE_LABEL: Record<PayoutMode, string> = {
  'winner-takes-all': 'Nhất ăn tất',
  'top-two': 'Nhất và Nhì ăn',
};

export const DEFAULT_TIEN_LEN_CONFIG: TienLenConfig = {
  baseBet: 500,
  minPlayers: 2,
  maxPlayers: 4,
  turnMs: 20000,
  rounds: 'free',
  aiDifficulty: 'medium',
  payoutMode: 'winner-takes-all',
  enableWhiteWin: true,
  enableThoiPenalty: true,
  enableStackedCut: true,
  winnerShares: { first: 0.7, second: 0.3 },
  loserShares: { third: 0.4, last: 0.6 },
  cutRates: {
    blackTwo: 2,
    redTwo: 4,
    pairTwo: 4,
    triplePairs: 12,
    fourOfKind: 12,
    quadPairs: 16,
  },
  whiteWinSixPairs: true,
  whiteWinThreeTwos: true,
};

/**
 * Chuẩn hoá cấu hình: đảm bảo luôn hợp lệ và đủ trường.
 * Dùng khi đọc cấu hình cũ từ LocalStorage hoặc từ phòng chơi.
 */
export function normalizeConfig(input?: Partial<TienLenConfig> | null): TienLenConfig {
  if (!input) return { ...DEFAULT_TIEN_LEN_CONFIG, cutRates: { ...DEFAULT_TIEN_LEN_CONFIG.cutRates } };
  return {
    ...DEFAULT_TIEN_LEN_CONFIG,
    ...input,
    minPlayers: 2,
    maxPlayers: 4,
    winnerShares: { ...DEFAULT_TIEN_LEN_CONFIG.winnerShares, ...input.winnerShares },
    loserShares: { ...DEFAULT_TIEN_LEN_CONFIG.loserShares, ...input.loserShares },
    cutRates: { ...DEFAULT_TIEN_LEN_CONFIG.cutRates, ...input.cutRates },
  };
}

/** Cấu hình có phải bàn chuẩn 4 người không (cân bằng nhất). */
export function isStandardTable(config: TienLenConfig, seats: number): boolean {
  return config.maxPlayers === 4 && seats === 4;
}

/** Mô tả ngắn gọn cấu hình để hiển thị trong phòng chờ. */
export function summarizeConfig(config: TienLenConfig): string {
  const parts = [
    `Cược ${config.baseBet.toLocaleString('vi-VN')} xu`,
    `Lượt ${config.turnMs / 1000}s`,
    PAYOUT_MODE_LABEL[config.payoutMode],
  ];
  if (config.enableWhiteWin) parts.push('Ăn trắng');
  if (config.enableThoiPenalty) parts.push('Phạt thối');
  if (config.enableStackedCut) parts.push('Chặt cộng dồn');
  return parts.join(' · ');
}
