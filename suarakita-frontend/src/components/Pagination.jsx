import { ChevronLeft, ChevronRight } from 'lucide-react';
export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;
  return <div className="pagination"><button className="button button-secondary button-small" disabled={page <= 1} onClick={() => onChange(page - 1)}><ChevronLeft size={16} /> Sebelumnya</button><span>Halaman <strong>{page}</strong> dari {totalPages}</span><button className="button button-secondary button-small" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Berikutnya <ChevronRight size={16} /></button></div>;
}
