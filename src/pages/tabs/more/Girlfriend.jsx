import { useState } from "react";
import { toast } from "sonner";
import { Heart, Gift, Sparkles, CheckCircle2, ShieldCheck, Zap, Star } from "lucide-react";
import { useGame } from "../../../store/game";
import { cedi, dur } from "../../../lib/fmt";
import { Btn, Card, Bar, SectionTitle, Chip } from "../../../components/game/ui";
import { useNow } from "../../../hooks/useNow";

export default function Girlfriend() {
  const { config, player: p, derived: d, act } = useGame();
  const now = useNow();

  const girlfriendState = p.girlfriend || { active_id: null, companions: {} };
  const activeId = girlfriendState.active_id;
  const companions = girlfriendState.companions || {};

  const handleSelect = (id) => {
    act("gf_select", { id: activeId === id ? null : id }, {
      onResult: (r) => {
        if (r.ok) {
          toast.success(r.result.active_id ? `Active girlfriend set to ${config.girlfriends.find(g => g.id === id)?.name}!` : "Deactivated active partner.");
        } else {
          toast.error(r.error);
        }
      }
    });
  };

  const handleCourt = (id) => {
    act("gf_court", { id }, {
      onResult: (r) => {
        if (r.ok) {
          toast.success(`Courtship effort successful! Impression score is now ${r.result.impress_score}%.`);
        } else {
          toast.error(r.error);
        }
      }
    });
  };

  const handleCommit = (id) => {
    act("gf_commit", { id }, {
      onResult: (r) => {
        if (r.ok) {
          toast.success("She said YES! Official girlfriend unlocked.");
        } else {
          toast.error(r.error);
        }
      }
    });
  };

  const handleGift = (id) => {
    act("gf_gift", { id }, {
      onResult: (r) => {
        if (r.ok) {
          toast.success(`Sent luxury gift! Happiness is now ${r.result.happiness}%.`);
        } else {
          toast.error(r.error);
        }
      }
    });
  };

  const handleDate = (id) => {
    act("gf_date", { id }, {
      onResult: (r) => {
        if (r.ok) {
          toast.success(`Romantic date successful! Happiness is now ${r.result.happiness}%.`);
        } else {
          toast.error(r.error);
        }
      }
    });
  };

  return (
    <div data-testid="girlfriend-page" className="space-y-4 pb-12">
      <SectionTitle kicker="Romance & Courting" title="Girlfriend & Syndicate Dating" />
      <p className="-mt-1 text-xs text-zinc-400">
        You must impress potential partners through courting efforts before they will consider you as their official boyfriend. Once official, keep her happy to enjoy powerful free syndicate perks! Courting actions have a 1-hour cooldown.
      </p>

      <div className="space-y-3">
        {config.girlfriends.map((gf) => {
          const comp = companions[gf.id] || { status: "courting", impress_score: 0, happiness: 50 };
          const isDating = comp.status === "dating";
          const isActive = activeId === gf.id;
          const isImpressiveDone = (comp.impress_score || 0) >= 100;
          const isHappy = comp.happiness >= 70;

          const gfCourtLeft = d?.cooldowns?.gf_court_left_by?.[gf.id] || 0;
          const isCourtingCd = gfCourtLeft > 0;

          const canAffordCourt = BigInt(p.dirty) >= BigInt(gf.courtCost);
          const canAffordGift = BigInt(p.dirty) >= BigInt(gf.giftCost);
          const canAffordDate = BigInt(p.dirty) >= BigInt(gf.dateCost);

          return (
            <Card key={gf.id} accent={isActive ? "gold" : isDating ? "good" : "zinc"} className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display text-sm font-bold text-zinc-100">{gf.name}</span>
                    <span className="text-[9px] font-black uppercase bg-zinc-800 text-gold px-1.5 py-0.5 rounded">{gf.title}</span>
                    {isActive && <Chip variant="gold">Active Perk Partner</Chip>}
                    {isDating && !isActive && <Chip variant="good">Official Girlfriend</Chip>}
                    {!isDating && <Chip variant="gold">Courting ({comp.impress_score || 0}%)</Chip>}
                  </div>
                  <p className="text-xs text-zinc-400 mb-2">{gf.desc}</p>
                  
                  {/* Perk description */}
                  <div className="mb-3 p-2 bg-zinc-900 border border-zinc-800 rounded text-[11px] text-emerald-400 flex items-center gap-1.5 font-mono">
                    <Sparkles className="h-3.5 w-3.5 text-gold shrink-0" />
                    <div>
                      <span className="font-bold text-zinc-200">Perk (When Happy 70%+):</span> {gf.perkDesc}
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        Status: {isDating ? (isHappy ? <b className="text-emerald-400">ACTIVE ({comp.happiness}%)</b> : <b className="text-blood">INACTIVE (Need 70%+ happiness)</b>) : <b className="text-gold">Locked — Impress her first!</b>}
                      </div>
                    </div>
                  </div>

                  {/* Courting progress or Happiness */}
                  {!isDating ? (
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                        <span>Impression Progress</span>
                        <b className="text-gold">{comp.impress_score || 0}% / 100%</b>
                      </div>
                      <Bar current={comp.impress_score || 0} max={100} className="h-1.5" />
                    </div>
                  ) : (
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                        <span>Relationship Happiness</span>
                        <b className={isHappy ? "text-emerald-400" : "text-gold"}>{comp.happiness}%</b>
                      </div>
                      <Bar current={comp.happiness} max={100} className="h-1.5" />
                    </div>
                  )}
                </div>

                {isDating && (
                  <Btn
                    variant={isActive ? "gold" : "zinc"}
                    onClick={() => handleSelect(gf.id)}
                    className="px-3 py-2 text-[10px] font-black uppercase shrink-0"
                  >
                    {isActive ? "Active" : "Set Active"}
                  </Btn>
                )}
              </div>

              {/* Actions */}
              {!isDating ? (
                <div className="mt-2 pt-2 border-t border-zinc-800 flex gap-2">
                  <Btn
                    variant="gold"
                    disabled={!canAffordCourt || isImpressiveDone || isCourtingCd}
                    onClick={() => handleCourt(gf.id)}
                    className="flex-1 py-2 text-[10px] font-black uppercase tracking-wider"
                  >
                    <Star className="h-3 w-3 mr-1 inline" />
                    {isCourtingCd ? `Cooldown (${dur(gfCourtLeft)})` : `Impress / Court (${cedi(gf.courtCost)})`}
                  </Btn>
                  {isImpressiveDone && (
                    <Btn
                      variant="good"
                      onClick={() => handleCommit(gf.id)}
                      className="flex-1 py-2 text-[10px] font-black uppercase tracking-wider animate-pulse"
                    >
                      <Heart className="h-3 w-3 mr-1 inline" /> Ask to be Official Partner!
                    </Btn>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-zinc-800">
                  <Btn
                    variant="gold"
                    disabled={!canAffordGift}
                    onClick={() => handleGift(gf.id)}
                    className="py-2 text-[10px] font-black uppercase tracking-wider"
                  >
                    <Gift className="h-3 w-3 mr-1 inline" /> Send Gift ({cedi(gf.giftCost)})
                  </Btn>
                  <Btn
                    variant="good"
                    disabled={!canAffordDate}
                    onClick={() => handleDate(gf.id)}
                    className="py-2 text-[10px] font-black uppercase tracking-wider"
                  >
                    <Heart className="h-3 w-3 mr-1 inline" /> VIP Date ({cedi(gf.dateCost)})
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
