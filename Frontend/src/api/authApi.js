// ⚠️  MOCK MODE – không gọi backend thật
// Để chuyển về API thật: đổi USE_MOCK = false
const USE_MOCK = true;

import { MOCK_USERS, simulateDelay } from './mockData';
import axiosClient from './axiosClient';

const authApiReal = {
  login(data) { return axiosClient.post('/Auth/login', data); },
  register(data) { return axiosClient.post('/Auth/register', data); },
  refreshToken(data) { return axiosClient.post('/Auth/refresh-token', data); },
};

const authApiMock = {
  async login({ usernameOrEmail, password }) {
    await simulateDelay(600);
    const user = MOCK_USERS.find(
      u => (u.email === usernameOrEmail || u.username === usernameOrEmail)
        && u.password === password
    );
    if (!user) {
      return Promise.reject({ message: 'Invalid credentials. Try alex@example.com / Password123!' });
    }
    return {
      data: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        accessToken: user.accessToken,
      }
    };
  },

  async register({ username, email, password, firstName, lastName }) {
    await simulateDelay(700);
    const exists = MOCK_USERS.find(u => u.email === email || u.username === username);
    if (exists) {
      return Promise.reject({ message: 'Email or username already taken.' });
    }
    const newUser = {
      userId: MOCK_USERS.length + 1,
      username,
      email,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim(),
      accessToken: `mock-token-new-${Date.now()}`,
    };
    MOCK_USERS.push(newUser);
    return {
      data: {
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        accessToken: newUser.accessToken,
      }
    };
  },

  async refreshToken() {
    await simulateDelay(200);
    return { data: { accessToken: 'mock-refreshed-token' } };
  },
};

const authApi = USE_MOCK ? authApiMock : authApiReal;
export default authApi;

