// v9: "While you were away" summary of rival events that played out offline.
import { useGame } from "../../store/game";
import { Btn } from "./ui";
import { TYPE_LABEL, outcomeText, when } from "./rivalFmt";

export default function AwaySummary() {
  const { player: p, act, openMore, setTab } = useGame();
  const s = p?.away_summary;
  if (!s || p.archrival_event) return null;
  const list = (p.rival_event_log || []).filter((e) => s.ids?.includes(e.id));
  if (!list.length) return null;
  const tot = list.reduce((a, e) => ({ d: a.d + (e.outcome?.dirty || 0), c: a.c + (e.outcome?.clean || 0), i: a.i + (e.outcome?.injuries?.length || 0) }), { d: 0, c: 0, i: 0 });
  const close = () => act("away_summary_seen", {});
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-3" role="dialog" aria-modal="true" data-testid="away-summary">
      <div className="max-h-[85dvh] w-full max-w-[420px] overflow-y-auto border-2 border-gold bg-ink p-4">
        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">While you were away · {when(s.from)} → {when(s.to)}</div>
        <h2 className="font-display text-xl uppercase text-gold">Rivals made {list.length} move{list.length > 1 ? "s" : ""}</h2>
        <p className="mt-1 text-[11px] text-zinc-400">Nobody was there to answer, so each one played out as "Ignore".</p>
        <ul className="mt-3 space-y-2">
          {list.map((e) => (
            <li key={e.id} className="border border-zinc-800 bg-surface p-2" data-testid="away-summary-row">
              <div className="flex justify-between gap-2 text-[11px]"><span className="font-bold text-zinc-100">{e.arch ? "ARCH · " : ""}{e.rival}</span><span className="text-zinc-500">{when(e.t)}</span></div>
              <div className="text-[11px] text-red-300">{TYPE_LABEL[e.type] || e.type}</div>
              <div className="text-[11px] text-zinc-400">{outcomeText(e.outcome)}</div>
            </li>
          ))}
        </ul>
        <div className="mt-3 border-t border-zinc-800 pt-2 text-[11px] text-zinc-300" data-testid="away-summary-total">
          Total: {tot.d ? `${tot.d < 0 ? "−" : "+"}GH₵${Math.abs(tot.d).toLocaleString()} dirty` : "no dirty lost"}{tot.c ? ` · ${tot.c < 0 ? "−" : "+"}GH₵${Math.abs(tot.c).toLocaleString()} clean` : ""}{tot.i ? ` · ${tot.i} injured` : ""}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Btn variant="ghost" className="min-h-[44px]" data-testid="away-summary-log" onClick={() => { close(); setTab?.("more"); openMore?.("rivalevents"); }}>Open log</Btn>
          <Btn className="min-h-[44px]" data-testid="away-summary-ok" onClick={close}>Got it</Btn>
        </div>
      </div>
    </div>
  );
}
