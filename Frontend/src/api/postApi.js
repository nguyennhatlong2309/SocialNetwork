import axiosClient from './axiosClient';

const postApi = {
  getPosts(params) {
    const url = '/Posts';
    return axiosClient.get(url, { params });
  },
  getPostById(id) {
    const url = `/Posts/${id}`;
    return axiosClient.get(url);
  },
  createPost(data) {
    const url = '/Posts';
    return axiosClient.post(url, data);
  }
};

export default postApi;
