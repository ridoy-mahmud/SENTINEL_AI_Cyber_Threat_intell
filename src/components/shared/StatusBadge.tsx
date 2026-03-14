import type { SeverityColor } from '@/lib/types';

interface StatusBadgeProps {
  severity: SeverityColor | string;
  children: React.ReactNode;
  pulse?: boolean;
}

const badgeStyles: Record<string, string> = {
  critical: 'bg-destructive/20 text-destructive border-destructive/30',
  high: 'bg-warning/20 text-warning border-warning/30',
  medium: 'bg-warning/10 text-warning/80 border-warning/20',
  low: 'bg-primary/15 text-primary border-primary/25',
  info: 'bg-muted text-muted-foreground border-muted-foreground/20',
  active: 'bg-destructive/20 text-destructive border-destructive/30',
  investigating: 'bg-warning/20 text-warning border-warning/30',
  mitigated: 'bg-success/20 text-success border-success/30',
  resolved: 'bg-success/20 text-success border-success/30',
  normal: 'bg-success/15 text-success border-success/25',
  suspicious: 'bg-warning/20 text-warning border-warning/30',
  malicious: 'bg-destructive/20 text-destructive border-destructive/30',
  new: 'bg-primary/15 text-primary border-primary/25',
  false_positive: 'bg-muted text-muted-foreground border-muted-foreground/20',
};

export function StatusBadge({ severity, children, pulse }: StatusBadgeProps) {
  const styles = badgeStyles[severity] || badgeStyles.info;
  return (
    <span className={`
      inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono font-medium
      border rounded-sm uppercase tracking-wider
      ${styles}
      ${pulse ? 'animate-threat-pulse' : ''}
    `}>
      {children}
    </span>
  );
}
