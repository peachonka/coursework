import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, signUp } from '../../services/auth';
import { AlertCircleIcon, Loader2Icon } from 'lucide-react';

interface AuthFormProps {
  mode: 'signin' | 'signup';
}

interface AuthError {
  message: string;
  [key: string]: any; // Additional error properties
}

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        // Add additional signup fields as needed
        await signUp(email, password, name);
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

        {mode === 'signup' && 
        (<div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
            autoComplete="name"
          />
        </div>)
        }

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
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
            minLength={6}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2Icon size={20} className="animate-spin mr-2" />
              {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
            </>
          ) : (
            mode === 'signup' ? 'Create Account' : 'Sign In'
          )}
        </button>

        <p className="text-sm text-center text-gray-600">
          {mode === 'signup' ? (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/auth/login')}
                className="text-blue-500 hover:text-blue-600 focus:outline-none"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/auth/register')}
                className="text-blue-500 hover:text-blue-600 focus:outline-none"
              >
                Sign up
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
};

export default AuthForm;