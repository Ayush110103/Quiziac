'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatInterfaceProps {
  context?: string;
  placeholder?: string;
}

export default function ChatInterface({ context, placeholder = "Ask me anything..." }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Track when component is fully mounted
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 1500); // Wait for parent component's scroll prevention to finish

    return () => clearTimeout(timer);
  }, []);

  
  const scrollToBottom = () => {
    if (!isMounted) return; 
    
   
    if (messagesEndRef.current && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    if (messages.length > 0) { // Only scroll if there are messages
      scrollToBottom();
    }
  }, [messages, isMounted]);

  const sendMessage = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.text,
          context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full max-h-[600px] w-full max-w-md mx-auto">
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 px-4 pt-4 flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5 text-blue-600" />
            AI Learning Assistant
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          {/* Messages Container with Scroll */}
          <div className="max-h-[480px] overflow-y-auto px-4">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
              <div className="space-y-4 py-2">
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-blue-600/50" />
                    <p className="text-sm">Hello! I'm here to help you learn and understand topics better.</p>
                    <p className="text-xs mt-2 text-muted-foreground/80">Ask me anything about the quiz or related topics!</p>
                  </div>
                )}
                
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                        message.sender === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-purple-100 text-purple-600'
                      }`}>
                        {message.sender === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                      </div>
                      <div className={`flex-1 rounded-2xl px-3 py-2 min-w-0 overflow-hidden max-w-[85%] ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-muted text-foreground'
                      }`}>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words" style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                          {message.text}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-2 justify-start">
                    <div className="flex gap-2 max-w-[85%]">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                        <Bot className="h-3 w-3" />
                      </div>
                      <div className="rounded-2xl px-3 py-2 bg-muted">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                
                {isMounted && <div ref={messagesEndRef} />}
              </div>
            </ScrollArea>
          </div>
          
          {/* Input Form - Fixed at bottom */}
          <div className="flex-shrink-0 p-4 border-t bg-background">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholder}
                disabled={isLoading}
                className="flex-1 text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
              />
              <Button 
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 px-3"
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}