import { useState } from "react";
import { toast } from "sonner";
import { Hammer, Zap, Plus, Clock, Coins, Sparkles, CheckCircle2, TrendingUp, Layers, Shovel } from "lucide-react";
import { useGame } from "../../../store/game";
import { useNow } from "../../../hooks/useNow";
import { cedi, dur } from "../../../lib/fmt";
import { Btn, Card, Bar, Sheet } from "../../../components/game/ui";
import { MINERALS, MINING } from "../../../data/gameData";

function MineSheet({ rig, onClose }) {
  const { player: p, act } = useGame();
  const startMine = (mineralId) => {
    act("mining_start", { rigIdx: rig, mineralId });
    onClose();
  };

  return (
    <Sheet open onClose={onClose} testid="mining-rig-sheet">
      <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold px-1">Excavator Pit Rig #{rig + 1}</div>
      <h3 className="font-display text-2xl uppercase text-zinc-100 px-1 mb-4">Galamsey Gold Extraction</h3>
      <div className="grid gap-2">
        {MINERALS.map((min) => {
          const cantAfford = BigInt(p.dirty || "0") < BigInt(min.costDirty);
          const locked = (p.level || 1) < (min.unlockLvl || 1);
          return (
            <button
              key={min.id}
              disabled={cantAfford || locked}
              onClick={() => startMine(min.id)}
              data-testid={`mining-start-${min.id}`}
              className="btn-press flex items-center gap-3 border border-zinc-800 bg-zinc-900/50 p-3 text-left hover:border-gold disabled:opacity-40 rounded-sm"
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-black border border-zinc-800"
                style={{ borderColor: min.color }}
              >
                <Shovel className="h-6 w-6" style={{ color: min.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-100 uppercase tracking-tight">{min.name}</span>
                  <span className="text-[9px] font-mono px-1 rounded bg-zinc-800 text-gold font-bold">
                    Carat: {min.carat}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-500 leading-tight mb-1">{min.desc}</div>
                <div className="flex items-center gap-3 mt-1 text-[9px] font-mono uppercase text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-zinc-600" />
                    {dur(min.mineTime)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3 text-zinc-600" />
                    Yield: {min.yieldMin}-{min.yieldMax} oz
                  </span>
                  <span className="flex items-center gap-1 text-kgreen font-bold">
                    <Coins className="h-3 w-3" />
                    {cedi(min.sellPriceClean)} clean/oz
                  </span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className="block font-display text-sm text-amber-400 font-mono">
                  {cedi(min.costDirty)}
                </span>
                <span className="text-[8px] text-zinc-500 uppercase tracking-tighter">diesel fuel</span>
              </div>
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

function RigTile({ idx, rig, now, onStart }) {
  const { act } = useGame();
  const min = MINERALS.find((x) => x.id === rig.mineralId);
  if (!rig.mineralId) {
    return (
      <button
        onClick={onStart}
        data-testid={`mining-rig-${idx}`}
        className="btn-press flex h-[132px] flex-col items-center justify-center gap-1 border border-dashed border-zinc-800 bg-zinc-900/20 text-zinc-600 hover:border-gold hover:text-gold rounded-sm transition-colors"
      >
        <Plus className="h-7 w-7 mb-1" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Deploy Rig #{idx + 1}</span>
      </button>
    );
  }
  const pct = Math.min(100, Math.max(0, Math.round(((now - rig.start) / Math.max(1, rig.end - rig.start)) * 100)));
  const ready = now >= rig.end;

  return (
    <Card accent={ready ? "green" : "gold"} className="flex h-[132px] flex-col justify-between bg-zinc-900/40 p-3" data-testid={`mining-rig-${idx}`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="truncate font-display text-xs uppercase text-zinc-100 mb-0.5 tracking-tight font-bold">
            {min?.name || rig.mineralId}
          </div>
          <div className="flex items-center gap-1 text-[9px] font-mono tracking-tighter text-zinc-500 uppercase">
            {ready ? (
              <span className="text-kgreen font-black flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Excavation Complete ({rig.yield || 1} oz)
              </span>
            ) : (
              <>
                <Clock className="h-2.5 w-2.5" /> {dur(rig.end - now)} left
              </>
            )}
          </div>
        </div>
        <Shovel className={`h-5 w-5 shrink-0 ${ready ? "text-kgreen animate-bounce" : "text-amber-400 animate-pulse"}`} />
      </div>
      <div className="mt-2">
        {ready ? (
          <Btn
            variant="green"
            className="w-full h-9 text-[10px] uppercase font-black tracking-widest"
            onClick={() =>
              act("mining_claim", { rigIdx: idx }, {
                onResult: (r) => toast.success(`Claimed ${r.quantity || 1} oz of ${min?.name || "ore"}!`),
              })
            }
            data-testid={`mining-claim-btn-${idx}`}
          >
            Claim Ore & Gold
          </Btn>
        ) : (
          <div className="space-y-1.5">
            <Bar pct={pct} color="gold" className="h-1.5 rounded-full" />
            <div className="flex justify-between items-center text-[8px] font-black text-zinc-600 uppercase tracking-widest">
              <span>Excavating...</span>
              <span className="text-gold font-mono">{pct}%</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function MineralStash() {
  const { player: p, act } = useGame();
  const stash = p.mining?.stash || {};
  const hasItems = Object.values(stash).some((qty) => qty > 0);

  return (
    <div className="mt-4 border border-zinc-800 bg-surface/80 p-3 rounded-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
          <Coins className="h-4 w-4 text-gold" />
          <span>Bullion Stash & Gold Liquidation</span>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">Smelted gold pays Clean Cash</span>
      </div>

      <div className="grid gap-2">
        {MINERALS.map((min) => {
          const qty = stash[min.id] || 0;
          const cleanRate = min.sellPriceClean;
          const totalVal = qty * cleanRate;

          return (
            <div
              key={min.id}
              className="flex items-center justify-between p-2 rounded border border-zinc-800/80 bg-zinc-950/40 text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: min.color }}
                />
                <div>
                  <span className="font-bold text-zinc-100">{min.name}</span>
                  <span className="text-[10px] text-zinc-500 font-mono ml-2">
                    In Pit Vault: <b className="text-zinc-200">{qty}</b> oz
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-kgreen font-bold">
                  {cedi(totalVal)} clean
                </span>
                <Btn
                  variant="green"
                  disabled={qty <= 0}
                  className="text-[10px] py-1 px-2.5"
                  onClick={() =>
                    act("mining_sell", { mineralId: min.id, amount: qty }, {
                      onResult: (r) => toast.success(`Liquidated ${r.sold}x ${min.name} for ${cedi(r.payout)} Clean Cash!`),
                    })
                  }
                >
                  Smelt & Sell
                </Btn>
              </div>
            </div>
          );
        })}
        {!hasItems && (
          <div className="p-3 text-center text-xs text-zinc-500 italic">
            Pit vault is currently empty. Start an excavator rig above!
          </div>
        )}
      </div>
    </div>
  );
}

function MiningUpgrades() {
  const { player: p, derived: d, act } = useGame();
  const upCosts = d.mining?.up_costs || {};
  const currentUps = p.mining?.up || {};

  return (
    <div className="mt-4 border border-zinc-800 bg-surface/80 p-3 rounded-sm">
      <div className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-2 flex items-center gap-1.5">
        <Sparkles className="h-4 w-4 text-gold" />
        <span>Concession Heavy Machinery Upgrades</span>
      </div>
      <div className="grid gap-2">
        {Object.entries(MINING.upgrades).map(([key, up]) => {
          const lvl = currentUps[key] || 0;
          const cost = upCosts[key] || up.cost;
          const maxed = lvl >= up.max;
          const afford = BigInt(p.clean || "0") >= BigInt(cost);

          return (
            <div
              key={key}
              className="flex items-center justify-between p-2 rounded border border-zinc-800/80 bg-zinc-950/40 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-100">{up.name}</span>
                  <span className="text-[9px] font-mono px-1 rounded bg-zinc-800 text-gold">
                    LV {lvl}/{up.max}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-500">{up.desc}</div>
              </div>
              <div className="shrink-0">
                {maxed ? (
                  <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold px-2 py-1">
                    MAXED
                  </span>
                ) : (
                  <Btn
                    variant={afford ? "green" : "ghost"}
                    disabled={!afford}
                    className="text-[10px] py-1 px-2.5"
                    onClick={() =>
                      act("mining_upgrade", { upId: key }, {
                        onResult: () => toast.success(`Upgraded ${up.name}!`),
                      })
                    }
                  >
                    Upgrade {cedi(cost)}
                  </Btn>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Mining() {
  const { player: p, derived: d, act } = useGame();
  const now = useNow();
  const [activeRigIdx, setActiveRigIdx] = useState(null);

  const rigs = p.mining?.rigs || [];
  const rigCost = d.mining?.rig_cost || MINING.rig_cost;
  const isMaxRigs = rigs.length >= MINING.max_rigs;
  const affordRig = BigInt(p.clean || "0") >= BigInt(rigCost);
  const readyCount = rigs.filter((r) => r.mineralId && r.start > 0 && now >= r.end).length;

  return (
    <div className="space-y-4 pb-12" data-testid="mining-tab">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-3 mt-2">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
            <Shovel className="h-3 w-3" />
            <span>Illegal Mining Concessions (Galamsey)</span>
          </div>
          <h2 className="font-display text-2xl uppercase text-zinc-100 font-bold leading-tight">
            Pit Extraction ({rigs.length}/{MINING.max_rigs} Rigs)
          </h2>
        </div>
        {!isMaxRigs && (
          <Btn
            variant={affordRig ? "green" : "ghost"}
            disabled={!affordRig}
            onClick={() =>
              act("mining_buy_rig", {}, {
                onResult: () => toast.success("Deployed new excavator pit rig!"),
              })
            }
            className="text-[10px] font-bold uppercase"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Rig ({cedi(rigCost)})
          </Btn>
        )}
      </div>

      {readyCount > 1 && (
        <Btn
          variant="green"
          className="w-full h-9 text-xs font-black uppercase tracking-wider"
          onClick={() =>
            act("mining_claim", { rigIdx: "all" }, {
              onResult: (r) => toast.success(`Claimed all excavated minerals (${r.total} total oz)!`),
            })
          }
        >
          Claim All Ready Excavations ({readyCount})
        </Btn>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {rigs.map((rig, idx) => (
          <RigTile
            key={idx}
            idx={idx}
            bench={rig}
            now={now}
            onStart={() => setActiveRigIdx(idx)}
          />
        ))}
      </div>

      <MineralStash />
      <MiningUpgrades />

      {activeRigIdx !== null && (
        <MineSheet rig={activeRigIdx} onClose={() => setActiveRigIdx(null)} />
      )}
    </div>
  );
}
