import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, errMsg } from "../../../lib/api";
import { useGame } from "../../../store/game";
import { cedi, fmt } from "../../../lib/fmt";
import { SectionTitle } from "../../../components/game/ui";

const SCOPES = [["national", "National"], ["district", "My District"], ["season", "Season"]];

export default function Leaderboard() {
  const config = useGame((s) => s.config);
  const [scope, setScope] = useState("national");
  const [rows, setRows] = useState(null);
  useEffect(() => {
    setRows(null);
    api.get("/leaderboard", { params: { scope } }).then((r) => setRows(r.data.rows)).catch((e) => toast.error(errMsg(e)));
  }, [scope]);
  return (
    <div>
      <SectionTitle kicker="Who runs the city" title="Leaderboards" />
      <div className="mb-3 grid grid-cols-3 gap-1">
        {SCOPES.map(([id, l]) => (
          <button key={id} onClick={() => setScope(id)} data-testid={`leaderboard-scope-${id}`}
            className={`btn-press border py-1.5 text-[11px] font-extrabold uppercase ${scope === id ? "border-gold bg-gold text-ink" : "border-zinc-800 text-zinc-400"}`}>{l}</button>
        ))}
      </div>
      <div className="grid gap-px bg-zinc-800" data-testid="leaderboard-list">
        {rows?.map((r) => (
          <div key={r.rank} className={`flex items-center gap-3 px-3 py-2 ${r.me ? "bg-surface2" : "bg-ink"}`} data-testid={`leaderboard-row-${r.rank}`}>
            <span className={`w-7 font-display text-lg ${r.rank <= 3 ? "text-gold" : "text-zinc-500"}`}>{r.rank}</span>
            <div className="min-w-0 flex-1">
              <div className={`truncate text-sm font-bold ${r.me ? "text-gold" : "text-zinc-100"}`}>{r.name}{r.me ? " (you)" : ""}</div>
              <div className="text-[10px] text-zinc-500">LV {r.level} · {config.districts.find((d) => d.id === r.district)?.name}{r.prestige?.count ? ` · Retired ×${r.prestige.count}` : ""}</div>
            </div>
            <span className="font-display text-base text-zinc-100">{scope === "season" ? `${fmt(r.season?.points)} pts` : cedi(r.nw_score)}</span>
          </div>
        ))}
        {!rows && <div className="bg-ink p-6 text-center text-xs text-zinc-500">Loading...</div>}
      </div>
    </div>
  );
}
