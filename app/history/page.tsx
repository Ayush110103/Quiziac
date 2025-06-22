'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QuizCard } from '@/components/quiz-card';
import { Quiz, QuizAttempt } from '@/lib/supabase';
import { createClient } from '@/lib/supabase-client';
import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuizPlayer } from '@/components/quiz-player';
import { useQuizPersistence } from '@/hooks/use-quiz-persistence';
import { useRouter } from 'next/navigation';

export default function HistoryPage() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [filteredAttempts, setFilteredAttempts] = useState<QuizAttempt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const { quizState, startQuiz, clearQuiz, isLoading } = useQuizPersistence();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    loadQuizzes();
  }, []);

  useEffect(() => {
    filterAndSortQuizzes();
  }, [attempts, searchTerm, difficultyFilter, sortBy]);

  const loadQuizzes = async () => {
    const { data } = await supabase
      .from('quiz_attempts')
      .select('*, quiz:quizzes(*)')
      .order('completed_at', { ascending: false });
    
    if (data) {
      setAttempts(data as QuizAttempt[]);
    }
  };

  const filterAndSortQuizzes = () => {
    let filtered = attempts.filter(attempt => {
      if (!attempt.quiz) return false;
      const quiz = attempt.quiz as Quiz;
      const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quiz.topic.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty = difficultyFilter === 'all' || quiz.difficulty === difficultyFilter;
      
      return matchesSearch && matchesDifficulty;
    });

    filtered.sort((a, b) => {
      const quizA = a.quiz as Quiz;
      const quizB = b.quiz as Quiz;

      switch (sortBy) {
        case 'recent':
          return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime();
        case 'title':
          return quizA.title.localeCompare(quizB.title);
        case 'difficulty':
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          return difficultyOrder[quizA.difficulty as keyof typeof difficultyOrder] - 
                 difficultyOrder[quizB.difficulty as keyof typeof difficultyOrder];
        default:
          return 0;
      }
    });

    setFilteredAttempts(filtered);
  };

  const handleStartQuiz = (quiz: Quiz) => {
    startQuiz(quiz);
  };

  const handleQuizComplete = () => {
    clearQuiz();
    loadQuizzes();
  };

  const handleBackToHistory = () => {
    clearQuiz();
  };

  if (quizState) {
    return (
      <MainLayout>
        <QuizPlayer 
          quiz={quizState.quiz} 
          onComplete={handleQuizComplete}
          onBack={handleBackToHistory}
        />
      </MainLayout>
    );
  }

  // Show loading state while checking for persisted quiz
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-8">Quiz History</h1>
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                  <SelectItem value="difficulty">Difficulty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredAttempts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAttempts.map((attempt) => {
            if (!attempt.quiz) return null;
            const quiz = attempt.quiz as Quiz;
            return (
              <QuizCard
                key={attempt.id}
                quiz={quiz}
                onStart={handleStartQuiz}
                lastAttemptTime={attempt.completed_at}
              />
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">
              {searchTerm || difficultyFilter !== 'all' 
                ? 'No quizzes match your search criteria'
                : 'You have not attempted any quizzes yet.'}
            </p>
          </CardContent>
        </Card>
      )}
    </MainLayout>
  );
}