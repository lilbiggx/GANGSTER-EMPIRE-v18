import { create } from "zustand";
import { toast } from "sonner";
import {
  DISTRICTS,
  HUSTLES,
  FRONTS,
  HEISTS,
  RIVALS,
  UPGRADES,
  BLACK_MARKET,
  COSMETICS,
  GEAR,
  STRAINS,
  FARM,
  ROLES,
  ARCHETYPES,
  ROLE_ARCH,
  STRENGTHS,
  FLAWS,
  HEIST_APPROACHES,
  HEIST_PREP,
  FALLBACK_NEWS,
  AVATAR_OPTIONS,
  SELL_RATE,
  WEAPON_MAX_LVL,
  CREW_STAT_MAX,
  PASS_TIERS,
  PASS_XP_PER_TIER,
  CREW_FRONT_TRAITS,
  MANSION_FACILITIES,
  BOSS_PERKS,
  HEIST_EVENTS,
  TIER2_CATEGORIES,
  BOUTIQUE_SUBCATEGORIES,
  BOUTIQUE_CATALOG,
  ALL_GEAR_ITEMS,
  CREW_BACKGROUNDS,
  DAILY_HEIST_BASE_LIMIT,
  ASSASSIN_CONTACT,
  CRAFTABLE_WEAPONS,
  WORKSHOP,
  ROBBERIES,
  TRAFFICKING_ROUTES,
  GIRLFRIENDS,
  MUSIC_TRACKS,
  STUDIO,
  CREW_TRAITS,
  METHLAB_PRODUCTS,
  METHLAB,
  MINERALS,
  MINING,
  BIG_MAN_PERKS,
  SMUGGLE_COMMODITIES,
  COMMODITY_MAP,
  TURF_ZONES,
  AREA_DON_ARCHETYPES,
  AREA_DON_TACTICS,
  AREA_DON_NAMES,
  CREW_RECRUIT_TIERS,
} from "../data/gameData";
import {
  Player,
  createPlayer,
  calcDerived,
  executeAction,
  tickPlayer,
} from "../engine/gameEngine";
import { setDevActionsEnabled, registerTestTools } from "../engine/gameEngine";
import { isDevMode } from "../lib/devMode";
setDevActionsEnabled(isDevMode());
// Test Tools handlers live in their own module so a VITE_ENABLE_TEST_TOOLS=false build never ships them.
export const testToolsReady: Promise<void> = isDevMode()
  ? import("../engine/testTools").then((m) => registerTestTools(m.runTestTool))
  : Promise.resolve();
import { big } from "../lib/fmt";
import { sendNotification, requestNotificationPermission } from "../lib/notifications";
import { applyValueOverrides } from "../lib/valueOverrides";
import { signPlayerSave, verifyPlayerSave, sanitizePlayerState } from "../lib/security";

// Apply any active Test Tools cost/value overrides immediately on boot
applyValueOverrides();

