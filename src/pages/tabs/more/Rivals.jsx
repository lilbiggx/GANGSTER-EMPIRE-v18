import { useState } from "react";
import { toast } from "sonner";
import { ShieldAlert, Users, Swords, AlertTriangle, Handshake, Siren, CheckCircle2, Shield, Crosshair, Target, Skull, Coins, ArrowRightLeft } from "lucide-react";
import { useGame } from "../../../store/game";
import { useNow } from "../../../hooks/useNow";
import { cedi, dur, big } from "../../../lib/fmt";
import { Btn, Card, Bar, SectionTitle, Chip, Sheet } from "../../../components/game/ui";

const mood = (g) => (g >= 70 ? "Blood feud (Allies mobilizing)" : g >= 50 ? "Solidarity war pact" : g >= 30 ? "Holding a grudge" : g >= 15 ? "Watching you" : "Calm");

function AssassinSheet({ r, onClose }) {
  const { player: p, config, act } = useGame();
  const contact = config.assassin_contact;
  const contracts = contact?.contracts || [];
  const g = p.grudges[r.id] || 0;

  const hireAssassin = (contract) => {
    act(
      "assassin_contract",
      { rival: r.id, contract: contract.id },
      {
        onResult: () => {
          toast.success(`Contract sealed! Salifu "The Ghost" deployed against ${r.name}.`);
          onClose();
        },
      }
    );
  };

  return (
    <Sheet open onClose={onClose} testid="assassin-sheet">
      <div className="flex items-center gap-2">
        <Crosshair className="h-4 w-4 text-purple-400" />
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-purple-400">
          Underworld Contract Killer
        </span>
      </div>
      <h3 className="font-display text-2xl uppercase text-zinc-100 flex items-center justify-between">
        <span>Target: {r.name}</span>
        <span className="text-xs font-mono text-zinc-400 font-normal">Boss: {r.boss}</span>
      </h3>
      <div className="mt-2 rounded border border-purple-900/60 bg-purple-950/20 p-2.5 text-xs text-purple-200">
        <div className="flex items-center gap-2 font-bold text-purple-300">
          <Skull className="h-4 w-4 text-purple-400" />
          <span>Salifu "The Ghost" (Bukom Shadow Broker)</span>
        </div>
        <p className="mt-1 text-[11px] text-zinc-300 leading-relaxed">
          Accra's premier clandestine operator. Eliminates targets quietly for cold, clean cash. Contracting a hit cuts rival power, pacifies grudges, or permanently breaks syndicate leadership.
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {contracts.map((c) => {
          const hasClean = !c.cost_clean || big(p.clean) >= big(c.cost_clean);
          const hasDirty = !c.cost_dirty || big(p.dirty) >= big(c.cost_dirty);
          const canAfford = hasClean && hasDirty;
          const isBossHit = c.id === "boss_hit";
          const isKneecap = c.id === "kneecap";

          return (
            <div
              key={c.id}
              className={`border p-3 ${
                isBossHit
                  ? "border-purple-600 bg-purple-950/30"
                  : isKneecap
                  ? "border-zinc-700 bg-surface"
                  : "border-zinc-800 bg-surface"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-display text-sm uppercase text-zinc-100 flex items-center gap-1.5">
                    <span>{c.name}</span>
                    <span className="text-[10px] font-mono text-purple-400 border border-purple-800 px-1 py-0.2">
                      -{Math.round((c.power_cut_pct || 0.2) * 100)}% Muscle
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-zinc-300 font-medium">
                    {c.desc}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-zinc-400">
                    <span>⏳ Duration: <b>{dur((c.duration_mins || 60) * 60)}</b></span>
                    <span>
                      💰 Fee:{" "}
                      {c.cost_dirty && <b className="text-gold font-mono">{cedi(c.cost_dirty)} dirty </b>}
                      {c.cost_dirty && c.cost_clean && <span>+ </span>}
                      {c.cost_clean && <b className="text-kgreen font-mono">{cedi(c.cost_clean)} clean</b>}
                    </span>
                  </div>
                </div>
                <Btn
                  variant={isBossHit ? "red" : "ghost"}
                  disabled={!canAfford}
                  onClick={() => hireAssassin(c)}
                  className="shrink-0 text-xs py-1.5"
                  data-testid={`hire-assassin-${c.id}`}
                >
                  {canAfford ? "Contract" : "Insufficient funds"}
                </Btn>
              </div>
            </div>
          );
        })}
      </div>
    </Sheet>
  );
}

function TruceSheet({ r, onClose }) {
  const { player: p, act } = useGame();
  const g = p.grudges[r.id] || 0;
  // Peace envoy cost: more expensive than assassinations
  const costDirty = Math.floor(45000 + g * 600);
  const costClean = Math.floor(75000 + g * 500);

  const sendTruce = (kind) => {
    act("truce_rival", { rival: r.id, kind }, {
      onResult: () => {
        toast.success(`Peace envoy tribute delivered to ${r.boss}! Tensions lowered.`);
        onClose();
      },
    });
  };

  return (
    <Sheet open onClose={onClose} testid="truce-sheet">
      <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">Underworld Diplomacy</div>
      <h3 className="font-display text-2xl uppercase text-zinc-100">Peace Envoy with {r.name}</h3>
      <p className="mt-1 text-xs text-zinc-400">
        Current Grudge: <b className="text-blood">{g}/100</b> ({mood(g)}). Dispatching an official peace envoy defuses alliance retaliation and restores street calm.
      </p>

      <div className="mt-4 space-y-3">
        {/* Street Peace Gift */}
        <div className="border border-zinc-800 p-3 bg-surface">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-sm uppercase text-zinc-100">Peace Envoy Street Offering</div>
              <div className="text-[11px] text-zinc-400">
                -25 Grudge · Pay <b className="text-gold font-mono">{cedi(costDirty)} dirty</b>
              </div>
            </div>
            <Btn
              disabled={big(p.dirty) < big(costDirty)}
              onClick={() => sendTruce("gift")}
              data-testid="truce-gift-btn"
            >
              Send <span className="text-gold font-mono font-bold">{cedi(costDirty)}</span>
            </Btn>
          </div>
        </div>

        {/* Official Syndicate Treaty */}
        <div className="border border-gold/40 p-3 bg-gold/5">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-sm uppercase text-gold">Formal Syndicate Peace Treaty</div>
              <div className="text-[11px] text-zinc-400">
                -50 Grudge & calms treaty ally · Pay <b className="text-kgreen font-mono">{cedi(costClean)} clean</b>
              </div>
            </div>
            <Btn
              variant="green"
              disabled={big(p.clean) < big(costClean)}
              onClick={() => sendTruce("treaty")}
              data-testid="truce-treaty-btn"
            >
              Sign (<span className="text-ink font-mono font-black">{cedi(costClean)}</span> clean)
            </Btn>
          </div>
        </div>
      </div>
    </Sheet>
  );
}

function RivalLaunderSheet({ r, onClose }) {
  const { player: p, derived: d, act } = useGame();
  const launderInfo = d.rival_launder?.[r.id] || {
    cap: 5000,
    relationship: 50,
    relationship_label: "Neutral",
    grudge: p.grudges[r.id] || 0,
    commission_rate: 0.45,
    clean_rate: 0.55,
    used_today: false,
    can_launder_today: true,
  };
  const isActiveToday = Boolean(launderInfo.is_active_today);
  const isUsedToday = Boolean(launderInfo.used_today);
  const maxWash = (!isActiveToday || isUsedToday) ? 0 : Math.min(Number(p.dirty || 0), launderInfo.cap);
  const [washAmt, setWashAmt] = useState(maxWash > 0 ? Math.min(maxWash, 3000) : 0);

  const cleanReturn = Math.round(washAmt * (1 - launderInfo.commission_rate));
  const feeCut = washAmt - cleanReturn;

  const handleLaunder = () => {
    if (!isActiveToday) {
      toast.error(`${r.name} is offline today. Only 3 randomly picked rival syndicates can launder per day.`);
      return;
    }
    if (isUsedToday) {
      toast.error(`${r.name} has already laundered dirty cash for you today. Each syndicate can only launder once per day.`);
      return;
    }
    if (washAmt <= 0) return;
    act("rival_launder", { rival: r.id, amount: washAmt }, {
      onResult: () => {
        toast.success(`${r.name} laundered ${cedi(washAmt)} dirty cash into ${cedi(cleanReturn)} clean cedis! (Daily drop complete)`);
        onClose();
      },
    });
  };

  return (
    <Sheet open onClose={onClose} testid="rival-launder-sheet">
      <div className="flex items-center gap-2">
        <Coins className="h-4 w-4 text-emerald-400" />
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-400">
          Syndicate Daily Laundering (3 Active Daily · 1/Day)
        </span>
      </div>
      <h3 className="font-display text-2xl uppercase text-zinc-100 flex items-center justify-between">
        <span>Wash via {r.name}</span>
        <span className="text-xs font-mono text-zinc-400 font-normal">Boss: {r.boss}</span>
      </h3>

      {!isActiveToday ? (
        <div className="mt-2 rounded border border-red-900/60 bg-red-950/30 p-2.5 text-xs text-red-200 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span>Syndicate Offline Today</span>
          </div>
          <p className="text-[11px] text-zinc-300 leading-relaxed">
            {r.name} is not taking money laundering drops today. Only 3 randomly selected rival syndicates offer laundering per day. Check the top of Rivals for today's active syndicates!
          </p>
        </div>
      ) : isUsedToday ? (
        <div className="mt-2 rounded border border-amber-900/60 bg-amber-950/30 p-2.5 text-xs text-amber-200 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <Clock className="h-4 w-4 text-amber-400" />
            <span>Daily Quota Completed for Today</span>
          </div>
          <p className="text-[11px] text-zinc-300 leading-relaxed">
            {r.name} has already completed your daily dirty cash drop. Each rival syndicate can only launder once per calendar day. This quota will refresh tomorrow at 00:00!
          </p>
        </div>
      ) : (
        <div className="mt-2 rounded border border-emerald-900/60 bg-emerald-950/20 p-2.5 text-xs text-emerald-200 space-y-1">
          <div className="flex items-center justify-between font-bold">
            <span>Relationship: {launderInfo.relationship}/100 ({launderInfo.relationship_label})</span>
            <span>Grudge: {launderInfo.grudge}/100</span>
          </div>
          <p className="text-[11px] text-zinc-300 leading-relaxed">
            {r.name} is 1 of today's 3 active laundering syndicates. They will launder your dirty street cash into clean cedis through their offshore front network. Base commission is 45%, with discounts for trusted relationships.
          </p>
        </div>
      )}

      <div className="mt-3 space-y-2 border border-zinc-800 p-3 bg-surface">
        <div className="flex justify-between text-xs text-zinc-300">
          <span>Daily Collection Limit:</span>
          <b className="font-mono text-gold">{cedi(launderInfo.cap)} per day</b>
        </div>
        <div className="flex justify-between text-xs text-zinc-300">
          <span>Rival Commission Fee:</span>
          <b className="font-mono text-red-400">{Math.round(launderInfo.commission_rate * 100)}%</b>
        </div>
        <div className="flex justify-between text-xs text-zinc-300">
          <span>Clean Cash Yield:</span>
          <b className="font-mono text-kgreen font-bold">{Math.round((1 - launderInfo.commission_rate) * 100)}% return</b>
        </div>
        <div className="flex justify-between text-xs text-zinc-300 border-t border-zinc-800 pt-1.5">
          <span>Daily Status:</span>
          <b className={`font-mono ${!isActiveToday ? "text-zinc-500" : isUsedToday ? "text-amber-400" : "text-emerald-400"}`}>
            {!isActiveToday ? "Offline Today" : isUsedToday ? "Completed Today (1/1)" : "Available Today (0/1)"}
          </b>
        </div>
      </div>

      {!isUsedToday && (
        <>
          <div className="mt-4 space-y-2">
            <label className="text-xs text-zinc-300 block font-bold uppercase tracking-wider">
              Dirty Cash To Wash (Max: {cedi(maxWash)})
            </label>
            <div className="flex gap-2">
              {[0.25, 0.5, 0.75, 1].map((pct) => {
                const val = Math.floor(maxWash * pct);
                return (
                  <button
                    key={pct}
                    onClick={() => setWashAmt(val)}
                    className="flex-1 py-1 rounded border border-zinc-700 bg-zinc-900 text-[11px] font-mono hover:border-gold hover:text-gold transition-all"
                  >
                    {pct === 1 ? "MAX" : `${pct * 100}%`}
                  </button>
                );
              })}
            </div>
            <input
              type="range"
              min="0"
              max={maxWash || 1000}
              step="100"
              value={washAmt}
              onChange={(e) => setWashAmt(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="text-right text-xs font-mono text-gold font-bold">
              {cedi(washAmt)} Dirty Cash
            </div>
          </div>

          <div className="mt-3 p-3 rounded border border-zinc-800 bg-zinc-950/80 space-y-1.5 text-xs">
            <div className="flex justify-between text-zinc-300">
              <span>You Deliver (Dirty):</span>
              <span className="font-mono text-gold font-bold">{cedi(washAmt)} dirty</span>
            </div>
            <div className="flex justify-between text-zinc-400 text-[11px]">
              <span>{r.name} Cut ({Math.round(launderInfo.commission_rate * 100)}%):</span>
              <span className="font-mono text-red-400">−{cedi(feeCut)}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-800 pt-1.5 text-sm font-bold">
              <span className="text-zinc-200">You Receive (Clean):</span>
              <span className="font-mono text-kgreen font-bold">+{cedi(cleanReturn)} clean</span>
            </div>
            <div className="text-[10px] text-zinc-400 pt-0.5">
              ✨ Bonus: Completing this transaction adds <b>+3 Relationship</b> with {r.name}.
            </div>
          </div>
        </>
      )}

      <div className="mt-4">
        <Btn
          variant={isUsedToday ? "ghost" : "green"}
          className="w-full py-2.5 font-bold uppercase tracking-wider"
          disabled={isUsedToday || washAmt <= 0 || washAmt > maxWash}
          onClick={handleLaunder}
          data-testid="confirm-rival-launder-btn"
        >
          {isUsedToday ? "Daily Limit Reached (1/1 Used)" : washAmt <= 0 ? "Enter Amount" : `Launder ${cedi(washAmt)} Dirty Cash`}
        </Btn>
      </div>
    </Sheet>
  );
}

export default function Rivals() {
  const { player: p, derived: d, config, act } = useGame();
  const now = useNow(2000);
  const [truceRival, setTruceRival] = useState(null);
  const [assassinRival, setAssassinRival] = useState(null);
  const [launderRival, setLaunderRival] = useState(null);

  const activeRaidRival = p.raid ? config.rivals.find((r) => r.id === p.raid.rival) : null;
  const raidTimeLeft = p.raid ? Math.max(0, p.raid.resolve_at - now) : 0;
  const contact = config.assassin_contact;

  const activeHitsCount = Object.keys(p.assassin_hits || {}).filter(
    (k) => (p.assassin_hits[k]?.until || 0) > now
  ).length;

  return (
    <div className="space-y-4">
      <div>
        <SectionTitle kicker="11 Syndicates · Diplomacy & Alliance Blocs" title="Rival Underworld Syndicates" />
        <p className="-mt-1 text-xs text-zinc-400">
          Accra's underworld is carved between 11 rival cartels tied into mutual defense treaties. When you hit a rival and their grudge reaches 50+, their treaty ally will launch solidarity raids against your compound!
        </p>
      </div>

      {/* HEAT & GRUDGE NATURAL COOLDOWN STATUS INDICATOR */}
      <div className="flex flex-wrap items-center justify-between gap-2 border border-zinc-800 bg-surface px-3 py-2 text-[11px] text-zinc-300">
        <div className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-kgreen shrink-0" />
          <span><b>Street Calm Active:</b> Grudges cool naturally by -1 every ~20s of peace. Heat dissipating steadily.</span>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">
          Cooling Rate: ~{d.heat_cooling_per_hour || 35} Heat/hr
        </span>
      </div>

      {/* ASSASSIN CONTACT DOSSIER BANNER */}
      <div className="border border-purple-800/80 bg-purple-950/25 p-3 relative overflow-hidden" data-testid="assassin-dossier-banner">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <div className="h-9 w-9 rounded-sm border border-purple-500 bg-purple-900/40 flex items-center justify-center shrink-0">
              <Skull className="h-5 w-5 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display uppercase text-sm text-purple-200">{contact?.name || "Salifu 'The Ghost'"}</span>
                <span className="text-[9px] font-mono font-bold bg-purple-900/60 text-purple-300 border border-purple-700 px-1 py-0.2">
                  {contact?.alias || "Bukom Shadow Broker"}
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 mt-0.5 line-clamp-2">
                {contact?.desc || "Accra's premier clandestine operator. Eliminates targets and cuts rival muscle for clean cash."}
              </p>
            </div>
          </div>
          {activeHitsCount > 0 && (
            <Chip className="border-purple-500 text-purple-300 bg-purple-950 font-bold shrink-0">
              <Crosshair className="h-3 w-3 inline mr-1 text-purple-400" />
              {activeHitsCount} Active Hit{activeHitsCount > 1 ? "s" : ""}
            </Chip>
          )}
        </div>
      </div>

      {/* ACTIVE COMPOUND RAID ALERT BANNER */}
      {p.raid && (
        <Card accent="red" className="p-3.5 border-blood bg-blood/10 space-y-2.5 animate-pulse" data-testid="active-raid-alert">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Siren className="h-5 w-5 text-blood animate-bounce" />
              <div>
                <span className="font-display text-sm uppercase text-white font-bold">
                  COMPOUND UNDER RAID: {activeRaidRival?.name || "Rival Raiders"}!
                </span>
                <div className="text-[11px] text-zinc-300">
                  Hits in <b className="font-mono text-gold">{dur(raidTimeLeft)}</b> · Attack: ~{p.raid.attack} vs Your Defence: {d.defence}
                </div>
              </div>
            </div>
            <Btn
              variant="red"
              className="py-1 px-3 text-xs font-bold"
              onClick={() => act("confront_raid")}
              data-testid="confront-raid-btn"
            >
              Engage Raiders Now
            </Btn>
          </div>
          <p className="text-[11px] italic text-zinc-300 border-l-2 border-blood pl-2">
            "{p.raid.taunt}"
          </p>
        </Card>
      )}

      {/* 3 DAILY ACTIVE LAUNDERING SYNDICATES BANNER */}
      {(() => {
        const activeIds = d.active_launder_syndicates || [];
        const activeRivals = config.rivals.filter((r) => activeIds.includes(r.id));
        const usedCount = activeIds.filter((id) => d.rival_launder?.[id]?.used_today).length;
        return (
          <div className="border border-emerald-800/80 bg-emerald-950/25 p-3 rounded space-y-1.5" data-testid="daily-launder-banner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-emerald-400" />
                <span className="font-display uppercase text-sm text-emerald-300 font-bold">
                  Today's 3 Active Money Laundering Syndicates
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                {usedCount}/3 Drops Used
              </span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-snug">
              Every midnight, 3 rival syndicates are randomly chosen to open dirty cash drops (1 drop/day each). The other syndicates are offline today.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {activeRivals.map((ar) => {
                const info = d.rival_launder?.[ar.id];
                const used = info?.used_today;
                return (
                  <span
                    key={ar.id}
                    className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold border ${
                      used
                        ? "bg-zinc-900 border-zinc-700 text-zinc-400"
                        : "bg-emerald-950/60 border-emerald-700 text-emerald-200"
                    }`}
                  >
                    <span>{ar.name}</span>
                    <span className="font-mono text-[9px] text-gold">({cedi(info?.cap || 5000)})</span>
                    {used ? <span className="text-zinc-500 font-bold ml-0.5">✓ 1/1</span> : <span className="text-emerald-400 font-bold ml-0.5">Ready</span>}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })()}

      <div className="grid gap-2.5">
        {config.rivals.map((r) => {
          const g = p.grudges[r.id] || 0;
          const cd = (p.rival_cd[r.id] || 0) - now;
          const isBossOfWeek = d.boss === r.id;
          const ally = config.rivals.find((x) => x.id === r.ally_id);
          const allianceActive = g >= 50;
          const rivalPow = d.rival_powers?.[r.id] || 80;
          const myPow = d.power || 50;

          const activeHit = p.assassin_hits?.[r.id];
          const hasActiveHit = activeHit && activeHit.until > now;
          const hitContractDef = hasActiveHit
            ? contact?.contracts?.find((c) => c.id === activeHit.contract_type)
            : null;

          const threatLevel =
            myPow >= rivalPow * 1.15
              ? { text: "Favorable Match", color: "text-kgreen", bg: "bg-kgreen/10 border-kgreen/30" }
              : myPow >= rivalPow * 0.9
              ? { text: "Even Match", color: "text-gold", bg: "bg-gold/10 border-gold/30" }
              : { text: "High Threat", color: "text-blood font-bold", bg: "bg-blood/10 border-blood/40" };

          return (
            <Card
              key={r.id}
              accent={hasActiveHit ? "none" : allianceActive ? "red" : isBossOfWeek ? "gold" : "none"}
              className={`p-3 relative ${hasActiveHit ? "border-purple-600/80 bg-purple-950/10" : allianceActive ? "border-blood/70 bg-blood/5" : ""}`}
              data-testid={`rival-card-${r.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-display text-base uppercase text-zinc-100 flex items-center gap-1.5 font-bold">
                    <span>{r.name}</span>
                    <span className="text-[9px] font-mono font-bold text-sky-400 bg-sky-950/50 border border-sky-800 px-1 py-0.2">
                      {r.bloc}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Boss: <b className="text-zinc-200">{r.boss}</b> · Stance: <span className="text-zinc-300 font-semibold">{r.personality}</span> · {config.districts.find((x) => x.id === r.district)?.name}
                  </div>
                  {ally && (
                    <div className="mt-0.5 text-[10px] text-zinc-400 flex items-center gap-1">
                      <Users className="h-3 w-3 text-gold" />
                      <span>Alliance Treaty: <b className="text-zinc-300">{ally.name}</b> ({ally.boss})</span>
                    </div>
                  )}
                </div>
                {isBossOfWeek && (
                  <Chip className="border-gold text-gold bg-gold/10 font-bold" data-testid={`rival-boss-week-${r.id}`}>
                    ★ Boss of Week · 2x Loot!
                  </Chip>
                )}
              </div>

              {/* Power and Threat comparison */}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-[10px] bg-zinc-900/60 p-1.5 border border-zinc-800">
                <div className="text-zinc-300">
                  Syndicate Muscle: <b className="font-mono text-zinc-100 font-bold">~{rivalPow} Pow</b> vs Your <b className="font-mono text-gold font-bold">{myPow} Pow</b>
                </div>
                <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border ${threatLevel.bg} ${threatLevel.color}`}>
                  {threatLevel.text}
                </span>
              </div>

              {/* ACTIVE ASSASSIN DEBUFF BANNER */}
              {hasActiveHit && (
                <div className="mt-2 rounded border border-purple-500/60 bg-purple-950/30 p-2 text-[10px] text-purple-200 flex items-center justify-between" data-testid={`active-assassin-hit-${r.id}`}>
                  <div className="flex items-center gap-1.5 font-bold">
                    <Crosshair className="h-4 w-4 text-purple-400 shrink-0 animate-pulse" />
                    <span>ASSASSIN HIT ACTIVE: {hitContractDef?.name || "Ghost Hit"} (-{Math.round((activeHit.power_cut || 0) * 100)}% Muscle)</span>
                  </div>
                  <span className="font-mono text-purple-300 font-bold shrink-0">{dur(activeHit.until - now)} left</span>
                </div>
              )}

              {/* Alliance Solidarity Raid Threat Alert */}
              {allianceActive && (
                <div className="mt-2 rounded border border-blood/50 bg-blood/10 p-2 text-[10px] text-blood flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-blood" />
                  <span>
                    <b>MUTUAL DEFENSE PACT ACTIVE:</b> Grudge is {g}/100! Ally <b>{ally?.name || "Allies"}</b> is pledged to retaliate against your compound!
                  </span>
                </div>
              )}

              <div className="mt-2 flex justify-between text-[10px] uppercase text-zinc-400">
                <span>Grudge & Tension</span>
                <span data-testid={`rival-grudge-${r.id}`} className={allianceActive ? "text-blood font-bold" : ""}>
                  {g}/100 · {mood(g)}
                </span>
              </div>
              <Bar pct={g} color={g >= 50 ? "red" : "gold"} />

              {/* Rival Relationship & Laundering Status */}
              {(() => {
                const launderInfo = d.rival_launder?.[r.id] || {
                  cap: 5000,
                  relationship: 50,
                  relationship_label: "Neutral",
                  commission_rate: 0.45,
                  is_active_today: false,
                  used_today: false,
                };
                const isActiveToday = Boolean(launderInfo.is_active_today);
                const isUsedToday = Boolean(launderInfo.used_today);
                return (
                  <div className="mt-2.5 rounded border border-zinc-800/90 bg-zinc-950/60 p-2 text-[10px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Syndicate Relationship:</span>
                      <span className="font-mono font-bold text-sky-400">
                        {launderInfo.relationship}/100 · {launderInfo.relationship_label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[9.5px]">
                      <span className="text-zinc-400">Daily Launder (1/Day):</span>
                      <span className="font-mono font-bold">
                        {!isActiveToday ? (
                          <span className="text-zinc-500 font-medium">Offline Today (3 Active Daily)</span>
                        ) : (
                          <>
                            <span className="text-gold">{cedi(launderInfo.cap)}</span>
                            <span className="text-zinc-500 mx-1">·</span>
                            <span className={isUsedToday ? "text-amber-400" : "text-emerald-400"}>
                              {isUsedToday ? "Done Today (1/1)" : "Available (0/1)"}
                            </span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div className="mt-3 flex flex-wrap gap-2">
                <Btn
                  variant="red"
                  className="flex-1 min-w-[130px] py-2 font-bold"
                  disabled={cd > 0 || d.is_arrested}
                  data-testid={`rival-hit-btn-${r.id}`}
                  onClick={() =>
                    act(
                      "hit_rival",
                      { rival: r.id },
                      {
                        onResult: (res) => {
                          if (res.won) {
                            toast.success(`Hit landed on ${r.name}! Grabbed ${cedi(res.loot)}${res.bossOfWeek ? " (2x Boss of Week Bonus!)" : ""}${res.drop ? ` + Loot: ${res.drop}!` : ""}`);
                            if (res.retaliated) {
                              toast.warning(`Retaliation! Their ally launched a solidarity raid against your compound!`);
                            }
                          } else {
                            toast.error(`Their boys were waiting! Repelled with elevated heat.`);
                            if (res.retaliated) {
                              toast.warning(`Retaliation raid launched by treaty ally!`);
                            }
                          }
                        },
                      }
                    )
                  }
                >
                  {d.is_arrested
                    ? "Arrested: Cannot Hit Corners"
                    : cd > 0
                    ? `Corner On Lockdown (${dur(cd)})`
                    : `Clash Corner: Hit ${r.name}`}
                </Btn>

                {(() => {
                  const launderInfo = d.rival_launder?.[r.id];
                  const isActiveToday = Boolean(launderInfo?.is_active_today);
                  const isUsedToday = Boolean(launderInfo?.used_today);
                  return (
                    <Btn
                      variant="ghost"
                      className={`shrink-0 text-xs ${
                        !isActiveToday
                          ? "text-zinc-600 border-zinc-800 opacity-50 cursor-not-allowed"
                          : isUsedToday
                          ? "text-zinc-500 border-zinc-800 opacity-60"
                          : "text-kgreen border-emerald-800/80 hover:border-emerald-500 hover:text-emerald-300"
                      }`}
                      onClick={() => setLaunderRival(r)}
                      disabled={!isActiveToday || isUsedToday}
                      title={
                        !isActiveToday
                          ? "Offline today. Only 3 randomly picked syndicates offer laundering each day."
                          : isUsedToday
                          ? "Daily quota completed for this syndicate. Resets tomorrow at midnight."
                          : "Launder dirty cash through this syndicate"
                      }
                      data-testid={`rival-launder-btn-${r.id}`}
                    >
                      <Coins className="h-3.5 w-3.5 inline mr-1 text-kgreen" />
                      {!isActiveToday ? "Offline Today" : isUsedToday ? "Laundered (1/1)" : "Launder Cash"}
                    </Btn>
                  );
                })()}

                <Btn
                  variant="ghost"
                  className="shrink-0 text-xs text-purple-400 border-purple-800/80 hover:border-purple-500 hover:text-purple-300"
                  onClick={() => setAssassinRival(r)}
                  data-testid={`rival-assassin-btn-${r.id}`}
                >
                  <Crosshair className="h-3.5 w-3.5 inline mr-1 text-purple-400" />
                  {hasActiveHit ? "Active Hit" : "Assassin Hit"}
                </Btn>

                {g > 0 && (
                  <Btn
                    variant="ghost"
                    className="shrink-0 text-xs text-gold border-gold/40 hover:border-gold"
                    onClick={() => setTruceRival(r)}
                    data-testid={`rival-truce-btn-${r.id}`}
                  >
                    <Handshake className="h-3.5 w-3.5 inline mr-1" />
                    Peace Envoy
                  </Btn>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {p.raid_log.length > 0 && (
        <div className="space-y-2">
          <SectionTitle title="Raid Defense History" />
          <div className="grid gap-1.5" data-testid="raid-history">
            {p.raid_log.slice(0, 8).map((r, i) => (
              <div
                key={i}
                className={`border p-2.5 text-xs rounded-sm ${
                  r.won ? "border-kgreen/40 bg-kgreen/5 text-kgreen" : "border-blood/40 bg-blood/5 text-blood"
                }`}
              >
                <div className="flex justify-between font-bold">
                  <span>{r.won ? `Repelled ${r.rival}` : `Breached by ${r.rival}`}</span>
                  <span>{r.won ? `+${cedi(r.amount)} seized` : `-${cedi(r.amount)} lost`}</span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  Your Defense {r.defence} vs Attack {r.attack}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <SectionTitle title="Underworld Street Wire" />
        <div className="grid gap-1" data-testid="street-log">
          {p.log.slice(0, 10).map((l, i) => (
            <div
              key={i}
              className={`border-l-2 px-3 py-1.5 text-xs ${
                l.kind === "good"
                  ? "border-kgreen bg-surface text-zinc-200"
                  : l.kind === "bad"
                  ? "border-blood bg-surface text-zinc-200"
                  : "border-zinc-700 bg-surface text-zinc-400"
              }`}
            >
              {l.msg}
            </div>
          ))}
        </div>
      </div>

      {truceRival && <TruceSheet r={truceRival} onClose={() => setTruceRival(null)} />}
      {assassinRival && <AssassinSheet r={assassinRival} onClose={() => setAssassinRival(null)} />}
      {launderRival && <RivalLaunderSheet r={launderRival} onClose={() => setLaunderRival(null)} />}
    </div>
  );
}
