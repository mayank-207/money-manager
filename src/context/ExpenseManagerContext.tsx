import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Participant,
  ExpenseGroup,
  GroupMember,
  SharedExpense,
  ExpenseSplit,
  GroupRole,
  SharedExpenseType,
} from '../types';

interface ExpenseManagerContextType {
  participants: Participant[];
  groups: ExpenseGroup[];
  groupMembers: GroupMember[];
  expenses: SharedExpense[];
  expenseSplits: ExpenseSplit[];
  addParticipant: (participant: Omit<Participant, 'id' | 'created_at' | 'updated_at'>) => void;
  updateParticipant: (id: string, participant: Partial<Participant>) => void;
  deleteParticipant: (id: string) => void;
  addGroup: (group: Omit<ExpenseGroup, 'id' | 'created_at' | 'updated_at'>) => void;
  updateGroup: (id: string, group: Partial<ExpenseGroup>) => void;
  deleteGroup: (id: string) => void;
  addGroupMember: (groupId: string, participantId: string, role: GroupRole, permissions: {
    can_add_expense: boolean;
    can_edit_expense: boolean;
    can_delete_expense: boolean;
  }) => void;
  updateGroupMember: (id: string, updates: Partial<GroupMember>) => void;
  removeGroupMember: (id: string) => void;
  addExpense: (expense: Omit<SharedExpense, 'id' | 'created_at' | 'updated_at'>, splits: Omit<ExpenseSplit, 'id' | 'expense_id'>[]) => void;
  updateExpense: (id: string, expense: Partial<SharedExpense>) => void;
  deleteExpense: (id: string) => void;
  updateSplit: (id: string, updates: Partial<ExpenseSplit>) => void;
  getGroupMembers: (groupId: string) => GroupMember[];
  getGroupExpenses: (groupId: string) => SharedExpense[];
  getParticipantById: (id: string) => Participant | undefined;
}

const ExpenseManagerContext = createContext<ExpenseManagerContextType | undefined>(undefined);

export const useExpenseManager = () => {
  const context = useContext(ExpenseManagerContext);
  if (!context) {
    throw new Error('useExpenseManager must be used within ExpenseManagerProvider');
  }
  return context;
};

interface ExpenseManagerProviderProps {
  children: ReactNode;
}

export const ExpenseManagerProvider: React.FC<ExpenseManagerProviderProps> = ({ children }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [groups, setGroups] = useState<ExpenseGroup[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [expenses, setExpenses] = useState<SharedExpense[]>([]);
  const [expenseSplits, setExpenseSplits] = useState<ExpenseSplit[]>([]);

  useEffect(() => {
    const savedParticipants = localStorage.getItem('expenseManager_participants');
    const savedGroups = localStorage.getItem('expenseManager_groups');
    const savedGroupMembers = localStorage.getItem('expenseManager_groupMembers');
    const savedExpenses = localStorage.getItem('expenseManager_expenses');
    const savedSplits = localStorage.getItem('expenseManager_splits');

    if (savedParticipants) setParticipants(JSON.parse(savedParticipants));
    if (savedGroups) setGroups(JSON.parse(savedGroups));
    if (savedGroupMembers) setGroupMembers(JSON.parse(savedGroupMembers));
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    if (savedSplits) setExpenseSplits(JSON.parse(savedSplits));
  }, []);

  useEffect(() => {
    localStorage.setItem('expenseManager_participants', JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem('expenseManager_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('expenseManager_groupMembers', JSON.stringify(groupMembers));
  }, [groupMembers]);

  useEffect(() => {
    localStorage.setItem('expenseManager_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('expenseManager_splits', JSON.stringify(expenseSplits));
  }, [expenseSplits]);

  const addParticipant = (participant: Omit<Participant, 'id' | 'created_at' | 'updated_at'>) => {
    const newParticipant: Participant = {
      ...participant,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setParticipants([...participants, newParticipant]);
  };

  const updateParticipant = (id: string, updates: Partial<Participant>) => {
    setParticipants(participants.map(p =>
      p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
    ));
  };

  const deleteParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
    setGroupMembers(groupMembers.filter(gm => gm.participant_id !== id));
  };

  const addGroup = (group: Omit<ExpenseGroup, 'id' | 'created_at' | 'updated_at'>) => {
    const newGroup: ExpenseGroup = {
      ...group,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setGroups([...groups, newGroup]);
  };

  const updateGroup = (id: string, updates: Partial<ExpenseGroup>) => {
    setGroups(groups.map(g =>
      g.id === id ? { ...g, ...updates, updated_at: new Date().toISOString() } : g
    ));
  };

  const deleteGroup = (id: string) => {
    setGroups(groups.filter(g => g.id !== id));
    setGroupMembers(groupMembers.filter(gm => gm.group_id !== id));
    const groupExpenseIds = expenses.filter(e => e.group_id === id).map(e => e.id);
    setExpenses(expenses.filter(e => e.group_id !== id));
    setExpenseSplits(expenseSplits.filter(s => !groupExpenseIds.includes(s.expense_id)));
  };

  const addGroupMember = (
    groupId: string,
    participantId: string,
    role: GroupRole,
    permissions: {
      can_add_expense: boolean;
      can_edit_expense: boolean;
      can_delete_expense: boolean;
    }
  ) => {
    const newMember: GroupMember = {
      id: crypto.randomUUID(),
      group_id: groupId,
      participant_id: participantId,
      role,
      ...permissions,
      joined_at: new Date().toISOString(),
    };
    setGroupMembers([...groupMembers, newMember]);
  };

  const updateGroupMember = (id: string, updates: Partial<GroupMember>) => {
    setGroupMembers(groupMembers.map(gm =>
      gm.id === id ? { ...gm, ...updates } : gm
    ));
  };

  const removeGroupMember = (id: string) => {
    setGroupMembers(groupMembers.filter(gm => gm.id !== id));
  };

  const addExpense = (
    expense: Omit<SharedExpense, 'id' | 'created_at' | 'updated_at'>,
    splits: Omit<ExpenseSplit, 'id' | 'expense_id'>[]
  ) => {
    const newExpense: SharedExpense = {
      ...expense,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setExpenses([...expenses, newExpense]);

    const newSplits = splits.map(split => ({
      ...split,
      id: crypto.randomUUID(),
      expense_id: newExpense.id,
    }));
    setExpenseSplits([...expenseSplits, ...newSplits]);
  };

  const updateExpense = (id: string, updates: Partial<SharedExpense>) => {
    setExpenses(expenses.map(e =>
      e.id === id ? { ...e, ...updates, updated_at: new Date().toISOString() } : e
    ));
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
    setExpenseSplits(expenseSplits.filter(s => s.expense_id !== id));
  };

  const updateSplit = (id: string, updates: Partial<ExpenseSplit>) => {
    setExpenseSplits(expenseSplits.map(s =>
      s.id === id ? { ...s, ...updates } : s
    ));
  };

  const getGroupMembers = (groupId: string): GroupMember[] => {
    return groupMembers
      .filter(gm => gm.group_id === groupId)
      .map(gm => ({
        ...gm,
        participant: participants.find(p => p.id === gm.participant_id),
      }));
  };

  const getGroupExpenses = (groupId: string): SharedExpense[] => {
    return expenses
      .filter(e => e.group_id === groupId)
      .map(e => ({
        ...e,
        payer: participants.find(p => p.id === e.paid_by),
        splits: expenseSplits
          .filter(s => s.expense_id === e.id)
          .map(s => ({
            ...s,
            participant: participants.find(p => p.id === s.participant_id),
          })),
      }))
      .sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime());
  };

  const getParticipantById = (id: string): Participant | undefined => {
    return participants.find(p => p.id === id);
  };

  return (
    <ExpenseManagerContext.Provider
      value={{
        participants,
        groups,
        groupMembers,
        expenses,
        expenseSplits,
        addParticipant,
        updateParticipant,
        deleteParticipant,
        addGroup,
        updateGroup,
        deleteGroup,
        addGroupMember,
        updateGroupMember,
        removeGroupMember,
        addExpense,
        updateExpense,
        deleteExpense,
        updateSplit,
        getGroupMembers,
        getGroupExpenses,
        getParticipantById,
      }}
    >
      {children}
    </ExpenseManagerContext.Provider>
  );
};
