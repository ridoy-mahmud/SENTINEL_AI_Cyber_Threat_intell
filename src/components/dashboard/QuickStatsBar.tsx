import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import type { QuickStats } from '@/lib/types';
import { Activity, ShieldAlert, ShieldCheck, Target, Clock } from 'lucide-react';

interface QuickStatsBarProps {
  stats: QuickStats;
}

const statItems = [
  { key: 'totalEvents' as const, label: 'TOTAL EVENTS', icon: Activity, color: 'text-primary' },
  { key: 'threatsDetected' as const, label: 'THREATS DETECTED', icon: ShieldAlert, color: 'text-destructive' },
  { key: 'threatsMitigated' as const, label: 'MITIGATED', icon: ShieldCheck, color: 'text-success' },
  { key: 'falsePositiveRate' as const, label: 'FALSE POSITIVE', icon: Target, color: 'text-warning', suffix: '%', decimals: 1 },
  { key: 'avgResponseTime' as const, label: 'AVG RESPONSE', icon: Clock, color: 'text-primary', suffix: 's', decimals: 1 },
];

export function QuickStatsBar({ stats }: QuickStatsBarProps) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {statItems.map(item => (
        <div
          key={item.key}
          className="bg-card/60 backdrop-blur border border-border rounded-sm px-4 py-3 flex items-center gap-3"
        >
          <item.icon className={`w-4 h-4 ${item.color} flex-shrink-0`} />
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase">{item.label}</div>
            <AnimatedCounter
              value={stats[item.key]}
              suffix={item.suffix}
              decimals={item.decimals}
              className={`text-lg font-bold ${item.color}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
