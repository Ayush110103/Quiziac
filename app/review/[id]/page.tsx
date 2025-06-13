'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatInterface } from '@/components/chat-interface';
import { ArrowLeft, Brain, MessageCircle, BookOpen, Lightbulb, TrendingUp } from 'lucide-react';
import { Quiz, QuizAttempt, supabase } from '@/lib/supabase';

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
    // Load quiz details
    const { data: quizData } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();

    // Load quiz attempts
    const { data: attemptsData } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('quiz_id', quizId)
      .order('completed_at', { ascending: false });

    if (quizData) setQuiz(quizData);
    if (attemptsData) setAttempts(attemptsData);
  };

  const generateRelatedTopics = () => {
    // Generate some related topics based on the quiz topic
    // In a real app, this could be AI-generated
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p>Loading quiz details...</p>
        </div>
      </div>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = '/history'}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to History
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <div>
                <h1 className="text-lg font-semibold">{quiz.title}</h1>
                <p className="text-xs text-muted-foreground">{quiz.topic}</p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="capitalize">
            {quiz.difficulty}
          </Badge>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{attempts.length}</div>
                    <div className="text-sm text-muted-foreground">Total Attempts</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{averageScore}%</div>
                    <div className="text-sm text-muted-foreground">Average Score</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {bestAttempt ? Math.round((bestAttempt.score / bestAttempt.total_questions) * 100) : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Best Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for different content */}
            <Tabs defaultValue="questions" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="questions">Questions Review</TabsTrigger>
                <TabsTrigger value="topics">Related Topics</TabsTrigger>
                <TabsTrigger value="attempts">Attempt History</TabsTrigger>
              </TabsList>

              <TabsContent value="questions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Question Breakdown</CardTitle>
                    <CardDescription>Review all questions from this quiz</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {quiz.questions.map((question, index) => (
                      <div key={index} className="border-l-4 border-l-blue-200 pl-4 space-y-3">
                        <h4 className="font-medium text-lg">{question.question}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className={`p-3 rounded border ${
                                optionIndex === question.correct_answer
                                  ? 'bg-green-50 border-green-200 text-green-800'
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <span className="font-medium mr-2">
                                {String.fromCharCode(65 + optionIndex)}.
                              </span>
                              {option}
                              {optionIndex === question.correct_answer && (
                                <span className="ml-2 text-green-600">✓ Correct</span>
                              )}
                            </div>
                          ))}
                        </div>
                        {question.explanation && (
                          <div className="bg-blue-50 p-3 rounded border border-blue-200">
                            <p className="text-sm">
                              <Lightbulb className="inline h-4 w-4 mr-1 text-blue-600" />
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
                <Card>
                  <CardHeader>
                    <CardTitle>Related Topics</CardTitle>
                    <CardDescription>Explore topics related to {quiz.topic}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {relatedTopics.map((topic) => (
                        <Button
                          key={topic}
                          variant={selectedTopic === topic ? "default" : "outline"}
                          onClick={() => loadTopicExplanation(topic)}
                          className="text-sm"
                        >
                          {topic}
                        </Button>
                      ))}
                    </div>
                    
                    {selectedTopic && (
                      <Card className="mt-6">
                        <CardHeader>
                          <CardTitle className="text-lg">{selectedTopic}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {loadingExplanation ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Brain className="h-4 w-4 animate-pulse" />
                              Loading explanation...
                            </div>
                          ) : (
                            <div className="prose prose-sm max-w-none">
                              {topicExplanation.split('\n').map((paragraph, index) => (
                                <p key={index} className="mb-3 text-sm leading-relaxed">
                                  {paragraph}
                                </p>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attempts" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Attempt History</CardTitle>
                    <CardDescription>Your performance over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {attempts.length > 0 ? (
                      <div className="space-y-3">
                        {attempts.map((attempt, index) => (
                          <div key={attempt.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-1">
                              <p className="font-medium">Attempt #{attempts.length - index}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(attempt.completed_at).toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right space-y-1">
                              <Badge 
                                variant={attempt.score / attempt.total_questions >= 0.7 ? "default" : "secondary"}
                                className={attempt.score / attempt.total_questions >= 0.7 ? "bg-green-600" : ""}
                              >
                                {Math.round((attempt.score / attempt.total_questions) * 100)}%
                              </Badge>
                              <p className="text-xs text-muted-foreground">
                                {Math.floor(attempt.time_taken / 60)}:{(attempt.time_taken % 60).toString().padStart(2, '0')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No attempts yet for this quiz</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* AI Chat Sidebar */}
          <div className="lg:col-span-1">
            <ChatInterface 
              context={`Quiz: ${quiz.title}, Topic: ${quiz.topic}, Questions: ${quiz.questions.length}`}
              placeholder={`Ask about ${quiz.topic}...`}
            />
          </div>
        </div>
      </main>
    </div>
  );
}