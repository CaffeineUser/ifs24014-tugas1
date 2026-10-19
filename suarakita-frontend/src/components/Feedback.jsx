import { AlertCircle, Inbox, LoaderCircle, RefreshCw } from 'lucide-react';

export function Loading({ label = 'Memuat data...' }) {
  return <div className="feedback"><LoaderCircle className="spin" size={24} /><span>{label}</span></div>;
}
export function EmptyState({ title = 'Belum ada data', description = 'Coba ubah filter atau periksa kembali nanti.' }) {
  return <div className="feedback feedback-box"><span className="feedback-icon"><Inbox size={23} /></span><strong>{title}</strong><span>{description}</span></div>;
}
export function ErrorState({ message, onRetry }) {
  return <div className="feedback feedback-box error-box"><span className="feedback-icon"><AlertCircle size={23} /></span><strong>Data gagal dimuat</strong><span>{message || 'Terjadi kesalahan saat memuat data.'}</span>{onRetry && <button className="button button-secondary button-small" onClick={onRetry}><RefreshCw size={15} /> Coba lagi</button>}</div>;
}
export function InlineAlert({ children, tone = 'error' }) {
  return <div role="alert" className={`inline-alert alert-${tone}`}>{children}</div>;
}
