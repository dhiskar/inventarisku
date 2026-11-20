import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  AlertTriangle, Boxes, History, LayoutDashboard, LogOut, Package,
  Plus, Settings, UserRound,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'

const navigation = [
  { to: '/', label: 'Beranda', icon: LayoutDashboard, end: true },
  { to: '/barang', label: 'Barang', icon: Package, end: false },
  { to: '/riwayat', label: 'Riwayat', icon: History, end: false },
  { to: '/pengaturan', label: 'Pengaturan', icon: Settings, end: false },
]

function NavItems({ mobile = false }) {
  return navigation.map(({ to, label, icon: Icon, end }) => (
    <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}${mobile ? ' nav-item--mobile' : ''}`}>
      <Icon size={mobile ? 21 : 19} strokeWidth={2} />
      <span>{label}</span>
    </NavLink>
  ))
}

export default function Layout() {
  const { user, logout } = useAuth()
  const { error } = useData()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Pengguna'

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar${menuOpen ? ' sidebar--open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-mark"><Boxes size={22} /></span>
          <span className="brand-text">Inventaris<b>Ku</b></span>
        </div>

        <button className="btn btn--primary sidebar-add" onClick={() => navigate('/barang/baru')}>
          <Plus size={18} /> Tambah barang
        </button>

        <nav className="sidebar-nav"><NavItems /></nav>

        <div className="sidebar-bottom">
          <div className="user-card">
            <span className="avatar"><UserRound size={17} /></span>
            <div className="user-meta">
              <strong>{displayName}</strong>
              <small>{user?.email}</small>
            </div>
          </div>
          <button className="btn btn--ghost btn--block" onClick={handleLogout}>
            <LogOut size={17} /> Keluar
          </button>
        </div>
      </aside>

      {menuOpen && <button className="sidebar-backdrop" aria-label="Tutup menu" onClick={() => setMenuOpen(false)} />}

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-only" onClick={() => setMenuOpen(true)} aria-label="Buka menu">
              <Boxes size={21} />
            </button>
            <div>
              <span className="topbar-brand mobile-only">Inventaris<b>Ku</b></span>
              <span className="topbar-greeting desktop-only">Halo, <b>{displayName}</b> 👋</span>
            </div>
          </div>
          <div className="topbar-right">
            <button className="btn btn--primary btn--small desktop-only" onClick={() => navigate('/barang/baru')}>
              <Plus size={17} /> Tambah barang
            </button>
            <span className="avatar avatar--top"><UserRound size={17} /></span>
          </div>
        </header>

        <main className="page-content">
          {error && (
            <div className="alert alert--error alert--page">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}
          <Outlet />
        </main>
      </div>

      <nav className="bottom-nav">
        <NavItems mobile />
        <button className="fab" onClick={() => navigate('/barang/baru')} aria-label="Tambah barang">
          <Plus size={25} strokeWidth={2.5} />
        </button>
      </nav>
    </div>
  )
}
