import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart3, FilePlus2, HeartHandshake, LogIn, LogOut, Menu, Plus, ShieldCheck, Sprout, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const closeMenu = () => setMobileOpen(false);
  const doLogout = async () => { await logout(); closeMenu(); navigate('/'); };
  return <div className="app-shell">
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="brand" onClick={closeMenu}><span className="brand-mark"><Sprout size={23} strokeWidth={2.5} /></span><span>suara<span className="brand-dark">kita</span><small>LINGKUNGAN LEBIH BAIK, BERSAMA</small></span></Link>
        <nav id="primary-navigation" className={`main-nav ${mobileOpen ? 'nav-open' : ''}`} aria-label="Navigasi utama">
          <NavLink to="/" end onClick={closeMenu}>Jelajahi</NavLink>
          {user && <NavLink to="/reports/new" onClick={closeMenu}><FilePlus2 size={16} /> Buat laporan</NavLink>}
          {user?.role === 'admin' && <NavLink to="/dashboard" onClick={closeMenu}><BarChart3 size={16} /> Dashboard</NavLink>}
          {mobileOpen && user && <button className="mobile-account-link" onClick={doLogout}><LogOut size={16} /> Keluar</button>}
        </nav>
        <div className="topbar-actions">
          {user ? <div className="account-menu"><span className="avatar">{(user.name || 'S').slice(0, 1).toUpperCase()}</span><span className="account-name">{user.name}</span>{user.role === 'admin' && <span className="admin-tag"><ShieldCheck size={12} /> Admin</span>}<button className="logout-button" onClick={doLogout} title="Keluar"><LogOut size={17} /></button></div> : <><Link to="/login" className="login-link"><LogIn size={16} /> Masuk</Link><Link to="/register" className="button button-primary button-nav"><Plus size={16} /> Bergabung</Link></>}
          <button className="mobile-menu-toggle" type="button" aria-expanded={mobileOpen} aria-controls="primary-navigation" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}>{mobileOpen ? <X /> : <Menu />}</button>
        </div>
      </div>
    </header>
    <main className="main-content"><Outlet /></main>
    <footer className="footer"><div className="footer-inner"><Link to="/" className="footer-brand"><Sprout size={18} /> SuaraKita</Link><span>Suara warga, perubahan nyata.</span><span className="footer-right"><HeartHandshake size={15} /> Dibangun untuk lingkungan yang lebih baik</span></div></footer>
  </div>;
}
