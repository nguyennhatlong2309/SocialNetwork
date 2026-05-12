/**
 * useNotifications.js — Hook fetch & mutate Notifications
 *
 * Tính năng:
 * - useNotifications(): Fetch danh sách thông báo thật từ API
 * - useMarkAsRead(): Mutation đánh dấu 1 notification đã đọc
 * - useMarkAllAsRead(): Mutation đánh dấu tất cả đã đọc
 * - useUnreadNotificationCount(): Đếm số chưa đọc (từ cache)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notificationApi from '../api/notificationApi';

// ─── Query key factory ───────────────────────────────────────────────────────
export const notificationKeys = {
  all: ['notifications'],
  list: (params) => ['notifications', 'list', params],
};

// ─── Icon mapping (type string → icon name để UI quyết định render) ──────────
const TYPE_ICON_MAP = {
  like: 'Heart',
  comment: 'MessageSquare',
  follow: 'UserPlus',
  mention: 'AtSign',
  message: 'MessageCircle',
};

const TYPE_COLOR_MAP = {
  like: '#e05c6e',
  comment: '#5c9cbf',
  follow: '#7c5cbf',
  mention: '#bf7c5c',
  message: '#34a853',
};

// ─── Helper: format NotificationDto → shape dùng trong UI ───────────────────
function formatNotification(n) {
  return {
    id: n.id,
    type: n.type,
    iconName: TYPE_ICON_MAP[n.type] ?? 'Bell',
    iconColor: TYPE_COLOR_MAP[n.type] ?? '#888',
    actor: n.senderName ?? 'Someone',
    actorColor: TYPE_COLOR_MAP[n.type] ?? '#888',
    // Dùng senderName làm màu avatar (consistent từ senderId)
    senderId: n.senderId,
    action: n.content ?? '',
    preview: null,   // backend chưa có separate preview, dùng content
    timeAgo: timeSince(n.createdAt),
    createdAt: n.createdAt,
    unread: !n.isRead,
    referenceId: n.referenceId ?? null,
    showFollowBack: n.type === 'follow',
  };
}

function timeSince(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    [31536000, 'year'], [2592000, 'month'], [86400, 'day'],
    [3600, 'hour'], [60, 'minute'],
  ];
  for (const [sec, label] of intervals) {
    const val = Math.floor(seconds / sec);
    if (val >= 1) return `${val} ${label}${val > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
}

// ═══════════════════════════════════════════════════════════════════════════
// Hook: useNotifications
// ═══════════════════════════════════════════════════════════════════════════
export function useNotifications(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: notificationKeys.list({ page, pageSize }),
    queryFn: async () => {
      const res = await notificationApi.getNotifications(page, pageSize);
      // axiosClient unwrap lần 1: res = ApiResponse<NotificationDto[]>
      // Backend: { data: NotificationDto[], success: true }
      const list = res?.data ?? res;
      return Array.isArray(list) ? list.map(formatNotification) : [];
    },
    // Polling mỗi 30 giây để bắt notifications mới khi chưa có SignalR push
    refetchInterval: 1000 * 30,
    refetchIntervalInBackground: false,
    staleTime: 1000 * 15, // 15 giây
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Hook: useMarkAsRead
// ═══════════════════════════════════════════════════════════════════════════
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => notificationApi.markAsRead(id),
    onSuccess: (_data, id) => {
      // Cập nhật optimistic: đánh dấu notification đó là đã đọc
      queryClient.setQueriesData({ queryKey: notificationKeys.all }, (old = []) =>
        old.map(n => n.id === id ? { ...n, unread: false } : n)
      );
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Hook: useMarkAllAsRead
// ═══════════════════════════════════════════════════════════════════════════
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      // Cập nhật tất cả notifications trong cache thành đã đọc
      queryClient.setQueriesData({ queryKey: notificationKeys.all }, (old = []) =>
        old.map(n => ({ ...n, unread: false }))
      );
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Helper hook: đếm số thông báo chưa đọc (dùng cho badge trên navbar)
// ═══════════════════════════════════════════════════════════════════════════
export function useUnreadNotificationCount() {
  const { data = [] } = useNotifications();
  return data.filter(n => n.unread).length;
}
