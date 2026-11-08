import { toast } from "sonner";
import { Shield, MapPin, Coins, CheckCircle2, Award } from "lucide-react";
import { useGame } from "../../../store/game";
import { cedi } from "../../../lib/fmt";
import { Btn, Card, Bar } from "../../../components/game/ui";
import { TURF_ZONES } from "../../../data/gameData";

export default function TurfLedger() {
  const { player: p, derived: d, act } = useGame();
  const zones = d.turf_zones || [];

  return (
    <div className="space-y-4 pb-12" data-testid="turf-ledger-tab">
      <div className="border-b border-zinc-800 pb-3 mt-2">
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-gold flex items-center gap-1.5">
          <MapPin className="h-3 w-3" />
          <span>Accra Metropolitan Domination</span>
        </div>
        <h2 className="font-display text-2xl uppercase text-zinc-100 font-bold leading-tight">
          Five-Zone Turf Ledger
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Secure territorial control across key districts of Accra by funding local tribute. High zone control yields passive syndicate combat, laundering, and intelligence advantages.
        </p>
      </div>

      <div className="grid gap-3">
        {zones.map((zone) => {
          const control = zone.control || 0;
          const affordTribute = BigInt(p.clean || "0") >= BigInt(zone.tributeCost);
          const isMaxed = control >= 100;

          return (
            <Card key={zone.id} className="p-3.5 bg-surface/80 border-zinc-800">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-base font-bold uppercase text-zinc-100">
                      {zone.name}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {zone.vibe}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gold font-medium flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 shrink-0" />
                    <span>{zone.perk}</span>
                  </div>

                  <div className="mt-2.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-zinc-500 uppercase">Syndicate Grip</span>
                      <span className="font-bold text-zinc-200">{control}%</span>
                    </div>
                    <Bar
                      pct={control}
                      color={control >= 75 ? "green" : control >= 40 ? "gold" : "blood"}
                      className="h-1.5 rounded-full"
                    />
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {isMaxed ? (
                    <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs uppercase px-2 py-1 rounded border border-emerald-900/60 bg-emerald-950/30">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Dominated</span>
                    </div>
                  ) : (
                    <Btn
                      variant={affordTribute ? "green" : "ghost"}
                      disabled={!affordTribute}
                      className="text-xs py-1.5 px-3 font-bold uppercase"
                      onClick={() =>
                        act("turf_tribute", { zoneId: zone.id }, {
                          onResult: () => toast.success(`Paid tribute in ${zone.name}! +25% control`),
                        })
                      }
                    >
                      Tribute ({cedi(zone.tributeCost)})
                    </Btn>
                  )}
                  <span className="text-[8px] text-zinc-500 font-mono block mt-1">+25% Control</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
