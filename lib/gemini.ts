const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';


export interface QuizGenerationParams {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  numQuestions: number;
  questionTypes?: string[];
}

export async function generateQuiz(params: QuizGenerationParams) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const prompt = `Generate a ${params.difficulty} difficulty quiz about "${params.topic}" with exactly ${params.numQuestions} questions.

Requirements:
- Each question should be multiple choice with 4 options
- Include the correct answer index (0-3)
- Add brief explanations for each correct answer
- Questions should be educational and progressively challenging
- Cover different aspects of the topic

Return ONLY a valid JSON object in this exact format:
{
  "title": "Quiz title",
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error Details:', errorData);
      throw new Error(`Gemini API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini API');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
}

export async function generateTopicExplanation(topic: string) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const prompt = `Provide a comprehensive but concise explanation about "${topic}". 
  
  The explanation should:
  - Be educational and engaging
  - Cover key concepts and principles
  - Be suitable for learners
  - Be 2-3 paragraphs long
  - Use clear, accessible language`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating explanation:', error);
    throw error;
  }
}

export async function chatWithAI(message: string, context: string = '') {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const prompt = `${context ? `Context: ${context}\n\n` : ''}User question: ${message}

Please provide a helpful, educational response that:
- Answers the user's question clearly
- Provides additional insights when relevant
- Uses examples when helpful
- Maintains a supportive learning tone`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error in AI chat:', error);
    throw error;
  }
}