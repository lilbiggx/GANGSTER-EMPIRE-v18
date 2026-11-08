// v9 late-game systems (from /game-review/late-game-ideas.md). Pure data + small helpers only;
// the engine (src/engine/gameEngine.ts) owns all state changes.

// ---------- #2 Retire & Rebuild: Legacy perks (bought with Legacy Tokens, permanent across runs) ----------
export interface LegacyPerk { id: string; name: string; desc: string; cost: number; max: number; icon: string }
export const LEGACY_PERKS: LegacyPerk[] = [
  { id: "batch_slot", name: "Extra Wash Line", desc: "+1 laundering batch slot per rank", cost: 2, max: 2, icon: "layers" },
  { id: "heist_slot", name: "Extra Crew Call", desc: "+1 heist per day per rank", cost: 2, max: 2, icon: "crosshair" },
  { id: "start_front", name: "Old Connections", desc: "Each new run starts with 1 more front already open (per rank)", cost: 1, max: 3, icon: "store" },
  { id: "uncapped", name: "Night Shift", desc: "Your best hustle ignores the offline accrual cap", cost: 2, max: 1, icon: "moon" },
  { id: "rival_cut", name: "Feared Name", desc: "Rival syndicate power −5% per rank", cost: 1, max: 3, icon: "skull" },
  { id: "front7", name: "Royal Casino Licence", desc: "Unlocks the 7th front: Gold Coast Royal Casino", cost: 3, max: 1, icon: "dice" },
  { id: "heist8", name: "Sovereign Vault Intel", desc: "Unlocks the 8th heist: Sovereign Gold Vault", cost: 3, max: 1, icon: "vault" },
];
export const LEGACY_MAP = Object.fromEntries(LEGACY_PERKS.map((x) => [x.id, x]));
export const RETIRE_MIN_LIFETIME = 5_000_000;
/** Legacy tokens paid for a full Retire & Rebuild. 5M → 1, doubles per token, capped at 12. */
export function retireTokens(lifetime: number) {
  if (lifetime < RETIRE_MIN_LIFETIME) return 0;
  return Math.min(12, 1 + Math.floor(Math.log2(lifetime / RETIRE_MIN_LIFETIME)));
}

// ---------- gated content (unlocked by a Legacy perk OR an Empire Project) ----------
export const GATED_CONTENT: Record<string, { label: string; perk?: string; project?: string }> = {
  "hustle:port_cartel": { label: "Complete the Tema Freeport project", project: "port" },
  "front:royal_casino": { label: "Legacy perk Royal Casino Licence or the Royal Casino project", perk: "front7", project: "casino" },
  "heist:sovereign": { label: "Legacy perk Sovereign Vault Intel or the National Stadium project", perk: "heist8", project: "stadium" },
};

// ---------- #3 Weekly City Boss + rotating city events (all modifiers read through cityMods) ----------
export interface CityEvent { id: string; name: string; desc: string; heat: number; launder_cap: number; front_dur: number; bribe_cost: number; bribe_loot: number; income: number; offshore: number }
export const CITY_EVENTS: CityEvent[] = [
  { id: "heat_wave", name: "Heat Wave", desc: "Police are everywhere: heat gain ×2, but fronts wash ×1.5 more per batch", heat: 2, launder_cap: 1.5, front_dur: 1, bribe_cost: 1, bribe_loot: 0, income: 1, offshore: -0.05 },
  { id: "crackdown", name: "Police Crackdown", desc: "Fronts run 30% slower and bribes cost 50% more, but each bribe turns up seized loot", heat: 1, launder_cap: 1, front_dur: 1.3, bribe_cost: 1.5, bribe_loot: 1, income: 1, offshore: -0.08 },
  { id: "festival", name: "Street Festival", desc: "Homowo crowds: hustle income +20% all week", heat: 1, launder_cap: 1, front_dur: 1, bribe_cost: 1, bribe_loot: 0, income: 1.2, offshore: 0.03 },
];
export const CITY_BOSS_MILESTONES = [25, 50, 75, 100];

// ---------- #6 Districts: front → district mapping (fronts had no district) ----------
export const FRONT_DISTRICT: Record<string, string> = {
  chopbar: "dockside", spare: "market", momo: "zongo", trotro: "kejetia", carwash: "hills", club: "osu", royal_casino: "osu",
};
export const INFLUENCE_MAX = 10;
export const influenceCost = (lvl: number) => Math.floor(250_000 * Math.pow(3, lvl));
export const INFLUENCE_FX = { income: 0.06, front_cap: 0.08, rival_cut: 0.04 }; // per level

// ---------- #7 Offshore market ----------
export const OFFSHORE = { min: 100_000_000, daily_count: 2, daily_cap: 5_000_000_000, base_rate: 0.78, base_risk: 0.05, risk_per_heat: 0.0025, max_risk: 0.3, seize_loss: 0.6 };
export function offshoreRate(dayIndex: number, heat: number, eventMod = 0) {
  const swing = 0.08 * Math.sin(dayIndex * 1.7) + 0.04 * Math.cos(dayIndex * 0.6);
  return Math.max(0.55, Math.min(0.92, Number((OFFSHORE.base_rate + swing - heat * 0.0015 + eventMod).toFixed(3))));
}

