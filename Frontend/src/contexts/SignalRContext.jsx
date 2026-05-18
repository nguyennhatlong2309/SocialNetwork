/**
 * SignalRContext.jsx — Quản lý kết nối SignalR real-time
 *
 * Quản lý 2 Hub connections:
 *   1. NotificationHub (/hubs/notifications)
 *      → Lắng nghe "ReceiveNotification": push notification mới vào TanStack Query cache
 *   2. ChatHub (/hubs/chat)
 *      → Lắng nghe "ReceiveMessage": push tin nhắn mới vào conversation cache
 *      → Expose joinConversation / leaveConversation cho ChatView
 *
 * JWT Authentication:
 *   - Backend đọc token từ query string: ?access_token=<jwt>
 *   - Không thể dùng Authorization header với WebSocket
 *
 * Connection lifecycle:
 *   - Chỉ kết nối khi isAuthenticated = true
 *   - Tự động reconnect với exponential backoff
 *   - Dừng hoàn toàn khi logout (isAuthenticated = false)
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useState,
} from 'react';
import * as signalR from '@microsoft/signalr';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { notificationKeys } from '../hooks/useNotifications';
import { messageKeys, formatMessage } from '../hooks/useMessages';

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_HUB_URL = 'http://localhost:5231';

const SignalRContext = createContext(null);

// ─── Helper: tạo HubConnection với JWT qua query string ──────────────────────
function buildConnection(hubPath, accessToken) {
  return new signalR.HubConnectionBuilder()
    .withUrl(`${BASE_HUB_URL}${hubPath}`, {
      // Backend đọc token từ query string (WebSocket không hỗ trợ custom headers)
      accessTokenFactory: () => accessToken,
      // Bỏ qua negotiation để kết nối trực tiếp WebSocket, tránh lỗi CORS/Negotiate
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // backoff schedule (ms)
    .configureLogging(signalR.LogLevel.Warning)
    .build();
}

// ═══════════════════════════════════════════════════════════════════════════
// SignalRProvider
// ═══════════════════════════════════════════════════════════════════════════
export function SignalRProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  // Lưu HubConnection refs để access trong callbacks mà không gây re-render
  const notifConnRef = useRef(null);
  const chatConnRef = useRef(null);

  // Connection state (dùng cho debug / UI indicators nếu cần)
  const [notifState, setNotifState] = useState('Disconnected');
  const [chatState, setChatState] = useState('Disconnected');

  // Lưu userId để dùng trong formatMessage
  const currentUserIdRef = useRef(null);

  // ─── NotificationHub: xử lý khi nhận notification mới ──────────────────
  const handleReceiveNotification = useCallback((notification) => {
    // notification là NotificationDto từ server
    // Prepend vào đầu danh sách trong tất cả notification queries
    queryClient.setQueriesData({ queryKey: notificationKeys.all }, (old) => {
      if (!Array.isArray(old)) return old;

      // Format giống useNotifications.js
      const TYPE_COLOR_MAP = {
        like: '#e05c6e', comment: '#5c9cbf', follow: '#7c5cbf',
        mention: '#bf7c5c', message: '#34a853',
      };
      const TYPE_ICON_MAP = {
        like: 'Heart', comment: 'MessageSquare', follow: 'UserPlus',
        mention: 'AtSign', message: 'MessageCircle',
      };
      const formatted = {
        id: notification.id,
        type: notification.type,
        iconName: TYPE_ICON_MAP[notification.type] ?? 'Bell',
        iconColor: TYPE_COLOR_MAP[notification.type] ?? '#888',
        actor: notification.senderName ?? 'Someone',
        actorColor: TYPE_COLOR_MAP[notification.type] ?? '#888',
        senderId: notification.senderId,
        action: notification.content ?? '',
        preview: null,
        timeAgo: 'Just now',
        createdAt: notification.createdAt ?? new Date().toISOString(),
        unread: true, // mới nhận → chưa đọc
        referenceId: notification.referenceId ?? null,
        showFollowBack: notification.type === 'follow',
      };

      // Tránh duplicate nếu notification đã có trong cache
      const exists = old.some(n => n.id === formatted.id);
      return exists ? old : [formatted, ...old];
    });
  }, [queryClient]);

  // ─── ChatHub: xử lý khi nhận tin nhắn mới ──────────────────────────────
  const handleReceiveMessage = useCallback((message) => {
    // message là MessageDto từ server
    const conversationId = message.conversationId;
    if (!conversationId) return;

    const formatted = formatMessage(message, currentUserIdRef.current);

    // Append vào cuối conversation cache
    queryClient.setQueryData(messageKeys.messages(conversationId), (old) => {
      if (!Array.isArray(old)) return [formatted];

      // Tránh duplicate
      const exists = old.some(m => m.id === formatted.id);
      if (exists) return old;

      // Xóa optimistic message nếu có (trùng content từ cùng sender)
      const withoutOptimistic = old.filter(
        m => !(m._optimistic && m.content === formatted.content && m.fromMe)
      );
      return [...withoutOptimistic, formatted];
    });

    // Cập nhật lastMessage trong conversation list
    queryClient.setQueryData(messageKeys.conversations, (old) => {
      if (!Array.isArray(old)) return old;
      return old.map(conv =>
        conv.id === conversationId
          ? { ...conv, lastMessage: formatted, updatedAt: formatted.createdAt }
          : conv
      );
    });
  }, [queryClient]);

  // ─── Khởi tạo và quản lý connections ────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !user?.accessToken) {
      // Logout: dừng tất cả connections
      if (notifConnRef.current) {
        notifConnRef.current.stop();
        notifConnRef.current = null;
      }
      if (chatConnRef.current) {
        chatConnRef.current.stop();
        chatConnRef.current = null;
      }
      setNotifState('Disconnected');
      setChatState('Disconnected');
      return;
    }

    currentUserIdRef.current = user.id ?? user.userId ?? null;
    const token = user.accessToken;

    // ── NotificationHub ──
    const notifConn = buildConnection('/hubs/notifications', token);
    notifConnRef.current = notifConn;

    notifConn.on('ReceiveNotification', handleReceiveNotification);

    notifConn.onreconnecting(() => setNotifState('Reconnecting'));
    notifConn.onreconnected(() => setNotifState('Connected'));
    notifConn.onclose(() => setNotifState('Disconnected'));

    notifConn.start()
      .then(() => setNotifState('Connected'))
      .catch(err => {
        console.warn('[SignalR] NotificationHub connection failed:', err?.message ?? err);
        setNotifState('Disconnected');
      });

    // ── ChatHub ──
    const chatConn = buildConnection('/hubs/chat', token);
    chatConnRef.current = chatConn;

    chatConn.on('ReceiveMessage', handleReceiveMessage);

    chatConn.onreconnecting(() => setChatState('Reconnecting'));
    chatConn.onreconnected(() => setChatState('Connected'));
    chatConn.onclose(() => setChatState('Disconnected'));

    chatConn.start()
      .then(() => setChatState('Connected'))
      .catch(err => {
        console.warn('[SignalR] ChatHub connection failed:', err?.message ?? err);
        setChatState('Disconnected');
      });

    // Cleanup khi unmount hoặc khi user thay đổi
    return () => {
      notifConn.off('ReceiveNotification', handleReceiveNotification);
      notifConn.stop();

      chatConn.off('ReceiveMessage', handleReceiveMessage);
      chatConn.stop();
    };
  }, [isAuthenticated, user?.accessToken, handleReceiveNotification, handleReceiveMessage]);

  // ─── Expose: join/leave conversation group cho ChatView ──────────────────
  const joinConversation = useCallback(async (conversationId) => {
    const conn = chatConnRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;
    try {
      await conn.invoke('JoinConversation', Number(conversationId));
    } catch (err) {
      console.warn('[SignalR] JoinConversation failed:', err);
    }
  }, []);

  const leaveConversation = useCallback(async (conversationId) => {
    const conn = chatConnRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;
    try {
      await conn.invoke('LeaveConversation', Number(conversationId));
    } catch (err) {
      console.warn('[SignalR] LeaveConversation failed:', err);
    }
  }, []);

  const value = {
    notifState,
    chatState,
    joinConversation,
    leaveConversation,
    // Expose refs cho advanced use-cases
    notifConnection: notifConnRef,
    chatConnection: chatConnRef,
  };

  return (
    <SignalRContext.Provider value={value}>
      {children}
    </SignalRContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useSignalR() {
  const ctx = useContext(SignalRContext);
  if (!ctx) {
    throw new Error('useSignalR must be used within <SignalRProvider>');
  }
  return ctx;
}
