import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, BookOpen, BarChart3, History } from 'lucide-react';
import { Quiz } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { QuizAttempt } from '@/lib/supabase';
import { QuizPlayer } from '@/components/quiz-player';

interface QuizCardProps {
  quiz: Quiz;
  onStart: (quiz: Quiz) => void;
  showStats?: boolean;
  averageScore?: number;
  attempts?: number;
  latestAttemptId?: string;
}

export function QuizCard({ quiz, onStart, showStats, averageScore, attempts, latestAttemptId }: QuizCardProps) {
  const router = useRouter();
  const [localAttempts, setLocalAttempts] = useState<QuizAttempt[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [lastAttemptTime, setLastAttemptTime] = useState<string | null>(null);

  useEffect(() => {
    const loadAttempts = async () => {
      const { data } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('quiz_id', quiz.id)
        .order('completed_at', { ascending: false })
        .limit(1);
      
      if (data && data.length > 0) {
        const lastAttempt = data[0];
        const date = new Date(lastAttempt.completed_at);
        setLastAttemptTime(date.toLocaleDateString() + ' ' + date.toLocaleTimeString());
      }
    };
    loadAttempts();
  }, [quiz.id]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const handleQuizComplete = (
    score: number,
    answers: number[],
    timeTaken: number,
    attemptId: string
  ) => {
    router.push(`/review/${attemptId}`);
  };

  const handleStartQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
  };

  if (currentQuiz) {
    return (
      <QuizPlayer
        quiz={currentQuiz}
        onComplete={handleQuizComplete}
        onBack={() => setCurrentQuiz(null)}
      />
    );
  }

  return (
    <Card className="h-full group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold leading-tight group-hover:text-blue-600 transition-colors">
              {quiz.title}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {quiz.topic}
            </CardDescription>
          </div>
          <Badge 
            variant="secondary"
            className={`ml-2 ${getDifficultyColor(quiz.difficulty)} border-0`}
          >
            {quiz.difficulty}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{quiz.questions.length} questions</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>~{quiz.questions.length * 2} min</span>
            </div>
          </div>
          
          {showStats && (
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-blue-600">
                <BarChart3 className="h-4 w-4" />
                <span>{averageScore}% avg</span>
              </div>
              <span className="text-muted-foreground">
                {attempts} attempt{attempts !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {lastAttemptTime && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <History className="h-4 w-4" />
              <span>Last attempt: {lastAttemptTime}</span>
            </div>
          )}
          
          <Button 
            onClick={() => onStart(quiz)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            Start Quiz
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/review/${quiz.id}`)}
            >
              Review Quiz
            </Button>
            
            {latestAttemptId && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/review/${latestAttemptId}`)}
              >
                Review Last Attempt
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}