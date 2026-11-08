import { useEffect, useMemo, useState } from "react";
import * as L from "lucide-react";
import { toast } from "sonner";
import { useGame } from "../../store/game";
import { TIER_PALETTE } from "../../data/gameData";
import { useNow } from "../../hooks/useNow";
import { cedi, dur, big, fmt } from "../../lib/fmt";
import { Card, SectionTitle, Btn } from "./ui";
import { Badge, Details } from "./v9";
import { LUXURY_EFFECT_META, LUXURY_TIER_NAMES } from "../../data/luxury";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";

const Icon = ({ name, className = "h-4 w-4", style }) => {
  const C = L[name] || L.Sparkles;
  return <C className={className} style={style} aria-hidden="true" />;
};

export function EffectChips({ effects, testid }) {
  return (
    <span className="flex flex-wrap gap-1" data-testid={testid}>
      {Object.entries(effects || {}).filter(([, v]) => v).map(([k, v]) => {
        const m = LUXURY_EFFECT_META[k];
        return (
          <span key={k} title={`${m.label}: ${m.fmt(v)}`} className="inline-flex items-center gap-0.5 rounded border border-zinc-700 px-1 text-[9px] font-bold text-zinc-300">
            <Icon name={m.icon} className="h-2.5 w-2.5" />{m.fmt(v)}
          </span>
        );
      })}
    </span>
  );
}

function LuxTile({ it, onClick, isNext, isNew }) {
  const tierColor = TIER_PALETTE[it.tier] || "#71717a";
  const owned = it.owned_qty > 0;

  return (
    <button 
      onClick={() => onClick(it)}
      className={`btn-press aspect-square relative flex flex-col items-center justify-center overflow-hidden rounded-[2px] border bg-surface ${
        it.owned ? "border-kgreen/40" : isNext ? "border-gold/60" : "border-zinc-800"
      }`}
      data-testid={`lux-item-${it.id}`}
    >
        {isNew && <div className="absolute top-1 right-1 z-20"><Badge dot /></div>}
        
        {/* Item Name */}
        <div className="absolute top-0.5 inset-x-0.5 z-10 px-0.5">
          <div className="flex items-center justify-between gap-0.5 bg-black/75 rounded-[1px] px-1 py-0.5">
            <span className="text-[7px] font-bold text-white truncate leading-tight">
              {it.name}
            </span>
            {owned && (
              <span className="bg-emerald-500 text-emerald-950 text-[5px] font-black px-1 rounded-[1px] leading-none shrink-0">
                OWNED {it.owned_qty > 1 ? `x${fmt(it.owned_qty)}` : ""}
              </span>
            )}
          </div>
        </div>

        {/* Icon */}
        <div className="relative z-10 flex flex-col items-center justify-center mt-3 mb-2">
          <Icon name={it.icon} className="h-6 w-6 drop-shadow-md" style={{ color: tierColor }} />
        </div>
        
        {/* Price Bar */}
        <div className="absolute bottom-0 inset-x-0 bg-black/90 py-1 text-center z-20 border-t border-white/5">
            <div className="text-[8px] font-mono font-black tracking-tighter text-kgreen">
                {fmt(it.price)}
            </div>
        </div>
    </button>
  );
}

