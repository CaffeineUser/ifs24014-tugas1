import { STATUS_LABELS, URGENCY_LABELS } from '../utils/format';

export function StatusBadge({ status }) {
  return <span className={`badge status-${status || 'unknown'}`}>{STATUS_LABELS[status] || status || 'Tidak diketahui'}</span>;
}
export function UrgencyBadge({ urgency }) {
  return <span className={`badge urgency-${urgency || 'sedang'}`}>{URGENCY_LABELS[urgency] || urgency || 'Sedang'}</span>;
}
export function PriorityBadge({ score }) {
  const value = Number(score || 0);
  const level = value >= 70 ? 'priority-high' : value >= 45 ? 'priority-medium' : 'priority-low';
  const label = value >= 70 ? 'Prioritas tinggi' : value >= 45 ? 'Prioritas sedang' : 'Prioritas rendah';
  return <span className={`badge ${level}`}><span className="priority-dot" />{label} <strong>{value.toFixed(1)}</strong></span>;
}
