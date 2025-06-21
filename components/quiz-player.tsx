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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use persisted state or initialize new state
  const currentQuestionIndex = quizState?.currentQuestionIndex || 0;
  const selectedAnswers = quizState?.selectedAnswers || new Array(quiz.questions.length).fill(null);
  const startTime = quizState?.startTime || Date.now();

  // Validate and fix quiz state if needed
  const validatedQuestionIndex = Math.min(currentQuestionIndex, quiz.questions.length - 1);
  let validatedAnswers: (number | null)[];
  
  if (selectedAnswers.length === quiz.questions.length) {
    validatedAnswers = selectedAnswers;
    console.log('Answers array lengths match, using selectedAnswers as-is');
  } else {
    // If lengths don't match, create a new array with the correct length
    // and preserve any existing answers, filling the rest with null
    console.log('Answers array length mismatch:', {
      selectedAnswersLength: selectedAnswers.length,
      quizQuestionsLength: quiz.questions.length,
      selectedAnswers: selectedAnswers
    });
    
    validatedAnswers = new Array(quiz.questions.length).fill(null);
    for (let i = 0; i < Math.min(selectedAnswers.length, quiz.questions.length); i++) {
      validatedAnswers[i] = selectedAnswers[i];
    }
    
    console.log('Created validated answers:', validatedAnswers);
  }

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
      const newTimeElapsed = Math.floor((Date.now() - startTime) / 1000);
      setTimeElapsed(newTimeElapsed);
      
      // Auto-finish quiz after time limit (2 minutes per question)
      const timeLimit = quiz.questions.length * 2 * 60; // Convert to seconds
      if (newTimeElapsed >= timeLimit && !showResults && !isSubmitting) {
        console.log('Time limit reached, auto-finishing quiz');
        handleFinishQuiz();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, quiz.questions.length, showResults, isSubmitting, quizState]);

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
    console.log('Answer selected:', {
      questionIndex: validatedQuestionIndex,
      answerIndex,
      currentAnswers: validatedAnswers
    });
    
    const newAnswers = [...validatedAnswers];
    newAnswers[validatedQuestionIndex] = answerIndex;
    
    console.log('Updated answers array:', newAnswers);
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
    if (isSubmitting) return; // Prevent multiple submissions
    
    setIsSubmitting(true);
    
    console.log('=== QUIZ FINISH DEBUG ===');
    console.log('Original validatedAnswers:', validatedAnswers);
    console.log('Quiz questions length:', quiz.questions.length);
    console.log('Current question index:', validatedQuestionIndex);
    
    // Mark unattempted questions as incorrect (-1)
    const finalAnswers = validatedAnswers.map(answer => answer === null ? -1 : answer);
    
    console.log('Final answers after mapping:', finalAnswers);
    console.log('Answer details:', finalAnswers.map((answer, index) => ({
      questionIndex: index,
      userAnswer: answer,
      correctAnswer: quiz.questions[index].correct_answer,
      isCorrect: answer === quiz.questions[index].correct_answer,
      isUnattempted: answer === -1,
      questionText: quiz.questions[index].question.substring(0, 50) + '...'
    })));
    
    const score = finalAnswers.reduce<number>((total: number, answer: number, index: number) => {
      if (answer === -1) return total; // Unattempted questions are marked as incorrect
      return answer === quiz.questions[index].correct_answer ? total + 1 : total;
    }, 0);

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const timeLimit = quiz.questions.length * 2 * 60;
    const isTimeUp = timeTaken >= timeLimit;
    const percentage = Math.round((score / quiz.questions.length) * 100);
    
    console.log('Finishing quiz:', { 
      score, 
      totalQuestions: quiz.questions.length, 
      percentage, 
      timeTaken, 
      isTimeUp, 
      finalAnswers,
      correctAnswers: finalAnswers.filter((answer, index) => answer === quiz.questions[index].correct_answer).length,
      incorrectAnswers: finalAnswers.filter((answer, index) => answer !== -1 && answer !== quiz.questions[index].correct_answer).length,
      unattemptedAnswers: finalAnswers.filter(answer => answer === -1).length
    });
    console.log('=== END QUIZ FINISH DEBUG ===');
    
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id: quiz.id,
        score,
        total_questions: quiz.questions.length,
        answers: finalAnswers,
        time_taken: timeTaken,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (data && !error) {
      console.log('Quiz attempt saved successfully:', data);
      // Clear the persisted quiz state
      clearQuiz();
      // Call onComplete with the attempt data
      onComplete(score, finalAnswers, timeTaken, data.id);
      router.push(`/review/${data.id}`);
    } else {
      console.error('Failed to save attempt:', error);
      alert('Failed to save attempt!');
      setIsSubmitting(false);
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
    const finalAnswers = validatedAnswers.map(answer => answer === null ? -1 : answer);
    const score = finalAnswers.reduce<number>((total: number, answer: number, index: number) => {
      if (answer === -1) return total; // Unattempted questions are marked as incorrect
      return answer === quiz.questions[index].correct_answer ? total + 1 : total;
    }, 0);
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const timeLimit = quiz.questions.length * 2 * 60;
    const isTimeUp = timeElapsed >= timeLimit;

    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {isTimeUp ? 'Time\'s Up! Quiz Complete!' : 'Quiz Complete!'}
          </CardTitle>
          <CardDescription>
            {isTimeUp ? 'Time limit reached. Unattempted questions marked as incorrect.' : 'Here are your results'}
          </CardDescription>
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
              <div className="flex items-center gap-1">
                <span>Time Limit: {formatTime(timeLimit)}</span>
              </div>
            </div>
            {isTimeUp && (
              <div className="text-sm text-orange-600 bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                ⏰ Quiz was automatically completed due to time limit
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Question Review</h3>
            {quiz.questions.map((question, index) => {
              const userAnswer = finalAnswers[index];
              const isCorrect = userAnswer === question.correct_answer;
              const isUnattempted = userAnswer === -1;
              
              return (
                <Card key={index} className={`border-l-4 ${
                  isCorrect ? 'border-l-green-500' : 
                  isUnattempted ? 'border-l-orange-500' : 'border-l-red-500'
                }`}>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                        ) : isUnattempted ? (
                          <Clock className="h-5 w-5 text-orange-500 mt-1 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                        )}
                        <div className="space-y-2 flex-1">
                          <p className="font-medium">{question.question}</p>
                          <div className="space-y-1">
                            {isUnattempted ? (
                              <p className="text-sm text-orange-600">
                                ⏰ No answer selected (marked as incorrect due to time limit)
                              </p>
                            ) : (
                              <p className={`text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                Your answer: {question.options[userAnswer]}
                              </p>
                            )}
                            {(!isCorrect || isUnattempted) && (
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
        
        {/* Time limit indicator */}
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Time Limit: {formatTime(quiz.questions.length * 2 * 60)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Remaining: {formatTime(Math.max(0, (quiz.questions.length * 2 * 60) - timeElapsed))}</span>
          </div>
        </div>
        
        {/* Time progress bar */}
        <div className="mt-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Time Progress</span>
            <span>{Math.round((timeElapsed / (quiz.questions.length * 2 * 60)) * 100)}%</span>
          </div>
          <Progress 
            value={(timeElapsed / (quiz.questions.length * 2 * 60)) * 100} 
            className={`h-2 ${
              timeElapsed >= (quiz.questions.length * 2 * 60) * 0.8 
                ? 'bg-red-100 dark:bg-red-900/20' 
                : 'bg-blue-100 dark:bg-blue-900/20'
            }`}
          />
        </div>
        
        {/* Time warning */}
        {timeElapsed >= (quiz.questions.length * 2 * 60) * 0.8 && (
          <div className={`mt-2 text-sm p-2 rounded ${
            timeElapsed >= (quiz.questions.length * 2 * 60) * 0.95 
              ? 'text-red-600 bg-red-50 dark:bg-red-900/20 animate-pulse' 
              : 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
          }`}>
            ⏰ {timeElapsed >= (quiz.questions.length * 2 * 60) * 0.95 
              ? 'Final warning: Quiz will auto-complete in less than 30 seconds!' 
              : 'Warning: Time is running out! Complete your quiz soon.'}
          </div>
        )}
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
                disabled={isSubmitting}
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
            disabled={validatedQuestionIndex === 0 || isSubmitting}
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={validatedAnswers[validatedQuestionIndex] === null || isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                {validatedQuestionIndex === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}