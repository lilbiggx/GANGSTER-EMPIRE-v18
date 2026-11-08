# Underworld Empire: Accra Edition — PRD

## Original problem statement
Mobile-first idle crime PWA set in a fictional Ghana city (Dockside, Market Circle, Zongo Lanes, Osu Strip, Hills Estate, Kejetia Junction). Dirty vs Clean Cedis (GH₵), laundering via fronts, Heat tiers 1–5, AI rival syndicates with grudges and raid countdowns (15–60 min), raid safety rules (20–35% of unvaulted cash, 4h shield, 72h newbie protection), crew with archetypes/traits/XP, role-based heists resolved on the server, stores on a 12h restock, mansion/garage upgrades, offline progress (12h/24h cap), daily contracts and streak with grace day, prestige, Street Pass, cosmetics, time skips, lawyer shields (2/week), extra build slots, optional ads, leaderboards, PvP ±15% power band, mercenary marketplace with escrow, monthly seasons, Gemini 3 Flash taunts/news, Web Push. Hardening: server-authoritative timestamps, big-number strings, optimistic concurrency, idempotent action IDs, rate limits, offline action queue.

## User choices
- Scope: everything including multiplayer
- Payments: Flutterwave + Paystack (keys NOT added yet, so checkout is switched off)
- Sign-in: Emergent-managed Google (Clerk)
- AI: Gemini 3 Flash batches (Emergent LLM key)
- Ads: demo ad button (MOCKED, no ad network)
- Stripe requested later: NOT possible because Stripe doesn't support Ghana (sandbox refused: country_not_supported)

## Architecture
- Backend FastAPI: server.py (routes, mutate() optimistic concurrency, idempotent(), scheduler loop every 30s, payments, push), engine.py (pure game logic + ACTIONS), game_data.py (all content), content.py (Gemini), push.py (VAPID/pywebpush), payments.py (Paystack/Flutterwave), clerk_auth.py
- Frontend React (CRA) + Tailwind + Zustand (store/game.js with offline queue), lazy tabs, three.js / @react-three/fiber procedural 3D characters (Character3D.js), PWA manifest + sw.js

## Implemented (2026-06)
- Full core loop, threats, retention, monetization shell, multiplayer (iteration_1 tests passed)
- 3D procedural characters (boss builder + random crew looks), loadouts (hat/top/bottom/shoes + melee/primary/secondary), Gun Shop, clothes, selling reward items
- Smoother models (rounded boxes, capsules, high-poly spheres, AA, hemisphere light)
- Spending depth: heist approaches (quiet/loud/smart) + prep (intel/getaway), crew training/rehab/dismiss, elite recruits (clean), Crew Quarters, weapon upgrades (+5 levels), stat clothes (iteration_2 tests passed)
- Market now has more than 15 items per shop: Black Market 17 consumables, Gun Shop 20 weapons, Clothes Rack 16 + 6 cosmetics

## Backlog
- P0: Add Paystack/Flutterwave keys so real checkout works
- P1: Real ad network, Play Store wrapper (TWA), bundle-size tuning toward 250 KB (CRA + Clerk + three are heavier)
- P2: Language toggle, syndicate guilds, rival boss weekly events with special loot
