import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { GlowCard } from "@/components/shared/GlowCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PulsingDot } from "@/components/shared/PulsingDot";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { generateNetworkNodes } from "@/lib/mock-data";
import type { NetworkNode } from "@/lib/types";

interface GraphNode extends NetworkNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const typeColors: Record<string, string> = {
  server: "#00f0ff",
  workstation: "#00ff88",
  iot: "#a855f7",
  firewall: "#3b82f6",
  router: "#6366f1",
  external: "#64748b",
};

const NetworkPage = () => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>();

  const rawNodes = useMemo(() => generateNetworkNodes(40), []);

  useEffect(() => {
    const graphNodes: GraphNode[] = rawNodes.map((n, i) => ({
      ...n,
      x: 200 + Math.cos(i * 0.5) * (150 + Math.random() * 200),
      y: 200 + Math.sin(i * 0.5) * (150 + Math.random() * 200),
      vx: 0,
      vy: 0,
    }));
    setNodes(graphNodes);
  }, [rawNodes]);

  // Simple force simulation
  useEffect(() => {
    if (!nodes.length) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const localNodes = [...nodes];

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Draw grid
      ctx.strokeStyle = "rgba(0, 240, 255, 0.03)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Draw edges
      localNodes.forEach((node) => {
        node.connections.forEach((connId) => {
          const target = localNodes.find((n) => n.id === connId);
          if (!target) return;
          const risk = Math.max(node.riskScore, target.riskScore);
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(target.x, target.y);
          ctx.strokeStyle =
            risk > 70
              ? "rgba(255, 0, 64, 0.2)"
              : risk > 40
                ? "rgba(255, 149, 0, 0.15)"
                : "rgba(0, 240, 255, 0.1)";
          ctx.lineWidth = Math.max(0.5, risk / 50);
          ctx.stroke();
        });
      });

      // Draw nodes
      localNodes.forEach((node) => {
        const color = node.isCompromised
          ? "#ff0040"
          : typeColors[node.type] || "#64748b";
        const r = node.isCompromised ? 6 : 4;

        // Glow
        if (node.isCompromised || node.riskScore > 60) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, r + 4, 0, Math.PI * 2);
          ctx.fillStyle = node.isCompromised
            ? "rgba(255, 0, 64, 0.15)"
            : "rgba(0, 240, 255, 0.1)";
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [nodes]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);

      const clicked = nodes.find((n) => Math.hypot(n.x - x, n.y - y) < 10);
      setSelectedNode(clicked || null);
    },
    [nodes],
  );

  const totalConnections = nodes.reduce((s, n) => s + n.connections.length, 0);
  const compromised = nodes.filter((n) => n.isCompromised).length;
  const avgRisk = nodes.length
    ? Math.round(nodes.reduce((s, n) => s + n.riskScore, 0) / nodes.length)
    : 0;

  return (
    <div className="p-4 space-y-3 h-full flex flex-col">
      {/* Stats bar */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "TOTAL NODES", value: nodes.length, color: "text-primary" },
          {
            label: "CONNECTIONS",
            value: totalConnections,
            color: "text-primary",
          },
          {
            label: "COMPROMISED",
            value: compromised,
            color: "text-destructive",
          },
          {
            label: "AVG RISK",
            value: avgRisk,
            color: avgRisk > 50 ? "text-warning" : "text-success",
          },
          { label: "SEGMENTS", value: 6, color: "text-primary" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card/60 border border-border rounded-sm px-4 py-2 text-center"
          >
            <div className="text-[10px] font-mono text-muted-foreground">
              {s.label}
            </div>
            <AnimatedCounter
              value={s.value}
              className={`text-lg font-bold ${s.color}`}
            />
          </div>
        ))}
      </div>

      {/* Graph + details */}
      <div className="flex gap-3 flex-1 min-h-0">
        <GlowCard
          className="flex-1"
          header={
            <>
              <PulsingDot color="cyan" />
              <span className="text-[13px] font-mono font-medium text-foreground">
                NETWORK TOPOLOGY — GNN VISUALIZATION
              </span>
            </>
          }
        >
          <canvas
            ref={canvasRef}
            width={900}
            height={500}
            className="w-full h-auto cursor-crosshair"
            onClick={handleCanvasClick}
          />
          {/* Legend */}
          <div className="flex gap-4 mt-3 text-[10px] font-mono text-muted-foreground">
            {Object.entries(typeColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="uppercase">{type}</span>
              </div>
            ))}
          </div>
        </GlowCard>

        {/* Node detail panel */}
        {selectedNode && (
          <GlowCard
            className="w-72 flex-shrink-0"
            glowColor={selectedNode.isCompromised ? "red" : "cyan"}
            header={
              <>
                <PulsingDot
                  color={selectedNode.isCompromised ? "red" : "green"}
                />
                <span className="text-[13px] font-mono font-medium text-foreground">
                  NODE DETAILS
                </span>
              </>
            }
          >
            <div className="space-y-3 text-[12px] font-mono">
              <div>
                <span className="text-muted-foreground">Hostname:</span>
                <span className="ml-2 text-foreground">
                  {selectedNode.hostname}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">IP:</span>
                <span className="ml-2 text-foreground tabular-nums">
                  {selectedNode.ip}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span>
                <span className="ml-2">
                  <StatusBadge
                    severity={selectedNode.isCompromised ? "critical" : "info"}
                  >
                    {selectedNode.type}
                  </StatusBadge>
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">OS:</span>
                <span className="ml-2 text-foreground">{selectedNode.os}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Risk Score:</span>
                <span
                  className={`ml-2 font-bold ${selectedNode.riskScore > 70 ? "text-destructive" : selectedNode.riskScore > 40 ? "text-warning" : "text-success"}`}
                >
                  {selectedNode.riskScore}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Open Ports:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedNode.openPorts.map((p) => (
                    <span
                      key={p}
                      className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] rounded-sm border border-primary/20"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Connections:</span>
                <span className="ml-2 text-foreground">
                  {selectedNode.connections.length}
                </span>
              </div>
              {selectedNode.isCompromised && (
                <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-sm text-destructive text-[11px]">
                  ⚠ NODE COMPROMISED — Immediate investigation required
                </div>
              )}
            </div>
          </GlowCard>
        )}
      </div>
    </div>
  );
};

export default NetworkPage;
