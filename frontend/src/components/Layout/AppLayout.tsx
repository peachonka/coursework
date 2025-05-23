import React from 'react';
import { useBudget } from '../../context/BudgetContext';
import { formatDateToString } from '../../utils/dateUtils';
import { WalletIcon } from 'lucide-react';
import StatusBar from './StatusBar';
import Sidebar from './Sidebar';
import { AccountType } from '../../types';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { session, getCurrentMember, accountBalance } = useBudget();
  const currentMember = getCurrentMember();
  
  const totalBalance = 
    Number(accountBalance[AccountType.MAIN]) +
    Number(accountBalance[AccountType.SAVINGS]) +
    Number(accountBalance[AccountType.STASH]);
    
  // Если нет активной сессии, показываем экран входа
  if (!session.isActive) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-lg w-full max-w-md">
          <div className="flex items-center justify-center mb-6">
            <WalletIcon size={48} className="text-blue-500" />
            <h1 className="text-3xl font-bold ml-2 text-gray-800">Семейный бюджет</h1>
          </div>
          <p className="text-center text-gray-600 mb-6">
            Пожалуйста, начните новую сессию для доступа к системе семейного бюджета.
          </p>
          {children}
        </div>
      </div>
    );
  }
  
  // При активной сессии показываем основной интерфейс
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Боковая панель */}
      <Sidebar />
      
      {/* Основное содержимое */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Шапка */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-3 sm:px-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Семейный бюджет</h1>
              <p className="text-sm text-gray-500">
                {session.startTime && `Сессия начата: ${formatDateToString(session.startTime)}`}
              </p>
            </div>
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
          {children}
        </main>
        
        {/* Статус-бар */}
        <StatusBar 
          userName={currentMember?.name || 'Гость'} 
          userType={currentMember?.relationshipType || 'Неизвестно'}
          balance={totalBalance}
        />
      </div>
    </div>
  );
};

export default AppLayout;