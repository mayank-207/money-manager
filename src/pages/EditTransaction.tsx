import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import TransactionForm from '../components/transactions/TransactionForm';
import { useTransactions } from '../context/TransactionContext';
import { Transaction } from '../types';

const EditTransaction: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { transactions, updateTransaction } = useTransactions();
  
  const transaction = transactions.find(t => t.id === id);
  
  if (!transaction) {
    return <Navigate to="/transactions" />;
  }
  
  const handleSubmit = (updatedTransaction: Omit<Transaction, 'id'>) => {
    updateTransaction({
      ...updatedTransaction,
      id: transaction.id,
    });
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1D1D1F]">Edit Transaction</h1>
        <p className="text-[#86868B] mt-1">Update transaction details</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
        <TransactionForm 
          onSubmit={handleSubmit} 
          initialData={transaction}
          isEditing 
        />
      </div>
    </Layout>
  );
};

export default EditTransaction;