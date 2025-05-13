import React, { useEffect, useRef } from 'react';
import { Transaction } from '../../types';
import { getMonthlySpending, formatCurrency } from '../../utils/helpers';
import Card from '../ui/Card';

interface SpendingChartProps {
  transactions: Transaction[];
}

const SpendingChart: React.FC<SpendingChartProps> = ({ transactions }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const monthlyData = getMonthlySpending(transactions);
  
  const maxAmount = Math.max(...monthlyData.map(item => item.amount), 1000);
  
  useEffect(() => {
    // Simple animation for the chart bars
    const bars = chartRef.current?.querySelectorAll('.chart-bar');
    if (bars) {
      bars.forEach((bar, index) => {
        setTimeout(() => {
          (bar as HTMLElement).style.height = `${(bar as HTMLElement).dataset.height}%`;
        }, index * 100);
      });
    }
  }, [monthlyData]);

  if (monthlyData.length === 0) {
    return (
      <Card title="Monthly Spending">
        <div className="text-center py-8">
          <p className="text-[#86868B]">No spending data available yet.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Monthly Spending">
      <div className="h-64" ref={chartRef}>
        <div className="flex h-full items-end justify-between">
          {monthlyData.map((item) => {
            const height = (item.amount / maxAmount) * 100;
            
            return (
              <div key={item.month} className="flex flex-col items-center flex-1">
                <div className="relative w-full flex justify-center mb-2">
                  <div 
                    className="chart-bar w-4/5 max-w-[40px] bg-[#0A84FF] rounded-t-md transition-all duration-700 ease-out h-0" 
                    data-height={height}
                    style={{ height: '0%' }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#1D1D1F] text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {formatCurrency(item.amount)}
                    </div>
                  </div>
                </div>
                <div className="text-xs font-medium text-[#86868B]">{item.month}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default SpendingChart;