import { useEffect } from "react";
import { Building2, Users, Crosshair, Store, Menu } from "lucide-react";
import { useGame } from "../../store/game";
import { Badge } from "./v9";

const ITEMS = [
  { id: "empire", label: "Empire", icon: Building2 },
  { id: "crew", label: "Crew", icon: Users },
  { id: "heists", label: "Heists", icon: Crosshair },
  { id: "market", label: "Market", icon: Store },
  { id: "more", label: "More", icon: Menu },
];

export default function BottomNav() {
  const { tab, setTab, derived, player, seenViews, seenTabCounts, markTabSeen } = useGame();
  const b = derived?.badges || {};
  const now = Date.now() / 1000;

  // "More" unviewed items: only include those not yet opened/viewed by player
  const moreExtra =
    ((!player.daily?.login_claimed || player.daily?.contracts?.some((c) => c.progress >= c.target && !c.claimed)) && !seenViews?.["more_daily"] ? 1 : 0) +
    (((player.farm?.plots || []).some((x) => x.strain && x.end <= now)) && !seenViews?.["more_farm"] ? 1 : 0) +
    ((b.medical?.total || 0) > 0 && !seenViews?.["more_medical"] ? 1 : 0) +
    ((derived?.rival_events?.unseen || 0) > 0 && !seenViews?.["more_rivalevents"] ? 1 : 0);

  // Keep the current active tab's seen count synchronized so badges vanish upon viewing
  useEffect(() => {
    const rawActive = (b[tab] || 0) + (tab === "more" ? moreExtra : 0);
    markTabSeen(tab, rawActive);
  }, [tab, b, moreExtra, markTabSeen]);

  return (
    <nav className="absolute bottom-0 left-0 right-0 z-50 flex items-stretch border-t border-zinc-800 bg-ink" style={{ height: "calc(4rem + env(safe-area-inset-bottom, 0px))", paddingBottom: "env(safe-area-inset-bottom, 0px)" }} data-testid="bottom-nav">
      {ITEMS.map((it) => {
        const active = tab === it.id;
        const raw = (b[it.id] || 0) + (it.id === "more" ? moreExtra : 0);
        const seen = seenTabCounts?.[it.id] || 0;
        // Badge vanishes immediately if on this tab, or if count was already viewed
        const count = active ? 0 : Math.max(0, raw - seen);

        return (
          <button
            key={it.id}
            onClick={() => setTab(it.id)}
            data-testid={`nav-${it.id}-btn`}
            className={`btn-press relative flex flex-1 flex-col items-center justify-center gap-1 ${active ? "text-gold" : "text-zinc-500"}`}
          >
            {active && <span className="absolute left-3 right-3 top-0 h-0.5 bg-gold" />}
            <it.icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">{it.label}</span>
            <Badge n={count} testid={`badge-nav-${it.id}`} className="!right-[22%] !top-1" />
          </button>
        );
      })}
    </nav>
  );
}
