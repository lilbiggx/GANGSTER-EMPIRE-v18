import { ALL_66_HEISTS, ExtendedHeist } from "./heistsData";
import { DELIVERABLE_CONSUMABLES, DeliverableConsumable } from "./consumablesData";
export { ALL_66_HEISTS, type ExtendedHeist, DELIVERABLE_CONSUMABLES, type DeliverableConsumable };

export const TIER_PALETTE = {
  1: "#71717a",
  2: "#15803d",
  3: "#0284c7",
  4: "#7c3aed",
  5: "#eab308",
  6: "#ea580c",
  7: "#dc2626",
  8: "#ec4899",
};

export interface District {
  id: string;
  name: string;
  vibe: string;
}

export const DAILY_HUSTLE_CAP = 30000;

// ==========================================
// v9 BALANCE CONSTANTS
// ==========================================
// Condition (0–100%) tiers shared by facilities, side hustles, front businesses and plots.
export const CONDITION_THRESHOLDS = { pristine: 85, operational: 50, worn: 25 } as const;
// Output multiplier per tier: Pristine +15%, Operational normal, Worn half output, Critical shut down.
export const CONDITION_MULTIPLIERS = { pristine: 1.15, operational: 1.0, worn: 0.5, critical: 0 } as const;
// Wear in % per minute when nobody is stationed / managing.
export const WEAR_RATES = { facility: 0.5, hustle: 0.2, front: 0.2 } as const;
// Repair in % per minute for each stationed crew member (manager / station crew).
export const STATION_REPAIR_RATE = 2.0;
export const QUICK_SERVICE_AMOUNT = 35;
// Cooldowns in seconds.
export const COOLDOWNS = { launder: 6 * 3600, front: 6 * 3600, heist: 8 * 3600, robbery: 2 * 24 * 3600, gf_date: 4 * 3600, gf_court: 3600, smuggling: 3 * 24 * 3600 } as const;
export const BOSS_PERK_MAX_RANK = 3;
// Vault: starts at 5,000 protected cash and every vault level adds exactly +5,000.
export const VAULT_BASE_CAP = 5000;
export const VAULT_CAP_PER_LEVEL = 10000;
// Vault upgrade cost grows exponentially: cost = base × 2.8^level (starts at 5,000 and scales up steeply).
export const VAULT_COST_GROWTH = 2.8;
// v9 LAND: every street hustle runs on a land plot. All land starts locked; the first land + first hustle are a
// one-time free claim, later land costs clean cash (escalating, x10 economy). There is no separate plot business list.
export const LAND_COUNT = 8;
export const LAND_FEES = [0, 10000, 25000, 80000, 250000, 750000, 2000000, 5000000] as const; // clean cash; land 1 = free claim
export const FIRST_FREE_HUSTLE = "okada";
export interface Hustle {
  id: string;
  name: string;
  district: string;
  cost: number;
  income: number;
  real_desc?: string;
  daily_cap?: number;
  unlock: number;
  gate?: string; // v9 late game: hidden until unlocked (see GATED_CONTENT)
  tier?: number;
  build_crew?: number;
  build_time?: number; // seconds to construct
}

export interface Front {
  id: string;
  name: string;
  cost: number;
  cap: number;
  dur: number;
  unlock: number;
  gate?: string;
}

// ==========================================
// LAND (v9/v11): Famous Ghanaian Streets (one plot per street hustle)
// ==========================================
export const GHANA_STREET_NAMES = [
  "Oxford Street (Osu)",
  "Tip Toe Lane (Circle)",
  "High Street (Jamestown)",
  "Spintex Road",
  "Bantama High Street",
  "Kejetia Central",
  "Cantonments Road",
  "Labadi Beach Road",
] as const;

export interface PlayerPlot {
  plotID: number; // 0 to 7
  streetName: string;
  customName?: string;
  isUnlocked: boolean; // land owned
  plotUnlockFee: number; // clean-cash price of this land
  hustleID?: string | null; // the street hustle running on this land
  lastTickTimestamp?: number;
  lvl?: number;
  ts?: number;
  bank?: number;
  condition?: number;
  paused?: boolean;
  building?: {
    hid: string;
    start: number;
    end: number;
    crew_ids: string[];
  } | null;
}

export const INITIAL_PLAYER_PLOTS: PlayerPlot[] = LAND_FEES.map((fee, i) => ({
  plotID: i,
  streetName: GHANA_STREET_NAMES[i],
  isUnlocked: false,
  plotUnlockFee: fee,
  hustleID: null,
  building: null,
}));

// Rival Laundering configuration
export const RIVAL_LAUNDER_BASE_COMMISSION = 0.45; // 45% base commission
export const RIVAL_LAUNDER_MIN_CAP = 2000;
export const RIVAL_LAUNDER_MAX_CAP = 12000;
export function rollRivalLaunderCap(): number {
  return Math.floor(20 + Math.random() * 101) * 100; // 2,000 to 12,000
}
export function pickDailyLaunderRivals(rivalIds: string[] = ["kpakpa", "coastal", "lions", "nima", "silk", "cantonments", "kings", "ashanti", "circle", "spintex", "tema"], count = 3): string[] {
  const shuffled = [...rivalIds].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, rivalIds.length));
}
export function calcRivalCommission(base = RIVAL_LAUNDER_BASE_COMMISSION, relationship = 50, grudge = 0): number {
  const grudgeMod = (grudge / 100) * 0.20; // 0 to +20% penalty if grudge is high
  const relMod = -((relationship - 50) / 50) * 0.15; // -15% discount at 100 rel, +15% penalty at 0 rel
  const netRate = base + grudgeMod + relMod;
  return Math.max(0.15, Math.min(0.80, Math.round(netRate * 100) / 100));
}


export interface Rival {
  id: string;
  name: string;
  district: string;
  boss: string;
  ally_id: string;
  bloc: string;
  personality: "Vindictive" | "Aggressive" | "Ruthless" | "Calculated" | "Honorable";
}

export interface Heist {
  id: string;
  name: string;
  dur: number;
  roles: string[];
  diff: number;
  reward: number;
  unlock: number;
  heat: number;
  gate?: string;
}

export interface GearItem {
  id: string;
  name: string;
  slot: "hat" | "top" | "bottom" | "shoes" | "melee" | "primary" | "secondary";
  model: string;
  rarity: "common" | "rare" | "legendary";
  price: number;
  stat?: string;
  mod?: number;
  power?: number;
  unlock?: number;
  color: string;
  style?: string;
  pattern?: string;
  graphic?: string;
  subcategory?: string;
  tier2?: string;
  effects?: Record<string, number>;
  tier?: number;
  brand?: string;
}

export interface Tier2Category {
  id: string;
  name: string;
  trait_name: string;
  desc: string;
  effect: string;
  bonus: number;
  stat_bonus?: { stat: string; mod: number };
  color: string;
}

export interface BoutiqueSubcategory {
  id: string;
  name: string;
  icon: string;
  desc: string;
}

export interface GunShopSubcategory {
  id: string;
  name: string;
  icon: string;
  desc: string;
}

export interface BoutiqueCatalogItem {
  id: string;
  name: string;
  brand: string;
  tier: number;
  effects: Record<string, number>;
  subcategory: "tailoring" | "streetwear" | "jewelry" | "footwear" | "headwear" | "tactical" | "regalia" | "accessories";
  slot: "top" | "bottom" | "shoes" | "hat" | "melee" | "secondary";
  model: string;
  rarity: "common" | "rare" | "legendary";
  price: number;
  desc: string;
  color: string;
  style?: string;
  pattern?: string;
  graphic?: string;
  stat?: string;
  mod?: number;
  power?: number;
  unlock?: number;
  tier2_chance?: number;
  fixed_tier2?: string;
}

export interface BlackMarketItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  kind: string;
  value: number;
  max?: number;
  heat?: number;
}

export interface CosmeticItem {
  id: string;
  name: string;
  slot: "drip" | "car" | "decor";
  rarity: "common" | "rare" | "legendary";
  clean: number;
}

export interface FarmStrain {
  id: string;
  name: string;
  desc: string;
  unlock: number;
  seed: number;
  grow: number;
  yield: [number, number];
  price: number;
  heat: number;
  color: string;
}

export const DISTRICTS: District[] = [
  { id: "dockside", name: "Dockside", vibe: "Harbour smoke and fishing canoes" },
  { id: "market", name: "Market Circle", vibe: "Loudest trading floor in the city" },
  { id: "zongo", name: "Zongo Lanes", vibe: "Tight lanes, tighter loyalty" },
  { id: "osu", name: "Osu Strip", vibe: "Neon, nightlife, quick money" },
  { id: "hills", name: "Hills Estate", vibe: "Gated villas and big men" },
  { id: "kejetia", name: "Kejetia Junction", vibe: "Biggest junction up north" },
];

export const DISTRICT_MAP = Object.fromEntries(DISTRICTS.map((d) => [d.id, d]));

export interface AssassinContract {
  id: string;
  name: string;
  desc: string;
  cost_dirty: number;
  cost_clean: number;
  grudge_drop: number;
  lockdown_mins: number;
  power_cut_pct: number;
  duration_mins: number;
  recovers_loot?: boolean;
  neutralizes_boss?: boolean;
}

export const ASSASSIN_CONTACT = {
  id: "salifu_ghost",
  name: 'Salifu "The Ghost"',
  title: "Underworld Assassin Contact",
  location: "Bukom Beach Docks & Ga Mashie",
  bio: "Accra's premier ghost contractor. Accepts private assassination contracts to eliminate rival syndicate muscle, sever cartel supply lines, and take down archrival bosses.",
  contracts: [
    {
      id: "sabotage",
      name: "Supply Line Sabotage & Corner Sweep",
      desc: "Hitman team raids rival supply depots and corner runners. Locks down rival corner for 30m, cuts grudge by 30, cancels pending raids, and seizes dirty cash.",
      cost_dirty: 8000,
      cost_clean: 0,
      grudge_drop: 10,
      lockdown_mins: 30,
      power_cut_pct: 0.15,
      duration_mins: 30,
      recovers_loot: true,
      neutralizes_boss: false,
    },
    {
      id: "kneecap",
      name: "Capo & Enforcer Kneecapping Strike",
      desc: "Sniper neutralizes the rival syndicate's chief enforcer. Cripples their combat muscle by 35% for 60m, shatters solidarity pacts, and drops grudge by 50.",
      cost_dirty: 28000,
      cost_clean: 12000,
      grudge_drop: 20,
      lockdown_mins: 45,
      power_cut_pct: 0.35,
      duration_mins: 60,
      recovers_loot: false,
      neutralizes_boss: false,
    },
    {
      id: "boss_hit",
      name: "Archrival Supreme Boss Elimination",
      desc: "Full decapitation strike on the rival syndicate boss's armored convoy. Slashes rival power by 60%, zeroes their grudge (Syndicate Disarray for 2h), cancels compound raids, and seizes a rare boss stash drop!",
      cost_dirty: 80000,
      cost_clean: 50000,
      grudge_drop: 50,
      lockdown_mins: 120,
      power_cut_pct: 0.60,
      duration_mins: 120,
      recovers_loot: true,
      neutralizes_boss: true,
    },
  ],
  retainer_fee: 5000,
  tiers: [
    { id: "sabotage", name: "Sabotage", cost: 8000 },
    { id: "kneecap", name: "Kneecap", cost: 28000 },
    { id: "boss_hit", name: "Boss Hit", cost: 80000 },
  ],
};

