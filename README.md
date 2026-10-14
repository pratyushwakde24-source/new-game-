# SPARKVERSE — 3D Cosmic Arcade Gaming Platform

> *One More Adventure. Your Next High Score.*

SPARKVERSE is a production-ready, all-age browser-based gaming SaaS platform featuring an original 3D casual arcade game (**SPARK RUSH**). Built for cross-platform play across desktop browsers, mobile touch devices (iOS/Android), and tablets with real-time 60 FPS physics, procedural tracks, deterministic scoring, and backend server services.

---

## 🚀 Features & Architecture

### 1. 3D Game Engine (SPARK RUSH)
- **Three.js PBR Rendering:** Dynamic physical lighting rig with `RoomEnvironment` PMREM reflections, ACES Filmic tone mapping, and soft PCF shadows.
- **Fluid Controls:** Keyboard (Arrow keys, A/D, Space), mouse/touch pointer drag steer, and on-screen mobile virtual buttons.
- **Zero Garbage Collection (GC) in Render Loop:** Pre-allocated vector and quaternion objects ensure rock-solid 60 FPS on both mobile and desktop.
- **Procedural Track Generation:** Deterministic seeded PRNG (Linear Congruential Generator) that guarantees reproducible daily challenges and friend race seeds.
- **Audio Synthesizer:** 100% procedural Web Audio API synthesizer for harmonic chimes, combo risers, gate wooshes, and ethereal ambient drones (zero 404 asset dependencies).

### 2. Game Modes
1. **Endless Rush:** Survive, combo, and ascend the galactic ranks.
2. **Daily Spark:** Synchronized daily seed with shared global conditions and multiplier bonuses.
3. **Pattern Quest:** Master complex flight trajectories and tight aperture alignments.
4. **Zen Journey:** Relaxed celestial flight with no health penalty, no timer, and gentle ambient visuals.
5. **Time Trial (60s):** Blitz mode to maximize combo chains under strict time constraints.
6. **Friend Challenge:** Share unique 6-character room codes (`SPARK-XXXX`) to fly identical tracks.
7. **Family Party:** Local pass-and-play tournament format on a single device.

### 3. Server Architecture & Database Schema
- **Database Migrations:** Complete 22-table PostgreSQL schema in `supabase/migrations/001_initial_schema.sql` covering profiles, sessions, server-authoritative score submissions, daily challenges, achievements, inventory, multiplayer rooms, subscriptions, and audit logs.
- **Anti-Cheat Validation:** Server-side score validation (`server/game-validation/scoreValidator.ts`) checking score rate ceilings, minimum run durations, combo capacity, and idempotent session tracking.
- **Multiplayer Foundation:** Room manager (`server/multiplayer/roomManager.ts`) with join codes, host handshakes, and seed synchronization.
- **Regional Monetization:** Regional pricing engine (USD, INR, EUR) for **Spark Plus** with zero pay-to-win mechanics.

---

## 📁 Directory Structure

```
src/
├── app/                  # Application routing & layout
├── components/           # UI Modals & HUD components
│   ├── AchievementsModal.tsx
│   ├── AdminModal.tsx
│   ├── CosmeticsModal.tsx
│   ├── GameOverModal.tsx
│   ├── HeaderBanner.tsx
│   ├── HUDOverlay.tsx
│   ├── LeaderboardModal.tsx
│   ├── ModeSelectorModal.tsx
│   ├── NavigationDock.tsx
│   ├── SettingsModal.tsx
│   ├── SubscriptionModal.tsx
│   ├── TutorialModal.tsx
│   └── WelcomeScreen.tsx
├── game/
│   ├── audio/            # Web Audio API sound synthesizer
│   ├── generation/       # Seeded PRNG level generation
│   ├── physics/          # Bounding sphere/box collision engine
│   ├── rendering/        # Three.js 3D canvas & render loop
│   └── scoring/          # Configurable scoring & multiplier rules
├── stores/               # Zustand stores (Game, User, Settings)
├── types/                # TypeScript interfaces & types
└── services/             # Client API integration layer

server/
├── config/               # Server configuration
├── game-validation/      # Server score validation anti-cheat
├── multiplayer/          # Room lifecycle & seed distribution
├── payments/             # Regional pricing & webhook processing
├── routes/               # Express REST endpoints (/api/*)
└── index.ts              # Backend application entrypoint

supabase/
├── migrations/           # Versioned SQL migrations (22 tables, RLS, indexes)
└── seed.sql              # Initial achievements, items, and feature flags
```
