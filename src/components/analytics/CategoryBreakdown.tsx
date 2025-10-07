import React, { useEffect, useRef } from 'react';
import { Transaction } from '../../types';
import { getCategoryBreakdown, getDefaultCategories, formatCurrency } from '../../utils/helpers';
import Card from '../ui/Card';

interface CategoryBreakdownProps {
  transactions: Transaction[];
}

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ transactions }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const categoryColors = getDefaultCategories();
  const categoryData = getCategoryBreakdown(transactions, categoryColors);
  
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
        <div className="text-center py-8">
          <p className="text-[#86868B]">No data yet. Add transactions to see insights.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Category Breakdown">
      <div className="flex flex-col md:flex-row">
        <div className="relative w-full md:w-1/2 aspect-square" ref={chartRef}>
          {sortedCategories.length > 0 ? (
            <div className="w-full h-full relative">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {sortedCategories.map((category, index) => {
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
                      className="pie-segment opacity-0 transition-opacity duration-500"
                    />
                  );
                })}
                <circle cx="50" cy="50" r="25" fill="white" />
              </svg>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#86868B]">No data</p>
            </div>
          )}
        </div>
        
        <div className="w-full md:w-1/2 pt-6 md:pt-0 md:pl-6">
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
            {sortedCategories.map((category) => {
              const percentage = ((category.amount / total) * 100).toFixed(1);
              
              return (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatCurrency(category.amount)}</div>
                    <div className="text-xs text-[#86868B]">{percentage}%</div>
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