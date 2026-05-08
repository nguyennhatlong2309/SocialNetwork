import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:5231/api',
  headers: {
    'Content-Type': 'application/json',
  },
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
    return Promise.reject(error.response?.data || error.message);
  }
);

export default axiosClient;
