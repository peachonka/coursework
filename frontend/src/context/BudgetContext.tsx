// src/context/BudgetContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  FamilyMember, 
  Income, 
  Expense,
  AccountBalance,
  BudgetSummary,
  DateRange,
  AccountType,
  ExpenseCategory,
  // RelationshipType,
  // IncomeType
} from '../types';
import api, { authApi, familyApi } from '../api';
import { useNavigate } from 'react-router-dom';


// // Типы для API ответов
// interface ApiResponse<T> {
//   data: T;
//   status: number;
// }



interface BudgetContextType {
  // Состояние
  familyMembers: FamilyMember[];
  incomes: Income[];
  expenses: Expense[];
  accountBalance: AccountBalance;
  isLoading: boolean;
  error: string | null;

  // Управление членами семьи
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => Promise<void>;
  removeFamilyMember: (id: string) => Promise<void>;
  updateFamilyMember: (id: string, updates: Partial<FamilyMember>) => Promise<void>;

  // Управление доходами
  addIncome: (income: Omit<Income, 'id'>) => Promise<void>;
  getIncomesByMember: (memberId: string) => Income[];
  getFilteredIncomes: (dateRange?: DateRange) => Income[];

  // Управление расходами
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<void>;
  getExpensesByCategory: (category: ExpenseCategory) => Expense[];
  getFilteredExpenses: (dateRange?: DateRange, plannedOnly?: boolean) => Expense[];


  // Отчеты и аналитика
  getBudgetSummary: (dateRange?: DateRange) => BudgetSummary;
  getAccountHistory: (account: AccountType) => (Income | Expense)[];
  canAddExpense: (amount: number) => boolean;

  // Вспомогательные методы
  getFamilyMemberById: (id: string) => FamilyMember | undefined;
  recalculateBalances: () => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

interface BudgetProviderProps {
  children: ReactNode;
}

export const BudgetProvider: React.FC<BudgetProviderProps> = ({ children }) => {
  // Состояние
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [accountBalance, setAccountBalance] = useState<AccountBalance>({
    [AccountType.MAIN]: 0,
    [AccountType.SAVINGS]: 0,
    [AccountType.STASH]: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFamilyId, setCurrentFamilyId] = useState<string>('');
  const navigate = useNavigate();

  // Загрузка начальных данных
  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
          try {
            const cfamily = (await familyApi.getCurrentFamily()).data;
              
              if (cfamily.hasFamily) {
                setCurrentFamilyId(cfamily.family.id);
                const [membersResponse, incomesResponse, expensesResponse] = await Promise.all([
                familyApi.getMembers(cfamily.family.id),
                api.get<Income[]>('/incomes'),
                api.get<Expense[]>('/expenses')
              ]);
        
              setFamilyMembers(membersResponse);
              setIncomes(incomesResponse.data);
              setExpenses(expensesResponse.data);

              await calculateBalances();
              } else {
                navigate('/families/create');
              }
          } catch (err) {
            if (isMounted) {
              console.error('Ошибка:', err);
              navigate('/families/create');
            }
          } finally {
            if (isMounted) {
              setIsLoading(false);
            }
          }
        };
  
    loadInitialData();
  }, []);

  // Расчет балансов
  const calculateBalances = async () => {
    try {
      const [incomesData, expensesData] = await Promise.all([
        api.get<Income[]>('/incomes').then(r => r.data),
        api.get<Expense[]>('/expenses?plannedOnly=false').then(r => r.data)
      ]);
  
      // Инициализация баланса
      const newBalance: AccountBalance = {
        [AccountType.MAIN]: 0,
        [AccountType.SAVINGS]: 0,
        [AccountType.STASH]: 0
      };
  
      // Начисление доходов
      incomesData.forEach(income => {
        newBalance[income.accountType] += income.amount;
      });
  
      // Расчет расходов
      const totalExpenses = expensesData.reduce((sum, expense) => sum + expense.amount, 0);
      let remainingExpenses = totalExpenses;
  
      // Списание с текущего капитала
      newBalance[AccountType.MAIN] -= remainingExpenses;
      if (newBalance[AccountType.MAIN] < 0) {
        remainingExpenses = Math.abs(newBalance[AccountType.MAIN]);
        newBalance[AccountType.MAIN] = 0;
      } else {
        remainingExpenses = 0;
      }
  
      // Списание с резервного капитала
      if (remainingExpenses > 0) {
        newBalance[AccountType.SAVINGS] -= remainingExpenses;
        if (newBalance[AccountType.SAVINGS] < 0) {
          remainingExpenses = Math.abs(newBalance[AccountType.SAVINGS]);
          newBalance[AccountType.SAVINGS] = 0;
        } else {
          remainingExpenses = 0;
        }
      }
  
      // Списание с инвестиционного капитала
      if (remainingExpenses > 0) {
        newBalance[AccountType.STASH] -= remainingExpenses;
        if (newBalance[AccountType.STASH] < 0) {
          newBalance[AccountType.STASH] = 0;
        }
      }
  
      setAccountBalance(newBalance);
    } catch (err) {
      console.error('Failed to calculate balances:', err);
      throw err;
    }
  };

  // Члены семьи
  const addFamilyMember = async (member: Omit<FamilyMember, 'id'>) => {
    try {
      const response = await api.post<FamilyMember>('/familymembers', {
        name: member.name,
        relationshipType: member.relationshipType,
        incomeTypes: member.incomeTypes,
        userId: member.userId || null,
        familyId: member.familyId,
        role: member.role || "member"
      });

      setFamilyMembers(prev => [...prev, response.data]);
      return;
    } catch (err) {
      console.error('Ошибка при добавлении члена семьи:', err);
      throw err;
    }
  };

  const removeFamilyMember = async (id: string) => {
    try {
      await api.delete(`/familymembers/${id}`);
      setFamilyMembers(prev => prev.filter(m => m.id !== id));
      // Удаляем связанные доходы и расходы
      setIncomes(prev => prev.filter(i => i.familyMemberId !== id));
      setExpenses(prev => prev.filter(e => e.familyMemberId !== id));
      await calculateBalances();
    } catch (err) {
      console.error('Failed to remove family member:', err);
      throw err;
    }
  };

  // Доходы
  const addIncome = async (income: Omit<Income, 'id' | 'date'>) => {
    try {
      const newIncome = {
        ...income,
        date: new Date().toISOString()
      };
      const response = await api.post<Income>('/incomes', newIncome);
      setIncomes(prev => [...prev, response.data]);
      await calculateBalances();
    } catch (err) {
      console.error('Failed to add income:', err);
      throw err;
    }
  };

  // Расходы
  const addExpense = async (expense: Omit<Expense, 'id'>): Promise<boolean> => {
    try {
      // Для плановых расходов не проверяем баланс
      if (!expense.isPlanned) {
        const totalBalance = Object.values(accountBalance).reduce((a, b) => a + b, 0);
        if (expense.amount > totalBalance) {
          return false;
        }
      }

      const response = await api.post<Expense>('/expenses', expense);
      setExpenses(prev => [...prev, response.data]);
      
      if (!expense.isPlanned) {
        await calculateBalances();
      }
      
      return true;
    } catch (err) {
      console.error('Failed to add expense:', err);
      throw err;
    }
  };

  const canAddExpense = (amount: number): boolean => {
    const totalBalance = Object.values(accountBalance).reduce((a, b) => a + b, 0);
    return amount <= totalBalance;
  };

  // Отчеты
  const getBudgetSummary = (dateRange?: DateRange): BudgetSummary => {
    const filteredIncomes = dateRange 
      ? incomes.filter(i => new Date(i.date) >= dateRange.startDate && new Date(i.date) <= dateRange.endDate)
      : incomes;

    const filteredExpenses = dateRange
      ? expenses.filter(e => new Date(e.date) >= dateRange.startDate && new Date(e.date) <= dateRange.endDate)
      : expenses;

    const totalIncome = filteredIncomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = filteredExpenses.filter(e => !e.isPlanned).reduce((sum, e) => sum + e.amount, 0);
    const totalPlanned = filteredExpenses.filter(e => e.isPlanned).reduce((sum, e) => sum + e.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      totalPlannedExpenses: totalPlanned,
      balance: totalIncome - totalExpenses,
      dateRange: dateRange || {
        startDate: new Date(0),
        endDate: new Date()
      }
    };
  };

  const getFilteredIncomes = (dateRange?: DateRange): Income[] => {
    if (!dateRange) return incomes;
    
    return incomes.filter(income => {
      const incomeDate = new Date(income.date);
      return incomeDate >= dateRange.startDate && incomeDate <= dateRange.endDate;
    });
  };

  const getFilteredExpenses = (dateRange?: DateRange, plannedOnly = false): Expense[] => {
    let filtered = expenses;
    
    if (plannedOnly) {
      filtered = filtered.filter(expense => expense.isPlanned);
    }
    
    if (dateRange) {
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= dateRange.startDate && expenseDate <= dateRange.endDate;
      });
    }
    
    return filtered;
  };

  // Провайдер контекста
  const contextValue: BudgetContextType = {
    familyMembers,
    incomes,
    expenses,
    accountBalance,
    getFilteredIncomes,
    getFilteredExpenses,
    isLoading,
    error,
    addFamilyMember,
    removeFamilyMember,
    updateFamilyMember: async (id, updates) => {
      try {
        const response = await api.patch<FamilyMember>(`/familymembers/${id}`, updates);
        setFamilyMembers(prev => prev.map(m => m.id === id ? response.data : m));
      } catch (err) {
        console.error('Failed to update member:', err);
        throw err;
      }
    },

    addIncome,
    getIncomesByMember: (memberId) => incomes.filter(i => i.familyMemberId === memberId),

    addExpense,
    deleteExpense: async (id) => {
      try {
        await api.delete(`/expenses/${id}`);
        setExpenses(prev => prev.filter(e => e.id !== id));
        await calculateBalances();
      } catch (err) {
        console.error('Failed to delete expense:', err);
        throw err;
      }
    },
    getExpensesByCategory: (category) => expenses.filter(e => e.category === category),

    getBudgetSummary,
    getAccountHistory: (account) => [
      ...incomes.filter(i => i.accountType === account),
      ...expenses.filter(e => !e.isPlanned)
    ],
    canAddExpense,

    getFamilyMemberById: (id) => familyMembers.find(m => m.id === id),
    recalculateBalances: calculateBalances
  };

  return (
    <BudgetContext.Provider value={contextValue}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = (): BudgetContextType => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};