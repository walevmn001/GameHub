/**
 * Conservative bankroll needed for one Tiến Lên match.
 * Includes base loss (also covers white-win settlement), the maximum possible
 * thối penalty and an upper bound for cut liabilities across all cards.
 */
export function getRequiredTienLenCoins(input?: Partial<TienLenConfig> | null, playersCount = 4): number {
  const config = normalizeConfig(input);
  const baseBet = config.baseBet;
  const players = Math.max(2, Math.min(4, Math.floor(playersCount)));

  // Winner-takes-all can charge one base bet per opponent; this also safely
  // covers the base settlement for white-win outcomes and top-two payouts.
  const baseLossUnits = players - 1;

  // Upper bound: all four single twos, both pairs of twos, and up to 13 bomb
  // targets (52 cards / minimum 4 cards per cuttable bomb).
  const maxBombRate = Math.max(
    config.cutRates.triplePairs,
    config.cutRates.fourOfKind,
    config.cutRates.quadPairs,
  );
  const cutLossUnits =
    2 * config.cutRates.blackTwo +
    2 * config.cutRates.redTwo +
    2 * config.cutRates.pairTwo +
    13 * maxBombRate;

  // Safe penalty bound for the largest feasible leftovers: twos, four-of-a-kind
  // and a consecutive-pairs bomb. These terms intentionally err on the safe side.
  const thoiLossUnits = config.enableThoiPenalty
    ? 2 * config.cutRates.pairTwo +
      Math.max(config.cutRates.blackTwo, config.cutRates.redTwo) +
      3 * config.cutRates.fourOfKind +
      Math.max(config.cutRates.triplePairs, config.cutRates.quadPairs)
    : 0;

  return baseBet * (baseLossUnits + cutLossUnits + thoiLossUnits);
}

/** Chuẩn hoá cấu hình: đảm bảo luôn hợp lệ và đủ trường.
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
