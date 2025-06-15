import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false
    }
  }
);

supabase.from('quizzes').select('count').single()
  .then(({ data, error }) => {
    if (error) {
      console.error('Supabase connection error:', error);
    } else {
      console.log('Supabase connected successfully');
    }
  });

export type Quiz = {
  id: string;
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
  quiz_id: string;
  score: number;
  total_questions: number;
  answers: number[];
  time_taken: number;
  completed_at: string;
  quiz?: Quiz;
};