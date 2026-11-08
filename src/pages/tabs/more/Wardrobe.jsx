import { useGame } from "../../../store/game";
import { SectionTitle } from "../../../components/game/ui";

const SLOTS = [["drip", "Drip"], ["car", "Ride"], ["decor", "Mansion decor"]];
const RARITY = { common: "text-zinc-300", rare: "text-sky-300", legendary: "text-gold" };

export default function Wardrobe() {
  const { player: p, config, act } = useGame();
  return (
    <div>
      <SectionTitle kicker="Looks only, no stats" title="Drip & Rides" />
      {SLOTS.map(([slot, l]) => {
        const items = config.cosmetics.filter((c) => c.slot === slot && p.cosmetics.includes(c.id));
        return (
          <div key={slot} className="mb-4">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gold">{l}</div>
            <div className="grid grid-cols-2 gap-2">
              {items.map((c) => {
                const on = p.equipped[slot] === c.id;
                return (
                  <button key={c.id} onClick={() => act("equip", { slot, cosmetic: on ? null : c.id })} data-testid={`wardrobe-item-${c.id}`}
                    className={`btn-press border p-3 text-left ${on ? "border-gold bg-surface2" : "border-zinc-800 bg-surface"}`}>
                    <div className="font-display text-sm uppercase text-zinc-100">{c.name}</div>
                    <div className={`text-[10px] uppercase ${RARITY[c.rarity]}`}>{c.rarity}{on ? " · wearing" : ""}</div>
                  </button>
                );
              })}
              {!items.length && <div className="stripes col-span-2 border p-4 text-center text-[11px]">Nothing yet. Check the Boutique, Street Pass or Shop.</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
