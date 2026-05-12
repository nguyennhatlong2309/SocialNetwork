import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:5231/api',
});

// Add a request interceptor
axiosClient.interceptors.request.use(
  function (config) {
    // Get token from local storage
    const storedUser = localStorage.getItem('aurasocial_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.accessToken) {
          config.headers.Authorization = `Bearer ${user.accessToken}`;
        }
      } catch (error) {
        console.error('Error parsing user from localStorage', error);
      }
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosClient.interceptors.response.use(
  function (response) {
    return response.data;
  },
  function (error) {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('aurasocial_user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default axiosClient;