// Economy: side hustle revenue reduced by 10x; front business costs reduced by 10x
export const HUSTLES: Hustle[] = [
  // --- TIER 1 ---
  { id: "okada", name: "Okada Parcel Runs", district: "dockside", cost: 18000, income: 10, real_desc: "Pure water sachet & small parcel delivery on Okada bikes", daily_cap: 30000, unlock: 1, tier: 1, build_crew: 1, build_time: 7200 },
  { id: "phones", name: "Phone Unlock Stall", district: "market", cost: 35000, income: 14, real_desc: "Circle Tip-Toe Lane IMEI bypass and screen repairs", daily_cap: 50000, unlock: 1, tier: 1, build_crew: 1, build_time: 7200 },
  { id: "water", name: "Pure Water Sachet Kiosk", district: "zongo", cost: 15000, income: 12, real_desc: "Cool sachet water distribution across lorry stations", daily_cap: 25000, unlock: 1, tier: 1, build_crew: 1, build_time: 7200 },
  { id: "shoes_shine", name: "Circle Shoe Polish", district: "market", cost: 8000, income: 8, real_desc: "Quick leather repair and spit shine at Kwame Nkrumah Circle", daily_cap: 18000, unlock: 1, tier: 1, build_crew: 1, build_time: 7200 },

  // --- TIER 2 ---
  { id: "coconuts", name: "Beach Coconut Stand", district: "osu", cost: 50000, income: 18, real_desc: "Fresh iced coconut vendor cart along Labadi beach", daily_cap: 65000, unlock: 1, tier: 2, build_crew: 1, build_time: 7200 },
  { id: "lottery", name: "Lotto Nii Broker", district: "market", cost: 75000, income: 22, real_desc: "Sure banker lotto prediction and ticket writing kiosk", daily_cap: 85000, unlock: 1, tier: 2, build_crew: 1, build_time: 7200 },
  { id: "scrap_wire", name: "Copper Wire Stripping", district: "dockside", cost: 110000, income: 25, real_desc: "Melting and stripping industrial copper cables", daily_cap: 110000, unlock: 1, tier: 2, build_crew: 1, build_time: 7200 },
  { id: "jerseys", name: "Fake Jersey Plug", district: "osu", cost: 160000, income: 28, real_desc: "Guangzhou replica Black Stars & club jerseys in Osu", daily_cap: 130000, unlock: 1, tier: 2, build_crew: 1, build_time: 7200 },

  // --- TIER 3 ---
  { id: "charcoal", name: "Northern Charcoal Haul", district: "zongo", cost: 280000, income: 32, real_desc: "Sack distribution of hardwood charcoal from Tamale", daily_cap: 180000, unlock: 1, tier: 3, build_crew: 1, build_time: 7200 },
  { id: "herbal", name: "Zongo Herbal Mixtures", district: "zongo", cost: 380000, income: 35, real_desc: "Potent bitters and spiritual concoctions brewed locally", daily_cap: 210000, unlock: 1, tier: 3, build_crew: 1, build_time: 7200 },
  { id: "cassava", name: "Grinding Mill Station", district: "kejetia", cost: 520000, income: 38, real_desc: "Commercial corn and cassava dough processing mill", daily_cap: 250000, unlock: 1, tier: 3, build_crew: 1, build_time: 7200 },
  { id: "tyres", name: "Used Tubeless Tyres", district: "dockside", cost: 720000, income: 42, real_desc: "Second-hand imported European tires and vulcanizing", daily_cap: 300000, unlock: 1, tier: 3, build_crew: 1, build_time: 7200 },

  // --- TIER 4 ---
  { id: "fuel", name: "Fuel Siphon Ring", district: "zongo", cost: 1100000, income: 48, real_desc: "Pipeline taps and 50L yellow jerrycan fuel resale", daily_cap: 380000, unlock: 1, tier: 4, build_crew: 2, build_time: 7200 },
  { id: "scooter", name: "Night Delivery Fleet", district: "osu", cost: 1600000, income: 52, real_desc: "Midnight food and discreet package dispatch service", daily_cap: 450000, unlock: 1, tier: 4, build_crew: 2, build_time: 7200 },
  { id: "sand", name: "Lagoon Sand Winning", district: "dockside", cost: 2200000, income: 58, real_desc: "Illegal beach sand dredging for booming real estate sites", daily_cap: 580000, unlock: 1, tier: 4, build_crew: 2, build_time: 7200 },
  { id: "container", name: "Container Skim", district: "dockside", cost: 3200000, income: 64, real_desc: "Customs manifest skimming at Tema Port Quay 2", daily_cap: 720000, unlock: 1, tier: 4, build_crew: 2, build_time: 7200 },

  // --- TIER 5 ---
  { id: "bitumen", name: "Road Asphalt Tap", district: "zongo", cost: 4800000, income: 72, real_desc: "Siphoning contractor bitumen barrels for private resale", daily_cap: 950000, unlock: 1, tier: 5, build_crew: 2, build_time: 7200 },
  { id: "timber", name: "Ashanti Timber Logging", district: "kejetia", cost: 7000000, income: 80, real_desc: "Unlicensed mahogany and rosewood felling and export", daily_cap: 1200000, unlock: 1, tier: 5, build_crew: 2, build_time: 7200 },
  { id: "cocoa", name: "Cocoa Bag Diverting", district: "kejetia", cost: 9500000, income: 90, real_desc: "Seizing syndicated cocoa sacks before quality control check", daily_cap: 1600000, unlock: 1, tier: 5, build_crew: 2, build_time: 7200 },
  { id: "gold", name: "Gold Dust Runs", district: "kejetia", cost: 13000000, income: 102, real_desc: "Obuasi artisan gold dust smuggling via bush taxis", daily_cap: 2200000, unlock: 1, tier: 5, build_crew: 2, build_time: 7200 },

  // --- TIER 6 ---
  { id: "scrap_metal", name: "Heavy Metal Yard", district: "dockside", cost: 20000000, income: 120, real_desc: "Dismantling abandoned industrial machinery and ships", daily_cap: 3200000, unlock: 1, tier: 6, build_crew: 3, build_time: 7200 },
  { id: "estate", name: "Estate Land Guards", district: "hills", cost: 32000000, income: 145, real_desc: "Perimeter protection squads for disputed Cantonments plots", daily_cap: 4500000, unlock: 1, tier: 6, build_crew: 3, build_time: 7200 },
  { id: "cyber", name: "Circle Cyber Hub", district: "market", cost: 48000000, income: 170, real_desc: "High-speed phishing, wire fraud and data spoofing farm", daily_cap: 6000000, unlock: 1, tier: 6, build_crew: 3, build_time: 7200 },
  { id: "private_security", name: "VIP Bouncer Agency", district: "osu", cost: 70000000, income: 195, real_desc: "Elite armed protection for politicians and visiting celebs", daily_cap: 8000000, unlock: 1, tier: 6, build_crew: 3, build_time: 7200 },

  // --- TIER 7 ---
  { id: "forex", name: "Black Market Forex Bureau", district: "market", cost: 110000000, income: 230, real_desc: "Unlicensed parallel dollar exchange market at Makola", daily_cap: 12000000, unlock: 1, tier: 7, build_crew: 3, build_time: 7200 },
  { id: "import_broker", name: "Unofficial Custom Broker", district: "dockside", cost: 160000000, income: 275, real_desc: "Bypassing port tariffs for massive wholesale syndicates", daily_cap: 18000000, unlock: 1, tier: 7, build_crew: 3, build_time: 7200 },
  { id: "offshore", name: "Offshore Bunkering Rig", district: "dockside", cost: 240000000, income: 330, real_desc: "Mid-ocean oil tanker transfers outside territorial waters", daily_cap: 25000000, unlock: 1, tier: 7, build_crew: 3, build_time: 7200 },
  { id: "diamond", name: "Akwatia Diamond Syndicate", district: "kejetia", cost: 360000000, income: 395, real_desc: "Exclusive pit control over alluvial diamond mining zones", daily_cap: 35000000, unlock: 1, tier: 7, build_crew: 3, build_time: 7200 },

  // --- TIER 8 ---
  { id: "tech_monopoly", name: "Silicon Valley Hub", district: "hills", cost: 520000000, income: 480, real_desc: "Encrypted server infrastructure controlling regional comms", daily_cap: 50000000, unlock: 1, tier: 8, build_crew: 3, build_time: 7200 },
  { id: "toll_gate", name: "Sovereign Highway Tolls", district: "hills", cost: 750000000, income: 580, real_desc: "Private toll collection on major arterial highways", daily_cap: 75000000, unlock: 1, tier: 8, build_crew: 3, build_time: 7200 },
  { id: "syndicate_bank", name: "Underground Clearing House", district: "hills", cost: 1100000000, income: 720, real_desc: "Private bullion vault and high-velocity money laundering", daily_cap: 110000000, unlock: 1, tier: 8, build_crew: 3, build_time: 7200 },
  { id: "cartel_terminal", name: "Trans-West African Terminal", district: "dockside", cost: 1600000000, income: 890, real_desc: "Complete logistics monopoly across regional trade corridors", daily_cap: 160000000, unlock: 1, tier: 8, build_crew: 3, build_time: 7200 },
  { id: "port_cartel", name: "Freeport Cartel", district: "dockside", cost: 2400000000, income: 1150, real_desc: "Your own berths at Tema Freeport: whole containers clear customs untouched", daily_cap: 250000000, unlock: 1, gate: "hustle:port_cartel", tier: 8, build_crew: 3, build_time: 7200 },
];

export const HUSTLE_MAP = Object.fromEntries(HUSTLES.map((h) => [h.id, h]));

export const FRONTS: Front[] = [
  { id: "chopbar", name: "Auntie Esi's Chop Bar", cost: 28000, cap: 28000, dur: 300, unlock: 1 },
  { id: "spare", name: "Spare Parts Shop", cost: 95000, cap: 180000, dur: 900, unlock: 1 },
  { id: "momo", name: "MoMo Kiosk", cost: 280000, cap: 550000, dur: 1800, unlock: 1 },
  { id: "trotro", name: "Trotro Fleet", cost: 750000, cap: 1600000, dur: 3600, unlock: 1 },
  { id: "carwash", name: "Shine Shine Car Wash", cost: 2200000, cap: 5000000, dur: 7200, unlock: 1 },
  { id: "club", name: "Osu Night Club", cost: 6500000, cap: 18000000, dur: 14400, unlock: 1 },
  { id: "royal_casino", name: "Gold Coast Royal Casino", cost: 20000000, cap: 60000000, dur: 21600, unlock: 1, gate: "front:royal_casino" },
];

export const FRONT_MAP = Object.fromEntries(FRONTS.map((f) => [f.id, f]));

export const HEAT_TIERS = [
  { tier: 1, name: "Police Patrol" },
  { tier: 2, name: "CID Detective Squad" },
  { tier: 3, name: "SWAT Tactical Command" },
  { tier: 4, name: "Military Police" },
  { tier: 5, name: "National Security Bureau" },
];

export const ROLES: Record<string, string> = { Hacker: "brains", Driver: "wheels", Enforcer: "muscle", Infiltrator: "stealth" };
export const ARCHETYPES: Record<string, string> = { hacker: "brains", driver: "wheels", enforcer: "muscle", infiltrator: "stealth" };
export const ROLE_ARCH: Record<string, string> = { Hacker: "hacker", Driver: "driver", Enforcer: "enforcer", Infiltrator: "infiltrator" };

export interface CrewTrait {
  id: string;
  name: string;
  type: "good" | "bad";
  statBonus?: Record<string, number>;
  desc: string;
  perk: string;
  levelReq: number;
}

export const CREW_TRAITS: CrewTrait[] = [
  // Good Traits
  { id: "iron_jaw", name: "Iron Jaw", type: "good", statBonus: { muscle: 2 }, desc: "Can take a heavy punch without flinching.", perk: "+2 Muscle, +25% melee defense & knockback resist", levelReq: 1 },
  { id: "ghost_step", name: "Ghost Step", type: "good", statBonus: { stealth: 2 }, desc: "Silent footwork in shadows and alleys.", perk: "+2 Stealth, −20% heat generated on operations", levelReq: 2 },
  { id: "quick_draw", name: "Quick Draw", type: "good", statBonus: { wheels: 2 }, desc: "Lightning fast firearm reflex.", perk: "+2 Wheels, +25% reload & shooting speed", levelReq: 3 },
  { id: "tactician", name: "Tactician", type: "good", statBonus: { brains: 2 }, desc: "Cold, calculating operational thinker.", perk: "+2 Brains, +15% squad defense bonus", levelReq: 4 },
  { id: "heavy_hitter", name: "Heavy Hitter", type: "good", statBonus: { muscle: 3 }, desc: "Brutal striking force.", perk: "+3 Muscle, +35% critical melee damage", levelReq: 2 },
  { id: "gold_hound", name: "Gold Hound", type: "good", desc: "Instinctive eye for hidden cash reserves.", perk: "+15% cash loot recovered on heists & hits", levelReq: 3 },
  { id: "street_medic", name: "Street Medic", type: "good", statBonus: { brains: 1 }, desc: "Treats wounds quickly with field dressings.", perk: "50% faster natural injury recovery", levelReq: 4 },
  { id: "deadeye", name: "Deadeye Marksman", type: "good", statBonus: { brains: 2 }, desc: "Pinpoint ballistic precision.", perk: "+2 Brains, +20% ranged firearm critical chance", levelReq: 5 },

  // Bad Traits
  { id: "loose_cannon", name: "Loose Cannon", type: "bad", statBonus: { muscle: 2 }, desc: "Uncontrolled temper and itchy trigger finger.", perk: "+2 Muscle, but generates +25% police heat", levelReq: 1 },
  { id: "lead_foot_clumsy", name: "Lead Foot", type: "bad", statBonus: { stealth: -2 }, desc: "Heavy stomper; kicks empty bottles and gravel.", perk: "−2 Stealth, enemies notice ambush faster", levelReq: 2 },
  { id: "glass_jaw", name: "Glass Jaw", type: "bad", desc: "Cannot absorb direct hits to the chin.", perk: "Takes 20% more damage from heavy blows", levelReq: 1 },
  { id: "slow_reloader", name: "Slow Reloader", type: "bad", statBonus: { wheels: -1 }, desc: "Fumbles fresh magazines under gunfire.", perk: "−1 Wheels, reload actions take 25% longer", levelReq: 3 },
  { id: "greedy_eyes", name: "Greedy Eyes", type: "bad", desc: "Always skimming pesewas from the communal bag.", perk: "Demands +20% higher daily wage payout", levelReq: 2 },
  { id: "loudmouth", name: "Loudmouth", type: "bad", desc: "Brags at local chop bars after every big job.", perk: "+15% chance to trigger rival retaliation", levelReq: 4 },
];

export const STRENGTHS = [
  { id: "sharp_eyes", name: "Sharp Eyes", stat: "stealth", mod: 2 },
  { id: "lead_foot", name: "Lead Foot", stat: "wheels", mod: 2 },
  { id: "iron_chin", name: "Iron Chin", stat: "muscle", mod: 2 },
  { id: "code_wizard", name: "Code Wizard", stat: "brains", mod: 2 },
];

export const FLAWS = [
  { id: "big_mouth", name: "Big Mouth", desc: "extra heat on heists" },
  { id: "lazy_bones", name: "Lazy Bones", desc: "learns 25% slower" },
  { id: "hothead", name: "Hothead", stat: "stealth", mod: -2, desc: "-2 stealth" },
  { id: "shaky_hands", name: "Shaky Hands", stat: "brains", mod: -2, desc: "-2 brains" },
];

export const FIRST_NAMES = ["Kofi", "Kwame", "Yaw", "Kojo", "Kwesi", "Fiifi", "Nii", "Selasi", "Alhassan", "Baba", "Kwaku", "Ebo"];
export const FEMALE_NAMES = ["Ama", "Akosua", "Abena", "Efua", "Adjoa", "Esi", "Naa", "Fati", "Ekua", "Dzifa", "Afua", "Yaa"];
export const NICKNAMES = ["Small Boy", "Sharp Sharp", "Taller", "Shatta", "One Man", "Dada", "Bra", "Smallie", "Kpakpa", "Fire Fire", "Slow Wine", "Gyata", "Obiaa", "Papa No"];

export interface CrewBackground {
  id: string;
  origin: string;
  arch: string;
  trait: string;
  specialty_biz: string;
  temperament: string;
  bio: string;
  trait_reason: string;
}

