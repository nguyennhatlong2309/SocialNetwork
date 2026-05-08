import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';
import OnboardingPage from './pages/OnboardingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NewsFeedPage from './pages/NewsFeedPage';
import UserProfilePage from './pages/UserProfilePage';
import PostDetailPage from './pages/PostDetailPage';
import CreatePostPage from './pages/CreatePostPage';
import InboxPage from './pages/InboxPage';
import ChatViewPage from './pages/ChatViewPage';
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
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicRoute><OnboardingPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected routes */}
      <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route path="feed" element={<NewsFeedPage />} />
        <Route path="explore" element={<NewsFeedPage />} />
        <Route path="profile/:userId?" element={<UserProfilePage />} />
        <Route path="post/:postId" element={<PostDetailPage />} />
        <Route path="create" element={<CreatePostPage />} />
        <Route path="inbox" element={<InboxPage />}>
          <Route path=":conversationId" element={<ChatViewPage />} />
        </Route>
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
