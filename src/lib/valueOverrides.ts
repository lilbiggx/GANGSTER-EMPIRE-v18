import {
  HUSTLES,
  HUSTLE_MAP,
  FRONTS,
  FRONT_MAP,
  LAND_FEES,
  INITIAL_PLAYER_PLOTS,
  MANSION_FACILITIES,
  UPGRADES,
  BLACK_MARKET,
  BM_MAP,
  GEAR,
  BOUTIQUE_CATALOG,
  ALL_GEAR_ITEMS,
  GEAR_MAP,
  COSMETICS,
  COSMETIC_MAP,
  FARM,
  STRAINS,
  STRAIN_MAP,
  WORKSHOP,
  CRAFTABLE_WEAPONS,
  ROBBERIES,
  ROBBERY_MAP,
  TRAFFICKING_ROUTES,
  TRAFFICKING_MAP,
  GIRLFRIENDS,
  GIRLFRIEND_MAP,
  ASSASSIN_CONTACT,
  MUSIC_TRACKS,
  MUSIC_MAP,
  STUDIO,
  HEISTS,
  HEIST_MAP,
} from "../data/gameData";
import { DELIVERABLE_CONSUMABLES } from "../data/consumablesData";
import { LUXURY_CATALOG, LUXURY_MAP, LUXURY_TIER_PRICES } from "../data/luxury";

export const OVERRIDES_ACTIVE_KEY = "ge_value_overrides_active";
export const OVERRIDES_DATA_KEY = "ge_value_overrides_data";

// Snapshot of all original default values before any overrides mutate in-memory objects
export const ORIGINAL_DEFAULTS = {
  general: {
    rush_hustle_fee: 5000,
    crew_hire_base: 600,
    crew_wage_base: 100,
    crew_wage_step: 55,
    plasma_boost_cost: 10000,
  },
  land_fees: [...LAND_FEES],
  hustles: HUSTLES.map((h) => ({
    id: h.id,
    name: h.name,
    cost: h.cost,
    income: h.income,
    build_time: h.build_time || 20,
    build_crew: h.build_crew || 1,
  })),
  fronts: FRONTS.map((f) => ({
    id: f.id,
    name: f.name,
    cost: f.cost,
    cap: f.cap,
    dur: f.dur,
  })),
  facilities: Object.values(MANSION_FACILITIES).map((f) => ({
    id: f.id,
    name: f.name,
    base_cost_dirty: f.base_cost_dirty,
    base_cost_clean: f.base_cost_clean,
  })),
  upgrades: Object.entries(UPGRADES).map(([id, u]) => ({
    id,
    name: u.name,
    cost: u.cost,
    ap_cost: u.ap_cost || 0,
  })),
  black_market: BLACK_MARKET.map((b) => ({
    id: b.id,
    name: b.name,
    price: b.price,
  })),
  consumables: DELIVERABLE_CONSUMABLES.map((c) => ({
    id: c.id,
    name: c.name,
    clean_price: c.clean_price,
    delivery_fee: c.delivery_fee,
  })),
  gear: GEAR.map((g) => ({
    id: g.id,
    name: g.name,
    slot: g.slot,
    price: g.price,
    power: g.power || 0,
  })),
  boutique_catalog: BOUTIQUE_CATALOG.map((b) => ({
    id: b.id,
    name: b.name,
    subcategory: b.subcategory,
    price: b.price,
    power: b.power || 0,
  })),
  cosmetics: COSMETICS.map((c) => ({
    id: c.id,
    name: c.name,
    slot: c.slot,
    clean: c.clean,
  })),
  farm: {
    plot_cost: FARM.plot_cost,
    plot_base: FARM.plot_cost,
    plot_growth: FARM.plot_growth,
    upgrades: {
      lights: { name: "Grow Lights", cost: FARM.upgrades.lights.cost },
      irrigation: { name: "Drip Irrigation", cost: FARM.upgrades.irrigation.cost },
      greenhouse: { name: "Hidden Greenhouse", cost: FARM.upgrades.greenhouse.cost },
    },
  },
  strains: STRAINS.map((s) => ({
    id: s.id,
    name: s.name,
    seed: s.seed,
    price: s.price,
    grow: s.grow,
  })),
  workshop: {
    bench_cost: WORKSHOP.bench_cost,
    bench_growth: WORKSHOP.bench_growth,
    upgrades: {
      tools: { name: "Precision Tools", cost: WORKSHOP.upgrades.tools.cost },
      foundry: { name: "Industrial Foundry", cost: WORKSHOP.upgrades.foundry.cost },
    },
  },
  craftable_weapons: CRAFTABLE_WEAPONS.map((w) => ({
    id: w.id,
    name: w.name,
    cost: w.cost,
    dur: w.dur,
    power: w.power,
  })),
  robberies: ROBBERIES.map((r) => ({
    id: r.id,
    name: r.name,
    cost: r.cost,
    reward: r.reward,
    duration: r.duration,
  })),
  trafficking_routes: TRAFFICKING_ROUTES.map((t) => ({
    id: t.id,
    name: t.name,
    payout: t.payout,
    duration: t.duration,
  })),
  girlfriends: GIRLFRIENDS.map((g) => ({
    id: g.id,
    name: g.name,
    courtCost: g.courtCost,
    dateCost: g.dateCost,
    giftCost: g.giftCost,
  })),
  assassin: {
    retainer_fee: ASSASSIN_CONTACT.retainer_fee,
    tiers: ASSASSIN_CONTACT.tiers,
  },
  assassin_contracts: ASSASSIN_CONTACT.contracts.map((c) => ({
    id: c.id,
    name: c.name,
    cost_dirty: c.cost_dirty,
    cost_clean: c.cost_clean,
  })),
  music_tracks: MUSIC_TRACKS.map((m) => ({
    id: m.id,
    name: m.name,
    cost: m.cost,
    payout: m.payout,
    dur: m.dur,
  })),
  studio: {
    booth_cost: STUDIO.booth_cost,
    booth_growth: STUDIO.booth_growth,
    upgrades: {
      acoustics: { name: "Soundproof Acoustics", cost: STUDIO.upgrades.acoustics.cost },
      mixing: { name: "Pro Mixing Console", cost: STUDIO.upgrades.mixing.cost },
    },
  },
  heists: HEISTS.map((h) => ({
    id: h.id,
    name: h.name,
    reward: h.reward,
    dur: h.dur,
  })),
  luxury_tiers: [...LUXURY_TIER_PRICES],
  luxury_items: LUXURY_CATALOG.map((l) => ({
    id: l.id,
    name: l.name,
    tier: l.tier,
    category: l.category,
    price: l.price,
  })),
};

