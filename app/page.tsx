'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QuizCreator } from '@/components/quiz-creator';
import { QuizPlayer } from '@/components/quiz-player';
import { QuizCard } from '@/components/quiz-card';
import { Brain, History, TrendingUp, Users, Sparkles, BookOpen } from 'lucide-react';
import { Quiz } from '@/lib/supabase';
import { createClient } from '@/lib/supabase-client';
import { MainLayout } from '@/components/layout/main-layout';
import { useQuizPersistence } from '@/hooks/use-quiz-persistence';

export default function Home() {
  const supabase = createClient();
  const [currentView, setCurrentView] = useState<'home' | 'create' | 'play'>('home');
  const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalAttempts: 0,
    averageScore: 0
  });

  const { quizState, startQuiz, clearQuiz, isLoading } = useQuizPersistence();

  useEffect(() => {
    loadRecentQuizzes();
    loadStats();
  }, []);

  // Check if there's an active quiz and show it
  useEffect(() => {
    if (quizState && !isLoading) {
      setCurrentView('play');
    }
  }, [quizState, isLoading]);

  const loadRecentQuizzes = async () => {
    const { data: quizzes } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6);
    
    if (quizzes) {
      setRecentQuizzes(quizzes);
    }
  };

  const loadStats = async () => {
    const { data: quizzes } = await supabase.from('quizzes').select('id');
    const { data: attempts } = await supabase.from('quiz_attempts').select('score, total_questions');
    
    if (quizzes && attempts) {
      // Calculate average score as percentage
      const totalPercentage = attempts.reduce((sum, attempt) => {
        const percentage = (attempt.score / attempt.total_questions) * 100;
        return sum + percentage;
      }, 0);
      
      setStats({
        totalQuizzes: quizzes.length,
        totalAttempts: attempts.length,
        averageScore: attempts.length > 0 ? Math.round(totalPercentage / attempts.length) : 0
      });
    }
  };

  const handleQuizCreated = (quiz: Quiz) => {
    startQuiz(quiz);
    setCurrentView('play');
    loadRecentQuizzes();
  };

  const handleQuizComplete = () => {
    setCurrentView('home');
    clearQuiz();
    loadStats();
  };

  const handleStartQuiz = (quiz: Quiz) => {
    startQuiz(quiz);
    setCurrentView('play');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    clearQuiz();
  };

  if (currentView === 'create') {
    return (
      <MainLayout>
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentView('home')}
            className="mb-4"
          >
            ← Back to Home
          </Button>
        </div>
        <QuizCreator onQuizCreated={handleQuizCreated} />
      </MainLayout>
    );
  }

  if (currentView === 'play' && quizState) {
    return (
      <MainLayout>
        <QuizPlayer 
          quiz={quizState.quiz} 
          onComplete={handleQuizComplete}
          onBack={handleBackToHome}
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
      {/* Hero Section */}
      <section className="text-center mb-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Master Any Topic with AI-Powered Quizzes
          </h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Generate personalized quizzes on any subject, track your progress, and learn with our intelligent AI assistant. 
            From basic concepts to advanced topics - we've got you covered.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setCurrentView('create')}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Create Quiz
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.location.href = '/history'}
              className="px-8 py-6 text-lg hover:bg-blue-50 dark:hover:bg-gray-800 hover:border-blue-200 dark:hover:border-gray-700"
            >
              <History className="mr-2 h-5 w-5" />
              View History
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="text-center hover:shadow-lg transition-shadow dark:bg-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mx-auto mb-4">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">{stats.totalQuizzes}</div>
            <p className="text-sm text-muted-foreground">Quizzes Created</p>
          </CardContent>
        </Card>
        
        <Card className="text-center hover:shadow-lg transition-shadow dark:bg-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full mx-auto mb-4">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">{stats.totalAttempts}</div>
            <p className="text-sm text-muted-foreground">Quiz Attempts</p>
          </CardContent>
        </Card>
        
        <Card className="text-center hover:shadow-lg transition-shadow dark:bg-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">{stats.averageScore}%</div>
            <p className="text-sm text-muted-foreground">Average Score</p>
          </CardContent>
        </Card>
      </section>

      {/* Recent Quizzes */}
      {recentQuizzes.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Recent Quizzes</h3>
            <Button 
              variant="ghost" 
              onClick={() => window.location.href = '/history'}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              View All →
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentQuizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onStart={handleStartQuiz}
              />
            ))}
          </div>
        </section>
      )}

      {recentQuizzes.length === 0 && (
        <section className="text-center py-12">
          <div className="max-w-md mx-auto">
            <Brain className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Quizzes Yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first AI-powered quiz to get started on your learning journey!
            </p>
            <Button 
              onClick={() => setCurrentView('create')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Create Your First Quiz
            </Button>
          </div>
        </section>
      )}
    </MainLayout>
  );
}