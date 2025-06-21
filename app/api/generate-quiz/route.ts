import { NextRequest, NextResponse } from 'next/server';
import { generateQuiz } from '@/lib/gemini';
import { createServerClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { topic, difficulty, numQuestions } = body;

    if (!topic || !difficulty || !numQuestions) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    const quizData = await generateQuiz({
      topic,
      difficulty,
      numQuestions: parseInt(numQuestions, 10)
    });

    const { data: quiz, error } = await supabase
      .from('quizzes')
      .insert({
        title: quizData.title,
        topic,
        difficulty,
        questions: quizData.questions,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error details:', error);
      return NextResponse.json(
        { error: `Failed to save quiz: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}