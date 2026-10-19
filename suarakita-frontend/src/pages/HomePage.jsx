import { useCallback, useEffect, useState } from 'react';
import { ArrowDownWideNarrow, ArrowRight, CheckCircle2, Filter, Leaf, Search, SlidersHorizontal, Sparkles, Users, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ErrorState, EmptyState, InlineAlert, Loading } from '../components/Feedback';
import Pagination from '../components/Pagination';
import ReportCard from '../components/ReportCard';
import { normalizeList } from '../utils/format';

const INITIAL_FILTERS = { q: '', category_id: '', status: '', urgency: '', sort: 'priority', order: 'desc' };

export default function HomePage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, total: 0, limit: 9 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [supportBusy, setSupportBusy] = useState(null);
  const [notice, setNotice] = useState('');
  const [categoryError, setCategoryError] = useState('');

  const loadCategories = useCallback(async () => {
    try { setCategories(normalizeList(await api.categories())); } catch (err) { setCategoryError(err.message); }
  }, []);
  const loadReports = useCallback(async (page = 1) => {
    setLoading(true); setError('');
    try {
      const result = await api.reports({ ...filters, page, limit: 9 });
      setReports(normalizeList(result));
      setPagination(result?.pagination || { page, total_pages: 1, total: result?.data?.length || 0, limit: 9 });
    } catch (err) { setError(err.message); setReports([]); }
    finally { setLoading(false); }
  }, [filters]);
  useEffect(() => { loadCategories(); }, [loadCategories]);
  useEffect(() => { loadReports(1); }, [loadReports]);
  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const submitSearch = (event) => { event.preventDefault(); setFilter('q', query.trim()); };
  const clearFilters = () => { setQuery(''); setFilters(INITIAL_FILTERS); };
  const handleSupport = async (report) => {
    if (!user) { setNotice('Masuk terlebih dahulu untuk mendukung laporan.'); return; }
    setSupportBusy(report.id); setNotice('');
    try { await api.support(report.id); setNotice('Dukungan berhasil diberikan. Terima kasih telah peduli!'); await loadReports(pagination.page); }
    catch (err) { setNotice(err.message); }
    finally { setSupportBusy(null); }
  };
  const hasFilters = Object.entries(filters).some(([key, value]) => value !== INITIAL_FILTERS[key]);

  return <>
    <section className="hero-section"><div className="hero-grid"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot" /> RUANG AKSI WARGA</div><h1>Perubahan dimulai<br />dari <em>lingkungan kita.</em></h1><p>Laporkan masalah di sekitarmu, dukung suara warga lain, dan pantau perubahan menuju lingkungan yang lebih baik.</p><div className="hero-buttons"><Link to={user ? '/reports/new' : '/login'} className="button button-primary button-large">Laporkan masalah <ArrowRight size={18} /></Link><a href="#daftar-laporan" className="button button-ghost button-large">Jelajahi laporan <ArrowDownWideNarrow size={17} /></a></div><div className="hero-proof"><div className="proof-avatars"><span>W</span><span>R</span><span>A</span><span>+</span></div><span>Bergerak bersama, mulai dari hal kecil.</span></div></div><div className="hero-visual"><div className="hero-art-background" /><div className="hero-art-card"><div className="art-topline"><span className="art-live-dot" /> LINGKUNGAN KITA</div><div className="art-illustration"><div className="sun" /><div className="cloud cloud-one" /><div className="cloud cloud-two" /><div className="hill hill-back" /><div className="hill hill-front" /><div className="tree tree-one"><i /><b /></div><div className="tree tree-two"><i /><b /></div><div className="house"><i /><b /><span /></div><div className="pathway" /></div><div className="art-bottom"><div className="art-icon"><Leaf size={19} /></div><div><strong>Lingkungan lebih baik</strong><span>Dimulai dari kepedulianmu</span></div><Sparkles size={18} className="art-sparkle" /></div></div><div className="floating-note note-top"><span className="note-icon note-green"><CheckCircle2 size={17} /></span><span><strong>Suara didengar</strong><small>Setiap laporan berarti</small></span></div><div className="floating-note note-bottom"><span className="note-icon note-yellow"><Users size={17} /></span><span><strong>Warga berdaya</strong><small>Aksi kolektif dimulai di sini</small></span></div><div className="hero-deco deco-one" /><div className="hero-deco deco-two" /></div></div><div className="hero-bottom-rule"><span /><span /><span /></div></section>

    <section className="principles-row"><div className="principle"><span className="principle-icon green"><Search size={19} /></span><div><strong>Temukan masalah</strong><span>Lihat laporan di sekitarmu</span></div></div><div className="principle-divider" /><div className="principle"><span className="principle-icon yellow"><Users size={19} /></span><div><strong>Berikan dukungan</strong><span>Perkuat suara bersama</span></div></div><div className="principle-divider" /><div className="principle"><span className="principle-icon blue"><CheckCircle2 size={19} /></span><div><strong>Pantau perubahan</strong><span>Ikuti progres penanganan</span></div></div></section>

    <section id="daftar-laporan" className="reports-section"><div className="section-heading"><div><div className="eyebrow eyebrow-muted">DARI WARGA, UNTUK WARGA</div><h2>Suara yang perlu <em>didengar.</em></h2><p>Jelajahi laporan di lingkungan sekitar dan bantu dorong perubahan.</p></div><div className="report-count"><strong>{pagination.total ?? reports.length}</strong><span>laporan tercatat</span></div></div>
      <div className="filter-panel"><form className="search-form" onSubmit={submitSearch}><Search size={18} /><input aria-label="Cari laporan" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari masalah, lokasi, atau kata kunci..." /><button type="submit" className="button button-primary search-submit">Cari</button></form><div className="filter-controls"><div className="filter-label"><SlidersHorizontal size={16} /><span>Filter</span></div><select aria-label="Filter kategori" value={filters.category_id} onChange={(e) => setFilter('category_id', e.target.value)}><option value="">Semua kategori</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><select aria-label="Filter status" value={filters.status} onChange={(e) => setFilter('status', e.target.value)}><option value="">Semua status</option><option value="diajukan">Diajukan</option><option value="diverifikasi">Diverifikasi</option><option value="diproses">Sedang diproses</option><option value="selesai">Selesai</option><option value="ditolak">Ditolak</option></select><select aria-label="Filter urgensi" value={filters.urgency} onChange={(e) => setFilter('urgency', e.target.value)}><option value="">Semua urgensi</option><option value="rendah">Rendah</option><option value="sedang">Sedang</option><option value="tinggi">Tinggi</option><option value="kritis">Kritis</option></select><select aria-label="Urutkan laporan" value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)}><option value="priority">Prioritas tertinggi</option><option value="created_at">Terbaru</option><option value="support_count">Dukungan terbanyak</option></select>{hasFilters && <button className="clear-filters" onClick={clearFilters} type="button"><X size={14} /> Reset</button>}</div>{categoryError && <div className="filter-hint">Kategori belum dapat dimuat: {categoryError}</div>}</div>
      {notice && <InlineAlert tone={notice.toLowerCase().includes('berhasil') ? 'success' : 'info'}>{notice}</InlineAlert>}
      {loading ? <Loading label="Memuat laporan warga..." /> : error ? <ErrorState message={error} onRetry={() => loadReports(pagination.page)} /> : reports.length === 0 ? <EmptyState title="Belum ada laporan yang cocok" description="Coba gunakan kata kunci atau filter yang berbeda." /> : <div className="reports-grid">{reports.map((report) => <ReportCard key={report.id} report={report} user={user} onSupport={handleSupport} supportBusy={supportBusy} />)}</div>}
      {!loading && !error && reports.length > 0 && <Pagination page={pagination.page || 1} totalPages={pagination.total_pages || 1} onChange={loadReports} />}
    </section>
    <section className="callout-section"><div className="callout-mark"><Leaf size={24} /></div><div><div className="eyebrow eyebrow-light">SAATNYA AMBIL BAGIAN</div><h2>Punya sesuatu yang perlu <em>diperbaiki?</em></h2><p>Jangan biarkan masalah kecil menjadi lebih besar. Mulai dengan satu laporan.</p></div><Link to={user ? '/reports/new' : '/register'} className="button button-light">{user ? 'Buat laporan' : 'Gabung sekarang'} <ArrowRight size={17} /></Link><div className="callout-circle" /></section>
  </>;
}
