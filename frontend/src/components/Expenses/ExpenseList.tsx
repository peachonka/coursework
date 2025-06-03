import React, { useState, useEffect } from 'react';
import { Expense, DateRange, FamilyMember } from '../../types';
import { ShoppingCartIcon, PlusIcon, FilterIcon, CalendarClockIcon, Loader2Icon, CheckIcon } from 'lucide-react';
import { formatDateToString } from '../../utils/dateUtils';
import ExpenseForm from './ExpenseForm';
import FilterForm from '../shared/FilterForm';
import { budgetApi, familyApi } from '../../api';

const ExpenseList: React.FC = () => {
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isAddingPlannedExpense, setIsAddingPlannedExpense] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [showPlannedOnly, setShowPlannedOnly] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredExpenseId, setHoveredExpenseId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Загрузка данных
  useEffect(() => {
    const loadData = async () => {
      try {
        const currentMember = await familyApi.getCurrentMember();
        const expensesData = await budgetApi.expenses.getAll({
          startDate: dateRange?.startDate?.toISOString(),
          endDate: dateRange?.endDate?.toISOString(),
          isPlanned: showPlannedOnly || undefined
        });
        const members = await familyApi.getMembers(currentMember.data.member.familyId);
        setFamilyMembers(members);
        setExpenses(expensesData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dateRange, showPlannedOnly]);

  const handleToggleFilter = () => {
    setShowFilter(!showFilter);
  };
  
  const handleTogglePlannedOnly = () => {
    setShowPlannedOnly(!showPlannedOnly);
  };
  
  const handleFilterApply = (range: DateRange | undefined) => {
    setDateRange(range);
    setShowFilter(false);
  };

  const handleCompletePlannedExpense = async (expenseId: string) => {
    setIsProcessing(expenseId);
    try {
      // Отправляем запрос на сервер для выполнения расхода
      await budgetApi.expenses.complete(expenseId);
      
      // Обновляем локальное состояние
      setExpenses(prev => prev.map(expense => 
        expense.id === expenseId ? { ...expense, isPlanned: false } : expense
      ));
      location.reload();
    } catch (error) {
      console.error('Failed to complete planned expense:', error);
    } finally {
      setIsProcessing(null);
    }
  };
  
  const getFamilyMemberName = (id: string): FamilyMember => {
    console.log(familyMembers);
    const member = familyMembers.find((m: FamilyMember) => m.id === id);
    return member!;
  };

  const handleExpenseAdded = (newExpense: Expense) => {
    setExpenses(prev => [...prev, newExpense]);
    setIsAddingExpense(false);
    setIsAddingPlannedExpense(false);
  };

  const filteredExpenses = showPlannedOnly 
  ? expenses.filter(expense => expense.isPlanned)
  : expenses;

  // Общая сумма расходов
  const totalExpenses = filteredExpenses.reduce((sum: number, expense: Expense) => sum + expense.amount, 0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2Icon className='animate-spin text-blue-500' size={32} />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-start space-y-2 flex-col justify-between">
        <div className="flex items-center">
          <ShoppingCartIcon size={24} className="text-red-500 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800 mr-10">Расходы</h1>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:justify-between w-full">
          <div className='flex space-x-2 flex-row h-10'>
            <button
              onClick={handleTogglePlannedOnly}
              className={`flex items-center px-3 py-2 ${showPlannedOnly ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-700'} rounded-md hover:bg-opacity-90 transition-colors`}
            >
              <CalendarClockIcon size={16} className="mr-1" />
              {showPlannedOnly ? 'Только запланированные' : 'Все расходы'}
            </button>
            <button
              onClick={handleToggleFilter}
              className={`flex items-center px-3 py-2 ${showFilter ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} rounded-md hover:bg-opacity-90 transition-colors`}
            >
              <FilterIcon size={16} className="mr-1" />
              Фильтр
            </button>
          </div>
          
          <div className='flex lg:space-x-2 lg:space-y-0 space-y-2 lg:flex-row flex-col'>
            <button
              onClick={() => setIsAddingPlannedExpense(true)}
              className="flex items-center px-3 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors h-10"
            >
              <PlusIcon size={16} className="mr-1" />
              Запланировать
            </button>
            <button
              onClick={() => setIsAddingExpense(true)}
              className="flex items-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors h-10"
            >
              <PlusIcon size={16} className="mr-1" />
              Добавить расход
            </button>
            </div>
        </div>
      </div>
      
      {showFilter && (
        <FilterForm 
          onApply={handleFilterApply} 
          onCancel={() => setShowFilter(false)} 
          initialDateRange={dateRange}
        />
      )}
      
      {isAddingPlannedExpense && (
        <ExpenseForm 
          onClose={() => setIsAddingPlannedExpense(false)} 
          isPlanned={true}
          onExpenseAdded={handleExpenseAdded}
        />
      )}
      
      {isAddingExpense && (
        <ExpenseForm 
          onClose={() => setIsAddingExpense(false)} 
          isPlanned={false}
          onExpenseAdded={handleExpenseAdded}
        />
      )}
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              {showPlannedOnly ? 'Запланированные расходы' : 'Список расходов'}
            </h2>
            <div className="text-red-600 font-semibold">
              Итого: {totalExpenses.toLocaleString()} ₽
            </div>
          </div>
        </div>
        
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCartIcon size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">
              {showPlannedOnly 
                ? 'Запланированные расходы не найдены.'
                : 'Записи о расходах отсутствуют.'}
            </p>
            <button 
              onClick={() => showPlannedOnly ? setIsAddingPlannedExpense(true) : setIsAddingExpense(true)}
              className={`mt-4 px-4 py-2 ${showPlannedOnly ? 'bg-amber-500 hover:bg-amber-600' : 'bg-red-500 hover:bg-red-600'} text-white rounded-md transition-colors`}
            >
              {showPlannedOnly ? 'Добавить запланированный' : 'Добавить первый расход'}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Категория
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Описание
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сумма
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Член семьи
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateToString(expense.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 capitalize">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                      -{expense.amount.toLocaleString()} ₽
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getFamilyMemberName(expense.familyMemberId).name} ({getFamilyMemberName(expense.familyMemberId).relationshipType})
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap"
                      onMouseEnter={() => expense.isPlanned && setHoveredExpenseId(expense.id)}
                      onMouseLeave={() => setHoveredExpenseId(null)}
                    >
                      {expense.isPlanned ? (
                        hoveredExpenseId === expense.id ? (
                          <button
                            onClick={() => handleCompletePlannedExpense(expense.id)}
                            disabled={isProcessing === expense.id}
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full hover-badge ${
                              isProcessing === expense.id 
                                ? 'bg-gray-100 text-gray-800' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            } transition-colors items-center`}
                          >
                            {isProcessing === expense.id ? (
                              <Loader2Icon className="animate-spin mr-1" size={12} />
                            ) : ''}
                            Выполнить
                          </button>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                            В планах
                          </span>
                        )
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Выполнено
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseList;