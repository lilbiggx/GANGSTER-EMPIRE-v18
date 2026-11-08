import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useGame } from "../../store/game";
import { cedi } from "../../lib/fmt";
import { Btn } from "./ui";

export default function AdModal() {
  const { ad, closeAd, act } = useGame();
  const [left, setLeft] = useState(5);
  useEffect(() => {
    if (!ad) return;
    setLeft(5);
    const id = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(id);
  }, [ad]);
  if (!ad) return null;
  const claim = () => {
    act("ad_reward", { kind: ad }, {
      onResult: (r) =>
        toast.success(
          ad === "double"
            ? `Doubled! +${cedi(r.earned)}`
            : ad === "heist_slot"
            ? `Unlocked +1 Daily Heist Slot! (${r.count}/${r.max} today)`
            : "Stores restocked, chale!"
        ),
    });
    closeAd();
  };
  const isHeist = ad === "heist_slot";
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-6" data-testid="ad-modal">
      <div className="w-full max-w-sm border border-gold bg-surface p-6 text-center">
        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Underworld pirate broadcast · sponsor</div>
        <div className="kente mx-auto my-5 h-2 w-24" />
        <div className="font-display text-3xl uppercase text-gold">{isHeist ? "Accra Tactical Radio" : "Chale Cola"}</div>
        <div className="text-sm text-zinc-400">
          {isHeist ? "Encrypted communications channel cleared. Daily heist authorization granting +1 operation slot." : "The cold drink every boss trusts."}
        </div>
        <div className="font-display mt-6 text-6xl text-zinc-100" data-testid="ad-countdown">{left}</div>
        <div className="mt-6 grid gap-2">
          <Btn disabled={left > 0} onClick={claim} data-testid="ad-claim-btn">{left > 0 ? "Wait small..." : isHeist ? "Unlock +1 Heist Slot" : "Claim reward"}</Btn>
          <Btn variant="ghost" onClick={closeAd} data-testid="ad-close-btn">No thanks</Btn>
        </div>
      </div>
    </div>
  );
}
