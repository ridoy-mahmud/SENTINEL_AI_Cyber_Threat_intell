import { memo } from 'react';
import { GlowCard } from '@/components/shared/GlowCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PulsingDot } from '@/components/shared/PulsingDot';
import type { NetworkPacket } from '@/lib/types';

interface LiveTrafficFeedProps {
  packets: NetworkPacket[];
}

export const LiveTrafficFeed = memo(function LiveTrafficFeed({ packets }: LiveTrafficFeedProps) {
  return (
    <GlowCard
      hover={false}
      header={
        <>
          <PulsingDot color="cyan" />
          <span className="text-[13px] font-mono font-medium text-foreground">LIVE TRAFFIC</span>
        </>
      }
      className="h-full"
    >
      <div className="space-y-0 max-h-[320px] overflow-y-auto cyber-scrollbar snap-scroll">
        {packets.slice(0, 15).map((pkt, i) => (
          <div
            key={pkt.id}
            className={`
              flex items-center gap-2 px-2 py-1.5 text-[11px] font-mono border-b border-border/30
              ${pkt.status === 'malicious' ? 'bg-destructive/5' : ''}
              ${i === 0 ? 'animate-fade-in' : ''}
            `}
          >
            <span className="text-muted-foreground w-14 flex-shrink-0 tabular-nums">
              {pkt.timestamp.toLocaleTimeString('en', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="text-foreground w-28 flex-shrink-0 tabular-nums">{pkt.sourceIP}</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-foreground w-28 flex-shrink-0 tabular-nums">{pkt.destinationIP}</span>
            <span className="text-primary w-10 flex-shrink-0">{pkt.protocol}</span>
            <StatusBadge severity={pkt.status} pulse={pkt.status === 'malicious'}>
              {pkt.status}
            </StatusBadge>
          </div>
        ))}
      </div>
    </GlowCard>
  );
});
