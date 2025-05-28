// api.ts
import axios from 'axios';

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
  logout: () => localStorage.removeItem('jwt_token'),
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
    (await api.get(`/familymembers/${familyId}`)).data,
  addMember: async (memberData: { familyId: string; name: string; relationshipType: string; incomeTypes: string[] }) =>
    (await api.post(`/familymembers`, memberData)).data,
  removeMember: async (memberId: string) => 
    (await api.delete(`/familymembers/${memberId}`)).data
};

export const budgetApi = {
  incomes: {
    create: async (incomeData: {
      amount: number;
      source: string;
      description?: string;
      familyMemberId: string;
      date?: string;
    }) => (await api.post('/incomes', incomeData)).data,

    getAll: async (filters?: {
      startDate?: string;
      endDate?: string;
      familyMemberId?: string;
    }) => (await api.get('/incomes', { params: filters })).data,

    update: async (id: string, updates: {
      amount?: number;
      source?: string;
      description?: string;
    }) => (await api.put(`/incomes/${id}`, updates)).data,

    delete: async (id: string) => (await api.delete(`/incomes/${id}`)).data
  },

  expenses: {
    create: async (expenseData: {
      amount: number;
      category: string;
      description?: string;
      familyMemberId: string;
      isPlanned?: boolean;
      date?: string;
    }) => (await api.post('/expenses', expenseData)).data,

    getAll: async (filters?: {
      startDate?: string;
      endDate?: string;
      category?: string;
      familyMemberId?: string;
      isPlanned?: boolean;
    }) => (await api.get('/expenses', { params: filters })).data,

    update: async (id: string, updates: {
      amount?: number;
      category?: string;
      description?: string;
      isPlanned?: boolean;
    }) => (await api.put(`/expenses/${id}`, updates)).data,

    delete: async (id: string) => (await api.delete(`/expenses/${id}`)).data
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