import { useState, useEffect, useCallback } from 'react';
import { GlowCard } from '@/components/shared/GlowCard';
import { PulsingDot } from '@/components/shared/PulsingDot';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Shield, Server, Mail, Cloud, Webhook, Bell, Users, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchSettings, saveSettings } from '@/lib/api';
import type { DetectionRuleSetting, IntegrationSetting, NotificationChannelSetting } from '@/lib/types';

interface Integration {
  name: string;
  status: 'connected' | 'disconnected' | 'configured';
  icon: typeof Server;
}

const DEFAULT_RULES: DetectionRuleSetting[] = [
  { name: 'High packet rate detection', enabled: true, severity: 'high' },
  { name: 'Port scan detection', enabled: true, severity: 'medium' },
  { name: 'DNS tunneling detection', enabled: true, severity: 'critical' },
  { name: 'Brute force login', enabled: false, severity: 'high' },
  { name: 'Data exfiltration alert', enabled: true, severity: 'critical' },
  { name: 'Anomalous user behavior', enabled: false, severity: 'medium' },
];

const DEFAULT_INTEGRATIONS: IntegrationSetting[] = [
  { name: 'SIEM — Splunk', status: 'connected', icon: Server },
  { name: 'Firewall — Palo Alto', status: 'connected', icon: Shield },
  { name: 'Email Gateway', status: 'disconnected', icon: Mail },
  { name: 'Cloud — AWS', status: 'connected', icon: Cloud },
  { name: 'Webhook Endpoint', status: 'configured', icon: Webhook },
];

const THRESHOLDS = ['All', 'Critical Only', 'Critical + High', 'Critical + High + Medium'];

function loadState<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(`sentinel_${key}`);
    return stored ? JSON.parse(stored) : fallback;
  } catch { return fallback; }
}

function saveState(key: string, value: unknown) {
  localStorage.setItem(`sentinel_${key}`, JSON.stringify(value));
}

function getIntegrationIcon(name: string): typeof Server {
  const lower = name.toLowerCase();
  if (lower.includes('siem') || lower.includes('server')) return Server;
  if (lower.includes('firewall') || lower.includes('shield')) return Shield;
  if (lower.includes('email') || lower.includes('mail')) return Mail;
  if (lower.includes('cloud') || lower.includes('aws')) return Cloud;
  if (lower.includes('webhook')) return Webhook;
  return Server;
}

function hydrateIntegrations(integrations: IntegrationSetting[]): Integration[] {
  return integrations.map((integration) => ({
    ...integration,
    icon: getIntegrationIcon(integration.name),
  }));
}

function stripIntegrations(integrations: Integration[]): IntegrationSetting[] {
  return integrations.map(({ name, status }) => ({ name, status }));
}

