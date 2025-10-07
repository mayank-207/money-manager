import React from 'react';
import { Plus, ArrowUpDown, PieChart, Download } from 'lucide-react';
import Card from '../ui/Card';
import { Link } from 'react-router-dom';

const QuickActions: React.FC = () => {
  const actions = [
    {
      title: 'Add transaction',
      icon: <Plus size={20} />,
      color: '#0A84FF',
      link: '/transactions/new',
    },
    {
      title: 'View transactions',
      icon: <ArrowUpDown size={20} />,
      color: '#30D158',
      link: '/transactions',
    },
    {
      title: 'View analytics',
      icon: <PieChart size={20} />,
      color: '#5E5CE6',
      link: '/analytics',
    },
    {
      title: 'Export data',
      icon: <Download size={20} />,
      color: '#FF9F0A',
      link: '#',
      onClick: () => alert('Export feature is coming soon.'),
    },
  ];

  return (
    <Card title="Quick Actions">
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.title}
            to={action.link}
            className="block"
            onClick={action.onClick}
          >
            <div
              className="flex flex-col items-center justify-center p-4 rounded-lg border border-[#F5F5F7] hover:bg-[#F5F5F7] transition-colors"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                style={{ backgroundColor: `${action.color}10` }}
              >
                <span style={{ color: action.color }}>{action.icon}</span>
              </div>
              <span className="text-sm font-medium text-[#1D1D1F]">{action.title}</span>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
};

export default QuickActions;