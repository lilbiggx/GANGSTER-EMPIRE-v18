import { toast } from "sonner";
import { Skull, Swords, ShieldAlert, Award, Zap, Heart, CheckCircle2 } from "lucide-react";
import { useGame } from "../../../store/game";
import { cedi } from "../../../lib/fmt";
import { Btn, Card, Bar } from "../../../components/game/ui";

export default function AreaDonPanel() {
  const { player: p, derived: d, act } = useGame();
  const don = d.area_don || p.area_don;

  if (!don) {
    return (
      <div className="p-8 text-center text-zinc-500 italic">
        Streets are quiet. No Area Don currently contesting the district.
      </div>
    );
  }

  const hpPct = Math.min(100, Math.max(0, Math.round(((don.hp || 0) / Math.max(1, don.maxHp || 1000)) * 100)));
  const crewPow = (p.crew || []).reduce((acc, c) => {
    const mus = Number(c.stats?.muscle || 5);
    const whl = Number(c.stats?.wheels || 5);
    return acc + mus * 3 + whl * 2;
  }, 0);
  const bossPow = (Number(p.boss_stats?.muscle || 10) * 4) + (Number(p.boss_stats?.wheels || 10) * 3);
  const totalPow = crewPow + bossPow;

  return (
    <div className="space-y-4 pb-12" data-testid="area-don-tab">
      <div className="border-b border-zinc-800 pb-3 mt-2">
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-blood flex items-center gap-1.5">
          <Skull className="h-3 w-3" />
          <span>Accra Underworld Arch-Rival</span>
        </div>
        <h2 className="font-display text-2xl uppercase text-zinc-100 font-bold leading-tight">
          Area Don: {don.name}
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          High-tier district overlord enforcing illegal tariffs and extortions. Topple the Don to claim a massive flat Clean Cash bounty and liberate street operations.
        </p>
      </div>

      <Card accent="red" className="p-4 bg-zinc-950/80 border-blood/50">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl uppercase font-black text-zinc-100">
                {don.name}
              </span>
              <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-blood/20 text-rose-300 border border-blood/40 font-bold">
                Defeats: {don.defeatedCount || 0}
              </span>
            </div>
            <div className="mt-2 space-y-1">
              <div className="text-xs text-zinc-300 flex items-center gap-1.5">
                <span className="text-zinc-500 uppercase font-mono text-[10px]">Archetype:</span>
                <b className="text-amber-400">{don.archetypeName || don.archetypeId}</b>
                <span className="text-zinc-400 text-[10px]">({don.archetypeDesc})</span>
              </div>
              <div className="text-xs text-zinc-300 flex items-center gap-1.5">
                <span className="text-zinc-500 uppercase font-mono text-[10px]">Tactic:</span>
                <b className="text-rose-400">{don.tacticName || don.tacticId}</b>
                <span className="text-zinc-400 text-[10px]">({don.tacticDesc})</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-zinc-500 block">Clean Bounty</span>
            <span className="text-base font-mono font-black text-kgreen">
              {cedi(don.bounty || 50000)}
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400 flex items-center gap-1">
              <Heart className="h-3 w-3 text-blood" /> Don Health
            </span>
            <span className="font-bold text-zinc-200">
              {don.hp} / {don.maxHp} HP ({hpPct}%)
            </span>
          </div>
          <Bar pct={hpPct} color="blood" className="h-2 rounded-full" />
        </div>

        <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between gap-3">
          <div className="text-[11px] font-mono text-zinc-400">
            <span>Your Attack Force: </span>
            <b className="text-gold font-bold">{totalPow} PWR</b>
            <span className="text-zinc-500 text-[10px] ml-1">(Crew + Boss)</span>
          </div>

          <Btn
            variant="red"
            className="text-xs py-2 px-4 uppercase font-bold tracking-wider"
            onClick={() =>
              act("attack_area_don", {}, {
                onResult: (r) => {
                  if (r?.defeated) {
                    toast.success(`Area Don toppled! Bounty claimed: ${cedi(r.bounty)} Clean Cash!`);
                  } else {
                    toast.info(`Clashed with Don enforcers! Dealt ${r.damage} damage.`);
                  }
                },
              })
            }
          >
            <Swords className="h-4 w-4 mr-1.5" />
            Attack Area Don
          </Btn>
        </div>
      </Card>
    </div>
  );
}
