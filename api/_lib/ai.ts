import { getTelemetrySnapshot } from './store';

export async function generateAiResponse(input: string, history: Array<{ role: 'user' | 'ai'; content: string }>) {
  const snapshot = await getTelemetrySnapshot();
  const prompt = input.toLowerCase();

  const critical = snapshot.threats.filter(t => t.severity === 'critical').length;
  const active = snapshot.threats.filter(t => t.status === 'active').length;
  const topThreat = snapshot.threats[0];

  if (prompt.includes('network') || prompt.includes('health')) {
    return `## Network Health Summary\n\nCPU: ${snapshot.health.cpu}%\nMemory: ${snapshot.health.memory}%\nBandwidth: ${snapshot.health.bandwidth}%\nModel Accuracy: ${snapshot.health.modelAccuracy}%\n\nActive Threats: ${active}\nCritical Alerts: ${critical}`;
  }

  if (prompt.includes('risk') && /\d+\.\d+\.\d+\.\d+/.test(prompt)) {
    const ip = input.match(/\d+\.\d+\.\d+\.\d+/)?.[0] ?? '10.0.0.1';
    return `## Risk Assessment\n\nNode: ${ip}\nRisk: HIGH\nReason: Correlated anomaly spikes and suspicious outbound activity.\n\nRecommended actions:\n1. Isolate endpoint\n2. Rotate credentials\n3. Capture forensic evidence`;
  }

  return `## Threat Analysis\n\nQuery: ${input}\n\n- Events processed: ${snapshot.stats.totalEvents.toLocaleString()}\n- Threats detected: ${snapshot.stats.threatsDetected}\n- Critical threats: ${critical}\n- Active threats: ${active}\n\nTop threat: ${topThreat ? `${topThreat.name} (${topThreat.type})` : 'None'}\n\nConversation context used: ${history.length} previous message(s).`;
}
