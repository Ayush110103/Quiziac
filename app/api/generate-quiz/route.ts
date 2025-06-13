import { NextRequest, NextResponse } from 'next/server';
import { generateQuiz } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
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
      numQuestions: parseInt(numQuestions)
    });
    const { data: quiz, error } = await supabase
      .from('quizzes')
      .insert({
        title: quizData.title,
        topic,
        difficulty,
        questions: quizData.questions
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