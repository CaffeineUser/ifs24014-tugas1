import { useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Leaf, LockKeyhole, Mail, Sprout, UserRound } from 'lucide-react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { InlineAlert } from '../components/Feedback';

export default function AuthPage({ mode = 'login' }) {
  const isRegister = mode === 'register';
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  if (user) return <Navigate to={user.role === 'admin' ? '/dashboard' : '/'} replace />;
  const onChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setError('');
    try {
      if (isRegister) await register(form); else await login({ email: form.email, password: form.password });
      const destination = searchParams.get('redirect') || (isRegister ? '/' : undefined);
      navigate(destination || (form.email.toLowerCase() === 'admin@example.com' ? '/dashboard' : '/'), { replace: true });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  return <section className="auth-page"><div className="auth-side"><Link to="/" className="auth-brand"><span className="brand-mark"><Sprout size={23} /></span><span>suara<span className="brand-dark">kita</span></span></Link><div className="auth-side-copy"><div className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> BERSAMA UNTUK PERUBAHAN</div><h1>Suara kecil,<br /><em>dampak besar.</em></h1><p>Lingkungan yang lebih baik dimulai dari kepedulian kita. Mari jadikan setiap laporan sebagai langkah menuju perubahan.</p><div className="auth-side-note"><span><Leaf size={18} /></span><div><strong>Satu laporan bisa mengubah banyak hal.</strong><small>Terhubung, peduli, dan bergerak bersama.</small></div></div></div><div className="auth-side-bottom">SuaraKita · Ruang aksi warga</div><div className="auth-ornament auth-ornament-one" /><div className="auth-ornament auth-ornament-two" /></div><div className="auth-form-side"><div className="auth-form-wrap"><Link to="/" className="back-link"><ArrowLeft size={16} /> Kembali ke beranda</Link><div className="auth-mobile-logo"><span className="brand-mark"><Sprout size={22} /></span> SuaraKita</div><div className="auth-heading"><span className="auth-icon"><LockKeyhole size={22} /></span><div className="eyebrow eyebrow-muted">{isRegister ? 'MULAI BERKONTRIBUSI' : 'SELAMAT DATANG KEMBALI'}</div><h2>{isRegister ? 'Buat akun baru' : 'Senang melihatmu lagi.'}</h2><p>{isRegister ? 'Bergabung dengan warga yang peduli lingkungan.' : 'Masuk untuk mendukung laporan dan memantau perubahan.'}</p></div>
      {error && <InlineAlert>{error}</InlineAlert>}
      <form className="auth-form" onSubmit={submit}>
        {isRegister && <label className="field-label">Nama lengkap<div className="input-wrap"><UserRound size={18} /><input name="name" value={form.name} onChange={onChange} placeholder="Nama yang ingin ditampilkan" autoComplete="name" minLength={2} maxLength={100} required /></div></label>}
        <label className="field-label">Alamat email<div className="input-wrap"><Mail size={18} /><input name="email" type="email" value={form.email} onChange={onChange} placeholder="nama@email.com" autoComplete="email" required /></div></label>
        <label className="field-label">Kata sandi<div className="input-wrap"><LockKeyhole size={18} /><input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={onChange} placeholder={isRegister ? 'Minimal 8 karakter' : 'Masukkan kata sandi'} autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={isRegister ? 8 : 1} required /><button className="password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{isRegister && <span className="field-help">Gunakan setidaknya 8 karakter.</span>}</label>
        <button className="button button-primary button-full button-large" type="submit" disabled={loading}>{loading ? 'Mohon tunggu...' : isRegister ? 'Buat akun' : 'Masuk ke SuaraKita'} <ArrowRight size={17} /></button>
      </form><div className="auth-switch">{isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Masuk di sini' : 'Daftar sekarang'}</Link></div><p className="auth-terms">Dengan melanjutkan, kamu setuju menggunakan SuaraKita secara bertanggung jawab dan menghormati komunitas.</p></div></div></section>;
}
