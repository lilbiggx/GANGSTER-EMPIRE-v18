import { lazy, Suspense, useEffect } from "react";
import { ArrowLeft, Wrench, CalendarCheck, Skull, Swords, Sword, Trophy, Handshake, Map, Ticket, ShoppingBag, Shirt, Settings, Home, Sprout, Coins, Receipt, HeartPulse, Siren, Zap, Hammer, FileText, ShieldAlert, Heart, Package, FlaskConical, Shovel, Landmark, Truck, MapPin } from "lucide-react";
import { useGame } from "../../store/game";
import { Badge } from "../../components/game/v9";
import { TEST_TOOLS } from "../../lib/devMode";

const VIEWS = {
  locker: { label: "Boss & Locker", icon: Sword, C: lazy(() => import("./more/Locker")) },
  skills: { label: "Skills", icon: Zap, C: lazy(() => import("./more/Skills")) },
  workshop: { label: "Weapon Workshop", icon: Hammer, C: lazy(() => import("./more/Workshop")) },
  methlab: { label: "Underground Meth Lab", icon: FlaskConical, C: lazy(() => import("./more/Methlab")) },
  mining: { label: "Illegal Mining (Galamsey)", icon: Shovel, C: lazy(() => import("./more/Mining")) },
  bigman: { label: "Big Man Connections", icon: Landmark, C: lazy(() => import("./more/BigManConnections")) },
  areadon: { label: "Area Don (Arch-Rival)", icon: Skull, C: lazy(() => import("./more/AreaDonPanel")) },
  commodities: { label: "Commodities Smuggling", icon: Truck, C: lazy(() => import("./more/Commodities")) },
  turfledger: { label: "Five-Zone Turf Ledger", icon: MapPin, C: lazy(() => import("./more/TurfLedger")) },
  betting: { label: "Betting Exchange", icon: Coins, C: lazy(() => import("./more/Betting")) },
  statement: { label: "Cash Statement (30D)", icon: Receipt, C: lazy(() => import("./more/CashStatement")) },
  farm: { label: "Grow Farm", icon: Sprout, C: lazy(() => import("./more/Farm")) },
  robbery: { label: "Robbery Operations", icon: ShieldAlert, C: lazy(() => import("./more/Robbery")) },
  girlfriend: { label: "Syndicate Romance", icon: Heart, C: lazy(() => import("./more/Girlfriend")) },
  daily: { label: "Daily & Streak", icon: CalendarCheck, C: lazy(() => import("./more/Daily")) },
  rivalevents: { label: "Rival Events Log", icon: Siren, C: lazy(() => import("./more/RivalEvents")) },
  medical: { label: "Medical", icon: HeartPulse, C: lazy(() => import("./more/Medical")) },
  rivals: { label: "Rival Syndicates", icon: Skull, C: lazy(() => import("./more/Rivals")) },
  pvp: { label: "Turf War (PvP)", icon: Swords, C: lazy(() => import("./more/Turf")) },
  leaderboard: { label: "Leaderboards", icon: Trophy, C: lazy(() => import("./more/Leaderboard")) },
  mercs: { label: "Mercenary Market", icon: Handshake, C: lazy(() => import("./more/Mercs")) },
  season: { label: "Season Map", icon: Map, C: lazy(() => import("./more/Season")) },
  pass: { label: "Street Pass", icon: Ticket, C: lazy(() => import("./more/Pass")) },
  smuggler: { label: "Smuggler", icon: Package, C: lazy(() => import("./more/Smuggler")) },
  shop: { label: "Shop", icon: ShoppingBag, C: lazy(() => import("./more/Shop")) },
  wardrobe: { label: "Drip & Rides", icon: Shirt, C: lazy(() => import("./more/Wardrobe")) },
  prestige: { label: "Retire to the Village", icon: Home, C: lazy(() => import("./more/Prestige")) },
  heat: { label: "Heat & Police", icon: Siren, C: lazy(() => import("../../components/game/HeatPanel")) },
  blackmail: { label: "Blackmail & Intel", icon: FileText, C: lazy(() => import("./more/Blackmail")) },
  settings: { label: "Settings & Alerts", icon: Settings, C: lazy(() => import("./more/Settings")) },
};
// Test builds only (VITE_ENABLE_TEST_TOOLS): the wrench opens the Test Tools panel. Compile-time false strips it.
const TestTools = TEST_TOOLS ? { label: "Test Tools", icon: Wrench, C: lazy(() => import("../../components/game/testtools/TestToolsPanel")) } : null;

