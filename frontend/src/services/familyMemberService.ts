// src/services/familyMemberService.ts
import api from '../api';
import { FamilyMember } from '../types';

export const addFamilyMember = async (member: Omit<FamilyMember, 'id'>): Promise<FamilyMember> => {
  const response = await api.post<FamilyMember>('/familymembers', member);
  return response.data;
};

export const getFamilyMembers = async (): Promise<FamilyMember[]> => {
  const response = await api.get<FamilyMember[]>('/familymembers');
  return response.data;
};

export const deleteFamilyMember = async (id: string): Promise<void> => {
  await api.delete(`/familymembers/${id}`);
};