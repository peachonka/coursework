import React, { useState, useEffect } from 'react';
import { 
  FamilyMember, 
  RelationshipType, 
  IncomeType 
} from '../../types';
import { XIcon, Loader2Icon } from 'lucide-react';
import { familyApi } from '../../api';
import { useNavigate } from 'react-router-dom';

interface FamilyMemberFormProps {
  member?: FamilyMember;
  onClose: () => void;
  onMemberAdded?: (newMember: FamilyMember) => void; // добавляем здесь
  onMemberUpdated?: (updatedMember: FamilyMember) => void; // добавляем здесь
}

const FamilyMemberForm: React.FC<FamilyMemberFormProps> = ({ member, onClose }) => {
  const [name, setName] = useState(member?.name || '');
  const [relationshipType, setRelationshipType] = useState<RelationshipType>(
    member?.relationshipType || RelationshipType.HUSBAND
  );
  const [incomeTypes, setIncomeTypes] = useState<IncomeType[]>(
    member?.incomeTypes || []
  );
  const [role, setRole] = useState(member?.role || 'member');
  const [currentMember, setCurrentMember] = useState<FamilyMember | null>(null);
  const [familyId, setFamilyId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Загрузка данных о семье и текущем пользователе
  useEffect(() => {
    let isMounted = true;

    const checkFamily = async () => {
      try {
        const response = (await familyApi.getCurrentFamily()).data;
        const cmember = (await familyApi.getCurrentMember()).data;
        if (isMounted) {
          if (response.hasFamily) {
            setFamilyId(response.family.id);
          } else {
            navigate('/families/create');
          }

          if (cmember.isMember && cmember.member) {
            setCurrentMember(cmember.member);
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

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(familyId);
    if (!familyId) {
      alert('Не удалось определить ID семьи');
      return;
    }

    try {
      if (member) {
        await familyApi.updateMember(member.id, {
          name,
          relationshipType,
          incomeTypes,
          role
        });
      } else {
        await familyApi.addMember({
        familyId,
        name,
        userId: '',
        relationshipType,
        incomeTypes,
        role
      });
      }

      onClose();
      location.reload();
    } catch (error) {
      console.error('Ошибка при добавлении / редактировании члена семьи:', error);
      alert('Не удалось добавить / изменить члена семьи. Попробуйте еще раз.');
    }
  };

  const handleIncomeTypeToggle = (type: IncomeType) => {
    if (incomeTypes.includes(type)) {
      setIncomeTypes(incomeTypes.filter(t => t !== type));
    } else {
      setIncomeTypes([...incomeTypes, type]);
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
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {member ? 'Редактировать члена семьи' : 'Добавить члена семьи'}
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <XIcon size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Имя
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="relationshipType" className="block text-sm font-medium text-gray-700 mb-1">
              Тип родства
            </label>
            <select
              id="relationshipType"
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value as RelationshipType)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.values(RelationshipType).map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {currentMember?.role === 'admin' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Роль
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {(member?.id !== currentMember.id) && (<option value="member">Участник</option>)}
              <option value="admin">Администратор</option>
            </select>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Типы дохода
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.values(IncomeType).map((type) => (
              <div key={type} className="flex items-center">
                <input
                  type="checkbox"
                  id={`income-${type}`}
                  checked={incomeTypes.includes(type)}
                  onChange={() => handleIncomeTypeToggle(type)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor={`income-${type}`}
                  className="ml-2 text-sm text-gray-700 capitalize"
                >
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            disabled={!familyId}
          >
            {member ? 'Обновить' : 'Добавить'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FamilyMemberForm;