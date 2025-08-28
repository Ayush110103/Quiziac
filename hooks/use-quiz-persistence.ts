import { useState, useEffect } from 'react';
import { Quiz } from '@/lib/neon';

interface QuizState {
  quiz: Quiz;
  currentQuestionIndex: number;
  selectedAnswers: (number | null)[];
  startTime: number;
  isActive: boolean;
}

const QUIZ_STORAGE_KEY = 'quiziac_active_quiz';

export function useQuizPersistence() {
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load quiz state from localStorage on mount
    const savedState = localStorage.getItem(QUIZ_STORAGE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        
        // Validate the parsed state has all required fields
        if (!parsedState.quiz || !parsedState.quiz.id || !parsedState.quiz.questions || 
            !Array.isArray(parsedState.selectedAnswers) || 
            typeof parsedState.currentQuestionIndex !== 'number' ||
            typeof parsedState.startTime !== 'number') {
          throw new Error('Invalid quiz state structure');
        }
        
        // Check if the quiz is still active (within 24 hours)
        const isActive = Date.now() - parsedState.startTime < 24 * 60 * 60 * 1000;
        if (isActive) {
          setQuizState(parsedState);
        } else {
          // Clear expired quiz state
          localStorage.removeItem(QUIZ_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Failed to parse saved quiz state:', error);
        localStorage.removeItem(QUIZ_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const startQuiz = (quiz: Quiz) => {
    // Clear any existing quiz state first
    clearQuiz();
    
    const newState: QuizState = {
      quiz,
      currentQuestionIndex: 0,
      selectedAnswers: new Array(quiz.questions.length).fill(null),
      startTime: Date.now(),
      isActive: true
    };
    setQuizState(newState);
    localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(newState));
  };

  const updateQuizState = (updates: Partial<QuizState>) => {
    if (!quizState) return;
    
    console.log('Updating quiz state:', updates);
    const updatedState = { ...quizState, ...updates };
    setQuizState(updatedState);
    localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(updatedState));
  };

  const clearQuiz = () => {
    console.log('Clearing quiz state');
    setQuizState(null);
    localStorage.removeItem(QUIZ_STORAGE_KEY);
  };

  const initializeQuiz = (quiz: Quiz) => {
    console.log('Initializing quiz:', quiz.id);
    // If we have existing state for a different quiz, clear it first
    if (quizState && quizState.quiz.id !== quiz.id) {
      clearQuiz();
    }
    
    // Only initialize if we don't have state for this quiz
    if (!quizState || quizState.quiz.id !== quiz.id) {
      const newState: QuizState = {
        quiz,
        currentQuestionIndex: 0,
        selectedAnswers: new Array(quiz.questions.length).fill(null),
        startTime: Date.now(),
        isActive: true
      };
      setQuizState(newState);
      localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(newState));
      console.log('Quiz state initialized and saved');
    } else {
      console.log('Quiz state already exists for this quiz');
    }
  };

  const isCurrentQuiz = (quiz: Quiz) => {
    return quizState?.quiz.id === quiz.id;
  };

  // Debug function to manually clear quiz state
  const debugClearQuiz = () => {
    console.log('Debug: Manually clearing quiz state');
    clearQuiz();
  };

  return {
    quizState,
    isLoading,
    startQuiz,
    updateQuizState,
    clearQuiz,
    initializeQuiz,
    isCurrentQuiz,
    debugClearQuiz
  };
} 