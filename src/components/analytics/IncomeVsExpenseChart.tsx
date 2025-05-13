import React, { useEffect, useRef } from 'react';
import { Transaction } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import Card from '../ui/Card';

interface IncomeVsExpenseChartProps {
  transactions: Transaction[];
}

const IncomeVsExpenseChart: React.FC<IncomeVsExpenseChartProps> = ({ transactions }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Calculate total income and expenses
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Calculate percentages and savings rate
  const total = income + expenses;
  const incomePercentage = total > 0 ? (income / total) * 100 : 50;
  const expensePercentage = total > 0 ? (expenses / total) * 100 : 50;
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
  
  useEffect(() => {
    // Animation for the chart bars
    const bars = chartRef.current?.querySelectorAll('.chart-bar');
    if (bars) {
      bars.forEach((bar) => {
        setTimeout(() => {
          (bar as HTMLElement).style.width = `${(bar as HTMLElement).dataset.width}%`;
        }, 100);
      });
    }
  }, [income, expenses]);

  return (
    <Card title="Income vs. Expenses">
      <div className="space-y-6" ref={chartRef}>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#F5F5F7] p-4 rounded-lg">
            <div className="text-sm text-[#86868B] mb-1">Income</div>
            <div className="text-xl font-semibold text-[#30D158]">{formatCurrency(income)}</div>
          </div>
          <div className="bg-[#F5F5F7] p-4 rounded-lg">
            <div className="text-sm text-[#86868B] mb-1">Expenses</div>
            <div className="text-xl font-semibold text-[#FF453A]">{formatCurrency(expenses)}</div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Comparison</span>
            <span className="text-sm font-medium">
              Savings Rate: <span className={savingsRate >= 0 ? 'text-[#30D158]' : 'text-[#FF453A]'}>
                {savingsRate.toFixed(1)}%
              </span>
            </span>
          </div>
          <div className="h-8 w-full bg-[#F5F5F7] rounded-full overflow-hidden flex">
            <div
              className="chart-bar bg-[#30D158] h-full transition-all duration-1000 ease-out"
              style={{ width: '0%' }}
              data-width={incomePercentage}
            />
            <div
              className="chart-bar bg-[#FF453A] h-full transition-all duration-1000 ease-out"
              style={{ width: '0%' }}
              data-width={expensePercentage}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-[#86868B]">
            <span>Income ({incomePercentage.toFixed(1)}%)</span>
            <span>Expenses ({expensePercentage.toFixed(1)}%)</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default IncomeVsExpenseChart;