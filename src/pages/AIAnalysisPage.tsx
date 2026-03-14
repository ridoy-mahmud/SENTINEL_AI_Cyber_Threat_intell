import { useState, useEffect, useRef, useCallback } from 'react';
import { GlowCard } from '@/components/shared/GlowCard';
import { PulsingDot } from '@/components/shared/PulsingDot';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const SAMPLE_PROMPTS = [
  "Analyze today's threats",
  "What's the risk level of 10.0.4.122?",
  "Generate weekly security report",
  "Explain the latest anomaly",
  "Show top threat actors targeting our sector",
];

const AI_RESPONSES: Record<string, string> = {
  default: `## Threat Analysis Summary

Based on current telemetry data, I've identified **14 anomalous events** in the last 24 hours.

### Key Findings:
- **3 Critical** alerts related to APT29 C2 communication patterns
- **Lateral movement** detected on subnet \`10.0.4.0/24\`
- Anomaly score peaked at **94.2** at 14:32 UTC

### Recommended Actions:
1. Isolate \`10.0.4.122\` — confirmed C2 beacon activity
2. Block egress traffic to \`185.234.xx.xx\` range
3. Rotate credentials for service accounts on SRV-12, SRV-15
4. Initiate full forensic capture on affected endpoints

*Confidence: 94.2% — Model: Isolation Forest v3.2*`,

  "analyze today's threats": `## Today's Threat Landscape

**Total Events Processed:** 1,247,832
**Anomalies Detected:** 23
**Critical Alerts:** 3

### Active Threats:
| Threat | Severity | Status |
|--------|----------|--------|
| APT29-CozyBear Intrusion | 🔴 Critical | Active |
| Emotet Variant C2 | 🟡 High | Investigating |
| Log4Shell Exploit Chain | 🔴 Critical | Active |

The primary concern is the APT29 campaign targeting our DMZ servers. The attack pattern matches known TTPs with lateral movement via compromised service accounts.`,

  "what's the risk level of 10.0.4.122?": `## Node Risk Assessment: \`10.0.4.122\`

**Risk Level: 🔴 CRITICAL (Score: 92/100)**

### Analysis:
- **C2 Beacon Activity** detected — communicating with known APT29 infrastructure
- **Anomalous DNS queries** — 847 unique domains in 24h (baseline: 12)
- **Data staging** detected — 2.3GB compressed archive created at 03:14 UTC
- **Credential harvesting** — Mimikatz signatures in memory

### Network Position:
- Subnet: \`10.0.4.0/24\` (Finance VLAN)
- Connected to 7 other hosts
- Access to DB-FINANCE-01 (contains PII)

### Immediate Action Required:
1. **ISOLATE** this endpoint immediately
2. Preserve volatile memory for forensics
3. Check lateral movement to connected hosts`,
};

const AIAnalysisPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, []);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const responseKey = Object.keys(AI_RESPONSES).find(k => text.toLowerCase().includes(k)) || 'default';
    const response = AI_RESPONSES[responseKey];

    setTimeout(() => {
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', content: response, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="p-4 h-[calc(100vh-6rem)] flex gap-3">
      {/* Chat */}
      <div className="flex-1 flex flex-col">
        <GlowCard
          className="flex-1 flex flex-col !p-0"
          hover={false}
          header={
            <>
              <PulsingDot color="cyan" />
              <span className="text-[13px] font-mono font-medium text-foreground">SENTINEL AI — THREAT ANALYST</span>
            </>
          }
        >
          <div ref={chatRef} className="flex-1 overflow-y-auto cyber-scrollbar p-4 space-y-4">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center gap-6">
                <div className="text-center">
                  <h2 className="text-lg font-mono font-bold text-primary mb-2">SENTINEL AI ANALYST</h2>
                  <p className="text-[12px] text-muted-foreground font-mono">Ask about threats, anomalies, network security, or generate reports.</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                  {SAMPLE_PROMPTS.map(prompt => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="px-3 py-1.5 text-[11px] font-mono bg-primary/5 text-primary border border-primary/15 rounded-sm hover:bg-primary/10 hover:border-primary/30 transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-sm text-[12px] font-mono ${
                  msg.role === 'user'
                    ? 'bg-primary/10 text-foreground border border-primary/15'
                    : 'bg-card border border-border'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <div className="mt-1 text-[9px] text-muted-foreground">
                    {msg.timestamp.toLocaleTimeString('en', { hour12: false })}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-card border border-border p-3 rounded-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-threat-pulse" />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-threat-pulse" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-threat-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Input */}
          <div className="border-t border-border p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                placeholder="Ask SENTINEL AI..."
                className="flex-1 px-3 py-2 bg-background border border-border rounded-sm text-[12px] font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-all"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-sm hover:bg-primary/20 disabled:opacity-30 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </GlowCard>
      </div>

      {/* Report Cards */}
      <div className="w-64 space-y-3 flex-shrink-0">
        {['Daily Summary', 'Weekly Analysis', 'Monthly Report', 'Incident Report'].map(report => (
          <GlowCard key={report}>
            <div className="text-[12px] font-mono font-medium text-foreground mb-1">{report}</div>
            <div className="text-[10px] font-mono text-muted-foreground mb-3">Auto-generated from threat data</div>
            <button className="w-full px-3 py-1.5 text-[10px] font-mono bg-primary/5 text-primary border border-primary/15 rounded-sm hover:bg-primary/10 transition-all">
              GENERATE REPORT
            </button>
          </GlowCard>
        ))}
      </div>
    </div>
  );
};

export default AIAnalysisPage;
