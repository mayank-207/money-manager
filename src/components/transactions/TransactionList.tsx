import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Pencil, Trash2, Search, Filter } from 'lucide-react';
import { Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this transaction? You can\'t undo this.')) {
      onDelete(id);
    }
  };

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter((transaction) => {
      // Filter by type
      if (filter !== 'all' && transaction.type !== filter) {
        return false;
      }
      
      // Search term
      const searchLower = searchTerm.toLowerCase();
      return (
        transaction.description.toLowerCase().includes(searchLower) ||
        transaction.category.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      // Sort by selected field and direction
      if (sortBy === 'date') {
        return sortDirection === 'asc'
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return sortDirection === 'asc'
          ? a.amount - b.amount
          : b.amount - a.amount;
      }
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-grow max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868B]" />
          <input
            type="text"
            placeholder="Search by description or category"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-[#E5E5EA] rounded-lg focus:ring-2 focus:ring-[#0A84FF] focus:border-[#0A84FF]"
          />
        </div>
        
        <div className="flex space-x-2">
          <div className="relative">
            <button
              className="px-3 py-2 bg-white border border-[#E5E5EA] rounded-lg flex items-center space-x-1 text-sm font-medium"
            >
              <Filter size={18} />
              <span>Filter</span>
            </button>
            
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#E5E5EA] z-10 hidden group-hover:block">
              <div className="p-2">
                <button
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                    filter === 'all' ? 'bg-[#F5F5F7] text-[#0A84FF]' : 'hover:bg-[#F5F5F7]'
                  }`}
                  onClick={() => setFilter('all')}
                >
                  All transactions
                </button>
                <button
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                    filter === 'income' ? 'bg-[#F5F5F7] text-[#0A84FF]' : 'hover:bg-[#F5F5F7]'
                  }`}
                  onClick={() => setFilter('income')}
                >
                  Income only
                </button>
                <button
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                    filter === 'expense' ? 'bg-[#F5F5F7] text-[#0A84FF]' : 'hover:bg-[#F5F5F7]'
                  }`}
                  onClick={() => setFilter('expense')}
                >
                  Expenses only
                </button>
              </div>
            </div>
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'income' | 'expense')}
            className="px-3 py-2 bg-white border border-[#E5E5EA] rounded-lg text-sm font-medium"
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
          </select>
          
          <select
            value={`${sortBy}-${sortDirection}`}
            onChange={(e) => {
              const [newSortBy, newSortDirection] = e.target.value.split('-');
              setSortBy(newSortBy as 'date' | 'amount');
              setSortDirection(newSortDirection as 'asc' | 'desc');
            }}
            className="px-3 py-2 bg-white border border-[#E5E5EA] rounded-lg text-sm font-medium"
          >
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="amount-desc">Amount: high to low</option>
            <option value="amount-asc">Amount: low to high</option>
          </select>
        </div>
      </div>
      
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-[#E5E5EA]">
          <p className="text-[#86868B] mb-4">No matches. Try a different search or filter.</p>
          <Link to="/transactions/new">
            <Button variant="primary">Add transaction</Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#F5F5F7]">
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#1D1D1F] border-b border-[#E5E5EA]">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#1D1D1F] border-b border-[#E5E5EA]">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#1D1D1F] border-b border-[#E5E5EA]">Category</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#1D1D1F] border-b border-[#E5E5EA]">Description</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-[#1D1D1F] border-b border-[#E5E5EA]">Amount</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-[#1D1D1F] border-b border-[#E5E5EA]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr 
                  key={transaction.id} 
                  className="border-b border-[#E5E5EA] hover:bg-[#F5F5F7] transition-colors"
                >
                  <td className="py-4 px-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-[#30D158]/10' : 'bg-[#FF453A]/10'
                      }`}
                    >
                      {transaction.type === 'income' ? (
                        <ArrowUpRight
                          size={16}
                          className="text-[#30D158]"
                        />
                      ) : (
                        <ArrowDownRight
                          size={16}
                          className="text-[#FF453A]"
                        />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-[#1D1D1F]">{formatDate(transaction.date)}</td>
                  <td className="py-4 px-4 text-sm text-[#1D1D1F]">{transaction.category}</td>
                  <td className="py-4 px-4 text-sm text-[#1D1D1F]">{transaction.description}</td>
                  <td className={`py-4 px-4 text-sm font-medium text-right ${
                    transaction.type === 'income' ? 'text-[#30D158]' : 'text-[#FF453A]'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <Link
                        to={`/transactions/edit/${transaction.id}`}
                        className="p-1.5 text-[#0A84FF] rounded-full hover:bg-[#0A84FF]/10 transition-colors"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="p-1.5 text-[#FF453A] rounded-full hover:bg-[#FF453A]/10 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {transactions.length > 0 && (
        <div className="flex justify-between items-center py-4">
          <p className="text-sm text-[#86868B]">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </p>
          <Link to="/transactions/new">
            <Button variant="primary">Add transaction</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default TransactionList;