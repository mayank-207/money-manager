import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, CheckCircle, Circle } from 'lucide-react';
import { SharedExpense } from '../../types';
import Card from '../ui/Card';

interface ExpenseHistoryProps {
  expenses: SharedExpense[];
}

const ExpenseHistory: React.FC<ExpenseHistoryProps> = ({ expenses }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (expenses.length === 0) {
    return (
      <Card className="text-center py-12">
        <DollarSign className="mx-auto text-gray-400 mb-3" size={48} />
        <p className="text-gray-500">No expenses recorded yet. Add your first expense to get started.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => {
        const allSettled = expense.splits?.every(split => split.settled) ?? false;

        return (
          <Card key={expense.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  expense.type === 'expense' ? 'bg-red-100' : 'bg-green-100'
                }`}>
                  {expense.type === 'expense' ? (
                    <TrendingDown className="text-red-600" size={20} />
                  ) : (
                    <TrendingUp className="text-green-600" size={20} />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{expense.category}</h3>
                    {allSettled ? (
                      <CheckCircle className="text-green-500" size={16} />
                    ) : (
                      <Circle className="text-gray-400" size={16} />
                    )}
                  </div>

                  {expense.description && (
                    <p className="text-sm text-gray-600 mb-1">{expense.description}</p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>Paid by {expense.payer?.name || 'Unknown'}</span>
                    <span>•</span>
                    <span>{formatDate(expense.expense_date)}</span>
                  </div>

                  {expense.splits && expense.splits.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Split among:</p>
                      <div className="flex flex-wrap gap-2">
                        {expense.splits.map((split) => (
                          <span
                            key={split.id}
                            className={`text-xs px-2 py-1 rounded-full ${
                              split.settled
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {split.participant?.name || 'Unknown'}: {formatAmount(split.amount)}
                            {split.settled && ' ✓'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className={`text-lg font-bold ${
                  expense.type === 'expense' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {expense.type === 'expense' ? '-' : '+'}{formatAmount(expense.amount)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {allSettled ? 'Settled' : 'Pending'}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ExpenseHistory;
