import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShieldAlert, ArrowLeft, LogOut, Activity, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './AdminLayout.css';

const adminNavItems = [
  { path: '/admin/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/users',       icon: Users,           label: 'User Management' },
  { path: '/admin/moderation',  icon: ShieldAlert,     label: 'Moderation Queue', badge: true },
  { path: '/admin/settings',    icon: Settings,        label: 'Settings' },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* ── Admin Sidebar ──────────────────────────────────────── */}
      <aside className="admin-sidebar">

        {/* Logo */}
        <div className="admin-sidebar-logo">
          <div className="admin-logo-icon">
            <Activity size={18} color="white" />
          </div>
          <div className="admin-logo-text">
            <h2>AuraSocial</h2>
            <span className="admin-badge-label">Admin Panel</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="admin-nav">
          {adminNavItems.map(({ path, icon: Icon, label, badge }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {badge && <span className="admin-nav-badge">3</span>}
            </NavLink>
          ))}
        </nav>

        {/* Divider */}
        <div className="admin-sidebar-divider" />

        {/* Back to App */}
        <div
          className="admin-nav-item back-btn"
          onClick={() => navigate('/feed')}
        >
          <ArrowLeft size={18} />
          <span>Back to App</span>
        </div>

        {/* Logout */}
        <div
          className="admin-nav-item logout-btn"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </div>
      </aside>

      {/* ── Admin Main Content ──────────────────────────────────── */}
      <main className="admin-main">
        <div className="admin-topbar">
          <div className="admin-topbar-left">
            <span className="admin-topbar-label">⚡ Admin Console</span>
          </div>
          <div className="admin-topbar-right">
            <div className="admin-topbar-status">
              <span className="status-dot" />
              System Online
            </div>
          </div>
        </div>

        <div className="admin-page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
