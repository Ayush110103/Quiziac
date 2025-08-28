import { neon } from '@neondatabase/serverless';

if (!process.env.NEXT_NEON_DB_API_KEY) {
  throw new Error('Missing env.NEXT_NEON_DB_API_KEY');
}

// Fix the connection string format if needed
let connectionString = process.env.NEXT_NEON_DB_API_KEY;
if (connectionString && connectionString.startsWith('psql \'')) {
  connectionString = connectionString.replace('psql \'', '').replace('\'', '');
}

export const sql = neon(connectionString);

// Test the connection
sql`SELECT 1`
  .then(() => {
    console.log('Neon DB connected successfully');
  })
  .catch((error) => {
    console.error('Neon DB connection error:', error);
  });

export type Quiz = {
  id: string;
  user_id: string;
  title: string;
  topic: string;
  difficulty: string;
  questions: Question[];
  created_at: string;
};

export type Question = {
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
};

export type QuizAttempt = {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  answers: (number | null)[];
  time_taken: number;
  completed_at: string;
  quiz?: Quiz;
};
