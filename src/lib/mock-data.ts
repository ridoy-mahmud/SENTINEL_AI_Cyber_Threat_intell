import type { NetworkPacket, ThreatEvent, NetworkNode, Alert, SystemHealth, QuickStats } from './types';

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const PROTOCOLS: NetworkPacket['protocol'][] = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'DNS', 'SSH', 'ICMP'];
const STATUSES: NetworkPacket['status'][] = ['normal', 'normal', 'normal', 'normal', 'suspicious', 'malicious'];

const COUNTRIES = [
  { country: 'United States', lat: 38.9, lng: -77.0 },
  { country: 'Russia', lat: 55.7, lng: 37.6 },
  { country: 'China', lat: 39.9, lng: 116.4 },
  { country: 'Germany', lat: 52.5, lng: 13.4 },
  { country: 'Brazil', lat: -15.8, lng: -47.9 },
  { country: 'Japan', lat: 35.7, lng: 139.7 },
  { country: 'India', lat: 28.6, lng: 77.2 },
  { country: 'UK', lat: 51.5, lng: -0.1 },
  { country: 'Iran', lat: 35.7, lng: 51.4 },
  { country: 'North Korea', lat: 39.0, lng: 125.7 },
  { country: 'Australia', lat: -33.9, lng: 151.2 },
  { country: 'France', lat: 48.9, lng: 2.3 },
];

const THREAT_NAMES = [
  'APT29-CozyBear Intrusion', 'Emotet Variant C2', 'Log4Shell Exploit Chain',
  'SolarWinds Backdoor', 'REvil Ransomware', 'Lazarus Group Campaign',
  'Cobalt Strike Beacon', 'Mimikatz Credential Dump', 'BlueKeep RDP Exploit',
  'WannaCry Propagation', 'Pegasus Spyware Vector', 'DarkSide Ransomware',
  'Hafnium Exchange Exploit', 'Stuxnet Variant Detection', 'NotPetya Wiper',
];

const MITRE_TECHNIQUES = [
  'T1566 - Phishing', 'T1059 - Command & Scripting', 'T1071 - Application Layer Protocol',
  'T1078 - Valid Accounts', 'T1486 - Data Encrypted for Impact', 'T1021 - Remote Services',
  'T1053 - Scheduled Task', 'T1055 - Process Injection', 'T1003 - OS Credential Dumping',
  'T1190 - Exploit Public-Facing App',
];

const ANALYSTS = ['J. Chen', 'S. Kumar', 'M. Rodriguez', 'A. Petrov', 'K. Williams'];

let packetId = 0;
let threatId = 0;
let alertId = 0;

export function generateIP(internal = false): string {
  if (internal) {
    return `10.${rand(0, 255)}.${rand(1, 254)}.${rand(1, 254)}`;
  }
  return `${rand(1, 223)}.${rand(0, 255)}.${rand(0, 255)}.${rand(1, 254)}`;
}

export function generatePacket(): NetworkPacket {
  const status = pick(STATUSES);
  const geo = pick(COUNTRIES);
  return {
    id: `PKT-${++packetId}`,
    timestamp: new Date(),
    sourceIP: generateIP(Math.random() > 0.4),
    destinationIP: generateIP(Math.random() > 0.6),
    sourcePort: rand(1024, 65535),
    destinationPort: pick([80, 443, 22, 53, 8080, 3389, 445, 25]),
    protocol: pick(PROTOCOLS),
    packetSize: rand(64, 9000),
    anomalyScore: status === 'malicious' ? rand(75, 100) : status === 'suspicious' ? rand(40, 74) : rand(0, 39),
    status,
    geoLocation: geo,
  };
}

export function generateThreat(): ThreatEvent {
  const types: ThreatEvent['type'][] = ['DDoS', 'Malware', 'Ransomware', 'Phishing', 'BruteForce', 'ZeroDay', 'APT', 'DataExfiltration'];
  const severities: ThreatEvent['severity'][] = ['critical', 'high', 'medium', 'low', 'info'];
  const type = pick(types);
  return {
    id: `THR-${String(++threatId).padStart(4, '0')}`,
    name: pick(THREAT_NAMES),
    type,
    severity: pick(severities.slice(0, 3)),
    description: `Detected ${type} activity targeting internal infrastructure with advanced evasion techniques.`,
    sourceIPs: Array.from({ length: rand(1, 4) }, () => generateIP()),
    targetAssets: Array.from({ length: rand(1, 3) }, () => `SRV-${rand(1, 50)}`),
    mitreAttackTechnique: pick(MITRE_TECHNIQUES),
    detectedAt: new Date(Date.now() - rand(0, 86400000)),
    status: pick(['active', 'investigating', 'mitigated']),
    aiAnalysis: `AI analysis indicates this ${type} attack originates from a known threat actor group. The attack pattern matches previously observed TTPs with ${rand(85, 99)}% confidence. Recommended action: isolate affected systems and initiate incident response protocol.`,
    confidence: rand(70, 99) / 100,
  };
}

export function generateInitialThreats(count = 5): ThreatEvent[] {
  return Array.from({ length: count }, () => generateThreat());
}

export function generateAlert(threat?: ThreatEvent): Alert {
  const t = threat || generateThreat();
  return {
    id: `ALT-${String(++alertId).padStart(4, '0')}`,
    title: `${t.severity.toUpperCase()} - ${t.name}`,
    severity: t.severity === 'info' ? 'low' : t.severity as Alert['severity'],
    type: t.type,
    status: pick(['new', 'investigating', 'resolved', 'false_positive']),
    assignedTo: pick(ANALYSTS),
    createdAt: t.detectedAt,
    updatedAt: new Date(),
    relatedThreatId: t.id,
    affectedAssets: t.targetAssets,
    timeline: [
      { timestamp: t.detectedAt, action: 'Detection', details: 'Anomaly detected by ML engine' },
      { timestamp: new Date(t.detectedAt.getTime() + 60000), action: 'Alert Created', details: 'Automated alert generated' },
      { timestamp: new Date(t.detectedAt.getTime() + 180000), action: 'Assigned', details: `Assigned to ${pick(ANALYSTS)}` },
    ],
  };
}

export function generateSystemHealth(): SystemHealth {
  return {
    cpu: rand(25, 78),
    memory: rand(40, 85),
    bandwidth: rand(30, 92),
    modelAccuracy: rand(94, 99),
  };
}

export function generateQuickStats(): QuickStats {
  return {
    totalEvents: rand(120000, 250000),
    threatsDetected: rand(15, 45),
    threatsMitigated: rand(10, 35),
    falsePositiveRate: rand(1, 8) / 10,
    avgResponseTime: rand(12, 45) / 10,
  };
}

export function generateAnomalyTimelineData(hours = 24): { time: string; score: number }[] {
  return Array.from({ length: hours }, (_, i) => {
    const h = new Date(Date.now() - (hours - i) * 3600000);
    return {
      time: h.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
      score: rand(10, 95),
    };
  });
}

export function generateSeverityDistribution() {
  return [
    { name: 'Critical', value: rand(3, 12), fill: 'hsl(345, 100%, 50%)' },
    { name: 'High', value: rand(8, 25), fill: 'hsl(33, 100%, 50%)' },
    { name: 'Medium', value: rand(15, 40), fill: 'hsl(45, 100%, 55%)' },
    { name: 'Low', value: rand(20, 60), fill: 'hsl(186, 100%, 50%)' },
    { name: 'Info', value: rand(30, 80), fill: 'hsl(220, 15%, 55%)' },
  ];
}

export function generateNetworkNodes(count = 30): NetworkNode[] {
  const types: NetworkNode['type'][] = ['server', 'workstation', 'iot', 'firewall', 'router', 'external'];
  const oses = ['Ubuntu 22.04', 'Windows Server 2022', 'CentOS 8', 'pfSense', 'Cisco IOS', 'Unknown'];
  const nodes: NetworkNode[] = Array.from({ length: count }, (_, i) => ({
    id: `NODE-${i}`,
    type: pick(types),
    ip: generateIP(i < count * 0.7),
    hostname: `${pick(['web', 'db', 'app', 'fw', 'iot', 'ext'])}-${rand(1, 99)}`,
    os: pick(oses),
    riskScore: rand(0, 100),
    isCompromised: Math.random() < 0.1,
    openPorts: Array.from({ length: rand(1, 6) }, () => pick([22, 80, 443, 3306, 5432, 8080, 3389, 25, 53])),
    connections: [],
  }));
  // Wire up connections
  nodes.forEach(node => {
    const connCount = rand(1, 4);
    node.connections = Array.from({ length: connCount }, () => pick(nodes).id).filter(id => id !== node.id);
  });
  return nodes;
}

export function generateThreatMapConnections(count = 8) {
  return Array.from({ length: count }, () => {
    const src = pick(COUNTRIES);
    const dst = pick(COUNTRIES.filter(c => c.country !== src.country));
    return {
      id: `conn-${Math.random().toString(36).slice(2, 8)}`,
      source: src,
      target: dst,
      severity: pick(['critical', 'high', 'medium'] as const),
      type: pick(['DDoS', 'Malware', 'BruteForce', 'APT'] as const),
    };
  });
}
