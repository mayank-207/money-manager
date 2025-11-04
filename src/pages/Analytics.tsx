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
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 -z-10" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Analytics
            </h1>
            <p className="text-gray-600 mt-2">Track your financial insights and trends</p>
          </div>
          
          <div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-100">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-gray-500 font-medium text-sm mb-2">Net Balance</h3>
              <p className={`text-3xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrency(balance)}
              </p>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-3">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </div>
              <h3 className="text-emerald-700 font-medium text-sm mb-2">Total Income</h3>
              <p className="text-3xl font-bold text-emerald-600">{formatCurrency(income)}</p>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 mb-3">
                <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              </div>
              <h3 className="text-rose-700 font-medium text-sm mb-2">Total Expenses</h3>
              <p className="text-3xl font-bold text-rose-600">{formatCurrency(expenses)}</p>
            </div>
          </Card>
        </div>
        
        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SpendingChart transactions={filteredTransactions} />
          <CategoryBreakdown transactions={filteredTransactions} />
        </div>
        
        {/* Income vs Expense */}
        <div className="grid grid-cols-1 gap-6">
          <IncomeVsExpenseChart transactions={filteredTransactions} />
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;