import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { ExpenseCategory } from '../../types';
import { XIcon, AlertCircleIcon } from 'lucide-react';
import { formatDateToYYYYMMDD } from '../../utils/dateUtils';
import { AccountType } from '../../types';


interface ExpenseFormProps {
  onClose: () => void;
  isPlanned: boolean;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onClose, isPlanned }) => {
  const { addExpense, canAddExpense, familyMembers, getCurrentMember, accountBalance } = useBudget();
  const currentMember = getCurrentMember();
  
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.FOOD);
  const [date, setDate] = useState<string>(formatDateToYYYYMMDD(new Date()));
  const [familyMemberId, setFamilyMemberId] = useState<string>(currentMember?.id || '');
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string>('');
  
   const totalBalance = 
   Number(accountBalance[AccountType.MAIN]) +
   Number(accountBalance[AccountType.SAVINGS]) +
   Number(accountBalance[AccountType.STASH]);

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Check if balance would become negative for actual expenses
    if (!isPlanned && !canAddExpense(amount)) {
      setError('Cannot add expense. Total balance would become negative.');
      return;
    }
    
    const success =  await addExpense({
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
      setError('Cannot add expense. Total balance would become negative.');
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {isPlanned ? 'Plan Future Expense' : 'Add Expense'}
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <XIcon size={20} />
        </button>
      </div>
      
      {!isPlanned && totalBalance <= 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 flex items-start">
          <AlertCircleIcon size={20} className="mr-2 flex-shrink-0" />
          <p className="text-sm">
            Warning: Your total balance is {totalBalance.toLocaleString()} ₽. Adding new expenses is not allowed when balance is negative.
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
              Amount (₽)
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
              Category
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
              Date
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
              Family Member
            </label>
            <select
              id="familyMember"
              value={familyMemberId}
              onChange={(e) => setFamilyMemberId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              required
            >
              <option value="">-- Select family member --</option>
              {familyMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.relationshipType})
                </option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              placeholder="Enter a brief description"
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
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 ${isPlanned ? 'bg-amber-500 hover:bg-amber-600' : 'bg-red-500 hover:bg-red-600'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${isPlanned ? 'focus:ring-amber-500' : 'focus:ring-red-500'}`}
            disabled={!isPlanned && totalBalance <= 0}
          >
            {isPlanned ? 'Plan Expense' : 'Add Expense'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;