export const CREW_BACKGROUNDS: CrewBackground[] = [
  {
    id: "auditor",
    origin: "Ex-Barclays Senior Auditor",
    arch: "hacker",
    trait: "bookkeeper",
    specialty_biz: "momo",
    temperament: "Cold & Methodical",
    bio: "Fled a banking scandal in Airport City with encrypted ledger files. Keeps accounts clean down to the last pesewa.",
    trait_reason: "6 years auditing commercial bank transfers enables seamless double-entry laundering with zero paper trail.",
  },
  {
    id: "chop_queen",
    origin: "Makola Market Chop Queen",
    arch: "infiltrator",
    trait: "chop_master",
    specialty_biz: "chopbar",
    temperament: "Charismatic & Fierce",
    bio: "Ran Auntie Esi's rival kitchen in Makola before joining the syndicate. Can prep waakye for 300 customers before dawn.",
    trait_reason: "High customer turnover and market bulk-buying experience speed up food business laundering cycles by 40%.",
  },
  {
    id: "circle_hacker",
    origin: "Circle Tip-Toe Lane Hacker",
    arch: "hacker",
    trait: "tech_whiz",
    specialty_biz: "phones",
    temperament: "Caffeine-Fueled Genius",
    bio: "Bypasses iCloud locks and clones MoMo SIMs in under 3 minutes behind the Circle overhead bridge.",
    trait_reason: "Custom algorithmic scripts automate phone unlocking and maximize telecom cash skims by +40%.",
  },
  {
    id: "station_master",
    origin: "GPRTU Station Master",
    arch: "driver",
    trait: "fleet_captain",
    specialty_biz: "trotro",
    temperament: "Authoritative Boss",
    bio: "Controlled 45 sprinter trotros on the Kaneshie-Accra route. Drivers obey his whistle without hesitation.",
    trait_reason: "Mastery of transport routes and fuel dispatch cuts fleet downtime and boosts transit speed by 50%.",
  },
  {
    id: "tema_stevedore",
    origin: "Tema Container Port Stevedore",
    arch: "enforcer",
    trait: "customs_insider",
    specialty_biz: "container",
    temperament: "Quiet Heavyweight",
    bio: "Spent a decade working night shifts at Tema Port Quay 2. Knows which shipping containers hold high-value contraband.",
    trait_reason: "Deep understanding of customs manifest falsification boosts container skimming yield by +45%.",
  },
  {
    id: "suame_mechanic",
    origin: "Kumasi Suame Magazine Mechanic",
    arch: "driver",
    trait: "grease_monkey",
    specialty_biz: "spare",
    temperament: "Gritty Perfectionist",
    bio: "Can diagnose a blown gasket by sound alone. Rebuilt engines for cross-border gold runners for 8 years.",
    trait_reason: "Direct connections to scrap yards and salvage yards expand spare parts washing capacity by +50%.",
  },
  {
    id: "vip_bouncer",
    origin: "Osu VIP Lounge Bouncer",
    arch: "enforcer",
    trait: "high_society",
    specialty_biz: "club",
    temperament: "Suave & Intimidating",
    bio: "Guarded private booths where politicians and diplomats party. Knows who spends big and who owes money.",
    trait_reason: "Attracts high-roller patrons to upscale night venues and increases wash capacity by +60%.",
  },
  {
    id: "cid_fixer",
    origin: "Accra CID Forensic Fixer",
    arch: "infiltrator",
    trait: "cleaner",
    specialty_biz: "carwash",
    temperament: "Paranoid & Discreet",
    bio: "Former police records clerk who burned evidence files for cash. Knows exactly what detectives look for during audits.",
    trait_reason: "Routinely purges transaction records and wipes suspicious cash flows, slashing business heat by 75%.",
  },
  {
    id: "zongo_lender",
    origin: "Zongo Underground Moneylender",
    arch: "enforcer",
    trait: "loan_shark",
    specialty_biz: "gold",
    temperament: "Relentless & Hardened",
    bio: "Enforced informal interest rates across Nima and Fadama. Has a photographic memory for who took credit.",
    trait_reason: "Aggressive street collection tactics squeeze +35% higher cash returns out of local operations.",
  },
  {
    id: "okada_runner",
    origin: "Midnight Okada Courier",
    arch: "driver",
    trait: "night_owl",
    specialty_biz: "okada",
    temperament: "Nocturnal Daredevil",
    bio: "Never works in daylight. Navigates unmapped back alleys from Jamestown to Spintex with headlights dimmed.",
    trait_reason: "Nocturnal routing slips past daytime police checkpoints, keeping business processing fast overnight (+35%).",
  },
  {
    id: "market_broker",
    origin: "Kantanto Wholesale Broker",
    arch: "infiltrator",
    trait: "hustle_plug",
    specialty_biz: "jerseys",
    temperament: "Fast-Talking Dealmaker",
    bio: "Brokered counterfeit jersey bales from Guangzhou into Makola. Has the entire market guild on speed dial.",
    trait_reason: "Secures bulk buyer contracts and wholesale pricing, boosting hustle margins across the district (+35%).",
  },
  {
    id: "court_clerk",
    origin: "High Court Registrar Clerk",
    arch: "hacker",
    trait: "smooth_talker",
    specialty_biz: "estate",
    temperament: "Charming Bureaucrat",
    bio: "Spent years preparing judicial warrants and bail dockets. Speaks four local dialects and charms tax inspectors.",
    trait_reason: "Negotiates municipal exemptions and sweet-talks revenue collectors, reducing fees by 6% with +10% tips.",
  },
  {
    id: "bukom_boxer",
    origin: "Bukom Beach Boxing Champion",
    arch: "enforcer",
    trait: "iron_guard",
    specialty_biz: "estate",
    temperament: "Fearless Warrior",
    bio: "Undefeated in 22 bare-knuckle bouts on the Accra beachside. Rival street gangs clear the sidewalk when he steps in.",
    trait_reason: "Provides legendary street intimidation, granting +35 compound raid defense and repelling shakedowns.",
  },
  {
    id: "pipeline_tech",
    origin: "Tema Refinery Pipeline Tech",
    arch: "infiltrator",
    trait: "fuel_siphoner",
    specialty_biz: "fuel",
    temperament: "Calculated Risk-Taker",
    bio: "Trained at Tema Oil Refinery before going rogue. Installed secret tapping valves along underground fuel lines.",
    trait_reason: "Siphons industrial petroleum with zero spillage, yielding +50% dirty cash rate on fuel rings.",
  },
];

export const CREW_BACKGROUND_MAP = Object.fromEntries(CREW_BACKGROUNDS.map((b) => [b.id, b]));

export interface CrewFrontTrait {
  id: string;
  name: string;
  desc: string;
  effect: string;
  bonus: number;
  fee_discount?: number;
  clean_bonus?: number;
}

export const CREW_FRONT_TRAITS: CrewFrontTrait[] = [
  { id: "bookkeeper", name: "Ledger Cook", desc: "+40% wash capacity, -4% laundering fee, +15% clean payout bonus", effect: "cap", bonus: 0.40, fee_discount: 0.04, clean_bonus: 0.15 },
  { id: "chop_master", name: "Kitchen Maestro", desc: "Laundering runs 40% faster; +25% payout at food businesses", effect: "speed", bonus: 0.40 },
  { id: "night_owl", name: "Midnight Expeditor", desc: "+35% wash capacity, 30% faster offline processing", effect: "speed", bonus: 0.30 },
  { id: "cleaner", name: "Forensic Cleaner", desc: "Reduces heat generated by this business by 75%", effect: "heat", bonus: 0.75 },
  { id: "smooth_talker", name: "Street Diplomat", desc: "Reduces laundering fee by 6% and earns 10% customer tips", effect: "fee", bonus: 0.06 },
  { id: "hustle_plug", name: "District Plug", desc: "+35% income to assigned hustle, +15% to all district hustles", effect: "income", bonus: 0.35 },
  { id: "iron_guard", name: "Compound Sentry", desc: "Gives +35 compound raid defense and blocks rival shakedowns", effect: "defense", bonus: 35 },
  { id: "tech_whiz", name: "Circle Cyber Prodigy", desc: "+40% income on Phone & MoMo businesses, cuts transaction lag", effect: "tech", bonus: 0.40 },
  { id: "fleet_captain", name: "Trotro Fleet Master", desc: "Trotro & transit operations run 50% faster, generates clean dividends", effect: "fleet", bonus: 0.50 },
  { id: "high_society", name: "VIP Nightlife Icon", desc: "+60% wash capacity on Osu Night Club, attracts wealthy patrons", effect: "vip", bonus: 0.60 },
  { id: "customs_insider", name: "Dockside Smuggler", desc: "Container Skim & Harbour hustles gain +45% dirty rate with -50% heat", effect: "smuggle", bonus: 0.45 },
  { id: "grease_monkey", name: "Suame Auto Mechanic", desc: "Spare Parts Shop capacity +50% and car wash cycles run 40% faster", effect: "mechanic", bonus: 0.50 },
  { id: "loan_shark", name: "Microfinance Collector", desc: "+35% dirty cash collection yield, +10% interest accrual rate", effect: "lender", bonus: 0.35 },
  { id: "fuel_siphoner", name: "Pipeline Tap Engineer", desc: "Fuel Siphon Ring income +50%, zero fuel waste during transfers", effect: "fuel", bonus: 0.50 },
];

export const DAILY_HEIST_BASE_LIMIT = 3;

export const HEISTS: Heist[] = ALL_66_HEISTS as unknown as Heist[];

export const HEIST_MAP: Record<string, ExtendedHeist> = Object.fromEntries(ALL_66_HEISTS.map((h) => [h.id, h]));

export const HEIST_APPROACHES: Record<string, { name: string; desc: string; chance: number; heat: number; reward: number; dur: number }> = {
  balanced: { name: "Balanced", desc: "No surprises", chance: 0, heat: 1.0, reward: 1.0, dur: 1.0 },
  quiet: { name: "Quiet", desc: "-40% heat, -10% payout", chance: 0.03, heat: 0.6, reward: 0.9, dur: 1.0 },
  loud: { name: "Loud", desc: "+8% chance, +50% heat", chance: 0.08, heat: 1.5, reward: 1.0, dur: 1.0 },
  smart: { name: "Smart", desc: "+15% payout, takes 25% longer", chance: 0.04, heat: 0.9, reward: 1.15, dur: 1.25 },
};

export const HEIST_PREP: Record<string, { name: string; desc: string; cost: number }> = {
  intel: { name: "Buy inside intel", desc: "+12% chance", cost: 0.10 },
  getaway: { name: "Rent getaway car", desc: "30% faster", cost: 0.08 },
};

export interface HeistEventChoice {
  id: string;
  label: string;
  desc: string;
  cost_clean?: number;
  cost_dirty?: number;
  req_role?: string;
  success_msg: string;
  chance_mod: number;
  heat_mod: number;
  payout_mod: number;
}

export interface HeistEvent {
  id: string;
  title: string;
  desc: string;
  radio_chatter: string;
  severity: "low" | "medium" | "critical";
  choices: HeistEventChoice[];
  fail_penalty: {
    chance_drop: number;
    heat_spike: number;
    morale_loss: number;
    desc: string;
  };
}

export const HEIST_EVENTS: HeistEvent[] = [
  {
    id: "police_checkpoint",
    title: "Police SWAT Roadblock Ahead",
    desc: "A heavy Ghana Police checkpoint with spike strips and tactical cruisers was abruptly positioned along the main escape route.",
    radio_chatter: "Boss! Police checkpoint 300 meters out at Tema Roundabout! They're checking boots with flashlights!",
    severity: "critical",
    fail_penalty: {
      chance_drop: 30,
      heat_spike: 25,
      morale_loss: 25,
      desc: "Van forced into a high-speed chase through roadblocks. Critical heat spike and severe chance loss!",
    },
    choices: [
      {
        id: "back_alley",
        label: "Kejetia Back-Alley Drift",
        desc: "Divert through maze-like narrow unpaved market alleys. Requires skilled Driver.",
        req_role: "Driver",
        chance_mod: 20,
        heat_mod: -5,
        payout_mod: 1.0,
        success_msg: "Driver slipped the van through narrow alleyways cleanly! Checkpoint bypassed.",
      },
      {
        id: "bribe_officer",
        label: "Quick Bribe Envelope",
        desc: "Pass GH₵400 clean cash to the sergeant at the barrier.",
        cost_clean: 400,
        chance_mod: 15,
        heat_mod: -15,
        payout_mod: 1.0,
        success_msg: "Sergeant took the envelope and waved the convoy through without inspection.",
      },
      {
        id: "ram_barrier",
        label: "Ram Roadblock with Muscle",
        desc: "Smash through the wooden barriers with raw horsepower. High noise and heat.",
        chance_mod: 8,
        heat_mod: 20,
        payout_mod: 1.0,
        success_msg: "Plowed straight through the wooden barriers! Escape underway but sirens are blaring.",
      },
    ],
  },
  {
    id: "silent_alarm",
    title: "Auxiliary Laser Sensor Tripped",
    desc: "A hidden infrared perimeter wire was triggered near the vault entryway, initiating a silent CID alert countdown.",
    radio_chatter: "Warning! Red light on the junction box. CID central dispatch received an automated ping!",
    severity: "critical",
    fail_penalty: {
      chance_drop: 35,
      heat_spike: 30,
      morale_loss: 20,
      desc: "CID Task Force scrambled to the site. Security locks engaged!",
    },
    choices: [
      {
        id: "loop_cameras",
        label: "Hacker Relay Loop",
        desc: "Overheat the relay hub and feed looped false security footage. Requires Hacker.",
        req_role: "Hacker",
        chance_mod: 25,
        heat_mod: -10,
        payout_mod: 1.0,
        success_msg: "Hacker patched into the telemetry box and cancelled the dispatch alarm!",
      },
      {
        id: "cut_power",
        label: "Sever District Power Line",
        desc: "Blackout the local power grid to kill alarm communications.",
        chance_mod: 12,
        heat_mod: 10,
        payout_mod: 1.0,
        success_msg: "Power cut plunging the compound into darkness. Alarm disabled.",
      },
      {
        id: "speed_grab",
        label: "Rush Extraction Now",
        desc: "Grab whatever cash is exposed and sprint for the doors before response arrives.",
        chance_mod: -10,
        heat_mod: 15,
        payout_mod: 0.8,
        success_msg: "Grabbed partial loot and retreated rapidly before police cruisers arrived.",
      },
    ],
  },
  {
    id: "corrupt_guard",
    title: "Night Sentry Standoff",
    desc: "A private security supervisor unexpectedly appeared in the hallway with a radio and shotgun.",
    radio_chatter: "Boss, night supervisor just walked around the corner! He's about to hit the panic button!",
    severity: "medium",
    fail_penalty: {
      chance_drop: 25,
      heat_spike: 20,
      morale_loss: 15,
      desc: "Guard tripped panic button! Sirens wailing across the district.",
    },
    choices: [
      {
        id: "silent_takedown",
        label: "Silent Enforcer Takedown",
        desc: "Drop the sentry quietly and secure him in the utility closet. Requires Enforcer.",
        req_role: "Enforcer",
        chance_mod: 20,
        heat_mod: 0,
        payout_mod: 1.0,
        success_msg: "Enforcer neutralized the sentry without a single gunshot. Clear to proceed.",
      },
      {
        id: "settle_cash",
        label: "Buy His Silence",
        desc: "Hand over GH₵500 dirty cash from the street purse.",
        cost_dirty: 500,
        chance_mod: 15,
        heat_mod: -5,
        payout_mod: 1.0,
        success_msg: "Guard quietly pocketed the stack and turned the other way.",
      },
      {
        id: "intimidate",
        label: "Syndicate Death Threat",
        desc: "Threaten his family with syndicate retribution if he touches that alarm.",
        chance_mod: 10,
        heat_mod: 5,
        payout_mod: 1.0,
        success_msg: "Guard threw his radio down and raised his hands in terror.",
      },
    ],
  },
  {
    id: "getaway_traffic",
    title: "Oxford Street Gridlock",
    desc: "A broken-down commercial trotro and street market crowd completely blocked the primary getaway intersection.",
    radio_chatter: "We're boxed in on Oxford Street! Taxis honking everywhere, siren sirens echoing from behind!",
    severity: "medium",
    fail_penalty: {
      chance_drop: 20,
      heat_spike: 18,
      morale_loss: 15,
      desc: "Stuck in traffic while squad cars converge. Massive delay and stress!",
    },
    choices: [
      {
        id: "okada_flank",
        label: "Okada Bike Flank",
        desc: "Call Okada courier squad to split the loot and ferry crew across sidewalks (GH₵300 dirty).",
        cost_dirty: 300,
        chance_mod: 20,
        heat_mod: -10,
        payout_mod: 1.1,
        success_msg: "Okada riders swept in, split the bags, and zipped through alleys effortlessly!",
      },
      {
        id: "curb_jump",
        label: "Curb-Jump Drift",
        desc: "Driver mounts the concrete sidewalk and roars through the gas station plaza. Requires Driver.",
        req_role: "Driver",
        chance_mod: 18,
        heat_mod: 8,
        payout_mod: 1.0,
        success_msg: "Driver jumped the curb with screeching tires and broke onto the highway!",
      },
      {
        id: "smoke_screen",
        label: "Smoke Grenade Diversion",
        desc: "Infiltrator pops military smoke to obscure the intersection. Requires Infiltrator.",
        req_role: "Infiltrator",
        chance_mod: 15,
        heat_mod: -5,
        payout_mod: 1.0,
        success_msg: "Dense white smoke engulfed the street, letting the van slip away unseen.",
      },
    ],
  },
  {
    id: "vault_fail",
    title: "Thermal Drill Bit Overheating",
    desc: "The reinforced tungsten door plating is tougher than blueprints indicated. Drill motor is smoking.",
    radio_chatter: "Drill motor is at 400 degrees! The magnetic locks are resisting the thermal charge!",
    severity: "medium",
    fail_penalty: {
      chance_drop: 30,
      heat_spike: 15,
      morale_loss: 20,
      desc: "Drill died! Forced to leave half the cash boxes behind in the vault.",
    },
    choices: [
      {
        id: "hack_override",
        label: "Firmware Voltage Spike",
        desc: "Hacker remotely injects an over-voltage command into the locking servo. Requires Hacker.",
        req_role: "Hacker",
        chance_mod: 25,
        heat_mod: -5,
        payout_mod: 1.15,
        success_msg: "Hacker popped the electronic deadbolts! Vault door swung wide open.",
      },
      {
        id: "crowbar_muscle",
        label: "Hydraulic Pry Leverage",
        desc: "Enforcers use hydraulic rescue jaws and steel pry bars. Requires Enforcer.",
        req_role: "Enforcer",
        chance_mod: 18,
        heat_mod: 8,
        payout_mod: 1.05,
        success_msg: "Enforcers wrenched the hinges apart with brute force and popped the door!",
      },
      {
        id: "coolant_boost",
        label: "Liquid Coolant Injector",
        desc: "Spend GH₵250 clean cash for specialized industrial cutting coolant.",
        cost_clean: 250,
        chance_mod: 15,
        heat_mod: 0,
        payout_mod: 1.1,
        success_msg: "Drill bit cooled rapidly and sliced cleanly through the inner locks.",
      },
    ],
  },
  {
    id: "civilian_witness",
    title: "Curious Market Bystander",
    desc: "A late-night street vendor stepped behind the back alley dumpster and spotted duffel bags being loaded into the van.",
    radio_chatter: "Boss, someone just popped out of the bakery back door with a phone in hand!",
    severity: "low",
    fail_penalty: {
      chance_drop: 15,
      heat_spike: 15,
      morale_loss: 10,
      desc: "Witness posted video online! Heat elevated and police alerted.",
    },
    choices: [
      {
        id: "smooth_talk",
        label: "Street Diplomat Settlement",
        desc: "Infiltrator smiles, passes GH₵150 clean cash, and convinces him to forget what he saw. Requires Infiltrator.",
        req_role: "Infiltrator",
        cost_clean: 150,
        chance_mod: 18,
        heat_mod: -10,
        payout_mod: 1.0,
        success_msg: "Infiltrator calmed the witness down with cash and a friendly pat on the shoulder.",
      },
      {
        id: "confiscate_phone",
        label: "Confiscate Phone",
        desc: "Snatch the phone, smash the SIM card, and lock him in the storeroom.",
        chance_mod: 12,
        heat_mod: 5,
        payout_mod: 1.0,
        success_msg: "Phone smashed and witness safely secured. No calls will be made tonight.",
      },
      {
        id: "ignore_run",
        label: "Speed Up & Ignore",
        desc: "Slam the doors and floor the gas pedal before he can dial.",
        chance_mod: 5,
        heat_mod: 12,
        payout_mod: 1.0,
        success_msg: "Spun tires and sped off into the night.",
      },
    ],
  },
];

