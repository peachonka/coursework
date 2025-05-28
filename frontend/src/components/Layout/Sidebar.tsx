import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FamilyMember } from '../../types';
import { 
  HomeIcon, 
  UsersIcon, 
  BanknoteIcon, 
  ShoppingCartIcon, 
  BarChartIcon, 
  LogOutIcon,
  LayoutDashboardIcon
} from 'lucide-react';
import { authApi } from '../../api'; // Импортируем authApi из нашего API

interface SidebarProps {
  currentMember: FamilyMember | null;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMember }) => {
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
      console.log('Вызываем logout из authApi');
      // Вызываем logout из authApi
      await authApi.logout();
      // Перенаправляем на страницу входа
      navigate('/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };
  
  return (
    <aside className="bg-white w-64 hidden md:flex flex-col border-r border-gray-200 shrink-0">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold text-gray-800">{currentMember?.name ?? 'Пользователь не найден'}</h2>
          <p className="text-sm text-gray-500">{currentMember?.role === 'admin' ? 'Администратор' : 'Участник'}</p>
        </div>
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