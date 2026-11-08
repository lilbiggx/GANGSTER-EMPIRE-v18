import { useState } from "react";
import { Banknote, ShieldCheck, Flame, Vault } from "lucide-react";
import { useGame } from "../../store/game";
import { cedi } from "../../lib/fmt";
import { Btn, Sheet } from "./ui";

const TIPS = [
  { id: "dirty", icon: Banknote, color: "text-gold", title: "Dirty cedis", when: () => true,
    body: (d) => [
      "Everything you hustle, raid, fight or steal is dirty money. Spend it on crew payroll, guns, gear, bribes, repairs and bets.",
      "Land, street hustles, fronts and other assets can only be bought with CLEAN cash. Launder first.",
      `Your vault keeps ${cedi(d.vault_cap)} safe. Raids can take 20–35% of what sits outside it.`,
    ] },
  { id: "clean", icon: ShieldCheck, color: "text-kgreen", title: "Clean cedis", when: (p) => Number(p.clean) > 0 || p.batches.length > 0,
    body: () => [
      "Laundering through a front turns dirty cash into clean cash, minus a fee.",
      "Clean cedis can never be raided. They buy land, street hustles, fronts, mansion upgrades and clothes.",
    ] },
  { id: "heat", icon: Flame, color: "text-blood", title: "Heat", when: (p) => p.heat >= 15,
    body: (d) => [
      "Every collection, heist and rival hit makes the police notice you.",
      `Right now laundering costs ${Math.round(d.fee * 100)}%. At high heat it climbs to 30% and raids come more often.`,
      "Heat cools by itself. Lie low, bribe, or burn a phone to drop it faster.",
    ] },
  { id: "vault", icon: Vault, color: "text-orange-300", title: "Cash is exposed", when: (p, d) => Number(p.dirty) > Number(d.vault_cap) && Object.keys(p.fronts).length > 0,
    body: (d) => [
      `Anything above ${cedi(d.vault_cap)} is outside your vault and can be stolen.`,
      "Launder it, spend it, or upgrade the vault in Market → Mansion.",
    ] },
];

const seen = () => JSON.parse(localStorage.getItem("uw_tips_seen") || "[]");

export default function TipSheet() {
  const { player: p, derived: d, welcome } = useGame();
  const [, bump] = useState(0);
  const tip = !welcome && TIPS.find((t) => !seen().includes(t.id) && t.when(p, d));
  if (!tip) return null;
  const close = () => { localStorage.setItem("uw_tips_seen", JSON.stringify([...seen(), tip.id])); bump((x) => x + 1); };
  const Icon = tip.icon;
  return (
    <Sheet open onClose={close} testid="tip-sheet">
      <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-blood">Street lesson</div>
      <h3 className={`mt-1 flex items-center gap-2 font-display text-2xl uppercase ${tip.color}`} data-testid={`tip-title-${tip.id}`}><Icon className="h-6 w-6" />{tip.title}</h3>
      <div className="mt-3 grid gap-2 text-sm leading-relaxed text-zinc-300">
        {tip.body(d).map((l) => <p key={l}>{l}</p>)}
      </div>
      <Btn className="mt-5 w-full py-3" onClick={close} data-testid="tip-sheet-ok-btn">Got it</Btn>
    </Sheet>
  );
}
