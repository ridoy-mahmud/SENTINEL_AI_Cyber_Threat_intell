import { GlowCard } from '@/components/shared/GlowCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PulsingDot } from '@/components/shared/PulsingDot';
import type { ThreatEvent } from '@/lib/types';
import { AlertTriangle } from 'lucide-react';

interface TopThreatsPanelProps {
  threats: ThreatEvent[];
}

export function TopThreatsPanel({ threats }: TopThreatsPanelProps) {
  return (
    <GlowCard
      hover={false}
      header={
        <>
          <PulsingDot color="red" />
          <span className="text-[13px] font-mono font-medium text-foreground">TOP THREATS</span>
        </>
      }
      className="h-full"
    >
      <div className="space-y-3">
        {threats.slice(0, 5).map(threat => (
          <div
            key={threat.id}
            className="p-3 border border-border rounded-sm bg-card/40 hover:border-destructive/30 hover:shadow-glow-red transition-all duration-150 cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                <span className="text-[12px] font-mono font-medium text-foreground truncate">
                  {threat.name}
                </span>
              </div>
              <StatusBadge severity={threat.severity} pulse={threat.severity === 'critical'}>
                {threat.severity}
              </StatusBadge>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
              <span>{threat.type}</span>
              <span>•</span>
              <span>{threat.targetAssets.length} assets</span>
              <span>•</span>
              <StatusBadge severity={threat.status}>{threat.status}</StatusBadge>
            </div>
          </div>
        ))}
      </div>
    </GlowCard>
  );
}
