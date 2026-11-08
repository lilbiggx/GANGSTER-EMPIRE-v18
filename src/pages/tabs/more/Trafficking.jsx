import { useState } from "react";
import { toast } from "sonner";
import { Truck, Sprout, Coins, Clock, CheckCircle2 } from "lucide-react";
import { useGame } from "../../../store/game";
import { cedi, dur } from "../../../lib/fmt";
import { Btn, Card, Bar, SectionTitle, Chip } from "../../../components/game/ui";
import { useNow } from "../../../hooks/useNow";

export default function Trafficking() {
  const { config, player: p, act } = useGame();
  const now = useNow();
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedStrain, setSelectedStrain] = useState("wee");
  const [selectedCrew, setSelectedCrew] = useState("");

  const shipments = p.trafficking || [];
  const farmStash = p.farm?.stash || {};
  const availableCrew = p.crew.filter((c) => !c.assign);

  const handleStart = (route) => {
    if (!selectedCrew) {
      toast.error("Please assign an idle crew courier.");
      return;
    }
    act("trafficking_start", {
      route_id: route.id,
      strain: route.strainReq,
      amount: route.amountReq,
      crew_id: selectedCrew,
    }, {
      onResult: (r) => {
        if (r.ok) {
          toast.success(`Trafficking shipment dispatched via ${route.name}!`);
          setSelectedRoute(null);
          setSelectedCrew("");
        } else {
          toast.error(r.error);
        }
      }
    });
  };

  const handleClaim = (shipId) => {
    act("trafficking_claim", { shipment_id: shipId }, {
      onResult: (r) => {
        if (r.ok) {
          toast.success(`Shipment delivered successfully! Earned GH₵${r.payout?.toLocaleString()} dirty cash.`);
        } else {
          toast.error(r.error);
        }
      }
    });
  };

  return (
    <div data-testid="trafficking-page" className="space-y-4 pb-12">
      <SectionTitle kicker="Smuggling & Distribution Networks" title="Drug Trafficking Hub" />
      <p className="-mt-1 text-xs text-zinc-400">
        Smuggle harvested farm crops across Accra districts and international shipping ports. Assign reliable couriers and reap massive underground profits.
      </p>

      {/* Active Shipments */}
      {shipments.length > 0 && (
        <div className="space-y-2">
          <span className="font-display text-xs uppercase tracking-wider text-gold font-bold">Active Shipments</span>
          {shipments.map((s) => {
            const route = config.trafficking_routes.find((x) => x.id === s.route_id);
            const remaining = Math.max(0, s.end - now);
            const isReady = remaining === 0;

            return (
              <Card key={s.id} accent={isReady ? "good" : "gold"} className="p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-display text-sm font-bold text-zinc-100">{route?.name || s.route_id}</div>
                    <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                      Carrying: <b className="text-gold">{s.amount}x {s.strain.toUpperCase()}</b> • {isReady ? "Delivered!" : `Remaining: ${dur(remaining)}`}
                    </div>
                  </div>
                  {isReady ? (
                    <Btn variant="good" onClick={() => handleClaim(s.id)} className="px-4 py-2 text-[10px] font-black uppercase">
                      Claim Payout
                    </Btn>
                  ) : (
                    <div className="text-right">
                      <Chip variant="gold">In Transit</Chip>
                    </div>
                  )}
                </div>
                {!isReady && <Bar current={now - s.start} max={s.end - s.start} className="mt-2" />}
              </Card>
            );
          })}
        </div>
      )}

      {/* Route Catalog */}
      <div className="space-y-3">
        <span className="font-display text-xs uppercase tracking-wider text-zinc-300 font-bold">Distribution Routes</span>
        {config.trafficking_routes.map((route) => {
          const isSelected = selectedRoute?.id === route.id;
          const stashCount = farmStash[route.strainReq] || 0;
          const hasEnoughStash = stashCount >= route.amountReq;

          return (
            <Card key={route.id} accent="zinc" className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display text-sm font-bold text-zinc-100">{route.name}</span>
                    <span className="text-[9px] font-black uppercase bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded">Req: {route.amountReq} {route.strainReq.toUpperCase()}</span>
                  </div>
                  <p className="text-xs text-zinc-400 mb-2">{route.desc}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-zinc-400 font-mono">
                    <span>Farm Stash Available: <b className={hasEnoughStash ? "text-emerald-400" : "text-blood"}>{stashCount} units</b></span>
                    <span>Payout: <b className="text-gold">{cedi(route.payout)} dirty</b></span>
                    <span>Duration: <b className="text-zinc-200">{dur(route.duration)}</b></span>
                  </div>
                </div>

                <Btn
                  variant="gold"
                  onClick={() => {
                    setSelectedRoute(isSelected ? null : route);
                    setSelectedCrew("");
                  }}
                  className="px-3 py-2 text-[10px] font-black uppercase shrink-0"
                >
                  {isSelected ? "Cancel" : "Dispatch"}
                </Btn>
              </div>

              {/* Dispatch Drawer */}
              {isSelected && (
                <div className="mt-3 border-t border-zinc-800 pt-3 space-y-3">
                  <div className="text-xs font-bold text-zinc-200">Assign Courier Crew Member:</div>
                  {availableCrew.length === 0 ? (
                    <div className="text-xs text-blood">No idle crew members available!</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {availableCrew.map((c) => {
                        const isChosen = selectedCrew === c.id;
                        return (
                          <button
                            key={c.id}
                            onClick={() => setSelectedCrew(c.id)}
                            className={`p-2 border text-left text-xs rounded transition-all ${
                              isChosen ? "border-gold bg-gold/10 text-gold font-bold" : "border-zinc-800 bg-surface text-zinc-300 hover:border-zinc-700"
                            }`}
                          >
                            <div>{c.name}</div>
                            <div className="text-[10px] text-zinc-400 uppercase">Lvl {c.lvl} {c.arch}</div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <Btn
                    variant="good"
                    disabled={!hasEnoughStash || !selectedCrew}
                    onClick={() => handleStart(route)}
                    className="w-full py-2.5 text-xs font-black uppercase tracking-wider"
                  >
                    {!hasEnoughStash ? `Need ${route.amountReq} ${route.strainReq.toUpperCase()} in Farm Stash` : !selectedCrew ? "Select Courier" : `Dispatch Shipment (${route.amountReq}x ${route.strainReq.toUpperCase()})`}
                  </Btn>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
