import { useState } from "react";
import { Siren } from "lucide-react";
import { useGame } from "../../store/game";
import { useNow } from "../../hooks/useNow";
import { dur, cedi } from "../../lib/fmt";
import { Btn, Sheet } from "./ui";

export default function RaidBanner() {
  const { player: p, derived: d, config, act, setTab } = useGame();
  const now = useNow();
  const [open, setOpen] = useState(false);
  if (!p.raid) return null;
  const rival = config.rivals.find((r) => r.id === p.raid.rival);
  const left = p.raid.resolve_at - now;
  const exposed = Math.max(0, Number(p.dirty) - Number(d.vault_cap));
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="raid-pulse z-40 flex w-full shrink-0 items-center justify-between px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-white"
        data-testid="raid-banner"
      >
        <span className="flex items-center gap-1.5"><Siren className="h-3.5 w-3.5" />Chale, {rival?.name} dey come!</span>
        <span className="font-mono" data-testid="raid-countdown">{dur(left)}</span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} testid="raid-sheet">
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-blood">Raid warning</div>
        <h3 className="font-display text-3xl uppercase text-zinc-100">{rival?.name}</h3>
        <p className="mt-2 border-l-2 border-blood pl-3 text-sm italic text-zinc-300" data-testid="raid-taunt">"{p.raid.taunt}" — {rival?.boss}</p>
        <div className="mt-5 grid grid-cols-2 gap-2 text-center">
          <div className="border border-zinc-800 p-3">
            <div className="text-[10px] uppercase text-zinc-500">Your defence</div>
            <div className="font-display text-2xl text-kgreen" data-testid="raid-defence">{d.defence}</div>
          </div>
          <div className="border border-zinc-800 p-3">
            <div className="text-[10px] uppercase text-zinc-500">Their muscle (approx)</div>
            <div className="font-display text-2xl text-blood" data-testid="raid-attack">~{p.raid.attack}</div>
          </div>
        </div>
        <p className="mt-3 text-xs text-zinc-400">
          At risk if you lose: 20–35% of {cedi(exposed)} outside your vault. {cedi(d.vault_cap)} in the vault stays safe. Hits in {dur(left)}.
        </p>
        <div className="mt-5 grid gap-2">
          <Btn
            variant="red"
            className="py-2.5 font-bold"
            onClick={() => {
              act("confront_raid");
              setOpen(false);
            }}
            data-testid="raid-engage-btn"
          >
            ⚔️ Engage Raiders Now (Battle Immediately)
          </Btn>
          <Btn variant="gold" onClick={() => act("fortify")} data-testid="raid-fortify-btn" disabled={p.raid.fortify >= 5}>
            Fortify +15 def ({cedi(d.fortify_cost)} dirty) · {p.raid.fortify}/5
          </Btn>
          {config.black_market.filter((i) => i.kind === "fortify" && p.inv[i.id] > 0).map((i) => (
            <Btn key={i.id} variant="red" onClick={() => act("use_item", { item: i.id })} disabled={p.raid.fortify >= 7} data-testid={`raid-item-btn-${i.id}`}>{i.name} (+{i.value} fortify) · {p.inv[i.id]}</Btn>
          ))}
          <Btn variant="ghost" onClick={() => { setOpen(false); setTab("crew"); }} data-testid="raid-assign-crew-btn">Put crew on compound defence</Btn>
          <Btn variant="ghost" disabled={!p.inv.lawyer || d.lawyer_left <= 0} onClick={() => { act("use_item", { item: "lawyer" }); setOpen(false); }} data-testid="raid-lawyer-btn">
            Call lawyer (cancels raid) · {p.inv.lawyer} owned
          </Btn>
        </div>
      </Sheet>
    </>
  );
}
