export interface NetworkPacket {
  id: string;
  timestamp: Date;
  sourceIP: string;
  destinationIP: string;
  sourcePort: number;
  destinationPort: number;
  protocol: 'TCP' | 'UDP' | 'HTTP' | 'HTTPS' | 'DNS' | 'SSH' | 'ICMP';
  packetSize: number;
  anomalyScore: number;
  status: 'normal' | 'suspicious' | 'malicious';
  geoLocation: { lat: number; lng: number; country: string };
}

export interface ThreatEvent {
  id: string;
  name: string;
  type: 'DDoS' | 'Malware' | 'Ransomware' | 'Phishing' | 'BruteForce' | 'ZeroDay' | 'APT' | 'DataExfiltration';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  description: string;
  sourceIPs: string[];
  targetAssets: string[];
  mitreAttackTechnique: string;
  detectedAt: Date;
  status: 'active' | 'mitigated' | 'investigating' | 'resolved';
  aiAnalysis: string;
  confidence: number;
}

export interface NetworkNode {
  id: string;
  type: 'server' | 'workstation' | 'iot' | 'firewall' | 'router' | 'external';
  ip: string;
  hostname: string;
  os: string;
  riskScore: number;
  isCompromised: boolean;
  openPorts: number[];
  connections: string[];
}

export interface AnomalyDetectionResult {
  id: string;
  timestamp: Date;
  modelUsed: 'IsolationForest' | 'LOF' | 'OneClassSVM';
  anomalyScore: number;
  isAnomaly: boolean;
  features: Record<string, number>;
  explanation: string;
}

export interface Alert {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
  relatedThreatId: string;
  affectedAssets: string[];
  timeline: { timestamp: Date; action: string; details: string }[];
}

export interface SystemHealth {
  cpu: number;
  memory: number;
  bandwidth: number;
  modelAccuracy: number;
}

export interface QuickStats {
  totalEvents: number;
  threatsDetected: number;
  threatsMitigated: number;
  falsePositiveRate: number;
  avgResponseTime: number;
}

export interface DetectionRuleSetting {
  name: string;
  enabled: boolean;
  severity: string;
}

export interface NotificationChannelSetting {
  name: string;
  enabled: boolean;
  threshold: string;
}

export interface IntegrationSetting {
  name: string;
  status: 'connected' | 'disconnected' | 'configured';
}

export interface SettingsState {
  rules: DetectionRuleSetting[];
  notifications: NotificationChannelSetting[];
  integrations: IntegrationSetting[];
}

export type SeverityColor = 'critical' | 'high' | 'medium' | 'low' | 'info';
