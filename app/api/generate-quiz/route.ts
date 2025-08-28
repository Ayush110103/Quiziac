import { NextRequest, NextResponse } from 'next/server';
import { generateQuiz } from '@/lib/gemini';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/neon';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
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

    const [quiz] = await sql`
      INSERT INTO quizzes (title, topic, difficulty, questions, user_id)
      VALUES (${quizData.title}, ${topic}, ${difficulty}, ${JSON.stringify(quizData.questions)}, ${session.user.id})
      RETURNING *
    `;

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}