import { useCallback, useEffect, useState } from 'react';
import { Activity, ArrowRight, CheckCircle2, Clock3, FileText, RefreshCw, ShieldAlert, TrendingUp, Users } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ErrorState, Loading } from '../components/Feedback';
import { PriorityBadge, StatusBadge, UrgencyBadge } from '../components/StatusBadge';
import { formatDate, normalizeList, priorityScore } from '../utils/format';

const COLORS = ['#1d7b5e', '#d4a33b', '#5488b8', '#79a997', '#c76f63'];
const STATUS_NAME = { diajukan: 'Diajukan', diverifikasi: 'Diverifikasi', diproses: 'Diproses', selesai: 'Selesai', ditolak: 'Ditolak' };
export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState({ summary: null, byCategory: [], byStatus: [], priority: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [summary, categories, statuses, priority] = await Promise.all([api.dashboardSummary(), api.dashboardByCategory(), api.dashboardByStatus(), api.dashboardPriority()]);
      setData({ summary: summary?.data, byCategory: normalizeList(categories), byStatus: normalizeList(statuses), priority: normalizeList(priority) });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  const summary = data.summary || {};
  const statusData = data.byStatus.map((item) => ({ ...item, name: STATUS_NAME[item.status] || item.status, value: item.count }));
  if (loading) return <div className="page-container"><Loading label="Menyiapkan dashboard statistik..." /></div>;
  if (error) return <div className="page-container"><ErrorState message={error} onRetry={load} /></div>;
  return <section className="dashboard-page"><div className="dashboard-heading"><div><div className="eyebrow eyebrow-muted">PUSAT PEMANTAUAN</div><h1>Dashboard <em>SuaraKita.</em></h1><p>Pantau kondisi laporan dan lihat masalah yang paling membutuhkan perhatian.</p></div><button className="button button-secondary" onClick={load}><RefreshCw size={15} /> Perbarui data</button></div><div className="dashboard-welcome"><span className="welcome-icon"><Activity size={21} /></span><div><strong>Selamat datang, {user.name}.</strong><span>Berikut ringkasan aktivitas pelaporan lingkungan saat ini.</span></div><span className="live-status"><span /> DATA TERKINI</span></div>
    <div className="stat-cards"><div className="stat-card"><span className="stat-card-icon icon-green"><FileText size={20} /></span><span className="stat-card-label">Total laporan</span><strong>{summary.total_reports ?? 0}</strong><small>Seluruh laporan tercatat</small></div><div className="stat-card"><span className="stat-card-icon icon-yellow"><Clock3 size={20} /></span><span className="stat-card-label">Menunggu verifikasi</span><strong>{summary.submitted_reports ?? 0}</strong><small>Perlu ditinjau admin</small></div><div className="stat-card"><span className="stat-card-icon icon-blue"><TrendingUp size={20} /></span><span className="stat-card-label">Sedang ditangani</span><strong>{(summary.verified_reports || 0) + (summary.in_progress_reports || 0)}</strong><small>Verifikasi dan proses</small></div><div className="stat-card"><span className="stat-card-icon icon-sage"><CheckCircle2 size={20} /></span><span className="stat-card-label">Selesai</span><strong>{summary.completed_reports ?? 0}</strong><small>Laporan terselesaikan</small></div></div>
    <div className="dashboard-charts"><section className="chart-card"><div className="chart-heading"><div><h2>Laporan berdasarkan kategori</h2><p>Kategori masalah yang paling sering dilaporkan</p></div><span className="chart-heading-icon"><FileText size={18} /></span></div>{data.byCategory.length ? <div className="chart-area"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.byCategory} margin={{ top: 12, right: 8, left: -20, bottom: 8 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8ece8" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#77827b', fontSize: 11 }} interval={0} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#77827b', fontSize: 11 }} /><Tooltip cursor={{ fill: '#edf5ef' }} contentStyle={{ borderRadius: 12, border: '1px solid #e5ebe6', fontSize: 12 }} /><Bar dataKey="count" name="Jumlah laporan" fill="#1d7b5e" radius={[5, 5, 0, 0]} maxBarSize={45} /></BarChart></ResponsiveContainer></div> : <div className="chart-empty">Belum ada data kategori.</div>}</section>
    <section className="chart-card"><div className="chart-heading"><div><h2>Status penanganan</h2><p>Ringkasan progres seluruh laporan</p></div><span className="chart-heading-icon"><Activity size={18} /></span></div>{statusData.length ? <div className="status-chart-layout"><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="88%" paddingAngle={3} stroke="none">{statusData.map((item, index) => <Cell key={item.status} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5ebe6', fontSize: 12 }} /></PieChart></ResponsiveContainer><div className="donut-center"><strong>{summary.total_reports || 0}</strong><small>laporan</small></div></div><div className="chart-legend">{statusData.map((item, index) => <div className="legend-row" key={item.status}><span className="legend-dot" style={{ background: COLORS[index % COLORS.length] }} /><span>{item.name}</span><strong>{item.count}</strong></div>)}</div></div> : <div className="chart-empty">Belum ada data status.</div>}</section></div>
    <section className="priority-table-card"><div className="table-heading"><div><div className="eyebrow eyebrow-muted">PERLU PERHATIAN</div><h2>Laporan prioritas</h2><p>Daftar laporan dengan skor prioritas tertinggi saat ini.</p></div><Link to="/" className="text-link">Lihat semua laporan <ArrowRight size={15} /></Link></div>{data.priority.length ? <div className="table-scroll"><table className="priority-table"><thead><tr><th>Laporan</th><th>Kategori</th><th>Urgensi</th><th>Dukungan</th><th>Skor</th><th>Status</th><th /></tr></thead><tbody>{data.priority.map((report) => <tr key={report.id}><td><Link to={`/reports/${report.id}`} className="table-report-title">{report.title}</Link><small>{report.location_name}</small></td><td>{report.category_name}</td><td><UrgencyBadge urgency={report.urgency} /></td><td><span className="table-support">♡ {report.support_count || 0}</span></td><td><PriorityBadge score={priorityScore(report)} /></td><td><StatusBadge status={report.status} /></td><td><Link to={`/reports/${report.id}`} className="table-arrow" aria-label="Buka laporan"><ArrowRight size={16} /></Link></td></tr>)}</tbody></table></div> : <div className="chart-empty">Belum ada laporan untuk ditampilkan.</div>}</section>
    <div className="dashboard-footer-note"><ShieldAlert size={17} /><span>Skor prioritas dihitung dari tingkat urgensi dan dukungan warga. Gunakan pertimbangan lapangan saat menentukan tindak lanjut.</span></div>
  </section>;
}
