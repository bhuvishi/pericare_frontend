'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/header';
import { Navigation } from '@/components/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBloomStore, calculateCyclePhase } from '@/lib/store';
import { PHASE_INFO, type CyclePhase } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  Flower2, 
  ChevronLeft, 
  ChevronRight,
  Droplets,
  Info,
  Utensils,
  Footprints,
  Zap
} from 'lucide-react';

export default function CyclePage() {
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMonth, setViewMonth] = useState(new Date());
  const [showPeriodLog, setShowPeriodLog] = useState(false);
  
  const { cycleData, updateCycleData, dailyLogs } = useBloomStore();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Flower2 className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  const { phase: currentPhase, cycleDay } = calculateCyclePhase(cycleData.periodStartDate);
  const phaseInfo = PHASE_INFO[currentPhase];

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getPhaseForDate = (date: Date): CyclePhase => {
    const periodStart = new Date(cycleData.periodStartDate);
    const daysDiff = Math.floor((date.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
    const dayInCycle = ((daysDiff % 28) + 28) % 28 + 1;
    
    if (dayInCycle <= 5) return 'period';
    if (dayInCycle <= 13) return 'follicular';
    if (dayInCycle <= 16) return 'ovulation';
    return 'luteal';
  };

  const getCycleDayForDate = (date: Date): number => {
    const periodStart = new Date(cycleData.periodStartDate);
    const daysDiff = Math.floor((date.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
    return ((daysDiff % 28) + 28) % 28 + 1;
  };

  const getPhaseColor = (phase: CyclePhase) => {
    switch (phase) {
      case 'period': return 'bg-chart-5/30 text-chart-5';
      case 'follicular': return 'bg-chart-1/30 text-chart-1';
      case 'ovulation': return 'bg-chart-2/30 text-chart-2';
      case 'luteal': return 'bg-chart-4/30 text-chart-4';
    }
  };

  const getPhaseRingColor = (phase: CyclePhase) => {
    switch (phase) {
      case 'period': return 'ring-chart-5';
      case 'follicular': return 'ring-chart-1';
      case 'ovulation': return 'ring-chart-2';
      case 'luteal': return 'ring-chart-4';
    }
  };

  const handlePreviousMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
  };

  const handleLogPeriod = () => {
    const today = new Date().toISOString().split('T')[0];
    updateCycleData({ periodStartDate: today });
    setShowPeriodLog(false);
  };

  // Build calendar days
  const daysInMonth = getDaysInMonth(viewMonth);
  const firstDay = getFirstDayOfMonth(viewMonth);
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const calendarDays = [];
  
  // Empty cells for days before the first of the month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
    calendarDays.push(date);
  }

  const selectedPhase = getPhaseForDate(selectedDate);
  const selectedPhaseInfo = PHASE_INFO[selectedPhase];
  const selectedCycleDay = getCycleDayForDate(selectedDate);

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Cycle Tracker" subtitle="Understanding your rhythm" />
      
      <main className="px-4 space-y-6 max-w-lg mx-auto">
        {/* Current Phase Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className={cn(
            'border-2',
            currentPhase === 'period' && 'border-chart-5/30 bg-chart-5/5',
            currentPhase === 'follicular' && 'border-chart-1/30 bg-chart-1/5',
            currentPhase === 'ovulation' && 'border-chart-2/30 bg-chart-2/5',
            currentPhase === 'luteal' && 'border-chart-4/30 bg-chart-4/5',
          )}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Today - Day {cycleDay}</p>
                  <h2 className="text-2xl font-serif text-foreground">
                    {phaseInfo.name} Phase
                  </h2>
                </div>
                <div className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center',
                  getPhaseColor(currentPhase)
                )}>
                  <span className="text-2xl font-serif">{cycleDay}</span>
                </div>
              </div>
              <p className="text-muted-foreground">{phaseInfo.description}</p>
              
              <Button 
                variant="outline" 
                className="w-full mt-4 bg-transparent"
                onClick={() => setShowPeriodLog(true)}
              >
                <Droplets className="w-4 h-4 mr-2" />
                Log Period Start
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Period Log Modal */}
        {showPeriodLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowPeriodLog(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="w-full max-w-sm">
                <CardContent className="p-6">
                  <h3 className="text-xl font-serif text-foreground mb-2">Log Period Start</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {"Did your period start today? This will update your cycle tracking."}
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowPeriodLog(false)}>
                      Cancel
                    </Button>
                    <Button className="flex-1" onClick={handleLogPeriod}>
                      Yes, Log Today
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <h3 className="font-serif text-lg text-foreground">
                  {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-center text-xs text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, i) => {
                  if (!date) {
                    return <div key={`empty-${i}`} className="aspect-square" />;
                  }

                  const dateStr = date.toISOString().split('T')[0];
                  const phase = getPhaseForDate(date);
                  const isToday = dateStr === todayStr;
                  const isSelected = date.toDateString() === selectedDate.toDateString();
                  const hasLog = dailyLogs.some(l => l.date === dateStr);
                  const isFuture = date > today;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => !isFuture && setSelectedDate(date)}
                      disabled={isFuture}
                      className={cn(
                        'aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all relative',
                        !isFuture && getPhaseColor(phase),
                        isFuture && 'opacity-40',
                        isSelected && 'ring-2 ring-offset-2 ring-offset-background',
                        isSelected && getPhaseRingColor(phase),
                        isToday && 'font-bold'
                      )}
                    >
                      {date.getDate()}
                      {hasLog && (
                        <div className="absolute bottom-1 w-1 h-1 rounded-full bg-foreground/50" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Phase Legend */}
              <div className="flex flex-wrap justify-center gap-3 mt-4 pt-4 border-t border-border">
                {(['period', 'follicular', 'ovulation', 'luteal'] as CyclePhase[]).map((phase) => (
                  <div key={phase} className="flex items-center gap-1.5">
                    <div className={cn('w-3 h-3 rounded-full', getPhaseColor(phase))} />
                    <span className="text-xs text-muted-foreground">
                      {PHASE_INFO[phase].name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Selected Day Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  'p-2 rounded-xl',
                  selectedPhase === 'period' && 'bg-chart-5/20',
                  selectedPhase === 'follicular' && 'bg-chart-1/20',
                  selectedPhase === 'ovulation' && 'bg-chart-2/20',
                  selectedPhase === 'luteal' && 'bg-chart-4/20',
                )}>
                  <Info className={cn(
                    'w-5 h-5',
                    selectedPhase === 'period' && 'text-chart-5',
                    selectedPhase === 'follicular' && 'text-chart-1',
                    selectedPhase === 'ovulation' && 'text-chart-2',
                    selectedPhase === 'luteal' && 'text-chart-4',
                  )} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedPhaseInfo.name} Phase - Day {selectedCycleDay}
                  </p>
                </div>
              </div>

              {/* Hormone Info */}
              <div className="p-3 rounded-xl bg-secondary/50 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-chart-4" />
                  <span className="text-sm font-medium text-foreground">Hormones</span>
                </div>
                <p className="text-sm text-muted-foreground">{selectedPhaseInfo.hormoneInfo}</p>
              </div>

              {/* Energy Level */}
              <div className="p-3 rounded-xl bg-secondary/50 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-chart-2" />
                  <span className="text-sm font-medium text-foreground">Energy</span>
                </div>
                <p className="text-sm text-muted-foreground">{selectedPhaseInfo.energyLevel}</p>
              </div>

              {/* Nutrition Tips */}
              <div className="p-3 rounded-xl bg-secondary/50 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Utensils className="w-4 h-4 text-chart-1" />
                  <span className="text-sm font-medium text-foreground">Nutrition Tips</span>
                </div>
                <ul className="space-y-1">
                  {selectedPhaseInfo.nutritionTips.map((tip, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">{"•"}</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Movement Tips */}
              <div className="p-3 rounded-xl bg-secondary/50">
                <div className="flex items-center gap-2 mb-2">
                  <Footprints className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-foreground">Movement Ideas</span>
                </div>
                <ul className="space-y-1">
                  {selectedPhaseInfo.movementTips.map((tip, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">{"•"}</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Navigation />
    </div>
  );
}
