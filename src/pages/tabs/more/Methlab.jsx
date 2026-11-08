import { useState } from "react";
import { toast } from "sonner";
import { FlaskConical, Zap, Plus, Clock, Coins, Sparkles, CheckCircle2, TrendingUp, Layers } from "lucide-react";
import { useGame } from "../../../store/game";
import { useNow } from "../../../hooks/useNow";
import { cedi, dur } from "../../../lib/fmt";
import { Btn, Card, Bar, SectionTitle, Sheet } from "../../../components/game/ui";
import { METHLAB_PRODUCTS, METHLAB } from "../../../data/gameData";

function CookSheet({ bench, onClose }) {
  const { player: p, act } = useGame();
  const startCook = (productId) => {
    act("methlab_start", { benchIdx: bench, productId });
    onClose();
  };

  return (
    <Sheet open onClose={onClose} testid="methlab-cook-sheet">
      <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold px-1">Cook Station #{bench + 1}</div>
      <h3 className="font-display text-2xl uppercase text-zinc-100 px-1 mb-4">Clandestine Synthesis</h3>
      <div className="grid gap-2">
        {METHLAB_PRODUCTS.map((prod) => {
          const cantAfford = BigInt(p.dirty || "0") < BigInt(prod.costDirty);
          const locked = (p.level || 1) < (prod.unlockLvl || 1);
          return (
            <button
              key={prod.id}
              disabled={cantAfford || locked}
              onClick={() => startCook(prod.id)}
              data-testid={`methlab-cook-${prod.id}`}
              className="btn-press flex items-center gap-3 border border-zinc-800 bg-zinc-900/50 p-3 text-left hover:border-gold disabled:opacity-40 rounded-sm"
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-black border border-zinc-800"
                style={{ borderColor: prod.color }}
              >
                <FlaskConical className="h-6 w-6" style={{ color: prod.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-100 uppercase tracking-tight">{prod.name}</span>
                  <span className="text-[9px] font-mono px-1 rounded bg-zinc-800 text-gold font-bold">
                    {prod.purity}% Pure
                  </span>
                </div>
                <div className="text-[10px] text-zinc-500 leading-tight mb-1">{prod.desc}</div>
                <div className="flex items-center gap-3 mt-1 text-[9px] font-mono uppercase text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-zinc-600" />
                    {dur(prod.cookTime)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3 text-zinc-600" />
                    Yield: {prod.yieldMin}-{prod.yieldMax} units
                  </span>
                  <span className="flex items-center gap-1 text-kgreen font-bold">
                    <Coins className="h-3 w-3" />
                    {cedi(prod.sellPriceClean)} clean/ea
                  </span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className="block font-display text-sm text-amber-400 font-mono">
                  {cedi(prod.costDirty)}
                </span>
                <span className="text-[8px] text-zinc-500 uppercase tracking-tighter">precursors</span>
              </div>
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

function BenchTile({ idx, bench, now, onStart }) {
  const { act } = useGame();
  const prod = METHLAB_PRODUCTS.find((x) => x.id === bench.productId);
  if (!bench.productId) {
    return (
      <button
        onClick={onStart}
        data-testid={`methlab-bench-${idx}`}
        className="btn-press flex h-[132px] flex-col items-center justify-center gap-1 border border-dashed border-zinc-800 bg-zinc-900/20 text-zinc-600 hover:border-gold hover:text-gold rounded-sm transition-colors"
      >
        <Plus className="h-7 w-7 mb-1" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Open Station #{idx + 1}</span>
      </button>
    );
  }
  const pct = Math.min(100, Math.max(0, Math.round(((now - bench.start) / Math.max(1, bench.end - bench.start)) * 100)));
  const ready = now >= bench.end;

  return (
    <Card accent={ready ? "green" : "gold"} className="flex h-[132px] flex-col justify-between bg-zinc-900/40 p-3" data-testid={`methlab-bench-${idx}`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="truncate font-display text-xs uppercase text-zinc-100 mb-0.5 tracking-tight font-bold">
            {prod?.name || bench.productId}
          </div>
          <div className="flex items-center gap-1 text-[9px] font-mono tracking-tighter text-zinc-500 uppercase">
            {ready ? (
              <span className="text-kgreen font-black flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Batch Ready ({bench.yield || 1} units)
              </span>
            ) : (
              <>
                <Clock className="h-2.5 w-2.5" /> {dur(bench.end - now)} left
              </>
            )}
          </div>
        </div>
        <FlaskConical className={`h-5 w-5 shrink-0 ${ready ? "text-kgreen animate-bounce" : "text-sky-400 animate-pulse"}`} />
      </div>
      <div className="mt-2">
        {ready ? (
          <Btn
            variant="green"
            className="w-full h-9 text-[10px] uppercase font-black tracking-widest"
            onClick={() =>
              act("methlab_claim", { benchIdx: idx }, {
                onResult: (r) => toast.success(`Claimed ${r.quantity || 1} units of ${prod?.name || "product"}!`),
              })
            }
            data-testid={`methlab-claim-btn-${idx}`}
          >
            Claim Lab Batch
          </Btn>
        ) : (
          <div className="space-y-1.5">
            <Bar pct={pct} color="gold" className="h-1.5 rounded-full" />
            <div className="flex justify-between items-center text-[8px] font-black text-zinc-600 uppercase tracking-widest">
              <span>Synthesizing...</span>
              <span className="text-gold font-mono">{pct}%</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function LabStash() {
  const { player: p, act } = useGame();
  const stash = p.methlab?.stash || {};
  const hasItems = Object.values(stash).some((qty) => qty > 0);

  return (
    <div className="mt-4 border border-zinc-800 bg-surface/80 p-3 rounded-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
          <FlaskConical className="h-4 w-4 text-sky-400" />
          <span>Product Vault & Wholesale Export</span>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">Wholesale liquidations pay Clean Cash</span>
      </div>

      <div className="grid gap-2">
        {METHLAB_PRODUCTS.map((prod) => {
          const qty = stash[prod.id] || 0;
          const cleanRate = prod.sellPriceClean;
          const totalVal = qty * cleanRate;

          return (
            <div
              key={prod.id}
              className="flex items-center justify-between p-2 rounded border border-zinc-800/80 bg-zinc-950/40 text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: prod.color }}
                />
                <div>
                  <span className="font-bold text-zinc-100">{prod.name}</span>
                  <span className="text-[10px] text-zinc-500 font-mono ml-2">
                    In Stash: <b className="text-zinc-200">{qty}</b> units
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
                    act("methlab_sell", { productId: prod.id, amount: qty }, {
                      onResult: (r) => toast.success(`Liquidated ${r.sold}x ${prod.name} for ${cedi(r.payout)} Clean Cash!`),
                    })
                  }
                >
                  Sell All
                </Btn>
              </div>
            </div>
          );
        })}
        {!hasItems && (
          <div className="p-3 text-center text-xs text-zinc-500 italic">
            Lab vault is currently empty. Fire up a cook station above!
          </div>
        )}
      </div>
    </div>
  );
}

function LabUpgrades() {
  const { player: p, derived: d, act } = useGame();
  const upCosts = d.methlab?.up_costs || {};
  const currentUps = p.methlab?.up || {};

  return (
    <div className="mt-4 border border-zinc-800 bg-surface/80 p-3 rounded-sm">
      <div className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-2 flex items-center gap-1.5">
        <Sparkles className="h-4 w-4 text-gold" />
        <span>Clandestine Facility Upgrades</span>
      </div>
      <div className="grid gap-2">
        {Object.entries(METHLAB.upgrades).map(([key, up]) => {
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
                      act("methlab_upgrade", { upId: key }, {
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

export default function Methlab() {
  const { player: p, derived: d, act } = useGame();
  const now = useNow();
  const [activeCookIdx, setActiveCookIdx] = useState(null);

  const benches = p.methlab?.benches || [];
  const benchCost = d.methlab?.bench_cost || METHLAB.bench_cost;
  const isMaxBenches = benches.length >= METHLAB.max_benches;
  const affordBench = BigInt(p.clean || "0") >= BigInt(benchCost);
  const readyCount = benches.filter((b) => b.productId && b.start > 0 && now >= b.end).length;

  return (
    <div className="space-y-4 pb-12" data-testid="methlab-tab">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-3 mt-2">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400 flex items-center gap-1.5">
            <FlaskConical className="h-3 w-3" />
            <span>Industrial Narcotics Operations</span>
          </div>
          <h2 className="font-display text-2xl uppercase text-zinc-100 font-bold leading-tight">
            Underground Meth Lab ({benches.length}/{METHLAB.max_benches} Stations)
          </h2>
        </div>
        {!isMaxBenches && (
          <Btn
            variant={affordBench ? "green" : "ghost"}
            disabled={!affordBench}
            onClick={() =>
              act("methlab_buy_bench", {}, {
                onResult: () => toast.success("Installed new cooking station!"),
              })
            }
            className="text-[10px] font-bold uppercase"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Station ({cedi(benchCost)})
          </Btn>
        )}
      </div>

      {readyCount > 1 && (
        <Btn
          variant="green"
          className="w-full h-9 text-xs font-black uppercase tracking-wider"
          onClick={() =>
            act("methlab_claim", { benchIdx: "all" }, {
              onResult: (r) => toast.success(`Claimed all lab batches (${r.total} total units)!`),
            })
          }
        >
          Claim All Ready Batches ({readyCount})
        </Btn>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {benches.map((bench, idx) => (
          <BenchTile
            key={idx}
            idx={idx}
            bench={bench}
            now={now}
            onStart={() => setActiveCookIdx(idx)}
          />
        ))}
      </div>

      <LabStash />
      <LabUpgrades />

      {activeCookIdx !== null && (
        <CookSheet bench={activeCookIdx} onClose={() => setActiveCookIdx(null)} />
      )}
    </div>
  );
}
