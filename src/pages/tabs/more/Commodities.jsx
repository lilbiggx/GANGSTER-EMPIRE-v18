import { useState } from "react";
import { toast } from "sonner";
import { Package, TrendingUp, TrendingDown, Clock, Coins, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useGame } from "../../../store/game";
import { useNow } from "../../../hooks/useNow";
import { cedi, dur } from "../../../lib/fmt";
import { Btn, Card } from "../../../components/game/ui";
import { SMUGGLE_COMMODITIES } from "../../../data/gameData";

export default function Commodities() {
  const { player: p, derived: d, act } = useGame();
  const now = useNow();
  const commodities = d.commodities || [];
  const nextHourSeconds = 3600 - (Math.floor(now) % 3600);

  return (
    <div className="space-y-4 pb-12" data-testid="commodities-tab">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-3 mt-2">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400 flex items-center gap-1.5">
            <Package className="h-3 w-3" />
            <span>Cross-Border Contraband Exchange</span>
          </div>
          <h2 className="font-display text-2xl uppercase text-zinc-100 font-bold leading-tight">
            Commodity Ticker
          </h2>
        </div>
        <div className="text-right text-[10px] font-mono text-zinc-400">
          <span className="block text-zinc-500">Next Price Shift</span>
          <span className="text-gold font-bold flex items-center gap-1 justify-end">
            <Clock className="h-2.5 w-2.5" />
            {dur(nextHourSeconds)}
          </span>
        </div>
      </div>

      <div className="grid gap-3">
        {commodities.map((item) => {
          const held = item.held || 0;
          const affordOne = BigInt(p.dirty || "0") >= BigInt(item.buyPrice);
          const isPositive = item.variancePct >= 0;

          return (
            <Card key={item.id} className="p-3 bg-surface/80 border-zinc-800">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-base font-bold uppercase text-zinc-100">
                      {item.name}
                    </span>
                    <span
                      className={`flex items-center text-[10px] font-mono font-bold ${
                        isPositive ? "text-kgreen" : "text-rose-400"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3 mr-0.5" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-0.5" />
                      )}
                      {isPositive ? `+${item.variancePct}%` : `${item.variancePct}%`}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">{item.desc}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Inventory</span>
                  <span className="text-sm font-mono font-bold text-zinc-200">
                    {held} units
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-zinc-800/80 grid grid-cols-2 gap-3">
                <div className="border border-zinc-800/70 bg-zinc-950/40 p-2 rounded flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-zinc-500 uppercase font-mono block">Buy (Dirty)</span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {cedi(item.buyPrice)}
                    </span>
                  </div>
                  <Btn
                    variant={affordOne ? "gold" : "ghost"}
                    disabled={!affordOne}
                    className="text-[10px] py-1 px-2.5"
                    onClick={() => act("commodity_buy", { commodityId: item.id, quantity: 1 })}
                  >
                    Buy 1
                  </Btn>
                </div>

                <div className="border border-zinc-800/70 bg-zinc-950/40 p-2 rounded flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-zinc-500 uppercase font-mono block">Sell (Clean)</span>
                    <span className="text-xs font-mono font-bold text-kgreen">
                      {cedi(item.sellPrice)}
                    </span>
                  </div>
                  <Btn
                    variant={held > 0 ? "green" : "ghost"}
                    disabled={held <= 0}
                    className="text-[10px] py-1 px-2.5"
                    onClick={() => act("commodity_sell", { commodityId: item.id, quantity: held })}
                  >
                    Sell All ({held})
                  </Btn>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
