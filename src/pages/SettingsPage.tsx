import { GlowCard } from '@/components/shared/GlowCard';
import { PulsingDot } from '@/components/shared/PulsingDot';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Shield, Server, Mail, Cloud, Webhook, Bell, Users, ToggleLeft } from 'lucide-react';

const INTEGRATIONS = [
  { name: 'SIEM — Splunk', status: 'connected', icon: Server },
  { name: 'Firewall — Palo Alto', status: 'connected', icon: Shield },
  { name: 'Email Gateway', status: 'disconnected', icon: Mail },
  { name: 'Cloud — AWS', status: 'connected', icon: Cloud },
  { name: 'Webhook Endpoint', status: 'configured', icon: Webhook },
];

const RULES = [
  { name: 'High packet rate detection', enabled: true, severity: 'high' },
  { name: 'Port scan detection', enabled: true, severity: 'medium' },
  { name: 'DNS tunneling detection', enabled: true, severity: 'critical' },
  { name: 'Brute force login', enabled: false, severity: 'high' },
  { name: 'Data exfiltration alert', enabled: true, severity: 'critical' },
  { name: 'Anomalous user behavior', enabled: false, severity: 'medium' },
];

const SettingsPage = () => {
  return (
    <div className="p-4 space-y-3">
      <h1 className="text-lg font-mono font-bold text-foreground">SYSTEM CONFIGURATION</h1>

      <div className="grid grid-cols-2 gap-3">
        {/* Detection Rules */}
        <GlowCard
          hover={false}
          header={
            <>
              <PulsingDot color="cyan" />
              <span className="text-[13px] font-mono font-medium text-foreground">DETECTION RULES</span>
            </>
          }
        >
          <div className="space-y-2">
            {RULES.map(rule => (
              <div key={rule.name} className="flex items-center justify-between p-2 border border-border/30 rounded-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-4 rounded-sm flex items-center cursor-pointer transition-colors ${rule.enabled ? 'bg-primary/20 justify-end' : 'bg-muted justify-start'}`}>
                    <div className={`w-3 h-3 rounded-sm mx-0.5 ${rule.enabled ? 'bg-primary' : 'bg-muted-foreground/50'}`} />
                  </div>
                  <span className="text-[11px] font-mono text-foreground">{rule.name}</span>
                </div>
                <StatusBadge severity={rule.severity}>{rule.severity}</StatusBadge>
              </div>
            ))}
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
            {INTEGRATIONS.map(intg => (
              <div key={intg.name} className="flex items-center justify-between p-3 border border-border/30 rounded-sm hover:border-primary/20 transition-all cursor-pointer">
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
            {['Email', 'SMS', 'Slack', 'Webhook'].map(ch => (
              <div key={ch} className="flex items-center justify-between p-2 border border-border/30 rounded-sm">
                <span className="text-foreground">{ch}</span>
                <span className="text-[10px] text-success">Critical + High</span>
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
