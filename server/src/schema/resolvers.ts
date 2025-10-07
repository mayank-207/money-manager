import { IResolvers } from '@graphql-tools/utils';

const db = {
  participants: [] as any[],
  groups: [] as any[],
  expenses: [] as any[],
};

export const resolvers: IResolvers = {
  Query: {
    participants: () => db.participants,
    groups: () => db.groups.map((g) => ({ ...g, members: db.participants.filter((p) => g.memberIds?.includes(p.id)) })),
    expenses: (_: any, args: any) => {
      const { groupId, participantId, from, to } = args;
      return db.expenses.filter((e) => {
        if (groupId && e.groupId !== groupId) return false;
        if (participantId && e.paidBy !== participantId) return false;
        const d = new Date(e.expenseDate);
        if (from && d < new Date(from)) return false;
        if (to && d > new Date(to)) return false;
        return true;
      });
    },
    reportSummary: (_: any, args: any) => {
      const list = (resolvers.Query as any).expenses(_, args);
      const totalIncome = list.filter((e: any) => e.type === 'income').reduce((s: number, e: any) => s + e.amount, 0);
      const totalExpense = list.filter((e: any) => e.type === 'expense').reduce((s: number, e: any) => s + e.amount, 0);
      return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
    },
  },
  Mutation: {
    createParticipant: (_: any, { name, email, mobile }: any) => {
      const p = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, name, email, mobile };
      db.participants.push(p);
      return p;
    },
    createGroup: (_: any, { name, description }: any) => {
      const g = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, name, description, memberIds: [] as string[] };
      db.groups.push(g);
      return g;
    },
    addParticipantToGroup: (_: any, { groupId, participantId }: any) => {
      const g = db.groups.find((x) => x.id === groupId);
      if (!g) throw new Error('Group not found');
      g.memberIds = g.memberIds || [];
      if (!g.memberIds.includes(participantId)) g.memberIds.push(participantId);
      return { ...g, members: db.participants.filter((p) => g.memberIds.includes(p.id)) };
    },
    createExpense: (_: any, { input }: any) => {
      const e = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, ...input, splits: input.splits.map((s: any) => ({ ...s, settled: false })) };
      db.expenses.push(e);
      return e;
    },
    settleSplit: (_: any, { expenseId, participantId }: any) => {
      const e = db.expenses.find((x) => x.id === expenseId);
      if (!e) throw new Error('Expense not found');
      e.splits = e.splits.map((s: any) => (s.participantId === participantId ? { ...s, settled: true } : s));
      return e;
    },
  },
};


