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
    const [stats] = await sql`
      SELECT 
        COUNT(DISTINCT q.id) as total_quizzes,
        COUNT(qa.id) as total_attempts,
        CASE 
          WHEN COUNT(qa.id) > 0 THEN 
            ROUND(AVG((qa.score::float / qa.total_questions::float) * 100))
          ELSE 0 
        END as average_score
      FROM quizzes q
      LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
      WHERE q.user_id = ${session.user.id}
    `;

    return NextResponse.json({
      totalQuizzes: parseInt(stats.total_quizzes) || 0,
      totalAttempts: parseInt(stats.total_attempts) || 0,
      averageScore: parseInt(stats.average_score) || 0
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
