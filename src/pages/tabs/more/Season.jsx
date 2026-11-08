import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, errMsg } from "../../../lib/api";
import { useGame } from "../../../store/game";
import { useNow } from "../../../hooks/useNow";
import { dur, fmt } from "../../../lib/fmt";
import { Bar, SectionTitle, Chip } from "../../../components/game/ui";

export default function Season() {
  const p = useGame((s) => s.player);
  const now = useNow();
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/season").then((r) => setData(r.data)).catch((e) => toast.error(errMsg(e))); }, []);
  return (
    <div>
      <SectionTitle kicker={data ? `Season ${data.season}` : "Monthly season"} title="Who controls the city" right={data && <Chip data-testid="season-ends">Ends in {dur(data.ends - now)}</Chip>} />
      <div className="mb-3 border border-gold p-3" data-testid="season-my-points">
        <div className="text-[10px] uppercase tracking-widest text-zinc-500">Your season points</div>
        <div className="font-display text-3xl text-gold">{fmt(p.season.points)}</div>
        <div className="text-[11px] text-zinc-500">Earned for your district. The top boss in each district controls it when the month ends.</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {data?.turf.map((t) => (
          <div key={t.id} className={`border p-3 ${t.id === p.district ? "border-gold bg-surface2" : "border-zinc-800 bg-surface"}`} data-testid={`season-district-${t.id}`}>
            <div className="font-display text-sm uppercase text-zinc-100">{t.name}</div>
            <div className="truncate text-[11px] text-gold">{t.boss || "Unclaimed"}</div>
            <div className="my-1.5"><Bar pct={t.share} color={t.id === p.district ? "gold" : "red"} /></div>
            <div className="text-[10px] text-zinc-500">{t.share}% of city action</div>
          </div>
        ))}
      </div>
    </div>
  );
}