export const HEIST_EVENT_MAP = Object.fromEntries(HEIST_EVENTS.map((e) => [e.id, e]));

export const RIVALS: Rival[] = [
  { id: "kpakpa", name: "Kpakpa Crew", district: "dockside", boss: "Nii Kpakpa", ally_id: "coastal", bloc: "Harbour Brotherhood", personality: "Vindictive" },
  { id: "coastal", name: "Coastal Smugglers", district: "dockside", boss: "Captain Mensah", ally_id: "kpakpa", bloc: "Harbour Brotherhood", personality: "Aggressive" },
  { id: "lions", name: "Zongo Lions", district: "zongo", boss: "Alhaji Simba", ally_id: "nima", bloc: "Northern Front", personality: "Ruthless" },
  { id: "nima", name: "Nima Black Stars", district: "zongo", boss: "Commander Moro", ally_id: "lions", bloc: "Northern Front", personality: "Vindictive" },
  { id: "silk", name: "Osu Silk Syndicate", district: "osu", boss: "Madam Silk", ally_id: "cantonments", bloc: "High Society Pact", personality: "Calculated" },
  { id: "cantonments", name: "Cantonments Cartel", district: "hills", boss: "Nana Kwame", ally_id: "silk", bloc: "High Society Pact", personality: "Calculated" },
  { id: "kings", name: "Junction Kings", district: "kejetia", boss: "Opanin Kwabena", ally_id: "ashanti", bloc: "Gold Highway Bloc", personality: "Aggressive" },
  { id: "ashanti", name: "Ashanti Vipers", district: "kejetia", boss: "Yaw Barima", ally_id: "kings", bloc: "Gold Highway Bloc", personality: "Ruthless" },
  { id: "circle", name: "Circle Phone Mafia", district: "market", boss: "Slick Jerry", ally_id: "spintex", bloc: "Metro Tech Alliance", personality: "Calculated" },
  { id: "spintex", name: "Spintex Speedsters", district: "osu", boss: "Fire Fiifi", ally_id: "circle", bloc: "Metro Tech Alliance", personality: "Aggressive" },
  { id: "tema", name: "Tema Container Cartel", district: "dockside", boss: "Iron Salifu", ally_id: "lions", bloc: "Northern Front", personality: "Ruthless" },
];

export const RIVAL_MAP = Object.fromEntries(RIVALS.map((r) => [r.id, r]));

export const UPGRADES: Record<string, { name: string; group: "mansion" | "garage"; cost: number; ap_cost?: number; max: number; desc: string }> = {
  vault: { name: "Vault", group: "mansion", cost: 5000, max: 99, desc: "+5,000 Protected Vault Cash per level (Starts at 5,000, scales 2.8x)" },
  walls: { name: "Compound Walls", group: "mansion", cost: 300, ap_cost: 1, max: 99, desc: "+15 raid defence per level" },
  safehouse: { name: "Village Safehouse", group: "mansion", cost: 0, ap_cost: 5, max: 1, desc: "Offline earnings cap 12h to 24h (Costs 5 Attribute Points)" },
  studio: { name: "Hiplife Studio", group: "mansion", cost: 10000, ap_cost: 1, max: 20, desc: "+5% hustle income per level" },
  okada: { name: "Okada Squad", group: "garage", cost: 6000, ap_cost: 1, max: 15, desc: "Heists finish 5% faster per level" },
  trotro: { name: "Trotro Van", group: "garage", cost: 26000, ap_cost: 1, max: 15, desc: "+10% laundering batch size per level" },
  quarters: { name: "Crew Quarters", group: "mansion", cost: 250000, ap_cost: 1, max: 5, desc: "+1 crew slot per level (base 9, up to 14 max)" },
  cruiser: { name: "V8 Land Cruiser", group: "garage", cost: 150000, ap_cost: 1, max: 15, desc: "+10 raid defence per level" },
};

export interface BettingTier {
  multiplier: number;
  probability: number; // 0.20 down to 0.003
  label: "High" | "Very high" | "Extreme" | "Exceptional";
}

export const BETTING_TIERS: BettingTier[] = [
  { multiplier: 1.2, probability: 0.35, label: "High" }, // v9: starting 1.2x tier odds raised from 20% to 35%
  { multiplier: 1.5, probability: 0.17, label: "High" },
  { multiplier: 2.0, probability: 0.14, label: "Very high" },
  { multiplier: 3.0, probability: 0.11, label: "Very high" },
  { multiplier: 5.0, probability: 0.08, label: "Extreme" },
  { multiplier: 10.0, probability: 0.05, label: "Extreme" },
  { multiplier: 20.0, probability: 0.03, label: "Exceptional" },
  { multiplier: 50.0, probability: 0.01, label: "Exceptional" },
  { multiplier: 100.0, probability: 0.003, label: "Exceptional" },
];

export const BETTING_CONFIG = {
  take_rate: 0.10, // 10% operator take from gross payout
  min_stake: 1,
  max_stake_base: 50000,
};

export interface MansionFacility {
  id: string;
  name: string;
  desc: string;
  max: number;
  base_cost_dirty: number;
  base_cost_clean: number;
  perks: string[];
  recommended_arch: "enforcer" | "hacker" | "infiltrator" | "driver";
  /** v9: other archetypes that also get the station synergy */
  alt_archs?: Array<"enforcer" | "hacker" | "infiltrator" | "driver">;
  station_role: string;
  synergy_desc: string;
  penalty_desc: string;
}

export const MANSION_FACILITIES: Record<string, MansionFacility> = {
  infirmary: {
    id: "infirmary",
    name: "Medical Clinic & Sickbay",
    desc: "Field clinic treating crew trauma. Recovers crew morale (+10/hr) and makes crew rehab cheaper.",
    max: 2,
    base_cost_dirty: 35000,
    base_cost_clean: 48000,
    perks: ["+10 crew morale recovery/hr", "Crew rehab cost -25%"],
    recommended_arch: "infiltrator",
    station_role: "Field Medic & Trauma Triage",
    synergy_desc: "Infiltrators keep the clinic sterile: +1.8%/min extra auto-repair.",
    penalty_desc: "Worn (25–49%): perks halved. Critical (<25%): perks shut down until serviced.",
  },
  armoury: {
    id: "armoury",
    name: "Armoury & Munitions Workshop",
    desc: "Weapon maintenance and bullet pressing. Bolsters compound security against rival invasions.",
    max: 2,
    base_cost_dirty: 45000,
    base_cost_clean: 60000,
    perks: ["+25 raid defence per level", "Stationed crew add defence from their Muscle (Enforcers ×2.0)"],
    recommended_arch: "enforcer",
    station_role: "Munitions Master & Weaponsmith",
    synergy_desc: "Enforcers grease firearms: +1.8%/min extra auto-repair and bigger defence bonus.",
    penalty_desc: "Worn (25–49%): perks halved. Critical (<25%): perks shut down until serviced.",
  },
  radio_tower: {
    id: "radio_tower",
    name: "Intelligence & Radio Hub",
    desc: "Taps police dispatch and rival syndicate radio traffic. Detects alliance raids before they launch.",
    max: 2,
    base_cost_dirty: 50000,
    base_cost_clean: 75000,
    perks: ["+10s earlier raid warning per level (max +60s)"],
    recommended_arch: "hacker",
    station_role: "Signal Intelligence & Scanner Tech",
    synergy_desc: "Hackers tune the antennas: +1.8%/min extra auto-repair.",
    penalty_desc: "Worn (25–49%): perks halved. Critical (<25%): perks shut down until serviced.",
  },
  barracks: {
    id: "barracks",
    name: "Crew Bunkhouse & Lounge",
    desc: "Comfortable air-conditioned bunks that keep crew morale from collapsing. (Crew capacity comes from the Crew Quarters upgrade: 9 → 14.)",
    max: 2,
    base_cost_dirty: 35000,
    base_cost_clean: 55000,
    perks: ["Crew morale never drops below 25%"],
    recommended_arch: "driver",
    station_role: "Quartermaster & Quarters Sanitation",
    synergy_desc: "Drivers run supplies for the quarters: +1.8%/min extra auto-repair.",
    penalty_desc: "Worn (25–49%): perks halved. Critical (<25%): perks shut down until serviced.",
  },
  generator: {
    id: "generator",
    name: "Solar & Diesel Power Grid",
    desc: "Uninterruptible power system. Keeps laundering machines and heist gear running fast.",
    max: 2,
    base_cost_dirty: 60000,
    base_cost_clean: 85000,
    perks: ["Laundering cycles 20% faster", "Heists finish 5% faster per level"],
    recommended_arch: "driver",
    alt_archs: ["hacker"],
    station_role: "Diesel Logistics & Spark Plug Mechanic",
    synergy_desc: "Drivers manage fuel and Hackers regulate voltage: +1.8%/min extra auto-repair.",
    penalty_desc: "Worn (25–49%): perks halved. Critical (<25%): perks shut down until serviced.",
  },
  vault: {
    id: "vault",
    name: "Reinforced Underground Vault",
    desc: "Heavy blast-door subterranean vault. Starts at 5,000 capacity, adding +5,000 protected capacity per level.",
    max: 2,
    base_cost_dirty: 5000,
    base_cost_clean: 48000,
    perks: ["+5,000 protected vault cash per level (base 5,000)"],
    recommended_arch: "hacker",
    station_role: "Hydraulic Blast-Door & Sensor Tech",
    synergy_desc: "Hackers calibrate the biometric locks: +1.8%/min extra auto-repair.",
    penalty_desc: "Worn (25–49%): perks halved. Critical (<25%): perks shut down until serviced.",
  },
  walls: {
    id: "walls",
    name: "Perimeter High Walls & Razor Wire",
    desc: "Reinforced concrete perimeter with concertina wire and automatic searchlights.",
    max: 2,
    base_cost_dirty: 35000,
    base_cost_clean: 50000,
    perks: ["+30 raid defence per level", "Stationed crew add defence from their Muscle (Enforcers ×2.5)"],
    recommended_arch: "enforcer",
    station_role: "Perimeter Sentry & Barricade Mason",
    synergy_desc: "Enforcers patrol the parapets: +1.8%/min extra auto-repair and bigger defence bonus.",
    penalty_desc: "Worn (25–49%): perks halved. Critical (<25%): perks shut down until serviced.",
  },
};

export interface BossPerk {
  id: string;
  name: string;
  desc: string;
  max: number;
}

export const BOSS_PERKS: Record<string, BossPerk> = {
  negotiator: { id: "negotiator", name: "Master Negotiator", desc: "-2% laundering fee per rank", max: 3 },
  street_king: { id: "street_king", name: "Accra Street King", desc: "+12% all hustle income per rank", max: 3 },
  iron_jaw: { id: "iron_jaw", name: "Iron Will", desc: "+20 compound defense per rank", max: 3 },
  ghost: { id: "ghost", name: "Ghost Operator", desc: "-15% heat generated from operations", max: 3 },
  commander: { id: "commander", name: "Field Commander", desc: "+1 to all crew base stats and +10 base morale", max: 3 },
};

