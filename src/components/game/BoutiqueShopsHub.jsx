import { useState, useMemo } from "react";
import * as L from "lucide-react";
import { toast } from "sonner";
import { useGame } from "../../store/game";
import { useNow } from "../../hooks/useNow";
import { cedi, dur, big } from "../../lib/fmt";
import { Card, SectionTitle, Chip } from "./ui";
import { Badge, IconBtn, Details } from "./v9";
import { LUXURY_EFFECT_META, LUXURY_TIER_NAMES } from "../../data/luxury";

const Icon = ({ name, className = "h-4 w-4" }) => {
  const C = L[name] || L.Sparkles;
  return <C className={className} aria-hidden="true" />;
};

const TIER_CLS = ["", "text-zinc-300", "text-zinc-200", "text-sky-300", "text-violet-300", "text-gold", "text-amber-300", "text-rose-300", "text-fuchsia-300"];
const RARITY_COLOR = {
  common: "text-zinc-400 border-zinc-700 bg-zinc-900",
  rare: "text-sky-300 border-sky-800 bg-sky-950/40",
  legendary: "text-gold border-gold/60 bg-gold/10",
};

export const SHOPS_DIRECTORY = [
  {
    id: "haute_couture",
    name: "Haute Couture Maison",
    subtitle: "Tailoring, Bespoke Suits & Silk Robes",
    icon: "Shirt",
    accent: "gold",
    brands: ["Gucci", "Louis Vuitton", "Balenciaga", "Versace", "Prada", "Tom Ford", "Ozwald Boateng"],
    luxuryCategories: ["clothing"],
    boutiqueSubcats: ["tailoring"],
    desc: "Italian silk damask, ceremonial dinner blazers, hand-cut kaftans and runway luxury robes.",
  },
  {
    id: "master_horology",
    name: "Master Horology Salon",
    subtitle: "Swiss Chronometers & Complications",
    icon: "Watch",
    accent: "sky",
    brands: ["Rolex", "Patek Philippe", "Audemars Piguet", "Richard Mille", "Jacob & Co.", "Cartier"],
    luxuryCategories: ["watches"],
    boutiqueSubcats: ["jewelry"], // watch pieces
    desc: "Tourbillon movements, presidential fluted bezels and diamond celestial chronographs.",
  },
  {
    id: "crown_vault",
    name: "Crown Jewelry & Bullion Vault",
    subtitle: "Solid Gold Cuban Links & 24K Bullion",
    icon: "Gem",
    accent: "gold",
    brands: ["Cartier", "Harry Winston", "Akan Sovereign Gold", "Bvlgari", "Tiffany & Co."],
    luxuryCategories: [], // high jewelry is handled with brand mapping
    boutiqueSubcats: ["jewelry", "accessories"],
    desc: "18-karat Miami Cuban chains, obsidian signet rings, sovereign lion pendants and pure bullion.",
  },
  {
    id: "exotic_motors",
    name: "Exotic Motor Galleria",
    subtitle: "Hypercars, Limousines & Starlight Cruisers",
    icon: "CarFront",
    accent: "gold",
    brands: ["Rolls-Royce", "Bugatti", "Ferrari", "Lamborghini", "Bentley", "Mercedes-Maybach", "Koenigsegg"],
    luxuryCategories: ["cars"],
    boutiqueSubcats: [],
    desc: "Twin-turbo V12s, quad-turbo speed record breakers and VR10 armored syndicate limousines.",
  },
  {
    id: "apex_cycles",
    name: "Apex Superbike Showroom",
    subtitle: "Track Superbikes & Custom Choppers",
    icon: "Bike",
    accent: "green",
    brands: ["Ducati", "Harley-Davidson", "MV Agusta", "Yamaha Speciale", "BMW Motorrad", "Kawasaki Ninja"],
    luxuryCategories: ["bikes"],
    boutiqueSubcats: [],
    desc: "Supercharged racing engines, titanium exhausts and high-velocity getaway runners.",
  },
  {
    id: "marine_dock",
    name: "Prestige Marine & Yacht Club",
    subtitle: "Offshore Megayachts & Stealth Cruisers",
    icon: "Sailboat",
    accent: "sky",
    brands: ["Sunseeker", "Riva", "Wally Yachts", "Lürssen", "Benetti", "Pershing", "Princess Yachts"],
    luxuryCategories: ["boats"],
    boutiqueSubcats: [],
    desc: "Tri-deck luxury cruisers, mahogany speedcraft and ocean citadels that wash cash offshore.",
  },
  {
    id: "aviation_hangar",
    name: "Executive Aviation Hangar",
    subtitle: "Long-Range Private Jets & VIP Choppers",
    icon: "Plane",
    accent: "purple",
    brands: ["Gulfstream", "Bombardier", "Dassault Falcon", "Sikorsky VIP", "Airbus ACJ", "Citation"],
    luxuryCategories: ["jets"],
    boutiqueSubcats: [],
    desc: "Transcontinental Mach 0.90 jets, starlight state rooms and quick tactical departure aircraft.",
  },
  {
    id: "prime_estate",
    name: "Prime Real Estate & Penthouses",
    subtitle: "VIP Compounds, Villas & Private Islands",
    icon: "Building2",
    accent: "gold",
    brands: ["East Legon Estates", "Airport Hills", "Cantonments Penthouses", "Monaco Harbourside", "Dubai Palm"],
    luxuryCategories: ["estate"],
    boutiqueSubcats: [],
    desc: "Subterranean safehouse bunkers, 360-degree glass aeries and high-security syndicate compounds.",
  },
  {
    id: "tactical_depot",
    name: "Syndicate Tactical & Armored",
    subtitle: "Concealed Kevlar, Carbon Slacks & Firepower",
    icon: "ShieldCheck",
    accent: "red",
    brands: ["Barrett Tactical", "Kejetia Armored", "Carbon Dynamics", "Mil-Spec Sovereign", "SIG Sauer"],
    luxuryCategories: ["arms"],
    boutiqueSubcats: ["tactical"],
    desc: "Ultra-thin Level IIIA ballistic vests, armored carbon trenchcoats and raid-defense artillery.",
  },
  {
    id: "royal_heritage",
    name: "Royal Regalia & Sovereign Heritage",
    subtitle: "Sacred Kente, Northern Smocks & Chieftain Relics",
    icon: "Crown",
    accent: "gold",
    brands: ["Bonwire Master Weavers", "Dagbon Chieftains", "Ashanti Imperial Artisans", "Christie's Heritage"],
    luxuryCategories: ["art"],
    boutiqueSubcats: ["regalia"],
    desc: "Centuries-old royal kente togas, Emperor fugu smocks, Golden Stool sashes and ancient artifacts.",
  },
  {
    id: "streetwear_kicks",
    name: "Urban Streetwear & Atelier Kicks",
    subtitle: "Heavy Hoodies, Gold Kicks & Python Loafers",
    icon: "Footprints",
    accent: "green",
    brands: ["Off-White", "Daily Paper", "Kejetia Artisans", "Air Kingpin", "Amiri", "Chale"],
    luxuryCategories: [],
    boutiqueSubcats: ["streetwear", "footwear", "headwear"],
    desc: "Heavyweight 500GSM hoodies, hand-welted python loafers and metallic gold high-top sneakers.",
  },
  {
    id: "cyber_tech",
    name: "Cyber Tech & Quantum Grids",
    subtitle: "Cryptographic Servers, Satellites & Drones",
    icon: "Cpu",
    accent: "sky",
    brands: ["Quantum Cyberdyne", "Palantir Syndicate", "Skunkworks Aerospace", "DarkStar Quantum"],
    luxuryCategories: ["tech"],
    boutiqueSubcats: [],
    desc: "Unbreakable cryptographic server vaults, thermal tracking drones and EMP disruptor suites.",
  },
];

