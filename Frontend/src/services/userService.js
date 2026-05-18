import api from '../api/axiosClient';

export const userService = {
    getUserProfile: async (userId) => {
        return await api.get(`/users/${userId}/profile`);
    },

    toggleFollow: async (userId) => {
        return await api.post(`/users/${userId}/follow`);
    },

    getUserPosts: async (userId, page = 1, pageSize = 10) => {
        return await api.get(`/users/${userId}/posts`, {
            params: { page, pageSize }
        });
    },

    searchUsers: async (query, count = 10) => {
        return await api.get('/users/search', {
            params: { q: query, count }
        });
    }
};