let cachedActive = false;
let cachedOverrides: Record<string, number> = {};

export function loadStoredOverrides(): { active: boolean; overrides: Record<string, number> } {
  try {
    if (typeof localStorage === "undefined") return { active: false, overrides: {} };
    const active = localStorage.getItem(OVERRIDES_ACTIVE_KEY) === "true";
    const raw = JSON.parse(localStorage.getItem(OVERRIDES_DATA_KEY) || "{}");
    const clean: Record<string, number> = {};
    if (raw && typeof raw === "object") {
      Object.entries(raw).forEach(([k, v]) => {
        const n = Number(v);
        if (v !== "" && v !== null && v !== undefined && Number.isFinite(n) && n >= 0) {
          clean[k] = Math.round(n);
        }
      });
    }
    cachedActive = active;
    cachedOverrides = clean;
    return { active, overrides: clean };
  } catch {
    return { active: false, overrides: {} };
  }
}

function pickVal(key: string, def: number, ov: Record<string, number>, active: boolean): number {
  if (!active) return def;
  const v = ov[key];
  return typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.round(v) : def;
}

export function getRushHustleFee(): number {
  return pickVal("rush_hustle_fee", ORIGINAL_DEFAULTS.general.rush_hustle_fee, cachedOverrides, cachedActive);
}

export function getCrewHireBaseCost(): number {
  return pickVal("crew_hire_base", ORIGINAL_DEFAULTS.general.crew_hire_base, cachedOverrides, cachedActive);
}

export function getCrewWageBase(): number {
  return pickVal("crew_wage_base", ORIGINAL_DEFAULTS.general.crew_wage_base, cachedOverrides, cachedActive);
}

export function getCrewWageStep(): number {
  return pickVal("crew_wage_step", ORIGINAL_DEFAULTS.general.crew_wage_step, cachedOverrides, cachedActive);
}

