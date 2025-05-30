// api.ts
import axios from 'axios';
import { AccountType, FamilyAccount } from './types';

const api = axios.create({
  baseURL: 'http://localhost:5080/api',
  withCredentials: true,
});



// Интерцепторы остаются без изменений
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && 
        !['/auth/login', '/auth/register'].includes(window.location.pathname)) {
      localStorage.removeItem('jwt_token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('jwt_token', data.token);
    return data;
  },
  register: async (email: string, password: string,  name: string) => {
    const { data } = await api.post('/auth/register', { email, password, name });
    localStorage.setItem('jwt_token', data.token);
    return data;
  },
  logout: async () => {
    // 1. Отправляем запрос на сервер для выхода
      await api.post('/auth/logout'); // или другой endpoint вашего API
      // 2. Очищаем локальное хранилище
      localStorage.removeItem('jwt_token');
      // 3. Очищаем заголовок авторизации
      delete api.defaults.headers.common['Authorization'];
  },
  getCurrentUser: async () => (await api.get('/auth/me')).data,
  updateProfile: async (userData: { name?: string; email?: string }) => 
    (await api.put('/auth/me', userData)).data,
  changePassword: async (currentPassword: string, newPassword: string) => 
    (await api.post('/auth/change-password', { currentPassword, newPassword })).data
};

export const familyApi = {
  createFamily: async (relationshipType: string, incomeTypes: string[]) => {
    const { data } = await api.post('/families/create', { relationshipType, incomeTypes });
    return data;
  },

  // Запрос на присоединение к семье
  requestToJoin: async (request: {
    creatorEmail: string;
    message?: string;
  }) => (await api.post('/families/request-join', request)).data,

  // Базовые CRUD операции
  getFamilies: async () => (await api.get('/families')).data,
  getFamily: async (id: string) => (await api.get(`/families/${id}`)).data,
  updateFamily: async (id: string, updates: { name?: string }) => 
    (await api.put(`/families/${id}`, updates)).data,
  deleteFamily: async (id: string) => (await api.delete(`/families/${id}`)).data,
  getCurrentFamily: () => api.get('/families/current'),

  // Управление участниками
  getCurrentMember: () => api.get('/familymembers/current'),
  getMembers: async (familyId: string) => 
    (await api.get(`/familymembers?familyId=${encodeURIComponent(familyId)}`)).data,
  addMember: async (memberData: { familyId: string; name: string; relationshipType: string; incomeTypes: string[] }) =>
    (await api.post(`/familymembers`, memberData)).data,
  removeMember: async (memberId: string) => 
    (await api.delete(`/familymembers`, {params: {memberId}})).data,
};

export const budgetApi = {
  accounts: {
    getFamilyAccounts: async (): Promise<FamilyAccount[]> => {
      try {
        const response = await api.get('/accounts/family');
        return response.data;
      } catch (error) {
        console.error('Failed to fetch family accounts:', error);
        throw error;
      }
    },

    getTotalFamilyBalance: async (): Promise<number> => {
      try {
        const accounts = await budgetApi.accounts.getFamilyAccounts();
        return accounts.reduce((sum, account) => sum + account.balance, 0);
      } catch (error) {
        console.error('Failed to calculate total balance:', error);
        throw error;
      }
    }
  },
  incomes: {
    create: async (incomeData: {
      amount: number;
      accountType: string;
      type: string; // Изменено с source на type для соответствия модели
      description?: string;
      familyMemberId: string;
      date?: string;
    }) => {
      try {
        const response = await api.post('/incomes', {
          ...incomeData,
          FamilyMemberId: incomeData.familyMemberId // Приводим к нужному регистру
        });
        return response.data;
      } catch (error) {
        console.error('Income creation failed:', error);
        throw error;
      }
    },

    getAll: async (filters?: {
      startDate?: string;
      endDate?: string;
      familyMemberId?: string;
    }) => {
      try {
        // Преобразуем параметры для бэкенда
        const params = {
          memberId: filters?.familyMemberId,
          startDate: filters?.startDate ? new Date(filters.startDate) : null,
          endDate: filters?.endDate ? new Date(filters.endDate) : null
        };
        
        const response = await api.get('/incomes', { params });
        return response.data;
      } catch (error) {
        console.error('Failed to fetch incomes:', error);
        throw error;
      }
    },

    update: async (id: string, updates: {
      amount?: number;
      type?: string; // Изменено с source на type
      description?: string;
    }) => {
      try {
        const response = await api.put(`/incomes/${id}`, updates);
        return response.data;
      } catch (error) {
        console.error('Income update failed:', error);
        throw error;
      }
    },

    delete: async (id: string) => {
      try {
        const response = await api.delete(`/incomes/${id}`);
        return response.data;
      } catch (error) {
        console.error('Income deletion failed:', error);
        throw error;
      }
    }
  },

  // Аналогичные исправления для expenses
  expenses: {
    create: async (expenseData: {
      amount: number;
      category: string;
      description?: string;
      familyMemberId: string;
      isPlanned?: boolean;
      date?: string;
    }) => {
      try {
        const response = await api.post('/expenses', {
          ...expenseData,
          FamilyMemberId: expenseData.familyMemberId
        });
        return response.data;
      } catch (error) {
        console.error('Expense creation failed:', error);
        throw error;
      }
    },

    getAll: async (filters?: {
      startDate?: string;
      endDate?: string;
      category?: string;
      familyMemberId?: string;
      isPlanned?: boolean;
    }) => {
      try {
        const params = {
          category: filters?.category,
          memberId: filters?.familyMemberId,
          isPlanned: filters?.isPlanned,
          startDate: filters?.startDate ? new Date(filters.startDate) : null,
          endDate: filters?.endDate ? new Date(filters.endDate) : null
        };
        
        const response = await api.get('/expenses', { params });
        return response.data;
      } catch (error) {
        console.error('Failed to fetch expenses:', error);
        throw error;
      }
    },

    update: async (id: string, updates: {
      amount?: number;
      category?: string;
      description?: string;
      isPlanned?: boolean;
    }) => {
      try {
        const response = await api.put(`/expenses/${id}`, updates);
        return response.data;
      } catch (error) {
        console.error('Expense update failed:', error);
        throw error;
      }
    },

    delete: async (id: string) => {
      try {
        const response = await api.delete(`/expenses/${id}`);
        return response.data;
      } catch (error) {
        console.error('Expense deletion failed:', error);
        throw error;
      }
    }
  }
};

export const reportApi = {
  getFamilyReport: async (familyId: string, period: {
    startDate: string;
    endDate: string;
  }) => (await api.get(`/reports/family/${familyId}`, { params: period })).data,

  getUserReport: async (period: { startDate: string; endDate: string }) => 
    (await api.get('/reports/user', { params: period })).data,

  getCategoryAnalysis: async (familyId: string, period: {
    startDate: string;
    endDate: string;
  }) => (await api.get(`/reports/categories/${familyId}`, { params: period })).data
};

export default api;