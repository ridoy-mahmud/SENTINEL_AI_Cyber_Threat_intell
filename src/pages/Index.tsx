import { QuickStatsBar } from '@/components/dashboard/QuickStatsBar';
import { ThreatMap } from '@/components/dashboard/ThreatMap';
import { LiveTrafficFeed } from '@/components/dashboard/LiveTrafficFeed';
import { ThreatSeverityChart } from '@/components/dashboard/ThreatSeverityChart';
import { AnomalyTimeline } from '@/components/dashboard/AnomalyTimeline';
import { TopThreatsPanel } from '@/components/dashboard/TopThreatsPanel';
import { SystemHealthCards } from '@/components/dashboard/SystemHealthCards';
import { useRealTimeData } from '@/hooks/useRealTimeData';

const Dashboard = () => {
  const { packets, threats, health, stats, anomalyTimeline, severityDist, mapConnections } = useRealTimeData();

  return (
    <div className="space-y-3 p-4">
      <QuickStatsBar stats={stats} />
      <ThreatMap connections={mapConnections} />
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-4">
          <LiveTrafficFeed packets={packets} />
        </div>
        <div className="col-span-3">
          <ThreatSeverityChart data={severityDist} />
        </div>
        <div className="col-span-5">
          <TopThreatsPanel threats={threats} />
        </div>
      </div>
      <AnomalyTimeline data={anomalyTimeline} />
      <SystemHealthCards health={health} />
    </div>
  );
};

export default Dashboard;
