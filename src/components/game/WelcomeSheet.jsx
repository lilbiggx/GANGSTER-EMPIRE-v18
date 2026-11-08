import { useGame } from "../../store/game";
import { cedi, dur } from "../../lib/fmt";
import { Btn, Sheet } from "./ui";

export default function WelcomeSheet() {
  const { welcome: w, dismissWelcome, act, showAd, player } = useGame();
  if (!w) return null;
  const collect = () => { act("collect", { hid: "all" }); dismissWelcome(); };
  return (
    <Sheet open onClose={dismissWelcome} testid="welcome-sheet">
      <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-blood">Welcome back, boss</div>
      <h3 className="font-display text-2xl uppercase text-zinc-100">You were away {dur(w.away)}</h3>
      <div className="mt-4 text-[10px] uppercase tracking-widest text-zinc-500">Your hustles made</div>
      <div className="font-display text-5xl text-gold" data-testid="welcome-pending">{cedi(w.pending)}</div>
      {w.capped && <div className="text-[11px] text-zinc-500">Capped at {w.cap_h}h. Upgrade the Safehouse for 24h.</div>}
      <ul className="mt-4 space-y-1 text-sm text-zinc-300">
        {w.batches_ready > 0 && <li data-testid="welcome-batches">{w.batches_ready} laundering batch(es) ready</li>}
        {w.heists_ready > 0 && <li data-testid="welcome-heists">{w.heists_ready} heist(s) waiting for you</li>}
        {w.raids.map((r, i) => (
          <li key={i} className={r.won ? "text-kgreen" : "text-blood"}>
            {r.won ? `You beat back ${r.rival}` : `${r.rival} raided you: -${cedi(r.amount)}`}
          </li>
        ))}
      </ul>
      <div className="mt-6 grid gap-2">
        <Btn onClick={collect} className="py-3" data-testid="welcome-collect-btn">Collect {cedi(w.pending)}</Btn>
        {w.can_double && !player.ads.double && Number(w.pending) > 0 && (
          <Btn variant="ghost" onClick={() => { dismissWelcome(); showAd("double"); }} data-testid="welcome-double-ad-btn">
            Watch a short ad: double it (demo)
          </Btn>
        )}
      </div>
    </Sheet>
  );
}
