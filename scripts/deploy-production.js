const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production deployment preparation...\n');

// Check if .env.production exists
const envProdPath = path.join(process.cwd(), '.env.production');
if (!fs.existsSync(envProdPath)) {
  console.log('⚠️  .env.production not found. Creating from .env.local...');
  const envLocalPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    fs.copyFileSync(envLocalPath, envProdPath);
    console.log('✅ Created .env.production from .env.local');
  } else {
    console.log('❌ No .env.local found. Please create .env.production manually.');
    process.exit(1);
  }
}

// Validate required environment variables
console.log('\n🔍 Validating environment variables...');
const envContent = fs.readFileSync(envProdPath, 'utf8');
const requiredVars = ['NEXT_NEON_DB_API_KEY', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];

for (const varName of requiredVars) {
  if (!envContent.includes(varName + '=')) {
    console.log(`❌ Missing required environment variable: ${varName}`);
    process.exit(1);
  }
}
console.log('✅ All required environment variables found');

// Clean previous builds
console.log('\n🧹 Cleaning previous builds...');
try {
  execSync('rm -rf .next', { stdio: 'inherit' });
  console.log('✅ Cleaned .next directory');
} catch (error) {
  console.log('⚠️  Could not clean .next directory (might not exist)');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm ci --only=production', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.log('⚠️  Using npm install instead...');
  execSync('npm install', { stdio: 'inherit' });
}

// Build the application
console.log('\n🔨 Building application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.log('❌ Build failed');
  process.exit(1);
}

// Check tables
console.log('\n📋 Checking database tables...');
try {
  execSync('npm run check-tables', { stdio: 'inherit' });
  console.log('✅ Database tables check passed');
} catch (error) {
  console.log('❌ Database tables check failed');
  process.exit(1);
}

console.log('\n🎉 Production deployment preparation completed!');
console.log('\n📋 Next steps:');
console.log('1. Set your production environment variables in .env.production');
console.log('2. Deploy to your hosting platform (Vercel, Netlify, etc.)');
console.log('3. Set the environment variables in your hosting platform');
console.log('4. Run: npm start (or your platform\'s start command)');
console.log('\n🔗 Useful commands:');
console.log('- npm run build    # Build for production');
console.log('- npm start        # Start production server');
console.log('- npm run lint     # Check code quality');
