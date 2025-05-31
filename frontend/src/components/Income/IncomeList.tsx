import React, { useState, useContext } from 'react';
import { DateRange, Income } from '../../types';
import { budgetApi } from '../../api';

// Create a type for FamilyContext
type FamilyContextType = {
  familyMembers: Array<{
    id: string;
    name: string;
    // Add other member properties as needed
  }>;
};

// Create the context with proper typing
const FamilyContext = React.createContext<FamilyContextType | null>(null);

const IncomeList: React.FC = () => {
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const familyContext = useContext(FamilyContext);
  const familyMembers = familyContext?.familyMembers || [];
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
  
  const getFamilyMemberName = (id: string): string => {
    const member = familyMembers.find(m => m.id === id);
    return member ? member.name : 'Неизвестно';
  };
  
  // Общий доход
  const totalIncome = incomes.reduce((sum: number, income: Income) => sum + income.amount, 0);

  const handleAddIncome = async (incomeData: Omit<Income, 'id'>) => {
    try {
      // Convert date to string if it's a Date object
      const apiData = {
        ...incomeData,
        date: incomeData.date instanceof Date ? incomeData.date.toISOString() : incomeData.date
      };
      const newIncome = await budgetApi.incomes.create(apiData);
      setIncomes([...incomes, newIncome]);
      setIsAddingIncome(false);
    } catch (error) {
      console.error('Failed to add income:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* ... rest of your JSX remains the same ... */}
    </div>
  );
};

export default IncomeList;