/**
 * notificationApi.js — API calls cho Notifications
 *
 * Endpoints:
 *   GET   /api/Notifications                → danh sách notifications (paginated)
 *   GET   /api/Notifications/unread-count   → số notification chưa đọc
 *   PATCH /api/Notifications/{id}/read      → đánh dấu 1 notification đã đọc
 *   PATCH /api/Notifications/read-all       → đánh dấu tất cả đã đọc
 */

import axiosClient from './axiosClient';

const notificationApi = {
  /**
   * Lấy danh sách thông báo của user hiện tại.
   * @param {number} page
   * @param {number} pageSize
   * @returns {Promise<NotificationDto[]>}
   */
  getNotifications(page = 1, pageSize = 20) {
    return axiosClient.get('/Notifications', { params: { page, pageSize } });
  },

  /**
   * Đếm số thông báo chưa đọc.
   * @returns {Promise<number>}
   */
  getUnreadCount() {
    return axiosClient.get('/Notifications/unread-count');
  },

  /**
   * Đánh dấu một thông báo là đã đọc.
   * @param {number|string} id
   */
  markAsRead(id) {
    return axiosClient.patch(`/Notifications/${id}/read`);
  },

  /**
   * Đánh dấu tất cả thông báo là đã đọc.
   */
  markAllAsRead() {
    return axiosClient.patch('/Notifications/read-all');
  },
};

export default notificationApi;
