import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Transaction } from '../../types';
import { getCategoryBreakdown, getDefaultCategories, formatCurrency } from '../../utils/helpers';
import Card from '../ui/Card';

interface CategoryBreakdownProps {
  transactions: Transaction[];
}

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ transactions }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const categoryColors = getDefaultCategories();
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  
  // Get unique months from transactions
  const availableMonths = useMemo(() => {
    const months = transactions
      .filter(t => t.type === 'expense')
      .map(t => {
        const date = new Date(t.date);
        return {
          key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
          label: new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date),
          date: date
        };
      });
    
    const uniqueMonths = Array.from(
      new Map(months.map(m => [m.key, m])).values()
    ).sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return uniqueMonths;
  }, [transactions]);
  
  // Filter transactions based on selected month
  const filteredTransactions = useMemo(() => {
    if (selectedMonth === 'all') return transactions;
    
    return transactions.filter(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === selectedMonth;
    });
  }, [transactions, selectedMonth]);
  
  const categoryData = getCategoryBreakdown(filteredTransactions, categoryColors);
  
  // Calculate total for percentages
  const total = categoryData.reduce((sum, item) => sum + item.amount, 0);
  
  // Sort by highest amount
  const sortedCategories = [...categoryData].sort((a, b) => b.amount - a.amount);
  
  useEffect(() => {
    // Animation for the pie chart segments
    const segments = chartRef.current?.querySelectorAll('.pie-segment');
    if (segments) {
      segments.forEach((segment, index) => {
        setTimeout(() => {
          (segment as HTMLElement).style.opacity = '1';
        }, index * 100);
      });
    }
  }, [categoryData]);

  if (sortedCategories.length === 0) {
    return (
      <Card title="Category Breakdown">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No expense data yet</p>
          <p className="text-gray-400 text-sm mt-1">Add transactions to see category insights</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Category Breakdown">
      {/* Month Filter */}
      <div className="mb-6">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full md:w-auto px-4 py-2.5 bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">All Time</option>
          {availableMonths.map(month => (
            <option key={month.key} value={month.key}>
              {month.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative w-full md:w-1/2 aspect-square" ref={chartRef}>
          <div className="w-full h-full relative">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 drop-shadow-lg">
              {sortedCategories.length === 1 ? (
                // For single category, show a full circle
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill={sortedCategories[0].color}
                  className="pie-segment opacity-0 transition-opacity duration-500"
                />
              ) : (
                // For multiple categories, show pie segments
                sortedCategories.map((category, index) => {
                  // Calculate percentages and angles for the pie segments
                  const percentage = (category.amount / total) * 100;
                  const previousSegments = sortedCategories
                    .slice(0, index)
                    .reduce((sum, cat) => sum + (cat.amount / total) * 100, 0);
                  
                  // Convert percentages to SVG arc parameters
                  const startAngle = (previousSegments / 100) * 360;
                  const endAngle = ((previousSegments + percentage) / 100) * 360;
                  
                  // Calculate SVG arc path
                  const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                  const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                  const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                  const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
                  
                  // Determine if the arc should be drawn as a large arc
                  const largeArcFlag = percentage > 50 ? 1 : 0;
                  
                  return (
                    <path
                      key={category.category}
                      d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                      fill={category.color}
                      className="pie-segment opacity-0 transition-opacity duration-500 hover:opacity-90"
                    />
                  );
                })
              )}
              {/* Center white circle for donut effect */}
              <circle cx="50" cy="50" r="25" fill="white" className="drop-shadow-md" />
            </svg>
          </div>
        </div>
        
        <div className="w-full md:w-1/2 pt-2 md:pt-0">
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {sortedCategories.map((category) => {
              const percentage = ((category.amount / total) * 100).toFixed(1);
              
              return (
                <div key={category.category} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-semibold text-gray-700">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-800">{formatCurrency(category.amount)}</div>
                    <div className="text-xs font-medium text-gray-500">{percentage}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CategoryBreakdown;