import { Collection, Document, MongoClient } from 'mongodb';
import {
  generateAlert,
  generateAnomalyTimelineData,
  generateInitialThreats,
  generatePacket,
  generateQuickStats,
  generateSeverityDistribution,
  generateSystemHealth,
  generateThreatMapConnections,
} from '../../src/lib/mock-data';
import type { Alert, QuickStats, SystemHealth, ThreatEvent } from '../../src/lib/types';

type AlertStatusAction = 'acknowledge' | 'investigate' | 'resolve' | 'dismiss';

export interface SettingsState {
  rules: Array<{ name: string; enabled: boolean; severity: string }>;
  notifications: Array<{ name: string; enabled: boolean; threshold: string }>;
  integrations: Array<{ name: string; status: 'connected' | 'disconnected' | 'configured' }>;
}

const DEFAULT_SETTINGS: SettingsState = {
  rules: [
    { name: 'High packet rate detection', enabled: true, severity: 'high' },
    { name: 'Port scan detection', enabled: true, severity: 'medium' },
    { name: 'DNS tunneling detection', enabled: true, severity: 'critical' },
    { name: 'Brute force login', enabled: false, severity: 'high' },
    { name: 'Data exfiltration alert', enabled: true, severity: 'critical' },
    { name: 'Anomalous user behavior', enabled: false, severity: 'medium' },
  ],
  notifications: [
    { name: 'Email', enabled: true, threshold: 'Critical + High' },
    { name: 'SMS', enabled: false, threshold: 'Critical Only' },
    { name: 'Slack', enabled: true, threshold: 'Critical + High' },
    { name: 'Webhook', enabled: true, threshold: 'All' },
  ],
  integrations: [
    { name: 'SIEM - Splunk', status: 'connected' },
    { name: 'Firewall - Palo Alto', status: 'connected' },
    { name: 'Email Gateway', status: 'disconnected' },
    { name: 'Cloud - AWS', status: 'connected' },
    { name: 'Webhook Endpoint', status: 'configured' },
  ],
};

let memoryThreats: ThreatEvent[] = [];
let memoryAlerts: Alert[] = [];
let memorySettings: SettingsState = DEFAULT_SETTINGS;
let memoryInitialized = false;

const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || 'sentinel_ai';
let mongoClientPromise: Promise<MongoClient> | null = null;

function cloneSettings(settings: SettingsState): SettingsState {
  return JSON.parse(JSON.stringify(settings)) as SettingsState;
}

function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') return new Date(value);
  return new Date();
}

function normalizeThreat(threat: ThreatEvent): ThreatEvent {
  return { ...threat, detectedAt: toDate(threat.detectedAt) };
}

function normalizeAlert(alert: Alert): Alert {
  return {
    ...alert,
    createdAt: toDate(alert.createdAt),
    updatedAt: toDate(alert.updatedAt),
    timeline: alert.timeline.map(item => ({ ...item, timestamp: toDate(item.timestamp) })),
  };
}

function getClient(): Promise<MongoClient> | null {
  if (!MONGO_URI) return null;
  if (!mongoClientPromise) {
    mongoClientPromise = MongoClient.connect(MONGO_URI);
  }
  return mongoClientPromise;
}

async function withCollection<T>(name: string, fn: (collection: Collection<Document>) => Promise<T>): Promise<T | null> {
  const clientPromise = getClient();
  if (!clientPromise) return null;
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    return await fn(db.collection(name));
  } catch {
    return null;
  }
}

function ensureMemorySeeded() {
  if (memoryInitialized) return;
  memoryThreats = generateInitialThreats(20);
  memoryAlerts = memoryThreats.map(t => generateAlert(t));
  memorySettings = cloneSettings(DEFAULT_SETTINGS);
  memoryInitialized = true;
}

async function readThreats(): Promise<ThreatEvent[]> {
  const mongoThreats = await withCollection('threats', async collection => {
    const docs = await collection.find({}).limit(100).toArray();
    return docs as ThreatEvent[];
  });

  if (mongoThreats && mongoThreats.length > 0) return mongoThreats.map(normalizeThreat);

  ensureMemorySeeded();
  if (mongoThreats && mongoThreats.length === 0) {
    await withCollection('threats', async collection => {
      await collection.insertMany(memoryThreats);
      return true;
    });
  }
  return memoryThreats.map(normalizeThreat);
}

