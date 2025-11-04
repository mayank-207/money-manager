import { Transaction, CategorySpending, MonthlySpending } from '../types';

// Format currency with proper symbol and decimal places
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format date in a readable format
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

// Calculate total balance from transactions
export const calculateBalance = (transactions: Transaction[]): number => {
  return transactions.reduce((total, transaction) => {
    return transaction.type === 'income'
      ? total + transaction.amount
      : total - transaction.amount;
  }, 0);
};

// Get category spending breakdown
export const getCategoryBreakdown = (
  transactions: Transaction[],
  categories: { [key: string]: string }
): CategorySpending[] => {
  const expenseTransactions = transactions.filter(
    (transaction) => transaction.type === 'expense'
  );

  const categoryAmounts: { [key: string]: number } = {};

  expenseTransactions.forEach((transaction) => {
    if (categoryAmounts[transaction.category]) {
      categoryAmounts[transaction.category] += transaction.amount;
    } else {
      categoryAmounts[transaction.category] = transaction.amount;
    }
  });

  return Object.entries(categoryAmounts).map(([category, amount]) => ({
    category,
    amount,
    color: categories[category] || '#0A84FF',
  }));
};

// Get monthly spending data
export const getMonthlySpending = (
  transactions: Transaction[]
): MonthlySpending[] => {
  const expenseTransactions = transactions.filter(
    (transaction) => transaction.type === 'expense'
  );

  const monthlyAmounts: { [key: string]: { amount: number; date: Date } } = {};

  expenseTransactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (monthlyAmounts[monthYear]) {
      monthlyAmounts[monthYear].amount += transaction.amount;
    } else {
      monthlyAmounts[monthYear] = {
        amount: transaction.amount,
        date: new Date(date.getFullYear(), date.getMonth(), 1)
      };
    }
  });

  return Object.entries(monthlyAmounts)
    .map(([, data]) => ({
      month: new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(data.date),
      amount: data.amount,
      date: data.date
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(-12); // Show only last 12 months for better UI
};

// Get monthly spending data by category
export const getMonthlyCategorySpending = (
  transactions: Transaction[]
): { month: string; categories: CategorySpending[]; total: number; date: Date }[] => {
  const expenseTransactions = transactions.filter(
    (transaction) => transaction.type === 'expense'
  );

  const monthlyData: { 
    [key: string]: { 
      categories: { [key: string]: number }; 
      total: number; 
      date: Date 
    } 
  } = {};

  expenseTransactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = {
        categories: {},
        total: 0,
        date: new Date(date.getFullYear(), date.getMonth(), 1)
      };
    }
    
    if (!monthlyData[monthYear].categories[transaction.category]) {
      monthlyData[monthYear].categories[transaction.category] = 0;
    }
    
    monthlyData[monthYear].categories[transaction.category] += transaction.amount;
    monthlyData[monthYear].total += transaction.amount;
  });

  const categories = getDefaultCategories();

  return Object.entries(monthlyData)
    .map(([, data]) => ({
      month: new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(data.date),
      categories: Object.entries(data.categories).map(([category, amount]) => ({
        category,
        amount,
        color: categories[category] || '#0A84FF'
      })),
      total: data.total,
      date: data.date
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(-12); // Show only last 12 months for better UI
};

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Get default categories with colors
export const getDefaultCategories = (): { [key: string]: string } => {
  return {
    'Food & Dining': '#10b981',    // Emerald-500
    'Transportation': '#f59e0b',   // Amber-500
    'Entertainment': '#8b5cf6',    // Violet-500
    'Housing': '#3b82f6',          // Blue-500
    'Utilities': '#ef4444',        // Red-500
    'Healthcare': '#06b6d4',       // Cyan-500
    'Shopping': '#d946ef',         // Fuchsia-500
    'Personal': '#ec4899',         // Pink-500
    'Education': '#eab308',        // Yellow-500
    'Travel': '#14b8a6',           // Teal-500
    'Salary': '#22c55e',           // Green-500
    'Investment': '#6366f1',       // Indigo-500
    'Gift': '#f43f5e',             // Rose-500
    'Other': '#64748b',            // Slate-500
  };
};