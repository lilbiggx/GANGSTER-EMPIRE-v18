import { useState } from "react";
import { toast } from "sonner";
import { ShieldAlert, Users, Coins, Clock, CheckCircle2, Lock } from "lucide-react";
import { useGame } from "../../../store/game";
import { cedi, dur } from "../../../lib/fmt";
import { Btn, Card, Bar, SectionTitle, Chip } from "../../../components/game/ui";
import { useNow } from "../../../hooks/useNow";

export default function Robbery() {
  const { config, player: p, derived: d, act } = useGame();
  const now = useNow();
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [assignedCrew, setAssignedCrew] = useState([]);

  const robberies = p.robberies || [];
  const globalCdLeft = d?.robbery_global_left || 0;
  const currentPower = d?.power || 0;
  const currentDefense = d?.defence || 0;

  const handleStart = (target) => {
    act("robbery_start", { target_id: target.id }, {
      onResult: (r) => {
        if (r.ok) {
          toast.success(`Robbery initiated on ${target.name}!`);
          setSelectedTarget(null);
        } else {
          toast.error(r.error);
        }
      }
    });
  };

  const handleClaim = (robId) => {
    act("robbery_claim", { robbery_id: robId }, {
      onResult: (r) => {
        if (r.ok) {
          toast.success(`Successful score! Secured GH₵${r.reward?.toLocaleString()} dirty cash.`);
        } else {
          toast.error(r.error);
        }
      }
    });
  };

  return (
    <div data-testid="robbery-page" className="space-y-4 pb-12">
      <SectionTitle kicker="High-Stakes Operations" title="Robbery Operations" />
      <div className="rounded border border-zinc-800 bg-surface/50 p-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gold mb-1">Syndicate Power</div>
              <div className="font-display text-xl text-zinc-100">{currentPower.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gold mb-1">Compound Defense</div>
              <div className="font-display text-xl text-zinc-100">{currentDefense.toLocaleString()}</div>
            </div>
          </div>
          {globalCdLeft > 0 && (
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-widest text-blood mb-1 flex items-center justify-end gap-1.5">
                <Clock className="h-3 w-3" /> Syndicate Cooldown
              </div>
              <div className="font-mono text-sm font-bold text-blood">{dur(globalCdLeft)}</div>
            </div>
          )}
        </div>
        <p className="mt-2 text-[10px] text-zinc-400 leading-relaxed">
          High-intensity raids on cash-rich targets. Robberies require Syndicate Power & Defense to bypass security, not crew assignments. Only one target can be open at a time, and a 2-day global cooldown applies after each success. <b className="text-blood font-black uppercase">Risk Warning: 60% chance of police arrest upon claim.</b>
        </p>
      </div>

      {/* Active Robberies */}
      {robberies.length > 0 && (
        <div className="space-y-2">
          <span className="font-display text-xs uppercase tracking-wider text-gold font-bold">Active Operation</span>
          {robberies.map((r) => {
            const target = config.robberies.find((x) => x.id === r.target);
            const remaining = Math.max(0, r.end - now);
            const isReady = remaining === 0;

            return (
              <Card key={r.id} accent={isReady ? "good" : "gold"} className="p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-display text-sm font-bold text-zinc-100">{target?.name || r.target}</div>
                    <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                      {isReady ? "READY FOR PAYOUT" : `Time remaining: ${dur(remaining)}`}
                    </div>
                  </div>
                  {isReady ? (
                    <Btn variant="good" onClick={() => handleClaim(r.id)} className="px-4 py-2 text-[10px] font-black uppercase">
                      Claim Payout
                    </Btn>
                  ) : (
                    <div className="text-right">
                      <Chip variant="gold">In Progress</Chip>
                    </div>
                  )}
                </div>
                {!isReady && <Bar current={now - r.start} max={r.end - r.start} className="mt-2" />}
              </Card>
            );
          })}
        </div>
      )}

      {/* Target Catalog */}
      <div className="space-y-3">
        <span className="font-display text-xs uppercase tracking-wider text-zinc-300 font-bold">Operation Targets</span>
        {config.robberies.map((t) => {
          const isSelected = selectedTarget?.id === t.id;
          const canAfford = BigInt(p.dirty) >= BigInt(t.cost);
          const hasPower = currentPower >= t.minPower;
          const hasDefense = currentDefense >= (t.minDefense || 0);
          const cdLeft = Math.max(0, (p.cooldowns?.robbery_by?.[t.id] || 0) - now);
          const isCoolingDown = cdLeft > 0 || globalCdLeft > 0;
          const isLocked = robberies.length > 0;

          return (
            <Card key={t.id} accent={isSelected ? "gold" : "zinc"} className={`p-3 transition-opacity ${isLocked && !isSelected ? "opacity-50" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-display text-sm font-bold text-zinc-100">{t.name}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                      t.tier === 1 ? "border-zinc-700 bg-zinc-800 text-zinc-300" :
                      t.tier === 2 ? "border-emerald-600/60 bg-emerald-950/40 text-emerald-400" :
                      t.tier === 3 ? "border-sky-600/60 bg-sky-950/40 text-sky-400" :
                      t.tier === 4 ? "border-purple-600/60 bg-purple-950/40 text-purple-400" :
                      t.tier === 5 ? "border-amber-600/60 bg-amber-950/40 text-amber-400" :
                      t.tier === 6 ? "border-orange-600/60 bg-orange-950/40 text-orange-400" :
                      t.tier === 7 ? "border-red-600/60 bg-red-950/40 text-red-400" :
                      "border-pink-600/60 bg-pink-950/40 text-pink-400"
                    }`}>Tier {t.tier}</span>
                    {cdLeft > 0 && <Chip variant="gold" className="text-[9px]">Target CD: {dur(cdLeft)}</Chip>}
                  </div>
                  <p className="text-xs text-zinc-400 mb-2">{t.desc}</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-zinc-400 font-mono">
                    <div className="flex items-center justify-between border-b border-zinc-800/50 pb-0.5">
                      <span>Power Req:</span>
                      <b className={hasPower ? "text-zinc-200" : "text-blood"}>{t.minPower.toLocaleString()}</b>
                    </div>
                    <div className="flex items-center justify-between border-b border-zinc-800/50 pb-0.5">
                      <span>Defense Req:</span>
                      <b className={hasDefense ? "text-zinc-200" : "text-blood"}>{(t.minDefense || 0).toLocaleString()}</b>
                    </div>
                    <div className="flex items-center justify-between border-b border-zinc-800/50 pb-0.5">
                      <span>Prep Cost:</span>
                      <b className={canAfford ? "text-gold" : "text-blood"}>{cedi(t.cost)}</b>
                    </div>
                    <div className="flex items-center justify-between border-b border-zinc-800/50 pb-0.5">
                      <span>Reward:</span>
                      <b className="text-emerald-400">{cedi(t.reward)}</b>
                    </div>
                  </div>
                </div>

                <Btn
                  variant={isCoolingDown || isLocked ? "zinc" : isSelected ? "ghost" : "gold"}
                  disabled={isCoolingDown || isLocked}
                  onClick={() => {
                    if (isCoolingDown || isLocked) return;
                    setSelectedTarget(isSelected ? null : t);
                  }}
                  className="px-3 py-2 text-[10px] font-black uppercase shrink-0"
                >
                  {isCoolingDown ? "Cooldown" : isLocked ? "Occupied" : isSelected ? "Cancel" : "Launch"}
                </Btn>
              </div>

              {/* Confirmation Drawer */}
              {isSelected && !isCoolingDown && !isLocked && (
                <div className="mt-3 border-t border-zinc-800 pt-3 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-bold uppercase">Ready for Deployment?</span>
                    <span className="text-gold font-mono">{cedi(t.cost)} dirty</span>
                  </div>
                  
                  {(!hasPower || !hasDefense) && (
                    <div className="p-2 bg-blood/10 border border-blood/20 rounded text-[10px] text-blood-400 flex items-start gap-2">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      <span>
                        {!hasPower && !hasDefense ? "Syndicate Power & Defense are too low." : !hasPower ? "Syndicate Power is too low." : "Compound Defense is too low."}
                        Recruit more crew or upgrade facilities to hit this target.
                      </span>
                    </div>
                  )}

                  <Btn
                    variant="good"
                    disabled={!canAfford || !hasPower || !hasDefense}
                    onClick={() => handleStart(t)}
                    className="w-full py-2.5 text-xs font-black uppercase tracking-wider"
                  >
                    {!canAfford ? "Insufficient Dirty Cash" : !hasPower ? "Insufficient Power" : !hasDefense ? "Insufficient Defense" : `Execute Operation`}
                  </Btn>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
