// ⚠️  MOCK MODE – không gọi backend thật
// Để chuyển về API thật: đổi USE_MOCK = false
const USE_MOCK = true;

import { MOCK_POSTS, simulateDelay } from './mockData';
import axiosClient from './axiosClient';

const postApiReal = {
  getPosts(params) { return axiosClient.get('/Posts', { params }); },
  getPostById(id) { return axiosClient.get(`/Posts/${id}`); },
  createPost(data) { return axiosClient.post('/Posts', data); },
};

const postApiMock = {
  async getPosts({ page = 1, pageSize = 20 } = {}) {
    await simulateDelay(500);
    const start = (page - 1) * pageSize;
    const data = MOCK_POSTS.slice(start, start + pageSize);
    return {
      data,
      pagination: { page, pageSize, total: MOCK_POSTS.length }
    };
  },

  async getPostById(id) {
    await simulateDelay(300);
    const post = MOCK_POSTS.find(p => p.id === Number(id));
    if (!post) return Promise.reject({ message: 'Post not found.' });
    return { data: post };
  },

  async createPost({ content, mediaUrls = [] }) {
    await simulateDelay(600);
    const newPost = {
      id: MOCK_POSTS.length + 1,
      userId: 1,
      user: { username: 'alex_m', fullName: 'Alex Morgan', avatarUrl: null },
      content,
      media: mediaUrls.map((url, i) => ({ id: i + 1, mediaUrl: url })),
      likeCount: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      comments: [],
    };
    MOCK_POSTS.unshift(newPost);
    return { data: newPost };
  },
};

const postApi = USE_MOCK ? postApiMock : postApiReal;
export default postApi;