async function readAlerts(): Promise<Alert[]> {
  const mongoAlerts = await withCollection('alerts', async collection => {
    const docs = await collection.find({}).limit(200).toArray();
    return docs as Alert[];
  });

  if (mongoAlerts && mongoAlerts.length > 0) return mongoAlerts.map(normalizeAlert);

  ensureMemorySeeded();
  if (mongoAlerts && mongoAlerts.length === 0) {
    await withCollection('alerts', async collection => {
      await collection.insertMany(memoryAlerts);
      return true;
    });
  }
  return memoryAlerts.map(normalizeAlert);
}

async function writeAlerts(alerts: Alert[]) {
  memoryAlerts = alerts.map(normalizeAlert);
  await withCollection('alerts', async collection => {
    await collection.deleteMany({});
    if (alerts.length) await collection.insertMany(alerts);
    return true;
  });
}

async function readSettings(): Promise<SettingsState> {
  const mongoSettings = await withCollection('settings', async collection => {
    const doc = await collection.findOne({ key: 'global' });
    return doc?.value as SettingsState | undefined;
  });

  if (mongoSettings) return cloneSettings(mongoSettings);

  ensureMemorySeeded();
  await withCollection('settings', async collection => {
    await collection.updateOne(
      { key: 'global' },
      { $set: { key: 'global', value: memorySettings } },
      { upsert: true },
    );
    return true;
  });

  return cloneSettings(memorySettings);
}

async function writeSettings(settings: SettingsState) {
  memorySettings = cloneSettings(settings);
  await withCollection('settings', async collection => {
    await collection.updateOne(
      { key: 'global' },
      { $set: { key: 'global', value: settings } },
      { upsert: true },
    );
    return true;
  });
}

export async function getTelemetrySnapshot() {
  const threats = (await readThreats()).slice(0, 10);
  const packets = Array.from({ length: 30 }, () => generatePacket());

  return {
    packets,
    threats,
    health: generateSystemHealth() as SystemHealth,
    stats: generateQuickStats() as QuickStats,
    anomalyTimeline: generateAnomalyTimelineData(),
    severityDist: generateSeverityDistribution(),
    mapConnections: generateThreatMapConnections(),
  };
}

export async function getThreatIntel(params: {
  search?: string;
  severity?: string;
  type?: string;
  status?: string;
  sort?: 'name' | 'severity' | 'confidence' | 'type';
  direction?: 'asc' | 'desc';
}) {
  const threats = await readThreats();
  const q = (params.search || '').toLowerCase();

  const severityOrder: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
    info: 4,
  };

  const filtered = threats.filter(t => {
    if (q && !t.name.toLowerCase().includes(q) && !t.type.toLowerCase().includes(q) && !t.sourceIPs.some(ip => ip.includes(q))) {
      return false;
    }
    if (params.severity && params.severity !== 'all' && t.severity !== params.severity) return false;
    if (params.type && params.type !== 'all' && t.type !== params.type) return false;
    if (params.status && params.status !== 'all' && t.status !== params.status) return false;
    return true;
  });

  const sort = params.sort || 'severity';
  const direction = params.direction || 'asc';

  filtered.sort((a, b) => {
    let cmp = 0;
    if (sort === 'severity') cmp = (severityOrder[a.severity] ?? 5) - (severityOrder[b.severity] ?? 5);
    if (sort === 'confidence') cmp = a.confidence - b.confidence;
    if (sort === 'name') cmp = a.name.localeCompare(b.name);
    if (sort === 'type') cmp = a.type.localeCompare(b.type);
    return direction === 'desc' ? -cmp : cmp;
  });

  return filtered;
}

export async function getAlerts() {
  return readAlerts();
}

export async function updateAlert(alertId: string, action: AlertStatusAction) {
  const alerts = await readAlerts();
  const idx = alerts.findIndex(a => a.id === alertId);
  if (idx === -1) return null;

  const current = alerts[idx];
  const now = new Date();

  const transition = {
    acknowledge: { status: 'investigating' as const, action: 'Acknowledged', details: 'Alert acknowledged by analyst' },
    investigate: { status: 'investigating' as const, action: 'Investigation Started', details: 'Analyst began investigation' },
    resolve: { status: 'resolved' as const, action: 'Resolved', details: 'Incident resolved and closed' },
    dismiss: { status: 'false_positive' as const, action: 'Dismissed', details: 'Marked as false positive' },
  }[action];

  const next: Alert = {
    ...current,
    status: transition.status,
    updatedAt: now,
    timeline: [...current.timeline, { timestamp: now, action: transition.action, details: transition.details }],
  };

  alerts[idx] = next;
  await writeAlerts(alerts);
  return normalizeAlert(next);
}

export async function getSettings() {
  return readSettings();
}

export async function saveSettings(settings: SettingsState) {
  await writeSettings(settings);
  return readSettings();
}
