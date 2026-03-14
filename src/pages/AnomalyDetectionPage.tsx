import { useState, useEffect } from 'react';
import { GlowCard } from '@/components/shared/GlowCard';
import { PulsingDot } from '@/components/shared/PulsingDot';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, ScatterChart, Scatter, Cell, Tooltip } from 'recharts';

const models = [
  { name: 'Isolation Forest', type: 'Point Anomalies', accuracy: 96.4, precision: 94.2, recall: 92.8, f1: 93.5, status: 'active' as const, lastTrained: '2h ago' },
  { name: 'Local Outlier Factor', type: 'Density-Based', accuracy: 94.8, precision: 91.5, recall: 89.3, f1: 90.4, status: 'active' as const, lastTrained: '4h ago' },
  { name: 'One-Class SVM', type: 'Novelty Detection', accuracy: 93.2, precision: 90.1, recall: 88.7, f1: 89.4, status: 'standby' as const, lastTrained: '12h ago' },
];

const features = [
  { name: 'Packet Size', importance: 0.92 },
  { name: 'Flow Duration', importance: 0.87 },
  { name: 'Byte Rate', importance: 0.81 },
  { name: 'Connection Count', importance: 0.76 },
  { name: 'Port Entropy', importance: 0.71 },
  { name: 'DNS Query Rate', importance: 0.65 },
  { name: 'Protocol Type', importance: 0.58 },
  { name: 'TCP Flags', importance: 0.52 },
];

function generateScatterData() {
  return Array.from({ length: 100 }, () => {
    const isAnomaly = Math.random() < 0.15;
    return {
      x: (Math.random() - 0.5) * 10 + (isAnomaly ? (Math.random() > 0.5 ? 5 : -5) : 0),
      y: (Math.random() - 0.5) * 10 + (isAnomaly ? (Math.random() > 0.5 ? 5 : -5) : 0),
      isAnomaly,
    };
  });
}

