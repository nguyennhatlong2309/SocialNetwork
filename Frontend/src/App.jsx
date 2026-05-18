import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { InboxStateProvider } from './contexts/PageStateContext';
import { SignalRProvider } from './contexts/SignalRContext';

// ── Layouts ──────────────────────────────────────────────────────────────────
import AppLayout   from './components/layout/AppLayout';
import AdminLayout from './components/layout/AdminLayout';

// ── User Pages ────────────────────────────────────────────────────────────────
import OnboardingPage    from './pages/user/OnboardingPage';
import LoginPage         from './pages/user/LoginPage';
import RegisterPage      from './pages/user/RegisterPage';
import NewsFeedPage      from './pages/user/NewsFeedPage';
import UserProfilePage   from './pages/user/UserProfilePage';
import PostDetailPage    from './pages/user/PostDetailPage';
import PostDetailDialog  from './components/PostDetailDialog';
import CreatePostPage    from './pages/user/CreatePostPage';
import InboxPage         from './pages/user/InboxPage';
import NotificationsPage from './pages/user/NotificationsPage';
import SettingsPage      from './pages/user/SettingsPage';

// ── Admin Pages ───────────────────────────────────────────────────────────────
import AdminDashboardPage       from './pages/admin/AdminDashboardPage';
import AdminUserManagementPage  from './pages/admin/AdminUserManagementPage';
import AdminModerationPage      from './pages/admin/AdminModerationPage';
import AdminSettingsPage        from './pages/admin/AdminSettingsPage';

// ── Route Guards ─────────────────────────────────────────────────────────────
function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/feed" replace />;
}

/**
 * AdminRoute — Bảo vệ tất cả routes /admin/*
 * Chỉ cho phép truy cập nếu đã đăng nhập VÀ có role là 'Admin'.
 */
function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'Admin') return <Navigate to="/feed" replace />;
  return children;
}

// ── Routes ────────────────────────────────────────────────────────────────────
function AppRoutes() {
  const location = useLocation();
  const background = location.state?.background;

  return (
    <>
      <Routes location={background || location}>
        {/* ── Public routes ─────────────────────────────────────── */}
        <Route path="/"         element={<PublicRoute><OnboardingPage /></PublicRoute>} />
        <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* ── User routes (protected) ───────────────────────────── */}
        <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route path="feed"            element={<NewsFeedPage />} />
          <Route path="explore"         element={<NewsFeedPage />} />
          <Route path="inbox"           element={<InboxPage />} />
          <Route path="profile/:userId?" element={<UserProfilePage />} />
          <Route path="post/:postId"    element={<PostDetailPage />} />
          <Route path="create"          element={<CreatePostPage />} />
          <Route path="notifications"   element={<NotificationsPage />} />
          <Route path="settings"        element={<SettingsPage />} />
        </Route>

        {/* ── Admin routes ──────────────────────────────────────── */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard"  element={<AdminDashboardPage />} />
          <Route path="users"      element={<AdminUserManagementPage />} />
          <Route path="moderation" element={<AdminModerationPage />} />
          <Route path="settings"   element={<AdminSettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Modal overlay — chỉ hiện khi có background state */}
      {background && (
        <Routes>
          <Route path="/post/:postId" element={<PostDetailDialog />} />
        </Routes>
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      {/* InboxStateProvider lưu selectedConversationId của InboxPage
          — cần persist vì ChatView là conditional render bên trong InboxPage */}
      <InboxStateProvider>
        {/* SignalRProvider nằm trong AuthProvider để đọc được isAuthenticated + accessToken.
            Tự động kết nối 2 hubs khi login, ngắt khi logout. */}
        <SignalRProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </SignalRProvider>
      </InboxStateProvider>
    </AuthProvider>
  );
}
