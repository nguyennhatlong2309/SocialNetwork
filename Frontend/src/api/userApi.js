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
};

export default userApi;
