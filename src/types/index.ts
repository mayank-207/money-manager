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