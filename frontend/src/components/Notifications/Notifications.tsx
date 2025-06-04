import React, { useEffect, useState } from 'react';
import { 
  UsersIcon,
  CheckIcon,
  XIcon,
  ClockIcon,
  Loader2Icon
} from 'lucide-react';
import { familyApi } from '../../api';
import { UserData, FamilyMember } from '../../types';

interface RequestItemProps {
  request: {
    id: string;
    creatorEmail: string;
    user: UserData;
    message: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: Date;
  };
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  familyMembers: FamilyMember[];
  familyMemberId: string;
  setFamilyMemberId: React.Dispatch<React.SetStateAction<string>>;
}

const RequestItem: React.FC<RequestItemProps> = ({ request, onAccept, onReject, familyMembers, familyMemberId, setFamilyMemberId }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="text-lg flex font-semibold text-gray-800">
          Заявка от <div className="text-gray-500 ml-2">{request.user.email}</div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs ${
          request.status === 'pending'
            ? 'bg-amber-100 text-amber-800'
            : request.status === 'accepted'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-red-100 text-red-800'
        }`}>
          {request.status === 'pending' ? 'Ожидает' : 
           request.status === 'accepted' ? 'Принята' : 'Отклонена'}
        </span>
      </div>
      <p className="text-gray-600 mb-2">{request.message}</p>
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <ClockIcon size={14} className="mr-1" />
        {new Date(request.createdAt).toLocaleString()}
      </div>

      {request.status === 'pending' && (
        <div className="flex space-x-6">
            <select
              id="familyMember"
              value={familyMemberId}
              onChange={(e) => setFamilyMemberId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">-- Выберите члена семьи --</option>
              {familyMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.relationshipType})
                </option>
              ))}
            </select>
          <button
            onClick={() => onAccept(request.id)}
            disabled={!familyMemberId}
            className="flex items-center px-3 py-1 bg-blue-100 text-blue-500 ring-2 ring-blue-500 rounded-md disabled:bg-gray-300 disabled:text-white disabled:ring-gray-300"
          >
            <CheckIcon size={16} className="mr-1" />
            Принять
          </button>
          <button
            onClick={() => onReject(request.id)}
            className="flex items-center px-3 py-1 bg-red-100 text-red-500 rounded-md ring-2 ring-red-500"
          >
            <XIcon size={16} className="mr-1" />
            Отклонить
          </button>
        </div>
      )}
    </div>
  );
};

const FamilyRequestsPage: React.FC = () => {
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
 const [familyMemberId, setFamilyMemberId] = useState<string>('');

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const response = (await familyApi.getCurrentMember()).data;
        var membersResponse: FamilyMember[] = await familyApi.getMembers(response.member.familyId);
        const incomingRes = await familyApi.getIncomingRequests();
         if (response.isMember) {
            membersResponse = membersResponse.filter(m => m.id !== response.member.id);
            setFamilyMembers(membersResponse);
        }
        setIncomingRequests(incomingRes);
      } catch (err) {
        setError('Не удалось загрузить заявки');
        console.error('Ошибка загрузки заявок:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();
  }, []);

  const handleAccept = async (requestId: string) => {
    try {
      await familyApi.acceptRequest(requestId, familyMemberId);
      setIncomingRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      alert('Не удалось принять заявку');
      console.error('Ошибка принятия заявки:', err);
    }
  };

  

  const handleReject = async (requestId: string) => {
    try {
      await familyApi.rejectRequest(requestId);
      setIncomingRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      alert('Не удалось отклонить заявку');
      console.error('Ошибка отклонения заявки:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2Icon size={32} className="animate-spin text-blue-500" />
        <p className="ml-2">Загрузка заявок...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded-md text-red-700 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center">
        <UsersIcon size={24} className="mr-2 text-indigo-500" />
        Заявки в семью
      </h1>

      {/* Входящие заявки */}
      <div>
        {incomingRequests.length === 0 ? (
          <p className="text-gray-500">Нет активных заявок</p>
        ) : (
          <div className="space-y-4">
            {incomingRequests.map(req => (
              <RequestItem
                key={req}
                request={req}
                onAccept={handleAccept}
                onReject={handleReject}
                familyMembers={familyMembers}
                familyMemberId={familyMemberId}
                setFamilyMemberId={setFamilyMemberId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyRequestsPage;