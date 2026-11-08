import { toast } from "sonner";
import { Handshake, CheckCircle2, Shield, Landmark, DollarSign, Lock, Sparkles } from "lucide-react";
import { useGame } from "../../../store/game";
import { cedi } from "../../../lib/fmt";
import { Btn, Card } from "../../../components/game/ui";
import { BIG_MAN_PERKS } from "../../../data/gameData";

export default function BigManConnections() {
  const { player: p, derived: d, act } = useGame();
  const ownedPerks = p.big_man_perks || [];

  return (
    <div className="space-y-4 pb-12" data-testid="bigman-connections-tab">
      <div className="border-b border-zinc-800 pb-3 mt-2">
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-gold flex items-center gap-1.5">
          <Handshake className="h-3 w-3" />
          <span>High-Level Syndicate Influence</span>
        </div>
        <h2 className="font-display text-2xl uppercase text-zinc-100 font-bold leading-tight">
          "Big Man" Connections ({ownedPerks.length}/{BIG_MAN_PERKS.length} Secured)
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Direct flat-cost financial connections with ministers, customs chiefs, and union bosses. These perks never inflate in cost and strictly accelerate wealth generation.
        </p>
      </div>

      <div className="grid gap-3">
        {BIG_MAN_PERKS.map((perk) => {
          const isOwned = ownedPerks.includes(perk.id);
          const afford = BigInt(p.clean || "0") >= BigInt(perk.flatCost);

          return (
            <Card
              key={perk.id}
              accent={isOwned ? "gold" : "none"}
              className={`p-3.5 transition-all ${
                isOwned ? "bg-gold/5 border-gold/40" : "bg-surface/80 border-zinc-800"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-base font-bold uppercase tracking-tight text-zinc-100">
                      {perk.name}
                    </span>
                    {isOwned && (
                      <span className="flex items-center gap-1 text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded bg-gold/20 text-gold border border-gold/40">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Active Connection
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{perk.desc}</p>
                  <div className="mt-2 text-[10px] text-zinc-500 font-mono flex items-center gap-3">
                    <span>
                      Flat Cost: <b className="text-kgreen">{cedi(perk.flatCost)} Clean Cash</b>
                    </span>
                    <span>·</span>
                    <span className="text-zinc-400">Strictly Flat · Never Inflates</span>
                  </div>
                </div>

                <div className="shrink-0">
                  {isOwned ? (
                    <div className="flex items-center gap-1 text-gold font-bold text-xs uppercase px-3 py-1.5 rounded border border-gold/30 bg-gold/10">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Permanent</span>
                    </div>
                  ) : (
                    <Btn
                      variant={afford ? "green" : "ghost"}
                      disabled={!afford}
                      className="text-xs py-2 px-3.5 font-bold uppercase"
                      onClick={() =>
                        act("buy_big_man_perk", { perkId: perk.id }, {
                          onResult: () => toast.success(`Secured connection: ${perk.name}!`),
                        })
                      }
                    >
                      Enlist {cedi(perk.flatCost)}
                    </Btn>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
