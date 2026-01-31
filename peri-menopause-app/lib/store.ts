'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DailyLog, CycleData, PlantData, MonthlyReport, UserData, CyclePhase } from './types';

// Helper to generate sample data
function generateSampleData(): UserData {
  const today = new Date();
  const logs: DailyLog[] = [];
  
  // Generate 60 days of sample logs
  for (let i = 60; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Skip some days randomly to make it realistic
    if (Math.random() > 0.85) continue;
    
    const cycleDay = ((60 - i) % 28) + 1;
    let phase: CyclePhase;
    if (cycleDay <= 5) phase = 'period';
    else if (cycleDay <= 13) phase = 'follicular';
    else if (cycleDay <= 16) phase = 'ovulation';
    else phase = 'luteal';
    
    // Vary energy/mood based on cycle phase
    let baseEnergy = 3;
    if (phase === 'ovulation') baseEnergy = 4;
    if (phase === 'period') baseEnergy = 2;
    if (phase === 'luteal' && cycleDay > 24) baseEnergy = 2;
    
    const energy = Math.min(5, Math.max(1, baseEnergy + Math.floor(Math.random() * 2) - 1));
    const moods = ['radiant', 'good', 'okay', 'low', 'struggling'] as const;
    const moodIndex = Math.max(0, Math.min(4, 4 - energy + Math.floor(Math.random() * 2)));
    
    logs.push({
      id: `log-${date.toISOString().split('T')[0]}`,
      date: date.toISOString().split('T')[0],
      mood: moods[moodIndex],
      energy,
      movement: Math.floor(Math.random() * 60) + 40,
      nutrition: Math.floor(Math.random() * 50) + 50,
      sleep: Math.floor(Math.random() * 40) + 50,
      symptoms: Math.random() > 0.5 ? ['Hot flashes', 'Fatigue'].slice(0, Math.floor(Math.random() * 2) + 1) : [],
      keywords: ['Peaceful', 'Productive'].slice(0, Math.floor(Math.random() * 2) + 1),
      createdAt: date.toISOString(),
    });
  }

  // Calculate plant growth for past months
  const plants: PlantData[] = [];
  const months = [-2, -1, 0];
  months.forEach((offset) => {
    const monthDate = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const monthStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    const monthLogs = logs.filter(l => l.date.startsWith(monthStr));
    
    plants.push({
      month: monthStr,
      growthScore: Math.min(100, Math.floor((monthLogs.length / daysInMonth) * 100 + Math.random() * 20)),
      daysLogged: monthLogs.length,
      totalDays: daysInMonth,
    });
  });

  return {
    dailyLogs: logs,
    cycleData: {
      periodStartDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10).toISOString().split('T')[0],
      currentPhase: 'follicular',
      cycleDay: 11,
    },
    plants,
    monthlyReports: [{
      id: 'report-1',
      month: `${today.getFullYear()}-${String(today.getMonth()).padStart(2, '0')}`,
      generatedAt: new Date().toISOString(),
      patterns: {
        energyTrend: 'improving',
        moodSummary: 'Your mood has been predominantly positive this month.',
        consistencyRate: 78,
        topSymptoms: ['Hot flashes', 'Fatigue'],
        insights: [
          'Your energy peaks during your follicular phase - consider scheduling important tasks then.',
          'Hot flashes were most frequent during your luteal phase.',
          'Days with movement above 60% correlated with better mood scores.',
        ],
      },
      reportText: '',
    }],
  };
}

interface BloomStore extends UserData {
  // Actions
  addDailyLog: (log: Omit<DailyLog, 'id' | 'createdAt'>) => void;
  updateCycleData: (data: Partial<CycleData>) => void;
  getTodayLog: () => DailyLog | undefined;
  getLogsByMonth: (month: string) => DailyLog[];
  getCurrentPlant: () => PlantData | undefined;
  calculateGrowthScore: (month: string) => number;
  resetToSampleData: () => void;
}

