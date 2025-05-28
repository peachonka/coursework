// AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../api';
import { UserData } from '../types';

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (location.pathname === '/auth/login' || location.pathname === '/auth/register') {
            setLoading(false);
            return;
        }

        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
        
        // Перенаправляем с login-страницы если уже авторизован
        if (location.pathname === '/auth/login') {
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        setUser(null);
        
        // Перенаправляем на login если неавторизован и не на login-странице
        if (location.pathname !== '/auth/login' && location.pathname !== '/auth/register') {
          navigate('/auth/login', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, location.pathname]);

  const login = async (email: string, password: string) => {
    try {
      const { user } = await authApi.login(email, password);
      setUser(user);
      navigate('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const { user } = await authApi.register(email, password, name);
      setUser(user);
      navigate('/first-setup');
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authApi.logout();
    navigate('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);