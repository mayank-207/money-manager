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

  const monthlyAmounts: { [key: string]: number } = {};

  expenseTransactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (monthlyAmounts[monthYear]) {
      monthlyAmounts[monthYear] += transaction.amount;
    } else {
      monthlyAmounts[monthYear] = transaction.amount;
    }
  });

  return Object.entries(monthlyAmounts)
    .map(([monthYear, amount]) => {
      const [year, month] = monthYear.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return {
        month: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date),
        amount,
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));
};

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Get default categories with colors
export const getDefaultCategories = (): { [key: string]: string } => {
  return {
    'Food & Dining': '#30D158',
    'Transportation': '#FF9F0A',
    'Entertainment': '#5E5CE6',
    'Housing': '#0A84FF',
    'Utilities': '#FF453A',
    'Healthcare': '#64D2FF',
    'Shopping': '#BF5AF2',
    'Personal': '#FF2D55',
    'Education': '#FFD60A',
    'Travel': '#30B0C7',
    'Salary': '#30D158',
    'Investment': '#5E5CE6',
    'Gift': '#FF2D55',
    'Other': '#86868B',
  };
};