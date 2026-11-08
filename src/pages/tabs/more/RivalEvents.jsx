// v9: log of every rival / arch-rival event: when, who, what, your choice and the outcome.
import { useEffect, useState } from "react";
import { useGame } from "../../../store/game";
import { Card, SectionTitle } from "../../../components/game/ui";
import { TYPE_LABEL, outcomeText, when } from "../../../components/game/rivalFmt";

export default function RivalEvents() {
  const { player: p, derived: d, act } = useGame();
  const [f, setF] = useState("all");
  useEffect(() => { act("rival_log_seen", {}); }, []); // eslint-disable-line
  const log = (p.rival_event_log || []).filter((e) => f === "all" || (f === "away" ? e.offline : f === "arch" ? e.arch : !e.offline));
  const re = d?.rival_events || {};
  return (
    <div data-testid="rival-events-page">
      <SectionTitle kicker="Last 30 days" title="Rival Events" />
      <Card>
        <div className="text-[11px] text-zinc-400">Rivals move on their own every 30 minutes. Chance now: <b className="text-gold" data-testid="rival-event-chance">{re.chance_pct ?? 0}%</b> per half hour, driven by gang hate, your heat and your respect.{re.arch_rival && <> Arch rival: <b className="text-blood" data-testid="rival-arch-name">{(p.rival_event_log || []).find((e) => e.rival_id === re.arch_rival)?.rival || re.arch_rival}</b>.</>}</div>
      </Card>
      <div className="mt-3 flex gap-1.5">
        {["all", "live", "away", "arch"].map((k) => (
          <button key={k} onClick={() => setF(k)} data-testid={`rival-log-filter-${k}`} className={`btn-press min-h-[36px] flex-1 border px-2 text-[10px] font-bold uppercase ${f === k ? "border-gold text-gold" : "border-zinc-800 text-zinc-500"}`}>{k}</button>
        ))}
      </div>
      {!log.length && <p className="mt-6 text-center text-xs text-zinc-500" data-testid="rival-log-empty">No rival events yet.</p>}
      <ul className="mt-2 space-y-1.5">
        {log.map((e) => (
          <li key={e.id} className="border border-zinc-800 bg-surface p-2" data-testid="rival-log-row" data-type={e.type} data-choice={e.choice || ""}>
            <div className="flex justify-between gap-2 text-[11px]">
              <span className="min-w-0 truncate font-bold text-zinc-100">{e.arch && <span className="mr-1 bg-blood px-1 text-[9px] text-white">ARCH</span>}{e.rival || "Unknown"}</span>
              <span className="shrink-0 text-zinc-500">{when(e.t)}</span>
            </div>
            <div className="flex justify-between gap-2 text-[11px]">
              <span className="text-red-300">{TYPE_LABEL[e.type] || e.type}</span>
              <span className={`shrink-0 uppercase ${e.choice ? "text-gold" : "text-zinc-500"}`} data-testid="rival-log-choice">{e.choice || "pending"}{e.offline ? " · away" : ""}</span>
            </div>
            <div className="text-[11px] text-zinc-400" data-testid="rival-log-outcome">{outcomeText(e.outcome)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
