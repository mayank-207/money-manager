const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5433,
  database: 'expense_tracker',
  user: 'postgres',
  password: '123456'
});

async function testDatabase() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Test 1: Create a test user
    console.log('📝 Test 1: Creating test user...');
    const userResult = await client.query(`
      INSERT INTO users (name, email, password_hash) 
      VALUES ('Test User', 'test@example.com', '$2b$10$abcdef123456') 
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, name, email
    `);
    const userId = userResult.rows[0].id;
    console.log('✅ User created:', userResult.rows[0]);
    
    // Test 2: Create a test participant
    console.log('\n📝 Test 2: Creating test participant...');
    const participantResult = await client.query(`
      INSERT INTO participants (name, email) 
      VALUES ('Test User', 'test@example.com') 
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, name, email
    `);
    const participantId = participantResult.rows[0].id;
    console.log('✅ Participant created:', participantResult.rows[0]);
    
    // Test 3: Create a test expense
    console.log('\n📝 Test 3: Creating test expense...');
    const expenseResult = await client.query(`
      INSERT INTO expenses (paid_by, amount, category, description, expense_date, type)
      VALUES ($1, 100.50, 'Food', 'Test expense', CURRENT_DATE, 'expense')
      RETURNING id, amount, category, description
    `, [participantId]);
    const expenseId = expenseResult.rows[0].id;
    console.log('✅ Expense created:', expenseResult.rows[0]);
    
    // Test 4: Create expense split
    console.log('\n📝 Test 4: Creating expense split...');
    const splitResult = await client.query(`
      INSERT INTO expense_splits (expense_id, participant_id, amount, settled)
      VALUES ($1, $2, 100.50, false)
      RETURNING id, expense_id, participant_id, amount, settled
    `, [expenseId, participantId]);
    console.log('✅ Expense split created:', splitResult.rows[0]);
    
    // Test 5: Query expenses with joins (simulating the GraphQL query)
    console.log('\n📝 Test 5: Testing the GraphQL-style query...');
    const queryResult = await client.query(`
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
      GROUP BY e.id
      ORDER BY e.expense_date DESC
    `);
    console.log('✅ Query successful! Results:');
    console.log(JSON.stringify(queryResult.rows, null, 2));
    
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await client.query('DELETE FROM expense_splits WHERE expense_id = $1', [expenseId]);
    await client.query('DELETE FROM expenses WHERE id = $1', [expenseId]);
    await client.query('DELETE FROM participants WHERE id = $1', [participantId]);
    await client.query('DELETE FROM users WHERE id = $1', [userId]);
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 All tests passed! Database is working correctly!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
  }
}

testDatabase();
