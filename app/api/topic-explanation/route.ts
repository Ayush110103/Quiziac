import { NextRequest, NextResponse } from 'next/server';
import { generateTopicExplanation } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic } = body;

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    const explanation = await generateTopicExplanation(topic);
    return NextResponse.json({ explanation });
  } catch (error) {
    console.error('Error generating topic explanation:', error);
    return NextResponse.json(
      { error: 'Failed to generate explanation' },
      { status: 500 }
    );
  }
}