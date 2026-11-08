import { useState, useEffect } from "react";
import { Package, Bike, Timer, Sparkles, HeartPulse, Cigarette, Utensils, CheckCircle2, ShieldCheck, Flame, Zap, AlertCircle, Tv, Pill, Target, Sword, Crosshair, MapPin, Coins, Heart, Swords, Glasses, Brain, Car } from "lucide-react";
import * as L from "lucide-react";
import { useGame } from "../../store/game";
import { TIER_PALETTE } from "../../data/gameData";
import { useNow } from "../../hooks/useNow";
import { dur, cedi, big, fmt } from "../../lib/fmt";
import { Btn, Card, Bar, SectionTitle, Chip } from "../../components/game/ui";
import { CrewCard, getCrewTraits, TRAIT_ICON_MAP } from "./Crew";
import LuxuryShop from "../../components/game/LuxuryShop";
import { Badge, Portrait } from "../../components/game/v9";
import { DELIVERABLE_CONSUMABLES } from "../../data/consumablesData";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { useMemo } from "react";

const SUBS = [
  ["boutique", "Boutique"],
  ["express_drop", "Express Drop"],
  ["black_market", "Black Market"],
  ["gun_shop", "Gun Shop"],
];
const RARITY = { common: "text-zinc-300", rare: "text-sky-300", legendary: "text-gold" };

function Restock() {
  const p = useGame(s => s.player);
  const d = useGame(s => s.derived);
  const showAd = useGame(s => s.showAd);
  const now = useNow();
  const restocked = Boolean(p.ads?.restock);
  return (
    <div className="mt-3 flex items-center justify-between gap-2 border border-zinc-800 bg-surface/80 p-2.5 text-[11px]" data-testid="store-restock-bar">
      <div className="flex items-center gap-2">
        <Timer className="h-4 w-4 text-zinc-400 shrink-0" />
        <span className="text-zinc-400">
          Restock in <b className="font-mono text-zinc-100" data-testid="store-restock-timer">{dur(d.store_next - now)}</b>
        </span>
      </div>
      <Btn
        variant={restocked ? "ghost" : "gold"}
        disabled={restocked}
        onClick={() => showAd("restock")}
        data-testid="store-ad-restock-btn"
        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider shadow"
      >
        <Tv className="h-3.5 w-3.5" />
        <span>{restocked ? "Restocked Today" : "Watch Broadcast (Free Restock)"}</span>
      </Btn>
    </div>
  );
}

const SubIcon = ({ subcategory, className = "h-5 w-5 text-white", style }) => {
  const map = {
    hat: L.HardHat,
    top: L.Shirt,
    bottom: L.Layers,
    shoes: L.Footprints,
    melee: L.Sword,
    secondary: L.Target,
    primary: L.Crosshair,
  };
  const C = map[subcategory] || L.Sparkles;
  return <C className={className} style={style} />;
};


