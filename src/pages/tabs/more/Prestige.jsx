import { useState } from "react";
import { toast } from "sonner";
import { useGame } from "../../../store/game";
import { cedi } from "../../../lib/fmt";
import { Btn, Card, SectionTitle } from "../../../components/game/ui";

export default function Prestige() {
  const { player: p, derived: d, act } = useGame();
  const [confirm, setConfirm] = useState(false);
  const ready = p.level >= 20 && d.respect_gain >= 1;
  return (
    <div>
      <SectionTitle kicker="Long game" title="Retire to the Village" />
      <Card accent="gold" data-testid="prestige-card">
        <p className="text-sm text-zinc-300">Give up your hustles, fronts, cash and mansion. Keep up to 4 crew, cosmetics and your streak. Earn Respect: every point is +10% income forever.</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="border border-zinc-800 p-2"><div className="text-[10px] uppercase text-zinc-500">Respect now</div><div className="font-display text-2xl text-gold" data-testid="prestige-respect">{p.prestige.respect}</div></div>
          <div className="border border-zinc-800 p-2"><div className="text-[10px] uppercase text-zinc-500">You'd gain</div><div className="font-display text-2xl text-kgreen" data-testid="prestige-gain">+{d.respect_gain}</div></div>
          <div className="border border-zinc-800 p-2"><div className="text-[10px] uppercase text-zinc-500">Income x</div><div className="font-display text-2xl text-zinc-100">{d.mult}</div></div>
        </div>
        <p className="mt-3 text-[11px] text-zinc-500">Needs level 20 and GH₵1M lifetime earnings this run. Lifetime now: {cedi(p.lifetime)}. Times retired: {p.prestige.count}.</p>
        {!confirm ? (
          <Btn className="mt-4 w-full" disabled={!ready} onClick={() => setConfirm(true)} data-testid="prestige-start-btn">{ready ? "Retire now" : "Not ready yet"}</Btn>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Btn variant="ghost" onClick={() => setConfirm(false)} data-testid="prestige-cancel-btn">Not yet</Btn>
            <Btn variant="red" data-testid="prestige-confirm-btn" onClick={() => { act("prestige", {}, { onResult: (r) => toast.success(`Welcome to the village. +${r.respect} Respect`) }); setConfirm(false); }}>Yes, retire</Btn>
          </div>
        )}
      </Card>
    </div>
  );
}
