const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'money_manager',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

async function testUpdateExpense() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check if updated_at column exists
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='expenses' AND column_name='updated_at'
    `);

    if (columnCheck.rows.length > 0) {
      console.log('✅ updated_at column exists in expenses table');
    } else {
      console.log('❌ updated_at column does NOT exist in expenses table');
      return;
    }

    // Check all columns in expenses table
    const allColumns = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name='expenses'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 All columns in expenses table:');
    allColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });

    // Try a test update
    const testExpense = await client.query(`
      SELECT id FROM expenses LIMIT 1
    `);

    if (testExpense.rows.length > 0) {
      const expenseId = testExpense.rows[0].id;
      console.log(`\n🔄 Testing update on expense ID: ${expenseId}`);
      
      await client.query(
        'UPDATE expenses SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [expenseId]
      );
      
      console.log('✅ Update successful!');
    } else {
      console.log('\n⚠️  No expenses found to test update');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n✅ Database connection closed');
  }
}

testUpdateExpense()
  .then(() => {
    console.log('✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