function BoutiqueShop() {
  const p = useGame(s => s.player);
  const d = useGame(s => s.derived);
  const act = useGame(s => s.act);
  const openLocker = useGame(s => s.openLocker);
  const [subcat, setSubcat] = useState("all");
  const [query, setQuery] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [limit, setLimit] = useState(25);

  const boutiqueItems = d.store?.boutique || [];
  const subcats = d.store?.boutique_subcategories || [];

  const filtered = useMemo(() => {
    return boutiqueItems.filter((o) => {
      if (o.left <= 0) return false; // Hide purchased items
      if (subcat !== "all" && o.subcategory !== subcat) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchName = o.name?.toLowerCase().includes(q);
        const matchT2 = o.tier2_cat?.name?.toLowerCase().includes(q) || o.tier2_cat?.trait_name?.toLowerCase().includes(q);
        const matchDesc = o.desc?.toLowerCase().includes(q);
        if (!matchName && !matchT2 && !matchDesc) return false;
      }
      return true;
    });
  }, [boutiqueItems, subcat, query]);

  const visible = filtered.slice(0, limit);
  const hasMore = filtered.length > limit;

  const isLuxOwned = (id) => {
    const lux = p.luxury || {};
    return !!lux[id] && lux[id] > 0;
  };

  return (
    <div className="space-y-3" data-testid="boutique-shop">
      <SectionTitle
        kicker="Accra Haute Couture & Syndicate Wardrobe"
        title="Executive Underworld Boutique"
        right={
          <button onClick={() => openLocker("boss")} className="text-[11px] font-bold uppercase tracking-wider text-gold hover:underline">
            Open Locker →
          </button>
        }
      />

      {/* Subcategory Pills */}
      <div className="hide-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
        {subcats.map((sc) => {
          const count = sc.id === "all" ? boutiqueItems.length : boutiqueItems.filter((b) => b.subcategory === sc.id).length;
          const active = subcat === sc.id;
          return (
            <button key={sc.id} onClick={() => setSubcat(sc.id)} className={`btn-press shrink-0 flex items-center gap-1.5 border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider ${
                active ? "border-gold bg-gold text-ink" : "border-zinc-800 bg-surface text-zinc-300 hover:border-zinc-700"
              }`}>
              <span>{sc.name}</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[9px] ${active ? "bg-ink text-gold" : "bg-zinc-800 text-zinc-400"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Item Catalog Grid (5 items per row with icons and prices) */}
      <div className="grid grid-cols-5 gap-1.5">
        {visible.map((o) => {
          const owned = isLuxOwned(o.id);
          // 8-tier color coding
          const tierColor = TIER_PALETTE[o.tier] || "#27272a";


          return (
            <button 
              key={o.id} 
              onClick={() => setSelectedItem(o)} 
              className="btn-press aspect-square relative flex flex-col items-center justify-center overflow-hidden rounded-[2px] border border-zinc-800 bg-surface"
              data-testid={`boutique-item-${o.id}`}
            >
                {/* Item Name */}
                <div className="absolute top-0.5 inset-x-0.5 z-10 px-0.5">
                  <div className="flex items-center justify-between gap-0.5 bg-black/75 rounded-[1px] px-1 py-0.5">
                    <span className="text-[7px] font-bold text-white truncate leading-tight">
                      {o.name}
                    </span>
                    {owned && (
                      <span className="bg-emerald-500 text-emerald-950 text-[5px] font-black px-1 rounded-[1px] leading-none shrink-0">
                        OWNED
                      </span>
                    )}
                  </div>
                </div>

                {/* Icon */}
                <div className="relative z-10 flex flex-col items-center justify-center mt-3 mb-2">
                  <SubIcon subcategory={o.slot || o.subcategory} className="h-5 w-5 drop-shadow-md" style={{ color: tierColor }} />
                </div>
                
                {/* Price Bar */}
                <div className="absolute bottom-0 inset-x-0 bg-black/90 py-1 text-center z-20 border-t border-white/5">
                    <div className="text-[8px] font-mono font-black tracking-tighter text-kgreen">
                        {fmt(o.clean || o.price)}
                    </div>
                </div>
            </button>
          );
        })}
      </div>

      {hasMore && (
        <Btn variant="ghost" onClick={() => setLimit(l => l + 24)} className="w-full text-[10px]">
          Load More (+24) · {filtered.length - limit} remaining
        </Btn>
      )}

      {/* Item Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => { setSelectedItem(null); setIsConfirming(false); }}>
        <DialogContent>
          {selectedItem && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>{isConfirming ? "Confirm Purchase?" : selectedItem.name}</DialogTitle>
                <DialogDescription className="space-y-1" asChild>
                  <div>
                    <div>Brand: {selectedItem.brand} · Tier {selectedItem.tier}</div>
                    <div>{isConfirming ? `Are you sure you want to buy ${selectedItem.name} for ${cedi(selectedItem.clean)} clean?` : selectedItem.desc}</div>
                    {!isConfirming && selectedItem.effects && (
                      <div className="text-[10px] text-kgreen font-mono mt-1">
                        Perks: {Object.entries(selectedItem.effects).map(([k, v]) => `${k} +${v}`).join(", ")}
                      </div>
                    )}
                  </div>
                </DialogDescription>
              </DialogHeader>
              {!isConfirming && <div className="text-sm font-mono text-zinc-300">Price: <span className="text-kgreen">{cedi(selectedItem.clean)} clean</span></div>}
              <DialogFooter>
                <Btn variant="ghost" onClick={() => isConfirming ? setIsConfirming(false) : setSelectedItem(null)}>
                  {isConfirming ? "Back" : "Decline"}
                </Btn>
                <Btn variant="green" disabled={isLuxOwned(selectedItem.id) || big(p.clean) < big(selectedItem.clean)} onClick={() => {
                    if (isConfirming) {
                        act("store_buy", { store: "boutique", id: selectedItem.id });
                        setSelectedItem(null);
                        setIsConfirming(false);
                    } else {
                        setIsConfirming(true);
                    }
                }}>
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4" />
                    <span>{isConfirming ? "Confirm Buy" : "Buy"}</span>
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
function GunShop() {
  const p = useGame(s => s.player);
  const d = useGame(s => s.derived);
  const act = useGame(s => s.act);
  const openLocker = useGame(s => s.openLocker);

  const [subcat, setSubcat] = useState("all");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(25);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const weapons = d.store?.gun_shop || [];
  const subcats = d.store?.gun_shop_subcategories || [];

  const filtered = useMemo(() => {
    return weapons.filter((o) => {
      if (o.left <= 0) return false; // Hide purchased items
      
      if (subcat !== "all" && o.slot !== subcat && o.subcategory !== subcat) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchName = o.name?.toLowerCase().includes(q);
        const matchSlot = o.slot?.toLowerCase().includes(q);
        const matchRarity = o.rarity?.toLowerCase().includes(q);
        if (!matchName && !matchSlot && !matchRarity) return false;
      }
      return true;
    });
  }, [weapons, subcat, query]);

  const visible = filtered.slice(0, limit);
  const hasMore = filtered.length > limit;

  const isGearOwned = (id) => {
    return p.gear?.some(g => g.id === id);
  };

  return (
    <div className="space-y-3" data-testid="gun-shop">
      <div>
        <SectionTitle
          kicker="Syndicate Armory · Pay with Dirty Cedis · Resets every 12h"
          title="Underground Gun Shop"
          right={
            <button
              onClick={() => openLocker("boss")}
              className="text-[11px] font-bold uppercase tracking-wider text-gold hover:underline"
            >
              Open Locker →
            </button>
          }
        />
        <p className="-mt-1 text-[10px] text-zinc-500 leading-tight">
          Heavy firepower, street blades, and tactical handguns for boss and crew loadouts. Equipping weapons grants lethal attack power.
        </p>
      </div>

      {/* Subcategory Pills */}
      <div className="hide-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
        {subcats.map((sc) => {
          const count = sc.id === "all" ? weapons.length : weapons.filter((w) => w.slot === sc.id || w.subcategory === sc.id).length;
          const active = subcat === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => setSubcat(sc.id)}
              className={`btn-press shrink-0 flex items-center gap-1.5 border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider ${
                active
                  ? "border-blood bg-blood text-white"
                  : "border-zinc-800 bg-surface text-zinc-300 hover:border-zinc-700"
              }`}
              data-testid={`gun-subcat-${sc.id}`}
            >
              <span>{sc.name}</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[9px] ${active ? "bg-black/40 text-white" : "bg-zinc-800 text-zinc-400"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search arsenals, models..."
          className="w-full border border-zinc-800 bg-ink px-2.5 py-1.5 text-[10px] text-zinc-100 placeholder-zinc-600 focus:border-blood focus:outline-none"
        />
      </div>

      {/* Weapon Catalog Grid (5 items per row) */}
      <div className="grid grid-cols-5 gap-1.5">
        {visible.map((o) => {
          const owned = isGearOwned(o.id);
          const locked = (o.unlock || 0) > p.level;
          // 8-tier color coding
          const tierColor = TIER_PALETTE[o.tier || 1] || "#27272a";


          return (
            <button 
              key={o.id} 
              onClick={() => setSelectedItem(o)} 
              disabled={locked}
              className={`btn-press aspect-square relative flex flex-col items-center justify-center overflow-hidden rounded-[2px] border border-zinc-800 bg-surface ${locked ? "opacity-40 grayscale" : ""}`}
              data-testid={`gun-item-${o.id}`}
            >
                {/* Item Name */}
                <div className="absolute top-0.5 inset-x-0.5 z-10 px-0.5">
                  <div className="flex items-center justify-between gap-0.5 bg-black/75 rounded-[1px] px-1 py-0.5">
                    <span className="text-[7px] font-bold text-white truncate leading-tight">
                      {o.name}
                    </span>
                    {owned && (
                      <span className="bg-emerald-500 text-emerald-950 text-[5px] font-black px-1 rounded-[1px] leading-none shrink-0">
                        OWNED
                      </span>
                    )}
                  </div>
                </div>

                {/* Icon */}
                <div className="relative z-10 flex flex-col items-center justify-center mt-3 mb-2">
                  <SubIcon subcategory={o.slot || o.subcategory} className="h-5 w-5 drop-shadow-md" style={{ color: tierColor }} />
                </div>
                
                {/* Price Bar */}
                <div className="absolute bottom-0 inset-x-0 bg-black/90 py-1 text-center z-20 border-t border-white/5">
                    <div className="text-[8px] font-mono font-black tracking-tighter text-gold">
                        {fmt(o.price)}
                    </div>
                </div>
                {locked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-30">
                        <L.Lock className="h-4 w-4 text-zinc-500" />
                    </div>
                )}
            </button>
          );
        })}
      </div>

      {hasMore && (
        <Btn variant="ghost" onClick={() => setLimit(l => l + 25)} className="w-full text-[10px]">
          Load More (+25) · {filtered.length - limit} remaining
        </Btn>
      )}

      {/* Weapon Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => { setSelectedItem(null); setIsConfirming(false); }}>
        <DialogContent>
          {selectedItem && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>{isConfirming ? "Confirm Purchase?" : selectedItem.name}</DialogTitle>
                <DialogDescription className="space-y-1" asChild>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-1 py-0.5 border border-zinc-800 bg-black/40 rounded-[1px]">{selectedItem.rarity}</span>
                      <span className="text-zinc-400">Tier {selectedItem.tier || 1} · {selectedItem.slot}</span>
                    </div>
                    <div className="text-zinc-300">{isConfirming ? `Are you sure you want to buy ${selectedItem.name} for ${cedi(selectedItem.price)} dirty cash?` : selectedItem.desc || "Standard issue underworld arsenal."}</div>
                    {!isConfirming && (
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        {selectedItem.power && (
                          <div className="flex items-center gap-1.5 text-blood">
                            <Swords className="h-4 w-4" />
                            <span className="text-xs font-black">+{selectedItem.power} Power</span>
                          </div>
                        )}
                        {selectedItem.stat && (
                          <div className="flex items-center gap-1.5 text-gold">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-xs font-black">+{selectedItem.mod} {selectedItem.stat}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </DialogDescription>
              </DialogHeader>
              {!isConfirming && <div className="text-sm font-mono text-zinc-300">Price: {cedi(selectedItem.price)} dirty</div>}
              <DialogFooter>
                <Btn variant="ghost" onClick={() => isConfirming ? setIsConfirming(false) : setSelectedItem(null)}>
                  {isConfirming ? "Back" : "Decline"}
                </Btn>
                <Btn variant="red" disabled={big(p.dirty) < big(selectedItem.price)} onClick={() => {
                    if (isConfirming) {
                        act("store_buy", { store: "gun_shop", id: selectedItem.id });
                        setSelectedItem(null);
                        setIsConfirming(false);
                    } else {
                        setIsConfirming(true);
                    }
                }}>
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4" />
                    <span>{isConfirming ? "Confirm Buy" : "Buy"}</span>
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

function ExpressDropShop() {
  const p = useGame(s => s.player);
  const act = useGame(s => s.act);
  const now = useNow(1000);
  const [cat, setCat] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);

  const pending = p.pending_deliveries || [];
  const activeBuffs = (p.active_consumable_buffs || []).filter((b) => b.expires_at > now);

  const categories = [
    { id: "all", label: "All Drops", icon: Package },
    { id: "medicine", label: "Medicine", icon: Pill },
    { id: "cigarettes", label: "Cigarettes", icon: Cigarette },
    { id: "food", label: "Food Feasts", icon: Utensils },
    { id: "farm_weed", label: "Homegrown Stash", icon: Flame },
  ];

  const items = DELIVERABLE_CONSUMABLES.filter((it) => cat === "all" || it.category === cat);

  const handleOrder = () => {
    if (!selectedItem) return;
    act("order_delivery", { item_id: selectedItem.id });
    setSelectedItem(null);
  };

  return (
    <div className="space-y-4 mt-3" data-testid="express-drop-shop">
      {/* App Header Bar */}
      <div className="border border-kgreen/40 bg-gradient-to-r from-kgreen/15 to-surface p-3.5 rounded">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-kgreen/20 border border-kgreen/40 rounded-full text-kgreen">
              <Bike className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-kgreen">Mobile Dispatch · Accra Fast Drop</div>
              <h3 className="font-display text-lg uppercase text-zinc-100 font-bold">Express Consumables Delivery</h3>
            </div>
          </div>
          <Chip className="bg-kgreen/20 text-kgreen border-kgreen/40 font-mono text-[10px] shrink-0 flex items-center gap-1">
            <Zap className="h-3 w-3 text-kgreen" />
            <span>2 MIN COURIER</span>
          </Chip>
        </div>
        <p className="mt-2 text-xs text-zinc-300">
          Order high-grade pharma trauma kits, smokes, chop bar feasts, or roll farm-grown weed. Paid strictly in <b className="text-kgreen font-bold">Clean Cedis</b>.
        </p>
      </div>

      {/* In-Transit Deliveries Tracker */}
      {pending.length > 0 && (
        <div className="border border-gold/40 bg-zinc-950 p-3 rounded space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-gold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Package className="h-4 w-4 text-gold animate-bounce" />
              Couriers En Route ({pending.length})
            </span>
            <span className="text-[10px] text-zinc-400 font-normal">Active Dispatch</span>
          </div>

          <div className="grid gap-2">
            {pending.map((order) => {
              const arrived = now >= order.arrive_at;
              const remaining = Math.max(0, order.arrive_at - now);
              const elapsed = now - order.ordered_at;
              const total = order.arrive_at - order.ordered_at;
              const pct = Math.min(100, Math.max(0, (elapsed / (total || 1)) * 100));

              return (
                <div key={order.id} className="border border-zinc-800 bg-surface p-2.5 rounded">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-100 flex items-center gap-1.5">
                      <Bike className="h-3.5 w-3.5 text-zinc-400" />
                      {order.item_name}
                    </span>
                    <span className={`font-mono text-xs font-bold flex items-center gap-1 ${arrived ? "text-kgreen" : "text-gold"}`}>
                      {arrived ? "ARRIVED" : dur(remaining)}
                    </span>
                  </div>
                  <div className="my-2"><Bar pct={pct} color={arrived ? "green" : "gold"} /></div>
                  {arrived && (
                    <Btn variant="green" className="w-full py-1 text-ink font-black uppercase text-[10px]" onClick={() => act("claim_delivery", { order_id: order.id })}>Claim Package</Btn>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Temporal Buffs */}
      {activeBuffs.length > 0 && (
        <div className="border border-sky-600/40 bg-sky-950/20 p-2 rounded space-y-1">
          <div className="text-[9px] font-black uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-sky-400" />
            Active Buffs ({activeBuffs.length})
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {activeBuffs.map((b) => (
              <div key={b.id} className="flex items-center justify-between text-[10px] border border-sky-800/40 bg-black/40 px-2 py-1 rounded">
                <span className="font-bold text-zinc-200 truncate pr-1">{b.item_name}</span>
                <span className="font-mono text-sky-400 shrink-0">{dur(Math.max(0, b.expires_at - now))}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Pills */}
      <div className="hide-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 pb-1">
        {categories.map((c) => {
          const Icon = c.icon;
          const active = cat === c.id;
          return (
            <button key={c.id} onClick={() => setCat(c.id)} className={`btn-press shrink-0 flex items-center gap-1.5 border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider ${
                active ? "border-kgreen bg-kgreen text-ink" : "border-zinc-800 bg-surface text-zinc-400"
              }`}>
              <Icon className={`h-3 w-3 ${!active && "text-kgreen"}`} />
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Catalog Items Grid */}
      <div className="grid grid-cols-5 gap-1.5">
        {items.map((item) => {
          const totalClean = item.clean_price + item.delivery_fee;
          const cd = p.consumable_cooldowns?.[item.id] || 0;
          const onCooldown = cd > now;
          const Icon = categories.find(c => c.id === item.category)?.icon || Package;

          return (
            <button 
              key={item.id} 
              onClick={() => setSelectedItem(item)} 
              className={`btn-press aspect-square relative flex flex-col items-center justify-center overflow-hidden rounded-[2px] border border-zinc-800 bg-surface ${onCooldown ? "opacity-50" : ""}`}
            >
                {/* Item Name */}
                <div className="absolute top-0.5 inset-x-0.5 z-10 px-0.5">
                  <div className="flex items-center justify-center bg-black/75 rounded-[1px] px-1 py-0.5">
                    <span className="text-[7px] font-bold text-white truncate leading-tight">
                      {item.name}
                    </span>
                  </div>
                </div>

                {/* Icon */}
                <div className="relative z-10 flex flex-col items-center justify-center mt-3 mb-2 text-kgreen">
                  <Icon className="h-6 w-6 drop-shadow-md" />
                </div>
                
                {/* Price Bar */}
                <div className="absolute bottom-0 inset-x-0 bg-black/90 py-1 text-center z-20 border-t border-white/5">
                    <div className="text-[8px] font-mono font-black tracking-tighter text-kgreen">
                        {fmt(totalClean)}
                    </div>
                </div>
                {onCooldown && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-30">
                    <Timer className="h-4 w-4 text-zinc-400" />
                  </div>
                )}
            </button>
          );
        })}
      </div>

      {/* Item Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent>
          {selectedItem && (() => {
            const totalClean = selectedItem.clean_price + selectedItem.delivery_fee;
            const canAfford = BigInt(p.clean) >= BigInt(totalClean);
            const cd = p.consumable_cooldowns?.[selectedItem.id] || 0;
            const onCooldown = cd > now;
            
            let farmOk = true;
            let farmStashCount = 0;
            if (selectedItem.category === "farm_weed" && selectedItem.farm_strain_req) {
              farmStashCount = p.farm?.stash?.[selectedItem.farm_strain_req] || 0;
              farmOk = farmStashCount >= 1;
            }

            return (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle>{selectedItem.name}</DialogTitle>
                  <DialogDescription className="space-y-2" asChild>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border border-zinc-700 bg-zinc-900 text-zinc-300">
                          {selectedItem.category.replace("_", " ")}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-kgreen/15 text-kgreen border border-kgreen/30">
                          ⚡ {selectedItem.buff.stat_label}
                        </span>
                      </div>
                      <div className="text-zinc-300">{selectedItem.desc}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">Effect duration: {dur(selectedItem.duration_secs)}</div>
                      
                      {selectedItem.category === "farm_weed" && (
                        <div className="mt-1 text-[11px] font-mono">
                          <span className="text-zinc-400">Required: </span>
                          <span className={farmStashCount >= 1 ? "text-kgreen font-bold" : "text-blood font-bold"}>
                            {farmStashCount} / 1 {selectedItem.farm_strain_req?.toUpperCase()} available
                          </span>
                        </div>
                      )}
                    </div>
                  </DialogDescription>
                </DialogHeader>
                
                <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                  <div className="text-sm font-mono text-zinc-300">
                    Total: <span className="text-kgreen">{cedi(totalClean)}</span>
                  </div>
                  <div className="text-[9px] text-zinc-500 font-mono uppercase">
                    (Price {fmt(selectedItem.clean_price)} + Fee {fmt(selectedItem.delivery_fee)})
                  </div>
                </div>

                {onCooldown && (
                  <div className="text-[11px] font-mono text-blood font-bold text-center">
                    Dispatch busy: {dur(cd - now)} remaining
                  </div>
                )}

                <DialogFooter>
                  <Btn variant="ghost" onClick={() => setSelectedItem(null)}>Cancel</Btn>
                  <Btn 
                    variant="green" 
                    disabled={!canAfford || !farmOk || onCooldown} 
                    onClick={handleOrder}
                  >
                    <div className="flex items-center gap-1">
                      <Bike className="h-4 w-4" />
                      <span>{onCooldown ? "On Cooldown" : "Dispatch Courier"}</span>
                    </div>
                  </Btn>
                </DialogFooter>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}


function BoutiqueTabs() {
  const [view, setView] = useState("luxury");
  return (
    <div className="mt-3">
      <div className="mb-2 grid grid-cols-2 gap-1" role="tablist">
        {[["luxury", "Luxury Assets"], ["wear", "Designer Wear"]].map(([id, l]) => (
          <button key={id} onClick={() => setView(id)} data-testid={`boutique-view-${id}`}
            className={`btn-press border py-1.5 text-[10px] font-extrabold uppercase ${view === id ? "border-gold text-gold" : "border-zinc-800 text-zinc-500"}`}>{l}</button>
        ))}
      </div>
      {view === "luxury" ? <LuxuryShop /> : <BoutiqueShop />}
    </div>
  );
}

export default function Market() {
  const [sub, setSub] = useState(() => {
    const saved = sessionStorage.getItem("uw_market_sub");
    if (saved) {
      sessionStorage.removeItem("uw_market_sub");
      return saved;
    }
    return "boutique";
  });
  const p = useGame(s => s.player);
  const d = useGame(s => s.derived);
  const act = useGame(s => s.act);
  const seenViews = useGame(s => s.seenViews);
  const markViewSeen = useGame(s => s.markViewSeen);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const s = d.store;

  useEffect(() => {
    if (markViewSeen) markViewSeen("market_" + sub);
    if (sub === "boutique") {
      act("lux_seen");
    }
  }, [sub, markViewSeen, act]);

  return (
    <div>
      <div className="hide-scrollbar -mx-4 mt-3 flex gap-1 overflow-x-auto px-4">
        {SUBS.map(([id, l]) => {
          const active = sub === id;
          const isSeen = Boolean(seenViews?.["market_" + id]);
          return (
            <button key={id} onClick={() => setSub(id)} data-testid={`market-sub-${id}`}
              className={`btn-press relative shrink-0 border px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider ${active ? "border-gold bg-gold text-ink" : "border-zinc-800 text-zinc-400"}`}>
              {l}
              {id === "boutique" && !active && !isSeen && <Badge n={d.badges?.boutique || 0} testid="badge-market-boutique" />}
              {id === "express_drop" && !active && !isSeen && (p.pending_deliveries?.length > 0) && <Badge n={p.pending_deliveries.length} testid="badge-market-express-drop" />}
            </button>
          );
        })}
      </div>
      {sub === "express_drop" && <ExpressDropShop />}
      {/* {sub === "agency" && <AgencyShop />} */}
      {["black_market", "gun_shop", "boutique"].includes(sub) && <Restock />}
      {sub === "black_market" && (
        <div className="space-y-4">
          <SectionTitle kicker="Pay with dirty cash · 5 exclusive items daily · Limit 1 per day · Starts from GH₵3,000" title="Black Market" />
          
          <div className="grid grid-cols-5 gap-1.5">
            {s.black_market.filter(o => o.left > 0).map((o) => {
              const own = p.inv[o.id] || 0;
              const maxed = o.max && own >= o.max;
              // Black Market items use custom colors or T3 red by default
              // Map Black Market kinds to TIER_PALETTE colors
              const kindColorMap = {
                defence: TIER_PALETTE[1],
                heat: TIER_PALETTE[7],
                heist_boost: TIER_PALETTE[5],
                heist_speed: TIER_PALETTE[3],
                crew_xp: TIER_PALETTE[4],
                fortify: TIER_PALETTE[6],
              };
              const tierColor = kindColorMap[o.kind] || TIER_PALETTE[1];
              const iconColor = "#ffffff";

              return (
                <button 
                  key={o.id} 
                  onClick={() => setSelectedItem(o)} 
                  className="btn-press aspect-square relative flex flex-col items-center justify-center overflow-hidden rounded-[2px] border border-zinc-800 bg-surface"
                  data-testid={`bm-item-${o.id}`}
                >
                    {/* Type Indicator */}
                    <div className="absolute top-1 left-1 bg-black/40 px-1 rounded-[1px] z-10">
                      <span className="text-[6px] font-black text-white/90 uppercase">{o.kind}</span>
                    </div>

                    {/* Icon */}
                    <div className="relative z-10 flex flex-col items-center justify-center -mt-1">
                      <Package className="h-6 w-6 drop-shadow-md" style={{ color: tierColor }} />
                    </div>
                    
                    {/* Price Bar */}
                    <div className="absolute bottom-0 inset-x-0 bg-black/90 py-1 text-center z-20 border-t border-white/5">
                        <div className="text-[8px] font-mono font-black tracking-tighter text-gold">
                            {fmt(o.price)}
                        </div>
                    </div>

                    {/* Status Overlays */}
                    {maxed && (
                      <div className="absolute top-1 right-1 bg-emerald-500 text-emerald-950 text-[5px] font-black px-1 rounded-full z-20 shadow-sm border border-emerald-400/50">
                        MAX
                      </div>
                    )}
                </button>
              );
            })}
          </div>

          {/* Black Market Item Detail Dialog (reusing selectedItem from Boutique or state) */}
          <Dialog open={!!selectedItem && sub === "black_market"} onOpenChange={() => { setSelectedItem(null); setIsConfirming(false); }}>
            <DialogContent>
              {selectedItem && (
                <div className="space-y-4">
                  <DialogHeader>
                    <DialogTitle>{isConfirming ? "Confirm Purchase?" : selectedItem.name}</DialogTitle>
                    <DialogDescription className="space-y-1" asChild>
                      <div>
                        <div className="text-zinc-400 uppercase text-[10px] font-bold tracking-widest">{selectedItem.kind} · {selectedItem.left} LEFT IN STOCK</div>
                        <div className="text-zinc-300">{isConfirming ? `Are you sure you want to buy ${selectedItem.name} for ${cedi(selectedItem.price)} dirty cash?` : selectedItem.desc}</div>
                        {!isConfirming && (
                          <div className="mt-2 text-[11px] font-mono flex flex-col gap-0.5">
                             <div className="text-kgreen">Owned: {p.inv[selectedItem.id] || 0}{selectedItem.max ? ` / ${selectedItem.max}` : ""}</div>
                             {selectedItem.heat && <div className="text-orange-400">Risk: +{selectedItem.heat} Heat</div>}
                          </div>
                        )}
                      </div>
                    </DialogDescription>
                  </DialogHeader>
                  {!isConfirming && <div className="text-sm font-mono text-zinc-300">Price: <span className="text-gold">{cedi(selectedItem.price)} dirty</span></div>}
                  <DialogFooter>
                    <Btn variant="ghost" onClick={() => isConfirming ? setIsConfirming(false) : setSelectedItem(null)}>
                      {isConfirming ? "Back" : "Decline"}
                    </Btn>
                    <Btn variant="gold" disabled={(selectedItem.max && (p.inv[selectedItem.id] || 0) >= selectedItem.max) || big(p.dirty) < big(selectedItem.price)} onClick={() => {
                        if (isConfirming) {
                            act("store_buy", { store: "black_market", id: selectedItem.id });
                            setSelectedItem(null);
                            setIsConfirming(false);
                        } else {
                            setIsConfirming(true);
                        }
                    }}>
                      <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4" />
                        <span>{isConfirming ? "Confirm Buy" : "Buy"}</span>
                      </div>
                    </Btn>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}
      {sub === "gun_shop" && <GunShop />}
      {sub === "boutique" && <BoutiqueTabs />}


      {/* Shortcuts to Compound & Base and Underground Betting */}
      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-zinc-800 pt-3">
        <button
          onClick={() => useGame.getState().openMore("skills")}
          className="border border-gold/40 bg-gold/5 p-2.5 text-left hover:border-gold"
          data-testid="market-to-mansion-btn"
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-gold">Mastery Hub</div>
          <div className="font-display text-sm uppercase text-zinc-100">Skills (Compound & Garage) →</div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Boss perks, Compound & Garage upgrades powered by Attribute Points.</div>
        </button>
        <button
          onClick={() => useGame.getState().openMore("betting")}
          className="border border-kgreen/40 bg-kgreen/5 p-2.5 text-left hover:border-kgreen"
          data-testid="market-to-betting-btn"
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-kgreen">High Stakes</div>
          <div className="font-display text-sm uppercase text-zinc-100">Betting Exchange →</div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Dual currency stakes, 1.2x to 100x odds, clean cash payouts!</div>
        </button>
      </div>
    </div>
  );
}
