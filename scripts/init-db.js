const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Fix the connection string format if needed
let connectionString = process.env.NEXT_NEON_DB_API_KEY;
if (connectionString && connectionString.startsWith('psql \'')) {
  connectionString = connectionString.replace('psql \'', '').replace('\'', '');
}

const sql = neon(connectionString);

async function initializeDatabase() {
  try {
    console.log('Initializing Neon DB database...');
    
    // Read the schema file
    const schemaPath = path.join(process.cwd(), 'lib', 'db-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema
    await sql.unsafe(schema);
    
    console.log('✅ Database schema initialized successfully');
    
    // Test the connection
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Database connection test successful:', result[0]);
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('🎉 Database initialization completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
