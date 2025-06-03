import React, { useState, useEffect } from 'react';
import { ExpenseCategory, AccountType, FamilyMember } from '../../types';
import { XIcon, AlertCircleIcon, Loader2Icon } from 'lucide-react';
import { formatDateToYYYYMMDD } from '../../utils/dateUtils';
import { familyApi, budgetApi } from '../../api';
import { useNavigate } from 'react-router-dom';

interface ExpenseFormProps {
  onClose: () => void;
  isPlanned: boolean;
  onExpenseAdded?: (expense: Expense) => void;
}

interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  date: Date;
  familyMemberId: string;
  description: string;
  account: number;
  isPlanned: boolean;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onClose, isPlanned, onExpenseAdded }) => {
  const [familyMemberId, setFamilyMemberId] = useState<string>('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [familyId, setFamilyId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [accountBalances, setAccountBalances] = useState<Record<AccountType, number>>({
    [AccountType.Main]: 0,
    [AccountType.Savings]: 0,
    [AccountType.Investment]: 0
  });
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType>(AccountType.Main);
  
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const currentMember = await familyApi.getCurrentMember();
        const members = await familyApi.getMembers(currentMember.data.member.familyId);

        if (isMounted) {
          if (currentMember.data.isMember) {
            setFamilyMemberId(currentMember.data.member.id);
          } else {
            navigate('/families/create');
            return;
          }

          const accounts = await budgetApi.accounts.getFamilyAccounts(currentMember.data.member.familyId);
          setFamilyMembers(members);
          setFamilyId(currentMember.data.member.familyId);
          
          // Инициализация балансов
          const initialBalances = {
            [AccountType.Main]: 0,
            [AccountType.Savings]: 0,
            [AccountType.Investment]: 0
          };
  
          // Обработка счетов
          const updatedBalances = accounts.reduce((acc, account) => {
            switch (account.accountType) {
              case 0: // Текущий капитал
                acc[AccountType.Main] = account.balance;
                break;
              case 1: // Резервный
                acc[AccountType.Savings] = account.balance;
                break;
              case 2: // Накопления на инвестиции
                acc[AccountType.Investment] = account.balance;
                break;
            }
            return acc;
          }, { ...initialBalances });
          
          
          setAccountBalances(updatedBalances);
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

    loadData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.FOOD);
  const [date, setDate] = useState<string>(formatDateToYYYYMMDD(new Date()));
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  const totalBalance = 
    Number(accountBalances[AccountType.Main]) +
    Number(accountBalances[AccountType.Savings]) +
    Number(accountBalances[AccountType.Investment]);

  const canAddExpense = (expenseAmount: number) => {
    return accountBalances[selectedAccountType] - expenseAmount >= 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isPlanned && !canAddExpense(amount)) {
      setError(`Невозможно добавить расход. Баланс на счете "${selectedAccountType}" станет отрицательным.`);
      return;
    }
    
    try {
      const expenseData = {
        amount,
        category,
        date: new Date(date).toISOString(),
        familyMemberId,
        description,
        isPlanned,
        accountType: selectedAccountType == AccountType.Main ? 0 : selectedAccountType == AccountType.Savings ? 1 : 2
      };

      const newExpense = await budgetApi.expenses.create(expenseData);
      
      if (onExpenseAdded) {
        onExpenseAdded(newExpense);
      }
      
      onClose();
      location.reload();
    } catch (error) {
      console.error('Failed to add expense:', error);
      setError('Произошла ошибка при добавлении расхода. Попробуйте снова.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2Icon className='animate-spin text-blue-500' size={32} />
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {isPlanned ? 'Планирование будущего расхода' : 'Добавление расхода'}
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <XIcon size={20} />
        </button>
      </div>
      
      {!isPlanned && (
        <div className="mb-4 space-y-2">
          {Object.values(AccountType).map(type => (
            <div key={type} className="flex justify-between items-center">
              <span>{type}:</span>
              <span className="font-medium">{accountBalances[type]?.toLocaleString()} ₽</span>
            </div>
          ))}
          {totalBalance <= 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 flex items-start">
              <AlertCircleIcon size={20} className="mr-2 flex-shrink-0" />
              <p className="text-sm">
                Внимание: Ваш общий баланс составляет {totalBalance.toLocaleString()} ₽. 
                Добавление новых расходов запрещено при отрицательном балансе.
              </p>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
<div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Сумма (₽)
            </label>
            <input
              type="number"
              id="amount"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Категория
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            >
              {Object.values(ExpenseCategory).map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Дата
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="familyMember" className="block text-sm font-medium text-gray-700 mb-1">
              Член семьи
            </label>
            <select
              id="familyMember"
              value={familyMemberId}
              onChange={(e) => setFamilyMemberId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              required
            >
              <option value="">-- Выберите члена семьи --</option>
              {familyMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.relationshipType})
                </option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Описание
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              placeholder="Введите краткое описание"
            />
          </div>

          <div>
            <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-1">
              Счет списания
            </label>
            <select
              id="accountType"
              value={selectedAccountType}
              onChange={(e) => setSelectedAccountType(e.target.value as AccountType)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              disabled={isPlanned}
            >
              {Object.values(AccountType).map(type => (
                <option key={type} value={type}>
                  {type} ({accountBalances[type]?.toLocaleString()} ₽)
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            type="submit"
            className={`px-4 py-2 ${isPlanned ? 'bg-amber-500 hover:bg-amber-600' : 'bg-red-500 hover:bg-red-600'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${isPlanned ? 'focus:ring-amber-500' : 'focus:ring-red-500'}`}
            disabled={!isPlanned && totalBalance <= 0}
          >
            {isPlanned ? 'Запланировать расход' : 'Добавить расход'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;