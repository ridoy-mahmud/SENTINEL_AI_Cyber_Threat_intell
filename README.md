# SENTINEL AI: Cyber Threat Intelligence Dashboard

SENTINEL AI is a React + TypeScript SOC dashboard for monitoring security telemetry, triaging alerts, and exploring threat intelligence.

## Features

- Multi-page SOC interface (dashboard, network map, anomaly detection, threat intel, AI analysis, alerts, settings)
- Real-time telemetry simulation with optional backend snapshot + WebSocket integration
- Interactive alert workflows: acknowledge, investigate, resolve, dismiss
- Threat intel filters, sorting, expanded details, and MITRE interaction
- AI analyst panel with report generation and export
- Local persistence for settings and notification channels

## Tech Stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS + shadcn/ui
- Recharts
- TanStack Query
- Vitest

## Getting Started

### Requirements

- Node.js 18+
- npm 9+

### Install and run

```sh
npm install
npm run dev
```

### Useful scripts

```sh
npm run build
npm run lint
npm run test
```

## Optional Backend Integration

The app now supports optional backend endpoints. If unavailable, it falls back to local simulation.

Set these variables in a `.env` file:

```env
VITE_API_BASE_URL=https://your-api.example.com
VITE_TELEMETRY_WS_URL=wss://your-api.example.com/ws/telemetry
```

Expected endpoints:

- `GET /api/telemetry/snapshot`
  - returns packets, threats, health, stats, timeline, severity distribution, map connections
- `POST /api/ai/analyze`
  - body: `{ input: string, history: { role, content }[] }`
  - response: `{ response: string }`

## Project Structure

```text
src/
  components/
  hooks/
  lib/
  pages/
  test/
```

## Notes

- The frontend remains fully functional without backend services.
- For production use, connect a real SIEM/EDR pipeline and AI service.