export const useBloomStore = create<BloomStore>()(
  persist(
    (set, get) => ({
      ...generateSampleData(),

      addDailyLog: (log) => {
        const today = new Date().toISOString().split('T')[0];
        const newLog: DailyLog = {
          ...log,
          id: `log-${today}`,
          createdAt: new Date().toISOString(),
        };
        
        set((state) => {
          // Remove existing log for today if any
          const filteredLogs = state.dailyLogs.filter(l => l.date !== today);
          const newLogs = [...filteredLogs, newLog];
          
          // Update current month's plant growth
          const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
          const monthLogs = newLogs.filter(l => l.date.startsWith(currentMonth));
          const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
          
          const avgEnergy = monthLogs.reduce((sum, l) => sum + l.energy, 0) / monthLogs.length;
          const avgMovement = monthLogs.reduce((sum, l) => sum + l.movement, 0) / monthLogs.length;
          const avgNutrition = monthLogs.reduce((sum, l) => sum + l.nutrition, 0) / monthLogs.length;
          
          const consistencyScore = (monthLogs.length / daysInMonth) * 100;
          const effortScore = ((avgEnergy / 5) * 100 + avgMovement + avgNutrition) / 3;
          const growthScore = Math.round(consistencyScore * 0.6 + effortScore * 0.4);
          
          const existingPlantIndex = state.plants.findIndex(p => p.month === currentMonth);
          const newPlants = [...state.plants];
          
          if (existingPlantIndex >= 0) {
            newPlants[existingPlantIndex] = {
              month: currentMonth,
              growthScore: Math.min(100, growthScore),
              daysLogged: monthLogs.length,
              totalDays: daysInMonth,
            };
          } else {
            newPlants.push({
              month: currentMonth,
              growthScore: Math.min(100, growthScore),
              daysLogged: monthLogs.length,
              totalDays: daysInMonth,
            });
          }
          
          return { dailyLogs: newLogs, plants: newPlants };
        });
      },

      updateCycleData: (data) => {
        set((state) => ({
          cycleData: { ...state.cycleData, ...data },
        }));
      },

      getTodayLog: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().dailyLogs.find(l => l.date === today);
      },

      getLogsByMonth: (month) => {
        return get().dailyLogs.filter(l => l.date.startsWith(month));
      },

      getCurrentPlant: () => {
        const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
        return get().plants.find(p => p.month === currentMonth);
      },

      calculateGrowthScore: (month) => {
        const logs = get().getLogsByMonth(month);
        const [year, monthNum] = month.split('-').map(Number);
        const daysInMonth = new Date(year, monthNum, 0).getDate();
        
        if (logs.length === 0) return 0;
        
        const avgEnergy = logs.reduce((sum, l) => sum + l.energy, 0) / logs.length;
        const avgMovement = logs.reduce((sum, l) => sum + l.movement, 0) / logs.length;
        const avgNutrition = logs.reduce((sum, l) => sum + l.nutrition, 0) / logs.length;
        
        const consistencyScore = (logs.length / daysInMonth) * 100;
        const effortScore = ((avgEnergy / 5) * 100 + avgMovement + avgNutrition) / 3;
        
        return Math.min(100, Math.round(consistencyScore * 0.6 + effortScore * 0.4));
      },

      resetToSampleData: () => {
        set(generateSampleData());
      },
    }),
    {
      name: 'bloom-storage',
    }
  )
);

// Helper function to calculate current cycle phase
export function calculateCyclePhase(periodStartDate: string): { phase: CyclePhase; cycleDay: number } {
  const start = new Date(periodStartDate);
  const today = new Date();
  const daysSincePeriod = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const cycleDay = (daysSincePeriod % 28) + 1;
  
  let phase: CyclePhase;
  if (cycleDay <= 5) phase = 'period';
  else if (cycleDay <= 13) phase = 'follicular';
  else if (cycleDay <= 16) phase = 'ovulation';
  else phase = 'luteal';
  
  return { phase, cycleDay };
}
