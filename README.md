# SENTINEL AI: Cyber Threat Intelligence Dashboard

![React](https://img.shields.io/badge/React-18.3-0ea5e9?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-2563eb?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4-f59e0b?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3.4-06b6d4?logo=tailwindcss&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-Vitest%20%2B%20Playwright-22c55e)

An interactive cybersecurity command center that visualizes live network traffic, anomaly detection, global threat flows, severity trends, and AI-assisted analysis in one modern SOC-style interface.

## Table of Contents

- [Overview](#overview)
- [Why This Project](#why-this-project)
- [Key Features](#key-features)
- [App Routes](#app-routes)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [How Data Works](#how-data-works)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Overview

SENTINEL AI is a frontend-heavy cyber threat intelligence platform prototype built with React + TypeScript. It simulates real-time telemetry and threat events to showcase how a Security Operations Center (SOC) dashboard can support rapid situational awareness and response.

## Why This Project

- Demonstrates a complete multi-page threat intelligence UI with a polished analyst workflow.
- Combines data visualization, live feed simulation, and AI-oriented insights.
- Provides a strong foundation for connecting to real SIEM, IDS/IPS, or SOAR backends.

## Key Features

- Live dashboard with quick stats, network map, anomaly timeline, and health indicators.
- Threat severity distribution and top-threat prioritization.
- Real-time style traffic feed and synthetic alert generation.
- Dedicated pages for network insights, anomaly detection, threat intel, alerts, settings, and AI analysis.
- Cyber-themed UX with animated UI components and responsive layout.

## App Routes

| Route                | Purpose                            |
| -------------------- | ---------------------------------- |
| `/`                  | Main SOC dashboard                 |
| `/network`           | Network monitoring view            |
| `/anomaly-detection` | Anomaly-focused analytics          |
| `/threat-intel`      | Threat intelligence feed/context   |
| `/ai-analysis`       | AI-assisted threat interpretation  |
| `/alerts`            | Alert handling and status tracking |
| `/settings`          | System preferences/configuration   |

## Tech Stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS + shadcn/ui + Radix UI
- Recharts for charts and visual analytics
- TanStack Query for data orchestration patterns
- Framer Motion for animated interactions
- Vitest + Playwright for testing

## Quick Start

<details>
<summary><strong>Requirements</strong></summary>

- Node.js 18+
- npm 9+

</details>

<details open>
<summary><strong>Run Locally</strong></summary>

```bash
git clone https://github.com/ridoy-mahmud/SENTINEL_AI_Cyber_Threat_intell.git
cd cyber-guardian-main
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

</details>

## Available Scripts

```bash
npm run dev         # Start dev server
npm run build       # Production build
npm run build:dev   # Development-mode build
npm run preview     # Preview built app
npm run lint        # Lint source
npm run test        # Run tests once
npm run test:watch  # Watch mode tests
```

## Project Structure

```text
src/
	components/
		dashboard/      # Dashboard widgets (threat map, charts, feed, stats)
		layout/         # Sidebar + top navigation
		shared/         # Reusable visual primitives
		ui/             # shadcn/radix-based UI components
	hooks/
		useRealTimeData.ts
	lib/
		mock-data.ts    # Synthetic security telemetry generators
		types.ts
	pages/            # Route-level views
	App.tsx           # Router + shell
```

## How Data Works

The app currently uses synthetic generators to emulate SOC telemetry:

- Packet streams with protocol, risk, and geolocation context.
- Threat events with MITRE ATT&CK-style mappings.
- Alert objects with timelines and analyst assignments.
- Health metrics and severity distributions for charts.

This keeps the UI fully interactive without external infrastructure and makes backend integration straightforward later.

## Roadmap

- [ ] Integrate real backend APIs (SIEM/EDR/log pipeline).
- [ ] Add authentication and role-based analyst workflows.
- [ ] Implement historical filtering, saved views, and drill-down panels.
- [ ] Add WebSocket/event-stream ingestion for true live updates.
- [ ] Expand test coverage for critical data and visualization flows.

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss the proposed direction.

Recommended workflow:

1. Fork the repository.
2. Create a feature branch.
3. Commit focused changes with clear messages.
4. Open a PR with screenshots or short clips for UI changes.

## License

Add your preferred license (for example, MIT) in a `LICENSE` file.
