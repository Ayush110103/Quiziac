'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuizCard } from '@/components/quiz-card';
import { Brain, Search, Filter, Calendar, TrendingUp, Clock, ArrowLeft, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { Quiz, QuizAttempt, supabase } from '@/lib/supabase';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { ChatInterface } from '@/components/chat-interface';

export default function HistoryPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSortQuizzes();
  }, [quizzes, searchTerm, difficultyFilter, sortBy]);

  const loadData = async () => {
    const { data: quizzesData } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });


    const { data: attemptsData } = await supabase
      .from('quiz_attempts')
      .select('*, quizzes(*)')
      .order('completed_at', { ascending: false });

    if (quizzesData) setQuizzes(quizzesData);
    if (attemptsData) setAttempts(attemptsData);
  };

  const filterAndSortQuizzes = () => {
    let filtered = quizzes.filter(quiz => {
      const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quiz.topic.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty = difficultyFilter === 'all' || quiz.difficulty === difficultyFilter;
      
      return matchesSearch && matchesDifficulty;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'difficulty':
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          return difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - 
                 difficultyOrder[b.difficulty as keyof typeof difficultyOrder];
        default:
          return 0;
      }
    });

    setFilteredQuizzes(filtered);
  };

  const getQuizStats = (quizId: string) => {
    const quizAttempts = attempts.filter(attempt => attempt.quiz_id === quizId);
    if (quizAttempts.length === 0) return { averageScore: 0, attempts: 0 };

    const totalScore = quizAttempts.reduce((sum, attempt) => 
      sum + (attempt.score / attempt.total_questions) * 100, 0);
    
    return {
      averageScore: Math.round(totalScore / quizAttempts.length),
      attempts: quizAttempts.length
    };
  };

  const handleStartQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
  };

  if (currentQuiz) {

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentQuiz(null)}
            className="mb-4"
          >
            ← Back to History
          </Button>
          {/* QuizPlayer would go here - simplified for this example */}
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <p>Quiz player would be loaded here</p>
              <Button onClick={() => setCurrentQuiz(null)} className="mt-4">
                Back to History
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalAttempts = attempts.length;
  const averageScore = attempts.length > 0 
    ? Math.round(attempts.reduce((sum, attempt) => 
        sum + (attempt.score / attempt.total_questions) * 100, 0) / attempts.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
    
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = '/'}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Home
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <h1 className="text-lg font-semibold">Quiz History</h1>
            </div>
          </div>
          <Button 
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Create New Quiz
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{quizzes.length}</p>
                  <p className="text-sm text-muted-foreground">Total Quizzes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalAttempts}</p>
                  <p className="text-sm text-muted-foreground">Quiz Attempts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{averageScore}%</p>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Filters and Search */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
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
        </section>

        {/* Quiz Grid */}
        <section>
          {filteredQuizzes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz) => {
                const stats = getQuizStats(quiz.id);
                return (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    onStart={handleStartQuiz}
                    showStats={true}
                    averageScore={stats.averageScore}
                    attempts={stats.attempts}
                  />
                );
              })}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Brain className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Quizzes Found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || difficultyFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Create your first quiz to get started!'
                  }
                </p>
                <Button 
                  onClick={() => window.location.href = '/'}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Create Quiz
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Recent Attempts */}
        <section className="mt-12">
          <RecentAttempts attempts={attempts.slice(0, 5)} />
        </section>
      </main>
    </div>
  );
}

export function RecentAttempts({ attempts }: { attempts: QuizAttempt[] }) {
  if (!attempts || attempts.length === 0) {
    return (
      <div className="p-6 rounded-lg border mt-8">
        <h2 className="text-3xl font-bold mb-2">Recent Attempts</h2>
        <p className="mb-6 text-muted-foreground">Your latest quiz attempts and scores</p>
        <p>No attempts yet.</p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg border mt-8">
      <h2 className="text-3xl font-bold mb-2">Recent Attempts</h2>
      <p className="mb-6 text-muted-foreground">Your latest quiz attempts and scores</p>
      <div className="space-y-4">
        {attempts.map((attempt) => {
          const percent = Math.round((attempt.score / attempt.total_questions) * 100);
          return (
            <div
              key={attempt.id}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border bg-background hover:bg-muted transition"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="text-primary" size={18} />
                  <span className="font-semibold text-lg">{attempt.quizzes?.title || "Untitled Quiz"}</span>
                </div>
                <div className="text-sm text-muted-foreground mb-1">
                  <CheckCircle className="inline text-green-500 mr-1" size={16} />
                  {attempt.score} correct
                  <XCircle className="inline text-red-500 mx-2" size={16} />
                  {attempt.total_questions - attempt.score} incorrect
                  <Clock className="inline text-blue-500 mx-2" size={16} />
                  {attempt.time_taken}s
                </div>
                <Progress value={percent} className="h-2 mt-2" />
              </div>
              <div className="flex flex-col items-end min-w-[80px]">
                <span className="font-bold text-lg">{percent}%</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(attempt.completed_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ReviewPage() {
  const params = useParams();
  const attemptId = params.id as string;
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data: attemptData } = await supabase
        .from('quiz_attempts')
        .select('*, quizzes(*)')
        .eq('id', attemptId)
        .single();
      setAttempt(attemptData);
      setQuiz(attemptData?.quizzes);
    }
    fetchData();
  }, [attemptId]);

  if (!attempt || !quiz) return <div>Loading...</div>;

  return (
    <div className="flex gap-8">
      {/* Main Results */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-4">Quiz Results: {quiz.title}</h1>
        <div className="mb-4">
          Score: {attempt.score} / {quiz.questions.length} (
          {Math.round((attempt.score / quiz.questions.length) * 100)}%)
        </div>
        <div className="space-y-6">
          {quiz.questions.map((q, idx) => {
            const userAnswer = attempt.answers[idx];
            const isCorrect = userAnswer === q.correct_answer;
            return (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${
                  isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                }`}
              >
                <div className="font-semibold mb-2">
                  Q{idx + 1}: {q.question}
                </div>
                <div className="space-y-1">
                  {q.options.map((opt, oidx) => (
                    <div
                      key={oidx}
                      className={`
                        px-2 py-1 rounded
                        ${oidx === q.correct_answer ? 'bg-green-200/60' : ''}
                        ${oidx === userAnswer && oidx !== q.correct_answer ? 'bg-red-200/60' : ''}
                        ${oidx === userAnswer ? 'font-bold' : ''}
                      `}
                    >
                      {opt}
                      {oidx === q.correct_answer && (
                        <CheckCircle className="inline ml-2 text-green-600" size={16} />
                      )}
                      {oidx === userAnswer && oidx !== q.correct_answer && (
                        <XCircle className="inline ml-2 text-red-600" size={16} />
                      )}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Explanation:</span> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* AI Chat Sidebar */}
      <aside className="w-full max-w-sm">
        <div className="sticky top-8">
          <h2 className="text-xl font-bold mb-2">Discuss with AI</h2>
          <ChatInterface topic={quiz.topic} />
        </div>
      </aside>
    </div>
  );
}