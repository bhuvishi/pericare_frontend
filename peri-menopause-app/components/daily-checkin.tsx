'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useBloomStore } from '@/lib/store';
import { 
  MOOD_OPTIONS, 
  SYMPTOM_OPTIONS, 
  KEYWORD_OPTIONS,
  type Mood 
} from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check, ChevronLeft, ChevronRight, Sparkles, Moon, Utensils, Footprints, Thermometer, Tag } from 'lucide-react';

const STEPS = [
  { id: 'mood', title: 'How are you feeling?', icon: Sparkles },
  { id: 'sleep', title: 'How was your sleep?', icon: Moon },
  { id: 'movement', title: 'Movement towards your goals', icon: Footprints },
  { id: 'nutrition', title: 'Nutrition today', icon: Utensils },
  { id: 'symptoms', title: 'Any symptoms today?', icon: Thermometer },
  { id: 'keywords', title: 'Words to describe your day', icon: Tag },
];

interface CheckinData {
  mood: Mood | null;
  energy: number;
  sleep: number;
  movement: number;
  nutrition: number;
  symptoms: string[];
  keywords: string[];
}

interface DailyCheckinProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function DailyCheckin({ onComplete, onCancel }: DailyCheckinProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<CheckinData>({
    mood: null,
    energy: 3,
    sleep: 50,
    movement: 50,
    nutrition: 50,
    symptoms: [],
    keywords: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addDailyLog = useBloomStore((state) => state.addDailyLog);
  const currentStep = STEPS[step];

  const canProceed = () => {
    if (step === 0) return data.mood !== null;
    return true;
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      onCancel();
    }
  };

  const handleSubmit = async () => {
    if (!data.mood) return;
    
    setIsSubmitting(true);
    
    // Simulate a slight delay for feedback
    await new Promise(resolve => setTimeout(resolve, 500));
    
    addDailyLog({
      date: new Date().toISOString().split('T')[0],
      mood: data.mood,
      energy: data.mood === 'radiant' ? 5 : data.mood === 'good' ? 4 : data.mood === 'okay' ? 3 : data.mood === 'low' ? 2 : 1,
      sleep: data.sleep,
      movement: data.movement,
      nutrition: data.nutrition,
      symptoms: data.symptoms,
      keywords: data.keywords,
    });

    onComplete();
  };

  const toggleSymptom = (symptom: string) => {
    setData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom],
    }));
  };

  const toggleKeyword = (keyword: string) => {
    setData(prev => ({
      ...prev,
      keywords: prev.keywords.includes(keyword)
        ? prev.keywords.filter(k => k !== keyword)
        : prev.keywords.length < 3 
          ? [...prev.keywords, keyword]
          : prev.keywords,
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background"
    >
      <div className="min-h-screen flex flex-col max-w-lg mx-auto px-4 py-6">
        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                'h-1.5 rounded-full flex-1 transition-colors duration-300',
                idx <= step ? 'bg-primary' : 'bg-border'
              )}
            />
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-primary/10">
                <currentStep.icon className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-serif text-foreground">
                {currentStep.title}
              </h2>
            </div>

            {/* Mood selection */}
            {step === 0 && (
              <div className="grid grid-cols-1 gap-3">
                {MOOD_OPTIONS.map((option) => (
                  <Card
                    key={option.value}
                    className={cn(
                      'cursor-pointer transition-all border-2',
                      data.mood === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent hover:border-border'
                    )}
                    onClick={() => setData(prev => ({ ...prev, mood: option.value }))}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center',
                        option.value === 'radiant' && 'bg-chart-1/20',
                        option.value === 'good' && 'bg-chart-2/20',
                        option.value === 'okay' && 'bg-chart-4/20',
                        option.value === 'low' && 'bg-chart-3/20',
                        option.value === 'struggling' && 'bg-chart-5/20',
                      )}>
                        <span className="text-2xl">
                          {option.value === 'radiant' && '✨'}
                          {option.value === 'good' && '😊'}
                          {option.value === 'okay' && '😐'}
                          {option.value === 'low' && '😔'}
                          {option.value === 'struggling' && '💙'}
                        </span>
                      </div>
                      <span className="text-lg font-medium text-foreground">
                        {option.label}
                      </span>
                      {data.mood === option.value && (
                        <Check className="w-5 h-5 text-primary ml-auto" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Sleep slider */}
            {step === 1 && (
              <div className="space-y-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between mb-4">
                      <span className="text-muted-foreground">Restless</span>
                      <span className="text-2xl font-serif text-foreground">{data.sleep}%</span>
                      <span className="text-muted-foreground">Restful</span>
                    </div>
                    <Slider
                      value={[data.sleep]}
                      onValueChange={([value]) => setData(prev => ({ ...prev, sleep: value }))}
                      max={100}
                      step={5}
                      className="py-4"
                    />
                  </CardContent>
                </Card>
                <p className="text-center text-muted-foreground">
                  {"Sleep quality affects everything. It's okay if it wasn't perfect."}
                </p>
              </div>
            )}

            {/* Movement slider */}
            {step === 2 && (
              <div className="space-y-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between mb-4">
                      <span className="text-muted-foreground">Rest day</span>
                      <span className="text-2xl font-serif text-foreground">{data.movement}%</span>
                      <span className="text-muted-foreground">Very active</span>
                    </div>
                    <Slider
                      value={[data.movement]}
                      onValueChange={([value]) => setData(prev => ({ ...prev, movement: value }))}
                      max={100}
                      step={5}
                      className="py-4"
                    />
                  </CardContent>
                </Card>
                <p className="text-center text-muted-foreground">
                  Any movement counts. Even gentle stretching matters.
                </p>
              </div>
            )}

            {/* Nutrition slider */}
            {step === 3 && (
              <div className="space-y-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between mb-4">
                      <span className="text-muted-foreground">Off track</span>
                      <span className="text-2xl font-serif text-foreground">{data.nutrition}%</span>
                      <span className="text-muted-foreground">Nourished</span>
                    </div>
                    <Slider
                      value={[data.nutrition]}
                      onValueChange={([value]) => setData(prev => ({ ...prev, nutrition: value }))}
                      max={100}
                      step={5}
                      className="py-4"
                    />
                  </CardContent>
                </Card>
                <p className="text-center text-muted-foreground">
                  {"Nourishment, not perfection. How did you fuel your body today?"}
                </p>
              </div>
            )}

            {/* Symptoms selection */}
            {step === 4 && (
              <div className="space-y-4">
                <p className="text-muted-foreground mb-4">
                  Select any that apply, or skip if none.
                </p>
                <div className="flex flex-wrap gap-2">
                  {SYMPTOM_OPTIONS.map((symptom) => (
                    <Button
                      key={symptom}
                      variant={data.symptoms.includes(symptom) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleSymptom(symptom)}
                      className="rounded-full"
                    >
                      {symptom}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords selection */}
            {step === 5 && (
              <div className="space-y-4">
                <p className="text-muted-foreground mb-4">
                  Choose up to 3 words that capture today.
                </p>
                <div className="flex flex-wrap gap-2">
                  {KEYWORD_OPTIONS.map((keyword) => (
                    <Button
                      key={keyword}
                      variant={data.keywords.includes(keyword) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleKeyword(keyword)}
                      className="rounded-full"
                      disabled={!data.keywords.includes(keyword) && data.keywords.length >= 3}
                    >
                      {keyword}
                    </Button>
                  ))}
                </div>
                {data.keywords.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-4">
                    Selected: {data.keywords.join(', ')}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className="gap-2"
          >
            {step === STEPS.length - 1 ? (
              isSubmitting ? 'Saving...' : 'Complete'
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
