# Migration Guide: Supabase to Neon DB

This guide documents the migration from Supabase to Neon DB for the Quiziac application.

## What Changed

### Authentication System
- **Before**: Supabase Auth with email/password
- **After**: NextAuth.js with credentials provider and Neon DB adapter

### Database
- **Before**: Supabase PostgreSQL
- **After**: Neon DB PostgreSQL

### Key Files Modified

#### New Files Created
- `lib/neon.ts` - Neon DB client configuration
- `lib/auth.ts` - NextAuth configuration
- `app/api/auth/[...nextauth]/route.ts` - NextAuth API route
- `app/api/signup/route.ts` - User registration API
- `app/api/quizzes/recent/route.ts` - Recent quizzes API
- `app/api/stats/route.ts` - User stats API
- `app/api/quiz-attempts/route.ts` - Quiz attempts API
- `lib/db-schema.sql` - Database schema for Neon DB
- `scripts/init-db.js` - Database initialization script
- `types/next-auth.d.ts` - NextAuth TypeScript declarations

#### Files Modified
- `app/login/page.tsx` - Updated to use NextAuth
- `app/signup/page.tsx` - Updated to use new signup API
- `app/page.tsx` - Updated to use NextAuth session and new APIs
- `app/history/page.tsx` - Updated to use NextAuth and new APIs
- `components/quiz-player.tsx` - Updated to use NextAuth and new APIs
- `components/layout/header.tsx` - Updated to use NextAuth
- `hooks/use-quiz-persistence.ts` - Updated types
- `middleware.ts` - Updated to use NextAuth
- `app/layout.tsx` - Updated to use new Providers
- `app/providers.tsx` - Added NextAuth SessionProvider
- `package.json` - Added new dependencies and scripts

#### Files Removed
- `app/auth/callback/route.ts` - Supabase auth callback
- `app/auth/auth-code-error/page.tsx` - Supabase auth error page
- `lib/supabase-client.ts` - Supabase client (replaced by neon.ts)
- `lib/supabase-server.ts` - Supabase server client (replaced by NextAuth)
- `lib/supabase.ts` - Supabase configuration (replaced by neon.ts)

## Environment Variables

### Required Environment Variables
Add these to your `.env.local` file:

```env
# Neon DB
NEXT_NEON_DB_API_KEY=your_neon_db_connection_string

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000
```

### Removed Environment Variables
These Supabase environment variables are no longer needed:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Database Setup

### 1. Initialize Database Schema
Run the database initialization script:

```bash
npm run init-db
```

This will create the following tables:
- `users` - User accounts for NextAuth
- `quizzes` - Quiz data
- `quiz_attempts` - Quiz attempt records

### 2. Database Schema
The new schema includes:
- User authentication with password hashing
- Proper foreign key relationships
- Indexes for performance
- Automatic timestamp updates

## Migration Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Add the required environment variables to `.env.local`

### 3. Initialize Database
```bash
npm run init-db
```

### 4. Start Development Server
```bash
npm run dev
```

## Data Migration (Optional)

If you have existing data in Supabase that you want to migrate:

1. Export data from Supabase tables
2. Transform the data to match the new schema
3. Import into Neon DB using the provided schema

## Key Differences

### Authentication Flow
- **Before**: Supabase handled auth state automatically
- **After**: NextAuth manages sessions with JWT tokens

### Database Queries
- **Before**: Supabase client with built-in RLS
- **After**: Direct SQL queries with Neon DB

### API Routes
- **Before**: Supabase client calls in components
- **After**: REST API routes with NextAuth session validation

## Testing

1. Create a new account using the signup page
2. Login with the created account
3. Create a quiz and take it
4. Check that quiz attempts are saved
5. Verify history page shows attempts

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify `NEXT_NEON_DB_API_KEY` is correct
   - Run `npm run init-db` to initialize schema

2. **Authentication Issues**
   - Check `NEXTAUTH_SECRET` is set
   - Verify `NEXTAUTH_URL` matches your environment

3. **TypeScript Errors**
   - Ensure `types/next-auth.d.ts` is included in your TypeScript config

### Getting Help

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure the database schema is initialized
4. Check that all dependencies are installed correctly
