import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FamilyMember } from '../../types';
import { 
  UsersIcon, 
  BanknoteIcon, 
  ShoppingCartIcon, 
  BarChartIcon, 
  LogOutIcon,
  LayoutDashboardIcon,
  Bell
} from 'lucide-react';
import { authApi } from '../../api'; // Импортируем authApi из нашего API

interface SidebarProps {
  currentMember: FamilyMember | null;
  isLoading: boolean;
  incomingCnt: number;
  handleClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMember, isLoading, incomingCnt, handleClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const navigationItems = [
    { path: '/dashboard', label: 'Дашборд', icon: <LayoutDashboardIcon size={20} /> },
    { path: '/family', label: 'Участники', icon: <UsersIcon size={20} /> },
    { path: '/income', label: 'Доходы', icon: <BanknoteIcon size={20} /> },
    { path: '/expenses', label: 'Расходы', icon: <ShoppingCartIcon size={20} /> },
    { path: '/reports', label: 'Отчёты', icon: <BarChartIcon size={20} /> },
  ];
  
  const handleLogout = async () => {
    try {
      // Вызываем logout из authApi
      await authApi.logout();
      localStorage.removeItem('jwt_token');
      // Перенаправляем на страницу входа
      navigate('/auth/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };
  
  return (
    <aside className="bg-white w-64 flex flex-col border-r border-gray-200 shrink-0" onClick={handleClose}>
      <div className="p-4 border-b border-gray-200 h-20">
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-sm text-gray-300">Загрузка...</p>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="flex flex-col">
              <h2 className="text-xl font-semibold text-gray-800">{currentMember?.name ?? 'Пользователь не найден'}</h2>
              <p className="text-sm text-gray-500">
                {currentMember?.role === 'admin' ? 'Администратор' : 'Участник'}
              </p>
            </div>
            {(currentMember?.role === 'admin') && (
              <Link to={'/notifications'} className="ml-auto relative">
                {(incomingCnt>0) && (<div className='absolute left-0 top-0 rounded-full flex items-center justify-center font-bold bg-blue-500 text-white h-4 w-4 text-xs'>{incomingCnt}</div>)}
                <Bell size={24} className="text-gray-500 m-1" />
              </Link>
            )}
          </div>
        )}
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md mx-2 transition-colors duration-200 ${
                  location.pathname === item.path ? 'bg-blue-50 text-blue-600 font-medium' : ''
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors duration-200"
        >
          <LogOutIcon size={20} className="mr-3" />
          Выйти
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;