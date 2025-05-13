import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Card from '../ui/Card';
import { Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  // Get the 5 most recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  if (recentTransactions.length === 0) {
    return (
      <Card title="Recent Transactions">
        <div className="text-center py-8">
          <p className="text-[#86868B] mb-4">No transactions yet.</p>
          <Link to="/transactions">
            <Button variant="primary">Add Transaction</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Recent Transactions">
      <div className="space-y-4">
        {recentTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F5F5F7] transition-colors"
          >
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  transaction.type === 'income' ? 'bg-[#30D158]/10' : 'bg-[#FF453A]/10'
                }`}
              >
                {transaction.type === 'income' ? (
                  <ArrowUpRight
                    size={20}
                    className="text-[#30D158]"
                  />
                ) : (
                  <ArrowDownRight
                    size={20}
                    className="text-[#FF453A]"
                  />
                )}
              </div>
              <div>
                <p className="font-medium text-[#1D1D1F]">{transaction.category}</p>
                <p className="text-sm text-[#86868B]">{transaction.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`font-semibold ${
                  transaction.type === 'income' ? 'text-[#30D158]' : 'text-[#FF453A]'
                }`}
              >
                {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
              </p>
              <p className="text-xs text-[#86868B]">{formatDate(transaction.date)}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-[#F5F5F7]">
        <Link to="/transactions">
          <Button variant="outline" fullWidth>View All Transactions</Button>
        </Link>
      </div>
    </Card>
  );
};

export default RecentTransactions;