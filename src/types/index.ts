export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  category: string;
  description: string;
  type: TransactionType;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface MonthlySpending {
  month: string;
  amount: number;
}

export interface CategorySpending {
  category: string;
  amount: number;
  color: string;
}

export interface Participant {
  id: string;
  name: string;
  date_of_birth?: string;
  mobile?: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseGroup {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export type GroupRole = 'admin' | 'member';

export interface GroupMember {
  id: string;
  group_id: string;
  participant_id: string;
  role: GroupRole;
  can_add_expense: boolean;
  can_edit_expense: boolean;
  can_delete_expense: boolean;
  joined_at: string;
  participant?: Participant;
}

export type SharedExpenseType = 'expense' | 'income';

export interface SharedExpense {
  id: string;
  group_id: string;
  paid_by: string;
  amount: number;
  category: string;
  description?: string;
  expense_date: string;
  type: SharedExpenseType;
  created_at: string;
  updated_at: string;
  payer?: Participant;
  splits?: ExpenseSplit[];
}

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  participant_id: string;
  amount: number;
  settled: boolean;
  settled_at?: string;
  participant?: Participant;
}