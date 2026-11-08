// v9 TEST TOOLS: every cheat the in-game Test Tools panel can run, in one place.
// Only loaded by the store when the build flag VITE_ENABLE_TEST_TOOLS is true (default for the Render test build).
// With VITE_ENABLE_TEST_TOOLS=false this module is never imported, so none of it ships in a public release.
// All of it runs through executeAction(p, "test_tool", { op, ... }), inside a ledger frame tagged "TEST", so any
// cash change made here shows on the 30-day statement under TEST and the statement still reconciles.
import {
  type Player, type CrewMember, addCash, recordCash, ensurePlots, injureCrew, makeRivalEvent, logRivalEvent, xpNeeded,
  genCrew, migratePlayer, uid, makeArchCrisis, ledgerSummary, RIVAL_EVENT_TYPES, archRivalId, makeBattle, calcPower, triggerArrest,
} from "./gameEngine";
import { HUSTLE_MAP, FRONT_MAP, MANSION_FACILITIES, HEISTS, ARCHETYPES, RIVALS, RIVAL_MAP, HEIST_EVENTS, TRAFFICKING_ROUTES } from "../data/gameData";
import { LUXURY_MAP } from "../data/luxury";

const num = (v: any, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const clampI = (v: any, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.floor(num(v))));
const log = (p: Player, now: number, msg: string) => p.log.unshift({ t: now, msg: `[TEST] ${msg}`, kind: "info" });

function cashTo(p: Player, now: number, cur: "dirty" | "clean", target: bigint, why: string) {
  const delta = target - BigInt(p[cur] || "0");
  if (delta === 0n) return 0;
  addCash(p, cur, delta);
  recordCash(p, now, Number(delta), cur, "TEST", why);
  return Number(delta);
}

export const TEST_OPS = [
  "economy", "land", "hustle", "front", "facility", "cooldown", "finish_timers", "rival_event", "set_hate", "force_fight",
  "crisis", "fight_now", "raid_now", "arrest", "injure", "heal", "add_crew", "edit_crew", "crew_xp", "grant_item", "refresh_boutique",
  "reset_heist_limit", "migrate", "ledger", "heist_event", "alliance_raid", "assassin_hit", "pass_xp",
] as const;

