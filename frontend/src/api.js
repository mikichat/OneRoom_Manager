import axios from 'axios';
import store from './store/index.js';
import router from './router/index.js';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = store.state.auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      store.dispatch('auth/logout');
      router.push('/login');
      return Promise.reject(error);
    }

    // Handle 403 Forbidden - show snackbar
    if (error.response?.status === 403) {
      store.dispatch('showSnackbar', {
        message: '접근 권한이 없습니다.',
        color: 'error',
      });
      return Promise.reject(error);
    }

    // Handle network errors
    if (!error.response) {
      store.dispatch('showSnackbar', {
        message: '네트워크 연결을 확인해주세요.',
        color: 'error',
      });
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// Excel related API calls
export const downloadExcel = (endpoint) => apiClient.get(`${endpoint}/excel/download`, { responseType: 'blob' });
export const uploadExcel = (endpoint, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post(`${endpoint}/excel/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default apiClient;
