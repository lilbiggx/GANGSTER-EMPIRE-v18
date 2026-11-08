import { useState } from "react";
import { toast } from "sonner";
import { Hammer, Zap, Plus, Clock, Anvil, Coins } from "lucide-react";
import { useGame } from "../../../store/game";
import { useNow } from "../../../hooks/useNow";
import { cedi, dur } from "../../../lib/fmt";
import { Btn, Card, Bar, SectionTitle, Chip, Sheet } from "../../../components/game/ui";

function BlueprintSheet({ bench, onClose }) {
  const { player: p, config, act } = useGame();
  const startCraft = (wid) => { act("workshop_start", { bench, weaponId: wid }); onClose(); };
  return (
    <Sheet open onClose={onClose} testid="blueprint-sheet">
      <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-blood px-1">Bench {bench + 1}</div>
      <h3 className="font-display text-2xl uppercase text-zinc-100 px-1 mb-4">Forge Weapon</h3>
      <div className="grid gap-2">
        {config.craftableWeapons.map((w) => {
          const cantAfford = Number(p.dirty) < w.cost;
          const locked = (p.level || 1) < (w.unlock || 0);
          return (
            <button key={w.id} disabled={cantAfford || locked} onClick={() => startCraft(w.id)} data-testid={`blueprint-craft-${w.id}`}
              className="btn-press flex items-center gap-3 border border-zinc-800 bg-zinc-900/50 p-3 text-left hover:border-gold disabled:opacity-40 rounded-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-black border border-zinc-800">
                <Hammer className="h-6 w-6" style={{ color: w.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-zinc-100 uppercase tracking-tight">{w.name}</div>
                <div className="text-[10px] text-zinc-500 leading-tight mb-1">{w.desc}</div>
                <div className="flex items-center gap-3 mt-1">
                   <span className="flex items-center gap-1 text-[9px] font-black uppercase text-zinc-400"><Clock className="h-3 w-3 text-zinc-600"/>{dur(w.dur)}</span>
                   <span className="flex items-center gap-1 text-[9px] font-black uppercase text-zinc-400"><Zap className="h-3 w-3 text-zinc-600"/>{w.power} ATK</span>
                </div>
              </div>
              <span className="shrink-0 flex items-center gap-1 font-display text-base text-gold">
                <Coins className="h-4 w-4" />
                {cedi(w.cost)}
              </span>
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

function Bench({ i, bench, now, onStart }) {
  const { config, act } = useGame();
  const w = config.craftableWeapons.find((x) => x.id === bench.weaponId);
  if (!bench.weaponId) {
    return (
      <button onClick={onStart} data-testid={`workshop-bench-${i}`} className="btn-press flex h-[132px] flex-col items-center justify-center gap-1 border border-dashed border-zinc-800 bg-zinc-900/20 text-zinc-600 hover:border-gold hover:text-gold rounded-sm transition-colors">
        <Plus className="h-7 w-7 mb-1" /><span className="text-[10px] font-black uppercase tracking-[0.2em]">Open Bench</span>
      </button>
    );
  }
  const pct = Math.min(100, ((now - bench.start) / (bench.end - bench.start)) * 100);
  const ready = now >= bench.end;
  return (
    <Card accent={ready ? "green" : "gold"} className="flex h-[132px] flex-col justify-between bg-zinc-900/40 p-3" data-testid={`workshop-bench-${i}`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
           <div className="truncate font-display text-xs uppercase text-zinc-100 mb-0.5 tracking-tight">{w?.name || "Weapon"}</div>
           <div className="flex items-center gap-1 text-[9px] font-mono tracking-tighter text-zinc-500 uppercase">
             {ready ? <span className="text-kgreen font-black">Ready to claim</span> : <><Clock className="h-2.5 w-2.5"/> {dur(bench.end - now)}</>}
           </div>
        </div>
        <Anvil className={`h-5 w-5 shrink-0 ${ready ? "text-kgreen animate-bounce" : "text-gold/50 animate-pulse"}`} />
      </div>
      <div className="mt-2">
        {ready ? (
          <Btn variant="green" className="w-full h-9 text-[10px] uppercase font-black tracking-widest" 
            onClick={() => act("workshop_claim", { bench: i }, { onResult: (r) => toast.success(`Claimed ${w?.name}! Check your locker.`) })} 
            data-testid={`workshop-claim-btn-${i}`}>
            Claim Gear
          </Btn>
        ) : (
          <div className="space-y-1.5">
             <Bar pct={pct} color="gold" className="h-1.5 rounded-full" />
             <div className="flex justify-between items-center text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                <span>Forging...</span>
                <span className="text-gold">{Math.round(pct)}%</span>
             </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function WorkshopUpgrades() {
  const { player: p, config, act } = useGame();
  return (
    <div className="grid gap-2">
      {Object.entries(config.workshop.upgrades).map(([k, u]) => {
        const lvl = p.workshop?.up?.[k] || 0;
        const max = lvl >= u.max;
        const upCost = Math.round(u.cost * Math.pow(1.8, lvl));
        const canAfford = Number(p.clean) >= upCost;
        return (
          <Card key={k} accent="gold" data-testid={`workshop-upgrade-${k}`} className="p-3 bg-zinc-900/40">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="font-display text-sm uppercase text-zinc-100 tracking-tight">{u.name}</div>
                  <div className="text-[9px] text-gold font-black bg-gold/10 px-1.5 py-0.5 rounded-full border border-gold/20">LV{lvl}</div>
                </div>
                <div className="text-[10px] text-zinc-500 leading-snug font-medium">{u.desc}</div>
              </div>
              <Btn variant="green" disabled={max || !canAfford} onClick={() => act("workshop_upgrade", { upId: k })} data-testid={`workshop-upgrade-btn-${k}`} className="shrink-0 h-10 px-4 border border-zinc-800 bg-black/20">
                {max ? <span className="text-[10px] font-black text-zinc-600">MAX</span> : <div className="flex items-center gap-1 font-display text-xs text-ink"><Coins className="h-3 w-3" /><span>{cedi(upCost)}</span></div>}
              </Btn>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default function Workshop() {
  const { player: p, config, act } = useGame();
  const now = useNow();
  const [forging, setForging] = useState(null);
  const workshop = p.workshop || { benches: [], up: {} };
  const benches = workshop.benches || [];
  const maxBenches = config.workshop?.max_benches || 3;
  const benchCost = Math.floor((config.workshop?.bench_cost || 10000) * Math.pow((config.workshop?.bench_growth || 2), Math.max(0, benches.length - 1)));

  return (
    <div className="pb-24 pt-4 px-1 animate-in fade-in duration-500" data-testid="workshop-page">
      <SectionTitle kicker="Strategic Forging" title="Weapon Workshop" right={<Chip className="bg-zinc-900 border-zinc-800 text-[10px] font-black" data-testid="workshop-bench-count">{benches.length}/{maxBenches} Benches</Chip>} />
      <p className="-mt-2 mb-6 text-[11px] text-zinc-500 leading-relaxed font-medium">
        Forge powerful weapons for your crew. High-tier gear takes real-world days to complete. Upgraded tools speed up the process, while the industrial foundry bolsters weapon lethality.
      </p>

      <div className="grid grid-cols-2 gap-2.5 mb-8">
        {benches.map((b, i) => <Bench key={i} i={i} bench={b} now={now} onStart={() => setForging(i)} />)}
        {benches.length < maxBenches && (
          <button disabled={Number(p.clean) < benchCost} onClick={() => act("workshop_buy_bench")} data-testid="workshop-buy-bench-btn"
            className="btn-press flex h-[132px] flex-col items-center justify-center gap-1 border border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:border-gold hover:text-gold disabled:opacity-30 rounded-sm transition-all group">
            <Plus className="h-7 w-7 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add Bench</span>
            <div className="flex items-center gap-1 font-display text-sm text-kgreen font-bold mt-1">
              <Coins className="h-3.5 w-3.5" />
              <span>{cedi(benchCost)}</span>
            </div>
          </button>
        )}
      </div>

      <SectionTitle kicker="Expansion & Tech" title="Infrastructure" />
      <WorkshopUpgrades />

      {forging !== null && <BlueprintSheet bench={forging} onClose={() => setForging(null)} />}
    </div>
  );
}
