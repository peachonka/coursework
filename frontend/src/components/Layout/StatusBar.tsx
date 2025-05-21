import React from 'react';

interface StatusBarProps {
  userName: string;
  userType: string;
  balance: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ userName, userType, balance }) => {
  const currentDate = new Date().toLocaleDateString('ru-RU');
  
  return (
    <footer className="bg-gray-800 text-white py-2 px-4 text-sm">
      <div className="flex justify-between items-center">
        <div>
          Current user: <span className="font-medium">{userName}</span> ({userType})
        </div>
        <div>
          Date: {currentDate}
        </div>
        <div>
          Current balance: <span className={`font-medium ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {balance.toLocaleString()} ₽
          </span>
        </div>
      </div>
    </footer>
  );
};

export default StatusBar;