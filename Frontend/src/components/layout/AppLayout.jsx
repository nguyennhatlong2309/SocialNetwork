import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, PlusSquare, Mail, User, Activity, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// ── Keep-Alive page imports ──────────────────────────────────────────────────
import NewsFeedPage    from '../../pages/NewsFeedPage';
import InboxPage       from '../../pages/InboxPage';
import NotificationsPage from '../../pages/NotificationsPage';

import GlobalSearch from './GlobalSearch';
import './AppLayout.css';

const navItems = [
  { path: '/feed',          icon: Home,       label: 'Home' },
  { path: '/explore',       icon: Compass,    label: 'Explore' },
  { path: '/create',        icon: PlusSquare, label: 'Create' },
  { path: '/inbox',         icon: Mail,       label: 'Inbox',         badge: true },
  { path: '/notifications', icon: Bell,       label: 'Notifications', badge: true },
  { path: '/profile',       icon: User,       label: 'Profile' },
];

/**
 * Các path sẽ dùng Keep-Alive — component luôn mounted, chỉ ẩn/hiện bằng CSS.
 * Việc này đảm bảo scroll position, local state, và TanStack Query cache
 * không bao giờ bị reset khi navigate qua lại giữa các trang này.
 */
const KEEP_ALIVE_PATHS = ['/feed', '/explore', '/inbox', '/notifications'];

function isKeepAlivePath(pathname) {
  return KEEP_ALIVE_PATHS.includes(pathname);
}

/**
 * AppLayout — Layout chính của app (sau khi đăng nhập).
 *
 * ── Keep-Alive Strategy ──────────────────────────────────────────────────────
 * Thay vì dùng <Outlet /> đơn thuần (sẽ unmount page khi đổi route), ta render
 * tất cả keep-alive pages cùng lúc và toggle visibility bằng CSS `display: none`.
 *
 * KẾT QUẢ:
 *   ✓ Scroll position được giữ tự nhiên (DOM element không bị destroy)
 *   ✓ Local state (search, selected conversation) không reset
 *   ✓ TanStack Query cache không bị invalidate
 *   ✓ Không cần thư viện react-activation
 *
 * Dynamic pages (/profile, /create, /post/:id) vẫn dùng <Outlet /> bình thường.
 */
export default function AppLayout() {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div
          className="sidebar-logo"
          onClick={() => navigate('/feed')}
          style={{ cursor: 'pointer' }}
        >
          <div className="sidebar-logo-icon">
            <Activity size={18} color="white" />
          </div>
          <div className="sidebar-logo-text">
            <h2>AuraSocial</h2>
            <span>Premium Social</span>
          </div>
        </div>

        <GlobalSearch />

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

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="main-content">

        {/* ── Keep-Alive Pages ─────────────────────────────────────────
            Luôn mounted trong DOM. CSS `ka-hidden` (display:none) ẩn chúng
            khi không active — state, scroll, query cache đều được giữ nguyên.
            `ka-visible` thêm animation fade-in khi page được hiện lại.
        ──────────────────────────────────────────────────────────────── */}

        {/* /feed */}
        <div
          className={`ka-page ${pathname === '/feed' ? 'ka-visible' : 'ka-hidden'}`}
          aria-hidden={pathname !== '/feed'}
          id="ka-feed"
        >
          <NewsFeedPage />
        </div>

        {/* /explore — instance riêng với /feed */}
        <div
          className={`ka-page ${pathname === '/explore' ? 'ka-visible' : 'ka-hidden'}`}
          aria-hidden={pathname !== '/explore'}
          id="ka-explore"
        >
          <NewsFeedPage key="explore-instance" />
        </div>

        {/* /inbox */}
        <div
          className={`ka-page ${pathname === '/inbox' ? 'ka-visible' : 'ka-hidden'}`}
          aria-hidden={pathname !== '/inbox'}
          id="ka-inbox"
        >
          <InboxPage />
        </div>

        {/* /notifications */}
        <div
          className={`ka-page ${pathname === '/notifications' ? 'ka-visible' : 'ka-hidden'}`}
          aria-hidden={pathname !== '/notifications'}
          id="ka-notifications"
        >
          <NotificationsPage />
        </div>

        {/* ── Dynamic Pages ─────────────────────────────────────────────
            /profile/:userId, /create, /post/:postId — vẫn mount/unmount
            bình thường qua Outlet (có param động hoặc là form).
        ──────────────────────────────────────────────────────────────── */}
        {!isKeepAlivePath(pathname) && (
          <div className="ka-page ka-visible" id="ka-dynamic">
            <Outlet />
          </div>
        )}

      </main>
    </div>
  );
}
