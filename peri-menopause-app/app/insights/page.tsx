'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/header';
import { Navigation } from '@/components/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { useBloomStore } from '@/lib/store';
import { MOOD_OPTIONS } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  Flower2, 
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Moon,
  Footprints,
  Utensils,
  Thermometer,
  Calendar,
  BarChart3
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

export default function InsightsPage() {
  const [mounted, setMounted] = useState(false);
  const { dailyLogs, monthlyReports, plants } = useBloomStore();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate insights from logs
  const insights = useMemo(() => {
    if (dailyLogs.length === 0) return null;

    const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const lastMonth = `${new Date().getFullYear()}-${String(new Date().getMonth()).padStart(2, '0')}`;
    
    const currentMonthLogs = dailyLogs.filter(l => l.date.startsWith(currentMonth));
    const lastMonthLogs = dailyLogs.filter(l => l.date.startsWith(lastMonth));
    
    // Average calculations
    const avgEnergy = currentMonthLogs.length > 0 
      ? currentMonthLogs.reduce((sum, l) => sum + l.energy, 0) / currentMonthLogs.length 
      : 0;
    const avgMovement = currentMonthLogs.length > 0
      ? currentMonthLogs.reduce((sum, l) => sum + l.movement, 0) / currentMonthLogs.length
      : 0;
    const avgNutrition = currentMonthLogs.length > 0
      ? currentMonthLogs.reduce((sum, l) => sum + l.nutrition, 0) / currentMonthLogs.length
      : 0;
    const avgSleep = currentMonthLogs.length > 0
      ? currentMonthLogs.reduce((sum, l) => sum + l.sleep, 0) / currentMonthLogs.length
      : 0;

    // Last month averages for comparison
    const lastAvgEnergy = lastMonthLogs.length > 0
      ? lastMonthLogs.reduce((sum, l) => sum + l.energy, 0) / lastMonthLogs.length
      : avgEnergy;

    // Mood distribution
    const moodCounts: Record<string, number> = {};
    currentMonthLogs.forEach(l => {
      moodCounts[l.mood] = (moodCounts[l.mood] || 0) + 1;
    });

    // Symptom frequency
    const symptomCounts: Record<string, number> = {};
    currentMonthLogs.forEach(l => {
      l.symptoms.forEach(s => {
        symptomCounts[s] = (symptomCounts[s] || 0) + 1;
      });
    });
    const topSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Weekly energy trend
    const last14Days = dailyLogs
      .filter(l => {
        const logDate = new Date(l.date);
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 14;
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    // Energy trend (comparing last week to previous week)
    const energyTrend = avgEnergy > lastAvgEnergy ? 'improving' : avgEnergy < lastAvgEnergy ? 'declining' : 'stable';

    return {
      avgEnergy: Math.round(avgEnergy * 10) / 10,
      avgMovement: Math.round(avgMovement),
      avgNutrition: Math.round(avgNutrition),
      avgSleep: Math.round(avgSleep),
      energyTrend,
      moodCounts,
      topSymptoms,
      consistencyRate: Math.round((currentMonthLogs.length / new Date().getDate()) * 100),
      daysLogged: currentMonthLogs.length,
      last14Days,
    };
  }, [dailyLogs]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Flower2 className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  if (!insights || dailyLogs.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <Header title="Insights" subtitle="Your patterns and progress" />
        <main className="px-4 max-w-lg mx-auto">
          <Card className="mt-8">
            <CardContent className="p-8 text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-serif text-foreground mb-2">No Data Yet</h3>
              <p className="text-muted-foreground">
                Start logging your daily check-ins to see your patterns and insights here.
              </p>
            </CardContent>
          </Card>
        </main>
        <Navigation />
      </div>
    );
  }

  // Chart data
  const energyChartData = insights.last14Days.map(l => ({
    date: new Date(l.date).getDate().toString(),
    energy: l.energy,
    movement: l.movement / 20,
  }));

  const moodChartData = MOOD_OPTIONS.map(mood => ({
    name: mood.label,
    value: insights.moodCounts[mood.value] || 0,
    color: mood.value === 'radiant' ? 'var(--chart-1)' 
         : mood.value === 'good' ? 'var(--chart-2)'
         : mood.value === 'okay' ? 'var(--chart-4)'
         : mood.value === 'low' ? 'var(--chart-3)'
         : 'var(--chart-5)',
  })).filter(d => d.value > 0);

  const statsData = [
    { name: 'Movement', value: insights.avgMovement, color: 'var(--chart-1)' },
    { name: 'Nutrition', value: insights.avgNutrition, color: 'var(--chart-2)' },
    { name: 'Sleep', value: insights.avgSleep, color: 'var(--chart-4)' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Insights" subtitle="Your patterns and progress" />
      
      <main className="px-4 space-y-6 max-w-lg mx-auto">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Days Logged</span>
              </div>
              <p className="text-3xl font-serif text-foreground">{insights.daysLogged}</p>
              <p className="text-xs text-muted-foreground">{insights.consistencyRate}% consistency</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-chart-2" />
                <span className="text-sm text-muted-foreground">Avg Energy</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-serif text-foreground">{insights.avgEnergy}</p>
                <span className="text-sm text-muted-foreground">/5</span>
                {insights.energyTrend === 'improving' && <TrendingUp className="w-4 h-4 text-chart-1" />}
                {insights.energyTrend === 'declining' && <TrendingDown className="w-4 h-4 text-chart-5" />}
                {insights.energyTrend === 'stable' && <Minus className="w-4 h-4 text-muted-foreground" />}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Energy & Movement Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <h3 className="font-serif text-lg text-foreground mb-4">14-Day Trend</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={energyChartData}>
                    <defs>
                      <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                    />
                    <YAxis 
                      hide 
                      domain={[0, 5]}
                    />
                    <Area
                      type="monotone"
                      dataKey="energy"
                      stroke="var(--chart-1)"
                      strokeWidth={2}
                      fill="url(#energyGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-chart-1" />
                  <span className="text-xs text-muted-foreground">Energy Level</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Average Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <h3 className="font-serif text-lg text-foreground mb-4">Monthly Averages</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Footprints className="w-4 h-4 text-chart-1" />
                      <span className="text-sm text-foreground">Movement</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{insights.avgMovement}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-chart-1"
                      initial={{ width: 0 }}
                      animate={{ width: `${insights.avgMovement}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-chart-2" />
                      <span className="text-sm text-foreground">Nutrition</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{insights.avgNutrition}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-chart-2"
                      initial={{ width: 0 }}
                      animate={{ width: `${insights.avgNutrition}%` }}
                      transition={{ duration: 1, delay: 0.4 }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-chart-4" />
                      <span className="text-sm text-foreground">Sleep</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{insights.avgSleep}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-chart-4"
                      initial={{ width: 0 }}
                      animate={{ width: `${insights.avgSleep}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mood Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <h3 className="font-serif text-lg text-foreground mb-4">Mood Distribution</h3>
              <div className="flex items-center gap-4">
                <div className="w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={moodChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {moodChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {moodChartData.map((mood) => (
                    <div key={mood.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: mood.color }}
                        />
                        <span className="text-sm text-foreground">{mood.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{mood.value} days</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Symptoms */}
        {insights.topSymptoms.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Thermometer className="w-4 h-4 text-chart-5" />
                  <h3 className="font-serif text-lg text-foreground">Common Symptoms</h3>
                </div>
                <div className="space-y-3">
                  {insights.topSymptoms.map(([symptom, count]) => (
                    <div key={symptom}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-foreground">{symptom}</span>
                        <span className="text-sm text-muted-foreground">{count} days</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-chart-5/70"
                          style={{ width: `${(count / insights.daysLogged) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Pattern Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-secondary to-background">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 rounded-full bg-accent/20 flex-shrink-0">
                  <span className="text-lg">🌙</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">{"Luna's Observations"}</p>
                </div>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                {insights.energyTrend === 'improving' && (
                  <p>{"Your energy has been trending upward. Whatever you're doing, it's working!"}</p>
                )}
                {insights.energyTrend === 'declining' && (
                  <p>{"I've noticed your energy dipping lately. Remember, this is natural during certain cycle phases. Be gentle with yourself."}</p>
                )}
                {insights.consistencyRate >= 70 && (
                  <p>{"You've been incredibly consistent with your check-ins ({insights.consistencyRate}%). This dedication to self-awareness is beautiful."}</p>
                )}
                {insights.avgMovement >= 60 && (
                  <p>{"Your movement average of {insights.avgMovement}% shows you're prioritizing physical activity. Your body thanks you!"}</p>
                )}
                {insights.topSymptoms.length > 0 && insights.topSymptoms[0][1] >= 5 && (
                  <p>{`${insights.topSymptoms[0][0]} has been frequent this month. Many women experience this during perimenopause. Tracking it helps you prepare.`}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Navigation />
    </div>
  );
}
