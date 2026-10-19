export const STATUS_LABELS = {
  diajukan: 'Diajukan', diverifikasi: 'Diverifikasi', diproses: 'Sedang diproses', selesai: 'Selesai', ditolak: 'Ditolak',
};
export const URGENCY_LABELS = { rendah: 'Rendah', sedang: 'Sedang', tinggi: 'Tinggi', kritis: 'Kritis' };
export const STATUS_ORDER = ['diajukan', 'diverifikasi', 'diproses', 'selesai', 'ditolak'];
export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}
export function normalizeList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}
export function reportTitle(report) { return report?.title || 'Laporan tanpa judul'; }
export function categoryName(report) { return report?.category_name || report?.category || 'Kategori lain'; }
export function priorityScore(report) {
  const value = Number(report?.priority_score);
  return Number.isFinite(value) ? value : 0;
}