export function runTestTool(p: Player, op: string, a: any, now: number): any {
  switch (op) {
    // ---------- Economy: set or add clean / dirty / respect / heat / XP / level / perk points ----------
    case "economy": {
      const mode = a.mode === "add" ? "add" : "set";
      const out: any = {};
      (["dirty", "clean"] as const).forEach((cur) => {
        if (a[cur] === undefined || a[cur] === "") return;
        let v: bigint;
        try { v = BigInt(String(a[cur]).replace(/[^0-9-]/g, "") || "0"); } catch { throw new Error(`Bad ${cur} amount`); }
        const target = mode === "add" ? BigInt(p[cur]) + v : v;
        out[cur] = cashTo(p, now, cur, target < 0n ? 0n : target, `Test tools: ${mode} ${cur} cash`);
      });
      if (a.respect !== undefined && a.respect !== "") { p.prestige = p.prestige || { count: 0, respect: 0 }; p.prestige.respect = Math.max(0, Math.floor(mode === "add" ? p.prestige.respect + num(a.respect) : num(a.respect))); }
      if (a.heat !== undefined && a.heat !== "") p.heat = clampI(mode === "add" ? p.heat + num(a.heat) : a.heat, 0, 100);
      if (a.level !== undefined && a.level !== "") { p.level = clampI(mode === "add" ? p.level + num(a.level) : a.level, 1, 999); p.xp = 0; }
      if (a.xp !== undefined && a.xp !== "") {
        p.xp = Math.max(0, Math.floor(mode === "add" ? p.xp + num(a.xp) : num(a.xp)));
        while (p.xp >= xpNeeded(p.level)) { p.xp -= xpNeeded(p.level); p.level += 1; p.skill_points = (p.skill_points || 0) + 1; }
      }
      if (a.points !== undefined && a.points !== "") p.skill_points = Math.max(0, Math.floor(mode === "add" ? (p.skill_points || 0) + num(a.points) : num(a.points)));
      log(p, now, `Economy ${mode}: ${Object.keys(a).filter((k) => !["op", "mode"].includes(k) && a[k] !== "" && a[k] !== undefined).join(", ")}`);
      return { dirty: p.dirty, clean: p.clean, respect: p.prestige.respect, heat: p.heat, level: p.level, xp: p.xp, points: p.skill_points, ...out };
    }

    // ---------- Assets ----------
    case "land": {
      const plots = ensurePlots(p);
      const ids = a.idx === "all" ? plots.map((x) => x.plotID) : [clampI(a.idx, 0, plots.length - 1)];
      ids.forEach((i) => {
        const pl = plots[i];
        if (a.action === "unlock") pl.isUnlocked = true;
        else if (a.action === "lock" || a.action === "reset") {
          if (pl.hustleID) { delete p.hustles[pl.hustleID]; delete p.hustle_condition?.[pl.hustleID]; }
          pl.hustleID = null;
          pl.isUnlocked = false;
        } else if (a.action === "clear") {
          if (pl.hustleID) { delete p.hustles[pl.hustleID]; delete p.hustle_condition?.[pl.hustleID]; }
          pl.hustleID = null;
        } else throw new Error("Unknown land action");
      });
      if (a.action === "reset" && a.idx === "all") (p as any).first_business_claimed = false;
      ensurePlots(p);
      log(p, now, `Land ${a.idx === "all" ? "all plots" : `plot ${ids[0] + 1}`}: ${a.action}`);
      return { plots: p.player_plots };
    }
    case "hustle": {
      const h = HUSTLE_MAP[a.id];
      if (!h) throw new Error("Unknown hustle");
      const lvl = clampI(a.lvl, 0, 25);
      if (lvl === 0) {
        delete p.hustles[a.id];
        (p.player_plots || []).forEach((pl) => { if (pl.hustleID === a.id) pl.hustleID = null; });
      } else {
        if (!p.hustles[a.id]) {
          const plots = ensurePlots(p);
          const spot = plots.find((x) => x.isUnlocked && !x.hustleID) || plots.find((x) => !x.isUnlocked);
          if (!spot) throw new Error("All 8 land plots are full: clear one first");
          spot.isUnlocked = true; spot.hustleID = a.id;
          p.hustles[a.id] = { lvl, ts: now, bank: 0 } as any;
          p.hustle_condition = p.hustle_condition || {}; p.hustle_condition[a.id] = 100;
          (p as any).first_business_claimed = true;
        } else (p.hustles[a.id] as any).lvl = lvl;
      }
      if (a.condition !== undefined && a.condition !== "") { p.hustle_condition = p.hustle_condition || {}; p.hustle_condition[a.id] = clampI(a.condition, 0, 100); }
      ensurePlots(p);
      log(p, now, `${h.name} set to level ${lvl}`);
      return { id: a.id, lvl };
    }
    case "front": {
      const f = FRONT_MAP[a.id];
      if (!f) throw new Error("Unknown front");
      const lvl = clampI(a.lvl, 0, 50);
      if (lvl === 0) { delete p.fronts[a.id]; delete p.front_condition?.[a.id]; }
      else {
        if (!p.fronts[a.id]) { (p as any).front_income_ts = (p as any).front_income_ts || {}; (p as any).front_income_ts[a.id] = now; p.front_condition = p.front_condition || {}; p.front_condition[a.id] = 100; }
        p.fronts[a.id] = lvl;
      }
      if (a.condition !== undefined && a.condition !== "") { p.front_condition = p.front_condition || {}; p.front_condition[a.id] = clampI(a.condition, 0, 100); }
      log(p, now, `${f.name} set to level ${lvl}`);
      return { id: a.id, lvl };
    }
    case "facility": {
      const fac = MANSION_FACILITIES[a.id];
      if (!fac) throw new Error("Unknown facility");
      const lvl = clampI(a.lvl, 0, fac.max);
      p.facilities = p.facilities || {}; p.facility_condition = p.facility_condition || {};
      if (lvl === 0) delete p.facilities[a.id]; else { p.facilities[a.id] = lvl; if (p.facility_condition[a.id] === undefined) p.facility_condition[a.id] = 100; }
      if (a.condition !== undefined && a.condition !== "") p.facility_condition[a.id] = clampI(a.condition, 0, 100);
      log(p, now, `${fac.name} set to level ${lvl}`);
      return { id: a.id, lvl };
    }

    // ---------- Cooldowns ----------
    case "cooldown": {
      // kind: all | launder | heist (global) | heist_by (per heist id) | front (per front id) | rival (per rival) | pvp | arrest
      const cd: any = (p.cooldowns = p.cooldowns || { launder_until: 0, heist_until: 0, front: {} });
      cd.front = cd.front || {}; cd.heist_by = cd.heist_by || {}; cd.heist_set_at = cd.heist_set_at || {};
      const secs = Math.max(0, Math.floor(num(a.seconds)));
      const until = secs > 0 ? now + secs : 0;
      const k = String(a.kind || "all");
      const setMap = (m: Record<string, number>, key: string | undefined, all: string[], stamp?: Record<string, number>) => {
        (key ? [key] : all).forEach((id) => { if (until) { m[id] = until; if (stamp) stamp[id] = now; } else { delete m[id]; if (stamp) delete stamp[id]; } });
      };
      if (k === "all") {
        if (secs) throw new Error("Pick a single cooldown to set a time");
        cd.launder_until = 0; cd.heist_until = 0; cd.front = {}; cd.heist_by = {}; cd.heist_set_at = {};
        p.rival_cd = {}; p.pvp_cd = 0;
      } else if (k === "launder") cd.launder_until = until;
      else if (k === "heist") cd.heist_until = until;
      else if (k === "heist_by") setMap(cd.heist_by, a.key || undefined, HEISTS.map((h) => h.id), cd.heist_set_at);
      else if (k === "front") setMap(cd.front, a.key || undefined, Object.keys(p.fronts || {}));
      else if (k === "rival") { p.rival_cd = p.rival_cd || {}; setMap(p.rival_cd, a.key || undefined, RIVALS.map((r) => r.id)); }
      else if (k === "pvp") p.pvp_cd = until;
      else if (k === "arrest") { if (until) { triggerArrest(p, now); p.arrested_until = until; } else p.arrested_until = 0; }
      else throw new Error("Unknown cooldown");
      log(p, now, secs ? `Cooldown ${k}${a.key ? `:${a.key}` : ""} set to ${secs}s` : `Cleared cooldown ${k}${a.key ? `:${a.key}` : ""}`);
      return { cooldowns: p.cooldowns, until };
    }
    case "finish_timers": {
      p.batches.forEach((b: any) => (b.end = now - 1));
      p.heists.forEach((h: any) => (h.end = now - 1));
      p.farm?.plots?.forEach((pl: any) => { if (pl.strain) pl.end = now - 1; });
      log(p, now, "Finished laundering batches, running heists and farm grows");
      return { ready: true };
    }
    case "reset_heist_limit": {
      p.last_heist_day = "";
      if (p.heist_day) { p.heist_day.count = 0; p.heist_day.ad_extra = 0; }
      log(p, now, "Daily heist limit reset");
      return { reset: true };
    }

    // ---------- Rivals & events ----------
    case "rival_event": {
      if (a.type && a.type !== "random" && !RIVAL_EVENT_TYPES[a.type]) throw new Error("Unknown event type");
      if (p.archrival_event && !a.replace) throw new Error("A crisis is already open (tick 'replace' to swap it)");
      let rival = a.rival && a.rival !== "random" ? a.rival : undefined;
      if (a.arch) {
        // Arch rival popup: make sure someone is the arch rival (top grudge >= 50) and send the event from them
        const top = archRivalId(p) || rival || RIVALS[0].id;
        p.grudges[top] = Math.max(p.grudges[top] || 0, 75);
        rival = archRivalId(p) || top;
      }
      const ev = makeRivalEvent(p, now, Math.random, a.type && a.type !== "random" ? a.type : undefined, rival);
      p.archrival_event = ev;
      logRivalEvent(p, ev, now, {});
      return { event: ev };
    }
    case "crisis": {
      // legacy arch-rival crisis popups: territory war / crew kidnap / convoy ambush
      const t = ["rival_war", "kidnap", "ambush"].includes(a.type) ? a.type : (["rival_war", "kidnap", "ambush"] as const)[Math.floor(Math.random() * 3)];
      if (p.archrival_event && !a.replace) throw new Error("A crisis is already open (tick 'replace' to swap it)");
      p.archrival_event = null;
      const ev = makeArchCrisis(p, now, t as any);
      if (!ev || ev.type !== t) throw new Error(t === "kidnap" ? "Kidnap needs a fit crew member" : "Crisis failed");
      return { event: ev };
    }
    case "set_hate": {
      const v = clampI(a.value, 0, 100);
      (a.rival && a.rival !== "all" ? [a.rival] : RIVALS.map((r) => r.id)).forEach((id) => { if (!RIVALS.find((r) => r.id === id)) throw new Error("Unknown rival"); p.grudges[id] = v; });
      log(p, now, `Gang hate for ${a.rival && a.rival !== "all" ? a.rival : "all rivals"} set to ${v}`);
      return { grudges: p.grudges, arch: archRivalId(p) };
    }
    case "force_fight": {
      const m = a.mode === "win" || a.mode === "lose" ? a.mode : null;
      if (m) (p as any).test_force_fight = m; else delete (p as any).test_force_fight;
      log(p, now, m ? `Every fight is forced to ${m.toUpperCase()}` : "Fight outcomes back to normal odds");
      return { force: m };
    }
    case "raid_now": {
      const r = RIVALS.find((x) => x.id === a.rival) || RIVALS[Math.floor(Math.random() * RIVALS.length)];
      p.raid = { rival: r.id, start: now, resolve_at: now + Math.max(5, Math.floor(num(a.seconds, 45))), attack: Math.floor(calcPower(p) * num(a.mult, 0.95)) + 15, fortify: 0, taunt: `${r.boss}: "Test raid incoming."` } as any;
      log(p, now, `Raid from ${r.name} incoming`);
      return { raid: p.raid };
    }
    case "alliance_raid": {
      // kept from the legacy cheat list: a bloc (rival + ally) raid at 1.3x your power
      const r = RIVALS.find((x) => x.id === a.rival) || RIVALS[Math.floor(Math.random() * RIVALS.length)];
      const ally = RIVAL_MAP[r.ally_id] || RIVALS[0];
      p.raid = { rival: ally.id, start: now, resolve_at: now + Math.max(5, Math.floor(num(a.seconds, 45))), attack: Math.floor(calcPower(p) * 1.3) + 25, fortify: 0, taunt: `[ALLIANCE RAID] ${ally.boss} & ${r.boss}: "You messed with the ${r.bloc}!"` } as any;
      log(p, now, `Alliance raid from ${ally.name} & ${r.name} incoming`);
      return { raid: p.raid };
    }
    case "heist_event": {
      const h = (p.heists || [])[0] as any;
      if (!h) throw new Error("No heist running. Start a heist first");
      const ev = HEIST_EVENTS.find((e) => e.id === a.id) || HEIST_EVENTS[Math.floor(Math.random() * HEIST_EVENTS.length)];
      h.events = h.events || [];
      h.events.unshift({ uid: uid(), event_id: ev.id, trigger_at: now, expires_at: now + 120, resolved: false });
      log(p, now, `Heist crisis: ${ev.title}`);
      return { event: ev.title };
    }
    case "assassin_hit": {
      const rid = RIVALS.find((x) => x.id === a.rival)?.id || RIVALS[0].id;
      (p as any).assassin_hits = (p as any).assassin_hits || {};
      (p as any).assassin_hits[rid] = { contract_type: "boss_hit", power_cut: 0.6, until: now + 3600 };
      log(p, now, `Boss hit contract on ${rid} for 1 hour`);
      return { rival: rid };
    }
    case "pass_xp": {
      (p as any).pass = (p as any).pass || { xp: 0 };
      (p as any).pass.xp = Math.max(0, num((p as any).pass.xp) + Math.floor(num(a.xp, 500)));
      return { pass_xp: (p as any).pass.xp };
    }
    case "fight_now": {
      // Plays a fight animation straight away (no economic effect) to check the 3D fight scene.
      const r = RIVALS.find((x) => x.id === a.rival) || RIVALS[0];
      const won = a.mode === "lose" ? false : a.mode === "win" ? true : Math.random() < 0.5;
      const pow = calcPower(p);
      const rep = makeBattle(p, now, { kind: "hit", title: `Test fight vs ${r.name}`, won, us: { power: pow }, them: { name: r.name, boss: r.boss, power: Math.floor(pow * (won ? 0.8 : 1.3)) }, loot: 0, lost: 0, heat: 0, damage: {}, notes: ["Test tools fight (no cash, loot or injuries)"], no_injury: true } as any);
      return { battle: rep };
    }
    case "arrest": { triggerArrest(p, now); return { until: p.arrested_until }; }

    // ---------- Crew & medical ----------
    case "injure": {
      const sev = clampI(a.sev || 2, 1, 3);
      const list = a.cid === "all" ? p.crew.filter((c) => !c.merc) : [p.crew.find((x) => x.id === a.cid) || p.crew.find((x) => !x.merc && !x.injury)].filter(Boolean) as CrewMember[];
      if (!list.length) throw new Error("No crew to injure");
      list.forEach((c) => { c.injury = null; injureCrew(p, c, sev, "a test", now); });
      delete (p as any)._inj;
      return { injured: list.map((c) => c.id), sev };
    }
    case "heal": {
      const list = a.cid === "all" || !a.cid ? p.crew.filter((c) => c.injury) : p.crew.filter((c) => c.id === a.cid && c.injury);
      list.forEach((c) => { c.injury = null; if (c.status === "kidnapped") c.status = "active"; });
      log(p, now, `Healed ${list.length} crew`);
      return { healed: list.map((c) => c.id) };
    }
    case "add_crew": {
      const cap = 9 + Math.min(5, p.upgrades?.quarters || 0);
      const currentCount = p.crew.filter((c) => !c.merc).length;
      const allowed = Math.max(0, cap - currentCount);
      if (allowed <= 0) throw new Error(`Crew team limit reached (${cap} max). Cannot exceed team limit.`);
      const n = clampI(a.count || 1, 1, allowed);
      const lvl = clampI(a.lvl || 1, 1, 50);
      const arch = a.arch && ARCHETYPES[a.arch] ? a.arch : undefined;
      const added: string[] = [];
      for (let i = 0; i < n; i++) { const c = genCrew(arch, lvl); p.crew.push(c); added.push(c.name); }
      log(p, now, `Added ${n} crew (Lvl ${lvl}${arch ? ` ${arch}` : ""}): ${added.join(", ")}`);
      return { added };
    }
    case "crew_xp": {
      const xp = Math.max(0, Math.floor(num(a.xp, 250)));
      p.crew.forEach((c) => {
        c.xp += xp; c.morale = Math.min(100, (c.morale || 85) + 30);
        while (c.xp >= 30 * c.lvl) { c.xp -= 30 * c.lvl; c.lvl += 1; }
      });
      log(p, now, `+${xp} XP and +30 morale to all crew`);
      return { xp };
    }
    case "edit_crew": {
      const c = p.crew.find(x => x.id === a.cid);
      if (!c) throw new Error("Crew member not found");
      if (a.stats) c.stats = { ...c.stats, ...a.stats };
      if (a.morale !== undefined) c.morale = clampI(a.morale, 0, 100);
      if (a.assign !== undefined) c.assign = a.assign === "null" ? null : a.assign;
      if (a.lvl !== undefined) c.lvl = clampI(a.lvl, 1, 99);
      if (a.xp !== undefined) c.xp = Math.max(0, num(a.xp));
      log(p, now, `Edited crew ${c.name}`);
      return { id: c.id, ...c };
    }

    // ---------- Boutique ----------
    case "grant_item": {
      const it = LUXURY_MAP[a.id];
      if (!it) throw new Error("Unknown boutique item");
      const lux = ((p as any).luxury = (p as any).luxury || {});
      if (a.remove) delete lux[a.id]; else lux[a.id] = now;
      log(p, now, `${a.remove ? "Removed" : "Granted"} ${it.name}`);
      return { id: a.id, owned: !a.remove };
    }
    case "refresh_boutique": {
      (p as any).test_lux_shift = (Number((p as any).test_lux_shift) || 0) + 1;
      p.store.offset = (p.store.offset || 0) + 1;
      p.store.bought = [];
      log(p, now, "Boutique stock, limited rotation and daily deal refreshed");
      return { shift: (p as any).test_lux_shift };
    }

    // ---------- Save ----------
    case "migrate": {
      // Run the save migration on the current (e.g. just-imported old) save. Refunds / payouts are booked as TEST.
      migratePlayer(p, now);
      return { migrated: true };
    }
    case "ledger": {
      const s = ledgerSummary(p, now);
      return { summary: s, reconciled: s.opening_dirty !== undefined };
    }
    default:
      throw new Error(`Unknown test tool: ${op}`);
  }
}
