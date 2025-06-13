/*
  # Quiz Platform Database Schema

  1. New Tables
    - `quizzes`
      - `id` (uuid, primary key)
      - `title` (text)
      - `topic` (text)
      - `difficulty` (text)
      - `questions` (jsonb array)
      - `created_at` (timestamp)
    
    - `quiz_attempts`
      - `id` (uuid, primary key) 
      - `quiz_id` (uuid, foreign key)
      - `score` (integer)
      - `total_questions` (integer)
      - `answers` (jsonb array)
      - `time_taken` (integer, seconds)
      - `completed_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public access (no auth required)
*/

CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  topic text NOT NULL,
  difficulty text NOT NULL DEFAULT 'medium',
  questions jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL,
  answers jsonb NOT NULL,
  time_taken integer DEFAULT 0,
  completed_at timestamptz DEFAULT now()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to quizzes"
  ON quizzes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to quizzes"
  ON quizzes
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public read access to quiz_attempts"
  ON quiz_attempts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to quiz_attempts"
  ON quiz_attempts
  FOR INSERT
  TO public
  WITH CHECK (true);