export function getPlasmaBoostCost(): number {
  return pickVal("plasma_boost_cost", ORIGINAL_DEFAULTS.general.plasma_boost_cost, cachedOverrides, cachedActive);
}

/** Mutates in-memory game data tables so every UI component and engine formula immediately reflects overrides. */
export function applyValueOverrides(customOverrides?: Record<string, number>, customActive?: boolean) {
  if (customOverrides !== undefined && customActive !== undefined) {
    cachedOverrides = customOverrides;
    cachedActive = customActive;
  } else {
    loadStoredOverrides();
  }
  const ov = cachedOverrides;
  const act = cachedActive;

  // 1. Land fees
  ORIGINAL_DEFAULTS.land_fees.forEach((defFee, i) => {
    const val = pickVal(`land_fee_${i}`, defFee, ov, act);
    (LAND_FEES as unknown as number[])[i] = val;
    if (INITIAL_PLAYER_PLOTS[i]) INITIAL_PLAYER_PLOTS[i].plotUnlockFee = val;
  });

  // 2. Side Hustles
  ORIGINAL_DEFAULTS.hustles.forEach((def) => {
    const h = HUSTLE_MAP[def.id];
    if (!h) return;
    h.cost = pickVal(`hustle_cost_${def.id}`, def.cost, ov, act);
    h.income = pickVal(`hustle_rate_${def.id}`, def.income, ov, act);
    h.build_time = Math.max(1, pickVal(`hustle_time_${def.id}`, def.build_time, ov, act));
    h.build_crew = Math.max(1, pickVal(`hustle_crew_${def.id}`, def.build_crew, ov, act));
  });

  // 3. Fronts
  ORIGINAL_DEFAULTS.fronts.forEach((def) => {
    const f = FRONT_MAP[def.id];
    if (!f) return;
    f.cost = pickVal(`front_cost_${def.id}`, def.cost, ov, act);
    f.cap = pickVal(`front_cap_${def.id}`, def.cap, ov, act);
    f.dur = Math.max(1, pickVal(`front_dur_${def.id}`, def.dur, ov, act));
  });

  // 4. Mansion Facilities
  ORIGINAL_DEFAULTS.facilities.forEach((def) => {
    const fac = MANSION_FACILITIES[def.id];
    if (!fac) return;
    fac.base_cost_dirty = pickVal(`facility_dirty_${def.id}`, def.base_cost_dirty, ov, act);
    fac.base_cost_clean = pickVal(`facility_clean_${def.id}`, def.base_cost_clean, ov, act);
  });

  // 5. Upgrades
  ORIGINAL_DEFAULTS.upgrades.forEach((def) => {
    const u = UPGRADES[def.id];
    if (!u) return;
    u.cost = pickVal(`upgrade_cost_${def.id}`, def.cost, ov, act);
    if (u.ap_cost !== undefined || ov[`upgrade_ap_${def.id}`] !== undefined) {
      u.ap_cost = pickVal(`upgrade_ap_${def.id}`, def.ap_cost, ov, act);
    }
  });

  // 6. Black Market
  ORIGINAL_DEFAULTS.black_market.forEach((def) => {
    const b = BM_MAP[def.id];
    if (!b) return;
    b.price = pickVal(`bm_price_${def.id}`, def.price, ov, act);
  });

  // 7. Deliverable Consumables
  ORIGINAL_DEFAULTS.consumables.forEach((def) => {
    const c = DELIVERABLE_CONSUMABLES.find((x) => x.id === def.id);
    if (!c) return;
    c.clean_price = pickVal(`consumable_price_${def.id}`, def.clean_price, ov, act);
    c.delivery_fee = pickVal(`consumable_fee_${def.id}`, def.delivery_fee, ov, act);
  });

  // 8. Gear & Weapons
  ORIGINAL_DEFAULTS.gear.forEach((def) => {
    const g = GEAR.find((x) => x.id === def.id);
    const ag = GEAR_MAP[def.id];
    const price = pickVal(`gear_price_${def.id}`, def.price, ov, act);
    const power = pickVal(`gear_power_${def.id}`, def.power, ov, act);
    if (g) { g.price = price; if (g.power !== undefined || ov[`gear_power_${def.id}`] !== undefined) g.power = power; }
    if (ag) { ag.price = price; if (ag.power !== undefined || ov[`gear_power_${def.id}`] !== undefined) ag.power = power; }
  });

  // 9. Boutique Catalog
  ORIGINAL_DEFAULTS.boutique_catalog.forEach((def) => {
    const b = BOUTIQUE_CATALOG.find((x) => x.id === def.id);
    const ag = GEAR_MAP[def.id];
    const price = pickVal(`boutique_price_${def.id}`, def.price, ov, act);
    const power = pickVal(`boutique_power_${def.id}`, def.power, ov, act);
    if (b) { b.price = price; if (b.power !== undefined || ov[`boutique_power_${def.id}`] !== undefined) b.power = power; }
    if (ag) { ag.price = price; if (ag.power !== undefined || ov[`boutique_power_${def.id}`] !== undefined) ag.power = power; }
  });

  // Sync ALL_GEAR_ITEMS
  ALL_GEAR_ITEMS.forEach((item) => {
    const mapped = GEAR_MAP[item.id];
    if (mapped) {
      item.price = mapped.price;
      item.power = mapped.power;
    }
  });

  // 10. Cosmetics
  ORIGINAL_DEFAULTS.cosmetics.forEach((def) => {
    const c = COSMETIC_MAP[def.id];
    if (!c) return;
    c.clean = pickVal(`cosmetic_clean_${def.id}`, def.clean, ov, act);
  });

  // 11. Farm & Strains
  FARM.plot_cost = pickVal("farm_plot_base", ORIGINAL_DEFAULTS.farm.plot_base, ov, act);
  FARM.plot_growth = pickVal("farm_plot_growth", ORIGINAL_DEFAULTS.farm.plot_growth, ov, act);
  Object.entries(ORIGINAL_DEFAULTS.farm.upgrades).forEach(([k, u]) => {
    FARM.upgrades[k as keyof typeof FARM.upgrades].cost = pickVal(`farm_up_cost_${k}`, u.cost, ov, act);
  });

  ORIGINAL_DEFAULTS.strains.forEach((def) => {
    const s = STRAIN_MAP[def.id];
    if (!s) return;
    s.seed = pickVal(`strain_seed_${def.id}`, def.seed, ov, act);
    s.price = pickVal(`strain_price_${def.id}`, def.price, ov, act);
    s.grow = Math.max(1, pickVal(`strain_grow_${def.id}`, def.grow, ov, act));
  });

  // 12. Workshop & Craftable Weapons
  WORKSHOP.bench_cost = pickVal("workshop_bench_cost", ORIGINAL_DEFAULTS.workshop.bench_cost, ov, act);
  WORKSHOP.bench_growth = pickVal("workshop_bench_growth", ORIGINAL_DEFAULTS.workshop.bench_growth, ov, act);
  Object.entries(ORIGINAL_DEFAULTS.workshop.upgrades).forEach(([k, u]) => {
    WORKSHOP.upgrades[k as keyof typeof WORKSHOP.upgrades].cost = pickVal(`workshop_up_cost_${k}`, u.cost, ov, act);
  });

  ORIGINAL_DEFAULTS.craftable_weapons.forEach((def) => {
    const w = CRAFTABLE_WEAPONS.find((x) => x.id === def.id);
    if (!w) return;
    w.cost = pickVal(`craft_cost_${def.id}`, def.cost, ov, act);
    w.dur = Math.max(1, pickVal(`craft_dur_${def.id}`, def.dur, ov, act));
    w.power = pickVal(`craft_power_${def.id}`, def.power, ov, act);
  });

  // 13. Robberies
  ORIGINAL_DEFAULTS.robberies.forEach((def) => {
    const r = ROBBERY_MAP[def.id];
    if (!r) return;
    r.cost = pickVal(`robbery_cost_${def.id}`, def.cost, ov, act);
    r.reward = pickVal(`robbery_reward_${def.id}`, def.reward, ov, act);
    r.duration = Math.max(1, pickVal(`robbery_dur_${def.id}`, def.duration, ov, act));
  });

  // 14. Smuggling / Trafficking Routes
  ORIGINAL_DEFAULTS.trafficking_routes.forEach((def) => {
    const t = TRAFFICKING_MAP[def.id];
    if (!t) return;
    t.payout = pickVal(`smuggle_payout_${def.id}`, def.payout, ov, act);
    t.duration = Math.max(1, pickVal(`smuggle_dur_${def.id}`, def.duration, ov, act));
  });

  // 15. Girlfriends
  ORIGINAL_DEFAULTS.girlfriends.forEach((def) => {
    const g = GIRLFRIEND_MAP[def.id];
    if (!g) return;
    g.courtCost = pickVal(`gf_court_${def.id}`, def.courtCost, ov, act);
    g.dateCost = pickVal(`gf_date_${def.id}`, def.dateCost, ov, act);
    g.giftCost = pickVal(`gf_gift_${def.id}`, def.giftCost, ov, act);
  });

  // 16. Assassin Contracts
  ORIGINAL_DEFAULTS.assassin_contracts.forEach((def) => {
    const c = ASSASSIN_CONTACT.contracts.find((x) => x.id === def.id);
    if (!c) return;
    c.cost_dirty = pickVal(`assassin_dirty_${def.id}`, def.cost_dirty, ov, act);
    c.cost_clean = pickVal(`assassin_clean_${def.id}`, def.cost_clean, ov, act);
  });

  // 17. Music Tracks & Studio
  STUDIO.booth_cost = pickVal("studio_booth_cost", ORIGINAL_DEFAULTS.studio.booth_cost, ov, act);
  STUDIO.booth_growth = pickVal("studio_booth_growth", ORIGINAL_DEFAULTS.studio.booth_growth, ov, act);
  Object.entries(ORIGINAL_DEFAULTS.studio.upgrades).forEach(([k, u]) => {
    STUDIO.upgrades[k as keyof typeof STUDIO.upgrades].cost = pickVal(`studio_up_cost_${k}`, u.cost, ov, act);
  });

  ORIGINAL_DEFAULTS.music_tracks.forEach((def) => {
    const m = MUSIC_MAP[def.id];
    if (!m) return;
    m.cost = pickVal(`music_cost_${def.id}`, def.cost, ov, act);
    m.payout = pickVal(`music_payout_${def.id}`, def.payout, ov, act);
    m.dur = Math.max(1, pickVal(`music_dur_${def.id}`, def.dur, ov, act));
  });

  // 18. Heists
  ORIGINAL_DEFAULTS.heists.forEach((def) => {
    const h = HEIST_MAP[def.id];
    const hArr = HEISTS.find((x) => x.id === def.id);
    const reward = pickVal(`heist_reward_${def.id}`, def.reward, ov, act);
    const dur = Math.max(1, pickVal(`heist_dur_${def.id}`, def.dur, ov, act));
    if (h) { h.reward = reward; h.dur = dur; }
    if (hArr) { hArr.reward = reward; hArr.dur = dur; }
  });

  // 19. Luxury Tier Prices & Individual Luxury Items
  ORIGINAL_DEFAULTS.luxury_items.forEach((def) => {
    const l = LUXURY_MAP[def.id];
    if (!l) return;
    const tierOverride = ov[`luxury_tier_price_${def.tier}`];
    const itemOverride = ov[`luxury_item_price_${def.id}`];
    if (act && typeof itemOverride === "number" && Number.isFinite(itemOverride)) {
      l.price = Math.round(itemOverride);
    } else if (act && typeof tierOverride === "number" && Number.isFinite(tierOverride) && !l.prestige) {
      l.price = Math.round(tierOverride);
    } else {
      l.price = def.price;
    }
  });
}

