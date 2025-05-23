// api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5080/api',
  withCredentials: true,
});

// Интерцептор для JWT токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Обработчик ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Если 401 ошибка - очищаем данные и перенаправляем
      if (window.location.pathname !== '/auth/login' && window.location.pathname !== '/auth/register') {
        localStorage.removeItem('jwt_token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('jwt_token', response.data.token);
    return response.data;
  },

  register: async (email: string, password: string, name: string) => {
    const response = await api.post('/auth/register', { 
      email, 
      password,
      name 
    });
    localStorage.setItem('jwt_token', response.data.token);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('jwt_token');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export default api;