export const BLACK_MARKET: BlackMarketItem[] = [
  { id: "burner", name: "Burner Phone", desc: "Drop 35 heat", price: 30000, kind: "heat", value: 35, heat: 5 },
  { id: "receipt", name: "Fake Receipt Book", desc: "Drop 25 heat", price: 30000, kind: "heat", value: 25, heat: 4 },
  { id: "envelope", name: "Brown Envelope", desc: "Quiet bribe: drop 50 heat", price: 45000, kind: "heat", value: 50, heat: 8 },
  { id: "donation", name: "Church Harvest Donation", desc: "Look holy: drop 80 heat", price: 75000, kind: "heat", value: 80, heat: 12 },
  { id: "vest", name: "Kevlar Vest", desc: "+15 raid defence each (max 10)", price: 35000, kind: "defence", value: 15, max: 10, heat: 10 },
  { id: "cctv", name: "CCTV Kit", desc: "+25 raid defence each (max 5)", price: 60000, kind: "defence", value: 25, max: 5, heat: 15 },
  { id: "spikes", name: "Spike Strips", desc: "+6 fortify during a raid (max 7)", price: 50000, kind: "fortify", value: 6, heat: 12 },
  { id: "dog", name: "Guard Dog 'Bullet'", desc: "+10 fortify during a raid (max 7)", price: 85000, kind: "fortify", value: 10, heat: 18 },
  { id: "radio", name: "Walkie-Talkie Set", desc: "+15% on your next heist", price: 30000, kind: "heist_boost", value: 0.15, heat: 10 },
  { id: "goggles", name: "Night Goggles", desc: "+25% on your next heist", price: 38000, kind: "heist_boost", value: 0.25, heat: 12 },
  { id: "scanner", name: "Police Scanner", desc: "+35% on your next heist", price: 48000, kind: "heist_boost", value: 0.35, heat: 15 },
  { id: "blueprints", name: "Stolen Blueprints", desc: "+45% on your next heist", price: 65000, kind: "heist_boost", value: 0.45, heat: 20 },
  { id: "lockpick", name: "Lock Pick Kit", desc: "+55% on your next heist", price: 32000, kind: "heist_boost", value: 0.55, heat: 25 },
  { id: "plates", name: "Fake Number Plates", desc: "Your next heist brings 80% less heat", price: 36000, kind: "heist_heat", value: 0.2, heat: 30 },
  { id: "okada_key", name: "Spare Okada Keys", desc: "Your next heist finishes 50% faster", price: 42000, kind: "heist_speed", value: 0.5, heat: 35 },
  { id: "energy", name: "Malt & Energy Crate", desc: "+200 XP to every free crew member", price: 50000, kind: "crew_xp", value: 200, heat: 15 },
  { id: "feast", name: "Jollof & Waakye Feast", desc: "+500 XP to every free crew member", price: 90000, kind: "crew_xp", value: 500, heat: 25 },
];

export const BM_MAP = Object.fromEntries(BLACK_MARKET.map((b) => [b.id, b]));

export const COSMETICS: CosmeticItem[] = [
  { id: "drip_fugu", name: "Smock Fugu Jacket", slot: "drip", rarity: "common", clean: 800 },
  { id: "drip_kente", name: "Kente Stole Fit", slot: "drip", rarity: "rare", clean: 2500 },
  { id: "drip_gold", name: "Gold Chain Drip", slot: "drip", rarity: "legendary", clean: 0 },
  { id: "car_corolla", name: "Corolla 'Bullet'", slot: "car", rarity: "common", clean: 1500 },
  { id: "car_benz", name: "Night Benz", slot: "car", rarity: "rare", clean: 6000 },
  { id: "car_v8", name: "Gold-Trim V8", slot: "car", rarity: "legendary", clean: 0 },
  { id: "decor_drum", name: "Fontomfrom Drums", slot: "decor", rarity: "common", clean: 1200 },
  { id: "decor_stool", name: "Golden Stool Replica", slot: "decor", rarity: "legendary", clean: 0 },
  { id: "decor_art", name: "Adinkra Wall Art", slot: "decor", rarity: "rare", clean: 3500 },
];

export const COSMETIC_MAP = Object.fromEntries(COSMETICS.map((c) => [c.id, c]));

export const GEAR: GearItem[] = [
  { id: "w_cutlass", name: "Farm Cutlass", slot: "melee", model: "blade", rarity: "common", price: 600, stat: "muscle", mod: 1, power: 4, unlock: 1, color: "#9ca3af", tier: 1 },
  { id: "w_bat", name: "Cricket Bat", slot: "melee", model: "bat", rarity: "common", price: 900, stat: "muscle", mod: 1, power: 5, unlock: 1, color: "#a16207", tier: 1 },
  { id: "w_9mm", name: "Street 9mm", slot: "secondary", model: "pistol", rarity: "common", price: 1500, stat: "stealth", mod: 1, power: 5, unlock: 1, color: "#27272a", tier: 1 },
  { id: "w_chain", name: "Okada Chain", slot: "melee", model: "bat", rarity: "common", price: 1400, stat: "muscle", mod: 1, power: 6, unlock: 1, color: "#71717a", tier: 2 },
  { id: "w_flare", name: "Flare Pistol", slot: "secondary", model: "pistol", rarity: "common", price: 3500, stat: "wheels", mod: 1, power: 6, unlock: 1, color: "#ea580c", tier: 2 },
  { id: "w_machete", name: "Gold-Hilt Machete", slot: "melee", model: "blade", rarity: "rare", price: 6000, stat: "muscle", mod: 2, power: 10, unlock: 1, color: "#d4af37", tier: 2 },
  { id: "w_shotgun", name: "Pump Shotgun", slot: "primary", model: "shotgun", rarity: "common", price: 4000, stat: "muscle", mod: 1, power: 9, unlock: 1, color: "#3f3f46", tier: 3 },
  { id: "w_revolver", name: "Old Revolver", slot: "secondary", model: "pistol", rarity: "rare", price: 9000, stat: "stealth", mod: 2, power: 9, unlock: 1, color: "#52525b", tier: 3 },
  { id: "w_cleaver", name: "Chop Bar Cleaver", slot: "melee", model: "blade", rarity: "rare", price: 15000, stat: "muscle", mod: 2, power: 12, unlock: 1, color: "#d4d4d8", tier: 3 },
  { id: "w_smg", name: "Compact SMG", slot: "primary", model: "rifle", rarity: "rare", price: 25000, stat: "wheels", mod: 2, power: 14, unlock: 1, color: "#18181b", tier: 4 },
  { id: "w_380", name: "Compact .380", slot: "secondary", model: "pistol", rarity: "rare", price: 20000, stat: "stealth", mod: 2, power: 11, unlock: 1, color: "#3f3f46", tier: 4 },
  { id: "w_dbl", name: "Double Barrel", slot: "primary", model: "shotgun", rarity: "rare", price: 18000, stat: "muscle", mod: 2, power: 13, unlock: 1, color: "#27272a", tier: 4 },
  { id: "w_rifle", name: "Hunter Rifle", slot: "primary", model: "rifle", rarity: "rare", price: 45000, stat: "brains", mod: 2, power: 17, unlock: 1, color: "#713f12", tier: 5 },
  { id: "w_knuckles", name: "Kente Knuckles", slot: "melee", model: "knuckles", rarity: "legendary", price: 60000, stat: "muscle", mod: 3, power: 18, unlock: 1, color: "#ffd700", tier: 5 },
  { id: "w_taser", name: "Silent Taser", slot: "secondary", model: "pistol", rarity: "legendary", price: 80000, stat: "stealth", mod: 3, power: 15, unlock: 1, color: "#0ea5e9", tier: 6 },
  { id: "w_spear", name: "Ceremonial Spear", slot: "melee", model: "blade", rarity: "legendary", price: 150000, stat: "muscle", mod: 3, power: 22, unlock: 1, color: "#b45309", tier: 6 },
  { id: "w_hawk", name: "Gold Desert Hawk", slot: "secondary", model: "pistol", rarity: "legendary", price: 250000, stat: "muscle", mod: 3, power: 20, unlock: 1, color: "#ffd700", tier: 7 },
  { id: "w_gold_ar", name: "Gold-Plated Rifle", slot: "primary", model: "rifle", rarity: "legendary", price: 400000, stat: "muscle", mod: 3, power: 28, unlock: 1, color: "#ffd700", tier: 7 },
  { id: "w_long", name: "Long Rifle", slot: "primary", model: "rifle", rarity: "legendary", price: 600000, stat: "brains", mod: 3, power: 32, unlock: 1, color: "#3f2a14", tier: 8 },
  { id: "w_lmg", name: "Heavy LMG", slot: "primary", model: "rifle", rarity: "legendary", price: 1200000, stat: "muscle", mod: 4, power: 40, unlock: 1, color: "#111111", tier: 8 },
  { id: "c_snapback", name: "Black Stars Snapback", slot: "hat", model: "cap", rarity: "common", price: 300, color: "#111111" },
  { id: "c_kufi", name: "Kente Kufi", slot: "hat", model: "kufi", rarity: "rare", price: 1200, color: "#d4af37" },
  { id: "c_beanie", name: "Red Beanie", slot: "hat", model: "beanie", rarity: "common", price: 400, color: "#d90429" },
  { id: "c_hoodie", name: "Night Hoodie", slot: "top", model: "top", style: "hoodie", pattern: "plain", rarity: "common", price: 500, color: "#1f1f1f" },
  { id: "c_skull_tee", name: "Skull & Bones Tee", slot: "top", model: "top", style: "tee", pattern: "plain", graphic: "skull", rarity: "common", price: 450, color: "#111111" },
  { id: "c_flower_shirt", name: "Holiday Flower Shirt", slot: "top", model: "top", style: "open_shirt", pattern: "flowers", graphic: "skull", rarity: "rare", price: 1600, color: "#1f6f8b" },
  { id: "c_kente_shirt", name: "Kente Print Shirt", slot: "top", model: "top", style: "open_shirt", pattern: "kente", rarity: "rare", price: 1800, color: "#e0a800" },
  { id: "c_smock", name: "Northern Smock", slot: "top", model: "top", style: "tee", pattern: "stripes", rarity: "rare", price: 2200, color: "#1e3a8a" },
  { id: "c_leather", name: "Red Leather Jacket", slot: "top", model: "top", style: "jacket", pattern: "plain", rarity: "legendary", price: 9000, color: "#9f1239" },
  { id: "c_tracksuit", name: "Black Stars Tracksuit", slot: "top", model: "top", style: "tee", pattern: "stripes", rarity: "rare", price: 2600, stat: "wheels", mod: 1, color: "#b91c1c" },
  { id: "c_undervest", name: "Kevlar Under-vest", slot: "top", model: "top", style: "tee", pattern: "plain", rarity: "rare", price: 6000, stat: "muscle", mod: 1, color: "#3f3f46" },
  { id: "c_ghost", name: "Ghost Hoodie", slot: "top", model: "top", style: "hoodie", pattern: "camo", rarity: "legendary", price: 12000, stat: "stealth", mod: 2, color: "#0f172a" },
  { id: "c_suit", name: "Big Man Suit", slot: "top", model: "top", style: "jacket", pattern: "plain", rarity: "legendary", price: 15000, stat: "brains", mod: 2, color: "#111827" },
  { id: "c_joggers", name: "Grey Joggers", slot: "bottom", model: "bottom", style: "pants", rarity: "common", price: 600, color: "#57534e" },
  { id: "c_tactical", name: "Tactical Pants", slot: "bottom", model: "bottom", style: "pants", rarity: "rare", price: 3000, stat: "stealth", mod: 1, color: "#27272a" },
  { id: "c_runners", name: "Getaway Runners", slot: "shoes", model: "shoes", rarity: "rare", price: 2500, stat: "wheels", mod: 1, color: "#16a34a" },
  { id: "c_loafers", name: "Gold Loafers", slot: "shoes", model: "shoes", rarity: "legendary", price: 8000, stat: "brains", mod: 1, color: "#d4af37" },
  { id: "c_bucket", name: "Bucket Hat", slot: "hat", model: "cap", rarity: "common", price: 350, color: "#4d5d2a" },
  { id: "c_durag", name: "Silk Durag", slot: "hat", model: "beanie", rarity: "rare", price: 900, stat: "stealth", mod: 1, color: "#6b21a8" },
  { id: "c_jeans", name: "Dark Jeans", slot: "bottom", model: "bottom", style: "pants", rarity: "common", price: 400, color: "#1e293b" },
  { id: "c_cargo", name: "Olive Cargo Shorts", slot: "bottom", model: "bottom", style: "cargo_shorts", rarity: "common", price: 500, color: "#3a4a3f" },
  { id: "c_camo_shorts", name: "Camo Shorts", slot: "bottom", model: "bottom", style: "shorts", pattern: "camo", rarity: "rare", price: 1100, color: "#4d5d2a" },
  { id: "c_kente_pants", name: "Kente Trousers", slot: "bottom", model: "bottom", style: "pants", pattern: "kente", rarity: "legendary", price: 7000, color: "#00a86b" },
  { id: "c_slides", name: "Chale Wote Slides", slot: "shoes", model: "shoes", rarity: "common", price: 200, color: "#f3f4f6" },
  { id: "c_sneakers", name: "Gold Sneakers", slot: "shoes", model: "shoes", rarity: "rare", price: 1500, color: "#ffd700" },
  { id: "c_boots", name: "Combat Boots", slot: "shoes", model: "shoes", rarity: "common", price: 700, color: "#3f2a14" },
];

