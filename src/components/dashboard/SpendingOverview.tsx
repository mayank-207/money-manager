import React from 'react';
import Card from '../ui/Card';
import { Transaction } from '../../types';
import { formatCurrency, getCategoryBreakdown, getDefaultCategories } from '../../utils/helpers';

interface SpendingOverviewProps {
  transactions: Transaction[];
}

const SpendingOverview: React.FC<SpendingOverviewProps> = ({ transactions }) => {
  const categoryColors = getDefaultCategories();
  const categorySpendings = getCategoryBreakdown(transactions, categoryColors);
  
  // Sort by highest amount
  const sortedCategories = [...categorySpendings]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4); // Show top 4 categories
  
  // Calculate total spending for percentages
  const totalSpending = categorySpendings.reduce((sum, category) => sum + category.amount, 0);

  if (sortedCategories.length === 0) {
    return (
      <Card title="Spending Overview">
        <div className="text-center py-8">
          <p className="text-[#86868B]">No spending data available yet.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Spending Overview">
      <div className="space-y-4">
        {sortedCategories.map((category) => {
          const percentage = totalSpending > 0 ? (category.amount / totalSpending) * 100 : 0;
          
          return (
            <div key={category.category} className="space-y-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="text-sm font-medium text-[#1D1D1F]">{category.category}</span>
                </div>
                <span className="text-sm font-medium text-[#1D1D1F]">
                  {formatCurrency(category.amount)}
                </span>
              </div>
              <div className="w-full bg-[#F5F5F7] rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${percentage}%`, backgroundColor: category.color }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default SpendingOverview;