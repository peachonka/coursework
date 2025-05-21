// src/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Типы запросов для API
export type ApiResponse<T> = {
  data: T;
  status: number;
};

// Обработка ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;