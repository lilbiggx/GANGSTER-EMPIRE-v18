// v9 TEST TOOLS panel (More > wrench). Only exists in builds made with VITE_ENABLE_TEST_TOOLS=true (the default for
// the Render test build); with the flag false this file and engine/testTools.ts are not in the bundle at all.
// Every cheat goes through the engine action "test_tool", so cash changes are booked as "TEST" in the statement.
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Wrench } from "lucide-react";
import { useGame, testClock, saveTestClock, testToolsReady } from "../../../store/game";
import { HUSTLES, FRONTS, MANSION_FACILITIES, HEISTS, RIVALS, HEIST_PREP } from "../../../data/gameData";
import { LUXURY_CATALOG } from "../../../data/luxury";
import { DELIVERABLE_CONSUMABLES } from "../../../data/consumablesData";
import { RIVAL_EVENT_TYPES, INJURY_SEV, ensurePlots } from "../../../engine/gameEngine";
import { Btn } from "../ui";
import { useNow } from "../../../hooks/useNow";
import { fpsOverlayOn, setFpsOverlay } from "./FpsOverlay";
import {
  ORIGINAL_DEFAULTS,
  applyValueOverrides,
  buildOverridesExportPayload,
  OVERRIDES_DATA_KEY,
  OVERRIDES_ACTIVE_KEY,
} from "../../../lib/valueOverrides";

