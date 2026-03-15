import { Fragment, useState, useMemo, useCallback, useEffect } from "react";
import { GlowCard } from "@/components/shared/GlowCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PulsingDot } from "@/components/shared/PulsingDot";
import { generateInitialThreats } from "@/lib/mock-data";
import type { ThreatEvent } from "@/lib/types";
import { fetchThreatIntel } from "@/lib/api";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  X,
} from "lucide-react";
import { toast } from "sonner";

const MITRE_TACTICS = [
  {
    name: "Reconnaissance",
    techniques: [
      "Active Scanning",
      "Gather Victim Info",
      "Search Open Databases",
    ],
  },
  {
    name: "Initial Access",
    techniques: [
      "Phishing",
      "Exploit Public App",
      "Valid Accounts",
      "Supply Chain",
    ],
  },
  {
    name: "Execution",
    techniques: [
      "Command & Scripting",
      "Exploitation for Exec",
      "User Execution",
    ],
  },
  {
    name: "Persistence",
    techniques: [
      "Account Manipulation",
      "Boot Autostart",
      "Create Account",
      "Scheduled Task",
    ],
  },
  {
    name: "Priv Escalation",
    techniques: ["Exploitation", "Access Token Manip", "Process Injection"],
  },
  {
    name: "Defense Evasion",
    techniques: [
      "Obfuscated Files",
      "Masquerading",
      "Rootkit",
      "Indicator Removal",
    ],
  },
  {
    name: "Lateral Movement",
    techniques: ["Remote Services", "Internal Phishing", "Exploitation"],
  },
  {
    name: "Collection",
    techniques: ["Data from Info Repos", "Screen Capture", "Input Capture"],
  },
  {
    name: "Exfiltration",
    techniques: ["Over C2 Channel", "Over Web Service", "Automated Exfil"],
  },
];

const THREAT_ACTORS = [
  {
    name: "APT29 — Cozy Bear",
    country: "Russia",
    malware: ["SolarWinds", "WellMess"],
    targets: ["Government", "Defense"],
    risk: "critical" as const,
  },
  {
    name: "APT41 — Winnti",
    country: "China",
    malware: ["ShadowPad", "Cobalt Strike"],
    targets: ["Healthcare", "Tech"],
    risk: "high" as const,
  },
  {
    name: "Lazarus Group",
    country: "North Korea",
    malware: ["WannaCry", "DreamJob"],
    targets: ["Finance", "Crypto"],
    risk: "critical" as const,
  },
  {
    name: "FIN7",
    country: "Russia",
    malware: ["Carbanak", "REvil"],
    targets: ["Retail", "Hospitality"],
    risk: "high" as const,
  },
];

// Stable heat values per technique
const TECHNIQUE_HEAT = new Map<string, number>();
MITRE_TACTICS.forEach((t) =>
  t.techniques.forEach((tech) => TECHNIQUE_HEAT.set(tech, Math.random())),
);

type SortField = "name" | "severity" | "confidence" | "type";
type SortDir = "asc" | "desc";

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

const ThreatIntelPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("severity");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [expandedThreat, setExpandedThreat] = useState<string | null>(null);
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(
    null,
  );
  const [selectedActor, setSelectedActor] = useState<string | null>(null);

  const localThreats = useMemo(() => generateInitialThreats(15), []);
  const [threats, setThreats] = useState<ThreatEvent[]>(localThreats);
  const [backendMode, setBackendMode] = useState<"api" | "mock">("mock");

  useEffect(() => {
    let cancelled = false;

    const loadThreatIntel = async () => {
      const remote = await fetchThreatIntel({
        search: searchQuery || undefined,
        severity: severityFilter !== "all" ? severityFilter : undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        sort: sortField,
        direction: sortDir,
      });

      if (cancelled) return;

      if (remote) {
        setThreats(remote);
        setBackendMode("api");
        return;
      }

      setThreats(localThreats);
      setBackendMode("mock");
    };

    loadThreatIntel();
    return () => {
      cancelled = true;
    };
  }, [localThreats, searchQuery, severityFilter, typeFilter, statusFilter, sortField, sortDir]);

  const toggleSort = useCallback(
    (field: SortField) => {
      if (sortField === field)
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      else {
        setSortField(field);
        setSortDir("asc");
      }
    },
    [sortField],
  );

  const filtered = useMemo(() => {
    const result = threats.filter((t) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !t.name.toLowerCase().includes(q) &&
          !t.type.toLowerCase().includes(q) &&
          !t.sourceIPs.some((ip) => ip.includes(q))
        )
          return false;
      }
      if (severityFilter !== "all" && t.severity !== severityFilter)
        return false;
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      return true;
    });
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "severity")
        cmp =
          (SEVERITY_ORDER[a.severity] ?? 5) - (SEVERITY_ORDER[b.severity] ?? 5);
      else if (sortField === "confidence") cmp = a.confidence - b.confidence;
      else if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "type") cmp = a.type.localeCompare(b.type);
      return sortDir === "desc" ? -cmp : cmp;
    });
    return result;
  }, [
    threats,
    searchQuery,
    severityFilter,
    typeFilter,
    statusFilter,
    sortField,
    sortDir,
  ]);

  const clearFilters = () => {
    setSeverityFilter("all");
    setTypeFilter("all");
    setStatusFilter("all");
    setSearchQuery("");
    toast("Filters cleared");
  };

  const hasActiveFilters =
    severityFilter !== "all" || typeFilter !== "all" || statusFilter !== "all";
  const threatTypes = [...new Set(threats.map((t) => t.type))];

  const handleTechniqueClick = (tech: string) => {
    setSelectedTechnique(selectedTechnique === tech ? null : tech);
    const relatedThreats = threats.filter(
      (t) =>
        t.mitreAttackTechnique.includes(tech.split(" ")[0]) ||
        Math.random() < 0.3,
    );
    if (relatedThreats.length > 0) {
      toast(`${tech}: ${relatedThreats.length} related threat(s) detected`);
    }
  };

  return (
    <div className="p-4 space-y-3">
      {/* Search + Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search threats, IOCs, IPs, domains, hashes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-sm text-[13px] font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:shadow-glow-cyan transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 bg-card border rounded-sm text-[12px] font-mono flex items-center gap-2 transition-all ${
            showFilters || hasActiveFilters
              ? "border-primary/30 text-primary"
              : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
          }`}
        >
          <Filter className="w-3.5 h-3.5" /> FILTERS {hasActiveFilters && "•"}
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 bg-card border border-border rounded-sm text-[12px] font-mono text-muted-foreground hover:text-foreground transition-all"
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-card/60 border border-border rounded-sm p-3 flex gap-6 text-[11px] font-mono">
          <div>
            <div className="text-muted-foreground mb-1.5">SEVERITY</div>
            <div className="flex gap-1">
              {["all", "critical", "high", "medium", "low"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSeverityFilter(s)}
                  className={`px-2 py-0.5 rounded-sm border transition-all ${severityFilter === s ? "bg-primary/10 text-primary border-primary/20" : "text-muted-foreground border-transparent hover:text-foreground"}`}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1.5">TYPE</div>
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => setTypeFilter("all")}
                className={`px-2 py-0.5 rounded-sm border transition-all ${typeFilter === "all" ? "bg-primary/10 text-primary border-primary/20" : "text-muted-foreground border-transparent hover:text-foreground"}`}
              >
                ALL
              </button>
              {threatTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-2 py-0.5 rounded-sm border transition-all ${typeFilter === t ? "bg-primary/10 text-primary border-primary/20" : "text-muted-foreground border-transparent hover:text-foreground"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1.5">STATUS</div>
            <div className="flex gap-1">
              {["all", "active", "investigating", "mitigated"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2 py-0.5 rounded-sm border transition-all ${statusFilter === s ? "bg-primary/10 text-primary border-primary/20" : "text-muted-foreground border-transparent hover:text-foreground"}`}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Threat Feed Table */}
      <GlowCard
        hover={false}
        header={
          <>
            <PulsingDot color="red" />
            <span className="text-[13px] font-mono font-medium text-foreground">
              GLOBAL THREAT FEED
            </span>
            <span className={`ml-2 text-[10px] font-mono ${backendMode === "api" ? "text-success" : "text-warning"}`}>
              {backendMode === "api" ? "BACKEND" : "LOCAL FALLBACK"}
            </span>
            <span className="ml-auto text-[11px] text-muted-foreground font-mono">
              {filtered.length} results
            </span>
          </>
        }
      >
        <div className="max-h-[300px] overflow-y-auto cyber-scrollbar">
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr className="text-muted-foreground text-left border-b border-border">
                <th className="pb-2 pr-3">ID</th>
                <th
                  className="pb-2 pr-3 cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort("name")}
                >
                  <span className="inline-flex items-center gap-1">
                    THREAT <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th
                  className="pb-2 pr-3 cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort("type")}
                >
                  <span className="inline-flex items-center gap-1">
                    TYPE <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th
                  className="pb-2 pr-3 cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort("severity")}
                >
                  <span className="inline-flex items-center gap-1">
                    SEVERITY <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th className="pb-2 pr-3">STATUS</th>
                <th
                  className="pb-2 cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort("confidence")}
                >
                  <span className="inline-flex items-center gap-1">
                    CONFIDENCE <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <Fragment key={t.id}>
                  <tr
                    className={`border-b border-border/30 hover:bg-primary/5 cursor-pointer transition-colors ${expandedThreat === t.id ? "bg-primary/5" : ""}`}
                    onClick={() =>
                      setExpandedThreat(expandedThreat === t.id ? null : t.id)
                    }
                  >
                    <td className="py-2 pr-3 text-muted-foreground tabular-nums">
                      {t.id}
                    </td>
                    <td className="py-2 pr-3 text-foreground">{t.name}</td>
                    <td className="py-2 pr-3">
                      <StatusBadge severity="info">{t.type}</StatusBadge>
                    </td>
                    <td className="py-2 pr-3">
                      <StatusBadge
                        severity={t.severity}
                        pulse={t.severity === "critical"}
                      >
                        {t.severity}
                      </StatusBadge>
                    </td>
                    <td className="py-2 pr-3">
                      <StatusBadge severity={t.status}>{t.status}</StatusBadge>
                    </td>
                    <td className="py-2 tabular-nums text-primary">
                      {(t.confidence * 100).toFixed(1)}%
                    </td>
                  </tr>
                  {expandedThreat === t.id && (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-3 bg-card/50 border-b border-border/30"
                      >
                        <div className="grid grid-cols-2 gap-4 text-[11px] font-mono">
                          <div>
                            <div className="text-muted-foreground mb-1">
                              DESCRIPTION
                            </div>
                            <div className="text-foreground">
                              {t.description}
                            </div>
                            <div className="text-muted-foreground mt-2 mb-1">
                              MITRE ATT&CK
                            </div>
                            <div className="text-primary">
                              {t.mitreAttackTechnique}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1">
                              SOURCE IPs
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {t.sourceIPs.map((ip) => (
                                <span
                                  key={ip}
                                  className="px-1.5 py-0.5 bg-destructive/10 text-destructive text-[10px] rounded-sm border border-destructive/15"
                                >
                                  {ip}
                                </span>
                              ))}
                            </div>
                            <div className="text-muted-foreground mt-2 mb-1">
                              TARGETS
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {t.targetAssets.map((a) => (
                                <span
                                  key={a}
                                  className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] rounded-sm border border-primary/15"
                                >
                                  {a}
                                </span>
                              ))}
                            </div>
                            <div className="text-muted-foreground mt-2 mb-1">
                              AI ANALYSIS
                            </div>
                            <div className="text-foreground/80 text-[10px]">
                              {t.aiAnalysis}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </GlowCard>

      {/* MITRE ATT&CK Matrix */}
      <GlowCard
        hover={false}
        header={
          <>
            <PulsingDot color="amber" />
            <span className="text-[13px] font-mono font-medium text-foreground">
              MITRE ATT&CK MATRIX
            </span>
            {selectedTechnique && (
              <span className="ml-2 text-[10px] font-mono text-primary">
                Selected: {selectedTechnique}
              </span>
            )}
          </>
        }
      >
        <div className="grid grid-cols-9 gap-1 overflow-x-auto">
          {MITRE_TACTICS.map((tactic) => (
            <div key={tactic.name} className="min-w-[100px]">
              <div className="text-[10px] font-mono text-primary font-bold p-1.5 bg-primary/5 border border-primary/10 rounded-sm mb-1 text-center uppercase tracking-wider">
                {tactic.name}
              </div>
              {tactic.techniques.map((tech) => {
                const heat = TECHNIQUE_HEAT.get(tech) ?? 0;
                const isSelected = selectedTechnique === tech;
                return (
                  <div
                    key={tech}
                    onClick={() => handleTechniqueClick(tech)}
                    className={`text-[9px] font-mono p-1.5 mb-0.5 rounded-sm border cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary/50 ring-1 ring-primary/30"
                        : "border-border/30 hover:border-primary/30"
                    }`}
                    style={{
                      backgroundColor:
                        heat > 0.7
                          ? "hsla(345, 100%, 50%, 0.15)"
                          : heat > 0.4
                            ? "hsla(33, 100%, 50%, 0.1)"
                            : "hsla(186, 100%, 50%, 0.05)",
                    }}
                  >
                    {tech}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </GlowCard>

      {/* Threat Actor Profiles */}
      <div className="grid grid-cols-4 gap-3">
        {THREAT_ACTORS.map((actor) => (
          <GlowCard
            key={actor.name}
            glowColor={actor.risk === "critical" ? "red" : "amber"}
          >
            <div
              className="space-y-2 cursor-pointer"
              onClick={() => {
                setSelectedActor(
                  selectedActor === actor.name ? null : actor.name,
                );
                toast.info(
                  `${actor.name} — Active campaigns targeting ${actor.targets.join(", ")}`,
                );
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-mono font-bold text-foreground">
                  {actor.name}
                </span>
                <StatusBadge
                  severity={actor.risk}
                  pulse={actor.risk === "critical"}
                >
                  {actor.risk}
                </StatusBadge>
              </div>
              <div className="text-[10px] font-mono text-muted-foreground">
                Origin: {actor.country}
              </div>
              <div className="flex flex-wrap gap-1">
                {actor.malware.map((m) => (
                  <span
                    key={m}
                    className="px-1.5 py-0.5 bg-destructive/10 text-destructive text-[9px] font-mono rounded-sm border border-destructive/15"
                  >
                    {m}
                  </span>
                ))}
              </div>
              <div className="text-[10px] font-mono text-muted-foreground">
                Targets: {actor.targets.join(", ")}
              </div>
              {selectedActor === actor.name && (
                <div className="mt-2 pt-2 border-t border-border/30 text-[10px] font-mono text-foreground/80">
                  <div className="text-primary mb-1">DETAILED INTELLIGENCE</div>
                  <div>
                    Known TTPs: Spearphishing, credential theft, lateral
                    movement via compromised service accounts.
                  </div>
                  <div className="mt-1">
                    Last observed:{" "}
                    {new Date(
                      Date.now() - Math.random() * 86400000 * 7,
                    ).toLocaleDateString()}
                  </div>
                  <div className="mt-1">
                    IOCs: {Math.floor(Math.random() * 200 + 50)} indicators
                    tracked
                  </div>
                </div>
              )}
            </div>
          </GlowCard>
        ))}
      </div>
    </div>
  );
};

export default ThreatIntelPage;
