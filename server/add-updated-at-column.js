const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'money_manager',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

async function addUpdatedAtColumns() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Add updated_at to participants table if not exists
    console.log('🔄 Adding updated_at column to participants table...');
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='participants' AND column_name='updated_at'
        ) THEN
          ALTER TABLE participants 
          ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
          
          UPDATE participants SET updated_at = created_at WHERE updated_at IS NULL;
        END IF;
      END $$;
    `);
    console.log('✅ Participants table updated');

    // Add updated_at to groups table if not exists
    console.log('🔄 Adding updated_at column to groups table...');
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='groups' AND column_name='updated_at'
        ) THEN
          ALTER TABLE groups 
          ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
          
          UPDATE groups SET updated_at = created_at WHERE updated_at IS NULL;
        END IF;
      END $$;
    `);
    console.log('✅ Groups table updated');

    // Add updated_at to expenses table if not exists
    console.log('🔄 Adding updated_at column to expenses table...');
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='expenses' AND column_name='updated_at'
        ) THEN
          ALTER TABLE expenses 
          ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
          
          UPDATE expenses SET updated_at = created_at WHERE updated_at IS NULL;
        END IF;
      END $$;
    `);
    console.log('✅ Expenses table updated');

    console.log('✅ All tables have been updated with updated_at column');
  } catch (error) {
    console.error('❌ Error adding updated_at columns:', error);
    throw error;
  } finally {
    await client.end();
    console.log('✅ Database connection closed');
  }
}

addUpdatedAtColumns()
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
