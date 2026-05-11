/**
 * useNotifications.js — Hook fetch notifications
 *
 * Tính năng:
 * - refetchInterval: Polling mỗi 30 giây để cập nhật thông báo mới
 * - refetchIntervalInBackground: false — dừng polling khi tab bị ẩn để tiết kiệm tài nguyên
 */

import { useQuery } from '@tanstack/react-query';
import { MOCK_NOTIFICATIONS, simulateDelay } from '../api/mockData';

export const notificationKeys = {
  all: ['notifications'],
};

// TODO: Khi có backend thật, thay bằng axiosClient.get('/notifications')
async function fetchNotifications() {
  await simulateDelay(300);
  return MOCK_NOTIFICATIONS;
}

export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.all,
    queryFn: fetchNotifications,
    // Polling mỗi 30 giây để bắt notifications mới
    refetchInterval: 1000 * 30,
    // Không poll khi user đang ở tab khác (tiết kiệm battery/bandwidth)
    refetchIntervalInBackground: false,
  });
}

// Helper: đếm số thông báo chưa đọc
export function useUnreadNotificationCount() {
  const { data = [] } = useNotifications();
  return data.filter(n => !n.read).length;
}
