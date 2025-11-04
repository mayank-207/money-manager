import { IResolvers } from '@graphql-tools/utils';
import bcrypt from 'bcrypt';
import { sign, verify, SignOptions } from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import Database from '../config/database';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const SALT_ROUNDS = 10;

// Helper function to get user from context
const getUser = (context: any) => {
  const authHeader = context.req?.headers?.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  try {
    const decoded = verify(token, JWT_SECRET) as any;
    return decoded;
  } catch (error) {
    return null;
  }
};

// Helper function to require authentication
const requireAuth = (context: any) => {
  const user = getUser(context);
  if (!user) {
    throw new GraphQLError('Authentication required', {
      extensions: { code: 'UNAUTHENTICATED' }
    });
  }
  return user;
};

const db = Database.getInstance();

export const resolvers: IResolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      const user = getUser(context);
      if (!user) return null;
      
      const result = await db.query(
        'SELECT id, name, email, created_at FROM users WHERE id = $1',
        [user.userId]
      );
      
      if (result.rows.length === 0) return null;
      
      const userData = result.rows[0];
      return {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        createdAt: userData.created_at
      };
    },

    participants: async (_: any, __: any, context: any) => {
      requireAuth(context);
      const result = await db.query('SELECT * FROM participants ORDER BY created_at DESC');
      return result.rows;
    },

    participant: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      const result = await db.query('SELECT * FROM participants WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        throw new GraphQLError('Participant not found');
      }
      return result.rows[0];
    },
    
    groups: async (_: any, __: any, context: any) => {
      requireAuth(context);
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

    group: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
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
      `, [id]);
      
      if (result.rows.length === 0) {
        throw new GraphQLError('Group not found');
      }
      return result.rows[0];
    },
    
    expenses: async (_: any, args: any, context: any) => {
      requireAuth(context);
      const { groupId, participantId, from, to } = args;
      let query = `
        SELECT e.*, 
               COALESCE(
                 json_agg(
                   json_build_object(
                     'participant', json_build_object('id', p.id, 'name', p.name, 'email', p.email),
                     'amount', es.amount,
                     'settled', es.settled
                   )
                 ) FILTER (WHERE es.id IS NOT NULL),
                 '[]'
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

    expense: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      const result = await db.query(`
        SELECT e.*, 
               COALESCE(
                 json_agg(
                   json_build_object(
                     'participant', json_build_object('id', p.id, 'name', p.name, 'email', p.email),
                     'amount', es.amount,
                     'settled', es.settled
                   )
                 ) FILTER (WHERE es.id IS NOT NULL),
                 '[]'
               ) as splits
        FROM expenses e
        LEFT JOIN expense_splits es ON e.id = es.expense_id
        LEFT JOIN participants p ON es.participant_id = p.id
        WHERE e.id = $1
        GROUP BY e.id
      `, [id]);
      
      if (result.rows.length === 0) {
        throw new GraphQLError('Expense not found');
      }
      
      const expense = result.rows[0];
      return {
        ...expense,
        groupId: expense.group_id,
        paidBy: expense.paid_by,
        expenseDate: expense.expense_date
      };
    },

    analytics: async (_: any, args: any, context: any) => {
      requireAuth(context);
      const { groupId, participantId, from, to } = args;

      // Build base conditions
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

      const whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';

      // Category breakdown
      const categoryResult = await db.query(`
        SELECT 
          category,
          SUM(amount) as amount,
          COUNT(*) as count
        FROM expenses
        ${whereClause} AND type = 'expense'
        GROUP BY category
        ORDER BY amount DESC
      `, params);

      const totalExpense = categoryResult.rows.reduce((sum, row) => sum + parseFloat(row.amount), 0);
      const categoryBreakdown = categoryResult.rows.map(row => ({
        category: row.category,
        amount: parseFloat(row.amount),
        percentage: totalExpense > 0 ? (parseFloat(row.amount) / totalExpense) * 100 : 0
      }));

      // Monthly trends
      const monthlyResult = await db.query(`
        SELECT 
          DATE_TRUNC('month', expense_date) as month,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
        FROM expenses
        ${whereClause}
        GROUP BY DATE_TRUNC('month', expense_date)
        ORDER BY month ASC
      `, params);

      const monthlyTrends = monthlyResult.rows.map(row => ({
        month: row.month.toISOString().substr(0, 7), // YYYY-MM format
        income: parseFloat(row.income),
        expense: parseFloat(row.expense),
        balance: parseFloat(row.income) - parseFloat(row.expense)
      }));

      return {
        categoryBreakdown,
        monthlyTrends,
        topExpenseCategories: categoryBreakdown.slice(0, 5)
      };
    },
  },
  Mutation: {
    register: async (_: any, { name, email, password }: any) => {
      // Validate required fields
      if (!name || !email || !password) {
        throw new GraphQLError('Name, email, and password are required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new GraphQLError('Please provide a valid email address');
      }

      // Validate password strength
      if (password.length < 6) {
        throw new GraphQLError('Password must be at least 6 characters long');
      }

      // Check if user already exists
      const existingUser = await db.query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (existingUser.rows.length > 0) {
        throw new GraphQLError('User with this email already exists');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      // Create user
      const result = await db.query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
        [name, email.toLowerCase(), passwordHash]
      );

      const user = result.rows[0];

      // Create a participant for this user (for expense tracking)
      await db.query(
        'INSERT INTO participants (name, email) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING',
        [name, email.toLowerCase()]
      );

      // Generate JWT token
      const token = sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRE } as SignOptions
      ) as string;

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.created_at
        },
        token,
        message: 'User registered successfully'
      };
    },

    login: async (_: any, { email, password }: any) => {
      // Validate required fields
      if (!email || !password) {
        throw new GraphQLError('Email and password are required');
      }

      // Find user by email
      const result = await db.query(
        'SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (result.rows.length === 0) {
        throw new GraphQLError('Invalid email or password');
      }

      const user = result.rows[0];

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isPasswordValid) {
        throw new GraphQLError('Invalid email or password');
      }

      // Generate JWT token
      const token = sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRE } as SignOptions
      ) as string;

      // Update last login
      await db.query(
        'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.created_at
        },
        token,
        message: 'Login successful'
      };
    },

    createParticipant: async (_: any, { name, email, mobile }: any, context: any) => {
      requireAuth(context);
      const result = await db.query(
        'INSERT INTO participants (name, email, mobile) VALUES ($1, $2, $3) RETURNING *',
        [name, email, mobile]
      );
      return result.rows[0];
    },

    updateParticipant: async (_: any, { id, name, email, mobile }: any, context: any) => {
      requireAuth(context);
      
      // Build dynamic update query
      const updateFields = [];
      const params = [];
      let paramIndex = 1;

      if (name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`);
        params.push(name);
      }
      if (email !== undefined) {
        updateFields.push(`email = $${paramIndex++}`);
        params.push(email);
      }
      if (mobile !== undefined) {
        updateFields.push(`mobile = $${paramIndex++}`);
        params.push(mobile);
      }

      if (updateFields.length === 0) {
        throw new GraphQLError('At least one field must be provided for update');
      }

      params.push(id);
      const result = await db.query(
        `UPDATE participants SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
        params
      );

      if (result.rows.length === 0) {
        throw new GraphQLError('Participant not found');
      }

      return result.rows[0];
    },

    deleteParticipant: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      const result = await db.query('DELETE FROM participants WHERE id = $1 RETURNING id', [id]);
      return result.rows.length > 0;
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
    
    updateExpense: async (_: any, { id, input }: any, context: any) => {
      requireAuth(context);
      const client = await db.getClient();
      
      try {
        await client.query('BEGIN');
        
        // Update expense
        const expenseResult = await client.query(
          'UPDATE expenses SET group_id = $1, paid_by = $2, amount = $3, category = $4, description = $5, expense_date = $6, type = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 RETURNING *',
          [input.groupId, input.paidBy, input.amount, input.category, input.description, input.expenseDate, input.type, id]
        );
        
        if (expenseResult.rows.length === 0) {
          throw new GraphQLError('Expense not found');
        }
        
        const expense = expenseResult.rows[0];
        
        // Delete old splits
        await client.query('DELETE FROM expense_splits WHERE expense_id = $1', [id]);
        
        // Insert new splits
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
                 COALESCE(
                   json_agg(
                     json_build_object(
                       'participant', json_build_object('id', p.id, 'name', p.name, 'email', p.email),
                       'amount', es.amount,
                       'settled', es.settled
                     )
                   ) FILTER (WHERE es.id IS NOT NULL),
                   '[]'
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

    deleteExpense: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      const client = await db.getClient();
      
      try {
        await client.query('BEGIN');
        
        // Delete expense splits first (foreign key constraint)
        await client.query('DELETE FROM expense_splits WHERE expense_id = $1', [id]);
        
        // Delete expense
        const result = await client.query('DELETE FROM expenses WHERE id = $1 RETURNING id', [id]);
        
        await client.query('COMMIT');
        
        return result.rows.length > 0;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
    
    updateGroup: async (_: any, { id, name, description }: any, context: any) => {
      requireAuth(context);
      
      // Build dynamic update query
      const updateFields = [];
      const params = [];
      let paramIndex = 1;

      if (name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`);
        params.push(name);
      }
      if (description !== undefined) {
        updateFields.push(`description = $${paramIndex++}`);
        params.push(description);
      }

      if (updateFields.length === 0) {
        throw new GraphQLError('At least one field must be provided for update');
      }

      params.push(id);
      const result = await db.query(
        `UPDATE groups SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
        params
      );

      if (result.rows.length === 0) {
        throw new GraphQLError('Group not found');
      }

      // Get group with members
      const groupResult = await db.query(`
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
      `, [id]);

      return groupResult.rows[0];
    },

    deleteGroup: async (_: any, { id }: any, context: any) => {
      requireAuth(context);
      const client = await db.getClient();
      
      try {
        await client.query('BEGIN');
        
        // Delete group members first (foreign key constraint)
        await client.query('DELETE FROM group_members WHERE group_id = $1', [id]);
        
        // Delete group
        const result = await client.query('DELETE FROM groups WHERE id = $1 RETURNING id', [id]);
        
        await client.query('COMMIT');
        
        return result.rows.length > 0;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },

    removeParticipantFromGroup: async (_: any, { groupId, participantId }: any, context: any) => {
      requireAuth(context);
      
      // Remove participant from group
      await db.query(
        'DELETE FROM group_members WHERE group_id = $1 AND participant_id = $2',
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
      
      if (result.rows.length === 0) {
        throw new GraphQLError('Group not found');
      }
      
      return result.rows[0];
    },

    settleSplit: async (_: any, { expenseId, participantId }: any, context: any) => {
      requireAuth(context);
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
        throw new GraphQLError('Expense not found');
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