const SAVE_KEY = "uw_offline_player_v2";
const PROFILES_KEY = "ge_test_profiles";
const TABS = [
  ["economy", "Economy"], ["assets", "Assets"], ["cooldowns", "Cooldowns"], ["rivals", "Rivals & Events"],
  ["crew", "Crew & Medical"], ["boutique", "Boutique"], ["time", "Time"], ["audit", "Audit Log"], ["overrides", "Overrides"], ["save", "Save"], ["debug", "Debug"],
];
const fmtN = (n) => Number(n || 0).toLocaleString();
const dur = (s) => { s = Math.max(0, Math.floor(s)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return h ? `${h}h ${m}m` : m ? `${m}m ${x}s` : `${x}s`; };

/** Runs a test tool op. Waits for the lazily registered handlers first. */
export async function runTT(op, args = {}, okMsg) {
  await testToolsReady;
  return new Promise((resolve) => {
    let done = false;
    useGame.getState().act("test_tool", { op, ...args }, { onResult: (r) => { done = true; if (okMsg) toast.success(typeof okMsg === "function" ? okMsg(r) : okMsg); resolve(r); } });
    if (!done) resolve(null); // act already toasted the error
  });
}

const Row = ({ children, className = "" }) => <div className={`flex flex-wrap items-center gap-2 ${className}`}>{children}</div>;
const Label = ({ children }) => <div className="mb-1 mt-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">{children}</div>;
const Box = ({ title, children, testid }) => (
  <div className="mt-3 border border-zinc-800 bg-surface2 p-3" data-testid={testid}>
    {title && <div className="mb-2 font-display text-sm uppercase text-gold">{title}</div>}
    {children}
  </div>
);
const inputCls = "min-h-[40px] w-full border border-zinc-700 bg-ink px-2 text-sm text-zinc-100 focus:border-gold focus:outline-none";
const Num = ({ value, onChange, placeholder, testid, className = "" }) => (
  <input type="number" inputMode="numeric" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={`${inputCls} ${className}`} data-testid={testid} />
);
const Sel = ({ value, onChange, options, testid, className = "" }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} ${className}`} data-testid={testid}>
    {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
  </select>
);
const B = ({ children, variant = "ghost", className = "", ...p }) => <Btn variant={variant} className={`min-h-[40px] ${className}`} {...p}>{children}</Btn>;

// ---------------- Economy ----------------
function EconomyTab() {
  const p = useGame((s) => s.player);
  const [mode, setMode] = useState("add");
  const [f, setF] = useState({ clean: "", dirty: "", respect: "", heat: "", xp: "", level: "", points: "" });
  const set = (k) => (v) => setF((o) => ({ ...o, [k]: v }));
  const apply = async (vals, m = mode) => { const r = await runTT("economy", { mode: m, ...vals }, "Economy updated (booked as TEST)"); if (r) setF({ clean: "", dirty: "", respect: "", heat: "", xp: "", level: "", points: "" }); };
  const fields = [["clean", "Clean cash"], ["dirty", "Dirty cash"], ["respect", "Respect"], ["heat", "Heat (0-100)"], ["xp", "XP"], ["level", "Level"], ["points", "Perk points"]];
  return (
    <div data-testid="tt-tab-economy">
      <Box title="Now">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-zinc-300">
          <div>Clean <b className="text-kgreen" data-testid="tt-now-clean">₵{fmtN(p.clean)}</b></div>
          <div>Dirty <b className="text-blood" data-testid="tt-now-dirty">₵{fmtN(p.dirty)}</b></div>
          <div>Respect <b>{p.prestige?.respect || 0}</b></div><div>Heat <b>{Math.round(p.heat)}</b></div>
          <div>Level <b data-testid="tt-now-level">{p.level}</b> · XP {fmtN(p.xp)}</div><div>Perk pts <b>{p.skill_points || 0}</b></div>
        </div>
      </Box>
      <Box title="Set or add">
        <Row>
          {["add", "set"].map((m) => <B key={m} variant={mode === m ? "gold" : "ghost"} onClick={() => setMode(m)} data-testid={`tt-eco-mode-${m}`}>{m === "add" ? "Add (+/-)" : "Set to"}</B>)}
        </Row>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {fields.map(([k, l]) => <label key={k} className="text-[10px] uppercase text-zinc-500">{l}<Num value={f[k]} onChange={set(k)} placeholder={mode === "add" ? "+0" : "value"} testid={`tt-eco-${k}`} /></label>)}
        </div>
        <B variant="gold" className="mt-3 w-full" onClick={() => apply(f)} data-testid="tt-eco-apply">Apply</B>
      </Box>
      <Box title="Presets">
        <div className="grid grid-cols-2 gap-2">
          <B onClick={() => apply({ clean: 10000, dirty: 10000 }, "add")} data-testid="tt-eco-p-10k">+10k clean & dirty</B>
          <B onClick={() => apply({ clean: 1000000, dirty: 1000000 }, "add")} data-testid="tt-eco-p-1m">+1M clean & dirty</B>
          <B onClick={() => apply({ clean: 100000000, dirty: 100000000 }, "set")} data-testid="tt-eco-p-rich">Set 100M each</B>
          <B onClick={() => apply({ clean: 0, dirty: 0 }, "set")} data-testid="tt-eco-p-broke">Broke (0 / 0)</B>
          <B onClick={() => apply({ heat: 0 }, "set")} data-testid="tt-eco-p-heat0">Heat 0</B>
          <B onClick={() => apply({ heat: 90 }, "set")} data-testid="tt-eco-p-heat90">Heat 90</B>
          <B onClick={() => apply({ level: 25 }, "set")} data-testid="tt-eco-p-lvl25">Level 25</B>
          <B onClick={() => apply({ points: 10 }, "add")} data-testid="tt-eco-p-pts">+10 perk points</B>
          <B onClick={() => apply({ respect: 5 }, "add")} data-testid="tt-eco-p-resp">+5 respect</B>
          <B onClick={() => apply({ xp: 5000 }, "add")} data-testid="tt-eco-p-xp">+5,000 XP</B>
          <B onClick={() => runTT("pass_xp", { xp: 500 }, "+500 Street Pass XP")} data-testid="tt-eco-p-pass">+500 Pass XP</B>
        </div>
      </Box>
    </div>
  );
}

// ---------------- Assets ----------------
function AssetsTab() {
  const p = useGame((s) => s.player);
  const plots = p.player_plots && p.player_plots.length ? p.player_plots : ensurePlots(JSON.parse(JSON.stringify(p)));
  const [hid, setHid] = useState(HUSTLES[0].id); const [hl, setHl] = useState("5");
  const [fid, setFid] = useState(FRONTS[0].id); const [fl, setFl] = useState("1");
  const [fac, setFac] = useState("vault"); const [fal, setFal] = useState("1");
  const [vault, setVault] = useState(String(p.facilities?.vault || 0));
  return (
    <div data-testid="tt-tab-assets">
      <Box title="Land plots" testid="tt-land">
        {plots.map((pl) => (
          <div key={pl.plotID} className="flex items-center justify-between gap-2 border-b border-zinc-800 py-1.5 text-xs last:border-0" data-testid={`tt-land-${pl.plotID}`}>
            <div className="min-w-0 text-zinc-300">Plot {pl.plotID + 1} · <span className={pl.isUnlocked ? "text-kgreen" : "text-zinc-500"}>{pl.isUnlocked ? "owned" : "locked"}</span>{pl.hustleID ? ` · ${pl.hustleID}` : ""}</div>
            <div className="flex shrink-0 gap-1">
              {!pl.isUnlocked ? <B className="!px-2" onClick={() => runTT("land", { idx: pl.plotID, action: "unlock" }, `Plot ${pl.plotID + 1} unlocked`)} data-testid={`tt-land-unlock-${pl.plotID}`}>Unlock</B>
                : <B className="!px-2" onClick={() => runTT("land", { idx: pl.plotID, action: "lock" }, `Plot ${pl.plotID + 1} locked`)} data-testid={`tt-land-lock-${pl.plotID}`}>Lock</B>}
              {pl.hustleID && <B className="!px-2" onClick={() => runTT("land", { idx: pl.plotID, action: "clear" }, "Plot cleared")} data-testid={`tt-land-clear-${pl.plotID}`}>Clear</B>}
            </div>
          </div>
        ))}
        <Row className="mt-2">
          <B onClick={() => runTT("land", { idx: "all", action: "unlock" }, "All land unlocked")} data-testid="tt-land-unlock-all">Unlock all</B>
          <B variant="red" onClick={() => runTT("land", { idx: "all", action: "reset" }, "Land reset (all plots locked, hustles removed)")} data-testid="tt-land-reset-all">Reset all land</B>
        </Row>
      </Box>
      <Box title="Street hustle level" testid="tt-hustle">
        <div className="grid grid-cols-[1fr_72px] gap-2">
          <Sel value={hid} onChange={setHid} options={HUSTLES.map((h) => [h.id, `${h.name}${p.hustles?.[h.id] ? ` (Lv ${p.hustles[h.id].lvl})` : ""}`])} testid="tt-hustle-id" />
          <Num value={hl} onChange={setHl} testid="tt-hustle-lvl" />
        </div>
        <div className="mt-1 text-[10px] text-zinc-500">Level 0 removes it. A new hustle gets the next free land plot.</div>
        <B variant="gold" className="mt-2 w-full" onClick={() => runTT("hustle", { id: hid, lvl: hl }, `Hustle set to Lv ${hl}`)} data-testid="tt-hustle-set">Grant / set level</B>
      </Box>
      <Box title="Front business level" testid="tt-front">
        <div className="grid grid-cols-[1fr_72px] gap-2">
          <Sel value={fid} onChange={setFid} options={FRONTS.map((f) => [f.id, `${f.name}${p.fronts?.[f.id] ? ` (Lv ${p.fronts[f.id]})` : ""}`])} testid="tt-front-id" />
          <Num value={fl} onChange={setFl} testid="tt-front-lvl" />
        </div>
        <B variant="gold" className="mt-2 w-full" onClick={() => runTT("front", { id: fid, lvl: fl }, `Front set to Lv ${fl}`)} data-testid="tt-front-set">Grant / set level</B>
      </Box>
      <Box title="Facility level" testid="tt-facility">
        <div className="grid grid-cols-[1fr_72px] gap-2">
          <Sel value={fac} onChange={setFac} options={Object.values(MANSION_FACILITIES).map((x) => [x.id, `${x.name} (Lv ${p.facilities?.[x.id] || 0})`])} testid="tt-facility-id" />
          <Num value={fal} onChange={setFal} testid="tt-facility-lvl" />
        </div>
        <B variant="gold" className="mt-2 w-full" onClick={() => runTT("facility", { id: fac, lvl: fal }, `Facility set to Lv ${fal}`)} data-testid="tt-facility-set">Grant / set level</B>
      </Box>
      <Box title="Vault level" testid="tt-vault">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Num value={vault} onChange={setVault} testid="tt-vault-lvl" />
          <B variant="gold" onClick={() => runTT("facility", { id: "vault", lvl: vault }, `Vault set to Lv ${vault}`)} data-testid="tt-vault-set">Set vault</B>
        </div>
      </Box>
    </div>
  );
}

// ---------------- Cooldowns ----------------
function CooldownsTab() {
  const p = useGame((s) => s.player);
  const now = useNow(1000);
  const cd = p.cooldowns || { launder_until: 0, heist_until: 0, front: {} };
  const [kind, setKind] = useState("heist_by"); const [key, setKey] = useState(""); const [mins, setMins] = useState("30");
  const active = [];
  if (cd.launder_until > now) active.push(["launder", "", "Laundering lock", cd.launder_until]);
  if (cd.heist_until > now) active.push(["heist", "", "Global heist lock", cd.heist_until]);
  Object.entries(cd.heist_by || {}).forEach(([id, t]) => t > now && active.push(["heist_by", id, `Heist: ${HEISTS.find((h) => h.id === id)?.name || id}`, t]));
  Object.entries(cd.front || {}).forEach(([id, t]) => t > now && active.push(["front", id, `Front run: ${FRONTS.find((f) => f.id === id)?.name || id}`, t]));
  Object.entries(p.rival_cd || {}).forEach(([id, t]) => t > now && active.push(["rival", id, `Rival corner: ${RIVALS.find((r) => r.id === id)?.name || id}`, t]));
  if ((p.pvp_cd || 0) > now) active.push(["pvp", "", "Turf war regroup", p.pvp_cd]);
  if ((p.arrested_until || 0) > now) active.push(["arrest", "", "Arrested", p.arrested_until]);
  const keyOpts = kind === "heist_by" ? HEISTS.map((h) => [h.id, h.name]) : kind === "front" ? FRONTS.map((f) => [f.id, f.name]) : kind === "rival" ? RIVALS.map((r) => [r.id, r.name]) : null;
  return (
    <div data-testid="tt-tab-cooldowns">
      <Box title={`Active cooldowns (${active.length})`} testid="tt-cd-active">
        {!active.length && <div className="text-xs text-zinc-500">Nothing on cooldown.</div>}
        {active.map(([k, id, label, t]) => (
          <div key={k + id} className="flex items-center justify-between gap-2 border-b border-zinc-800 py-1.5 text-xs last:border-0" data-testid={`tt-cd-${k}${id ? `-${id}` : ""}`}>
            <div className="min-w-0 text-zinc-300">{label} · <span className="text-gold">{dur(t - now)}</span></div>
            <B className="!px-2" onClick={() => runTT("cooldown", { kind: k, key: id || undefined }, `Cleared ${label}`)} data-testid={`tt-cd-clear-${k}${id ? `-${id}` : ""}`}>Clear</B>
          </div>
        ))}
        <Row className="mt-2">
          <B variant="gold" onClick={() => runTT("cooldown", { kind: "all" }, "All cooldowns cleared")} data-testid="tt-cd-clear-all">Clear all cooldowns</B>
          <B onClick={() => runTT("finish_timers", {}, "Running timers finished")} data-testid="tt-finish-timers">Finish All Timers</B>
          <B onClick={() => runTT("reset_heist_limit", {}, "Daily heist limit reset")} data-testid="tt-reset-heist-limit">Reset heist limit</B>
        </Row>
      </Box>
      <Box title="Set remaining time" testid="tt-cd-set">
        <Sel value={kind} onChange={(v) => { setKind(v); setKey(""); }} options={[["heist_by", "Per heist"], ["launder", "Laundering"], ["front", "Front run (per front)"], ["heist", "Global heist lock"], ["rival", "Rival corner (per rival)"], ["pvp", "Turf war (PvP)"], ["arrest", "Arrest"], ["smuggling", "Smuggling (per route)"]]} testid="tt-cd-kind" />
        {keyOpts && <Sel className="mt-2" value={key} onChange={setKey} options={[["", "All of them"], ...keyOpts]} testid="tt-cd-key" />}
        <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
          <Num value={mins} onChange={setMins} placeholder="minutes" testid="tt-cd-mins" />
          <B variant="gold" onClick={() => runTT("cooldown", { kind, key: key || undefined, seconds: Math.round(Number(mins) * 60) }, `Cooldown set to ${mins} min`)} data-testid="tt-cd-apply">Set (min)</B>
        </div>
        <Row className="mt-2">{[1, 5, 60, 480].map((m) => <B key={m} className="!px-2" onClick={() => setMins(String(m))}>{m >= 60 ? `${m / 60}h` : `${m}m`}</B>)}<B className="!px-2" onClick={() => setMins("0")}>0 = clear</B></Row>
      </Box>
    </div>
  );
}

// ---------------- Rivals & events ----------------
function RivalsTab() {
  const p = useGame((s) => s.player);
  const [type, setType] = useState("random"); const [rival, setRival] = useState("random");
  const [hate, setHate] = useState({});
  const force = p.test_force_fight || "off";
  const rivalOpts = RIVALS.map((r) => [r.id, r.name]);
  return (
    <div data-testid="tt-tab-rivals">
      <Box title="Trigger a rival event" testid="tt-rev">
        <Sel value={type} onChange={setType} options={[["random", "Random type"], ...Object.entries(RIVAL_EVENT_TYPES).map(([k, v]) => [k, v.label])]} testid="tt-rev-type" />
        <Sel className="mt-2" value={rival} onChange={setRival} options={[["random", "Pick by hate (normal)"], ...rivalOpts]} testid="tt-rev-rival" />
        <Row className="mt-2">
          <B variant="gold" onClick={() => runTT("rival_event", { type, rival, replace: true }, "Rival event sent")} data-testid="tt-rev-fire">Trigger event</B>
          <B variant="red" onClick={() => runTT("rival_event", { type, arch: true, replace: true }, "Arch rival popup sent")} data-testid="tt-rev-arch">Arch rival popup</B>
        </Row>
        <Label>Arch-rival crisis</Label>
        <Row>
          {[["rival_war", "Territory war"], ["kidnap", "Kidnap"], ["ambush", "Convoy ambush"]].map(([t, l]) => <B key={t} className="!px-2" onClick={() => runTT("crisis", { type: t, replace: true }, `${l} crisis sent`)} data-testid={`tt-crisis-${t}`}>{l}</B>)}
        </Row>
        <Label>Raids & police</Label>
        <Row>
          <B className="!px-2" onClick={() => runTT("raid_now", { rival: rival === "random" ? undefined : rival, seconds: 45 }, "Raid incoming in 45s")} data-testid="tt-raid">Raid in 45s</B>
          <B className="!px-2" onClick={() => runTT("alliance_raid", { rival: rival === "random" ? undefined : rival }, "Alliance raid incoming in 45s")} data-testid="tt-alliance-raid">Alliance raid</B>
          <B className="!px-2" onClick={() => runTT("arrest", {}, "Arrested")} data-testid="tt-arrest">Arrest me</B>
          <B className="!px-2" onClick={() => runTT("heist_event", {}, (r) => `Heist crisis: ${r.event}`)} data-testid="tt-heist-event">Heist crisis</B>
          <B className="!px-2" onClick={() => runTT("assassin_hit", { rival: rival === "random" ? undefined : rival }, "Boss hit contract active for 1h")} data-testid="tt-assassin">Boss hit contract</B>
        </Row>
      </Box>
      <Box title="Force fights" testid="tt-force">
        <Row>
          {[["off", "Normal odds"], ["win", "Always win"], ["lose", "Always lose"]].map(([m, l]) => <B key={m} variant={force === m ? "gold" : "ghost"} onClick={() => runTT("force_fight", { mode: m }, l)} data-testid={`tt-force-${m}`}>{l}</B>)}
        </Row>
        <div className="mt-1 text-[10px] text-zinc-500">Applies to raids, rival hits, turf war and arch-rival fights until set back to normal.</div>
        <Row className="mt-2">
          <B onClick={() => runTT("fight_now", { mode: "win", rival: rival === "random" ? undefined : rival })} data-testid="tt-fight-win">Play a won fight</B>
          <B onClick={() => runTT("fight_now", { mode: "lose", rival: rival === "random" ? undefined : rival })} data-testid="tt-fight-lose">Play a lost fight</B>
        </Row>
      </Box>
      <Box title="Gang hate" testid="tt-hate">
        {RIVALS.map((r) => (
          <div key={r.id} className="grid grid-cols-[1fr_64px_auto] items-center gap-2 border-b border-zinc-800 py-1 text-xs last:border-0">
            <div className="truncate text-zinc-300">{r.name} <span className="text-zinc-500">({p.grudges?.[r.id] || 0})</span></div>
            <Num value={hate[r.id] ?? ""} onChange={(v) => setHate((h) => ({ ...h, [r.id]: v }))} placeholder={String(p.grudges?.[r.id] || 0)} testid={`tt-hate-${r.id}`} />
            <B className="!px-2" onClick={() => runTT("set_hate", { rival: r.id, value: hate[r.id] ?? 0 }, `${r.name} hate set`)} data-testid={`tt-hate-set-${r.id}`}>Set</B>
          </div>
        ))}
        <Row className="mt-2">{[0, 50, 100].map((v) => <B key={v} className="!px-2" onClick={() => runTT("set_hate", { rival: "all", value: v }, `All hate set to ${v}`)} data-testid={`tt-hate-all-${v}`}>All {v}</B>)}</Row>
      </Box>
    </div>
  );
}

// ---------------- Crew & medical ----------------
function CrewTab() {
  const p = useGame((s) => s.player);
  const [sev, setSev] = useState("2"); const [n, setN] = useState("1"); const [lvl, setLvl] = useState("5"); const [arch, setArch] = useState("");
  return (
    <div data-testid="tt-tab-crew">
      <Box title="Injure / heal">
        <Sel value={sev} onChange={setSev} options={Object.entries(INJURY_SEV).map(([k, v]) => [k, `${v.name} (${Math.round(v.need / 3600)}h)`])} testid="tt-inj-sev" />
        {p.crew.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-2 border-b border-zinc-800 py-1.5 text-xs last:border-0" data-testid={`tt-crew-${c.id}`}>
            <div className="min-w-0 truncate text-zinc-300">{c.name} · Lv {c.lvl}{c.merc ? " · merc" : ""} {c.injury ? <span className="text-blood">· {INJURY_SEV[c.injury.sev]?.name}</span> : <span className="text-kgreen">· fit</span>}</div>
            <div className="flex shrink-0 gap-1">
              <B className="!px-2" onClick={() => runTT("injure", { cid: c.id, sev }, `${c.name} injured`)} data-testid={`tt-injure-${c.id}`}>Injure</B>
              {c.injury && <B className="!px-2" onClick={() => runTT("heal", { cid: c.id }, `${c.name} healed`)} data-testid={`tt-heal-${c.id}`}>Heal</B>}
            </div>
          </div>
        ))}
        <Row className="mt-2">
          <B variant="red" onClick={() => runTT("injure", { cid: "all", sev }, "All crew injured")} data-testid="tt-injure-all">Injure all</B>
          <B variant="green" onClick={() => runTT("heal", { cid: "all" }, "All crew healed")} data-testid="tt-heal-all">Heal all</B>
        </Row>
      </Box>
      <Box title="Add crew">
        <div className="grid grid-cols-3 gap-2">
          <label className="text-[10px] uppercase text-zinc-500">Count<Num value={n} onChange={setN} testid="tt-crew-n" /></label>
          <label className="text-[10px] uppercase text-zinc-500">Level<Num value={lvl} onChange={setLvl} testid="tt-crew-lvl" /></label>
          <label className="text-[10px] uppercase text-zinc-500">Type<Sel value={arch} onChange={setArch} options={[["", "Any"], ["enforcer", "Enforcer"], ["hacker", "Hacker"], ["driver", "Driver"], ["infiltrator", "Infiltrator"]]} testid="tt-crew-arch" /></label>
        </div>
        <Row className="mt-2">
          <B variant="gold" onClick={() => runTT("add_crew", { count: n, lvl, arch }, (r) => `Added ${r.added.join(", ")}`)} data-testid="tt-crew-add">Add crew</B>
          <B onClick={() => runTT("crew_xp", { xp: 250 }, "+250 XP to all crew")} data-testid="tt-crew-xp">+250 crew XP</B>
        </Row>
      </Box>
    </div>
  );
}

// ---------------- Boutique ----------------
function BoutiqueTab() {
  const p = useGame((s) => s.player);
  const [q, setQ] = useState("");
  const owned = p.luxury || {};
  const list = useMemo(() => LUXURY_CATALOG.filter((i) => !q || `${i.name} ${i.category} ${i.id}`.toLowerCase().includes(q.toLowerCase())), [q]);
  return (
    <div data-testid="tt-tab-boutique">
      <Box title="Stock">
        <B variant="gold" className="w-full" onClick={() => runTT("refresh_boutique", {}, "Boutique stock and daily deal refreshed")} data-testid="tt-lux-refresh">Refresh stock & daily deal</B>
      </Box>
      <Box title={`Grant items (${Object.keys(owned).length}/${LUXURY_CATALOG.length} owned)`}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search items" className={inputCls} data-testid="tt-lux-q" />
        <div className="mt-2 max-h-[46dvh] overflow-y-auto">
          {list.map((i) => (
            <div key={i.id} className="flex items-center justify-between gap-2 border-b border-zinc-800 py-1.5 text-xs last:border-0">
              <div className="min-w-0 truncate text-zinc-300">{i.name} <span className="text-zinc-500">· T{i.tier} {i.category}{i.limited ? " · limited" : ""}</span></div>
              {owned[i.id] ? <B className="!px-2" onClick={() => runTT("grant_item", { id: i.id, remove: true }, `Removed ${i.name}`)} data-testid={`tt-lux-remove-${i.id}`}>Remove</B>
                : <B variant="gold" className="!px-2" onClick={() => runTT("grant_item", { id: i.id }, `Granted ${i.name}`)} data-testid={`tt-lux-grant-${i.id}`}>Grant</B>}
            </div>
          ))}
        </div>
      </Box>
    </div>
  );
}

// ---------------- Time ----------------
function TimeTab() {
  const [h, setH] = useState("8");
  const [, force] = useState(0);
  const ff = (hours) => {
    const secs = Math.round(Number(hours) * 3600);
    if (!(secs > 0)) return toast.error("Enter hours > 0");
    const g = useGame.getState();
    g.save();
    testClock.warp += secs; saveTestClock();
    g.load(); // same path as coming back after being away: offline earnings, rival events, wear, statement entries
    force((x) => x + 1);
    toast.success(`Fast-forwarded ${hours}h (offline earnings, events, wear applied)`);
  };
  const scale = (s) => { testClock.scale = s; saveTestClock(); force((x) => x + 1); toast.success(`Timescale x${s}`); };
  return (
    <div data-testid="tt-tab-time">
      <Box title="Fast-forward">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Num value={h} onChange={setH} placeholder="hours" testid="tt-ff-hours" />
          <B variant="gold" onClick={() => ff(h)} data-testid="tt-ff-go">Skip hours</B>
        </div>
        <Row className="mt-2">{[1, 4, 8, 24, 72].map((x) => <B key={x} className="!px-2" onClick={() => ff(x)} data-testid={`tt-ff-${x}`}>+{x}h</B>)}</Row>
        <div className="mt-2 text-[10px] text-zinc-500">Runs the same catch-up as returning after being away: offline earnings, rival events (max 4, auto-ignored), wear and statement entries.</div>
      </Box>
      <Box title="Timescale">
        <Row>{[1, 10, 100].map((s) => <B key={s} variant={testClock.scale === s ? "gold" : "ghost"} onClick={() => scale(s)} data-testid={`tt-scale-${s}`}>x{s}</B>)}</Row>
      </Box>
      <Box title="Clock">
        <div className="text-xs text-zinc-300" data-testid="tt-warp">Test clock is <b className="text-gold">{dur(testClock.warp)}</b> ahead of real time · scale x{testClock.scale}</div>
        <B className="mt-2" onClick={() => { testClock.warp = 0; testClock.scale = 1; saveTestClock(); force((x) => x + 1); toast.success("Clock back to real time (timers set in the future stay in the future)"); }} data-testid="tt-clock-reset">Back to real time</B>
      </Box>
    </div>
  );
}

// ---------------- Save ----------------
function SaveTab() {
  const { player, createOfflineBoss } = useGame();
  const [txt, setTxt] = useState("");
  const [name, setName] = useState("");
  const [profiles, setProfiles] = useState(() => { try { return JSON.parse(localStorage.getItem(PROFILES_KEY) || "{}"); } catch { return {}; } });
  const saveProfiles = (o) => { localStorage.setItem(PROFILES_KEY, JSON.stringify(o)); setProfiles(o); };
  const loadSave = (obj, migrate) => {
    if (!obj || typeof obj !== "object" || obj.dirty === undefined || obj.clean === undefined) return toast.error("Not a Gangster Empire save (needs dirty and clean)");
    useGame.getState().save();
    localStorage.setItem(SAVE_KEY, JSON.stringify(obj));
    useGame.getState().load(); // load() ticks, which runs migratePlayer on any old save
    if (migrate) runTT("migrate", {}, "Migration run on the loaded save");
    else toast.success("Save loaded");
  };
  const exportJson = () => {
    const s = JSON.stringify(player, null, 1);
    setTxt(s);
    try { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([s], { type: "application/json" })); a.download = `ge-save-${player.name}-${Date.now()}.json`; a.click(); } catch { /* textarea still has it */ }
    navigator.clipboard?.writeText(s).catch(() => {});
    toast.success("Save exported (downloaded, copied and shown below)");
  };
  const parse = () => { try { return JSON.parse(txt); } catch { toast.error("That is not valid JSON"); return null; } };
  return (
    <div data-testid="tt-tab-save">
      <Box title="Export / import JSON">
        <Row><B variant="gold" onClick={exportJson} data-testid="tt-export">Export JSON</B>
          <label className="btn-press inline-flex min-h-[40px] cursor-pointer items-center border border-zinc-700 px-3 text-xs font-extrabold uppercase tracking-wider text-zinc-200 hover:border-gold">Import file
            <input type="file" accept="application/json,.json" className="hidden" data-testid="tt-import-file" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setTxt(await f.text()); }} /></label></Row>
        <textarea value={txt} onChange={(e) => setTxt(e.target.value)} rows={5} placeholder="Paste a save JSON here" className={`${inputCls} mt-2 font-mono text-[10px]`} data-testid="tt-json" />
        <Row className="mt-2">
          <B onClick={() => { const o = parse(); if (o) loadSave(o, false); }} data-testid="tt-import">Import</B>
          <B onClick={() => { const o = parse(); if (o) loadSave(o, true); }} data-testid="tt-import-migrate">Import & run migration</B>
        </Row>
      </Box>
      <Box title="Quick Engine Profiles Switcher" testid="tt-profiles">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          {[
            { id: "newbie", name: "Rookie Boss", desc: "Lv 1 · 1 Plot · 5K clean", variant: "ghost" },
            { id: "mid", name: "Mid Syndicate", desc: "Lv 12 · 4 Plots · 50K clean", variant: "ghost" },
            { id: "kingpin", name: "Kingpin Shatta", desc: "Lv 25 · 8 Plots · 800K clean", variant: "gold" },
          ].map((prof) => (
            <button
              key={prof.id}
              onClick={() => {
                createOfflineBoss(prof.id === "newbie" ? player.name : prof.name, player.district || "dockside", prof.id);
                toast.success(`Loaded quick profile: ${prof.name}`);
              }}
              className="border border-zinc-700 bg-black/60 p-2 text-left hover:border-gold transition-colors"
              data-testid={`tt-quick-prof-${prof.id}`}
            >
              <div className="text-xs font-bold text-zinc-100 flex items-center justify-between">
                <span>{prof.name}</span>
                <span className="text-[9px] uppercase px-1 rounded bg-zinc-800 text-zinc-400">Load</span>
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">{prof.desc}</div>
            </button>
          ))}
          <button
            onClick={async () => {
              createOfflineBoss("Godfather Nana", player.district || "dockside", "kingpin");
              await runTT("economy", { mode: "set", clean: 15000000, dirty: 8000000, level: 45, points: 25 }, "Loaded Cartel Godfather!");
            }}
            className="border border-gold/60 bg-gold/10 p-2 text-left hover:border-gold transition-colors"
            data-testid="tt-quick-prof-godfather"
          >
            <div className="text-xs font-bold text-gold flex items-center justify-between">
              <span>Cartel Mogul</span>
              <span className="text-[9px] uppercase px-1 rounded bg-gold/20 text-gold">Maxed</span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Lv 45 · 15M clean · 8M dirty</div>
          </button>
        </div>

        <Label>Saved Custom Profiles</Label>
        <div className="grid grid-cols-[1fr_auto] gap-2 mt-1">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Save snapshot name" className={inputCls} data-testid="tt-profile-name" />
          <B variant="gold" onClick={() => { const k = name.trim(); if (!k) return toast.error("Name it first"); saveProfiles({ ...profiles, [k]: { at: Date.now(), player } }); setName(""); toast.success(`Saved profile "${k}"`); }} data-testid="tt-profile-save">Snapshot</B>
        </div>
        {Object.entries(profiles).map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-2 border-b border-zinc-800 py-1.5 text-xs last:border-0" data-testid={`tt-profile-${k}`}>
            <div className="min-w-0 truncate text-zinc-300">{k} <span className="text-zinc-500">· Lv {v.player?.level} · {new Date(v.at).toLocaleString()}</span></div>
            <div className="flex shrink-0 gap-1">
              <B className="!px-2" onClick={() => loadSave(v.player, false)} data-testid={`tt-profile-load-${k}`}>Load</B>
              <B className="!px-2" onClick={() => { const o = { ...profiles }; delete o[k]; saveProfiles(o); }} data-testid={`tt-profile-del-${k}`}>Delete</B>
            </div>
          </div>
        ))}
      </Box>
      <Box title="Engine Migration">
        <B onClick={() => runTT("migrate", {}, "Migration run on the current save")} data-testid="tt-migrate">Run migration on this save</B>
      </Box>
    </div>
  );
}

// ---------------- Debug ----------------
/** Ledger reconcile: (1) the newest statement entry carries the current balances, so no cash moved off-ledger since;
 *  (2) per-currency, the statement entries sum to the same net as the complete daily totals (when not truncated). */
export function reconcile(p) {
  const st = p.cash_statement || [];
  const latest = st[0];
  const balOk = !latest || (String(latest.balance_dirty) === String(p.dirty) && String(latest.balance_clean) === String(p.clean));
  const truncated = st.length >= 1500;
  const out = { latest: balOk, truncated };
  for (const cur of ["dirty", "clean"]) {
    const rows = st.filter((t) => t.currency === cur);
    const sum = rows.reduce((a, t) => a + (t.type === "inflow" ? t.amount : -t.amount), 0);
    const daily = Object.values(p.cash_daily || {}).reduce((a, byCat) => a + Object.values(byCat).reduce((b, v) => b + (cur === "dirty" ? v.din - v.dout : v.cin - v.cout), 0), 0);
    out[cur] = { entries: rows.length, sum, daily, balance: Number(p[cur]), ok: truncated || daily === sum };
  }
  out.ok = balOk && out.dirty.ok && out.clean.ok;
  return out;
}
function DebugTab() {
  const p = useGame((s) => s.player);
  const [onlyTest, setOnlyTest] = useState(false);
  const [fps, setFps] = useState(fpsOverlayOn());
  const rc = reconcile(p);
  const rows = (p.cash_statement || []).filter((t) => !onlyTest || t.category === "TEST").slice(0, 60);
  return (
    <div data-testid="tt-tab-debug">
      <Box title="Ledger reconcile check" testid="tt-reconcile">
        <div className={`text-sm font-extrabold ${rc.ok ? "text-kgreen" : "text-blood"}`} data-testid="tt-reconcile-result">{rc.ok ? "PASS: statement reconciles" : "FAIL: statement does not reconcile"}</div>
        <div className="mt-1 text-[11px] text-zinc-400">Newest entry balance = wallet: <b className={rc.latest ? "text-kgreen" : "text-blood"}>{rc.latest ? "yes" : "no"}</b>{rc.truncated ? " · statement capped at 1500 rows, sum check skipped" : ""}</div>
        {["dirty", "clean"].map((c) => <div key={c} className="mt-1 text-[11px] text-zinc-400">{c}: {rc[c].entries} entries net ₵{fmtN(rc[c].sum)} · 30-day totals net ₵{fmtN(rc[c].daily)} · wallet ₵{fmtN(rc[c].balance)} <b className={rc[c].ok ? "text-kgreen" : "text-blood"}>{rc[c].ok ? "OK" : "MISMATCH"}</b></div>)}
      </Box>
      <Box title="FPS overlay">
        <B variant={fps ? "gold" : "ghost"} onClick={() => { setFpsOverlay(!fps); setFps(!fps); }} data-testid="tt-fps-toggle">{fps ? "FPS overlay ON" : "FPS overlay OFF"}</B>
      </Box>
      <Box title="Ledger entries">
        <Row><B variant={onlyTest ? "gold" : "ghost"} className="!px-2" onClick={() => setOnlyTest(!onlyTest)} data-testid="tt-ledger-onlytest">{onlyTest ? "Showing TEST only" : "Showing all"}</B></Row>
        <div className="mt-2 max-h-[46dvh] overflow-y-auto font-mono text-[10px]" data-testid="tt-ledger">
          {rows.map((t) => (
            <div key={t.id} className="grid grid-cols-[auto_1fr_auto] gap-2 border-b border-zinc-800 py-1">
              <span className="text-zinc-500">{new Date(t.t * 1000).toLocaleTimeString()}</span>
              <span className="truncate text-zinc-300"><b className={t.category === "TEST" ? "text-gold" : ""}>{t.category}</b> {t.description}</span>
              <span className={t.type === "inflow" ? "text-kgreen" : "text-blood"}>{t.type === "inflow" ? "+" : "-"}{fmtN(t.amount)} {t.currency[0]}</span>
            </div>
          ))}
          {!rows.length && <div className="text-zinc-500">No entries.</div>}
        </div>
      </Box>
      <div className="mt-3 text-[10px] text-zinc-500">Build flag VITE_ENABLE_TEST_TOOLS=true. Build with it false to remove this panel and every cheat.</div>
    </div>
  );
}

// ---------------- Audit Log ----------------
function AuditLogTab() {
  const p = useGame((s) => s.player);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const logs = useMemo(() => {
    const list = [];
    (p.log || []).forEach((l, idx) => {
      list.push({
        id: `log_${l.t}_${idx}`,
        t: l.t,
        type: "log",
        kind: l.kind || "info",
        desc: l.msg,
      });
    });
    (p.cash_statement || []).forEach((s) => {
      list.push({
        id: s.id || `cash_${s.t}`,
        t: s.t,
        type: "cash",
        category: s.category,
        desc: s.description,
        amount: s.amount,
        flow: s.type,
        cur: s.currency,
        balD: s.balance_dirty,
        balC: s.balance_clean,
      });
    });
    list.sort((a, b) => b.t - a.t);
    return list;
  }, [p.log, p.cash_statement]);

  const filtered = logs.filter((item) => {
    if (filter === "cash" && item.type !== "cash") return false;
    if (filter === "log" && item.type !== "log") return false;
    if (filter === "warn" && item.kind !== "warn" && item.kind !== "bad") return false;
    if (filter === "event" && !item.desc?.toUpperCase().includes("EVENT") && !item.desc?.toUpperCase().includes("RAID") && !item.desc?.toUpperCase().includes("CRISIS")) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      const matchDesc = item.desc?.toLowerCase().includes(q);
      const matchCat = item.category?.toLowerCase().includes(q);
      if (!matchDesc && !matchCat) return false;
    }
    return true;
  });

  const exportAudit = () => {
    const blob = new Blob([JSON.stringify({ player: p.name, exported_at: new Date().toISOString(), audit_records: logs }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_log_${p.name}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Audit log exported as JSON!");
  };

  return (
    <div data-testid="tt-tab-audit" className="space-y-3">
      <Box title="System & Financial Audit Inspector">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>Tracking <b>{logs.length}</b> total events ({p.cash_statement?.length || 0} financial, {p.log?.length || 0} system actions)</span>
          <B variant="gold" className="!px-3 !py-1 text-xs" onClick={exportAudit}>Export Audit JSON</B>
        </div>
        <div className="mt-2">
          <input
            type="text"
            placeholder="Search audit records..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {[["all", "All Records"], ["cash", "Financial Ledger"], ["log", "System Logs"], ["event", "Events & Raids"], ["warn", "Warnings & Errors"]].map(([k, label]) => (
            <B key={k} variant={filter === k ? "gold" : "ghost"} className="!min-h-[30px] !px-2.5 !py-1 text-[10px]" onClick={() => setFilter(k)}>
              {label}
            </B>
          ))}
        </div>
      </Box>

      <Box title={`Filtered Entries (${filtered.length})`}>
        <div className="max-h-[55dvh] overflow-y-auto space-y-1.5 font-mono text-[11px]">
          {filtered.slice(0, 150).map((it) => (
            <div key={it.id} className="border-b border-zinc-800/80 p-1.5 bg-black/40 rounded flex flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500">
                  {new Date(it.t * 1000).toLocaleTimeString()}
                </span>
                {it.type === "cash" ? (
                  <span className={`text-[10px] font-bold ${it.flow === "inflow" ? "text-kgreen" : "text-blood"}`}>
                    {it.flow === "inflow" ? "+" : "-"}GH₵{fmtN(it.amount)} {it.cur}
                  </span>
                ) : (
                  <span className={`text-[9px] uppercase px-1 rounded ${it.kind === "good" ? "bg-kgreen/20 text-kgreen" : it.kind === "warn" || it.kind === "bad" ? "bg-blood/20 text-blood" : "bg-zinc-800 text-zinc-300"}`}>
                    {it.kind}
                  </span>
                )}
              </div>
              <div className="text-zinc-200 text-xs">
                {it.category && <b className="text-gold mr-1">[{it.category}]</b>}
                {it.desc}
              </div>
              {it.type === "cash" && (it.balD !== undefined || it.balC !== undefined) && (
                <div className="text-[10px] text-zinc-500">
                  Post-balance: GH₵{fmtN(it.balC)} clean · GH₵{fmtN(it.balD)} dirty
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && <div className="text-zinc-500 py-4 text-center">No audit records match filter.</div>}
        </div>
      </Box>
    </div>
  );
}

// ---------------- Overrides ----------------
const OVERRIDE_CATEGORIES = [
  ["all", "All Categories"],
  ["general", "General, Rush & Land"],
  ["hustles", "Street Hustles"],
  ["fronts", "Laundering Fronts"],
  ["facilities", "Compound Facilities"],
  ["upgrades", "Mansion & Garage"],
  ["gear", "Weapons & Street Gear"],
  ["boutique", "Boutique Gear"],
  ["cosmetics", "Wardrobe Cosmetics"],
  ["bm", "Black Market"],
  ["consumables", "Consumables & Courier"],
  ["farm", "Grow Farm & Strains"],
  ["workshop", "Workshop & Forging"],
  ["robberies", "Robberies"],
  ["smuggling", "Smuggling Routes"],
  ["girlfriends", "Girlfriends"],
  ["assassin", "Assassin Contracts"],
  ["studio", "Music Studio"],
  ["heists", "Heists & Prep"],
  ["luxury", "Luxury Boutique"],
];

function OverridesTab() {
  const [active, setActive] = useState(() => localStorage.getItem(OVERRIDES_ACTIVE_KEY) === "true");
  const [cat, setCat] = useState("all");
  const [search, setSearch] = useState("");
  const [overrides, setOverrides] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(OVERRIDES_DATA_KEY) || "{}");
    } catch {
      return {};
    }
  });

  const syncLiveGame = (nextOverrides, nextActive) => {
    applyValueOverrides(nextOverrides, nextActive);
    try {
      useGame.getState().load();
    } catch {
      // ignore if store not ready
    }
  };

  const updateVal = (k, v) => {
    const updated = { ...overrides };
    if (v === "" || v === null || v === undefined) {
      delete updated[k];
    } else {
      const n = Number(v);
      updated[k] = Number.isFinite(n) ? n : v;
    }
    setOverrides(updated);
    localStorage.setItem(OVERRIDES_DATA_KEY, JSON.stringify(updated));
    if (!active) {
      setActive(true);
      localStorage.setItem(OVERRIDES_ACTIVE_KEY, "true");
    }
    syncLiveGame(updated, true);
  };

  const toggleActive = () => {
    const n = !active;
    setActive(n);
    localStorage.setItem(OVERRIDES_ACTIVE_KEY, String(n));
    syncLiveGame(overrides, n);
    toast.success(n ? "Value overrides enabled & applied live!" : "Value overrides disabled (reverted to defaults).");
  };

  const downloadJson = () => {
    const payload = buildOverridesExportPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `game_value_overrides_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded game_value_overrides.json! Share this file to apply changes permanently.");
  };

  const copyJson = async () => {
    try {
      const payload = buildOverridesExportPayload();
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      toast.success("Copied Overrides JSON to clipboard!");
    } catch {
      toast.error("Could not copy to clipboard — use Download Overrides JSON.");
    }
  };

  const importJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || "{}"));
        const importedOverrides = parsed.overrides && typeof parsed.overrides === "object" ? parsed.overrides : parsed;
        setOverrides(importedOverrides);
        setActive(true);
        localStorage.setItem(OVERRIDES_DATA_KEY, JSON.stringify(importedOverrides));
        localStorage.setItem(OVERRIDES_ACTIVE_KEY, "true");
        syncLiveGame(importedOverrides, true);
        toast.success(`Imported ${Object.keys(importedOverrides).length} value overrides!`);
      } catch {
        toast.error("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  const resetAll = () => {
    setOverrides({});
    localStorage.removeItem(OVERRIDES_DATA_KEY);
    syncLiveGame({}, active);
    toast.info("All overrides reset to game defaults.");
  };

  const q = search.trim().toLowerCase();
  const match = (text) => !q || String(text || "").toLowerCase().includes(q);
  const showCat = (c) => cat === "all" || cat === c;
  const changedCount = Object.keys(overrides).length;

  const Field = ({ label, k, defVal, step = 1 }) => (
    <label className="block text-[9px] uppercase text-zinc-400">
      <span className="flex items-center justify-between gap-1 truncate">
        <span className="truncate">{label}</span>
        <span className="font-mono text-zinc-500">def: {fmtN(defVal)}</span>
      </span>
      <input
        type="number"
        step={step}
        inputMode="decimal"
        value={overrides[k] !== undefined ? overrides[k] : defVal}
        onChange={(e) => updateVal(k, e.target.value)}
        className={`${inputCls} mt-0.5 min-h-[34px] font-mono text-xs ${overrides[k] !== undefined && Number(overrides[k]) !== Number(defVal) ? "border-gold bg-gold/10 text-gold font-bold" : ""}`}
        data-testid={`ov-${k}`}
      />
    </label>
  );

  return (
    <div data-testid="tt-tab-overrides" className="space-y-3">
      <Box title="Master Game Cost & Value Overrides">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <B variant={active ? "gold" : "ghost"} onClick={toggleActive} data-testid="tt-overrides-toggle">
            {active ? `⚡ Overrides ACTIVE (${changedCount} edited)` : "Overrides Disabled"}
          </B>
          <div className="flex flex-wrap gap-1.5">
            <B variant="gold" onClick={downloadJson} data-testid="tt-overrides-download">Download Overrides JSON</B>
            <B onClick={copyJson} data-testid="tt-overrides-copy">Copy JSON</B>
            <label className="inline-flex min-h-[40px] cursor-pointer items-center border border-zinc-700 bg-surface px-3 text-xs font-bold uppercase text-zinc-200 hover:border-gold">
              Import JSON
              <input type="file" accept=".json,application/json" onChange={importJson} className="hidden" />
            </label>
            <B onClick={resetAll} data-testid="tt-overrides-reset">Reset Defaults</B>
          </div>
        </div>
        <p className="mt-2 text-xs text-zinc-400">
          Change any cost, fee, timer, or payout in the game below. Changes apply live immediately. Click <b>Download Overrides JSON</b> or <b>Copy JSON</b> to share your numbers and make them permanent.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Sel value={cat} onChange={setCat} options={OVERRIDE_CATEGORIES} testid="tt-overrides-category" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter items by name or id..."
            className={inputCls}
            data-testid="tt-overrides-search"
          />
        </div>
      </Box>

      {showCat("general") && (
        <Box title="General Economy, Rush & Land Unlock Fees">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Side Hustle Rush Build Fee (Clean)" k="general_rush_hustle_fee" defVal={ORIGINAL_DEFAULTS.general.rush_hustle_fee} />
            <Field label="Crew Recruit Base Cost (Dirty)" k="general_crew_hire_base" defVal={ORIGINAL_DEFAULTS.general.crew_hire_base_cost} />
            <Field label="Crew Daily Salary Base (Clean/day)" k="general_crew_wage_base" defVal={ORIGINAL_DEFAULTS.general.crew_wage_base} />
            <Field label="Crew Daily Salary Step per Lvl" k="general_crew_wage_step" defVal={ORIGINAL_DEFAULTS.general.crew_wage_step} />
            <Field label="Vault Base Capacity" k="general_vault_base_cap" defVal={ORIGINAL_DEFAULTS.general.vault_base_cap} />
            <Field label="Vault Capacity per Level" k="general_vault_cap_per_lvl" defVal={ORIGINAL_DEFAULTS.general.vault_cap_per_level} />
          </div>
          <Label>Land Plot Unlock Fees (Clean Cash)</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ORIGINAL_DEFAULTS.land_fees.map((fee, i) => (
              <Field key={i} label={`Land Plot #${i + 1}`} k={`land_fee_${i}`} defVal={fee} />
            ))}
          </div>
        </Box>
      )}

      {showCat("hustles") && (
        <Box title="Street Hustles (Base Income/min, Clean Build Cost, Time, Crew)">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ORIGINAL_DEFAULTS.hustles.filter((h) => match(h.name) || match(h.id)).map((h) => (
              <div key={h.id} className="rounded border border-zinc-800 bg-black/30 p-2">
                <div className="mb-1 text-[10px] font-bold uppercase text-gold">{h.name} <span className="text-zinc-500">({h.id})</span></div>
                <div className="grid grid-cols-2 gap-1.5">
                  <Field label="Base Income (/min)" k={`hustle_rate_${h.id}`} defVal={h.income} />
                  <Field label="Build Cost (Clean)" k={`hustle_cost_${h.id}`} defVal={h.cost} />
                  <Field label="Build Time (sec)" k={`hustle_time_${h.id}`} defVal={h.build_time} />
                  <Field label="Builders Needed" k={`hustle_crew_${h.id}`} defVal={h.build_crew} />
                </div>
              </div>
            ))}
          </div>
        </Box>
      )}

      {showCat("fronts") && (
        <Box title="Money Laundering Fronts (Clean Cost, Wash Cap, Duration)">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ORIGINAL_DEFAULTS.fronts.filter((f) => match(f.name) || match(f.id)).map((f) => (
              <div key={f.id} className="rounded border border-zinc-800 bg-black/30 p-2">
                <div className="mb-1 text-[10px] font-bold uppercase text-gold">{f.name}</div>
                <div className="grid grid-cols-3 gap-1.5">
                  <Field label="Cost (Clean)" k={`front_cost_${f.id}`} defVal={f.cost} />
                  <Field label="Wash Cap" k={`front_cap_${f.id}`} defVal={f.cap} />
                  <Field label="Duration (s)" k={`front_dur_${f.id}`} defVal={f.dur} />
                </div>
              </div>
            ))}
          </div>
        </Box>
      )}

      {showCat("facilities") && (
        <Box title="Compound Facilities (Dirty & Clean Build Costs)">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ORIGINAL_DEFAULTS.facilities.filter((f) => match(f.name) || match(f.id)).map((f) => (
              <div key={f.id} className="rounded border border-zinc-800 bg-black/30 p-2">
                <div className="mb-1 text-[10px] font-bold uppercase text-gold">{f.name}</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <Field label="Dirty Cost" k={`facility_dirty_${f.id}`} defVal={f.cost_dirty} />
                  <Field label="Clean Cost" k={`facility_clean_${f.id}`} defVal={f.cost_clean} />
                </div>
              </div>
            ))}
          </div>
        </Box>
      )}

      {showCat("upgrades") && (
        <Box title="Mansion & Garage Upgrades">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ORIGINAL_DEFAULTS.upgrades.filter((u) => match(u.name) || match(u.id)).map((u) => (
              <div key={u.id} className="rounded border border-zinc-800 bg-black/30 p-2">
                <div className="mb-1 text-[10px] font-bold uppercase text-gold">{u.name}</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <Field label="Base Cost" k={`upgrade_cost_${u.id}`} defVal={u.cost} />
                  <Field label="AP Cost" k={`upgrade_ap_${u.id}`} defVal={u.ap_cost} />
                </div>
              </div>
            ))}
          </div>
        </Box>
      )}

      {showCat("gear") && (
        <Box title="Weapons & Street Gear">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ORIGINAL_DEFAULTS.gear.filter((g) => match(g.name) || match(g.id) || match(g.slot)).map((g) => (
              <div key={g.id} className="rounded border border-zinc-800 bg-black/30 p-2">
                <div className="mb-1 text-[10px] font-bold uppercase text-zinc-200">{g.name} <span className="text-zinc-500">[{g.slot}]</span></div>
                <div className="grid grid-cols-2 gap-1.5">
                  <Field label="Price" k={`gear_price_${g.id}`} defVal={g.price} />
                  <Field label="Power / Bonus" k={`gear_power_${g.id}`} defVal={g.power} />
                </div>
              </div>
            ))}
          </div>
        </Box>
      )}

      {showCat("boutique") && (
        <Box title="Boutique Designer Catalog (Clean Cash)">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ORIGINAL_DEFAULTS.boutique_catalog.filter((b) => match(b.name) || match(b.id)).map((b) => (
              <div key={b.id} className="rounded border border-zinc-800 bg-black/30 p-2">
                <div className="mb-1 text-[10px] font-bold uppercase text-zinc-200">{b.name}</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <Field label="Clean Price" k={`boutique_clean_${b.id}`} defVal={b.clean} />
                  <Field label="Power / Bonus" k={`boutique_power_${b.id}`} defVal={b.power} />
                </div>
              </div>
            ))}
          </div>
        </Box>
      )}

      {showCat("cosmetics") && (
        <Box title="Wardrobe Cosmetics (Clean Cash)">
          <div className="grid grid-cols-2 gap-2">
            {ORIGINAL_DEFAULTS.cosmetics.filter((c) => match(c.name) || match(c.id)).map((c) => (
              <Field key={c.id} label={c.name} k={`cosmetic_clean_${c.id}`} defVal={c.clean} />
            ))}
          </div>
        </Box>
      )}

      {showCat("bm") && (
        <Box title="Black Market Items (Dirty Cash)">
          <div className="grid grid-cols-2 gap-2">
            {ORIGINAL_DEFAULTS.black_market.filter((b) => match(b.name) || match(b.id)).map((b) => (
              <Field key={b.id} label={b.name} k={`bm_price_${b.id}`} defVal={b.price} />
            ))}
          </div>
        </Box>
      )}

      {showCat("consumables") && (
        <Box title="Deliverables & Consumables (Clean Cash & Courier Fee)">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ORIGINAL_DEFAULTS.consumables.filter((c) => match(c.name) || match(c.id)).map((c) => (
              <div key={c.id} className="rounded border border-zinc-800 bg-black/30 p-2">
                <div className="mb-1 text-[10px] font-bold uppercase text-zinc-200 truncate">{c.name}</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <Field label="Clean Price" k={`consumable_price_${c.id}`} defVal={c.clean_price} />
                  <Field label="Courier Fee" k={`consumable_fee_${c.id}`} defVal={c.delivery_fee} />
                </div>
              </div>
            ))}
          </div>
        </Box>
      )}

      {showCat("farm") && (
        <Box title="Grow Farm & Botanical Strains">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Field label="Farm Plot Base Cost (Clean)" k="farm_plot_base" defVal={ORIGINAL_DEFAULTS.farm.plot_base} />
            <Field label="Farm Plot Cost Growth" k="farm_plot_growth" defVal={ORIGINAL_DEFAULTS.farm.plot_growth} step={0.1} />
            {Object.entries(ORIGINAL_DEFAULTS.farm.upgrades).map(([k, u]) => (
              <Field key={k} label={`${u.name} Cost`} k={`farm_up_cost_${k}`} defVal={u.cost} />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ORIGINAL_DEFAULTS.strains.filter((s) => match(s.name) || match(s.id)).map((s) => (
              <div key={s.id} className="rounded border border-zinc-800 bg-black/30 p-2">
                <div className="mb-1 text-[10px] font-bold uppercase text-kgreen">{s.name}</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <Field label="Seed Cost (Dirty)" k={`strain_seed_${s.id}`} defVal={s.seed} />
                  <Field label="Base Sell Price" k={`strain_base_${s.id}`} defVal={s.base} />
                  <Field label="Harvest Yield" k={`strain_yield_${s.id}`} defVal={s.yield} />
                  <Field label="Grow Time (s)" k={`strain_grow_${s.id}`} defVal={s.grow} />
                </div>
              </div>
            ))}
          </div>
        </Box>
      )}

      {showCat("workshop") && (
        <Box title="Weapon Workshop & Craftable Weapons">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Field label="Bench Cost (Clean)" k="workshop_bench_cost" defVal={ORIGINAL_DEFAULTS.workshop.bench_cost} />
            <Field label="Bench Growth Mult" k="workshop_bench_growth" defVal={ORIGINAL_DEFAULTS.workshop.bench_growth} step={0.1} />
            {Object.entries(ORIGINAL_DEFAULTS.workshop.upgrades).map(([k, u]) => (
              <Field key={k} label={`${u.name} Cost`} k={`workshop_up_cost_${k}`} defVal={u.cost} />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ORIGINAL_DEFAULTS.craftable_weapons.filter((w) => match(w.name) || match(w.id)).map((w) => (
              <div key={w.id} className="rounded border border-zinc-800 bg-black/30 p-2">
                <div className="mb-1 text-[10px] font-bold uppercase text-gold">{w.name}</div>
                <div className="grid grid-cols-3 gap-1.5">
                  <Field label="Mat Cost (Dirty)" k={`craft_cost_${w.id}`} defVal={w.cost} />
                  <Field label="Craft Time (s)" k={`craft_time_${w.id}`} defVal={w.craft_time} />
                  <Field label="Power" k={`craft_power_${w.id}`} defVal={w.power} />
                </div>
              </div>
            ))}
          </div>
        </Box>
      )}

      {showCat("robberies") && (
        <Box title="Street Robberies">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ORIGINAL_DEFAULTS.robberies.filter((r) => match(r.name) || match(r.id)).map((r) => (
              <div key={r.id} className="rounded border border-zinc-800 bg-black/30 p-2">
                <div className="mb-1 text-[10px] font-bold uppercase text-gold">{r.name}</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <Field label="Prep Cost (Dirty)" k={`robbery_cost_${r.id}`} defVal={r.cost} />
                  <Field label="Cooldown (s)" k={`robbery_cd_${r.id}`} defVal={r.cooldown} />
                  <Field label="Min Reward" k={`robbery_min_${r.id}`} defVal={r.min_reward} />
                  <Field label="Max Reward" k={`robbery_max_${r.id}`} defVal={r.max_reward} />
                </div>
              </div>
            ))}
          </div>
        </Box>
      )}

      {showCat("smuggling") && (
        <Box title="Smuggling & Trafficking Routes">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ORIGINAL_DEFAULTS.trafficking_routes.filter((s) => match(s.name) || match(s.id)).map((s) => (
              <div key={s.id} className="rounded border border-zinc-800 bg-black/30 p-2">
                <div className="mb-1 text-[10px] font-bold uppercase text-gold">{s.name}</div>
                <div className="grid grid-cols-3 gap-1.5">
                  <Field label="Cost" k={`smuggle_cost_${s.id}`} defVal={s.cost} />
                  <Field label="Payout" k={`smuggle_payout_${s.id}`} defVal={s.payout} />
                  <Field label="Duration (s)" k={`smuggle_dur_${s.id}`} defVal={s.duration} />
                </div>
              </div>
            ))}
          </div>
        </Box>
      )}

      {showCat("girlfriends") && (
        <Box title="Girlfriends & Companions (Dirty Cash)">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ORIGINAL_DEFAULTS.girlfriends.filter((g) => match(g.name) || match(g.id)).map((g) => (
              <div key={g.id} className="rounded border border-zinc-800 bg-black/30 p-2">
                <div className="mb-1 text-[10px] font-bold uppercase text-gold">{g.name}</div>
                <div className="grid grid-cols-3 gap-1.5">
                  <Field label="Court Cost" k={`gf_court_${g.id}`} defVal={g.courtCost} />
                  <Field label="Gift Cost" k={`gf_gift_${g.id}`} defVal={g.giftCost} />
                  <Field label="Date Cost" k={`gf_date_${g.id}`} defVal={g.dateCost} />
                </div>
              </div>
            ))}
          </div>
        </Box>
      )}

      {showCat("assassin") && (
        <Box title="Assassin Syndicate Contracts">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Retainer Fee" k="assassin_retainer_fee" defVal={ORIGINAL_DEFAULTS.assassin.retainer_fee} />
            {ORIGINAL_DEFAULTS.assassin.tiers.map((t) => (
              <Field key={t.id} label={`${t.name} Cost`} k={`assassin_tier_cost_${t.id}`} defVal={t.cost} />
            ))}
          </div>
        </Box>
      )}

      {showCat("studio") && (
        <Box title="Music Studio & Recording Tracks">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Field label="Studio Booth Cost (Clean)" k="studio_booth_cost" defVal={ORIGINAL_DEFAULTS.studio.booth_cost} />
            <Field label="Booth Cost Growth" k="studio_booth_growth" defVal={ORIGINAL_DEFAULTS.studio.booth_growth} step={0.1} />
            {Object.entries(ORIGINAL_DEFAULTS.studio.upgrades).map(([k, u]) => (
              <Field key={k} label={`${u.name} Cost`} k={`studio_up_cost_${k}`} defVal={u.cost} />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ORIGINAL_DEFAULTS.music_tracks.filter((t) => match(t.name) || match(t.id)).map((t) => (
              <div key={t.id} className="rounded border border-zinc-800 bg-black/30 p-2">
                <div className="mb-1 text-[10px] font-bold uppercase text-gold">{t.name}</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <Field label="Prod Cost (Dirty)" k={`music_cost_${t.id}`} defVal={t.cost} />
                  <Field label="Duration (s)" k={`music_dur_${t.id}`} defVal={t.duration} />
                  <Field label="Min Royalties" k={`music_min_${t.id}`} defVal={t.min_royalties} />
                  <Field label="Max Royalties" k={`music_max_${t.id}`} defVal={t.max_royalties} />
                </div>
              </div>
            ))}
          </div>
        </Box>
      )}

      {showCat("heists") && (
        <Box title="Heists & Heist Prep Costs">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {Object.entries(HEIST_PREP).map(([id, p]) => (
              <Field key={id} label={`Prep: ${p.name}`} k={`heist_prep_cost_${id}`} defVal={p.cost} />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ORIGINAL_DEFAULTS.heists.filter((h) => match(h.name) || match(h.id)).map((h) => (
              <div key={h.id} className="rounded border border-zinc-800 bg-black/30 p-2">
                <div className="mb-1 text-[10px] font-bold uppercase text-gold">{h.name}</div>
                <div className="grid grid-cols-3 gap-1.5">
                  <Field label="Min Payout" k={`heist_min_${h.id}`} defVal={h.min} />
                  <Field label="Max Payout" k={`heist_max_${h.id}`} defVal={h.max} />
                  <Field label="Duration (s)" k={`heist_dur_${h.id}`} defVal={h.dur} />
                </div>
              </div>
            ))}
          </div>
        </Box>
      )}

      {showCat("luxury") && (
        <Box title="Luxury Boutique (Tier Multipliers & Item Prices)">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 mb-3">
            {[1, 2, 3, 4, 5].map((tier) => (
              <Field key={tier} label={`Tier ${tier} Price Mult`} k={`luxury_tier_mult_${tier}`} defVal={1} step={0.1} />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 max-h-[380px] overflow-y-auto pr-1">
            {ORIGINAL_DEFAULTS.luxury_items.filter((it) => match(it.name) || match(it.id)).slice(0, 60).map((it) => (
              <Field key={it.id} label={`[T${it.tier}] ${it.name}`} k={`luxury_price_${it.id}`} defVal={it.price} />
            ))}
          </div>
        </Box>
      )}
    </div>
  );
}

const VIEWS = {
  economy: EconomyTab,
  assets: AssetsTab,
  cooldowns: CooldownsTab,
  rivals: RivalsTab,
  crew: CrewTab,
  boutique: BoutiqueTab,
  time: TimeTab,
  audit: AuditLogTab,
  overrides: OverridesTab,
  save: SaveTab,
  debug: DebugTab,
};

export default function TestToolsPanel() {
  const [tab, setTab] = useState(() => sessionStorage.getItem("ge_tt_tab") || "economy");
  const p = useGame((s) => s.player);
  const V = VIEWS[tab] || EconomyTab;
  if (!p) return null;
  return (
    <div className="mt-3 pb-6" data-testid="test-tools-panel">
      <div className="flex items-center gap-2">
        <Wrench className="h-5 w-5 text-gold" />
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">Test build only</div>
          <h2 className="font-display text-xl uppercase leading-none text-zinc-100">Test Tools</h2>
        </div>
      </div>
      <div className="no-scrollbar sticky top-0 z-10 -mx-1 mt-3 flex gap-1 overflow-x-auto bg-ink px-1 py-1" role="tablist">
        {TABS.map(([id, l]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => { setTab(id); sessionStorage.setItem("ge_tt_tab", id); }} data-testid={`tt-tab-btn-${id}`}
            className={`btn-press min-h-[40px] shrink-0 border px-3 text-[11px] font-extrabold uppercase tracking-wider ${tab === id ? "border-gold bg-gold text-ink" : "border-zinc-700 text-zinc-300"}`}>{l}</button>
        ))}
      </div>
      <V />
    </div>
  );
}
