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

// В api.ts добавляем:
// Проверка валидности сессии на бекенде
export const validateSession = async (memberId: string): Promise<boolean> => {
  try {
    const response = await api.get(`/sessions/validate/${memberId}`);
    return response.data.isValid;
  } catch {
    return false;
  }
};

// Добавляем интерцептор для авторизации
api.interceptors.request.use((config) => {
  const savedSession = localStorage.getItem('budget_session');
  if (savedSession) {
    const session = JSON.parse(savedSession);
    if (session.isActive) {
      config.headers['X-Session-User'] = session.activeMemberId;
    }
  }
  return config;
});

export default api;