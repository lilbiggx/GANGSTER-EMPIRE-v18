import { useState, useMemo } from "react";
import { AlertTriangle, Radio, Shield, Clock, Flame, CheckCircle2, ChevronRight, Zap, Lock, Sparkles, Gem } from "lucide-react";
import { isDevMode, TEST_TOOLS } from "../../lib/devMode";
import { useGame } from "../../store/game";
import { useNow } from "../../hooks/useNow";
import { dur, cedi } from "../../lib/fmt";
import { Btn, Card, Bar, SectionTitle, Chip, Sheet } from "../../components/game/ui";
import { HEIST_EVENT_MAP, ROLE_ARCH } from "../../data/gameData";
import { getDailyHeists, ALL_66_HEISTS } from "../../data/heistsData";
import { Badge, cdText } from "../../components/game/v9";

function chance(tpl, sel, crew, derived, roles, boost, difficultyOffset = 0) {
  let score = 0;
  for (const [slotKey, cid] of Object.entries(sel)) {
    const role = slotKey.split("::")[1] || slotKey;
    const baseRole = role.split(" ")[0]; // handles "Enforcer (Gunner)" -> "Enforcer"
    const c = crew.find((x) => x.id === cid);
    if (!c) continue;
    const statKey = roles[baseRole] || "muscle";
    let s = ((derived?.crew_eff?.[cid]?.[statKey]) ?? (c.stats?.[statKey] || 5)) * 3 + c.lvl * 2 + (derived?.crew_wpow?.[cid] || 0) * 0.5;
    if (c.arch === ROLE_ARCH[baseRole]) s *= 1.25;
    score += s;
  }
  // Base chance is 0.4 instead of 0.5 to make it harder, plus a random negative offset
  const base = 0.4 + difficultyOffset;
  return Math.round(Math.max(0.10, Math.min(0.95, base + (score / tpl.diff - 1) * 0.6 + boost)) * 100);
}

