'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/header';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useBloomStore, calculateCyclePhase } from '@/lib/store';
import { cn } from '@/lib/utils';
import { 
  Flower2, 
  Send, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  "Why might my energy be low this week?",
  "What helps with hot flashes?",
  "Tell me about my current cycle phase",
  "How can I sleep better during perimenopause?",
  "What patterns do you see in my data?",
];

export default function ChatPage() {
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { dailyLogs, cycleData, monthlyReports } = useBloomStore();
  
  // Prepare user context for the API
  const userData = useMemo(() => {
    const { phase, cycleDay } = calculateCyclePhase(cycleData.periodStartDate);
    
    // Get recent logs
    const recentLogs = dailyLogs
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 14)
      .map(l => ({
        date: l.date,
        mood: l.mood,
        energy: l.energy,
        movement: l.movement,
        nutrition: l.nutrition,
        sleep: l.sleep,
        symptoms: l.symptoms,
      }));
    
    // Calculate top symptoms
    const symptomCounts: Record<string, number> = {};
    dailyLogs.forEach(l => {
      l.symptoms.forEach(s => {
        symptomCounts[s] = (symptomCounts[s] || 0) + 1;
      });
    });
    const topSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([s]) => s);
    
    return {
      cyclePhase: phase,
      cycleDay,
      recentLogs,
      topSymptoms,
    };
  }, [dailyLogs, cycleData]);
  
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ 
      api: '/api/chat',
      prepareSendMessagesRequest: ({ id, messages }) => ({
        body: {
          messages,
          id,
          userData,
        },
      }),
    }),
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Flower2 className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  const handleSend = (text: string) => {
    if (!text.trim() || isLoading) return;
    sendMessage({ text });
    setInput('');
  };

  const handleReset = () => {
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header title="Luna" subtitle="Your wellness companion" />
      
      <main className="flex-1 px-4 pb-40 max-w-lg mx-auto w-full overflow-y-auto">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pt-4"
          >
            {/* Welcome Card */}
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🌙</span>
                </div>
                <h2 className="text-xl font-serif text-foreground mb-2">
                  Hi, {"I'm"} Luna
                </h2>
                <p className="text-muted-foreground text-sm">
                  {"I'm"} here to support you through your perimenopause journey. 
                  Ask me anything about your symptoms, patterns, or just chat 
                  when you need someone who understands.
                </p>
              </CardContent>
            </Card>

            {/* Suggested Questions */}
            <div>
              <p className="text-sm text-muted-foreground mb-3">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((question) => (
                  <Button
                    key={question}
                    variant="outline"
                    size="sm"
                    className="text-left h-auto py-2 px-3 bg-transparent"
                    onClick={() => handleSend(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4 pt-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-3',
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-br-md' 
                      : 'bg-card border border-border rounded-bl-md'
                  )}>
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">🌙</span>
                        <span className="text-xs font-medium text-muted-foreground">Luna</span>
                      </div>
                    )}
                    <div className="text-sm whitespace-pre-wrap">
                      {message.parts.map((part, index) => {
                        if (part.type === 'text') {
                          return <span key={index}>{part.text}</span>;
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🌙</span>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      <div className="fixed bottom-16 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-6 pb-4 px-4">
        <div className="max-w-lg mx-auto">
          {messages.length > 0 && (
            <div className="flex justify-center mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-muted-foreground"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                New conversation
              </Button>
            </div>
          )}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex gap-2"
          >
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Luna anything..."
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground disabled:opacity-50"
              />
            </div>
            <Button 
              type="submit" 
              size="icon"
              disabled={!input.trim() || isLoading}
              className="h-12 w-12 rounded-xl"
            >
              {isLoading ? (
                <Sparkles className="w-5 h-5 animate-pulse" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>
        </div>
      </div>

      <Navigation />
    </div>
  );
}
