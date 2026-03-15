import { useState, useEffect, useCallback, useRef } from "react";
import {
  generatePacket,
  generateSystemHealth,
  generateQuickStats,
  generateAnomalyTimelineData,
  generateSeverityDistribution,
  generateInitialThreats,
  generateThreatMapConnections,
} from "@/lib/mock-data";
import { connectTelemetrySocket, fetchTelemetrySnapshot } from "@/lib/api";
import type {
  NetworkPacket,
  ThreatEvent,
  SystemHealth,
  QuickStats,
} from "@/lib/types";

export function useRealTimeData() {
  const [packets, setPackets] = useState<NetworkPacket[]>([]);
  const [threats, setThreats] = useState<ThreatEvent[]>(() =>
    generateInitialThreats(5),
  );
  const [health, setHealth] = useState<SystemHealth>(() =>
    generateSystemHealth(),
  );
  const [stats, setStats] = useState<QuickStats>(() => generateQuickStats());
  const [anomalyTimeline, setAnomalyTimeline] = useState(() =>
    generateAnomalyTimelineData(),
  );
  const [severityDist, setSeverityDist] = useState(() =>
    generateSeverityDistribution(),
  );
  const [mapConnections, setMapConnections] = useState(() =>
    generateThreatMapConnections(),
  );
  const [dataSource, setDataSource] = useState<"mock" | "api">("mock");
  const [hasLiveConnection, setHasLiveConnection] = useState(false);
  const intervalRef = useRef<number>();

  const tick = useCallback(() => {
    // Add new packet
    setPackets((prev) => {
      const newPacket = generatePacket();
      const updated = [newPacket, ...prev];
      return updated.slice(0, 50); // Keep last 50
    });

    // Occasionally update other data
    if (Math.random() < 0.3) setHealth(generateSystemHealth());
    if (Math.random() < 0.1) {
      setStats((prev) => ({
        ...prev,
        totalEvents: prev.totalEvents + Math.floor(Math.random() * 100),
        threatsDetected: prev.threatsDetected + (Math.random() < 0.3 ? 1 : 0),
      }));
    }
    if (Math.random() < 0.05) {
      setAnomalyTimeline(generateAnomalyTimelineData());
    }
    if (Math.random() < 0.08) {
      setSeverityDist(generateSeverityDistribution());
    }
    if (Math.random() < 0.1) {
      setMapConnections(generateThreatMapConnections());
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const snapshot = await fetchTelemetrySnapshot();
      if (!snapshot || cancelled) {
        setDataSource("mock");
        return;
      }

      if (snapshot.packets?.length) setPackets(snapshot.packets.slice(0, 50));
      if (snapshot.threats?.length) setThreats(snapshot.threats);
      if (snapshot.health) setHealth(snapshot.health);
      if (snapshot.stats) setStats(snapshot.stats);
      if (snapshot.anomalyTimeline?.length)
        setAnomalyTimeline(snapshot.anomalyTimeline);
      if (snapshot.severityDist?.length) setSeverityDist(snapshot.severityDist);
      if (snapshot.mapConnections?.length)
        setMapConnections(snapshot.mapConnections);
      setDataSource("api");
    };

    bootstrap();

    // Initial packets
    setPackets(Array.from({ length: 20 }, () => generatePacket()));

    const disconnect = connectTelemetrySocket((snapshot) => {
      setHasLiveConnection(true);
      setDataSource("api");
      if (snapshot.packets?.length) setPackets(snapshot.packets.slice(0, 50));
      if (snapshot.threats?.length) setThreats(snapshot.threats);
      if (snapshot.health) setHealth(snapshot.health);
      if (snapshot.stats) setStats(snapshot.stats);
      if (snapshot.anomalyTimeline?.length)
        setAnomalyTimeline(snapshot.anomalyTimeline);
      if (snapshot.severityDist?.length) setSeverityDist(snapshot.severityDist);
      if (snapshot.mapConnections?.length)
        setMapConnections(snapshot.mapConnections);
    });

    intervalRef.current = window.setInterval(tick, 2000);
    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (disconnect) disconnect();
    };
  }, [tick]);

  return {
    packets,
    threats,
    health,
    stats,
    anomalyTimeline,
    severityDist,
    mapConnections,
    dataSource,
    hasLiveConnection,
  };
}
