import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { RelationshipType, IncomeType } from '../../types';
import { useNavigate } from 'react-router-dom';
import { familyApi } from '../../api';

const FirstTimeSetup: React.FC = () => {
  const { addFamilyMember } = useBudget();
  const navigate = useNavigate();
  
  // Состояние для хранения информации о членах семьи
  const [familyMembers, setFamilyMembers] = useState([
    { name: '', relationshipType: RelationshipType.SPOUSE, incomeTypes: [] as IncomeType[]}
  ]);

  // Обработчик изменения имени
  const handleNameChange = (index: number, value: string) => {
    const updatedMembers = [...familyMembers];
    updatedMembers[index].name = value;
    setFamilyMembers(updatedMembers);
  };

  // Обработчик изменения родственной связи
  const handleRelationshipChange = (index: number, value: RelationshipType) => {
    const updatedMembers = [...familyMembers];
    updatedMembers[index].relationshipType = value;
    setFamilyMembers(updatedMembers);
  };

  // Обработчик изменения типов дохода
  const handleIncomeTypeChange = (index: number, incomeType: IncomeType) => {
    const updatedMembers = [...familyMembers];
    const currentIncomeTypes = updatedMembers[index].incomeTypes;
    
    if (currentIncomeTypes.includes(incomeType)) {
      updatedMembers[index].incomeTypes = currentIncomeTypes.filter(type => type !== incomeType);
    } else {
      updatedMembers[index].incomeTypes = [...currentIncomeTypes, incomeType];
    }
    
    setFamilyMembers(updatedMembers);
  };

  // Добавление нового члена семьи
  const addMember = () => {
    setFamilyMembers([
      ...familyMembers, 
      { name: '', relationshipType: RelationshipType.CHILD, incomeTypes: [] as IncomeType[] }
    ]);
  };

  // Удаление члена семьи
  const removeMember = (index: number) => {
    if (familyMembers.length > 1) {
      const updatedMembers = [...familyMembers];
      updatedMembers.splice(index, 1);
      setFamilyMembers(updatedMembers);
    }
  };

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
    const creator = familyMembers[0];
    const incomeTypesStrings = creator.incomeTypes.map(type => type.toString());
    // 1. Создаем семью (асинхронно)
    await familyApi.createFamily(creator.relationshipType.toString(), incomeTypesStrings);
    
    // 2. Добавляем остальных членов семьи
    const familyMembersWithoutCreator = familyMembers.slice(1);
    familyMembersWithoutCreator.forEach(member => {
      if (member.name.trim() && member.incomeTypes.length > 0) {
        addFamilyMember(member);
      }
    });
    
    // 3. Переходим на главную страницу
    navigate('/');
    
  } catch (error) {
    console.error('Ошибка при создании семьи:', error);
    alert('Не удалось создать семью. Пожалуйста, попробуйте снова.');
  }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto my-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Настройка</h1>
      <p className="mb-4 text-gray-600">
        Добро пожаловать в приложение Семейный бюджет! Давайте настроим вашу семью.
      </p>
      
      <form onSubmit={handleSubmit}>
        {familyMembers.map((member, index) => (
          <div key={index} className="mb-6 p-4 border border-gray-200 rounded-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{index == 0 ? "Я (создатель)" : "Член семьи #" + index + 1}</h3>
              {familyMembers.length > 1 && index > 0 && (
                <button
                  type="button"
                  onClick={() => removeMember(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Удалить
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {index > 0 && (<div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Имя
                </label>
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>)}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Родственная связь
                </label>
                <select
                  value={member.relationshipType}
                  onChange={(e) => handleRelationshipChange(index, e.target.value as RelationshipType)}
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
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Типы дохода
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(IncomeType).map((type) => (
                  <label key={type} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={member.incomeTypes.includes(type)}
                      onChange={() => handleIncomeTypeChange(index, type)}
                      className="rounded text-blue-500 focus:ring-blue-500"
                    />
                    <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}
        
        <div className="flex justify-between space-x-4 items-center mt-4">
          <button
            type="button"
            onClick={addMember}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Добавить члена семьи
          </button>
          
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Завершить настройку
          </button>
        </div>
      </form>
    </div>
  );
};

export default FirstTimeSetup;