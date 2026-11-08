import React, { useState } from "react";
import { toast } from "sonner";
import { useGame } from "../../../store/game";
import { PRODUCTS } from "../../../data/gameData";
import { Btn, Card, SectionTitle, Chip } from "../../../components/game/ui";
import { CheckCircle } from "lucide-react";

export default function Shop() {
  const { player: p } = useGame();
  const [provider, setProvider] = useState("sandbox");
  const [busy, setBusy] = useState(null);

  if (p.raid) {
    return (
      <div className="mt-6 border border-blood p-6 text-center text-sm text-zinc-300" data-testid="shop-closed-raid">
        Shop closed during a raid countdown. Defend your turf first.
      </div>
    );
  }

  const owned = (id) =>
    (id === "street_pass" && p.pass?.premium) ||
    p.cosmetics?.includes(id) ||
    (id === "build_slot" && (p.build_slots || 0) >= 3);

  const testBuy = (id) => {
    setBusy(id);
    setTimeout(() => {
      if (id === "street_pass") {
        p.pass.premium = true;
        toast.success("Street Pass (Season) unlocked! Claim all premium tier rewards.", { duration: 4000 });
      } else if (id === "timeskip_pack") {
        p.inv.timeskip = (p.inv.timeskip || 0) + 3;
        toast.success("+3 Time Skips added to your inventory!", { duration: 4000 });
      } else if (id === "lawyer") {
        p.inv.lawyer = (p.inv.lawyer || 0) + 1;
        toast.success("Lawyer Shield retained! Ready when heat gets too hot.", { duration: 4000 });
      } else if (id === "build_slot") {
        p.build_slots = (p.build_slots || 0) + 1;
        toast.success("Extra Laundering Build Slot added! (+1 parallel batch)", { duration: 4000 });
      } else if (id === "drip_crate") {
        const pool = ["drip_kente", "car_benz", "decor_art", "drip_fugu", "car_corolla", "decor_drum"];
        const won = pool[Math.floor(Math.random() * pool.length)];
        if (!p.cosmetics.includes(won)) p.cosmetics.push(won);
        toast.success(`Crate opened! Unlocked cosmetic: ${won.replace(/_/g, " ").toUpperCase()}`, { duration: 4000 });
      } else {
        if (!p.cosmetics.includes(id)) p.cosmetics.push(id);
        toast.success(`Unlocked cosmetic: ${PRODUCTS[id]?.name || id}!`, { duration: 4000 });
      }
      useGame.getState().save();
      setBusy(null);
    }, 400);
  };

  return (
    <div>
      <SectionTitle kicker="Testing & In-Game Products" title="Black Market Syndicate Shop" />
      <p className="-mt-1 mb-3 text-xs text-zinc-500">
        Standalone testing mode active: test purchases instantly simulate rewards, build slots, and street passes without real payment cards.
      </p>

      <div className="mb-3 grid grid-cols-2 gap-1.5" data-testid="shop-provider-picker">
        {["Offline Testing Sandbox", "MoMo Test Gateway"].map((pv) => (
          <button
            key={pv}
            type="button"
            onClick={() => setProvider(pv)}
            className={`border py-2 text-[10px] font-extrabold uppercase tracking-wider ${
              provider === pv ? "border-gold bg-gold text-ink" : "border-zinc-800 bg-surface text-zinc-400"
            }`}
          >
            {pv}
          </button>
        ))}
      </div>

      <div className="grid gap-2">
        {Object.entries(PRODUCTS).map(([id, pr]) => {
          const isOwned = owned(id);
          return (
            <Card key={id} accent="gold" data-testid={`shop-product-${id}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-display uppercase text-zinc-100 flex items-center gap-1.5">
                    {pr.name}
                    {isOwned && <CheckCircle className="h-3.5 w-3.5 text-kgreen" />}
                  </div>
                  <div className="text-[11px] text-zinc-400">{pr.desc}</div>
                  {pr.odds && (
                    <div className="mt-1 flex gap-1" data-testid="shop-crate-odds">
                      {Object.entries(pr.odds).map(([r, o]) => (
                        <Chip key={r} className="text-zinc-300">
                          {r} {Math.round(o * 100)}%
                        </Chip>
                      ))}
                    </div>
                  )}
                </div>
                <Btn
                  disabled={isOwned || busy === id}
                  onClick={() => testBuy(id)}
                  data-testid={`shop-buy-btn-${id}`}
                  className="shrink-0"
                >
                  {isOwned ? "Owned" : busy === id ? "..." : `Test GH₵${pr.price}`}
                </Btn>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