const SettingsPage = () => {
  const [rules, setRules] = useState<DetectionRuleSetting[]>(() => loadState('rules', DEFAULT_RULES));
  const [integrations, setIntegrations] = useState<Integration[]>(() => hydrateIntegrations(DEFAULT_INTEGRATIONS));
  const [notifications, setNotifications] = useState<NotificationChannelSetting[]>(() => loadState('notifications', [
    { name: 'Email', enabled: true, threshold: 'Critical + High' },
    { name: 'SMS', enabled: false, threshold: 'Critical Only' },
    { name: 'Slack', enabled: true, threshold: 'Critical + High' },
    { name: 'Webhook', enabled: true, threshold: 'All' },
  ]));
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleSeverity, setNewRuleSeverity] = useState('medium');
  const [backendMode, setBackendMode] = useState<'api' | 'mock'>('mock');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      const remote = await fetchSettings();
      if (cancelled) return;

      if (remote) {
        setRules(remote.rules);
        setNotifications(remote.notifications);
        setIntegrations(hydrateIntegrations(remote.integrations));
        setBackendMode('api');
      } else {
        setBackendMode('mock');
      }

      setIsReady(true);
    };

    loadSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist on change
  useEffect(() => { saveState('rules', rules); }, [rules]);
  useEffect(() => { saveState('notifications', notifications); }, [notifications]);
  useEffect(() => {
    if (!isReady) return;

    const handle = setTimeout(async () => {
      const saved = await saveSettings({
        rules,
        notifications,
        integrations: stripIntegrations(integrations),
      });

      setBackendMode(saved ? 'api' : 'mock');
    }, 400);

    return () => clearTimeout(handle);
  }, [rules, notifications, integrations, isReady]);

  const toggleRule = useCallback((index: number) => {
    setRules(prev => prev.map((r, i) => {
      if (i !== index) return r;
      const next = { ...r, enabled: !r.enabled };
      toast(next.enabled ? `Rule "${r.name}" enabled` : `Rule "${r.name}" disabled`);
      return next;
    }));
  }, []);

  const addRule = useCallback(() => {
    if (!newRuleName.trim()) return;
    setRules(prev => [...prev, { name: newRuleName.trim(), enabled: true, severity: newRuleSeverity }]);
    toast.success(`Rule "${newRuleName}" added`);
    setNewRuleName('');
  }, [newRuleName, newRuleSeverity]);

  const deleteRule = useCallback((index: number) => {
    const name = rules[index].name;
    setRules(prev => prev.filter((_, i) => i !== index));
    toast(`Rule "${name}" deleted`);
  }, [rules]);

  const toggleIntegration = useCallback((index: number) => {
    setIntegrations(prev => prev.map((intg, i) => {
      if (i !== index) return intg;
      const next = { ...intg, status: intg.status === 'connected' ? 'disconnected' as const : 'connected' as const };
      toast(next.status === 'connected' ? `${intg.name} connected` : `${intg.name} disconnected`);
      return next;
    }));
  }, []);

  const toggleNotification = useCallback((index: number) => {
    setNotifications(prev => prev.map((n, i) => i !== index ? n : { ...n, enabled: !n.enabled }));
  }, []);

  const cycleThreshold = useCallback((index: number) => {
    setNotifications(prev => prev.map((n, i) => {
      if (i !== index) return n;
      const currentIdx = THRESHOLDS.indexOf(n.threshold);
      const next = THRESHOLDS[(currentIdx + 1) % THRESHOLDS.length];
      toast(`${n.name} threshold: ${next}`);
      return { ...n, threshold: next };
    }));
  }, []);

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-lg font-mono font-bold text-foreground">SYSTEM CONFIGURATION</h1>
      <p className={`text-[11px] font-mono ${backendMode === 'api' ? 'text-success' : 'text-warning'}`}>
        {backendMode === 'api' ? 'Settings synced with backend API' : 'Backend unavailable, using local fallback'}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {/* Detection Rules */}
        <GlowCard
          hover={false}
          header={
            <>
              <PulsingDot color="cyan" />
              <span className="text-[13px] font-mono font-medium text-foreground">DETECTION RULES</span>
              <span className="ml-auto text-[10px] font-mono text-muted-foreground">{rules.filter(r => r.enabled).length}/{rules.length} active</span>
            </>
          }
        >
          <div className="space-y-2">
            {rules.map((rule, i) => (
              <div key={`${rule.name}-${i}`} className="flex items-center justify-between p-2 border border-border/30 rounded-sm">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleRule(i)}
                    className={`w-8 h-4 rounded-sm flex items-center cursor-pointer transition-colors ${rule.enabled ? 'bg-primary/20 justify-end' : 'bg-muted justify-start'}`}
                  >
                    <div className={`w-3 h-3 rounded-sm mx-0.5 transition-colors ${rule.enabled ? 'bg-primary' : 'bg-muted-foreground/50'}`} />
                  </button>
                  <span className={`text-[11px] font-mono ${rule.enabled ? 'text-foreground' : 'text-muted-foreground'}`}>{rule.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge severity={rule.severity}>{rule.severity}</StatusBadge>
                  <button onClick={() => deleteRule(i)} className="p-0.5 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
            {/* Add rule */}
            <div className="flex gap-2 mt-2 pt-2 border-t border-border/30">
              <input
                value={newRuleName}
                onChange={e => setNewRuleName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addRule()}
                placeholder="New rule name..."
                className="flex-1 px-2 py-1 bg-background border border-border rounded-sm text-[11px] font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
              />
              <select
                value={newRuleSeverity}
                onChange={e => setNewRuleSeverity(e.target.value)}
                className="px-2 py-1 bg-background border border-border rounded-sm text-[11px] font-mono text-foreground"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <button
                onClick={addRule}
                disabled={!newRuleName.trim()}
                className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-sm hover:bg-primary/20 disabled:opacity-30 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </GlowCard>

        {/* Integrations */}
        <GlowCard
          hover={false}
          header={
            <>
              <PulsingDot color="green" />
              <span className="text-[13px] font-mono font-medium text-foreground">INTEGRATIONS</span>
            </>
          }
        >
          <div className="space-y-2">
            {integrations.map((intg, i) => (
              <div
                key={intg.name}
                onClick={() => toggleIntegration(i)}
                className="flex items-center justify-between p-3 border border-border/30 rounded-sm hover:border-primary/20 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <intg.icon className="w-4 h-4 text-primary" />
                  <span className="text-[12px] font-mono text-foreground">{intg.name}</span>
                </div>
                <StatusBadge severity={intg.status === 'connected' ? 'mitigated' : intg.status === 'configured' ? 'info' : 'critical'}>
                  {intg.status}
                </StatusBadge>
              </div>
            ))}
          </div>
        </GlowCard>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Notifications */}
        <GlowCard
          hover={false}
          header={
            <>
              <Bell className="w-3.5 h-3.5 text-primary" />
              <span className="text-[13px] font-mono font-medium text-foreground">NOTIFICATION CHANNELS</span>
            </>
          }
        >
          <div className="space-y-2 text-[12px] font-mono">
            {notifications.map((ch, i) => (
              <div key={ch.name} className="flex items-center justify-between p-2 border border-border/30 rounded-sm">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleNotification(i)}
                    className={`w-8 h-4 rounded-sm flex items-center cursor-pointer transition-colors ${ch.enabled ? 'bg-success/20 justify-end' : 'bg-muted justify-start'}`}
                  >
                    <div className={`w-3 h-3 rounded-sm mx-0.5 transition-colors ${ch.enabled ? 'bg-success' : 'bg-muted-foreground/50'}`} />
                  </button>
                  <span className={ch.enabled ? 'text-foreground' : 'text-muted-foreground'}>{ch.name}</span>
                </div>
                <button
                  onClick={() => cycleThreshold(i)}
                  className="text-[10px] text-success hover:text-primary transition-colors cursor-pointer"
                >
                  {ch.threshold}
                </button>
              </div>
            ))}
          </div>
        </GlowCard>

        {/* User Management */}
        <GlowCard
          hover={false}
          header={
            <>
              <Users className="w-3.5 h-3.5 text-primary" />
              <span className="text-[13px] font-mono font-medium text-foreground">TEAM</span>
            </>
          }
        >
          <div className="space-y-2 text-[12px] font-mono">
            {[
              { name: 'J. Chen', role: 'Admin', active: true },
              { name: 'S. Kumar', role: 'Analyst', active: true },
              { name: 'M. Rodriguez', role: 'Analyst', active: false },
              { name: 'K. Williams', role: 'Viewer', active: true },
            ].map(u => (
              <div key={u.name} className="flex items-center justify-between p-2 border border-border/30 rounded-sm">
                <div className="flex items-center gap-2">
                  <PulsingDot color={u.active ? 'green' : 'amber'} size="sm" />
                  <span className="text-foreground">{u.name}</span>
                </div>
                <StatusBadge severity="info">{u.role}</StatusBadge>
              </div>
            ))}
          </div>
        </GlowCard>
      </div>
    </div>
  );
};

export default SettingsPage;
