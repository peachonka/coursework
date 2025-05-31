import React, { useState, useEffect } from 'react';
import { IncomeType, AccountType } from '../../types';
import { XIcon } from 'lucide-react';
import { formatDateToYYYYMMDD } from '../../utils/dateUtils';
import { FamilyMember } from '../../types';
import { familyApi, budgetApi } from '../../api'; // Added budgetApi import
import { useNavigate } from 'react-router-dom';

interface IncomeFormProps {
  onClose: () => void;
  onSubmit?: (incomeData: Omit<Income, 'id'>) => void; // Added onSubmit prop
}

interface Income {
  id: string;
  amount: number;
  type: IncomeType;
  date: Date;
  familyMemberId: string;
  accountType: AccountType;
}

const IncomeForm: React.FC<IncomeFormProps> = ({ onClose, onSubmit }) => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]); // Added local state for familyMembers
  const [currentMember, setCurrentMember] = useState<FamilyMember | null>(null);  
  const [amount, setAmount] = useState<number>(0);
  const [type, setType] = useState<IncomeType>(IncomeType.SALARY);
  const [date, setDate] = useState<string>(formatDateToYYYYMMDD(new Date()));
  const [familyMemberId, setFamilyMemberId] = useState<string>('');
  const [accountType, setAccountType] = useState<AccountType>(AccountType.MAIN);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
  
    const checkFamily = async () => {
      try {
        const response = (await familyApi.getCurrentMember()).data;
        const membersResponse = await familyApi.getMembers(response.familyId);

        if (isMounted) {
          if (response.isMember && response.member) {
            setCurrentMember(response.member);
            setFamilyMemberId(response.member.id);
            setFamilyMembers(membersResponse.data);
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const incomeData = {
      amount,
      type,
      date: new Date(date),
      familyMemberId: familyMemberId || currentMember?.id || '',
      accountType
    };

    try {
      if (onSubmit) {
        onSubmit(incomeData);
      } else {
        // Fallback to direct API call if onSubmit not provided
        await budgetApi.incomes.create({
          ...incomeData,
          date: incomeData.date.toISOString()
        });
      }
      onClose();
    } catch (error) {
      console.error('Failed to add income:', error);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Добавление дохода</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <XIcon size={20} />
        </button>
      </div>
      {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-sm text-gray-500">Загрузка...</p>
          </div>
        ) : (
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
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Тип дохода
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as IncomeType)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              {Object.values(IncomeType).map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
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
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
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
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
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
          
          <div>
            <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-1">
              Счёт
            </label>
            <select
              id="accountType"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value as AccountType)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              {Object.values(AccountType).map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
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
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            Добавить доход
          </button>
        </div>
      </form>)}
    </div>
  );
};

export default IncomeForm;