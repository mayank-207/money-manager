import React from 'react';
import { Plus } from 'lucide-react';
import Layout from '../components/layout/Layout';
import BalanceCard from '../components/dashboard/BalanceCard';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import SpendingOverview from '../components/dashboard/SpendingOverview';
import QuickActions from '../components/dashboard/QuickActions';
import { useTransactions } from '../context/TransactionContext';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { transactions } = useTransactions();

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#1D1D1F]">Dashboard</h1>
        <Link to="/transactions/new">
          <Button variant="primary" className="flex items-center">
            <Plus size={18} className="mr-1" />
            <span>Add Transaction</span>
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2">
          <BalanceCard transactions={transactions} />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactions transactions={transactions} />
        <SpendingOverview transactions={transactions} />
      </div>
    </Layout>
  );
};

export default Dashboard;