export default function More() {
  const { more, openMore, player: p, derived: d, act, seenViews, markViewSeen } = useGame();

  useEffect(() => {
    if (more) {
      markViewSeen("more_" + more);
      if (more === "rivalevents") act("rival_log_seen");
      if (more === "medical") act("medical_seen");
    }
  }, [more, markViewSeen, act]);

  const v = more === "testtools" && TestTools ? TestTools : (more === "mansion" ? VIEWS.skills : VIEWS[more]);
  if (v) {
    return (
      <div>
        <button onClick={() => openMore(null)} className="btn-press mt-3 flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 hover:text-gold" data-testid="more-back-btn">
          <ArrowLeft className="h-4 w-4" />Back
        </button>
        <Suspense fallback={<div className="p-6 text-xs text-zinc-500">Loading...</div>}><v.C /></Suspense>
      </div>
    );
  }
  const now = Date.now() / 1000;
  const isSeen = (id) => Boolean(seenViews?.["more_" + id]);
  const badge = {
    daily: (!p.daily.login_claimed || p.daily.contracts.some((c) => c.progress >= c.target && !c.claimed)) && !isSeen("daily"),
    farm: (p.farm?.plots || []).some((x) => x.strain && x.end <= now) && !isSeen("farm"),
    workshop: (p.workshop?.benches || []).some((x) => x.weaponId && x.end <= now) && !isSeen("workshop"),
    skills: ((d?.badges?.skills ?? d?.badges?.mansion) || 0) && !isSeen("skills") ? ((d?.badges?.skills ?? d?.badges?.mansion) || 0) : 0,
    mansion: ((d?.badges?.skills ?? d?.badges?.mansion) || 0) && !isSeen("skills") ? ((d?.badges?.skills ?? d?.badges?.mansion) || 0) : 0,
    medical: (d?.badges?.medical?.total || 0) && !isSeen("medical") ? d?.badges?.medical?.total : 0,
    rivalevents: (d?.rival_events?.unseen || 0) && !isSeen("rivalevents") ? d?.rival_events?.unseen : 0,
  };
  return (
    <>
    {TestTools && (
      <div className="mt-3 flex justify-end">
        <button onClick={() => openMore("testtools")} title="Test Tools (test build)" aria-label="Test Tools" data-testid="more-test-tools-btn"
          className="btn-press flex h-9 w-9 items-center justify-center border border-zinc-700 text-zinc-400 hover:border-gold hover:text-gold"><Wrench className="h-4 w-4" /></button>
      </div>
    )}
    <div className={`${TestTools ? "mt-2" : "mt-4"} grid grid-cols-2 gap-2`} data-testid="more-menu">
      {Object.entries(VIEWS).map(([id, x], i) => (
        <button key={id} onClick={() => openMore(id)} data-testid={`more-item-${id}`} style={{ animationDelay: `${i * 30}ms` }}
          className="btn-press rise relative flex min-h-[84px] flex-col justify-between border border-zinc-800 bg-surface p-3 text-left hover:border-gold">
          <x.icon className="h-5 w-5 text-gold" />
          <span className="font-display text-sm uppercase leading-tight text-zinc-100">{x.label}</span>
          {typeof badge[id] === "number" ? <Badge n={badge[id]} testid={`badge-more-${id}`} className="!right-2 !top-2" /> : badge[id] && <span className="absolute right-2 top-2 h-2 w-2 bg-blood" data-testid={`badge-more-${id}`} />}
        </button>
      ))}
    </div>
    </>
  );
}
