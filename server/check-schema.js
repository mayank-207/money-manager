const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5433,
  database: 'expense_tracker',
  user: 'postgres',
  password: '123456'
});

async function checkSchema() {
  try {
    await client.connect();
    console.log('Connected to database\n');
    
    // Check expense_splits table
    const splits = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'expense_splits'
      ORDER BY ordinal_position
    `);
    console.log('=== EXPENSE_SPLITS TABLE COLUMNS ===');
    console.log(JSON.stringify(splits.rows, null, 2));
    
    // Check expenses table
    const expenses = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'expenses'
      ORDER BY ordinal_position
    `);
    console.log('\n=== EXPENSES TABLE COLUMNS ===');
    console.log(JSON.stringify(expenses.rows, null, 2));
    
    // Check participants table
    const participants = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'participants'
      ORDER BY ordinal_position
    `);
    console.log('\n=== PARTICIPANTS TABLE COLUMNS ===');
    console.log(JSON.stringify(participants.rows, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkSchema();
