import { useState, useMemo, useCallback, useEffect } from 'react';
import { GlowCard } from '@/components/shared/GlowCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PulsingDot } from '@/components/shared/PulsingDot';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { generateAlert, generateInitialThreats } from '@/lib/mock-data';
import type { Alert } from '@/lib/types';
import { applyAlertAction, fetchAlerts } from '@/lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Check, Eye, X, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

const AlertsPage = () => {
  const threats = useMemo(() => generateInitialThreats(20), []);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [backendMode, setBackendMode] = useState<'api' | 'mock'>('mock');

  useEffect(() => {
    let cancelled = false;

    const loadAlerts = async () => {
      const remoteAlerts = await fetchAlerts();
      if (cancelled) return;

      if (remoteAlerts && remoteAlerts.length > 0) {
        setAlerts(remoteAlerts);
        setBackendMode('api');
        return;
      }

      setAlerts(threats.map(t => generateAlert(t)));
      setBackendMode('mock');
    };

    loadAlerts();
    return () => {
      cancelled = true;
    };
  }, [threats]);

  const updateLocally = useCallback((alertId: string, transition: { status: Alert['status']; action: string; details: string }) => {
    const now = new Date();
    setAlerts(prev => prev.map(a => {
      if (a.id !== alertId) return a;
      return {
        ...a,
        status: transition.status,
        updatedAt: now,
        timeline: [...a.timeline, { timestamp: now, action: transition.action, details: transition.details }],
      };
    }));
  }, []);

  const runAlertAction = useCallback(async (
    alertId: string,
    action: 'acknowledge' | 'investigate' | 'resolve' | 'dismiss',
    transition: { status: Alert['status']; action: string; details: string },
    successMessage: string,
  ) => {
    const updated = await applyAlertAction(alertId, action);
    if (updated) {
      setAlerts(prev => prev.map(a => (a.id === alertId ? updated : a)));
      setBackendMode('api');
      toast.success(successMessage);
      return;
    }

    setBackendMode('mock');
    updateLocally(alertId, transition);
    toast.info('Backend unavailable, applied action locally.');
  }, [updateLocally]);

  const handleAcknowledge = useCallback((alertId: string) => {
    runAlertAction(
      alertId,
      'acknowledge',
      { status: 'investigating', action: 'Acknowledged', details: 'Alert acknowledged by analyst' },
      'Alert acknowledged — status changed to investigating',
    );
  }, [runAlertAction]);

  const handleInvestigate = useCallback((alertId: string) => {
    runAlertAction(
      alertId,
      'investigate',
      { status: 'investigating', action: 'Investigation Started', details: 'Analyst began investigation' },
      'Investigation started — timeline expanded',
    );
    setExpandedAlert(alertId);
  }, [runAlertAction]);

  const handleDismiss = useCallback((alertId: string) => {
    runAlertAction(
      alertId,
      'dismiss',
      { status: 'false_positive', action: 'Dismissed', details: 'Marked as false positive' },
      'Alert dismissed as false positive',
    );
  }, [runAlertAction]);

  const handleResolve = useCallback((alertId: string) => {
    runAlertAction(
      alertId,
      'resolve',
      { status: 'resolved', action: 'Resolved', details: 'Incident resolved and closed' },
      'Alert resolved successfully',
    );
  }, [runAlertAction]);

  const filtered = alerts.filter(a => {
    if (filter !== 'all' && a.status !== filter) return false;
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    return true;
  });

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
                <span className={`ml-2 text-[10px] font-mono ${backendMode === 'api' ? 'text-success' : 'text-warning'}`}>
                  {backendMode === 'api' ? 'BACKEND' : 'LOCAL FALLBACK'}
                </span>
                <div className="ml-auto flex gap-1">
                  {['all', 'new', 'investigating', 'resolved', 'false_positive'].map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-2 py-0.5 text-[10px] font-mono rounded-sm border transition-all ${
                        filter === f ? 'bg-primary/10 text-primary border-primary/20' : 'text-muted-foreground border-transparent hover:text-foreground'
                      }`}
                    >
                      {f.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </>
            }
          >
            {/* Severity filter */}
            <div className="flex gap-1 mb-3">
              <span className="text-[10px] font-mono text-muted-foreground mr-2 self-center">SEVERITY:</span>
              {['all', 'critical', 'high', 'medium', 'low'].map(s => (
                <button
                  key={s}
                  onClick={() => setSeverityFilter(s)}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded-sm border transition-all ${
                    severityFilter === s ? 'bg-primary/10 text-primary border-primary/20' : 'text-muted-foreground border-transparent hover:text-foreground'
                  }`}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto cyber-scrollbar">
              {filtered.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-[12px] font-mono">No alerts match filters</div>
              )}
              {filtered.map(alert => (
                <div key={alert.id} className="border border-border/50 rounded-sm bg-card/30 hover:border-primary/20 transition-all">
                  <div
                    className="p-3 cursor-pointer"
                    onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <div className="text-[12px] font-mono font-medium text-foreground truncate">{alert.title}</div>
                        <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                          {alert.id} • {alert.createdAt.toLocaleString()} • {alert.assignedTo}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge severity={alert.severity} pulse={alert.severity === 'critical'}>{alert.severity}</StatusBadge>
                        {expandedAlert === alert.id ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge severity={alert.status}>{alert.status.replace('_', ' ')}</StatusBadge>
                      <span className="text-[10px] font-mono text-muted-foreground">{alert.affectedAssets.length} assets affected</span>
                      <div className="ml-auto flex gap-1" onClick={e => e.stopPropagation()}>
                        {alert.status !== 'resolved' && alert.status !== 'false_positive' && (
                          <>
                            <button
                              onClick={() => handleAcknowledge(alert.id)}
                              className="p-1 text-muted-foreground hover:text-success transition-colors"
                              title="Acknowledge"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleInvestigate(alert.id)}
                              className="p-1 text-muted-foreground hover:text-primary transition-colors"
                              title="Investigate"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDismiss(alert.id)}
                              className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                              title="Dismiss"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {alert.status === 'investigating' && (
                          <button
                            onClick={() => handleResolve(alert.id)}
                            className="px-2 py-0.5 text-[10px] font-mono bg-success/10 text-success border border-success/20 rounded-sm hover:bg-success/20 transition-colors"
                          >
                            RESOLVE
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded timeline */}
                  {expandedAlert === alert.id && (
                    <div className="px-3 pb-3 border-t border-border/30">
                      <div className="mt-3 text-[11px] font-mono text-muted-foreground mb-2">INCIDENT TIMELINE</div>
                      <div className="space-y-2 ml-2 border-l border-primary/20 pl-3">
                        {alert.timeline.map((event, i) => (
                          <div key={i} className="relative">
                            <div className="absolute -left-[15px] top-1 w-2 h-2 rounded-full bg-primary/50" />
                            <div className="text-[11px] font-mono text-foreground font-medium">{event.action}</div>
                            <div className="text-[10px] font-mono text-muted-foreground">{event.details}</div>
                            <div className="text-[9px] font-mono text-muted-foreground/60">
                              {event.timestamp.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 text-[10px] font-mono text-muted-foreground">
                        Affected: {alert.affectedAssets.join(', ')} | Type: {alert.type} | Related: {alert.relatedThreatId}
                      </div>
                    </div>
                  )}
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