// ---------- #8 Lieutenants ----------
export const LIEUTENANT = { min_lvl: 10, max: 3, promote_cost: (n: number) => 500_000 * (n + 1), upkeep_min: 25_000, defence_share: 0.5 };

// ---------- #10 Kingpin tables + chip shop ----------
export interface KingpinTable { id: string; name: string; mult: number; prob: number; min: number; icon: string }
export const KINGPIN_TABLES: KingpinTable[] = [
  { id: "vault21", name: "Vault 21 Blackjack", mult: 2, prob: 0.47, min: 1_000_000, icon: "spade" },
  { id: "roulette", name: "Kingpin Roulette", mult: 5, prob: 0.18, min: 2_500_000, icon: "dice" },
  { id: "crown", name: "Crown Jackpot", mult: 25, prob: 0.036, min: 10_000_000, icon: "crown" },
];
export const CHIP_SHOP = [
  { id: "heat_wipe", name: "Clean Slate (heat → 0)", chips: 30 },
  { id: "cosmetic", name: "Random VIP cosmetic", chips: 50 },
  { id: "token", name: "1 Legacy Token", chips: 200 },
];

// ---------- #11 Empire Projects (multi-day, staged) ----------
export interface ProjectStage { dirty: number; clean: number; crew: number; hours: number }
export interface EmpireProject { id: string; name: string; desc: string; unlock: string; unlock_label: string; min_level: number; stages: ProjectStage[] }
export const PROJECTS: EmpireProject[] = [
  { id: "port", name: "Tema Freeport Terminal", desc: "Buy the berths, the cranes and the customs men.", unlock: "hustle:port_cartel", unlock_label: "New hustle: Freeport Cartel", min_level: 10,
    stages: [ { dirty: 2_000_000, clean: 250_000, crew: 1, hours: 24 }, { dirty: 6_000_000, clean: 750_000, crew: 2, hours: 24 }, { dirty: 15_000_000, clean: 2_000_000, crew: 2, hours: 24 } ] },
  { id: "casino", name: "Gold Coast Royal Casino", desc: "A licensed casino on the Osu strip that washes as it deals.", unlock: "front:royal_casino", unlock_label: "New front: Gold Coast Royal Casino", min_level: 15,
    stages: [ { dirty: 8_000_000, clean: 1_000_000, crew: 1, hours: 24 }, { dirty: 20_000_000, clean: 3_000_000, crew: 2, hours: 24 }, { dirty: 45_000_000, clean: 8_000_000, crew: 2, hours: 24 }, { dirty: 90_000_000, clean: 15_000_000, crew: 3, hours: 24 } ] },
  { id: "stadium", name: "National Stadium Contract", desc: "Rebuild the stadium and learn where the state keeps its gold.", unlock: "heist:sovereign", unlock_label: "New heist: Sovereign Gold Vault", min_level: 20,
    stages: [ { dirty: 25_000_000, clean: 5_000_000, crew: 2, hours: 24 }, { dirty: 60_000_000, clean: 12_000_000, crew: 2, hours: 24 }, { dirty: 120_000_000, clean: 25_000_000, crew: 3, hours: 24 }, { dirty: 250_000_000, clean: 50_000_000, crew: 3, hours: 24 }, { dirty: 500_000_000, clean: 100_000_000, crew: 4, hours: 24 } ] },
];
// v9 economy: projects are owned assets, so every stage is paid in clean cash (old dirty share folded into the clean price)
PROJECTS.forEach((P) => P.stages.forEach((st) => { st.clean += st.dirty; st.dirty = 0; }));
export const PROJECT_MAP = Object.fromEntries(PROJECTS.map((x) => [x.id, x]));

// ---------- #5 legendary crew auction ----------
export const LEGENDARY_BACKGROUNDS = [
  { title: "The Old Customs Chief", bio: "Ran Tema customs for 20 years. Knows every container's secret." },
  { title: "Ex-Navy Frogman", bio: "Can put a hull under water and a crew on deck before anyone looks." },
  { title: "Retired CID Inspector", bio: "Switched sides after his pension was 'misplaced'." },
  { title: "Kumasi Gold Broker", bio: "Moves bullion across three borders with one phone call." },
  { title: "Osu Club Queen", bio: "Owns half the nightlife and the secrets of the other half." },
];

// ---------- #4 elite contracts ----------
export const ELITE_CONTRACTS = [
  { type: "elite_launder", label: "Elite: launder GH₵{t} in one batch" },
  { type: "elite_quiet", label: "Elite: finish a top-tier heist (Casino Vault or bigger) with the Quiet approach" },
];
export const ELITE_MIN_LEVEL = 20;
export const TOP_HEISTS = ["casino", "central_bank", "sovereign"];
