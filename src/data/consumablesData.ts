// Express Drop Deliverable Consumables & Farm Weed Smoked Buffs
// Ordered via mobile app interface using clean cash only
// 2-minute simulated transport delivery timer
// Minimum effect duration starts from 1 hour (3600 seconds)

export interface DeliverableConsumable {
  id: string;
  name: string;
  category: "medicine" | "cigarettes" | "food" | "farm_weed";
  desc: string;
  clean_price: number;
  delivery_fee: number;
  duration_secs: number; // minimum 1 hour (3600s)
  farm_strain_req?: string; // e.g. "weed" | "shrooms" | "skunk"
  icon: string;
  buff: {
    stat_label: string;
    hustle_income_pct?: number;
    heat_reduction_pct?: number;
    flat_heat_drop?: number;
    combat_power_pct?: number;
    raid_defence_flat?: number;
    heist_speed_pct?: number;
    morale_boost?: number;
    heals_injury?: boolean;
    launder_fee_pct?: number;
    launder_speed_pct?: number;
  };
}

export const DELIVERABLE_CONSUMABLES: DeliverableConsumable[] = [
  // 1. MEDICINE
  {
    id: "trauma_kit",
    name: "Military Trauma Kit & Antibiotics",
    category: "medicine",
    desc: "Hospital-grade sterile suture packs, clotting gauze, and antibiotics. Instantly cures any injured crew member and boosts syndicate combat durability.",
    clean_price: 1200,
    delivery_fee: 50,
    duration_secs: 7200, // 2 hours
    icon: "HeartPulse",
    buff: {
      stat_label: "Heals All Injuries + 15% Raid Defence",
      heals_injury: true,
      raid_defence_flat: 15,
      combat_power_pct: 0.15,
    },
  },
  {
    id: "energy_stim",
    name: "Adrenaline Stims & Nootropics",
    category: "medicine",
    desc: "Cognitive focus ampoules and pharmaceutical stimulants. Crew reaction times spike, slashing heist durations.",
    clean_price: 850,
    delivery_fee: 50,
    duration_secs: 3600, // 1 hour
    icon: "Zap",
    buff: {
      stat_label: "+25% Heist Execution Speed",
      heist_speed_pct: 0.25,
    },
  },

  // 2. CIGARETTES
  {
    id: "rothmans_pack",
    name: "Rothmans King Size & Scrambler",
    category: "cigarettes",
    desc: "A carton of smuggled King Size smokes. Boss and crew stay relaxed under pressure, cooling police surveillance heat.",
    clean_price: 500,
    delivery_fee: 40,
    duration_secs: 5400, // 1.5 hours
    icon: "Cigarette",
    buff: {
      stat_label: "-20 Heat Drop & -40% Heat Generation",
      flat_heat_drop: 20,
      heat_reduction_pct: 0.40,
    },
  },

  // 3. FOOD
  {
    id: "chop_feast",
    name: "Auntie Esi's VIP Fufu & Goat Feast",
    category: "food",
    desc: "A steaming banquet of hot pounded fufu, rich light soup with tender goat meat, and fried plantain. Restores crew morale to 100% and energizes street hustles.",
    clean_price: 1500,
    delivery_fee: 60,
    duration_secs: 7200, // 2 hours
    icon: "Utensils",
    buff: {
      stat_label: "100% Morale Recovery & +20% Hustle Output",
      morale_boost: 100,
      hustle_income_pct: 0.20,
    },
  },

  // 4. SMOKE YOUR OWN FARM WEED (Requires crops grown on your farm)
  {
    id: "smoke_kumasi_wee",
    name: "Smoke Homegrown: Kumasi Wee",
    category: "farm_weed",
    desc: "Roll and smoke cured buds from your own Kumasi Wee farm stash. Sharpen street hustle vigilance across all corner plots.",
    clean_price: 150, // Courier handling & wrap paper fee
    delivery_fee: 40,
    farm_strain_req: "wee",
    duration_secs: 3600, // 1 hour
    icon: "Flame",
    buff: {
      stat_label: "+25% Hustle Collection Yield",
      hustle_income_pct: 0.25,
    },
  },
  {
    id: "smoke_forest_shrooms",
    name: "Smoke Homegrown: Forest Shrooms",
    category: "farm_weed",
    desc: "Crush and smoke sun-dried Forest Shrooms harvested from your farm. Enhances raw aggression and defensive instinct during raids.",
    clean_price: 200,
    delivery_fee: 40,
    farm_strain_req: "shrooms",
    duration_secs: 3600, // 1 hour
    icon: "Sparkles",
    buff: {
      stat_label: "+30% Syndicate Combat Power",
      combat_power_pct: 0.30,
      raid_defence_flat: 12,
    },
  },
  {
    id: "smoke_volta_green",
    name: "Smoke Homegrown: Volta Green",
    category: "farm_weed",
    desc: "Slow-cured Volta Green buds from your farm. Induces deep calm, blinding police informants and dampening heat generation.",
    clean_price: 250,
    delivery_fee: 40,
    farm_strain_req: "green",
    duration_secs: 5400, // 1.5 hours
    icon: "ShieldAlert",
    buff: {
      stat_label: "-50% Heat Generated from All Activities",
      heat_reduction_pct: 0.50,
      flat_heat_drop: 15,
    },
  },
  {
    id: "smoke_skunk",
    name: "Smoke Homegrown: Northern Gold Skunk",
    category: "farm_weed",
    desc: "Potent Northern Skunk resin harvested from your advanced farm. Unlocks supreme kingpin euphoria, accelerating money laundering batch cycles.",
    clean_price: 350,
    delivery_fee: 50,
    farm_strain_req: "skunk",
    duration_secs: 7200, // 2 hours
    icon: "Coins",
    buff: {
      stat_label: "+20% Laundering Speed & -5% Commission Fee",
      launder_speed_pct: 0.20,
      launder_fee_pct: -0.05,
    },
  },
];
