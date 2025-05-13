import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';
import { generateId } from '../utils/helpers';

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (transaction: Transaction) => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

const sampleTransactions: Transaction[] = [
  {
    id: '1',
    amount: 2500,
    date: '2025-04-01',
    category: 'Salary',
    description: 'Monthly salary',
    type: 'income',
  },
  {
    id: '2',
    amount: 120,
    date: '2025-04-02',
    category: 'Food & Dining',
    description: 'Grocery shopping',
    type: 'expense',
  },
  {
    id: '3',
    amount: 50,
    date: '2025-04-03',
    category: 'Transportation',
    description: 'Gas',
    type: 'expense',
  },
  {
    id: '4',
    amount: 200,
    date: '2025-04-05',
    category: 'Entertainment',
    description: 'Concert tickets',
    type: 'expense',
  },
  {
    id: '5',
    amount: 800,
    date: '2025-04-05',
    category: 'Housing',
    description: 'Rent payment',
    type: 'expense',
  },
];

interface TransactionProviderProps {
  children: React.ReactNode;
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedTransactions = localStorage.getItem('transactions');
    return savedTransactions ? JSON.parse(savedTransactions) : sampleTransactions;
  });

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: generateId(),
    };
    setTransactions((prev) => [...prev, newTransaction]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions((prev) =>
      prev.map((transaction) =>
        transaction.id === updatedTransaction.id ? updatedTransaction : transaction
      )
    );
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        deleteTransaction,
        updateTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};