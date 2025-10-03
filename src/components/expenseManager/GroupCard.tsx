import React from 'react';
import { Users, Trash2, UserPlus } from 'lucide-react';
import { ExpenseGroup } from '../../types';
import Card from '../ui/Card';

interface GroupCardProps {
  group: ExpenseGroup;
  memberCount: number;
  expenseCount: number;
  onDelete: (id: string) => void;
  onAddMembers: (groupId: string) => void;
  onViewDetails: (groupId: string) => void;
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  memberCount,
  expenseCount,
  onDelete,
  onAddMembers,
  onViewDetails,
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1" onClick={() => onViewDetails(group.id)}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="text-green-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">{group.name}</h3>
          </div>
          {group.description && (
            <p className="text-sm text-gray-600 ml-12 mb-2">{group.description}</p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(group.id);
          }}
          className="text-gray-400 hover:text-red-500 transition-colors"
          title="Delete group"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex gap-4 text-sm text-gray-600">
          <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
          <span>{expenseCount} expense{expenseCount !== 1 ? 's' : ''}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddMembers(group.id);
          }}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
        >
          <UserPlus size={16} />
          Add Members
        </button>
      </div>
    </Card>
  );
};

export default GroupCard;
