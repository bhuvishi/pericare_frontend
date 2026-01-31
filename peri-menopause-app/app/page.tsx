'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Header } from '@/components/header';
import { Navigation } from '@/components/navigation';
import { DailyCheckin } from '@/components/daily-checkin';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBloomStore, calculateCyclePhase } from '@/lib/store';
import { PHASE_INFO, MOOD_OPTIONS } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  Flower2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function HomePage() {
  const [showCheckin, setShowCheckin] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { dailyLogs, cycleData, plants, getTodayLog, getCurrentPlant } = useBloomStore();
  
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

  const todayLog = getTodayLog();
  const currentPlant = getCurrentPlant();
  const { phase, cycleDay } = calculateCyclePhase(cycleData.periodStartDate);
  const phaseInfo = PHASE_INFO[phase];
  
  // Get recent logs for streak
  const today = new Date();
  const recentLogs = dailyLogs.filter(log => {
    const logDate = new Date(log.date);
    const daysDiff = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7;
  });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      <div className="min-h-screen bg-background pb-24">
        <Header subtitle={greeting()} />
        
        <main className="px-4 space-y-6 max-w-lg mx-auto">
          {/* Daily Check-in Card */}
          {!todayLog ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-primary/20">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-serif text-foreground mb-1">
                        {"How are you today?"}
                      </h2>
                      <p className="text-muted-foreground text-sm mb-4">
                        {"Take a moment to check in with yourself."}
                      </p>
                      <Button onClick={() => setShowCheckin(true)} className="w-full gap-2">
                        Start Check-in
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-gradient-to-br from-chart-1/10 to-chart-2/10 border-chart-1/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-chart-1/20">
                      <CheckCircle2 className="w-5 h-5 text-chart-1" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{"Today's check-in complete"}</h3>
                      <p className="text-sm text-muted-foreground">
                        You logged: {MOOD_OPTIONS.find(m => m.value === todayLog.mood)?.label}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-background/50">
                      <p className="text-2xl font-serif text-foreground">{todayLog.movement}%</p>
                      <p className="text-xs text-muted-foreground">Movement</p>
                    </div>
                    <div className="p-3 rounded-xl bg-background/50">
                      <p className="text-2xl font-serif text-foreground">{todayLog.nutrition}%</p>
                      <p className="text-xs text-muted-foreground">Nutrition</p>
                    </div>
                    <div className="p-3 rounded-xl bg-background/50">
                      <p className="text-2xl font-serif text-foreground">{todayLog.sleep}%</p>
                      <p className="text-xs text-muted-foreground">Sleep</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Cycle Phase Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    'p-3 rounded-2xl',
                    phase === 'period' && 'bg-chart-5/20',
                    phase === 'follicular' && 'bg-chart-1/20',
                    phase === 'ovulation' && 'bg-chart-2/20',
                    phase === 'luteal' && 'bg-chart-4/20',
                  )}>
                    <Calendar className={cn(
                      'w-6 h-6',
                      phase === 'period' && 'text-chart-5',
                      phase === 'follicular' && 'text-chart-1',
                      phase === 'ovulation' && 'text-chart-2',
                      phase === 'luteal' && 'text-chart-4',
                    )} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-serif text-foreground">
                        {phaseInfo.name} Phase
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        Day {cycleDay}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {phaseInfo.description}
                    </p>
                    <div className="p-3 rounded-xl bg-secondary/50">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">Energy:</span> {phaseInfo.energyLevel}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Plant Progress Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-chart-1/20">
                      <Flower2 className="w-5 h-5 text-chart-1" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{"This Month's Plant"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {currentPlant?.daysLogged || 0} days logged
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-serif text-primary">
                      {currentPlant?.growthScore || 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">Growth</p>
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${currentPlant?.growthScore || 0}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Weekly Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-chart-2/20">
                    <TrendingUp className="w-5 h-5 text-chart-2" />
                  </div>
                  <h3 className="font-semibold text-foreground">This Week</h3>
                </div>
                <div className="flex justify-between">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (6 - i));
                    const dateStr = date.toISOString().split('T')[0];
                    const log = dailyLogs.find(l => l.date === dateStr);
                    const isToday = i === 6;
                    
                    return (
                      <div key={i} className="flex flex-col items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)}
                        </span>
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
                          log ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground',
                          isToday && !log && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                        )}>
                          {date.getDate()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Luna's Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-secondary to-background border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-accent/20">
                    <span className="text-lg">🌙</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Luna says:</p>
                    <p className="text-sm text-muted-foreground italic">
                      {"\""}Remember, {"you're"} in your {phaseInfo.name.toLowerCase()} phase. 
                      {phase === 'period' && " This is a time for gentle rest and self-compassion."}
                      {phase === 'follicular' && " Your energy is rising - a great time for new projects!"}
                      {phase === 'ovulation' && " You're at your peak! Embrace this vibrant energy."}
                      {phase === 'luteal' && " Slow down and nurture yourself as your body prepares."}
                      {"\""}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>

        <Navigation />
      </div>

      <AnimatePresence>
        {showCheckin && (
          <DailyCheckin
            onComplete={() => setShowCheckin(false)}
            onCancel={() => setShowCheckin(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
