import axiosClient from './axiosClient';

const userApi = {
  /**
   * Lấy danh sách user được gợi ý (những người chưa được follow).
   * @param {{ count?: number }} params
   */
  getSuggestedUsers(count = 10) {
    return axiosClient.get('/Users/suggested', { params: { count } });
  },

  /**
   * Toggle follow/unfollow một user.
   * Backend trả về: { isFollowing: boolean }
   * @param {number|string} userId
   */
  toggleFollow(userId) {
    return axiosClient.post(`/Users/${userId}/follow`);
  },

  /**
   * Lấy profile của một user.
   * @param {number|string} userId
   */
  getUserProfile(userId) {
    return axiosClient.get(`/Users/${userId}/profile`);
  },

  /**
   * Cập nhật email của user hiện tại
   * @param {string} email
   */
  updateEmail(email) {
    return axiosClient.put('/Users/me/email', { email });
  },

  /**
   * Thay đổi mật khẩu
   * @param {{ currentPassword, newPassword }} data
   */
  changePassword(data) {
    return axiosClient.put('/Users/me/password', data);
  },
};

export default userApi;