const AnomalyDetectionPage = () => {
  const [scatterData] = useState(generateScatterData);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const [isTraining, setIsTraining] = useState(false);

  const startTraining = () => {
    setIsTraining(true);
    setTrainingLogs([]);
    const logs = [
      '> Initializing training pipeline...',
      '> Loading dataset: 1,247,832 samples',
      '> Feature extraction: 23 features selected',
      '> Epoch 1/50 — loss: 0.4231 — acc: 0.8912',
      '> Epoch 10/50 — loss: 0.1847 — acc: 0.9342',
      '> Epoch 25/50 — loss: 0.0923 — acc: 0.9587',
      '> Epoch 40/50 — loss: 0.0412 — acc: 0.9714',
      '> Epoch 50/50 — loss: 0.0198 — acc: 0.9821',
      '> Validation accuracy: 96.4%',
      '> Model saved: isolation_forest_v3.2.pkl',
      '> ✓ Training complete.',
    ];
    logs.forEach((log, i) => {
      setTimeout(() => {
        setTrainingLogs(prev => [...prev, log]);
        if (i === logs.length - 1) setIsTraining(false);
      }, (i + 1) * 600);
    });
  };

  return (
    <div className="p-4 space-y-3">
      {/* Model Cards */}
      <div className="grid grid-cols-3 gap-3">
        {models.map(model => (
          <GlowCard
            key={model.name}
            glowColor={model.status === 'active' ? 'green' : 'cyan'}
            className={model.status === 'active' ? 'border-success/20' : ''}
            header={
              <>
                <PulsingDot color={model.status === 'active' ? 'green' : 'amber'} />
                <span className="text-[13px] font-mono font-medium text-foreground">{model.name}</span>
                <StatusBadge severity={model.status === 'active' ? 'mitigated' : 'info'} pulse={false}>
                  {model.status}
                </StatusBadge>
              </>
            }
          >
            <div className="text-[11px] font-mono text-muted-foreground mb-3">{model.type}</div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              {[
                { label: 'Accuracy', value: model.accuracy },
                { label: 'Precision', value: model.precision },
                { label: 'Recall', value: model.recall },
                { label: 'F1 Score', value: model.f1 },
              ].map(m => (
                <div key={m.label} className="bg-muted/30 p-2 rounded-sm">
                  <div className="text-muted-foreground text-[10px]">{m.label}</div>
                  <AnimatedCounter value={m.value} decimals={1} suffix="%" className="text-foreground font-bold text-sm" />
                </div>
              ))}
            </div>
            <div className="mt-2 text-[10px] font-mono text-muted-foreground">Last trained: {model.lastTrained}</div>
          </GlowCard>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Scatter plot */}
        <GlowCard
          header={
            <>
              <PulsingDot color="cyan" />
              <span className="text-[13px] font-mono font-medium text-foreground">ANOMALY DETECTION — PCA PROJECTION</span>
            </>
          }
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <XAxis type="number" dataKey="x" tick={{ fill: 'hsl(220, 15%, 55%)', fontSize: 10 }} axisLine={{ stroke: 'hsl(186, 100%, 50%, 0.1)' }} tickLine={false} />
                <YAxis type="number" dataKey="y" tick={{ fill: 'hsl(220, 15%, 55%)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(228, 60%, 6%)', border: '1px solid hsl(186, 100%, 50%, 0.2)', borderRadius: '2px', fontSize: '11px', fontFamily: 'JetBrains Mono' }} />
                <Scatter data={scatterData} isAnimationActive={false}>
                  {scatterData.map((entry, i) => (
                    <Cell key={i} fill={entry.isAnomaly ? 'hsl(345, 100%, 50%)' : 'hsl(186, 100%, 50%)'} opacity={entry.isAnomaly ? 0.9 : 0.4} r={entry.isAnomaly ? 5 : 3} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-2 text-[10px] font-mono text-muted-foreground">
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" /> Normal</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-destructive" /> Anomaly</div>
          </div>
        </GlowCard>

        {/* Feature importance */}
        <GlowCard
          header={
            <>
              <PulsingDot color="cyan" />
              <span className="text-[13px] font-mono font-medium text-foreground">FEATURE IMPORTANCE</span>
            </>
          }
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={features} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 80 }}>
                <XAxis type="number" tick={{ fill: 'hsl(220, 15%, 55%)', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} domain={[0, 1]} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(220, 15%, 65%)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={80} />
                <Bar dataKey="importance" fill="hsl(186, 100%, 50%)" radius={[0, 2, 2, 0]} barSize={14} opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlowCard>
      </div>

      {/* Training Console */}
      <GlowCard
        header={
          <>
            <PulsingDot color={isTraining ? 'amber' : 'green'} />
            <span className="text-[13px] font-mono font-medium text-foreground">MODEL TRAINING CONSOLE</span>
            <button
              onClick={startTraining}
              disabled={isTraining}
              className="ml-auto px-3 py-1 text-[11px] font-mono bg-primary/10 text-primary border border-primary/20 rounded-sm hover:bg-primary/20 disabled:opacity-50 transition-colors"
            >
              {isTraining ? 'TRAINING...' : 'RETRAIN MODEL'}
            </button>
          </>
        }
      >
        <div className="bg-background/80 rounded-sm p-3 h-48 overflow-y-auto cyber-scrollbar font-mono text-[12px]">
          {trainingLogs.length === 0 && (
            <span className="text-muted-foreground">{'> Awaiting training command...'}</span>
          )}
          {trainingLogs.map((log, i) => (
            <div key={i} className={`${log.includes('✓') ? 'text-success' : log.includes('loss') ? 'text-primary' : 'text-success/70'} animate-fade-in`}>
              {log}
            </div>
          ))}
          {isTraining && <span className="inline-block w-2 h-4 bg-success animate-threat-pulse" />}
        </div>
      </GlowCard>
    </div>
  );
};

export default AnomalyDetectionPage;
