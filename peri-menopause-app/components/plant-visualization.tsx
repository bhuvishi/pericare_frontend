'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PlantVisualizationProps {
  growthScore: number;
  month: string;
  isCurrentMonth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PlantVisualization({ 
  growthScore, 
  month, 
  isCurrentMonth = false,
  size = 'lg' 
}: PlantVisualizationProps) {
  // Determine plant stage based on growth score
  const getPlantStage = () => {
    if (growthScore < 20) return 'seed';
    if (growthScore < 40) return 'sprout';
    if (growthScore < 60) return 'small';
    if (growthScore < 80) return 'medium';
    return 'bloom';
  };

  const stage = getPlantStage();
  const monthName = new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' });

  const sizeClasses = {
    sm: 'w-24 h-32',
    md: 'w-32 h-40',
    lg: 'w-48 h-56',
  };

  const potSizeClasses = {
    sm: 'w-16 h-8',
    md: 'w-20 h-10',
    lg: 'w-28 h-14',
  };

  return (
    <div className={cn('flex flex-col items-center', sizeClasses[size])}>
      <div className="flex-1 relative flex items-end justify-center">
        {/* Plant SVG */}
        <svg
          viewBox="0 0 100 120"
          className={cn(
            'w-full h-full',
            isCurrentMonth ? 'drop-shadow-lg' : 'opacity-80'
          )}
        >
          {/* Seed stage */}
          {stage === 'seed' && (
            <motion.ellipse
              cx="50"
              cy="100"
              rx="8"
              ry="6"
              fill="currentColor"
              className="text-chart-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}

          {/* Sprout stage */}
          {stage === 'sprout' && (
            <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Stem */}
              <path
                d="M50 100 Q50 85 50 80"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className="text-primary"
              />
              {/* Small leaves */}
              <ellipse cx="45" cy="82" rx="8" ry="5" fill="currentColor" className="text-primary" transform="rotate(-30 45 82)" />
              <ellipse cx="55" cy="82" rx="8" ry="5" fill="currentColor" className="text-primary" transform="rotate(30 55 82)" />
            </motion.g>
          )}

          {/* Small plant stage */}
          {stage === 'small' && (
            <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Stem */}
              <path
                d="M50 100 Q50 75 50 60"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className="text-primary"
              />
              {/* Leaves */}
              <ellipse cx="40" cy="75" rx="12" ry="6" fill="currentColor" className="text-primary" transform="rotate(-40 40 75)" />
              <ellipse cx="60" cy="75" rx="12" ry="6" fill="currentColor" className="text-primary" transform="rotate(40 60 75)" />
              <ellipse cx="42" cy="62" rx="10" ry="5" fill="currentColor" className="text-primary/80" transform="rotate(-35 42 62)" />
              <ellipse cx="58" cy="62" rx="10" ry="5" fill="currentColor" className="text-primary/80" transform="rotate(35 58 62)" />
            </motion.g>
          )}

          {/* Medium plant stage */}
          {stage === 'medium' && (
            <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Main stem */}
              <path
                d="M50 100 Q50 70 50 45"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-primary"
              />
              {/* Multiple leaves */}
              <ellipse cx="35" cy="80" rx="14" ry="7" fill="currentColor" className="text-primary" transform="rotate(-45 35 80)" />
              <ellipse cx="65" cy="80" rx="14" ry="7" fill="currentColor" className="text-primary" transform="rotate(45 65 80)" />
              <ellipse cx="38" cy="65" rx="12" ry="6" fill="currentColor" className="text-primary/90" transform="rotate(-40 38 65)" />
              <ellipse cx="62" cy="65" rx="12" ry="6" fill="currentColor" className="text-primary/90" transform="rotate(40 62 65)" />
              <ellipse cx="40" cy="52" rx="10" ry="5" fill="currentColor" className="text-primary/80" transform="rotate(-35 40 52)" />
              <ellipse cx="60" cy="52" rx="10" ry="5" fill="currentColor" className="text-primary/80" transform="rotate(35 60 52)" />
              {/* Small bud */}
              <circle cx="50" cy="42" r="6" fill="currentColor" className="text-chart-2" />
            </motion.g>
          )}

          {/* Full bloom stage */}
          {stage === 'bloom' && (
            <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Main stem */}
              <path
                d="M50 100 Q50 65 50 35"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-primary"
              />
              {/* Full leaves */}
              <ellipse cx="32" cy="85" rx="16" ry="8" fill="currentColor" className="text-primary" transform="rotate(-50 32 85)" />
              <ellipse cx="68" cy="85" rx="16" ry="8" fill="currentColor" className="text-primary" transform="rotate(50 68 85)" />
              <ellipse cx="35" cy="68" rx="14" ry="7" fill="currentColor" className="text-primary/90" transform="rotate(-45 35 68)" />
              <ellipse cx="65" cy="68" rx="14" ry="7" fill="currentColor" className="text-primary/90" transform="rotate(45 65 68)" />
              <ellipse cx="38" cy="52" rx="12" ry="6" fill="currentColor" className="text-primary/80" transform="rotate(-40 38 52)" />
              <ellipse cx="62" cy="52" rx="12" ry="6" fill="currentColor" className="text-primary/80" transform="rotate(40 62 52)" />
              
              {/* Flower petals */}
              <motion.g
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                  <ellipse
                    key={i}
                    cx="50"
                    cy="22"
                    rx="10"
                    ry="5"
                    fill="currentColor"
                    className={i % 2 === 0 ? 'text-accent' : 'text-chart-2'}
                    transform={`rotate(${angle} 50 30)`}
                  />
                ))}
                {/* Flower center */}
                <circle cx="50" cy="30" r="8" fill="currentColor" className="text-chart-4" />
              </motion.g>
            </motion.g>
          )}
        </svg>
      </div>

      {/* Pot */}
      <div className={cn(
        'rounded-b-2xl bg-gradient-to-b from-chart-3 to-chart-3/80',
        potSizeClasses[size]
      )} />

      {/* Month label */}
      <p className={cn(
        'mt-2 font-medium',
        size === 'sm' ? 'text-xs' : 'text-sm',
        isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
      )}>
        {monthName}
      </p>
      
      {/* Growth score */}
      <p className={cn(
        'text-muted-foreground',
        size === 'sm' ? 'text-xs' : 'text-xs'
      )}>
        {growthScore}%
      </p>
    </div>
  );
}
