'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Quiz, Question, supabase, QuizAttempt } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useQuizPersistence } from '@/hooks/use-quiz-persistence';

interface QuizPlayerProps {
  quiz: Quiz;
  onComplete: (score: number, answers: number[], timeTaken: number, attemptId: string) => void;
  onBack: () => void;
}

export function QuizPlayer({ quiz, onComplete, onBack }: QuizPlayerProps) {
  const { quizState, updateQuizState, clearQuiz, initializeQuiz, isLoading, isCurrentQuiz } = useQuizPersistence();
  const [showResults, setShowResults] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  // Use persisted state or initialize new state
  const currentQuestionIndex = quizState?.currentQuestionIndex || 0;
  const selectedAnswers = quizState?.selectedAnswers || new Array(quiz.questions.length).fill(null);
  const startTime = quizState?.startTime || Date.now();

  // Validate and fix quiz state if needed
  const validatedQuestionIndex = Math.min(currentQuestionIndex, quiz.questions.length - 1);
  const validatedAnswers = selectedAnswers.length === quiz.questions.length 
    ? selectedAnswers 
    : new Array(quiz.questions.length).fill(null);

  const currentQuestion = quiz.questions[validatedQuestionIndex];
  const progress = ((validatedQuestionIndex + 1) / quiz.questions.length) * 100;

  const router = useRouter();

  // Initialize quiz state only if no existing state and not loading
  useEffect(() => {
    if (!isLoading) {
      if (!quizState && quiz) {
        // No existing state, initialize new quiz
        initializeQuiz(quiz);
      } else if (quizState && !isCurrentQuiz(quiz)) {
        // We have state for a different quiz, initialize current quiz
        initializeQuiz(quiz);
      }
    }
  }, [quiz, quizState, initializeQuiz, isLoading, isCurrentQuiz]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    const loadAttempts = async () => {
      const { data } = await supabase
        .from('quiz_attempts')
        .select('*')
        .order('completed_at', { ascending: false });
      if (data) setAttempts(data);
    };
    loadAttempts();
  }, []);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...validatedAnswers];
    newAnswers[validatedQuestionIndex] = answerIndex;
    updateQuizState({ selectedAnswers: newAnswers });
  };

  const handleNext = () => {
    if (validatedQuestionIndex < quiz.questions.length - 1) {
      updateQuizState({ currentQuestionIndex: validatedQuestionIndex + 1 });
    } else {
      handleFinishQuiz();
    }
  };

  const handlePrevious = () => {
    if (validatedQuestionIndex > 0) {
      updateQuizState({ currentQuestionIndex: validatedQuestionIndex - 1 });
    }
  };

  const handleFinishQuiz = async () => {
    const score = validatedAnswers.reduce<number>((total: number, answer: number | null, index: number) => {
      if (answer === null) return total;
      return answer === quiz.questions[index].correct_answer ? total + 1 : total;
    }, 0);

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id: quiz.id,
        score,
        total_questions: quiz.questions.length,
        answers: validatedAnswers.map(a => a === null ? -1 : a),
        time_taken: timeTaken,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (data && !error) {
      // Clear the persisted quiz state
      clearQuiz();
      // Call onComplete with the attempt data
      onComplete(score, validatedAnswers.map(a => a === null ? -1 : a), timeTaken, data.id);
      router.push(`/review/${data.id}`);
    } else {
      alert('Failed to save attempt!');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show loading state while persistence is initializing or if quiz doesn't match
  if (isLoading || (!quizState && quiz) || (quizState && !isCurrentQuiz(quiz))) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading quiz...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    const score = validatedAnswers.reduce<number>((total: number, answer: number | null, index: number) => {
      if (answer === null) return total;
      return answer === quiz.questions[index].correct_answer ? total + 1 : total;
    }, 0);
    const percentage = Math.round((score / quiz.questions.length) * 100);

    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
          <CardDescription>Here are your results</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold text-blue-600">{percentage}%</div>
            <div className="text-xl text-muted-foreground">
              {score} out of {quiz.questions.length} correct
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Time: {formatTime(timeElapsed)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Question Review</h3>
            {quiz.questions.map((question, index) => {
              const userAnswer = validatedAnswers[index];
              const isCorrect = userAnswer === question.correct_answer;
              
              return (
                <Card key={index} className={`border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                        )}
                        <div className="space-y-2 flex-1">
                          <p className="font-medium">{question.question}</p>
                          <div className="space-y-1">
                            {userAnswer !== null && (
                              <p className={`text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                Your answer: {question.options[userAnswer]}
                              </p>
                            )}
                            {!isCorrect && (
                              <p className="text-sm text-green-600">
                                Correct answer: {question.options[question.correct_answer]}
                              </p>
                            )}
                            {question.explanation && (
                              <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                                💡 {question.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={() => {
              clearQuiz();
              onBack();
            }} variant="outline" className="flex-1">
              Back to Home
            </Button>
            <Button 
              onClick={() => window.location.href = '/history'}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              View History
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{quiz.title}</CardTitle>
            <CardDescription>{quiz.topic}</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(timeElapsed)}
            </Badge>
            <Badge variant="secondary">
              {validatedQuestionIndex + 1} of {quiz.questions.length}
            </Badge>
          </div>
        </div>
        <Progress value={progress} className="mt-4" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold leading-relaxed">
            {currentQuestion.question}
          </h2>
          
          <div className="grid gap-3">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                variant={validatedAnswers[validatedQuestionIndex] === index ? "default" : "outline"}
                className={`justify-start text-left h-auto p-4 transition-all ${
                  validatedAnswers[validatedQuestionIndex] === index
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'hover:bg-blue-50 hover:border-blue-200'
                }`}
                onClick={() => handleAnswerSelect(index)}
              >
                <span className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-current/20 flex items-center justify-center text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </span>
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            onClick={handlePrevious}
            disabled={validatedQuestionIndex === 0}
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={validatedAnswers[validatedQuestionIndex] === null}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {validatedQuestionIndex === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}