// src/auth.ts
import axios from 'axios';
import api from '../api';
import { AuthResponse, UserData } from '../types';

export const signUp = async (
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', {
    email,
    password,
    name
  });
  return response.data;
};

export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const signOut = (): void => {
  localStorage.removeItem('jwt_token');
};

export const getCurrentUser = async (): Promise<UserData | null> => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const storeToken = (token: string): void => {
  localStorage.setItem('jwt_token', token);
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Инициализация авторизации при загрузке приложения
const token = localStorage.getItem('jwt_token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}