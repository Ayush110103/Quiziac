'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Loader2, Sparkles, Brain } from 'lucide-react';
import { Quiz } from '@/lib/supabase';
import { generate_quiz } from '@/action/generation_quiz';

interface QuizCreatorProps {
  onQuizCreated: (quiz: Quiz) => void;
}

export function QuizCreator({ onQuizCreated }: QuizCreatorProps) {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [numQuestions, setNumQuestions] = useState([5]);
  const [isGenerating, setIsGenerating] = useState(false);
  const handleSetDifficulty = (value: string) => {
    setDifficulty(value as 'easy' | 'medium' | 'hard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    try {
      const response  = await generate_quiz({
        topic,
        difficulty,
        numQuestions: numQuestions[0]
      });

      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }

      const data = await response.json();
      onQuizCreated(data.quiz);
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const suggestedTopics = [
    'JavaScript Fundamentals',
    'React Hooks',
    'Machine Learning Basics',
    'Climate Change',
    'World History',
    'Mathematics',
    'Science',
    'Literature'
  ];

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="h-8 w-8 text-blue-600" />
          <Sparkles className="h-6 w-6 text-purple-600" />
        </div>
        <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Create AI-Powered Quiz
        </CardTitle>
        <CardDescription>
          Generate personalized quizzes on any topic using artificial intelligence
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="topic" className="text-sm font-medium">
              Quiz Topic
            </Label>
            <Input
              id="topic"
              placeholder="Enter any topic (e.g., JavaScript, History, Science...)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="text-base"
              disabled={isGenerating}
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {suggestedTopics.map((suggestedTopic) => (
                <Button
                  key={suggestedTopic}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTopic(suggestedTopic)}
                  className="text-xs hover:bg-blue-50 hover:border-blue-200"
                  disabled={isGenerating}
                >
                  {suggestedTopic}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Difficulty Level</Label>
              <Select value={difficulty} onValueChange={handleSetDifficulty} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy - Basic concepts</SelectItem>
                  <SelectItem value="medium">Medium - Intermediate level</SelectItem>
                  <SelectItem value="hard">Hard - Advanced topics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Number of Questions: {numQuestions[0]}
              </Label>
              <Slider
                value={numQuestions}
                onValueChange={setNumQuestions}
                max={15}
                min={3}
                step={1}
                className="py-4"
                disabled={isGenerating}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>3 questions</span>
                <span>15 questions</span>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!topic.trim() || isGenerating}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-base font-medium"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Quiz
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}