export type Mood = 'radiant' | 'good' | 'okay' | 'low' | 'struggling';

export type CyclePhase = 'period' | 'follicular' | 'ovulation' | 'luteal';

export interface DailyLog {
  id: string;
  date: string;
  mood: Mood;
  energy: number; // 1-5
  movement: number; // 0-100
  nutrition: number; // 0-100
  sleep: number; // 0-100
  symptoms: string[];
  keywords: string[];
  createdAt: string;
}

export interface CycleData {
  periodStartDate: string;
  currentPhase: CyclePhase;
  cycleDay: number;
}

export interface PlantData {
  month: string; // YYYY-MM format
  growthScore: number; // 0-100
  daysLogged: number;
  totalDays: number;
}

export interface MonthlyReport {
  id: string;
  month: string;
  generatedAt: string;
  patterns: {
    energyTrend: 'improving' | 'stable' | 'declining';
    moodSummary: string;
    consistencyRate: number;
    topSymptoms: string[];
    insights: string[];
  };
  reportText: string;
}

export interface UserData {
  dailyLogs: DailyLog[];
  cycleData: CycleData;
  plants: PlantData[];
  monthlyReports: MonthlyReport[];
}

export const MOOD_OPTIONS: { value: Mood; label: string; color: string }[] = [
  { value: 'radiant', label: 'Radiant', color: 'bg-chart-1' },
  { value: 'good', label: 'Good', color: 'bg-chart-2' },
  { value: 'okay', label: 'Okay', color: 'bg-chart-4' },
  { value: 'low', label: 'Low', color: 'bg-chart-3' },
  { value: 'struggling', label: 'Struggling', color: 'bg-chart-5' },
];

export const SYMPTOM_OPTIONS = [
  'Hot flashes',
  'Night sweats',
  'Mood swings',
  'Brain fog',
  'Fatigue',
  'Sleep issues',
  'Anxiety',
  'Joint pain',
  'Headaches',
  'Bloating',
];

export const KEYWORD_OPTIONS = [
  'Productive',
  'Peaceful',
  'Connected',
  'Creative',
  'Energetic',
  'Restful',
  'Social',
  'Reflective',
  'Challenging',
  'Accomplishment',
];

export const PHASE_INFO: Record<CyclePhase, { 
  name: string; 
  description: string; 
  hormoneInfo: string;
  energyLevel: string;
  nutritionTips: string[];
  movementTips: string[];
}> = {
  period: {
    name: 'Menstrual',
    description: 'Your body is releasing and renewing. Honor this time of rest.',
    hormoneInfo: 'Estrogen and progesterone are at their lowest. This is a time of natural introspection.',
    energyLevel: 'Lower energy is normal. Listen to your body.',
    nutritionTips: ['Iron-rich foods like leafy greens', 'Warm, comforting meals', 'Stay hydrated'],
    movementTips: ['Gentle walks', 'Restorative yoga', 'Light stretching'],
  },
  follicular: {
    name: 'Follicular',
    description: 'Energy begins to rise. A great time for new beginnings.',
    hormoneInfo: 'Estrogen is rising, bringing renewed energy and mental clarity.',
    energyLevel: 'Energy gradually increases. You may feel more optimistic.',
    nutritionTips: ['Fresh, light foods', 'Fermented foods for gut health', 'Protein for building'],
    movementTips: ['Try new workouts', 'Cardio and strength training', 'Social exercise'],
  },
  ovulation: {
    name: 'Ovulation',
    description: 'Peak energy and confidence. You may feel your most vibrant.',
    hormoneInfo: 'Estrogen peaks, testosterone rises briefly. This is your power phase.',
    energyLevel: 'Highest energy of your cycle. Embrace it!',
    nutritionTips: ['Fiber-rich vegetables', 'Antioxidant-rich berries', 'Light, fresh meals'],
    movementTips: ['High-intensity workouts', 'Social sports', 'Peak performance activities'],
  },
  luteal: {
    name: 'Luteal',
    description: 'Winding down. Focus on self-care and completion.',
    hormoneInfo: 'Progesterone rises then falls. You may notice PMS symptoms.',
    energyLevel: 'Energy gradually decreases. Prioritize rest.',
    nutritionTips: ['Complex carbs for serotonin', 'Magnesium-rich foods', 'Reduce caffeine and salt'],
    movementTips: ['Moderate exercise', 'Pilates and yoga', 'Nature walks'],
  },
};
