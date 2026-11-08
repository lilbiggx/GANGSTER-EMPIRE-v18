// v9: animated fight / raid playback. Driven by the engine's real battle report (p.last_battle),
// written by resolveRaid, hit_rival, the archrival ambush/rescue fights and Turf War.
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Swords, Shield, Skull, Flame, Coins, Wrench, SkipForward, X, Zap, Car, Cpu, Ghost, Dumbbell, Trophy, TrendingUp } from "lucide-react";
import { useGame } from "../../store/game";
import { cedi } from "../../lib/fmt";
import { Portrait } from "./v9";
import { resolveGear } from "../../lib/gear";

const FightScene = lazy(() => import("./FightScene"));
const MOVE = { jab: "jab", punch: "haymaker", kick: "kick", combo: "3-hit combo" };
const DEF = { hit: "lands it", block: "is blocked", dodge: "is dodged" };
export function roundMs(r) { return r.move === "combo" ? 1500 : r.move === "kick" ? 1150 : 1050; }
/** Round-driven timeline from the engine's real fight rounds. Falls back to buildBeats for old saves. */
export function buildSteps(b) {
  const rounds = Array.isArray(b?.rounds) ? b.rounds : [];
  if (!rounds.length) return buildBeats(b);
  const steps = [{ id: "approach", phase: "approach", ms: 900, us: 100, them: 100, text: `${b.us.name} squares up to ${b.them.boss || b.them.name}` }];
  rounds.forEach((r, i) => {
    const who = r.a === "us" ? (r.by || b.us.name) : (r.by || b.them.boss || b.them.name);
    steps.push({
      id: `round_${i + 1}`, phase: "round", r, round: i + 1, ms: roundMs(r), us: r.us, them: r.them,
      hitUs: r.a === "them" && r.def === "hit", hitThem: r.a === "us" && r.def === "hit",
      text: `R${i + 1} · ${who}'s ${MOVE[r.move] || r.move} ${DEF[r.def] || ""}${r.dmg ? ` (−${r.dmg})` : ""}${r.kd ? " · KNOCKDOWN" : ""}${r.ko ? " · KO!" : ""}`,
    });
  });
  const last = rounds[rounds.length - 1];
  steps.push({ id: "ko", phase: "end", ms: 2500, us: last.us, them: last.them, winner: b.won ? "us" : "them", hitUs: !b.won, hitThem: b.won,
    text: b.won ? `KO! ${b.them.boss || b.them.name} hits the floor` : `KO! ${b.us.name} goes down` });
  steps.push({ id: "results", phase: "results", ms: 0, us: last.us, them: last.them, winner: b.won ? "us" : "them", text: "" });
  return steps;
}
function rivalLook(name = "") {
  let h = 0; for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const pick = (a, k) => a[(h >>> k) % a.length];
  return {
    gender: "male", skin: pick(["#5c3a21", "#7a4a2a", "#3d2817", "#8d5524"], 1), build: pick(["brute", "muscular", "heavy"], 3), height: pick(["average", "tall"], 5),
    face: pick(["square", "heavy_jaw", "round"], 7), hair: pick(["bald", "cornrows", "spiky", "dreads"], 9), hair_color: "#111111",
    outfit: { top_style: pick(["hoodie", "jacket", "tee"], 11), top: pick(["#7f1d1d", "#991b1b", "#450a0a"], 13), pattern: pick(["plain", "camo", "stripes"], 15), bottom_style: "pants", bottom: "#1f1f1f", shoes: "#111111" },
  };
}
function webglOk() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; }
}
const ARCH = {
  enforcer: { icon: Dumbbell, verb: "holds the line and slugs it out" },
  hacker: { icon: Cpu, verb: "jams their radios and cameras" },
  driver: { icon: Car, verb: "flanks them in the getaway car" },
  infiltrator: { icon: Ghost, verb: "slips behind their lines" },
};
const KIND = { raid: { icon: Shield, verb: "Raid on your compound" }, hit: { icon: Swords, verb: "Hit on a rival corner" }, turf: { icon: Swords, verb: "Turf war" }, ambush: { icon: Zap, verb: "Ambush" }, rescue: { icon: Swords, verb: "Rescue raid" } };

