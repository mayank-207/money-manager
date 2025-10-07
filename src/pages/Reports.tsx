import React, { useMemo, useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTransactions } from '../context/TransactionContext';
import { Transaction } from '../types';
import { BarChart, PieChart, LineChart } from '../components/reports/Charts';

type ReportTab = 'whatsapp' | 'professional' | 'statement' | 'graphical' | 'dashboard';

interface DateRange {
  from: string;
  to: string;
}

const initialDateRange = (): DateRange => {
  const to = new Date().toISOString().split('T')[0];
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  const from = d.toISOString().split('T')[0];
  return { from, to };
};

const filterTransactions = (transactions: Transaction[], dateRange: DateRange) => {
  const from = new Date(dateRange.from);
  const to = new Date(dateRange.to);
  to.setHours(23, 59, 59, 999);
  return transactions.filter((t) => {
    const d = new Date(t.date);
    return d >= from && d <= to;
  });
};

const downloadCSV = (rows: Array<Record<string, any>>, filename: string) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? '')).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

const Reports: React.FC = () => {
  const { transactions } = useTransactions();
  const [active, setActive] = useState<ReportTab>('whatsapp');
  const [dateRange, setDateRange] = useState<DateRange>(initialDateRange());
  const [participant, setParticipant] = useState<string>('all');
  const [group, setGroup] = useState<string>('all');

  const filtered = useMemo(() => filterTransactions(transactions, dateRange), [transactions, dateRange]);

  const handleExportCSV = () => {
    downloadCSV(
      filtered.map((t) => ({ id: t.id, date: t.date, type: t.type, category: t.category, description: t.description, amount: t.amount })),
      `transactions-${dateRange.from}_to_${dateRange.to}.csv`
    );
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1D1D1F]">Reports</h1>
        <p className="text-[#86868B] mt-1">Generate and export reports</p>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1D1D1F] mb-1">From</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg focus:ring-2 focus:ring-[#0A84FF] focus:border-[#0A84FF]"
              value={dateRange.from}
              onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1D1D1F] mb-1">To</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg focus:ring-2 focus:ring-[#0A84FF] focus:border-[#0A84FF]"
              value={dateRange.to}
              onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1D1D1F] mb-1">Participants</label>
            <select
              className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg focus:ring-2 focus:ring-[#0A84FF] focus:border-[#0A84FF]"
              value={participant}
              onChange={(e) => setParticipant(e.target.value)}
            >
              <option value="all">All</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1D1D1F] mb-1">Groups</label>
            <select
              className="w-full px-3 py-2 border border-[#E5E5EA] rounded-lg focus:ring-2 focus:ring-[#0A84FF] focus:border-[#0A84FF]"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            >
              <option value="all">All</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-4 gap-3 print:hidden">
          <Button variant="outline" onClick={handleExportCSV}>Export to Excel (CSV)</Button>
          <Button variant="primary" onClick={handleExportPDF}>Export to PDF</Button>
        </div>
      </Card>

      <div className="mt-6">
        <div className="bg-[#F5F5F7] p-1 rounded-lg inline-flex">
          {[
            { key: 'whatsapp', label: 'WhatsApp-style' },
            { key: 'professional', label: 'Professional' },
            { key: 'statement', label: 'Statement' },
            { key: 'graphical', label: 'Graphical' },
            { key: 'dashboard', label: 'Dashboard' },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                active === (t.key as ReportTab)
                  ? 'bg-white text-[#1D1D1F] shadow-sm'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
              onClick={() => setActive(t.key as ReportTab)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {active === 'whatsapp' && (
            <Card title="WhatsApp-style summary" className="print:bg-white">
              <div className="space-y-3">
                {filtered.length === 0 ? (
                  <p className="text-[#86868B]">No data for the selected range.</p>
                ) : (
                  filtered.map((t) => (
                    <div key={t.id} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-[#30D158]/10' : 'bg-[#FF453A]/10'}`}></div>
                      <div>
                        <p className="text-sm text-[#1D1D1F]"><strong>{t.type === 'income' ? 'Income' : 'Expense'}</strong> • {t.category} • {t.date}</p>
                        <p className="text-sm text-[#86868B]">{t.description} — ${t.amount.toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}

          {active === 'professional' && (
            <Card title="Professional report" className="print:bg-white">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#F5F5F7]">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#1D1D1F] border-b border-[#E5E5EA]">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#1D1D1F] border-b border-[#E5E5EA]">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#1D1D1F] border-b border-[#E5E5EA]">Category</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#1D1D1F] border-b border-[#E5E5EA]">Description</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-[#1D1D1F] border-b border-[#E5E5EA]">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t) => (
                      <tr key={t.id} className="border-b border-[#E5E5EA]">
                        <td className="py-3 px-4 text-sm">{t.date}</td>
                        <td className="py-3 px-4 text-sm">{t.type}</td>
                        <td className="py-3 px-4 text-sm">{t.category}</td>
                        <td className="py-3 px-4 text-sm">{t.description}</td>
                        <td className="py-3 px-4 text-sm text-right">{t.type === 'income' ? '+' : '-'} ${t.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {active === 'statement' && (
            <Card title="Account statement" className="print:bg-white">
              <div className="space-y-2">
                {filtered.length === 0 ? (
                  <p className="text-[#86868B]">No data for the selected range.</p>
                ) : (
                  filtered.map((t) => (
                    <div key={t.id} className="flex justify-between border-b border-[#F5F5F7] py-2">
                      <div className="text-sm text-[#1D1D1F]">{t.date} • {t.category} • {t.description}</div>
                      <div className={`text-sm font-medium ${t.type === 'income' ? 'text-[#30D158]' : 'text-[#FF453A]'}`}>
                        {t.type === 'income' ? '+' : '-'} ${t.amount.toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}

          {active === 'graphical' && (
            <Card title="Graphical report" className="print:bg-white">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="h-64 bg-white rounded-lg border border-[#F5F5F7] p-4">
                    <h3 className="text-sm font-medium text-[#86868B] mb-2">Monthly trend</h3>
                    <LineChart
                      data={filtered.slice(0, 10).map((t) => ({ label: t.date.slice(5), value: t.type === 'income' ? t.amount : -t.amount }))}
                      height={220}
                    />
                  </div>
                </div>
                <div>
                  <div className="h-64 bg-white rounded-lg border border-[#F5F5F7] p-4">
                    <h3 className="text-sm font-medium text-[#86868B] mb-2">By category</h3>
                    <PieChart
                      data={Object.values(
                        filtered.reduce((acc: any, t) => {
                          acc[t.category] = acc[t.category] || { label: t.category, value: 0 };
                          acc[t.category].value += t.amount * (t.type === 'income' ? 1 : 1);
                          return acc;
                        }, {})
                      )}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {active === 'dashboard' && (
            <Card title="Analytical dashboard" className="print:bg-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-lg p-4 border border-[#F5F5F7]">
                  <h3 className="text-sm font-medium text-[#86868B] mb-2">Totals</h3>
                  <div className="text-sm">
                    <div className="flex justify-between py-1"><span>Income</span><span className="text-[#30D158]">${filtered.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0).toFixed(2)}</span></div>
                    <div className="flex justify-between py-1"><span>Expenses</span><span className="text-[#FF453A]">${filtered.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0).toFixed(2)}</span></div>
                  </div>
                </div>
                <div className="rounded-lg p-4 border border-[#F5F5F7]">
                  <h3 className="text-sm font-medium text-[#86868B] mb-2">Trend</h3>
                  <BarChart
                    data={filtered.slice(0, 8).map((t) => ({ label: t.date.slice(5), value: t.amount }))}
                    height={180}
                  />
                </div>
                <div className="rounded-lg p-4 border border-[#F5F5F7]">
                  <h3 className="text-sm font-medium text-[#86868B] mb-2">Categories</h3>
                  <PieChart
                    data={Object.values(
                      filtered.reduce((acc: any, t) => {
                        acc[t.category] = acc[t.category] || { label: t.category, value: 0 };
                        acc[t.category].value += t.amount;
                        return acc;
                      }, {})
                    )}
                  />
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Reports;


