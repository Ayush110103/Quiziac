'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChatInterface from '@/components/chat-interface';
import { ArrowLeft, Brain, MessageCircle, BookOpen, Lightbulb, TrendingUp } from 'lucide-react';
import { Quiz, QuizAttempt, supabase } from '@/lib/supabase';
import { MainLayout } from '@/components/layout/main-layout';

export default function ReviewPage() {
  const params = useParams();
  const quizId = params.id as string;
  const router = useRouter();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [relatedTopics, setRelatedTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [topicExplanation, setTopicExplanation] = useState<string>('');
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  useEffect(() => {
    if (quizId) {
      loadQuizData();
      generateRelatedTopics();
    }
  }, [quizId]);

  const loadQuizData = async () => {
    const { data: quizData } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();

    const { data: attemptsData } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('quiz_id', quizId)
      .order('completed_at', { ascending: false });

    if (quizData) setQuiz(quizData);
    if (attemptsData) setAttempts(attemptsData);
  };

  const generateRelatedTopics = () => {
    setRelatedTopics([
      'Advanced Concepts',
      'Practical Applications', 
      'Common Mistakes',
      'Best Practices',
      'Real-world Examples',
      'Related Technologies'
    ]);
  };

  const loadTopicExplanation = async (topic: string) => {
    setSelectedTopic(topic);
    setLoadingExplanation(true);
    
    try {
      const response = await fetch('/api/topic-explanation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: `${topic} related to ${quiz?.topic}`
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTopicExplanation(data.explanation);
      }
    } catch (error) {
      console.error('Error loading topic explanation:', error);
      setTopicExplanation('Failed to load explanation. Please try again.');
    } finally {
      setLoadingExplanation(false);
    }
  };

  if (!quiz) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <Brain className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading quiz details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const bestAttempt = attempts.length > 0 
    ? attempts.reduce((best, current) => 
        (current.score / current.total_questions) > (best.score / best.total_questions) ? current : best
      )
    : null;

  const averageScore = attempts.length > 0
    ? Math.round(attempts.reduce((sum, attempt) => 
        sum + (attempt.score / attempt.total_questions) * 100, 0) / attempts.length)
    : 0;

  return (
    <MainLayout>
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/history')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to History
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Main Content */}
        <div className="xl:col-span-3 space-y-6">
          {/* Performance Overview */}
          <Card className="dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{attempts.length}</div>
                  <div className="text-sm text-muted-foreground">Total Attempts</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{averageScore}%</div>
                  <div className="text-sm text-muted-foreground">Average Score</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {bestAttempt ? Math.round((bestAttempt.score / bestAttempt.total_questions) * 100) : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Best Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for different content */}
          <Tabs defaultValue="questions" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 dark:bg-gray-700">
              <TabsTrigger value="questions" className="dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-white dark:hover:bg-gray-600">Questions Review</TabsTrigger>
              <TabsTrigger value="topics" className="dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-white dark:hover:bg-gray-600">Related Topics</TabsTrigger>
              <TabsTrigger value="attempts" className="dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-white dark:hover:bg-gray-600">Attempt History</TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="space-y-4">
              <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle>Question Breakdown</CardTitle>
                  <CardDescription className="dark:text-muted-foreground">Review all questions from this quiz</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {quiz.questions.map((question, index) => (
                    <div key={index} className="border-l-4 border-l-blue-200 dark:border-l-blue-700 pl-4 space-y-3">
                      <h4 className="font-medium text-lg dark:text-white">{question.question}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`p-3 rounded border ${
                              optionIndex === question.correct_answer
                                ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-300'
                                : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200'
                            }`}
                          >
                            <span className="font-medium mr-2">
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>
                            {option}
                            {optionIndex === question.correct_answer && (
                              <span className="ml-2 text-green-600 dark:text-green-400">✓ Correct</span>
                            )}
                          </div>
                        ))}
                      </div>
                      {question.explanation && (
                        <div className="bg-blue-50 p-3 rounded border border-blue-200 dark:bg-blue-900 dark:border-blue-700">
                          <p className="text-sm dark:text-blue-300">
                            <Lightbulb className="inline h-4 w-4 mr-1 text-blue-600 dark:text-blue-400" />
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="topics" className="space-y-4">
              <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle>Related Topics</CardTitle>
                  <CardDescription className="dark:text-muted-foreground">Explore topics related to {quiz.topic}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {relatedTopics.map((topic) => (
                      <Button
                        key={topic}
                        variant={selectedTopic === topic ? "default" : "outline"}
                        onClick={() => loadTopicExplanation(topic)}
                        className="text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                      >
                        {topic}
                      </Button>
                    ))}
                  </div>
                  
                  {selectedTopic && (
                    <Card className="mt-6 dark:bg-gray-700">
                      <CardHeader>
                        <CardTitle className="text-lg dark:text-white">{selectedTopic}</CardTitle>
                      </CardHeader>
                      <CardContent className="dark:text-gray-200">
                        {loadingExplanation ? (
                          <p className="text-muted-foreground">Loading explanation...</p>
                        ) : (
                          <p>{topicExplanation}</p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attempts" className="space-y-4">
              <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle>Attempt History</CardTitle>
                  <CardDescription className="dark:text-muted-foreground">Review all your past attempts for this quiz</CardDescription>
                </CardHeader>
                <CardContent>
                  {attempts.length > 0 ? (
                    <div className="space-y-4">
                      {attempts.map((attempt, index) => (
                        <div key={index} className="p-4 border rounded-lg flex items-center justify-between dark:bg-gray-700 dark:border-gray-600">
                          <div>
                            <p className="font-medium dark:text-white">Attempt {attempts.length - index}</p>
                            <p className="text-sm text-muted-foreground">
                              Score: {attempt.score} / {attempt.total_questions}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Completed on: {new Date(attempt.completed_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-lg py-1 px-3 dark:bg-gray-600 dark:text-white">
                            {Math.round((attempt.score / attempt.total_questions) * 100)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No attempts yet for this quiz.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* AI Learning Assistant Sidebar */}
        <aside className="xl:col-span-2 space-y-6">
          <Card className="dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                AI Learning Assistant
              </CardTitle>
              <CardDescription className="dark:text-muted-foreground">
                Hello! I'm here to help you learn and understand topics better.
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[300px]">
              {quiz?.topic && (
                <ChatInterface 
                  context={`Quiz: ${quiz.title}, Topic: ${quiz.topic}`}
                  placeholder={`Ask about ${quiz.topic}...`}
                />
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </MainLayout>
  );
}