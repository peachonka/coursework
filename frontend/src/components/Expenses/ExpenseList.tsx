import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { Expense, ExpenseCategory, DateRange } from '../../types';
import { ShoppingCartIcon, PlusIcon, FilterIcon, CalendarClockIcon } from 'lucide-react';
import { formatDateToString } from '../../utils/dateUtils';
import ExpenseForm from './ExpenseForm';
import FilterForm from '../shared/FilterForm';

const ExpenseList: React.FC = () => {
  const { getFilteredExpenses, familyMembers } = useBudget();
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isAddingPlannedExpense, setIsAddingPlannedExpense] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [showPlannedOnly, setShowPlannedOnly] = useState(false);
  
  const expenses = getFilteredExpenses(dateRange, showPlannedOnly);
  
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
  
  const getFamilyMemberName = (id: string) => {
    const member = familyMembers.find(m => m.id === id);
    return member ? member.name : 'Unknown';
  };
  
  // Get total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <ShoppingCartIcon size={24} className="text-red-500 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">Expenses</h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleTogglePlannedOnly}
            className={`flex items-center px-3 py-2 ${showPlannedOnly ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-700'} rounded-md hover:bg-opacity-90 transition-colors`}
          >
            <CalendarClockIcon size={16} className="mr-1" />
            {showPlannedOnly ? 'Showing Planned' : 'All Expenses'}
          </button>
          <button
            onClick={handleToggleFilter}
            className={`flex items-center px-3 py-2 ${showFilter ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} rounded-md hover:bg-opacity-90 transition-colors`}
          >
            <FilterIcon size={16} className="mr-1" />
            Filter
          </button>
          <button
            onClick={() => setIsAddingPlannedExpense(true)}
            className="flex items-center px-3 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
          >
            <PlusIcon size={16} className="mr-1" />
            Plan Expense
          </button>
          <button
            onClick={() => setIsAddingExpense(true)}
            className="flex items-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            <PlusIcon size={16} className="mr-1" />
            Add Expense
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
      
      {isAddingExpense && (
        <ExpenseForm onClose={() => setIsAddingExpense(false)} isPlanned={false} />
      )}
      
      {isAddingPlannedExpense && (
        <ExpenseForm onClose={() => setIsAddingPlannedExpense(false)} isPlanned={true} />
      )}
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              {showPlannedOnly ? 'Planned Expenses' : 'Expense List'}
            </h2>
            <div className="text-red-600 font-semibold">
              Total: {totalExpenses.toLocaleString()} ₽
            </div>
          </div>
        </div>
        
        {expenses.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCartIcon size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">
              {showPlannedOnly 
                ? 'No planned expenses found.'
                : 'No expense records found.'}
            </p>
            <button 
              onClick={() => showPlannedOnly ? setIsAddingPlannedExpense(true) : setIsAddingExpense(true)}
              className={`mt-4 px-4 py-2 ${showPlannedOnly ? 'bg-amber-500 hover:bg-amber-600' : 'bg-red-500 hover:bg-red-600'} text-white rounded-md transition-colors`}
            >
              {showPlannedOnly ? 'Add Planned Expense' : 'Add First Expense'}
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
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Family Member
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((expense) => (
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
                      {getFamilyMemberName(expense.familyMemberId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {expense.isPlanned ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                          Planned
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Completed
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