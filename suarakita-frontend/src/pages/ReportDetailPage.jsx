import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, Check, Clock3, Heart, MapPin, MessageSquare, ShieldCheck, UserRound } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { api, photoUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { EmptyState, ErrorState, InlineAlert, Loading } from '../components/Feedback';
import { PriorityBadge, StatusBadge, UrgencyBadge } from '../components/StatusBadge';
import { categoryName, formatDate, priorityScore, STATUS_LABELS, URGENCY_LABELS } from '../utils/format';

export default function ReportDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [adminStatus, setAdminStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [adminUrgency, setAdminUrgency] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [reportResult, historyResult] = await Promise.all([api.report(id), api.history(id)]);
      const next = reportResult?.data;
      setReport(next); setHistory(historyResult?.data || []); setAdminStatus(next?.status || ''); setAdminUrgency(next?.urgency || '');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { load(); }, [load]);
  const support = async () => {
    setBusy(true); setNotice('');
    try { await api.support(id); setNotice('Dukungan berhasil diberikan.'); await load(); }
    catch (err) { setNotice(err.message); }
    finally { setBusy(false); }
  };
  const changeStatus = async (event) => {
    event.preventDefault(); setBusy(true); setNotice('');
    try { await api.updateStatus(id, { status: adminStatus, note: adminNote }); setNotice('Status laporan berhasil diperbarui.'); setAdminNote(''); await load(); }
    catch (err) { setNotice(err.message); }
    finally { setBusy(false); }
  };
  const changeUrgency = async (event) => {
    event.preventDefault(); setBusy(true); setNotice('');
    try { await api.updateUrgency(id, adminUrgency); setNotice('Urgensi dan skor prioritas berhasil diperbarui.'); await load(); }
    catch (err) { setNotice(err.message); }
    finally { setBusy(false); }
  };
  if (loading) return <div className="page-container"><Loading label="Memuat detail laporan..." /></div>;
  if (error || !report) return <div className="page-container"><Link to="/" className="back-link"><ArrowLeft size={16} /> Kembali ke laporan</Link><ErrorState message={error || 'Laporan tidak ditemukan.'} onRetry={load} /></div>;
  const canSupport = user?.role === 'warga' && report.user_id !== user.id && !['selesai', 'ditolak'].includes(report.status);
  return <section className="detail-page"><Link to="/" className="back-link"><ArrowLeft size={16} /> Kembali ke daftar laporan</Link>{notice && <InlineAlert tone={notice.toLowerCase().includes('berhasil') ? 'success' : 'info'}>{notice}</InlineAlert>}<div className="detail-layout"><article className="detail-main"><div className="detail-image-wrap"><img className="detail-image" src={photoUrl(report.id)} alt={`Foto laporan ${report.title}`} onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.parentElement.classList.add('detail-image-fallback'); }} /><span className="detail-image-fallback-label">Foto laporan warga</span><div className="detail-image-badges"><StatusBadge status={report.status} /><UrgencyBadge urgency={report.urgency} /></div></div><div className="detail-content"><div className="detail-kicker">{categoryName(report)} <span>·</span> Laporan #{report.id}</div><h1>{report.title}</h1><div className="detail-author"><span className="author-avatar"><UserRound size={17} /></span><span>Dilaporkan oleh <strong>{report.reporter_name || 'Warga SuaraKita'}</strong></span><span className="detail-author-date"><CalendarDays size={14} /> {formatDate(report.created_at)}</span></div><div className="detail-description"><h2>Tentang masalah ini</h2><p>{report.description}</p></div><div className="detail-location-box"><span className="location-box-icon"><MapPin size={19} /></span><div><small>LOKASI KEJADIAN</small><strong>{report.location_name}</strong>{report.latitude != null && report.longitude != null && <a href={`https://www.openstreetmap.org/?mlat=${report.latitude}&mlon=${report.longitude}#map=17/${report.latitude}/${report.longitude}`} target="_blank" rel="noreferrer">Lihat di peta ↗</a>}</div></div><div className="detail-stats-row"><div className="detail-stat"><span className="detail-stat-icon"><Heart size={18} /></span><div><strong>{report.support_count || 0}</strong><small>Dukungan warga</small></div></div><div className="detail-stat"><span className="detail-stat-icon stat-priority"><ShieldCheck size={18} /></span><div><strong>{priorityScore(report).toFixed(1)}</strong><small>Skor prioritas</small></div></div><div className="detail-stat"><span className="detail-stat-icon stat-clock"><Clock3 size={18} /></span><div><strong>{URGENCY_LABELS[report.urgency] || report.urgency}</strong><small>Tingkat urgensi</small></div></div></div>{canSupport && <div className="detail-support-banner"><div><strong>Peduli dengan masalah ini?</strong><span>Dukunganmu membantu meningkatkan prioritas penanganan.</span></div><button className="button button-primary" onClick={support} disabled={busy}><Heart size={16} /> {busy ? 'Memproses...' : 'Dukung laporan'}</button></div>}
      </div></article><aside className="detail-sidebar"><div className="history-card"><div className="sidebar-card-heading"><span className="sidebar-heading-icon"><Clock3 size={18} /></span><div><h2>Perjalanan laporan</h2><p>Riwayat pembaruan status</p></div></div>{history.length ? <div className="history-timeline">{[...history].reverse().map((item, index) => <div className={`history-item ${index === history.length - 1 ? 'history-current' : ''}`} key={item.id}><span className="history-dot">{index === history.length - 1 ? <Check size={12} /> : null}</span><div><strong>{STATUS_LABELS[item.new_status] || item.new_status}</strong><time>{formatDate(item.changed_at)}</time>{item.note && <p>{item.note}</p>}<small>Oleh {item.changed_by_name || 'Sistem'}</small></div></div>)}</div> : <EmptyState title="Belum ada riwayat" description="Riwayat akan muncul saat laporan diperbarui." />}</div>
      {user?.role === 'admin' && <div className="admin-action-card"><div className="sidebar-card-heading"><span className="sidebar-heading-icon"><ShieldCheck size={18} /></span><div><h2>Kelola laporan</h2><p>Panel khusus admin</p></div></div><form onSubmit={changeStatus} className="admin-form"><label className="field-label">Ubah status<select className="form-control" value={adminStatus} onChange={(e) => setAdminStatus(e.target.value)}><option value="diajukan">Diajukan</option><option value="diverifikasi">Diverifikasi</option><option value="diproses">Sedang diproses</option><option value="selesai">Selesai</option><option value="ditolak">Ditolak</option></select></label><label className="field-label">Catatan perubahan <span className="optional-label">Opsional</span><textarea className="form-control" value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={3} maxLength={1000} placeholder="Tambahkan catatan untuk warga..." /></label><button className="button button-primary button-full" disabled={busy || adminStatus === report.status}>Simpan status</button></form><form onSubmit={changeUrgency} className="admin-form admin-form-divider"><label className="field-label">Tinjau urgensi<select className="form-control" value={adminUrgency} onChange={(e) => setAdminUrgency(e.target.value)}><option value="rendah">Rendah</option><option value="sedang">Sedang</option><option value="tinggi">Tinggi</option><option value="kritis">Kritis</option></select></label><button className="button button-secondary button-full" disabled={busy || adminUrgency === report.urgency}>Perbarui urgensi</button></form></div>}
      <div className="priority-explainer"><div className="eyebrow eyebrow-muted">KENAPA PRIORITAS?</div><p>Skor mempertimbangkan tingkat urgensi dan dukungan warga. Semakin tinggi skor, semakin besar perhatian yang dibutuhkan.</p><div className="priority-explainer-footer"><span>Skor saat ini</span><strong>{priorityScore(report).toFixed(1)} / 100</strong></div><div className="priority-progress"><span style={{ width: `${Math.min(100, priorityScore(report))}%` }} /></div></div></aside></div></section>;
}
