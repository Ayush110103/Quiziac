import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/neon';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const attempts = await sql`
      SELECT qa.*, 
             json_build_object(
               'id', q.id,
               'title', q.title,
               'topic', q.topic,
               'difficulty', q.difficulty,
               'questions', q.questions,
               'created_at', q.created_at
             ) as quiz
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.user_id = ${session.user.id}
      ORDER BY qa.completed_at DESC
    `;

    return NextResponse.json(attempts);
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz attempts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { quiz_id, score, total_questions, answers, time_taken } = await request.json();

    if (!quiz_id || typeof score !== 'number' || !total_questions || !answers || typeof time_taken !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [attempt] = await sql`
      INSERT INTO quiz_attempts (quiz_id, user_id, score, total_questions, answers, time_taken, completed_at)
      VALUES (${quiz_id}, ${session.user.id}, ${score}, ${total_questions}, ${JSON.stringify(answers)}, ${time_taken}, NOW())
      RETURNING *
    `;

    return NextResponse.json(attempt, { status: 201 });
  } catch (error) {
    console.error('Error saving quiz attempt:', error);
    return NextResponse.json(
      { error: 'Failed to save quiz attempt' },
      { status: 500 }
    );
  }
}
