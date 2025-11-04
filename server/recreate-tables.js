const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5433,
  database: 'expense_tracker',
  user: 'postgres',
  password: '123456'
});

async function recreateTables() {
  try {
    await client.connect();
    console.log('Connected to database\n');
    
    // Drop all tables
    console.log('🗑️  Dropping all tables...');
    await client.query('DROP TABLE IF EXISTS expense_splits CASCADE');
    await client.query('DROP TABLE IF EXISTS expenses CASCADE');
    await client.query('DROP TABLE IF EXISTS group_members CASCADE');
    await client.query('DROP TABLE IF EXISTS groups CASCADE');
    await client.query('DROP TABLE IF EXISTS participants CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    console.log('✅ All tables dropped\n');
    
    // Create users table
    console.log('Creating users table...');
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create participants table
    console.log('Creating participants table...');
    await client.query(`
      CREATE TABLE participants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        mobile VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create groups table
    console.log('Creating groups table...');
    await client.query(`
      CREATE TABLE groups (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create group_members junction table
    console.log('Creating group_members table...');
    await client.query(`
      CREATE TABLE group_members (
        id SERIAL PRIMARY KEY,
        group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
        participant_id INTEGER REFERENCES participants(id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(group_id, participant_id)
      )
    `);
    
    // Create expenses table
    console.log('Creating expenses table...');
    await client.query(`
      CREATE TABLE expenses (
        id SERIAL PRIMARY KEY,
        group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
        paid_by INTEGER REFERENCES participants(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        expense_date DATE NOT NULL,
        type VARCHAR(20) CHECK (type IN ('income', 'expense')) DEFAULT 'expense',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create expense_splits table with correct schema
    console.log('Creating expense_splits table...');
    await client.query(`
      CREATE TABLE expense_splits (
        id SERIAL PRIMARY KEY,
        expense_id INTEGER REFERENCES expenses(id) ON DELETE CASCADE,
        participant_id INTEGER REFERENCES participants(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        settled BOOLEAN DEFAULT FALSE,
        settled_at TIMESTAMP,
        UNIQUE(expense_id, participant_id)
      )
    `);
    
    console.log('\n✅ All tables created successfully!');
    
    // Verify the schema
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'expense_splits'
      ORDER BY ordinal_position
    `);
    console.log('\n=== EXPENSE_SPLITS TABLE COLUMNS (VERIFIED) ===');
    console.log(JSON.stringify(result.rows, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

recreateTables();
