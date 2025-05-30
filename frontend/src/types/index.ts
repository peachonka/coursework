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
  MAIN = 'текущий капитал',
  SAVINGS = 'резервный капитал',
  STASH = 'инвестиционный капитал'
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
  accountType: AccountType;
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
  accountType: AccountType;
}

// Expense interface
export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  date: Date;
  familyMemberId: string;
  description: string;
  isPlanned: boolean;
}

// Account balance interface
export interface AccountBalance {
  [AccountType.MAIN]: number;    // текущий капитал
  [AccountType.SAVINGS]: number; // резервный капитал
  [AccountType.STASH]: number;   // инвестиционный капитал
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

export interface UserData {
  id: string;
  email: string;
  name: string;
}