export const TIER2_CATEGORIES: Record<string, Tier2Category> = {
  shadow_silk: {
    id: "shadow_silk",
    name: "Shadow Silk",
    trait_name: "Chameleon Veil",
    desc: "-20% heat generation from all actions",
    effect: "heat_reduce",
    bonus: 0.20,
    stat_bonus: { stat: "stealth", mod: 2 },
    color: "#6366f1",
  },
  diamond_weave: {
    id: "diamond_weave",
    name: "Diamond Weave",
    trait_name: "Ballistic Deflection",
    desc: "+25 Compound & Boss raid defense",
    effect: "raid_defense",
    bonus: 25,
    stat_bonus: { stat: "muscle", mod: 2 },
    color: "#38bdf8",
  },
  viper_leather: {
    id: "viper_leather",
    name: "Viper Leather",
    trait_name: "Venomous Retaliation",
    desc: "+15 weapon attack power in skirmishes",
    effect: "attack_power",
    bonus: 15,
    stat_bonus: { stat: "muscle", mod: 2 },
    color: "#22c55e",
  },
  diplomatic_seal: {
    id: "diplomatic_seal",
    name: "Diplomatic Seal",
    trait_name: "Consular Immunity",
    desc: "Rival grudges decay 30% faster; heat cools 2x faster",
    effect: "grudge_decay",
    bonus: 0.30,
    stat_bonus: { stat: "brains", mod: 2 },
    color: "#eab308",
  },
  gold_standard: {
    id: "gold_standard",
    name: "Gold Standard",
    trait_name: "Midas Touch",
    desc: "15% chance to double clean payout upon laundering collection",
    effect: "double_clean",
    bonus: 0.15,
    stat_bonus: { stat: "brains", mod: 2 },
    color: "#ffd700",
  },
  bloodstone_obsidian: {
    id: "bloodstone_obsidian",
    name: "Bloodstone Obsidian",
    trait_name: "Intimidation Glare",
    desc: "+30% dirty cash seized when hitting rivals",
    effect: "rival_loot",
    bonus: 0.30,
    stat_bonus: { stat: "muscle", mod: 2 },
    color: "#ef4444",
  },
  phantom_stitch: {
    id: "phantom_stitch",
    name: "Phantom Stitch",
    trait_name: "Silent Footsteps",
    desc: "Heists generate 40% less police heat",
    effect: "heist_heat",
    bonus: 0.40,
    stat_bonus: { stat: "stealth", mod: 2 },
    color: "#a855f7",
  },
  bulletproof_twill: {
    id: "bulletproof_twill",
    name: "Bulletproof Kevlar-Twill",
    trait_name: "Iron Body",
    desc: "Reduces dirty cash loss during failed raids by 50%",
    effect: "loss_protect",
    bonus: 0.50,
    stat_bonus: { stat: "muscle", mod: 2 },
    color: "#64748b",
  },
  chameleon_fiber: {
    id: "chameleon_fiber",
    name: "Chameleon Fiber",
    trait_name: "Ghost Cloak",
    desc: "25% chance to completely negate heat gain on crimes",
    effect: "negate_heat",
    bonus: 0.25,
    stat_bonus: { stat: "stealth", mod: 2 },
    color: "#14b8a6",
  },
  solar_infused: {
    id: "solar_infused",
    name: "Solar Infused",
    trait_name: "Overclocked Drive",
    desc: "Grow farm plots mature 30% faster",
    effect: "farm_speed",
    bonus: 0.30,
    stat_bonus: { stat: "wheels", mod: 2 },
    color: "#f59e0b",
  },
  high_roller_velvet: {
    id: "high_roller_velvet",
    name: "High Roller Velvet",
    trait_name: "VIP Lounge Pass",
    desc: "+35% Front laundering capacity limit",
    effect: "front_cap",
    bonus: 0.35,
    stat_bonus: { stat: "brains", mod: 2 },
    color: "#ec4899",
  },
  ceremonial_royal_gold: {
    id: "ceremonial_royal_gold",
    name: "Ceremonial Royal Gold",
    trait_name: "Ancestral Authority",
    desc: "+35 Raid Defence & +15% respect multiplier",
    effect: "royal_defense",
    bonus: 35,
    stat_bonus: { stat: "brains", mod: 2 },
    color: "#d97706",
  },
  ghost_frequency: {
    id: "ghost_frequency",
    name: "Ghost Frequency",
    trait_name: "Scanner Jammer",
    desc: "Reveals rival ambushes & raid countdowns 45s earlier",
    effect: "raid_warning",
    bonus: 45,
    stat_bonus: { stat: "stealth", mod: 2 },
    color: "#8b5cf6",
  },
  smugglers_lining: {
    id: "smugglers_lining",
    name: "Smuggler's Lining",
    trait_name: "Hidden Pocket",
    desc: "Safeguards an extra GH₵10,000 dirty cash from raids",
    effect: "vault_boost",
    bonus: 10000,
    stat_bonus: { stat: "stealth", mod: 2 },
    color: "#059669",
  },
  titanium_rivet: {
    id: "titanium_rivet",
    name: "Titanium Rivet",
    trait_name: "Unbreakable Frame",
    desc: "Compound walls provide +30 additional fortification",
    effect: "wall_boost",
    bonus: 30,
    stat_bonus: { stat: "muscle", mod: 2 },
    color: "#78716c",
  },
  guerilla_camo: {
    id: "guerilla_camo",
    name: "Guerilla Camo",
    trait_name: "Bush Ambush",
    desc: "Heist execution speed +20% faster",
    effect: "heist_speed",
    bonus: 0.20,
    stat_bonus: { stat: "wheels", mod: 2 },
    color: "#84cc16",
  },
  oud_al_malik: {
    id: "oud_al_malik",
    name: "Oud Al-Malik",
    trait_name: "Executive Charisma",
    desc: "Reduces front laundering transaction fees by 4%",
    effect: "fee_reduce",
    bonus: 0.04,
    stat_bonus: { stat: "brains", mod: 2 },
    color: "#b45309",
  },
  adinkra_blessing: {
    id: "adinkra_blessing",
    name: "Adinkra Blessing",
    trait_name: "Gye Nyame Ward",
    desc: "+15 Morale and +10% EXP to all crew in roster",
    effect: "crew_morale_exp",
    bonus: 15,
    stat_bonus: { stat: "brains", mod: 2 },
    color: "#f97316",
  },
  cybernetic_thread: {
    id: "cybernetic_thread",
    name: "Cybernetic Thread",
    trait_name: "Mainframe Tap",
    desc: "+12% flat bonus to heist success rate",
    effect: "heist_success",
    bonus: 0.12,
    stat_bonus: { stat: "brains", mod: 2 },
    color: "#06b6d4",
  },
  predator_wool: {
    id: "predator_wool",
    name: "Predator Wool",
    trait_name: "Apex Dominance",
    desc: "+18 Raid Defence and +12 Raid Attack",
    effect: "predator_combat",
    bonus: 18,
    stat_bonus: { stat: "muscle", mod: 2 },
    color: "#dc2626",
  },
  subterranean_vaulted: {
    id: "subterranean_vaulted",
    name: "Subterranean Vaulted",
    trait_name: "Deep Bunker",
    desc: "Protects +GH₵25,000 dirty cash from all compound raids",
    effect: "vault_boost",
    bonus: 25000,
    stat_bonus: { stat: "muscle", mod: 2 },
    color: "#475569",
  },
  mob_boss_pinstripe: {
    id: "mob_boss_pinstripe",
    name: "Mob Boss Pinstripe",
    trait_name: "Syndicate Chairman",
    desc: "+15% income to all Accra street hustles",
    effect: "hustle_income",
    bonus: 0.15,
    stat_bonus: { stat: "brains", mod: 2 },
    color: "#312e81",
  },
  night_hawk_carbon: {
    id: "night_hawk_carbon",
    name: "Night Hawk Carbon",
    trait_name: "Getaway Boost",
    desc: "Okada and Trotro transport runs cycle 25% faster",
    effect: "transport_speed",
    bonus: 0.25,
    stat_bonus: { stat: "wheels", mod: 2 },
    color: "#18181b",
  },
  bailout_seal: {
    id: "bailout_seal",
    name: "Bailout Seal",
    trait_name: "Fast-Track Release",
    desc: "Police arrest lockup time halved from 2 hours to 1 hour",
    effect: "arrest_half",
    bonus: 0.50,
    stat_bonus: { stat: "brains", mod: 2 },
    color: "#0284c7",
  },
  sovereign_kente: {
    id: "sovereign_kente",
    name: "Sovereign Kente",
    trait_name: "Kingpin Majesty",
    desc: "+25% XP gained by Boss across all game actions",
    effect: "boss_xp",
    bonus: 0.25,
    stat_bonus: { stat: "brains", mod: 2 },
    color: "#ca8a04",
  },
  iron_bastion: {
    id: "iron_bastion",
    name: "Iron Bastion",
    trait_name: "Impenetrable Citadel",
    desc: "Prevents opportunistic police raids when heat is above 75",
    effect: "prevent_police_raid",
    bonus: 1,
    stat_bonus: { stat: "muscle", mod: 2 },
    color: "#52525b",
  },
  cashflow_magnet: {
    id: "cashflow_magnet",
    name: "Cashflow Magnet",
    trait_name: "Grease the Palms",
    desc: "Laundering batches process 25% faster",
    effect: "launder_speed",
    bonus: 0.25,
    stat_bonus: { stat: "wheels", mod: 2 },
    color: "#10b981",
  },
  silent_step_rubber: {
    id: "silent_step_rubber",
    name: "Silent Step Rubber",
    trait_name: "Shadow Tread",
    desc: "+3 Stealth to all crew members assigned to heists",
    effect: "crew_stealth",
    bonus: 3,
    stat_bonus: { stat: "stealth", mod: 2 },
    color: "#334155",
  },
  executive_crest: {
    id: "executive_crest",
    name: "Executive Crest",
    trait_name: "Boardroom Clout",
    desc: "Reduces bribe costs by 50% and shop restock costs by 50%",
    effect: "bribe_discount",
    bonus: 0.50,
    stat_bonus: { stat: "brains", mod: 2 },
    color: "#0d9488",
  },
  street_legend_crest: {
    id: "street_legend_crest",
    name: "Street Legend Crest",
    trait_name: "Zongo Vanguard",
    desc: "+2 to ALL base stats (Muscle, Brains, Wheels, Stealth)",
    effect: "all_stats",
    bonus: 2,
    stat_bonus: { stat: "muscle", mod: 2 },
    color: "#e11d48",
  },
  anansi_trickster: {
    id: "anansi_trickster",
    name: "Anansi Trickster",
    trait_name: "Trickster Gambit",
    desc: "30% chance a failed heist triggers clean escape without heat",
    effect: "escape_heist",
    bonus: 0.30,
    stat_bonus: { stat: "stealth", mod: 2 },
    color: "#c026d3",
  },
  kejetia_broker: {
    id: "kejetia_broker",
    name: "Kejetia Broker",
    trait_name: "Market Arbitrage",
    desc: "Gear sold to boutique pays 40% more clean cedis",
    effect: "sell_bonus",
    bonus: 0.40,
    stat_bonus: { stat: "brains", mod: 2 },
    color: "#16a34a",
  },
  golden_stool_touch: {
    id: "golden_stool_touch",
    name: "Golden Stool Touch",
    trait_name: "Supreme Sovereign",
    desc: "+50 Raid Defence, +20% Hustle Income & crew morale locked at 100",
    effect: "supreme_sovereign",
    bonus: 50,
    stat_bonus: { stat: "muscle", mod: 2 },
    color: "#eab308",
  },
};

export const TIER2_LIST = Object.values(TIER2_CATEGORIES);

export const GUN_SHOP_SUBCATEGORIES: GunShopSubcategory[] = [
  { id: "all", name: "All Arsenals", icon: "Crosshair", desc: "Complete syndicate armory: melee, sidearms & heavy firepower" },
  { id: "melee", name: "Melee", icon: "Sword", desc: "Cutlasses, iron chains, cleavers and machetes" },
  { id: "secondary", name: "Secondary", icon: "Target", desc: "Concealed 9mm pistols, revolvers, tasers and desert hawks" },
  { id: "primary", name: "Primary", icon: "Crosshair", desc: "Pump shotguns, compact SMGs, hunting rifles & heavy LMGs" },
];

export const BOUTIQUE_SUBCATEGORIES: BoutiqueSubcategory[] = [
  { id: "all", name: "All Wares", icon: "Sparkles", desc: "Complete haute couture and syndicate luxury collection" },
  { id: "hat", name: "Hat", icon: "HardHat", desc: "Crown snapbacks, silk wave durags & gold aviators" },
  { id: "top", name: "Top", icon: "Shirt", desc: "Bespoke suits, agbadas, tuxedos, luxury hoodies and graphic tees" },
  { id: "bottom", name: "Bottom", icon: "Layers", desc: "Kente trousers, tactical pants, joggers and cargo shorts" },
  { id: "shoes", name: "Shoes", icon: "Footprints", desc: "Handcrafted loafers, tactical boots & slides" },
];

const SUB_CONFIGS = [
  { sub: "hat", slot: "hat", model: "cap", style: "cap", stat: "brains" },
  { sub: "top", slot: "top", model: "top", style: "jacket", stat: "brains" },
  { sub: "top", slot: "top", model: "top", style: "hoodie", stat: "stealth" },
  { sub: "bottom", slot: "bottom", model: "pants", style: "pants", stat: "stealth" },
  { sub: "shoes", slot: "shoes", model: "shoes", style: "shoes", stat: "wheels" },
  { sub: "top", slot: "top", model: "top", style: "open_shirt", stat: "muscle" },
  { sub: "top", slot: "top", model: "top", style: "tee", stat: "muscle" },
];

const ADJECTIVES = ["Sovereign", "Royal", "Midnight", "Gold-Threaded", "Executive", "Syndicate", "Platinum", "Diamond", "Voodoo", "Accra", "Ashanti", "Elite", "Legendary", "Custom", "Bespoke", "Shadow"];
const NOUNS = ["Agbada", "Kaftan", "Tuxedo", "Blazer", "Hoodie", "Tracksuit", "Cargo", "Choker", "Chrono", "Pendant", "Loafers", "Boots", "Aviators", "Durag", "Kufi", "Vest", "Trench", "Smock", "Briefcase", "Flacon", "Collar", "Signet", "Cufflinks", "Scarf", "Belt", "Holster", "Glove", "Mask"];
const COLORS = ["#d4af37", "#1e3a8a", "#000000", "#831843", "#0f172a", "#18181b", "#b91c1c", "#3f4a3c", "#27272a", "#09090b", "#ffd700", "#fbbf24", "#d97706", "#78350f", "#a16207", "#e2e8f0"];
const RARITIES = ["common", "rare", "legendary"];

export const BOUTIQUE_CATALOG: BoutiqueCatalogItem[] = Array.from({ length: 128 }, (_, i) => {
  const subCfg = SUB_CONFIGS[i % SUB_CONFIGS.length];
  const adj = ADJECTIVES[Math.floor(i / SUB_CONFIGS.length) % ADJECTIVES.length];
  const noun = NOUNS[i % NOUNS.length];
  const color = COLORS[i % COLORS.length];
  const rarity = RARITIES[i % RARITIES.length];
  const price = 800 + (i * 350) % 18000;
  const mod = (i % 4) + 1;
  const tier2_chance = 0.5 + (i % 5) * 0.1;
  const brand = ADJECTIVES[i % ADJECTIVES.length];
  const tier = (i % 8) + 1;
  const effects = { [subCfg.stat]: Math.max(1, Math.round(tier * 1.5)) };
  return {
    id: `b_item_${i + 1}`,
    name: `${adj} ${noun} Mk.${i + 1}`,
    brand,
    tier,
    effects,
    subcategory: subCfg.sub as any,
    slot: subCfg.slot as any,
    model: subCfg.model,
    style: subCfg.style,
    pattern: i % 2 === 0 ? "plain" : "kente",
    rarity: rarity as any,
    price,
    desc: `Exclusive handcrafted ${brand.toLowerCase()} ${noun.toLowerCase()} commission #${i + 1} tailored for Accra underworld elites.`,
    color,
    stat: subCfg.stat,
    mod,
    tier2_chance,
  };
});

export const ALL_GEAR_ITEMS: GearItem[] = [
  ...GEAR,
  ...BOUTIQUE_CATALOG.map((b) => ({
    id: b.id,
    name: b.name,
    slot: b.slot,
    model: b.model,
    rarity: b.rarity,
    price: b.price,
    color: b.color,
    style: b.style,
    pattern: b.pattern,
    graphic: b.graphic,
    stat: b.stat,
    mod: b.mod,
    power: b.power,
    unlock: b.unlock || 1,
    subcategory: b.subcategory,
  })),
];

