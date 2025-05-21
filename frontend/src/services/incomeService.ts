// src/services/incomeService.ts
import api from '../api';
import { Income } from '../types';

export const addIncome = async (income: Omit<Income, 'id' | 'date'>): Promise<Income> => {
  const response = await api.post<Income>('/incomes', {
    ...income,
    date: new Date().toISOString() // Автоматически добавляем текущую дату
  });
  return response.data;
};

export const getIncomes = async (params?: {
  memberId?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<Income[]> => {
  const response = await api.get<Income[]>('/incomes', { params });
  return response.data;
};