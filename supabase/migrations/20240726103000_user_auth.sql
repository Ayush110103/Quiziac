-- Add user_id to quizzes table
ALTER TABLE public.quizzes
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to quiz_attempts table
ALTER TABLE public.quiz_attempts
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Backfill user_id for existing quizzes and attempts
-- This assumes you have a 'test' user created.
-- Replace 'test@example.com' with the actual email of your test user.
-- It's better to run this part as a separate script after creating the user.
-- For simplicity in a single migration, we are doing it here.
-- You MUST create the test user before running this migration.
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- IMPORTANT: Create a 'test' user in your Supabase project before running this.
    -- The email for the user should be 'test@example.com'.
    -- If you use a different email, update it here.
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'test@example.com';

    IF test_user_id IS NOT NULL THEN
        UPDATE public.quizzes SET user_id = test_user_id WHERE user_id IS NULL;
        UPDATE public.quiz_attempts SET user_id = test_user_id WHERE user_id IS NULL;
    ELSE
        RAISE WARNING 'Test user not found. Skipping data migration.';
    END IF;
END $$;


-- Now that user_id is backfilled, make it NOT NULL
ALTER TABLE public.quizzes ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.quiz_attempts ALTER COLUMN user_id SET NOT NULL;

-- Drop old public policies
DROP POLICY "Allow public read access to quizzes" ON public.quizzes;
DROP POLICY "Allow public insert to quizzes" ON public.quizzes;
DROP POLICY "Allow public read access to quiz_attempts" ON public.quiz_attempts;
DROP POLICY "Allow public insert to quiz_attempts" ON public.quiz_attempts;

-- Create policies for authenticated users
-- Quizzes
CREATE POLICY "Allow individual user access to their quizzes"
  ON public.quizzes
  FOR ALL
  USING (auth.uid() = user_id);

-- Quiz Attempts
CREATE POLICY "Allow individual user access to their quiz attempts"
  ON public.quiz_attempts
  FOR ALL
  USING (auth.uid() = user_id); 