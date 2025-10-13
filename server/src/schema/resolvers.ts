import { IResolvers } from '@graphql-tools/utils';
import Database from '../config/database';

const db = Database.getInstance();

export const resolvers: IResolvers = {
  Query: {
    participants: async () => {
      const result = await db.query('SELECT * FROM participants ORDER BY created_at DESC');
      return result.rows;
    },
    
    groups: async () => {
      const result = await db.query(`
        SELECT g.*, 
               COALESCE(
                 json_agg(
                   json_build_object('id', p.id, 'name', p.name, 'email', p.email, 'mobile', p.mobile)
                 ) FILTER (WHERE p.id IS NOT NULL), 
                 '[]'
               ) as members
        FROM groups g
        LEFT JOIN group_members gm ON g.id = gm.group_id
        LEFT JOIN participants p ON gm.participant_id = p.id
        GROUP BY g.id
        ORDER BY g.created_at DESC
      `);
      return result.rows;
    },
    
    expenses: async (_: any, args: any) => {
      const { groupId, participantId, from, to } = args;
      let query = `
        SELECT e.*, 
               json_agg(
                 json_build_object(
                   'participant', json_build_object('id', p.id, 'name', p.name, 'email', p.email),
                   'amount', es.amount,
                   'settled', es.settled
                 )
               ) as splits
        FROM expenses e
        LEFT JOIN expense_splits es ON e.id = es.expense_id
        LEFT JOIN participants p ON es.participant_id = p.id
      `;
      
      const conditions = [];
      const params = [];
      let paramIndex = 1;

      if (groupId) {
        conditions.push(`e.group_id = $${paramIndex++}`);
        params.push(groupId);
      }
      if (participantId) {
        conditions.push(`e.paid_by = $${paramIndex++}`);
        params.push(participantId);
      }
      if (from) {
        conditions.push(`e.expense_date >= $${paramIndex++}`);
        params.push(from);
      }
      if (to) {
        conditions.push(`e.expense_date <= $${paramIndex++}`);
        params.push(to);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' GROUP BY e.id ORDER BY e.expense_date DESC';

      const result = await db.query(query, params);
      return result.rows.map(row => ({
        ...row,
        groupId: row.group_id,
        paidBy: row.paid_by,
        expenseDate: row.expense_date
      }));
    },
    
    reportSummary: async (_: any, args: any) => {
      const { groupId, participantId, from, to } = args;
      let query = `
        SELECT 
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
        FROM expenses
      `;
      
      const conditions = [];
      const params = [];
      let paramIndex = 1;

      if (groupId) {
        conditions.push(`group_id = $${paramIndex++}`);
        params.push(groupId);
      }
      if (participantId) {
        conditions.push(`paid_by = $${paramIndex++}`);
        params.push(participantId);
      }
      if (from) {
        conditions.push(`expense_date >= $${paramIndex++}`);
        params.push(from);
      }
      if (to) {
        conditions.push(`expense_date <= $${paramIndex++}`);
        params.push(to);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      const result = await db.query(query, params);
      const row = result.rows[0];
      
      return {
        totalIncome: parseFloat(row.total_income),
        totalExpense: parseFloat(row.total_expense),
        balance: parseFloat(row.total_income) - parseFloat(row.total_expense)
      };
    },
  },
  Mutation: {
    createParticipant: async (_: any, { name, email, mobile }: any) => {
      const result = await db.query(
        'INSERT INTO participants (name, email, mobile) VALUES ($1, $2, $3) RETURNING *',
        [name, email, mobile]
      );
      return result.rows[0];
    },
    
    createGroup: async (_: any, { name, description }: any) => {
      const result = await db.query(
        'INSERT INTO groups (name, description) VALUES ($1, $2) RETURNING *',
        [name, description]
      );
      return { ...result.rows[0], members: [] };
    },
    
    addParticipantToGroup: async (_: any, { groupId, participantId }: any) => {
      // Check if group exists
      const groupResult = await db.query('SELECT * FROM groups WHERE id = $1', [groupId]);
      if (groupResult.rows.length === 0) {
        throw new Error('Group not found');
      }
      
      // Add participant to group (ignore if already exists due to UNIQUE constraint)
      await db.query(
        'INSERT INTO group_members (group_id, participant_id) VALUES ($1, $2) ON CONFLICT (group_id, participant_id) DO NOTHING',
        [groupId, participantId]
      );
      
      // Return group with updated members
      const result = await db.query(`
        SELECT g.*, 
               COALESCE(
                 json_agg(
                   json_build_object('id', p.id, 'name', p.name, 'email', p.email, 'mobile', p.mobile)
                 ) FILTER (WHERE p.id IS NOT NULL), 
                 '[]'
               ) as members
        FROM groups g
        LEFT JOIN group_members gm ON g.id = gm.group_id
        LEFT JOIN participants p ON gm.participant_id = p.id
        WHERE g.id = $1
        GROUP BY g.id
      `, [groupId]);
      
      return result.rows[0];
    },
    
    createExpense: async (_: any, { input }: any) => {
      const client = await db.getClient();
      
      try {
        await client.query('BEGIN');
        
        // Insert expense
        const expenseResult = await client.query(
          'INSERT INTO expenses (group_id, paid_by, amount, category, description, expense_date, type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          [input.groupId, input.paidBy, input.amount, input.category, input.description, input.expenseDate, input.type]
        );
        
        const expense = expenseResult.rows[0];
        
        // Insert splits
        for (const split of input.splits) {
          await client.query(
            'INSERT INTO expense_splits (expense_id, participant_id, amount) VALUES ($1, $2, $3)',
            [expense.id, split.participantId, split.amount]
          );
        }
        
        await client.query('COMMIT');
        
        // Return expense with splits
        const result = await db.query(`
          SELECT e.*, 
                 json_agg(
                   json_build_object(
                     'participant', json_build_object('id', p.id, 'name', p.name, 'email', p.email),
                     'amount', es.amount,
                     'settled', es.settled
                   )
                 ) as splits
          FROM expenses e
          LEFT JOIN expense_splits es ON e.id = es.expense_id
          LEFT JOIN participants p ON es.participant_id = p.id
          WHERE e.id = $1
          GROUP BY e.id
        `, [expense.id]);
        
        const returnExpense = result.rows[0];
        return {
          ...returnExpense,
          groupId: returnExpense.group_id,
          paidBy: returnExpense.paid_by,
          expenseDate: returnExpense.expense_date
        };
        
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
    
    settleSplit: async (_: any, { expenseId, participantId }: any) => {
      await db.query(
        'UPDATE expense_splits SET settled = true, settled_at = CURRENT_TIMESTAMP WHERE expense_id = $1 AND participant_id = $2',
        [expenseId, participantId]
      );
      
      // Return updated expense
      const result = await db.query(`
        SELECT e.*, 
               json_agg(
                 json_build_object(
                   'participant', json_build_object('id', p.id, 'name', p.name, 'email', p.email),
                   'amount', es.amount,
                   'settled', es.settled
                 )
               ) as splits
        FROM expenses e
        LEFT JOIN expense_splits es ON e.id = es.expense_id
        LEFT JOIN participants p ON es.participant_id = p.id
        WHERE e.id = $1
        GROUP BY e.id
      `, [expenseId]);
      
      if (result.rows.length === 0) {
        throw new Error('Expense not found');
      }
      
      const expense = result.rows[0];
      return {
        ...expense,
        groupId: expense.group_id,
        paidBy: expense.paid_by,
        expenseDate: expense.expense_date
      };
    },
  },
};


