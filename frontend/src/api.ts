import axios from 'axios';
import { FamilyAccount } from './types';

const api = axios.create({
  baseURL: 'http://localhost:5080/api',
  withCredentials: true,
});

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
  register: async (email: string, password: string) => {
    const { data } = await api.post('/auth/register', { email, password});
    localStorage.setItem('jwt_token', data.token);
    return data;
  },
  logout: async () => {
      await api.post('/auth/logout');
      localStorage.removeItem('jwt_token');
      delete api.defaults.headers.common['Authorization'];
  },
  getCurrentUser: async () => (await api.get('/auth/me')).data,
  // updateProfile: async (userData: { email?: string }) => 
  //   (await api.put('/auth/me', userData)).data,
  // changePassword: async (currentPassword: string, newPassword: string) => 
  //   (await api.post('/auth/change-password', { currentPassword, newPassword })).data
};

export const familyApi = {
  createFamily: async (name: string, relationshipType: string, incomeTypes: string[]) => {
    const { data } = await api.post('/families/create', { name, relationshipType, incomeTypes });
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
  addMember: async (memberData: { familyId: string; name: string; userId: string; relationshipType: string; incomeTypes: string[], role: string }) =>
    (await api.post(`/familymembers`, memberData)).data,
  removeMember: async (memberId: string) => 
    (await api.delete(`/familymembers`, {params: {memberId}})).data,
  updateMember: async (memberId: string, memberData: { name?: string; relationshipType?: string; incomeTypes?: string[], role?: string }) =>
    (await api.put(`/familymembers?memberId=${encodeURIComponent(memberId)}`, memberData)).data,

  getIncomingRequests: async () => {
    const response = await api.get('/families/requests/incoming');
    return response.data;
  },
  getOutgoingRequests: async () => {
    const response = await api.get('/families/requests/outgoing');
    return response.data;
  },
  acceptRequest: async (requestId: string, memberId: string) => {
    const response = await api.post(`/families/requests/${requestId}/accept?memberId=${memberId}`);
    return response.data;
  },
  rejectRequest: async (requestId: string) => {
    const response = await api.post(`/families/requests/${requestId}/reject`);
    return response.data;
  }
};

export const budgetApi = {
  accounts: {
    getFamilyAccounts: async (familyId: string): Promise<FamilyAccount[]> => {
      try {
        const response = await api.get(`/accounts?familyId=${encodeURIComponent(familyId)}`);
        return response.data;
      } catch (error) {
        console.error('Failed to fetch family accounts:', error);
        throw error;
      }
    },

    updateAccountBalance: async (familyId: string, accountType: string, balance: number) => {
      const response = await api.patch(`/accounts?familyId=${encodeURIComponent(familyId)}&accountType=${encodeURIComponent(accountType)}`, { balance });
      return response.data;
    },

    getTotalFamilyBalance: async (familyId: string): Promise<number> => {
      try {
        const accounts = await budgetApi.accounts.getFamilyAccounts(familyId);
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
      type: string;
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
      accountType: number;
      date?: string;
    }) => {
      try {
        const response = await api.post('/expenses', {
          ...expenseData,
          FilterMemberId: expenseData.familyMemberId
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

    complete: (expenseId: string) => 
    api.patch(`/expenses/${expenseId}/complete`),

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