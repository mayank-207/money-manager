import React, { useState, useEffect } from 'react';
import TransactionManager from '../components/transactions/TransactionManager';
import { Transaction } from '../types';

// Sample transactions for demonstration
const sampleTransactions: Transaction[] = [
  {
    id: '1',
    amount: 1500,
    date: '2024-01-15',
    category: 'Food & Dining',
    description: 'Lunch at McDonald\'s',
    type: 'expense'
  },
  {
    id: '2',
    amount: 5000,
    date: '2024-01-14',
    category: 'Transportation',
    description: 'Uber ride to office',
    type: 'expense'
  },
  {
    id: '3',
    amount: 25000,
    date: '2024-01-10',
    category: 'Housing',
    description: 'Monthly rent payment',
    type: 'expense'
  },
  {
    id: '4',
    amount: 50000,
    date: '2024-01-01',
    category: 'Salary',
    description: 'Monthly salary',
    type: 'income'
  },
  {
    id: '5',
    amount: 800,
    date: '2024-01-12',
    category: 'Shopping',
    description: 'Amazon purchase',
    type: 'expense'
  },
  {
    id: '6',
    amount: 1200,
    date: '2024-01-08',
    category: 'Healthcare',
    description: 'Pharmacy visit',
    type: 'expense'
  }
];

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(sampleTransactions);

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  const handleUpdateTransaction = (id: string, updatedTransaction: Transaction) => {
    setTransactions(prev => 
      prev.map(t => t.id === id ? { ...updatedTransaction, id } : t)
    );
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] p-6">
      <div className="max-w-7xl mx-auto">
        <TransactionManager
          transactions={transactions}
          onAddTransaction={handleAddTransaction}
          onUpdateTransaction={handleUpdateTransaction}
          onDeleteTransaction={handleDeleteTransaction}
        />
      </div>
    </div>
  );
};

export default TransactionsPage;
