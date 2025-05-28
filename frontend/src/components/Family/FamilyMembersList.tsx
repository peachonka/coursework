import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { FamilyMember } from '../../types';
import { UsersIcon, PlusIcon, EditIcon, TrashIcon } from 'lucide-react';
import FamilyMemberForm from './FamilyMemberForm';

const FamilyMembersList: React.FC = () => {
  const { familyMembers, removeFamilyMember } = useBudget();
  const [isAdding, setIsAdding] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  
  const handleAddClick = () => {
    setIsAdding(true);
    setEditingMember(null);
  };
  
  const handleEditClick = (member: FamilyMember) => {
    setEditingMember(member);
    setIsAdding(false);
  };
  
  const handleRemoveClick = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этого члена семьи?')) {
      try {
        await removeFamilyMember(id);
      } catch (error) {
        console.error('Failed to remove family member:', error);
      }
    }
  };
  
  const handleFormClose = () => {
    setIsAdding(false);
    setEditingMember(null);
  };
  
  // Безопасное форматирование типов дохода
  const formatIncomeTypes = (types?: string[]) => {
    if (!types || types.length === 0) return 'Нет данных';
    return types
      .map(type => type.charAt(0).toUpperCase() + type.slice(1))
      .join(', ');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <UsersIcon size={24} className="text-blue-500 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">Члены семьи</h1>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <PlusIcon size={16} className="mr-1" />
          Добавить
        </button>
      </div>
      
      {isAdding && (
        <FamilyMemberForm onClose={handleFormClose} />
      )}
      
      {editingMember && (
        <FamilyMemberForm member={editingMember} onClose={handleFormClose} />
      )}
      
      {familyMembers.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <UsersIcon size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">Нет членов семьи</h3>
          <p className="text-gray-500 mb-4">
            Вы еще не добавили ни одного члена семьи. Добавьте первого члена семьи, чтобы начать.
          </p>
          <button
            onClick={handleAddClick}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Добавить члена семьи
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Имя
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Родство
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Типы дохода
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {familyMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                      {member.relationshipType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatIncomeTypes(member.incomeTypes)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(member)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      aria-label="Редактировать"
                    >
                      <EditIcon size={16} />
                    </button>
                    <button
                      onClick={() => handleRemoveClick(member.id)}
                      className="text-red-600 hover:text-red-900"
                      aria-label="Удалить"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FamilyMembersList;