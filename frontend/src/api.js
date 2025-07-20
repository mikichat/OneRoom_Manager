import axios from 'axios';
import store from './store/index.js';

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
