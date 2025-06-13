'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuizCreator } from '@/components/quiz-creator';
import { QuizPlayer } from '@/components/quiz-player';
import { QuizCard } from '@/components/quiz-card';
import { Brain, History, TrendingUp, Users, Sparkles, BookOpen } from 'lucide-react';
import { Quiz, supabase } from '@/lib/supabase';

export default function Home() {
  const [currentView, setCurrentView] = useState<'home' | 'create' | 'play'>('home');
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalAttempts: 0,
    averageScore: 0
  });

  useEffect(() => {
    loadRecentQuizzes();
    loadStats();
  }, []);

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
      const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
      const totalPossible = attempts.reduce((sum, attempt) => sum + attempt.total_questions, 0);
      
      setStats({
        totalQuizzes: quizzes.length,
        totalAttempts: attempts.length,
        averageScore: totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0
      });
    }
  };

  const handleQuizCreated = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setCurrentView('play');
    loadRecentQuizzes(); // Refresh recent quizzes
  };

  const handleQuizComplete = () => {
    setCurrentView('home');
    setCurrentQuiz(null);
    loadStats(); // Refresh stats
  };

  const handleStartQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setCurrentView('play');
  };

  if (currentView === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
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
        </div>
      </div>
    );
  }

  if (currentView === 'play' && currentQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <QuizPlayer 
            quiz={currentQuiz} 
            onComplete={handleQuizComplete}
            onBack={() => setCurrentView('home')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                QuizMaster AI
              </h1>
              <p className="text-xs text-muted-foreground">Learn • Practice • Excel</p>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/history'}>
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
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
                className="px-8 py-6 text-lg hover:bg-blue-50 hover:border-blue-200"
              >
                <History className="mr-2 h-5 w-5" />
                View History
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalQuizzes}</div>
              <p className="text-sm text-muted-foreground">Quizzes Created</p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-1">{stats.totalAttempts}</div>
              <p className="text-sm text-muted-foreground">Quiz Attempts</p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">{stats.averageScore}%</div>
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
                className="text-blue-600 hover:text-blue-700"
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
      </main>
    </div>
  );
}