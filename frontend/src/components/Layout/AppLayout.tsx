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
    
  // If no active session, show login screen
  if (!session.isActive) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-lg w-full max-w-md">
          <div className="flex items-center justify-center mb-6">
            <WalletIcon size={48} className="text-blue-500" />
            <h1 className="text-3xl font-bold ml-2 text-gray-800">Family Budget</h1>
          </div>
          <p className="text-center text-gray-600 mb-6">
            Please start a new session to access the family budget system.
          </p>
          {children}
        </div>
      </div>
    );
  }
  
  // With active session, show the main layout
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-3 sm:px-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Family Budget</h1>
              <p className="text-sm text-gray-500">
                {session.startTime && `Session started: ${formatDateToString(session.startTime)}`}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-600">Total Balance</div>
                <div className={`text-xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalBalance.toLocaleString()} ₽
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
        
        {/* Status bar */}
        <StatusBar 
          userName={currentMember?.name || 'Guest'} 
          userType={currentMember?.relationshipType || 'Unknown'}
          balance={totalBalance}
        />
      </div>
    </div>
  );
};

export default AppLayout;