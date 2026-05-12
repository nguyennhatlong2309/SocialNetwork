import axiosClient from './axiosClient';

const postApi = {
  /**
   * Lấy danh sách bài post (phân trang).
   * @param {{ page?: number, pageSize?: number }} params
   */
  getPosts(params) {
    return axiosClient.get('/Posts', { params });
  },

  /**
   * Lấy chi tiết 1 bài post theo ID.
   */
  getPostById(id) {
    return axiosClient.get(`/Posts/${id}`);
  },

  /**
   * Tạo bài post mới, hỗ trợ upload nhiều ảnh/video.
   *
   * @param {{ content: string, visibility?: string, mediaFiles?: File[] }} data
   *
   * Tự động dùng multipart/form-data khi có file đính kèm.
   * Backend nhận: Content (string), Visibility (string), MediaFiles (file[]).
   */
  createPost({ content, visibility = 'public', mediaFiles = [] }) {
    const formData = new FormData();
    formData.append('Content', content ?? '');
    formData.append('Visibility', visibility);

    mediaFiles.forEach((file) => {
      formData.append('MediaFiles', file);
    });

    // Không set Content-Type thủ công — Axios tự detect FormData
    // và tự thêm "multipart/form-data; boundary=..." chính xác.
    return axiosClient.post('/Posts', formData);
  },

  /**
   * Toggle like trên bài post.
   * @param {number|string} postId
   */
  toggleLike(postId) {
    return axiosClient.post(`/Posts/${postId}/like`);
  },

  /**
   * Toggle save (bookmark) bài post.
   * @param {number|string} postId
   */
  toggleSave(postId) {
    return axiosClient.post(`/Posts/${postId}/save`);
  },

  /**
   * Lấy danh sách comments của post (phân trang).
   */
  getComments(postId, page = 1, pageSize = 20) {
    return axiosClient.get(`/Posts/${postId}/comments`, { params: { page, pageSize } });
  },

  /**
   * Thêm comment vào bài post.
   */
  addComment(postId, content, parentCommentId = null) {
    return axiosClient.post(`/Posts/${postId}/comments`, {
      content,
      ...(parentCommentId ? { parentCommentId } : {}),
    });
  },

  /**
   * Xóa comment.
   */
  deleteComment(postId, commentId) {
    return axiosClient.delete(`/Posts/${postId}/comments/${commentId}`);
  },
};

export default postApi;
