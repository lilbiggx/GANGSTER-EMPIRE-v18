import { useGame } from "../../../store/game";
import { cedi } from "../../../lib/fmt";
import { Btn, Bar, SectionTitle, Chip } from "../../../components/game/ui";

const label = (r, config) =>
  r.clean ? cedi(r.clean) + " clean" : r.timeskip ? "Time skip" : r.cosmetic ? config.cosmetics.find((c) => c.id === r.cosmetic)?.name : "";

export default function Pass() {
  const { player: p, config, act, openMore } = useGame();
  const ps = p.pass;
  const tier = Math.floor(ps.xp / config.pass.xp_per_tier);
  return (
    <div>
      <SectionTitle kicker={`Season ${ps.season}`} title="Street Pass" right={<Chip className={ps.premium ? "border-gold text-gold" : ""} data-testid="pass-status">{ps.premium ? "Paid track on" : "Free track"}</Chip>} />
      <div className="mb-3">
        <div className="flex justify-between text-[11px] text-zinc-400"><span>Tier <b className="text-gold" data-testid="pass-tier">{tier}</b>/{config.pass.tiers}</span><span>{ps.xp % config.pass.xp_per_tier}/{config.pass.xp_per_tier} XP</span></div>
        <Bar pct={(ps.xp % config.pass.xp_per_tier)} />
        <p className="mt-1 text-[11px] text-zinc-500">Earn pass XP from collecting, laundering, heists, contracts and daily logins. Paid rewards are cosmetic or convenience only.</p>
      </div>
      {!ps.premium && <Btn className="mb-3 w-full" onClick={() => openMore("shop")} data-testid="pass-buy-btn">Unlock paid track in the Shop</Btn>}
      <div className="grid gap-px bg-zinc-800">
        {Array.from({ length: config.pass.tiers }).map((_, i) => {
          const t = i + 1;
          const open = tier >= t;
          return (
            <div key={t} className="grid grid-cols-[36px_1fr_1fr] items-center gap-2 bg-ink px-2 py-2" data-testid={`pass-tier-row-${t}`}>
              <span className={`font-display text-lg ${open ? "text-gold" : "text-zinc-600"}`}>{t}</span>
              {["free", "prem"].map((track) => {
                const r = config.pass[track][i];
                const claimed = ps[track].includes(t);
                const can = open && !claimed && (track === "free" || ps.premium);
                return (
                  <button key={track} disabled={!can} onClick={() => act("pass_claim", { tier: t, track })} data-testid={`pass-claim-${track}-${t}`}
                    className={`btn-press border px-2 py-1.5 text-left text-[10px] font-bold ${claimed ? "border-zinc-800 text-zinc-600 line-through" : can ? "border-gold text-gold" : track === "prem" ? "border-zinc-800 text-zinc-500 stripes" : "border-zinc-800 text-zinc-500"}`}>
                    {track === "prem" ? "PAID · " : ""}{label(r, config)}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
