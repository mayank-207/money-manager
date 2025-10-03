import React, { useState } from 'react';
import { Users, UserPlus, PlusCircle, History, ArrowLeft } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ParticipantForm from '../components/expenseManager/ParticipantForm';
import ParticipantList from '../components/expenseManager/ParticipantList';
import GroupForm from '../components/expenseManager/GroupForm';
import GroupCard from '../components/expenseManager/GroupCard';
import AddMembersModal from '../components/expenseManager/AddMembersModal';
import ExpenseForm from '../components/expenseManager/ExpenseForm';
import ExpenseHistory from '../components/expenseManager/ExpenseHistory';
import { useExpenseManager } from '../context/ExpenseManagerContext';

type Tab = 'participants' | 'groups' | 'group-detail';

const ExpenseManager: React.FC = () => {
  const {
    participants,
    groups,
    addParticipant,
    deleteParticipant,
    addGroup,
    deleteGroup,
    addGroupMember,
    getGroupMembers,
    addExpense,
    getGroupExpenses,
  } = useExpenseManager();

  const [activeTab, setActiveTab] = useState<Tab>('participants');
  const [showParticipantForm, setShowParticipantForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const handleAddParticipant = (participant: any) => {
    addParticipant(participant);
    setShowParticipantForm(false);
  };

  const handleAddGroup = (group: any) => {
    addGroup(group);
    setShowGroupForm(false);
  };

  const handleViewGroupDetails = (groupId: string) => {
    setSelectedGroupId(groupId);
    setActiveTab('group-detail');
  };

  const handleAddMembers = (groupId: string) => {
    setSelectedGroupId(groupId);
    setShowAddMembersModal(true);
  };

  const handleAddMember = (participantId: string, role: any, permissions: any) => {
    if (selectedGroupId) {
      addGroupMember(selectedGroupId, participantId, role, permissions);
    }
  };

  const handleAddExpense = (expense: any, splits: any[]) => {
    if (selectedGroupId) {
      addExpense({ ...expense, group_id: selectedGroupId }, splits);
      setShowExpenseForm(false);
    }
  };

  const handleBackToGroups = () => {
    setActiveTab('groups');
    setSelectedGroupId(null);
    setShowExpenseForm(false);
  };

  const selectedGroup = selectedGroupId ? groups.find(g => g.id === selectedGroupId) : null;
  const groupMembers = selectedGroupId ? getGroupMembers(selectedGroupId) : [];
  const groupExpenses = selectedGroupId ? getGroupExpenses(selectedGroupId) : [];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Expense Manager</h1>
          <p className="text-gray-600">Manage shared expenses with groups and participants</p>
        </div>

        {activeTab !== 'group-detail' && (
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('participants')}
              className={`px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'participants'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <UserPlus size={18} />
                Participants
              </div>
              {activeTab === 'participants' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'groups'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users size={18} />
                Groups
              </div>
              {activeTab === 'groups' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          </div>
        )}

        {activeTab === 'participants' && (
          <div className="space-y-6">
            {!showParticipantForm ? (
              <div className="flex justify-end">
                <Button onClick={() => setShowParticipantForm(true)}>
                  <UserPlus size={18} />
                  Add Participant
                </Button>
              </div>
            ) : (
              <Card>
                <h2 className="text-xl font-bold mb-4">Add New Participant</h2>
                <ParticipantForm
                  onSubmit={handleAddParticipant}
                  onCancel={() => setShowParticipantForm(false)}
                />
              </Card>
            )}
            <ParticipantList
              participants={participants}
              onDelete={deleteParticipant}
            />
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="space-y-6">
            {!showGroupForm ? (
              <div className="flex justify-end">
                <Button onClick={() => setShowGroupForm(true)}>
                  <PlusCircle size={18} />
                  Create Group
                </Button>
              </div>
            ) : (
              <Card>
                <h2 className="text-xl font-bold mb-4">Create New Group</h2>
                <GroupForm
                  onSubmit={handleAddGroup}
                  onCancel={() => setShowGroupForm(false)}
                />
              </Card>
            )}
            {groups.length === 0 ? (
              <Card className="text-center py-12">
                <Users className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-500">No groups yet. Create your first group to start managing shared expenses.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    memberCount={getGroupMembers(group.id).length}
                    expenseCount={getGroupExpenses(group.id).length}
                    onDelete={deleteGroup}
                    onAddMembers={handleAddMembers}
                    onViewDetails={handleViewGroupDetails}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'group-detail' && selectedGroup && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToGroups}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedGroup.name}</h2>
                  {selectedGroup.description && (
                    <p className="text-gray-600 mt-1">{selectedGroup.description}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowAddMembersModal(true)}
                >
                  <UserPlus size={18} />
                  Add Members
                </Button>
                {groupMembers.length > 0 && (
                  <Button onClick={() => setShowExpenseForm(!showExpenseForm)}>
                    <PlusCircle size={18} />
                    {showExpenseForm ? 'Cancel' : 'Add Expense'}
                  </Button>
                )}
              </div>
            </div>

            {groupMembers.length === 0 ? (
              <Card className="text-center py-12">
                <Users className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-500 mb-4">This group has no members yet.</p>
                <Button onClick={() => setShowAddMembersModal(true)}>
                  <UserPlus size={18} />
                  Add Members
                </Button>
              </Card>
            ) : (
              <>
                <Card>
                  <h3 className="text-lg font-semibold mb-4">Group Members</h3>
                  <div className="space-y-2">
                    {groupMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserPlus className="text-blue-600" size={16} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {member.participant?.name || 'Unknown'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {member.participant?.email}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            member.role === 'admin'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-200 text-gray-700'
                          }`}>
                            {member.role}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {showExpenseForm && (
                  <Card>
                    <h3 className="text-lg font-semibold mb-4">Add New Expense</h3>
                    <ExpenseForm
                      groupMembers={groupMembers.map(gm => gm.participant!).filter(Boolean)}
                      onSubmit={handleAddExpense}
                      onCancel={() => setShowExpenseForm(false)}
                    />
                  </Card>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <History size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold">Expense History</h3>
                  </div>
                  <ExpenseHistory expenses={groupExpenses} />
                </div>
              </>
            )}
          </div>
        )}

        <AddMembersModal
          isOpen={showAddMembersModal}
          onClose={() => setShowAddMembersModal(false)}
          participants={participants}
          existingMemberIds={groupMembers.map(gm => gm.participant_id)}
          onAddMember={handleAddMember}
        />
      </div>
    </Layout>
  );
};

export default ExpenseManager;
