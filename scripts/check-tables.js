const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

// Fix the connection string format if needed
let connectionString = process.env.NEXT_NEON_DB_API_KEY;
if (connectionString && connectionString.startsWith('psql \'')) {
  connectionString = connectionString.replace('psql \'', '').replace('\'', '');
}

const sql = neon(connectionString);

async function checkTables() {
  try {
    console.log('🔍 Checking database tables...\n');
    
    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    console.log('📋 Found tables:');
    if (tables.length === 0) {
      console.log('❌ No tables found in the database!');
    } else {
      tables.forEach(table => {
        console.log(`✅ ${table.table_name}`);
      });
    }
    
    // Check table structures
    for (const table of tables) {
      console.log(`\n📊 Structure of ${table.table_name}:`);
      const columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = ${table.table_name}
        ORDER BY ordinal_position
      `;
      
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    }
    
    // Check if users table has any data
    if (tables.some(t => t.table_name === 'users')) {
      const userCount = await sql`SELECT COUNT(*) as count FROM users`;
      console.log(`\n👥 Users table has ${userCount[0].count} records`);
    }
    
    // Check if quizzes table has any data
    if (tables.some(t => t.table_name === 'quizzes')) {
      const quizCount = await sql`SELECT COUNT(*) as count FROM quizzes`;
      console.log(`📝 Quizzes table has ${quizCount[0].count} records`);
    }
    
    // Check if quiz_attempts table has any data
    if (tables.some(t => t.table_name === 'quiz_attempts')) {
      const attemptCount = await sql`SELECT COUNT(*) as count FROM quiz_attempts`;
      console.log(`🎯 Quiz attempts table has ${attemptCount[0].count} records`);
    }
    
  } catch (error) {
    console.error('❌ Error checking tables:', error);
  }
}

checkTables()
  .then(() => {
    console.log('\n✅ Table check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Table check failed:', error);
    process.exit(1);
  });
