'use server'

import { generateQuiz } from "@/lib/gemini";
import { QuizGenerationParams } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from 'next/server';
export async function generate_quiz({topic, difficulty, numQuestions}: QuizGenerationParams) {
  try {

    const quizData = await generateQuiz({
          topic,
          difficulty,
          numQuestions
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
    

  

