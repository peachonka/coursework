import React, { useState } from 'react';
import { DateRange, Income } from '../../types';
import { budgetApi } from '../../api';
import { BanknoteIcon, PlusIcon, FilterIcon } from 'lucide-react';
import { formatDateToString } from '../../utils/dateUtils';
import IncomeForm from './IncomeForm';
import FilterForm from '../shared/FilterForm';


const IncomeList: React.FC = () => {
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [incomes, setIncomes] = useState<Income[]>([]);  

  // Fetch incomes when component mounts or dateRange changes
  React.useEffect(() => {
    const fetchIncomes = async () => {
      try {
        const params = {
          startDate: dateRange?.startDate?.toISOString(),
          endDate: dateRange?.endDate?.toISOString()
        };
        const data = await budgetApi.incomes.getAll(params);
        setIncomes(data);
      } catch (error) {
        console.error('Failed to fetch incomes:', error);
      }
    };
    
    fetchIncomes();
  }, [dateRange]);

  const handleToggleFilter = () => {
    setShowFilter(!showFilter);
  };
  
  const handleFilterApply = (range: DateRange | undefined) => {
    setDateRange(range);
    setShowFilter(false);
  };
  
  // Общий доход
  const totalIncome = incomes.reduce((sum: number, income: Income) => sum + income.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex md:items-center space-y-2 md:space-y-0 md:flex-row flex-col justify-between">
        <div className="flex items-center">
          <BanknoteIcon size={24} className="text-green-500 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">Доходы</h1>
        </div>
        <div className="flex sm:space-x-2 space-x-0 space-y-2 sm:space-y-0 sm:flex-row flex-col">
          <button
            onClick={handleToggleFilter}
            className={`flex items-center px-3 py-2 ${showFilter ? 'bg-blue-600' : 'bg-gray-200 text-gray-700'} rounded-md hover:bg-opacity-90 transition-colors ${showFilter ? 'text-white' : ''}`}
          >
            <FilterIcon size={16} className="mr-1" />
            Фильтр
          </button>
          <button
            onClick={() => setIsAddingIncome(true)}
            className="flex items-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            <PlusIcon size={16} className="mr-1" />
            Добавить доход
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
      
      {isAddingIncome && (
        <IncomeForm onClose={() => setIsAddingIncome(false)} />
      )}
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Список доходов</h2>
            <div className="text-green-600 font-semibold">
              Итого: {totalIncome.toLocaleString()} ₽
            </div>
          </div>
        </div>
        
        {incomes.length === 0 ? (
          <div className="text-center py-8">
            <BanknoteIcon size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Записи о доходах отсутствуют</p>
            <button 
              onClick={() => setIsAddingIncome(true)}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Добавить первый доход
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
                    Тип
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сумма
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Член семьи
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {incomes.map((income) => (
                  <tr key={income.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateToString(income.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                        {income.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      +{income.amount.toLocaleString()} ₽
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {income.familyMember.name} ({income.familyMember.relationshipType})
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

export default IncomeList;