import React from 'react';
import { useBudget } from '../../context/BudgetContext';
import { authApi } from '../../api';
import { useEffect, useState } from 'react';
import { UserData } from '../../types';
import { 
  BanknoteIcon, 
  ShoppingCartIcon, 
  CalendarClockIcon,
  PiggyBankIcon,
  WalletIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from 'lucide-react';
import { formatDateToString } from '../../utils/dateUtils';
import { AccountType } from '../../types';

const Dashboard: React.FC = () => {
  const { 
    getBudgetSummary, 
    getFilteredIncomes, 
    getFilteredExpenses,
    accountBalance
  } = useBudget();
  

  const summary = getBudgetSummary();
  const recentIncomes = getFilteredIncomes().slice(-5).reverse();
  const recentExpenses = getFilteredExpenses().slice(-5).reverse();
  const [currentMember, setCurrentMember] = useState<UserData | null>(null);
  
  const totalBalance = 
  Number(accountBalance[AccountType.MAIN]) +
  Number(accountBalance[AccountType.SAVINGS]) +
  Number(accountBalance[AccountType.STASH]);

  useEffect(() => {
    const fetchCurrentUser  = async () => {
      const user = await authApi.getCurrentUser ();
      setCurrentMember(user);
    };
    fetchCurrentUser ();
  }, []);
    
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Добро пожаловать, {currentMember?.name}!
          </h1>
          <p className="text-gray-600">
            Обзор вашего семейного бюджета
          </p>
        </div>
      </div>
      
      {/* Карточки с общей информацией */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Общий баланс</p>
              <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {totalBalance.toLocaleString()} ₽
              </p>
            </div>
            <div className="rounded-full p-3 bg-blue-50">
              <WalletIcon size={24} className="text-blue-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Общий доход</p>
              <p className="text-2xl font-bold text-green-600">
                {summary.totalIncome.toLocaleString()} ₽
              </p>
            </div>
            <div className="rounded-full p-3 bg-green-50">
              <ArrowUpIcon size={24} className="text-green-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Общие расходы</p>
              <p className="text-2xl font-bold text-red-600">
                {summary.totalExpenses.toLocaleString()} ₽
              </p>
            </div>
            <div className="rounded-full p-3 bg-red-50">
              <ArrowDownIcon size={24} className="text-red-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Планируемые расходы</p>
              <p className="text-2xl font-bold text-amber-600">
                {summary.totalPlannedExpenses.toLocaleString()} ₽
              </p>
            </div>
            <div className="rounded-full p-3 bg-amber-50">
              <CalendarClockIcon size={24} className="text-amber-500" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Балансы счетов */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Балансы счетов</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Основной счёт</p>
              <p className="text-xl font-semibold text-gray-800">{accountBalance[AccountType.MAIN].toLocaleString()} ₽</p>
            </div>
            <WalletIcon size={28} className="text-blue-500" />
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Накопления</p>
              <p className="text-xl font-semibold text-gray-800">{accountBalance[AccountType.SAVINGS].toLocaleString()} ₽</p>
            </div>
            <PiggyBankIcon size={28} className="text-green-500" />
          </div>
          
          <div className="p-3 bg-purple-50 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Заначка</p>
              <p className="text-xl font-semibold text-gray-800">{accountBalance[AccountType.STASH].toLocaleString()} ₽</p>
            </div>
            <WalletIcon size={28} className="text-purple-500" />
          </div>
        </div>
      </div>
      
      {/* Последние операции */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Последние доходы */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Последние доходы</h2>
            <BanknoteIcon size={20} className="text-green-500" />
          </div>
          
          {recentIncomes.length > 0 ? (
            <div className="space-y-3">
              {recentIncomes.map((income) => (
                <div key={income.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <BanknoteIcon size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 capitalize">{income.type}</p>
                      <p className="text-xs text-gray-500">{formatDateToString(income.date)}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-green-600">+{income.amount.toLocaleString()} ₽</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Нет последних доходов</p>
          )}
        </div>
        
        {/* Последние расходы */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Последние расходы</h2>
            <ShoppingCartIcon size={20} className="text-red-500" />
          </div>
          
          {recentExpenses.length > 0 ? (
            <div className="space-y-3">
              {recentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <div className="bg-red-100 p-2 rounded-full mr-3">
                      <ShoppingCartIcon size={16} className="text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 capitalize">{expense.category}</p>
                      <p className="text-xs text-gray-500">{formatDateToString(expense.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {expense.isPlanned && (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full mr-2">
                        Запланировано
                      </span>
                    )}
                    <p className="font-semibold text-red-600">-{expense.amount.toLocaleString()} ₽</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Нет последних расходов</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;