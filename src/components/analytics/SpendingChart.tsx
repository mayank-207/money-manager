import React, { useEffect, useState } from 'react';
import { Transaction } from '../../types';
import { getMonthlyCategorySpending, formatCurrency } from '../../utils/helpers';
import Card from '../ui/Card';

interface SpendingChartProps {
  transactions: Transaction[];
}

const SpendingChart: React.FC<SpendingChartProps> = ({ transactions }) => {
  const [animated, setAnimated] = useState(false);
  const monthlyData = getMonthlyCategorySpending(transactions);
  
  // Calculate max amount across all categories in all months
  const calculateMaxAmount = () => {
    const allAmounts = monthlyData.flatMap(m => m.categories.map(c => c.amount));
    const max = Math.max(...allAmounts, 100);
    const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
    return Math.ceil(max / magnitude) * magnitude;
  };
  
  const maxAmount = calculateMaxAmount();
  
  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setAnimated(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [monthlyData]);

  if (monthlyData.length === 0) {
    return (
      <Card title="Expenses">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No expense data yet</p>
          <p className="text-gray-400 text-sm mt-1">Add transactions to see spending trends</p>
        </div>
      </Card>
    );
  }

  // Generate Y-axis labels
  const yAxisLabels = [
    maxAmount,
    maxAmount * 0.75,
    maxAmount * 0.5,
    maxAmount * 0.25,
    0
  ];

  // Get all unique categories across all months for legend
  const allCategories = Array.from(
    new Set(monthlyData.flatMap(m => m.categories.map(c => c.category)))
  ).map(category => {
    const categoryData = monthlyData
      .flatMap(m => m.categories)
      .find(c => c.category === category);
    return {
      name: category,
      color: categoryData?.color || '#86868B'
    };
  });

  return (
    <Card title="Expenses">
      <div className="relative px-4 py-6">
        {/* Chart container with fixed height */}
        <div className="h-80 relative flex">
          {/* Y-axis labels */}
          <div className="flex flex-col justify-between text-xs text-gray-500 font-medium pr-3 pb-6">
            {yAxisLabels.map((value, i) => (
              <div key={i} className="text-right leading-none">
                ${value.toFixed(0)}
              </div>
            ))}
          </div>
          
          {/* Chart area */}
          <div className="flex-1 relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pb-6 pointer-events-none border-l border-gray-200">
              {yAxisLabels.map((_, i) => (
                <div key={i} className="border-t border-gray-100 w-full" />
              ))}
            </div>
            
            {/* Bars container - Grouped by month */}
            <div className="absolute inset-0 flex items-end justify-around gap-4 px-2 pb-6">
              {monthlyData.map((monthItem, monthIndex) => {
                // Calculate group width based on number of categories
                const categoryCount = monthItem.categories.length;
                const barWidth = categoryCount <= 2 ? '24px' : categoryCount <= 4 ? '20px' : '16px';
                
                return (
                  <div 
                    key={`${monthItem.month}-${monthIndex}`} 
                    className="flex flex-col items-center h-full"
                    style={{ flex: '0 1 auto' }}
                  >
                    {/* Group of bars for this month */}
                    <div className="flex items-end justify-center gap-1 flex-1 w-full">
                      {monthItem.categories.map((category, catIndex) => {
                        const heightPercentage = (category.amount / maxAmount) * 100;
                        
                        return (
                          <div
                            key={`${category.category}-${catIndex}`}
                            className="flex flex-col items-center justify-end relative group"
                            style={{ 
                              width: barWidth, 
                              minWidth: '14px',
                              height: '100%'
                            }}
                          >
                            {/* Individual bar */}
                            <div
                              className="w-full rounded-t-lg transition-all duration-700 ease-out relative shadow-md hover:shadow-lg"
                              style={{
                                height: animated ? `${heightPercentage}%` : '0%',
                                backgroundColor: category.color,
                                minHeight: category.amount > 0 ? '3px' : '0'
                              }}
                            >
                              {/* Tooltip on hover */}
                              <div className="absolute left-1/2 bottom-full mb-2 transform -translate-x-1/2 bg-gradient-to-r from-gray-800 to-gray-700 text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-xl">
                                <div className="font-semibold">{category.category}</div>
                                <div className="text-center font-bold mt-0.5">{formatCurrency(category.amount)}</div>
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-700"></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Month label */}
                    <div className="text-xs font-semibold text-gray-600 text-center mt-2 whitespace-nowrap">
                      {monthItem.month}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Legend - matching pie chart categories */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 justify-center">
            {allCategories.map(category => (
              <div key={category.name} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors">
                <div
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-xs font-semibold text-gray-700">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SpendingChart;