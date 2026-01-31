'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/header';
import { Navigation } from '@/components/navigation';
import { PlantVisualization } from '@/components/plant-visualization';
import { Card, CardContent } from '@/components/ui/card';
import { useBloomStore } from '@/lib/store';
import { Flower2, Calendar, TrendingUp, Sparkles } from 'lucide-react';

export default function GardenPage() {
  const [mounted, setMounted] = useState(false);
  const { plants, dailyLogs, getCurrentPlant } = useBloomStore();
  
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

  const currentPlant = getCurrentPlant();
  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  
  // Get past plants (excluding current month)
  const pastPlants = plants
    .filter(p => p.month !== currentMonth)
    .sort((a, b) => b.month.localeCompare(a.month));

  // Calculate stats
  const totalDaysLogged = dailyLogs.length;
  const averageGrowth = plants.length > 0 
    ? Math.round(plants.reduce((sum, p) => sum + p.growthScore, 0) / plants.length)
    : 0;
  const plantsGrown = plants.filter(p => p.growthScore >= 80).length;

  // Get growth stage label
  const getStageLabel = (score: number) => {
    if (score < 20) return 'Seed';
    if (score < 40) return 'Sprout';
    if (score < 60) return 'Growing';
    if (score < 80) return 'Budding';
    return 'Full Bloom';
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Your Garden" subtitle="Watch your progress bloom" />
      
      <main className="px-4 space-y-6 max-w-lg mx-auto">
        {/* Current Month Plant - Featured */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-chart-2/5 border-primary/20 overflow-hidden">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <h2 className="text-xl font-serif text-foreground mb-1">
                  {"This Month's Journey"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {currentPlant?.daysLogged || 0} days of nurturing yourself
                </p>
              </div>
              
              <div className="flex justify-center mb-6">
                <PlantVisualization
                  growthScore={currentPlant?.growthScore || 0}
                  month={currentMonth}
                  isCurrentMonth={true}
                  size="lg"
                />
              </div>

              <div className="bg-background/60 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Growth Progress</span>
                  <span className="text-sm font-medium text-foreground">
                    {getStageLabel(currentPlant?.growthScore || 0)}
                  </span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-chart-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${currentPlant?.growthScore || 0}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Seed</span>
                  <span>Sprout</span>
                  <span>Growing</span>
                  <span>Bloom</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-serif text-foreground">{totalDaysLogged}</p>
              <p className="text-xs text-muted-foreground">Days Logged</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-chart-2/10 flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-5 h-5 text-chart-2" />
              </div>
              <p className="text-2xl font-serif text-foreground">{averageGrowth}%</p>
              <p className="text-xs text-muted-foreground">Avg Growth</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <p className="text-2xl font-serif text-foreground">{plantsGrown}</p>
              <p className="text-xs text-muted-foreground">Full Blooms</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Past Plants Gallery */}
        {pastPlants.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="font-serif text-lg text-foreground mb-4">
                  Your Plant Collection
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2">
                  {pastPlants.map((plant, index) => (
                    <motion.div
                      key={plant.month}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex-shrink-0"
                    >
                      <PlantVisualization
                        growthScore={plant.growthScore}
                        month={plant.month}
                        size="sm"
                      />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Encouragement Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-secondary to-background">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-accent/20 flex-shrink-0">
                  <span className="text-lg">🌙</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Luna says:</p>
                  <p className="text-sm text-muted-foreground italic">
                    {currentPlant && currentPlant.growthScore >= 80
                      ? "\"Your dedication this month has been beautiful! Look at your plant bloom with all the love you've given yourself.\""
                      : currentPlant && currentPlant.growthScore >= 50
                      ? "\"Your plant is growing beautifully. Every day you check in, you're nurturing both your plant and yourself.\""
                      : currentPlant && currentPlant.growthScore >= 20
                      ? "\"Your little sprout is coming along! Remember, growth isn't always linear - every small step matters.\""
                      : "\"Every journey begins with a single step. Your plant is just getting started, and so is this month's story.\""}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <h3 className="font-serif text-lg text-foreground mb-4">
                How Your Garden Grows
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary">1</span>
                  </div>
                  <p className="text-muted-foreground">
                    <span className="text-foreground font-medium">Consistency matters most.</span> Logging daily contributes 60% to your {"plant's"} growth.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary">2</span>
                  </div>
                  <p className="text-muted-foreground">
                    <span className="text-foreground font-medium">Effort, not perfection.</span> Your movement and nutrition scores contribute 40%.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary">3</span>
                  </div>
                  <p className="text-muted-foreground">
                    <span className="text-foreground font-medium">No penalties.</span> Missed days slow growth but never reset your progress.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Navigation />
    </div>
  );
}
