export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header + CTA */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500">Overview of your finances at a glance</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-medium shadow-sm hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            + New Transaction
          </button>
          <button className="inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50">
            Export
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4">
        <StatCard label="This Month Income" value="$7,250" trend="▲ 12%" trendType="up" />
        <StatCard label="This Month Expense" value="$3,980" trend="▼ 5%" trendType="down" />
        <StatCard label="Savings" value="$2,140" trend="▲ 4%" trendType="up" />
        <StatCard label="Recurring Bills" value="$1,120" trend="•" trendType="flat" />
      </div>

      {/* Quick actions */}
      <section className="rounded-xl border bg-white p-3 sm:p-4">
        <h2 className="mb-3 text-base font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <ActionButton emoji="💸" label="Add Expense" />
          <ActionButton emoji="💰" label="Add Income" />
          <ActionButton emoji="👥" label="New Group" />
          <ActionButton emoji="📄" label="Generate Report" />
        </div>
      </section>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Spending Overview">
          <div className="h-56 grid place-items-center text-gray-500">Chart placeholder</div>
        </Card>
        <Card title="Income vs Expense">
          <div className="h-56 grid place-items-center text-gray-500">Chart placeholder</div>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card title="Recent Transactions">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-gray-500">
              <tr>
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Description</th>
                <th className="py-2 pr-3">Category</th>
                <th className="py-2 pr-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {sampleRows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="py-2 pr-3 whitespace-nowrap">{row.date}</td>
                  <td className="py-2 pr-3">{row.description}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{row.category}</td>
                  <td className={`py-2 pl-3 text-right font-medium ${row.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {row.type === 'income' ? '+' : '-'}${row.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile list */}
        <div className="md:hidden divide-y">
          {sampleRows.map((row) => (
            <div key={row.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{row.description}</p>
                <p className="text-xs text-gray-500">{row.category} • {row.date}</p>
              </div>
              <div className={`text-sm font-semibold ${row.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {row.type === 'income' ? '+' : '-'}${row.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

type TrendType = 'up' | 'down' | 'flat';

function StatCard({ label, value, trend, trendType }: { label: string; value: string; trend: string; trendType: TrendType }) {
  const trendColor = trendType === 'up' ? 'text-emerald-600' : trendType === 'down' ? 'text-rose-600' : 'text-gray-500';
  return (
    <div className="rounded-xl border bg-white p-3 sm:p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <div className="mt-1 flex items-end justify-between">
        <p className="text-lg sm:text-xl font-semibold">{value}</p>
        <span className={`text-[11px] ${trendColor}`}>{trend}</span>
      </div>
    </div>
  );
}

function ActionButton({ emoji, label }: { emoji: string; label: string }) {
  return (
    <button className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50 active:bg-gray-100">
      <span className="text-base" aria-hidden>{emoji}</span>
      <span>{label}</span>
    </button>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-white p-3 sm:p-4 shadow-sm">
      <h2 className="mb-2 text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}

const sampleRows = [
  { id: '1', date: '2025-10-01', description: 'Salary', category: 'Income', amount: 4250, type: 'income' as const },
  { id: '2', date: '2025-10-02', description: 'Groceries', category: 'Food & Dining', amount: 86, type: 'expense' as const },
  { id: '3', date: '2025-10-03', description: 'Gym Membership', category: 'Health & Fitness', amount: 29, type: 'expense' as const },
  { id: '4', date: '2025-10-04', description: 'Freelance', category: 'Income', amount: 600, type: 'income' as const },
];