/** Builds a complete, structured JSON export of all changed and current values to download and share. */
export function buildOverridesExportPayload(overrides: Record<string, number>, active: boolean) {
  const changed: Array<{ key: string; category: string; item: string; field: string; default_value: number; new_value: number }> = [];

  const check = (key: string, category: string, item: string, field: string, defVal: number) => {
    if (overrides[key] !== undefined && Number(overrides[key]) !== defVal) {
      changed.push({
        key,
        category,
        item,
        field,
        default_value: defVal,
        new_value: Number(overrides[key]),
      });
    }
  };

  check("rush_hustle_fee", "General & Land", "Side Hustle Construction", "Rush Fee (Clean)", ORIGINAL_DEFAULTS.general.rush_hustle_fee);
  check("crew_hire_base", "Crew & Medical", "Crew Recruitment", "Base Hire Cost", ORIGINAL_DEFAULTS.general.crew_hire_base);
  check("crew_wage_base", "Crew & Medical", "Crew Payroll", "Daily Wage Base", ORIGINAL_DEFAULTS.general.crew_wage_base);
  check("crew_wage_step", "Crew & Medical", "Crew Payroll", "Daily Wage Per Level", ORIGINAL_DEFAULTS.general.crew_wage_step);
  check("plasma_boost_cost", "Crew & Medical", "Blood Bank", "Plasma Boost Cost (Clean)", ORIGINAL_DEFAULTS.general.plasma_boost_cost);

  ORIGINAL_DEFAULTS.land_fees.forEach((fee, i) => {
    check(`land_fee_${i}`, "General & Land", `Land Plot ${i + 1}`, "Unlock Fee (Clean)", fee);
  });

  ORIGINAL_DEFAULTS.hustles.forEach((h) => {
    check(`hustle_cost_${h.id}`, "Street Hustles", h.name, "Build Cost (Clean)", h.cost);
    check(`hustle_rate_${h.id}`, "Street Hustles", h.name, "Base Income (/min Dirty)", h.income);
    check(`hustle_time_${h.id}`, "Street Hustles", h.name, "Build Time (sec)", h.build_time);
    check(`hustle_crew_${h.id}`, "Street Hustles", h.name, "Required Builders", h.build_crew);
  });

  ORIGINAL_DEFAULTS.fronts.forEach((f) => {
    check(`front_cost_${f.id}`, "Front Businesses", f.name, "Buy Cost (Clean)", f.cost);
    check(`front_cap_${f.id}`, "Front Businesses", f.name, "Wash Capacity", f.cap);
    check(`front_dur_${f.id}`, "Front Businesses", f.name, "Wash Duration (sec)", f.dur);
  });

  ORIGINAL_DEFAULTS.facilities.forEach((f) => {
    check(`facility_dirty_${f.id}`, "Compound Facilities", f.name, "Base Dirty Cost", f.base_cost_dirty);
    check(`facility_clean_${f.id}`, "Compound Facilities", f.name, "Base Clean Cost", f.base_cost_clean);
  });

  ORIGINAL_DEFAULTS.upgrades.forEach((u) => {
    check(`upgrade_cost_${u.id}`, "Mansion & Garage Upgrades", u.name, "Base Cost", u.cost);
    check(`upgrade_ap_${u.id}`, "Mansion & Garage Upgrades", u.name, "AP Cost", u.ap_cost);
  });

  ORIGINAL_DEFAULTS.black_market.forEach((b) => {
    check(`bm_price_${b.id}`, "Black Market", b.name, "Dirty Price", b.price);
  });

  ORIGINAL_DEFAULTS.consumables.forEach((c) => {
    check(`consumable_price_${c.id}`, "Consumables", c.name, "Clean Price", c.clean_price);
    check(`consumable_fee_${c.id}`, "Consumables", c.name, "Courier Fee", c.delivery_fee);
  });

  ORIGINAL_DEFAULTS.gear.forEach((g) => {
    check(`gear_price_${g.id}`, "Weapons & Street Gear", g.name, "Dirty Price", g.price);
    check(`gear_power_${g.id}`, "Weapons & Street Gear", g.name, "Power", g.power);
  });

  ORIGINAL_DEFAULTS.boutique_catalog.forEach((b) => {
    check(`boutique_price_${b.id}`, "Designer Boutique Gear", b.name, "Clean Price", b.price);
    check(`boutique_power_${b.id}`, "Designer Boutique Gear", b.name, "Power", b.power);
  });

  ORIGINAL_DEFAULTS.cosmetics.forEach((c) => {
    check(`cosmetic_clean_${c.id}`, "Wardrobe & Rides", c.name, "Clean Price", c.clean);
  });

  check("farm_plot_base", "Grow Farm", "Farm Plot", "Base Plot Cost", ORIGINAL_DEFAULTS.farm.plot_base);
  check("farm_plot_growth", "Grow Farm", "Farm Plot", "Cost Growth", ORIGINAL_DEFAULTS.farm.plot_growth);
  Object.entries(ORIGINAL_DEFAULTS.farm.upgrades).forEach(([k, u]) => {
    check(`farm_up_cost_${k}`, "Grow Farm", u.name, "Upgrade Cost", u.cost);
  });

  ORIGINAL_DEFAULTS.strains.forEach((s) => {
    check(`strain_seed_${s.id}`, "Grow Farm", s.name, "Seed Cost", s.seed);
    check(`strain_price_${s.id}`, "Grow Farm", s.name, "Unit Sell Price", s.price);
    check(`strain_grow_${s.id}`, "Grow Farm", s.name, "Grow Time (sec)", s.grow);
  });

  check("workshop_bench_cost", "Weapon Workshop", "Crafting Bench", "Base Bench Cost", ORIGINAL_DEFAULTS.workshop.bench_cost);
  check("workshop_bench_growth", "Weapon Workshop", "Crafting Bench", "Cost Growth", ORIGINAL_DEFAULTS.workshop.bench_growth);
  Object.entries(ORIGINAL_DEFAULTS.workshop.upgrades).forEach(([k, u]) => {
    check(`workshop_up_cost_${k}`, "Weapon Workshop", u.name, "Upgrade Cost", u.cost);
  });

  ORIGINAL_DEFAULTS.craftable_weapons.forEach((w) => {
    check(`craft_cost_${w.id}`, "Weapon Workshop", w.name, "Craft Cost (Dirty)", w.cost);
    check(`craft_dur_${w.id}`, "Weapon Workshop", w.name, "Craft Time (sec)", w.dur);
    check(`craft_power_${w.id}`, "Weapon Workshop", w.name, "Weapon Power", w.power);
  });

  ORIGINAL_DEFAULTS.robberies.forEach((r) => {
    check(`robbery_cost_${r.id}`, "Robbery Operations", r.name, "Prep Cost (Dirty)", r.cost);
    check(`robbery_reward_${r.id}`, "Robbery Operations", r.name, "Payout", r.reward);
    check(`robbery_dur_${r.id}`, "Robbery Operations", r.name, "Duration (sec)", r.duration);
  });

  ORIGINAL_DEFAULTS.trafficking_routes.forEach((t) => {
    check(`smuggle_payout_${t.id}`, "Smuggler Routes", t.name, "Base Payout", t.payout);
    check(`smuggle_dur_${t.id}`, "Smuggler Routes", t.name, "Duration (sec)", t.duration);
  });

  ORIGINAL_DEFAULTS.girlfriends.forEach((g) => {
    check(`gf_court_${g.id}`, "Syndicate Romance", g.name, "Court Cost", g.courtCost);
    check(`gf_date_${g.id}`, "Syndicate Romance", g.name, "Date Cost", g.dateCost);
    check(`gf_gift_${g.id}`, "Syndicate Romance", g.name, "Gift Cost", g.giftCost);
  });

  ORIGINAL_DEFAULTS.assassin_contracts.forEach((c) => {
    check(`assassin_dirty_${c.id}`, "Assassin Contracts", c.name, "Dirty Cost", c.cost_dirty);
    check(`assassin_clean_${c.id}`, "Assassin Contracts", c.name, "Clean Cost", c.cost_clean);
  });

  check("studio_booth_cost", "Music Studio", "Recording Booth", "Base Booth Cost", ORIGINAL_DEFAULTS.studio.booth_cost);
  check("studio_booth_growth", "Music Studio", "Recording Booth", "Cost Growth", ORIGINAL_DEFAULTS.studio.booth_growth);
  Object.entries(ORIGINAL_DEFAULTS.studio.upgrades).forEach(([k, u]) => {
    check(`studio_up_cost_${k}`, "Music Studio", u.name, "Upgrade Cost", u.cost);
  });

  ORIGINAL_DEFAULTS.music_tracks.forEach((m) => {
    check(`music_cost_${m.id}`, "Music Studio", m.name, "Production Cost", m.cost);
    check(`music_payout_${m.id}`, "Music Studio", m.name, "Royalty Payout", m.payout);
    check(`music_dur_${m.id}`, "Music Studio", m.name, "Duration (sec)", m.dur);
  });

  ORIGINAL_DEFAULTS.heists.forEach((h) => {
    check(`heist_reward_${h.id}`, "Heists", h.name, "Base Reward", h.reward);
    check(`heist_dur_${h.id}`, "Heists", h.name, "Duration (sec)", h.dur);
  });

  for (let tier = 1; tier <= 7; tier++) {
    check(`luxury_tier_price_${tier}`, "Luxury Boutique", `Tier ${tier} Base Price`, "Clean Price", ORIGINAL_DEFAULTS.luxury_tiers[tier]);
  }

  return {
    exported_at: new Date().toISOString(),
    active,
    total_changes: changed.length,
    changed_values: changed,
    overrides,
    current_values: {
      general: {
        rush_hustle_fee: getRushHustleFee(),
        crew_hire_base: getCrewHireBaseCost(),
        crew_wage_base: getCrewWageBase(),
        crew_wage_step: getCrewWageStep(),
        plasma_boost_cost: getPlasmaBoostCost(),
      },
      land_fees: [...LAND_FEES],
      hustles: HUSTLES.map((h) => ({ id: h.id, name: h.name, cost: h.cost, income: h.income, build_time: h.build_time, build_crew: h.build_crew })),
      fronts: FRONTS.map((f) => ({ id: f.id, name: f.name, cost: f.cost, cap: f.cap, dur: f.dur })),
      facilities: Object.values(MANSION_FACILITIES).map((f) => ({ id: f.id, name: f.name, base_cost_dirty: f.base_cost_dirty, base_cost_clean: f.base_cost_clean })),
      upgrades: Object.entries(UPGRADES).map(([id, u]) => ({ id, name: u.name, cost: u.cost, ap_cost: u.ap_cost || 0 })),
      black_market: BLACK_MARKET.map((b) => ({ id: b.id, name: b.name, price: b.price })),
      consumables: DELIVERABLE_CONSUMABLES.map((c) => ({ id: c.id, name: c.name, clean_price: c.clean_price, delivery_fee: c.delivery_fee })),
      gear: GEAR.map((g) => ({ id: g.id, name: g.name, price: g.price, power: g.power || 0 })),
      boutique_catalog: BOUTIQUE_CATALOG.map((b) => ({ id: b.id, name: b.name, price: b.price, power: b.power || 0 })),
      cosmetics: COSMETICS.map((c) => ({ id: c.id, name: c.name, clean: c.clean })),
      farm: {
        plot_cost: FARM.plot_cost,
        lights_cost: FARM.upgrades.lights.cost,
        irrigation_cost: FARM.upgrades.irrigation.cost,
        greenhouse_cost: FARM.upgrades.greenhouse.cost,
        strains: STRAINS.map((s) => ({ id: s.id, name: s.name, seed: s.seed, price: s.price, grow: s.grow })),
      },
      workshop: {
        bench_cost: WORKSHOP.bench_cost,
        tools_cost: WORKSHOP.upgrades.tools.cost,
        foundry_cost: WORKSHOP.upgrades.foundry.cost,
        craftable_weapons: CRAFTABLE_WEAPONS.map((w) => ({ id: w.id, name: w.name, cost: w.cost, dur: w.dur, power: w.power })),
      },
      robberies: ROBBERIES.map((r) => ({ id: r.id, name: r.name, cost: r.cost, reward: r.reward, duration: r.duration })),
      trafficking_routes: TRAFFICKING_ROUTES.map((t) => ({ id: t.id, name: t.name, payout: t.payout, duration: t.duration })),
      girlfriends: GIRLFRIENDS.map((g) => ({ id: g.id, name: g.name, courtCost: g.courtCost, dateCost: g.dateCost, giftCost: g.giftCost })),
      assassin_contracts: ASSASSIN_CONTACT.contracts.map((c) => ({ id: c.id, name: c.name, cost_dirty: c.cost_dirty, cost_clean: c.cost_clean })),
      studio: {
        booth_cost: STUDIO.booth_cost,
        acoustics_cost: STUDIO.upgrades.acoustics.cost,
        mixing_cost: STUDIO.upgrades.mixing.cost,
        tracks: MUSIC_TRACKS.map((m) => ({ id: m.id, name: m.name, cost: m.cost, payout: m.payout, dur: m.dur })),
      },
      heists: HEISTS.map((h) => ({ id: h.id, name: h.name, reward: h.reward, dur: h.dur })),
    },
  };
}

// Apply any stored overrides immediately on load
applyValueOverrides();