/** Build the beat timeline from the report. Bars end where the real powers say they should. */
export function buildBeats(b) {
  const us = Math.max(1, b.us.power), them = Math.max(1, b.them.power);
  const ratio = Math.min(us, them) / Math.max(us, them);
  const winnerLeft = Math.max(12, Math.min(92, Math.round(100 * (1 - 0.75 * ratio))));
  const usEnd = b.won ? winnerLeft : 0, themEnd = b.won ? 0 : winnerLeft;
  const crew = (b.us.crew || []).slice(0, 3);
  const steps = 2 + crew.length; // clash + crew actions + finishing blow
  const beats = [{ id: "approach", ms: 1100, us: 100, them: 100, text: `${b.us.name} rolls up on ${b.them.boss || b.them.name}` }];
  for (let i = 1; i <= steps; i++) {
    const f = i / steps;
    const isClash = i === 1, isLast = i === steps;
    const c = !isClash && !isLast ? crew[i - 2] : null;
    beats.push({
      id: isClash ? "clash" : isLast ? "outcome" : `crew_${c?.id || i}`,
      ms: isClash ? 1300 : isLast ? 1300 : 1000,
      us: Math.round(100 - (100 - usEnd) * f),
      them: Math.round(100 - (100 - themEnd) * f),
      crew: c,
      hitUs: isClash || (isLast && !b.won) || (!!c && i % 2 === 1),
      hitThem: isClash || (isLast && b.won) || !!c,
      text: isClash ? `Clash! Power ${us.toLocaleString()} vs ${them.toLocaleString()}`
        : isLast ? (b.won ? `${b.them.name} breaks and runs!` : `${b.them.name} overpowers your crew!`)
        : `${c?.name || 'Crew'} ${(ARCH[c?.arch || 'enforcer'] || ARCH.enforcer).verb}`,
    });
  }
  beats.push({ id: "results", ms: 0, us: usEnd, them: themEnd, text: "" });
  return beats;
}

function Bar({ pct, color, testid }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800" data-testid={testid} data-pct={pct}>
      <div className={`bp-bar h-full ${color}`} style={{ width: `${Math.max(0, pct)}%` }} />
    </div>
  );
}

const KF = {
  inL: [{ opacity: 0, transform: "translateX(-60%)" }, { opacity: 1, transform: "none" }],
  inR: [{ opacity: 0, transform: "translateX(60%)" }, { opacity: 1, transform: "none" }],
  lungeL: [{ transform: "none" }, { transform: "translateX(18%) rotate(4deg)", offset: 0.4 }, { transform: "none" }],
  lungeR: [{ transform: "none" }, { transform: "translateX(-18%) rotate(-4deg)", offset: 0.4 }, { transform: "none" }],
  shake: [{ transform: "none" }, { transform: "translate(-5px,2px)" }, { transform: "translate(5px,-2px)" }, { transform: "translate(-3px,-1px)" }, { transform: "none" }],
};
function Fighter({ side, name, sub, gender, power, hp, hit, beat, compact }) {
  const left = side === "us";
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el?.animate || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const k = beat === "approach" ? (left ? "inL" : "inR") : beat === "clash" ? (left ? "lungeL" : "lungeR") : hit ? "shake" : null;
    if (k) el.animate(KF[k], { duration: k.startsWith("in") ? 700 : k === "shake" ? 400 : 550, easing: "cubic-bezier(.2,.9,.3,1)", fill: "both" });
  }, [beat]); // eslint-disable-line
  return (
    <div ref={ref} className="relative flex min-w-0 flex-1 flex-col items-center gap-1" data-testid={`battle-side-${side}`}>
      <div className="relative w-full">
        {!compact && (
          <>
            <div className="flex h-[150px] items-end justify-center"><Portrait gender={gender} size={110} className={hit ? "ring-2 ring-blood" : ""} /></div>
            {hit && <span key={`b-${beat}`} className="bp-burst pointer-events-none absolute left-1/2 top-1/2 text-blood"><Zap className="h-12 w-12 fill-current" /></span>}
            {hit && <div key={`f-${beat}`} className="bp-flash pointer-events-none absolute inset-0 bg-blood/40" />}
          </>
        )}
      </div>
      <div className="w-full text-center">
        <div className={`truncate text-[11px] font-black uppercase ${left ? "text-gold" : "text-rose-300"}`}>{name}</div>
        <div className="truncate text-[9px] uppercase text-zinc-500">{sub}</div>
      </div>
      <Bar pct={hp} color={left ? "bg-gold" : "bg-blood"} testid={`battle-hp-${side}`} />
      <div className="flex items-center gap-0.5 text-[10px] font-bold text-zinc-400" title="Power"><Swords className="h-3 w-3" />{(power || 0).toLocaleString()}</div>
    </div>
  );
}

