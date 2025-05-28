import React from 'react';
import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import Sidebar from './Sidebar';
import { AccountType, FamilyMember } from '../../types';
import { familyApi } from '../../api';
import { useNavigate } from 'react-router-dom';

const AppLayout: React.FC = () => {
  const { accountBalance } = useBudget();
  const [currentMember, setCurrentMember] = useState<FamilyMember | null>(null);
  const navigate = useNavigate();

  // Вызов checkFamily при монтировании компонента
  useEffect(() => {
    let isMounted = true;

    const checkFamily = async () => {
      try {
        const response = (await familyApi.getCurrentMember()).data;

        if (isMounted) {
          if (response.isMember && response.member) {
            setCurrentMember(response.member);
          } else {
            navigate('/families/create');
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Ошибка:', err);
          navigate('/families/create');
        }
      }
    };

    checkFamily();

    // Очистка
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const totalBalance = 
    Number(accountBalance[AccountType.MAIN]) +
    Number(accountBalance[AccountType.SAVINGS]) +
    Number(accountBalance[AccountType.STASH]);
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Боковая панель */}
      <Sidebar currentMember={currentMember} />
      
      {/* Основное содержимое */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Шапка */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-3 sm:px-6 flex items-center justify-end">
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-600">Общий баланс</div>
                <div className={`text-xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalBalance.toLocaleString()} ₽
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Основная область содержимого */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;