import { ArrowUpRight, CalendarDays, Heart, MapPin, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { photoUrl } from '../api/client';
import { categoryName, formatDate, priorityScore, reportTitle } from '../utils/format';
import { PriorityBadge, StatusBadge, UrgencyBadge } from './StatusBadge';

export default function ReportCard({ report, user, onSupport, supportBusy }) {
  const canSupport = user?.role === 'warga' && report.user_id !== user.id && !['selesai', 'ditolak'].includes(report.status);
  return <article className="report-card">
    <Link to={`/reports/${report.id}`} className="report-image-link" aria-label={`Lihat ${reportTitle(report)}`}>
      <img className="report-image" src={photoUrl(report.id)} alt="Foto kondisi yang dilaporkan" loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.parentElement.classList.add('image-fallback'); }} />
      <span className="image-fallback-label">SuaraKita</span>
    </Link>
    <div className="report-card-content">
      <div className="report-meta"><span className="category-label">{categoryName(report)}</span><span className="meta-dot">•</span><span><CalendarDays size={13} /> {formatDate(report.created_at)}</span></div>
      <Link to={`/reports/${report.id}`} className="report-title-link"><h3>{reportTitle(report)}</h3></Link>
      <p className="report-description">{report.description}</p>
      <div className="report-location"><MapPin size={15} /><span>{report.location_name || 'Lokasi belum ditentukan'}</span></div>
      <div className="badge-row"><StatusBadge status={report.status} /><UrgencyBadge urgency={report.urgency} /><PriorityBadge score={priorityScore(report)} /></div>
      <div className="report-card-footer">
        <div className="support-count"><Heart size={16} /><strong>{report.support_count || 0}</strong><span>dukungan</span></div>
        <div className="report-actions">
          {canSupport && <button className="button button-support" onClick={() => onSupport(report)} disabled={supportBusy === report.id}><Heart size={15} />{supportBusy === report.id ? 'Memproses' : 'Dukung'}</button>}
          <Link className="icon-link" to={`/reports/${report.id}`} aria-label="Buka detail"><ArrowUpRight size={18} /></Link>
        </div>
      </div>
    </div>
  </article>;
}
