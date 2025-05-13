import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import { useTransactions } from '../context/TransactionContext';
import SpendingChart from '../components/analytics/SpendingChart';
import CategoryBreakdown from '../components/analytics/CategoryBreakdown';
import IncomeVsExpenseChart from '../components/analytics/IncomeVsExpenseChart';
import Card from '../components/ui/Card';
import { formatCurrency, calculateBalance } from '../utils/helpers';

const Analytics: React.FC = () => {
  const { transactions } = useTransactions();
  const [dateRange, setDateRange] = useState<'all' | '30days' | '90days' | 'year'>('all');
  
  const getFilteredTransactions = () => {
    if (dateRange === 'all') return transactions;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    if (dateRange === '30days') {
      cutoffDate.setDate(now.getDate() - 30);
    } else if (dateRange === '90days') {
      cutoffDate.setDate(now.getDate() - 90);
    } else if (dateRange === 'year') {
      cutoffDate.setFullYear(now.getFullYear() - 1);
    }
    
    return transactions.filter(t => new Date(t.date) >= cutoffDate);
  };
  
  const filteredTransactions = getFilteredTransactions();
  const balance = calculateBalance(filteredTransactions);
  
  const income = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const expenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#1D1D1F]">Analytics</h1>
        
        <div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-3 py-2 bg-white border border-[#E5E5EA] rounded-lg text-sm font-medium"
          >
            <option value="all">All Time</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="text-center">
            <h3 className="text-[#86868B] font-medium text-sm mb-2">Net Balance</h3>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-[#30D158]' : 'text-[#FF453A]'}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <h3 className="text-[#86868B] font-medium text-sm mb-2">Total Income</h3>
            <p className="text-2xl font-bold text-[#30D158]">{formatCurrency(income)}</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <h3 className="text-[#86868B] font-medium text-sm mb-2">Total Expenses</h3>
            <p className="text-2xl font-bold text-[#FF453A]">{formatCurrency(expenses)}</p>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SpendingChart transactions={filteredTransactions} />
        <CategoryBreakdown transactions={filteredTransactions} />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <IncomeVsExpenseChart transactions={filteredTransactions} />
      </div>
    </Layout>
  );
};

export default Analytics;