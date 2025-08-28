const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

// Fix the connection string format if needed
let connectionString = process.env.NEXT_NEON_DB_API_KEY;
if (connectionString && connectionString.startsWith('psql \'')) {
  connectionString = connectionString.replace('psql \'', '').replace('\'', '');
}

const sql = neon(connectionString);

async function createTables() {
  try {
    console.log('🚀 Creating tables manually...\n');
    
    // Test connection
    console.log('1️⃣ Testing connection...');
    const testResult = await sql`SELECT 1 as test`;
    console.log('✅ Connection successful:', testResult[0]);
    
    // Create users table
    console.log('\n2️⃣ Creating users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        email_verified TIMESTAMP,
        image VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Users table created');
    
    // Create quizzes table
    console.log('\n3️⃣ Creating quizzes table...');
    await sql`
      CREATE TABLE IF NOT EXISTS quizzes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        title TEXT NOT NULL,
        topic TEXT NOT NULL,
        difficulty TEXT NOT NULL DEFAULT 'medium',
        questions JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log('✅ Quizzes table created');
    
    // Create quiz_attempts table
    console.log('\n4️⃣ Creating quiz_attempts table...');
    await sql`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
        score INTEGER NOT NULL DEFAULT 0,
        total_questions INTEGER NOT NULL,
        answers JSONB NOT NULL,
        time_taken INTEGER DEFAULT 0,
        completed_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log('✅ Quiz attempts table created');
    
    // Create indexes
    console.log('\n5️⃣ Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    console.log('✅ Indexes created');
    
    // Create function and trigger
    console.log('\n6️⃣ Creating update function and trigger...');
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;
    
    await sql`
      CREATE TRIGGER update_users_updated_at 
          BEFORE UPDATE ON users 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column()
    `;
    console.log('✅ Function and trigger created');
    
    // Verify tables
    console.log('\n7️⃣ Verifying tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    console.log('📋 Tables found:');
    tables.forEach(table => {
      console.log(`✅ ${table.table_name}`);
    });
    
    console.log('\n🎉 All tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

// Run if this file is executed directly
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('\n✅ All done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Failed:', error);
      process.exit(1);
    });
}

module.exports = { createTables };
