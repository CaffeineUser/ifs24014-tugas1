import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Camera, CheckCircle2, ImagePlus, MapPin, Send, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { InlineAlert } from '../components/Feedback';

export default function CreateReportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [form, setForm] = useState({ category_id: '', title: '', description: '', location_name: '', latitude: '', longitude: '', urgency: 'sedang' });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => { let active = true; api.categories().then((result) => { if (active) setCategories(result?.data || []); }).catch((err) => { if (active) setError(err.message); }).finally(() => { if (active) setCategoryLoading(false); }); return () => { active = false; }; }, []);
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const choosePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setError('Foto harus berformat JPG, PNG, atau WebP.'); return; }
    if (file.size > 3 * 1024 * 1024) { setError('Ukuran foto maksimal 3 MB.'); return; }
    setError(''); setPhoto(file); setPreview(URL.createObjectURL(file));
  };
  const removePhoto = () => { setPhoto(null); if (preview) URL.revokeObjectURL(preview); setPreview(''); if (fileRef.current) fileRef.current.value = ''; };
  const submit = async (event) => {
    event.preventDefault(); setError('');
    if (!photo) { setError('Tambahkan satu foto kondisi yang dilaporkan.'); return; }
    setLoading(true);
    try {
      const data = new FormData();
      data.append('category_id', form.category_id); data.append('title', form.title.trim()); data.append('description', form.description.trim()); data.append('location_name', form.location_name.trim()); data.append('urgency', form.urgency); data.append('photo', photo);
      if (form.latitude !== '') data.append('latitude', form.latitude);
      if (form.longitude !== '') data.append('longitude', form.longitude);
      const result = await api.createReport(data);
      navigate(`/reports/${result?.data?.id}`, { state: { created: true } });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  return <section className="form-page"><Link to="/" className="back-link"><ArrowLeft size={16} /> Kembali ke daftar laporan</Link><div className="form-page-heading"><div className="eyebrow eyebrow-muted">MULAI DARI KEPEDULIAN</div><h1>Buat laporan <em>lingkungan.</em></h1><p>Jelaskan masalah yang kamu temukan. Informasi yang jelas membantu warga dan admin menentukan langkah selanjutnya.</p></div><div className="form-layout"><form className="report-form-card" onSubmit={submit}><div className="form-section-heading"><span className="form-step">01</span><div><h2>Informasi laporan</h2><p>Berikan detail yang akurat dan mudah dipahami.</p></div></div>{error && <InlineAlert>{error}</InlineAlert>}
      <label className="field-label">Judul laporan <span className="required">*</span><input className="form-control" name="title" value={form.title} onChange={change} placeholder="Contoh: Jalan berlubang di dekat sekolah" minLength={5} maxLength={150} required /><span className="field-help">Gunakan judul yang spesifik dan mudah dikenali.</span></label>
      <label className="field-label">Kategori masalah <span className="required">*</span><select className="form-control" name="category_id" value={form.category_id} onChange={change} required disabled={categoryLoading}><option value="">{categoryLoading ? 'Memuat kategori...' : 'Pilih kategori'}</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <label className="field-label">Deskripsi <span className="required">*</span><textarea className="form-control textarea-control" name="description" value={form.description} onChange={change} placeholder="Jelaskan kondisi, dampak bagi warga, dan informasi lain yang relevan..." minLength={10} maxLength={5000} rows={5} required /><span className="field-help">{form.description.length}/5000 karakter. Minimal 10 karakter.</span></label>
      <label className="field-label">Lokasi kejadian <span className="required">*</span><div className="input-wrap form-input-wrap"><MapPin size={18} /><input name="location_name" value={form.location_name} onChange={change} placeholder="Alamat, patokan, atau nama area" minLength={3} maxLength={300} required /></div></label>
      <div className="coordinate-grid"><label className="field-label">Latitude <span className="optional-label">Opsional</span><input className="form-control" type="number" name="latitude" value={form.latitude} onChange={change} placeholder="2.9700" min="-90" max="90" step="any" /></label><label className="field-label">Longitude <span className="optional-label">Opsional</span><input className="form-control" type="number" name="longitude" value={form.longitude} onChange={change} placeholder="99.0600" min="-180" max="180" step="any" /></label></div>
      <div className="field-label">Tingkat urgensi <span className="required">*</span><div className="urgency-options">{[{value:'rendah',title:'Rendah',desc:'Tidak mendesak',color:'u-low'},{value:'sedang',title:'Sedang',desc:'Perlu diperhatikan',color:'u-mid'},{value:'tinggi',title:'Tinggi',desc:'Butuh penanganan cepat',color:'u-high'},{value:'kritis',title:'Kritis',desc:'Risiko keselamatan',color:'u-critical'}].map((item) => <label key={item.value} className={`urgency-option ${item.color} ${form.urgency === item.value ? 'selected' : ''}`}><input type="radio" name="urgency" value={item.value} checked={form.urgency === item.value} onChange={change} /><span className="urgency-radio" /><span><strong>{item.title}</strong><small>{item.desc}</small></span></label>)}</div><span className="field-help">Admin dapat meninjau ulang tingkat urgensi saat verifikasi.</span></div>
      <div className="form-section-heading photo-heading"><span className="form-step">02</span><div><h2>Foto kondisi</h2><p>Sertakan bukti visual agar laporan lebih mudah diverifikasi.</p></div></div>
      <div className={`photo-upload ${preview ? 'has-photo' : ''}`}>{preview ? <><img src={preview} alt="Pratinjau foto laporan" /><div className="photo-preview-footer"><span><CheckCircle2 size={16} /> {photo?.name}</span><button type="button" className="remove-photo" onClick={removePhoto}><X size={16} /> Hapus foto</button></div></> : <button type="button" className="upload-prompt" onClick={() => fileRef.current?.click()}><span className="upload-icon"><ImagePlus size={25} /></span><strong>Unggah foto laporan</strong><span>Klik untuk memilih foto dari perangkat</span><small>JPG, PNG, atau WebP · Maks. 3 MB · 1 foto</small></button>}<input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={choosePhoto} hidden /></div>
      <div className="form-actions"><Link to="/" className="button button-secondary">Batal</Link><button className="button button-primary button-large" type="submit" disabled={loading}>{loading ? 'Mengirim laporan...' : 'Kirim laporan'} <Send size={16} /></button></div><p className="form-privacy-note">Dengan mengirim laporan, kamu menyatakan informasi yang diberikan benar sejauh yang kamu ketahui.</p>
    </form><aside className="form-aside"><div className="aside-note-card"><span className="aside-note-icon"><Camera size={20} /></span><h3>Laporan yang baik dimulai dari detail.</h3><p>Foto yang jelas, lokasi akurat, dan deskripsi singkat membantu laporan lebih mudah ditindaklanjuti.</p><ul><li><CheckCircle2 size={15} /> Ambil foto dari tempat yang aman</li><li><CheckCircle2 size={15} /> Hindari menampilkan data pribadi</li><li><CheckCircle2 size={15} /> Jelaskan dampak bagi lingkungan</li></ul></div><div className="aside-process-card"><div className="eyebrow eyebrow-muted">SETELAH DIKIRIM</div><div className="mini-timeline"><div className="mini-timeline-item"><span className="timeline-dot active" /><div><strong>Diajukan</strong><small>Laporan tercatat di SuaraKita</small></div></div><div className="mini-timeline-item"><span className="timeline-dot" /><div><strong>Diverifikasi</strong><small>Admin meninjau informasi</small></div></div><div className="mini-timeline-item"><span className="timeline-dot" /><div><strong>Ditindaklanjuti</strong><small>Progres dapat dipantau</small></div></div></div></div></aside></div></section>;
}
