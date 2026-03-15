import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchTelemetrySnapshot, requestAiAnalysis } from "@/lib/api";

describe("api helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns normalized telemetry snapshot when backend responds", async () => {
    const mockResponse = {
      packets: [
        {
          id: "PKT-1",
          timestamp: "2026-03-15T12:00:00.000Z",
          sourceIP: "10.0.0.1",
          destinationIP: "8.8.8.8",
          sourcePort: 12345,
          destinationPort: 53,
          protocol: "DNS",
          packetSize: 200,
          anomalyScore: 21,
          status: "normal",
          geoLocation: { lat: 0, lng: 0, country: "NA" },
        },
      ],
      threats: [
        {
          id: "THR-0001",
          name: "Test Threat",
          type: "APT",
          severity: "high",
          description: "Test",
          sourceIPs: ["1.1.1.1"],
          targetAssets: ["SRV-1"],
          mitreAttackTechnique: "T1071",
          detectedAt: "2026-03-15T12:00:00.000Z",
          status: "active",
          aiAnalysis: "analysis",
          confidence: 0.9,
        },
      ],
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      }),
    );

    const snapshot = await fetchTelemetrySnapshot();

    expect(snapshot).not.toBeNull();
    expect(snapshot?.packets?.[0].timestamp).toBeInstanceOf(Date);
    expect(snapshot?.threats?.[0].detectedAt).toBeInstanceOf(Date);
  });

  it("returns null telemetry snapshot when backend call fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

    const snapshot = await fetchTelemetrySnapshot();

    expect(snapshot).toBeNull();
  });

  it("returns backend AI response when available", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ response: "Real backend answer" }),
      }),
    );

    const response = await requestAiAnalysis("hello", []);

    expect(response).toBe("Real backend answer");
  });

  it("returns null AI response on backend failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    );

    const response = await requestAiAnalysis("hello", []);

    expect(response).toBeNull();
  });
});
