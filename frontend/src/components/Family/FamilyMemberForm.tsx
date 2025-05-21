import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { FamilyMember, RelationshipType, IncomeType } from '../../types';
import { XIcon } from 'lucide-react';

interface FamilyMemberFormProps {
  member?: FamilyMember;
  onClose: () => void;
}

const FamilyMemberForm: React.FC<FamilyMemberFormProps> = ({ member, onClose }) => {
  const { addFamilyMember } = useBudget();
  
  const [name, setName] = useState(member?.name || '');
  const [relationshipType, setRelationshipType] = useState<RelationshipType>(
    member?.relationshipType || RelationshipType.FATHER
  );
  const [incomeTypes, setIncomeTypes] = useState<IncomeType[]>(
    member?.incomeTypes || []
  );
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addFamilyMember({
      name,
      relationshipType,
      incomeTypes
    });
    
    onClose();
  };
  
  const handleIncomeTypeToggle = (type: IncomeType) => {
    if (incomeTypes.includes(type)) {
      setIncomeTypes(incomeTypes.filter(t => t !== type));
    } else {
      setIncomeTypes([...incomeTypes, type]);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {member ? 'Edit Family Member' : 'Add Family Member'}
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <XIcon size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
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
            />
          </div>
          
          <div>
            <label htmlFor="relationshipType" className="block text-sm font-medium text-gray-700 mb-1">
              Relationship Type
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
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Income Types
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
                <label htmlFor={`income-${type}`} className="ml-2 text-sm text-gray-700 capitalize">
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
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            {member ? 'Update' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FamilyMemberForm;