function PlanSheet({ tpl, onClose }) {
  const { player: p, derived: d, config, act } = useGame();
  const now = useNow(1000);
  const [sel, setSel] = useState({});
  const [approach, setApproach] = useState("balanced");
  const [prep, setPrep] = useState([]);
  
  // Filter out assigned crew AND injured crew (injured crew cannot perform heists)
  const isInjured = (c) => Boolean(c.injury || (c.injured_until && c.injured_until > now));
  const free = (p.crew || []).filter((c) => !c.assign && !isInjured(c));
  
  const slotKeys = tpl.roles.map((r, i) => `${i}::${r}`);
  const filled = slotKeys.every((k) => sel[k]);
  const reward = Math.floor((tpl.reward * (1 + 0.08 * p.level)) / 10);
  const ap = config.approaches[approach];
  const owned = config.black_market.filter((i) => i.kind.startsWith("heist_") && p.inv[i.id] > 0);
  const itemMult = (k) => owned.filter((i) => i.kind === k).reduce((m, i) => m * i.value, 1);
  const boost = ap.chance + (prep.includes("intel") ? 0.12 : 0) + owned.filter((i) => i.kind === "heist_boost").reduce((s, i) => s + i.value, 0);

  // Randomize initial difficulty for this specific target instance
  const difficultyOffset = useMemo(() => {
    // Deterministic-ish random based on tpl ID and current player state but changes enough
    const seed = (tpl.id + p.level + p.xp).split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0);
    // Random offset between -0.20 and -0.05 (making it significantly harder)
    return -0.05 - (Math.abs(seed % 15) / 100);
  }, [tpl.id, p.level]);

  const pct = chance(tpl, sel, p.crew, d, config.roles, boost, difficultyOffset);
  const prepCost = prep.reduce((s, k) => s + Math.floor((reward * 10) * config.prep[k].cost), 0); // Cost based on original reward scale
  const durS = tpl.dur * (1 - 0.05 * (p.upgrades?.okada || 0)) * ap.dur * (prep.includes("getaway") ? 0.7 : 1) * itemMult("heist_speed");
  const togglePrep = (k) => setPrep(prep.includes(k) ? prep.filter((x) => x !== k) : [...prep, k]);

  return (
    <Sheet open onClose={onClose} testid="heist-plan-sheet">
      <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-blood">
        Tactical Syndicate Operation · ({d?.heist_count ?? 0}/{d?.heist_limit ?? 3} Today)
      </div>
      <h3 className="font-display text-2xl uppercase text-zinc-100">{tpl.name}</h3>
      <div className="mt-1 text-xs text-zinc-400" data-testid="heist-plan-summary">
        Takes {dur(durS)} · +{Math.round(tpl.heat * ap.heat * itemMult("heist_heat"))} heat
        {owned.length > 0 && ` · Boost items: ${owned.map((i) => i.name).join(", ")}`}
      </div>

      <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-gold">Tactical Approach</div>
      <div className="mt-1 grid grid-cols-4 gap-1">
        {Object.entries(config.approaches).map(([k, a]) => (
          <button
            key={k}
            onClick={() => setApproach(k)}
            data-testid={`heist-approach-${k}`}
            className={`btn-press border px-1 py-1.5 text-[10px] font-extrabold uppercase ${
              approach === k ? "border-gold bg-gold text-ink" : "border-zinc-700 text-zinc-300"
            }`}
          >
            {a.name}
          </button>
        ))}
      </div>
      <div className="mt-1 text-[11px] text-zinc-500">{ap.desc}</div>

      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {Object.entries(config.prep).map(([k, x]) => (
          <button
            key={k}
            onClick={() => togglePrep(k)}
            data-testid={`heist-prep-${k}`}
            className={`btn-press border p-2 text-left ${prep.includes(k) ? "border-kgreen bg-surface2" : "border-zinc-800"}`}
          >
            <div className={`text-[11px] font-bold ${prep.includes(k) ? "text-kgreen" : "text-zinc-200"}`}>{x.name}</div>
            <div className="text-[10px] text-zinc-500">{x.desc} · {cedi(Math.floor(reward * x.cost))}</div>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3">
        {slotKeys.map((slotKey) => {
          const role = slotKey.split("::")[1];
          const baseRole = role.split(" ")[0];
          const statKey = config.roles[baseRole] || "muscle";
          return (
            <div key={slotKey}>
              <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gold">
                Slot: {role} <span className="text-zinc-500">({statKey})</span>
              </div>
               <div className="hide-scrollbar flex gap-1.5 overflow-x-auto">
                {(p.crew || []).map((c) => {
                  const injured = isInjured(c);
                  const busy = Boolean(c.assign);
                  const taken = Object.entries(sel).some(([k, id]) => id === c.id && k !== slotKey);
                  const on = sel[slotKey] === c.id;
                  const statVal = d?.crew_eff?.[c.id]?.[statKey] ?? c.stats?.[statKey] ?? 5;
                  const isMatchingRole = c.arch === ROLE_ARCH[baseRole];

                  return (
                    <button
                      key={c.id}
                      disabled={taken || busy || injured}
                      onClick={() => setSel({ ...sel, [slotKey]: on ? undefined : c.id })}
                      data-testid={`heist-role-${role}-${c.id}`}
                      className={`btn-press shrink-0 border px-2.5 py-1.5 text-left text-[11px] disabled:opacity-40 ${
                        on ? "border-gold bg-gold text-ink" : busy || injured ? "border-zinc-900 bg-zinc-950 text-zinc-600" : "border-zinc-700 text-zinc-300"
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1">
                        {c.name.split(" ")[0]}
                        {isMatchingRole && <span className="text-[9px] px-1 bg-gold/20 text-gold rounded font-normal">Expert</span>}
                      </div>
                      <div className="opacity-70 text-[10px]">
                        {busy ? <span className="text-rose-400 font-bold">Busy ({c.assign})</span> : injured ? <span className="text-blood font-bold">Injured</span> : <>{c.arch} · {statKey} {statVal} · {c.morale ?? 85}%</>}
                      </div>
                    </button>
                  );
                })}
                {!(p.crew || []).length && <span className="text-xs text-zinc-500">No crew available. Hire at Agency.</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-end justify-between border-t border-zinc-800 pt-3">
        <div>
          <div className="text-[10px] uppercase text-zinc-500">Estimated Success Rate</div>
          <div className="font-display text-4xl text-gold" data-testid="heist-chance">
            {filled ? pct : "--"}%
          </div>
        </div>
        <div className="text-right text-xs text-zinc-400">
          Payout up to<br />
          <b className="text-gold font-display text-base">{cedi(Math.floor(reward * ap.reward))}</b>
          {prepCost > 0 && <div className="text-[10px] text-zinc-500">Prep: {cedi(prepCost)}</div>}
        </div>
      </div>

      <Btn
        className="mt-4 w-full py-3"
        disabled={!filled || Number(p.dirty) < prepCost || (d.cooldowns?.heist_left_by?.[tpl.id] || 0) > 0}
        data-testid="heist-start-btn"
        onClick={() => {
          act("heist_start", {
            tpl: tpl.id,
            approach,
            prep,
            crew: Object.fromEntries(Object.entries(sel).filter(([, v]) => v)),
            pct,
          });
          onClose();
        }}
      >
        Launch Daily Heist Operation
      </Btn>
    </Sheet>
  );
}

function ResultSheet({ res, onClose }) {
  const color = res.outcome === "success" ? "text-kgreen" : res.outcome === "partial" ? "text-gold" : "text-blood";
  return (
    <Sheet open onClose={onClose} testid="heist-result-sheet">
      <div className={`font-display text-3xl uppercase ${color}`} data-testid="heist-result-outcome">
        {res.outcome === "success" ? "Clean Heist Extraction!" : res.outcome === "partial" ? "Partial Heist" : "Heist Botched!"}
      </div>
      <div className="text-sm text-zinc-400">
        Estimated chance was {res.chance}% · Loot secured: <b className="text-gold font-display">{cedi(res.reward)}</b>
      </div>
      {res.drop && (
        <div className="mt-3 border border-gold bg-gold/10 px-3 py-2 text-xs text-gold flex items-center gap-1.5" data-testid="heist-result-drop">
          <Zap className="h-4 w-4" />
          Rare Loot Acquired: {useGame.getState().config.gear.find((g) => g.id === res.drop)?.name || res.drop}. Check your Locker!
        </div>
      )}
      <div className="mt-4 border border-zinc-800 bg-black p-3 font-mono text-xs text-zinc-400 space-y-1" data-testid="heist-log">
        {res.log.map((l, i) => (
          <div key={i} className={l.startsWith("⚠️") ? "text-blood" : l.startsWith("✅") ? "text-kgreen" : i === res.log.length - 1 ? color : ""}>
            &gt; {l}
          </div>
        ))}
      </div>
      <Btn className="mt-5 w-full" onClick={onClose} data-testid="heist-result-close-btn">
        Return to Empire
      </Btn>
    </Sheet>
  );
}

export default function Heists() {
  const { player: p, derived: d, config, act, showAd } = useGame();
  const now = useNow(1000);
  const [plan, setPlan] = useState(null);
  const [res, setRes] = useState(null);

  const todayKey = new Date(now * 1000).toISOString().slice(0, 10);
  const dailyTargets = useMemo(() => getDailyHeists(todayKey), [todayKey]);

  const heistCount = d?.heist_count ?? (p.heist_day?.day === todayKey ? p.heist_day.count : 0);
  const heistLimit = d?.heist_limit ?? (config.daily_heist_base_limit || 3);
  // v9: each heist has its own 8h lock that starts when that heist completes (win or lose)
  const heistCdOf = (id) => {
    const until = d?.cooldowns?.heist_until_by?.[id] || 0;
    const running = p.heists.some((h) => h.tpl === id);
    if (running) return Math.max(1, until - now);
    return Math.max(0, until - now);
  };
  const lockedCount = dailyTargets.filter((t) => heistCdOf(t.id) > 0 && !p.heists.some((h) => h.tpl === t.id)).length;
  const readyIds = d?.badges?.heist?.ready_ids || [];
  const limitReached = d?.heist_limit_reached ?? (heistCount >= heistLimit);

  const tierBadge = (tier = 1) => {
    switch (tier) {
      case 8: return { label: "T8 · SOVEREIGN", cls: "bg-pink-950/80 text-pink-300 border-pink-600/60" };
      case 7: return { label: "T7 · NATIONAL", cls: "bg-red-950/80 text-red-300 border-red-600/60" };
      case 6: return { label: "T6 · GLOBAL", cls: "bg-orange-950/80 text-orange-300 border-orange-600/60" };
      case 5: return { label: "T5 · LEGENDARY", cls: "bg-amber-950/80 text-amber-300 border-amber-600/60" };
      case 4: return { label: "T4 · SYNDICATE", cls: "bg-purple-950/80 text-purple-300 border-purple-600/60" };
      case 3: return { label: "T3 · INDUSTRIAL", cls: "bg-sky-950/80 text-sky-300 border-sky-600/60" };
      case 2: return { label: "T2 · COMMERCIAL", cls: "bg-emerald-950/80 text-emerald-300 border-emerald-600/60" };
      default: return { label: "T1 · STREET", cls: "bg-zinc-800 text-zinc-300 border-zinc-700" };
    }
  };

  return (
    <div className="space-y-4">
      {/* Active Running Heists */}
      {p.heists.length > 0 && (
        <div>
          <SectionTitle kicker="Operation in Progress" title="Live Tactical Heists" />
          <div className="grid gap-3">
            {p.heists.map((h) => {
              const tpl = ALL_66_HEISTS.find((t) => t.id === h.tpl) || config.heists.find((t) => t.id === h.tpl) || { name: h.tpl, dur: 1800 };
              const ready = h.end <= now;
              const elapsed = now - (h.start || (h.end - tpl.dur));
              const total = h.end - (h.start || (h.end - tpl.dur));
              const progressPct = Math.min(100, Math.max(0, (elapsed / (total || 1)) * 100));

              // Find active unaddressed events
              const activeEvents = (h.events || []).filter((e) => now >= e.trigger_at && !e.resolved);
              const resolvedEvents = (h.events || []).filter((e) => e.resolved);

              return (
                <Card key={h.id} accent={ready ? "green" : activeEvents.length > 0 ? "red" : "gold"} data-testid={`active-heist-${h.tpl}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-display uppercase text-base text-zinc-100 font-bold">{tpl.name}</span>
                      <div className="text-[10px] text-zinc-400">
                        Approach: <b className="capitalize text-gold">{h.approach || "balanced"}</b> · Est. Success: <b className="text-zinc-100">{h.pct}%</b>
                      </div>
                    </div>
                    <span className="font-mono text-sm font-bold text-gold">
                      {ready ? "Ready for Extraction" : dur(h.end - now)}
                    </span>
                  </div>

                  <div className="my-2">
                    <Bar pct={progressPct} color={ready ? "green" : activeEvents.length > 0 ? "red" : "gold"} />
                  </div>

                  <div className="text-[10px] text-zinc-500 font-mono">
                    Roster: {Object.values(h.sel || {}).map((cid) => p.crew.find((c) => c.id === cid)?.name.split(" ")[0]).filter(Boolean).join(" · ")}
                  </div>

                  {/* LIVE CRISIS EVENTS ALERT BANNER */}
                  {activeEvents.map((ev) => {
                    const evDef = HEIST_EVENT_MAP[ev.event_id];
                    if (!evDef) return null;
                    const timeLeft = Math.max(0, ev.expires_at - now);

                    return (
                      <div
                        key={ev.uid}
                        className="mt-3 rounded border-2 border-blood bg-gradient-to-b from-blood/20 to-ink p-3 space-y-2 animate-pulse"
                        data-testid={`heist-crisis-${ev.event_id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase text-blood">
                            <AlertTriangle className="h-4 w-4 shrink-0 text-blood animate-bounce" />
                            <span>CRISIS: {evDef.title}</span>
                          </div>
                          <span className="text-[11px] font-mono font-bold text-blood bg-blood/20 px-2 py-0.5 border border-blood">
                            ⚠️ {dur(timeLeft)} LEFT
                          </span>
                        </div>

                        {/* Radio Chatter */}
                        <div className="rounded border border-zinc-800 bg-black/80 p-2 text-xs text-amber-300 font-mono flex items-start gap-2">
                          <Radio className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-zinc-500 block">Radio Intercept</span>
                            "{evDef.radio_chatter}"
                          </div>
                        </div>

                        <div className="text-[11px] text-zinc-300">
                          {evDef.desc}
                        </div>

                        <div className="text-[10px] text-blood">
                          Failure warning: If ignored, success chance drops by {evDef.fail_penalty.chance_drop}% and heat surges!
                        </div>

                        {/* Interactive Choices */}
                        <div className="grid gap-1.5 pt-1">
                          {evDef.choices.map((choice) => {
                            const req = choice.req_role;
                            const hasRole = !req || Object.values(h.sel || {}).some((cid) => {
                              const cm = p.crew.find((c) => c.id === cid);
                              return cm && (cm.arch === ROLE_ARCH[req] || cm.arch === req.toLowerCase());
                            });
                            const hasCleanCost = !choice.cost_clean || BigInt(p.clean) >= BigInt(choice.cost_clean);
                            const hasDirtyCost = !choice.cost_dirty || BigInt(p.dirty) >= BigInt(choice.cost_dirty);
                            const canDo = hasRole && hasCleanCost && hasDirtyCost;

                            return (
                              <button
                                key={choice.id}
                                disabled={!canDo}
                                onClick={() => act("resolve_heist_event", { hid: h.id, event_uid: ev.uid, choice_id: choice.id })}
                                className="btn-press flex items-center justify-between border border-zinc-700 bg-zinc-900/90 p-2 text-left hover:border-gold disabled:opacity-40 transition-colors"
                                data-testid={`heist-choice-${choice.id}`}
                              >
                                <div className="min-w-0 pr-2">
                                  <div className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                                    <span>{choice.label}</span>
                                    {req && (
                                      <span className={`text-[9px] px-1 rounded ${hasRole ? "bg-kgreen/20 text-kgreen" : "bg-blood/20 text-blood"}`}>
                                        Requires {req}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-zinc-400 mt-0.5">{choice.desc}</div>
                                </div>
                                <div className="shrink-0 text-right">
                                  <span className="text-[10px] font-bold text-kgreen block">
                                    {choice.chance_mod >= 0 ? `+${choice.chance_mod}%` : `${choice.chance_mod}%`} chance
                                  </span>
                                  {choice.cost_clean && <span className="text-[9px] text-zinc-400 block">{cedi(choice.cost_clean)} clean</span>}
                                  {choice.cost_dirty && <span className="text-[9px] text-zinc-400 block">{cedi(choice.cost_dirty)} dirty</span>}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Resolved Events History */}
                  {resolvedEvents.length > 0 && (
                    <div className="mt-2 space-y-1 text-[10px]">
                      {resolvedEvents.map((e, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-zinc-400">
                          {e.penalty_applied ? (
                            <span className="text-blood">⚠️ {e.outcome}</span>
                          ) : (
                            <span className="text-kgreen flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              {e.outcome}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {ready && (
                    <Btn
                      variant="green"
                      className="mt-3 w-full py-2.5 font-bold"
                      onClick={() => act("heist_claim", { hid: h.id }, { onResult: setRes })}
                      data-testid={`heist-claim-btn-${h.tpl}`}
                    >
                      Inspect Scores & Claim Loot
                    </Btn>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Daily Heist Targets */}
      <div>
        <SectionTitle
          kicker="High Stakes Underworld Operations · 66 Total Database"
          title="Daily Heist Circle (8 Rotating)"
          right={
            limitReached ? (
              <Chip className="bg-blood/20 text-blood border-blood/30" data-testid="heist-daily-status">{heistCount}/{heistLimit} Done Today</Chip>
            ) : (
              <Chip className="bg-kgreen/20 text-kgreen border-kgreen/30" data-testid="heist-daily-status">Available ({heistCount}/{heistLimit})</Chip>
            )
          }
        />
        {lockedCount > 0 && (
          <div className="-mt-1 mb-2 text-[11px] text-orange-400" data-testid="heist-cooldown">
            <Lock className="mr-1 inline h-3 w-3" />{lockedCount} heist{lockedCount > 1 ? "s" : ""} lying low. Each heist locks for 8h after it completes; others stay open.
          </div>
        )}
        <p className="-mt-1 mb-3 text-xs text-zinc-400">
          8 targets selected daily across Accra and Ghana. Higher tiers carry greater payouts and exclusive chances to plunder rare luxury assets into your syndicate vault!
        </p>

        {limitReached && p.heists.length === 0 && (
          <div className="mb-3 border border-zinc-800 bg-surface p-3 text-xs text-zinc-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2" data-testid="heist-limit-banner">
            <span>Daily Heist Limit reached ({heistCount}/{heistLimit}). Syndicate cooldown resets at midnight or watch a broadcast.</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => showAd("heist_slot")}
                className="text-[10px] text-kgreen font-bold uppercase underline border border-kgreen/30 px-2 py-1 bg-kgreen/10 hover:bg-kgreen/20 transition-colors"
                data-testid="heist-ad-extra-btn"
              >
                📺 +1 Extra Heist Slot
              </button>
              {TEST_TOOLS && <button
                onClick={() => import("../../components/game/testtools/TestToolsPanel").then((m) => m.runTT("reset_heist_limit", {}, "Daily heist limit reset"))}
                className="text-[10px] text-gold font-bold uppercase underline"
                data-testid="heist-dev-reset-btn"
              >
                Reset for testing
              </button>}
            </div>
          </div>
        )}

        <div className="grid gap-2.5">
          {dailyTargets.map((t) => {
            const running = p.heists.some((h) => h.tpl === t.id);
            const heistCd = running ? 0 : heistCdOf(t.id);
            const readyAgain = readyIds.includes(t.id);
            const rewardAmt = Math.floor((t.reward * (1 + 0.08 * p.level)) / 10);
            const tb = tierBadge(t.tier);

            return (
              <Card
                key={t.id}
                accent="gold"
                data-testid={`heist-card-${t.id}`}
                className="p-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className={`text-[8px] font-black uppercase px-1 py-0.5 rounded-sm border ${tb.cls}`}>
                        {tb.label.split(" · ")[0]}
                      </span>
                      {t.luxury_drop_chance && (
                        <span className="flex items-center gap-0.5 text-[8px] font-black text-gold bg-gold/10 border border-gold/30 px-1 py-0.5 rounded-sm">
                          <Gem className="h-2.5 w-2.5" />
                          {Math.round(t.luxury_drop_chance * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="font-display text-sm uppercase text-zinc-100 font-black truncate tracking-tight">{t.name}</div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {t.roles.map((r, i) => (
                        <span key={i} className="text-[8px] font-black uppercase text-zinc-500 bg-zinc-900 border border-zinc-800 px-1 rounded-sm">
                          {r.split(" ")[0]}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="font-display text-base text-gold font-black tracking-tighter leading-none">{cedi(rewardAmt)}</div>
                    <div className="flex items-center gap-2">
                       <div className="flex items-center gap-1 text-[9px] font-black text-zinc-500 uppercase">
                         <Clock className="h-3 w-3 opacity-60" />
                         {dur(t.dur)}
                       </div>
                       <div className="flex items-center gap-1 text-[9px] font-black text-blood uppercase">
                         <Flame className="h-3 w-3 opacity-60" />
                         {t.heat}
                       </div>
                    </div>
                  </div>
                </div>

                <Btn
                  className="relative mt-3 w-full h-9 text-[10px] uppercase font-black tracking-widest"
                  disabled={running || limitReached || heistCd > 0}
                  onClick={() => setPlan(t)}
                  data-testid={`heist-plan-btn-${t.id}`}
                >
                  {running
                    ? "In Progress"
                    : heistCd > 0
                    ? <><Lock className="h-3.5 w-3.5 mr-1" />{cdText(heistCd)}</>
                    : limitReached
                    ? "Limit Hit"
                    : "Assign Crew"}
                  {!running && !limitReached && heistCd <= 0 && readyAgain && <div className="absolute top-1 right-1 h-1.5 w-1.5 bg-gold rounded-full animate-ping" />}
                </Btn>
              </Card>
            );
          })}
        </div>
      </div>

      {plan && <PlanSheet tpl={plan} onClose={() => setPlan(null)} />}
      {res && <ResultSheet res={res} onClose={() => setRes(null)} />}
    </div>
  );
}