function Results({ b, onClose }) {
  const rows = [
    b.loot > 0 && { icon: Coins, label: "Loot", value: `+${cedi(b.loot)}`, cls: "text-kgreen", id: "loot" },
    (b.lost > 0 || !b.won) && { icon: Coins, label: "Cash lost", value: b.lost > 0 ? `−${cedi(b.lost)}` : "none", cls: b.lost > 0 ? "text-blood" : "text-zinc-300", id: "lost" },
    { icon: Flame, label: "Heat", value: b.heat > 0 ? `+${b.heat}` : "none", cls: b.heat > 0 ? "text-orange-400" : "text-zinc-400", id: "heat" },
    ...Object.entries(b.damage || {}).map(([k, v]) => ({ icon: Wrench, label: k === "walls" ? "Walls condition" : k === "armoury" ? "Armoury condition" : k === "vehicle" ? "Vehicle" : k, value: k === "vehicle" ? "damaged" : `−${v}%`, cls: "text-orange-400", id: `dmg-${k}` })),
    b.drop && { icon: Trophy, label: "Drop", value: b.drop, cls: "text-gold", id: "drop" },
  ].filter(Boolean);
  const crew = (b.us.crew || []).filter((c) => c && (c.xp || c.morale));
  return (
    <div className="bp-pop mt-2 space-y-2" data-testid="battle-results">
      <div className={`text-center font-display text-3xl uppercase ${b.won ? "text-kgreen" : "text-blood"}`} data-testid="battle-outcome">{b.won ? "Victory" : "Defeat"}</div>
      <div className="grid grid-cols-2 gap-1.5">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-1 border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-[11px]" data-testid={`battle-res-${r.id}`}>
            <span className="flex items-center gap-1 text-zinc-400"><r.icon className="h-3.5 w-3.5" />{r.label}</span>
            <b className={`truncate ${r.cls}`}>{r.value}</b>
          </div>
        ))}
      </div>
      {crew.length > 0 && (
        <div className="border border-zinc-800 p-2" data-testid="battle-res-crew">
          <div className="mb-1 text-[9px] font-black uppercase tracking-widest text-zinc-500">Crew</div>
          {crew.map((c, idx) => (
            <div key={c?.id || idx} className="flex items-center justify-between text-[11px] text-zinc-300">
              <span className="flex items-center gap-1.5"><Portrait gender={c.gender} size={20} />{c.name}</span>
              <span className="flex items-center gap-2">
                {c.xp ? <span className="flex items-center gap-0.5 text-sky-300"><TrendingUp className="h-3 w-3" />+{c.xp} XP</span> : null}
                {c.morale ? <span className={c.morale > 0 ? "text-kgreen" : "text-blood"}>{c.morale > 0 ? "+" : ""}{c.morale} morale</span> : null}
              </span>
            </div>
          ))}
        </div>
      )}
      {(b.notes || []).length > 0 && <ul className="text-[10px] text-zinc-500">{b.notes.map((n) => <li key={n}>· {n}</li>)}</ul>}
      <button onClick={onClose} className="btn-press w-full border border-gold bg-gold py-2 text-[12px] font-black uppercase text-ink" data-testid="battle-close-btn">Continue</button>
    </div>
  );
}

