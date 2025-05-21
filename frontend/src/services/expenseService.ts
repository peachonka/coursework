// src/services/expenseService.ts
import api from '../api';
import { Expense } from '../types';

export const addExpense = async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
  const response = await api.post<Expense>('/expenses', {
    ...expense,
    date: expense.date || new Date().toISOString() // Если дата не указана - текущая
  });
  return response.data;
};

export const getExpenses = async (params?: {
  memberId?: string;
  startDate?: Date;
  endDate?: Date;
  plannedOnly?: boolean;
}): Promise<Expense[]> => {
  const response = await api.get<Expense[]>('/expenses', { 
    params: {
      ...params,
      plannedOnly: params?.plannedOnly ? 'true' : undefined
    }
  });
  return response.data;
};

export const deleteExpense = async (id: string): Promise<void> => {
  await api.delete(`/expenses/${id}`);
};