export const GEAR_MAP = Object.fromEntries(ALL_GEAR_ITEMS.map((g) => [g.id, g]));

export const STRAINS: FarmStrain[] = [
  { id: "wee", name: "Kumasi Wee", desc: "Classic street green. Quick and cheap.", unlock: 1, seed: 40, grow: 600, yield: [6, 10], price: 25, heat: 1, color: "#4ade80" },
  { id: "kush", name: "Osu Kush", desc: "Premium buds the Osu Strip pays for.", unlock: 1, seed: 250, grow: 1800, yield: [5, 9], price: 180, heat: 2, color: "#a3e635" },
  { id: "miraa", name: "Zongo Miraa", desc: "Chewing leaves for the night-shift crowd.", unlock: 1, seed: 900, grow: 3600, yield: [5, 8], price: 520, heat: 3, color: "#65a30d" },
  { id: "shrooms", name: "Forest Shrooms", desc: "Magic caps from the Ashanti bush.", unlock: 1, seed: 2500, grow: 7200, yield: [4, 8], price: 1500, heat: 3, color: "#f59e0b" },
  { id: "lotus", name: "Blue Lotus", desc: "Rare flowers the Hills Estate parties want.", unlock: 1, seed: 6000, grow: 10800, yield: [4, 7], price: 3400, heat: 4, color: "#60a5fa" },
  { id: "poppy", name: "Red Poppy", desc: "Big money, big attention.", unlock: 1, seed: 15000, grow: 14400, yield: [3, 6], price: 9500, heat: 6, color: "#ef4444" },
  { id: "coca", name: "Hills Coca Leaf", desc: "Top shelf. The cartel connect only buys the best.", unlock: 1, seed: 40000, grow: 21600, yield: [3, 6], price: 26000, heat: 8, color: "#16a34a" },
];

export const STRAIN_MAP = Object.fromEntries(STRAINS.map((s) => [s.id, s]));

export const FARM = {
  plot_cost: 4000,
  plot_growth: 2.3,
  max_plots: 24,
  upgrades: {
    lights: { name: "Grow Lights", desc: "-10% grow time per level", cost: 800, max: 20 },
    irrigation: { name: "Drip Irrigation", desc: "+15% harvest per level", cost: 1200, max: 20 },
    greenhouse: { name: "Hidden Greenhouse", desc: "-20% heat when you sell, per level", cost: 1500, max: 20 },
  },
};

export const DEFAULT_AVATAR = {
  gender: "male",
  skin: "#5a3825",
  hair: "fade",
  hair_color: "#111111",
  build: "regular",
  height: "average",
  face: "oval",
  nose: "broad",
  brows: "thick",
  ears: "normal",
  marks: "none",
  glasses: "none",
  beard: "none",
};

export const AVATAR_OPTIONS = {
  gender: ["male", "female"],
  skin: ["#3b2219", "#5a3825", "#7a4b2f", "#9a6440", "#c18a5e"],
  hair: ["bald", "fade", "spiky", "afro", "dreads", "braids", "cornrows", "long", "ponytail"],
  hair_color: ["#111111", "#2b1a10", "#5a3a1a", "#d4af37", "#b22222"],
  build: ["skinny", "slim", "regular", "muscular", "brute", "heavy", "belly", "chubby", "curvy"],
  height: ["tiny", "short", "average", "tall", "towering"],
  face: ["oval", "long", "round", "square", "heavy_jaw", "narrow"],
  nose: ["button", "broad", "hook", "big", "pointy"],
  brows: ["thin", "thick", "bushy", "unibrow"],
  ears: ["small", "normal", "big"],
  marks: ["none", "scar", "mole", "wrinkles", "freckles", "warpaint"],
  glasses: ["none", "square", "round", "shades"],
  beard: ["none", "stubble", "goatee", "moustache", "full"],
};

export const CONTRACT_TYPES = [
  { type: "collect", label: "Collect GH₵{t} dirty cash" },
  { type: "launder", label: "Finish {t} laundering batches" },
  { type: "heist", label: "Complete {t} heist" },
  { type: "tap", label: "Tap the hustle {t} times" },
  { type: "hit", label: "Hit a rival syndicate {t} time" },
  { type: "upgrade", label: "Buy {t} hustle or front upgrades" },
];

export const FALLBACK_TAUNTS = [
  "Chale, you think you fit us? We dey come for your corner.",
  "Your boys dey sleep. Tonight we go wake them up.",
  "Small boy with big mouth. We go collect your cedis small small.",
  "Wahala dey your side. Keep your gate locked, oo.",
  "Ei! You dey disturb our hustle? We no dey forget.",
  "Tell your crew say the street no be your papa house.",
];

export const FALLBACK_NEWS = [
  "Wahala for Zongo Lanes as two crews clash over fuel route",
  "Chale, police dey come! Task Force spotted near Market Circle",
  "Osu Strip club owners deny any link to 'dirty cedis'",
  "Dockside canoes carry more than fish, says street source",
  "Central Bank warns about rapid rise of counterfeit Cedis in Accra",
  "Makola Market traders report smooth business despite gang tensions",
];

export const PRODUCTS = {
  street_pass: { name: "Street Pass (Season)", price: 25, desc: "Unlocks the paid reward track this season" },
  timeskip_pack: { name: "Time Skip x3", price: 5, desc: "Each skip pushes laundering and heists 1 hour ahead" },
  lawyer: { name: "Lawyer Shield", price: 8, desc: "Drops Heat 20 and blocks raids 4h. Max 2 per week" },
  build_slot: { name: "Extra Build Slot", price: 15, desc: "+1 laundering batch at the same time (max 3)" },
  car_v8: { name: "Gold-Trim V8 (cosmetic)", price: 12, desc: "Looks only, no stats" },
  drip_gold: { name: "Gold Chain Drip (cosmetic)", price: 10, desc: "Looks only, no stats" },
  decor_stool: { name: "Golden Stool Replica (cosmetic)", price: 10, desc: "Looks only, no stats" },
  drip_crate: { name: "Drip Crate (cosmetic)", price: 6, desc: "One random cosmetic. Exact odds shown", odds: { common: 0.6, rare: 0.3, legendary: 0.1 } },
};

export const PASS_TIERS = 30;
export const PASS_XP_PER_TIER = 100;
export const SELL_RATE = 0.5;
export const WEAPON_MAX_LVL = 99;
export const CREW_STAT_MAX = 99;

export interface CraftableWeapon {
  id: string;
  name: string;
  desc: string;
  dur: number; // duration in seconds
  cost: number; // dirty cash cost
  power: number;
  stat: string;
  mod: number;
  slot: "primary" | "secondary" | "melee";
  rarity: "common" | "rare" | "legendary";
  color: string;
}

export const CRAFTABLE_WEAPONS: CraftableWeapon[] = [
  { id: "cw_machete", name: "Jagged Machete", desc: "Serrated blade treated for maximum intimidation.", dur: 8 * 3600, cost: 8000, power: 12, stat: "muscle", mod: 2, slot: "melee", rarity: "common", color: "#6b7280" },
  { id: "cw_glock", name: "Modified Glock", desc: "Reliable street sidearm with extended magazine.", dur: 12 * 3600, cost: 15000, power: 18, stat: "stealth", mod: 2, slot: "secondary", rarity: "common", color: "#4b5563" },
  { id: "cw_shotgun", name: "Sawn-off Master", desc: "Highly portable, devastating close-range shotgun.", dur: 24 * 3600, cost: 42000, power: 28, stat: "muscle", mod: 3, slot: "primary", rarity: "rare", color: "#2563eb" },
  { id: "cw_ak47", name: "Custom AK-47", desc: "Hand-assembled assault rifle with reinforced barrel.", dur: 48 * 3600, cost: 85000, power: 38, stat: "muscle", mod: 4, slot: "primary", rarity: "rare", color: "#16a34a" },
  { id: "cw_sniper", name: "Bush Sniper", desc: "Long-range precision rifle for quiet eliminations.", dur: 72 * 3600, cost: 150000, power: 52, stat: "brains", mod: 5, slot: "primary", rarity: "legendary", color: "#ea580c" },
];

export const WORKSHOP = {
  bench_cost: 15000,
  bench_growth: 3.5,
  max_benches: 6,
  upgrades: {
    tools: { name: "Precision Tools", desc: "-10% crafting time per level", cost: 2500, max: 20 },
    foundry: { name: "Industrial Foundry", desc: "+5% weapon power per level", cost: 5000, max: 10 },
  }
};

export interface RobberyTarget {
  id: string;
  name: string;
  type: string;
  cost: number;
  reward: number;
  heat: number;
  duration: number;
  minCrew: number;
  tier: number;
  minPower: number;
  minDefense: number;
  desc: string;
}

export const ROBBERIES: RobberyTarget[] = [
  { id: "corner_store", name: "Makola Convenience Store", type: "Retail", cost: 1500, reward: 12000, heat: 12, duration: 300, minCrew: 0, tier: 1, minPower: 50, minDefense: 0, desc: "A soft target with night-shift cash register. Quick grab." },
  { id: "circle_electronics", name: "Circle Electronics Depot", type: "Wholesale", cost: 4500, reward: 28000, heat: 22, duration: 600, minCrew: 0, tier: 2, minPower: 150, minDefense: 30, desc: "A bustling depot loaded with high-value phone stock and cash safes." },
  { id: "jewelry_store", name: "Osu Luxury Jewelry Vault", type: "High-End", cost: 10000, reward: 65000, heat: 35, duration: 1200, minCrew: 0, tier: 3, minPower: 350, minDefense: 80, desc: "High-security boutique on the Osu strip. Requires cutting torches and brute force." },
  { id: "bonded_warehouse", name: "Tema Port Bonded Warehouse", type: "Logistics", cost: 22000, reward: 150000, heat: 55, duration: 2400, minCrew: 0, tier: 4, minPower: 750, minDefense: 180, desc: "Armed compound holding imported electronics and foreign currency crates." },
  { id: "bank_branch", name: "Standard Chartered - Ring Road", type: "Financial", cost: 45000, reward: 350000, heat: 85, duration: 3600, minCrew: 0, tier: 5, minPower: 1500, minDefense: 350, desc: "A heavily guarded branch vault. Requires stealth bypass or heavy firepower." },
  { id: "casino_vault", name: "Grand Royale Casino Vault", type: "Enterprise", cost: 95000, reward: 850000, heat: 130, duration: 7200, minCrew: 0, tier: 6, minPower: 3000, minDefense: 700, desc: "The crown jewel heist. Massive cash reserves and armed private security." },
  { id: "bullion_depot", name: "Kotoka Bullion Depository", type: "Sovereign", cost: 180000, reward: 1800000, heat: 200, duration: 10800, minCrew: 0, tier: 7, minPower: 5500, minDefense: 1300, desc: "Air cargo gold transit vault guarded by elite armed units and biometric locks." },
  { id: "central_bank", name: "Bank of Ghana - Accra Central", type: "State", cost: 350000, reward: 4000000, heat: 300, duration: 14400, minCrew: 0, tier: 8, minPower: 9500, minDefense: 2400, desc: "The ultimate score. Heavy military-grade security and state-of-the-art surveillance." },
];

export const ROBBERY_MAP = Object.fromEntries(ROBBERIES.map((r) => [r.id, r]));

export interface TraffickingRoute {
  id: string;
  name: string;
  district: string;
  strainReq: string;
  amountReq: number;
  duration: number;
  payout: number;
  heat: number;
  desc: string;
}

export const TRAFFICKING_ROUTES: TraffickingRoute[] = [
  { id: "osu_clubs", name: "Osu Nightclub Distribution", district: "osu", strainReq: "wee", amountReq: 5, duration: 600, payout: 22000, heat: 10, desc: "Supply weekend partygoers and lounge VIPs across the Osu Strip." },
  { id: "makola_hub", name: "Makola Market Bulk Transit", district: "central", strainReq: "kush", amountReq: 12, duration: 1800, payout: 75000, heat: 25, desc: "Smuggle wholesale product through bustling central market stalls." },
  { id: "tema_port", name: "Tema Container Smuggling Ring", district: "dockside", strainReq: "shrooms", amountReq: 25, duration: 3600, payout: 210000, heat: 55, desc: "Bribe port customs officers to dispatch shipping containers out of Ghana." },
  { id: "airport_run", name: "Kotoka Air Private Courier", district: "airport", strainReq: "coca", amountReq: 50, duration: 7200, payout: 950000, heat: 140, desc: "Top-tier international export via private charter pilots. Maximum risk, sovereign returns." },
];

export const TRAFFICKING_MAP = Object.fromEntries(TRAFFICKING_ROUTES.map((t) => [t.id, t]));
export interface GirlfriendProfile {
  id: string;
  name: string;
  title: string;
  desc: string;
  perkDesc: string;
  giftCost: number;
  dateCost: number;
  courtCost: number;
  perkType: string;
}

export const GIRLFRIENDS: GirlfriendProfile[] = [
  { id: "akosua", name: "Akosua", title: "The Bank Insider", desc: "Works at Standard Chartered. Knows every security blind spot.", perkDesc: "−20% Robbery prep costs & +15% robbery cash payouts.", giftCost: 5000, dateCost: 2500, courtCost: 2000, perkType: "robbery" },
  { id: "efua", name: "Efua", title: "Osu Fashion Icon", desc: "Trendsetter on the Osu strip with deep connections to high-end boutique dealers.", perkDesc: "−25% Luxury & boutique shop prices.", giftCost: 6000, dateCost: 3000, courtCost: 2500, perkType: "luxury" },
  { id: "abena", name: "Abena", title: "Police Dispatcher", desc: "Controls the Greater Accra emergency switchboard. Hears about raids before anyone else.", perkDesc: "−30% Heat accumulation rate & automatic raid warning.", giftCost: 8000, dateCost: 4000, courtCost: 3500, perkType: "heat" },
  { id: "yaa", name: "Yaa", title: "Cartel Heiress", desc: "Daughter of an international syndicate boss. Brings raw smuggling connections.", perkDesc: "+30% Drug trafficking payout speeds & bonuses.", giftCost: 12000, dateCost: 6000, courtCost: 5000, perkType: "trafficking" },
];

export const GIRLFRIEND_MAP = Object.fromEntries(GIRLFRIENDS.map((g) => [g.id, g]));

export interface MethProduct {
  id: string;
  name: string;
  desc: string;
  unlock: number;
  unlockLvl: number;
  cost: number;
  costDirty: number;
  time: number;
  cookTime: number;
  yield: [number, number];
  yieldMin: number;
  yieldMax: number;
  price: number;
  sellPriceClean: number;
  heat: number;
  purity: number;
  color: string;
}

