import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Swords,
  Users,
  ShieldAlert,
  Coins,
  Crosshair,
  Radio,
  Eye,
  Siren,
  Sparkles,
} from "lucide-react";
import { useGame } from "../../store/game";
import { cedi, big } from "../../lib/fmt";
import { Btn, Card } from "./ui";

export default function ArchrivalModal() {
  const { player: p, act } = useGame();
  const [resolving, setResolving] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const ev = p.archrival_event;

  const contextHint = useMemo(() => {
    if (!ev) return "";
    const isHostile = ev.rival_grudge > 50;
    const isAuditHigh = p.heat > 60;
    if (isHostile) return "Hostile rival detected: aggression advised.";
    if (isAuditHigh) return "High heat detected: quiet approach advised.";
    return "Standard syndicate crisis.";
  }, [ev, p]);

  if (!ev) return null;

  const handleChoice = (choice) => {
    if (resolving) return;
    setResolving(true);
    setRevealed(true); // Reveal outcome now
    act("resolve_archrival_event", { choice, event_id: ev.id }, {
      onResult: (res) => {
        setResolving(false);
        const r = res || {};
        const bits = [];
        if (r.dirty && r.dirty !== "0") bits.push(`${Number(r.dirty) > 0 ? "+" : "−"}${cedi(String(r.dirty).replace("-", ""))} dirty`);
        if (r.clean && r.clean !== "0") bits.push(`${Number(r.clean) > 0 ? "+" : "−"}${cedi(String(r.clean).replace("-", ""))} clean`);
        if (r.respect) bits.push(`respect ${r.respect > 0 ? "+" : ""}${r.respect}`);
        if (r.injuries?.length) bits.push(`${r.injuries.length} injured`);
        const msg = [r.note, bits.join(" · ")].filter(Boolean).join(" — ") || "Crisis resolved";
        (r.won === false || Number(r.dirty) < 0 ? toast.error : toast.success)(msg);
      },
    });
    setTimeout(() => setResolving(false), 700);
  };

  const isRivalWar = ev.type === "rival_war";
  const isKidnap = ev.type === "kidnap";
  const isAmbush = ev.type === "ambush";
  const kicker = ev.source === "rival" ? `RIVAL MOVE · ${ev.label || "EVENT"}` : "STREET CRISIS";

  const ChoiceButton = ({ id, onClick, icon: Icon, title, desc, rewardText }) => (
    <button
      disabled={resolving}
      onClick={() => onClick(id)}
      className="w-full p-3 rounded border border-zinc-800 bg-surface hover:border-gold text-left transition-all disabled:opacity-50"
      data-testid={`archrival-choice-${id}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-display text-sm text-zinc-100 uppercase flex items-center gap-2">
          <Icon className="h-4 w-4 text-gold" /> {title}
        </span>
        <span className="text-[10px] font-mono text-zinc-500 font-bold">
          {revealed ? rewardText : "???"}
        </span>
      </div>
      <div className="text-[11px] text-zinc-400 mt-1">{desc}</div>
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 animate-fadeIn backdrop-blur-sm" role="dialog" aria-modal="true"
      data-testid="archrival-event-modal"
    >
      <div className="w-full max-w-[420px] max-h-[90dvh] overflow-y-auto border-2 border-blood bg-ink p-4 space-y-3.5 shadow-2xl shadow-blood/30" data-testid="archrival-event-panel">
        <div className="flex items-center gap-2.5 border-b border-blood/60 pb-3">
          <div className="flex items-center justify-center h-10 w-10 rounded bg-blood text-white shrink-0 animate-pulse">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-red-400">
              {kicker}
            </div>
            <h2 className="font-display text-xl uppercase text-zinc-100 leading-tight">
              {ev.title}
            </h2>
          </div>
        </div>

        <div className="rounded border border-zinc-800 bg-zinc-950/80 p-3 text-xs text-zinc-300">
          <p className="leading-relaxed">{ev.desc}</p>
          <div className="mt-2 text-[10px] text-gold/70 font-mono italic">Context: {contextHint}</div>
        </div>

        <div className="space-y-2 pt-1">
          {isRivalWar && (
            <>
              <ChoiceButton id="intervene" onClick={handleChoice} icon={Swords} title="Intervene & Back Rival" desc="Send muscle to back the rival. Reduces grudge, seizes dirty cash." rewardText="+GH₵8,000 Loot" />
              <ChoiceButton id="scavenge" onClick={handleChoice} icon={Crosshair} title="Scavenge Crossfire" desc="Loot ammunition crates and cash while they fight." rewardText="+GH₵4,000 Loot" />
              <ChoiceButton id="observe" onClick={handleChoice} icon={Eye} title="Stand Down & Observe" desc="Let them bleed ammunition reserves. Low risk." rewardText="Neutral" />
            </>
          )}
          {isKidnap && (
            <>
              <ChoiceButton id="rescue" onClick={handleChoice} icon={Crosshair} title="Launch Rescue Raid" desc="Storm safehouse perimeter to extract crew." rewardText="Combat Skirmish" />
              <ChoiceButton id="pay_ransom_dirty" onClick={handleChoice} icon={Coins} title="Pay Cash Ransom" desc="Deliver dirty cash drop immediately." rewardText={cedi(ev.ransom_dirty || 5000) + " Dirty"} />
              <ChoiceButton id="pay_ransom_clean" onClick={handleChoice} icon={Coins} title="Diplomatic Tribute" desc="Official payment to broker. Protects morale." rewardText={cedi(ev.ransom_clean || 2000) + " Clean"} />
              <ChoiceButton id="police_tip" onClick={handleChoice} icon={Siren} title="Anonymous SWAT Tip" desc="Leak hideout GPS to CID. Chaos; crew escapes." rewardText="Police Intervention" />
            </>
          )}
          {isAmbush && (
            <>
              <ChoiceButton id="fight" onClick={handleChoice} icon={Crosshair} title="Return Fire" desc="Engage gunmen. Victor seizes loot." rewardText="Combat Skirmish" />
              <ChoiceButton id="bribe" onClick={handleChoice} icon={Coins} title="Bribe Corner Patrol" desc="Pay off roadblocks to bypass." rewardText={cedi(ev.bribe_cost || 3000) + " Dirty"} />
              <ChoiceButton id="bribe_clean" onClick={handleChoice} icon={Coins} title="Diplomatic Passage" desc="Present credentials to bypass." rewardText={cedi(1500) + " Clean"} />
              <ChoiceButton id="evade" onClick={handleChoice} icon={Radio} title="Smoke Screen Evade" desc="Smoke and back-alley escape." rewardText="Evasion" />
            </>
          )}
          {!isRivalWar && !isKidnap && !isAmbush && (
            <div className="space-y-2">
              <ChoiceButton id="payoff_dirty" onClick={handleChoice} icon={Coins} title="Pay Off Dirty" desc="Pay demand from street cash. Defuses grudge." rewardText={cedi(ev.ransom_dirty || ev.bribe_cost || 4000) + " Dirty"} />
              <ChoiceButton id="payoff_clean" onClick={handleChoice} icon={Coins} title="Diplomatic Settlement" desc="Send clean payment. Builds relationship." rewardText={cedi(ev.ransom_clean || 1500) + " Clean"} />
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 pt-1" data-testid="archrival-universal">
            {[
              { id: "snitch", label: "Snitch", icon: Siren, cls: "border-sky-500/60 text-sky-300", hint: "Tip police. Heat −10, grudge +15." },
              { id: "ignore", label: "Ignore", icon: Eye, cls: "border-zinc-600 text-zinc-300", hint: "Take hit. Respect −0.1." },
              { id: "attack", label: "Attack", icon: Swords, cls: "border-blood text-red-300", hint: "Fight. Win: loot. Lose: injuries." },
            ].map((c) => (
              <button key={c.id} disabled={resolving} onClick={() => handleChoice(c.id)} data-testid={`archrival-choice-${c.id}`}
                className={`btn-press flex min-h-[44px] flex-col items-center gap-1 rounded border bg-surface p-2 text-center disabled:opacity-40 ${c.cls}`}>
                <c.icon className="h-4 w-4" />
                <span className="font-display text-sm uppercase">{c.label}</span>
                <span className="text-[9.5px] leading-tight text-zinc-500">{c.hint}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
