'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Quiz, Question, supabase } from '@/lib/supabase';

interface QuizPlayerProps {
  quiz: Quiz;
  onComplete: (score: number, answers: number[], timeTaken: number) => void;
  onBack: () => void;
}

export function QuizPlayer({ quiz, onComplete, onBack }: QuizPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    new Array(quiz.questions.length).fill(null)
  );
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(Date.now());
  const [timeElapsed, setTimeElapsed] = useState(0);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleFinishQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinishQuiz = async () => {
    const score = selectedAnswers.reduce((total, answer, index) => {
      return answer === quiz.questions[index].correct_answer ? total + 1 : total;
    }, 0);

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    
    // Save attempt to database
    await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id: quiz.id,
        score,
        total_questions: quiz.questions.length,
        answers: selectedAnswers,
        time_taken: timeTaken
      });

    setShowResults(true);
    onComplete(
      score,
      selectedAnswers.map(a => a === null ? -1 : a),
      timeTaken
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showResults) {
    const score = selectedAnswers.reduce((total, answer, index) => {
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
              const userAnswer = selectedAnswers[index];
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
            <Button onClick={onBack} variant="outline" className="flex-1">
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
              {currentQuestionIndex + 1} of {quiz.questions.length}
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
                variant={selectedAnswers[currentQuestionIndex] === index ? "default" : "outline"}
                className={`justify-start text-left h-auto p-4 transition-all ${
                  selectedAnswers[currentQuestionIndex] === index
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
            disabled={currentQuestionIndex === 0}
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={selectedAnswers[currentQuestionIndex] === null}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}