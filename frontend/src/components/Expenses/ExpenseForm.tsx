import React, { useState, useEffect } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { ExpenseCategory } from '../../types';
import { XIcon, AlertCircleIcon } from 'lucide-react';
import { formatDateToYYYYMMDD } from '../../utils/dateUtils';
import { AccountType, FamilyMember } from '../../types';
import { familyApi } from '../../api';
import { useNavigate } from 'react-router-dom';

interface ExpenseFormProps {
  onClose: () => void;
  isPlanned: boolean;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onClose, isPlanned }) => {
  const { addExpense, canAddExpense, familyMembers, accountBalance } = useBudget();
  const [ familyMemberId, setFamilyMemberId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    let isMounted = true;

    const checkFamily = async () => {
      try {
        const cmember = (await familyApi.getCurrentMember()).data;
        if (isMounted) {
          if (cmember.isMember) {
            setFamilyMemberId(cmember.member.id);
          } else {
            navigate('/families/create');
          }
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

    checkFamily();

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
    Number(accountBalance[AccountType.MAIN]) +
    Number(accountBalance[AccountType.SAVINGS]) +
    Number(accountBalance[AccountType.STASH]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Проверка на отрицательный баланс для фактических расходов
    if (!isPlanned && !canAddExpense(amount)) {
      setError('Невозможно добавить расход. Общий баланс станет отрицательным.');
      return;
    }
    
    const success = await addExpense({
      amount,
      category,
      date: new Date(date),
      familyMemberId,
      description,
      isPlanned
    });
    
    if (success) {
      onClose();
    } else {
      setError('Невозможно добавить расход. Общий баланс станет отрицательным.');
    }
  };

  if (isLoading) {
    return <div className="text-center p-4">Загрузка данных семьи...</div>;
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
      
      {!isPlanned && totalBalance <= 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 flex items-start">
          <AlertCircleIcon size={20} className="mr-2 flex-shrink-0" />
          <p className="text-sm">
            Внимание: Ваш общий баланс составляет {totalBalance.toLocaleString()} ₽. 
            Добавление новых расходов запрещено при отрицательном балансе.
          </p>
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
              required
            />
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