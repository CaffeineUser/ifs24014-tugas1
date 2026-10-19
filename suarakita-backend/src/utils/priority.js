export const URGENCY_VALUES = Object.freeze({ rendah: 25, sedang: 50, tinggi: 75, kritis: 100 });

export function calculatePriorityScore(urgency, supportCount) {
  const U = URGENCY_VALUES[urgency];
  if (U === undefined) throw new Error('Tingkat urgensi tidak valid.');
  const D = Math.min(100, Math.max(0, Number(supportCount) || 0) / 20 * 100);
  return Math.round(((0.6 * U) + (0.4 * D)) * 100) / 100;
}
