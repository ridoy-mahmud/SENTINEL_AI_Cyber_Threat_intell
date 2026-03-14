import { useState, useEffect, useCallback, useRef } from 'react';
import {
  generatePacket, generateSystemHealth, generateQuickStats,
  generateAnomalyTimelineData, generateSeverityDistribution,
  generateInitialThreats, generateThreatMapConnections,
} from '@/lib/mock-data';
import type { NetworkPacket, ThreatEvent, SystemHealth, QuickStats } from '@/lib/types';

export function useRealTimeData() {
  const [packets, setPackets] = useState<NetworkPacket[]>([]);
  const [threats, setThreats] = useState<ThreatEvent[]>(() => generateInitialThreats(5));
  const [health, setHealth] = useState<SystemHealth>(() => generateSystemHealth());
  const [stats, setStats] = useState<QuickStats>(() => generateQuickStats());
  const [anomalyTimeline, setAnomalyTimeline] = useState(() => generateAnomalyTimelineData());
  const [severityDist, setSeverityDist] = useState(() => generateSeverityDistribution());
  const [mapConnections, setMapConnections] = useState(() => generateThreatMapConnections());
  const intervalRef = useRef<number>();

  const tick = useCallback(() => {
    // Add new packet
    setPackets(prev => {
      const newPacket = generatePacket();
      const updated = [newPacket, ...prev];
      return updated.slice(0, 50); // Keep last 50
    });

    // Occasionally update other data
    if (Math.random() < 0.3) setHealth(generateSystemHealth());
    if (Math.random() < 0.1) {
      setStats(prev => ({
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
    // Initial packets
    setPackets(Array.from({ length: 20 }, () => generatePacket()));

    intervalRef.current = window.setInterval(tick, 2000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tick]);

  return { packets, threats, health, stats, anomalyTimeline, severityDist, mapConnections };
}
