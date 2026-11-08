# Underworld Empire: Accra Edition

A mobile-first idle crime strategy game set in a fictional Accra underworld (Dockside, Market Circle, Zongo Lanes, Osu Strip, Hills Estate, Kejetia Junction).

## Core Features & Business Logic
- **Dirty vs Clean Cedis (GH₵)**: Run street hustles for dirty cedis, then launder through legitimate business fronts (chop bars, MoMo kiosks, trotro fleets, night clubs).
- **Heat System (Tiers 1–5)**: From Police Patrol to National Bureau. Heat increases laundering fees and raid frequency; cool it down with bribes, lying low, or retaining a lawyer.
- **Crew & Role-based Heists**: Recruit and train Enforcers, Hackers, Drivers, and Infiltrators with distinct traits and flaws. Launch heists with tactical approaches (balanced, quiet, loud, smart) and equipment prep.
- **3D Procedural Avatar Customizer**: Full interactive 3D boss and crew previews rendered with Three.js / React Three Fiber, featuring animated facial expressions, hairstyles, outfits (Fugu jackets, Kente trousers), and equipped weapon loadouts.
- **Turf & AI Rival Syndicates**: Battle rival syndicates (Kpakpa Crew, Zongo Lions, Osu Silk Syndicate, Junction Kings). Survive raid countdowns with fortifications and compound defenses.
- **Weed / Herbal Farm**: Purchase plots, cultivate high-yield strains (Kumasi Wee, Osu Kush, Forest Shrooms), harvest, and distribute for clean cash.
- **Black Market & Weapon Upgrades**: 20+ street weapons with stat modifiers and +5 level upgrade paths.
- **Street Pass & Seasons**: 30 tiers of seasonal rewards and daily contracts with streak multipliers.

## Offline Testing Bypass
- **Instant Quick Play**: Bypass external authentication with 1-click test login directly from the Landing screen.
- **Preset Test Profiles**:
  - 🔰 **Rookie Hustler** (Level 1, fresh progression)
  - ⚔️ **Street General** (Level 12, GH₵500K cedis, unlocked guns & crew)
  - 👑 **Underworld Kingpin** (Level 25, GH₵20M dirty cedis, max gear & prestige)
- **Standalone Developer Cheats Toolbox**: Test any feature alone with instantaneous controls:
  - Add dirty and clean cash
  - Fast-forward timers for heists, laundering batches, and farm crops
  - Trigger instant 45-second rival raid countdown
  - Clear heat or add Street Pass XP
- **Local Persistence**: State automatically persists to `localStorage` with save export and import support.

## Tech Stack
- React 19 + TypeScript
- Vite
- Tailwind CSS
- Zustand
- Three.js + @react-three/fiber
- Lucide React & Sonner
