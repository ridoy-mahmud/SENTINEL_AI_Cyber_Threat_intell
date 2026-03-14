import { GlowCard } from '@/components/shared/GlowCard';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import type { SystemHealth } from '@/lib/types';
import { Cpu, HardDrive, Wifi, Brain } from 'lucide-react';

interface SystemHealthCardsProps {
  health: SystemHealth;
}

const items = [
  { key: 'cpu' as const, label: 'CPU USAGE', icon: Cpu },
  { key: 'memory' as const, label: 'MEMORY', icon: HardDrive },
  { key: 'bandwidth' as const, label: 'BANDWIDTH', icon: Wifi },
  { key: 'modelAccuracy' as const, label: 'ML ACCURACY', icon: Brain },
];

function getColor(value: number, isAccuracy = false): string {
  if (isAccuracy) return 'text-success';
  if (value > 80) return 'text-destructive';
  if (value > 60) return 'text-warning';
  return 'text-primary';
}

function getStrokeColor(value: number, isAccuracy = false): string {
  if (isAccuracy) return 'hsl(153, 100%, 50%)';
  if (value > 80) return 'hsl(345, 100%, 50%)';
  if (value > 60) return 'hsl(33, 100%, 50%)';
  return 'hsl(186, 100%, 50%)';
}

export function SystemHealthCards({ health }: SystemHealthCardsProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {items.map(item => {
        const value = health[item.key];
        const isAccuracy = item.key === 'modelAccuracy';
        const color = getColor(value, isAccuracy);
        const strokeColor = getStrokeColor(value, isAccuracy);
        const circumference = 2 * Math.PI * 28;
        const offset = circumference - (value / 100) * circumference;

        return (
          <GlowCard key={item.key} className="!p-3">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(228, 30%, 12%)" strokeWidth="3" />
                  <circle
                    cx="32" cy="32" r="28" fill="none"
                    stroke={strokeColor}
                    strokeWidth="3"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <AnimatedCounter value={value} suffix="%" className={`text-[13px] font-bold ${color}`} />
                </div>
              </div>
              <div>
                <item.icon className={`w-4 h-4 ${color} mb-1`} />
                <span className="text-[10px] font-mono text-muted-foreground tracking-wider">{item.label}</span>
              </div>
            </div>
          </GlowCard>
        );
      })}
    </div>
  );
}
