# NextGen HMI Dashboard
**ABB Industrial Automation Hackathon — v2.0**

A futuristic SCADA-style industrial control dashboard built with Next.js 16, Tailwind CSS v4, and Framer Motion.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── globals.css          # Industrial dark theme (Tailwind v4 CSS-first)
├── layout.tsx           # Root layout with ThemeProvider + Geist fonts
└── page.tsx             # Main dashboard — uses live sensor simulation

components/
├── dashboard/           # Feature components
│   ├── alarm-panel.tsx       # Live alarm feed with simulation
│   ├── ai-recommendations.tsx
│   ├── analytics-charts.tsx  # Recharts with real-time data
│   ├── machine-health.tsx
│   ├── sensor-card.tsx       # Normalised sparkline chart
│   ├── sidebar.tsx
│   ├── system-health.tsx
│   ├── top-navbar.tsx        # Hydration-safe clock
│   └── activity-feed.tsx
└── ui/                  # shadcn/ui primitives

hooks/
├── use-mobile.ts
├── use-toast.ts
└── use-sensor-simulation.ts  # Live sensor data hook (3s updates)

lib/
├── utils.ts
└── types.ts             # Shared TypeScript interfaces (ISA-18.2 aligned)
```

## Fixes Applied (v1 → v2)

| # | Issue | File |
|---|-------|------|
| 1 | Font CSS variables never applied to document | `layout.tsx` |
| 2 | Sparkline bars using raw values as % height | `sensor-card.tsx` |
| 3 | Clock hydration mismatch (SSR vs client) | `top-navbar.tsx` |
| 4 | Unused lucide imports (Wind, Droplets, Waves) | `machine-health.tsx` |
| 5 | Duplicate hook files in `components/ui/` | Removed |
| 6 | Dead `styles/globals.css` conflicting with real file | Removed |
| 7 | `ignoreBuildErrors: true` masking TS errors | `next.config.mjs` |
| 8 | `next-themes` installed but never wired up | `layout.tsx` |
| 9 | No `suppressHydrationWarning` on `<html>` | `layout.tsx` |

## Improvements Added

- **Live sensor simulation** — all 6 sensors update every 3s with realistic drift
- **Live alarm simulation** — new alarms arrive randomly; dismiss/acknowledge animations
- **Alarm PLC tags** — each alarm now shows its industrial tag (e.g. `TI-301`)
- **Mute toggle** on alarm panel
- **Acknowledge All** button
- **Staggered page animations** — sections appear in sequence, not all at once
- **SCADA grid background** — subtle dot/line pattern behind dashboard
- **ARIA labels** on all icon buttons and interactive elements
- **Escape key** closes notification dropdown
- **Mobile search icon** on small screens
- **Tablet-optimised grid** — main layout now uses `lg:grid-cols-3` instead of `xl:`
- **Shared `lib/types.ts`** — all interfaces in one place (ISA-18.2 aligned)

## Future Integrations

See `lib/types.ts` for the full data model designed for:

- **Firebase Realtime Database** — drop `useFirebaseSensors()` in place of `useSensorSimulation()`
- **AI recommendations** — `app/api/ai-recommendations/route.ts` ready to wire up
- **Role-based access** — `rolePermissions` map in `lib/types.ts`
