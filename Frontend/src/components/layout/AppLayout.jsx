import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, Compass, PlusSquare, Mail, User, Activity, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './AppLayout.css';

const navItems = [
  { path: '/feed', icon: Home, label: 'Home' },
  { path: '/explore', icon: Compass, label: 'Explore' },
  { path: '/create', icon: PlusSquare, label: 'Create' },
  { path: '/inbox', icon: Mail, label: 'Inbox', badge: true },
  { path: '/notifications', icon: Bell, label: 'Notifications', badge: true },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo" onClick={() => navigate('/feed')} style={{ cursor: 'pointer' }}>
          <div className="sidebar-logo-icon">
            <Activity size={18} color="white" />
          </div>
          <div className="sidebar-logo-text">
            <h2>AuraSocial</h2>
            <span>Premium Social</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ path, icon: Icon, label, badge }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              {label}
              {badge && <span className="badge" />}
            </NavLink>
          ))}
        </nav>

        <button className="sidebar-btn" onClick={() => navigate('/create')}>
          <PlusSquare size={16} />
          New Post
        </button>

        <div 
          className="nav-item" 
          onClick={handleLogout} 
          style={{ marginTop: '12px' }}
        >
          <LogOut size={18} />
          Logout
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