export default function BattlePlayback() {
  const { player: p, act, config } = useGame();
  const b = p?.last_battle;
  const fresh = !!b && !b.seen && Date.now() / 1000 - b.t < 900;
  const beats = useMemo(() => (b ? buildSteps(b) : []), [b?.id]); // eslint-disable-line
  const [i, setI] = useState(0);
  const [use3d] = useState(() => typeof window !== "undefined" && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches && webglOk());
  const clock = useRef({ phase: "approach", r: null, ms: 0, key: "" });
  const [fightMode, setFightMode] = useState("auto");
  useEffect(() => { setI(0); }, [b?.id]);
  useEffect(() => {
    // If player chose manual fight mode, do not auto-skip to results; let them play!
    if (fightMode === "manual") return;
    if (!fresh || !beats[i] || beats[i].id === "results") return;
    const t = setTimeout(() => setI((x) => Math.min(beats.length - 1, x + 1)), beats[i].ms);
    return () => clearTimeout(t);
  }, [i, fresh, beats, fightMode]);
  // drive the scene clock: which round is on, and how far into it we are
  useEffect(() => {
    const st = beats[i]; if (!st) return;
    const t0 = performance.now(); let raf = 0;
    const tick = () => {
      const ms = performance.now() - t0;
      clock.current = st.phase === "end" || st.phase === "results"
        ? { phase: "end", r: st.winner, ms: st.phase === "results" ? 9999 : ms, key: st.id }
        : { phase: st.phase || "round", r: st.r || null, ms, key: st.id };
      if (st.phase !== "results") raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [i, beats]);
  const fighters = useMemo(() => {
    if (!p) return null;
    let gear = {}; try { gear = resolveGear(p, config, p.loadout) || {}; } catch { gear = {}; }
    return { us: { look: { gender: "male", skin: "#8d5524", ...(p.avatar || {}), outfit: {} }, gear }, them: { look: rivalLook(b?.them?.name), gear: {} } };
  }, [b?.id]); // eslint-disable-line
  if (!fresh || !beats.length) return null;
  const beat = beats[i];
  const done = beat.id === "results";
  const close = () => act("battle_seen", { id: b.id });
  const K = KIND[b.kind] || KIND.hit;
  const crewOnBeat = beat.crew;
  const CI = crewOnBeat?.arch ? (ARCH[crewOnBeat.arch] || ARCH.enforcer).icon : null;
  return (
    <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/80 p-3" role="dialog" aria-modal="true" aria-label="Battle playback" data-testid="battle-playback" data-beat={beat.id}>
      <div className="relative max-h-[92dvh] w-full max-w-[460px] overflow-y-auto border border-zinc-800 bg-ink p-3 shadow-2xl">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400"><K.icon className="h-3.5 w-3.5 text-gold" />{b.title || K.verb}</span>
          {done ? (
            <button onClick={close} title="Close" aria-label="Close" className="text-zinc-500 hover:text-gold" data-testid="battle-x-btn"><X className="h-4 w-4" /></button>
          ) : (
            <button onClick={() => setI(beats.length - 1)} title="Skip to results" aria-label="Skip to results" data-testid="battle-skip-btn"
              className="btn-press flex items-center gap-1 border border-zinc-700 px-2 py-1 text-[10px] font-black uppercase text-zinc-300 hover:border-gold hover:text-gold"><SkipForward className="h-3.5 w-3.5" />Skip</button>
          )}
        </div>
        {fighters && (
          <div className="relative mb-2">
            <Suspense fallback={<div className="flex h-[210px] items-end justify-around border border-zinc-800"><Portrait gender={b.us.gender} size={90} /><Portrait gender="male" size={90} /></div>}>
              <FightScene
                us={fighters.us}
                them={fighters.them}
                beat={beat}
                playing={!done}
                battle={b}
                onFightComplete={() => setI(beats.length - 1)}
              />
            </Suspense>
            {beat.round && <span className="pointer-events-none absolute left-2 top-2 border border-zinc-700 bg-ink/80 px-1.5 py-0.5 text-[10px] font-black uppercase text-gold" data-testid="battle-round">Round {beat.round}/{beats.filter((x) => x.round).length}</span>}
            {beat.id === "ko" && <span className="bp-pop pointer-events-none absolute inset-x-0 top-1/3 text-center font-display text-5xl uppercase text-blood drop-shadow-[0_2px_0_#000]" data-testid="battle-ko">KO!</span>}
          </div>
        )}
        {/* crew strip */}
        <div className="mt-2 flex justify-center gap-1.5" data-testid="battle-crew-strip">
          {(b.us.crew || []).map((c, idx) => (
            <span key={c?.id || idx} title={`${c?.name || 'Crew'} (${c?.arch || 'muscle'})`} className={`relative rounded transition-transform ${crewOnBeat?.id && crewOnBeat.id === c?.id ? "scale-110 ring-2 ring-gold" : "opacity-60"}`}>
              <Portrait gender={c?.gender || 'male'} size={30} />
            </span>
          ))}
          <Skull className="ml-2 h-7 w-7 self-center text-rose-300/70" aria-label={`${b.them.name} crew`} />
        </div>
        {/* Simulation text feed removed for cinematic immersion */}
        {!done && (
          <div className="mt-1 flex justify-center gap-1" aria-hidden="true">
            {beats.slice(0, -1).map((x, k) => <span key={x.id} className={`h-1 w-4 rounded-full ${k <= i ? "bg-gold" : "bg-zinc-800"}`} />)}
          </div>
        )}
        {done && <Results b={b} onClose={close} />}
      </div>
    </div>
  );
}
