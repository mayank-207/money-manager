import React from 'react';
import { Plus } from 'lucide-react';
import Layout from '../components/layout/Layout';
import TransactionList from '../components/transactions/TransactionList';
import { useTransactions } from '../context/TransactionContext';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';

const Transactions: React.FC = () => {
  const { transactions, deleteTransaction } = useTransactions();

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#1D1D1F]">Transactions</h1>
        <Link to="/transactions/new">
          <Button variant="primary" className="flex items-center">
            <Plus size={18} className="mr-1" />
            <span>Add Transaction</span>
          </Button>
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <TransactionList 
          transactions={transactions} 
          onDelete={deleteTransaction} 
        />
      </div>
    </Layout>
  );
};

export default Transactions;