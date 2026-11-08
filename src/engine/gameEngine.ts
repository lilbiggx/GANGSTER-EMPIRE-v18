import {
  DISTRICTS,
  HUSTLES,
  HUSTLE_MAP,
  FRONTS,
  FRONT_MAP,
  HEAT_TIERS,
  ROLES,
  ARCHETYPES,
  ROLE_ARCH,
  STRENGTHS,
  FLAWS,
  FIRST_NAMES,
  FEMALE_NAMES,
  NICKNAMES,
  HEISTS,
  HEIST_MAP,
  HEIST_APPROACHES,
  HEIST_PREP,
  RIVALS,
  RIVAL_MAP,
  UPGRADES,
  BLACK_MARKET,
  BM_MAP,
  COSMETICS,
  COSMETIC_MAP,
  GEAR,
  GEAR_MAP,
  STRAINS,
  STRAIN_MAP,
  FARM,
  DEFAULT_AVATAR,
  AVATAR_OPTIONS,
  CONTRACT_TYPES,
  FALLBACK_TAUNTS,
  FALLBACK_NEWS,
  PASS_TIERS,
  PASS_XP_PER_TIER,
  SELL_RATE,
  WEAPON_MAX_LVL,
  CREW_STAT_MAX,
  CREW_FRONT_TRAITS,
  MANSION_FACILITIES,
  BOSS_PERKS,
  HEIST_EVENTS,
  HEIST_EVENT_MAP,
  TIER2_CATEGORIES,
  TIER2_LIST,
  BOUTIQUE_SUBCATEGORIES,
  BOUTIQUE_CATALOG,
  ALL_GEAR_ITEMS,
  CREW_BACKGROUNDS,
  CREW_BACKGROUND_MAP,
  DAILY_HEIST_BASE_LIMIT,
  Rival,
  ASSASSIN_CONTACT,
  DAILY_HUSTLE_CAP,
  GUN_SHOP_SUBCATEGORIES,
  BETTING_TIERS,
  BETTING_CONFIG,
  INITIAL_PLAYER_PLOTS,
  PlayerPlot,
  CONDITION_THRESHOLDS,
  CONDITION_MULTIPLIERS,
  COOLDOWNS,
  BOSS_PERK_MAX_RANK,
  VAULT_BASE_CAP,
  VAULT_CAP_PER_LEVEL,
  VAULT_COST_GROWTH,
  WEAR_RATES,
  STATION_REPAIR_RATE,
  QUICK_SERVICE_AMOUNT,
  LAND_COUNT,
  LAND_FEES,
  FIRST_FREE_HUSTLE,
  RIVAL_LAUNDER_BASE_COMMISSION,
  RIVAL_LAUNDER_MIN_CAP,
  RIVAL_LAUNDER_MAX_CAP,
  rollRivalLaunderCap,
  pickDailyLaunderRivals,
  calcRivalCommission,
  GHANA_STREET_NAMES,
  CRAFTABLE_WEAPONS,
  WORKSHOP,
  ROBBERY_MAP,
  TRAFFICKING_MAP,
  GIRLFRIEND_MAP,
  ROBBERIES,
  GIRLFRIENDS,
  MUSIC_MAP,
  STUDIO,
  CREW_TRAITS,
  CrewTrait,
  METHLAB_PRODUCTS,
  METHLAB,
  METHLAB_MAP,
  MINERALS,
  MINING,
  MINERAL_MAP,
  BIG_MAN_PERKS,
  SMUGGLE_COMMODITIES,
  COMMODITY_MAP,
  TURF_ZONES,
  AREA_DON_ARCHETYPES,
  AREA_DON_TACTICS,
  AREA_DON_NAMES,
  CREW_RECRUIT_TIERS,
} from "../data/gameData";
import { DELIVERABLE_CONSUMABLES, DeliverableConsumable } from "../data/consumablesData";
import { LEGACY_PERKS, LEGACY_MAP, RETIRE_MIN_LIFETIME, retireTokens, GATED_CONTENT, CITY_EVENTS, CITY_BOSS_MILESTONES, FRONT_DISTRICT, INFLUENCE_MAX, influenceCost, INFLUENCE_FX, OFFSHORE, offshoreRate, LIEUTENANT, KINGPIN_TABLES, CHIP_SHOP, PROJECTS, PROJECT_MAP, LEGENDARY_BACKGROUNDS, ELITE_CONTRACTS, ELITE_MIN_LEVEL, TOP_HEISTS } from "../data/lateGame";
import { LUXURY_CATALOG, LUXURY_MAP, LUXURY_SETS, LUXURY_CAPS, LUXURY_CATEGORIES, LUXURY_ROTATION_SIZE, LUXURY_ROTATION_HOURS, LUXURY_DEAL_DISCOUNT, LUXURY_TIER_NAMES, type LuxuryEffects } from "../data/luxury";
import { sendNotification } from "../lib/notifications";
import {
  getRushHustleFee,
  getCrewHireBaseCost,
  getCrewWageBase,
  getCrewWageStep,
} from "../lib/valueOverrides";

// Integer-safe BigInt wrapper: prevents RangeError when floating-point numbers or decimal strings are converted.
const _NativeBigInt = globalThis.BigInt;
function BigInt(v: any): bigint {
  if (typeof v === "bigint") return v;
  if (typeof v === "number") {
    if (!Number.isFinite(v)) return 0n;
    return _NativeBigInt(Math.trunc(v));
  }
  if (typeof v === "boolean") return v ? 1n : 0n;
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return 0n;
    if (/^-?\d+$/.test(s)) {
      try {
        return _NativeBigInt(s);
      } catch {
        return 0n;
      }
    }
    const n = Number(s);
    return Number.isFinite(n) ? _NativeBigInt(Math.trunc(n)) : 0n;
  }
  return 0n;
}

// Build-time Test Tools flag (vite define from VITE_ENABLE_TEST_TOOLS; node tests pass --define:__GE_TEST_TOOLS__=true).
declare const __GE_TEST_TOOLS__: boolean;
const ENGINE_TEST_TOOLS = typeof __GE_TEST_TOOLS__ !== "undefined" && __GE_TEST_TOOLS__ === true;

const H = 3600;

export interface CrewMember {
  id: string;
  name: string;
  arch: string;
  stats: Record<string, number>;
  base_stats?: Record<string, number>;
  strength: string;
  flaw: string;
  front_trait: string;
  traits?: string[];
  unlocked_traits?: string[];
  morale: number; // 0 to 100
  xp: number;
  lvl: number;
  assign: string | null;
  look: any;
  loadout: Record<string, string>;
  origin?: string;
  bio?: string;
  temperament?: string;
  specialty_biz?: string;
  trait_reason?: string;
  merc?: boolean;
  merc_until?: number;
  price?: number;
  clean_price?: number;
  elite?: boolean;
  daily_rate?: number;
  last_wage_day?: string;
  status?: "active" | "kidnapped";
  injured_until?: number;
  injury?: { sev: number; need: number; done: number; at: number; src?: string } | null; // v9 injuries
  initial_gear?: Array<{ uid: string; id: string; slot: string; source: string; lvl?: number }>;
  recruit_tier?: number;
  tier_name?: string;
  hire_cost?: number;
  stats_locked?: boolean;
}

export interface CrewCrisis {
  id: string;
  type: "leave_demand" | "conflict";
  title: string;
  crew_id: string;
  crew_name: string;
  crew_arch: string;
  crew_look?: any;
  rival_crew_id?: string;
  rival_crew_name?: string;
  reason: string;
  quote: string;
  compensation_clean: number;
  compensation_dirty: number;
  morale: number;
  created_at: number;
}

export interface Player {
  user_id: string;
  name: string;
  district: string;
  created: number;
  last_seen: number;
  version: number;
  age_confirmed: boolean;
  is_bot: boolean;
  dirty: string;
  clean: string;
  lifetime: string;
  xp: number;
  level: number;
  heat: number;
  heat_ts: number;
  arrested_until: number;
  lie_low_until: number;
  shield_until: number;
  newbie_until: number;
  hustles: Record<string, { lvl: number; ts: number; bank?: number; last?: number; paused?: boolean }>;
  fronts: Record<string, number>;
  batches: Array<{
    id: string;
    front: string;
    dirty: number;
    clean: number;
    amount?: number;
    out?: number;
    start?: number;
    end: number;
  }>;
  build_slots: number;
  crew: CrewMember[];
  robberies?: Array<{
    id: string;
    target: string;
    crew_ids: string[];
    start: number;
    end: number;
    reward: number;
    heat: number;
    status: "active" | "completed";
  }>;
  trafficking?: Array<{
    id: string;
    route_id: string;
    strain: string;
    amount: number;
    crew_id: string;
    start: number;
    end: number;
    payout: number;
    heat: number;
    status: "active" | "completed";
  }>;
  girlfriend?: {
    active_id: string | null;
    companions: Record<string, { status: "courting" | "dating"; impress_score: number; happiness: number; last_date: number; last_gift: number }>;
  };
  heists: Array<{
    id: string;
    tpl: string;
    sel: Record<string, string>;
    start?: number;
    end: number;
    pct: number;
    reward: number;
    heat: number;
    approach: string;
    events?: Array<{
      uid: string;
      event_id: string;
      trigger_at: number;
      expires_at: number;
      resolved: boolean;
      choice?: string;
      outcome?: string;
      chance_delta?: number;
      heat_delta?: number;
      penalty_applied?: boolean;
    }>;
  }>;
  upgrades: Record<string, number>;
  inv: Record<string, number>;
  cosmetics: string[];
  equipped: { drip: string | null; car: string | null; decor: string | null };
  raid: {
    rival: string;
    start: number;
    resolve_at: number;
    attack: number;
    fortify: number;
    taunt: string;
  } | null;
  raid_log: Array<{
    t: number;
    rival: string;
    defence: number;
    attack: number;
    won: boolean;
    amount: string;
    pct?: number;
    drop?: string | null;
  }>;
  smuggler_shipments: Array<{
    id: string;
    items: Array<{ type: 'farm'|'weapon'|'luxury', id: string, uid?: string, qty: number }>;
    start: number;
    end: number;
    payout: number;
    status: 'active' | 'completed';
  }>;
  luxury: Record<string, number>;
  grudges: Record<string, number>;
  rival_relations?: Record<string, number>;
  rival_launder_caps?: Record<string, number>;
  rival_launder_day?: { day: string; active_syndicates: string[]; used: Record<string, boolean> };
  rival_cd: Record<string, number>;
  store: { slot: number; offset: number; bought: string[]; agency?: CrewMember[] };
  ads: { day: string; double: boolean; restock: boolean };
  daily: {
    day: string;
    contracts: Array<{
      idx: number;
      type: string;
      label: string;
      target: number;
      progress: number;
      claimed: boolean;
      reward_clean: number;
      reward_pass: number;
    }>;
    login_claimed: boolean;
  };
  streak: { count: number; last_day: string; grace_used: boolean };
  prestige: { count: number; respect: number };
  pass: { season: string; xp: number; premium: boolean; free: number[]; prem: number[] };
  season: { id: string; points: number };
  lawyer_week: { week: string; count: number };
  tap_ts: number;
  pvp_cd: number;
  ledger_done: string[];
  offline_bonus: { amount: string; until: number; away: number } | null;
  flags: number;
  log: Array<{ t: number; msg: string; kind: "info" | "good" | "bad" }>;
  nw_score: number;
  power: number;
  avatar: any;
  loadout: Record<string, string>;
  gear: Array<{ uid: string; id: string; source: string; lvl?: number; tier2?: string | null }>;
  reward_cosmetics: string[];
  farm: {
    plots: Array<{ idx: number; strain: string | null; planted: number; end: number; yield: number; start?: number }>;
    stash: Record<string, number>;
    up: Record<string, number>;
  };
  workshop: {
    benches: Array<{ weaponId: string | null; start: number; end: number }>;
    up: Record<string, number>;
  };
  methlab?: {
    benches: Array<{ productId: string | null; start: number; end: number; yield: number }>;
    stash: Record<string, number>;
    up: Record<string, number>;
  };
  mining?: {
    rigs: Array<{ mineralId: string | null; start: number; end: number; yield: number }>;
    stash: Record<string, number>;
    up: Record<string, number>;
  };
  music_studio: {
    booths: Array<{ trackId: string | null; start: number; end: number }>;
    up: Record<string, number>;
  };
  last_heist_day: string;
  facilities: Record<string, number>;
  facility_condition?: Record<string, number>;
  facility_assign?: Record<string, string[]>;
  last_battle?: BattleReport | null; // v9: drives the animated fight/raid playback
  last_facility_decay?: number;
  // v9: wear & maintenance for side hustles and front businesses (separate from facilities)
  hustle_condition?: Record<string, number>;
  front_condition?: Record<string, number>;
  last_biz_wear?: number;
  // v9: action cooldowns (engine seconds). launder = global laundering lock started when clean cash is collected,
  // front = per-front rest period started when that front runs a wash, heist = lock started when a heist launches.
  cooldowns?: { launder_until: number; heist_until: number; front: Record<string, number>; heist_by?: Record<string, number>; heist_set_at?: Record<string, number>; robbery_by?: Record<string, number>; robbery_until?: number; gf_date_by?: Record<string, number>; gf_court_by?: Record<string, number>; smuggling_by?: Record<string, number>; blackmail_until?: number; blackmail_day?: string };
  // v9: 8-plot Free-Slot Modular Plot Allocation System (separate from the weed farm's farm.plots)
  player_plots?: PlayerPlot[];
  player_front_plots?: Array<{ plotID: number; locationName?: string; frontID: string | null }>;
  boss_perks: Record<string, number>;
  boss_stats?: { brains: number; wheels: number; muscle: number; stealth: number };
  crew_crisis?: CrewCrisis | null;
  crew_crisis_cooldown?: number;
  skill_points: number;
  front_assign: Record<string, string>;
  hustle_assign?: Record<string, string>;
  hustle_managers?: Record<string, string[]>;
  plot_hustle_managers?: Record<number, string[]>;
  pending_deliveries?: Array<{
    id: string;
    item_id: string;
    item_name: string;
    category: string;
    ordered_at: number;
    arrive_at: number;
    clean_cost: number;
    delivery_fee: number;
    duration_secs: number;
  }>;
  active_consumable_buffs?: Array<{
    id: string;
    name: string;
    category: string;
    stat_label: string;
    started_at: number;
    expires_at: number;
    buff: any;
  }>;
  cash_statement?: Array<CashTransaction>;
  cash_daily?: Record<string, Record<string, { din: number; dout: number; cin: number; cout: number }>>; // v9 ledger: complete per-day category totals (31 days)
  last_lie_low_day?: string;
  archrival_event?: any;
  first_business_claimed?: boolean;
  rival_ev?: { last: number }; // v9: rival-triggered event timer
  rival_event_log?: RivalEventLogEntry[];
  away_summary?: { from: number; to: number; ids: string[] } | null;
  betting?: {
    history: Array<{
      bet_id: string;
      created_at: number;
      stake_currency: "clean" | "dirty";
      stake_amount: number;
      multiplier: number;
      win_probability: number;
      take_rate: number;
      outcome: "WIN" | "LOSS";
      gross_payout: number;
      take_amount: number;
      net_clean_payout: number;
      stake_forfeited: number;
    }>;
    stats: {
      total_bets: number;
      total_won: number;
      total_lost: number;
      total_staked_clean: number;
      total_staked_dirty: number;
      total_clean_paid_out: number;
      total_fees_collected: number;
      current_streak: number;
      best_win: number;
    };
    operator: {
      level: number;
      reputation: number;
      max_stake: number;
    };
  };
  hustle_daily?: Record<string, { day: string; amount: number }>;
  heist_day?: { day: string; count: number; ad_extra: number };
  rentals?: Array<{
    id: string;
    crew_id: string;
    crew_name: string;
    arch: string;
    lvl: number;
    price: number;
    hours: number;
    start: number;
    end: number;
    status: "open" | "rented";
  }>;
  assassin_hits?: Record<string, {
    contract_type: string;
    power_cut: number;
    until: number;
  }>;
  consumable_cooldowns?: Record<string, number>;
  blackmail?: Record<string, number>;
  last_wage_day?: string;
  area_don?: {
    id: string;
    name: string;
    archetypeId: string;
    tacticId: string;
    archetypeName?: string;
    tacticName?: string;
    archetypeDesc?: string;
    tacticDesc?: string;
    power: number;
    defense?: number;
    hp: number;
    maxHp: number;
    bounty: number;
    rewardType?: "dirty" | "clean";
    next_attack_at?: number;
    defeatedCount: number;
    spawnedAt: number;
    log?: string[];
  } | null;
  area_don_cooldown_until?: number;
  area_don_defeated_count?: number;
  susu_surge?: {
    id: string;
    targetPlots: number[];
    duration: number;
    multiplier: number;
    variant: "Night Market Sweep" | "Lorry Park Rush" | "Taskforce Raid";
    start: number;
    end: number;
  } | null;
  susu_last_roll?: number;
  big_man_perks?: string[];
  trotro_last_payout?: number;
  commodities_held?: Record<string, number>;
  turf_control?: Record<string, number>;
  last_turf_decay?: number;
}

export interface CashTransaction {
  id: string;
  t: number;
  type: "inflow" | "outflow";
  currency: "clean" | "dirty";
  amount: number;
  category: string;
  description: string;
  balance_dirty?: string;
  balance_clean?: string;
}

export const dayKey = (t: number) => new Date(t * 1000).toISOString().slice(0, 10);

// ==========================================
// v9 CENTRAL LEDGER. Every change to p.dirty / p.clean goes through addCash() and is recorded by recordCash().
// Every engine entry point (executeAction, tickPlayer, migratePlayer) runs inside ledgerFrame(), which compares the
// balance change with what was recorded and books any difference under the entry point's category, so the 30-day
// statement always reconciles exactly with the balances.
// ==========================================
export const LEDGER_DAYS = 30;
/** Canonical statement categories (older labels are folded into these). */
export const LEDGER_CATEGORY_ALIASES: Record<string, string> = {
  "Side Hustle": "Street Hustles", "Street Hustle": "Street Hustles", "Plots & Hustles": "Street Hustles", Plots: "Land", "Plot Income": "Street Hustles",
};
const ledgerCat = (c: string) => LEDGER_CATEGORY_ALIASES[c] || c;
const LEDGER_STACK: { dirty: bigint; clean: bigint }[] = [];
/** The ONLY balance mutator: adds (or with a negative delta, removes) cash. Does not record; pair with recordCash. */
export function addCash(p: Player, currency: "clean" | "dirty", delta: number | bigint) {
  const d = typeof delta === "bigint" ? delta : BigInt(Math.trunc(Number(delta) || 0));
  if (currency === "dirty") p.dirty = (BigInt(p.dirty || "0") + d).toString();
  else p.clean = (BigInt(p.clean || "0") + d).toString();
}
/** addCash + recordCash in one call. */
export function moveCash(p: Player, now: number, currency: "clean" | "dirty", delta: number, category: string, description: string) {
  addCash(p, currency, delta);
  recordCash(p, now, delta, currency, category, description);
}
export function ledgerFrame<T>(p: Player, now: number, category: string, description: string, fn: () => T): T {
  const d0 = BigInt(p.dirty || "0");
  const c0 = BigInt(p.clean || "0");
  const fr = { dirty: 0n, clean: 0n };
  LEDGER_STACK.push(fr);
  try {
    return fn();
  } finally {
    LEDGER_STACK.pop();
    const rd = BigInt(p.dirty || "0") - d0 - fr.dirty;
    const rc = BigInt(p.clean || "0") - c0 - fr.clean;
    if (rd !== 0n) recordCash(p, now, Number(rd), "dirty", category, description);
    if (rc !== 0n) recordCash(p, now, Number(rc), "clean", category, description);
  }
}
/** Statement category for an action type (used for anything an action did not label itself). */
export function actionLedgerCategory(type: string): string {
  const t = type || "";
  const R: [RegExp, string][] = [
    [/^dev_|^test_tool$/, "TEST"],
    [/claim_first|land|plot/, "Land"],
    [/launder|wash|batch/, "Laundering"],
    [/front/, "Fronts"],
    [/hustle|collect|tap/, "Street Hustles"],
    [/heist/, "Heists"],
    [/arch|rival_event|event_choice/, "Rival events"],
    [/fight|pvp|battle|attack|raid|hit|turf|rival/, "Fights & rivals"],
    [/bet|exchange|chip|casino|dice|roulette|spin/, "Betting & exchange"],
    [/med|heal|injur|patient/, "Medical"],
    [/daily|streak|contract|pass|login|reward|achiev/, "Daily rewards"],
    [/crew|hire|recruit|payroll|wage|merc|bonus/, "Crew & wages"],
    [/bribe|lie_low|burner|heat/, "Bribes & heat"],
    [/repair|overhaul|maint|service/, "Maintenance"],
    [/vault|facility|mansion|upgrade/, "Facilities & vault"],
    [/perk|skill/, "Perks"],
    [/lux|boutique/, "Boutique"],
    [/equip|gear|weapon|market|buy|sell|shop/, "Purchases & gear"],
    [/retire|prestige|kingpin|offshore|city_fund/, "Late game"],
    [/farm|seed|harvest|stash/, "Farm"],
    [/fortify|defen/, "Defence"],
  ];
  for (const [re, c] of R) if (re.test(t)) return c;
  return "Other";
}

export function recordCash(
  p: Player,
  now: number,
  amount: number,
  currency: "clean" | "dirty",
  category: string,
  description: string
) {
  if (!p.cash_statement) p.cash_statement = [];
  amount = Math.trunc(Number(amount) || 0);
  if (amount === 0) return;
  category = ledgerCat(category);
  LEDGER_STACK.forEach((fr) => { fr[currency] += BigInt(amount); });
  // complete per-day totals by category (never truncated inside the 30-day window)
  const today = dayKey(now);
  if (!p.cash_daily) p.cash_daily = {};
  const day = (p.cash_daily[today] = p.cash_daily[today] || {});
  const agg = (day[category] = day[category] || { din: 0, dout: 0, cin: 0, cout: 0 });
  if (currency === "dirty") { if (amount > 0) agg.din += amount; else agg.dout += -amount; }
  else { if (amount > 0) agg.cin += amount; else agg.cout += -amount; }
  const dayCut = dayKey(now - LEDGER_DAYS * 86400);
  Object.keys(p.cash_daily).forEach((k) => { if (k < dayCut) delete p.cash_daily![k]; });

  const isHustle = category === "Street Hustles" && amount > 0;
  if (isHustle) {
    // bundle street hustle income per day so the statement stays readable
    const existing = p.cash_statement.find((tx) => tx.category === "Street Hustles" && tx.type === "inflow" && tx.currency === currency && dayKey(tx.t) === today);
    if (existing) {
      existing.amount += amount;
      existing.t = now;
      existing.description = `Street hustle income, bundled for ${today}`;
      existing.balance_dirty = p.dirty;
      existing.balance_clean = p.clean;
      return;
    }
  }
  const entry: CashTransaction = {
    id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    t: now,
    type: amount > 0 ? "inflow" : "outflow",
    currency,
    amount: Math.abs(amount),
    category,
    description: isHustle ? `Street hustle income, bundled for ${today}` : description,
    balance_dirty: p.dirty,
    balance_clean: p.clean,
  };
  p.cash_statement.unshift(entry);
  const cutoff = now - LEDGER_DAYS * 86400;
  p.cash_statement = p.cash_statement.filter((tx) => tx.t >= cutoff).slice(0, 1500);
}

/** Rolling 30-day statement: totals by category and net clean/dirty, from the complete daily ledger. */
export function ledgerSummary(p: Player, now: number) {
  const cut = dayKey(now - (LEDGER_DAYS - 1) * 86400);
  const cats: Record<string, { din: number; dout: number; cin: number; cout: number }> = {};
  Object.entries(p.cash_daily || {}).forEach(([day, byCat]) => {
    if (day < cut) return;
    Object.entries(byCat).forEach(([c, v]) => {
      const a = (cats[c] = cats[c] || { din: 0, dout: 0, cin: 0, cout: 0 });
      a.din += v.din; a.dout += v.dout; a.cin += v.cin; a.cout += v.cout;
    });
  });

  const preset = (p as any).preset;
  const startingDirty = BigInt((p as any).starting_dirty || "0");
  const startingClean = BigInt((p as any).starting_clean || "0");

  let net_dirty = Object.values(cats).reduce((s, v) => s + (v.din - v.dout), 0);
  let net_clean = Object.values(cats).reduce((s, v) => s + (v.cin - v.cout), 0);

  // Reconcile unbooked operational adjustments so opening balance always matches starting cash
  const driftDirty = BigInt(p.dirty || "0") - (startingDirty + BigInt(net_dirty));
  if (driftDirty !== 0n) {
    const diff = Number(driftDirty);
    const cat = cats["Street Operations"] || (cats["Street Operations"] = { din: 0, dout: 0, cin: 0, cout: 0 });
    if (diff > 0) cat.din += diff; else cat.dout += -diff;
    net_dirty += diff;
  }

  const driftClean = BigInt(p.clean || "0") - (startingClean + BigInt(net_clean));
  if (driftClean !== 0n) {
    const diff = Number(driftClean);
    const cat = cats["Street Operations"] || (cats["Street Operations"] = { din: 0, dout: 0, cin: 0, cout: 0 });
    if (diff > 0) cat.cin += diff; else cat.cout += -diff;
    net_clean += diff;
  }

  const rows = Object.entries(cats).map(([category, v]) => ({ category, ...v, net_dirty: v.din - v.dout, net_clean: v.cin - v.cout })).sort((a, b) => Math.abs(b.net_dirty) + Math.abs(b.net_clean) - (Math.abs(a.net_dirty) + Math.abs(a.net_clean)));

  return {
    days: LEDGER_DAYS,
    rows,
    net_dirty,
    net_clean,
    dirty_now: p.dirty,
    clean_now: p.clean,
    opening_dirty: startingDirty.toString(),
    opening_clean: startingClean.toString(),
  };
}

export const uid = () =>
  (typeof window !== "undefined" && window.crypto?.randomUUID
    ? window.crypto.randomUUID()
    : `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}` // v9 fix: fallback ids no longer collide within the same second
  ).replace(/[^a-z0-9]/gi, "").slice(0, 10);
const weekKey = (t: number) => {
  const d = new Date(t * 1000);
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
};
const seasonKey = (t: number) => new Date(t * 1000).toISOString().slice(0, 7);

export function randomLook(seedStr?: string) {
  const hash = (seedStr || uid()).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pick = (arr: any[], offset = 0) => arr[(hash + offset) % arr.length];
  const gender = pick(AVATAR_OPTIONS.gender, 1);
  return {
    gender,
    skin: pick(AVATAR_OPTIONS.skin, 2),
    hair: pick(AVATAR_OPTIONS.hair, 3),
    hair_color: pick(AVATAR_OPTIONS.hair_color, 4),
    build: pick(AVATAR_OPTIONS.build, 5),
    height: pick(AVATAR_OPTIONS.height, 6),
    face: pick(AVATAR_OPTIONS.face, 7),
    nose: pick(AVATAR_OPTIONS.nose, 8),
    brows: pick(AVATAR_OPTIONS.brows, 9),
    ears: pick(AVATAR_OPTIONS.ears, 10),
    marks: pick(AVATAR_OPTIONS.marks, 11),
    glasses: pick(AVATAR_OPTIONS.glasses, 12),
    beard: gender === "female" ? "none" : pick(AVATAR_OPTIONS.beard, 13),
  };
}

export function spawnAreaDon(defeatedCount = 0) {
  const name = AREA_DON_NAMES[defeatedCount % AREA_DON_NAMES.length] || `Don of Zone ${defeatedCount + 1}`;
  const archIndex = Math.floor(Math.random() * AREA_DON_ARCHETYPES.length);
  const tacticIndex = Math.floor(Math.random() * AREA_DON_TACTICS.length);
  const archetype = AREA_DON_ARCHETYPES[archIndex];
  const tactic = AREA_DON_TACTICS[tacticIndex];

  // Heavy boss difficulty scaling
  const baseHp = 4500 + defeatedCount * 2500;
  const defense = 120 + defeatedCount * 50;
  const power = 250 + defeatedCount * 120;
  // Reward to be dirty and max should be 20000
  const bounty = Math.min(20000, 10000 + defeatedCount * 2500);

  return {
    id: `area_don_${Date.now()}_${defeatedCount}`,
    name,
    archetypeId: archetype.id,
    tacticId: tactic.id,
    archetypeName: archetype.name,
    tacticName: tactic.name,
    archetypeDesc: archetype.desc,
    tacticDesc: tactic.desc,
    power,
    defense,
    hp: baseHp,
    maxHp: baseHp,
    bounty,
    rewardType: "dirty",
    next_attack_at: 0,
    defeatedCount,
    spawnedAt: Math.floor(Date.now() / 1000),
    log: [`${name} seized street dominance as ${archetype.name} utilizing ${tactic.name}!`],
  };
}

export function rollSusuSurge(now: number, perks: string[] = []) {
  const isTwoPlots = Math.random() < 0.10;
  const plot1 = Math.floor(Math.random() * 8);
  const plot2 = (plot1 + Math.floor(Math.random() * 7) + 1) % 8;
  const targetPlots = isTwoPlots ? [plot1, plot2] : [plot1];

  let durationMins = Math.floor(Math.random() * 31) + 15; // 15 to 45 mins
  if (perks.includes("susu_ring")) {
    durationMins += 15; // Susu Collector Ring grants +15m
  }
  const durationSecs = durationMins * 60;

  const multiplier = Number((Math.random() * 3.0 + 2.0).toFixed(2)); // 2.0x to 5.0x

  const variantRoll = Math.random();
  const variant: "Night Market Sweep" | "Lorry Park Rush" | "Taskforce Raid" =
    variantRoll < 0.4
      ? "Night Market Sweep"
      : variantRoll < 0.75
      ? "Lorry Park Rush"
      : "Taskforce Raid";

  return {
    id: `susu_${Math.floor(now)}`,
    targetPlots,
    duration: durationSecs,
    multiplier,
    variant,
    start: Math.floor(now),
    end: Math.floor(now + durationSecs),
  };
}

export function calcCrewDailyRate(c: {
  lvl: number;
  stats?: Record<string, number>;
  base_stats?: Record<string, number>;
  xp?: number;
  front_trait?: string;
  strength?: string;
  arch?: string;
  traits?: string[];
  daily_rate?: number;
  stats_locked?: boolean;
}): number {
  if (c.daily_rate && typeof c.daily_rate === "number" && c.daily_rate > 0) {
    return c.daily_rate;
  }
  const rawBase = c.base_stats || c.stats || {};
  const bMus = Math.max(1, Number(rawBase.muscle) || 8);
  const bWhl = Math.max(1, Number(rawBase.wheels) || 8);
  const bBrn = Math.max(1, Number(rawBase.brains) || 8);
  const bStl = Math.max(1, Number(rawBase.stealth) || 8);
  const totalBase = bMus + bWhl + bBrn + bStl;

  const clampedTotal = Math.max(18, Math.min(68, totalBase));
  let rate = 150 + Math.round(((clampedTotal - 18) / 50) * 350);

  if (c.traits && c.traits.includes("greedy_eyes")) {
    rate += 20;
  }

  return Math.max(150, Math.min(1000, Math.round(rate)));
}

export function syncCrewProgression(c: CrewMember) {
  const lvl = c.lvl || 1;
  // Rank 5 first opens, Rank 18 next opens, Rank 30 last opens
  c.unlocked_traits = (c.traits || []).filter((_, idx) => {
    const req = idx === 0 ? 5 : idx === 1 ? 18 : 30;
    return lvl >= req;
  });
  // Rule: Crew Level MUST NOT change base stats, hire cost, or salary!
  if (!c.daily_rate) {
    c.daily_rate = calcCrewDailyRate(c);
  }
}

export function generateRandomCrewLoadout(lvl = 1): {
  loadout: Record<string, string>;
  initial_gear: Array<{ uid: string; id: string; slot: string; source: string; lvl?: number }>;
} {
  const possibleSlots: Array<"melee" | "primary" | "secondary" | "hat" | "top" | "bottom" | "shoes"> = [
    "melee", "primary", "secondary", "hat", "top", "bottom", "shoes"
  ];
  // Recruited crew randomly have 1 to 4 slots filled with pre-equipped items
  const numSlots = Math.floor(Math.random() * 4) + 1;
  const shuffledSlots = [...possibleSlots].sort(() => Math.random() - 0.5).slice(0, numSlots);

  const loadout: Record<string, string> = {};
  const initial_gear: Array<{ uid: string; id: string; slot: string; source: string; lvl?: number }> = [];

  shuffledSlots.forEach((slot) => {
    const matchingItems = GEAR.filter((g) => g.slot === slot && (g.unlock || 1) <= lvl + 2);
    const pool = matchingItems.length > 0 ? matchingItems : GEAR.filter((g) => g.slot === slot);
    if (pool.length > 0) {
      const picked = pool[Math.floor(Math.random() * pool.length)];
      const itemUid = uid();
      loadout[slot] = itemUid;
      initial_gear.push({
        uid: itemUid,
        id: picked.id,
        slot,
        source: "crew_recruit",
        lvl: 0,
      });
    }
  });

  return { loadout, initial_gear };
}

export function genCrew(arch?: string, level = 1, giveGear = true): CrewMember {
  const archKeys = Object.keys(ARCHETYPES);
  const pickedArch = arch || archKeys[Math.floor(Math.random() * archKeys.length)];

  // Tiered Recruitment probabilities:
  // Tier 1 "Corner Runner" (0.55): Low roll band
  // Tier 2 "Lorry Park Enforcer" (0.28): Mid roll band
  // Tier 3 "Wharf Specialist" (0.10): High roll band
  // Tier 4 "Zongo Heavyweight" (0.07): Elite near-max roll band
  const roll = Math.random();
  let rTier = CREW_RECRUIT_TIERS[0];
  let acc = 0;
  for (const t of CREW_RECRUIT_TIERS) {
    acc += t.probability;
    if (roll <= acc) {
      rTier = t;
      break;
    }
  }

  const sMin = rTier.statMin;
  const sMax = rTier.statMax;
  const stats: Record<string, number> = {
    brains: Math.floor(Math.random() * (sMax - sMin + 1)) + sMin,
    wheels: Math.floor(Math.random() * (sMax - sMin + 1)) + sMin,
    muscle: Math.floor(Math.random() * (sMax - sMin + 1)) + sMin,
    stealth: Math.floor(Math.random() * (sMax - sMin + 1)) + sMin,
  };
  const primaryStat = ARCHETYPES[pickedArch];
  stats[primaryStat] = Math.min(25, Math.floor(stats[primaryStat] * 1.25) + 1);

  const totalBase = stats.brains + stats.wheels + stats.muscle + stats.stealth;
  // Upfront Hire Cost and ongoing Salary derive strictly from rolled base stats
  const hireCost = totalBase * rTier.hireMultiplier;
  const dailyRate = totalBase * rTier.salaryMultiplier;

  const strength = STRENGTHS[Math.floor(Math.random() * STRENGTHS.length)].id;
  const flaw = FLAWS[Math.floor(Math.random() * FLAWS.length)].id;
  const matchingBgs = CREW_BACKGROUNDS.filter((b) => b.arch === pickedArch);
  const bg = matchingBgs.length > 0
    ? matchingBgs[Math.floor(Math.random() * matchingBgs.length)]
    : CREW_BACKGROUNDS[Math.floor(Math.random() * CREW_BACKGROUNDS.length)];
  const look = randomLook();
  const first = look.gender === "female"
    ? FEMALE_NAMES[Math.floor(Math.random() * FEMALE_NAMES.length)]
    : FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const nick = NICKNAMES[Math.floor(Math.random() * NICKNAMES.length)];

  // Randomized traits system: 3 traits (Rank 5 opens 1st, Rank 18 opens 2nd, Rank 30 opens 3rd)
  const goodPool = CREW_TRAITS.filter((t) => t.type === "good").sort(() => Math.random() - 0.5);
  const badPool = CREW_TRAITS.filter((t) => t.type === "bad").sort(() => Math.random() - 0.5);
  const pickedTraits = [goodPool[0]?.id, badPool[0]?.id, goodPool[1]?.id].filter(Boolean);
  const unlocked_traits = pickedTraits.filter((_, idx) => {
    const req = idx === 0 ? 5 : idx === 1 ? 18 : 30;
    return level >= req;
  });

  const member: CrewMember = {
    id: uid(),
    name: `${first} '${nick}'`,
    arch: pickedArch,
    stats,
    base_stats: { ...stats },
    recruit_tier: rTier.tier,
    tier_name: rTier.name,
    hire_cost: hireCost,
    stats_locked: true,
    strength,
    flaw,
    front_trait: bg.trait,
    traits: pickedTraits,
    unlocked_traits,
    origin: bg.origin,
    bio: bg.bio,
    temperament: bg.temperament,
    specialty_biz: bg.specialty_biz,
    trait_reason: bg.trait_reason,
    morale: 85,
    xp: 0,
    lvl: level,
    assign: null,
    look,
    loadout: {},
    daily_rate: dailyRate,
  };

  if (giveGear) {
    const { loadout, initial_gear } = generateRandomCrewLoadout(level);
    member.loadout = loadout;
    member.initial_gear = initial_gear;
  }

  return member;
}

export function grantGear(p: Player, id: string, source = "shop", tier2?: string | null): { uid: string; id: string; lvl: number; tier2?: string | null } {
  const g: any = { uid: uid(), id, source, lvl: 0 };
  if (tier2) g.tier2 = tier2;
  p.gear.push(g);
  return g;
}

export function createPlayer(
  userId = "boss_offline_1",
  name = "Kofi Bullet",
  district = "dockside",
  preset: "newbie" | "mid" | "kingpin" = "newbie"
): Player {
  const now = Date.now() / 1000;
  const p: Player = {
    user_id: userId,
    name: name.slice(0, 24),
    district,
    created: now,
    last_seen: now,
    version: SAVE_VERSION,
    age_confirmed: true,
    is_bot: false,
    // v9 economy: assets cost clean cash, so every boss starts with enough clean for the first plot build
    dirty: preset === "kingpin" ? "50000000" : preset === "mid" ? "4500" : "0",
    clean: preset === "kingpin" ? "100000000" : preset === "mid" ? "50000" : "0",
    lifetime: preset === "kingpin" ? "150000000" : preset === "mid" ? "15000" : "0",
    assassin_hits: {},
    xp: 0,
    level: preset === "kingpin" ? 100 : preset === "mid" ? 12 : 0,
    heat: 0,
    heat_ts: now,
    arrested_until: 0,
    lie_low_until: 0,
    shield_until: 0,
    newbie_until: now + 72 * H,
    // v9 LAND: a new boss owns no land and no hustle; the first business is a free claim
    hustles: {
      ...(preset !== "newbie" ? { okada: { lvl: preset === "kingpin" ? 25 : 10, ts: now } } : {}),
      ...(preset !== "newbie" ? { phones: { lvl: preset === "kingpin" ? 20 : 8, ts: now } } : {}),
      ...(preset !== "newbie" ? { jerseys: { lvl: preset === "kingpin" ? 15 : 5, ts: now } } : {}),
      ...(preset === "kingpin" ? { fuel: { lvl: 12, ts: now }, container: { lvl: 8, ts: now } } : {}),
    },
    fronts: {
      ...(preset !== "newbie" ? { chopbar: preset === "kingpin" ? 8 : 4 } : {}),
      ...(preset !== "newbie" ? { spare: preset === "kingpin" ? 6 : 2 } : {}),
      ...(preset === "kingpin" ? { momo: 5, trotro: 3 } : {}),
    },
    batches: [],
    build_slots: preset === "kingpin" ? 2 : preset === "mid" ? 1 : 0,
    crew: [],
    heists: [],
    upgrades: {
      vault: preset === "kingpin" ? 6 : preset === "mid" ? 2 : 0,
      walls: preset === "kingpin" ? 8 : preset === "mid" ? 3 : 0,
      safehouse: preset === "kingpin" ? 1 : 0,
      studio: preset === "kingpin" ? 5 : preset === "mid" ? 2 : 0,
      okada: preset === "kingpin" ? 4 : preset === "mid" ? 1 : 0,
      trotro: preset === "kingpin" ? 5 : preset === "mid" ? 2 : 0,
      quarters: preset === "kingpin" ? 3 : preset === "mid" ? 1 : 0,
      cruiser: preset === "kingpin" ? 5 : preset === "mid" ? 1 : 0,
    },
    inv: preset === "newbie" ? {} : {
      burner: preset === "kingpin" ? 5 : 2,
      timeskip: preset === "kingpin" ? 8 : 3,
      lawyer: preset === "kingpin" ? 2 : 1,
      envelope: preset === "kingpin" ? 3 : 0,
      vest: preset === "kingpin" ? 4 : 0,
      cctv: preset === "kingpin" ? 2 : 0,
      spikes: preset === "kingpin" ? 3 : 0,
      dog: preset === "kingpin" ? 1 : 0,
      energy: preset === "kingpin" ? 5 : 1,
      feast: preset === "kingpin" ? 3 : 0,
      donation: preset === "kingpin" ? 2 : 0,
      radio: 0,
      goggles: 0,
      scanner: 0,
      blueprints: 0,
      lockpick: 0,
      plates: 0,
      okada_key: 0,
      receipt: 0,
    },
    cosmetics: preset === "kingpin" ? ["drip_kente", "car_benz", "decor_art"] : [],
    equipped: {
      drip: preset === "kingpin" ? "drip_kente" : null,
      car: preset === "kingpin" ? "car_benz" : null,
      decor: preset === "kingpin" ? "decor_art" : null,
    },
    raid: null,
    raid_log: [],
    smuggler_shipments: [],
    luxury: {},
    grudges: Object.fromEntries(RIVALS.map((r) => [r.id, 0])),
    rival_relations: Object.fromEntries(RIVALS.map((r) => [r.id, 50])),
    rival_launder_caps: Object.fromEntries(RIVALS.map((r) => [r.id, rollRivalLaunderCap()])),
    rival_launder_day: { day: dayKey(now), active_syndicates: pickDailyLaunderRivals(RIVALS.map((r) => r.id), 3), used: {} },
    rival_cd: {},
    store: { slot: 0, offset: 0, bought: [] },
    ads: { day: dayKey(now), double: false, restock: false },
    daily: {
      day: dayKey(now),
      contracts: generateDailyContracts(name, dayKey(now), preset === "kingpin" ? 25 : preset === "mid" ? 12 : 1),
      login_claimed: false,
    },
    streak: { count: preset === "kingpin" ? 14 : preset === "mid" ? 5 : 1, last_day: dayKey(now), grace_used: false },
    prestige: { count: preset === "kingpin" ? 2 : 0, respect: preset === "kingpin" ? 2 : 0 },
    pass: { season: seasonKey(now), xp: preset === "kingpin" ? 1400 : 150, premium: preset === "kingpin", free: [], prem: [] },
    season: { id: seasonKey(now), points: preset === "kingpin" ? 3500 : 400 },
    lawyer_week: { week: weekKey(now), count: 0 },
    tap_ts: now,
    pvp_cd: 0,
    ledger_done: [],
    offline_bonus: null,
    flags: 0,
    log: [
      { t: now, msg: `Welcome to the streets of Accra, Boss ${name}. Empire initialized!`, kind: "good" },
    ],
    nw_score: 50,
    power: 0,
    avatar: { ...DEFAULT_AVATAR },
    loadout: {},
    gear: [],
    reward_cosmetics: [],
    farm: {
      plots: preset === "newbie" ? [] : [
        { idx: 0, strain: null, planted: 0, end: 0, yield: 0 },
        { idx: 1, strain: null, planted: 0, end: 0, yield: 0 },
        ...(preset === "kingpin"
          ? [
              { idx: 2, strain: null, planted: 0, end: 0, yield: 0 },
              { idx: 3, strain: null, planted: 0, end: 0, yield: 0 },
            ]
          : []),
      ],
      stash: {},
      up: { lights: preset === "kingpin" ? 2 : 0, irrigation: preset === "kingpin" ? 2 : 0, greenhouse: preset === "kingpin" ? 1 : 0 },
    },
    last_heist_day: "",
    heist_day: { day: dayKey(now), count: 0, ad_extra: 0 },
    facilities: {
      infirmary: preset === "kingpin" ? 3 : preset === "mid" ? 1 : 0,
      armoury: preset === "kingpin" ? 4 : preset === "mid" ? 1 : 0,
      radio_tower: preset === "kingpin" ? 2 : 0,
      barracks: preset === "kingpin" ? 3 : preset === "mid" ? 1 : 0,
      generator: preset === "kingpin" ? 2 : 0,
      vault: preset === "kingpin" ? 3 : preset === "mid" ? 1 : 0,
      walls: preset === "kingpin" ? 4 : preset === "mid" ? 1 : 0,
    },
    facility_condition: {
      infirmary: 100,
      armoury: 100,
      radio_tower: 100,
      barracks: 100,
      generator: 100,
      vault: 100,
      walls: 100,
    },
    facility_assign: {},
    last_facility_decay: now,
    boss_perks: {
      negotiator: preset === "kingpin" ? 3 : 0,
      street_king: preset === "kingpin" ? 3 : 0,
      iron_jaw: preset === "kingpin" ? 2 : 0,
      ghost: preset === "kingpin" ? 2 : 0,
      commander: preset === "kingpin" ? 2 : 0,
    },
    boss_stats: {
      brains: preset === "kingpin" ? 35 : preset === "mid" ? 18 : 6,
      wheels: preset === "kingpin" ? 35 : preset === "mid" ? 18 : 6,
      muscle: preset === "kingpin" ? 40 : preset === "mid" ? 20 : 8,
      stealth: preset === "kingpin" ? 30 : preset === "mid" ? 15 : 6,
    },
    crew_crisis: null,
    crew_crisis_cooldown: 0,
    skill_points: preset === "kingpin" ? 10 : preset === "mid" ? 5 : 0,
    front_assign: {},
    hustle_assign: {},
    hustle_managers: {},
    plot_hustle_managers: {},
    pending_deliveries: [],
    active_consumable_buffs: [],
    cash_statement: [],
    last_lie_low_day: "",
    archrival_event: null,
    betting: {
      history: [],
      stats: {
        total_bets: 0,
        total_won: 0,
        total_lost: 0,
        total_staked_clean: 0,
        total_staked_dirty: 0,
        total_clean_paid_out: 0,
        total_fees_collected: 0,
        current_streak: 0,
        best_win: 0,
      },
        operator: {
          level: 1,
          reputation: 0,
          max_stake: BETTING_CONFIG.max_stake_base,
        },
      },
      workshop: {
        benches: preset === "newbie" ? [] : [{ weaponId: null, start: 0, end: 0 }],
        up: { tools: 0, foundry: 0 },
      },
      music_studio: {
        booths: preset === "newbie" ? [] : [{ trackId: null, start: 0, end: 0 }],
        up: { acoustics: 0, mixing: 0 },
      },
      methlab: {
        benches: preset === "newbie" ? [{ productId: null, start: 0, end: 0, yield: 0 }] : [{ productId: null, start: 0, end: 0, yield: 0 }, { productId: null, start: 0, end: 0, yield: 0 }],
        stash: {},
        up: { cook_speed: 0, chem_yield: 0, purity_bonus: 0 },
      },
      mining: {
        rigs: preset === "newbie" ? [{ mineralId: null, start: 0, end: 0, yield: 0 }] : [{ mineralId: null, start: 0, end: 0, yield: 0 }, { mineralId: null, start: 0, end: 0, yield: 0 }],
        stash: {},
        up: { excavator_speed: 0, sluice_yield: 0, smelter_purity: 0 },
      },
      area_don: spawnAreaDon(0),
      susu_surge: null,
      susu_last_roll: now,
      big_man_perks: [],
      commodities_held: {},
      turf_control: {
        jamestown_wharf: 20,
        alajo_scrap: 15,
        nima_highway: 10,
        osu_strip: 25,
        tema_port: 10,
      },
      last_turf_decay: now,
    };

  // Grant starting gear
  const cutlass = grantGear(p, "w_cutlass", "reward");
  const shirt = grantGear(p, "c_flower_shirt", "reward");
  const cargo = grantGear(p, "c_cargo", "reward");
  p.loadout.melee = cutlass.uid;
  p.loadout.top = shirt.uid;
  p.loadout.bottom = cargo.uid;

  if (preset === "kingpin") {
    const goldAr = grantGear(p, "w_gold_ar", "reward");
    const desertHawk = grantGear(p, "w_hawk", "reward");
    p.loadout.primary = goldAr.uid;
    p.loadout.secondary = desertHawk.uid;
  }

  // Register pre-equipped items on starting crew members into player inventory
  p.crew.forEach((c) => {
    if (c.initial_gear && c.initial_gear.length > 0) {
      c.initial_gear.forEach((ig) => {
        if (!p.gear.some((g) => g.uid === ig.uid)) {
          p.gear.push({
            uid: ig.uid,
            id: ig.id,
            source: "crew_recruit",
            lvl: ig.lvl || 0,
          });
        }
      });
    }
  });

  // v9 LAND: newbie owns no land (free first-business claim pending); presets get land for their hustles
  (p as any).first_business_claimed = Object.keys(p.hustles || {}).length > 0;
  p.player_plots = INITIAL_PLAYER_PLOTS.map((x) => ({ ...x }));
  ensurePlots(p);

  // Auto-complete finished construction on land plots
  (p.player_plots || []).forEach((pl) => {
    if (pl.building && now >= pl.building.end) {
      const hid = pl.building.hid;
      const h = HUSTLE_MAP[hid];
      pl.hustleID = hid;
      (pl.building.crew_ids || []).forEach((cid: string) => {
        const c = p.crew.find((x) => x.id === cid);
        if (c && c.assign === `build:plot_${pl.plotID}`) c.assign = null;
      });
      pl.building = null;
      if (!p.hustles[hid]) p.hustles[hid] = { lvl: 1, ts: now, bank: 0 };
      if (!p.hustle_condition) p.hustle_condition = {};
      p.hustle_condition[hid] = 100;
      p.xp = (p.xp || 0) + 10;
      p.log.unshift({
        t: now,
        msg: `Construction complete! ${h?.name || hid} is operational on Land plot ${pl.plotID + 1}.`,
        kind: "good",
      });
    }
  });
  p.power = calcPower(p);
  return p;
}

export function generateDailyContracts(userId: string, day: string, level: number) {
  const hash = (userId + day).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const shuffled = [...CONTRACT_TYPES].sort((a, b) => ((hash + a.type.length) % 7) - ((hash + b.type.length) % 7));
  const picks = shuffled.slice(0, 3);
  const targets: Record<string, number> = {
    collect: Math.max(15, 30 * level),
    launder: 2,
    heist: 1,
    tap: 40,
    hit: 1,
    upgrade: 1,
  };
  const list = picks.map((c, i) => {
    const t = targets[c.type] || 1;
    return {
      idx: i,
      type: c.type,
      label: c.label.replace("{t}", t.toLocaleString()),
      target: t,
      progress: 0,
      claimed: false,
      reward_clean: 5 * level + 15,
      reward_pass: 40,
    };
  });
  // v9 late game: one elite contract per day from level 20
  if (level >= ELITE_MIN_LEVEL) {
    const e = ELITE_CONTRACTS[hash % ELITE_CONTRACTS.length];
    const t = e.type === "elite_launder" ? (level >= 30 ? 50_000_000 : 5_000_000) : 1;
    list.push({ idx: list.length, type: e.type, label: e.label.replace("{t}", t.toLocaleString()), target: t, progress: 0, claimed: false, reward_clean: 200 * level, reward_pass: 150, elite: true } as any);
  }
  return list;
}

// ==========================================
// v9: LUXURY BOUTIQUE — owned assets + collection sets → gameplay effects (read in one place)
// ==========================================
export function luxuryOwnedIds(p: Player): string[] {
  return Object.keys((p as any).luxury || {}).filter((id) => LUXURY_MAP[id]);
}
export function luxurySetProgress(p: Player) {
  const owned = luxuryOwnedIds(p);
  return LUXURY_SETS.map((st) => {
    const count = owned.filter((id) => LUXURY_MAP[id].set === st.id).length;
    const total = LUXURY_CATALOG.filter((i) => i.set === st.id).length;
    const active = st.tiers.filter((t) => count >= t.need);
    const next = st.tiers.find((t) => count < t.need) || null;
    return { id: st.id, name: st.name, icon: st.icon, desc: st.desc, count, total, tiers: st.tiers, active: active.length, next };
  });
}
export function luxuryEffects(p: Player): Required<LuxuryEffects> {
  const e: Required<LuxuryEffects> = { income: 0, launder: 0, heat: 0, power: 0, intimidation: 0, loyalty: 0, influence: 0 };
  const add = (x: LuxuryEffects) => (Object.keys(x) as (keyof LuxuryEffects)[]).forEach((k) => (e[k] += x[k] || 0));
  luxuryOwnedIds(p).forEach((id) => add(LUXURY_MAP[id].effects));
  luxurySetProgress(p).forEach((sp) => sp.tiers.filter((t) => sp.count >= t.need).forEach((t) => add(t.effects)));
  (Object.keys(e) as (keyof LuxuryEffects)[]).forEach((k) => (e[k] = Math.round(Math.min(e[k], LUXURY_CAPS[k]) * 100) / 100));
  return e;
}
/** Heat gained after luxury heat reduction (scramblers, jets, etc.) and consumable buffs. */
export function heatGain(p: Player, amount: number): number {
  const buffs = aggregateBuffs(p);
  const luxuryRed = luxuryEffects(p).heat / 100;
  const consumableRed = buffs.heat_reduction_pct || 0;
  let red = Math.min(0.9, luxuryRed + consumableRed);
  if (p.boss_perks?.ghost) {
    red = Math.min(0.95, red + p.boss_perks.ghost * 0.15);
  }
  return Math.round(amount * (1 - red) * cityMods(p).heat * 100) / 100; // v9: city event (Heat Wave ×2)
}

/** Aggregates all active temporal buffs from consumables. */
export function aggregateBuffs(p: Player) {
  const now = Date.now() / 1000;
  const buffs: any = {};
  (p.active_consumable_buffs || []).forEach(b => {
    if (b.expires_at > now) {
      Object.entries(b.buff || {}).forEach(([k, v]) => {
        if (typeof v === 'number') {
          buffs[k] = (buffs[k] || 0) + v;
        }
      });
    }
  });
  return buffs;
}
let LUX_SHIFT = 0; // Test Tools "refresh boutique stock": shifts the rotation index (always 0 in release builds)
function syncTestShift(p: Player) { if (ENGINE_TEST_TOOLS) LUX_SHIFT = Number((p as any)?.test_lux_shift) || 0; }
export function luxuryRotation(now: number) {
  const base = Math.floor(now / (LUXURY_ROTATION_HOURS * 3600));
  const idx = base + LUX_SHIFT;
  const limited = LUXURY_CATALOG.filter((i) => i.limited);
  const pool = [...limited];
  const ids: string[] = [];
  let seed = (idx * 2654435761) >>> 0;
  for (let k = 0; k < LUXURY_ROTATION_SIZE && pool.length; k++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    ids.push(pool.splice(seed % pool.length, 1)[0].id);
  }
  const regular = LUXURY_CATALOG.filter((i) => !i.limited && !i.prestige);
  seed = (seed * 1103515245 + 12345) >>> 0;
  const deal = regular[seed % regular.length].id;
  return { idx, ids, deal, ends: (base + 1) * LUXURY_ROTATION_HOURS * 3600 };
}
export function luxuryPrice(id: string, now: number): number {
  const it = LUXURY_MAP[id];
  if (!it) return 0;
  return luxuryRotation(now).deal === id ? Math.round(it.price * (1 - LUXURY_DEAL_DISCOUNT)) : it.price;
}

export function mult(p: Player, now: number) {
  if (p.arrested_until && now < p.arrested_until) return 0;
  let m = 1 + (p.prestige?.respect || 0) * 0.1;
  m *= 1 + (p.upgrades?.studio || 0) * 0.05;
  if (p.lie_low_until > now) m *= 0.5;
  m *= 1 + luxuryEffects(p).income / 100; // v9 boutique
  m *= cityMods(p).income; // v9: city event (Street Festival)
  if (p.boss_perks?.street_king) {
    m *= 1 + p.boss_perks.street_king * 0.12;
  }
  return m;
}

export function getHustleMarketRate(
  h: { id?: string; income: number; min_income?: number; max_income?: number },
  _now = Date.now() / 1000
): number {
  // Stable deterministic rate without randomizer
  return Math.max(1, h.income);
}


// ==========================================
// v9: CONDITION / WEAR HELPERS (shared by facilities, hustles, fronts)
// ==========================================
export type ConditionTier = "pristine" | "operational" | "worn" | "critical";
export function conditionTier(c: number): ConditionTier {
  if (c >= CONDITION_THRESHOLDS.pristine) return "pristine";
  if (c >= CONDITION_THRESHOLDS.operational) return "operational";
  if (c >= CONDITION_THRESHOLDS.worn) return "worn";
  return "critical";
}
/** Output multiplier for a condition: Pristine 1.15, Operational 1.0, Worn 0.5, Critical 0 (shut down). */
export function conditionMult(c: number): number {
  return CONDITION_MULTIPLIERS[conditionTier(c)];
}
/** Like conditionMult but without the Pristine bonus (used where a bonus would break an exact value, e.g. the vault +5,000/level). */
export function conditionPenalty(c: number): number {
  return Math.min(1, conditionMult(c));
}
const round2 = (n: number) => Math.round(n * 100) / 100;
export function facilityCond(p: Player, fid: string): number {
  return p.facility_condition?.[fid] ?? 100;
}
export function hustleCond(p: Player, hid: string, plotIndex?: number): number {
  if (plotIndex !== undefined && p.player_plots?.[plotIndex]) {
    const pl = p.player_plots[plotIndex];
    if (pl.condition !== undefined) return pl.condition;
  }
  return p.hustle_condition?.[hid] ?? 100;
}
export function frontCond(p: Player, fid: string): number {
  return p.front_condition?.[fid] ?? 100;
}
/** Facility perk strength: built and not Critical → mult; unbuilt → 0. */
export function facilityPerk(p: Player, fid: string): number {
  if ((p.facilities?.[fid] || 0) < 1) return 0;
  return conditionMult(facilityCond(p, fid));
}

// ---- v9: injuries & medical ----
export const INJURY_SEV: Record<number, { name: string; need: number }> = {
  1: { name: "Minor", need: 1800 },     // 30 min of clinic care
  2: { name: "Serious", need: 7200 },   // 2 h
  3: { name: "Critical", need: 21600 }, // 6 h
};
export const REST_RATE = 0.25; // crew waiting outside the clinic heal at 25% speed
export function crewOut(c: CrewMember) { return c.status === "kidnapped" || !!c.injury; }
export function assertFit(c: CrewMember) {
  if (c.status === "kidnapped") throw new Error(`${c.name} is kidnapped`);
  if (c.injury) throw new Error(`${c.name} is injured (${INJURY_SEV[c.injury.sev]?.name || "hurt"}) and can't work or fight until healed`);
}
export function unassignEverywhere(p: Player, cid: string) {
  Object.keys(p.front_assign || {}).forEach((fid) => { if (p.front_assign[fid] === cid) delete p.front_assign[fid]; });
  Object.keys(p.hustle_assign || {}).forEach((hid) => { if (p.hustle_assign[hid] === cid) delete p.hustle_assign[hid]; });
  Object.keys(p.hustle_managers || {}).forEach((hid) => {
    p.hustle_managers![hid] = (p.hustle_managers![hid] || []).filter((x) => x !== cid);
    if (p.hustle_managers![hid][0]) p.hustle_assign![hid] = p.hustle_managers![hid][0];
  });
  Object.keys(p.facility_assign || {}).forEach((fid) => { p.facility_assign![fid] = (p.facility_assign![fid] || []).filter((x) => x !== cid); });
}
// ==========================================
// v9 RIVAL-TRIGGERED EVENTS. Rivals (and the arch rival = the crew that hates you most) hit you on their own,
// on a 30-minute timer whose odds rise with their hate (grudge), your heat and your respect.
// A live event opens the crisis popup (Snitch / Ignore / Attack). Events that land while you are away play out as
// "Ignore" and are listed in a "While you were away" summary. Every event is logged.
// ==========================================
export interface RivalEventLogEntry {
  id: string; t: number; rival_id: string; rival: string; arch: boolean; type: string; title: string;
  choice: string | null; offline: boolean; resolved_t?: number;
  outcome?: { dirty: number; clean: number; respect: number; heat: number; injuries: string[]; won?: boolean; note?: string };
}
export const RIVAL_EVENT_SLOT = 1800;
export const RIVAL_EVENT_MAX_OFFLINE = 4;
export const RIVAL_EVENT_TYPES: Record<string, { label: string; title: (r: string, x: string) => string; desc: (r: string, x: string) => string }> = {
  hustle_attack: { label: "Attack on your hustle", title: (r) => `${r.toUpperCase()} HIT YOUR HUSTLE`, desc: (r, x) => `${r} gunmen rolled up on your ${x} and are smashing the stock. Ignore it and the business takes damage and the till is emptied.` },
  turf_raid: { label: "Turf raid", title: (r) => `${r.toUpperCase()} RAID YOUR LAND`, desc: (r, x) => `${r} are raiding your land at ${x}. Ignore it and they take dirty cash and someone gets hurt.` },
  robbery: { label: "Robbery", title: (r) => `ROBBERY: ${r.toUpperCase()}`, desc: (r) => `${r} stuck up your runner on the way to the stash house. Ignore it and the dirty cash is gone.` },
  sabotage: { label: "Sabotage", title: (r) => `SABOTAGE BY ${r.toUpperCase()}`, desc: (r, x) => `${r} cut the power and wrecked equipment at your ${x}. Ignore it and it runs badly until repaired.` },
  threat: { label: "Threat", title: (r) => `${r.toUpperCase()} SENT A THREAT`, desc: (r) => `${r} left a message on your door: pay respect or bleed. Ignore it and the street thinks you are soft.` },
  poach: { label: "Crew poaching", title: (r, x) => `${r.toUpperCase()} POACHING ${x.toUpperCase()}`, desc: (r, x) => `${r} offered ${x} double pay to switch sides. Ignore it and ${x} walks.` },
};
export function archRivalId(p: Player): string | null {
  let best: string | null = null, bv = 39;
  RIVALS.forEach((r) => { const g = p.grudges?.[r.id] || 0; if (g > bv) { bv = g; best = r.id; } });
  return best;
}
/** Chance that some rival triggers an event in one 30-minute slot. */
export function rivalEventChance(p: Player) {
  const maxG = Math.max(0, ...RIVALS.map((r) => p.grudges?.[r.id] || 0));
  const resp = Math.min(10, p.prestige?.respect || 0);
  return Math.max(0.02, Math.min(0.25, 0.03 + (maxG / 100) * 0.08 + ((p.heat || 0) / 100) * 0.05 + resp * 0.005));
}
function pickRival(p: Player, rnd: () => number) {
  const w = RIVALS.map((r) => 1 + (p.grudges?.[r.id] || 0));
  let x = rnd() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < RIVALS.length; i++) { x -= w[i]; if (x <= 0) return RIVALS[i]; }
  return RIVALS[RIVALS.length - 1];
}
export function makeRivalEvent(p: Player, now: number, rnd: () => number = Math.random, forceType?: string, forceRival?: string): any {
  const r = (forceRival && RIVALS.find((x) => x.id === forceRival)) || pickRival(p, rnd);
  const hids = Object.keys(p.hustles || {});
  const crew = (p.crew || []).filter((c) => !c.merc && !crewOut(c));
  const fronts = Object.keys((p as any).fronts || {});
  const types = ["robbery", "threat", "turf_raid"];
  if (hids.length) types.push("hustle_attack", "hustle_attack");
  if (hids.length || fronts.length) types.push("sabotage");
  if (crew.length > 1) types.push("poach");
  const type = forceType && RIVAL_EVENT_TYPES[forceType] ? forceType : types[Math.floor(rnd() * types.length)];
  const ev: any = { id: `rev_${Math.floor(now)}_${Math.floor(rnd() * 1e6)}`, type, created_at: now, rival_id: r.id, rival_name: r.name, source: "rival", arch: archRivalId(p) === r.id };
  let x = "";
  if (type === "hustle_attack" || (type === "sabotage" && hids.length && (!fronts.length || rnd() < 0.5))) {
    const hid = hids[Math.floor(rnd() * hids.length)] || "okada";
    ev.hid = hid; x = HUSTLE_MAP[hid]?.name || hid;
  } else if (type === "sabotage") { ev.front = fronts[Math.floor(rnd() * fronts.length)]; x = (FRONT_MAP as any)[ev.front]?.name || ev.front; }
  else if (type === "turf_raid") { const pl = (p.player_plots || []).filter((l) => l.isUnlocked); x = pl.length ? `Land ${pl[Math.floor(rnd() * pl.length)].plotID + 1}` : "your corner"; }
  else if (type === "poach") { const c = [...crew].sort((a, b) => (a.morale ?? 85) - (b.morale ?? 85))[0]; ev.crew_id = c?.id; ev.crew_name = c?.name || "a crew member"; x = ev.crew_name; }
  ev.target = x;
  const T = RIVAL_EVENT_TYPES[type];
  ev.title = (ev.arch ? "ARCH RIVAL: " : "") + T.title(r.name, x);
  ev.label = T.label;
  ev.desc = T.desc(r.name, x);
  return ev;
}
/** "Ignore" outcome for rival-triggered event types (also what happens when you are away). */
export function applyRivalIgnore(p: Player, ev: any, now: number): string {
  const tName = ev.rival_name || "rivals";
  const dirty = BigInt(p.dirty);
  const take = (n: number) => { const lose = BigInt(Math.max(0, Math.min(Number(dirty), Math.floor(n)))); if (lose > 0n) { addCash(p, "dirty", -lose); recordCash(p, now, -Number(lose), "dirty", "Rival events", `${RIVAL_EVENT_TYPES[ev.type]?.label || ev.type} by ${tName}`); } return Number(lose); };
  const injureOne = (sev: number) => { const c = p.crew.filter((x) => !x.merc && !crewOut(x)); if (c.length) injureCrew(p, c[Math.floor(Math.random() * c.length)], sev, `the ${tName} ${ev.type === "turf_raid" ? "raid" : "attack"}`, now); };
  if (!p.hustle_condition) p.hustle_condition = {};
  if (!p.front_condition) p.front_condition = {};
  switch (ev.type) {
    case "hustle_attack": {
      const hid = ev.hid; if (hid && p.hustles[hid]) p.hustle_condition[hid] = Math.max(0, (p.hustle_condition[hid] ?? 100) - 30);
      const l = take(Math.min(Number(dirty) * 0.05, 2000 + p.level * 150));
      return `${ev.target} damaged (−30% condition)${l ? `, −GH₵${l.toLocaleString()} dirty` : ""}`;
    }
    case "turf_raid": { const l = take(Math.max(1000, Number(dirty) * 0.1)); injureOne(1); return `−GH₵${l.toLocaleString()} dirty, crew hurt`; }
    case "robbery": { const l = take(1000 + Number(dirty) * 0.08); return `−GH₵${l.toLocaleString()} dirty`; }
    case "sabotage": {
      if (ev.hid && p.hustles[ev.hid]) p.hustle_condition[ev.hid] = Math.max(0, (p.hustle_condition[ev.hid] ?? 100) - 35);
      else if (ev.front) p.front_condition[ev.front] = Math.max(0, (p.front_condition[ev.front] ?? 100) - 35);
      return `${ev.target} sabotaged (−35% condition)`;
    }
    case "threat": { p.grudges[ev.rival_id] = Math.min(100, (p.grudges[ev.rival_id] || 0) + 10); return `${tName} grudge +10`; }
    case "poach": {
      const c = p.crew.find((x) => x.id === ev.crew_id);
      if (c && p.crew.filter((x) => !x.merc).length > 1) { unassignEverywhere(p, c.id); p.crew = p.crew.filter((x) => x.id !== c.id); p.log.unshift({ t: now, msg: `${c.name} left to join ${tName}.`, kind: "bad" }); return `${c.name} joined ${tName}`; }
      return "nobody left";
    }
  }
  return "";
}
export function logRivalEvent(p: Player, ev: any, now: number, upd: Partial<RivalEventLogEntry>) {
  if (!p.rival_event_log) p.rival_event_log = [];
  let e = p.rival_event_log.find((x) => x.id === ev.id);
  if (!e) {
    e = { id: ev.id, t: ev.created_at || now, rival_id: ev.rival_id || ev.rival1_id || "", rival: ev.rival_name || ev.rival1_name || "", arch: !!ev.arch, type: ev.type, title: ev.title || ev.type, choice: null, offline: false };
    p.rival_event_log.unshift(e);
  }
  Object.assign(e, upd);
  const cut = now - 30 * 86400;
  p.rival_event_log = p.rival_event_log.filter((x) => x.t >= cut).slice(0, 150);
  return e;
}
export function rivalEventTick(p: Player, now: number, rnd: () => number = Math.random) {
  if (!p.rival_ev || !Number.isFinite(p.rival_ev.last)) p.rival_ev = { last: now };
  if (!p.first_business_claimed || (p.level || 1) < 2) { p.rival_ev.last = now; return; }
  const slots = Math.floor((now - p.rival_ev.last) / RIVAL_EVENT_SLOT);
  if (slots <= 0) return;
  const start = p.rival_ev.last;
  p.rival_ev.last += slots * RIVAL_EVENT_SLOT;
  const first = Math.max(0, slots - 48); // look back at most 24 h
  let offline = 0;
  const awayIds: string[] = [];
  for (let i = first; i < slots; i++) {
    const t = start + (i + 1) * RIVAL_EVENT_SLOT;
    if (rnd() >= rivalEventChance(p)) continue;
    const live = i === slots - 1 && now - t < RIVAL_EVENT_SLOT && slots <= 2;
    const ev = makeRivalEvent(p, t, rnd);
    if (live) {
      if (p.archrival_event) continue;
      p.archrival_event = ev;
      logRivalEvent(p, ev, now, {});
      p.log.unshift({ t, msg: `[RIVAL EVENT] ${ev.title}`, kind: "bad" });
    } else {
      if (offline >= RIVAL_EVENT_MAX_OFFLINE) continue;
      offline++;
      const s0 = { d: BigInt(p.dirty), c: BigInt(p.clean), r: p.prestige?.respect || 0, h: p.heat };
      (p as any)._inj = [];
      if (p.prestige) p.prestige.respect = Math.max(0, Math.round(((p.prestige.respect || 0) - 0.1) * 100) / 100);
      const note = applyRivalIgnore(p, ev, t);
      const inj = ((p as any)._inj || []).map((x: any) => `${x.name} (${x.sev_name})`);
      delete (p as any)._inj;
      logRivalEvent(p, ev, now, { choice: "away (ignored)", offline: true, resolved_t: t, outcome: { dirty: Number(BigInt(p.dirty) - s0.d), clean: Number(BigInt(p.clean) - s0.c), respect: Math.round(((p.prestige?.respect || 0) - s0.r) * 100) / 100, heat: Math.round(p.heat - s0.h), injuries: inj, note } });
      awayIds.push(ev.id);
      p.log.unshift({ t, msg: `[WHILE AWAY] ${ev.title}: ${note}`, kind: "bad" });
    }
  }
  if (awayIds.length) {
    const prev = p.away_summary;
    p.away_summary = { from: prev?.from || start, to: now, ids: [...(prev?.ids || []), ...awayIds].slice(-12) };
  }
}

export function injureCrew(p: Player, c: CrewMember, sev: number, src: string, now: number) {
  if (!c || c.merc) return null;
  sev = Math.max(1, Math.min(3, Math.round(sev)));
  if (c.injury) { c.injury.sev = Math.max(c.injury.sev, sev); c.injury.need += Math.floor(INJURY_SEV[sev].need / 2); }
  else c.injury = { sev, need: INJURY_SEV[sev].need, done: 0, at: now, src };
  if (c.assign && !String(c.assign).startsWith("heist:")) c.assign = null; // injured crew can't work
  unassignEverywhere(p, c.id);
  const out = { id: c.id, name: c.name, sev: c.injury.sev, sev_name: INJURY_SEV[c.injury.sev].name };
  ((p as any)._inj ||= []).push(out);
  p.log.unshift({ t: now, msg: `${c.name} was injured (${out.sev_name}) in ${src}. Out of action until healed.`, kind: "bad" });
  return out;
}
export function medicalInfo(p: Player, now: number) {
  const lvl = p.facilities?.infirmary || 0;
  const perk = lvl > 0 ? facilityPerk(p, "infirmary") : 0;
  const capacity = lvl > 0 ? Math.min(10, 1 + Math.floor(lvl / 2)) : 0;
  const speed = lvl > 0 ? Math.max(REST_RATE, (1 + 0.25 * lvl) * perk) : REST_RATE;
  const injured = p.crew.filter((c) => c.injury).sort((a, b) => b.injury!.sev - a.injury!.sev || a.injury!.at - b.injury!.at);
  const patients = injured.map((c, i) => {
    const inClinic = i < capacity;
    const rate = inClinic ? speed : REST_RATE;
    const rem = Math.max(0, c.injury!.need - c.injury!.done);
    return { id: c.id, name: c.name, gender: (c as any).look?.gender || "male", sev: c.injury!.sev, sev_name: INJURY_SEV[c.injury!.sev]?.name, in_clinic: inClinic, rate, left: Math.ceil(rem / rate), pct: Math.min(100, Math.round((c.injury!.done / c.injury!.need) * 100)), heal_cost: fastHealCost(c) };
  });
  return { level: lvl, capacity, speed, rest_rate: REST_RATE, patients, injured: injured.length, waiting: Math.max(0, injured.length - capacity) };
}
/** Paid fast-heal: clean cash (a private doctor bills legit money). Cost scales with the care time left. */
export function fastHealCost(c: CrewMember) {
  if (!c.injury) return 0;
  const remMin = Math.ceil(Math.max(0, c.injury.need - c.injury.done) / 60);
  return Math.max(500, remMin * (20 + 10 * c.injury.sev));
}
function medicalTick(p: Player, now: number) {
  const last = Number((p as any).med_last) || now;
  const dt = Math.max(0, Math.min(7 * 86400, now - last));
  (p as any).med_last = now;
  if (!dt) return;
  const m = medicalInfo(p, now);
  m.patients.forEach((pt) => {
    const c = p.crew.find((x) => x.id === pt.id);
    if (!c?.injury) return;
    c.injury.done = Math.min(c.injury.need, c.injury.done + dt * pt.rate);
    if (c.injury.done >= c.injury.need) {
      c.injury = null;
      (p as any).med_healed = (Number((p as any).med_healed) || 0) + 1;
      p.log.unshift({ t: now, msg: `${c.name} has recovered and is fit for duty again.`, kind: "good" });
    }
  });
}

// ---- v9: fight rounds (drive the fight animation from the real result) ----
export type FightRound = { a: "us" | "them"; by: string; move: "jab" | "punch" | "kick" | "combo"; def: "hit" | "block" | "dodge"; dmg: number; us: number; them: number; kd?: boolean; ko?: boolean };
export function genRounds(b: { won: boolean; us: { name: string; power: number; crew?: { name: string }[] }; them: { name: string; boss?: string; power: number } }, rnd: () => number = Math.random): FightRound[] {
  const us = Math.max(1, b.us.power || 1), them = Math.max(1, b.them.power || 1);
  const ratio = Math.min(us, them) / Math.max(us, them);
  const winnerLeft = Math.max(12, Math.min(92, Math.round(100 * (1 - 0.75 * ratio))));
  const usEnd = b.won ? winnerLeft : 0, themEnd = b.won ? 0 : winnerLeft;
  const win: "us" | "them" = b.won ? "us" : "them", lose: "us" | "them" = b.won ? "them" : "us";
  const n = Math.min(7, 4 + Math.min(3, (b.us.crew || []).length));
  const att: ("us" | "them")[] = [];
  for (let i = 0; i < n - 1; i++) att.push(rnd() < 0.58 ? win : lose);
  if (!att.includes(lose)) att[0] = lose;
  if (att.filter((x) => x === win).length < 1) att[att.length - 1] = win;
  att.push(win);
  const defs: FightRound["def"][] = att.map((_, i) => (i === n - 1 ? "hit" : (() => { const r = rnd(); return r < 0.55 ? "hit" : r < 0.85 ? "block" : "dodge"; })()));
  // make sure the side that must lose HP has at least one landed blow against it
  (["us", "them"] as const).forEach((side) => {
    const need = side === "us" ? 100 - usEnd : 100 - themEnd;
    const idx = att.map((a, i) => (a !== side ? i : -1)).filter((i) => i >= 0);
    if (need > 0 && idx.length && !idx.some((i) => defs[i] !== "dodge")) defs[idx[0]] = "hit";
  });
  const W = { hit: 1, block: 0.35, dodge: 0 } as const;
  const dmg = new Array(n).fill(0);
  (["us", "them"] as const).forEach((side) => {
    const need = side === "us" ? 100 - usEnd : 100 - themEnd;
    const idx = att.map((a, i) => (a !== side ? i : -1)).filter((i) => i >= 0 && defs[i] !== "dodge");
    if (!idx.length) return;
    const w = idx.map((i) => W[defs[i]] * (0.7 + rnd() * 0.6) * (i === n - 1 ? 1.6 : 1));
    const tot = w.reduce((a, x) => a + x, 0);
    let left = need;
    idx.forEach((i, k) => { const d = k === idx.length - 1 ? left : Math.min(left, Math.round((need * w[k]) / tot)); dmg[i] = d; left -= d; });
  });
  const crew = (b.us.crew || []).map((c) => c.name);
  let hu = 100, ht = 100, kdUsed = false;
  const moves: FightRound["move"][] = ["jab", "punch", "kick", "combo"];
  return att.map((a, i) => {
    if (a === "us") ht -= dmg[i]; else hu -= dmg[i];
    const last = i === n - 1;
    const r: FightRound = {
      a, by: a === "us" ? (i > 0 && crew.length && rnd() < 0.5 ? crew[i % crew.length] : b.us.name) : (b.them.boss || b.them.name),
      move: last ? (rnd() < 0.5 ? "combo" : "kick") : dmg[i] >= 22 ? (rnd() < 0.5 ? "kick" : "combo") : moves[Math.floor(rnd() * 2)],
      def: defs[i], dmg: dmg[i], us: Math.max(0, hu), them: Math.max(0, ht),
    };
    if (last) r.ko = true;
    else if (!kdUsed && defs[i] === "hit" && dmg[i] >= 20 && a === win) { r.kd = true; kdUsed = true; }
    return r;
  });
}

/** Radio Hub perk: +10s raid warning per level (max +60s), scaled by condition. */
export function radioWarning(p: Player): number {
  const lvl = p.facilities?.radio_tower || 0;
  return Math.floor(Math.min(60, lvl * 10) * Math.min(1, facilityPerk(p, "radio_tower")));
}

/** Archetype match for facility stations (recommended_arch plus any alt_archs). */
export function facilityArchMatch(fac: any, arch: string): boolean {
  if (!fac) return false;
  return fac.recommended_arch === arch || (fac.alt_archs || []).includes(arch);
}

/** Repair costs for any of the three maintenance systems. kind: facility | hustle | front. */
export function repairCosts(kind: "facility" | "hustle" | "front", id: string, lvl: number, cond: number) {
  const L = Math.max(1, lvl);
  const missing = Math.max(0, (100 - cond) / 100);
  if (kind === "facility") {
    return {
      quick_dirty: Math.max(200, Math.floor(500 * L)),
      quick_clean: 0,
      overhaul_dirty: Math.max(300, Math.floor(1400 * L * Math.max(0.1, missing))),
      overhaul_clean: Math.max(100, Math.floor(350 * L * Math.max(0.1, missing))),
    };
  }
  if (kind === "hustle") {
    const h = HUSTLE_MAP[id];
    const base = Math.max(10, h?.income || 10) * L;
    return {
      quick_dirty: Math.max(150, Math.floor(base * 20)),
      quick_clean: 0,
      overhaul_dirty: Math.max(250, Math.floor(base * 60 * Math.max(0.1, missing))),
      overhaul_clean: 0,
    };
  }
  const f = FRONT_MAP[id];
  const base = (f?.cost || 6000) * L;
  return {
    quick_dirty: Math.max(500, Math.floor(base * 0.02)),
    quick_clean: 0,
    overhaul_dirty: Math.max(800, Math.floor(base * 0.06 * Math.max(0.1, missing))),
    overhaul_clean: Math.max(200, Math.floor(base * 0.015 * Math.max(0.1, missing))),
  };
}

export function hustleManagers(p: Player, hid: string, plot?: number): string[] {
  if (plot !== undefined) {
    return p.plot_hustle_managers?.[plot] || [];
  }
  return [];
}

// Hustle levels (v9 bug fix: level-ups now raise income). Income ×1.15 per level above 1.
export const HUSTLE_MAX_LVL = 25;
export const HUSTLE_LEVEL_GROWTH = 1.15;
export const HUSTLE_UPGRADE_GROWTH = 1.6;

// ==========================================
// v9 LAND: each street hustle needs its own land plot (no separate plot-business system)
// ==========================================
/** Migration-only record of the retired v8/v9 "plot business modules": original (dirty) build price for refunds and
 *  the tier-paired street hustle a module converts into. Not a business list: nothing can be built from it. */
const RETIRED_MODULES: Record<string, { name: string; hustle: string; refund: number; perSec: number; mult: number; upBase: number; upMult: number }> = {
  okada_dispatch: { name: "Okada Express Courier", hustle: "okada", refund: 500, perSec: 10, mult: 1.25, upBase: 400, upMult: 1.45 },
  chop_bar: { name: "Bukom Chop Bar & Grill", hustle: "phones", refund: 1500, perSec: 28, mult: 1.25, upBase: 1200, upMult: 1.45 },
  phone_hub: { name: "Tip-Toe Lane Phone Hub", hustle: "jerseys", refund: 4000, perSec: 75, mult: 1.25, upBase: 3200, upMult: 1.5 },
  kantamanto_bale: { name: "Kantamanto Vintage Bale", hustle: "fuel", refund: 12000, perSec: 210, mult: 1.25, upBase: 9500, upMult: 1.5 },
  suame_magazine: { name: "Magazine Chop Shop & Parts", hustle: "container", refund: 35000, perSec: 580, mult: 1.3, upBase: 28000, upMult: 1.55 },
  fuel_bunkering: { name: "Tema Pipeline Fuel Bunkering", hustle: "gold", refund: 95000, perSec: 1500, mult: 1.3, upBase: 75000, upMult: 1.55 },
  kejetia_gold: { name: "Kejetia Gold Brokerage", hustle: "estate", refund: 260000, perSec: 3900, mult: 1.35, upBase: 200000, upMult: 1.6 },
  osu_vip_penthouse: { name: "Osu Strip VIP Penthouse", hustle: "port_cartel", refund: 750000, perSec: 11000, mult: 1.35, upBase: 580000, upMult: 1.6 },
};
export const landFee = (i: number) => Number(LAND_FEES[i] ?? LAND_FEES[LAND_FEES.length - 1]);
/** v6 migration: retired plot modules -> street hustles on land. Pays out pending module income first. */
export function migrateLandV6(p: Player, now: number) {
  const L = p as any;
  const old: any[] = Array.isArray(L.player_plots) ? L.player_plots : [];
  const nowMs = Math.floor(now * 1000);
  const log: string[] = [];
  let refund = 0;
  let payout = 0;
  old.forEach((pl: any, i: number) => {
    const m = pl && pl.assignedBusinessID ? RETIRED_MODULES[pl.assignedBusinessID] : null;
    if (!m) return;
    const lvl = Math.max(1, Math.min(HUSTLE_MAX_LVL, Number(pl.localLevel) || 1));
    // pay out module income since its last tick (capped by the offline cap), at the old module rate
    const secs = Math.min(Math.max(0, nowMs - Number(pl.lastTickTimestamp || nowMs)) / 1000, offlineCap(p));
    payout += Math.floor(m.perSec * Math.pow(m.mult, lvl - 1) * secs);
    const taken = !!p.hustles[m.hustle] || old.some((o: any, j: number) => j !== i && o?.hustleID === m.hustle);
    if (!taken && HUSTLE_MAP[m.hustle] && isUnlocked(p, (HUSTLE_MAP[m.hustle] as any).gate)) {
      p.hustles[m.hustle] = { lvl, ts: now, bank: 0 } as any;
      if (!p.hustle_condition) p.hustle_condition = {};
      p.hustle_condition[m.hustle] = 100;
      pl.hustleID = m.hustle;
      log.push(`${m.name} LV${lvl} became ${HUSTLE_MAP[m.hustle].name} LV${lvl}`);
    } else {
      // duplicate: refund everything it cost on the old build (build + every upgrade, paid in dirty cash then)
      let spent = m.refund;
      for (let l = 1; l < lvl; l++) spent += Math.floor(m.upBase * Math.pow(m.upMult, l - 1));
      refund += spent;
      pl.hustleID = pl.hustleID || null;
      log.push(`${m.name} LV${lvl} (duplicate) refunded GH₵${spent.toLocaleString()}`);
    }
    pl.assignedBusinessID = null;
  });
  if (payout + refund > 0) addCash(p, "dirty", BigInt(payout + refund));
  if (old.some((pl: any) => pl?.isUnlocked) || Object.keys(p.hustles || {}).length) L.first_business_claimed = true;
  delete L.legacy_lots;
  delete L.plot_income_today;
  if (log.length) p.log?.unshift({ t: now, msg: `Plots became land: ${log.join("; ")}.${payout ? ` Module payout GH₵${payout.toLocaleString()}.` : ""}`, kind: "info" });
  return { refund, payout, log };
}
/** Normalise the 8 land plots. Every owned hustle sits on owned land: a hustle without land (old saves,
 *  presets) is given the next land plot for free so it keeps its level. Duplicated hustles keep the first plot. */
export function ensurePlots(p: Player, _nowMs?: number) {
  const old: any[] = Array.isArray(p.player_plots) ? (p.player_plots as any[]) : [];
  p.player_plots = Array.from({ length: LAND_COUNT }, (_, i) => {
    const o = old[i] || {};
    const hid = o.hustleID || null;
    const globalHs = hid ? p.hustles?.[hid] : null;
    return {
      plotID: i,
      streetName: o.streetName || GHANA_STREET_NAMES[i] || `Plot ${i + 1}`,
      customName: o.customName || undefined,
      isUnlocked: !!o.isUnlocked,
      plotUnlockFee: landFee(i),
      hustleID: hid,
      building: o.building || null,
      lvl: Number(o.lvl || globalHs?.lvl || 1),
      ts: Number(o.ts || globalHs?.ts || Date.now() / 1000),
      bank: Number(o.bank || globalHs?.bank || 0),
      condition: Number(o.condition !== undefined ? o.condition : (p.hustle_condition?.[hid] ?? 100)),
    };
  });
  p.player_plots.forEach((pl) => {
    if (pl.hustleID && (!p.hustles?.[pl.hustleID] || !pl.isUnlocked)) pl.hustleID = null;
  });
  Object.keys(p.hustles || {}).forEach((hid) => {
    if (!HUSTLE_MAP[hid]) return;
    const isAlreadyOnSomePlot = p.player_plots!.some((pl) => pl.isUnlocked && (pl.hustleID === hid || pl.building?.hid === hid));
    if (isAlreadyOnSomePlot) return;
    const spot = p.player_plots!.find((pl) => pl.isUnlocked && !pl.hustleID && !pl.building) || p.player_plots!.find((pl) => !pl.isUnlocked);
    if (!spot) return;
    spot.isUnlocked = true;
    spot.hustleID = hid;
  });
  if (Object.keys(p.hustles || {}).length) (p as any).first_business_claimed = true;
  return p.player_plots;
}
export const nextLandIndex = (p: Player) => (p.player_plots || []).findIndex((pl) => !pl.isUnlocked);

export const SAVE_VERSION = 6;
/** v9: versioned save migration. Fills safe defaults for every new field so old saves load. */
export function migratePlayer(p: Player, now: number): Player {
  const from = Number(p.version || 1);
  if (!p.dirty) p.dirty = "0";
  if (!p.clean) p.clean = "0";
  if (!p.lifetime) p.lifetime = "20";
  if (!p.level) p.level = 1;
  if (typeof p.heat !== "number") p.heat = 0;
  if (!p.name) p.name = "Kofi Bullet";
  if (!p.district) p.district = "dockside";
  if (!p.user_id) p.user_id = "boss_offline_1";
  if (!Array.isArray(p.crew)) p.crew = [];
  p.crew.forEach((c) => {
    if (!Array.isArray(c.traits) || c.traits.length < 3) {
      const goodPool = CREW_TRAITS.filter((t) => t.type === "good").sort(() => Math.random() - 0.5);
      const badPool = CREW_TRAITS.filter((t) => t.type === "bad").sort(() => Math.random() - 0.5);
      const existing = Array.isArray(c.traits) ? [...c.traits] : [];
      while (existing.length < 3) {
        if (existing.length === 1 && badPool[0]?.id && !existing.includes(badPool[0].id)) {
          existing.push(badPool[0].id);
        } else {
          const nextGood = goodPool.find((t) => !existing.includes(t.id));
          if (nextGood) existing.push(nextGood.id);
          else existing.push("iron_jaw");
        }
      }
      c.traits = existing;
    }
    syncCrewProgression(c);
  });
  if (p.store?.agency) {
    p.store.agency.forEach((c: any) => {
      if (!Array.isArray(c.traits) || c.traits.length < 3) {
        const goodPool = CREW_TRAITS.filter((t) => t.type === "good").sort(() => Math.random() - 0.5);
        const badPool = CREW_TRAITS.filter((t) => t.type === "bad").sort(() => Math.random() - 0.5);
        c.traits = [goodPool[0]?.id, badPool[0]?.id, goodPool[1]?.id].filter(Boolean);
      }
      syncCrewProgression(c);
    });
  }
  if (!p.hustles || typeof p.hustles !== "object") p.hustles = {};
  if (!p.fronts || typeof p.fronts !== "object") p.fronts = {};
  if (!p.facilities || typeof p.facilities !== "object") p.facilities = {};
  if (!p.facility_condition || typeof p.facility_condition !== "object") p.facility_condition = {};
  if (!p.facility_assign || typeof p.facility_assign !== "object") p.facility_assign = {};
  if (!p.hustle_condition || typeof p.hustle_condition !== "object") p.hustle_condition = {};
  if (!p.front_condition || typeof p.front_condition !== "object") p.front_condition = {};
  if (!p.upgrades || typeof p.upgrades !== "object") p.upgrades = { vault: 0, walls: 0, safehouse: 0, studio: 0, okada: 0, trotro: 0, quarters: 0, cruiser: 0 };
  if (!p.inv || typeof p.inv !== "object") p.inv = { burner: 2, timeskip: 3, lawyer: 1, envelope: 0, vest: 0, cctv: 0, spikes: 0, dog: 0, energy: 1, feast: 0, donation: 0, radio: 0, goggles: 0, scanner: 0, blueprints: 0, lockpick: 0, plates: 0, okada_key: 0, receipt: 0 };
  if (!p.loadout || typeof p.loadout !== "object") p.loadout = {};
  if (!Array.isArray(p.gear)) p.gear = [];
  if (!Array.isArray(p.heists)) p.heists = [];
  if (!Array.isArray(p.batches)) p.batches = [];
  if (!Array.isArray(p.log)) p.log = [];
  if (!p.hustle_assign || typeof p.hustle_assign !== "object") p.hustle_assign = {};
  if (!p.hustle_managers || typeof p.hustle_managers !== "object") p.hustle_managers = {};
  if (!p.plot_hustle_managers || typeof p.plot_hustle_managers !== "object") p.plot_hustle_managers = {};
  if (!Array.isArray(p.pending_deliveries)) p.pending_deliveries = [];
  if (!Array.isArray(p.active_consumable_buffs)) p.active_consumable_buffs = [];
  if (!p.clean || isNaN(Number(p.clean))) p.clean = "0";
  if (!p.dirty || isNaN(Number(p.dirty))) p.dirty = "0";
  if (!p.front_assign || typeof p.front_assign !== "object") p.front_assign = {};
  if (!Array.isArray(p.cash_statement)) p.cash_statement = [];
  if (!p.last_biz_wear) p.last_biz_wear = now;
  if (!p.cooldowns) p.cooldowns = { launder_until: 0, heist_until: 0, front: {} };
  if (!p.cooldowns.front) p.cooldowns.front = {};
  if (!p.cooldowns.robbery_by || typeof p.cooldowns.robbery_by !== "object") p.cooldowns.robbery_by = {};
  p.cooldowns.robbery_until = Number(p.cooldowns.robbery_until || 0);
  if (!p.cooldowns.gf_date_by || typeof p.cooldowns.gf_date_by !== "object") p.cooldowns.gf_date_by = {};
  if (!p.cooldowns.gf_court_by || typeof p.cooldowns.gf_court_by !== "object") p.cooldowns.gf_court_by = {};
  p.cooldowns.launder_until = Number(p.cooldowns.launder_until || 0);
  p.cooldowns.heist_until = Number(p.cooldowns.heist_until || 0);
  // v9: heist cooldowns are PER HEIST (8h after that heist completes). Move an old global cooldown
  // onto the heist that was last run (the newest one still in p.heists), otherwise clear it.
  if (!p.cooldowns.heist_by || typeof p.cooldowns.heist_by !== "object") p.cooldowns.heist_by = {};
  if (!p.cooldowns.heist_set_at || typeof p.cooldowns.heist_set_at !== "object") p.cooldowns.heist_set_at = {};
  if (p.cooldowns.heist_until > 0) {
    const last = (p.heists || [])[(p.heists || []).length - 1];
    if (last && p.cooldowns.heist_until > now) {
      p.cooldowns.heist_by[last.tpl] = Math.max(p.cooldowns.heist_by[last.tpl] || 0, Number(last.end || now) + COOLDOWNS.heist);
      p.cooldowns.heist_set_at[last.tpl] = Number(last.start || now);
    }
    p.cooldowns.heist_until = 0;
  }
  (p.heists || []).forEach((h: any) => {
    // a running/unclaimed heist is always locked until 8h after it completes
    p.cooldowns!.heist_by![h.tpl] = Math.max(p.cooldowns!.heist_by![h.tpl] || 0, Number(h.end || 0) + COOLDOWNS.heist);
  });
  if (!p.boss_perks) p.boss_perks = {};
  if (!p.streak) p.streak = { count: 0, last_day: "", grace_used: false };
  // Perk ranks are capped at 3: refund any excess ranks from old saves as skill points.
  Object.keys(p.boss_perks).forEach((k) => {
    const cap = Math.min(BOSS_PERKS[k]?.max ?? BOSS_PERK_MAX_RANK, BOSS_PERK_MAX_RANK);
    if ((p.boss_perks[k] || 0) > cap) {
      p.skill_points = (p.skill_points || 0) + (p.boss_perks[k] - cap);
      p.boss_perks[k] = cap;
    }
  });
  // Condition values must be numbers in 0..100.
  [p.facility_condition, p.hustle_condition, p.front_condition].forEach((m) => {
    Object.keys(m!).forEach((k) => {
      const v = Number(m![k]);
      m![k] = isFinite(v) ? Math.max(0, Math.min(100, v)) : 100;
    });
  });
  if (!p.workshop || typeof p.workshop !== "object") {
    p.workshop = {
      benches: [{ weaponId: null, start: 0, end: 0 }],
      up: { tools: 0, foundry: 0 },
    };
  }
  if (!Array.isArray(p.workshop.benches)) p.workshop.benches = [{ weaponId: null, start: 0, end: 0 }];
  if (!p.workshop.up || typeof p.workshop.up !== "object") p.workshop.up = { tools: 0, foundry: 0 };
  if (!p.music_studio || typeof p.music_studio !== "object") {
    p.music_studio = {
      booths: [{ trackId: null, start: 0, end: 0 }],
      up: { acoustics: 0, mixing: 0 },
    };
  }
  if (!Array.isArray(p.music_studio.booths)) p.music_studio.booths = [{ trackId: null, start: 0, end: 0 }];
  if (!p.music_studio.up || typeof p.music_studio.up !== "object") p.music_studio.up = { acoustics: 0, mixing: 0 };
  if (!p.methlab || typeof p.methlab !== "object") {
    p.methlab = { benches: [{ productId: null, start: 0, end: 0, yield: 0 }], stash: {}, up: {} };
  }
  if (!Array.isArray(p.methlab.benches)) p.methlab.benches = [{ productId: null, start: 0, end: 0, yield: 0 }];
  if (!p.methlab.stash) p.methlab.stash = {};
  if (!p.methlab.up) p.methlab.up = {};

  if (!p.mining || typeof p.mining !== "object") {
    p.mining = { rigs: [{ mineralId: null, start: 0, end: 0, yield: 0 }], stash: {}, up: {} };
  }
  if (!Array.isArray(p.mining.rigs)) p.mining.rigs = [{ mineralId: null, start: 0, end: 0, yield: 0 }];
  if (!p.mining.stash) p.mining.stash = {};
  if (!p.mining.up) p.mining.up = {};

  if (p.area_don === undefined) {
    if (!p.area_don_cooldown_until || now >= p.area_don_cooldown_until) {
      p.area_don = spawnAreaDon(p.area_don_defeated_count || 0);
    } else {
      p.area_don = null;
    }
  }
  if (!Array.isArray(p.big_man_perks)) p.big_man_perks = [];
  if (!p.commodities_held || typeof p.commodities_held !== "object") p.commodities_held = {};
  if (!p.turf_control || typeof p.turf_control !== "object") {
    p.turf_control = { jamestown_wharf: 20, alajo_scrap: 15, nima_highway: 10, osu_strip: 25, tema_port: 10 };
  }
  Object.values(p.hustles).forEach((hs: any) => {
    if (!hs.lvl || hs.lvl < 1) hs.lvl = 1;
    if (typeof hs.bank !== "number") hs.bank = 0;
  });
  if (!Array.isArray(p.robberies)) p.robberies = [];
  if (!Array.isArray(p.trafficking)) p.trafficking = [];
  if (!p.girlfriend || typeof p.girlfriend !== "object") p.girlfriend = { active_id: null, companions: {} };
  if (!p.girlfriend.companions) p.girlfriend.companions = {};
  Object.entries(p.girlfriend.companions).forEach(([gid, comp]: [string, any]) => {
    if (!comp.status) comp.status = "dating";
    if (typeof comp.impress_score !== "number") comp.impress_score = comp.status === "dating" ? 100 : 0;
  });
  if (from < 6) migrateLandV6(p, now); // v6: plot modules retired, land gates hustles
  if (typeof (p as any).first_business_claimed !== "boolean") (p as any).first_business_claimed = false;
  ensurePlots(p, now * 1000);
  // v3: luxury boutique
  if (!(p as any).luxury || typeof (p as any).luxury !== "object") (p as any).luxury = {};
  Object.keys((p as any).luxury).forEach((id) => { if (!LUXURY_MAP[id]) delete (p as any).luxury[id]; });
  if (!Array.isArray((p as any).lux_seen)) (p as any).lux_seen = [];
  if (typeof (p as any).lux_rot_seen !== "number") (p as any).lux_rot_seen = -1;
  // v4: late-game systems (all optional; safe defaults keep v1–v3 saves loading)
  {
    const L = p as any;
    const obj = (v: any) => v && typeof v === "object" && !Array.isArray(v);
    if (!obj(L.legacy)) L.legacy = { tokens: 0, earned: 0, retires: 0, perks: {} };
    L.legacy.tokens = Math.max(0, Number(L.legacy.tokens) || 0);
    L.legacy.earned = Math.max(0, Number(L.legacy.earned) || 0);
    L.legacy.retires = Math.max(0, Number(L.legacy.retires) || 0);
    if (!obj(L.legacy.perks)) L.legacy.perks = {};
    Object.keys(L.legacy.perks).forEach((k) => { const m = LEGACY_MAP[k]; if (!m) delete L.legacy.perks[k]; else L.legacy.perks[k] = Math.max(0, Math.min(m.max, Number(L.legacy.perks[k]) || 0)); });
    if (!Array.isArray(L.unlocks)) L.unlocks = [];
    if (!obj(L.influence)) L.influence = {};
    Object.keys(L.influence).forEach((k) => (L.influence[k] = Math.max(0, Math.min(INFLUENCE_MAX, Number(L.influence[k]) || 0))));
    if (!obj(L.lieutenants)) L.lieutenants = {};
    if (!obj(L.projects)) L.projects = {};
    if (!obj(L.bests)) L.bests = {};
    L.chips = Math.max(0, Number(L.chips) || 0);
    if (!obj(L.syndicate)) L.syndicate = { day: "", rivals: {}, seized: {} };
    if (!obj(L.front_income_ts)) L.front_income_ts = {};
    Object.keys(p.fronts || {}).forEach((fid) => { if (!Number(L.front_income_ts[fid])) L.front_income_ts[fid] = now; }); // no back-pay on migration
    L.street_launder_until = Number(L.street_launder_until) || 0;
    if (L.city && (!obj(L.city.dmg) || !Array.isArray(L.city.claimed))) L.city = null;
    if (!Array.isArray(p.cosmetics)) p.cosmetics = [];
  }
  // v5 defaults: injuries / medical / snitch
  if (!Number((p as any).med_last)) (p as any).med_last = now;
  (p as any).med_healed = Math.max(0, Number((p as any).med_healed) || 0);
  (p as any).snitch_until = Number((p as any).snitch_until) || 0;
  (p.crew || []).forEach((c) => {
    const j: any = c.injury;
    if (j && (typeof j !== "object" || !INJURY_SEV[j.sev] || !(Number(j.need) > 0))) c.injury = null;
    else if (j) { j.done = Math.max(0, Math.min(j.need, Number(j.done) || 0)); j.at = Number(j.at) || now; }
  });
  if (!p.boss_stats) {
    const base = Math.max(5, (p.level || 1) * 2);
    p.boss_stats = { brains: base, wheels: base, muscle: base + 2, stealth: base };
  }
  if (!p.rival_relations || typeof p.rival_relations !== "object") p.rival_relations = {};
  RIVALS.forEach((r) => { if (p.rival_relations![r.id] === undefined) p.rival_relations![r.id] = 50; });
  if (!p.rival_launder_caps || typeof p.rival_launder_caps !== "object") p.rival_launder_caps = {};
  RIVALS.forEach((r) => { if (!p.rival_launder_caps![r.id]) p.rival_launder_caps![r.id] = rollRivalLaunderCap(); });
  const todayKey = dayKey(now);
  if (!p.rival_launder_day || typeof p.rival_launder_day !== "object" || p.rival_launder_day.day !== todayKey) {
    p.rival_launder_day = {
      day: todayKey,
      active_syndicates: pickDailyLaunderRivals(RIVALS.map((r) => r.id), 3),
      used: p.rival_launder_day?.day === todayKey ? (p.rival_launder_day.used || {}) : {},
    };
  } else if (!Array.isArray(p.rival_launder_day.active_syndicates) || p.rival_launder_day.active_syndicates.length === 0) {
    p.rival_launder_day.active_syndicates = pickDailyLaunderRivals(RIVALS.map((r) => r.id), 3);
  }
  (p.player_plots || []).forEach((pl) => { if (pl.building === undefined) pl.building = null; });
  if (p.crew_crisis === undefined) p.crew_crisis = null;
  if (!p.crew_crisis_cooldown) p.crew_crisis_cooldown = 0;
  if (from < SAVE_VERSION) p.version = SAVE_VERSION;
  return p;
}

export function hustleCost(
  h: { cost: number; id?: string },
  lvl: number,
  _now = Date.now() / 1000
) {
  // v9: level-ups cost CLEAN cash (x10 economy) and raise income (×1.15/level). Single price table for hustles AND plot builds.
  if (lvl > 0) return Math.ceil(Math.max(1, h.cost) * 5 * Math.pow(HUSTLE_UPGRADE_GROWTH, lvl - 1));
  // Starting/unlocking initial street hustle
  return Math.max(1, h.cost);
}

export function hustleRate(
  h: { id?: string; income: number },
  _lvl: number,
  p?: Player,
  _now = Date.now() / 1000,
  _plotIndex?: number
) {
  // Stick strictly to the base value configured for the side hustle (no randomizer or multiplier inflation)
  let rate = Number(h.income) || 1;
  if (p && h.id) {
    const cm = p.hustles?.[h.id] ? conditionMult(hustleCond(p, h.id)) : 1;
    if (cm <= 0) return 0; // Critical shut down
    if (p.hustles?.[h.id] && seizedBy(p, "hustle", h.id)) return 0; // Seized by rival syndicate
    
    const luxIncome = 1 + luxuryEffects(p).income / 100;
    const buffs = aggregateBuffs(p);
    const consumableIncome = 1 + (buffs.hustle_income_pct || 0);

    const mgrs = hustleManagers(p, h.id, _plotIndex);
    if (mgrs.length > 0) {
      rate *= (1 + (mgrs.length * 0.10)); // +10% per assigned crew member on this specific plot
    }
    
    rate = rate * mult(p, _now) * luxIncome * consumableIncome * cm;
  }
  return Math.max(1, Math.floor(rate));
}

export function getHustleTodayEarned(p: Player, hid: string, now = Date.now() / 1000, plotIndex?: number): number {
  const today = dayKey(now);
  const key = plotIndex !== undefined ? `plot_${plotIndex}` : hid;
  if (p.hustle_daily?.[key]?.day === today) {
    return p.hustle_daily[key].amount;
  }
  return 0;
}

export function totalRate(p: Player, now: number) {
  if (p.arrested_until && now < p.arrested_until) return 0;
  let sum = 0;
  (p.player_plots || []).forEach((pl) => {
    if (!pl.isUnlocked || !pl.hustleID) return;
    const h = HUSTLE_MAP[pl.hustleID];
    if (!h) return;
    const hs = p.hustles?.[pl.hustleID];
    const lvl = hs?.lvl || 1;
    const cm = conditionMult(hustleCond(p, pl.hustleID, pl.plotID));
    if (cm <= 0) return;
    if (seizedBy(p, "hustle", pl.hustleID)) return;
    sum += Math.floor(hustleRate(h, lvl, p, now, pl.plotID) * cm);
  });
  return sum;
}

/** v9 Night Shift legacy perk target: the owned hustle with the highest base rate. */
export function bestHustleId(p: Player): string | null {
  let best: string | null = null, top = -1;
  Object.entries(p.hustles || {}).forEach(([k, v]: any) => { const h = HUSTLE_MAP[k]; if (!h) return; const r = h.income * Math.pow(HUSTLE_LEVEL_GROWTH, (v.lvl || 1) - 1); if (r > top) { top = r; best = k; } });
  return best;
}
export function offlineCap(p: Player) {
  return (p.upgrades?.safehouse ? 24 : 12) * H;
}

export function accruedPlot(p: Player, plotIndex: number, now: number) {
  if (p.arrested_until && now < p.arrested_until) return 0;
  const pl = (p.player_plots || [])[plotIndex];
  if (!pl || !pl.isUnlocked || !pl.hustleID) return 0;
  const hid = pl.hustleID;
  const hs = p.hustles?.[hid];
  if (!hs || hs.paused) return 0;
  const h = HUSTLE_MAP[hid];
  if (!h) return 0;

  const cm = conditionMult(hustleCond(p, hid, plotIndex));
  if (cm <= 0) return 0;
  if (seizedBy(p, "hustle", hid)) return 0;

  const secs = Math.max(0, Math.min(now - hs.ts, legacyRank(p, "uncapped") > 0 && bestHustleId(p) === hid ? Infinity : offlineCap(p)));
  const mins = secs / 60;
  const rate = Math.floor(hustleRate(h, hs.lvl, p, now, plotIndex) * cm);
  return Math.floor(rate * mins) + Math.floor(hs.bank || 0);
}

export function accrued(p: Player, hid: string, now: number) {
  if (p.arrested_until && now < p.arrested_until) return 0;
  let total = 0;
  (p.player_plots || []).forEach((pl) => {
    if (pl.isUnlocked && pl.hustleID === hid) {
      total += accruedPlot(p, pl.plotID, now);
    }
  });
  return total > 0 ? total : (p.hustles?.[hid]?.bank || 0);
}

export function frontCost(f: { cost: number }, lvl: number) {
  const base = Math.max(6000, f.cost);
  return Math.floor(f.cost * Math.pow(1.6, lvl));
}

export function frontDuration(f: { id?: string; dur: number }, p?: Player) {
  let dur = f.dur;
  if (p && f.id && p.front_assign?.[f.id]) {
    const mgr = p.crew.find((c) => c.id === p.front_assign[f.id]);
    if (mgr) {
      let speedMult = 1.0;
      if (mgr.front_trait === "chop_master") speedMult -= 0.40;
      if (mgr.front_trait === "night_owl") speedMult -= 0.30;
      if (mgr.front_trait === "fleet_captain" && f.id === "trotro") speedMult -= 0.50;
      if (mgr.front_trait === "grease_monkey" && (f.id === "carwash" || f.id === "spare")) speedMult -= 0.35;
      if (mgr.specialty_biz === f.id) speedMult -= 0.10;
      dur = Math.max(10, Math.floor(dur * Math.max(0.35, speedMult)));
    }
  }
  // Generator perk: laundering cycles 20% faster while it is not Critical (half effect when Worn)
  if (p) {
    const g = Math.min(1, facilityPerk(p, "generator"));
    if (g > 0) dur = Math.max(10, Math.floor(dur * (1 - 0.2 * g)));

    const buffs = aggregateBuffs(p);
    if (buffs.launder_speed_pct) { // Assumes northern gold skunk provides speed
        dur = Math.max(10, Math.floor(dur * (1 - buffs.launder_speed_pct)));
    }

    // Area Don Archetype: The Customs Shark halves Plot 1 & 2 wash speed
    if (p.area_don?.archetypeId === "customs_shark" && (f.id === "chopbar" || f.id === "carwash")) {
      dur = Math.floor(dur * 2);
    }

    dur = Math.floor(dur * cityMods(p).front_dur); // v9: Police Crackdown slows fronts
  }
  return dur;
}

export function frontCapacity(p: Player, f: { id?: string; cap: number }, lvl: number) {
  let cap = Math.floor(f.cap * Math.pow(lvl, 1.3) * (1 + (p.upgrades?.trotro || 0) * 0.1));
  if (f.id && p.front_assign?.[f.id]) {
    const mgr = p.crew.find((c) => c.id === p.front_assign[f.id]);
    if (mgr) {
      let bonus = 0;
      if (mgr.front_trait === "bookkeeper") bonus += 0.40;
      if (mgr.front_trait === "night_owl") bonus += 0.35;
      if (mgr.front_trait === "high_society" && f.id === "club") bonus += 0.60;
      if (mgr.front_trait === "grease_monkey" && (f.id === "spare" || f.id === "carwash")) bonus += 0.50;
      if (mgr.front_trait === "chop_master" && f.id === "chopbar") bonus += 0.30;
      if (mgr.specialty_biz === f.id) bonus += 0.15;
      if ((mgr.morale ?? 85) >= 80) bonus += 0.10;
      cap = Math.floor(cap * (1 + bonus));
    }
  }
  // v9 wear: Pristine +15%, Worn half, Critical shut down (cannot launder)
  if (f.id && p.fronts?.[f.id]) cap = Math.floor(cap * conditionMult(frontCond(p, f.id)));
  // v9 late game: district influence + Heat Wave capacity
  cap = Math.floor(cap * (1 + influenceLvl(p, FRONT_DISTRICT[f.id || ""]) * INFLUENCE_FX.front_cap) * cityMods(p).launder_cap);
  return cap;
}

export function heatTier(heat: number) {
  return Math.min(5, Math.ceil(heat / 20));
}

export function launderFee(heat: number, p?: Player, fid?: string) {
  let fee = 0.08 + 0.03 * (heatTier(heat) - 1);
  if (p) {
    const buffs = aggregateBuffs(p);
    fee = Math.max(0.02, fee - luxuryEffects(p).launder / 100 - respectFeeCut(p) + (buffs.launder_fee_pct || 0)); // v9 boutique + respect + buffs
    if (p.boss_perks?.negotiator) fee = Math.max(0.02, fee - p.boss_perks.negotiator * 0.02);
    if (fid && p.front_assign?.[fid]) {
      const mgr = p.crew.find((c) => c.id === p.front_assign[fid]);
      if (mgr) {
        if (mgr.front_trait === "bookkeeper") fee = Math.max(0.02, fee - 0.04);
        if (mgr.front_trait === "smooth_talker") fee = Math.max(0.02, fee - 0.06);
        if (mgr.front_trait === "high_society") fee = Math.max(0.02, fee - 0.04);
        if (mgr.specialty_biz === fid) fee = Math.max(0.02, fee - 0.02);
      }
    }
  }
  return Number(fee.toFixed(3));
}

/** Vault: 5,000 base + exactly 5,000 per vault level (facility + upgrade). Worn halves the level bonus, Critical loses it. */
export function vaultCap(p: Player) {
  const facilityLevel = p.facilities?.vault || 0;
  const legacyLevel = p.upgrades?.vault || 0;
  const eff = facilityLevel > 0 ? conditionPenalty(facilityCond(p, "vault")) : 1;
  return VAULT_BASE_CAP + Math.floor(VAULT_CAP_PER_LEVEL * (facilityLevel + legacyLevel) * eff);
}
/** Exponential vault cost: base 5000 × 2.8^level (scales steeply to make it hard to buy). */
export function vaultUpgradeCost(lvl: number) {
  return Math.floor(UPGRADES.vault.cost * Math.pow(VAULT_COST_GROWTH, lvl));
}
export function facilityUpgradeCost(fid: string, lvl: number) {
  const fac = MANSION_FACILITIES[fid];
  const gd = fid === "vault" ? VAULT_COST_GROWTH : 1.7;
  const baseDirty = fid === "vault" ? 5000 : Math.max(35000, fac?.base_cost_dirty || 35000);
  return {
    dirty: Math.floor(baseDirty * Math.pow(gd, lvl)),
    clean: 0,
  };
}

export function crewStat(c: CrewMember, stat: string, p: Player) {
  let val = c.stats[stat] || 0;
  const strength = STRENGTHS.find((s) => s.id === c.strength);
  if (strength && strength.stat === stat) val += strength.mod;
  const flaw = FLAWS.find((f) => f.id === c.flaw);
  if (flaw && (flaw as any).stat === stat) val += (flaw as any).mod;

  // Unlocked traits perks and stat buffs (Rank 5 opens 1st, Rank 18 opens 2nd, Rank 30 opens 3rd)
  (c.traits || []).forEach((tid, idx) => {
    const req = idx === 0 ? 5 : idx === 1 ? 18 : 30;
    if ((c.lvl || 1) >= req) {
      const t = CREW_TRAITS.find((x) => x.id === tid);
      if (t && t.statBonus && t.statBonus[stat]) {
        val += t.statBonus[stat];
      }
    }
  });

  // Gear & Boutique wear bonuses (Loadout stats compliment crew gear)
  Object.values(c.loadout || {}).forEach((uid) => {
    const gi = p.gear.find((g) => g.uid === uid);
    const def = gi && GEAR_MAP[gi.id];
    if (def) {
      if (def.stat === stat) val += (def.mod || 0) + (gi.lvl || 0);
      if (def.effects && def.effects[stat]) val += def.effects[stat];
      if ((def as any).tier && stat === "muscle") val += (def as any).tier;
    }
  });
  // Boss commander perk
  if (p.boss_perks?.commander) {
    val += p.boss_perks.commander;
  }
  // Morale effect
  const morale = c.morale !== undefined ? c.morale : 85;
  if (morale < 40) {
    val = Math.max(1, Math.floor(val * 0.75));
  } else if (morale >= 80) {
    val = Math.floor(val * 1.15);
  }
  return Math.min(CREW_STAT_MAX, Math.max(1, val));
}

export function loadoutPower(p: Player, loadout?: Record<string, string>) {
  if (!loadout) return 0;
  let pow = 0;
  const foundryLvl = p.workshop?.up?.foundry || 0;
  const foundryMult = 1 + foundryLvl * 0.05;

  Object.values(loadout).forEach((uid) => {
    const gi = p.gear.find((g) => g.uid === uid);
    const def = gi && GEAR_MAP[gi.id];
    if (def) {
      let basePow = (def.power || 0) + (gi.lvl || 0) * 2 + ((def as any).tier ? (def as any).tier * 15 : 0);
      if (def.effects && def.effects.power) {
        basePow += def.effects.power;
      }
      // Industrial Foundry: +5% power per level for workshop-forged gear
      if (gi.source === "workshop") {
        basePow *= foundryMult;
      }
      pow += Math.round(basePow);
    }
  });
  return pow;
}

export function calcDefence(p: Player) {
  let d = 15;
  // Compound Base Integrity: condition tier multiplies wall & armoury defence (Pristine +15%, Worn half, Critical none)
  const wallEff = conditionMult(facilityCond(p, "walls"));
  d += Math.round((p.facilities?.walls || 0) * 30 * wallEff);

  const armEff = conditionMult(facilityCond(p, "armoury"));
  d += Math.round((p.facilities?.armoury || 0) * 25 * armEff);

  d += (p.boss_perks?.iron_jaw || 0) * 20;
  d += luxuryEffects(p).power; // v9 boutique
  d += (p.upgrades?.walls || 0) * 15;
  d += (p.upgrades?.cruiser || 0) * 10;
  
  const buffs = aggregateBuffs(p);
  d += (buffs.raid_defence_flat || 0);

  BLACK_MARKET.filter((i) => i.kind === "defence").forEach((i) => {
    d += Math.min(i.max || 99, p.inv[i.id] || 0) * i.value;
  });
  p.crew.forEach((c) => {
    if (c.assign === "defense") {
      const m = (c.morale || 85) < 40 ? 0.75 : (c.morale || 85) >= 80 ? 1.2 : 1.0;
      d += Math.floor((crewStat(c, "muscle", p) * 3 + c.lvl * 3 + loadoutPower(p, c.loadout)) * m);
    }
  });

  // Compound Base Integrity: crew stationed at the Wall or Armoury stations add to defence
  (p.facility_assign?.walls || []).forEach((cid) => {
    const c = p.crew.find((x) => x.id === cid);
    if (c) {
      const muscle = crewStat(c, "muscle", p);
      const isSynergy = c.arch === "enforcer";
      d += Math.floor(muscle * (isSynergy ? 2.5 : 1.5) + c.lvl * 2 + 10);
    }
  });
  (p.facility_assign?.armoury || []).forEach((cid) => {
    const c = p.crew.find((x) => x.id === cid);
    if (c) {
      const muscle = crewStat(c, "muscle", p);
      const isSynergy = c.arch === "enforcer";
      d += Math.floor(muscle * (isSynergy ? 2.0 : 1.2) + c.lvl * 2 + 8);
    }
  });

  // Iron Guard sentry bonus from assigned business managers
  Object.values(p.front_assign || {}).concat(Object.values(p.hustle_assign || {})).forEach((cid) => {
    const c = (p.crew || []).find((x) => x.id === cid);
    if (c?.front_trait === "iron_guard") d += 35;
  });
  d += loadoutPower(p, p.loadout);
  // Boss stats contribution to compound defence
  const bStats = p.boss_stats || { brains: 5, wheels: 5, muscle: 7, stealth: 5 };
  d += (bStats.muscle * 2) + bStats.stealth;
  if (p.raid) d += (p.raid.fortify || 0) * 15;
  d += lieutenantDefence(p); // v9: lieutenants auto-defend
  return d;
}

export function isCrewFree(c: CrewMember, nowSec?: number): boolean {
  if (c.merc) return false;
  if (c.assign) return false;
  if (c.status === "kidnapped") return false;
  if (c.injury) return false;
  const now = nowSec || Date.now() / 1000;
  if (c.injured_until && c.injured_until > now) return false;
  return true;
}

export function calcPower(p: Player, nowSec?: number) {
  const now = nowSec || Date.now() / 1000;
  const crewPow = (p.crew || []).reduce(
    (acc, c) => acc + (!isCrewFree(c, now) ? 0 : Object.values(c.stats || {}).reduce((a, b) => a + b, 0) + (c.lvl || 1) * 2 + loadoutPower(p, c.loadout)),
    0
  );
  const bStats = p.boss_stats || { brains: 5, wheels: 5, muscle: 7, stealth: 5 };
  const bossStatsPower = (bStats.brains + bStats.wheels + bStats.muscle + bStats.stealth) * 2;
  const foundryBonus = 1 + (p.workshop?.up?.foundry || 0) * 0.05;
  let pow = Math.round((
    (p.level || 1) * 4 +
    bossStatsPower +
    crewPow +
    (p.upgrades?.walls || 0) * 10 +
    (p.upgrades?.cruiser || 0) * 8 +
    loadoutPower(p, p.loadout)
  ) * foundryBonus);

  const buffs = aggregateBuffs(p);
  if (buffs.combat_power_pct) {
    pow = Math.round(pow * (1 + buffs.combat_power_pct));
  }
  return pow;
}

export function xpNeeded(level: number) {
  return Math.floor(50 * Math.pow(1.3, level - 1));
}

export function triggerArrest(p: Player, now: number) {
  p.heat = 100;
  const isCellblock = p.area_don?.tacticId === "cellblock_charge";
  const extraTime = isCellblock ? 1200 : 0; // +20m if Cellblock Charge
  p.arrested_until = now + 7200 + extraTime; // 2 hours (+20m if cellblock charge)
  p.heat_ts = now;
  p.log.unshift({
    t: now,
    msg: isCellblock
      ? `ARRESTED BY GHANA POLICE! Heat hit 100%. CID & SWAT locked you up for 2 hours and 20 minutes (Cellblock Charge enforced by Area Don ${p.area_don?.name})! All businesses frozen.`
      : "ARRESTED BY GHANA POLICE! Heat hit 100%. CID & SWAT locked you up for 2 hours! All businesses frozen. Compound can still be raided!",
    kind: "bad",
  });
}

export function settleHeat(p: Player, now: number) {
  // Check if arrest timer completed
  if (p.arrested_until && now >= p.arrested_until) {
    p.arrested_until = 0;
    p.heat = 20;
    p.heat_ts = now;
    p.log.unshift({
      t: now,
      msg: "Released from police lockup after serving 2 hours! Businesses resumed.",
      kind: "good",
    });
  }

  // If currently arrested, heat stays pinned at 100
  if (p.arrested_until && now < p.arrested_until) {
    p.heat = 100;
    p.heat_ts = now;
    return;
  }

  // Natural cooldown removed. Only Lay Low or bribes reduce heat.
  p.heat_ts = now;

  if (p.heat >= 100 && (!p.arrested_until || now >= p.arrested_until)) {
    triggerArrest(p, now);
  }
}

export function getRivalPower(rival: Rival, p: Player, now = Date.now() / 1000, opts: { raid?: boolean; raw?: boolean } = {}): number {
  const districtPower: Record<string, number> = {
    dockside: 45,
    market: 85,
    zongo: 140,
    osu: 220,
    kejetia: 330,
    hills: 480,
  };
  const base = districtPower[rival.district] || 100;
  let mult = 1.0;
  if (rival.id === "kpakpa") mult = 0.9;
  if (rival.id === "coastal") mult = 1.1;
  if (rival.id === "lions") mult = 1.25;
  if (rival.id === "nima") mult = 1.15;
  if (rival.id === "silk") mult = 1.2;
  if (rival.id === "cantonments") mult = 1.35;
  if (rival.id === "ashanti") mult = 1.25;
  if (rival.id === "kings") mult = 1.15;
  if (rival.id === "tema") mult = 1.2;
  if (rival.id === "circle") mult = 1.0;
  if (rival.id === "spintex") mult = 1.05;

  const grudge = p.grudges?.[rival.id] || 0;
  const grudgeMod = 1 + (grudge / 100) * 0.25; // up to +25% power when grudge is high

  // Check active assassin contract debuff
  const assassinHit = p.assassin_hits?.[rival.id];
  let assassinMult = 1.0;
  if (assassinHit && assassinHit.until > now) { // v9 fix: uses the action time, not Date.now()
    assassinMult = Math.max(0.2, 1.0 - assassinHit.power_cut);
  }

  const intim = 1 - luxuryEffects(p).intimidation / 100; // v9 boutique: rival intimidation
  if (opts.raw) return Math.round(base * mult * grudgeMod * assassinMult * intim);
  // v9 late game: syndicate growth (half strength for raids), district influence and the Feared Name legacy perk
  const growth = Number((p as any).syndicate?.rivals?.[rival.id]?.growth || 0) * (opts.raid ? 0.5 : 1);
  const infl = 1 - Math.min(0.4, influenceLvl(p, rival.district) * INFLUENCE_FX.rival_cut);
  const fear = 1 - 0.05 * legacyRank(p, "rival_cut");
  return Math.round(base * mult * grudgeMod * assassinMult * intim * (1 + growth) * infl * fear);
}


// ==========================================
// v9 LATE GAME (/game-review/late-game-ideas.md): syndicate expansion, legacy, city boss & events,
// districts, offshore, lieutenants, auction, kingpin tables, projects, personal bests.
// All new save fields live on the player object, are optional and are defaulted in migratePlayer (v4).
// ==========================================
const lgs = (p: Player): any => p as any;
const DAY_S = 86400;
const DISTRICT_TARGET: Record<string, number> = { dockside: 0.5, market: 0.65, zongo: 0.8, osu: 0.95, kejetia: 1.05, hills: 1.2 };
export const SYNDICATE_MIN_LEVEL = 8; // turf seizures only start once the empire is established
const NEUTRAL_EVENT = { id: "none", name: "Quiet week", desc: "", heat: 1, launder_cap: 1, front_dur: 1, bribe_cost: 1, bribe_loot: 0, income: 1, offshore: 0 };
let LT_AUTOMATING = false;

export function legacyRank(p: Player, id: string): number { return Number(lgs(p).legacy?.perks?.[id] || 0); }
export function isUnlocked(p: Player, gate?: string): boolean {
  if (!gate) return true;
  const g = GATED_CONTENT[gate];
  if (!g) return true;
  if ((lgs(p).unlocks || []).includes(gate)) return true;
  return !!(g.perk && legacyRank(p, g.perk) > 0);
}
export function batchSlots(p: Player) { return 2 + (p.build_slots || 0) + legacyRank(p, "batch_slot"); }
export function heistLimit(p: Player, now: number) {
  const today = p.heist_day?.day === dayKey(now);
  return DAILY_HEIST_BASE_LIMIT + legacyRank(p, "heist_slot") + (today ? p.heist_day.ad_extra || 0 : 0);
}
/** The weekly city event, read in ONE place by heatGain, frontCapacity, frontDuration, bribe and mult. */
export function cityMods(p?: Player) {
  // City events only bite once the late game starts (Boss level 8+), so new players aren't hit by a Heat Wave
  const id = p && (p.level || 1) >= SYNDICATE_MIN_LEVEL ? lgs(p).city?.event : null;
  return CITY_EVENTS.find((e) => e.id === id) || NEUTRAL_EVENT;
}
export function influenceLvl(p: Player, district?: string) { return district ? Number(lgs(p).influence?.[district] || 0) : 0; }
export function hourlyIncome(p: Player, now: number) {
  return Math.floor(totalRate(p, now) * 60);
}
export function respectFeeCut(p: Player) { return Math.min(0.05, (p.prestige?.respect || 0) * 0.0025); }
export function respectHeistMult(p: Player) { return 1 + Math.min(0.6, (p.prestige?.respect || 0) * 0.02); }

// ---- #1 Syndicate expansion ----
function synState(p: Player) {
  const L = lgs(p);
  if (!L.syndicate || typeof L.syndicate !== "object") L.syndicate = { day: "", rivals: {}, seized: {} };
  if (!L.syndicate.rivals) L.syndicate.rivals = {};
  if (!L.syndicate.seized) L.syndicate.seized = {};
  return L.syndicate as { day: string; rivals: Record<string, { growth: number; last_hit: number; turf: number }>; seized: Record<string, string> };
}
function rivalSt(p: Player, rid: string, now: number) {
  const s = synState(p);
  if (!s.rivals[rid]) s.rivals[rid] = { growth: 0, last_hit: now, turf: 0 };
  return s.rivals[rid];
}
export function seizedBy(p: Player, kind: "hustle" | "front", id: string): string | null {
  return lgs(p).syndicate?.seized?.[`${kind}:${id}`] || null;
}
export function seizeAsset(p: Player, rival: Rival, now: number): string | null {
  if (p.level < SYNDICATE_MIN_LEVEL) return null;
  if (influenceLvl(p, rival.district) >= 5) return null; // strong influence keeps the district loyal
  if (activeLieutenants(p).some((l) => l.district === rival.district)) return null; // a lieutenant defends it
  const s = synState(p);
  if (Object.values(s.seized).includes(rival.id)) return null; // one asset per rival
  const hid = Object.keys(p.hustles || {}).find((k) => HUSTLE_MAP[k]?.district === rival.district && !s.seized[`hustle:${k}`]);
  let key = "";
  let name = "";
  if (hid) {
    const hs = p.hustles[hid];
    (hs as any).bank = accrued(p, hid, now); // bank earnings so far: seizure pauses, never wipes
    hs.ts = now;
    key = `hustle:${hid}`;
    name = HUSTLE_MAP[hid].name;
  } else {
    const fid = Object.keys(p.fronts || {}).find((k) => (p.fronts[k] || 0) > 0 && FRONT_DISTRICT[k] === rival.district && !s.seized[`front:${k}`]);
    if (!fid) return null;
    key = `front:${fid}`;
    name = FRONT_MAP[fid]?.name || fid;
  }
  s.seized[key] = rival.id;
  rivalSt(p, rival.id, now).turf += 1;
  p.log.unshift({ t: now, msg: `TURF LOST: ${rival.name} seized your ${name}! It is offline until you win a hit, sign a treaty or contract the Ghost on them.`, kind: "bad" });
  return key;
}
export function releaseAssets(p: Player, rid: string, now: number): string[] {
  const s = synState(p);
  const freed: string[] = [];
  Object.entries(s.seized).forEach(([key, owner]) => {
    if (owner !== rid) return;
    delete s.seized[key];
    const [kind, id] = key.split(":");
    if (kind === "hustle" && p.hustles[id]) p.hustles[id].ts = now; // accrual resumes, banked cash kept
    freed.push(kind === "hustle" ? HUSTLE_MAP[id]?.name || id : FRONT_MAP[id]?.name || id);
  });
  if (freed.length) p.log.unshift({ t: now, msg: `TURF RETAKEN from ${RIVAL_MAP[rid]?.name || rid}: ${freed.join(", ")} back online.`, kind: "good" });
  return freed;
}
/** Once per day: rivals grow toward the player's power (higher districts aim higher) and unchecked ones seize turf. */
export function syndicateDaily(p: Player, now: number) {
  const s = synState(p);
  const first = !s.day;
  s.day = dayKey(now);
  const pow = calcPower(p);
  let seizedToday = 0;
  RIVALS.forEach((r) => {
    const st = rivalSt(p, r.id, now);
    if (first) return;
    if ((p.level || 1) < SYNDICATE_MIN_LEVEL) { st.last_hit = now; return; } // early game: rivals stay static
    const cur = getRivalPower(r, p, now);
    const target = pow * (DISTRICT_TARGET[r.district] || 0.8);
    let g = (st.growth || 0) + 0.02;
    if (cur < target) g += Math.min(0.5, (target / Math.max(1, cur) - 1) * 0.35);
    st.growth = Math.min(20, Math.round(g * 1000) / 1000);
    if (seizedToday === 0 && now - (st.last_hit || now) >= 3 * DAY_S && getRivalPower(r, p, now) > calcDefence(p)) {
      if (seizeAsset(p, r, now)) seizedToday++;
    }
  });
}

// ---- #8 Lieutenants ----
export function activeLieutenants(p: Player) {
  const L = lgs(p).lieutenants || {};
  return Object.entries(L).map(([cid, v]: any) => ({ cid, ...v, crew: p.crew.find((c) => c.id === cid) }))
    .filter((l: any) => l.crew && l.active !== false) as any[];
}
export function lieutenantUpkeep(p: Player, now: number) { return Math.max(LIEUTENANT.upkeep_min, hourlyIncome(p, now) * 2); }
function lieutenantDefence(p: Player) {
  return activeLieutenants(p).reduce((a, l) => a + Math.floor((crewStat(l.crew, "muscle", p) * 3 + l.crew.lvl * 3 + loadoutPower(p, l.crew.loadout)) * LIEUTENANT.defence_share), 0);
}
function lieutenantAutomation(p: Player, now: number) {
  const L = lgs(p);
  if (LT_AUTOMATING || (L.lt_last_auto || 0) > now - 60) return;
  const lts = activeLieutenants(p);
  if (!lts.length) return;
  L.lt_last_auto = now;
  if (p.arrested_until && now < p.arrested_until) return;
  LT_AUTOMATING = true;
  try {
    lts.forEach((l) => {
      // auto-collect hustles in the district (before they hit the offline cap)
      const hids = Object.keys(p.hustles).filter((k) => HUSTLE_MAP[k]?.district === l.district && !seizedBy(p, "hustle", k));
      hids.forEach((hid) => { if (accrued(p, hid, now) > 0) executeAction(p, "collect", { hid }, now); });
      // auto-collect finished batches and auto-launder through the district's fronts
      // p.batches.filter((b) => now >= b.end && FRONT_DISTRICT[b.front] === l.district).forEach((b) => executeAction(p, "collect_batch", { bid: b.id }, now));
      Object.keys(p.fronts).filter((f) => (p.fronts[f] || 0) > 0 && FRONT_DISTRICT[f] === l.district).forEach((fid) => {
        if (Number(p.dirty) > 0 && !p.batches.some((b) => b.front === fid)) executeAction(p, "launder", { fid }, now);
      });
    });
  } finally {
    LT_AUTOMATING = false;
  }
}

// ---- #3 City boss ----
export function cityBossHp(p: Player) { return Math.max(5000, (calcPower(p) + 100) * 200); }
function cityEnsure(p: Player, now: number) {
  const L = lgs(p);
  const wk = weekKey(now);
  if (L.city?.week === wk) return L.city;
  const idx = Math.floor(now / (7 * DAY_S));
  const hp = cityBossHp(p);
  L.city = { week: wk, boss: RIVALS[idx % RIVALS.length].id, event: CITY_EVENTS[idx % CITY_EVENTS.length].id, hp, max_hp: hp, claimed: [], funded: 0, dmg: { heist: 0, hit: 0, cash: 0 } };
  const ev = CITY_EVENTS[idx % CITY_EVENTS.length];
  p.log.unshift({ t: now, msg: `NEW WEEK: ${RIVAL_MAP[L.city.boss]?.boss || "The city boss"} rules Accra this week. City event: ${ev.name}.`, kind: "info" });
  return L.city;
}
export function cityDamage(p: Player, amount: number, source: "heist" | "hit" | "cash", now: number) {
  const C = cityEnsure(p, now);
  const dmg = Math.max(0, Math.floor(Math.min(amount, C.hp)));
  if (dmg <= 0) return 0;
  const wasAlive = C.hp > 0;
  C.hp -= dmg;
  C.dmg[source] = (C.dmg[source] || 0) + dmg;
  if (wasAlive && C.hp <= 0) {
    bestsInc(p, "city_kills");
    p.log.unshift({ t: now, msg: `CITY BOSS DOWN! ${RIVAL_MAP[C.boss]?.boss || "The boss"} is finished for the week. Claim the 100% loot in Kingpin HQ.`, kind: "good" });
  }
  return dmg;
}
function cityFundCostPerPct(p: Player, now: number) { return Math.max(2000, Math.floor(hourlyIncome(p, now) * 0.5)); }

// ---- #5 Legendary crew auction ----
function auctionEnsure(p: Player, now: number) {
  const L = lgs(p);
  const dk = dayKey(now);
  if (L.auction?.day === dk) return L.auction;
  const dayIdx = Math.floor(now / DAY_S);
  const archs = Object.keys(ARCHETYPES);
  const c = genCrew(archs[dayIdx % archs.length], Math.max(8, Math.min(40, p.level + 3)));
  Object.keys(c.stats).forEach((k) => (c.stats[k] = Math.min(CREW_STAT_MAX, c.stats[k] + 4)));
  const bg = LEGENDARY_BACKGROUNDS[dayIdx % LEGENDARY_BACKGROUNDS.length];
  (c as any).legendary = true;
  c.origin = bg.title;
  c.bio = bg.bio;
  c.morale = 100;
  c.daily_rate = calcCrewDailyRate(c);
  const start = Math.max(1_000_000, hourlyIncome(p, now) * 48);
  L.auction = { day: dk, t0: dayIdx * DAY_S, crew: c, start, floor: Math.floor(start * 0.4), bought: false };
  return L.auction;
}
export function auctionPrice(a: any, now: number) {
  const f = Math.max(0, Math.min(1, (now - a.t0) / DAY_S));
  return Math.floor(a.start - (a.start - a.floor) * f);
}

// ---- #9 personal bests / net worth ----
function bests(p: Player) { const L = lgs(p); if (!L.bests || typeof L.bests !== "object") L.bests = {}; return L.bests as Record<string, number>; }
function bestsMax(p: Player, k: string, v: number) { const b = bests(p); if (!(b[k] >= v)) b[k] = v; }
function bestsInc(p: Player, k: string, by = 1) { const b = bests(p); b[k] = (b[k] || 0) + by; }
export function netWorth(p: Player) {
  const lux = luxuryOwnedIds(p).reduce((a, id) => a + (LUXURY_MAP[id]?.price || 0), 0);
  const biz = Object.entries(p.hustles || {}).reduce((a, [k, v]: any) => a + (HUSTLE_MAP[k]?.cost || 0) * (v.lvl || 1), 0)
    + Object.entries(p.fronts || {}).reduce((a, [k, v]: any) => a + (FRONT_MAP[k]?.cost || 0) * (v || 0), 0);
  return Number(p.dirty || 0) + Number(p.clean || 0) + lux + biz;
}

/** Called at the end of tickPlayer. Daily/weekly rollovers + projects + lieutenants + bests. */
// ---- v9 economy: legit fronts declare taxable income (CLEAN), and a street changer is the early laundering path ----
export const FRONT_DECLARED_RATE = 0.004; // of the front's base price, per hour, per level
export function frontDeclaredPerHour(p: Player, fid: string) {
  const f = FRONT_MAP[fid]; const lvl = p.fronts?.[fid] || 0;
  if (!f || lvl < 1 || seizedBy(p, "front", fid)) return 0;
  const cm = conditionMult(frontCond(p, fid));
  return Math.max(0, Math.floor(f.cost * FRONT_DECLARED_RATE * lvl * cm));
}
function frontDeclaredTick(p: Player, now: number) {
  const P = p as any;
  if (!P.front_income_ts || typeof P.front_income_ts !== "object") P.front_income_ts = {};
  if (!P.front_income_frac || typeof P.front_income_frac !== "object") P.front_income_frac = {};
  let total = 0;
  Object.keys(p.fronts || {}).forEach((fid) => {
    const last = Number(P.front_income_ts[fid]) || now;
    const el = Math.max(0, Math.min(now - last, offlineCap(p)));
    P.front_income_ts[fid] = now;
    const earned = (frontDeclaredPerHour(p, fid) / 3600) * el + (Number(P.front_income_frac[fid]) || 0);
    const whole = Math.floor(earned);
    P.front_income_frac[fid] = Math.round((earned - whole) * 100) / 100;
    total += whole;
  });
  if (total > 0) {
    addCash(p, "clean", BigInt(total));
    recordCash(p, now, total, "clean", "Fronts", "Front declared income");
    p.lifetime = (BigInt(p.lifetime) + BigInt(total)).toString();
  }
}
export const STREET_LAUNDER = { rate: 0.6, cd: 900, heat: 4, base: 2000, per_level: 3000 };
export function streetLaunderMax(p: Player) { return STREET_LAUNDER.base + STREET_LAUNDER.per_level * Math.max(1, p.level || 1); }

function lateGameTick(p: Player, now: number) {
  frontDeclaredTick(p, now);
  const L = lgs(p);
  const dk = dayKey(now);
  cityEnsure(p, now);
  if (synState(p).day !== dk) syndicateDaily(p, now);
  if (L.lg_day !== dk) {
    const firstDay = !L.lg_day;
    L.lg_day = dk;
    if (!firstDay) {
      Object.entries(L.lieutenants || {}).forEach(([cid, lt]: any) => {
        const c = p.crew.find((x) => x.id === cid);
        if (!c) { delete L.lieutenants[cid]; return; }
        const up = lieutenantUpkeep(p, now);
        if (BigInt(p.clean) >= BigInt(up)) {
          addCash(p, "clean", -BigInt(up));
          recordCash(p, now, -up, "clean", "Lieutenants", `Daily upkeep for ${c.name}`);
          lt.active = true;
        } else {
          lt.active = false;
          c.morale = Math.max(0, (c.morale ?? 85) - 20);
          p.log.unshift({ t: now, msg: `Lieutenant ${c.name} went unpaid (needs GH₵${up.toLocaleString()} clean) and stood down for the day.`, kind: "bad" });
        }
      });
    }
  }
  // Empire Projects: finish stages whose timer ran out
  Object.entries(L.projects || {}).forEach(([pid, st]: any) => {
    const P = PROJECT_MAP[pid];
    if (!P || !st.running || now < st.ready_at) return;
    st.running = false;
    st.stage += 1;
    p.crew.forEach((c) => { if (c.assign === `project:${pid}`) c.assign = null; });
    if (st.stage >= P.stages.length) {
      st.done = true;
      if (!L.unlocks.includes(P.unlock)) L.unlocks.push(P.unlock);
      p.log.unshift({ t: now, msg: `EMPIRE PROJECT COMPLETE: ${P.name}! ${P.unlock_label} unlocked.`, kind: "good" });
    } else {
      p.log.unshift({ t: now, msg: `${P.name}: stage ${st.stage}/${P.stages.length} finished. Fund the next stage to continue.`, kind: "info" });
    }
  });
  lieutenantAutomation(p, now);
  bestsMax(p, "net_worth", netWorth(p));
  bestsMax(p, "lifetime", Number(p.lifetime || 0));
  bestsMax(p, "level", p.level);
  bestsMax(p, "respect", p.prestige?.respect || 0);
}

export function lateGameDerived(p: Player, now: number) {
  const L = lgs(p);
  const C = cityEnsure(p, now);
  const hourly = hourlyIncome(p, now);
  const cleanN = Number(p.clean || 0);
  const dirtyN = Number(p.dirty || 0);
  const ev = cityMods(p);
  const claimable = CITY_BOSS_MILESTONES.filter((m) => C.hp <= C.max_hp * (1 - m / 100) && !C.claimed.includes(m));
  const A = auctionEnsure(p, now);
  const s = synState(p);
  const rivals = Object.fromEntries(RIVALS.map((r) => {
    const st = s.rivals[r.id] || { growth: 0, last_hit: now, turf: 0 };
    const seized = Object.entries(s.seized).filter(([, o]) => o === r.id).map(([k]) => k);
    const unchecked = now - (st.last_hit || now);
    return [r.id, { growth: st.growth || 0, turf: st.turf || 0, seized, unchecked_days: Math.floor(unchecked / DAY_S), threat: p.level >= SYNDICATE_MIN_LEVEL && unchecked >= 2 * DAY_S && getRivalPower(r, p, now) > calcDefence(p) }];
  }));
  const tokens = Number(L.legacy?.tokens || 0);
  const perks = LEGACY_PERKS.map((x) => ({ ...x, rank: legacyRank(p, x.id), can_buy: legacyRank(p, x.id) < x.max && tokens >= x.cost }));
  const projects = PROJECTS.map((P) => {
    const st = L.projects?.[P.id] || { stage: 0, running: false, ready_at: 0, done: false };
    const next = st.done ? null : P.stages[st.stage];
    const idle = p.crew.filter((c) => !c.assign && !c.merc && !crewOut(c)).length;
    const can_fund = !!next && !st.running && p.level >= P.min_level && dirtyN >= next.dirty && cleanN >= next.clean && idle >= next.crew;
    return { ...P, stage: st.stage, running: !!st.running, ready_at: st.ready_at || 0, done: !!st.done, next, can_fund, locked: p.level < P.min_level };
  });
  const influence = DISTRICTS.map((d: any) => {
    const lvl = influenceLvl(p, d.id);
    return { id: d.id, name: d.name, lvl, max: INFLUENCE_MAX, cost: lvl < INFLUENCE_MAX ? influenceCost(lvl) : 0, income_pct: Math.round(lvl * INFLUENCE_FX.income * 100), front_pct: Math.round(lvl * INFLUENCE_FX.front_cap * 100), rival_pct: Math.round(lvl * INFLUENCE_FX.rival_cut * 100), fronts: Object.keys(FRONT_DISTRICT).filter((f) => FRONT_DISTRICT[f] === d.id) };
  });
  const off = L.offshore?.day === dayKey(now) ? L.offshore : { count: 0, total: 0 };
  const hasHacker = offshoreHacker(p);
  const lts = Object.entries(L.lieutenants || {}).map(([cid, v]: any) => ({ cid, ...v, name: p.crew.find((c) => c.id === cid)?.name || "?" }));
  const scaled = {
    daily: Math.max(100 * ((p.streak?.count || 0) + 1), Math.floor(hourly * 0.15 * Math.min(10, (p.streak?.count || 0) + 1))),
    contract: Math.floor(hourly * 0.25),
    elite: Math.floor(hourly * 2),
    pass_per_tier: Math.floor(hourly * 0.05),
  };
  const gated = Object.fromEntries(Object.keys(GATED_CONTENT).map((g) => [g, { unlocked: isUnlocked(p, g), label: GATED_CONTENT[g].label }]));
  const projBadge = projects.filter((x) => x.can_fund).length;
  const perkBadge = perks.some((x) => x.can_buy) ? 1 : 0;
  const badge = claimable.length + projBadge + perkBadge;
  const P = p as any;
  const street = { rate: STREET_LAUNDER.rate, max: streetLaunderMax(p), cd_left: Math.max(0, (Number(P.street_launder_until) || 0) - now), cd: STREET_LAUNDER.cd };
  const declared = Object.fromEntries(Object.keys(p.fronts || {}).map((fid) => [fid, frontDeclaredPerHour(p, fid)]));
  return {
    street,
    declared,
    declared_total: Object.values(declared).reduce((a: number, b: any) => a + b, 0),
    hourly,
    event: ev,
    city: { ...C, boss_name: RIVAL_MAP[C.boss]?.boss, boss_gang: RIVAL_MAP[C.boss]?.name, pct: Math.round((1 - C.hp / C.max_hp) * 1000) / 10, claimable, milestones: CITY_BOSS_MILESTONES, fund_cost_per_pct: cityFundCostPerPct(p, now), fund_left_pct: Math.max(0, 50 - Math.floor((C.dmg.cash / C.max_hp) * 100)) },
    rivals,
    seized: s.seized,
    legacy: { tokens, earned: Number(L.legacy?.earned || 0), retires: Number(L.legacy?.retires || 0), perks, retire_tokens: retireTokens(Number(p.lifetime || 0)), retire_min: RETIRE_MIN_LIFETIME, retire_respect: 2 * Math.max(1, Math.floor(Math.sqrt(Math.max(0, Number(p.lifetime || 0)) / 1_000_000))), fee_cut_pct: Math.round(respectFeeCut(p) * 1000) / 10, heist_bonus_pct: Math.round((respectHeistMult(p) - 1) * 100) },
    gated,
    influence,
    offshore: { ...OFFSHORE, rate: offshoreRate(Math.floor(now / DAY_S), p.heat, ev.offshore), risk: Math.min(OFFSHORE.max_risk, OFFSHORE.base_risk + p.heat * OFFSHORE.risk_per_heat), used: off.count || 0, used_total: off.total || 0, has_hacker: hasHacker },
    lieutenants: { list: lts, max: LIEUTENANT.max, min_lvl: LIEUTENANT.min_lvl, upkeep: lieutenantUpkeep(p, now), promote_cost: LIEUTENANT.promote_cost(lts.length) },
    auction: { ...A, price: auctionPrice(A, now), ends: A.t0 + DAY_S },
    kingpin: { tables: KINGPIN_TABLES, chips: Number(L.chips || 0), shop: CHIP_SHOP },
    projects,
    bests: { ...bests(p), net_worth_now: netWorth(p) },
    scaled,
    elite_min_level: ELITE_MIN_LEVEL,
    upgrade_clean: Object.fromEntries(Object.keys(UPGRADES).filter((k) => k !== "vault").map((k) => [k, upgradeCleanCost(p.upgrades?.[k] || 0)])),
    badge,
    badges: { city: claimable.length, projects: projBadge, legacy: perkBadge },
  };
}
function offshoreHacker(p: Player) {
  const ids = [...Object.values(p.front_assign || {}), ...activeLieutenants(p).map((l) => l.cid)];
  return p.crew.some((c) => c.arch === "hacker" && ids.includes(c.id));
}
/** v9 fix: upgrades now also cost clean cash after the first level (they used to cost only skill points). */
export function upgradeCleanCost(current: number) { return current < 1 ? 0 : Math.floor(2500 * Math.pow(3, current - 1)); }

export function generateAgencyRecruits(p: Player): any[] {
  const baseRecruitCost = getCrewHireBaseCost();
  const archKeys = Object.keys(ARCHETYPES) as Array<"driver" | "enforcer" | "hacker" | "infiltrator">;
  // Produce 6 randomized recruits
  const count = 6;
  const shuffledPool = [...archKeys, ...archKeys, ...archKeys].sort(() => Math.random() - 0.5);

  const recruits: any[] = [];
  for (let i = 0; i < count; i++) {
    const arch = shuffledPool[i % shuffledPool.length];
    const lvlDelta = Math.floor(Math.random() * 4) - 1; // -1 to +2
    const lvl = Math.max(1, (p.level || 1) + lvlDelta);
    const crewBase = genCrew(arch, lvl, true);
    const isElite = (crewBase.recruit_tier || 1) >= 3;
    const hirePrice = crewBase.hire_cost || 9000;
    const cleanPrice = Math.round(hirePrice * 0.6);

    const r = {
      ...crewBase,
      price: hirePrice,
      clean_price: cleanPrice,
      elite: isElite,
      daily_rate: crewBase.daily_rate || calcCrewDailyRate(crewBase),
    };
    recruits.push(r);
  }
  return recruits;
}

export function generateStore(p: Player, now: number) {
  const bought = p.store?.bought || [];
  const countBought = (id: string) => bought.filter((x) => x === id).length;
  const currentSlot = Math.floor(now / (12 * H)) + (p.store?.offset || 0);

  // Black Market: strictly limit to 5 items showing, quantity 1 per day, prices starting from 3,000+
  const bmShuffled = [...BLACK_MARKET].sort((a, b) => {
    const hA = (a.id + currentSlot).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const hB = (b.id + currentSlot).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return (hA % 17) - (hB % 17);
  });
  const bmList = bmShuffled.slice(0, 5).map((item) => ({
    ...item,
    price: Math.max(3000, item.price),
    left: Math.max(0, 1 - countBought(item.id)), // Quantity is 1 per cycle for black market items
  }));

  const weapons = GEAR.filter((g) => ["melee", "primary", "secondary"].includes(g.slot)).map((g) => ({
    ...g,
    subcategory: g.slot,
    left: Math.max(0, 1 - countBought(g.id)), // Weapons in Gun Shop restricted to 1
  }));

  const clothes = GEAR.filter((g) => ["hat", "top", "bottom", "shoes"].includes(g.slot)).map((g) => ({
    ...g,
    clean: g.price,
    left: Math.max(0, 1 - countBought(g.id)),
  }));

  // Store agency recruits persistently per store slot so IDs do not cycle on every tick
  if (!p.store) {
    p.store = { slot: currentSlot, offset: 0, bought: [] };
  }
  if (!p.store.agency || p.store.slot !== currentSlot) {
    p.store.slot = currentSlot;
    p.store.agency = generateAgencyRecruits(p);
    p.store.bought = []; // Reset purchased items on restock
  }

  const agencyRecruits: CrewMember[] = (p.store.agency || [])
    .filter((c) => !p.crew.some((x) => x.id === c.id) && !bought.includes(c.id))
    .map((c) => ({
      ...c,
      daily_rate: c.daily_rate || calcCrewDailyRate(c),
      hired: false,
    } as any));

  const boutique = BOUTIQUE_CATALOG.map((item, idx) => {
    const seed = (item.id + (p.store?.offset || 0)).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const hasTier2 = (seed % 100) < Math.floor((item.tier2_chance || 0.65) * 100);
    const t2Key = hasTier2 ? TIER2_LIST[(seed + idx) % TIER2_LIST.length].id : null;
    return {
      ...item,
      tier2: t2Key,
      tier2_cat: t2Key ? TIER2_CATEGORIES[t2Key] : null,
      clean: item.price,
      left: Math.max(0, 1 - countBought(item.id)),
    };
  });

  return {
    black_market: bmList,
    gun_shop: weapons,
    gun_shop_subcategories: GUN_SHOP_SUBCATEGORIES,
    clothes: clothes,
    boutique: boutique,
    boutique_subcategories: BOUTIQUE_SUBCATEGORIES,
    agency: agencyRecruits,
  };
}

export function calcDerived(p: Player, now: number) {
  syncTestShift(p);
  settleHeat(p, now);
  const tier = heatTier(p.heat);
  const tierObj = HEAT_TIERS[tier - 1] || { tier: 0, name: "Low Profile" };
  const rate = totalRate(p, now);
  const vCap = vaultCap(p);
  const def = calcDefence(p);
  const pow = calcPower(p);
  const fee = launderFee(p.heat, p); // v9 bug fix: perks now apply to the displayed fee

  const hustlesAcc: Record<string, {
    rate: number;
    next_rate: number;
    cost: number;
    today_earned: number;
    daily_cap: number | null;
    daily_capped: boolean;
    has_manager?: boolean;
    managers?: string[];
    remaining_today: number;
    real_range: string;
    real_desc?: string;
    lvl: number;
    max_lvl: number;
    upgrade_cost: number;
    condition: number;
    condition_state: ConditionTier;
    repair: ReturnType<typeof repairCosts>;
    accrued: number;
  }> = {};
  HUSTLES.forEach((h) => {
    const lvl = p.hustles[h.id]?.lvl || 0;
    const todayEarned = getHustleTodayEarned(p, h.id, now);
    const plot = (p.player_plots || []).find((pl) => pl.hustleID === h.id);
    const hc = hustleCond(p, h.id, plot?.plotID);
    const hasManager = plot ? hustleManagers(p, h.id, plot.plotID).length > 0 : false;
    const mgrs = plot ? hustleManagers(p, h.id, plot.plotID) : [];
    const baseHustleRate = hustleRate(h, 1, p, now);
    hustlesAcc[h.id] = {
      rate: baseHustleRate,
      next_rate: baseHustleRate,
      cost: hustleCost(h, lvl, now),
      today_earned: todayEarned,
      daily_cap: null, // v9: managers no longer cap income
      daily_capped: false,
      has_manager: hasManager,
      managers: mgrs,
      remaining_today: Infinity,
      lvl: 1,
      max_lvl: 1,
      upgrade_cost: 0, // Side hustle upgrade removed
      condition: round2(hc),
      condition_state: conditionTier(hc),
      repair: repairCosts("hustle", h.id, lvl || 1, hc),
      accrued: lvl > 0 ? accrued(p, h.id, now) : 0,
      real_range: `GH₵${h.income}/min (base)`,
      real_desc: h.real_desc,
      seized_by: seizedBy(p, "hustle", h.id),
      locked: !isUnlocked(p, h.gate),
    } as any;
  });

  const cds = p.cooldowns || { launder_until: 0, heist_until: 0, front: {} };
  const launderLeft = Math.max(0, (cds.launder_until || 0) - now);
  const frontsAcc: Record<string, any> = {};
  FRONTS.forEach((f) => {
    const lvl = p.fronts[f.id] || 0;
    const fc = frontCond(p, f.id);
    frontsAcc[f.id] = {
      cap: frontCapacity(p, f, Math.max(1, lvl)),
      cost: frontCost(f, lvl),
      dur: frontDuration(f, p),
      fee: launderFee(p.heat, p, f.id),
      condition: round2(fc),
      condition_state: conditionTier(fc),
      repair: repairCosts("front", f.id, lvl || 1, fc),
      has_manager: !!p.front_assign?.[f.id],
      seized_by: seizedBy(p, "front", f.id),
      locked: !isUnlocked(p, f.gate),
      district: FRONT_DISTRICT[f.id] || null,
      cooldown_left: Math.max(0, (cds.front?.[f.id] || 0) - now),
    };
  });

  const upgradesAcc: Record<string, number> = {};
  Object.entries(UPGRADES).forEach(([k, up]) => {
    const current = p.upgrades[k] || 0;
    upgradesAcc[k] = k === "vault" ? vaultUpgradeCost(current) : Math.floor(up.cost * Math.pow(1.5, current));
  });

  const growTimes: Record<string, number> = {};
  const prices: Record<string, number> = {};
  const lightUp = p.farm?.up?.lights || 0;
  STRAINS.forEach((s) => {
    growTimes[s.id] = Math.max(10, Math.floor(s.grow * (1 - lightUp * 0.1)));
    prices[s.id] = s.price;
  });
  const upCost: Record<string, number> = {};
  Object.entries(FARM.upgrades).forEach(([k, up]) => {
    const lvl = p.farm?.up?.[k] || 0;
    upCost[k] = Math.floor(up.cost * Math.pow(1.8, lvl));
  });
  const plotCost = Math.floor(FARM.plot_cost * Math.pow(FARM.plot_growth, p.farm?.plots?.length || 0));

  const crewEff: Record<string, Record<string, number>> = {};
  const crewWpow: Record<string, number> = {};
  p.crew.forEach((c) => {
    crewEff[c.id] = {
      brains: crewStat(c, "brains", p),
      wheels: crewStat(c, "wheels", p),
      muscle: crewStat(c, "muscle", p),
      stealth: crewStat(c, "stealth", p),
    };
    crewWpow[c.id] = loadoutPower(p, c.loadout);
  });

  const store = generateStore(p, now);
  const storeNext = (Math.floor(now / (12 * H)) + 1) * (12 * H);

  const facCondition = p.facility_condition || {};
  const facAssign = p.facility_assign || {};

  let totalBuiltCond = 0;
  let builtCount = 0;

  const facilitiesList = Object.entries(MANSION_FACILITIES).map(([fid, fac]) => {
    const lvl = p.facilities?.[fid] || 0;
    const condition = round2(facCondition[fid] !== undefined ? facCondition[fid] : 100);
    if (lvl > 0) {
      totalBuiltCond += condition;
      builtCount += 1;
    }
    const condition_state = conditionTier(condition);
    const assignedCids = facAssign[fid] || [];
    const assignedCrew = assignedCids.map((cid) => p.crew.find((c) => c.id === cid)).filter(Boolean);
    const maxCrewSlots = lvl >= 2 ? 2 : 1;
    const canUpgrade = lvl < fac.max;
    const uc = facilityUpgradeCost(fid, lvl);
    const costDirty = uc.dirty;
    const costClean = uc.clean;
    const rc = repairCosts("facility", fid, lvl, condition);
    const quickRepairDirty = rc.quick_dirty;
    const overhaulRepairDirty = rc.overhaul_dirty;
    const overhaulRepairClean = rc.overhaul_clean;

    return {
      ...fac,
      lvl,
      condition,
      condition_state,
      assigned_crew: assignedCrew,
      max_crew_slots: maxCrewSlots,
      can_upgrade: canUpgrade,
      cost_dirty: costDirty,
      cost_clean: costClean,
      quick_repair_dirty: quickRepairDirty,
      overhaul_repair_dirty: overhaulRepairDirty,
      overhaul_repair_clean: overhaulRepairClean,
    };
  });

  const baseIntegrity = builtCount > 0 ? Math.round(totalBuiltCond / builtCount) : 100;

  const bossPerksList = Object.entries(BOSS_PERKS).map(([pid, perk]) => {
    const rank = p.boss_perks?.[pid] || 0;
    const max = Math.min(perk.max, BOSS_PERK_MAX_RANK);
    return {
      ...perk,
      max,
      rank: Math.min(rank, max),
      can_upgrade: rank < max,
    };
  });

  // ---- v9: land (each street hustle runs on one land plot) ----
  const plots = (p.player_plots || INITIAL_PLAYER_PLOTS).map((pl) => ({
    plotID: pl.plotID,
    streetName: pl.streetName || GHANA_STREET_NAMES[pl.plotID] || `Plot ${pl.plotID + 1}`,
    customName: pl.customName || undefined,
    isUnlocked: !!pl.isUnlocked,
    plotUnlockFee: landFee(pl.plotID),
    hustleID: pl.hustleID || null,
    hustle: pl.hustleID ? HUSTLE_MAP[pl.hustleID] || null : null,
    building: pl.building || null,
  }));
  const freePlots = plots.filter((pl) => pl.isUnlocked && !pl.hustleID && !pl.building).length;
  const nextLand = plots.find((pl) => !pl.isUnlocked) || null;
  const firstClaimed = !!(p as any).first_business_claimed;

  // ---- v9: cooldowns ----
  const heistLeft = Math.max(0, (cds.heist_until || 0) - now);
  const cooldowns = {
    launder_left: launderLeft,
    launder_until: cds.launder_until || 0,
    heist_left: heistLeft,
    heist_until: cds.heist_until || 0,
    heist_left_by: Object.fromEntries(HEISTS.map((t) => [t.id, heistCooldownLeft(p, t.id, now)])),
    heist_until_by: Object.fromEntries(HEISTS.map((t) => [t.id, Number(cds.heist_by?.[t.id] || 0)])),
    front_left: Object.fromEntries(FRONTS.map((f) => [f.id, Math.max(0, (cds.front?.[f.id] || 0) - now)])),
    front_until: Object.fromEntries(FRONTS.map((f) => [f.id, cds.front?.[f.id] || 0])),
    robbery_left_by: Object.fromEntries(ROBBERIES.map((t) => [t.id, Math.max(0, (cds.robbery_by?.[t.id] || 0) - now)])),
    robbery_until_by: Object.fromEntries(ROBBERIES.map((t) => [t.id, Number(cds.robbery_by?.[t.id] || 0)])),
    robbery_global_left: Math.max(0, (cds.robbery_until || 0) - now),
    robbery_global_until: cds.robbery_until || 0,
    gf_date_left_by: Object.fromEntries(GIRLFRIENDS.map((g) => [g.id, Math.max(0, (cds.gf_date_by?.[g.id] || 0) - now)])),
    gf_date_until_by: Object.fromEntries(GIRLFRIENDS.map((g) => [g.id, Number(cds.gf_date_by?.[g.id] || 0)])),
    gf_court_left_by: Object.fromEntries(GIRLFRIENDS.map((g) => [g.id, Math.max(0, (cds.gf_court_by?.[g.id] || 0) - now)])),
    gf_court_until_by: Object.fromEntries(GIRLFRIENDS.map((g) => [g.id, Number(cds.gf_court_by?.[g.id] || 0)])),
  };

  // ---- v9: notification badges (pure functions of state: they clear as soon as the player acts) ----
  const dirtyN = Number(p.dirty || 0);
  const cleanN = Number(p.clean || 0);
  const isArr = p.arrested_until ? now < p.arrested_until : false;
  const ownedHustles = Object.keys(p.hustles || {}).filter((k) => HUSTLE_MAP[k]);
  const ownedFronts = FRONTS.filter((f) => (p.fronts[f.id] || 0) > 0);
  const hustleCollect = ownedHustles.filter((k) => !hustlesAcc[k].has_manager && hustlesAcc[k].accrued >= Math.max(1, hustlesAcc[k].rate * 5)).length;
  const hustleWorn = ownedHustles.filter((k) => hustleCond(p, k) < CONDITION_THRESHOLDS.operational).length;
  const hustleUpg = 0; // Side hustle upgrade removed
  const slotsMax = batchSlots(p);
  const freeSlot = p.batches.length < slotsMax;
  const frontReadyIds = ownedFronts
    .filter((f) => freeSlot && !isArr && launderLeft <= 0 && cooldowns.front_left[f.id] <= 0 && frontsAcc[f.id].cap > 0 && dirtyN > 0 && !p.batches.some((b) => b.front === f.id))
    .map((f) => f.id);
  const batchReady = p.batches.filter((b) => now >= b.end).length;
  const frontWorn = ownedFronts.filter((f) => frontCond(p, f.id) < CONDITION_THRESHOLDS.operational).length;
  const frontUpg = FRONTS.filter((f) => (p.fronts[f.id] || 0) > 0 && cleanN >= frontsAcc[f.id].cost).length;
  // land badges: free first business, next land affordable (clean), or an owned empty land with an affordable hustle
  const idleCrew = p.crew.filter((c) => !c.assign && !c.merc && !crewOut(c)).length;
  const startable = HUSTLES.filter((h) => isUnlocked(p, h.gate) && cleanN >= hustleCost(h, 0) && idleCrew >= (h.build_crew || 1));
  const landClaim = firstClaimed ? 0 : 1;
  const plotUnlock = firstClaimed && nextLand && cleanN >= nextLand.plotUnlockFee && startable.length ? 1 : 0;
  const plotUpg = firstClaimed && freePlots > 0 && startable.length ? 1 : 0; // "start a hustle on your empty land"
  const facWornIds = facilitiesList.filter((f) => f.lvl > 0 && f.condition < CONDITION_THRESHOLDS.operational).map((f) => f.id || "");
  const facUpgIds = facilitiesList.filter((f) => f.can_upgrade && dirtyN >= f.cost_dirty && cleanN >= f.cost_clean).map((f) => f.id || "");
  const facStationIds = idleCrew > 0 ? facilitiesList.filter((f) => f.lvl > 0 && f.assigned_crew.length < f.max_crew_slots).map((f) => f.id || "") : [];
  const vaultUpg = (p.upgrades?.vault || 0) < UPGRADES.vault.max && cleanN >= upgradesAcc.vault ? 1 : 0;
  const heistClaim = p.heists.filter((h: any) => h.end <= now).length;
  const heistLimitHit = (p.heist_day?.day === dayKey(now) ? p.heist_day.count : 0) >= heistLimit(p, now);
  // v9: per-heist cooldowns. Badge counts heists that came off their 8h lock and are ready to run again.
  const heistReadyIds = HEISTS.filter((t) => (p.cooldowns?.heist_by?.[t.id] || 0) > 0 && heistCooldownLeft(p, t.id, now) <= 0 && isUnlocked(p, t.gate)).map((t) => t.id);
  const heistReady = !isArr && !heistLimitHit ? heistReadyIds.length : 0;
  const facilitiesBadge = facWornIds.length + facUpgIds.length + facStationIds.length;
  const compoundBadge = vaultUpg;
  const bossBadge = (p.skill_points || 0) > 0 && bossPerksList.some((bp: any) => bp.can_upgrade) ? 1 : 0;
  const empireBadge = hustleCollect + hustleWorn + frontReadyIds.length + batchReady + frontWorn + frontUpg + landClaim + plotUnlock + plotUpg;
  // v9 boutique
  const luxRot = luxuryRotation(now);
  const luxOwned = (p as any).luxury || {};
  
  const luxItems = LUXURY_CATALOG.map((it) => {
    const price = luxuryPrice(it.id, now);
    const available = !it.limited || luxRot.ids.includes(it.id);
    const ownedQty = typeof luxOwned[it.id] === "number" ? (luxOwned[it.id] > 1000000000 ? 1 : luxOwned[it.id]) : (luxOwned[it.id] ? 1 : 0);
    const isOwned = ownedQty > 0;
    const canBuyMore = available && ownedQty < 999999 && cleanN >= price;
    return {
      ...it,
      price,
      base_price: it.price,
      owned: isOwned,
      owned_qty: ownedQty,
      owned_at: luxOwned[it.id] || 0,
      available,
      deal: luxRot.deal === it.id,
      affordable: canBuyMore,
      can_buy_more: canBuyMore,
    };
  });
  const luxAffordableNew = luxItems.filter((i) => i.affordable && !((p as any).lux_seen || []).includes(i.id)).map((i) => i.id);
  const luxRotNew = (p as any).lux_rot_seen !== luxRot.idx ? 1 : 0;
  const luxNext = luxItems.filter((i) => !i.owned && i.available).sort((a, b) => a.price - b.price)[0] || null;
  const luxury = {
    items: luxItems,
    categories: LUXURY_CATEGORIES,
    effects: luxuryEffects(p),
    sets: luxurySetProgress(p),
    rotation: luxRot,
    owned_count: luxItems.filter((i) => i.owned).length,
    total: luxItems.length,
    estate_value: luxItems.reduce((a, i) => a + i.base_price * (i.owned_qty || 0), 0),
    next_id: luxNext?.id || null,
    affordable_new: luxAffordableNew,
    badge: luxAffordableNew.length + luxRotNew,
  };

  const workshopBenches = (p.workshop?.benches || []).map((b, i) => {
    const w = CRAFTABLE_WEAPONS.find((x) => x.id === b.weaponId);
    return {
      ...b,
      idx: i,
      weapon: w,
      ready: b.weaponId && now >= b.end,
      rem: b.weaponId ? Math.max(0, b.end - now) : 0,
      pct: b.weaponId ? Math.min(100, Math.round(((now - b.start) / (b.end - b.start)) * 100)) : 0,
    };
  });
  const workshopUpCosts = Object.fromEntries(
    Object.entries(WORKSHOP.upgrades).map(([k, up]) => {
      const lvl = p.workshop?.up?.[k] || 0;
      return [k, Math.round(up.cost * Math.pow(1.8, lvl))];
    })
  );
  const workshopBenchCost = Math.floor(WORKSHOP.bench_cost * Math.pow(WORKSHOP.bench_growth, (p.workshop?.benches?.length || 1) - 1));

  const methlabBenches = (p.methlab?.benches || []).map((b, idx) => {
    const prod = b.productId ? METHLAB_MAP[b.productId] : null;
    const ready = b.productId && b.start > 0 ? now >= b.end : false;
    const pct = b.productId && b.start > 0 && b.end > b.start ? Math.min(100, Math.round(((now - b.start) / (b.end - b.start)) * 100)) : 0;
    return {
      ...b,
      idx,
      product: prod,
      ready,
      pct,
      left: b.end > now ? Math.max(0, Math.ceil(b.end - now)) : 0,
    };
  });
  const methlabUpCosts = Object.fromEntries(
    Object.entries(METHLAB.upgrades).map(([k, up]) => {
      const lvl = p.methlab?.up?.[k] || 0;
      return [k, Math.round(up.cost * Math.pow(1.8, lvl))];
    })
  );
  const methlabBenchCost = Math.floor(METHLAB.bench_cost * Math.pow(METHLAB.bench_growth, (p.methlab?.benches?.length || 1) - 1));

  const miningRigs = (p.mining?.rigs || []).map((r, idx) => {
    const min = r.mineralId ? MINERAL_MAP[r.mineralId] : null;
    const ready = r.mineralId && r.start > 0 ? now >= r.end : false;
    const pct = r.mineralId && r.start > 0 && r.end > r.start ? Math.min(100, Math.round(((now - r.start) / (r.end - r.start)) * 100)) : 0;
    return {
      ...r,
      idx,
      mineral: min,
      ready,
      pct,
      left: r.end > now ? Math.max(0, Math.ceil(r.end - now)) : 0,
    };
  });
  const miningUpCosts = Object.fromEntries(
    Object.entries(MINING.upgrades).map(([k, up]) => {
      const lvl = p.mining?.up?.[k] || 0;
      return [k, Math.round(up.cost * Math.pow(1.8, lvl))];
    })
  );
  const miningRigCost = Math.floor(MINING.rig_cost * Math.pow(MINING.rig_growth, (p.mining?.rigs?.length || 1) - 1));

  const currentHour = Math.floor(now / 3600);
  const commoditiesList = SMUGGLE_COMMODITIES.map(c => {
    const seed = (c.id.split("").reduce((a, b) => a + b.charCodeAt(0), 0) + currentHour) % 100;
    const variance = (seed - 50) / 200;
    const buyPrice = Math.max(100, Math.floor(c.basePrice * (1 + variance)));
    const sellPrice = Math.max(120, Math.floor(c.basePrice * (1.1 + variance)));
    const held = p.commodities_held?.[c.id] || 0;
    return {
      ...c,
      buyPrice,
      sellPrice,
      held,
      variancePct: Math.round(variance * 100),
    };
  });

  const bigManPerksList = BIG_MAN_PERKS.map(perk => ({
    ...perk,
    owned: (p.big_man_perks || []).includes(perk.id),
  }));

  const turfZonesList = TURF_ZONES.map(z => ({
    ...z,
    control: p.turf_control?.[z.id] || 0,
  }));

  const activeSusu = p.susu_surge && now < p.susu_surge.end ? {
    ...p.susu_surge,
    left: Math.max(0, p.susu_surge.end - now),
  } : null;

  const late = lateGameDerived(p, now);
  const medical = medicalInfo(p, now);
  const badges = {
    medical: { injured: medical.injured, healed: Number((p as any).med_healed) || 0, total: medical.injured + (Number((p as any).med_healed) || 0) },
    late: late.badge,
    empire: empireBadge,
    crew: facStationIds.length,
    heists: heistReady + heistClaim,
    workshop: workshopBenches.some((b) => b.ready) ? 1 : 0,
    methlab: methlabBenches.some((b) => b.ready) ? 1 : 0,
    mining: miningRigs.some((r) => r.ready) ? 1 : 0,
    market: luxury.badge,
    boutique: luxury.badge,
    more: facilitiesBadge + compoundBadge + bossBadge + late.badge + (workshopBenches.some((b) => b.ready) ? 1 : 0) + (methlabBenches.some((b) => b.ready) ? 1 : 0) + (miningRigs.some((r) => r.ready) ? 1 : 0),
    mansion: facilitiesBadge + compoundBadge + bossBadge,
    skills: facilitiesBadge + compoundBadge + bossBadge,
    skill_tabs: { boss: bossBadge, compound: compoundBadge, garage: 0 },
    mansion_tabs: { facilities: facilitiesBadge, mansion: compoundBadge, garage: 0, boss: bossBadge, compound: compoundBadge },
    hustles: { collect: hustleCollect, worn: hustleWorn, upgrade: hustleUpg, total: hustleCollect + hustleWorn + hustleUpg },
    fronts: { ready: frontReadyIds, batch_ready: batchReady, worn: frontWorn, upgrade: frontUpg, total: frontReadyIds.length + batchReady + frontWorn + frontUpg },
    land: { claim: landClaim, buy: plotUnlock, start: plotUpg, total: landClaim + plotUnlock + plotUpg },
    facilities: { worn: facWornIds, upgrade: facUpgIds, station: facStationIds },
    heist: { ready: heistReady, claim: heistClaim, ready_ids: heistReadyIds },
    vault_upgrade: vaultUpg,
  };

  return {
    late,
    luxury,
    medical,
    rival_events: { log: (p.rival_event_log || []).slice(0, 60), chance_pct: Math.round(rivalEventChance(p) * 1000) / 10, arch_rival: archRivalId(p), away: p.away_summary || null, unseen: (p.rival_event_log || []).filter((e) => e.t > (Number((p as any).rival_log_seen) || 0)).length },
    land: plots,
    free_land: freePlots,
    next_land: nextLand,
    first_business_claimed: firstClaimed,
    first_free_hustle: FIRST_FREE_HUSTLE,
    // the business price table (street hustles), used by the land "start a hustle" picker
    hustle_catalog: HUSTLES.map((h) => ({
      hid: h.id,
      name: h.name,
      income: h.income,
      cost: hustleCost(h, 0),
      owned: false,
      plot_count: (p.player_plots || []).filter((pl) => pl.isUnlocked && pl.hustleID === h.id).length,
      tier: h.tier || 1,
      build_crew: h.build_crew || 1,
      build_time: h.build_time || 20,
      locked: !isUnlocked(p, (h as any).gate),
      lock_label: (h as any).gate ? GATED_CONTENT[(h as any).gate]?.label || "" : "",
    })),
    active_launder_syndicates: p.rival_launder_day?.active_syndicates || [],
    rival_launder: Object.fromEntries(
      RIVALS.map((r) => {
        const rel = p.rival_relations?.[r.id] ?? 50;
        const grudge = p.grudges?.[r.id] ?? 0;
        const cap = p.rival_launder_caps?.[r.id] ?? 5000;
        const comm = calcRivalCommission(RIVAL_LAUNDER_BASE_COMMISSION, rel, grudge);
        const rel_label = rel >= 80 ? "Trusted Ally" : rel >= 60 ? "Friendly" : rel >= 40 ? "Neutral" : rel >= 20 ? "Tense" : "Hostile";
        const dk = dayKey(now);
        const activeSyndicates = p.rival_launder_day?.active_syndicates || [];
        const isActiveToday = activeSyndicates.includes(r.id);
        const usedToday = p.rival_launder_day?.day === dk && !!p.rival_launder_day?.used?.[r.id];
        return [
          r.id,
          {
            cap,
            relationship: rel,
            relationship_label: rel_label,
            grudge,
            commission_rate: comm,
            clean_rate: Math.round((1 - comm) * 1000) / 1000,
            is_active_today: isActiveToday,
            used_today: usedToday,
            can_launder_today: isActiveToday && !usedToday,
          },
        ];
      })
    ),
    cooldowns,
    badges,
    tier,
    tier_name: tierObj.name,
    rate,
    tap_value: Math.max(1, Math.min(3, Math.floor(rate * 0.15) + 1)),
    fee,
    vault_cap: vCap,
    defence: def,
    power: pow,
    boss_power: loadoutPower(p, p.loadout),
    crew_cap: 9 + Math.min(5, p.upgrades?.quarters || 0),
    bribe_cost: Math.floor(20000 * cityMods(p).bribe_cost),
    can_lie_low: p.last_lie_low_day !== dayKey(now),
    heat_cooling_per_hour: 0,
    assassin_contact: ASSASSIN_CONTACT,
    daily_hustle_cap: DAILY_HUSTLE_CAP,
    xp_needed: xpNeeded(p.level),
    slots: batchSlots(p),
    offline_cap_h: p.upgrades?.safehouse ? 24 : 12,
    hustles: hustlesAcc,
    fronts: frontsAcc,
    upgrades: upgradesAcc,
    facilities: facilitiesList,
    boss_perks: bossPerksList,
    base_integrity: baseIntegrity,
    facility_condition: facCondition,
    facility_assign: facAssign,
    farm: {
      grow: growTimes,
      prices: prices,
      up_cost: upCost,
      plot_cost: plotCost,
    },
    store: store,
    store_next: storeNext,
    workshop: {
      benches: workshopBenches,
      up_costs: workshopUpCosts,
      bench_cost: workshopBenchCost,
      is_max_benches: (p.workshop?.benches?.length || 0) >= WORKSHOP.max_benches,
    },
    methlab: {
      benches: methlabBenches,
      up_costs: methlabUpCosts,
      bench_cost: methlabBenchCost,
      is_max_benches: (p.methlab?.benches?.length || 0) >= METHLAB.max_benches,
      stash: p.methlab?.stash || {},
    },
    mining: {
      rigs: miningRigs,
      up_costs: miningUpCosts,
      rig_cost: miningRigCost,
      is_max_rigs: (p.mining?.rigs?.length || 0) >= MINING.max_rigs,
      stash: p.mining?.stash || {},
    },
    susu_surge: activeSusu,
    area_don: p.area_don || null,
    area_don_cooldown_left: Math.max(0, (p.area_don_cooldown_until || 0) - now),
    big_man_perks: bigManPerksList,
    commodities: commoditiesList,
    turf_zones: turfZonesList,
    restock_cost: 25,
    crew_eff: crewEff,
    crew_wpow: crewWpow,
    fortify_cost: 40 + (p.raid?.fortify || 0) * 25,
    lawyer_left: Math.max(0, 2 - (p.lawyer_week?.count || 0)),
    boss: RIVALS[Math.floor(now / (7 * 86400)) % RIVALS.length].id,
    respect_gain: Math.max(1, Math.floor(Math.sqrt(Math.max(0, Number(p.lifetime || 0) / 100000)))),
    mult: Number(mult(p, now).toFixed(2)),
    is_arrested: p.arrested_until ? now < p.arrested_until : false,
    arrest_left: p.arrested_until ? Math.max(0, p.arrested_until - now) : 0,
    bail_cost: 250,
    rival_powers: Object.fromEntries(RIVALS.map((r) => [r.id, getRivalPower(r, p, now)])),
    heist_count: (p.heist_day?.day === dayKey(now) ? p.heist_day.count : 0),
    heist_limit: heistLimit(p, now),
    crew_daily_payroll: (p.crew || []).filter((c) => !c.merc).reduce((sum, c) => sum + (c.daily_rate || calcCrewDailyRate(c)), 0),
    seconds_to_midnight: Math.max(0, Math.ceil(now / 86400) * 86400 - now),
    payroll_can_afford: BigInt(p.clean) >= BigInt((p.crew || []).filter((c) => !c.merc).reduce((sum, c) => sum + (c.daily_rate || calcCrewDailyRate(c)), 0)) || BigInt(p.dirty) >= BigInt((p.crew || []).filter((c) => !c.merc).reduce((sum, c) => sum + (c.daily_rate || calcCrewDailyRate(c)), 0)),
    pending_deliveries: p.pending_deliveries || [],
    active_consumable_buffs: (p.active_consumable_buffs || []).filter((b) => b.expires_at > now),
    plot_hustle_managers: p.plot_hustle_managers || {},
  };
}

export function tickPlayer(p: Player, now: number) {
  syncTestShift(p);
  ledgerFrame(p, now, "Passive & offline", "Timers, offline earnings and events", () => tickPlayerCore(p, now));
}
function tickPlayerCore(p: Player, now: number) {
  ledgerFrame(p, now, "Save migration", "Save upgrade (refunds / payouts)", () => migratePlayer(p, now));
  ledgerFrame(p, now, "Rival events", "Rival events while away", () => rivalEventTick(p, now));
  settleHeat(p, now);
  const sk = seasonKey(now);
  if (p.season?.id !== sk) p.season = { id: sk, points: 0 };
  if (p.pass?.season !== sk) p.pass = { season: sk, xp: 0, premium: false, free: [], prem: [] };
  const dk = dayKey(now);
  if (p.daily?.day !== dk) {
    p.daily = {
      day: dk,
      contracts: generateDailyContracts(p.name, dk, p.level),
      login_claimed: false,
    };
    if (p.heat > 0) {
      p.heat = Math.max(0, p.heat - 20);
      p.log.unshift({
        t: now,
        msg: `🌅 Dawn reset: Police patrols rotate across Accra. Heat reduced by -20 (now ${Math.round(p.heat)}/100).`,
        kind: "good",
      });
    }
  }
  if (p.active_consumable_buffs && p.active_consumable_buffs.length > 0) {
    p.active_consumable_buffs = p.active_consumable_buffs.filter((b) => b.expires_at > now);
  }
  if (!p.heist_day || p.heist_day.day !== dk) {
    p.heist_day = { day: dk, count: 0, ad_extra: 0 };
  }
  if (p.ads?.day !== dk) p.ads = { day: dk, double: false, restock: false };
  if (!p.rival_launder_day || p.rival_launder_day.day !== dk) {
    p.rival_launder_day = {
      day: dk,
      active_syndicates: pickDailyLaunderRivals(RIVALS.map((r) => r.id), 3),
      used: {},
    };
    if (!p.rival_launder_caps) p.rival_launder_caps = {};
    RIVALS.forEach((r) => {
      p.rival_launder_caps![r.id] = rollRivalLaunderCap();
    });
  }

  ensurePlots(p);

  // Module 3: Variable Twice-Daily "Susu Surge" (Hot Wash)
  const twelveHourSlot = Math.floor(now / (12 * 3600));
  const lastRollSlot = Math.floor((p.susu_last_roll || 0) / (12 * 3600));
  if (twelveHourSlot > lastRollSlot || !p.susu_surge) {
    p.susu_last_roll = now;
    p.susu_surge = rollSusuSurge(now, p.big_man_perks || []);
    p.log.unshift({
      t: now,
      msg: `🔥 SUSU SURGE ACTIVATED! Target: ${p.susu_surge.targetPlots.map(idx => `Plot ${idx + 1}`).join(", ")} | Multiplier: ${p.susu_surge.multiplier}x | Variant: ${p.susu_surge.variant} | Duration: ${Math.round(p.susu_surge.duration / 60)}m`,
      kind: "good",
    });
  }

  // Module 5: Trotro Fleet Union flat Clean Cash stream of GH₵25,000 every 60 seconds
  if (p.big_man_perks?.includes("trotro_union")) {
    if (!p.trotro_last_payout) p.trotro_last_payout = now;
    const elapsedPayout = now - p.trotro_last_payout;
    if (elapsedPayout >= 60) {
      const periods = Math.floor(elapsedPayout / 60);
      const payout = periods * 25000;
      addCash(p, "clean", BigInt(payout));
      p.trotro_last_payout = now;
      p.log.unshift({
        t: now,
        msg: `🚌 Trotro Fleet Union paid GH₵${payout.toLocaleString()} flat clean revenue!`,
        kind: "good",
      });
    }
  }

  // Area Don threat & 1-week cooldown check
  if (!p.area_don) {
    if (!p.area_don_cooldown_until || now >= p.area_don_cooldown_until) {
      p.area_don = spawnAreaDon(p.area_don_defeated_count || 0);
      p.area_don_cooldown_until = 0;
      p.log.unshift({
        t: now,
        msg: `⚡ New underworld power rises! ${p.area_don.name} has seized territory as ${p.area_don.archetypeName}!`,
        kind: "bad",
      });
    }
  } else if (p.area_don.archetypeId === "okada_raider" && (p.heat || 0) > 70) {
    // Okada Raider: Siphons 4% dirty cash per tick above 70% Heat (throttled to once every 120s)
    if (!p.area_don.spawnedAt || now - (p as any)._last_okada_siphon >= 120) {
      (p as any)._last_okada_siphon = now;
      const currentDirty = Number(p.dirty || 0);
      if (currentDirty > 1000) {
        let siphonPct = 0.04;
        if (p.big_man_perks?.includes("iron_compound")) {
          siphonPct *= 0.40; // Iron-Gate Compound prevents 60% of loss!
        }
        const siphoned = Math.floor(currentDirty * siphonPct);
        if (siphoned > 0) {
          moveCash(p, now, "dirty", -siphoned, "Okada Raid", `The Okada Raider ambushed cash runners!`);
          p.log.unshift({
            t: now,
            msg: `⚠️ OKADA RAID! ${p.area_don.name}'s bike raiders siphoned GH₵${siphoned.toLocaleString()} Dirty Cash under high heat!${p.big_man_perks?.includes("iron_compound") ? " (Iron-Gate Compound prevented 60% loss)" : ""}`,
            kind: "bad",
          });
        }
      }
    }
  }

  // Auto-complete finished construction on land plots
  (p.player_plots || []).forEach((pl) => {
    if (pl.building && now >= pl.building.end) {
      const hid = pl.building.hid;
      const h = HUSTLE_MAP[hid];
      pl.hustleID = hid;
      (pl.building.crew_ids || []).forEach((cid: string) => {
        const c = p.crew.find((x) => x.id === cid);
        if (c && c.assign === `build:plot_${pl.plotID}`) c.assign = null;
      });
      pl.building = null;
      if (!p.hustles[hid]) p.hustles[hid] = { lvl: 1, ts: now, bank: 0 };
      if (!p.hustle_condition) p.hustle_condition = {};
      p.hustle_condition[hid] = 100;
      p.xp = (p.xp || 0) + 10;
      while (p.xp >= xpNeeded(p.level)) {
        p.xp -= xpNeeded(p.level);
        p.level += 1;
        p.skill_points = (p.skill_points || 0) + 1;
        p.log.unshift({ t: now, msg: `Level Up! Boss is now Level ${p.level}. Street respect increased! +1 Attribute Point gained!`, kind: "good" });
      }
      p.log.unshift({
        t: now,
        msg: `Construction complete! ${h?.name || hid} is operational on Land plot ${pl.plotID + 1}.`,
        kind: "good",
      });
    }
  });

  // v9 boutique: loyalty assets set a crew morale floor. Boss commander perk adds to base morale.
  {
    const luxuryFloor = luxuryEffects(p).loyalty;
    const commanderBonus = (p.boss_perks?.commander || 0) * 10;
    const totalFloor = Math.max(luxuryFloor, commanderBonus);
    if (totalFloor > 0) {
      p.crew.forEach((c) => {
        if ((c.morale ?? 85) < totalFloor) c.morale = totalFloor;
      });
    }
  }

  // v9: side hustle & front business wear. Managers count as stationed maintenance crew:
  // no wear while managed, and they repair STATION_REPAIR_RATE %/min each.
  if (!p.last_biz_wear) p.last_biz_wear = now;
  const bizElapsed = now - p.last_biz_wear;
  if (bizElapsed >= 15) {
    p.last_biz_wear = now;
    const mins = bizElapsed / 60;
    (p.player_plots || []).forEach((pl) => {
      if (!pl.isUnlocked || !pl.hustleID) return;
      const hid = pl.hustleID;
      const h = HUSTLE_MAP[hid];
      if (!h) return;
      const hs = p.hustles?.[hid];
      const cur = hustleCond(p, hid, pl.plotID);
      const mgrs = hustleManagers(p, hid, pl.plotID);
      let next: number;
      if (mgrs.length > 0) {
        let r = 0;
        mgrs.forEach((cid) => {
          const c = p.crew.find((x) => x.id === cid);
          if (c) r += STATION_REPAIR_RATE + (c.specialty_biz === hid ? 1.0 : 0);
        });
        next = Math.min(100, cur + r * mins);
      } else {
        next = Math.max(0, cur - WEAR_RATES.hustle * mins);
      }
      next = round2(next);
      if (conditionTier(next) !== conditionTier(cur)) {
        // Bank what was earned at the old tier so a tier change never rewrites past income.
        const earned = accruedPlot(p, pl.plotID, now);
        if (hs) hs.bank = earned;
        if (hs) hs.ts = now;
        if (next < CONDITION_THRESHOLDS.worn && cur >= CONDITION_THRESHOLDS.worn) {
          p.log.unshift({ t: now, msg: `[HUSTLE WEAR] ${h.name} on Land ${pl.plotID + 1} is Critical (${Math.round(next)}%) and has shut down. Service it or assign a manager.`, kind: "bad" });
        }
      }
      pl.condition = next;
    });
    FRONTS.forEach((f) => {
      if ((p.fronts[f.id] || 0) < 1) return;
      const cur = frontCond(p, f.id);
      const mgr = p.front_assign?.[f.id] ? p.crew.find((c) => c.id === p.front_assign[f.id]) : null;
      let next = mgr
        ? Math.min(100, cur + (STATION_REPAIR_RATE + (mgr.specialty_biz === f.id ? 1.0 : 0)) * mins)
        : Math.max(0, cur - WEAR_RATES.front * mins);
      next = round2(next);
      if (next < CONDITION_THRESHOLDS.worn && cur >= CONDITION_THRESHOLDS.worn) {
        p.log.unshift({ t: now, msg: `[FRONT WEAR] ${f.name} is Critical (${Math.round(next)}%) and cannot launder. Service it or assign a manager.`, kind: "bad" });
      }
      p.front_condition![f.id] = next;
    });
  }

  // Auto-collect side hustle money per plot for hustles with managers (no daily cap since v9)
  if (!p.hustle_daily) p.hustle_daily = {};
  if (!p.hustle_managers) p.hustle_managers = {};

  (p.player_plots || []).forEach((pl) => {
    if (!pl.isUnlocked || !pl.hustleID) return;
    const hid = pl.hustleID;
    const h = HUSTLE_MAP[hid];
    if (!h) return;
    const hs = p.hustles?.[hid];
    if (!hs) return;
    const mgrs = hustleManagers(p, hid, pl.plotID);
    
    // Day reset check per plot
    const plotDkKey = `plot_${pl.plotID}`;
    if (!p.hustle_daily[plotDkKey] || p.hustle_daily[plotDkKey].day !== dk) {
      p.hustle_daily[plotDkKey] = { day: dk, amount: 0 };
    }

    if (mgrs.length > 0) {
      // Manager assigned: auto-collect strictly per plot
      const toCollect = accruedPlot(p, pl.plotID, now);
      if (toCollect > 0) {
        addCash(p, "dirty", BigInt(toCollect));
        p.lifetime = (BigInt(p.lifetime) + BigInt(toCollect)).toString();
        p.hustle_daily[plotDkKey].amount += toCollect;
        hs.ts = now;
        hs.bank = 0;
        recordCash(p, now, toCollect, "dirty", "Side Hustle", `${h.name} (Land ${pl.plotID + 1}) Manager Auto-Collect (${mgrs.length} assigned)`);
      }
    }
  });

  // Daily crew wages payroll: deducted at midnight every day!
  if (!p.last_wage_day) {
    p.last_wage_day = dk;
  } else if (p.last_wage_day !== dk) {
    p.last_wage_day = dk;
    const activeCrew = (p.crew || []).filter((c) => !c.merc);
    if (activeCrew.length > 0) {
      const totalPayroll = activeCrew.reduce((acc, c) => acc + (c.daily_rate || calcCrewDailyRate(c)), 0);

      if (BigInt(p.clean) >= BigInt(totalPayroll)) {
        addCash(p, "clean", -BigInt(totalPayroll));
        activeCrew.forEach((c) => {
          c.morale = Math.min(100, (c.morale || 85) + 5);
        });
        p.log.unshift({
          t: now,
          msg: `[MIDNIGHT PAYROLL] Deducted daily crew salary GH₵${totalPayroll.toLocaleString()} clean wages (${activeCrew.length} crew). Morale boosted!`,
          kind: "good",
        });
        recordCash(p, now, -totalPayroll, "clean", "Crew Payroll", `Midnight crew salary (${activeCrew.length} members)`);
      } else if (BigInt(p.dirty) >= BigInt(totalPayroll)) {
        addCash(p, "dirty", -BigInt(totalPayroll));
        activeCrew.forEach((c) => {
          c.morale = Math.min(100, (c.morale || 85) + 3);
        });
        p.log.unshift({
          t: now,
          msg: `[MIDNIGHT PAYROLL] Deducted daily crew salary GH₵${totalPayroll.toLocaleString()} dirty wages (${activeCrew.length} crew). Morale sustained.`,
          kind: "info",
        });
        recordCash(p, now, -totalPayroll, "dirty", "Crew Payroll", `Midnight crew salary from dirty cash (${activeCrew.length} members)`);
      } else {
        // Failure to pay: reduce crew morale!
        const totalCash = BigInt(p.clean) + BigInt(p.dirty);
        if (BigInt(p.clean) > 0n) addCash(p, "clean", -BigInt(p.clean));
        if (BigInt(p.dirty) > 0n) addCash(p, "dirty", -BigInt(p.dirty));
        activeCrew.forEach((c) => {
          c.morale = Math.max(0, (c.morale || 85) - 30);
        });
        p.log.unshift({
          t: now,
          msg: `[MIDNIGHT PAYROLL FAILED] Insufficient funds to pay GH₵${totalPayroll.toLocaleString()} daily crew salary! Crew morale plummeted (-30%)!`,
          kind: "bad",
        });
        recordCash(p, now, -Number(totalCash), "dirty", "Crew Payroll", `Midnight payroll shortfall (Needed GH₵${totalPayroll})`);
      }
    }
  }

  // Rental completion check
  if (p.rentals && p.rentals.length > 0) {
    const expired: any[] = [];
    p.rentals = p.rentals.filter((l) => {
      if (now >= l.end) {
        expired.push(l);
        return false;
      }
      return true;
    });
    expired.forEach((l) => {
      const c = p.crew.find((x) => x.id === l.crew_id);
      if (c && c.assign === "listed") {
        c.assign = null;
      }
      moveCash(p, now, "dirty", Number(l.price), "Crew & wages", `Mercenary contract paid: ${l.crew_name}`);
      p.log.unshift({
        t: now,
        msg: `Mercenary contract completed! ${l.crew_name} returned from duty. Collected GH₵${l.price.toLocaleString()} payment!`,
        kind: "good",
      });
    });
  }

  // Rival grudge cooldown per hour system removed as per requirements.
  // Grudges remain until resolved via Underworld Diplomacy, peace offerings, or treaties.

  // --- COMPOUND BASE INTEGRITY & CREW STATION MAINTENANCE ---
  if (!p.facility_condition) {
    p.facility_condition = {
      infirmary: 100,
      armoury: 100,
      radio_tower: 100,
      barracks: 100,
      generator: 100,
      vault: 100,
      walls: 100,
    };
  }
  if (!p.facility_assign) {
    p.facility_assign = {};
  }
  if (!p.last_facility_decay) {
    p.last_facility_decay = now;
  }

  const elapsedDecay = now - p.last_facility_decay;
  if (elapsedDecay >= 15) {
    p.last_facility_decay = now;
    const mins = elapsedDecay / 60;

    Object.entries(MANSION_FACILITIES).forEach(([fid, fac]) => {
      const lvl = p.facilities?.[fid] || 0;
      if (lvl <= 0) return; // Unbuilt facilities don't decay

      const curCond = p.facility_condition![fid] !== undefined ? p.facility_condition![fid] : 100;
      const assignedCids = p.facility_assign![fid] || [];

      if (assignedCids.length > 0) {
        // Active crew station maintenance: heals & maintains facility condition!
        let totalMaintRate = 0; // % per minute

        assignedCids.forEach((cid) => {
          const c = p.crew.find((x) => x.id === cid);
          if (!c) return;

          let crewRate = 2.0; // base +2.0%/min maintenance
          if (facilityArchMatch(fac, c.arch)) {
            crewRate += 1.8; // Archetype synergy (+3.8%/min)
          }

          // Specific trait synergies
          if (c.front_trait === "iron_guard" && (fid === "walls" || fid === "armoury")) crewRate += 2.5;
          if ((c.front_trait === "grease_monkey" || c.front_trait === "pipeline_tech") && fid === "generator") crewRate += 2.5;
          if (c.front_trait === "circle_hacker" && (fid === "radio_tower" || fid === "vault")) crewRate += 2.5;
          if (c.front_trait === "cleaner" && fid === "infirmary") crewRate += 2.5;

          // Crew gains maintenance XP
          c.xp = round2((c.xp || 0) + mins * 2); // 2 XP per minute on station (fractional, tick-rate independent)
          while (c.xp >= 30 * c.lvl) {
            c.xp -= 30 * c.lvl;
            c.lvl += 1;
            syncCrewProgression(c);
          }

          totalMaintRate += crewRate;
        });

        // Condition recovers towards 100
        const conditionGain = totalMaintRate * mins;
        p.facility_condition![fid] = Math.min(100, round2(curCond + conditionGain)); // fractional: no rounding loss
      } else {
        // No crew assigned: natural compound structural wear & tear!
        // ~0.5% per minute
        const decayRate = 0.5; // % per minute
        const conditionLoss = decayRate * mins;
        const newCond = Math.max(0, round2(curCond - conditionLoss)); // v9 fix: Math.round() used to cancel the 0.125%/tick wear
        p.facility_condition![fid] = newCond;

        if (curCond >= 25 && newCond < 25) {
          p.log.unshift({
            t: now,
            msg: `[COMPOUND WEAR ALERT] ${fac.name} is Critical (${Math.round(newCond)}%) and its perks are shut down! Station crew or service it to restore them.`,
            kind: "bad",
          });
        }
      }
    });

    // Infirmary perk: +10 crew morale per hour, scaled by condition tier (Worn half, Critical none)
    const infPerk = facilityPerk(p, "infirmary");
    if (infPerk > 0) {
      p.crew.forEach((c) => {
        if ((c.morale ?? 85) < 100) {
          c.morale = Math.min(100, round2((c.morale ?? 85) + (10 / 60) * mins * infPerk));
        }
      });
    }
    // Crew Quarters (barracks) perk: crew morale never drops below 25 while it is not Critical
    if (facilityPerk(p, "barracks") > 0) {
      p.crew.forEach((c) => {
        if ((c.morale ?? 85) < 25) c.morale = 25;
      });
    }
  }

  // Check expired assassin hits
  if (p.assassin_hits) {
    for (const [rid, hit] of Object.entries(p.assassin_hits)) {
      if (hit.until <= now) {
        delete p.assassin_hits[rid];
        const rDef = RIVAL_MAP[rid];
        p.log.unshift({
          t: now,
          msg: `Assassin contract on ${rDef?.name || rid} completed and expired. Rival syndicate defenses normalizing.`,
          kind: "info",
        });
      }
    }
  }

  // Opportunistic raid when arrested OR angry alliance raid
  if (!p.raid && (p.shield_until || 0) <= now) {
    const isArrested = p.arrested_until ? now < p.arrested_until : false;
    // If arrested, rivals take advantage of you being in custody!
    if (isArrested && Math.random() < 0.05) {
      const attacker = RIVALS[Math.floor(Math.random() * RIVALS.length)];
      const basePow = Math.floor(getRivalPower(attacker, p, now, { raid: true }) * 1.1) + 15;
      p.raid = {
        rival: attacker.id,
        start: now,
        resolve_at: now + 50 + radioWarning(p),
        attack: basePow,
        fortify: 0,
        taunt: `[POLICE LOCKUP RAID] ${attacker.boss} (${attacker.name}): "Boss is in handcuffs! Strip their compound bare!"`,
      };
      p.log.unshift({
        t: now,
        msg: `COMPOUND RAIDED WHILE IN JAIL! ${attacker.name} attacked because you are in custody! Resolve in 50s.`,
        kind: "bad",
      });
    } else {
      // Check if any rival alliance is angry and triggers a raid
      const angryRivals = RIVALS.filter((r) => (p.grudges?.[r.id] || 0) >= 50);
      const snitched = (Number((p as any).snitch_until) || 0) > now; // v9: snitching paints a target on you
      if (angryRivals.length > 0 && Math.random() < (snitched ? 0.08 : 0.04)) {
        const angry = angryRivals[Math.floor(Math.random() * angryRivals.length)];
        const ally = RIVAL_MAP[angry.ally_id] || angry;
        const attackPow = Math.floor(getRivalPower(ally, p, now, { raid: true }) * (snitched ? 1.3 : 1.15) + 15);
        p.raid = {
          rival: ally.id,
          start: now,
          resolve_at: now + 50 + radioWarning(p),
          attack: attackPow,
          fortify: 0,
          taunt: `[ALLIANCE SOLIDARITY RAID] ${ally.boss} (${ally.name}): "Our ally ${angry.name} is at war with you! The ${angry.bloc} strikes back!"`,
        };
        p.log.unshift({
          t: now,
          msg: `ALLIANCE SOLIDARITY RAID! ${ally.name} launched a raid to back their ally ${angry.name}! Defend your compound!`,
          kind: "bad",
        });
      }
    }
  }

  // Resolve raid if time expired
  if (p.raid && now >= p.raid.resolve_at) {
    resolveRaid(p, now);
  }
  medicalTick(p, now); // v9 injuries heal over time
  lateGameTick(p, now); // v9 late game

  // Tick ongoing heists for crisis events
  p.heists?.forEach((h) => {
    if (!h.events) return;
    h.events.forEach((ev) => {
      // Check if unaddressed and expired
      if (!ev.resolved && now >= ev.expires_at) {
        const evDef = HEIST_EVENT_MAP[ev.event_id];
        if (evDef) {
          ev.resolved = true;
          ev.penalty_applied = true;
          ev.outcome = `CRISIS UNADDRESSED: ${evDef.fail_penalty.desc}`;
          h.pct = Math.max(5, h.pct - evDef.fail_penalty.chance_drop);
          h.heat = Math.min(100, h.heat + evDef.fail_penalty.heat_spike);
          p.heat = Math.min(100, p.heat + heatGain(p, Math.floor(evDef.fail_penalty.heat_spike / 2)));
          Object.values(h.sel || {}).forEach((cid) => {
            const c = p.crew.find((x) => x.id === cid);
            if (c) c.morale = Math.max(0, (c.morale || 85) - evDef.fail_penalty.morale_loss);
          });
          p.log.unshift({
            t: now,
            msg: `[HEIST CRISIS UNRESOLVED] ${evDef.title} timed out! Heist chance plunged by ${evDef.fail_penalty.chance_drop}% and heat surged!`,
            kind: "bad",
          });
        }
      }
    });
  });
}

// ---- v9: battle reports for the animated fight / raid playback ----
export interface BattleCrew { id: string; name: string; gender: string; arch: string; power: number; xp: number; morale: number }
export interface BattleReport {
  id: string; kind: "raid" | "hit" | "turf" | "ambush" | "rescue" | "attack"; t: number; won: boolean; seen: boolean;
  title: string; us: { name: string; gender: string; power: number; crew: BattleCrew[] };
  them: { name: string; boss: string; power: number };
  loot: number; lost: number; heat: number; damage: Record<string, number>; drop?: string; notes: string[];
  rounds?: FightRound[]; injuries?: { id: string; name: string; sev: number; sev_name: string }[]; respect?: number;
}
function crewPow(c: CrewMember) { return Object.values(c.stats || {}).reduce((a: number, b: any) => a + (b as number), 0) + c.lvl * 2; }
export function battleCrew(p: Player, ids?: string[]): BattleCrew[] {
  const pool = ids && ids.length ? p.crew.filter((c) => ids.includes(c.id)) : p.crew.filter((c) => !c.merc && !crewOut(c)).sort((a, b) => crewPow(b) - crewPow(a)).slice(0, 3);
  return pool.slice(0, 4).map((c) => ({ id: c.id, name: c.name, gender: (c as any).look?.gender || "male", arch: c.arch, power: crewPow(c), xp: 0, morale: 0 }));
}
export function makeBattle(p: Player, now: number, b: Omit<BattleReport, "id" | "t" | "seen" | "us"> & { us?: Partial<BattleReport["us"]> }): BattleReport {
  const rep: BattleReport = {
    ...b,
    id: `${b.kind}_${Math.floor(now * 1000)}`,
    t: now,
    seen: false,
    us: { name: p.name, gender: p.avatar?.gender || "male", power: 0, crew: battleCrew(p), ...(b.us || {}) },
  } as BattleReport;
  if (!rep.rounds || !rep.rounds.length) rep.rounds = genRounds(rep);
  // v9: fights hurt. Losers take real injuries; even winners can pick up a knock.
  if (!(b as any).no_injury) {
    const before = ((p as any)._inj || []).length;
    const ratio = Math.min(rep.us.power || 1, rep.them.power || 1) / Math.max(rep.us.power || 1, rep.them.power || 1);
    (rep.us.crew || []).forEach((bc) => {
      const c = p.crew.find((x) => x.id === bc.id);
      if (!c || c.merc || c.status === "kidnapped") return;
      // Rule: If a crew member is not on defend they can not be hurt in a raid or rival fight
      if (c.assign !== "defense") return;
      const r = Math.random();
      if (!rep.won && r < 0.55) injureCrew(p, c, r < 0.12 && ratio < 0.6 ? 3 : r < 0.3 ? 2 : 1, rep.title || rep.kind, now);
      else if (rep.won && r < 0.12) injureCrew(p, c, 1, rep.title || rep.kind, now);
    });
    rep.injuries = ((p as any)._inj || []).slice(before);
  }
  p.last_battle = rep;
  return rep;
}

export function resolveRaid(p: Player, now: number) {
  if (!p.raid) return;
  const r = p.raid;
  const rival = RIVAL_MAP[r.rival] || RIVALS[0];
  const def = calcDefence(p) * (0.9 + Math.random() * 0.2);
  const atk = r.attack * (0.9 + Math.random() * 0.2);
  const won = testForce(p, def >= atk);
  let battleLoot = 0, battleLost = 0;
  const defenders = p.crew.filter((c) => c.assign === "defense").map((c) => c.id);
  const bCrew = battleCrew(p, defenders);
  const moraleBefore: Record<string, number> = {}; p.crew.forEach((c) => (moraleBefore[c.id] = c.morale ?? 85));

  const vCap = BigInt(vaultCap(p));
  const dirtyTotal = BigInt(p.dirty);
  const exposed = dirtyTotal > vCap ? dirtyTotal - vCap : 0n;

  if (won) {
    const loot = Math.floor(r.attack * 25 + p.level * 60);
    addCash(p, "dirty", BigInt(loot));
    recordCash(p, now, loot, "dirty", "Raids", `Raid defended vs ${r.rival}: loot`);
    p.grudges[r.rival] = Math.max(0, (p.grudges[r.rival] || 0) - 15);
    p.log.unshift({
      t: now,
      msg: `Raid Defended! Crushed ${rival.name}'s assault force! Seized GH₵${loot.toLocaleString()} dirty cash and repelled the syndicate!`,
      kind: "good",
    });
    p.raid_log.unshift({
      t: now,
      rival: rival.name,
      defence: Math.round(def),
      attack: Math.round(atk),
      won: true,
      amount: loot.toString(),
    });
    battleLoot = loot;
    bestsInc(p, "raids_won");
  } else {
    const pct = 0.2 + Math.random() * 0.15;
    const lost = (exposed * BigInt(Math.floor(pct * 100))) / 100n;
    addCash(p, "dirty", dirtyTotal - lost - BigInt(p.dirty));
    recordCash(p, now, -Number(lost), "dirty", "Raids", `Raid by ${r.rival}: lost exposed cash`);
    p.grudges[r.rival] = Math.max(0, (p.grudges[r.rival] || 0) - 20);
    p.log.unshift({
      t: now,
      msg: `Compound Breached! ${rival.name} broke perimeter and stole GH₵${lost.toLocaleString()} dirty cash. Vault was safe.`,
      kind: "bad",
    });
    p.raid_log.unshift({
      t: now,
      rival: rival.name,
      defence: Math.round(def),
      attack: Math.round(atk),
      won: false,
      amount: lost.toString(),
      pct: Math.round(pct * 100),
    });
    battleLost = Number(lost);
    const took = seizeAsset(p, rival, now); // v9: a breached compound can cost you turf
    if (took) (r as any).seized = took;
  }

  p.crew.forEach((c) => {
    if (c.assign === "defense") {
      c.xp += won ? 25 : 10;
      c.morale = won ? Math.min(100, (c.morale || 85) + 15) : Math.max(0, (c.morale || 85) - 10);
      while (c.xp >= 30 * c.lvl) {
        c.xp -= 30 * c.lvl;
        c.lvl += 1;
        syncCrewProgression(c);
      }
    }
  });

  // Battle wear & damage on compound facilities
  if (!p.facility_condition) p.facility_condition = {};
  const wallDmg = won ? 6 : 18;
  const armDmg = won ? 4 : 12;
  const wallHasEnforcer = (p.facility_assign?.walls || []).some((cid) => p.crew.find((x) => x.id === cid)?.arch === "enforcer");
  const actualWallDmg = wallHasEnforcer ? Math.ceil(wallDmg / 2) : wallDmg;

  p.facility_condition.walls = Math.max(0, (p.facility_condition.walls ?? 100) - actualWallDmg);
  p.facility_condition.armoury = Math.max(0, (p.facility_condition.armoury ?? 100) - armDmg);

  bCrew.forEach((bc) => {
    const c = p.crew.find((x) => x.id === bc.id);
    if (c && c.assign === "defense") { bc.xp = won ? 25 : 10; bc.morale = (c.morale ?? 85) - moraleBefore[c.id]; }
  });
  makeBattle(p, now, {
    kind: "raid", won, title: won ? "Raid defended" : "Compound breached",
    us: { power: Math.round(def), crew: bCrew },
    them: { name: rival.name, boss: rival.boss, power: Math.round(atk) },
    loot: battleLoot, lost: battleLost, heat: 0,
    damage: { walls: actualWallDmg, armoury: armDmg },
    notes: [defenders.length ? `${defenders.length} on defence duty` : "No crew on defence duty", wallHasEnforcer ? "Enforcer on the walls halved wall damage" : "", r.fortify ? `Fortified x${r.fortify}` : ""].filter(Boolean),
  });

  p.raid = null;
  p.shield_until = now + 4 * H;
}

/** v9: seconds left on one heist's own 8h cooldown (0 = ready). Clock rolled back past the launch also counts as locked. */
export function heistCooldownLeft(p: Player, tpl: string, now: number) {
  const until = Number(p.cooldowns?.heist_by?.[tpl] || 0);
  const setAt = Number(p.cooldowns?.heist_set_at?.[tpl] || 0);
  if (setAt && now < setAt) return Math.max(1, until - setAt); // device clock moved backwards: stay locked
  if ((p.heists || []).some((h: any) => h.tpl === tpl)) return Math.max(1, until - now); // still running / unclaimed
  return Math.max(0, until - now);
}
/** v9: dev/test cheat actions only run in dev builds or when the tester flag is set (never for normal players in production). */
// Compile-time: production builds define __GE_TEST_TOOLS__ = false, so dev_* actions can never run there,
// whatever is called from the console. Node engine tests pass --define:__GE_TEST_TOOLS__=true.
let DEV_ACTIONS = ENGINE_TEST_TOOLS;
export function setDevActionsEnabled(on: boolean) { DEV_ACTIONS = ENGINE_TEST_TOOLS && !!on; }
export function devActionsEnabled() { return DEV_ACTIONS; }
/** Test Tools handler. Registered at runtime (store, test builds only) from engine/testTools.ts, so a build with
 *  VITE_ENABLE_TEST_TOOLS=false never bundles the handlers at all. */
export type TestToolHandler = (p: Player, op: string, payload: any, now: number) => any;
let TEST_HANDLER: TestToolHandler | null = null;
export function registerTestTools(fn: TestToolHandler | null) { if (ENGINE_TEST_TOOLS) TEST_HANDLER = fn; }
/** Test Tools "force fights": p.test_force_fight = "win" | "lose" overrides fight outcomes (test builds only). */
export function testForce(p: Player, won: boolean): boolean {
  if (!ENGINE_TEST_TOOLS) return won;
  const f = (p as any).test_force_fight;
  return f === "win" ? true : f === "lose" ? false : won;
}
/** Legacy arch-rival crisis popup (territory war / kidnap / convoy ambush). Fires on 8% of interactions;
 *  Test Tools can force a type. */
export function makeArchCrisis(p: Player, now: number, forceType?: "rival_war" | "kidnap" | "ambush") {
  const isRivalWar = forceType ? forceType === "rival_war" : Math.random() < 0.5;
  if (isRivalWar) {
    const r1 = RIVALS[Math.floor(Math.random() * RIVALS.length)];
    const r2 =
      RIVALS.find((r) => r.id !== r1.id && r.id === r1.ally_id) ||
      RIVALS.find((r) => r.id !== r1.id) ||
      RIVALS[0];
    const locations = [
      "Jamestown Port",
      "Nima Gutter",
      "Tema Industrial Zone",
      "Circle Interchange",
      "East Legon",
    ];
    const loc = locations[Math.floor(Math.random() * locations.length)];
    p.archrival_event = {
      id: `ev_${Date.now()}`,
      type: "rival_war",
      created_at: now,
      rival1_id: r1.id,
      rival1_name: r1.name,
      rival2_id: r2.id,
      rival2_name: r2.name,
      location: loc,
      title: `TERRITORY WAR: ${r1.name.toUpperCase()} VS ${r2.name.toUpperCase()}`,
      desc: `Automatic gunfire erupts in ${loc}! The ${r1.name} and ${r2.name} are clashing violently over border supply lines. Choose how your syndicate responds.`,
    };
    p.log.unshift({
      t: now,
      msg: `[ARCHRIVAL EVENT] ${r1.name} and ${r2.name} are clashing in ${loc}!`,
      kind: "info",
    });
  } else {
    const attackingRival = RIVALS[Math.floor(Math.random() * RIVALS.length)];
    const targetCrew = (p.crew || []).filter(
      (c) => !c.merc && !crewOut(c)
    );
    const isKidnap = targetCrew.length > 0 && (forceType ? forceType === "kidnap" : Math.random() < 0.6);

    if (isKidnap) {
      const victim = targetCrew[Math.floor(Math.random() * targetCrew.length)];
      victim.status = "kidnapped";
      p.archrival_event = {
        id: `ev_${Date.now()}`,
        type: "kidnap",
        created_at: now,
        rival_id: attackingRival.id,
        rival_name: attackingRival.name,
        crew_id: victim.id,
        crew_name: victim.name,
        ransom_dirty: 5000,
        ransom_clean: 2000,
        title: `CREW KIDNAPPED: ${victim.name.toUpperCase()}`,
        desc: `Enforcers from ${attackingRival.name} ambushed and abducted ${victim.name}! They demand cash ransom or a direct raid on their hideout.`,
      };
      p.log.unshift({
        t: now,
        msg: `[CRISIS ALERT] ${victim.name} was kidnapped by ${attackingRival.name}!`,
        kind: "bad",
      });
    } else {
      p.archrival_event = {
        id: `ev_${Date.now()}`,
        type: "ambush",
        created_at: now,
        rival_id: attackingRival.id,
        rival_name: attackingRival.name,
        bribe_cost: 3000,
        title: `CONVOY AMBUSH: ${attackingRival.name.toUpperCase()}`,
        desc: `Rival syndicate gunmen from ${attackingRival.name} blocked your transit route! Firefight, evasion, or bribe needed.`,
      };
      p.log.unshift({
        t: now,
        msg: `[AMBUSH ALERT] ${attackingRival.name} ambushed your transport!`,
        kind: "bad",
      });
    }
  }
  return p.archrival_event;
}
export function executeAction(
  p: Player,
  type: string,
  payload: any = {},
  now = Date.now() / 1000
): { ok: boolean; result?: any; error?: string } {
  if (/^dev_|^test_tool$/.test(type)) {
    if (!ENGINE_TEST_TOOLS || !DEV_ACTIONS || !TEST_HANDLER) return { ok: false, error: "Test tools are disabled in this build" };
    if (type !== "test_tool") return { ok: false, error: `Legacy cheat ${type} was replaced by the Test Tools panel` };
    tickPlayer(p, now);
    // every money change a test tool makes is booked under the "TEST" statement category
    return ledgerFrame(p, now, "TEST", `Test tool: ${String(payload?.op || "?").replace(/_/g, " ")}`, () => {
      try { return { ok: true, result: TEST_HANDLER!(p, String(payload?.op || ""), payload || {}, now) }; }
      catch (err: any) { return { ok: false, error: err?.message || "Test tool failed" }; }
    });
  }
  tickPlayer(p, now);
  return ledgerFrame(p, now, actionLedgerCategory(type), `Action: ${type.replace(/_/g, " ")}`, () => executeActionCore(p, type, payload, now));
}
function executeActionCore(
  p: Player,
  type: string,
  payload: any = {},
  now = Date.now() / 1000
): { ok: boolean; result?: any; error?: string } {

  const gainXp = (amt: number) => {
    p.xp = (p.xp || 0) + amt;
    while (p.xp >= xpNeeded(p.level)) {
      p.xp -= xpNeeded(p.level);
      p.level += 1;
      p.skill_points = (p.skill_points || 0) + 1;
      const upMsg = `Level Up! Boss is now Level ${p.level}. Street respect increased! +1 Attribute Point gained!`;
      p.log.unshift({ t: now, msg: upMsg, kind: "good" });
      sendNotification("LEVEL UP", { body: upMsg, tag: "level_up" });
    }
  };

  const dismissUnfit = () => {
    const unfit = p.crew.filter((c) => !c.assign && !c.merc && (c.injury || (c.morale || 85) < 30));
    if (unfit.length === 0) return 0;
    const ids = unfit.map(c => c.id);
    p.crew = p.crew.filter(c => !ids.includes(c.id));
    return unfit.length;
  };

  const progress = (ctype: string, amt = 1) => {
    p.daily?.contracts?.forEach((c) => {
      if (c.type === ctype && !c.claimed) {
        c.progress = Math.min(c.target, c.progress + amt);
      }
    });
  };

  const checkArchrivalClickTrigger = (actionName: string) => {
    if (
      p.archrival_event ||
      LT_AUTOMATING ||
      actionName.startsWith("dev_") ||
      actionName === "test_tool" ||
      actionName === "resolve_archrival_event" ||
      actionName === "tap"
    ) {
      return;
    }

    // .5% chance on interaction to trigger archrival event
    if (Math.random() < 0.005) makeArchCrisis(p, now);
  };

  try {
    const hadEv = p.archrival_event;
    checkArchrivalClickTrigger(type);
    if (!hadEv && p.archrival_event) { p.archrival_event.source = "street"; logRivalEvent(p, p.archrival_event, now, {}); }
    switch (type) {
      case "lux_seen": {
        if (!Array.isArray((p as any).lux_seen)) (p as any).lux_seen = [];
        // Mark all items as seen when user visits boutique
        LUXURY_CATALOG.forEach((it) => {
          if (!(p as any).lux_seen.includes(it.id)) (p as any).lux_seen.push(it.id);
        });
        return { ok: true };
      }

      case "tap": {
        const count = Math.max(1, Math.min(25, Math.floor(Number(payload.count) || 1)));
        const rate = totalRate(p, now);
        const perTap = Math.max(1, Math.min(3, Math.floor(rate * 0.15) + 1));
        const earned = perTap * count;
        addCash(p, "dirty", BigInt(earned));
        recordCash(p, now, earned, "dirty", "Street Hustles", "Street hustle taps");
        p.lifetime = (BigInt(p.lifetime) + BigInt(earned)).toString();
        gainXp(count / 10);
        progress("tap", count);
        return { ok: true, result: { earned: earned.toString(), count } };
      }

      case "collect": {
        let total = 0;
        const today = dayKey(now);
        if (!p.hustle_daily) p.hustle_daily = {};
        const hid = payload.hid || "all";

        const collectHustle = (k: string) => {
          const amt = accrued(p, k, now);
          if (amt > 0) {
            total += amt;
            const currentToday = p.hustle_daily![k]?.day === today ? p.hustle_daily![k].amount : 0;
            p.hustle_daily![k] = { day: today, amount: currentToday + amt };
          }
          p.hustles[k].ts = now;
          (p.hustles[k] as any).bank = 0;
        };

        if (hid === "all") {
          Object.keys(p.hustles).forEach(collectHustle);
        } else if (p.hustles[hid]) {
          collectHustle(hid);
        }

        if (total > 0) {
          addCash(p, "dirty", BigInt(total));
          p.lifetime = (BigInt(p.lifetime) + BigInt(total)).toString();
          progress("collect", total);
          p.heat = Math.min(100, p.heat + heatGain(p, Math.min(4, total / 150)));
          recordCash(p, now, total, "dirty", "Street Hustles", `Daily bundled street hustle revenue (${today})`);
          p.log.unshift({
            t: now,
            msg: `Collected GH₵${total.toLocaleString()} dirty cash from Accra street hustles.`,
            kind: "good",
          });
        }
        return { ok: true, result: { collected: total.toString() } };
      }

      case "buy_hustle": {
        const hid = payload.hid;
        const h = HUSTLE_MAP[hid];
        if (!h) throw new Error("Hustle not found");
        if (!isUnlocked(p, h.gate)) throw new Error(`${h.name} is locked: ${GATED_CONTENT[h.gate!]?.label}`);
        const cost = hustleCost(h, 0, now);
        const hPlots = ensurePlots(p);
        if (!(p as any).first_business_claimed) throw new Error("Claim your free first business first");
        const target = payload.plot !== undefined && payload.plot !== null
          ? hPlots.find((x) => x.plotID === Number(payload.plot))
          : hPlots.find((x) => x.isUnlocked && !x.hustleID && !x.building);
        if (!target) throw new Error("No empty land: buy land first (clean cash)");
        if (!target.isUnlocked) throw new Error("Buy this land first (clean cash)");
        if (target.building) throw new Error(`Land plot ${target.plotID + 1} is already under construction`);

        const ownedElsewhere = hPlots.some((pl) => pl.hustleID === hid && pl.plotID !== Number(target.plotID));
        if (ownedElsewhere) {
          throw new Error(`You already own ${h.name} on another land plot. Only one of each side business can be purchased.`);
        }

        // Check clean cash
        if (BigInt(p.clean) < BigInt(cost)) {
          throw new Error(`Needs clean cash: GH₵${cost.toLocaleString()} clean to build ${h.name}`);
        }

        // If replacing an existing hustle on this plot (swap/edit), free any managers on it first so they can be available to build!
        if (target.hustleID) {
          const prevHid = target.hustleID;
          const prevAmt = accrued(p, prevHid, now);
          if (prevAmt > 0) {
            addCash(p, "dirty", BigInt(prevAmt));
            p.lifetime = (BigInt(p.lifetime) + BigInt(prevAmt)).toString();
          }
          target.hustleID = null;
          const otherPlots = hPlots.filter((x) => x.plotID !== target.plotID && x.isUnlocked && x.hustleID === prevHid);
          if (otherPlots.length === 0) {
            (p.hustle_managers?.[prevHid] || []).forEach((cid) => {
              const c = p.crew.find((x) => x.id === cid);
              if (c && c.assign === `hustle:${prevHid}`) c.assign = null;
            });
            if (p.hustle_managers) delete p.hustle_managers[prevHid];
            if (p.hustle_assign) delete p.hustle_assign[prevHid];
            if (p.hustles && p.hustles[prevHid]) delete p.hustles[prevHid];
          }
        }

        // Check required crew members based on tier
        const requiredCrew = h.build_crew || 1;
        const availableCrew = p.crew.filter((c) => !c.assign && !c.merc && !crewOut(c));
        let builders: CrewMember[] = [];
        if (Array.isArray(payload.crew_ids) && payload.crew_ids.length > 0) {
          builders = availableCrew.filter((c) => payload.crew_ids.includes(c.id));
        }
        if (builders.length < requiredCrew) {
          builders = availableCrew.slice(0, requiredCrew);
        }
        if (builders.length < requiredCrew) {
          throw new Error(`Requires ${requiredCrew} available crew member${requiredCrew > 1 ? "s" : ""} to build (Tier ${h.tier || 1}). You have ${availableCrew.length} available crew.`);
        }

        // Deduct clean cash
        addCash(p, "clean", -BigInt(cost));
        recordCash(p, now, -cost, "clean", "Street Hustles", `Built ${h.name} on land plot ${target.plotID + 1}`);

        // Assign crew to build
        builders.forEach((c) => {
          c.assign = `build:plot_${target.plotID}`;
        });

        // Set building duration
        const duration = h.build_time || 7200;
        target.building = {
          hid,
          start: now,
          end: now + duration,
          crew_ids: builders.map((c) => c.id),
        };
        target.hustleID = null;

        if (!p.hustles[hid]) {
          p.hustles[hid] = { lvl: 1, ts: now, bank: 0 };
        }
        if (!p.hustle_condition) p.hustle_condition = {};
        if (p.hustle_condition[hid] === undefined) p.hustle_condition[hid] = 100;

        gainXp(5);
        p.log.unshift({
          t: now,
          msg: `Started construction of ${h.name} on Land plot ${target.plotID + 1} (${requiredCrew} crew, ${duration}s).`,
          kind: "info",
        });
        return { ok: true, result: { building: true, hid, cost, plot: target.plotID, duration } };
      }

      case "remove_hustle_plot":
      case "demolish_hustle":
      case "clear_plot": {
        const plotIdx = Number(payload.plot !== undefined ? payload.plot : payload.plot_id);
        const plots = ensurePlots(p);
        const target = plots.find((x) => x.plotID === plotIdx);
        if (!target) throw new Error("Land plot not found");
        if (!target.isUnlocked) throw new Error("This land is not owned");

        // If under construction, cancel build and free assigned builders
        if (target.building) {
          const hid = target.building.hid;
          const hName = HUSTLE_MAP[hid]?.name || hid;
          (target.building.crew_ids || []).forEach((cid) => {
            const c = p.crew.find((x) => x.id === cid);
            if (c && c.assign === `build:plot_${target.plotID}`) c.assign = null;
          });
          target.building = null;
          p.log.unshift({
            t: now,
            msg: `Cancelled construction of ${hName} on Land plot ${target.plotID + 1}. Builders returned to available crew.`,
            kind: "info",
          });
          return { ok: true, result: { plot: plotIdx, cleared: true } };
        }

        if (!target.hustleID) {
          throw new Error("No side hustle is currently on this land plot");
        }

        const hid = target.hustleID;
        const hName = HUSTLE_MAP[hid]?.name || hid;
        const prevAmt = accrued(p, hid, now);
        if (prevAmt > 0) {
          addCash(p, "dirty", BigInt(prevAmt));
          p.lifetime = (BigInt(p.lifetime) + BigInt(prevAmt)).toString();
          recordCash(p, now, prevAmt, "dirty", "Street Hustles", `Final revenue from removing ${hName}`);
        }

        target.hustleID = null;
        target.building = null;

        // Automatically set all crew to free when their business they are assigned is removed
        p.crew.forEach((c) => {
          if (c.assign === `hustle:plot_${plotIdx}` || c.assign === `build:plot_${plotIdx}`) {
            c.assign = null;
          }
        });
        if (p.plot_hustle_managers) delete p.plot_hustle_managers[plotIdx];

        // Check if any other plot still runs this hustle
        const otherPlots = plots.filter((x) => x.plotID !== target.plotID && x.isUnlocked && x.hustleID === hid);
        if (otherPlots.length === 0) {
          // If the hustle is gone completely, ensure global managers are also freed
          (p.hustle_managers?.[hid] || []).forEach((cid) => {
            const c = p.crew.find((x) => x.id === cid);
            if (c && c.assign === `hustle:${hid}`) c.assign = null;
          });
          if (p.hustle_managers) delete p.hustle_managers[hid];
          if (p.hustle_assign) delete p.hustle_assign[hid];
          if (p.hustles && p.hustles[hid]) delete p.hustles[hid];
          if (p.hustle_condition && p.hustle_condition[hid]) delete p.hustle_condition[hid];
        }

        p.log.unshift({
          t: now,
          msg: `Removed ${hName} from Land plot ${target.plotID + 1}. Plot is now empty and ready for a new hustle.`,
          kind: "info",
        });
        return { ok: true, result: { plot: plotIdx, cleared: true, hustle: hid } };
      }

      case "complete_hustle_build": {
        const plotIdx = Number(payload.plot);
        const plots = ensurePlots(p);
        const pl = plots.find((x) => x.plotID === plotIdx);
        if (!pl || !pl.building) throw new Error("Plot is not under construction");
        if (now < pl.building.end) throw new Error("Construction is still in progress");
        const hid = pl.building.hid;
        const h = HUSTLE_MAP[hid];
        pl.hustleID = hid;
        (pl.building.crew_ids || []).forEach((cid: string) => {
          const c = p.crew.find((x) => x.id === cid);
          if (c && c.assign === `build:plot_${pl.plotID}`) c.assign = null;
        });
        pl.building = null;
        if (!p.hustles[hid]) p.hustles[hid] = { lvl: 1, ts: now, bank: 0 };
        if (!p.hustle_condition) p.hustle_condition = {};
        p.hustle_condition[hid] = 100;
        gainXp(10);
        p.log.unshift({
          t: now,
          msg: `Construction complete! ${h?.name || hid} is operational on Land plot ${pl.plotID + 1}.`,
          kind: "good",
        });
        return { ok: true, result: { plot: plotIdx, hid } };
      }

      case "rush_hustle_build": {
        const plotIdx = Number(payload.plot);
        const plots = ensurePlots(p);
        const pl = plots.find((x) => x.plotID === plotIdx);
        if (!pl || !pl.building) throw new Error("Plot is not under construction");
        const rushFee = Math.max(1, Math.round(getRushHustleFee()));
        if (BigInt(p.clean) < BigInt(rushFee)) {
          throw new Error(`Needs GH₵${rushFee.toLocaleString()} clean cash to rush construction`);
        }
        addCash(p, "clean", -BigInt(rushFee));
        recordCash(p, now, -rushFee, "clean", "Construction", `Rushed build on Land plot ${pl.plotID + 1}`);
        const hid = pl.building.hid;
        const h = HUSTLE_MAP[hid];
        pl.hustleID = hid;
        (pl.building.crew_ids || []).forEach((cid: string) => {
          const c = p.crew.find((x) => x.id === cid);
          if (c && c.assign === `build:plot_${pl.plotID}`) c.assign = null;
        });
        pl.building = null;
        if (!p.hustles[hid]) p.hustles[hid] = { lvl: 1, ts: now, bank: 0 };
        if (!p.hustle_condition) p.hustle_condition = {};
        p.hustle_condition[hid] = 100;
        gainXp(10);
        p.log.unshift({
          t: now,
          msg: `Fast-tracked construction! ${h?.name || hid} is now open on Land plot ${pl.plotID + 1}.`,
          kind: "good",
        });
        return { ok: true, result: { plot: plotIdx, hid, rushed: true } };
      }



      case "swap_hustle": {
        const plotIdx = Number(payload.plot);
        const hid = payload.hid;
        const h = HUSTLE_MAP[hid];
        if (!h) throw new Error("Hustle not found");
        const plots = ensurePlots(p);
        const plot = plots.find((x) => x.plotID === plotIdx);
        if (!plot) throw new Error("Land not found");
        if (!plot.isUnlocked) throw new Error("Buy this land first (clean cash)");
        if (!isUnlocked(p, h.gate)) throw new Error(`${h.name} is locked: ${GATED_CONTENT[h.gate!]?.label}`);

        const oldHid = plot.hustleID;
        if (oldHid === hid) return { ok: true, result: { plot: plotIdx, hid } };

        if (oldHid) {
          const oldAmt = accrued(p, oldHid, now);
          if (oldAmt > 0) { addCash(p, "dirty", BigInt(oldAmt)); p.lifetime = (BigInt(p.lifetime) + BigInt(oldAmt)).toString(); }
          const otherPlots = plots.filter((x) => x.plotID !== plotIdx && x.isUnlocked && x.hustleID === oldHid);
          if (otherPlots.length === 0) {
            (p.hustle_managers?.[oldHid] || []).forEach((cid) => { const c = p.crew.find((x) => x.id === cid); if (c && c.assign === `hustle:${oldHid}`) c.assign = null; });
            if (p.hustle_managers) delete p.hustle_managers[oldHid];
            if (p.hustle_assign) delete p.hustle_assign[oldHid];
          }
        }

        const cost = hustleCost(h, 0, now);
        if (!p.hustles[hid]) {
          if (BigInt(p.clean) < BigInt(cost)) throw new Error(`Needs clean cash: GH₵${cost.toLocaleString()} clean to start ${h.name}`);
          addCash(p, "clean", -BigInt(cost));
          p.hustles[hid] = { lvl: 1, ts: now, bank: 0 };
          recordCash(p, now, -cost, "clean", "Street Hustles", `Started ${h.name} on land plot ${plotIdx + 1}`);
        }

        plot.hustleID = hid;
        if (!p.hustle_condition) p.hustle_condition = {};
        if (p.hustle_condition[hid] === undefined) p.hustle_condition[hid] = 100;
        p.log.unshift({
          t: now,
          msg: `Swapped Land ${plotIdx + 1} to ${h.name}!`,
          kind: "good",
        });
        return { ok: true, result: { plot: plotIdx, from: oldHid, to: hid } };
      }

      case "swap_plot_hustles": {
        const plotA = Number(payload.plotA);
        const plotB = Number(payload.plotB);
        const plots = ensurePlots(p);
        const pA = plots.find((x) => x.plotID === plotA);
        const pB = plots.find((x) => x.plotID === plotB);
        if (!pA || !pB) throw new Error("Invalid plots");
        if (!pA.isUnlocked || !pB.isUnlocked) throw new Error("Both lands must be owned");
        const temp = pA.hustleID;
        pA.hustleID = pB.hustleID;
        pB.hustleID = temp;
        p.log.unshift({ t: now, msg: `Swapped hustles between Land ${plotA + 1} and Land ${plotB + 1}.`, kind: "info" });
        return { ok: true, result: { plotA, plotB } };
      }

      case "update_front_plots": {
        p.player_front_plots = payload.plots || [];
        return { ok: true, result: { plots: p.player_front_plots } };
      }
      case "update_land_plots": {
        if (Array.isArray(payload.plots)) {
          ensurePlots(p);
          p.player_plots = (p.player_plots || []).map((pl, idx) => {
            const incoming = payload.plots.find((up: any) => up.plotID === pl.plotID) || payload.plots[idx];
            if (incoming) {
              return {
                ...pl,
                customName: incoming.customName !== undefined ? (incoming.customName?.trim() || undefined) : pl.customName,
                streetName: incoming.streetName !== undefined ? incoming.streetName : pl.streetName,
              };
            }
            return pl;
          });
        }
        return { ok: true, result: { plots: p.player_plots } };
      }

      case "customize_plot": {
        const { plotIdx, customName } = payload;
        ensurePlots(p);
        if (p.player_plots && p.player_plots[plotIdx]) {
          p.player_plots[plotIdx].customName = customName?.trim() || undefined;
        }
        return { ok: true, result: { plotIdx, customName } };
      }

      case "buy_front": {
        const fid = payload.fid;
        const f = FRONT_MAP[fid];
        if (!f) throw new Error("Front not found");
        if (!isUnlocked(p, f.gate)) throw new Error(`${f.name} is locked: ${GATED_CONTENT[f.gate!]?.label}`);
        const currentLvl = p.fronts[fid] || 0;
        const cost = frontCost(f, currentLvl);
        // v9 economy: fronts are legit, titled businesses, so only clean cash buys or expands them
        if (BigInt(p.clean) < BigInt(cost)) throw new Error(`Needs clean cash: GH₵${cost.toLocaleString()} clean to ${currentLvl ? "expand" : "buy"} ${f.name}`);
        addCash(p, "clean", -BigInt(cost));
        recordCash(p, now, -cost, "clean", "Fronts", `${currentLvl ? "Expanded" : "Bought"} ${f.name} (Lvl ${currentLvl + 1})`);
        if (currentLvl === 0) { (p as any).front_income_ts = (p as any).front_income_ts || {}; (p as any).front_income_ts[fid] = now; }
        p.fronts[fid] = currentLvl + 1;
        if (currentLvl === 0) {
          if (!p.front_condition) p.front_condition = {};
          p.front_condition[fid] = 100;
        }
        gainXp(10);
        progress("upgrade", 1);
        p.log.unshift({ t: now, msg: `Expanded front: ${f.name} (Lvl ${currentLvl + 1})`, kind: "good" });
        return { ok: true, result: { lvl: currentLvl + 1 } };
      }

      case "launder": {
        const fid = payload.fid;
        const f = FRONT_MAP[fid];
        if (!f) throw new Error("Front not found");
        const lvl = p.fronts[fid] || 0;
        if (lvl < 1) throw new Error("Front not owned yet");
        { const by = seizedBy(p, "front", fid); if (by) throw new Error(`${f.name} was seized by ${RIVAL_MAP[by]?.name || by}. Take it back first.`); }
        const maxSlots = batchSlots(p);
        if (p.batches.length >= maxSlots) throw new Error("All laundering slots are busy");
        if (!p.cooldowns) p.cooldowns = { launder_until: 0, heist_until: 0, front: {} };
        if ((p.cooldowns.launder_until || 0) > now) {
          throw new Error(`Laundering is cooling down (${Math.ceil((p.cooldowns.launder_until - now) / 60)} min left)`);
        }
        if ((p.cooldowns.front?.[fid] || 0) > now) {
          throw new Error(`${f.name} is resting after its last run (${Math.ceil((p.cooldowns.front[fid] - now) / 60)} min left)`);
        }
        if (conditionTier(frontCond(p, fid)) === "critical") throw new Error(`${f.name} is Critical and shut down. Service it first.`);

        const cap = frontCapacity(p, f, lvl);
        const requested = payload.amount !== undefined ? Math.floor(Number(payload.amount)) : Infinity;
        if (!(requested > 0)) throw new Error("Enter an amount to wash");
        const amount = Math.min(cap, parseInt(p.dirty), requested);
        if (amount <= 0) throw new Error("No dirty cedis to wash");

        // v9 bug fix: perks, manager traits and front speed now apply
        const feeRate = launderFee(p.heat, p, fid);
        const cleanEarned = Math.floor(amount * (1 - feeRate));
        const runDur = frontDuration(f, p);

        addCash(p, "dirty", -BigInt(amount));
        p.batches.push({
          id: uid(),
          front: fid,
          dirty: amount,
          clean: cleanEarned,
          amount: amount,
          out: cleanEarned,
          start: now,
          end: now + runDur,
        });
        p.cooldowns.front[fid] = now + COOLDOWNS.front; // front business rests 6h after a run
        progress("launder", 1);
        p.daily?.contracts?.forEach((c: any) => { if (c.type === "elite_launder" && !c.claimed && amount >= c.target) c.progress = c.target; });
        p.heat = Math.min(100, p.heat + heatGain(p, 2));
        p.log.unshift({
          t: now,
          msg: `Washing GH₵${amount.toLocaleString()} through ${f.name}. Yields GH₵${cleanEarned.toLocaleString()} clean.`,
          kind: "info",
        });
        return { ok: true, result: { clean: cleanEarned, duration: runDur, fee: feeRate } };
      }

      case "collect_batch": {
        const bid = payload.bid || payload.id;
        const idx = p.batches.findIndex((b) => b.id === bid);
        if (idx === -1) throw new Error("Batch not found");
        const b = p.batches[idx];
        if (now < b.end) throw new Error("Batch still being laundered");
        p.batches.splice(idx, 1);
        let amt = b.clean || (b as any).out || 0;

        // Big Man Perks: Susu Collector Ring (+15% laundering yield) & Shadow Forex Bureau (+10%)
        if (p.big_man_perks?.includes("susu_ring")) {
          amt = Math.floor(amt * 1.15);
        }
        if (p.big_man_perks?.includes("shadow_forex")) {
          amt = Math.floor(amt * 1.10);
        }

        // Area Don Tactic: Forex Skim (taxes 20% of washed Clean Cash on collection)
        if (p.area_don?.tacticId === "forex_skim") {
          const skim = Math.floor(amt * 0.20);
          amt = Math.max(1, amt - skim);
          p.log.unshift({
            t: now,
            msg: `⚠️ FOREX SKIM TAX: Area Don ${p.area_don.name} skimmed 20% (GH₵${skim.toLocaleString()}) of your washed cash!`,
            kind: "bad",
          });
        }

        addCash(p, "clean", BigInt(amt));
        gainXp(15);
        if (!p.cooldowns) p.cooldowns = { launder_until: 0, heist_until: 0, front: {} };
        p.cooldowns.launder_until = now + COOLDOWNS.launder; // 6h laundering cooldown after cleaning money
        p.log.unshift({ t: now, msg: `Clean cash in the bag! Collected GH₵${amt.toLocaleString()}. Laundering cools down for 6h.`, kind: "good" });
        return { ok: true, result: { clean: amt } };
      }

      case "bribe": {
        const cost = Math.floor(20000 * cityMods(p).bribe_cost); // v9: Police Crackdown
        if (BigInt(p.clean) < BigInt(cost)) {
          throw new Error(`Need GH₵${cost.toLocaleString()} clean cedis to bribe Accra Police Command`);
        }
        if (p.heat <= 0) throw new Error("No heat to drop");
        addCash(p, "clean", -BigInt(cost));
        p.heat = Math.max(0, p.heat - 25);
        if (cityMods(p).bribe_loot) {
          const loot = Math.max(2000, Math.floor(hourlyIncome(p, now) * 0.5));
          addCash(p, "dirty", BigInt(loot));
          recordCash(p, now, loot, "dirty", "Bribes & heat", "Crackdown bonus loot");
          p.log.unshift({ t: now, msg: `Crackdown bonus: the inspector "lost" GH₵${loot.toLocaleString()} of seized cash to you.`, kind: "good" });
        }
        p.log.unshift({
          t: now,
          msg: `High-level payoff delivered to CID Command (GH₵${cost.toLocaleString()} clean). Dropped 25 Heat!`,
          kind: "good",
        });
        return { ok: true, result: { heat: p.heat, cost } };
      }

      case "lie_low": {
        const dk = dayKey(now);
        if (p.last_lie_low_day === dk) {
          throw new Error("You can only lie low once per day!");
        }
        p.last_lie_low_day = dk;
        p.heat = Math.max(0, p.heat - 40);
        p.lie_low_until = now + 1800; // 30 minutes safe period
        p.log.unshift({
          t: now,
          msg: "Laying low in the village safehouse! Police heat dropped by 40. (Daily limit: 1/1 used).",
          kind: "good",
        });
        return { ok: true, result: { heat: p.heat, until: p.lie_low_until } };
      }

      case "use_item": {
        const itemId = payload.item;
        if ((p.inv[itemId] || 0) <= 0) throw new Error("Item not in inventory");
        p.inv[itemId] -= 1;

        if (itemId === "burner") {
          p.heat = Math.max(0, p.heat - 15);
        } else if (itemId === "envelope") {
          p.heat = Math.max(0, p.heat - 25);
        } else if (itemId === "receipt") {
          p.heat = Math.max(0, p.heat - 10);
        } else if (itemId === "donation") {
          p.heat = Math.max(0, p.heat - 40);
        } else if (itemId === "timeskip") {
          p.batches.forEach((b) => (b.end = Math.max(now, b.end - 3600)));
          p.heists.forEach((h) => {
            h.end = Math.max(now, h.end - 3600);
            if (p.cooldowns?.heist_by) p.cooldowns.heist_by[h.tpl] = h.end + COOLDOWNS.heist;
          });
          p.farm?.plots?.forEach((pl) => (pl.end = Math.max(now, pl.end - 3600)));
          p.log.unshift({ t: now, msg: "Time Skip activated: pushed all operations 1 hour ahead!", kind: "good" });
        } else if (itemId === "lawyer") {
          p.heat = Math.max(0, p.heat - 20);
          p.shield_until = now + 4 * H;
          if (p.raid) p.raid = null;
          p.log.unshift({ t: now, msg: "Lawyer stepped in! Raid cancelled & 4hr shield active.", kind: "good" });
        } else if (itemId === "energy") {
          p.crew.forEach((c) => {
            if (!c.assign) {
              c.xp += 40;
              while (c.xp >= 30 * c.lvl) {
                c.xp -= 30 * c.lvl;
                c.lvl += 1;
                syncCrewProgression(c);
              }
            }
          });
          p.log.unshift({ t: now, msg: "Crew refreshed with Malt & Energy! +40 XP given.", kind: "good" });
        } else if (itemId === "feast") {
          p.crew.forEach((c) => {
            if (!c.assign) {
              c.xp += 90;
              while (c.xp >= 30 * c.lvl) {
                c.xp -= 30 * c.lvl;
                c.lvl += 1;
                syncCrewProgression(c);
              }
            }
          });
          p.log.unshift({ t: now, msg: "Jollof feast shared! +90 XP to all free crew members.", kind: "good" });
        } else if (itemId === "spikes" || itemId === "dog") {
          if (p.raid) p.raid.fortify = Math.min(7, (p.raid.fortify || 0) + (itemId === "dog" ? 3 : 2));
        }
        return { ok: true, result: { item: itemId } };
      }

      case "assign": {
        const cid = payload.crew_id || payload.cid;
        const assign = payload.assign;
        const c = p.crew.find((x) => x.id === cid);
        if (!c) throw new Error("Crew member not found");
        if (c.assign?.startsWith("heist")) throw new Error("Crew member is currently on a heist");
        if (c.assign?.startsWith("listed")) throw new Error("Crew member is currently listed on the mercenary market");
        
        if (assign === "defense") {
          // If assigned to front or hustle, remove from business assignment
          Object.keys(p.front_assign || {}).forEach((fid) => {
            if (p.front_assign[fid] === cid) delete p.front_assign[fid];
          });
          Object.keys(p.hustle_assign || {}).forEach((hid) => {
            if (p.hustle_assign[hid] === cid) delete p.hustle_assign[hid];
          });
        }
        if (assign) assertFit(c);
        c.assign = assign || null;
        p.log.unshift({
          t: now,
          msg: assign === "defense"
            ? `${c.name} assigned to Compound Defense perimeter (+Muscle/Gear to Defense).`
            : `${c.name} relieved from defense duty. Now free.`,
          kind: "info",
        });
        return { ok: true, result: { assign: c.assign } };
      }

      case "unassign_business": {
        const cid = payload.crew_id || payload.cid;
        const c = p.crew.find((x) => x.id === cid);
        if (!c) throw new Error("Crew member not found");
        Object.keys(p.front_assign || {}).forEach((fid) => {
          if (p.front_assign[fid] === cid) delete p.front_assign[fid];
        });
        Object.keys(p.hustle_assign || {}).forEach((hid) => {
          if (p.hustle_assign[hid] === cid) delete p.hustle_assign[hid];
        });
        Object.keys(p.hustle_managers || {}).forEach((hid) => {
          p.hustle_managers![hid] = (p.hustle_managers![hid] || []).filter((x) => x !== cid);
          if (p.hustle_managers![hid][0]) p.hustle_assign![hid] = p.hustle_managers![hid][0];
        });
        Object.keys(p.facility_assign || {}).forEach((fid) => {
          p.facility_assign![fid] = (p.facility_assign![fid] || []).filter((x) => x !== cid);
        });
        Object.keys(p.plot_hustle_managers || {}).forEach((plotKey) => {
          const pIdx = Number(plotKey);
          p.plot_hustle_managers![pIdx] = (p.plot_hustle_managers![pIdx] || []).filter((x) => x !== cid);
        });
        c.assign = null;
        p.log.unshift({ t: now, msg: `Unassigned ${c.name} from business. Ready for operations.`, kind: "info" });
        return { ok: true, result: { unassigned: true } };
      }

      case "dismiss_crew": {
        const cid = payload.crew_id || payload.cid;
        const idx = p.crew.findIndex((x) => x.id === cid);
        if (idx === -1) throw new Error("Crew member not found");
        const c = p.crew[idx];
        if (c.assign) throw new Error(`${c.name} is busy and cannot be dismissed`);
        p.crew.splice(idx, 1);
        p.log.unshift({ t: now, msg: `Fired ${c.name} from the syndicate. Space cleared in roster.`, kind: "info" });
        return { ok: true, result: { dismissed: true } };
      }

      case "dismiss_unfit_crew": {
        const count = dismissUnfit();
        if (count === 0) throw new Error("No unfit crew members found (injured or <30% morale)");
        p.log.unshift({ t: now, msg: `Dismissed ${count} unfit crew members (injured or low morale). Roster purged.`, kind: "info" });
        return { ok: true, result: { count } };
      }

      case "heist_start": {
        const hid = payload.tpl || payload.hid;
        const sel = payload.crew || payload.sel || {};
        const { approach = "balanced", prep = [] } = payload;
        const today = dayKey(now);
        if (!p.heist_day || p.heist_day.day !== today) {
          p.heist_day = { day: today, count: 0, ad_extra: 0 };
        }
        const maxAllowed = heistLimit(p, now);
        if (p.heist_day.count >= maxAllowed) {
          throw new Error(`Daily Heist Limit reached (${p.heist_day.count}/${maxAllowed})! Watch a street broadcast ad to unlock another heist operation.`);
        }
        const tpl = HEIST_MAP[hid];
        if (!tpl) throw new Error("Heist target not found");
        if (!isUnlocked(p, tpl.gate)) throw new Error(`${tpl.name} is locked: ${GATED_CONTENT[tpl.gate!]?.label}`);
        if (!p.cooldowns) p.cooldowns = { launder_until: 0, heist_until: 0, front: {} };
        if (!p.cooldowns.heist_by) p.cooldowns.heist_by = {};
        if (!p.cooldowns.heist_set_at) p.cooldowns.heist_set_at = {};
        if (p.heists.some((h) => h.tpl === hid)) throw new Error(`${tpl.name} is already underway`);
        const hcd = heistCooldownLeft(p, hid, now);
        if (hcd > 0) {
          const hh = Math.floor(hcd / 3600), mm = Math.ceil((hcd % 3600) / 60);
          throw new Error(`${tpl.name} is locked: next run in ${hh}h ${mm}m (8h after it completes)`);
        }

        const crewIds: string[] = Object.values(sel);
        if (crewIds.length < tpl.roles.length) throw new Error("Fill all required roles for this operation");

        crewIds.forEach((cid) => {
          const c = p.crew.find((x) => x.id === cid);
          if (!c) throw new Error("Invalid crew selection");
          if (c.assign) throw new Error(`${c.name} is already busy (${c.assign})`);
          assertFit(c); c.assign = `heist:${hid}`;
        });

        p.heist_day.count += 1;
        p.last_heist_day = today;
        const ap = HEIST_APPROACHES[approach] || HEIST_APPROACHES.balanced;
        const generatorLvl = (p.facilities?.generator || 0) * Math.min(1, facilityPerk(p, "generator")); // Worn halves, Critical disables
        
        const buffs = aggregateBuffs(p);
        const speedBuff = buffs.heist_speed_pct || 0;

        const durSeconds = Math.max(
          15,
          Math.floor(tpl.dur * (1 - 0.05 * (p.upgrades?.okada || 0) - generatorLvl * 0.05 - speedBuff) * ap.dur * (prep.includes("getaway") ? 0.7 : 1))
        );

        const ev1Time = now + Math.max(10, Math.floor(durSeconds * 0.35));
        const ev2Time = now + Math.max(20, Math.floor(durSeconds * 0.70));
        const shuffledEvs = [...HEIST_EVENTS].sort(() => Math.random() - 0.5);
        const plannedEvents = [
          {
            uid: uid(),
            event_id: shuffledEvs[0].id,
            trigger_at: ev1Time,
            expires_at: ev1Time + Math.max(30, Math.floor(durSeconds * 0.35)),
            resolved: false,
          },
          ...(durSeconds > 60 && shuffledEvs.length > 1
            ? [
                {
                  uid: uid(),
                  event_id: shuffledEvs[1].id,
                  trigger_at: ev2Time,
                  expires_at: ev2Time + Math.max(30, Math.floor(durSeconds * 0.35)),
                  resolved: false,
                },
              ]
            : []),
        ];

        p.heists.push({
          id: uid(),
          tpl: hid,
          sel,
          start: now,
          end: now + durSeconds,
          pct: payload.pct || 75,
          // (cooldown for this heist is stamped below: 8h after it completes)
          reward: Math.floor((tpl.reward * (1 + 0.08 * p.level) * ap.reward) / 10),
          heat: Math.round(tpl.heat * ap.heat),
          approach,
          events: plannedEvents,
        });

        p.cooldowns.heist_by[hid] = now + durSeconds + COOLDOWNS.heist; // v9: per-heist 8h lock, counted from completion
        p.cooldowns.heist_set_at[hid] = now;
        p.log.unshift({ t: now, msg: `Deployed crew on Daily Heist: ${tpl.name}! High-stakes operation underway.`, kind: "info" });
        return { ok: true, result: { heist: hid } };
      }

      case "resolve_heist_event": {
        const { hid, event_uid, choice_id } = payload;
        const h = p.heists.find((x) => x.id === hid || x.tpl === hid);
        if (!h) throw new Error("Heist not found");
        const ev = h.events?.find((e) => e.uid === event_uid);
        if (!ev) throw new Error("Crisis event not found");
        if (ev.resolved) throw new Error("Crisis event already resolved");
        const evDef = HEIST_EVENT_MAP[ev.event_id];
        if (!evDef) throw new Error("Event definition missing");
        const choice = evDef.choices.find((c) => c.id === choice_id);
        if (!choice) throw new Error("Invalid tactical choice");

        // Role check
        if (choice.req_role) {
          const req = choice.req_role;
          const hasRole = Object.values(h.sel || {}).some((cid) => {
            const crewM = p.crew.find((c) => c.id === cid);
            return crewM && (crewM.arch === ROLE_ARCH[req] || crewM.arch === req.toLowerCase());
          });
          if (!hasRole) {
            throw new Error(`Requires a ${req} on the heist team!`);
          }
        }

        // Cost check
        if (choice.cost_clean && BigInt(p.clean) < BigInt(choice.cost_clean)) {
          throw new Error(`Need GH₵${choice.cost_clean} clean cedis`);
        }
        if (choice.cost_dirty && BigInt(p.dirty) < BigInt(choice.cost_dirty)) {
          throw new Error(`Need GH₵${choice.cost_dirty} dirty cedis`);
        }

        if (choice.cost_clean) addCash(p, "clean", -BigInt(choice.cost_clean));
        if (choice.cost_dirty) addCash(p, "dirty", -BigInt(choice.cost_dirty));

        ev.resolved = true;
        ev.choice = choice.id;
        ev.outcome = choice.success_msg;
        ev.chance_delta = choice.chance_mod;
        ev.heat_delta = choice.heat_mod;

        h.pct = Math.min(99, Math.max(5, h.pct + choice.chance_mod));
        h.heat = Math.max(0, h.heat + choice.heat_mod);
        h.reward = Math.floor(h.reward * choice.payout_mod);

        p.log.unshift({
          t: now,
          msg: `[HEIST TACTICAL SAVE] ${choice.label}: ${choice.success_msg} (${choice.chance_mod >= 0 ? "+" : ""}${choice.chance_mod}% success chance)`,
          kind: "good",
        });

        return { ok: true, result: { outcome: choice.success_msg, chance: h.pct } };
      }

      case "heist_claim": {
        const hid = payload.hid || payload.id;
        const idx = p.heists.findIndex((h) => h.id === hid || h.tpl === hid);
        if (idx === -1) throw new Error("Heist not found");
        const h = p.heists[idx];
        if (now < h.end) throw new Error("Heist still in progress");
        if (!p.cooldowns) p.cooldowns = { launder_until: 0, heist_until: 0, front: {} };
        if (!p.cooldowns.heist_by) p.cooldowns.heist_by = {};
        const heistCd = COOLDOWNS.heist * (p.area_don?.tacticId === "highway_toll" ? 2 : 1);
        p.cooldowns.heist_by[h.tpl] = Number(h.end) + heistCd; // win or lose: locked 8h (doubled if Highway Toll)

        p.heists.splice(idx, 1);
        const crewList = Object.values(h.sel)
          .map((cid) => p.crew.find((x) => x.id === cid))
          .filter(Boolean) as CrewMember[];

        crewList.forEach((c) => (c.assign = null));

        const roll = Math.random() * 100;
        const won = roll <= h.pct;

        const eventLogs: string[] = [];
        (h.events || []).forEach((ev) => {
          const evDef = HEIST_EVENT_MAP[ev.event_id];
          if (ev.penalty_applied) {
            eventLogs.push(`⚠️ Crisis: ${evDef?.title || "Incident"} was ignored! Major setback occurred.`);
          } else if (ev.resolved && ev.outcome) {
            eventLogs.push(`✅ Tactical Save: ${ev.outcome}`);
          }
        });

        if (won) {
          // v9 boutique: influence adds +0.5% heist reward per point (max +100%)
          const infMult = 1 + Math.min(1, luxuryEffects(p).influence * 0.005);
          let rawReward = Math.floor(Number(h.reward) * infMult * respectHeistMult(p)); // v9: respect also boosts heists

          // Big Man Perks: Bullion Van Ambush (+25% dirty cash)
          if (p.big_man_perks?.includes("bullion_van")) {
            rawReward = Math.floor(rawReward * 1.25);
          }

          // Area Don Tactic: Depot Monopoly (-25% heist dirty cash payouts)
          if (p.area_don?.tacticId === "depot_monopoly") {
            rawReward = Math.floor(rawReward * 0.75);
          }
          h.reward = rawReward as any;
          { const hi = Math.max(0, HEISTS.findIndex((x) => x.id === h.tpl)); const C = cityEnsure(p, now); cityDamage(p, Math.ceil(C.max_hp * 0.04 * (1 + hi * 0.5)), "heist", now); }
          bestsMax(p, "biggest_heist", Number(h.reward));
          bestsInc(p, "heists_won");
          if ((h as any).approach === "quiet" && TOP_HEISTS.includes(h.tpl)) p.daily?.contracts?.forEach((c: any) => { if (c.type === "elite_quiet" && !c.claimed) c.progress = c.target; });
          addCash(p, "dirty", BigInt(h.reward));
          recordCash(p, now, Number(h.reward), "dirty", "Heists", `Heist score: ${h.tpl}`);
          p.lifetime = (BigInt(p.lifetime) + BigInt(h.reward)).toString();
          gainXp(40);
          p.pass.xp += 60;
          p.season.points += 50;
          p.heat = Math.min(100, p.heat + heatGain(p, h.heat));
          if (p.heat >= 100) triggerArrest(p, now);
          progress("heist", 1);

          crewList.forEach((c) => {
            c.xp += 40;
            c.morale = Math.min(100, (c.morale || 85) + 20);
            while (c.xp >= 30 * c.lvl) {
              c.xp -= 30 * c.lvl;
              c.lvl += 1;
              syncCrewProgression(c);
            }
          });

          let dropId: string | null = null;
          let dropName = "";
          if (Math.random() < 0.4) {
            const pool = GEAR.filter((g) => (g.unlock || 1) <= p.level + 2);
            const drop = pool[Math.floor(Math.random() * pool.length)];
            grantGear(p, drop.id, "reward");
            dropId = drop.id;
            dropName = drop.name;
          }

          let luxDropName = "";
          const extHeist = HEIST_MAP[h.tpl];
          if (extHeist?.luxury_drop_chance && Math.random() < extHeist.luxury_drop_chance) {
            const targetTier = extHeist.luxury_drop_tier || (extHeist.tier === 5 ? 5 : 3);
            const eligibleLux = LUXURY_CATALOG.filter((lx) => lx.tier <= targetTier && !(p as any).luxury?.[lx.id]);
            if (eligibleLux.length > 0) {
              const droppedLux = eligibleLux[Math.floor(Math.random() * eligibleLux.length)];
              if (!(p as any).luxury) (p as any).luxury = {};
              (p as any).luxury[droppedLux.id] = now;
              luxDropName = droppedLux.name;
              p.log.unshift({
                t: now,
                msg: `💎 RARE LUXURY ASSET RECOVERED: Plundered ${droppedLux.name} (${droppedLux.category.toUpperCase()}) from ${h.tpl}!`,
                kind: "good",
              });
            }
          }

          p.log.unshift({
            t: now,
            msg: `Heist Success! Hit the score for GH₵${h.reward.toLocaleString()} dirty.${dropName ? ` Loot drop: ${dropName}!` : ""}${luxDropName ? ` 💎 Luxury Drop: ${luxDropName}!` : ""}`,
            kind: "good",
          });
          return {
            ok: true,
            result: {
              outcome: "success",
              chance: h.pct,
              reward: h.reward,
              drop: dropId,
              luxury_drop: luxDropName || null,
              log: [
                "Target security systems bypassed by crew",
                `Vault cracked: extracted GH₵${h.reward.toLocaleString()} cash`,
                ...eventLogs,
                dropName ? `Secured rare loot drop: ${dropName}` : "Crew extracted cleanly without casualties",
                luxDropName ? `💎 Recovered rare luxury asset: ${luxDropName}` : "",
              ].filter(Boolean),
            },
          };
        } else {
          p.heat = Math.min(100, p.heat + heatGain(p, Math.floor(h.heat * 1.5)));
          if (p.heat >= 100) triggerArrest(p, now);
          crewList.forEach((c) => {
            c.xp += 15;
            c.morale = Math.max(0, (c.morale || 85) - 20);
            while (c.xp >= 30 * c.lvl) {
              c.xp -= 30 * c.lvl;
              c.lvl += 1;
              syncCrewProgression(c);
            }
          });
          // 40% chance that crew who did the heist randomly might get hurt (1 or more)
          if (Math.random() < 0.40 && crewList.length > 0) {
            const numInjured = Math.min(crewList.length, 1 + Math.floor(Math.random() * crewList.length));
            const shuffled = [...crewList].sort(() => Math.random() - 0.5);
            shuffled.slice(0, numInjured).forEach((c) => {
              injureCrew(p, c, Math.random() < 0.3 ? 2 : 1, `botched heist (${h.tpl})`, now);
            });
          }
          p.log.unshift({
            t: now,
            msg: "Alarm sounded during heist! Crew slipped away with no loot, and heat increased.",
            kind: "bad",
          });
          return {
            ok: true,
            result: {
              outcome: "botched",
              chance: h.pct,
              reward: 0,
              drop: null,
              log: [
                "Alarm tripped during breach phase",
                ...eventLogs,
                "Police Task Force converged on the location",
                "Crew forced to abandon loot and flee via back alleys",
              ],
            },
          };
        }
      }
      case "blackmail_extort": {
        const { target_id } = payload;
        const BLACKMAIL_TARGETS = [
          { id: "judge", name: "Justice Kojo Mensah", tier: 1, cost: 50000, reward: 150000, heatRed: 30 },
          { id: "commissioner", name: "ACP Emmanuel Addo", tier: 2, cost: 80000, reward: 250000, heatRed: 50 },
          { id: "minister", name: "Hon. Kofi Darko", tier: 3, cost: 200000, reward: 600000, heatRed: 80 },
        ];
        const target = BLACKMAIL_TARGETS.find(t => t.id === target_id);
        if (!target) throw new Error("Invalid blackmail target");

        if (!p.cooldowns) p.cooldowns = { launder_until: 0, heist_until: 0, front: {} };
        const cdUntil = p.cooldowns.blackmail_until || 0;
        if (cdUntil > now) throw new Error(`Strategic silence required (${Math.ceil((cdUntil - now) / 60)}m left)`);

        const today = dayKey(now);
        if (p.cooldowns.blackmail_day === today) throw new Error("Only one political operation permitted per day");

        if (BigInt(p.dirty) < BigInt(target.cost)) throw new Error("Insufficient dirty cash for extortion logistics");

        moveCash(p, now, "dirty", -target.cost, "Blackmail", `Blackmail logistics: ${target.name}`);
        addCash(p, "clean", BigInt(target.reward));
        recordCash(p, now, target.reward, "clean", "Blackmail", `Extorted clean payoff from ${target.name}`);

        p.heat = Math.max(0, p.heat - target.heatRed);
        p.cooldowns.blackmail_until = now + 8 * 3600; // 8-hour cooldown
        p.cooldowns.blackmail_day = today;

        if (!p.blackmail) p.blackmail = {};
        p.blackmail[target_id] = (p.blackmail[target_id] || 0) + 1;

        p.log.unshift({ t: now, msg: `Political pressure applied to ${target.name}! Secured GH₵${target.reward.toLocaleString()} clean and reduced heat by ${target.heatRed}.`, kind: "good" });
        return { ok: true, result: { payout: target.reward } };
      }


      case "lux_buy": {
        const it = LUXURY_MAP[payload.id];
        if (!it) throw new Error("Item not in the boutique");
        const lux = (p as any).luxury as Record<string, number>;
        const curQty = typeof lux[it.id] === "number" ? (lux[it.id] > 1000000000 ? 1 : lux[it.id]) : 0;
        if (curQty > 0) throw new Error("You already own this item");
        if (it.limited && !luxuryRotation(now).ids.includes(it.id)) throw new Error("Limited stock: not in rotation right now");
        const price = luxuryPrice(it.id, now);
        if (BigInt(p.clean) < BigInt(price)) throw new Error("Not enough clean cedis");
        const before = luxuryEffects(p);
        addCash(p, "clean", -BigInt(price));
        lux[it.id] = curQty + 1;
        if (!(p as any).lux_seen.includes(it.id)) (p as any).lux_seen.push(it.id);
        gainXp(Math.min(400, 20 * it.tier));
        const after = luxuryEffects(p);
        const sets = luxurySetProgress(p).filter((sp) => sp.tiers.some((t) => t.need === sp.count));
        p.log.unshift({ t: now, msg: `Bought ${it.name} (${it.brand || LUXURY_TIER_NAMES[it.tier]}) for GH₵${price.toLocaleString()} clean (Owned: ${lux[it.id]}/999,999).${sets.length ? ` Set bonus unlocked: ${sets.map((x) => x.name).join(", ")}!` : ""}`, kind: "good" });
        return { ok: true, result: { item: it.id, price, before, after, qty: lux[it.id], sets: sets.map((x) => x.id) } };
      }

      case "lux_sell": {
        const { id, action } = payload;
        const it = LUXURY_MAP[id];
        if (!it) throw new Error("Item not found");
        const lux = (p as any).luxury as Record<string, number>;
        if (!lux[id] || lux[id] <= 0) throw new Error("Item not owned");

        if (action === "resell") {
          const resalePrice = Math.floor(luxuryPrice(id, now) * 0.5); // Sell for 50%
          addCash(p, "clean", BigInt(resalePrice));
          lux[id] -= 1;
          p.log.unshift({ t: now, msg: `Sold ${it.name} for GH₵${resalePrice.toLocaleString()} clean.`, kind: "info" });
          return { ok: true, result: { item: id, price: resalePrice } };
        }
        throw new Error("Invalid action");
      }


      case "store_buy": {
        const id = payload.id || payload.item;
        const storeType = payload.store;

        if (storeType === "agency") {
          const maxCrew = 9 + Math.min(5, p.upgrades?.quarters || 0);
          const ownCount = p.crew.filter((c) => !c.merc).length;
          if (ownCount >= maxCrew) {
            throw new Error(`Crew quarters full (${ownCount}/${maxCrew}). Upgrade Quarters in Compound & Base! (Max 14 at LV 5)`);
          }
          calcDerived(p, now);
          const recruit = p.store?.agency?.find((c: any) => c.id === id);
          if (!recruit) throw new Error("Recruit no longer available");
          if (p.crew.some((x) => x.id === recruit.id) || p.store.bought.includes(recruit.id)) {
            throw new Error("Recruit already hired!");
          }
          const recruitDirtyCost = Math.max(9000, recruit.price || 9000);
          const recruitCleanCost = Math.max(5000, recruit.clean_price || 5000);

          if (recruit.elite) {
            if (BigInt(p.clean) < BigInt(recruitCleanCost)) throw new Error(`Need GH₵${recruitCleanCost.toLocaleString()} clean cedis for elite recruit`);
            addCash(p, "clean", -BigInt(recruitCleanCost));
          } else {
            if (BigInt(p.dirty) < BigInt(recruitDirtyCost)) throw new Error(`Recruit costs GH₵${recruitDirtyCost.toLocaleString()} dirty cedis`);
            addCash(p, "dirty", -BigInt(recruitDirtyCost));
          }

          // Transfer recruit's randomly equipped gear items into player's inventory
          if (recruit.initial_gear && recruit.initial_gear.length > 0) {
            recruit.initial_gear.forEach((ig: any) => {
              if (!p.gear.some((g) => g.uid === ig.uid)) {
                p.gear.push({
                  uid: ig.uid,
                  id: ig.id,
                  source: "crew_recruit",
                  lvl: ig.lvl || 0,
                });
              }
            });
          }

          // Transfer recruit from agency pool to crew: remove from agency store
          p.store.agency = (p.store?.agency || []).filter((c: any) => c.id !== id);

          // Keep exact recruited stats without scaling to player level
          const targetLvl = recruit.lvl || 1;
          const adjustedStats = { ...recruit.stats };
          const dailyWage = Math.max(100, recruit.daily_rate || calcCrewDailyRate(recruit));
          const hiredMember: CrewMember = {
            id: recruit.id,
            name: recruit.name,
            arch: recruit.arch,
            stats: { ...adjustedStats },
            base_stats: recruit.base_stats ? { ...recruit.base_stats } : { ...adjustedStats },
            strength: recruit.strength,
            flaw: recruit.flaw,
            front_trait: recruit.front_trait,
            traits: recruit.traits || [],
            unlocked_traits: recruit.unlocked_traits || (recruit.traits || []).filter((tid: string) => {
              const t = CREW_TRAITS.find((x) => x.id === tid);
              return t && targetLvl >= t.levelReq;
            }),
            origin: recruit.origin,
            bio: recruit.bio,
            temperament: recruit.temperament,
            specialty_biz: recruit.specialty_biz,
            trait_reason: recruit.trait_reason,
            morale: 90,
            xp: 0,
            lvl: targetLvl,
            assign: null,
            look: recruit.look,
            loadout: { ...(recruit.loadout || {}) },
            elite: recruit.elite,
            recruit_tier: recruit.recruit_tier,
            tier_name: recruit.tier_name,
            hire_cost: recruit.hire_cost || recruitDirtyCost,
            stats_locked: true,
            daily_rate: dailyWage,
            initial_gear: recruit.initial_gear,
          };
          p.crew.push(hiredMember);
          p.store.bought.push(id);
          gainXp(20);
          const equippedCount = Object.keys(hiredMember.loadout || {}).length;
          p.log.unshift({
            t: now,
            msg: `Hired ${recruit.name} (${recruit.arch.toUpperCase()}, Lv ${recruit.lvl})! Daily wage: GH₵${dailyWage}/day. Joined with ${equippedCount} pre-equipped item${equippedCount === 1 ? "" : "s"}!`,
            kind: "good",
          });
          return { ok: true, result: { crew: recruit.id, daily_rate: dailyWage } };
        }

        const bm = BM_MAP[id];
        const gear = GEAR_MAP[id];
        const cos = COSMETIC_MAP[id];

        if (storeType === "black_market" || bm) {
          const item = bm || BLACK_MARKET.find((x) => x.id === id);
          if (!item) throw new Error("Item not found");
          if (BigInt(p.dirty) < BigInt(item.price)) throw new Error("Not enough dirty cedis");
          addCash(p, "dirty", -BigInt(item.price));
          p.inv[item.id] = (p.inv[item.id] || 0) + 1;
          p.store.bought.push(id);
          
          if (item.heat) {
            p.heat = Math.min(100, (p.heat || 0) + item.heat);
          }

          p.log.unshift({ t: now, msg: `Bought ${item.name} from Black Market${item.heat ? ` (+${item.heat} heat)` : ""}`, kind: "good" });
          return { ok: true, result: { item: id } };
        }

        if (storeType === "gun_shop" || (gear && ["melee", "primary", "secondary"].includes(gear.slot))) {
          if (!gear) throw new Error("Weapon not found");
          if (BigInt(p.dirty) < BigInt(gear.price)) throw new Error("Not enough dirty cedis");
          addCash(p, "dirty", -BigInt(gear.price));
          grantGear(p, gear.id, "shop");
          p.store.bought.push(id);
          p.log.unshift({ t: now, msg: `Acquired weapon: ${gear.name}! Check Locker.`, kind: "good" });
          return { ok: true, result: { item: id } };
        }

        if (storeType === "boutique") {
          const derived = calcDerived(p, now);
          const bItem = derived.store?.boutique?.find((b: any) => b.id === id);
          if (!bItem) throw new Error("Item not in Boutique catalog");
          const price = bItem.clean || 500;
          if (BigInt(p.clean) < BigInt(price)) throw new Error("Not enough clean cedis for designer item");
          addCash(p, "clean", -BigInt(price));
          grantGear(p, bItem.id, "boutique", bItem.tier2);
          if (!p.cosmetics.includes(bItem.id)) p.cosmetics.push(bItem.id);
          p.store.bought.push(id);
          gainXp(30);
          p.log.unshift({
            t: now,
            msg: `Purchased ${bItem.name}${bItem.tier2_cat ? ` [★ Tier 2: ${bItem.tier2_cat.name}]` : ""}! Check Locker.`,
            kind: "good",
          });
          return { ok: true, result: { item: id, tier2: bItem.tier2 } };
        }

        if (gear && ["hat", "top", "bottom", "shoes"].includes(gear.slot) || cos) {
          const price = gear?.price || cos?.clean || 500;
          if (BigInt(p.clean) < BigInt(price)) throw new Error("Not enough clean cedis");
          addCash(p, "clean", -BigInt(price));
          if (gear) grantGear(p, gear.id, "shop");
          if (cos && !p.cosmetics.includes(cos.id)) p.cosmetics.push(cos.id);
          p.store.bought.push(id);
          p.log.unshift({ t: now, msg: `Purchased fit: ${gear?.name || cos?.name}`, kind: "good" });
          return { ok: true, result: { item: id } };
        }

        throw new Error("Item not available in store");
      }







      case "store_restock": {
        const cost = 250;
        if (BigInt(p.clean) < BigInt(cost)) throw new Error("Need GH₵250 clean cedis to restock");
        addCash(p, "clean", -BigInt(cost));
        p.store.offset = (p.store.offset || 0) + 1;
        p.store.bought = [];
        p.store.agency = generateAgencyRecruits(p);
        p.log.unshift({ t: now, msg: "Bribed market runner to bring fresh stock & new recruits!", kind: "good" });
        return { ok: true, result: { restocked: true } };
      }

      case "simulate_midnight_payroll": {
        const activeCrew = (p.crew || []).filter((c) => !c.merc);
        if (activeCrew.length === 0) throw new Error("No active crew to pay salary");
        const totalPayroll = activeCrew.reduce((acc, c) => acc + (c.daily_rate || calcCrewDailyRate(c)), 0);
        let paidFrom = "";
        if (BigInt(p.clean) >= BigInt(totalPayroll)) {
          addCash(p, "clean", -BigInt(totalPayroll));
          activeCrew.forEach((c) => { c.morale = Math.min(100, (c.morale || 85) + 5); });
          paidFrom = "clean";
          p.log.unshift({ t: now, msg: `[MIDNIGHT PAYROLL] Deducted GH₵${totalPayroll.toLocaleString()} daily salary from clean cedis. Crew morale boosted!`, kind: "good" });
          recordCash(p, now, -totalPayroll, "clean", "Crew Payroll", `Midnight crew salary (${activeCrew.length} members)`);
        } else if (BigInt(p.dirty) >= BigInt(totalPayroll)) {
          addCash(p, "dirty", -BigInt(totalPayroll));
          activeCrew.forEach((c) => { c.morale = Math.min(100, (c.morale || 85) + 3); });
          paidFrom = "dirty";
          p.log.unshift({ t: now, msg: `[MIDNIGHT PAYROLL] Deducted GH₵${totalPayroll.toLocaleString()} daily salary from dirty cedis. Crew morale sustained.`, kind: "info" });
          recordCash(p, now, -totalPayroll, "dirty", "Crew Payroll", `Midnight crew salary from dirty cash (${activeCrew.length} members)`);
        } else {
          const totalCash = BigInt(p.clean) + BigInt(p.dirty);
          if (BigInt(p.clean) > 0n) addCash(p, "clean", -BigInt(p.clean));
          if (BigInt(p.dirty) > 0n) addCash(p, "dirty", -BigInt(p.dirty));
          activeCrew.forEach((c) => { c.morale = Math.max(0, (c.morale || 85) - 30); });
          paidFrom = "insufficient";
          p.log.unshift({ t: now, msg: `[MIDNIGHT PAYROLL FAILED] Insufficient funds to pay GH₵${totalPayroll.toLocaleString()} daily crew salary! Morale plummeted (-30%)!`, kind: "bad" });
          recordCash(p, now, -Number(totalCash), "dirty", "Crew Payroll", `Payroll shortfall default (Needed GH₵${totalPayroll})`);
        }
        return { ok: true, result: { totalPayroll, paidFrom } };
      }

      case "gear_upgrade": {
        const uid = payload.uid;
        const g = p.gear.find((x) => x.uid === uid);
        if (!g) throw new Error("Gear not found");
        const def = GEAR_MAP[g.id];
        if (!def) throw new Error("Gear definition not found");
        if ((g.lvl || 0) >= WEAPON_MAX_LVL) throw new Error(`Weapon already at maximum level (+${WEAPON_MAX_LVL})`);
        const cost = Math.floor(def.price * 0.75 * Math.pow(1.5, g.lvl || 0));
        if (BigInt(p.dirty) < BigInt(cost)) throw new Error("Not enough dirty cedis for upgrade");
        addCash(p, "dirty", -BigInt(cost));
        g.lvl = (g.lvl || 0) + 1;
        gainXp(10);
        p.log.unshift({ t: now, msg: `Upgraded ${def.name} to +${g.lvl}! Power increased.`, kind: "good" });
        return { ok: true, result: { lvl: g.lvl } };
      }

      case "sell_gear": {
        throw new Error("Direct sales are disabled. Use the Smuggler to sell your items.");
      }

      case "sell_cosmetic": {
        throw new Error("Direct sales are disabled. Use the Smuggler to sell your items.");
      }

      case "upgrade": {
        const key = payload.key;
        const up = UPGRADES[key];
        if (!up) throw new Error("Upgrade not found");
        const current = p.upgrades[key] || 0;
        const maxLevel = key === "quarters" ? 5 : up.max;
        if (current >= maxLevel) throw new Error(`Already maxed level (${maxLevel})`);

        if (key === "vault") {
          // Vault upgrade requires Clean Cash!
          const cost = vaultUpgradeCost(current); // exponential ×2.5 per level, +5,000 capacity each
          if (BigInt(p.clean) < BigInt(cost)) {
            throw new Error(`Need GH₵${cost.toLocaleString()} clean cedis to upgrade Vault`);
          }
          addCash(p, "clean", -BigInt(cost));
          recordCash(p, now, -cost, "clean", "Mansion Upgrade", `Upgraded Vault to Level ${current + 1}`);
        } else {
          // Village safehouse costs 5 attribute points! All other compound fixtures & garage rides cost 1 attribute point
          const apCost = key === "safehouse" ? 5 : ((up as any).ap_cost || 1);
          if ((p.skill_points || 0) < apCost) {
            throw new Error(`Need ${apCost} Attribute Point${apCost > 1 ? "s" : ""} for ${up.name}. Level up your Boss to earn more points!`);
          }
          p.skill_points = (p.skill_points || 0) - apCost;
        }

        p.upgrades[key] = current + 1;
        gainXp(12);
        progress("upgrade", 1);
        p.log.unshift({
          t: now,
          msg: `Upgraded ${up.name} to Level ${current + 1} (${key === "vault" ? "Clean Cash" : `${key === "safehouse" ? 5 : 1} Attribute Point${(key === "safehouse" ? 5 : 1) > 1 ? "s" : ""}`})`,
          kind: "good",
        });
        return { ok: true, result: { lvl: current + 1, skill_points: p.skill_points } };
      }

      case "hit_rival": {
        const rid = payload.rival || payload.rid;
        const rival = RIVAL_MAP[rid];
        if (!rival) throw new Error("Rival syndicate not found");
        if ((p.rival_cd[rid] || 0) > now) throw new Error("Rival corner is still on alert. Regrouping.");
        
        const myPower = calcPower(p);
        const rivalBasePower = getRivalPower(rival, p, now);
        const rivalVariance = 0.9 + Math.random() * 0.2; // 0.9 - 1.1
        const playerVariance = 0.95 + Math.random() * 0.15; // 0.95 - 1.1
        const effectiveRivalPower = Math.round(rivalBasePower * rivalVariance);
        const effectivePlayerPower = Math.round(myPower * playerVariance);
        const won = testForce(p, effectivePlayerPower >= effectiveRivalPower);

        progress("hit", 1);
        p.heat = Math.min(100, p.heat + heatGain(p, 10));
        p.grudges[rid] = Math.min(100, (p.grudges[rid] || 0) + 15);
        if (!p.rival_relations) p.rival_relations = {};
        p.rival_relations[rid] = Math.max(0, (p.rival_relations[rid] ?? 50) - 10);
        p.rival_cd[rid] = now + 900; // 15 min corner lockdown
        rivalSt(p, rid, now).last_hit = now; // v9: a checked rival can't seize turf for 3 days

        const isBossOfWeek = RIVALS[Math.floor(now / (7 * 86400)) % RIVALS.length].id === rid;

        // Alliance solidarity pact: if grudge hits 50+, ally prepares or triggers counter-raid
        const currentGrudge = p.grudges[rid];
        let retaliated = false;
        const ally = RIVAL_MAP[rival.ally_id];

        if (currentGrudge >= 50 && ally) {
          p.grudges[ally.id] = Math.min(100, (p.grudges[ally.id] || 0) + 10);
          if (!p.raid && (p.shield_until || 0) <= now) {
            retaliated = true;
            const raidAttack = Math.floor(getRivalPower(ally, p, now, { raid: true }) * 1.15 + 15);
            p.raid = {
              rival: ally.id,
              start: now,
              resolve_at: now + 50 + radioWarning(p),
              attack: raidAttack,
              fortify: 0,
              taunt: `[MUTUAL DEFENSE PACT] ${ally.boss} (${ally.name}): "You assaulted our brothers ${rival.name}! The ${rival.bloc} will tear your compound apart!"`,
            };
            p.log.unshift({
              t: now,
              msg: `ALLIANCE SOLIDARITY RAID TRIGGERED! ${ally.name} mobilized to retaliate for ${rival.name}! Raid hits in 50s.`,
              kind: "bad",
            });
          }
        }

        if (won) {
          let loot = Math.floor(effectiveRivalPower * 18 + p.level * 100);
          if (isBossOfWeek) {
            loot *= 2; // Double loot for Boss of the Week!
          }
          addCash(p, "dirty", BigInt(loot));
          recordCash(p, now, Number(loot), "dirty", "Fights & rivals", "Rival hit loot");
          p.lifetime = (BigInt(p.lifetime) + BigInt(loot)).toString();
          gainXp(isBossOfWeek ? 45 : 20);
          // v9 late game: retake seized turf, slow the rival's growth, damage the city boss
          const retaken = releaseAssets(p, rid, now);
          { const st = rivalSt(p, rid, now); st.growth = Math.round((st.growth || 0) * 0.9 * 1000) / 1000; }
          const cityDmg = cityDamage(p, effectivePlayerPower * 20 * (lgs(p).city?.boss === rid ? 2 : 1), "hit", now);
          bestsInc(p, "hits_won");
          p.season.points += isBossOfWeek ? 50 : 25;

          let dropName = "";
          const dropChance = isBossOfWeek ? 0.65 : 0.35;
          if (Math.random() < dropChance) {
            const pool = GEAR;
            const drop = pool[Math.floor(Math.random() * pool.length)];
            grantGear(p, drop.id, "reward");
            dropName = drop.name;
          }

          p.log.unshift({
            t: now,
            msg: `Hit landed on ${rival.name}! Defeated their crew (Your Pow: ${effectivePlayerPower} vs ${effectiveRivalPower}). Seized GH₵${loot.toLocaleString()} dirty cash${isBossOfWeek ? " (2x Boss of Week Bonus!)" : ""}.${dropName ? ` Loot drop: ${dropName}!` : ""}`,
            kind: "good",
          });
          const battle = makeBattle(p, now, {
            kind: "hit", won: true, title: `Hit on ${rival.name}`,
            us: { power: effectivePlayerPower }, them: { name: rival.name, boss: rival.boss, power: effectiveRivalPower },
            loot, lost: 0, heat: heatGain(p, 10), damage: {}, drop: dropName || undefined,
            notes: [isBossOfWeek ? "Boss of the Week: 2x loot" : "", retaliated ? `${ally?.name} launched a solidarity raid` : "", retaken.length ? `Turf retaken: ${retaken.join(", ")}` : "", cityDmg ? `City boss −${cityDmg.toLocaleString()} HP` : ""].filter(Boolean),
          });
          return {
            ok: true,
            result: {
              battle,
              won: true,
              loot,
              drop: dropName,
              bossOfWeek: isBossOfWeek,
              retaliated,
              playerPower: effectivePlayerPower,
              rivalPower: effectiveRivalPower,
            },
          };
        } else {
          p.log.unshift({
            t: now,
            msg: `Clashed with ${rival.name}! Their squad was too heavy (Your Pow: ${effectivePlayerPower} vs ${effectiveRivalPower}). Retreated under fire.`,
            kind: "bad",
          });
          const battle = makeBattle(p, now, {
            kind: "hit", won: false, title: `Hit on ${rival.name}`,
            us: { power: effectivePlayerPower }, them: { name: rival.name, boss: rival.boss, power: effectiveRivalPower },
            loot: 0, lost: 0, heat: heatGain(p, 10), damage: {},
            notes: [retaliated ? `${ally?.name} launched a solidarity raid` : ""].filter(Boolean),
          });
          return {
            ok: true,
            result: {
              battle,
              won: false,
              retaliated,
              playerPower: effectivePlayerPower,
              rivalPower: effectiveRivalPower,
            },
          };
        }
      }

      case "truce_rival": {
        const rid = payload.rival || payload.rid;
        const rival = RIVAL_MAP[rid];
        if (!rival) throw new Error("Rival syndicate not found");
        const currentGrudge = p.grudges[rid] || 0;
        const holdsTurf = Object.values(synState(p).seized).includes(rid);
        if (currentGrudge <= 0 && !(holdsTurf && (payload.kind || "gift") === "treaty")) throw new Error(`${rival.name} currently holds no grudge against you.`);
        
        const kind = payload.kind || "gift";
        if (kind === "treaty") {
          const costClean = Math.floor(75000 + currentGrudge * 500);
          if (BigInt(p.clean) < BigInt(costClean)) {
            throw new Error(`Need GH₵${costClean.toLocaleString()} clean cedis for official diplomatic peace treaty`);
          }
          addCash(p, "clean", -BigInt(costClean));
          recordCash(p, now, -costClean, "clean", "Rival Truce", `Peace treaty with ${rival.name}`);
          p.grudges[rid] = Math.max(0, currentGrudge - 50);
          if (!p.rival_relations) p.rival_relations = {};
          p.rival_relations[rid] = Math.min(100, (p.rival_relations[rid] ?? 50) + 30);
          releaseAssets(p, rid, now); // v9: a treaty hands seized turf back
          rivalSt(p, rid, now).last_hit = now;
          if (rival.ally_id && p.grudges[rival.ally_id]) {
            p.grudges[rival.ally_id] = Math.max(0, p.grudges[rival.ally_id] - 25);
          }
          p.log.unshift({
            t: now,
            msg: `Signed peace treaty with ${rival.name}! Handed GH₵${costClean.toLocaleString()} clean tribute. Grudge dropped by 50 to ${p.grudges[rid]}/100.`,
            kind: "good",
          });
        } else {
          const costDirty = Math.floor(45000 + currentGrudge * 600);
          if (BigInt(p.dirty) < BigInt(costDirty)) {
            throw new Error(`Need GH₵${costDirty.toLocaleString()} dirty cedis for street peace gift`);
          }
          addCash(p, "dirty", -BigInt(costDirty));
          recordCash(p, now, -costDirty, "dirty", "Rival Truce", `Peace offering to ${rival.name}`);
          p.grudges[rid] = Math.max(0, currentGrudge - 25);
          if (!p.rival_relations) p.rival_relations = {};
          p.rival_relations[rid] = Math.min(100, (p.rival_relations[rid] ?? 50) + 15);
          p.log.unshift({
            t: now,
            msg: `Sent street peace offering to ${rival.name} (GH₵${costDirty.toLocaleString()} dirty). Grudge lowered to ${p.grudges[rid]}/100.`,
            kind: "good",
          });
        }
        return { ok: true, result: { grudge: p.grudges[rid], relationship: p.rival_relations?.[rid] } };
      }

      case "rival_launder": {
        const rid = payload.rival || payload.rid;
        const rival = RIVAL_MAP[rid];
        if (!rival) throw new Error("Rival syndicate not found");
        const dk = dayKey(now);
        if (!p.rival_launder_day || p.rival_launder_day.day !== dk) {
          p.rival_launder_day = {
            day: dk,
            active_syndicates: pickDailyLaunderRivals(RIVALS.map((r) => r.id), 3),
            used: {},
          };
        }
        if (!p.rival_launder_day.active_syndicates?.includes(rid)) {
          throw new Error(`${rival.name} is not taking money laundering drops today. Only 3 rival syndicates offer laundering per day.`);
        }
        if (p.rival_launder_day.used?.[rid]) {
          throw new Error(`${rival.name} has already laundered dirty cash for you today. Each rival syndicate can only launder once per day. Return tomorrow!`);
        }
        const amt = Number(payload.amount);
        if (isNaN(amt) || amt <= 0) throw new Error("Enter a valid amount to launder");
        const cap = p.rival_launder_caps?.[rid] || 5000;
        if (amt > cap) throw new Error(`${rival.name} will only take up to GH₵${cap.toLocaleString()} dirty cash per day`);
        if (BigInt(p.dirty) < BigInt(amt)) throw new Error(`Not enough dirty cash (have GH₵${Number(p.dirty).toLocaleString()})`);

        const rel = p.rival_relations?.[rid] ?? 50;
        const grudge = p.grudges?.[rid] ?? 0;
        const commRate = calcRivalCommission(RIVAL_LAUNDER_BASE_COMMISSION, rel, grudge);
        const cut = Math.round(amt * commRate);
        const cleanGot = amt - cut;

        addCash(p, "dirty", -BigInt(amt));
        recordCash(p, now, -amt, "dirty", "Rival Laundering", `Sent to ${rival.name}`);

        addCash(p, "clean", BigInt(cleanGot));
        recordCash(p, now, cleanGot, "clean", "Rival Laundering", `Clean payout from ${rival.name} (${Math.round((1 - commRate) * 100)}% return)`);

        if (!p.rival_relations) p.rival_relations = {};
        p.rival_relations[rid] = Math.min(100, (p.rival_relations[rid] ?? 50) + 3);

        // 80% risk of adding +30 grudge when laundering with rival syndicates
        const rolledGrudge = Math.random() < 0.80;
        if (rolledGrudge) {
          p.grudges[rid] = Math.min(100, (p.grudges[rid] || 0) + 30);
          p.log.unshift({
            t: now,
            msg: `⚠️ RIVAL SUSPICION: ${rival.name} suspects you are using their channels to mask your empire expansion! +30 Grudge added (${p.grudges[rid]}/100).`,
            kind: "bad",
          });
        }

        // Mark this syndicate's daily quota as used
        p.rival_launder_day.used[rid] = true;

        progress("launder", 1);
        gainXp(Math.max(5, Math.floor(cleanGot / 500)));

        p.log.unshift({
          t: now,
          msg: `${rival.name} laundered GH₵${amt.toLocaleString()} dirty cash -> GH₵${cleanGot.toLocaleString()} clean (cut: ${Math.round(commRate * 100)}%). Daily quota completed. Relationship +3.${rolledGrudge ? " (+30 Grudge from suspicion!)" : ""}`,
          kind: "good",
        });

        return {
          ok: true,
          result: {
            rival: rid,
            dirty_in: amt,
            clean_out: cleanGot,
            commission_cut: cut,
            commission_rate: commRate,
            new_cap: p.rival_launder_caps[rid],
            new_rel: p.rival_relations[rid],
          },
        };
      }

      case "assassin_contract": {
        const rid = payload.rival || payload.rid;
        const contractType = payload.contract || payload.contract_type || "sabotage";
        const rival = RIVAL_MAP[rid];
        if (!rival) throw new Error("Rival syndicate not found");
        const contract = ASSASSIN_CONTACT.contracts.find((c) => c.id === contractType);
        if (!contract) throw new Error("Invalid assassin contract tier");
        if (contract.cost_clean > 0 && BigInt(p.clean) < BigInt(contract.cost_clean)) {
          throw new Error(`Need GH₵${contract.cost_clean.toLocaleString()} clean cedis to contract ${ASSASSIN_CONTACT.name}`);
        }
        if (contract.cost_dirty > 0 && BigInt(p.dirty) < BigInt(contract.cost_dirty)) {
          throw new Error(`Need GH₵${contract.cost_dirty.toLocaleString()} dirty cedis to contract ${ASSASSIN_CONTACT.name}`);
        }
        if (contract.cost_clean > 0) addCash(p, "clean", -BigInt(contract.cost_clean));
        if (contract.cost_dirty > 0) addCash(p, "dirty", -BigInt(contract.cost_dirty));
        if (!p.assassin_hits) p.assassin_hits = {};
        const durationSecs = (contract.duration_mins || 60) * 60;
        rivalSt(p, rid, now).last_hit = now;
        if (contract.id === "boss_hit") releaseAssets(p, rid, now); // v9: the Ghost takes seized turf back
        p.assassin_hits[rid] = {
          contract_type: contract.id,
          power_cut: contract.power_cut_pct,
          until: now + durationSecs,
        };

        if (contract.id === "sabotage") {
          p.grudges[rid] = Math.max(0, (p.grudges[rid] || 0) - (contract.grudge_drop || 30));
          p.rival_cd[rid] = Math.max(p.rival_cd[rid] || 0, now + (contract.lockdown_mins * 60));
          p.log.unshift({
            t: now,
            msg: `[ASSASSIN CONTRACT] Salifu "The Ghost" raided ${rival.name}'s supply depots! Power cut by 15%, corner locked down 30m, and grudge calmed (-${contract.grudge_drop}).`,
            kind: "good",
          });
        } else if (contract.id === "kneecap") {
          p.rival_cd[rid] = Math.max(p.rival_cd[rid] || 0, now + (contract.lockdown_mins * 60));
          p.grudges[rid] = Math.max(0, (p.grudges[rid] || 0) - (contract.grudge_drop || 50));
          p.log.unshift({
            t: now,
            msg: `[ASSASSIN CONTRACT] Salifu "The Ghost" neutralized key enforcers of ${rival.name}! Combat muscle slashed by 35% for 60m! Corner locked down 45m.`,
            kind: "good",
          });
        } else if (contract.id === "boss_hit") {
          p.grudges[rid] = 0;
          if (rival.ally_id && p.grudges[rival.ally_id]) {
            p.grudges[rival.ally_id] = Math.max(0, p.grudges[rival.ally_id] - 50);
          }
          p.rival_cd[rid] = Math.max(p.rival_cd[rid] || 0, now + (contract.lockdown_mins * 60));
          p.prestige.respect = (p.prestige.respect || 0) + 15;
          gainXp(50);
          p.log.unshift({
            t: now,
            msg: `[ARCHRIVAL HIT EXECUTED] Salifu "The Ghost" eliminated top command of ${rival.name}! Power gutted by 60%, grudge wiped clean, corner locked down 2 hours, +15 Syndicate Respect!`,
            kind: "good",
          });
        }
        return { ok: true, result: { rival: rid, contract: contract.id, until: p.assassin_hits[rid].until } };
      }

      // ===================== v9 LATE GAME ACTIONS =====================
      case "retire_rebuild": {
        const life = Number(p.lifetime || 0);
        const tokens = retireTokens(life);
        if (!tokens) throw new Error(`Retire & Rebuild needs GH₵${RETIRE_MIN_LIFETIME.toLocaleString()} lifetime earnings`);
        if (!payload.confirm) throw new Error("Confirm the Retire & Rebuild first");
        const L = lgs(p);
        const respectGain = 2 * Math.max(1, Math.floor(Math.sqrt(life / 1_000_000)));
        L.legacy.tokens += tokens;
        L.legacy.earned += tokens;
        L.legacy.retires += 1;
        p.prestige.count += 1;
        p.prestige.respect += respectGain;
        // Full reset: run progress, clean cash, facilities and upgrades. Crew, gear, boutique assets,
        // lieutenants, legacy perks, project unlocks and district influence carry over.
        p.level = 1;
        p.xp = 0;
        addCash(p, "dirty", 200n - BigInt(p.dirty));
        addCash(p, "clean", -BigInt(p.clean));
        p.heat = 0;
        // v9 LAND: a new run starts with no land and no hustle; the free first business can be claimed again
        p.hustles = {} as any;
        p.hustle_condition = {};
        p.player_plots = INITIAL_PLAYER_PLOTS.map((x) => ({ ...x }));
        (p as any).first_business_claimed = false;
        p.hustle_managers = {};
        p.hustle_assign = {};
        p.hustle_daily = {};
        p.fronts = {};
        p.front_condition = {};
        p.front_assign = {};
        p.batches = [];
        p.heists = [];
        p.facilities = {};
        p.facility_condition = {};
        p.facility_assign = {};
        p.upgrades = {};
        p.skill_points = 0;
        p.cooldowns = { launder_until: 0, heist_until: 0, front: {} };
        p.crew.forEach((c) => { if (c.assign && c.assign !== "lieutenant" && !String(c.assign).startsWith("project:")) c.assign = null; });
        synState(p).seized = {};
        const startFronts = FRONTS.filter((f) => !f.gate).slice(0, legacyRank(p, "start_front"));
        startFronts.forEach((f) => { p.fronts[f.id] = 1; p.front_condition![f.id] = 100; });
        bestsInc(p, "retires");
        p.log.unshift({ t: now, msg: `RETIRE & REBUILD: the old empire is sold off. +${respectGain} Respect, +${tokens} Legacy Token${tokens > 1 ? "s" : ""}.${startFronts.length ? ` Old connections reopened: ${startFronts.map((f) => f.name).join(", ")}.` : ""}`, kind: "good" });
        return { ok: true, result: { tokens, respect: respectGain, start_fronts: startFronts.map((f) => f.id) } };
      }

      case "legacy_buy": {
        const perk = LEGACY_MAP[payload.id];
        if (!perk) throw new Error("Legacy perk not found");
        const L = lgs(p);
        const rank = legacyRank(p, perk.id);
        if (rank >= perk.max) throw new Error(`${perk.name} is maxed`);
        if (L.legacy.tokens < perk.cost) throw new Error(`Need ${perk.cost} Legacy Tokens`);
        L.legacy.tokens -= perk.cost;
        L.legacy.perks[perk.id] = rank + 1;
        p.log.unshift({ t: now, msg: `Legacy perk: ${perk.name} rank ${rank + 1}.`, kind: "good" });
        return { ok: true, result: { id: perk.id, rank: rank + 1, tokens: L.legacy.tokens } };
      }

      case "city_fund": {
        const C = cityEnsure(p, now);
        if (C.hp <= 0) throw new Error("The city boss is already down this week");
        const pct = Math.floor(Number(payload.pct || 1));
        if (!(pct >= 1 && pct <= 50)) throw new Error("Fund between 1% and 50% of the boss's HP");
        const leftPct = Math.max(0, 50 - Math.floor((C.dmg.cash / C.max_hp) * 100));
        if (pct > leftPct) throw new Error(`Cash can only deal ${leftPct}% more this week. Use heists and hits for the rest.`);
        const cost = cityFundCostPerPct(p, now) * pct;
        if (BigInt(p.dirty) < BigInt(cost)) throw new Error(`Need GH₵${cost.toLocaleString()} dirty cash`);
        addCash(p, "dirty", -BigInt(cost));
        recordCash(p, now, -cost, "dirty", "City Boss", `Funded ${pct}% damage against the city boss`);
        const dmg = cityDamage(p, Math.ceil((C.max_hp * pct) / 100), "cash", now);
        return { ok: true, result: { cost, dmg, hp: C.hp } };
      }

      case "city_claim": {
        const C = cityEnsure(p, now);
        const m = Number(payload.m);
        if (!CITY_BOSS_MILESTONES.includes(m)) throw new Error("Unknown milestone");
        if (C.claimed.includes(m)) throw new Error("Already claimed");
        if (C.hp > C.max_hp * (1 - m / 100)) throw new Error(`Boss must be ${m}% down first`);
        C.claimed.push(m);
        const L = lgs(p);
        const clean = Math.max(5000, Math.floor(hourlyIncome(p, now) * (m / 25) * 2));
        addCash(p, "clean", BigInt(clean));
        recordCash(p, now, clean, "clean", "City Boss", `City boss ${m}% loot`);
        const extras: string[] = [];
        if (m === 50) { L.chips = (L.chips || 0) + 10; extras.push("10 Kingpin chips"); }
        if (m === 75) { const g = GEAR[Math.floor(Math.random() * GEAR.length)]; grantGear(p, g.id, "reward"); extras.push(g.name); }
        if (m === 100) {
          L.legacy.tokens += 1; L.chips = (L.chips || 0) + 50; extras.push("1 Legacy Token", "50 chips");
          const cos = COSMETICS.find((x) => !p.cosmetics.includes(x.id));
          if (cos) { p.cosmetics.push(cos.id); extras.push(cos.name); }
        }
        p.log.unshift({ t: now, msg: `City boss ${m}% loot: +GH₵${clean.toLocaleString()} clean${extras.length ? `, ${extras.join(", ")}` : ""}.`, kind: "good" });
        return { ok: true, result: { m, clean, extras } };
      }

      case "influence_buy": {
        const did = payload.district;
        if (!DISTRICTS.some((d) => d.id === did)) throw new Error("District not found");
        const L = lgs(p);
        const lvl = influenceLvl(p, did);
        if (lvl >= INFLUENCE_MAX) throw new Error("Influence is maxed in this district");
        const cost = influenceCost(lvl);
        if (BigInt(p.clean) < BigInt(cost)) throw new Error(`Need GH₵${cost.toLocaleString()} clean cash`);
        // bank hustle income at the old rate before the multiplier changes
        Object.keys(p.hustles).forEach((k) => { if (HUSTLE_MAP[k]?.district === did) { (p.hustles[k] as any).bank = accrued(p, k, now); p.hustles[k].ts = now; } });
        addCash(p, "clean", -BigInt(cost));
        L.influence[did] = lvl + 1;
        recordCash(p, now, -cost, "clean", "District Influence", `${did} influence level ${lvl + 1}`);
        p.log.unshift({ t: now, msg: `Bought influence in ${DISTRICTS.find((d) => d.id === did)?.name}: level ${lvl + 1}.`, kind: "good" });
        return { ok: true, result: { district: did, lvl: lvl + 1, cost } };
      }

      case "street_launder": {
        // v9 economy: the slow, lossy early laundering path (a forex changer in the market), no front needed
        if (p.arrested_until && now < p.arrested_until) throw new Error("Can't wash cash from a police cell");
        const P = p as any;
        const left = Math.max(0, (Number(P.street_launder_until) || 0) - now);
        if (left > 0) throw new Error(`The changer is lying low for ${Math.ceil(left / 60)} more min`);
        const max = streetLaunderMax(p);
        const amount = Math.min(max, Math.floor(Number(payload.amount) || max), Number(p.dirty));
        if (!(amount >= 100)) throw new Error("Need at least GH₵100 dirty cash");
        const clean = Math.floor(amount * STREET_LAUNDER.rate);
        addCash(p, "dirty", -BigInt(amount));
        addCash(p, "clean", BigInt(clean));
        P.street_launder_until = now + STREET_LAUNDER.cd;
        p.heat = Math.min(100, p.heat + heatGain(p, STREET_LAUNDER.heat));
        recordCash(p, now, -amount, "dirty", "Street Changer", "Dirty cash handed to the changer");
        recordCash(p, now, clean, "clean", "Street Changer", `Washed at ${Math.round(STREET_LAUNDER.rate * 100)}%`);
        progress("launder", 1);
        p.log.unshift({ t: now, msg: `Street changer washed GH₵${amount.toLocaleString()} dirty → GH₵${clean.toLocaleString()} clean (40% cut).`, kind: "info" });
        if (p.heat >= 100) triggerArrest(p, now);
        return { ok: true, result: { amount, clean } };
      }

      case "offshore_wash": {
        const amount = Math.floor(Number(payload.amount));
        if (!(amount >= OFFSHORE.min)) throw new Error(`Offshore washes start at GH₵${OFFSHORE.min.toLocaleString()}`);
        if (!offshoreHacker(p)) throw new Error("You need a Hacker managing a front (or serving as lieutenant) to open offshore accounts");
        if (p.arrested_until && now < p.arrested_until) throw new Error("Can't wire money from a police cell");
        const L = lgs(p);
        const dk = dayKey(now);
        if (L.offshore?.day !== dk) L.offshore = { day: dk, count: 0, total: 0, seized: L.offshore?.seized || 0 };
        if (L.offshore.count >= OFFSHORE.daily_count) throw new Error(`Offshore desk is closed until tomorrow (${OFFSHORE.daily_count}/day)`);
        if (L.offshore.total + amount > OFFSHORE.daily_cap) throw new Error(`Daily offshore cap is GH₵${OFFSHORE.daily_cap.toLocaleString()}`);
        if (BigInt(p.dirty) < BigInt(amount)) throw new Error("Not enough dirty cash");
        const rate = offshoreRate(Math.floor(now / DAY_S), p.heat, cityMods(p).offshore);
        const risk = Math.min(OFFSHORE.max_risk, OFFSHORE.base_risk + p.heat * OFFSHORE.risk_per_heat);
        L.offshore.count += 1;
        L.offshore.total += amount;
        addCash(p, "dirty", -BigInt(amount));
        if (Math.random() < risk) {
          const back = Math.floor(amount * (1 - OFFSHORE.seize_loss));
          addCash(p, "dirty", BigInt(back));
          L.offshore.seized = (L.offshore.seized || 0) + 1;
          p.heat = Math.min(100, p.heat + heatGain(p, 15));
          recordCash(p, now, -(amount - back), "dirty", "Offshore", "Offshore wire frozen by regulators");
          p.log.unshift({ t: now, msg: `OFFSHORE SEIZURE: regulators froze the wire. Lost GH₵${(amount - back).toLocaleString()}, recovered GH₵${back.toLocaleString()} dirty.`, kind: "bad" });
          if (p.heat >= 100) triggerArrest(p, now);
          return { ok: true, result: { seized: true, lost: amount - back, returned: back, rate, risk } };
        }
        const clean = Math.floor(amount * rate);
        addCash(p, "clean", BigInt(clean));
        p.heat = Math.min(100, p.heat + heatGain(p, 5));
        recordCash(p, now, clean, "clean", "Offshore", `Offshore wash at ${(rate * 100).toFixed(1)}%`);
        p.log.unshift({ t: now, msg: `Offshore wash cleared: GH₵${amount.toLocaleString()} dirty → GH₵${clean.toLocaleString()} clean (rate ${(rate * 100).toFixed(1)}%).`, kind: "good" });
        return { ok: true, result: { seized: false, clean, rate, risk } };
      }

      case "lt_promote": {
        const c = p.crew.find((x) => x.id === payload.cid);
        if (!c || c.merc) throw new Error("Crew member not found");
        const did = payload.district;
        if (!DISTRICTS.some((d) => d.id === did)) throw new Error("Pick a district");
        const L = lgs(p);
        const n = Object.keys(L.lieutenants).length;
        if (L.lieutenants[c.id]) throw new Error(`${c.name} is already a lieutenant`);
        if (n >= LIEUTENANT.max) throw new Error(`Max ${LIEUTENANT.max} lieutenants`);
        if (c.lvl < LIEUTENANT.min_lvl) throw new Error(`${c.name} needs level ${LIEUTENANT.min_lvl}`);
        if (c.assign) throw new Error(`${c.name} is busy (${c.assign})`);
        assertFit(c);
        const cost = LIEUTENANT.promote_cost(n);
        if (BigInt(p.clean) < BigInt(cost)) throw new Error(`Need GH₵${cost.toLocaleString()} clean cash`);
        addCash(p, "clean", -BigInt(cost));
        recordCash(p, now, -cost, "clean", "Lieutenants", `Promoted ${c.name}`);
        L.lieutenants[c.id] = { district: did, since: now, active: true };
        c.assign = "lieutenant";
        p.log.unshift({ t: now, msg: `${c.name} promoted to Lieutenant of ${DISTRICTS.find((d) => d.id === did)?.name}.`, kind: "good" });
        return { ok: true, result: { cid: c.id, district: did, cost } };
      }

      case "lt_assign": {
        const L = lgs(p);
        const lt = L.lieutenants[payload.cid];
        if (!lt) throw new Error("Not a lieutenant");
        if (!DISTRICTS.some((d) => d.id === payload.district)) throw new Error("Pick a district");
        lt.district = payload.district;
        return { ok: true, result: { district: lt.district } };
      }

      case "lt_dismiss": {
        const L = lgs(p);
        if (!L.lieutenants[payload.cid]) throw new Error("Not a lieutenant");
        delete L.lieutenants[payload.cid];
        const c = p.crew.find((x) => x.id === payload.cid);
        if (c && c.assign === "lieutenant") c.assign = null;
        return { ok: true, result: { cid: payload.cid } };
      }

      case "auction_buy": {
        const A = auctionEnsure(p, now);
        if (A.bought) throw new Error("Today's legend has already signed");
        const cap = 9 + Math.min(5, p.upgrades?.quarters || 0);
        if (p.crew.filter((c) => !c.merc).length >= cap) throw new Error(`Crew is full (${cap}). Expand quarters first.`);
        const price = auctionPrice(A, now);
        if (BigInt(p.clean) < BigInt(price)) throw new Error(`Need GH₵${price.toLocaleString()} clean cash`);
        addCash(p, "clean", -BigInt(price));
        recordCash(p, now, -price, "clean", "Crew Auction", `Signed legend ${A.crew.name}`);
        const c = { ...A.crew, id: uid(), assign: null };
        p.crew.push(c);
        A.bought = true;
        p.log.unshift({ t: now, msg: `LEGEND SIGNED: ${c.name} (${c.origin}) joins for GH₵${price.toLocaleString()} clean.`, kind: "good" });
        return { ok: true, result: { crew: c.id, price } };
      }

      case "kingpin_bet": {
        const t = KINGPIN_TABLES.find((x) => x.id === payload.table);
        if (!t) throw new Error("Table not found");
        const cur = (payload.currency || "dirty") as "clean" | "dirty";
        if (!["clean", "dirty"].includes(cur)) throw new Error("Invalid currency");
        const stake = Math.floor(Number(payload.amount));
        if (!(stake >= t.min)) throw new Error(`${t.name} minimum is GH₵${t.min.toLocaleString()}`);
        if (BigInt(p[cur]) < BigInt(stake)) throw new Error(`Not enough ${cur} cash`);
        const L = lgs(p);
        p[cur] = (BigInt(p[cur]) - BigInt(stake)).toString();
        recordCash(p, now, -stake, cur, "Kingpin Table", `${t.name} stake`);
        const won = Math.random() < t.prob;
        let payout = 0;
        let chips = 0;
        if (won) {
          const gross = Math.floor(stake * t.mult);
          payout = gross - Math.floor(gross * BETTING_CONFIG.take_rate);
          addCash(p, "clean", BigInt(payout));
          recordCash(p, now, payout, "clean", "Kingpin Table", `${t.name} win`);
          chips = Math.max(1, Math.floor((stake / 100_000) * Math.sqrt(t.mult) / 10));
          bestsMax(p, "biggest_win", payout);
        } else {
          chips = Math.max(1, Math.floor(stake / 1_000_000)); // comps
        }
        L.chips = (L.chips || 0) + chips;
        p.log.unshift({ t: now, msg: `${t.name}: ${won ? `WON GH₵${payout.toLocaleString()} clean` : `lost GH₵${stake.toLocaleString()}`} · +${chips} Kingpin chips.`, kind: won ? "good" : "bad" });
        return { ok: true, result: { won, payout, chips, table: t.id } };
      }

      case "chips_redeem": {
        const item = CHIP_SHOP.find((x) => x.id === payload.id);
        if (!item) throw new Error("Item not found");
        const L = lgs(p);
        if ((L.chips || 0) < item.chips) throw new Error(`Need ${item.chips} chips`);
        let got = item.name;
        if (item.id === "heat_wipe") {
          if (p.arrested_until && now < p.arrested_until) throw new Error("Can't clear heat while arrested");
          p.heat = 0;
        } else if (item.id === "cosmetic") {
          const pool = COSMETICS.filter((x) => !p.cosmetics.includes(x.id));
          if (!pool.length) throw new Error("You own every cosmetic");
          const cos = pool[Math.floor(Math.random() * pool.length)];
          p.cosmetics.push(cos.id);
          got = cos.name;
        } else if (item.id === "token") {
          L.legacy.tokens += 1;
        }
        L.chips -= item.chips;
        p.log.unshift({ t: now, msg: `Redeemed ${item.chips} chips: ${got}.`, kind: "good" });
        return { ok: true, result: { id: item.id, got, chips: L.chips } };
      }

      case "project_fund": {
        const P = PROJECT_MAP[payload.pid];
        if (!P) throw new Error("Project not found");
        if (p.level < P.min_level) throw new Error(`Needs Boss level ${P.min_level}`);
        const L = lgs(p);
        const st = L.projects[P.id] || (L.projects[P.id] = { stage: 0, running: false, ready_at: 0, done: false });
        if (st.done) throw new Error("Already complete");
        if (st.running) throw new Error("This stage is still being built");
        const S = P.stages[st.stage];
        if (BigInt(p.dirty) < BigInt(S.dirty)) throw new Error(`Need GH₵${S.dirty.toLocaleString()} dirty cash`);
        if (BigInt(p.clean) < BigInt(S.clean)) throw new Error(`Need GH₵${S.clean.toLocaleString()} clean cash`);
        const idle = p.crew.filter((c) => !c.assign && !c.merc && !crewOut(c));
        const picked = (payload.crew || []).length ? idle.filter((c) => payload.crew.includes(c.id)) : idle.slice(0, S.crew);
        if (picked.length < S.crew) throw new Error(`Needs ${S.crew} idle crew`);
        addCash(p, "dirty", -BigInt(S.dirty));
        addCash(p, "clean", -BigInt(S.clean));
        recordCash(p, now, -S.dirty, "dirty", "Empire Project", `${P.name} stage ${st.stage + 1}`);
        recordCash(p, now, -S.clean, "clean", "Empire Project", `${P.name} stage ${st.stage + 1}`);
        picked.slice(0, S.crew).forEach((c) => (c.assign = `project:${P.id}`));
        st.running = true;
        st.ready_at = now + S.hours * H;
        p.log.unshift({ t: now, msg: `${P.name}: stage ${st.stage + 1}/${P.stages.length} funded. Crew on site for ${S.hours}h.`, kind: "info" });
        return { ok: true, result: { pid: P.id, stage: st.stage + 1, ready_at: st.ready_at } };
      }

      case "confront_raid": {
        if (!p.raid) throw new Error("No active raid incoming");
        resolveRaid(p, now);
        return { ok: true, result: { resolved: true, battle: p.last_battle } };
      }

      case "battle_seen": {
        if (p.last_battle && (!payload.id || p.last_battle.id === payload.id)) p.last_battle.seen = true;
        return { ok: true, result: {} };
      }

      case "battle_record": {
        // client-side fights (offline Turf War mock) register their report so playback uses the real numbers
        const b = payload || {};
        const rep = makeBattle(p, now, {
          kind: "turf", won: !!b.won, title: `Turf war vs ${String(b.target || "rival").slice(0, 40)}`,
          us: { power: Math.round(Number(b.my_power) || 0) },
          them: { name: String(b.target || "Rival").slice(0, 40), boss: String(b.target || "Rival").slice(0, 40), power: Math.round(Number(b.opp_power) || 0) },
          loot: Math.max(0, Math.round(Number(b.loot) || 0)), lost: 0, heat: 0, damage: {}, notes: [],
        });
        return { ok: true, result: { battle: rep } };
      }

      case "fortify": {
        if (!p.raid) throw new Error("No active raid");
        if (p.raid.fortify >= 5) throw new Error("Max fortify reached for this raid");
        const cost = 500 + p.raid.fortify * 300;
        if (BigInt(p.dirty) < BigInt(cost)) throw new Error("Not enough dirty cedis to fortify");
        addCash(p, "dirty", -BigInt(cost));
        p.raid.fortify += 1;
        p.log.unshift({ t: now, msg: `Fortified gates! +15 Defence against incoming raid.`, kind: "good" });
        return { ok: true, result: { fortify: p.raid.fortify } };
      }

      case "daily_claim": {
        if (p.daily?.login_claimed) throw new Error("Already claimed today");
        p.daily.login_claimed = true;
        // v9 bug fix: the streak resets after a missed day; one grace day per 7-day run saves it.
        if (!p.streak) p.streak = { count: 0, last_day: "", grace_used: false };
        const today = dayKey(now);
        const yesterday = dayKey(now - 86400);
        const dayBefore = dayKey(now - 2 * 86400);
        let graceUsedNow = false;
        if (p.streak.last_day === today) {
          // already counted today (shouldn't happen, login_claimed guards it)
        } else if (p.streak.last_day === yesterday) {
          p.streak.count += 1;
        } else if (p.streak.last_day === dayBefore && !p.streak.grace_used) {
          p.streak.count += 1;
          p.streak.grace_used = true;
          graceUsedNow = true;
        } else {
          p.streak.count = 1;
          p.streak.grace_used = false;
        }
        if (p.streak.count % 7 === 0) p.streak.grace_used = false; // grace refills every 7 days
        const streak = p.streak.count;
        p.streak.last_day = today;
        const cleanReward = Math.max(100 * streak, Math.floor(hourlyIncome(p, now) * 0.15 * Math.min(10, streak))); // v9: scales with income
        addCash(p, "clean", BigInt(cleanReward));
        p.pass.xp += 50;
        p.log.unshift({ t: now, msg: `Day ${streak} streak reward: +GH₵${cleanReward.toLocaleString()} clean & +50 Pass XP!`, kind: "good" });
        return { ok: true, result: { reward: cleanReward, clean: cleanReward, streak, grace_used: graceUsedNow } };
      }

      case "contract_claim": {
        const idx = payload.idx;
        const c = p.daily?.contracts?.[idx];
        if (!c) throw new Error("Contract not found");
        if (c.progress < c.target) throw new Error("Contract requirements not met");
        if (c.claimed) throw new Error("Already claimed");
        c.claimed = true;
        const isElite = String(c.type).startsWith("elite_");
        const reward = Math.max(c.reward_clean, Math.floor(hourlyIncome(p, now) * (isElite ? 2 : 0.25))); // v9: scales with income
        addCash(p, "clean", BigInt(reward));
        p.pass.xp += c.reward_pass;
        if (isElite) (p as any).chips = ((p as any).chips || 0) + 5;
        p.log.unshift({ t: now, msg: `Contract fulfilled: +GH₵${reward.toLocaleString()} clean & +${c.reward_pass} Pass XP${isElite ? " & 5 Kingpin chips" : ""}!`, kind: "good" });
        return { ok: true, result: { reward } };
      }

      case "pass_claim": {
        const { tier, track } = payload;
        const unlockedTier = Math.floor(p.pass.xp / PASS_XP_PER_TIER);
        if (tier > unlockedTier) throw new Error("Tier not reached yet");
        const isPrem = track === "prem" || track === "premium";
        if (isPrem && !p.pass.premium) throw new Error("Street Pass Premium required");

        const claimedList = isPrem ? p.pass.prem : p.pass.free;
        if (claimedList.includes(tier)) throw new Error("Already claimed");
        claimedList.push(tier);

        const cleanGift = Math.max(tier * 300 + 200, Math.floor(hourlyIncome(p, now) * 0.05 * tier)); // v9: scales with income
        addCash(p, "clean", BigInt(cleanGift));
        p.log.unshift({ t: now, msg: `Street Pass Tier ${tier} (${track}) claimed: +GH₵${cleanGift.toLocaleString()} Clean!`, kind: "good" });
        return { ok: true, result: { tier, clean: cleanGift } };
      }

      case "prestige": {
        const gain = Math.max(1, Math.floor(Math.sqrt(Math.max(0, Number(p.lifetime || 0) / 1000000))));
        if (Number(p.lifetime || 0) < 500000) throw new Error("Need at least GH₵500,000 lifetime earnings to establish respect when retiring");
        p.prestige.count += 1;
        p.prestige.respect += gain;
        p.level = 1;
        p.xp = 0;
        addCash(p, "dirty", 200n - BigInt(p.dirty));
        p.heat = 0;
        p.hustles = {};
        p.player_plots = INITIAL_PLAYER_PLOTS.map((x) => ({ ...x }));
        (p as any).first_business_claimed = false;
        p.fronts = {};
        p.batches = [];
        p.heists = [];
        p.log.unshift({ t: now, msg: `Retired to the village. Gained +${gain} Syndicate Respect!`, kind: "good" });
        return { ok: true, result: { respect: gain } };
      }

      case "equip": {
        const { slot } = payload;
        const id = payload.cosmetic !== undefined ? payload.cosmetic : payload.id;
        if (p.equipped && slot in p.equipped) {
          (p.equipped as any)[slot] = id || null;
        }
        return { ok: true, result: { equipped: p.equipped } };
      }

      case "equip_gear": {
        const { target, slot, uid: itemUid } = payload;
        if (itemUid) {
          // Remove from anyone else who has it
          if (p.loadout) {
            Object.keys(p.loadout).forEach((s) => {
              if (p.loadout[s] === itemUid) p.loadout[s] = null;
            });
          }
          (p.crew || []).forEach((c) => {
            if (c.loadout) {
              Object.keys(c.loadout).forEach((s) => {
                if (c.loadout[s] === itemUid) c.loadout[s] = null;
              });
            }
          });
        }

        if (target === "boss") {
          if (!p.loadout) p.loadout = {};
          p.loadout[slot] = itemUid || null;
        } else {
          const c = p.crew.find((x) => x.id === target);
          if (c) {
            if (!c.loadout) c.loadout = {};
            c.loadout[slot] = itemUid || null;
          }
        }
        return { ok: true, result: { target, slot } };
      }

      case "set_avatar": {
        p.avatar = { ...p.avatar, ...payload };
        return { ok: true, result: { avatar: p.avatar } };
      }

      case "ad_reward": {
        const kind = payload.kind;
        if (kind === "double") {
          const bonus = Math.floor(parseInt(p.dirty) * 0.25) || 500;
          addCash(p, "dirty", BigInt(bonus));
          p.ads.double = true;
          return { ok: true, result: { earned: bonus.toString() } };
        } else if (kind === "heist_slot") {
          const today = dayKey(now);
          if (!p.heist_day || p.heist_day.day !== today) {
            p.heist_day = { day: today, count: 0, ad_extra: 0 };
          }
          p.heist_day.ad_extra = (p.heist_day.ad_extra || 0) + 1;
          p.log.unshift({
            t: now,
            msg: `Street broadcast ad viewed! +1 Heist Slot unlocked for today (${p.heist_day.count}/${heistLimit(p, now)}).`,
            kind: "good",
          });
          return { ok: true, result: { heist_slot: true, count: p.heist_day.count, max: heistLimit(p, now) } };
        } else {
          p.store.bought = [];
          p.ads.restock = true;
          return { ok: true, result: { restocked: true } };
        }
      }

      // Farm actions
      case "farm_buy_plot": {
        const plots = p.farm.plots || [];
        if (plots.length >= FARM.max_plots) throw new Error("Max farm plots reached");
        const cost = Math.floor(FARM.plot_cost * Math.pow(FARM.plot_growth, plots.length));
        if (BigInt(p.clean) < BigInt(cost)) throw new Error(`Needs clean cash: GH₵${cost.toLocaleString()} clean for a farm plot`);
        addCash(p, "clean", -BigInt(cost));
        recordCash(p, now, -cost, "clean", "Grow Farm", `Farm plot #${plots.length + 1}`);
        plots.push({ idx: plots.length, strain: null, planted: 0, end: 0, yield: 0 });
        p.farm.plots = plots;
        p.log.unshift({ t: now, msg: `Cleared plot #${plots.length} for organic crops!`, kind: "good" });
        return { ok: true, result: { plots: plots.length } };
      }

      case "farm_upgrade": {
        const key = payload.key;
        const up = FARM.upgrades[key as keyof typeof FARM.upgrades];
        if (!up) throw new Error("Farm upgrade not found");
        const current = p.farm?.up?.[key] || 0;
        if (current >= up.max) throw new Error("Already maxed level");
        const cost = Math.floor(up.cost * Math.pow(1.8, current));
        if (BigInt(p.clean) < BigInt(cost)) throw new Error(`Needs clean cash: GH₵${cost.toLocaleString()} clean for ${up.name}`);
        addCash(p, "clean", -BigInt(cost));
        recordCash(p, now, -cost, "clean", "Grow Farm", `${up.name} level ${current + 1}`);
        if (!p.farm.up) p.farm.up = {};
        p.farm.up[key] = current + 1;
        gainXp(10);
        p.log.unshift({ t: now, msg: `Upgraded ${up.name} to Level ${current + 1}`, kind: "good" });
        return { ok: true, result: { lvl: current + 1 } };
      }

      case "farm_plant": {
        const idx = payload.plot !== undefined ? payload.plot : payload.idx;
        const strain = payload.strain;
        const pl = p.farm.plots[idx];
        if (!pl) throw new Error("Plot not found");
        if (pl.strain) throw new Error("Plot already planted");
        const str = STRAIN_MAP[strain];
        if (!str) throw new Error("Strain not found");
        if (BigInt(p.dirty) < BigInt(str.seed)) throw new Error("Not enough dirty cedis for seeds");
        addCash(p, "dirty", -BigInt(str.seed));

        const lightUp = p.farm.up?.lights || 0;
        const dur = Math.max(10, Math.floor(str.grow * (1 - lightUp * 0.1)));
        const irrUp = p.farm.up?.irrigation || 0;
        const yieldAmt = Math.floor((str.yield[0] + Math.random() * (str.yield[1] - str.yield[0])) * (1 + irrUp * 0.15));

        pl.strain = strain;
        pl.start = now;
        pl.planted = now;
        pl.end = now + dur;
        pl.yield = yieldAmt;
        p.log.unshift({ t: now, msg: `Planted ${str.name} on plot #${idx + 1}.`, kind: "info" });
        return { ok: true, result: { plot: idx, strain } };
      }

      case "farm_harvest": {
        if (payload.plot === "all") {
          const harvestMap: Record<string, number> = {};
          let totalYield = 0;
          p.farm.plots.forEach((pl, i) => {
            if (pl.strain && now >= pl.end) {
              const s = pl.strain;
              const y = pl.yield;
              p.farm.stash[s] = (p.farm.stash[s] || 0) + y;
              harvestMap[s] = (harvestMap[s] || 0) + y;
              totalYield += y;
              pl.strain = null;
              pl.start = 0;
              pl.planted = 0;
              pl.end = 0;
              pl.yield = 0;
            }
          });
          gainXp(25);
          p.log.unshift({ t: now, msg: `Harvested all crops (${totalYield} total units) into stash!`, kind: "good" });
          return { ok: true, result: { harvest: harvestMap, total: totalYield } };
        }

        const idx = payload.plot !== undefined ? payload.plot : payload.idx;
        const pl = p.farm.plots[idx];
        if (!pl || !pl.strain) throw new Error("Nothing to harvest");
        if (now < pl.end) throw new Error("Crops still maturing");
        const s = pl.strain;
        const y = pl.yield;
        p.farm.stash[s] = (p.farm.stash[s] || 0) + y;
        pl.strain = null;
        pl.start = 0;
        pl.planted = 0;
        pl.end = 0;
        pl.yield = 0;
        gainXp(15);
        p.log.unshift({ t: now, msg: `Harvested ${y} bunches of ${STRAIN_MAP[s]?.name || s}! Stashed for sale.`, kind: "good" });
        return { ok: true, result: { strain: s, amount: y, harvest: { [s]: y } } };
      }

      case "farm_sell": {
        throw new Error("Direct sales are disabled. Use the Smuggler to sell your items.");
      }

      case "workshop_start": {
        const benchIdx = Number(payload.bench !== undefined ? payload.bench : payload.idx);
        const weaponId = payload.weaponId;
        const bench = p.workshop.benches[benchIdx];
        if (!bench) throw new Error("Bench not found");
        if (bench.weaponId) throw new Error("Bench is already busy");
        const weapon = CRAFTABLE_WEAPONS.find(w => w.id === weaponId);
        if (!weapon) throw new Error("Weapon blueprint not found");
        
        const cost = weapon.cost || 5000;
        if (BigInt(p.dirty) < BigInt(cost)) throw new Error(`Needs GH₵${cost.toLocaleString()} dirty cash for materials`);
        
        addCash(p, "dirty", -BigInt(cost));
        recordCash(p, now, -cost, "dirty", "Purchases & gear", `Started crafting ${weapon.name}`);
        
        const toolsUp = p.workshop.up?.tools || 0;
        const duration = Math.max(H * 4, Math.floor(weapon.dur * (1 - toolsUp * 0.1)));
        
        bench.weaponId = weaponId;
        bench.start = now;
        bench.end = now + duration;
        
        p.log.unshift({ t: now, msg: `Started crafting ${weapon.name} in the workshop. Ready in ${Math.round(duration/3600)}h.`, kind: "info" });
        return { ok: true, result: { bench: benchIdx, weaponId, end: bench.end } };
      }

      case "workshop_claim": {
        const benchIdx = Number(payload.bench !== undefined ? payload.bench : payload.idx);
        const bench = p.workshop.benches[benchIdx];
        if (!bench || !bench.weaponId) throw new Error("Nothing to claim");
        if (now < bench.end) throw new Error("Weapon still being forged");
        
        const weaponId = bench.weaponId;
        const weapon = CRAFTABLE_WEAPONS.find(w => w.id === weaponId);
        grantGear(p, weaponId, "workshop");
        
        bench.weaponId = null;
        bench.start = 0;
        bench.end = 0;
        
        gainXp(50);
        p.log.unshift({ t: now, msg: `Forging complete! ${weapon?.name || weaponId} added to your locker.`, kind: "good" });
        return { ok: true, result: { claimed: weaponId } };
      }

      case "workshop_buy_bench": {
        if (p.workshop.benches.length >= WORKSHOP.max_benches) throw new Error(`Maximum workshop benches reached (${WORKSHOP.max_benches})`);
        const cost = Math.floor(WORKSHOP.bench_cost * Math.pow(WORKSHOP.bench_growth, p.workshop.benches.length - 1));
        if (BigInt(p.clean) < BigInt(cost)) throw new Error(`Needs GH₵${cost.toLocaleString()} clean cash for a new bench`);
        
        addCash(p, "clean", -BigInt(cost));
        recordCash(p, now, -cost, "clean", "Facilities & vault", "Purchased workshop crafting bench");
        
        p.workshop.benches.push({ weaponId: null, start: 0, end: 0 });
        p.log.unshift({ t: now, msg: `Expanded the workshop! Bench #${p.workshop.benches.length} is now open.`, kind: "good" });
        return { ok: true, result: { benches: p.workshop.benches.length } };
      }

      case "workshop_upgrade": {
        const upId = payload.upId;
        const up = WORKSHOP.upgrades[upId as keyof typeof WORKSHOP.upgrades];
        if (!up) throw new Error("Upgrade not found");
        const current = p.workshop.up[upId] || 0;
        if (current >= (up.max || 5)) throw new Error("Maximum upgrade reached");
        
        const cost = up.cost * Math.pow(1.8, current);
        if (BigInt(p.clean) < BigInt(cost)) throw new Error(`Needs GH₵${Math.round(cost).toLocaleString()} clean cash`);
        
        addCash(p, "clean", -BigInt(Math.round(cost)));
        recordCash(p, now, -Math.round(cost), "clean", "Facilities & vault", `Upgraded workshop: ${up.name}`);
        
        p.workshop.up[upId] = current + 1;
        p.log.unshift({ t: now, msg: `Workshop ${up.name} upgraded to Level ${current + 1}!`, kind: "good" });
        return { ok: true, result: { upId, level: current + 1 } };
      }

      // Crew actions
      case "crew_train": {
        const cid = payload.crew_id || payload.cid;
        const stat = payload.stat;
        if (!stat || !["brains", "wheels", "muscle", "stealth"].includes(stat)) {
          throw new Error("Invalid stat to train. Choose Brains, Wheels, Muscle, or Stealth.");
        }
        const c = p.crew.find((x) => x.id === cid);
        if (!c) throw new Error("Crew member not found");
        if ((c.stats[stat] || 0) >= CREW_STAT_MAX) {
          throw new Error(`${stat.toUpperCase()} is already maxed at ${CREW_STAT_MAX}!`);
        }
        const currentVal = c.stats[stat] || 1;

        // Ability points are the ONLY currency you can use to train crew!
        if ((p.skill_points || 0) < 1) {
          throw new Error(`Need 1 Ability Point to train ${c.name}! Level up your Boss to earn more Ability Points.`);
        }
        p.skill_points = (p.skill_points || 0) - 1;

        c.stats[stat] = currentVal + 1;
        c.xp = (c.xp || 0) + 20;
        while (c.xp >= 30 * c.lvl) {
          c.xp -= 30 * c.lvl;
          c.lvl += 1;
          syncCrewProgression(c);
        }
        c.morale = Math.min(100, (c.morale || 85) + 5);
        p.log.unshift({
          t: now,
          msg: `Trained ${c.name} with 1 Ability Point! ${stat.toUpperCase()} upgraded to ${c.stats[stat]} (+20 EXP).`,
          kind: "good",
        });
        return { ok: true, result: { stat, value: c.stats[stat], xp: c.xp, lvl: c.lvl, skill_points: p.skill_points } };
      }

      case "crew_bonus": {
        const cid = payload.crew_id || payload.cid;
        const c = p.crew.find((x) => x.id === cid);
        if (!c) throw new Error("Crew member not found");
        const isClean = payload.currency === "clean";
        if (isClean) {
          const cost = 400;
          if (BigInt(p.clean) < BigInt(cost)) throw new Error(`Need GH₵${cost.toLocaleString()} clean cedis for luxury bonus`);
          addCash(p, "clean", -BigInt(cost));
          c.morale = Math.min(100, (c.morale || 85) + 40);
        } else {
          const cost = 1000;
          if (BigInt(p.dirty) < BigInt(cost)) throw new Error(`Need GH₵${cost.toLocaleString()} dirty cedis for street bonus`);
          addCash(p, "dirty", -BigInt(cost));
          c.morale = Math.min(100, (c.morale || 85) + 25);
        }
        p.log.unshift({
          t: now,
          msg: `Paid bonus to ${c.name}! Morale rose to ${c.morale}%. Loyalty strengthened!`,
          kind: "good",
        });
        return { ok: true, result: { morale: c.morale } };
      }

      case "assign_front": {
        const { fid, cid } = payload;
        const f = FRONT_MAP[fid];
        if (!f) throw new Error("Front business not found");
        if (cid) {
          const c = p.crew.find((x) => x.id === cid);
          if (!c) throw new Error("Crew member not found");
          if (c.assign && !c.assign.startsWith("front:")) {
            throw new Error(`${c.name} is already busy (${c.assign})`);
          }
          // Remove previous manager of this front if any
          const prevCid = p.front_assign?.[fid];
          if (prevCid) {
            const prev = p.crew.find((x) => x.id === prevCid);
            if (prev) prev.assign = null;
          }
          assertFit(c); c.assign = `front:${fid}`;
          if (!p.front_assign) p.front_assign = {};
          p.front_assign[fid] = cid;
          const trait = CREW_FRONT_TRAITS.find((t) => t.id === c.front_trait);
          const isSynergy = c.specialty_biz === fid;
          p.log.unshift({
            t: now,
            msg: `Assigned ${c.name} (${c.origin || "Operative"}) as manager of ${f.name}! Active trait: ${trait?.name || "Manager"} (${trait?.desc || ""})${isSynergy ? " ★ PERFECT FIT SYNERGY (+15%)" : ""}`,
            kind: "good",
          });
          return { ok: true, result: { front: fid, crew: cid } };
        } else {
          const prevCid = p.front_assign?.[fid];
          if (prevCid) {
            const prev = p.crew.find((x) => x.id === prevCid);
            if (prev) prev.assign = null;
            delete p.front_assign[fid];
          }
          p.log.unshift({ t: now, msg: `Unassigned manager from ${f.name}.`, kind: "info" });
          return { ok: true, result: { front: fid, crew: null } };
        }
      }

      case "assign_hustle": {
        const { hid, cid, slot, plot } = payload;
        const h = HUSTLE_MAP[hid];
        if (!h) throw new Error("Hustle business not found");
        if (!p.hustle_managers) p.hustle_managers = {};
        if (!p.plot_hustle_managers) p.plot_hustle_managers = {};
        if (!p.hustle_assign) p.hustle_assign = {};

        const plotIdx = plot !== undefined ? Number(plot) : undefined;
        let list = plotIdx !== undefined
          ? [...(p.plot_hustle_managers[plotIdx] || [])]
          : [];

        if (cid) {
          const c = p.crew.find((x) => x.id === cid);
          if (!c) throw new Error("Crew member not found");
          assertFit(c); // Block injured / kidnapped crew
          if (c.assign && !c.assign.startsWith("hustle:")) {
            throw new Error(`${c.name} is already busy (${c.assign})`);
          }
          // Remove if assigned elsewhere in this slot list
          list = list.filter((id) => id !== cid);
          const targetSlot = slot !== undefined ? Number(slot) : list.length;
          if (targetSlot < list.length) {
            const oldCid = list[targetSlot];
            const oldC = p.crew.find((x) => x.id === oldCid);
            if (oldC) oldC.assign = null;
            list[targetSlot] = cid;
          } else {
            list.push(cid);
          }
          list = list.slice(0, 3);
          p.plot_hustle_managers[plotIdx] = list;
          c.assign = `hustle:plot_${plotIdx}`;

          const slotNum = list.indexOf(cid) + 1;
          const slotBonus = slotNum > 1 ? ` (+10% Slot ${slotNum} Compounding Bonus)` : "";
          p.log.unshift({
            t: now,
            msg: `Assigned ${c.name} to Slot ${slotNum} on Plot ${plotIdx + 1}!${slotBonus} Traits compounded & auto-collect active.`,
            kind: "good",
          });
          return { ok: true, result: { plot: plotIdx, managers: list } };
        } else {
          // Unassign
          if (slot !== undefined && list[slot]) {
            const removedCid = list[slot];
            const oldC = p.crew.find((x) => x.id === removedCid);
            if (oldC) oldC.assign = null;
            list.splice(slot, 1);
          } else {
            list.forEach((id) => {
              const oldC = p.crew.find((x) => x.id === id);
              if (oldC) oldC.assign = null;
            });
            list = [];
          }
          p.plot_hustle_managers[plotIdx] = list;
          return { ok: true, result: { plot: plotIdx, managers: list } };

          p.log.unshift({ t: now, msg: `Unassigned manager from ${h.name}${plotIdx !== undefined ? ` (Plot ${plotIdx + 1})` : ""}. (Manual collection now active)`, kind: "info" });
          return { ok: true, result: { hustle: hid, plot: plotIdx, managers: list } };
        }
      }

      case "order_delivery": {
        const itemId = payload.item_id || payload.id;
        const item = DELIVERABLE_CONSUMABLES.find((x) => x.id === itemId);
        if (!item) throw new Error("Consumable product not found in market catalog");

        if (!p.consumable_cooldowns) p.consumable_cooldowns = {};
        if ((p.consumable_cooldowns[item.id] || 0) > now) {
          throw new Error("That item is still on a 2-hour cooldown");
        }

        if (item.category === "farm_weed" && item.farm_strain_req) {
          const haveStash = p.farm?.stash?.[item.farm_strain_req] || 0;
          if (haveStash < 1) {
            throw new Error(`You need at least 1 harvest of ${item.farm_strain_req.toUpperCase()} in your Farm stash to roll and smoke this!`);
          }
          p.farm.stash[item.farm_strain_req] -= 1;
        }

        const totalClean = item.clean_price + item.delivery_fee;
        if (BigInt(p.clean) < BigInt(totalClean)) {
          throw new Error(`Express Courier orders require Clean Cash only! Need GH₵${totalClean.toLocaleString()} clean (have GH₵${Number(p.clean).toLocaleString()})`);
        }

        addCash(p, "clean", -BigInt(totalClean));
        recordCash(p, now, -totalClean, "clean", "Express Delivery", `Order: ${item.name} + GH₵${item.delivery_fee} delivery fee`);

        if (!p.pending_deliveries) p.pending_deliveries = [];
        const orderId = `del_${now}_${Math.random().toString(36).slice(2, 6)}`;
        p.pending_deliveries.push({
          id: orderId,
          item_id: item.id,
          item_name: item.name,
          category: item.category,
          ordered_at: now,
          arrive_at: now + 120, // 2 minutes (120s)
          clean_cost: item.clean_price,
          delivery_fee: item.delivery_fee,
          duration_secs: Math.max(3600, item.duration_secs),
        });
        p.consumable_cooldowns[item.id] = now + 7200; // 2 hours

        p.log.unshift({
          t: now,
          msg: `📱 Express Drop: Dispatched courier for ${item.name}! Paid GH₵${totalClean.toLocaleString()} clean (GH₵${item.clean_price.toLocaleString()} + GH₵${item.delivery_fee} delivery). ETA: 2m.`,
          kind: "info",
        });

        return { ok: true, result: { order_id: orderId, eta_seconds: 120, item: item.name } };
      }

      case "claim_delivery": {
        const orderId = payload.order_id || payload.id;
        if (!p.pending_deliveries) p.pending_deliveries = [];
        const idx = p.pending_deliveries.findIndex((d) => d.id === orderId);
        if (idx === -1) throw new Error("Order not found or already received");
        const order = p.pending_deliveries[idx];
        if (now < order.arrive_at) {
          const left = Math.ceil(order.arrive_at - now);
          throw new Error(`Courier is still in transit! Arrives in ${left}s`);
        }

        p.pending_deliveries.splice(idx, 1);
        const item = DELIVERABLE_CONSUMABLES.find((x) => x.id === order.item_id);
        if (!item) throw new Error("Product data missing");

        if (!p.active_consumable_buffs) p.active_consumable_buffs = [];
        // Apply instant effects
        if (item.buff.heals_injury) {
          p.crew.forEach((c) => {
            if (c.injury) {
              c.injury = undefined as any;
              p.log.unshift({
                t: now,
                msg: `🩹 Medical Trauma Kit applied: ${c.name} is fully healed and returned to duty!`,
                kind: "good",
              });
            }
          });
        }

        if (item.buff.morale_boost) {
          p.crew.forEach((c) => {
            c.morale = Math.min(100, (c.morale || 85) + item.buff.morale_boost!);
          });
        }

        if (item.buff.flat_heat_drop) {
          p.heat = Math.max(0, p.heat - item.buff.flat_heat_drop);
        }

        // Apply temporal buff (minimum 1 hour = 3600s)
        const duration = Math.max(3600, item.duration_secs);
        p.active_consumable_buffs = [
          ...p.active_consumable_buffs.filter((b) => b.id !== item.id && b.expires_at > now),
          {
            id: item.id,
            name: item.name,
            category: item.category,
            stat_label: item.buff.stat_label,
            started_at: now,
            expires_at: now + duration,
            buff: item.buff,
          },
        ];

        p.log.unshift({
          t: now,
          msg: `📦 Package Delivered! Used ${item.name}. Active temporal buff: ${item.buff.stat_label} (${Math.round(duration / 3600)}h duration).`,
          kind: "good",
        });

        return { ok: true, result: { item: item.name, buff: item.buff.stat_label, expires_at: now + duration } };
      }

      case "heist_ad_slot": {
        const today = dayKey(now);
        if (!p.heist_day || p.heist_day.day !== today) {
          p.heist_day = { day: today, count: 0, ad_extra: 0 };
        }
        p.heist_day.ad_extra = (p.heist_day.ad_extra || 0) + 1;
        p.log.unshift({
          t: now,
          msg: `Street broadcast ad viewed! +1 Heist Slot unlocked for today (${p.heist_day.count}/${heistLimit(p, now)}).`,
          kind: "good",
        });
        return { ok: true, result: { count: p.heist_day.count, max: heistLimit(p, now) } };
      }

      case "post_bail": {
        if (!p.arrested_until || now >= p.arrested_until) throw new Error("You are not currently in police custody");
        const method = payload?.method;
        const cleanN = Number(p.clean || 0);
        const dirtyN = Number(p.dirty || 0);
        const bailClean = Math.floor(cleanN / 3);
        const bailDirty = Math.floor(dirtyN / 2);

        if (method === "lawyer" || (!method && (p.inv.lawyer || 0) >= 1 && bailClean <= 0 && bailDirty <= 0)) {
          if ((p.inv.lawyer || 0) < 1) throw new Error("No Lawyer Shield available");
          p.inv.lawyer -= 1;
          p.log.unshift({ t: now, msg: "Your attorney filed an emergency motion! Released from custody immediately.", kind: "good" });
        } else if (method === "dirty") {
          if (bailDirty <= 0 || BigInt(p.dirty) < BigInt(bailDirty)) {
            throw new Error("Not enough dirty money to pay bribe");
          }
          addCash(p, "dirty", -BigInt(bailDirty));
          p.log.unshift({ t: now, msg: `Bribe of GH₵${bailDirty.toLocaleString()} dirty paid to officers. Released from custody!`, kind: "good" });
        } else if (method === "clean") {
          if (bailClean <= 0 || BigInt(p.clean) < BigInt(bailClean)) {
            throw new Error("Not enough clean cash to pay bribe");
          }
          addCash(p, "clean", -BigInt(bailClean));
          p.log.unshift({ t: now, msg: `Bribe of GH₵${bailClean.toLocaleString()} clean paid to officials. Released from custody!`, kind: "good" });
        } else {
          // If no method specified, prioritize clean if available, then dirty, then lawyer
          if (bailClean > 0 && cleanN >= bailClean) {
            addCash(p, "clean", -BigInt(bailClean));
            p.log.unshift({ t: now, msg: `Bribe of GH₵${bailClean.toLocaleString()} clean paid. Released from custody!`, kind: "good" });
          } else if (bailDirty > 0 && dirtyN >= bailDirty) {
            addCash(p, "dirty", -BigInt(bailDirty));
            p.log.unshift({ t: now, msg: `Bribe of GH₵${bailDirty.toLocaleString()} dirty paid. Released from custody!`, kind: "good" });
          } else if ((p.inv.lawyer || 0) >= 1) {
            p.inv.lawyer -= 1;
            p.log.unshift({ t: now, msg: "Your attorney secured your release!", kind: "good" });
          } else {
            throw new Error("Insufficient funds to pay bribe");
          }
        }
        p.arrested_until = 0;
        p.heat = 20;
        p.heat_ts = now;
        return { ok: true, result: { released: true } };
      }

      case "upgrade_facility": {
        const fid = payload.facility_id;
        const fac = MANSION_FACILITIES[fid];
        if (!fac) throw new Error("Compound facility not found");
        if (!p.facilities) p.facilities = {};
        if (!p.facility_condition) p.facility_condition = {};
        const curLvl = p.facilities[fid] || 0;
        if (curLvl >= fac.max) throw new Error(`${fac.name} is already at maximum level (${fac.max})`);
        
        const cost = Math.floor(fac.base_cost_clean * Math.pow(1.8, curLvl));
        if (BigInt(p.clean || "0") < BigInt(cost)) {
          throw new Error(`Need GH₵ ${cost.toLocaleString()} Clean Cash to build/upgrade ${fac.name}.`);
        }

        addCash(p, "clean", -cost);
        recordCash(p, now, -cost, "clean", "Facilities & vault", `Upgraded ${fac.name} to Level ${curLvl + 1}`);
        
        p.facilities[fid] = curLvl + 1;
        p.facility_condition[fid] = 100; // Fresh construction is 100% pristine!
        gainXp(50);
        p.log.unshift({
          t: now,
          msg: `Expanded compound! ${fac.name} upgraded to Level ${curLvl + 1} (GH₵ ${cost.toLocaleString()}). Condition 100% Pristine!`,
          kind: "good",
        });
        return { ok: true, result: { facility: fid, lvl: p.facilities[fid], condition: 100, clean: p.clean } };
      }

      case "assign_facility_crew": {
        const fid = payload.facility_id || payload.fid;
        const cid = payload.crew_id || payload.cid;
        const slot = payload.slot !== undefined ? Number(payload.slot) : undefined;
        const fac = MANSION_FACILITIES[fid];
        if (!fac) throw new Error("Compound facility not found");
        if (!p.facilities || (p.facilities[fid] || 0) < 1) {
          throw new Error(`Must construct ${fac.name} before stationing crew.`);
        }
        if (!p.facility_assign) p.facility_assign = {};
        if (!p.facility_condition) p.facility_condition = {};

        const facLvl = p.facilities[fid] || 1;
        const maxSlots = facLvl >= 2 ? 2 : 1;

        let assigned = [...(p.facility_assign[fid] || [])];
        if (cid) {
          const c = p.crew.find((x) => x.id === cid);
          if (!c) throw new Error("Crew member not found");
          if (c.assign && !c.assign.startsWith(`facility:${fid}`)) {
            throw new Error(`${c.name} is currently assigned to ${c.assign}. Reassign from their current duty first.`);
          }
          // Remove if assigned elsewhere in this facility
          assigned = assigned.filter((id) => id !== cid);
          if (slot !== undefined && slot < maxSlots) {
            if (slot < assigned.length) {
              const oldCid = assigned[slot];
              const oldC = p.crew.find((x) => x.id === oldCid);
              if (oldC) oldC.assign = null;
              assigned[slot] = cid;
            } else {
              assigned.push(cid);
            }
          } else {
            if (assigned.length >= maxSlots) {
              const oldCid = assigned[0];
              const oldC = p.crew.find((x) => x.id === oldCid);
              if (oldC) oldC.assign = null;
              assigned[0] = cid;
            } else {
              assigned.push(cid);
            }
          }
          assertFit(c); c.assign = `facility:${fid}`;
          p.facility_assign[fid] = assigned;

          const isMatch = facilityArchMatch(fac, c.arch);
          p.log.unshift({
            t: now,
            msg: `Stationed ${c.name} (${c.arch.toUpperCase()}) at ${fac.name}! Wear stopped and auto-repair active${isMatch ? " ★ Specialist synergy: +1.8%/min faster repairs" : ""}.`,
            kind: "good",
          });
          return { ok: true, result: { facility: fid, assigned } };
        } else {
          // Unassign
          if (slot !== undefined && assigned[slot]) {
            const oldCid = assigned[slot];
            const oldC = p.crew.find((x) => x.id === oldCid);
            if (oldC) oldC.assign = null;
            assigned.splice(slot, 1);
          } else {
            assigned.forEach((id) => {
              const oldC = p.crew.find((x) => x.id === id);
              if (oldC) oldC.assign = null;
            });
            assigned = [];
          }
          p.facility_assign[fid] = assigned;
          p.log.unshift({
            t: now,
            msg: `Unassigned crew from ${fac.name} maintenance station.`,
            kind: "info",
          });
          return { ok: true, result: { facility: fid, assigned } };
        }
      }

      case "unassign_facility_crew": {
        const fid = payload.facility_id || payload.fid;
        const cid = payload.crew_id || payload.cid;
        const fac = MANSION_FACILITIES[fid];
        if (!p.facility_assign) p.facility_assign = {};
        let assigned = [...(p.facility_assign[fid] || [])];
        if (cid) {
          const c = p.crew.find((x) => x.id === cid);
          if (c && c.assign === `facility:${fid}`) c.assign = null;
          assigned = assigned.filter((id) => id !== cid);
        } else {
          assigned.forEach((id) => {
            const c = p.crew.find((x) => x.id === id);
            if (c) c.assign = null;
          });
          assigned = [];
        }
        p.facility_assign[fid] = assigned;
        p.log.unshift({
          t: now,
          msg: `Unassigned maintenance crew from ${fac?.name || fid}.`,
          kind: "info",
        });
        return { ok: true, result: { facility: fid, assigned } };
      }

      case "repair_facility": {
        const fid = payload.facility_id || payload.fid;
        const repairType = payload.type || "quick"; // "quick" | "overhaul"
        const fac = MANSION_FACILITIES[fid];
        if (!fac) throw new Error("Compound facility not found");
        if (!p.facilities || (p.facilities[fid] || 0) < 1) {
          throw new Error(`Facility ${fac.name} has not been constructed yet.`);
        }
        if (!p.facility_condition) p.facility_condition = {};
        const curCondition = p.facility_condition[fid] !== undefined ? p.facility_condition[fid] : 100;
        if (curCondition >= 100) {
          throw new Error(`${fac.name} is already in 100% pristine condition!`);
        }

        const facLvl = p.facilities[fid] || 1;
        const rc = repairCosts("facility", fid, facLvl, curCondition);
        if (repairType === "overhaul") {
          const costDirty = rc.overhaul_dirty;
          const costClean = rc.overhaul_clean;
          if (BigInt(p.dirty) < BigInt(costDirty)) {
            throw new Error(`Need GH₵${costDirty.toLocaleString()} dirty cash for overhaul replacement parts.`);
          }
          if (BigInt(p.clean) < BigInt(costClean)) {
            throw new Error(`Need GH₵${costClean.toLocaleString()} clean cash for certified engineering contractor.`);
          }
          addCash(p, "dirty", -BigInt(costDirty));
          addCash(p, "clean", -BigInt(costClean));
          p.facility_condition[fid] = 100;
          recordCash(p, now, -costClean, "clean", "Base Maintenance", `Full overhaul certified repair on ${fac.name}`);
          recordCash(p, now, -costDirty, "dirty", "Base Maintenance", `Parts and labor for ${fac.name} overhaul`);
          p.log.unshift({
            t: now,
            msg: `[COMPOUND OVERHAUL] ${fac.name} restored to 100% PRISTINE condition! All perks maximized.`,
            kind: "good",
          });
          return { ok: true, result: { facility: fid, condition: 100 } };
        } else {
          // Quick Service (+35% condition)
          const costDirty = rc.quick_dirty;
          if (BigInt(p.dirty) < BigInt(costDirty)) {
            throw new Error(`Need GH₵${costDirty.toLocaleString()} dirty cash for street scrap & quick maintenance.`);
          }
          addCash(p, "dirty", -BigInt(costDirty));
          const newCond = round2(Math.min(100, curCondition + QUICK_SERVICE_AMOUNT));
          p.facility_condition[fid] = newCond;
          recordCash(p, now, -costDirty, "dirty", "Base Maintenance", `Quick maintenance service on ${fac.name}`);
          p.log.unshift({
            t: now,
            msg: `[BASE SERVICE] Serviced ${fac.name} with street scrap. Condition restored by +35% to ${Math.round(newCond)}%.`,
            kind: "good",
          });
          return { ok: true, result: { facility: fid, condition: newCond } };
        }
      }

      case "overhaul_all_facilities": {
        if (!p.facilities) p.facilities = {};
        if (!p.facility_condition) p.facility_condition = {};

        const builtFids = Object.keys(p.facilities).filter((fid) => (p.facilities[fid] || 0) > 0);
        if (builtFids.length === 0) throw new Error("No compound facilities built yet.");

        let totalCostDirty = 0;
        let totalCostClean = 0;
        let damagedCount = 0;

        builtFids.forEach((fid) => {
          const facLvl = p.facilities[fid] || 1;
          const cond = p.facility_condition![fid] !== undefined ? p.facility_condition![fid] : 100;
          if (cond < 100) {
            damagedCount += 1;
            const missingPct = (100 - cond) / 100;
            totalCostDirty += Math.max(200, Math.floor(1100 * facLvl * missingPct));
            totalCostClean += Math.max(75, Math.floor(280 * facLvl * missingPct));
          }
        });

        if (damagedCount === 0) {
          throw new Error("All built facilities are already in 100% pristine condition!");
        }

        if (BigInt(p.dirty) < BigInt(totalCostDirty)) {
          throw new Error(`Need GH₵${totalCostDirty.toLocaleString()} dirty cash for bulk overhaul.`);
        }
        if (BigInt(p.clean) < BigInt(totalCostClean)) {
          throw new Error(`Need GH₵${totalCostClean.toLocaleString()} clean cash for engineering crew.`);
        }

        addCash(p, "dirty", -BigInt(totalCostDirty));
        addCash(p, "clean", -BigInt(totalCostClean));

        builtFids.forEach((fid) => {
          p.facility_condition![fid] = 100;
        });

        recordCash(p, now, -totalCostClean, "clean", "Base Maintenance", `Full compound overhaul on ${damagedCount} facilities`);
        recordCash(p, now, -totalCostDirty, "dirty", "Base Maintenance", `Bulk replacement parts for compound facilities`);

        p.log.unshift({
          t: now,
          msg: `[BASE OVERHAUL] Emergency overhaul complete! All ${damagedCount} facilities restored to 100% PRISTINE condition.`,
          kind: "good",
        });
        return { ok: true, result: { restored: damagedCount, base_integrity: 100 } };
      }

      // ===== v9: side hustle & front business maintenance =====
      case "repair_hustle":
      case "pause_hustle": {
        const hid = payload.hid;
        if (!p.hustles[hid]) throw new Error("Hustle not found");
        p.hustles[hid].paused = payload.paused;
        p.log.unshift({ t: now, msg: `Side hustle ${payload.paused ? "paused" : "resumed"}: ${HUSTLE_MAP[hid].name}`, kind: "info" });
        return { ok: true };
      }
      case "repair_front": {
        const isHustle = false;
        const id = isHustle ? payload.hid || payload.hustle_id : payload.fid || payload.front_id;
        const plotIdx = payload.plot !== undefined ? Number(payload.plot) : undefined;
        const name = isHustle ? HUSTLE_MAP[id]?.name : FRONT_MAP[id]?.name;
        if (!name) throw new Error(isHustle ? "Side hustle not found" : "Front business not found");
        const pl = isHustle && plotIdx !== undefined ? p.player_plots?.[plotIdx] : null;
        const lvl = isHustle ? (pl?.lvl || p.hustles?.[id]?.lvl || 1) : p.fronts[id] || 0;
        if (lvl < 1) throw new Error(`You don't own ${name} yet`);
        const cur = isHustle ? (pl?.condition !== undefined ? pl.condition : hustleCond(p, id)) : frontCond(p, id);
        if (cur >= 100) throw new Error(`${name} is already at 100% condition`);
        const rc = repairCosts(isHustle ? "hustle" : "front", id, lvl, cur);
        const overhaul = payload.type === "overhaul";
        const cd = overhaul ? rc.overhaul_dirty : rc.quick_dirty;
        const cc = overhaul ? rc.overhaul_clean : rc.quick_clean;
        if (BigInt(p.dirty) < BigInt(cd)) throw new Error(`Need GH₵${cd.toLocaleString()} dirty cash`);
        if (BigInt(p.clean) < BigInt(cc)) throw new Error(`Need GH₵${cc.toLocaleString()} clean cash`);
        if (isHustle && pl) {
          pl.bank = accruedPlot(p, plotIdx!, now);
          pl.ts = now;
        } else if (isHustle && p.hustles?.[id]) {
          (p.hustles[id] as any).bank = accrued(p, id, now);
          p.hustles[id].ts = now;
        }
        addCash(p, "dirty", -BigInt(cd));
        if (cc > 0) addCash(p, "clean", -BigInt(cc));
        const next = overhaul ? 100 : round2(Math.min(100, cur + QUICK_SERVICE_AMOUNT));
        if (isHustle && pl) {
          pl.condition = next;
        } else if (isHustle) {
          p.hustle_condition![id] = next;
        } else {
          p.front_condition![id] = next;
        }
        const cat = isHustle ? "Hustle Maintenance" : "Front Maintenance";
        if (cd > 0) recordCash(p, now, -cd, "dirty", cat, `${overhaul ? "Full overhaul" : "Quick service"} on ${name}`);
        if (cc > 0) recordCash(p, now, -cc, "clean", cat, `${overhaul ? "Full overhaul" : "Quick service"} on ${name}`);
        p.log.unshift({ t: now, msg: `${overhaul ? "Overhauled" : "Serviced"} ${name}: condition ${Math.round(next)}%.`, kind: "good" });
        return { ok: true, result: { id, condition: next, cost_dirty: cd, cost_clean: cc } };
      }

      case "overhaul_all_hustles":
      case "overhaul_all_fronts": {
        const isHustle = type === "overhaul_all_hustles";
        const ids = isHustle
          ? Object.keys(p.hustles || {}).filter((k) => HUSTLE_MAP[k] && hustleCond(p, k) < 100)
          : FRONTS.filter((f) => (p.fronts[f.id] || 0) > 0 && frontCond(p, f.id) < 100).map((f) => f.id);
        if (ids.length === 0) throw new Error(`All your ${isHustle ? "side hustles" : "front businesses"} are already at 100%`);
        let cd = 0, cc = 0;
        ids.forEach((id) => {
          const lvl = isHustle ? p.hustles[id].lvl : p.fronts[id];
          const rc = repairCosts(isHustle ? "hustle" : "front", id, lvl, isHustle ? hustleCond(p, id) : frontCond(p, id));
          cd += rc.overhaul_dirty;
          cc += rc.overhaul_clean;
        });
        cd = Math.floor(cd * 0.8); // bulk discount, like Overhaul All on the compound
        cc = Math.floor(cc * 0.8);
        if (BigInt(p.dirty) < BigInt(cd)) throw new Error(`Need GH₵${cd.toLocaleString()} dirty cash for the bulk overhaul`);
        if (BigInt(p.clean) < BigInt(cc)) throw new Error(`Need GH₵${cc.toLocaleString()} clean cash for the bulk overhaul`);
        addCash(p, "dirty", -BigInt(cd));
        if (cc > 0) addCash(p, "clean", -BigInt(cc));
        ids.forEach((id) => {
          if (isHustle) {
            (p.hustles[id] as any).bank = accrued(p, id, now);
            p.hustles[id].ts = now;
            p.hustle_condition![id] = 100;
          } else p.front_condition![id] = 100;
        });
        const cat = isHustle ? "Hustle Maintenance" : "Front Maintenance";
        if (cd > 0) recordCash(p, now, -cd, "dirty", cat, `Overhaul All (${ids.length})`);
        if (cc > 0) recordCash(p, now, -cc, "clean", cat, `Overhaul All (${ids.length})`);
        p.log.unshift({ t: now, msg: `Overhaul All: ${ids.length} ${isHustle ? "side hustles" : "front businesses"} restored to 100%.`, kind: "good" });
        return { ok: true, result: { restored: ids.length, cost_dirty: cd, cost_clean: cc } };
      }

      // ===== v9: Free-Slot Modular Plot system =====
      // ---- v9 LAND: every street hustle needs its own land plot ----
      case "claim_first_business": {
        // one-time: free first land + free first street hustle (Okada). Cannot be repeated or combined.
        const L = p as any;
        const plots = ensurePlots(p);
        if (L.first_business_claimed || Object.keys(p.hustles || {}).length || plots.some((x) => x.isUnlocked)) throw new Error("Your free first business was already claimed");
        const hid = FIRST_FREE_HUSTLE;
        const land = plots[0];
        land.isUnlocked = true;
        land.hustleID = hid;
        p.hustles[hid] = { lvl: 1, ts: now, bank: 0 } as any;
        if (!p.hustle_condition) p.hustle_condition = {};
        p.hustle_condition[hid] = 100;
        L.first_business_claimed = true;
        gainXp(5);
        p.log.unshift({ t: now, msg: `Claimed your first business FREE: land plot 1 + ${HUSTLE_MAP[hid].name}.`, kind: "good" });
        return { ok: true, result: { plot: 0, hid } };
      }
      case "land_buy":
      case "plot_unlock": {
        const plots = ensurePlots(p);
        const next = plots.find((x) => !x.isUnlocked);
        if (!next) throw new Error("You own every land plot");
        if (!(p as any).first_business_claimed) throw new Error("Claim your free first business first");
        const idx = payload.plot === undefined || payload.plot === null ? next.plotID : Number(payload.plot);
        const plot = plots.find((x) => x.plotID === idx);
        if (!plot) throw new Error("Land not found");
        if (plot.isUnlocked) throw new Error("You already own this land");
        if (plot !== next) throw new Error(`Buy land plot ${next.plotID + 1} first`);
        const fee = landFee(idx);
        // land is an owned asset: CLEAN cash only (dirty cash is never accepted)
        if (BigInt(p.clean) < BigInt(fee)) throw new Error(`Needs clean cash: GH₵${fee.toLocaleString()} clean (launder dirty cash first)`);
        addCash(p, "clean", -BigInt(fee));
        recordCash(p, now, -fee, "clean", "Land", `Bought land plot ${idx + 1}`);
        plot.isUnlocked = true;
        p.log.unshift({ t: now, msg: `Bought land plot ${idx + 1} for GH₵${fee.toLocaleString()} clean. Start a hustle on it.`, kind: "good" });
        return { ok: true, result: { plot: idx, cost: fee } };
      }
      case "close_hustle":
      case "plot_demolish": {
        // closing a hustle: pay out what it earned; the land stays yours (empty)
        const plots = ensurePlots(p);
        const plot = payload.plot !== undefined && payload.plot !== null
          ? plots.find((x) => x.plotID === Number(payload.plot))
          : plots.find((x) => x.hustleID === payload.hid);
        if (!plot || !plot.hustleID) throw new Error("No hustle on that land");
        const hid = plot.hustleID;
        const idx = plot.plotID;
        if (!payload.confirm) throw new Error("Confirm closing this hustle");
        const amt = accrued(p, hid, now);
        if (amt > 0) { addCash(p, "dirty", BigInt(amt)); p.lifetime = (BigInt(p.lifetime) + BigInt(amt)).toString(); }
        plot.hustleID = null;
        plot.building = null;

        // Automatically set all crew to free when their business they are assigned is removed
        p.crew.forEach((c) => {
          if (c.assign === `hustle:plot_${idx}` || c.assign === `build:plot_${idx}`) {
            c.assign = null;
          }
        });
        if (p.plot_hustle_managers) delete p.plot_hustle_managers[idx];

        const remaining = plots.some((pl) => pl.isUnlocked && pl.hustleID === hid);
        if (!remaining) {
          // If the hustle is gone completely, ensure global managers are also freed
          (p.hustle_managers?.[hid] || []).forEach((cid) => {
            const c = p.crew.find((x) => x.id === cid);
            if (c && c.assign === `hustle:${hid}`) c.assign = null;
          });
          if (p.hustle_managers) delete p.hustle_managers[hid];
          if (p.hustle_assign) delete p.hustle_assign[hid];
          if (p.hustle_condition) delete p.hustle_condition[hid];
          delete p.hustles[hid];
        } else if (p.hustles[hid]) {
          p.hustles[hid].last = now;
        }
        const hn = HUSTLE_MAP[hid]?.name || hid;
        p.log.unshift({ t: now, msg: `Cleared ${hn} from land plot ${idx + 1} (banked GH₵${amt.toLocaleString()} dirty).`, kind: "info" });
        return { ok: true, result: { plot: idx, credited: amt } };
      }


      case "upgrade_boss_perk": {
        const perkId = payload.perk_id;
        const perk = BOSS_PERKS[perkId];
        if (!perk) throw new Error("Boss perk not found");
        if (!p.boss_perks) p.boss_perks = {};
        const curRank = p.boss_perks[perkId] || 0;
        const maxRank = Math.min(perk.max, BOSS_PERK_MAX_RANK);
        if (curRank >= maxRank) throw new Error(`${perk.name} already at maximum rank (${maxRank})`);
        if ((p.skill_points || 0) < 1) throw new Error("No Boss Skill Points available. Level up to earn more!");
        p.skill_points -= 1;
        p.boss_perks[perkId] = curRank + 1;
        p.log.unshift({
          t: now,
          msg: `Boss unlocked rank ${curRank + 1} in ${perk.name}! ${perk.desc}.`,
          kind: "good",
        });
        return { ok: true, result: { perk: perkId, rank: p.boss_perks[perkId], skill_points: p.skill_points } };
      }

      case "boss_train": {
        const stat = payload.stat as "brains" | "wheels" | "muscle" | "stealth";
        if (!["brains", "wheels", "muscle", "stealth"].includes(stat)) {
          throw new Error("Invalid stat to train. Choose Brains, Wheels, Muscle, or Stealth.");
        }
        if (!p.boss_stats) {
          const base = Math.max(5, (p.level || 1) * 2);
          p.boss_stats = { brains: base, wheels: base, muscle: base + 2, stealth: base };
        }
        const cur = p.boss_stats[stat] || 5;
        const maxStat = 100;
        if (cur >= maxStat) throw new Error(`Boss ${stat.toUpperCase()} is already maxed at ${maxStat}!`);

        const currency = payload.currency || (p.skill_points > 0 ? "points" : "clean");
        if (currency === "points") {
          if ((p.skill_points || 0) < 1) throw new Error("Need 1 Ability Point to train Boss attributes!");
          p.skill_points -= 1;
        } else if (currency === "clean") {
          const costClean = Math.max(2500, cur * 300);
          if (BigInt(p.clean) < BigInt(costClean)) throw new Error(`Need GH₵${costClean.toLocaleString()} clean cash for private executive coaching`);
          addCash(p, "clean", -BigInt(costClean));
          recordCash(p, now, -costClean, "clean", "Boss Training", `Trained Boss ${stat.toUpperCase()}`);
        } else {
          const costDirty = Math.max(5000, cur * 600);
          if (BigInt(p.dirty) < BigInt(costDirty)) throw new Error(`Need GH₵${costDirty.toLocaleString()} dirty cash for street training`);
          addCash(p, "dirty", -BigInt(costDirty));
          recordCash(p, now, -costDirty, "dirty", "Boss Training", `Trained Boss ${stat.toUpperCase()}`);
        }
        p.boss_stats[stat] = cur + 1;
        gainXp(20);
        p.log.unshift({
          t: now,
          msg: `Trained Boss attributes: ${stat.toUpperCase()} upgraded to ${p.boss_stats[stat]}! Syndicate power increased.`,
          kind: "good",
        });
        return { ok: true, result: { stat, value: p.boss_stats[stat], skill_points: p.skill_points } };
      }

      case "resolve_crew_crisis": {
        const crisis = p.crew_crisis;
        if (!crisis) throw new Error("No active crew crisis to resolve");
        const action = payload.action; // "compensate_clean" | "compensate_dirty" | "intimidate" | "let_leave" | "mediate"
        const c = p.crew.find((x) => x.id === crisis.crew_id);

        if (action === "compensate_clean") {
          const cost = crisis.compensation_clean || 500;
          if (BigInt(p.clean) < BigInt(cost)) throw new Error(`Need GH₵${cost.toLocaleString()} clean cash for retention compensation`);
          addCash(p, "clean", -BigInt(cost));
          recordCash(p, now, -cost, "clean", "Crew Retention", `Retention bonus for ${crisis.crew_name}`);
          if (c) c.morale = 95;
          p.crew_crisis = null;
          p.crew_crisis_cooldown = now + 600;
          p.log.unshift({
            t: now,
            msg: `Compensated ${crisis.crew_name} with GH₵${cost.toLocaleString()} clean cash! Dispute resolved, morale raised to 95%.`,
            kind: "good",
          });
          return { ok: true, result: { resolved: true, action, morale: c?.morale } };
        }

        if (action === "compensate_dirty") {
          const cost = crisis.compensation_dirty || 1200;
          if (BigInt(p.dirty) < BigInt(cost)) throw new Error(`Need GH₵${cost.toLocaleString()} dirty cash for retention bonus`);
          addCash(p, "dirty", -BigInt(cost));
          recordCash(p, now, -cost, "dirty", "Crew Retention", `Street retention bonus for ${crisis.crew_name}`);
          if (c) c.morale = 80;
          p.crew_crisis = null;
          p.crew_crisis_cooldown = now + 600;
          p.log.unshift({
            t: now,
            msg: `Handed street cash bonus of GH₵${cost.toLocaleString()} dirty to ${crisis.crew_name}! Dispute settled.`,
            kind: "info",
          });
          return { ok: true, result: { resolved: true, action, morale: c?.morale } };
        }

        if (action === "intimidate") {
          const bossPow = (p.boss_stats?.muscle || 5) * 2 + (p.boss_stats?.brains || 5) + p.level * 2;
          const successChance = Math.min(85, Math.max(30, 45 + bossPow));
          const roll = Math.random() * 100;
          if (roll <= successChance) {
            if (c) c.morale = 65;
            p.crew_crisis = null;
            p.crew_crisis_cooldown = now + 900;
            p.log.unshift({
              t: now,
              msg: `Boss Authority prevailed! Put ${crisis.crew_name} in their place. They fell back into line (+respect).`,
              kind: "good",
            });
            return { ok: true, result: { resolved: true, action, success: true } };
          } else {
            if (c) c.morale = Math.max(5, (c.morale || 30) - 15);
            crisis.compensation_clean = Math.floor(crisis.compensation_clean * 1.35);
            crisis.compensation_dirty = Math.floor(crisis.compensation_dirty * 1.35);
            p.log.unshift({
              t: now,
              msg: `Intimidation backfired! ${crisis.crew_name} stood their ground and demanded higher severance compensation!`,
              kind: "bad",
            });
            return { ok: true, result: { resolved: false, action, success: false } };
          }
        }

        if (action === "let_leave") {
          const name = crisis.crew_name;
          const cid = crisis.crew_id;
          if (c) {
            c.assign = null;
            Object.keys(p.front_assign || {}).forEach((fid) => {
              if (p.front_assign[fid] === cid) delete p.front_assign[fid];
            });
            Object.keys(p.hustle_assign || {}).forEach((hid) => {
              if (p.hustle_assign[hid] === cid) delete p.hustle_assign[hid];
            });
            Object.keys(p.hustle_managers || {}).forEach((hid) => {
              p.hustle_managers![hid] = (p.hustle_managers![hid] || []).filter((x) => x !== cid);
            });
            Object.keys(p.facility_assign || {}).forEach((fid) => {
              p.facility_assign![fid] = (p.facility_assign![fid] || []).filter((x) => x !== cid);
            });
            p.crew = p.crew.filter((x) => x.id !== cid);
          }
          p.crew_crisis = null;
          p.crew_crisis_cooldown = now + 600;
          p.log.unshift({
            t: now,
            msg: `${name} walked out and permanently parted ways with the syndicate.`,
            kind: "bad",
          });
          return { ok: true, result: { resolved: true, action, departed: cid } };
        }

        if (action === "mediate") {
          const bonusCost = 800;
          if (BigInt(p.dirty) >= BigInt(bonusCost)) {
            addCash(p, "dirty", -BigInt(bonusCost));
          }
          if (c) c.morale = 85;
          if (crisis.rival_crew_id) {
            const c2 = p.crew.find((x) => x.id === crisis.rival_crew_id);
            if (c2) c2.morale = 85;
          }
          p.crew_crisis = null;
          p.crew_crisis_cooldown = now + 900;
          p.log.unshift({
            t: now,
            msg: `Mediated internal crew friction between ${crisis.crew_name} and ${crisis.rival_crew_name || "syndicate members"}. Morale restored.`,
            kind: "good",
          });
          return { ok: true, result: { resolved: true, action } };
        }

        throw new Error("Invalid crisis resolution action");
      }

      case "trigger_crew_crisis": {
        const activeCrew = (p.crew || []).filter((c) => !c.merc);
        if (!activeCrew.length) throw new Error("No active crew members in the syndicate");
        const isConflict = payload.type === "conflict" && activeCrew.length >= 2;
        const c1 = activeCrew[Math.floor(Math.random() * activeCrew.length)];
        const c2 = isConflict ? activeCrew.find((x) => x.id !== c1.id) || activeCrew[0] : null;

        const cleanCost = Math.max(500, Math.floor(c1.lvl * 250 + (c1.daily_rate || 150) * 3));
        const dirtyCost = Math.max(1200, Math.floor(c1.lvl * 600 + (c1.daily_rate || 150) * 7));

        if (isConflict && c2) {
          p.crew_crisis = {
            id: `crisis-${now}`,
            type: "conflict",
            title: "Internal Crew Brawl & Feud!",
            crew_id: c1.id,
            crew_name: c1.name,
            crew_arch: c1.arch,
            crew_look: c1.look,
            rival_crew_id: c2.id,
            rival_crew_name: c2.name,
            reason: "Heated argument over street territory cuts and assignment favoritism.",
            quote: `"${c1.name} and ${c2.name} are going at each other's throats! If you don't mediate or compensate them, one of them is packing their bags."`,
            compensation_clean: cleanCost,
            compensation_dirty: dirtyCost,
            morale: c1.morale || 50,
            created_at: now,
          };
        } else {
          p.crew_crisis = {
            id: `crisis-${now}`,
            type: "leave_demand",
            title: "Operative Demands Compensation or Walking Out!",
            crew_id: c1.id,
            crew_name: c1.name,
            crew_arch: c1.arch,
            crew_look: c1.look,
            reason: "Discontent with recent operations, street heat, and wage disputes.",
            quote: `"Boss, I've had other syndicates in Accra making offers. Either give me fair compensation or I'm walking out today."`,
            compensation_clean: cleanCost,
            compensation_dirty: dirtyCost,
            morale: c1.morale || 35,
            created_at: now,
          };
        }
        return { ok: true, result: { crisis: p.crew_crisis } };
      }

      case "crew_rehab": {
        const cid = payload.crew_id || payload.cid;
        const c = p.crew.find((x) => x.id === cid);
        if (!c) throw new Error("Crew member not found");
        const discount = facilityPerk(p, "infirmary") > 0 ? 0.75 : 1.0; // needs a non-Critical infirmary
        const cost = Math.floor(800 * c.lvl * discount);
        if (BigInt(p.clean) < BigInt(cost)) throw new Error(`Need GH₵${cost.toLocaleString()} clean cedis for specialist rehab`);
        addCash(p, "clean", -BigInt(cost));
        c.flaw = "none";
        c.morale = Math.min(100, (c.morale || 85) + 30);
        p.log.unshift({ t: now, msg: `${c.name} completed rehab and cleared their street flaw!`, kind: "good" });
        return { ok: true, result: { cleared: true } };
      }

      case "crew_dismiss": {
        const cid = payload.crew_id || payload.cid;
        if (p.crew.length <= 1) throw new Error("Cannot dismiss your last crew member");
        const dismissed = p.crew.find((x) => x.id === cid);
        if (!dismissed) throw new Error("Crew member not found");
        if (dismissed.assign) throw new Error(`${dismissed.name} is busy (${dismissed.assign}) and cannot be dismissed. Unassign them first.`);
        p.crew = p.crew.filter((x) => x.id !== cid);
        Object.keys(p.front_assign || {}).forEach((fid) => {
          if (p.front_assign[fid] === cid) delete p.front_assign[fid];
        });
        Object.keys(p.hustle_assign || {}).forEach((hid) => {
          if (p.hustle_assign[hid] === cid) delete p.hustle_assign[hid];
        });
        Object.keys(p.hustle_managers || {}).forEach((hid) => {
          p.hustle_managers![hid] = (p.hustle_managers![hid] || []).filter((x) => x !== cid);
          if (p.hustle_managers![hid][0]) p.hustle_assign![hid] = p.hustle_managers![hid][0];
        });
        Object.keys(p.facility_assign || {}).forEach((fid) => {
          p.facility_assign![fid] = (p.facility_assign![fid] || []).filter((x) => x !== cid);
        });
        if (p.rentals) {
          p.rentals = p.rentals.filter((l) => l.crew_id !== cid);
        }
        p.log.unshift({ t: now, msg: `Dismissed ${dismissed?.name || "crew member"} from the syndicate.`, kind: "info" });
        return { ok: true, result: { dismissed: true } };
      }









      case "pvp_attack": {
        if ((p.pvp_cd || 0) > now) throw new Error("Your crew is still regrouping");
        const pow = Math.max(1, Math.floor(Number(payload.power) || calcPower(p)));
        const oppPower = Math.floor(pow * (0.85 + Math.random() * 0.3));
        const won = testForce(p, pow >= oppPower);
        const loot = won ? Math.floor(oppPower * 30 + (p.level || 1) * 100) : 0;
        if (loot > 0) moveCash(p, now, "dirty", loot, "Fights & rivals", `Turf fight win vs ${String(payload.target_name || "a rival crew").slice(0, 40)}`);
        p.pvp_cd = now + 900;
        p.log.unshift({ t: now, msg: won ? `Won a turf fight (+GH₵${loot.toLocaleString()} dirty).` : "Lost a turf fight.", kind: won ? "good" : "bad" });
        return { ok: true, result: { won, loot, my_power: pow, opp_power: oppPower } };
      }

      case "heal_crew": {
        const ids: string[] = payload.all ? p.crew.filter((c) => c.injury).map((c) => c.id) : [payload.cid || payload.crew_id];
        if (!ids.length || !ids[0]) throw new Error("Nobody needs treatment");
        const list = ids.map((id) => p.crew.find((c) => c.id === id)).filter((c): c is CrewMember => !!c && !!c.injury);
        if (!list.length) throw new Error("That crew member isn't injured");
        const cost = list.reduce((a, c) => a + fastHealCost(c), 0);
        if (BigInt(p.clean) < BigInt(cost)) throw new Error(`Needs clean cash: GH₵${cost.toLocaleString()} clean for a private doctor`);
        addCash(p, "clean", -BigInt(cost));
        recordCash(p, now, -cost, "clean", "Medical", `Private doctor for ${list.map((c) => c.name).join(", ")}`);
        list.forEach((c) => { c.injury = null; });
        p.log.unshift({ t: now, msg: `Private doctor patched up ${list.map((c) => c.name).join(", ")} (GH₵${cost.toLocaleString()} clean). Fit for duty.`, kind: "good" });
        return { ok: true, result: { healed: list.map((c) => c.id), cost } };
      }

      case "rival_log_seen": {
        (p as any).rival_log_seen = now;
        return { ok: true, result: {} };
      }

      case "away_summary_seen": {
        p.away_summary = null;
        return { ok: true, result: {} };
      }


      case "medical_seen": {
        (p as any).med_healed = 0;
        return { ok: true, result: {} };
      }


      case "resolve_archrival_event": {
        const ev = p.archrival_event;
        if (!ev) throw new Error("No active archrival event");
        if (payload.event_id && ev.id && payload.event_id !== ev.id) throw new Error("That crisis was already resolved");
        const ALIAS: Record<string, string> = { rescue: "rescue_raid", fight: "fight_back", police_tip: "snitch" };
        let choice = ALIAS[payload.choice] || payload.choice;
        if (choice === "pay_ransom") choice = BigInt(p.dirty) >= BigInt(ev.ransom_dirty || 5000) ? "pay_ransom_dirty" : "pay_ransom_clean";
        const VALID: Record<string, string[]> = {
          rival_war: ["intervene", "scavenge", "observe", "snitch", "ignore", "attack", "payoff_dirty", "payoff_clean"],
          kidnap: ["rescue_raid", "pay_ransom_dirty", "pay_ransom_clean", "snitch", "ignore", "attack"],
          ambush: ["fight_back", "bribe", "bribe_clean", "evade", "snitch", "ignore", "attack"],
        };
        Object.keys(RIVAL_EVENT_TYPES).forEach((k) => (VALID[k] = ["snitch", "ignore", "attack", "payoff_dirty", "payoff_clean", "bribe"]));
        if (!(VALID[ev.type] || []).includes(choice)) throw new Error(`Unknown choice "${payload.choice}" for this crisis`);
        if (!p.prestige) p.prestige = { count: 0, respect: 0 };
        const snap = { dirty: BigInt(p.dirty), clean: BigInt(p.clean), heat: p.heat, respect: p.prestige.respect || 0 };
        (p as any)._inj = [];
        const target = ev.rival_id || ev.rival1_id;
        const tName = ev.rival_name || ev.rival1_name || "the rivals";
        const tRival = RIVAL_MAP[target];
        const victimC = ev.type === "kidnap" ? p.crew.find((c) => c.id === ev.crew_id) : null;
        const addRespect = (d: number) => { p.prestige.respect = Math.max(0, Math.round(((p.prestige.respect || 0) + d) * 100) / 100); };
        let battleRep: any = null;
        if (choice === "snitch") {
          // Tip the police: they hit the target, but every other crew in the city marks you as a snitch.
          RIVALS.forEach((r) => { if (r.id !== target && r.id !== ev.rival2_id) p.grudges[r.id] = Math.min(100, (p.grudges[r.id] || 0) + 15); });
          (p as any).snitch_until = Math.max(Number((p as any).snitch_until) || 0, now) + 3600;
          p.heat = Math.max(0, p.heat - 10);
          if (victimC) victimC.status = "active";
          p.log.unshift({ t: now, msg: `You tipped the police about ${tName}. Heat −10, but word spread: every other syndicate's grudge +15 and they will hit harder for the next hour.`, kind: "info" });
        } else if (choice === "ignore") {
          addRespect(-0.1);
          if (ev.type === "kidnap" && victimC) {
            victimC.status = "active";
            injureCrew(p, victimC, 2, `captivity with ${tName}`, now);
            p.log.unshift({ t: now, msg: `You ignored ${tName}'s demands. ${ev.crew_name} was beaten and dumped back on the street. Respect lost.`, kind: "bad" });
          } else if (ev.type === "ambush") {
            const lose = BigInt(Math.min(Number(p.dirty), 1500 + p.level * 100));
            addCash(p, "dirty", -lose);
            if (lose > 0n) recordCash(p, now, -Number(lose), "dirty", "Ambush", `Convoy robbed by ${tName}`);
            p.log.unshift({ t: now, msg: `You let ${tName} take the convoy (−GH₵${Number(lose).toLocaleString()} dirty). The street noticed. Respect lost.`, kind: "bad" });
          } else if (RIVAL_EVENT_TYPES[ev.type]) {
            (p as any)._note = applyRivalIgnore(p, ev, now);
            p.log.unshift({ t: now, msg: `You ignored ${tName}: ${(p as any)._note}. Respect lost.`, kind: "bad" });
          } else {
            p.log.unshift({ t: now, msg: `You ignored the war in ${ev.location}. The street sees you as soft. Respect lost.`, kind: "bad" });
          }
        } else if (choice === "attack") {
          const myP = calcPower(p);
          const theirP = tRival ? Math.max(10, Math.round(getRivalPower(tRival, p, now) * 0.7)) : Math.round(myP * 0.9);
          const chance = Math.max(0.1, Math.min(0.9, myP / (myP + theirP)));
          const won = testForce(p, Math.random() < chance);
          const loot = won ? 3000 + p.level * 400 + Math.floor(theirP * 20) : 0;
          const lost = won ? 0 : Math.min(Number(p.dirty), Math.max(2000, Math.floor(Number(p.dirty) * 0.1)));
          if (won) {
            addCash(p, "dirty", BigInt(loot));
            recordCash(p, now, loot, "dirty", "Archrival Attack", `Attacked ${tName}`);
            addRespect(0.25);
            p.grudges[target] = Math.min(100, (p.grudges[target] || 0) + 20);
            if (victimC) victimC.status = "active";
            p.heat = Math.min(100, p.heat + heatGain(p, 5));
          } else {
            addCash(p, "dirty", -BigInt(lost));
            if (lost > 0) recordCash(p, now, -lost, "dirty", "Archrival Attack", `Beaten back by ${tName}`);
            addRespect(-0.25);
            p.heat = Math.min(100, p.heat + heatGain(p, 10));
            if (victimC) { victimC.status = "active"; injureCrew(p, victimC, 3, `the failed attack on ${tName}`, now); }
            else if (RIVAL_EVENT_TYPES[ev.type]) { const fit = p.crew.filter((c) => !c.merc && !crewOut(c)); if (fit.length) injureCrew(p, fit[Math.floor(Math.random() * fit.length)], 2, `the failed attack on ${tName}`, now); }
          }
          battleRep = makeBattle(p, now, {
            kind: "attack", won, title: `Attack on ${tName}`,
            us: { power: myP }, them: { name: tName, boss: tRival?.boss || tName, power: theirP },
            loot, lost, heat: won ? heatGain(p, 5) : heatGain(p, 10), damage: {}, notes: [won ? `${tName} driven off their corner` : `${tName} beat your crew back`],
          } as any);
          bestsInc(p, won ? "hits_won" : "hits_lost");
          p.log.unshift({ t: now, msg: won ? `You hit ${tName} first and won! +GH₵${loot.toLocaleString()} dirty, respect up.` : `Your attack on ${tName} failed. −GH₵${lost.toLocaleString()} dirty, respect down.`, kind: won ? "good" : "bad" });
        }
        if (choice === "snitch" || choice === "ignore" || choice === "attack") {
          p.archrival_event = null;
          const res: any = {
            resolved: true, choice, type: ev.type, won: battleRep ? battleRep.won : undefined,
            dirty: (BigInt(p.dirty) - snap.dirty).toString(), clean: (BigInt(p.clean) - snap.clean).toString(),
            heat: Math.round(p.heat - snap.heat), respect: Math.round(((p.prestige.respect || 0) - snap.respect) * 100) / 100,
            injuries: (p as any)._inj || [], battle: battleRep,
          };
          if (battleRep) { battleRep.respect = res.respect; battleRep.injuries = res.injuries; }
          delete (p as any)._inj;
          res.note = (p as any)._note; delete (p as any)._note;
          logRivalEvent(p, ev, now, { choice, resolved_t: now, outcome: { dirty: Number(res.dirty), clean: Number(res.clean), respect: res.respect, heat: res.heat, injuries: res.injuries.map((x: any) => `${x.name} (${x.sev_name})`), won: res.won, note: res.note } });
          (p as any).last_crisis = { t: now, ...res, battle: undefined };
          return { ok: true, result: res };
        }

        if (ev.type === "rival_war") {
          if (choice === "intervene") {
            p.grudges[ev.rival1_id] = Math.max(0, (p.grudges[ev.rival1_id] || 0) - 20);
            p.grudges[ev.rival2_id] = Math.min(100, (p.grudges[ev.rival2_id] || 0) + 25);
            const loot = 8000;
            addCash(p, "dirty", BigInt(loot));
            recordCash(p, now, loot, "dirty", "Rival War", `Intervened in ${ev.location} war`);
            p.log.unshift({
              t: now,
              msg: `Backed ${ev.rival1_name} in ${ev.location}! Seized GH₵${loot.toLocaleString()} dirty loot. ${ev.rival1_name} allied, ${ev.rival2_name} enraged!`,
              kind: "good",
            });
          } else if (choice === "scavenge") {
            const loot = 4500;
            addCash(p, "dirty", BigInt(loot));
            p.heat = Math.min(100, p.heat + heatGain(p, 10));
            recordCash(p, now, loot, "dirty", "Rival War", `Scavenged ruins in ${ev.location}`);
            p.log.unshift({
              t: now,
              msg: `Scavenged the shootout aftermath in ${ev.location}! Recovered GH₵${loot.toLocaleString()} dirty cash and equipment.`,
              kind: "good",
            });
          } else {
            addRespect(0.05);
            p.log.unshift({
              t: now,
              msg: `Observed ${ev.rival1_name} and ${ev.rival2_name} exhaust their forces. Zero syndicate casualties.`,

              kind: "info",
            });
          }
        } else if (ev.type === "kidnap") {
          const victim = p.crew.find((c) => c.id === ev.crew_id);
          if (choice === "pay_ransom_dirty") {
            const ransom = ev.ransom_dirty || 5000;
            if (BigInt(p.dirty) < BigInt(ransom)) throw new Error("Not enough dirty cash for ransom!");
            addCash(p, "dirty", -BigInt(ransom));
            recordCash(p, now, -ransom, "dirty", "Rival Kidnap", `Paid ransom for ${ev.crew_name}`);
            if (victim) {
              victim.status = "active";
              victim.morale = Math.max(20, (victim.morale || 85) - 10);
            }
            p.log.unshift({
              t: now,
              msg: `Paid GH₵${ransom.toLocaleString()} ransom to ${ev.rival_name}! ${ev.crew_name} returned safely.`,
              kind: "info",
            });
          } else if (choice === "pay_ransom_clean") {
            const ransom = ev.ransom_clean || 2000;
            if (BigInt(p.clean) < BigInt(ransom)) throw new Error("Not enough clean cash for ransom!");
            addCash(p, "clean", -BigInt(ransom));
            recordCash(p, now, -ransom, "clean", "Rival Kidnap", `Diplomatic clean payment for ${ev.crew_name}`);
            if (victim) {
              victim.status = "active";
            }
            p.log.unshift({
              t: now,
              msg: `Secured diplomatic release of ${ev.crew_name} with GH₵${ransom.toLocaleString()} clean tribute.`,
              kind: "good",
            });
          } else if (choice === "rescue_raid") {
            const myPower = calcPower(p);
            const won = testForce(p, myPower >= 40 || Math.random() < 0.75);
            if (victim) victim.status = "active";
            const rv = RIVAL_MAP[ev.rival_id];
            makeBattle(p, now, {
              kind: "rescue", won, title: `Rescue ${ev.crew_name}`,
              us: { power: myPower, crew: battleCrew(p, victim ? [victim.id] : undefined).concat(battleCrew(p).filter((c) => c.id !== victim?.id)).slice(0, 3) },
              them: { name: ev.rival_name || "Kidnappers", boss: rv?.boss || ev.rival_name || "Kidnappers", power: rv ? Math.round(getRivalPower(rv, p, now) * 0.5) : 40 },
              loot: won ? 6000 : 0, lost: 0, heat: won ? 0 : heatGain(p, 25), damage: {}, notes: [`${ev.crew_name} freed`],
            });
            if (won) {
              const loot = 6000;
              addCash(p, "dirty", BigInt(loot));
              p.grudges[ev.rival_id] = Math.min(100, (p.grudges[ev.rival_id] || 0) + 30);
              recordCash(p, now, loot, "dirty", "Rescue Raid", `Assaulted ${ev.rival_name} hideout`);
              p.log.unshift({
                t: now,
                msg: `RESCUE SUCCESS! Stormed ${ev.rival_name} safehouse, freed ${ev.crew_name}, and seized GH₵${loot.toLocaleString()} cash!`,
                kind: "good",
              });
            } else {
              p.heat = Math.min(100, p.heat + heatGain(p, 25));
              p.log.unshift({
                t: now,
                msg: `Messy rescue: ${ev.crew_name} broke out under gunfire, but police heat spiked +25!`,
                kind: "bad",
              });
            }
          }
        } else if (ev.type === "ambush") {
          if (choice === "fight_back") {
            const won = testForce(p, Math.random() < 0.7);
            const rv = RIVAL_MAP[ev.rival_id];
            const myP = calcPower(p);
            makeBattle(p, now, {
              kind: "ambush", won, title: `Ambush by ${ev.rival_name || "rivals"}`,
              us: { power: myP }, them: { name: ev.rival_name || "Ambushers", boss: rv?.boss || ev.rival_name || "Gunmen", power: rv ? Math.round(getRivalPower(rv, p, now) * 0.6) : Math.round(myP * 0.8) },
              loot: won ? 3500 : 0, lost: 0, heat: won ? 0 : heatGain(p, 15), damage: won ? {} : { vehicle: 1 }, notes: [won ? "Ambushers wiped out" : "Escaped with vehicle damage"],
            });
            if (won) {
              const loot = 3500;
              addCash(p, "dirty", BigInt(loot));
              recordCash(p, now, loot, "dirty", "Ambush", `Repelled ${ev.rival_name} ambush`);
              p.log.unshift({
                t: now,
                msg: `Ambush repelled! Wiped out ${ev.rival_name} ambushers and seized GH₵${loot.toLocaleString()} street cash.`,
                kind: "good",
              });
            } else {
              p.heat = Math.min(100, p.heat + heatGain(p, 15));
              p.log.unshift({
                t: now,
                msg: `Fought off ambushers with vehicle damage. Heat increased +15.`,
                kind: "bad",
              });
            }
          } else if (choice === "bribe") {
            const cost = ev.bribe_cost || 3000;
            if (BigInt(p.dirty) < BigInt(cost)) throw new Error("Not enough dirty cash for bribe!");
            addCash(p, "dirty", -BigInt(cost));
            recordCash(p, now, -cost, "dirty", "Ambush", `Bribed ${ev.rival_name} corner`);
            p.log.unshift({
              t: now,
              msg: `Bribed corner gunmen (GH₵${cost.toLocaleString()} dirty) to pass safely.`,
              kind: "info",
            });
          } else if (choice === "bribe_clean") {
            const cost = 1500;
            if (BigInt(p.clean) < BigInt(cost)) throw new Error("Not enough clean cash for diplomatic clearance!");
            addCash(p, "clean", -BigInt(cost));
            recordCash(p, now, -cost, "clean", "Ambush", `Diplomatic pass tribute to ${ev.rival_name}`);
            p.log.unshift({
              t: now,
              msg: `Secured safe passage through ${ev.rival_name}'s territory with GH₵${cost.toLocaleString()} clean cash.`,
              kind: "good",
            });
          } else if (choice === "evade") {
            p.log.unshift({
              t: now,
              msg: `High-speed evasion through traffic! Outmaneuvered ambushers with zero cash loss.`,
              kind: "good",
            });
          }
        } else if (choice === "payoff_dirty" || choice === "bribe") {
          const cost = ev.ransom_dirty || ev.bribe_cost || 4000;
          if (BigInt(p.dirty) < BigInt(cost)) throw new Error(`Not enough dirty cash! Need GH₵${cost.toLocaleString()} dirty.`);
          addCash(p, "dirty", -BigInt(cost));
          recordCash(p, now, -cost, "dirty", "Archrival Payoff", `Settled ${ev.label || ev.type} with ${tName}`);
          p.grudges[target] = Math.max(0, (p.grudges[target] || 0) - 10);
          if (!p.rival_relations) p.rival_relations = {};
          p.rival_relations[target] = Math.min(100, (p.rival_relations[target] || 50) + 5);
          p.log.unshift({
            t: now,
            msg: `Paid off ${tName} with GH₵${cost.toLocaleString()} dirty cash to neutralize ${ev.title || "the crisis"}. Grudge −10.`,
            kind: "info",
          });
        } else if (choice === "payoff_clean") {
          const cost = ev.ransom_clean || 1500;
          if (BigInt(p.clean) < BigInt(cost)) throw new Error(`Not enough clean cash! Need GH₵${cost.toLocaleString()} clean.`);
          addCash(p, "clean", -BigInt(cost));
          recordCash(p, now, -cost, "clean", "Archrival Payoff", `Diplomatic settlement of ${ev.label || ev.type} with ${tName}`);
          p.grudges[target] = Math.max(0, (p.grudges[target] || 0) - 15);
          if (!p.rival_relations) p.rival_relations = {};
          p.rival_relations[target] = Math.min(100, (p.rival_relations[target] || 50) + 10);
          p.log.unshift({
            t: now,
            msg: `Delivered diplomatic payment of GH₵${cost.toLocaleString()} clean to ${tName}. Grudge −15, relationship +10.`,
            kind: "good",
          });
        }

        p.archrival_event = null;
        if (victimC && victimC.status === "kidnapped") victimC.status = "active"; // never leave crew stuck in captivity
        const battleNow = p.last_battle && p.last_battle.t === now ? p.last_battle : null;
        const res2: any = {
          resolved: true, choice, type: ev.type, won: battleNow ? battleNow.won : undefined,
          dirty: (BigInt(p.dirty) - snap.dirty).toString(), clean: (BigInt(p.clean) - snap.clean).toString(),
          heat: Math.round(p.heat - snap.heat), respect: Math.round(((p.prestige.respect || 0) - snap.respect) * 100) / 100,
          injuries: (p as any)._inj || [], battle: battleNow,
        };
        delete (p as any)._inj;
        logRivalEvent(p, ev, now, { choice, resolved_t: now, outcome: { dirty: Number(res2.dirty), clean: Number(res2.clean), respect: res2.respect, heat: res2.heat, injuries: res2.injuries.map((x: any) => `${x.name} (${x.sev_name})`), won: res2.won } });
        (p as any).last_crisis = { t: now, ...res2, battle: undefined };
        return { ok: true, result: res2 };
      }

      case "bet_place": {
        const stake_currency = (payload.stake_currency || payload.currency) as "clean" | "dirty";
        const rawAmount = payload.stake_amount !== undefined ? payload.stake_amount : payload.stake !== undefined ? payload.stake : payload.amount;
        const { multiplier, force_outcome } = payload;
        if (!stake_currency || !["clean", "dirty"].includes(stake_currency)) {
          throw new Error("Invalid stake currency. Choose Clean or Dirty.");
        }
        const stake = Math.floor(Number(rawAmount));
        if (isNaN(stake) || stake < BETTING_CONFIG.min_stake) {
          throw new Error(`Minimum stake is GH₵${BETTING_CONFIG.min_stake.toLocaleString()} cedis.`);
        }
        if (stake > BETTING_CONFIG.max_stake_base && !payload.vip) {
          throw new Error(`Table maximum is GH₵${BETTING_CONFIG.max_stake_base.toLocaleString()} cedis.`);
        }
        if (BigInt(p[stake_currency]) < BigInt(stake)) {
          throw new Error(`Insufficient ${stake_currency} cedis in your wallet!`);
        }

        const tier = BETTING_TIERS.find((t) => Math.abs(t.multiplier - Number(multiplier)) < 0.01) || BETTING_TIERS[2];
        const prob = tier.probability;
        const takeRate = BETTING_CONFIG.take_rate;

        // 1. Deduct stake from selected currency atomically
        p[stake_currency] = (BigInt(p[stake_currency]) - BigInt(stake)).toString();
        recordCash(p, now, -stake, stake_currency, "Betting Exchange", `Placed ${tier.multiplier}x wager (${stake_currency})`);

        // 2. Authoritative outcome resolution
        const roll = Math.random();
        const won = force_outcome === "win" ? true : force_outcome === "loss" ? false : roll < prob;

        const betId = `bet_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        let grossPayout = 0;
        let takeAmount = 0;
        let netCleanPayout = 0;

        if (!p.betting) {
          p.betting = {
            history: [],
            stats: {
              total_bets: 0,
              total_won: 0,
              total_lost: 0,
              total_staked_clean: 0,
              total_staked_dirty: 0,
              total_clean_paid_out: 0,
              total_fees_collected: 0,
              current_streak: 0,
              best_win: 0,
            },
            operator: { level: 1, reputation: 0, max_stake: BETTING_CONFIG.max_stake_base },
          };
        }

        const bStats = p.betting.stats;
        bStats.total_bets += 1;
        if (stake_currency === "clean") bStats.total_staked_clean += stake;
        else bStats.total_staked_dirty += stake;

        if (won) {
          grossPayout = Math.floor(stake * tier.multiplier);
          takeAmount = Math.floor(grossPayout * takeRate);
          netCleanPayout = grossPayout - takeAmount;

          // Payout is ALWAYS Clean Cedis!
          addCash(p, "clean", BigInt(netCleanPayout));
          recordCash(p, now, netCleanPayout, "clean", "Betting Exchange", `Bet WON! ${tier.multiplier}x Net Payout`);

          bStats.total_won += 1;
          bStats.total_clean_paid_out += netCleanPayout;
          bStats.total_fees_collected += takeAmount;
          bStats.current_streak = (bStats.current_streak > 0 ? bStats.current_streak : 0) + 1;
          bStats.best_win = Math.max(bStats.best_win, netCleanPayout);
          p.betting.operator.reputation += 5;
          gainXp(25);

          p.log.unshift({
            t: now,
            msg: `[BET WON!] Staked GH₵${stake.toLocaleString()} ${stake_currency} at ${tier.multiplier}x! Gross: GH₵${grossPayout.toLocaleString()}, 10% Fee: GH₵${takeAmount.toLocaleString()}, Net Clean Credited: +GH₵${netCleanPayout.toLocaleString()} clean!`,
            kind: "good",
          });
        } else {
          // Loss: stake forfeited, 0 payout, 0 fee
          bStats.total_lost += 1;
          bStats.current_streak = 0;
          p.betting.operator.reputation += 1;

          p.log.unshift({
            t: now,
            msg: `[BET LOST] Staked GH₵${stake.toLocaleString()} ${stake_currency} at ${tier.multiplier}x. Stake forfeited to the house.`,
            kind: "bad",
          });
        }

        const record = {
          bet_id: betId,
          created_at: now,
          t: now,
          won,
          stake,
          currency: stake_currency,
          stake_currency,
          stake_amount: stake,
          multiplier: tier.multiplier,
          win_probability: prob,
          take_rate: takeRate,
          outcome: won ? ("WIN" as const) : ("LOSS" as const),
          gross_payout: grossPayout,
          grossPayout,
          take_amount: takeAmount,
          fee: takeAmount,
          net_clean_payout: netCleanPayout,
          payout: netCleanPayout,
          stake_forfeited: won ? 0 : stake,
          roll,
          target: prob,
        };

        p.betting.history.unshift(record);
        p.betting.history = p.betting.history.slice(0, 50);

        return {
          ok: true,
          result: {
            won,
            bet: record,
            clean: p.clean,
            dirty: p.dirty,
            payout: netCleanPayout,
            fee: takeAmount,
            grossPayout,
            stake,
            currency: stake_currency,
            multiplier: tier.multiplier,
            roll,
            target: prob,
          },
        };
      }



      case "robbery_start": {
        const { target_id } = payload;
        const t = ROBBERY_MAP[target_id];
        if (!t) throw new Error("Invalid robbery target");
        
        const globalCd = p.cooldowns?.robbery_until || 0;
        if (globalCd > now) {
          throw new Error(`Syndicate is cooling down from last operation (${Math.ceil((globalCd - now) / 3600)}h left)`);
        }

        const robCd = p.cooldowns?.robbery_by?.[target_id] || 0;
        if (robCd > now) {
          throw new Error(`Target is cooling down (${Math.ceil((robCd - now) / 3600)}h left)`);
        }

        const currentPower = calcPower(p);
        const currentDefense = calcDefence(p);
        if (currentPower < t.minPower) {
          throw new Error(`Insufficient Syndicate Power! Need ${t.minPower.toLocaleString()} power for this target (Current: ${currentPower.toLocaleString()}).`);
        }
        if (currentDefense < (t.minDefense || 0)) {
          throw new Error(`Insufficient Compound Defense! Need ${t.minDefense.toLocaleString()} defense for this target (Current: ${currentDefense.toLocaleString()}).`);
        }

        let cost = t.cost;
        const gf = p.girlfriend;
        if (gf?.active_id === "akosua" && (gf.companions["akosua"]?.happiness || 0) >= 70) {
          cost = Math.floor(cost * 0.8);
        }

        if (BigInt(p.dirty || "0") < BigInt(cost)) throw new Error("Not enough dirty cash for prep costs");

        moveCash(p, now, "dirty", -cost, "Robbery", `Prep cost for robbery: ${t.name}`);

        const robId = `rob_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

        if (!p.robberies) p.robberies = [];
        p.robberies.push({
          id: robId,
          target: t.id,
          crew_ids: [],
          start: now,
          end: now + t.duration,
          reward: t.reward,
          heat: t.heat,
          status: "active",
        });

        p.log.unshift({ t: now, msg: `Initiated robbery on ${t.name}.`, kind: "info" });
        return { ok: true, result: { robId } };
      }

      case "robbery_claim": {
        const { robbery_id } = payload;
        if (!p.robberies) p.robberies = [];
        const r = p.robberies.find((x) => x.id === robbery_id);
        if (!r) throw new Error("Robbery operation not found");
        if (r.status !== "active") throw new Error("Robbery already claimed");
        if (now < r.end) throw new Error("Robbery is still in progress");

        const t = ROBBERY_MAP[r.target];
        r.status = "completed";

        let reward = r.reward;
        const gf = p.girlfriend;
        if (gf?.active_id === "akosua" && (gf.companions["akosua"]?.happiness || 0) >= 70) {
          reward = Math.floor(reward * 1.15);
        }

        let heatGain = r.heat;
        if (gf?.active_id === "abena" && (gf.companions["abena"]?.happiness || 0) >= 70) {
          heatGain = Math.floor(heatGain * 0.7);
        }

        // 60% chance to be arrested during a robbery operation
        if (Math.random() < 0.60) {
          triggerArrest(p, now);
          p.log.unshift({ t: now, msg: `ROBBERY BUSTED! The Ghana Police intercepted the operation on ${t?.name || r.target}. You've been locked up and the loot was seized!`, kind: "bad" });

          if (!p.cooldowns) p.cooldowns = { launder_until: 0, heist_until: 0, front: {} } as any;
          if (!p.cooldowns!.robbery_by) p.cooldowns!.robbery_by = {};
          p.cooldowns!.robbery_by![r.target] = now + COOLDOWNS.robbery;
          p.cooldowns!.robbery_until = now + COOLDOWNS.robbery;

          return { ok: true, result: { reward: 0, arrested: true } };
        }

        moveCash(p, now, "dirty", reward, "Robbery", `Successful robbery payout: ${t?.name || r.target}`);
        p.heat = Math.min(100, (p.heat || 0) + heatGain);
        p.xp = (p.xp || 0) + 50;

        if (!p.cooldowns) p.cooldowns = { launder_until: 0, heist_until: 0, front: {} };
        if (!p.cooldowns.robbery_by) p.cooldowns.robbery_by = {};
        p.cooldowns.robbery_by[r.target] = now + COOLDOWNS.robbery;
        p.cooldowns.robbery_until = now + COOLDOWNS.robbery;

        p.log.unshift({ t: now, msg: `Successfully robbed ${t?.name || r.target}! Secured GH₵${reward.toLocaleString()} dirty cash.`, kind: "good" });
        return { ok: true, result: { reward } };
      }

      case "trafficking_start": {
        const { route_id, crew_id } = payload;
        const route = TRAFFICKING_MAP[route_id];
        if (!route) throw new Error("Invalid smuggling route");
        
        // Smuggle all available stash items
        const strain = Object.keys(p.farm?.stash || {}).find(s => (p.farm.stash[s] || 0) > 0);
        if (!strain) throw new Error("No items in farm stash to smuggle");
        const amt = p.farm.stash[strain];

        // 24h cooldown check
        if (!p.cooldowns) p.cooldowns = { launder_until: 0, heist_until: 0, front: {} };
        if (!p.cooldowns.smuggling_by) p.cooldowns.smuggling_by = {};
        const smCd = p.cooldowns.smuggling_by[route_id] || 0;
        if (smCd > now) {
          throw new Error(`Smuggler is cooling down (${Math.ceil((smCd - now) / 3600)} hours left)`);
        }

        const c = p.crew.find((x) => x.id === crew_id);
        if (!c) throw new Error("Assigned courier crew member not found");
        if (c.assign) throw new Error(`${c.name} is busy (${c.assign})`);

        p.farm.stash[strain] = 0;

        const shipId = `traf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        c.assign = `trafficking:${shipId}`;

        if (!p.trafficking) p.trafficking = [];
        p.trafficking.push({
          id: shipId,
          route_id: route.id,
          strain,
          amount: amt,
          crew_id,
          start: now,
          end: now + 2 * 3600, // 2 hours
          payout: route.payout * amt, // Assuming payout per unit
          heat: route.heat,
          status: "active",
        });

        p.cooldowns.smuggling_by[route_id] = now + COOLDOWNS.smuggling;

        p.log.unshift({ t: now, msg: `Dispatched ${amt} units of ${strain.toUpperCase()} via ${route.name}. Smuggler cooling down.`, kind: "info" });
        return { ok: true, result: { shipId } };
      }

      case "trafficking_claim": {
        const { shipment_id } = payload;
        if (!p.trafficking) p.trafficking = [];
        const s = p.trafficking.find((x) => x.id === shipment_id);
        if (!s) throw new Error("Shipment not found");
        if (s.status !== "active") throw new Error("Shipment already claimed");
        if (now < s.end) throw new Error("Shipment is still in transit");

        const route = TRAFFICKING_MAP[s.route_id];
        s.status = "completed";

        const c = p.crew.find((x) => x.id === s.crew_id);
        if (c && c.assign === `trafficking:${s.id}`) {
          c.assign = null;
          c.xp = (c.xp || 0) + 25;
        }

        let payout = s.payout;
        const gf = p.girlfriend;
        if (gf?.active_id === "yaa" && (gf.companions["yaa"]?.happiness || 0) >= 70) {
          payout = Math.floor(payout * 1.3);
        }

        let heatGain = s.heat;
        if (gf?.active_id === "abena" && (gf.companions["abena"]?.happiness || 0) >= 70) {
          heatGain = Math.floor(heatGain * 0.7);
        }

        moveCash(p, now, "dirty", payout, "Drug Trafficking", `Trafficking distribution payout: ${route?.name || s.route_id}`);
        p.heat = Math.min(100, (p.heat || 0) + heatGain);
        p.xp = (p.xp || 0) + 40;

        p.log.unshift({ t: now, msg: `Drug trafficking shipment successfully delivered! Earned GH₵${payout.toLocaleString()} dirty cash.`, kind: "good" });
        return { ok: true, result: { payout } };
      }

      case "smuggler_start": {
        const { items } = payload;
        if (!items || !items.length) throw new Error("No items selected");
        
        let totalValue = 0;
        const processedItems: any[] = [];
        
        items.forEach((item: any) => {
            if (item.type === 'farm') {
                const count = p.farm?.stash?.[item.id] || 0;
                if (count < item.qty) throw new Error(`Not enough ${item.id} in stash`);
                p.farm.stash[item.id] -= item.qty;
                const str = STRAIN_MAP[item.id];
                totalValue += item.qty * str.price;
            } else if (item.type === 'weapon') {
                const idx = p.gear.findIndex(g => g.uid === item.uid);
                if (idx === -1) throw new Error("Weapon not found");
                const def = GEAR_MAP[p.gear[idx].id];
                p.gear.splice(idx, 1);
                totalValue += def.price;
            } else if (item.type === 'luxury') {
                const lux = p.luxury?.[item.id] || 0;
                if (lux < item.qty) throw new Error("Luxury item not found");
                p.luxury[item.id] -= item.qty;
                const luxDef = LUXURY_MAP[item.id];
                totalValue += item.qty * luxDef.price;
            }
            processedItems.push(item);
        });

        const payout = Math.floor(totalValue * 1.5); // 50% profit
        const duration = Math.max(2 * 3600, Math.floor(totalValue / 1000) * 3600); // Base 2h + 1h per 1000 value

        if (!p.smuggler_shipments) p.smuggler_shipments = [];
        p.smuggler_shipments.push({
            id: `smug_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            items: processedItems,
            start: now,
            end: now + duration,
            payout,
            status: 'active'
        });

        p.log.unshift({ t: now, msg: `Smuggler dispatched! Expected payout: GH₵${payout.toLocaleString()} clean.`, kind: "info" });
        return { ok: true, result: { duration } };
      }

      case "smuggler_claim": {
        const { shipment_id } = payload;
        const s = p.smuggler_shipments?.find(x => x.id === shipment_id);
        if (!s || s.status === 'completed') throw new Error("Shipment not found or already claimed");
        if (now < s.end) throw new Error("Shipment still in transit");
        
        s.status = 'completed';
        addCash(p, "clean", BigInt(s.payout));
        p.log.unshift({ t: now, msg: `Smuggler returned! Collected GH₵${s.payout.toLocaleString()} clean.`, kind: "good" });
        return { ok: true, result: { payout: s.payout } };
      }

      case "gf_select": {
        const { id } = payload;
        if (!GIRLFRIEND_MAP[id] && id !== null) throw new Error("Invalid girlfriend");
        if (!p.girlfriend) p.girlfriend = { active_id: null, companions: {} };
        if (id && !p.girlfriend.companions[id]) {
          p.girlfriend.companions[id] = { status: "courting", impress_score: 0, happiness: 50, last_date: 0, last_gift: 0 };
        }
        if (id && p.girlfriend.companions[id]?.status !== "dating") {
          throw new Error("You must impress and commit to this partner before making her your official girlfriend.");
        }
        p.girlfriend.active_id = id || null;
        return { ok: true, result: { active_id: p.girlfriend.active_id } };
      }

      case "gf_court": {
        const { id } = payload;
        const gfProfile = GIRLFRIEND_MAP[id];
        if (!gfProfile) throw new Error("Girlfriend not found");
        
        const cdUntil = p.cooldowns?.gf_court_by?.[id] || 0;
        if (cdUntil > now) {
          const cd = cdUntil - now;
          const h = Math.floor(cd / 3600);
          const m = Math.floor((cd % 3600) / 60);
          const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
          throw new Error(`You must wait before making another move on ${gfProfile.name} (${timeStr} left)`);
        }

        if (!p.girlfriend) p.girlfriend = { active_id: null, companions: {} };
        if (!p.girlfriend.companions[id]) {
          p.girlfriend.companions[id] = { status: "courting", impress_score: 0, happiness: 50, last_date: 0, last_gift: 0 } as any;
        }
        const comp = p.girlfriend.companions[id] as any;
        if (comp.status === "dating") throw new Error("Already dating this partner!");

        // Scaling cost: increases by 50% per previous attempt
        const count = comp.court_count || 0;
        const cost = Math.floor(gfProfile.courtCost * Math.pow(1.5, count));

        if (BigInt(p.dirty || "0") < BigInt(cost)) throw new Error(`Not enough dirty cash for court effort (Needs GH₵${cost.toLocaleString()})`);

        moveCash(p, now, "dirty", -cost, "Girlfriend", `Courtship effort to impress ${gfProfile.name}`);
        
        comp.impress_score = Math.min(100, (comp.impress_score || 0) + 25);
        comp.court_count = count + 1;

        if (!p.cooldowns) p.cooldowns = { launder_until: 0, heist_until: 0, front: {} };
        if (!p.cooldowns.gf_court_by) p.cooldowns.gf_court_by = {};
        p.cooldowns.gf_court_by[id] = now + (3 * 24 * 3600); // 3-day cooldown

        p.log.unshift({ t: now, msg: `Courtship with ${gfProfile.name}: Impression score is now ${comp.impress_score}%. Next attempt will cost more.`, kind: "good" });
        return { ok: true, result: { impress_score: comp.impress_score } };
      }

      case "gf_commit": {
        const { id } = payload;
        const gfProfile = GIRLFRIEND_MAP[id];
        if (!gfProfile) throw new Error("Girlfriend not found");
        if (!p.girlfriend || !p.girlfriend.companions[id]) throw new Error("No courting progress with this partner");

        const comp = p.girlfriend.companions[id];
        if ((comp.impress_score || 0) < 100) throw new Error("You haven't impressed her enough yet (Need 100% impression score)");

        comp.status = "dating";
        comp.happiness = 75;
        p.girlfriend.active_id = id;

        p.log.unshift({ t: now, msg: `${gfProfile.name} agreed to be your official girlfriend! Perks unlocked.`, kind: "good" });
        return { ok: true, result: { status: comp.status, active_id: p.girlfriend.active_id } };
      }

      case "gf_gift": {
        const { id } = payload;
        const gfProfile = GIRLFRIEND_MAP[id];
        if (!gfProfile) throw new Error("Girlfriend not found");
        const comp = p.girlfriend?.companions?.[id];
        if (!comp || comp.status !== "dating") throw new Error("You must commit and become official partners before sending relationship gifts.");
        if (BigInt(p.dirty || "0") < BigInt(gfProfile.giftCost)) throw new Error("Not enough dirty cash for gift");

        moveCash(p, now, "dirty", -gfProfile.giftCost, "Girlfriend", `Sent luxury gift to ${gfProfile.name}`);
        comp.happiness = Math.min(100, comp.happiness + 25);
        comp.last_gift = now;

        p.log.unshift({ t: now, msg: `Sent a lavish gift to ${gfProfile.name}! Happiness is now ${comp.happiness}%.`, kind: "good" });
        return { ok: true, result: { happiness: comp.happiness } };
      }

      case "gf_date": {
        const { id } = payload;
        const gfProfile = GIRLFRIEND_MAP[id];
        if (!gfProfile) throw new Error("Girlfriend not found");
        const comp = p.girlfriend?.companions?.[id];
        if (!comp || comp.status !== "dating") throw new Error("You must commit and become official partners before going on relationship dates.");

        if (!p.cooldowns) p.cooldowns = { launder_until: 0, heist_until: 0, front: {} };
        if (!p.cooldowns.gf_date_by) p.cooldowns.gf_date_by = {};
        const dateCd = p.cooldowns.gf_date_by[id] || 0;
        if (dateCd > now) {
          throw new Error(`You recently took ${gfProfile.name} on a date! Cooldown: ${Math.ceil((dateCd - now) / 60)} min left`);
        }

        if (BigInt(p.dirty || "0") < BigInt(gfProfile.dateCost)) throw new Error("Not enough dirty cash for date");

        moveCash(p, now, "dirty", -gfProfile.dateCost, "Girlfriend", `Took ${gfProfile.name} out on a VIP date`);
        comp.happiness = Math.min(100, comp.happiness + 35);
        comp.last_date = now;
        p.cooldowns.gf_date_by[id] = now + COOLDOWNS.gf_date;

        p.log.unshift({ t: now, msg: `Took ${gfProfile.name} out on a romantic Osu date! Happiness is now ${comp.happiness}%.`, kind: "good" });
        return { ok: true, result: { happiness: comp.happiness } };
      }

      case "music_start": {
        const { booth, trackId } = payload;
        const tr = MUSIC_MAP[trackId];
        if (!tr) throw new Error("Invalid track");
        if (!p.music_studio || !p.music_studio.booths[booth]) throw new Error("Invalid recording booth");
        const b = p.music_studio.booths[booth];
        if (b.trackId) throw new Error("Booth is already recording a track");

        if (BigInt(p.dirty || "0") < BigInt(tr.cost)) throw new Error("Not enough dirty cash for studio production costs");

        moveCash(p, now, "dirty", -tr.cost, "Music Studio", `Production cost for track: ${tr.name}`);

        const acousticsLvl = p.music_studio.up?.acoustics || 0;
        const durSeconds = Math.max(60, Math.floor(tr.dur * Math.pow(0.9, acousticsLvl)));

        b.trackId = trackId;
        b.start = now;
        b.end = now + durSeconds;

        p.log.unshift({ t: now, msg: `Started recording track "${tr.name}" (${tr.genre}) in studio booth ${booth + 1}.`, kind: "info" });
        return { ok: true, result: { booth, trackId } };
      }

      case "music_claim": {
        const { booth } = payload;
        if (!p.music_studio || !p.music_studio.booths[booth]) throw new Error("Invalid booth");
        const b = p.music_studio.booths[booth];
        if (!b.trackId) throw new Error("Nothing recording on this booth");
        if (now < b.end) throw new Error("Recording is still in production");

        const tr = MUSIC_MAP[b.trackId];
        b.trackId = null;
        b.start = 0;
        b.end = 0;

        const mixingLvl = p.music_studio.up?.mixing || 0;
        let payout = Math.floor(tr.payout * (1 + mixingLvl * 0.1));

        moveCash(p, now, "clean", payout, "Music Studio", `Royalty release payout: ${tr?.name || "Track"}`);
        if (!p.prestige) p.prestige = { count: 0, respect: 0 };
        p.prestige.respect = Math.max(0, Math.round(((p.prestige.respect || 0) + tr.respect) * 100) / 100);
        p.xp = (p.xp || 0) + 40;

        p.log.unshift({ t: now, msg: `Successfully released "${tr?.name || "Track"}"! Earned GH₵${payout.toLocaleString()} clean royalties +${tr.respect} respect.`, kind: "good" });
        return { ok: true, result: { payout } };
      }

      case "music_buy_booth": {
        if (!p.music_studio) p.music_studio = { booths: [{ trackId: null, start: 0, end: 0 }], up: {} };
        const booths = p.music_studio.booths;
        if (booths.length >= STUDIO.max_booths) throw new Error("Maximum studio booths reached");
        const cost = Math.floor(STUDIO.booth_cost * Math.pow(STUDIO.booth_growth, booths.length - 1));
        if (BigInt(p.clean || "0") < BigInt(cost)) throw new Error("Not enough clean cash for new studio booth");

        moveCash(p, now, "clean", -cost, "Music Studio", "Expanded studio recording booth");
        booths.push({ trackId: null, start: 0, end: 0 });

        p.log.unshift({ t: now, msg: `Built new studio recording booth #${booths.length}.`, kind: "good" });
        return { ok: true, result: { booths: booths.length } };
      }

      case "music_upgrade": {
        const { upId } = payload;
        const up = STUDIO.upgrades[upId as keyof typeof STUDIO.upgrades];
        if (!up) throw new Error("Invalid studio upgrade");
        if (!p.music_studio) p.music_studio = { booths: [], up: {} };
        if (!p.music_studio.up) p.music_studio.up = {};
        const lvl = p.music_studio.up[upId] || 0;
        if (lvl >= up.max) throw new Error("Upgrade is already at max level");
        const cost = Math.round(up.cost * Math.pow(1.8, lvl));
        if (BigInt(p.clean || "0") < BigInt(cost)) throw new Error("Not enough clean cash for upgrade");

        moveCash(p, now, "clean", -cost, "Music Studio", `Upgraded studio ${up.name} to LV${lvl + 1}`);
        p.music_studio.up[upId] = lvl + 1;

        p.log.unshift({ t: now, msg: `Upgraded studio ${up.name} to level ${lvl + 1}.`, kind: "good" });
        return { ok: true, result: { upId, level: lvl + 1 } };
      }

      // MODULE: UNDERGROUND METHLAB
      case "methlab_buy_bench": {
        if (!p.methlab) p.methlab = { benches: [{ productId: null, start: 0, end: 0, yield: 0 }], stash: {}, up: {} };
        const benches = p.methlab.benches;
        if (benches.length >= METHLAB.max_benches) throw new Error("Maximum meth lab cooking benches reached");
        const cost = Math.floor(METHLAB.bench_cost * Math.pow(METHLAB.bench_growth, benches.length - 1));
        if (BigInt(p.clean || "0") < BigInt(cost)) throw new Error(`Not enough clean cash for lab bench (requires GH₵${cost.toLocaleString()} clean)`);
        moveCash(p, now, "clean", -cost, "Underground Lab", "Expanded meth lab cooking bench");
        benches.push({ productId: null, start: 0, end: 0, yield: 0 });
        p.log.unshift({ t: now, msg: `Installed clandestine lab cooking bench #${benches.length}.`, kind: "good" });
        return { ok: true, result: { benches: benches.length } };
      }

      case "methlab_start": {
        const { benchIdx, productId } = payload;
        if (!p.methlab) p.methlab = { benches: [{ productId: null, start: 0, end: 0, yield: 0 }], stash: {}, up: {} };
        const bench = p.methlab.benches[benchIdx];
        if (!bench) throw new Error("Invalid lab bench");
        if (bench.start > 0 && now < bench.end) throw new Error("Bench is currently cooking");
        const prod = METHLAB_MAP[productId];
        if (!prod) throw new Error("Invalid lab product");
        if (p.level < prod.unlockLvl) throw new Error(`Requires Boss Level ${prod.unlockLvl}`);
        if (BigInt(p.dirty || "0") < BigInt(prod.costDirty)) throw new Error(`Not enough dirty cash (requires GH₵${prod.costDirty.toLocaleString()} dirty for precursors)`);
        moveCash(p, now, "dirty", -prod.costDirty, "Underground Lab", `Started cook: ${prod.name}`);
        const speedLvl = p.methlab.up?.cook_speed || 0;
        const speedMod = Math.max(0.4, 1 - speedLvl * 0.1);
        const cookTime = Math.max(15, Math.floor(prod.cookTime * speedMod));
        const yieldLvl = p.methlab.up?.chem_yield || 0;
        const bonusYield = yieldLvl * 2;
        const batchYield = Math.floor(Math.random() * (prod.yieldMax - prod.yieldMin + 1)) + prod.yieldMin + bonusYield;
        bench.productId = productId;
        bench.start = now;
        bench.end = now + cookTime;
        bench.yield = batchYield;
        p.log.unshift({ t: now, msg: `Fired up cook for ${prod.name} on bench #${benchIdx + 1}. Precursors paid GH₵${prod.costDirty.toLocaleString()} dirty.`, kind: "info" });
        return { ok: true, result: { benchIdx, end: bench.end } };
      }

      case "methlab_claim": {
        if (!p.methlab) throw new Error("No lab available");
        const reqBench = payload.benchIdx !== undefined ? payload.benchIdx : payload.bench;
        if (reqBench === "all") {
          let totalYield = 0;
          const claimedMap: Record<string, number> = {};
          (p.methlab.benches || []).forEach((bench) => {
            if (bench.productId && now >= bench.end) {
              const pid = bench.productId;
              const prod = METHLAB_MAP[pid];
              const qty = bench.yield || prod?.yieldMin || 1;
              if (!p.methlab.stash) p.methlab.stash = {};
              p.methlab.stash[pid] = (p.methlab.stash[pid] || 0) + qty;
              claimedMap[pid] = (claimedMap[pid] || 0) + qty;
              totalYield += qty;
              bench.productId = null;
              bench.start = 0;
              bench.end = 0;
              bench.yield = 0;
            }
          });
          if (totalYield === 0) throw new Error("No synthesized batches ready to claim");
          gainXp(25);
          p.log.unshift({ t: now, msg: `Collected all synthesized lab batches (${totalYield} total units) into product vault!`, kind: "good" });
          return { ok: true, result: { total: totalYield, claimed: claimedMap, stash: p.methlab.stash } };
        }

        const benchIdx = Number(reqBench);
        const bench = p.methlab.benches[benchIdx];
        if (!bench || !bench.productId) throw new Error("Nothing cooking on this bench");
        if (now < bench.end) throw new Error("Batch still synthesizing!");
        const pid = bench.productId;
        const prod = METHLAB_MAP[pid];
        const qty = bench.yield || prod?.yieldMin || 1;
        if (!p.methlab.stash) p.methlab.stash = {};
        p.methlab.stash[pid] = (p.methlab.stash[pid] || 0) + qty;
        bench.productId = null;
        bench.start = 0;
        bench.end = 0;
        bench.yield = 0;
        gainXp(15);
        p.log.unshift({ t: now, msg: `Cooled and packed ${qty} units of ${prod?.name || pid}! Added to lab stash.`, kind: "good" });
        return { ok: true, result: { productId: pid, quantity: qty, stash: p.methlab.stash } };
      }

      case "methlab_sell": {
        const { productId, amount } = payload;
        if (!p.methlab?.stash?.[productId]) throw new Error("None of that product in lab stash");
        const current = p.methlab.stash[productId];
        const toSell = amount ? Math.min(current, Number(amount)) : current;
        if (toSell <= 0) throw new Error("Invalid quantity to sell");
        const prod = METHLAB_MAP[productId];
        if (!prod) throw new Error("Invalid product");
        const purityLvl = p.methlab.up?.purity_bonus || 0;
        const pricePerUnit = Math.floor(prod.sellPriceClean * (1 + purityLvl * 0.15));
        let payout = toSell * pricePerUnit;
        if (p.big_man_perks?.includes("shadow_forex")) {
          payout = Math.floor(payout * 1.20);
        }
        p.methlab.stash[productId] -= toSell;
        moveCash(p, now, "clean", payout, "Underground Lab", `Sold ${toSell}x ${prod.name}`);
        gainXp(Math.max(10, Math.floor(toSell * 5)));
        p.log.unshift({ t: now, msg: `Distributed ${toSell}x ${prod.name} wholesale! Received GH₵${payout.toLocaleString()} Clean Cash.`, kind: "good" });
        return { ok: true, result: { productId, sold: toSell, payout } };
      }

      case "methlab_upgrade": {
        const { upId } = payload;
        const up = METHLAB.upgrades[upId as keyof typeof METHLAB.upgrades];
        if (!up) throw new Error("Invalid lab upgrade");
        if (!p.methlab) p.methlab = { benches: [], stash: {}, up: {} };
        if (!p.methlab.up) p.methlab.up = {};
        const lvl = p.methlab.up[upId] || 0;
        if (lvl >= up.max) throw new Error("Upgrade is already at max level");
        const cost = Math.round(up.cost * Math.pow(1.8, lvl));
        if (BigInt(p.clean || "0") < BigInt(cost)) throw new Error(`Not enough clean cash for lab upgrade (requires GH₵${cost.toLocaleString()} clean)`);
        moveCash(p, now, "clean", -cost, "Underground Lab", `Upgraded ${up.name} to LV${lvl + 1}`);
        p.methlab.up[upId] = lvl + 1;
        p.log.unshift({ t: now, msg: `Upgraded clandestine lab ${up.name} to level ${lvl + 1}.`, kind: "good" });
        return { ok: true, result: { upId, level: lvl + 1 } };
      }

      // MODULE: ILLEGAL MINING (GALAMSEY)
      case "mining_buy_rig": {
        if (!p.mining) p.mining = { rigs: [{ mineralId: null, start: 0, end: 0, yield: 0 }], stash: {}, up: {} };
        const rigs = p.mining.rigs;
        if (rigs.length >= MINING.max_rigs) throw new Error("Maximum mining rigs reached");
        const cost = Math.floor(MINING.rig_cost * Math.pow(MINING.rig_growth, rigs.length - 1));
        if (BigInt(p.clean || "0") < BigInt(cost)) throw new Error(`Not enough clean cash for new excavator rig (requires GH₵${cost.toLocaleString()} clean)`);
        moveCash(p, now, "clean", -cost, "Illegal Mining", "Deployed heavy pit excavator rig");
        rigs.push({ mineralId: null, start: 0, end: 0, yield: 0 });
        p.log.unshift({ t: now, msg: `Deployed Galamsey excavator pit rig #${rigs.length}.`, kind: "good" });
        return { ok: true, result: { rigs: rigs.length } };
      }

      case "mining_start": {
        const { rigIdx, mineralId } = payload;
        if (!p.mining) p.mining = { rigs: [{ mineralId: null, start: 0, end: 0, yield: 0 }], stash: {}, up: {} };
        const rig = p.mining.rigs[rigIdx];
        if (!rig) throw new Error("Invalid rig");
        if (rig.start > 0 && now < rig.end) throw new Error("Rig is currently excavating");
        const min = MINERAL_MAP[mineralId];
        if (!min) throw new Error("Invalid mineral");
        if (p.level < min.unlockLvl) throw new Error(`Requires Boss Level ${min.unlockLvl}`);
        if (BigInt(p.dirty || "0") < BigInt(min.costDirty)) throw new Error(`Not enough dirty cash (requires GH₵${min.costDirty.toLocaleString()} dirty fuel & diesel)`);
        moveCash(p, now, "dirty", -min.costDirty, "Illegal Mining", `Started excavation: ${min.name}`);
        const speedLvl = p.mining.up?.excavator_speed || 0;
        const speedMod = Math.max(0.4, 1 - speedLvl * 0.1);
        const mineTime = Math.max(15, Math.floor(min.mineTime * speedMod));
        const yieldLvl = p.mining.up?.sluice_yield || 0;
        const bonusYield = yieldLvl * 2;
        const batchYield = Math.floor(Math.random() * (min.yieldMax - min.yieldMin + 1)) + min.yieldMin + bonusYield;
        rig.mineralId = mineralId;
        rig.start = now;
        rig.end = now + mineTime;
        rig.yield = batchYield;
        p.log.unshift({ t: now, msg: `Started dredge & pit excavation for ${min.name} on rig #${rigIdx + 1}.`, kind: "info" });
        return { ok: true, result: { rigIdx, end: rig.end } };
      }

      case "mining_claim": {
        if (!p.mining) throw new Error("No mining rigs available");
        const reqRig = payload.rigIdx !== undefined ? payload.rigIdx : payload.rig;
        if (reqRig === "all") {
          let totalYield = 0;
          const claimedMap: Record<string, number> = {};
          (p.mining.rigs || []).forEach((rig) => {
            if (rig.mineralId && now >= rig.end) {
              const mid = rig.mineralId;
              const min = MINERAL_MAP[mid];
              const qty = rig.yield || min?.yieldMin || 1;
              if (!p.mining.stash) p.mining.stash = {};
              p.mining.stash[mid] = (p.mining.stash[mid] || 0) + qty;
              claimedMap[mid] = (claimedMap[mid] || 0) + qty;
              totalYield += qty;
              rig.mineralId = null;
              rig.start = 0;
              rig.end = 0;
              rig.yield = 0;
            }
          });
          if (totalYield === 0) throw new Error("No mining rigs ready to claim");
          gainXp(25);
          p.log.unshift({ t: now, msg: `Claimed all excavated minerals (${totalYield} total oz) into bullion vault!`, kind: "good" });
          return { ok: true, result: { total: totalYield, claimed: claimedMap, stash: p.mining.stash } };
        }

        const rigIdx = Number(reqRig);
        const rig = p.mining.rigs[rigIdx];
        if (!rig || !rig.mineralId) throw new Error("Nothing excavated on this rig");
        if (now < rig.end) throw new Error("Pit excavation in progress!");
        const mid = rig.mineralId;
        const min = MINERAL_MAP[mid];
        const qty = rig.yield || min?.yieldMin || 1;
        if (!p.mining.stash) p.mining.stash = {};
        p.mining.stash[mid] = (p.mining.stash[mid] || 0) + qty;
        rig.mineralId = null;
        rig.start = 0;
        rig.end = 0;
        rig.yield = 0;
        gainXp(15);
        p.log.unshift({ t: now, msg: `Smelted & secured ${qty} oz of ${min?.name || mid}! Stashed in pit vault.`, kind: "good" });
        return { ok: true, result: { mineralId: mid, quantity: qty, stash: p.mining.stash } };
      }

      case "mining_sell": {
        const { mineralId, amount } = payload;
        if (!p.mining?.stash?.[mineralId]) throw new Error("None of that mineral in pit stash");
        const current = p.mining.stash[mineralId];
        const toSell = amount ? Math.min(current, Number(amount)) : current;
        if (toSell <= 0) throw new Error("Invalid quantity to sell");
        const min = MINERAL_MAP[mineralId];
        if (!min) throw new Error("Invalid mineral");
        const purityLvl = p.mining.up?.smelter_purity || 0;
        const pricePerUnit = Math.floor(min.sellPriceClean * (1 + purityLvl * 0.15));
        let payout = toSell * pricePerUnit;
        if (p.big_man_perks?.includes("shadow_forex")) {
          payout = Math.floor(payout * 1.20);
        }
        p.mining.stash[mineralId] -= toSell;
        moveCash(p, now, "clean", payout, "Illegal Mining", `Sold ${toSell}x ${min.name}`);
        gainXp(Math.max(10, Math.floor(toSell * 5)));
        p.log.unshift({ t: now, msg: `Smuggled and liquidated ${toSell}x ${min.name}! Received GH₵${payout.toLocaleString()} Clean Cash.`, kind: "good" });
        return { ok: true, result: { mineralId, sold: toSell, payout } };
      }

      case "mining_upgrade": {
        const { upId } = payload;
        const up = MINING.upgrades[upId as keyof typeof MINING.upgrades];
        if (!up) throw new Error("Invalid mining upgrade");
        if (!p.mining) p.mining = { rigs: [], stash: {}, up: {} };
        if (!p.mining.up) p.mining.up = {};
        const lvl = p.mining.up[upId] || 0;
        if (lvl >= up.max) throw new Error("Upgrade is already at max level");
        const cost = Math.round(up.cost * Math.pow(1.8, lvl));
        if (BigInt(p.clean || "0") < BigInt(cost)) throw new Error(`Not enough clean cash for mining upgrade (requires GH₵${cost.toLocaleString()} clean)`);
        moveCash(p, now, "clean", -cost, "Illegal Mining", `Upgraded ${up.name} to LV${lvl + 1}`);
        p.mining.up[upId] = lvl + 1;
        p.log.unshift({ t: now, msg: `Upgraded mining concession ${up.name} to level ${lvl + 1}.`, kind: "good" });
        return { ok: true, result: { upId, level: lvl + 1 } };
      }

      // MODULE 5: BIG MAN CONNECTIONS FLAT PERKS
      case "buy_big_man_perk": {
        const { perkId } = payload;
        const perk = BIG_MAN_PERKS.find(x => x.id === perkId);
        if (!perk) throw new Error("Perk not found in Big Man directory");
        if (!p.big_man_perks) p.big_man_perks = [];
        if (p.big_man_perks.includes(perkId)) throw new Error("Perk already acquired");
        if (BigInt(p.clean || "0") < BigInt(perk.flatCost)) {
          throw new Error(`Requires GH₵${perk.flatCost.toLocaleString()} Clean Cash flat fee`);
        }
        moveCash(p, now, "clean", -perk.flatCost, "Big Man Connections", `Enlisted connection: ${perk.name}`);
        p.big_man_perks.push(perkId);
        p.log.unshift({
          t: now,
          msg: `🤝 High-level connection secured: "${perk.name}"! ${perk.desc}`,
          kind: "good",
        });
        return { ok: true, result: { perkId, perks: p.big_man_perks } };
      }

      // MODULE 4: PROCEDURAL AREA DON ATTACK & TAKEDOWN
      case "attack_area_don": {
        if (!p.area_don) p.area_don = spawnAreaDon(0);
        const don = p.area_don;

        // Tactical skirmish regroup cooldown
        if (don.next_attack_at && now < don.next_attack_at) {
          const waitSec = Math.ceil(don.next_attack_at - now);
          throw new Error(`Enforcers are regrouping! Must wait ${waitSec}s before clashing with ${don.name} again.`);
        }

        const crewList = (p.crew || []).filter((c) => !c.merc && !c.injury && (!c.injured_until || c.injured_until <= now));
        const crewPow = crewList.reduce((acc, c) => {
          const mus = Number(c.stats?.muscle || 5);
          const whl = Number(c.stats?.wheels || 5);
          let gearBonus = 0;
          Object.values(c.loadout || {}).forEach((uid) => {
            const gi = p.gear?.find((g) => g.uid === uid);
            const def = gi && GEAR_MAP[gi.id];
            if (def?.power) gearBonus += def.power;
          });
          return acc + mus * 3 + whl * 2 + gearBonus;
        }, 0);

        let bossGearBonus = 0;
        Object.values(p.loadout || {}).forEach((uid) => {
          const gi = p.gear?.find((g) => g.uid === uid);
          const def = gi && GEAR_MAP[gi.id];
          if (def?.power) bossGearBonus += def.power;
        });
        const bossPow = (Number(p.boss_stats?.muscle || 10) * 4) + (Number(p.boss_stats?.wheels || 10) * 3) + bossGearBonus;
        const totalPlayerPow = Math.max(30, crewPow + bossPow);

        // Don Defense / Armor mitigation
        const donDef = Number(don.defense || 120);
        let rawDmg = Math.max(12, Math.floor((totalPlayerPow - donDef * 0.45) * (0.45 + Math.random() * 0.35)));

        // Macho Boss mechanism: Brute Iron Body resists 40% of incoming damage
        const isMacho = don.archetypeId === "macho_boss";
        if (isMacho) {
          rawDmg = Math.max(10, Math.floor(rawDmg * 0.60));
        }

        const damage = rawDmg;
        don.hp = Math.max(0, don.hp - damage);
        don.next_attack_at = now + 40; // 40-second tactical cooldown

        // Street warfare causes police heat
        p.heat = Math.min(100, (p.heat || 0) + 12);
        if (p.heat >= 100) triggerArrest(p, now);

        // Don Retaliation Skirmish: Don's enforcers fire back!
        let injuryMsg = "";
        const retaliationChance = isMacho ? 0.65 : 0.35; // Macho Boss hits back with brute force!
        if (crewList.length > 0 && Math.random() < retaliationChance) {
          const victim = crewList[Math.floor(Math.random() * crewList.length)];
          const severity = isMacho ? 2 : 1;
          injureCrew(p, victim, severity, `Clash with Area Don ${don.name}`, now);
          injuryMsg = ` ⚠️ ${victim.name} took severe damage from ${don.name}'s goons and was hospitalized!`;
        }

        if (don.hp <= 0) {
          // Area Don Defeated!
          // Explicit requirement: "reward to be dirty and max should be 20000"
          const bounty = Math.min(20000, don.bounty || 15000);
          moveCash(p, now, "dirty", bounty, "Area Don Takedown", `Defeated Area Don ${don.name}`);
          const defeatedCount = (don.defeatedCount || 0) + 1;
          gainXp(120);
          p.log.unshift({
            t: now,
            msg: `👑 AREA DON TOPPLED! You executed ${don.name}! Claimed GH₵${bounty.toLocaleString()} Dirty Cash bounty.${injuryMsg}`,
            kind: "good",
          });
          // Immediately procedural replacement
          p.area_don = spawnAreaDon(defeatedCount);
          p.log.unshift({
            t: now,
            msg: `⚡ Power vacuum filled: ${p.area_don.name} has claimed the district under ${p.area_don.archetypeName}!`,
            kind: "info",
          });
          return { ok: true, result: { defeated: true, bounty, newDon: p.area_don } };
        } else {
          p.log.unshift({
            t: now,
            msg: `Clashed with ${don.name}'s enforcers! Dealt ${damage} damage (HP remaining: ${don.hp}/${don.maxHp}).${isMacho ? " (The Macho Boss's iron body resisted 40% damage!)" : ""}${injuryMsg}`,
            kind: "bad",
          });
          return { ok: true, result: { defeated: false, damage, hp: don.hp, maxHp: don.maxHp, next_attack_at: don.next_attack_at } };
        }
      }

      // MODULE 6: COMMODITIES SMUGGLING
      case "commodity_buy": {
        const { commodityId, quantity } = payload;
        const cDef = COMMODITY_MAP[commodityId];
        if (!cDef) throw new Error("Invalid commodity");
        const qty = Math.max(1, Number(quantity) || 1);
        const hour = Math.floor(now / 3600);
        const seed = (commodityId.split("").reduce((a: number, b: string) => a + b.charCodeAt(0), 0) + hour) % 100;
        const variance = (seed - 50) / 200;
        const buyPrice = Math.max(100, Math.floor(cDef.basePrice * (1 + variance)));
        const totalCost = buyPrice * qty;
        if (BigInt(p.dirty || "0") < BigInt(totalCost)) throw new Error(`Not enough dirty cash (requires GH₵${totalCost.toLocaleString()} dirty)`);
        moveCash(p, now, "dirty", -totalCost, "Border Smuggling", `Bought ${qty}x ${cDef.name}`);
        if (!p.commodities_held) p.commodities_held = {};
        p.commodities_held[commodityId] = (p.commodities_held[commodityId] || 0) + qty;
        p.log.unshift({ t: now, msg: `Smuggled ${qty}x ${cDef.name} across border at GH₵${buyPrice.toLocaleString()} each.`, kind: "info" });
        return { ok: true, result: { commodityId, qty, held: p.commodities_held[commodityId] } };
      }

      case "commodity_sell": {
        const { commodityId, quantity } = payload;
        const cDef = COMMODITY_MAP[commodityId];
        if (!cDef) throw new Error("Invalid commodity");
        if (!p.commodities_held?.[commodityId]) throw new Error("No holdings of this commodity");
        const current = p.commodities_held[commodityId];
        const toSell = quantity ? Math.min(current, Number(quantity)) : current;
        if (toSell <= 0) throw new Error("Invalid quantity");
        const hour = Math.floor(now / 3600);
        const seed = (commodityId.split("").reduce((a: number, b: string) => a + b.charCodeAt(0), 0) + hour) % 100;
        const variance = (seed - 50) / 200;
        const baseSell = Math.max(120, Math.floor(cDef.basePrice * (1.1 + variance)));
        let totalPayout = baseSell * toSell;
        if (p.big_man_perks?.includes("shadow_forex")) {
          totalPayout = Math.floor(totalPayout * 1.20);
        }
        p.commodities_held[commodityId] -= toSell;
        moveCash(p, now, "clean", totalPayout, "Border Smuggling", `Liquidated ${toSell}x ${cDef.name}`);
        gainXp(Math.max(5, Math.floor(toSell * 2)));
        p.log.unshift({ t: now, msg: `Offloaded ${toSell}x ${cDef.name} at harbor! Liquidated for GH₵${totalPayout.toLocaleString()} Clean Cash.`, kind: "good" });
        return { ok: true, result: { commodityId, toSell, payout: totalPayout } };
      }

      // MODULE 6: FIVE-ZONE TURF TRIBUTE
      case "turf_tribute": {
        const { zoneId } = payload;
        const zDef = TURF_ZONES.find(z => z.id === zoneId);
        if (!zDef) throw new Error("Turf zone not found");
        if (!p.turf_control) p.turf_control = {};
        const currentControl = p.turf_control[zoneId] || 0;
        if (currentControl >= 100) throw new Error("Zone is already at 100% full syndicate domination");
        if (BigInt(p.clean || "0") < BigInt(zDef.tributeCost)) {
          throw new Error(`Requires GH₵${zDef.tributeCost.toLocaleString()} clean tribute`);
        }
        moveCash(p, now, "clean", -zDef.tributeCost, "Turf Ledger", `Paid tribute to control ${zDef.name}`);
        p.turf_control[zoneId] = Math.min(100, currentControl + 25);
        p.log.unshift({
          t: now,
          msg: `✊ Paid tribute in ${zDef.name}! Control increased to ${p.turf_control[zoneId]}%. (${zDef.perk})`,
          kind: "good",
        });
        return { ok: true, result: { zoneId, control: p.turf_control[zoneId] } };
      }

      default:
        throw new Error(`Unknown action: ${type}`);
    }
  } catch (err: any) {
    return { ok: false, error: err.message || "Action failed" };
  }
}