// ---- Test Tools clock (test builds only; constant real time in a release build) ----
// warp  = seconds added to real time (fast-forward), persisted so a reload keeps the skipped time.
// scale = timescale x1 / x10 / x100: every real second adds (scale - 1) extra seconds of warp.
// globalThis.__GE_WARP__ (seconds) is still honoured for the automated Playwright tests.
export const storage = {
  get(key: string): string | null {
    try {
      return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  set(key: string, val: string): void {
    try {
      if (typeof localStorage !== "undefined") localStorage.setItem(key, val);
    } catch {
      // ignore
    }
  },
  remove(key: string): void {
    try {
      if (typeof localStorage !== "undefined") localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

const TEST_CLOCK_KEY = "ge_test_clock";
export const testClock = { warp: 0, scale: 1 };
if (isDevMode()) {
  try { Object.assign(testClock, JSON.parse(storage.get(TEST_CLOCK_KEY) || "{}")); } catch { /* fresh */ }
}
export function saveTestClock() { if (isDevMode()) storage.set(TEST_CLOCK_KEY, JSON.stringify(testClock)); }
/** Game clock in seconds. */
export const gameClock = () => Date.now() / 1000 + (isDevMode() ? Number((globalThis as any).__GE_WARP__ || 0) + (Number(testClock.warp) || 0) : 0);

const SAVE_KEY = "uw_offline_player_v2";
const callbacks: Record<string, (res: any) => void> = {};
let tapBuf = 0;
let tapTimer: any = null;
let trustedPlayerJson: string | null = null;

const GAME_CONFIG = {
  districts: DISTRICTS,
  hustles: HUSTLES,
  fronts: FRONTS,
  heists: HEISTS,
  rivals: RIVALS,
  upgrades: UPGRADES,
  black_market: BLACK_MARKET,
  cosmetics: COSMETICS,
  gear: ALL_GEAR_ITEMS,
  strains: STRAINS,
  farm: FARM,
  roles: ROLES,
  archetypes: ARCHETYPES,
  role_arch: ROLE_ARCH,
  strengths: STRENGTHS,
  flaws: FLAWS,
  approaches: HEIST_APPROACHES,
  prep: HEIST_PREP,
  avatar_options: AVATAR_OPTIONS,
  sell_rate: SELL_RATE,
  weapon_slots: ["melee", "primary", "secondary"],
  weapon_max_lvl: WEAPON_MAX_LVL,
  crew_stat_max: CREW_STAT_MAX,
  crew_front_traits: CREW_FRONT_TRAITS,
  crew_backgrounds: CREW_BACKGROUNDS,
  crew_traits: CREW_TRAITS,
  daily_heist_base_limit: DAILY_HEIST_BASE_LIMIT,
  mansion_facilities: MANSION_FACILITIES,
  boss_perks: BOSS_PERKS,
  tier2_categories: TIER2_CATEGORIES,
  boutique_subcategories: BOUTIQUE_SUBCATEGORIES,
  boutique_catalog: BOUTIQUE_CATALOG,
  heist_events: HEIST_EVENTS,
  assassin_contact: ASSASSIN_CONTACT,
  craftableWeapons: CRAFTABLE_WEAPONS,
  workshop: WORKSHOP,
  robberies: ROBBERIES,
  trafficking_routes: TRAFFICKING_ROUTES,
  girlfriends: GIRLFRIENDS,
  music_tracks: MUSIC_TRACKS,
  studio: STUDIO,
  methlab_products: METHLAB_PRODUCTS,
  methlab: METHLAB,
  minerals: MINERALS,
  mining: MINING,
  big_man_perks: BIG_MAN_PERKS,
  commodities: SMUGGLE_COMMODITIES,
  commodity_map: COMMODITY_MAP,
  turf_zones: TURF_ZONES,
  area_don_archetypes: AREA_DON_ARCHETYPES,
  area_don_tactics: AREA_DON_TACTICS,
  area_don_names: AREA_DON_NAMES,
  recruit_tiers: CREW_RECRUIT_TIERS,
  pass: {
    tiers: PASS_TIERS,
    xp_per_tier: PASS_XP_PER_TIER,
    free: Array.from({ length: PASS_TIERS }).map((_, i) => {
      const t = i + 1;
      if (t % 5 === 0) return { timeskip: true };
      return { clean: 300 * t };
    }),
    prem: Array.from({ length: PASS_TIERS }).map((_, i) => {
      const t = i + 1;
      if (t === 10) return { cosmetic: "car_v8" };
      if (t === 20) return { cosmetic: "drip_gold" };
      if (t === 30) return { cosmetic: "decor_stool" };
      if (t % 3 === 0) return { timeskip: true };
      return { clean: 1000 * t };
    }),
  },
};

interface GameState {
  config: typeof GAME_CONFIG;
  player: Player | null;
  derived: any;
  offset: number;
  welcome: any;
  news: string[];
  loaded: boolean;
  noPlayer: boolean;
  queue: any[];
  syncing: boolean;
  online: boolean;
  ad: string | null;
  tab: string;
  more: string | null;
  lockerTarget: string;
  seenTabs: Record<string, number>;
  seenViews: Record<string, number>;
  seenTabCounts: Record<string, number>;
  markTabSeen: (tab: string, currentCount?: number) => void;
  markViewSeen: (viewKey: string) => void;
  now: () => number;
  setTab: (tab: string) => void;
  openMore: (more: string) => void;
  showAd: (kind: string) => void;
  closeAd: () => void;
  setLockerTarget: (target: string) => void;
  openLocker: (target: string) => void;
  dismissWelcome: () => void;
  load: () => Promise<void>;
  createOfflineBoss: (name?: string, district?: string, preset?: "newbie" | "mid" | "kingpin") => void;
  logout: () => void;
  apply: (res: any) => void;
  act: (type: string, payload?: any, opts?: { optimistic?: (p: any, state: any) => void; onResult?: (res: any) => void }) => string;
  tap: () => void;
  save: () => void;
}

export const useGame = create<GameState>((set, get) => ({
  config: GAME_CONFIG,
  player: null,
  derived: null,
  offset: 0,
  welcome: null,
  news: FALLBACK_NEWS,
  loaded: false,
  noPlayer: false,
  queue: [],
  syncing: false,
  online: true,
  ad: null,
  tab: storage.get("uw_tab") || "empire",
  more: null,
  lockerTarget: "boss",
  seenTabs: (() => { try { return JSON.parse(storage.get("uw_seen_tabs") || "{}"); } catch { return {}; } })(),
  seenViews: (() => { try { return JSON.parse(storage.get("uw_seen_views") || "{}"); } catch { return {}; } })(),
  seenTabCounts: (() => { try { return JSON.parse(storage.get("uw_seen_tab_counts") || "{}"); } catch { return {}; } })(),

  markTabSeen: (tab: string, currentCount = 0) => {
    const counts = { ...get().seenTabCounts, [tab]: currentCount };
    const tabs = { ...get().seenTabs, [tab]: Date.now() / 1000 };
    storage.set("uw_seen_tabs", JSON.stringify(tabs));
    storage.set("uw_seen_tab_counts", JSON.stringify(counts));
    set({ seenTabs: tabs, seenTabCounts: counts });
  },

  markViewSeen: (viewKey: string) => {
    const views = { ...get().seenViews, [viewKey]: Date.now() / 1000 };
    storage.set("uw_seen_views", JSON.stringify(views));
    set({ seenViews: views });
  },

  apply: (res: any) => {
    if (!res) return;
    set((st) => ({
      player: res.patch ? { ...st.player, ...res.patch } : st.player,
      derived: res.derived || st.derived,
    }));
    get().save();
  },

  now: () => gameClock() + get().offset,

  setTab: (tab) => {
    storage.set("uw_tab", tab);
    const d = get().derived;
    const b = d?.badges || {};
    const raw = b[tab] || 0;
    get().markTabSeen(tab, raw);
    get().markViewSeen("tab_" + tab);
    if (tab === "more") {
      get().markViewSeen("more");
    }
    set({ tab, more: null });
  },

  openMore: (more) => {
    storage.set("uw_tab", "more");
    get().markTabSeen("more");
    get().markViewSeen("more");
    if (more) {
      get().markViewSeen("more_" + more);
    }
    set({ tab: "more", more });
  },

  showAd: (kind) => set({ ad: kind }),
  closeAd: () => set({ ad: null }),
  setLockerTarget: (lockerTarget) => set({ lockerTarget }),
  openLocker: (lockerTarget) => {
    storage.set("uw_tab", "more");
    get().markTabSeen("more");
    get().markViewSeen("more");
    get().markViewSeen("more_locker");
    set({ tab: "more", more: "locker", lockerTarget });
  },
  dismissWelcome: () => set({ welcome: null }),

  save: () => {
    const { player } = get();
    if (player) {
      try {
        signPlayerSave(player);
        const serialized = JSON.stringify(player);
        trustedPlayerJson = serialized;
        storage.set(SAVE_KEY, serialized);
      } catch (e) {
        console.error("Save error:", e);
      }
    }
  },

  async load() {
    try {
      applyValueOverrides();
      // Request notification permissions on first load
      requestNotificationPermission();

      const saved = storage.get(SAVE_KEY);
      if (!saved) {
        set({
          config: GAME_CONFIG,
          player: null,
          derived: null,
          loaded: true,
          noPlayer: true,
        });
        return;
      }

      let p: Player = JSON.parse(saved);
      if (!verifyPlayerSave(p)) {
        if (trustedPlayerJson) {
          p = JSON.parse(trustedPlayerJson);
          toast.error("Save tamper detected and blocked. Restored verified syndicate state.");
        } else {
          storage.remove(SAVE_KEY);
          toast.error("Corrupted or tampered save blocked.");
          set({ config: GAME_CONFIG, player: null, derived: null, loaded: true, noPlayer: true });
          return;
        }
      }
      sanitizePlayerState(p);
      const now = gameClock();
      tickPlayer(p, now);
      signPlayerSave(p);
      const d = calcDerived(p, now);

      set({
        config: GAME_CONFIG,
        player: p,
        derived: d,
        loaded: true,
        noPlayer: false,
      });
      get().save();
    } catch (err) {
      console.error("Error loading offline player, clearing invalid save state:", err);
      storage.remove(SAVE_KEY);
      set({ config: GAME_CONFIG, player: null, derived: null, loaded: true, noPlayer: true });
    }
  },

  createOfflineBoss(name = "Kojo Bullet", district = "dockside", preset = "newbie") {
    if (!isDevMode()) preset = "newbie"; // loaded test presets are test-build only
    applyValueOverrides();
    const p = createPlayer(`boss_${Date.now()}`, name, district, preset);
    signPlayerSave(p);
    const now = gameClock();
    const d = calcDerived(p, now);
    const serialized = JSON.stringify(p);
    trustedPlayerJson = serialized;
    set({
      config: GAME_CONFIG,
      player: p,
      derived: d,
      loaded: true,
      noPlayer: false,
      tab: "empire",
      more: null,
    });
    storage.set(SAVE_KEY, serialized);
    toast.success(`Akwaaba, Boss ${p.name}! Your offline empire is live.`);
  },

  logout() {
    trustedPlayerJson = null;
    storage.remove(SAVE_KEY);
    set({ player: null, derived: null, noPlayer: true });
    toast.info("Logged out from street command.");
  },

  act(type, payload = {}, { optimistic, onResult } = {}) {
    const actionId = Math.random().toString(36).slice(2);
    const state = get();
    if (!state.player) return actionId;

    if (optimistic) {
      const clone = JSON.parse(JSON.stringify(state.player));
      optimistic(clone, state);
      set({ player: clone, derived: calcDerived(clone, gameClock()) });
    }

    if (onResult) callbacks[actionId] = onResult;

    // Execute immediately in engine
    const now = gameClock();
    const playerClone = JSON.parse(JSON.stringify(get().player));
    const outcome = executeAction(playerClone, type, payload, now);

    if (outcome.ok) {
      const d = calcDerived(playerClone, now);
      set({ player: playerClone, derived: d });
      get().save();
      if (callbacks[actionId]) {
        callbacks[actionId](outcome.result);
        delete callbacks[actionId];
      }
    } else {
      toast.error(outcome.error || "Action failed");
      // Revert optimistic if failed
      get().load();
    }

    return actionId;
  },

  tap() {
    const { player, derived } = get();
    if (!player || !derived) return;
    tapBuf += 1;
    const added = big(derived.tap_value);
    set({
      player: {
        ...player,
        dirty: (big(player.dirty) + added).toString(),
        lifetime: (big(player.lifetime) + added).toString(),
      },
    });

    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => {
      const count = tapBuf;
      tapBuf = 0;
      get().act("tap", { count });
    }, 600);
  },
}));

let lastSeenLogTime = 0;
let lastSeenRaid = false;
const notifiedArrivals = new Set<string>();
const notifiedWorkshop = new Set<number>();
const notifiedConstruction = new Set<number>();

// Background tick every 1 second for timers, heat settling, plot income & idle accrual.
// v9: works on a copy and publishes a new player object so plot/cash UIs re-render each second.
setInterval(() => {
  if (typeof document !== "undefined" && document.hidden && !(isDevMode() && testClock.scale > 1)) {
    return;
  }
  if (isDevMode() && testClock.scale > 1) { testClock.warp += testClock.scale - 1; saveTestClock(); }
  const state = useGame.getState();
  if (state.player) {
    const now = gameClock();
    const p = { ...state.player };
    sanitizePlayerState(p);
    tickPlayer(p, now);
    const d = calcDerived(p, now);

    // Notification check for attack / raid alert
    if (p.raid && !lastSeenRaid) {
      const msg = "🚨 UNDER ATTACK! Rival syndicate raid underway on your compound!";
      toast.error(msg, { duration: 6000 });
      sendNotification("GANGSTER EMPIRE", { body: msg, tag: "raid" });
      lastSeenRaid = true;
    } else if (!p.raid) {
      lastSeenRaid = false;
    }

    // Notification check for new logs (attack, raid, police ambush, crisis events)
    if (p.log && p.log.length > 0) {
      if (lastSeenLogTime === 0) {
        lastSeenLogTime = p.log[0].t;
      } else {
        const newLogs = p.log.filter((l) => l.t > lastSeenLogTime);
        if (newLogs.length > 0) {
          lastSeenLogTime = newLogs[0].t;
          for (const l of newLogs.slice(0, 3)) {
            const upper = l.msg.toUpperCase();
            if (upper.includes("RAID") || upper.includes("ATTACK") || upper.includes("AMBUSH") || upper.includes("POLICE")) {
              toast.error(l.msg, { duration: 6000 });
              sendNotification("CRITICAL ALERT", { body: l.msg, tag: "log_alert" });
            } else if (upper.includes("EVENT") || upper.includes("CRISIS") || upper.includes("EXPRESS DROP") || upper.includes("DELIVER")) {
              toast.info(l.msg, { duration: 5000 });
              sendNotification("SYNDICATE UPDATE", { body: l.msg, tag: "log_info" });
            }
          }
        }
      }
    }

    // Notification check for completed express deliveries
    if (p.pending_deliveries) {
      for (const del of p.pending_deliveries) {
        if (now >= del.arrive_at && !notifiedArrivals.has(del.id)) {
          notifiedArrivals.add(del.id);
          const msg = `📦 Express Drop: Courier has arrived with ${del.item_name}! Claim at Market tab.`;
          toast.success(msg, { duration: 6000 });
          sendNotification("DELIVERY ARRIVED", { body: msg, tag: "delivery" });
        }
      }
    }

    // Notification check for Workshop completion
    if (p.workshop?.benches) {
      p.workshop.benches.forEach((b, i) => {
        if (b.weaponId && now >= b.end && !notifiedWorkshop.has(i)) {
          notifiedWorkshop.add(i);
          const w = CRAFTABLE_WEAPONS.find(x => x.id === b.weaponId);
          const msg = `🔨 Workshop: Forging of ${w?.name || 'Weapon'} complete! Claim at More -> Workshop.`;
          toast.success(msg, { duration: 6000 });
          sendNotification("FORGING COMPLETE", { body: msg, tag: "workshop" });
        } else if (!b.weaponId || now < b.end) {
          notifiedWorkshop.delete(i);
        }
      });
    }

    // Notification check for Construction completion
    if (p.player_plots) {
      p.player_plots.forEach((pl) => {
        if (pl.building && now >= pl.building.end && !notifiedConstruction.has(pl.plotID)) {
          notifiedConstruction.add(pl.plotID);
          const h = HUSTLES.find(x => x.id === pl.building?.hid);
          const msg = `🏗️ Construction: ${h?.name || 'Building'} operational on Land ${pl.plotID + 1}!`;
          toast.success(msg, { duration: 6000 });
          sendNotification("BUILDING COMPLETE", { body: msg, tag: "construction" });
        } else if (!pl.building) {
          notifiedConstruction.delete(pl.plotID);
        }
      });
    }

    useGame.setState({ player: p, derived: d });
  }
}, 2000);

// Auto-save every 10 seconds
setInterval(() => {
  if (typeof document !== "undefined" && document.hidden) return;
  useGame.getState().save();
}, 10000);

// Block external localStorage tampering while running
if (typeof window !== "undefined") {
  window.addEventListener("storage", (ev) => {
    if (ev.key === SAVE_KEY && !isDevMode() && trustedPlayerJson && ev.newValue !== trustedPlayerJson) {
      storage.set(SAVE_KEY, trustedPlayerJson);
    }
  });
}
