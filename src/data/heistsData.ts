// 66 Distinct Heists across 5 Tiers in Ghana Underworld
// Daily rotation picks 8 heists based on dayKey(now)
import type { Heist } from "./gameData";

export interface ExtendedHeist extends Heist {
  tier?: number;
  luxury_drop_chance?: number; // 0.15 for T4, 0.35 for T5
  luxury_drop_tier?: number;
  category?: string;
}

export const ALL_66_HEISTS: ExtendedHeist[] = [
  // TIER 1: Street Ops (8 Heists) - Minimum 2 Hours (7,200s) - Payout: GH₵4,000 - GH₵25,000
  { id: "float", name: "MoMo Float Grab", tier: 1, dur: 7200, roles: ["Driver", "Infiltrator"], diff: 35, reward: 4000, unlock: 1, heat: 5, category: "Street" },
  { id: "betting", name: "Betting Shop Safe", tier: 1, dur: 8400, roles: ["Hacker", "Infiltrator", "Driver"], diff: 55, reward: 18000, unlock: 1, heat: 8, category: "Street" },
  { id: "fuel_station", name: "Late Night Fuel Cash Drop", tier: 1, dur: 7500, roles: ["Driver", "Enforcer"], diff: 45, reward: 12000, unlock: 1, heat: 6, category: "Street" },
  { id: "kiosk_strip", name: "Kejetia Kiosk Cash Boxes", tier: 1, dur: 7300, roles: ["Infiltrator", "Driver"], diff: 40, reward: 9500, unlock: 1, heat: 5, category: "Street" },
  { id: "trotro_union", name: "Trotro Union Ticket Strongbox", tier: 1, dur: 7600, roles: ["Driver", "Enforcer"], diff: 48, reward: 14000, unlock: 1, heat: 7, category: "Street" },
  { id: "chop_bar_vault", name: "High-Volume Chop Bar Safe", tier: 1, dur: 7800, roles: ["Infiltrator", "Enforcer"], diff: 50, reward: 16500, unlock: 1, heat: 7, category: "Street" },
  { id: "timber_depot", name: "Timber Market Cash Registry", tier: 1, dur: 8000, roles: ["Driver", "Enforcer"], diff: 52, reward: 20000, unlock: 1, heat: 8, category: "Street" },
  { id: "cold_store", name: "Fishing Harbour Cold Store Take", tier: 1, dur: 8400, roles: ["Hacker", "Infiltrator"], diff: 58, reward: 25000, unlock: 1, heat: 8, category: "Street" },

  // TIER 2: Commercial Hits (15 Heists) - Durations 2.5h to 3.5h - Payout: GH₵35,000 - GH₵120,000
  { id: "port", name: "Harbour Container Lift", tier: 2, dur: 10800, roles: ["Hacker", "Driver", "Enforcer", "Enforcer (Support)"], diff: 85, reward: 65000, unlock: 1, heat: 12, category: "Commercial" },
  { id: "phone_wholesaler", name: "Circle Phone Wholesaler Safe", tier: 2, dur: 9000, roles: ["Hacker", "Infiltrator", "Driver"], diff: 65, reward: 42000, unlock: 1, heat: 9, category: "Commercial" },
  { id: "pharmacy_depot", name: "Central Pharma Supply Cash Vault", tier: 2, dur: 9400, roles: ["Hacker", "Infiltrator", "Enforcer"], diff: 70, reward: 48000, unlock: 1, heat: 10, category: "Commercial" },
  { id: "bonded_warehouse", name: "Tema Bonded Electronics Cache", tier: 2, dur: 9800, roles: ["Hacker", "Driver", "Enforcer"], diff: 78, reward: 58000, unlock: 1, heat: 11, category: "Commercial" },
  { id: "supermarket_drop", name: "Spintex Mega Supermarket Night Drop", tier: 2, dur: 9200, roles: ["Driver", "Infiltrator", "Enforcer"], diff: 72, reward: 52000, unlock: 1, heat: 10, category: "Commercial" },
  { id: "car_dealership", name: "Airport Residential Auto Showroom Safe", tier: 2, dur: 10200, roles: ["Driver", "Hacker", "Infiltrator"], diff: 80, reward: 72000, unlock: 1, heat: 12, category: "Commercial" },
  { id: "boutique_vault", name: "Osu Designer Drip Vault", tier: 2, dur: 9600, roles: ["Infiltrator", "Driver", "Hacker"], diff: 75, reward: 62000, unlock: 1, heat: 11, category: "Commercial" },
  { id: "jewelry_wholesaler", name: "Adabraka Gold Merchants Strongbox", tier: 2, dur: 10600, roles: ["Hacker", "Infiltrator", "Enforcer"], diff: 88, reward: 82000, unlock: 1, heat: 13, category: "Commercial" },
  { id: "express_courier", name: "International Air Freight Parcel Safe", tier: 2, dur: 10400, roles: ["Driver", "Hacker", "Infiltrator"], diff: 84, reward: 78000, unlock: 1, heat: 12, category: "Commercial" },
  { id: "nightclub_cashout", name: "Osu VIP Lounge Weekend Cashout", tier: 2, dur: 10000, roles: ["Infiltrator", "Enforcer", "Driver"], diff: 80, reward: 70000, unlock: 1, heat: 11, category: "Commercial" },
  { id: "hotel_vault", name: "5-Star Beach Resort Main Vault", tier: 2, dur: 11200, roles: ["Hacker", "Infiltrator", "Driver"], diff: 92, reward: 90000, unlock: 1, heat: 13, category: "Commercial" },
  { id: "private_hospital", name: "Specialist Clinic Cash Safe", tier: 2, dur: 10500, roles: ["Hacker", "Infiltrator", "Enforcer"], diff: 86, reward: 84000, unlock: 1, heat: 12, category: "Commercial" },
  { id: "shipping_office", name: "Canoe Harbour Clearing Agency", tier: 2, dur: 11600, roles: ["Driver", "Enforcer", "Hacker"], diff: 95, reward: 98000, unlock: 1, heat: 14, category: "Commercial" },
  { id: "cement_distributor", name: "Industrial Cement Depot Strongbox", tier: 2, dur: 12000, roles: ["Driver", "Enforcer", "Driver (Escort)"], diff: 98, reward: 105000, unlock: 1, heat: 14, category: "Commercial" },
  { id: "brewery_safe", name: "Achimota Beverage Plant Vault", tier: 2, dur: 12600, roles: ["Hacker", "Driver", "Enforcer"], diff: 102, reward: 120000, unlock: 1, heat: 15, category: "Commercial" },

  // TIER 3: Industrial & Cartel Strikes (18 Heists) - Payout: GH₵180,000 - GH₵650,000
  { id: "tanker", name: "Fuel Tanker Convoy", tier: 3, dur: 10800, roles: ["Driver", "Driver (Escort)", "Enforcer", "Enforcer (Gunner)"], diff: 120, reward: 220000, unlock: 1, heat: 15, category: "Industrial" },
  { id: "gold_refinery_drop", name: "Tarkwa Transit Gold Escort", tier: 3, dur: 11500, roles: ["Driver", "Enforcer", "Hacker", "Infiltrator"], diff: 130, reward: 260000, unlock: 1, heat: 16, category: "Industrial" },
  { id: "bauxite_rail", name: "Awaso Mineral Train Hijack", tier: 3, dur: 12000, roles: ["Driver", "Enforcer", "Enforcer (Heavy)", "Hacker"], diff: 140, reward: 300000, unlock: 1, heat: 17, category: "Industrial" },
  { id: "cocoa_board_vault", name: "Cocoa Marketing Syndicate Safe", tier: 3, dur: 12600, roles: ["Hacker", "Infiltrator", "Driver", "Enforcer"], diff: 148, reward: 340000, unlock: 1, heat: 17, category: "Industrial" },
  { id: "offshore_vessel", name: "Saltpond Rig Supply Vessel Raid", tier: 3, dur: 13200, roles: ["Driver", "Infiltrator", "Enforcer", "Hacker"], diff: 155, reward: 380000, unlock: 1, heat: 18, category: "Industrial" },
  { id: "telecom_server", name: "Ridge Telecom Switching Centre", tier: 3, dur: 13800, roles: ["Hacker", "Hacker (Cyber)", "Infiltrator", "Driver"], diff: 162, reward: 420000, unlock: 1, heat: 18, category: "Industrial" },
  { id: "diamond_consignment", name: "Awatia Gem Transport Intercept", tier: 3, dur: 14400, roles: ["Driver", "Enforcer", "Infiltrator", "Driver (Escort)"], diff: 170, reward: 470000, unlock: 1, heat: 19, category: "Industrial" },
  { id: "armored_transit", name: "Commercial Bank Armored Bullion Van", tier: 3, dur: 15000, roles: ["Driver", "Enforcer", "Enforcer (Heavy)", "Hacker"], diff: 178, reward: 520000, unlock: 1, heat: 19, category: "Industrial" },
  { id: "free_zone_warehouse", name: "Kpone Export Processing Vault", tier: 3, dur: 15600, roles: ["Hacker", "Infiltrator", "Enforcer", "Driver"], diff: 185, reward: 560000, unlock: 1, heat: 20, category: "Industrial" },
  { id: "manganese_dock", name: "Takoradi Manganese Berth Stronghold", tier: 3, dur: 16200, roles: ["Driver", "Enforcer", "Enforcer (Heavy)", "Infiltrator"], diff: 192, reward: 600000, unlock: 1, heat: 20, category: "Industrial" },
  { id: "oil_storage_depot", name: "Tema BOST Petroleum Cash Office", tier: 3, dur: 16800, roles: ["Hacker", "Driver", "Enforcer", "Infiltrator"], diff: 200, reward: 650000, unlock: 1, heat: 21, category: "Industrial" },
  { id: "customs_confiscation", name: "Airport Cargo Seizure Lockup", tier: 3, dur: 11000, roles: ["Infiltrator", "Hacker", "Driver"], diff: 125, reward: 240000, unlock: 1, heat: 16, category: "Industrial" },
  { id: "textile_cartel", name: "Juapong Factory Cash Stash", tier: 3, dur: 11800, roles: ["Driver", "Enforcer", "Infiltrator"], diff: 135, reward: 280000, unlock: 1, heat: 16, category: "Industrial" },
  { id: "gold_buyer_safe", name: "Obuasi Licensed Gold Buyer Citadel", tier: 3, dur: 12400, roles: ["Hacker", "Enforcer", "Infiltrator"], diff: 145, reward: 320000, unlock: 1, heat: 17, category: "Industrial" },
  { id: "quarry_explosives", name: "Industrial Granite Quarry Vault", tier: 3, dur: 13000, roles: ["Driver", "Enforcer", "Infiltrator"], diff: 150, reward: 360000, unlock: 1, heat: 18, category: "Industrial" },
  { id: "fertilizer_monopoly", name: "Fertilizer Cartel Harbour Depot", tier: 3, dur: 13600, roles: ["Driver", "Hacker", "Enforcer"], diff: 160, reward: 400000, unlock: 1, heat: 18, category: "Industrial" },
  { id: "airline_caterer", name: "Kotoka In-Flight Catering Cashier", tier: 3, dur: 14200, roles: ["Infiltrator", "Hacker", "Driver"], diff: 168, reward: 450000, unlock: 1, heat: 19, category: "Industrial" },
  { id: "real_estate_escrow", name: "East Legon Land Syndicate Escrow", tier: 3, dur: 14800, roles: ["Hacker", "Infiltrator", "Enforcer"], diff: 175, reward: 500000, unlock: 1, heat: 19, category: "Industrial" },

  // TIER 4: Syndicate & Vault Raids (15 Heists) - Payout: GH₵750,000 - GH₵4,500,000 + 15% Rare Luxury Drop
  { id: "lockup", name: "Market Gold Lockup", tier: 4, dur: 14400, roles: ["Hacker", "Hacker (Cyber)", "Driver", "Enforcer", "Infiltrator"], diff: 180, reward: 750000, unlock: 1, heat: 18, luxury_drop_chance: 0.15, luxury_drop_tier: 3, category: "Syndicate" },
  { id: "casino", name: "Strip Casino Vault", tier: 4, dur: 21600, roles: ["Hacker", "Hacker (Security)", "Driver", "Enforcer", "Enforcer (Muscle)", "Infiltrator"], diff: 260, reward: 2800000, unlock: 1, heat: 22, luxury_drop_chance: 0.15, luxury_drop_tier: 3, category: "Syndicate" },
  { id: "crypto_exchange", name: "Airport City Off-Grid Crypto Farm", tier: 4, dur: 18000, roles: ["Hacker", "Hacker (Mainframe)", "Infiltrator", "Driver", "Enforcer"], diff: 210, reward: 1200000, unlock: 1, heat: 20, luxury_drop_chance: 0.15, luxury_drop_tier: 3, category: "Syndicate" },
  { id: "luxury_car_ring", name: "Cantonments Smuggled Supercar Depot", tier: 4, dur: 19500, roles: ["Driver", "Driver (Convoy)", "Hacker", "Infiltrator", "Enforcer"], diff: 225, reward: 1550000, unlock: 1, heat: 21, luxury_drop_chance: 0.15, luxury_drop_tier: 3, category: "Syndicate" },
  { id: "diplomatic_courier", name: "Embassy Row Diplomatic Pouch Intercept", tier: 4, dur: 20400, roles: ["Infiltrator", "Infiltrator (Inside)", "Driver", "Hacker", "Enforcer"], diff: 240, reward: 1900000, unlock: 1, heat: 21, luxury_drop_chance: 0.15, luxury_drop_tier: 3, category: "Syndicate" },
  { id: "private_jet_charter", name: "Kotoka VIP FBO Terminal Strongbox", tier: 4, dur: 21000, roles: ["Driver", "Infiltrator", "Hacker", "Enforcer", "Enforcer (Heavy)"], diff: 250, reward: 2300000, unlock: 1, heat: 22, luxury_drop_chance: 0.15, luxury_drop_tier: 3, category: "Syndicate" },
  { id: "yacht_club_vault", name: "Takoradi Royal Yacht Club Vault", tier: 4, dur: 22200, roles: ["Hacker", "Infiltrator", "Driver", "Enforcer", "Enforcer (Gunner)"], diff: 270, reward: 3100000, unlock: 1, heat: 23, luxury_drop_chance: 0.15, luxury_drop_tier: 3, category: "Syndicate" },
  { id: "diamond_clearing", name: "Precious Minerals Marketing Corp Depository", tier: 4, dur: 23400, roles: ["Hacker", "Hacker (Cyber)", "Infiltrator", "Enforcer", "Driver"], diff: 285, reward: 3500000, unlock: 1, heat: 23, luxury_drop_chance: 0.15, luxury_drop_tier: 3, category: "Syndicate" },
  { id: "cartel_mansion", name: "Rival Cartel Boss Underground Bunker", tier: 4, dur: 24600, roles: ["Enforcer", "Enforcer (Heavy)", "Hacker", "Infiltrator", "Driver"], diff: 300, reward: 3900000, unlock: 1, heat: 24, luxury_drop_chance: 0.15, luxury_drop_tier: 4, category: "Syndicate" },
  { id: "dockside_smuggling", name: "Meridian Smuggler Submersible Cache", tier: 4, dur: 25800, roles: ["Infiltrator", "Driver", "Hacker", "Enforcer", "Enforcer (Gunner)"], diff: 315, reward: 4300000, unlock: 1, heat: 25, luxury_drop_chance: 0.15, luxury_drop_tier: 4, category: "Syndicate" },
  { id: "presidential_hotel", name: "Kempinski Presidential Suite Safe", tier: 4, dur: 17500, roles: ["Infiltrator", "Hacker", "Driver", "Enforcer"], diff: 205, reward: 1100000, unlock: 1, heat: 19, luxury_drop_chance: 0.15, luxury_drop_tier: 3, category: "Syndicate" },
  { id: "arms_dealer_cache", name: "Aflao Border Gunrunner Depot", tier: 4, dur: 18800, roles: ["Enforcer", "Enforcer (Heavy)", "Driver", "Infiltrator"], diff: 220, reward: 1400000, unlock: 1, heat: 20, luxury_drop_chance: 0.15, luxury_drop_tier: 3, category: "Syndicate" },
  { id: "gold_air_cargo", name: "Bullion Cargo Aircraft Hold", tier: 4, dur: 20000, roles: ["Hacker", "Infiltrator", "Driver", "Enforcer"], diff: 235, reward: 1750000, unlock: 1, heat: 21, luxury_drop_chance: 0.15, luxury_drop_tier: 3, category: "Syndicate" },
  { id: "state_lottery_vault", name: "National Lotteries Central Safe", tier: 4, dur: 21200, roles: ["Hacker", "Hacker (Cyber)", "Infiltrator", "Driver"], diff: 255, reward: 2500000, unlock: 1, heat: 22, luxury_drop_chance: 0.15, luxury_drop_tier: 3, category: "Syndicate" },
  { id: "offshore_fund_cache", name: "Labone Private Wealth Management Vault", tier: 4, dur: 22800, roles: ["Hacker", "Infiltrator", "Driver", "Enforcer"], diff: 275, reward: 3300000, unlock: 1, heat: 23, luxury_drop_chance: 0.15, luxury_drop_tier: 4, category: "Syndicate" },

  // TIER 5: National & Global Legends (10 Heists) - Payout: GH₵6,000,000 - GH₵50,000,000 + 35% Rare Luxury Drop
  { id: "central_bank", name: "Central Bank Gold Reserves", tier: 5, dur: 43200, roles: ["Hacker", "Hacker (Mainframe)", "Driver", "Driver (Convoy)", "Enforcer", "Enforcer (Heavy)", "Infiltrator"], diff: 450, reward: 12000000, unlock: 1, heat: 30, luxury_drop_chance: 0.35, luxury_drop_tier: 5, category: "Legendary" },
  { id: "interbank_settlement", name: "GHIPSS Mainframe Digital Clearing", tier: 6, dur: 42000, roles: ["Hacker", "Hacker (Mainframe)", "Hacker (Cyber)", "Driver", "Infiltrator"], diff: 440, reward: 11000000, unlock: 1, heat: 29, luxury_drop_chance: 0.35, luxury_drop_tier: 5, category: "Legendary" },
  { id: "crude_super_tanker", name: "Ten Field Super-Tanker Oil Siphon", tier: 6, dur: 46800, roles: ["Driver", "Driver (Convoy)", "Enforcer", "Enforcer (Heavy)", "Infiltrator", "Hacker"], diff: 480, reward: 15500000, unlock: 1, heat: 31, luxury_drop_chance: 0.35, luxury_drop_tier: 5, category: "Legendary" },
  { id: "royal_ashanti_heritage", name: "Manhyia Sacred Gold Treasure Chamber", tier: 7, dur: 50400, roles: ["Infiltrator", "Infiltrator (Inside)", "Hacker", "Driver", "Enforcer", "Enforcer (Heavy)"], diff: 520, reward: 21000000, unlock: 1, heat: 32, luxury_drop_chance: 0.35, luxury_drop_tier: 6, category: "Legendary" },
  { id: "jubilee_house_archive", name: "Diplomatic Black Budget Strongroom", tier: 7, dur: 54000, roles: ["Hacker", "Hacker (Mainframe)", "Infiltrator", "Infiltrator (Inside)", "Driver", "Enforcer (Heavy)"], diff: 600, reward: 29000000, unlock: 1, heat: 34, luxury_drop_chance: 0.35, luxury_drop_tier: 6, category: "Legendary" },
  { id: "global_diamond_consortium", name: "Antwerp Direct Chartered Vault", tier: 7, dur: 56000, roles: ["Hacker", "Infiltrator", "Driver", "Driver (Convoy)", "Enforcer", "Enforcer (Heavy)"], diff: 650, reward: 37000000, unlock: 1, heat: 35, luxury_drop_chance: 0.35, luxury_drop_tier: 6, category: "Legendary" },
  { id: "sovereign", name: "Sovereign Gold Vault", tier: 8, dur: 57600, roles: ["Hacker", "Hacker (Mainframe)", "Driver", "Driver (Convoy)", "Enforcer", "Enforcer (Heavy)", "Infiltrator", "Infiltrator (Inside)"], diff: 700, reward: 45000000, unlock: 1, heat: 35, gate: "heist:sovereign", luxury_drop_chance: 0.40, luxury_drop_tier: 8, category: "Legendary" },
  { id: "billionaire_bunker", name: "Private Island Offshore Mega-Bunker", tier: 8, dur: 64800, roles: ["Hacker", "Hacker (Mainframe)", "Driver", "Driver (Convoy)", "Enforcer", "Enforcer (Heavy)", "Infiltrator", "Infiltrator (Inside)"], diff: 750, reward: 50000000, unlock: 1, heat: 36, luxury_drop_chance: 0.50, luxury_drop_tier: 8, category: "Legendary" },
];

/** Selects 8 active heists for the daily circle based on dayKey */
export function getDailyHeists(daySeed: string): ExtendedHeist[] {
  // Ensure balanced representation across tiers:
  // 2 from Tier 1, 2 from Tier 2, 2 from Tier 3, 1 from Tier 4, 1 from Tier 5 = 8 Heists!
  const hash = (str: string) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  };

  const seed = hash(daySeed || "2026-11-06");

  const byTier = (t: number) => ALL_66_HEISTS.filter((h) => h.tier === t);
  const pickFrom = (arr: ExtendedHeist[], count: number, offset: number) => {
    const res: ExtendedHeist[] = [];
    for (let i = 0; i < count; i++) {
      const idx = (seed + offset + i * 3) % arr.length;
      res.push(arr[idx]);
    }
    return res;
  };

  const t1 = pickFrom(byTier(1), 2, 1);
  const t2 = pickFrom(byTier(2), 2, 7);
  const t3 = pickFrom(byTier(3), 2, 13);
  const t4 = pickFrom(byTier(4), 1, 19);
  const t5 = pickFrom(byTier(5), 1, 23);

  return [...t1, ...t2, ...t3, ...t4, ...t5];
}
