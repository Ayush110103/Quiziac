'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QuizCard } from '@/components/quiz-card';
import { Quiz, supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function HistoryPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    const { data } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setQuizzes(data);
    }
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => window.location.href = '/'}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-8">Quiz History</h1>

      {quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onStart={() => {
                // Handle quiz start
              }}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">No quizzes found in history.</p>
          </CardContent>
        </Card>
      )}
    </MainLayout>
  );
}