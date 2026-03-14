import { useMemo } from 'react';
import { GlowCard } from '@/components/shared/GlowCard';
import { PulsingDot } from '@/components/shared/PulsingDot';

interface Connection {
  id: string;
  source: { lat: number; lng: number; country: string };
  target: { lat: number; lng: number; country: string };
  severity: 'critical' | 'high' | 'medium';
  type: string;
}

interface ThreatMapProps {
  connections: Connection[];
}

// Simple mercator projection
function project(lat: number, lng: number, w: number, h: number): [number, number] {
  const x = ((lng + 180) / 360) * w;
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = h / 2 - (mercN / Math.PI) * (h / 2);
  return [x, y];
}

const severityColors = {
  critical: '#ff0040',
  high: '#ff9500',
  medium: '#00f0ff',
};

// Simplified world landmass outlines as dots
const WORLD_DOTS = (() => {
  const dots: { x: number; y: number }[] = [];
  // Generate grid of dots that roughly match continents
  const landAreas = [
    // North America
    { latMin: 25, latMax: 60, lngMin: -130, lngMax: -60 },
    // South America
    { latMin: -55, latMax: 10, lngMin: -80, lngMax: -35 },
    // Europe
    { latMin: 35, latMax: 65, lngMin: -10, lngMax: 40 },
    // Africa
    { latMin: -35, latMax: 35, lngMin: -20, lngMax: 50 },
    // Asia
    { latMin: 10, latMax: 60, lngMin: 40, lngMax: 140 },
    // Australia
    { latMin: -40, latMax: -12, lngMin: 112, lngMax: 155 },
  ];

  landAreas.forEach(area => {
    for (let lat = area.latMin; lat <= area.latMax; lat += 4) {
      for (let lng = area.lngMin; lng <= area.lngMax; lng += 4) {
        dots.push({ x: lng, y: lat });
      }
    }
  });
  return dots;
})();

export function ThreatMap({ connections }: ThreatMapProps) {
  const W = 900;
  const H = 450;

  const projectedDots = useMemo(() =>
    WORLD_DOTS.map(d => {
      const [x, y] = project(d.y, d.x, W, H);
      return { x, y };
    }),
  []);

  const projectedConnections = useMemo(() =>
    connections.map(conn => {
      const [sx, sy] = project(conn.source.lat, conn.source.lng, W, H);
      const [tx, ty] = project(conn.target.lat, conn.target.lng, W, H);
      return { ...conn, sx, sy, tx, ty };
    }),
  [connections]);

  return (
    <GlowCard
      className="col-span-full"
      header={
        <>
          <PulsingDot color="red" />
          <span className="text-[13px] font-mono font-medium text-foreground">GLOBAL THREAT MAP</span>
          <span className="ml-auto text-[11px] text-muted-foreground font-mono">
            ACTIVE THREATS: {connections.length}
          </span>
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* Grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(186, 100%, 50%)" strokeWidth="0.2" opacity="0.1" />
          </pattern>
          {/* Animated dash for connections */}
          {projectedConnections.map((conn, i) => (
            <linearGradient key={`grad-${i}`} id={`connGrad-${i}`} x1={conn.sx} y1={conn.sy} x2={conn.tx} y2={conn.ty} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={severityColors[conn.severity]} stopOpacity="0.8" />
              <stop offset="100%" stopColor={severityColors[conn.severity]} stopOpacity="0.2" />
            </linearGradient>
          ))}
        </defs>

        <rect width={W} height={H} fill="url(#grid)" />

        {/* Land dots */}
        {projectedDots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r="1.5" fill="hsl(186, 100%, 50%)" opacity="0.12" />
        ))}

        {/* Connection lines */}
        {projectedConnections.map((conn, i) => {
          const midX = (conn.sx + conn.tx) / 2;
          const midY = Math.min(conn.sy, conn.ty) - 40;
          return (
            <g key={conn.id}>
              <path
                d={`M ${conn.sx} ${conn.sy} Q ${midX} ${midY} ${conn.tx} ${conn.ty}`}
                fill="none"
                stroke={`url(#connGrad-${i})`}
                strokeWidth="1.5"
                strokeDasharray="6 3"
                opacity="0.7"
              >
                <animate attributeName="stroke-dashoffset" from="18" to="0" dur="1.5s" repeatCount="indefinite" />
              </path>
              {/* Source dot */}
              <circle cx={conn.sx} cy={conn.sy} r="4" fill={severityColors[conn.severity]} opacity="0.3">
                <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx={conn.sx} cy={conn.sy} r="2.5" fill={severityColors[conn.severity]} />
              {/* Target dot */}
              <circle cx={conn.tx} cy={conn.ty} r="3" fill={severityColors[conn.severity]} opacity="0.6" />
            </g>
          );
        })}

        {/* Labels */}
        <text x="10" y="20" fill="hsl(186, 100%, 50%)" fontSize="10" fontFamily="JetBrains Mono" opacity="0.5">
          PACKETS: 1.2M/s
        </text>
        <text x={W - 10} y="20" fill="hsl(186, 100%, 50%)" fontSize="10" fontFamily="JetBrains Mono" opacity="0.5" textAnchor="end">
          UPTIME: 99.97%
        </text>
      </svg>
    </GlowCard>
  );
}
