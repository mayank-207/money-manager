import React from 'react';
import Layout from '../components/layout/Layout';
import TransactionForm from '../components/transactions/TransactionForm';
import { useTransactions } from '../context/TransactionContext';
import { Transaction } from '../types';

const NewTransaction: React.FC = () => {
  const { addTransaction } = useTransactions();

  const handleSubmit = (transaction: Omit<Transaction, 'id'>) => {
    addTransaction(transaction);
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1D1D1F]">Add Transaction</h1>
        <p className="text-[#86868B] mt-1">Create a new transaction record</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
        <TransactionForm onSubmit={handleSubmit} />
      </div>
    </Layout>
  );
};

export default NewTransaction;