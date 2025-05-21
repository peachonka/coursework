import React, { useState, useEffect } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { FamilyMember } from '../../types';
import { useNavigate } from 'react-router-dom';

const SessionStart: React.FC = () => {
  const { familyMembers, startSession, session } = useBudget();
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const navigate = useNavigate();

  // Redirect if session is already active
  useEffect(() => {
    if (session.isActive) {
      navigate('/dashboard');
    }
  }, [session.isActive, navigate]);

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMemberId) {
      startSession(selectedMemberId);
      navigate('/dashboard');
    }
  };

  return (
    <div>
      {familyMembers.length === 0 ? (
        <div className="text-center">
          <p className="mb-4 text-gray-600">No family members have been added yet.</p>
          <button
            onClick={() => navigate('/first-setup')}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Set Up Family Members
          </button>
        </div>
      ) : (
        <form onSubmit={handleStartSession}>
          <div className="mb-4">
            <label htmlFor="familyMember" className="block text-sm font-medium text-gray-700 mb-1">
              Select Family Member
            </label>
            <select
              id="familyMember"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">-- Select a family member --</option>
              {familyMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.relationshipType})
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={!selectedMemberId}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          >
            Start Session
          </button>
        </form>
      )}
    </div>
  );
};

export default SessionStart;