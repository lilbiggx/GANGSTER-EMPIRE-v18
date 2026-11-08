import { useState } from "react";
import { toast } from "sonner";
import { Sprout, Leaf, Flower2, Lock, Flame, TrendingUp, TrendingDown, Plus, Coins } from "lucide-react";
import { useGame } from "../../../store/game";
import { useNow } from "../../../hooks/useNow";
import { cedi, dur } from "../../../lib/fmt";
import { Btn, Card, Bar, SectionTitle, Chip, Sheet } from "../../../components/game/ui";

function StrainSheet({ plot, onClose }) {
  const { player: p, config, derived: d, act } = useGame();
  const plant = (sid) => { act("farm_plant", { plot, strain: sid }); onClose(); };
  return (
    <Sheet open onClose={onClose} testid="strain-sheet">
      <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-blood">Plot {plot + 1}</div>
      <h3 className="font-display text-2xl uppercase text-zinc-100">Pick a seed</h3>
      <div className="mt-3 grid gap-2">
        {config.strains.map((s) => {
          const cantAfford = Number(p.dirty) < s.seed;
          return (
            <button key={s.id} disabled={cantAfford} onClick={() => plant(s.id)} data-testid={`strain-plant-${s.id}`}
              className="btn-press flex items-center gap-3 border border-zinc-800 bg-ink p-2.5 text-left hover:border-gold disabled:opacity-40">
              <Leaf className="h-6 w-6 shrink-0" style={{ color: s.color }} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-zinc-100">{s.name}</div>
                <div className="text-[10px] text-zinc-500">{s.desc}</div>
                <div className="text-[10px] font-bold uppercase text-zinc-400">{dur(d.farm.grow[s.id])} · {s.yield[0]}–{s.yield[1]} units · sells ~{cedi(d.farm.prices[s.id])}</div>
              </div>
              <span className="shrink-0 flex items-center gap-1 font-display text-sm text-gold">
                <Coins className="h-4 w-4" />
                {cedi(s.seed)}
              </span>
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

function Plot({ i, plot, now, onPlant }) {
  const { config, act } = useGame();
  const s = config.strains.find((x) => x.id === plot.strain);
  if (!s) {
    return (
      <button onClick={onPlant} data-testid={`farm-plot-${i}`} className="btn-press flex h-[132px] flex-col items-center justify-center gap-1 border border-dashed border-zinc-700 bg-[#1a140e] text-zinc-500 hover:border-gold hover:text-gold">
        <Plus className="h-6 w-6" /><span className="text-[11px] font-extrabold uppercase">Plant seeds</span>
      </button>
    );
  }
  const pct = Math.min(100, ((now - plot.start) / (plot.end - plot.start)) * 100);
  const ready = now >= plot.end;
  const Icon = pct < 35 ? Sprout : pct < 100 ? Leaf : Flower2;
  return (
    <Card accent={ready ? "green" : "gold"} className="flex h-[132px] flex-col justify-between bg-[#1a140e]" data-testid={`farm-plot-${i}`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0"><div className="truncate font-display text-sm uppercase text-zinc-100">{s.name}</div><div className="text-[10px] text-zinc-500">{ready ? "Ready to cut" : dur(plot.end - now)}</div></div>
        <Icon className={`shrink-0 transition-transform duration-700 ${ready ? "animate-pulse" : ""}`} style={{ color: s.color, width: 18 + pct * 0.14, height: 18 + pct * 0.14 }} />
      </div>
      {ready
        ? <Btn variant="green" className="w-full" onClick={() => act("farm_harvest", { plot: i }, { onResult: (r) => toast.success(`Harvested ${Object.values(r.harvest)[0]} ${s.name}`) })} data-testid={`farm-harvest-btn-${i}`}>Harvest</Btn>
        : <Bar pct={pct} color="green" testid={`farm-plot-bar-${i}`} />}
    </Card>
  );
}

function Stash() {
  const { player: p, config, derived: d, act } = useGame();
  const items = config.strains.filter((s) => (p.farm.stash[s.id] || 0) > 0);
  if (!items.length) return <div className="stripes border border-zinc-800 p-4 text-center text-xs text-zinc-400" data-testid="farm-stash-empty">Your stash is empty. Harvest a plot, then sell it here for dirty cedis.</div>;
  const reduce = 1 - 0.2 * (p.farm.up.greenhouse || 0);
  return (
    <div className="grid gap-2" data-testid="farm-stash">
      {items.map((s) => {
        const qty = p.farm.stash[s.id];
        const price = d.farm.prices[s.id];
        const up = price >= s.price;
        const heat = Math.min(25, (s.heat * qty) / 8 * reduce);
        return (
          <Card key={s.id} accent="red" data-testid={`farm-stash-${s.id}`}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-display uppercase text-zinc-100">{s.name} <span className="text-gold">×{qty}</span></div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                  <span className={`flex items-center gap-0.5 ${up ? "text-kgreen" : "text-blood"}`}>{up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{cedi(price)} each</span>
                  <span className="flex items-center gap-0.5 text-orange-300"><Flame className="h-3 w-3" />+{heat.toFixed(1)} heat</span>
                </div>
              </div>
              <Btn
                onClick={() =>
                  act("farm_sell", { strain: s.id }, {
                    onResult: (r) => toast.success(`Sold for ${cedi(r.cash)} dirty cedis! Wash it through your fronts.`),
                  })
                }
                data-testid={`farm-sell-btn-${s.id}`}
              >
                Sell for {cedi(price * qty)} dirty
              </Btn>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function FarmUpgrades() {
  const { player: p, config, derived: d, act } = useGame();
  return (
    <div className="grid gap-2">
      {Object.entries(config.farm.upgrades).map(([k, u]) => {
        const lvl = p.farm.up[k] || 0;
        const max = lvl >= u.max;
        return (
          <Card key={k} accent="gold" data-testid={`farm-upgrade-${k}`}>
            <div className="flex items-center justify-between gap-2">
              <div><div className="font-display uppercase text-zinc-100">{u.name} <span className="text-xs text-gold">{lvl}/{u.max}</span></div><div className="text-[11px] text-zinc-400">{u.desc}</div></div>
              <Btn variant="gold" disabled={max || Number(p.dirty) < Number(d.farm.up_cost[k])} onClick={() => act("farm_upgrade", { key: k })} data-testid={`farm-upgrade-btn-${k}`}>
                <div className="flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5" />
                  <span>{max ? "Max" : cedi(d.farm.up_cost[k])}</span>
                </div>
              </Btn>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default function Farm() {
  const { player: p, config, derived: d, act } = useGame();
  const now = useNow();
  const [planting, setPlanting] = useState(null);
  const plots = p.farm.plots;
  const ready = plots.filter((x) => x.strain && x.end <= now).length;
  const full = plots.length >= config.farm.max_plots;
  return (
    <div data-testid="farm-page">
      <SectionTitle kicker="Grow your own" title="Grow Farm" right={<Chip data-testid="farm-plot-count">{plots.length}/{config.farm.max_plots} plots</Chip>} />
      <p className="-mt-1 mb-3 text-[11px] text-zinc-400">Plant seeds with dirty cash, wait, harvest, then sell the stash. Prices move every 12h. Selling makes noise, so watch your heat.</p>
      {ready > 1 && <Btn variant="green" className="mb-2 w-full" onClick={() => act("farm_harvest", { plot: "all" })} data-testid="farm-harvest-all-btn">Harvest all ({ready})</Btn>}
      <div className="grid grid-cols-2 gap-2">
        {plots.map((pl, i) => <Plot key={i} i={i} plot={pl} now={now} onPlant={() => setPlanting(i)} />)}
        {!full && (
          <button disabled={Number(p.clean) < Number(d.farm.plot_cost)} onClick={() => act("farm_buy_plot")} data-testid="farm-buy-plot-btn"
            className="btn-press flex h-[132px] flex-col items-center justify-center gap-1 border border-kgreen/60 bg-kgreen/5 text-kgreen hover:bg-kgreen/10 disabled:opacity-40">
            <Sprout className="h-6 w-6 text-kgreen" />
            <span className="text-[11px] font-extrabold uppercase">{plots.length ? "Buy plot" : "Buy your first plot"}</span>
            <div className="flex items-center gap-1 font-display text-sm text-kgreen font-bold">
              <Coins className="h-3.5 w-3.5" />
              <span>{cedi(d.farm.plot_cost)} clean</span>
            </div>
          </button>
        )}
      </div>
      <SectionTitle kicker="Move the product" title="Stash" />
      <Stash />
      <SectionTitle kicker="Grow better" title="Farm Upgrades" />
      <FarmUpgrades />
      {planting !== null && <StrainSheet plot={planting} onClose={() => setPlanting(null)} />}
    </div>
  );
}
