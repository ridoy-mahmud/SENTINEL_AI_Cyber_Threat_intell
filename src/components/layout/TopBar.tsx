import { Shield, Wifi } from 'lucide-react';
import { PulsingDot } from '@/components/shared/PulsingDot';

export function TopBar() {
  return (
    <header className="h-10 bg-card/60 backdrop-blur border-b border-border flex items-center px-4 gap-6 text-[11px] font-mono flex-shrink-0">
      <div className="flex items-center gap-2 text-muted-foreground">
        <PulsingDot color="green" />
        <span>SYSTEM ONLINE</span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Shield className="w-3 h-3 text-primary" />
        <span className="text-foreground tabular-nums">SENTINEL AI v3.2.1</span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Wifi className="w-3 h-3 text-success" />
        <span>ALL SENSORS ACTIVE</span>
      </div>
      <div className="ml-auto flex items-center gap-4 text-muted-foreground">
        <span className="tabular-nums">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        <TimeDisplay />
      </div>
    </header>
  );
}

function TimeDisplay() {
  return (
    <span className="tabular-nums text-primary" suppressHydrationWarning>
      {new Date().toLocaleTimeString('en-US', { hour12: false })}
    </span>
  );
}