export function EffectChips({ effects, testid }) {
  return (
    <span className="flex flex-wrap gap-1" data-testid={testid}>
      {Object.entries(effects || {}).filter(([, v]) => v).map(([k, v]) => {
        const m = LUXURY_EFFECT_META[k];
        if (!m) return null;
        return (
          <span key={k} title={`${m.label}: ${m.fmt(v)}`} className="inline-flex items-center gap-0.5 rounded border border-zinc-700 px-1 text-[9px] font-bold text-zinc-300">
            <Icon name={m.icon} className="h-2.5 w-2.5" />{m.fmt(v)}
          </span>
        );
      })}
    </span>
  );
}

const PAGE_SIZE = 12;

export default function BoutiqueShopsHub() {
  const { player: p, derived: d, act, openLocker } = useGame();
  const now = useNow();
  const lx = d.luxury;
  const boutiqueItems = d.store?.boutique || [];

  const [activeShopId, setActiveShopId] = useState(null);
  const [filterType, setFilterType] = useState("all"); // "all" | "luxury" | "wear"
  const [tierFilter, setTierFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOwned, setShowOwned] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [confirm, setConfirm] = useState(null); // { item, kind, action }

  const handleBuy = (item, kind) => {
    setConfirm({ item, kind });
  };

  const executeBuy = () => {
    if (!confirm) return;
    const { item, kind } = confirm;
    if (kind === "luxury") {
      act("lux_buy", { id: item.id }, {
        onResult: (r) => toast.success(`${item.name} acquired`, { description: r?.sets?.length ? "Collection set bonus unlocked!" : undefined }),
      });
    } else {
      act("store_buy", { store: "boutique", id: item.id }, {
        onResult: () => toast.success(`${item.name} acquired! Check Locker to equip.`),
      });
    }
    setConfirm(null);
  };

  // Group luxury items and boutique wear into shops
  const shopDataMap = useMemo(() => {
    const map = {};
    SHOPS_DIRECTORY.forEach((shop) => {
      // Luxury items belonging to this shop
      const luxList = (lx?.items || []).filter((it) => {
        if (shop.luxuryCategories.includes(it.category)) return true;
        if (shop.id === "crown_vault" && it.category === "clothing" && (it.brand?.includes("Gold") || it.brand?.includes("Jewelry") || it.name.includes("Chain") || it.name.includes("Pendant") || it.name.includes("Choker"))) return true;
        return false;
      });

      // Boutique wear items belonging to this shop
      const wearList = boutiqueItems.filter((it) => {
        if (shop.boutiqueSubcats.includes(it.subcategory)) {
          if (shop.id === "master_horology" && it.subcategory === "jewelry" && !it.name.toLowerCase().includes("chrono") && !it.name.toLowerCase().includes("watch")) {
            return false;
          }
          if (shop.id === "crown_vault" && it.subcategory === "jewelry" && (it.name.toLowerCase().includes("chrono") || it.name.toLowerCase().includes("watch"))) {
            return false;
          }
          return true;
        }
        return false;
      });

      const totalItems = luxList.length + wearList.length;
      const ownedLux = luxList.filter((i) => i.owned).length;
      const ownedWear = wearList.filter((i) => p.gear?.some((g) => g.id === i.id)).length;
      const totalOwned = ownedLux + ownedWear;

      // Price range
      const minLuxPrice = luxList.length ? Math.min(...luxList.map((i) => i.price)) : Infinity;
      const minWearPrice = wearList.length ? Math.min(...wearList.map((i) => i.clean || i.price)) : Infinity;
      const minPrice = Math.min(minLuxPrice, minWearPrice);

      map[shop.id] = {
        shop,
        luxList,
        wearList,
        totalItems,
        totalOwned,
        minPrice: isFinite(minPrice) ? minPrice : 1000,
      };
    });
    return map;
  }, [lx?.items, boutiqueItems, p.gear]);

  // Current active shop data
  const currentShopData = activeShopId ? shopDataMap[activeShopId] : null;

  // Filtered items in active shop with strict pagination
  const filteredActiveItems = useMemo(() => {
    if (!currentShopData) return [];

    let list = [];
    if (filterType === "all" || filterType === "luxury") {
      list.push(...currentShopData.luxList.map((it) => ({ ...it, itemKind: "luxury" })));
    }
    if (filterType === "all" || filterType === "wear") {
      list.push(...currentShopData.wearList.map((it) => ({ ...it, itemKind: "wear" })));
    }

    if (!showOwned) {
      list = list.filter((it) => {
        if (it.itemKind === "luxury") return !it.owned;
        return !p.gear?.some((g) => g.id === it.id);
      });
    }

    if (tierFilter !== "all") {
      const t = Number(tierFilter);
      list = list.filter((it) => it.tier === t);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((it) => it.name?.toLowerCase().includes(q) || it.brand?.toLowerCase().includes(q) || it.desc?.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      const priceA = a.price || a.clean || 0;
      const priceB = b.price || b.clean || 0;
      return priceA - priceB;
    });

    return list;
  }, [currentShopData, filterType, tierFilter, searchQuery, showOwned, p.gear]);

  // Paginated slice
  const totalPages = Math.ceil(filteredActiveItems.length / PAGE_SIZE) || 1;
  const paginatedItems = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    return filteredActiveItems.slice(start, start + PAGE_SIZE);
  }, [filteredActiveItems, currentPage]);

  const handleSelectShop = (id) => {
    setActiveShopId(id);
    setCurrentPage(0);
    setSearchQuery("");
    setTierFilter("all");
    setFilterType("all");
  };



  const totalWearOwned = boutiqueItems.filter((i) => p.gear?.some((g) => g.id === i.id)).length;

  return (
    <div className="space-y-3" data-testid="boutique-shops-hub">
      {/* Top Banner & Financial / Inventory Status */}
      <Card accent="gold" className="!p-3" data-testid="boutique-master-banner">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-gold flex items-center gap-1.5">
              <L.Gem className="h-3.5 w-3.5 text-gold" />
              <span>Syndicate Boutique & Luxury Houses</span>
            </div>
            <div className="font-display text-lg uppercase text-zinc-100 font-bold leading-tight mt-0.5">
              Curated Salons · Memory-Optimized Shopping
            </div>
          </div>
          <button
            onClick={() => openLocker("boss")}
            className="btn-press flex items-center gap-1 border border-gold/70 bg-gold/15 px-2.5 py-1 text-[11px] font-black uppercase text-gold hover:bg-gold/25 transition-all"
            data-testid="boutique-open-locker-btn"
          >
            <span>Open Locker</span>
            <L.ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-mono font-bold text-gold" data-testid="lux-owned-counter">
              <L.Gem className="h-3.5 w-3.5" />
              <span>{lx?.owned_count || 0}/666 Luxury Assets Owned</span>
            </span>
            <span className="text-zinc-600">·</span>
            <span className="flex items-center gap-1.5 font-mono font-bold text-kgreen">
              <L.Shirt className="h-3.5 w-3.5" />
              <span>{totalWearOwned}/{boutiqueItems.length} Fits Owned</span>
            </span>
          </div>
          <span className="text-zinc-400 font-mono text-[11px]">
            Estate: <b className="text-zinc-100 font-bold">{cedi(lx?.estate_value || 0)}</b>
          </span>
        </div>

        {/* Global effects chips */}
        {lx?.effects && (
          <div className="mt-2">
            <EffectChips effects={lx.effects} testid="hub-effects-summary" />
          </div>
        )}
      </Card>

      {/* VIEW 1: SHOPS DIRECTORY (Default memory-optimized hub) */}
      {!activeShopId ? (
        <div className="space-y-2.5" data-testid="shops-directory-view">
          <div className="flex items-center justify-between text-xs text-zinc-400 px-0.5">
            <span className="font-bold uppercase tracking-wider text-zinc-300">
              Select A Specialized Boutique ({SHOPS_DIRECTORY.length} Shops)
            </span>
            <span className="text-[10px] text-zinc-500">Each shop renders smoothly in memory</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {SHOPS_DIRECTORY.map((shop) => {
              const data = shopDataMap[shop.id];
              const ShopIcon = L[shop.icon] || L.Store;

              return (
                <div
                  key={shop.id}
                  onClick={() => handleSelectShop(shop.id)}
                  className="btn-press cursor-pointer border border-zinc-800 bg-surface/80 p-3 hover:border-gold transition-all relative group"
                  data-testid={`shop-card-${shop.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-zinc-700 bg-black/60 text-gold shadow-inner group-hover:border-gold">
                        <ShopIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-display uppercase text-sm font-bold text-zinc-100 group-hover:text-gold transition-colors flex items-center gap-1.5">
                          <span>{shop.name}</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                          {shop.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono text-xs font-bold text-gold">
                        From {cedi(data?.minPrice || 1000)}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {data?.totalOwned || 0}/{data?.totalItems || 0} Owned
                      </div>
                    </div>
                  </div>

                  {/* Brand tags */}
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {shop.brands.slice(0, 5).map((b) => (
                      <span key={b} className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-black/40 text-zinc-400 border border-zinc-800">
                        {b}
                      </span>
                    ))}
                    {shop.brands.length > 5 && (
                      <span className="text-[8px] font-bold text-zinc-500 px-1 py-0.5">
                        +{shop.brands.length - 5}
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[10px] border-t border-zinc-800/60 pt-2 text-zinc-400">
                    <span className="line-clamp-1 text-[10px] text-zinc-500 pr-2">{shop.desc}</span>
                    <span className="font-extrabold uppercase text-gold group-hover:translate-x-0.5 transition-transform shrink-0 flex items-center gap-1">
                      <span>Enter</span>
                      <L.ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* VIEW 2: INSIDE A SPECIFIC SHOP (Paginated, low memory footprint) */
        <div className="space-y-3" data-testid={`shop-detail-${activeShopId}`}>
          {/* Shop Header & Return Button */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
            <button
              onClick={() => setActiveShopId(null)}
              className="btn-press flex items-center gap-1.5 border border-zinc-700 bg-surface px-2.5 py-1 text-xs font-bold uppercase text-zinc-200 hover:border-gold hover:text-gold"
              data-testid="shop-back-to-directory-btn"
            >
              <L.ArrowLeft className="h-3.5 w-3.5" />
              <span>All Shops Directory</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-mono">
                {currentShopData?.totalOwned || 0}/{currentShopData?.totalItems || 0} Owned
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-xs text-gold font-bold">
                {filteredActiveItems.length} Available
              </span>
            </div>
          </div>

          {/* Quick Shop Switcher Bar */}
          <div className="hide-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 pb-1">
            {SHOPS_DIRECTORY.map((s) => {
              const active = s.id === activeShopId;
              const SIcon = L[s.icon] || L.Store;
              return (
                <button
                  key={s.id}
                  onClick={() => handleSelectShop(s.id)}
                  className={`btn-press shrink-0 flex items-center gap-1 border px-2.5 py-1 text-[10px] font-extrabold uppercase ${
                    active ? "border-gold bg-gold text-ink" : "border-zinc-800 bg-surface text-zinc-400 hover:border-zinc-700"
                  }`}
                  data-testid={`quick-switch-shop-${s.id}`}
                >
                  <SIcon className="h-3 w-3" />
                  <span>{s.name.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Active Shop Title Banner */}
          <div className="flex items-start justify-between gap-3 bg-surface p-3 border border-zinc-800">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-gold">
                {currentShopData?.shop.subtitle}
              </div>
              <h3 className="font-display text-xl uppercase font-bold text-zinc-100 mt-0.5">
                {currentShopData?.shop.name}
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                {currentShopData?.shop.desc}
              </p>
            </div>
            <div className="shrink-0 flex flex-col items-end">
              <div className="flex flex-wrap gap-1 max-w-[160px] justify-end">
                {currentShopData?.shop.brands.slice(0, 4).map((b) => (
                  <span key={b} className="text-[8px] font-black uppercase px-1 rounded bg-black/60 text-gold border border-zinc-700">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
            <div className="flex items-center gap-1">
              {[
                ["all", "All"],
                ["luxury", "Luxury Assets"],
                ["wear", "Designer Fits"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => { setFilterType(id); setCurrentPage(0); }}
                  className={`px-2 py-1 text-[10px] font-extrabold uppercase border ${
                    filterType === id ? "border-gold bg-gold/15 text-gold" : "border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                  data-testid={`filter-type-${id}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-[10px] uppercase text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOwned}
                  onChange={(e) => { setShowOwned(e.target.checked); setCurrentPage(0); }}
                  className="rounded border-zinc-700 text-gold"
                />
                <span>Show Owned</span>
              </label>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(0); }}
                placeholder="Search brand, item..."
                className="w-32 sm:w-44 border border-zinc-800 bg-ink px-2 py-1 text-xs text-zinc-100 placeholder-zinc-500 focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          {/* Paginated Items List (MAX 12 Elements Rendered) */}
          <div className="space-y-1.5" data-testid="shop-paginated-list">
            {paginatedItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500 border border-zinc-800 bg-surface">
                No items match your filter in this shop.
              </div>
            ) : (
              paginatedItems.map((it) => {
                const isLuxury = it.itemKind === "luxury";
                const isOwned = isLuxury ? it.owned : p.gear?.some((g) => g.id === it.id);
                const price = isLuxury ? it.price : (it.clean || it.price);
                const hasCash = big(p.clean) >= big(price);
                const isMaxed = isLuxury && (it.owned_qty || 0) >= 999999;

                return (
                  <div
                    key={`${it.itemKind}-${it.id}`}
                    data-testid={`shop-item-${it.id}`}
                    className={`relative flex min-w-0 items-center gap-2 border p-2 transition-all ${
                      isOwned ? "border-kgreen/40 bg-kgreen/5" : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded border border-zinc-800 bg-ink ${
                        isLuxury ? TIER_CLS[it.tier] : "text-zinc-200"
                      }`}
                    >
                      <Icon name={it.icon || (isLuxury ? "Gem" : "Shirt")} className="h-5 w-5" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-1 flex-wrap">
                        <span className="min-w-0 truncate text-xs font-extrabold uppercase text-zinc-100">
                          {it.name}
                        </span>
                        {it.brand && (
                          <span className="text-[8px] font-black uppercase px-1 rounded bg-zinc-800 text-gold border border-zinc-700">
                            {it.brand}
                          </span>
                        )}
                        {it.tier && (
                          <span className="text-[8px] font-bold uppercase px-1 rounded bg-zinc-900 text-zinc-400">
                            T{it.tier}
                          </span>
                        )}
                        {!isLuxury && it.rarity && (
                          <span className={`text-[8px] font-bold uppercase px-1 rounded border ${RARITY_COLOR[it.rarity] || "text-zinc-400"}`}>
                            {it.rarity}
                          </span>
                        )}
                        {it.limited && <span className="text-[8px] font-black uppercase text-rose-300">LTD</span>}
                      </div>

                      <div className="flex items-center justify-between gap-1 mt-0.5">
                        {isLuxury ? (
                          <EffectChips effects={it.effects} testid={`lux-effects-${it.id}`} />
                        ) : (
                          <div className="flex items-center gap-1 text-[9px] text-zinc-400">
                            {it.stat && (
                              <span className="font-bold text-kgreen bg-kgreen/10 px-1 rounded">
                                +{it.mod} {it.stat}
                              </span>
                            )}
                            {it.power && (
                              <span className="font-bold text-blood bg-blood/10 px-1 rounded">
                                +{it.power} Power
                              </span>
                            )}
                            {it.tier2_cat && (
                              <span className="font-bold text-gold bg-gold/10 px-1 rounded">
                                ★ {it.tier2_cat.name}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isLuxury && it.owned_qty > 0 && (
                            <span className="text-[9px] font-mono text-kgreen font-bold">
                              x{it.owned_qty.toLocaleString()}
                            </span>
                          )}
                          <span className="text-[10px] font-mono font-bold text-kgreen">
                            {cedi(price)} clean
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isLuxury ? (
                        isMaxed ? (
                          <span className="flex items-center gap-0.5 text-[10px] font-black uppercase text-kgreen">
                            <L.Check className="h-3.5 w-3.5" />Maxed
                          </span>
                        ) : (
                          <IconBtn
                            icon={it.available ? L.ShoppingBag : L.Lock}
                            label={!hasCash ? `Need ${cedi(price)} clean` : `Buy for ${cedi(price)} clean`}
                            variant={hasCash ? "green" : "ghost"}
                            disabled={!hasCash}
                            onClick={() => handleBuy(it, "luxury")}
                            data-testid={`lux-buy-btn-${it.id}`}
                          >
                            <span className={`whitespace-nowrap font-mono font-black ${hasCash ? "text-ink" : "text-zinc-500"}`}>
                              {it.owned_qty > 0 ? `+1` : cedi(price)}
                            </span>
                          </IconBtn>
                        )
                      ) : (
                        <button
                          disabled={isOwned || !hasCash}
                          onClick={() => handleBuy(it, "wear")}
                          className={`btn-press px-2.5 py-1 text-[10px] font-extrabold uppercase border rounded ${
                            isOwned
                              ? "border-kgreen/40 text-kgreen bg-kgreen/10 cursor-default"
                              : hasCash
                              ? "border-kgreen bg-kgreen text-ink hover:bg-kgreen/90"
                              : "border-zinc-800 text-zinc-500 cursor-not-allowed"
                          }`}
                          data-testid={`wear-buy-btn-${it.id}`}
                        >
                          {isOwned ? "In Locker" : cedi(price)}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-800 pt-2 text-xs">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                className="btn-press border border-zinc-800 px-3 py-1 font-bold uppercase text-zinc-300 disabled:opacity-30 disabled:pointer-events-none hover:border-gold"
                data-testid="pagination-prev-btn"
              >
                ← Previous
              </button>

              <span className="text-[11px] font-mono text-zinc-400">
                Page <b className="text-zinc-100">{currentPage + 1}</b> of <b className="text-zinc-100">{totalPages}</b> ({filteredActiveItems.length} items)
              </span>

              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                className="btn-press border border-zinc-800 px-3 py-1 font-bold uppercase text-zinc-300 disabled:opacity-30 disabled:pointer-events-none hover:border-gold"
                data-testid="pagination-next-btn"
              >
                Next →
              </button>
            </div>
          )}

          {/* Purchase Confirmation Modal */}
          <ConfirmModal
            open={!!confirm}
            title="Confirm Purchase"
            message={confirm ? `Are you sure you want to acquire "${confirm.item.name}" for ${cedi(confirm.item.price || confirm.item.clean)} clean?` : ""}
            onConfirm={executeBuy}
            onCancel={() => setConfirm(null)}
          />
        </div>
      )}
    </div>
  );
}
