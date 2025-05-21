import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { Income, IncomeType, AccountType, DateRange } from '../../types';
import { BanknoteIcon, PlusIcon, FilterIcon } from 'lucide-react';
import { formatDateToString } from '../../utils/dateUtils';
import IncomeForm from './IncomeForm';
import FilterForm from '../shared/FilterForm';

const IncomeList: React.FC = () => {
  const { getFilteredIncomes, familyMembers } = useBudget();
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  const incomes = getFilteredIncomes(dateRange);
  
  const handleToggleFilter = () => {
    setShowFilter(!showFilter);
  };
  
  const handleFilterApply = (range: DateRange | undefined) => {
    setDateRange(range);
    setShowFilter(false);
  };
  
  const getFamilyMemberName = (id: string) => {
    const member = familyMembers.find(m => m.id === id);
    return member ? member.name : 'Unknown';
  };
  
  // Get total income
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <BanknoteIcon size={24} className="text-green-500 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">Income</h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleToggleFilter}
            className={`flex items-center px-3 py-2 ${showFilter ? 'bg-blue-600' : 'bg-gray-200 text-gray-700'} rounded-md hover:bg-opacity-90 transition-colors ${showFilter ? 'text-white' : ''}`}
          >
            <FilterIcon size={16} className="mr-1" />
            Filter
          </button>
          <button
            onClick={() => setIsAddingIncome(true)}
            className="flex items-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            <PlusIcon size={16} className="mr-1" />
            Add Income
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
            <h2 className="text-lg font-semibold text-gray-800">Income List</h2>
            <div className="text-green-600 font-semibold">
              Total: {totalIncome.toLocaleString()} ₽
            </div>
          </div>
        </div>
        
        {incomes.length === 0 ? (
          <div className="text-center py-8">
            <BanknoteIcon size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No income records found.</p>
            <button 
              onClick={() => setIsAddingIncome(true)}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Add First Income
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Family Member
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account
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
                      {getFamilyMemberName(income.familyMemberId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize
                        ${income.accountType === AccountType.MAIN ? 'bg-blue-100 text-blue-800' : 
                          income.accountType === AccountType.SAVINGS ? 'bg-indigo-100 text-indigo-800' : 
                          'bg-purple-100 text-purple-800'}`}
                      >
                        {income.accountType}
                      </span>
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