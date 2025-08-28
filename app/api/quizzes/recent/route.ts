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
    const quizzes = await sql`
      SELECT q.*, 
             (SELECT qa.completed_at 
              FROM quiz_attempts qa 
              WHERE qa.quiz_id = q.id 
              ORDER BY qa.completed_at DESC 
              LIMIT 1) as last_attempt_completed_at
      FROM quizzes q
      WHERE q.user_id = ${session.user.id}
      ORDER BY q.created_at DESC
      LIMIT 6
    `;

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('Error fetching recent quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent quizzes' },
      { status: 500 }
    );
  }
}
