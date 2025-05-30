import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FamilyMember } from '../../types';
import { budgetApi, familyApi } from '../../api';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';

const AppLayout: React.FC = () => {
  const [familyId, setCurrentFamilyId] = useState<string>('');
  const [currentMember, setCurrentMember] = useState<FamilyMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [totalFamilyBalance, setTotalFamilyBalance] = useState<number>(0);
  const navigate = useNavigate();

  // Функция для получения баланса семьи
  const fetchFamilyBalance = async () => {
    try {
      const accounts = await budgetApi.accounts.getFamilyAccounts();
      const total = accounts.reduce((sum, account) => sum + account.balance, 0);
      setTotalFamilyBalance(total);
    } catch (error) {
      console.error('Ошибка при получении баланса семьи:', error);
    }
  };

  // Основной эффект для загрузки данных
  useEffect(() => {
    let isMounted = true;

    const checkFamily = async () => {
      try {
        const response = (await familyApi.getCurrentMember()).data;
        const cfamily = (await familyApi.getCurrentFamily()).data;
        
        if (isMounted) {
          if (response.isMember && response.member) {
            setCurrentMember(response.member);
          } else {
            navigate('/families/create');
          }
          
          if (cfamily.hasFamily) {
            setCurrentFamilyId(cfamily.family.id);
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

  // Отдельный эффект для обновления баланса при изменении familyId
  useEffect(() => {
    if (familyId) {
      fetchFamilyBalance();
    }
  }, [familyId]);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Боковая панель */}
      <div className={`
        left-0 z-40 absolute
        ${isSidebarOpen ? 'flex' : 'hidden'} 
        md:flex md:relative w-64 bg-white h-full
      `}>
        <Sidebar currentMember={currentMember} isLoading={isLoading} />
      </div>

      {/* Затемнение фона */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Основное содержимое */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Шапка */}
        <header className="bg-white shadow-sm z-10 h-20">
          <div className="px-4 py-3 sm:px-6 flex items-center md:justify-end justify-between">
            <button
              className="md:hidden p-2 rounded-md bg-white"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-600">Общий баланс</div>
                <div className={`text-xl font-bold ${totalFamilyBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalFamilyBalance.toLocaleString()} ₽
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