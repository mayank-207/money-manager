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
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-emerald-700 font-semibold">Income</div>
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(income)}</div>
          </div>
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-5 rounded-xl border border-rose-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-rose-700 font-semibold">Expenses</div>
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-rose-600">{formatCurrency(expenses)}</div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-3">
            <span className="text-sm font-bold text-gray-700">Comparison</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-600">Savings Rate:</span>
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                savingsRate >= 0 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-rose-100 text-rose-700'
              }`}>
                {savingsRate.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="h-10 w-full bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
            <div
              className="chart-bar bg-gradient-to-r from-emerald-400 to-emerald-500 h-full transition-all duration-1000 ease-out"
              style={{ width: '0%' }}
              data-width={incomePercentage}
            />
            <div
              className="chart-bar bg-gradient-to-r from-rose-400 to-rose-500 h-full transition-all duration-1000 ease-out"
              style={{ width: '0%' }}
              data-width={expensePercentage}
            />
          </div>
          <div className="flex justify-between mt-3 text-xs font-semibold">
            <span className="text-emerald-600">Income ({incomePercentage.toFixed(1)}%)</span>
            <span className="text-rose-600">Expenses ({expensePercentage.toFixed(1)}%)</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default IncomeVsExpenseChart;