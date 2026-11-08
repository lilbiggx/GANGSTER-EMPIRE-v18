import { useGame } from "../../store/game";
import { cedi, fmt, big } from "../../lib/fmt";
import { Btn, Card, Bar } from "../../components/game/ui";
import { Snowflake, Scale, Phone, Coins } from "lucide-react";
import { useNow } from "../../hooks/useNow";

export default function HeatPanel({ now: propNow }) {
  const { player: p, derived: d, config, act } = useGame();
  const internalNow = useNow();
  const now = propNow || internalNow;
  const heat = p.heat || 0;
  const todayKey = new Date(now * 1000).toISOString().slice(0, 10);
  const usedLayLowToday = p.last_lie_low_day === todayKey;

  return (
    <Card accent="red" data-testid="heat-panel">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Wanted Level · Heat tier {d.tier}/5
          </div>
          <div className="flex items-center gap-1 my-1" title={`Wanted Level: ${Math.min(5, Math.max(0, Math.ceil(heat / 20)))} / 5 Stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-lg ${i < Math.min(5, Math.max(0, Math.ceil(heat / 20))) ? "text-amber-400" : "text-zinc-800"}`}>★</span>
            ))}
            <span className="text-xs font-mono text-blood font-bold ml-2">({Math.round(heat)}% Heat)</span>
          </div>
          <div className="font-display text-base uppercase text-blood" data-testid="heat-tier-name">
            {d.tier_name}
          </div>
        </div>
        <div className="text-right text-[11px] text-zinc-400">
          Base laundering fee <b className="text-zinc-100" data-testid="launder-fee">{Math.round(d.fee * 100)}%</b>
        </div>
      </div>
      <div className="mt-2"><Bar pct={heat} color="red" testid="heat-bar" /></div>

      <div className="mt-2 text-[10px] text-zinc-400 bg-zinc-950/60 p-1.5 border border-zinc-800/60 rounded">
        Hourly natural cooldown removed. Only <b className="text-zinc-200">Lay Low (-40 Heat, 1x/day)</b> or bribes reduce heat.
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Btn
          variant="green"
          onClick={() => act("bribe")}
          disabled={heat < 1 || big(p.clean) < big(d.bribe_cost)}
          data-testid="heat-bribe-btn"
        >
          <div className="flex items-center gap-1">
            <Coins className="h-3 w-3" />
            <span>Bribe ({cedi(d.bribe_cost)})</span>
          </div>
        </Btn>
        <Btn
          variant={usedLayLowToday ? "ghost" : "gold"}
          onClick={() => act("lie_low")}
          disabled={usedLayLowToday || heat <= 0}
          data-testid="heat-lielow-btn"
        >
          <Snowflake className="h-3 w-3" />
          {usedLayLowToday ? "Lay Low Used (1/1 Today)" : "Lay Low (-40 Heat · 1x/Day)"}
        </Btn>
        <Btn
          variant="ghost"
          onClick={() => act("use_item", { item: "burner" })}
          disabled={!p.inv.burner}
          data-testid="heat-burner-btn"
        >
          <Phone className="h-3 w-3" />Burner ×{p.inv.burner}
        </Btn>
        <Btn
          variant="ghost"
          onClick={() => act("use_item", { item: "lawyer" })}
          disabled={!p.inv.lawyer || d.lawyer_left <= 0}
          data-testid="heat-lawyer-btn"
        >
          <Scale className="h-3 w-3" />Lawyer ×{p.inv.lawyer}
        </Btn>
        {config.black_market.filter((i) => i.kind === "heat" && i.id !== "burner" && p.inv[i.id] > 0).map((i) => (
          <Btn
            key={i.id}
            variant="ghost"
            className="col-span-2"
            onClick={() => act("use_item", { item: i.id })}
            data-testid={`heat-item-btn-${i.id}`}
          >
            {i.name} (-{i.value} heat) ×{p.inv[i.id]}
          </Btn>
        ))}
      </div>
    </Card>
  );
}
