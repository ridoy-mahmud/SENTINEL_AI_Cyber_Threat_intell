import { QuickStatsBar } from "@/components/dashboard/QuickStatsBar";
import { ThreatMap } from "@/components/dashboard/ThreatMap";
import { LiveTrafficFeed } from "@/components/dashboard/LiveTrafficFeed";
import { ThreatSeverityChart } from "@/components/dashboard/ThreatSeverityChart";
import { AnomalyTimeline } from "@/components/dashboard/AnomalyTimeline";
import { TopThreatsPanel } from "@/components/dashboard/TopThreatsPanel";
import { SystemHealthCards } from "@/components/dashboard/SystemHealthCards";
import { useRealTimeData } from "@/hooks/useRealTimeData";

const Dashboard = () => {
  const {
    packets,
    threats,
    health,
    stats,
    anomalyTimeline,
    severityDist,
    mapConnections,
    dataSource,
    hasLiveConnection,
  } = useRealTimeData();

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-end text-[10px] font-mono text-muted-foreground">
        DATA SOURCE:
        <span
          className={`ml-2 px-2 py-0.5 rounded-sm border ${dataSource === "api" ? "text-success border-success/40 bg-success/10" : "text-warning border-warning/40 bg-warning/10"}`}
        >
          {dataSource.toUpperCase()}
        </span>
        <span
          className={`ml-2 ${hasLiveConnection ? "text-success" : "text-muted-foreground"}`}
        >
          {hasLiveConnection ? "LIVE STREAM CONNECTED" : "LIVE STREAM OFFLINE"}
        </span>
      </div>
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