export const METHLAB_PRODUCTS: MethProduct[] = [
  { id: "pseudo", name: "Pseudo-Ephedrine", desc: "Basic cook for small time hustlers.", unlock: 1, unlockLvl: 1, cost: 500, costDirty: 500, time: 1800, cookTime: 1800, yield: [5, 10], yieldMin: 5, yieldMax: 10, price: 1200, sellPriceClean: 1200, heat: 5, purity: 78, color: "#d1d5db" },
  { id: "blue_crystal", name: "Osu Blue Crystals", desc: "Potent lab batch for nightlife strip.", unlock: 3, unlockLvl: 3, cost: 2500, costDirty: 2500, time: 5400, cookTime: 5400, yield: [4, 8], yieldMin: 4, yieldMax: 8, price: 6500, sellPriceClean: 6500, heat: 12, purity: 88, color: "#38bdf8" },
  { id: "p2p_meth", name: "Zongo High-Octane Shards", desc: "Heavy industrial cook with pure reagents.", unlock: 5, unlockLvl: 5, cost: 8000, costDirty: 8000, time: 10800, cookTime: 10800, yield: [3, 7], yieldMin: 3, yieldMax: 7, price: 18000, sellPriceClean: 18000, heat: 20, purity: 94, color: "#818cf8" },
  { id: "pure_glass", name: "Cartel Pure Glass", desc: "Ultra-pure export crystal for VIP distribution.", unlock: 8, unlockLvl: 8, cost: 25000, costDirty: 25000, time: 21600, cookTime: 21600, yield: [3, 6], yieldMin: 3, yieldMax: 6, price: 55000, sellPriceClean: 55000, heat: 35, purity: 99, color: "#c084fc" },
];

export const METHLAB_MAP = Object.fromEntries(METHLAB_PRODUCTS.map((m) => [m.id, m]));

export const METHLAB = {
  bench_cost: 20000,
  bench_growth: 3.0,
  max_benches: 4,
  upgrades: {
    filters: { name: "HEPA Filters", desc: "-10% cook time per level", cost: 3000, max: 10 },
    purity: { name: "Purity Enhancers", desc: "+10% yield per level", cost: 5000, max: 10 },
    ventilation: { name: "Rooftop Scrubber", desc: "-15% cook heat per level", cost: 4000, max: 10 },
  },
};

export interface Mineral {
  id: string;
  name: string;
  desc: string;
  unlock: number;
  unlockLvl: number;
  cost: number;
  costDirty: number;
  time: number;
  mineTime: number;
  yield: [number, number];
  yieldMin: number;
  yieldMax: number;
  price: number;
  sellPriceClean: number;
  heat: number;
  color: string;
  carat: string;
}

export const MINERALS: Mineral[] = [
  { id: "iron", name: "Black Sand & Iron Ore", desc: "Common heavy metal from coastal deposits.", unlock: 1, unlockLvl: 1, cost: 300, costDirty: 300, time: 1200, mineTime: 1200, yield: [8, 16], yieldMin: 8, yieldMax: 16, price: 650, sellPriceClean: 650, heat: 2, color: "#78716c", carat: "Raw Ore" },
  { id: "bauxite", name: "Eastern Bauxite Nuggets", desc: "Raw aluminum mineral mined in the hills.", unlock: 2, unlockLvl: 2, cost: 1200, costDirty: 1200, time: 3600, mineTime: 3600, yield: [6, 12], yieldMin: 6, yieldMax: 12, price: 2800, sellPriceClean: 2800, heat: 5, color: "#ea580c", carat: "Industrial" },
  { id: "gold_dust", name: "Ankobra River Gold Dust", desc: "Fine alluvial gold sifted from riverbeds.", unlock: 4, unlockLvl: 4, cost: 5000, costDirty: 5000, time: 7200, mineTime: 7200, yield: [3, 7], yieldMin: 3, yieldMax: 7, price: 12000, sellPriceClean: 12000, heat: 15, color: "#f59e0b", carat: "18K Gold" },
  { id: "pit_gold", name: "Deep Pit Raw Bullion", desc: "Heavy underground veins dug by galamsey excavators.", unlock: 6, unlockLvl: 6, cost: 18000, costDirty: 18000, time: 14400, mineTime: 14400, yield: [3, 6], yieldMin: 3, yieldMax: 6, price: 38000, sellPriceClean: 38000, heat: 28, color: "#ffd700", carat: "24K Bullion" },
  { id: "rough_diamond", name: "Birim Alluvial Diamonds", desc: "Uncut rough stones washed down the river basin.", unlock: 8, unlockLvl: 8, cost: 45000, costDirty: 45000, time: 28800, mineTime: 28800, yield: [2, 5], yieldMin: 2, yieldMax: 5, price: 95000, sellPriceClean: 95000, heat: 40, color: "#38bdf8", carat: "VVS Flawless" },
];

export const MINERAL_MAP = Object.fromEntries(MINERALS.map((m) => [m.id, m]));

export const MINING = {
  rig_cost: 15000,
  rig_growth: 3.0,
  max_rigs: 4,
  upgrades: {
    drills: { name: "Heavy Hydraulic Drills", desc: "-10% mining time per level", cost: 2500, max: 10 },
    sifting: { name: "Vibrating Sluice Boxes", desc: "+10% mineral yield per level", cost: 4000, max: 10 },
    bribe_chiefs: { name: "Local Chief Retainer", desc: "-15% heat and inspection risk per level", cost: 5000, max: 10 },
  },
};

export interface MusicTrack {
  id: string;
  name: string;
  genre: string;
  desc: string;
  dur: number;
  cost: number;
  payout: number;
  respect: number;
  color: string;
}

export const MUSIC_TRACKS: MusicTrack[] = [
  { id: "track_drill", name: "Accra Drill Anthem", genre: "Drill", desc: "Hard-hitting street verses over heavy 808s.", dur: 1800, cost: 3000, payout: 14000, respect: 15, color: "#ef4444" },
  { id: "track_afro", name: "Osu Sunset Groove", genre: "Afrobeats", desc: "Smooth highlife guitar chords and infectious rhythm.", dur: 5400, cost: 12000, payout: 62000, respect: 40, color: "#f59e0b" },
  { id: "track_album", name: "Kingpin Legend Album", genre: "Highlife", desc: "A masterpiece studio record chronicling street sovereignty.", dur: 14400, cost: 48000, payout: 260000, respect: 120, color: "#10b981" },
  { id: "track_world", name: "Global Afro-Fusion Tour Masterpiece", genre: "World", desc: "International blockbuster record streamed across continents.", dur: 28800, cost: 160000, payout: 980000, respect: 400, color: "#6366f1" },
];

export const MUSIC_MAP = Object.fromEntries(MUSIC_TRACKS.map((m) => [m.id, m]));

export const STUDIO = {
  booth_cost: 12000,
  booth_growth: 3.0,
  max_booths: 4,
  upgrades: {
    acoustics: { name: "Soundproof Acoustics", desc: "-10% recording time per level", cost: 2500, max: 10 },
    mixing: { name: "Pro Mixing Console", desc: "+10% royalty payout per level", cost: 4000, max: 10 },
  },
};

// ==========================================
// MODULE 1: CREW RECRUIT TIERS
// ==========================================
export interface RecruitTier {
  tier: number;
  name: string;
  probability: number;
  statMin: number;
  statMax: number;
  hireMultiplier: number;
  salaryMultiplier: number;
  color: string;
}

export const CREW_RECRUIT_TIERS: RecruitTier[] = [
  { tier: 1, name: "Corner Runner", probability: 0.55, statMin: 3, statMax: 6, hireMultiplier: 400, salaryMultiplier: 10, color: "#71717a" },
  { tier: 2, name: "Lorry Park Enforcer", probability: 0.28, statMin: 6, statMax: 10, hireMultiplier: 800, salaryMultiplier: 15, color: "#38bdf8" },
  { tier: 3, name: "Wharf Specialist", probability: 0.10, statMin: 10, statMax: 14, hireMultiplier: 1500, salaryMultiplier: 20, color: "#a855f7" },
  { tier: 4, name: "Zongo Heavyweight", probability: 0.07, statMin: 14, statMax: 19, hireMultiplier: 2500, salaryMultiplier: 30, color: "#ffd700" },
];

// ==========================================
// MODULE 4: PROCEDURAL "AREA DON" (ARCH-RIVAL) TRAIT MATRIX
// ==========================================
export const AREA_DON_NAMES = [
  "Alhaji Iron-Fist",
  "Nana Viper",
  "Commander Kpakpa",
  "Chief Timber",
  "Sule Swagger",
  "Oga Bulldozer",
  "Apostle Ghost",
  "Madam Gold-Coast",
  "General Rasta",
  "Capo Kotoka",
  "Kweku Razor",
  "Bofo Black-Star",
];

export interface AreaDonArchetype {
  id: string;
  name: string;
  desc: string;
  effect: string;
}

export const AREA_DON_ARCHETYPES: AreaDonArchetype[] = [
  { id: "customs_shark", name: "The Customs Shark", desc: "Halves Plot 1 & 2 wash speed.", effect: "halve_wash_1_2" },
  { id: "macho_boss", name: "The Macho Boss", desc: "+15% crew arrest chance on operations.", effect: "crew_arrest_plus" },
  { id: "checkpoint_snitch", name: "The Checkpoint Snitch", desc: "-30% passive Heat decay rate.", effect: "heat_decay_slow" },
  { id: "wharf_queen", name: "The Wharf Queen", desc: "Controls dock imports; locks 2 Black Market slots.", effect: "lock_market_slots" },
  { id: "okada_raider", name: "The Okada Raider", desc: "Siphons 4% dirty cash per tick when Heat is above 70%.", effect: "siphon_dirty" },
];

export const AREA_DON_ARCHETYPE_MAP = Object.fromEntries(AREA_DON_ARCHETYPES.map((a) => [a.id, a]));

export interface AreaDonTactic {
  id: string;
  name: string;
  desc: string;
  effect: string;
}

export const AREA_DON_TACTICS: AreaDonTactic[] = [
  { id: "container_lockout", name: "Container Lockout", desc: "Disables top plot operations if Heat is above 75%.", effect: "disable_top_plot" },
  { id: "forex_skim", name: "Forex Skim", desc: "Taxes 20% of washed Clean Cash on collection.", effect: "skim_clean" },
  { id: "highway_toll", name: "Highway Toll", desc: "Doubles all crew heist cooldown periods.", effect: "double_heist_cd" },
  { id: "cellblock_charge", name: "Cellblock Charge", desc: "Adds +20m to all police lockup arrest timers.", effect: "arrest_longer" },
  { id: "depot_monopoly", name: "Depot Monopoly", desc: "Reduces all heist dirty cash payouts by 25%.", effect: "cut_heist_payout" },
];

export const AREA_DON_TACTIC_MAP = Object.fromEntries(AREA_DON_TACTICS.map((t) => [t.id, t]));

// ==========================================
// MODULE 5: "BIG MAN CONNECTIONS" FLAT-COST MONEY PERKS
// ==========================================
export interface BigManPerk {
  id: string;
  name: string;
  cost: number;
  flatCost: number;
  desc: string;
  effect: string;
  bonus: number;
}

export const BIG_MAN_PERKS: BigManPerk[] = [
  {
    id: "susu_ring",
    name: "Susu Collector Ring",
    cost: 500000,
    flatCost: 500000,
    desc: "+15% global plot laundering yield permanently.",
    effect: "launder_yield",
    bonus: 0.15,
  },
  {
    id: "forex_bureau",
    name: "Shadow Forex Bureau",
    cost: 1000000,
    flatCost: 1000000,
    desc: "+10% bonus Clean Cash generated per wash tick.",
    effect: "wash_bonus",
    bonus: 0.10,
  },
  {
    id: "bullion_ambush",
    name: "Bullion Van Ambush",
    cost: 2500000,
    flatCost: 2500000,
    desc: "+25% dirty cash reward from all crew heists.",
    effect: "heist_dirty",
    bonus: 0.25,
  },
  {
    id: "iron_compound",
    name: "Iron-Gate Compound",
    cost: 5000000,
    flatCost: 5000000,
    desc: "Blocks 60% of dirty cash loss from Area Don raids & siphons.",
    effect: "siphon_shield",
    bonus: 0.60,
  },
  {
    id: "trotro_union",
    name: "Trotro Fleet Union",
    cost: 10000000,
    flatCost: 10000000,
    desc: "Union transport dues pay out GH₵25,000 clean cash automatically every 60 seconds.",
    effect: "passive_clean",
    bonus: 25000,
  },
  {
    id: "night_kingpin",
    name: "Night-Market Kingpin",
    cost: 25000000,
    flatCost: 25000000,
    desc: "+50% cash yield during twice-daily Susu Surge windows.",
    effect: "susu_surge_boost",
    bonus: 0.50,
  },
];

export const BIG_MAN_MAP = Object.fromEntries(BIG_MAN_PERKS.map((b) => [b.id, b]));

// ==========================================
// MODULE 6: COMMODITIES & TURF ZONES
// ==========================================
export interface SmuggleCommodity {
  id: string;
  name: string;
  minPrice: number;
  maxPrice: number;
  basePrice: number;
  desc: string;
  unit: string;
}

export const SMUGGLE_COMMODITIES: SmuggleCommodity[] = [
  { id: "pit_gold", name: "Alluvial Pit Gold", minPrice: 8000, maxPrice: 18000, basePrice: 12000, desc: "Raw unsmelted bush gold dust from rural riverbeds.", unit: "oz" },
  { id: "harbor_container", name: "Unstamped Harbor Containers", minPrice: 20000, maxPrice: 50000, basePrice: 32000, desc: "High-value customs-bypass shipping cargo from Tema Quay.", unit: "crate" },
  { id: "border_diesel", name: "Drummed Border Diesel", minPrice: 3000, maxPrice: 9500, basePrice: 5500, desc: "Smuggled petroleum drums from offshore bunkering lines.", unit: "drum" },
  { id: "kola_crates", name: "Highland Kola Crates", minPrice: 1500, maxPrice: 5000, basePrice: 2800, desc: "Export-grade stimulant nuts transported across borders.", unit: "bale" },
];

export const COMMODITY_MAP = Object.fromEntries(SMUGGLE_COMMODITIES.map((c) => [c.id, c]));

export interface TurfZone {
  id: string;
  name: string;
  vibe: string;
  perk: string;
  tributeCost: number;
}

export const TURF_ZONES: TurfZone[] = [
  { id: "timber_yard", name: "Iron Timber Yard", vibe: "Sawdust, heavy logs, and diesel haulers", perk: "+15% Street Hustle Payout", tributeCost: 20000 },
  { id: "copper_wharf", name: "Copper Wharf", vibe: "Salt mist, industrial scrap, and crane docks", perk: "+20% Laundering Wash Speed", tributeCost: 35000 },
  { id: "laterite_pits", name: "Red Laterite Pits", vibe: "Dusty red clay quarry and gold sluices", perk: "+25% Mining Extraction Yield", tributeCost: 50000 },
  { id: "lorry_park", name: "Central Lorry Park", vibe: "Hundreds of trotros, horns, and street markets", perk: "-25% Police Heat Accumulation", tributeCost: 65000 },
  { id: "neon_zongo", name: "Neon Zongo Strip", vibe: "Flashing neon, night clubs, and tight loyalty", perk: "+20% Compound & Skirmish Defense", tributeCost: 80000 },
];




