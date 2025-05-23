import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { BarChartIcon, DownloadIcon, FilterIcon } from 'lucide-react';
import { Income, Expense, DateRange } from '../../types';
import { formatDateToString } from '../../utils/dateUtils';
import FilterForm from '../shared/FilterForm';

const ReportView: React.FC = () => {
  const { getFilteredIncomes, getFilteredExpenses, getBudgetSummary, familyMembers } = useBudget();
  const [showFilter, setShowFilter] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  const handleToggleFilter = () => {
    setShowFilter(!showFilter);
  };
  
  const handleFilterApply = (range: DateRange | undefined) => {
    setDateRange(range);
    setShowFilter(false);
  };
  
  const incomes = getFilteredIncomes(dateRange);
  const expenses = getFilteredExpenses(dateRange);
  const summary = getBudgetSummary(dateRange);
  
  const getFamilyMemberName = (id: string) => {
    const member = familyMembers.find(m => m.id === id);
    return member ? member.name : 'Неизвестно';
  };
  
  const getFamilyMemberWithRelation = (id: string) => {
    const member = familyMembers.find(m => m.id === id);
    if (!member) return 'Неизвестно';
    return `${member.name} (${member.relationshipType})`;
  };
  
  const handleExportToCSV = () => {
    // Подготовка содержимого CSV
    let csvContent = 'Категория,Член семьи,Сумма,Дата\n';
    
    // Добавление доходов
    incomes.forEach(income => {
      csvContent += `Доход (${income.type}),${getFamilyMemberName(income.familyMemberId)},${income.amount},${formatDateToString(income.date)}\n`;
    });
    
    // Добавление расходов
    expenses.filter(expense => !expense.isPlanned).forEach(expense => {
      csvContent += `Расход (${expense.category}),${getFamilyMemberName(expense.familyMemberId)},${expense.amount},${formatDateToString(expense.date)}\n`;
    });
    
    // Добавление итогов
    csvContent += `\nОбщий доход,,${summary.totalIncome},\n`;
    csvContent += `Общие расходы,,${summary.totalExpenses},\n`;
    csvContent += `Баланс,,${summary.balance},\n`;
    
    // Создание и скачивание файла
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'family_budget_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const dateRangeDisplay = dateRange 
    ? `${formatDateToString(dateRange.startDate)} - ${formatDateToString(dateRange.endDate)}`
    : 'За все время';
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <BarChartIcon size={24} className="text-blue-500 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">Отчет по бюджету</h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleToggleFilter}
            className={`flex items-center px-3 py-2 ${showFilter ? 'bg-blue-600' : 'bg-gray-200 text-gray-700'} rounded-md hover:bg-opacity-90 transition-colors ${showFilter ? 'text-white' : ''}`}
          >
            <FilterIcon size={16} className="mr-1" />
            Фильтр
          </button>
          <button
            onClick={handleExportToCSV}
            className="flex items-center px-3 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
          >
            <DownloadIcon size={16} className="mr-1" />
            Экспорт в CSV
          </button>
        </div>
      </div>
      
      {showFilter && (
        <FilterForm 
          onApply={handleFilterApply} 
          onCancel={() => setShowFilter(false)} 
          initialDateRange={dateRange}
        />
      )}
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Отчет по семейному бюджету: {dateRangeDisplay}
          </h2>
        </div>
        
        <div className="p-6">
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-4 border-b border-r text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Категория
                </th>
                <th className="py-2 px-4 border-b border-r text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Член семьи
                </th>
                <th className="py-2 px-4 border-b border-r text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сумма
                </th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Заголовок доходов */}
              <tr className="bg-gray-100">
                <td colSpan={4} className="py-2 px-4 border-b font-semibold text-gray-700">
                  Доходы
                </td>
              </tr>
              
              {/* Строки доходов */}
              {incomes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 px-4 border-b text-center text-gray-500">
                    Нет записей о доходах за выбранный период.
                  </td>
                </tr>
              ) : (
                incomes.map(income => (
                  <tr key={income.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b border-r text-gray-800 font-medium capitalize">
                      {income.type}
                    </td>
                    <td className="py-2 px-4 border-b border-r text-gray-800">
                      {getFamilyMemberWithRelation(income.familyMemberId)}
                    </td>
                    <td className="py-2 px-4 border-b border-r text-green-600 font-medium">
                      {income.amount.toLocaleString()} ₽
                    </td>
                    <td className="py-2 px-4 border-b text-gray-600">
                      {formatDateToString(income.date)}
                    </td>
                  </tr>
                ))
              )}
              
              {/* Заголовок расходов */}
              <tr className="bg-gray-100">
                <td colSpan={4} className="py-2 px-4 border-b font-semibold text-gray-700">
                  Расходы
                </td>
              </tr>
              
              {/* Строки расходов */}
              {expenses.filter(expense => !expense.isPlanned).length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 px-4 border-b text-center text-gray-500">
                    Нет записей о расходах за выбранный период.
                  </td>
                </tr>
              ) : (
                expenses
                  .filter(expense => !expense.isPlanned)
                  .map(expense => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b border-r text-gray-800 font-medium capitalize">
                        {expense.category}
                      </td>
                      <td className="py-2 px-4 border-b border-r text-gray-800">
                        {getFamilyMemberWithRelation(expense.familyMemberId)}
                      </td>
                      <td className="py-2 px-4 border-b border-r text-red-600 font-medium">
                        {expense.amount.toLocaleString()} ₽
                      </td>
                      <td className="py-2 px-4 border-b text-gray-600">
                        {formatDateToString(expense.date)}
                      </td>
                    </tr>
                  ))
              )}
              
              {/* Итоговая секция */}
              <tr className="bg-gray-200">
                <td colSpan={4} className="py-2 px-4 border-b font-semibold text-gray-700">
                  Итоги
                </td>
              </tr>
              <tr className="bg-blue-50">
                <td colSpan={2} className="py-2 px-4 border-b border-r font-semibold text-gray-800">
                  Общий доход
                </td>
                <td colSpan={2} className="py-2 px-4 border-b text-green-600 font-bold">
                  {summary.totalIncome.toLocaleString()} ₽
                </td>
              </tr>
              <tr className="bg-blue-50">
                <td colSpan={2} className="py-2 px-4 border-b border-r font-semibold text-gray-800">
                  Общие расходы
                </td>
                <td colSpan={2} className="py-2 px-4 border-b text-red-600 font-bold">
                  {summary.totalExpenses.toLocaleString()} ₽
                </td>
              </tr>
              <tr className="bg-blue-100">
                <td colSpan={2} className="py-2 px-4 border-b border-r font-semibold text-gray-800">
                  Баланс
                </td>
                <td colSpan={2} className={`py-2 px-4 border-b font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.balance.toLocaleString()} ₽
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportView;