import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { InboxStateProvider } from './contexts/PageStateContext';
import { SignalRProvider } from './contexts/SignalRContext';
import AppLayout from './components/layout/AppLayout';
import OnboardingPage from './pages/OnboardingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NewsFeedPage from './pages/NewsFeedPage';
import UserProfilePage from './pages/UserProfilePage';
import PostDetailPage from './pages/PostDetailPage';
import PostDetailDialog from './components/PostDetailDialog';
import CreatePostPage from './pages/CreatePostPage';
import InboxPage from './pages/InboxPage';
import NotificationsPage from './pages/NotificationsPage';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/feed" replace />;
}

function AppRoutes() {
  const location = useLocation();
  const background = location.state?.background;

  return (
    <>
      <Routes location={background || location}>
        {/* Public routes */}
        <Route path="/"         element={<PublicRoute><OnboardingPage /></PublicRoute>} />
        <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Protected routes */}
        <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route path="feed"           element={<NewsFeedPage />} />
          <Route path="explore"        element={<NewsFeedPage />} />
          <Route path="inbox"          element={<InboxPage />} />
          <Route path="profile/:userId?" element={<UserProfilePage />} />
          <Route path="post/:postId"   element={<PostDetailPage />} />
          <Route path="create"         element={<CreatePostPage />} />
          <Route path="notifications"  element={<NotificationsPage />} />
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

