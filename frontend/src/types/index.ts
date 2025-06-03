// Core type definitions for the Family Budget System

// Relationship types within the family
export enum RelationshipType {
  CHILD = 'ребенок',
  HUSBAND = 'муж',
  WIFE = 'жена',
  GRANDMOTHER = 'бабушка',
  GRANDFATHER = 'дедушка',
  GRANDCHILD = 'внук/ внучка',
  OTHER = 'другое'
}

// Types of income
export enum IncomeType {
  SALARY = 'зарплата',
  PENSION = 'пенсия',
  SCHOLARSHIP = 'стипендия',
  ADDITIONAL = 'премия',
  CREDIT = 'займ',
  OTHER = 'другое'
}

// Account types for allocating income
export enum AccountType {
  Main = 'текущий капитал',
  Savings = 'резервный капитал',
  Investment = 'инвестиционный капитал'
}

// Expense categories
export enum ExpenseCategory {
  FOOD = 'еда',
  CLOTHING = 'одежда',
  UTILITIES = 'услуги',
  MOBILE = 'связь',
  LEISURE = 'развлечения',
  EDUCATION = 'образование',
  MEDICINE = 'медицина',
  OTHER = 'другое'
}

export interface FamilyAccount {
  id: string;
  accountType: number;
  balance: number;
}

// Family member interface
export interface FamilyMember {
  id: string;
  name: string;
  familyId: string;
  userId: string;
  relationshipType: RelationshipType;
  incomeTypes: IncomeType[];
  role: string;
}

// Income transaction interface
export interface Income {
  id: string;
  amount: number;
  type: IncomeType;
  date: Date;
  familyMemberId: string;
  familyMember: FamilyMember;
}

// Expense interface
export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  date: Date;
  familyMemberId: string;
  description: string;
  account: number;
  isPlanned: boolean;
}

// Account balance interface
export interface AccountBalance {
  [AccountType.Main]: number;    // текущий капитал
  [AccountType.Savings]: number; // резервный капитал
  [AccountType.Investment]: number;   // инвестиционный капитал
}

// Session interface
export interface Session {
  activeMemberId: string | null;
  startTime: Date | null;
  isActive: boolean;
}

// Report date range
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Budget summary interface
export interface BudgetSummary {
  totalIncome: number;
  totalExpenses: number;
  totalPlannedExpenses: number;
  balance: number;
  dateRange: DateRange;
}

export interface AuthResponse {
  token: string;
  user: UserData;
}

export interface JoinFamilyRequest {
  id: string;
  creatorEmail: string;
  userEmail: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface UserData {
  id: string;
  email: string;
}
