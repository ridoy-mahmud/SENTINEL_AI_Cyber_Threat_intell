import { useState, useMemo } from 'react';
import { GlowCard } from '@/components/shared/GlowCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PulsingDot } from '@/components/shared/PulsingDot';
import { generateInitialThreats } from '@/lib/mock-data';
import { Search, Filter } from 'lucide-react';

const MITRE_TACTICS = [
  { name: 'Reconnaissance', techniques: ['Active Scanning', 'Gather Victim Info', 'Search Open Databases'] },
  { name: 'Initial Access', techniques: ['Phishing', 'Exploit Public App', 'Valid Accounts', 'Supply Chain'] },
  { name: 'Execution', techniques: ['Command & Scripting', 'Exploitation for Exec', 'User Execution'] },
  { name: 'Persistence', techniques: ['Account Manipulation', 'Boot Autostart', 'Create Account', 'Scheduled Task'] },
  { name: 'Priv Escalation', techniques: ['Exploitation', 'Access Token Manip', 'Process Injection'] },
  { name: 'Defense Evasion', techniques: ['Obfuscated Files', 'Masquerading', 'Rootkit', 'Indicator Removal'] },
  { name: 'Lateral Movement', techniques: ['Remote Services', 'Internal Phishing', 'Exploitation'] },
  { name: 'Collection', techniques: ['Data from Info Repos', 'Screen Capture', 'Input Capture'] },
  { name: 'Exfiltration', techniques: ['Over C2 Channel', 'Over Web Service', 'Automated Exfil'] },
];

const THREAT_ACTORS = [
  { name: 'APT29 — Cozy Bear', country: 'Russia', malware: ['SolarWinds', 'WellMess'], targets: ['Government', 'Defense'], risk: 'critical' },
  { name: 'APT41 — Winnti', country: 'China', malware: ['ShadowPad', 'Cobalt Strike'], targets: ['Healthcare', 'Tech'], risk: 'high' },
  { name: 'Lazarus Group', country: 'North Korea', malware: ['WannaCry', 'DreamJob'], targets: ['Finance', 'Crypto'], risk: 'critical' },
  { name: 'FIN7', country: 'Russia', malware: ['Carbanak', 'REvil'], targets: ['Retail', 'Hospitality'], risk: 'high' },
];

const ThreatIntelPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const threats = useMemo(() => generateInitialThreats(15), []);

  const filtered = threats.filter(t =>
    !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 space-y-3">
      {/* Search bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search threats, IOCs, IPs, domains, hashes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-sm text-[13px] font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:shadow-glow-cyan transition-all"
          />
        </div>
        <button className="px-4 py-2 bg-card border border-border rounded-sm text-[12px] font-mono text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all flex items-center gap-2">
          <Filter className="w-3.5 h-3.5" /> FILTERS
        </button>
      </div>

      {/* Threat Feed Table */}
      <GlowCard
        hover={false}
        header={
          <>
            <PulsingDot color="red" />
            <span className="text-[13px] font-mono font-medium text-foreground">GLOBAL THREAT FEED</span>
            <span className="ml-auto text-[11px] text-muted-foreground font-mono">{filtered.length} results</span>
          </>
        }
      >
        <div className="max-h-[300px] overflow-y-auto cyber-scrollbar">
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr className="text-muted-foreground text-left border-b border-border">
                <th className="pb-2 pr-3">ID</th>
                <th className="pb-2 pr-3">THREAT</th>
                <th className="pb-2 pr-3">TYPE</th>
                <th className="pb-2 pr-3">SEVERITY</th>
                <th className="pb-2 pr-3">STATUS</th>
                <th className="pb-2">CONFIDENCE</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="border-b border-border/30 hover:bg-primary/5 cursor-pointer transition-colors">
                  <td className="py-2 pr-3 text-muted-foreground tabular-nums">{t.id}</td>
                  <td className="py-2 pr-3 text-foreground">{t.name}</td>
                  <td className="py-2 pr-3"><StatusBadge severity="info">{t.type}</StatusBadge></td>
                  <td className="py-2 pr-3"><StatusBadge severity={t.severity} pulse={t.severity === 'critical'}>{t.severity}</StatusBadge></td>
                  <td className="py-2 pr-3"><StatusBadge severity={t.status}>{t.status}</StatusBadge></td>
                  <td className="py-2 tabular-nums text-primary">{(t.confidence * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlowCard>

      {/* MITRE ATT&CK Matrix */}
      <GlowCard
        hover={false}
        header={
          <>
            <PulsingDot color="amber" />
            <span className="text-[13px] font-mono font-medium text-foreground">MITRE ATT&CK MATRIX</span>
          </>
        }
      >
        <div className="grid grid-cols-9 gap-1 overflow-x-auto">
          {MITRE_TACTICS.map(tactic => (
            <div key={tactic.name} className="min-w-[100px]">
              <div className="text-[10px] font-mono text-primary font-bold p-1.5 bg-primary/5 border border-primary/10 rounded-sm mb-1 text-center uppercase tracking-wider">
                {tactic.name}
              </div>
              {tactic.techniques.map(tech => {
                const heat = Math.random();
                return (
                  <div
                    key={tech}
                    className="text-[9px] font-mono p-1.5 mb-0.5 rounded-sm border border-border/30 cursor-pointer hover:border-primary/30 transition-colors"
                    style={{
                      backgroundColor: heat > 0.7 ? 'hsla(345, 100%, 50%, 0.15)' : heat > 0.4 ? 'hsla(33, 100%, 50%, 0.1)' : 'hsla(186, 100%, 50%, 0.05)',
                    }}
                  >
                    {tech}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </GlowCard>

      {/* Threat Actor Profiles */}
      <div className="grid grid-cols-4 gap-3">
        {THREAT_ACTORS.map(actor => (
          <GlowCard key={actor.name} glowColor={actor.risk === 'critical' ? 'red' : 'amber'}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-mono font-bold text-foreground">{actor.name}</span>
                <StatusBadge severity={actor.risk} pulse={actor.risk === 'critical'}>{actor.risk}</StatusBadge>
              </div>
              <div className="text-[10px] font-mono text-muted-foreground">Origin: {actor.country}</div>
              <div className="flex flex-wrap gap-1">
                {actor.malware.map(m => (
                  <span key={m} className="px-1.5 py-0.5 bg-destructive/10 text-destructive text-[9px] font-mono rounded-sm border border-destructive/15">{m}</span>
                ))}
              </div>
              <div className="text-[10px] font-mono text-muted-foreground">
                Targets: {actor.targets.join(', ')}
              </div>
            </div>
          </GlowCard>
        ))}
      </div>
    </div>
  );
};

export default ThreatIntelPage;
