import { GlowCard } from '@/components/shared/GlowCard';
import { PulsingDot } from '@/components/shared/PulsingDot';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';

interface ThreatSeverityChartProps {
  data: { name: string; value: number; fill: string }[];
}

export function ThreatSeverityChart({ data }: ThreatSeverityChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <GlowCard
      header={
        <>
          <PulsingDot color="amber" />
          <span className="text-[13px] font-mono font-medium text-foreground">SEVERITY DISTRIBUTION</span>
        </>
      }
    >
      <div className="flex items-center gap-4">
        <div className="w-40 h-40 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatedCounter value={total} className="text-xl font-bold text-foreground" />
            <span className="text-[10px] text-muted-foreground font-mono">TOTAL</span>
          </div>
        </div>
        <div className="space-y-2 flex-1">
          {data.map(d => (
            <div key={d.name} className="flex items-center gap-2 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: d.fill }} />
              <span className="text-muted-foreground flex-1">{d.name}</span>
              <span className="text-foreground tabular-nums">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </GlowCard>
  );
}