export default function LuxuryShop() {
  const { player: p, derived: d, act } = useGame();
  const now = useNow();
  const lx = d.luxury;
  const [cat, setCat] = useState("all");
  const [showOwned, setShowOwned] = useState(true);
  const [newIds] = useState(() => new Set(lx?.affordable_new || []));

  const [selectedItem, setSelectedItem] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Viewing the boutique clears its badge
  useEffect(() => {
    if (lx && lx.badge > 0) { const t = setTimeout(() => act("lux_seen"), 1200); return () => clearTimeout(t); }
  }, [lx?.badge]); // eslint-disable-line

  const items = useMemo(() => {
    if (!lx) return [];
    return lx.items
      .filter((i) => !i.limited)
      .filter((i) => cat === "all" || i.category === cat)
      .filter((i) => showOwned || !i.owned)
      .sort((a, b) => a.price - b.price);
  }, [lx, cat, showOwned]);

  if (!lx) return null;
  const rot = lx.items.filter((i) => lx.rotation.ids.includes(i.id));
  const next = lx.items.find((i) => i.id === lx.next_id);
  const e = lx.effects;

  const handleBuy = () => {
    if (!selectedItem) return;
    act("lux_buy", { id: selectedItem.id }, {
      onResult: (r) => {
        toast.success(`${selectedItem.name} acquired`, { duration: 4000, description: r?.sets?.length ? "Collection set bonus unlocked!" : undefined });
        setSelectedItem(null);
        setIsConfirming(false);
      },
    });
  };

  return (
    <div className="space-y-3" data-testid="luxury-shop">
      <SectionTitle kicker="Pay with clean cedis · every asset has a real effect" title="Luxury Assets" />

      {/* Summary: effects totals */}
      <Card accent="gold" className="!p-2.5" data-testid="lux-summary">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 font-black uppercase text-gold"><L.Gem className="h-3.5 w-3.5" />{lx.owned_count}/{lx.total} owned</span>
          <span className="text-zinc-400" title="Legacy Estate value: what your collection cost">Estate <b className="text-zinc-100">{cedi(lx.estate_value)}</b></span>
        </div>
        <div className="mt-1.5"><EffectChips effects={e} testid="lux-total-effects" /></div>
        {next && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-300" data-testid="lux-next">
            <L.ArrowUpRight className="h-3.5 w-3.5 text-gold" />Next: <b className="truncate text-zinc-100">{next.name}</b> · <span className="text-kgreen font-bold">{cedi(next.price)}</span>
          </div>
        )}
        <Details label="How effects work" testid="lux-help">
          Income boosts hustles and plots. Laundering lowers the fee (minimum 2%). Heat cuts all heat you gain. Power adds to raid defence and fights.
          Intimidation lowers rival power. Loyalty sets a crew morale floor. Influence adds +0.5% heist reward each (max +100%). Caps: income +150%, fee −6%, heat −60%, rival power −35%, morale floor 70.
        </Details>
      </Card>

      {/* Rotating limited stock */}
      <div data-testid="lux-rotation">
        <div className="mb-1 flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
          <span className="flex items-center gap-1 text-rose-300"><L.Hourglass className="h-3 w-3" />Limited drop</span>
          <span className="font-mono text-zinc-400" data-testid="lux-rotation-timer">{dur(lx.rotation.ends - now)}</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {rot.map((it) => (
            <LuxTile key={it.id} it={it} onClick={setSelectedItem} isNew={false} />
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="hide-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4" role="tablist">
        {[{ id: "all", name: "All", icon: "LayoutGrid" }, ...lx.categories].map((c) => {
          const n = lx.items.filter((i) => (c.id === "all" || i.category === c.id) && newIds.has(i.id) && i.affordable).length;
          const active = cat === c.id;
          return (
            <button key={c.id} onClick={() => setCat(c.id)} title={c.desc || "All categories"} aria-label={c.name} data-testid={`lux-cat-${c.id}`}
              className={`btn-press relative flex shrink-0 items-center gap-1 border px-3 py-1.5 text-[10px] font-extrabold uppercase ${active ? "border-gold bg-gold text-ink" : "border-zinc-800 text-zinc-400 bg-surface"}`}>
              <Icon name={c.icon} className="h-3.5 w-3.5" />{active || c.id === "all" ? c.name : ""}
              {n > 0 && <Badge n={n} />}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between px-1">
        <label className="flex items-center gap-1.5 text-[10px] uppercase text-zinc-500">
          <input type="checkbox" checked={showOwned} onChange={(e) => setShowOwned(e.target.checked)} data-testid="lux-show-owned" />
          Show owned
        </label>
        <span className="text-[9px] text-zinc-500 uppercase font-black">Catalog: {items.length} items</span>
      </div>

      <div className="grid grid-cols-5 gap-1.5" data-testid="lux-list">
        {items.map((it) => (
          <LuxTile 
            key={it.id} 
            it={it} 
            onClick={setSelectedItem} 
            isNext={it.id === lx.next_id} 
            isNew={newIds.has(it.id) && it.affordable} 
          />
        ))}
      </div>

      {/* Collection sets */}
      <SectionTitle kicker="Own pieces from a set to unlock bonuses" title="Collections" />
      <div className="grid grid-cols-1 gap-1.5" data-testid="lux-sets">
        {lx.sets.map((st) => (
          <div key={st.id} className="border border-zinc-800 p-2" data-testid={`lux-set-${st.id}`}>
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 font-black uppercase text-zinc-100"><Icon name={st.icon} className="h-3.5 w-3.5 text-gold" />{st.name}</span>
              <span className="font-mono text-zinc-400">{st.count}/{st.total}</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {st.tiers.map((t) => (
                <span key={t.need} title={t.label} className={`rounded border px-1 text-[9px] font-bold ${st.count >= t.need ? "border-gold/50 text-gold" : "border-zinc-700 text-zinc-500"}`}>
                  {t.need}: {t.label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Item Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => { setSelectedItem(null); setIsConfirming(false); }}>
        <DialogContent>
          {selectedItem && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>{isConfirming ? "Confirm Purchase?" : selectedItem.name}</DialogTitle>
                <DialogDescription className="space-y-1" asChild>
                  <div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black uppercase px-1 py-0.5 border border-zinc-800 bg-black/40 rounded-[1px] text-gold">{selectedItem.brand || "Syndicate"}</span>
                       <span className="text-zinc-400">Tier {selectedItem.tier} · {LUXURY_TIER_NAMES[selectedItem.tier]}</span>
                    </div>
                    <div className="text-zinc-300">{isConfirming ? `Are you sure you want to acquire ${selectedItem.name} for ${cedi(selectedItem.price)} clean?` : selectedItem.desc}</div>
                    {!isConfirming && (
                      <div className="mt-2">
                        <EffectChips effects={selectedItem.effects} />
                      </div>
                    )}
                  </div>
                </DialogDescription>
              </DialogHeader>
              {!isConfirming && (
                <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                  <div className="text-sm font-mono text-zinc-300">Price: <span className="text-kgreen">{cedi(selectedItem.price)} clean</span></div>
                  {selectedItem.owned_qty > 0 && <div className="text-[10px] font-bold text-gold uppercase">Owned: {selectedItem.owned_qty}</div>}
                </div>
              )}
              <DialogFooter>
                <Btn variant="ghost" onClick={() => isConfirming ? setIsConfirming(false) : setSelectedItem(null)}>
                  {isConfirming ? "Back" : "Cancel"}
                </Btn>
                <Btn 
                  variant="green" 
                  disabled={!selectedItem.affordable || (selectedItem.owned_qty >= 999999)} 
                  onClick={() => isConfirming ? handleBuy() : setIsConfirming(true)}
                >
                  <div className="flex items-center gap-1">
                    <L.ShoppingBag className="h-4 w-4" />
                    <span>{isConfirming ? "Confirm Buy" : selectedItem.owned_qty > 0 ? "Buy Another" : "Buy"}</span>
                  </div>
                </Btn>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
