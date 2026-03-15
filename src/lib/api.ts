import type {
  Alert,
  NetworkPacket,
  QuickStats,
  SettingsState,
  SystemHealth,
  ThreatEvent,
} from "@/lib/types";

export interface TelemetrySnapshot {
  packets?: NetworkPacket[];
  threats?: ThreatEvent[];
  health?: SystemHealth;
  stats?: QuickStats;
  anomalyTimeline?: { time: string; score: number }[];
  severityDist?: { name: string; value: number; fill: string }[];
  mapConnections?: Array<{
    id: string;
    source: { lat: number; lng: number; country: string };
    target: { lat: number; lng: number; country: string };
    severity: "critical" | "high" | "medium";
    type: string;
  }>;
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const TELEMETRY_WS_URL = import.meta.env.VITE_TELEMETRY_WS_URL ?? "";

function buildUrl(path: string): string {
  if (!API_BASE) return path;
  return `${API_BASE}${path}`;
}

function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number")
    return new Date(value);
  return new Date();
}

function normalizePacket(packet: NetworkPacket): NetworkPacket {
  return {
    ...packet,
    timestamp: toDate(packet.timestamp),
  };
}

function normalizeThreat(threat: ThreatEvent): ThreatEvent {
  return {
    ...threat,
    detectedAt: toDate(threat.detectedAt),
  };
}

function normalizeAlert(alert: Alert): Alert {
  return {
    ...alert,
    createdAt: toDate(alert.createdAt),
    updatedAt: toDate(alert.updatedAt),
    timeline: alert.timeline.map((item) => ({
      ...item,
      timestamp: toDate(item.timestamp),
    })),
  };
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(buildUrl(path), {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return response.json() as Promise<T>;
}

export async function fetchTelemetrySnapshot(): Promise<TelemetrySnapshot | null> {
  try {
    const data = await getJson<TelemetrySnapshot>("/api/telemetry/snapshot");
    return {
      ...data,
      packets: data.packets?.map(normalizePacket),
      threats: data.threats?.map(normalizeThreat),
    };
  } catch {
    return null;
  }
}

interface AiAnalyzeResponse {
  response: string;
}

export async function requestAiAnalysis(
  input: string,
  history: Array<{ role: "user" | "ai"; content: string }>,
): Promise<string | null> {
  try {
    const response = await fetch(buildUrl("/api/ai/analyze"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ input, history }),
    });

    if (!response.ok) throw new Error(`AI request failed (${response.status})`);
    const payload = (await response.json()) as AiAnalyzeResponse;
    return payload.response || null;
  } catch {
    return null;
  }
}

export function connectTelemetrySocket(
  onSnapshot: (snapshot: TelemetrySnapshot) => void,
): (() => void) | null {
  if (!TELEMETRY_WS_URL) return null;

  const ws = new WebSocket(TELEMETRY_WS_URL);
  ws.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data) as TelemetrySnapshot;
      onSnapshot({
        ...parsed,
        packets: parsed.packets?.map(normalizePacket),
        threats: parsed.threats?.map(normalizeThreat),
      });
    } catch {
      // Ignore malformed socket payloads.
    }
  };

  return () => {
    if (
      ws.readyState === WebSocket.OPEN ||
      ws.readyState === WebSocket.CONNECTING
    ) {
      ws.close();
    }
  };
}

interface AlertsResponse {
  alerts: Alert[];
}

export async function fetchAlerts(): Promise<Alert[] | null> {
  try {
    const data = await getJson<AlertsResponse>("/api/alerts");
    return data.alerts.map(normalizeAlert);
  } catch {
    return null;
  }
}

interface AlertActionResponse {
  alert: Alert;
}

export async function applyAlertAction(
  alertId: string,
  action: "acknowledge" | "investigate" | "resolve" | "dismiss",
): Promise<Alert | null> {
  try {
    const response = await fetch(buildUrl(`/api/alerts/${alertId}/action`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ action }),
    });

    if (!response.ok) throw new Error(`Alert action failed (${response.status})`);
    const payload = (await response.json()) as AlertActionResponse;
    return normalizeAlert(payload.alert);
  } catch {
    return null;
  }
}

export async function fetchSettings(): Promise<SettingsState | null> {
  try {
    return await getJson<SettingsState>("/api/settings");
  } catch {
    return null;
  }
}

export async function saveSettings(settings: SettingsState): Promise<SettingsState | null> {
  try {
    const response = await fetch(buildUrl("/api/settings"), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(settings),
    });
    if (!response.ok) throw new Error(`Saving settings failed (${response.status})`);
    return (await response.json()) as SettingsState;
  } catch {
    return null;
  }
}

interface ThreatIntelResponse {
  threats: ThreatEvent[];
}

export interface ThreatIntelQuery {
  search?: string;
  severity?: string;
  type?: string;
  status?: string;
  sort?: "name" | "severity" | "confidence" | "type";
  direction?: "asc" | "desc";
}

export async function fetchThreatIntel(query: ThreatIntelQuery = {}): Promise<ThreatEvent[] | null> {
  try {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    const path = `/api/threat-intel${params.toString() ? `?${params.toString()}` : ""}`;
    const data = await getJson<ThreatIntelResponse>(path);
    return data.threats.map(normalizeThreat);
  } catch {
    return null;
  }
}
