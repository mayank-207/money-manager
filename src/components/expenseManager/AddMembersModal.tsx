import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { Participant, GroupRole } from '../../types';
import Button from '../ui/Button';

interface AddMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  existingMemberIds: string[];
  onAddMember: (participantId: string, role: GroupRole, permissions: {
    can_add_expense: boolean;
    can_edit_expense: boolean;
    can_delete_expense: boolean;
  }) => void;
}

const AddMembersModal: React.FC<AddMembersModalProps> = ({
  isOpen,
  onClose,
  participants,
  existingMemberIds,
  onAddMember,
}) => {
  const [selectedParticipant, setSelectedParticipant] = useState('');
  const [role, setRole] = useState<GroupRole>('member');
  const [canAddExpense, setCanAddExpense] = useState(true);
  const [canEditExpense, setCanEditExpense] = useState(false);
  const [canDeleteExpense, setCanDeleteExpense] = useState(false);

  const availableParticipants = participants.filter(
    p => !existingMemberIds.includes(p.id)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParticipant) return;

    onAddMember(selectedParticipant, role, {
      can_add_expense: canAddExpense,
      can_edit_expense: canEditExpense,
      can_delete_expense: canDeleteExpense,
    });

    setSelectedParticipant('');
    setRole('member');
    setCanAddExpense(true);
    setCanEditExpense(false);
    setCanDeleteExpense(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Add Members</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {availableParticipants.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              All participants are already members of this group.
            </p>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Participant <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedParticipant}
                  onChange={(e) => setSelectedParticipant(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a participant...</option>
                  {availableParticipants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as GroupRole)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={canAddExpense}
                      onChange={(e) => setCanAddExpense(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Can add expenses</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={canEditExpense}
                      onChange={(e) => setCanEditExpense(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Can edit expenses</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={canDeleteExpense}
                      onChange={(e) => setCanDeleteExpense(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Can delete expenses</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1">
                  <UserPlus size={18} />
                  Add Member
                </Button>
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddMembersModal;
