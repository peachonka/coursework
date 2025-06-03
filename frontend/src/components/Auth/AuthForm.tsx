import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, signUp } from '../../services/auth';
import { AlertCircleIcon, Loader2Icon, Eye, EyeOff } from 'lucide-react';
// import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';


interface AuthFormProps {
  mode: 'signin' | 'signup';
}

interface AuthError {
  message: string;
  [key: string]: any; // Additional error properties
}

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  // const { executeRecaptcha } = useGoogleReCaptcha();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [reppassword, setRepPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRepPassword, setShowRepPassword] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        // Add additional signup fields as needed
        if (reppassword !== password) {
          setError('Пароли не совпадают');
          return;
        }
        else await signUp(email, password);
        navigate('/first-setup');
      } else {
        const { token } = await signIn(email, password);
        localStorage.setItem('jwt_token', token);
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      let errorMessage = 'An error occurred';
      if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = (err as AuthError).message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircleIcon size={20} className="text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Пароль
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 pr-10" // Добавлен pr-10 для отступа
              required
              minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)} // Изменяем состояние на противоположное
              className="absolute right-2 top-2 text-gray-500 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {(mode === 'signup') && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Повторите пароль
            </label>
            <div className="relative">
              <input
                type={showRepPassword ? 'text' : 'password'}
                id="reppassword"
                value={reppassword}
                onChange={(e) => setRepPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 pr-10" // Добавлен pr-10 для отступа
                required
                minLength={6}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowRepPassword(!showRepPassword)} // Изменяем состояние на противоположное
                className="absolute right-2 top-2 text-gray-500 hover:text-gray-600 focus:outline-none"
              >
                {showRepPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2Icon size={20} className="animate-spin mr-2" />
              {mode === 'signup' ? 'Создаём аккаунт...' : 'Вход в систему...'}
            </>
          ) : (
            mode === 'signup' ? 'Создать аккаунт' : 'Войти'
          )}
        </button>

        <p className="text-sm text-center text-gray-600">
          {mode === 'signup' ? (
            <>
              Уже есть аккаунт?{' '}
              <button
                type="button"
                onClick={() => navigate('/auth/login')}
                className="text-blue-500 hover:text-blue-600 focus:outline-none"
              >
                Войти
              </button>
            </>
          ) : (
            <>
              Ещё нет аккаунта?{' '}
              <button
                type="button"
                onClick={() => navigate('/auth/register')}
                className="text-blue-500 hover:text-blue-600 focus:outline-none"
              >
                Зарегистрироваться
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
};

export default AuthForm;