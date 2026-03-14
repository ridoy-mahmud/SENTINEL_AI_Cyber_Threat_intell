import { GlowCard } from '@/components/shared/GlowCard';
import { PulsingDot } from '@/components/shared/PulsingDot';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';

interface AnomalyTimelineProps {
  data: { time: string; score: number }[];
}

export function AnomalyTimeline({ data }: AnomalyTimelineProps) {
  return (
    <GlowCard
      header={
        <>
          <PulsingDot color="cyan" />
          <span className="text-[13px] font-mono font-medium text-foreground">ANOMALY SCORE TIMELINE</span>
          <span className="ml-auto text-[10px] text-muted-foreground font-mono">LAST 24H</span>
        </>
      }
      className="col-span-2"
    >
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="anomalyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(186, 100%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(186, 100%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tick={{ fill: 'hsl(220, 15%, 55%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              axisLine={{ stroke: 'hsl(186, 100%, 50%, 0.1)' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: 'hsl(220, 15%, 55%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(228, 60%, 6%)',
                border: '1px solid hsl(186, 100%, 50%, 0.2)',
                borderRadius: '2px',
                fontSize: '11px',
                fontFamily: 'JetBrains Mono',
              }}
              labelStyle={{ color: 'hsl(186, 100%, 50%)' }}
            />
            <ReferenceLine y={80} stroke="hsl(345, 100%, 50%)" strokeDasharray="3 3" strokeOpacity={0.5} />
            <ReferenceLine y={50} stroke="hsl(33, 100%, 50%)" strokeDasharray="3 3" strokeOpacity={0.3} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(186, 100%, 50%)"
              strokeWidth={1.5}
              fill="url(#anomalyGrad)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlowCard>
  );
}
