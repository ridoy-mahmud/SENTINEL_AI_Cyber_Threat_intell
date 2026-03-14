import { useState, useMemo } from 'react';
import { GlowCard } from '@/components/shared/GlowCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PulsingDot } from '@/components/shared/PulsingDot';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { generateAlert, generateInitialThreats } from '@/lib/mock-data';
import type { Alert } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Check, Search as SearchIcon, Eye, X } from 'lucide-react';

const AlertsPage = () => {
  const threats = useMemo(() => generateInitialThreats(20), []);
  const [alerts] = useState<Alert[]>(() => threats.map(t => generateAlert(t)));
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.status === filter);

  const statusCounts = {
    new: alerts.filter(a => a.status === 'new').length,
    investigating: alerts.filter(a => a.status === 'investigating').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
    false_positive: alerts.filter(a => a.status === 'false_positive').length,
  };

  const statusChartData = [
    { name: 'New', value: statusCounts.new, fill: 'hsl(186, 100%, 50%)' },
    { name: 'Investigating', value: statusCounts.investigating, fill: 'hsl(33, 100%, 50%)' },
    { name: 'Resolved', value: statusCounts.resolved, fill: 'hsl(153, 100%, 50%)' },
    { name: 'False Positive', value: statusCounts.false_positive, fill: 'hsl(220, 15%, 55%)' },
  ];

  return (
    <div className="p-4 space-y-3">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'TOTAL ALERTS', value: alerts.length, color: 'text-primary' },
          { label: 'NEW', value: statusCounts.new, color: 'text-primary' },
          { label: 'INVESTIGATING', value: statusCounts.investigating, color: 'text-warning' },
          { label: 'RESOLVED', value: statusCounts.resolved, color: 'text-success' },
        ].map(s => (
          <div key={s.label} className="bg-card/60 border border-border rounded-sm px-4 py-3 text-center">
            <div className="text-[10px] font-mono text-muted-foreground">{s.label}</div>
            <AnimatedCounter value={s.value} className={`text-xl font-bold ${s.color}`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-3">
        {/* Alert list */}
        <div className="col-span-8">
          <GlowCard
            hover={false}
            header={
              <>
                <PulsingDot color="red" />
                <span className="text-[13px] font-mono font-medium text-foreground">ALERT MANAGEMENT</span>
                <div className="ml-auto flex gap-1">
                  {['all', 'new', 'investigating', 'resolved'].map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-2 py-0.5 text-[10px] font-mono rounded-sm border transition-all ${
                        filter === f ? 'bg-primary/10 text-primary border-primary/20' : 'text-muted-foreground border-transparent hover:text-foreground'
                      }`}
                    >
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </>
            }
          >
            <div className="space-y-2 max-h-[500px] overflow-y-auto cyber-scrollbar">
              {filtered.map(alert => (
                <div key={alert.id} className="p-3 border border-border/50 rounded-sm bg-card/30 hover:border-primary/20 transition-all cursor-pointer">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="text-[12px] font-mono font-medium text-foreground truncate">{alert.title}</div>
                      <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                        {alert.id} • {alert.createdAt.toLocaleString()} • {alert.assignedTo}
                      </div>
                    </div>
                    <StatusBadge severity={alert.severity} pulse={alert.severity === 'critical'}>{alert.severity}</StatusBadge>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge severity={alert.status}>{alert.status}</StatusBadge>
                    <span className="text-[10px] font-mono text-muted-foreground">{alert.affectedAssets.length} assets affected</span>
                    <div className="ml-auto flex gap-1">
                      <button className="p-1 text-muted-foreground hover:text-success transition-colors" title="Acknowledge"><Check className="w-3.5 h-3.5" /></button>
                      <button className="p-1 text-muted-foreground hover:text-primary transition-colors" title="Investigate"><Eye className="w-3.5 h-3.5" /></button>
                      <button className="p-1 text-muted-foreground hover:text-destructive transition-colors" title="Dismiss"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlowCard>
        </div>

        {/* Charts */}
        <div className="col-span-4 space-y-3">
          <GlowCard
            header={
              <>
                <PulsingDot color="cyan" />
                <span className="text-[13px] font-mono font-medium text-foreground">STATUS DISTRIBUTION</span>
              </>
            }
          >
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value" strokeWidth={0}>
                    {statusChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5">
              {statusChartData.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: d.fill }} />
                  <span className="text-muted-foreground flex-1">{d.name}</span>
                  <span className="text-foreground tabular-nums">{d.value}</span>
                </div>
              ))}
            </div>
          </GlowCard>
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;
