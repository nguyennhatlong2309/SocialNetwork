import axiosClient from './axiosClient';

const adminApi = {
  /**
   * Lấy danh sách tất cả người dùng
   */
  getAllUsers() {
    return axiosClient.get('/Admin/users');
  },

  /**
   * Cấm một user
   * @param {number|string} userId
   */
  banUser(userId) {
    return axiosClient.post(`/Admin/users/${userId}/ban`);
  },

  /**
   * Bỏ cấm một user
   * @param {number|string} userId
   */
  unbanUser(userId) {
    return axiosClient.post(`/Admin/users/${userId}/unban`);
  },

  /**
   * Thăng cấp user thành admin
   * @param {number|string} userId
   */
  promoteToAdmin(userId) {
    return axiosClient.post(`/Admin/users/${userId}/promote`);
  }
};

export default adminApi;
