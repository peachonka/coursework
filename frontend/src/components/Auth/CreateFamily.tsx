import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, familyApi } from '../../api';
import api from '../../api';
import axios from 'axios';
import { Loader2Icon } from 'lucide-react';


const CreateFamily: React.FC = () => {
  const navigate = useNavigate();
  const [creatorEmail, setCreatorEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);


  // Проверяем наличие семьи при загрузке компонента
  useEffect(() => {
    const checkFamily = async () => {
      try {
        const response = (await familyApi.getCurrentFamily()).data;
        
        // Явная проверка наличия семьи
        if (response.hasFamily) {
          // console.log('Уже есть семья');
          navigate('/dashboard', { replace: true }); // replace: true предотвращает возврат
          return;
        }
        // else {
        //   console.log('Нет семьи');
        // }
      } catch (err) {
        console.error('Ошибка проверки семьи:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkFamily();
  }, [navigate]);

  const handleJoinRequest = async () => {
    try {
      setError('');
      const currentUser = await authApi.getCurrentUser(); // Или из контекста
      
      await api.post('/families/request-join', {
        creatorEmail,
        userEmail: currentUser.email,
        message: "Хочу присоединиться к вашей семье"
      });

      setMessage('Заявка отправлена! Создатель семьи получит уведомление');
      setCreatorEmail('');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Ошибка при отправке заявки');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Неизвестная ошибка');
      }
    }
  };

  

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2Icon className='animate-spin text-blue-500' size={32} />
      </div>
    );
  }


  return (
    <div>
      <div className="text-center">          
          <div className="flex flex-col gap-4 max-w-md mx-auto">
            <button
              onClick={() => navigate('/auth/first-setup')}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Создать семью
            </button>
            <p className="mb-2 text-xs text-gray-600">Или или подайте заявку на вступление в существующую семью</p>


            <div className="mt-6">
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email создателя семьи"
                  className="flex-1 p-2 border rounded-md"
                  value={creatorEmail}
                  onChange={(e) => setCreatorEmail(e.target.value)}
                />
                <button
                  onClick={handleJoinRequest}
                  disabled={!creatorEmail}
                  className="px-4 py-2 bg-blue-200 ring-2 ring-blue-500 text-blue-500 rounded-md hover:bg-blue-100 disabled:bg-gray-300 disabled:ring-0 disabled:text-white"
                >
                  Подать заявку
                </button>
              </div>
              {message && <p className="mt-2 text-sm text-green-600">{message}</p>}
              {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            </div>
          </div>
        </div>
    </div>
)};


export default CreateFamily;