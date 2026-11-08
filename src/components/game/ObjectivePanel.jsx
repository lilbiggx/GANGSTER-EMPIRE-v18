import { useState } from "react";
import { CheckCircle2, Circle, ChevronRight, HelpCircle, AlertTriangle, RotateCcw } from "lucide-react";
import { useGame } from "../../store/game";
import { cedi } from "../../lib/fmt";
import { ClaimFirstBusiness } from "./LandSlots";

const STEPS = [
  { id: "claim", label: "Claim your first business – FREE (land + Okada)", done: (p) => !!p.first_business_claimed, tab: "empire" },
  { id: "tap", label: "Tap HUSTLE for your first dirty street cedis", done: (p) => Number(p.lifetime || 0) >= 150, tab: "empire" },
  { id: "manager", label: "Assign an available crew manager to automate hustle collection", done: (p) => Object.values(p.hustle_managers || {}).some((arr) => arr.length > 0) || Object.keys(p.hustle_assign || {}).length > 0, tab: "empire" },
  { id: "launder", label: "Launder dirty cash into clean cedis (Fronts or Syndicate)", done: (p) => Number(p.clean || 0) > 0 || (p.batches || []).length > 0, tab: "empire" },
  { id: "land", label: "Buy a 2nd land plot with clean cash", done: (p) => (p.player_plots || []).filter((x) => x.isUnlocked).length >= 2, tab: "empire" },
  { id: "build", label: "Slot or build a hustle on land plot 2 using idle crew", done: (p) => (p.player_plots || []).filter((x) => x.isUnlocked && (x.hustleID || x.building)).length >= 2, tab: "empire" },
  { id: "crew", label: "Hire a fresh crew recruit (Market → Crew Agency)", done: (p) => (p.crew || []).filter((c) => !c.merc).length >= 3, tab: "market" },
  { id: "heist", label: "Run your first crew heist", done: (p) => (p.heists || []).length > 0 || (p.log || []).some((l) => /Clean job|heist/i.test(l.msg)) || p.level >= 6, tab: "heists" },
  { id: "rival", label: "Wash cash with 1 of 3 active daily rival syndicates", done: (p) => Object.keys(p.rival_launder_day?.used || {}).length > 0, more: "rivals" },
  { id: "vault", label: "Fortify the Compound Vault (More → Skills → Compound)", done: (p) => (p.upgrades?.vault || 0) >= 1, more: "skills" },
];

export function nextAction(p, d) {
  const exposed = Math.max(0, Number(p.dirty) - Number(d.vault_cap));
  if (!p.first_business_claimed) return { tone: "good", text: "Claim your first business – FREE: a land plot plus an Okada hustle. Empire → Street Hustles.", tab: "empire" };
  if (p.raid) return { tone: "danger", text: "Raid incoming! Open the red banner: fortify or put crew on defence." };
  if (p.heat >= 60) return { tone: "danger", text: `Heat is ${Math.round(p.heat)}/100. Laundering costs ${Math.round(d.fee * 100)}% now. Bribe, lie low or use a burner.` };
  if (p.heists.some((h) => h.end <= Date.now() / 1000)) return { tone: "good", text: "A heist is finished. Go to Heists and see what happened.", tab: "heists" };
  if (p.batches.some((b) => b.end <= Date.now() / 1000)) return { tone: "good", text: "Clean cedis are ready. Collect your laundering batch." };
  if ((p.farm?.plots || []).some((x) => x.strain && x.end <= Date.now() / 1000)) return { tone: "good", text: "Your farm is ready to harvest. Cut it and sell the stash.", more: "farm" };
  if (exposed > Number(d.vault_cap) * 2 && Object.keys(p.fronts).length) return { tone: "warn", text: `${cedi(exposed)} is outside your vault. Raids can take 20–35% of it. Launder it or upgrade the vault.` };
  if (!p.daily.login_claimed) return { tone: "good", text: "Claim today's streak reward (More → Daily).", more: "daily" };
  const step = STEPS.find((s) => !s.done(p));
  if (step) return { tone: "info", text: step.label, tab: step.tab, more: step.more };
  return { tone: "info", text: "Expand: grow fronts, hit rivals, climb the season board, then retire to the village at level 20." };
}

const TONE = { danger: "border-blood bg-blood/10 text-blood", warn: "border-orange-400 bg-orange-400/10 text-orange-300", good: "border-kgreen bg-kgreen/10 text-kgreen", info: "border-gold bg-gold/5 text-gold" };

export default function ObjectivePanel() {
  const { player: p, derived: d, setTab, openMore } = useGame();
  const [help, setHelp] = useState(false);
  const [open, setOpen] = useState(localStorage.getItem("uw_tut_hide") !== "1");
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [minimized, setMinimized] = useState(localStorage.getItem("uw_obj_min") === "1");
  const na = nextAction(p, d);
  const doneCount = STEPS.filter((s) => s.done(p)).length;
  const go = () => (na.more ? openMore(na.more) : na.tab && setTab(na.tab));
  const helpBtn = <button onClick={() => setHelp(!help)} className="flex items-center gap-1 text-[11px] font-bold text-zinc-400 hover:text-gold" data-testid="money-help-btn"><HelpCircle className="h-4 w-4" />How money works</button>;
  return (
    <div className="mt-3 grid gap-2" data-testid="objective-panel">
      {!p.first_business_claimed && <ClaimFirstBusiness compact />}
      
      <div className="flex items-center justify-between px-1">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Syndicate Objectives</div>
        <button 
          onClick={() => { setMinimized(!minimized); localStorage.setItem("uw_obj_min", !minimized ? "1" : "0"); }}
          className="text-[10px] font-bold uppercase text-gold hover:underline flex items-center gap-1"
          data-testid="minimize-objectives-btn"
        >
          {minimized ? "Show Objectives" : "Collapse"}
        </button>
      </div>

      {!minimized && (
        <>
          <button onClick={go} className={`btn-press flex min-h-[52px] items-center gap-2 border-l-4 border px-3 py-2 text-left ${TONE[na.tone]}`} data-testid="next-action">
            {na.tone === "danger" || na.tone === "warn" ? <AlertTriangle className="h-5 w-5 shrink-0" /> : <ChevronRight className="h-5 w-5 shrink-0" />}
            <div className="min-w-0">
              <div className="text-[9px] font-extrabold uppercase tracking-[0.25em] opacity-80">Next best move</div>
              <div className="text-sm font-bold leading-snug text-zinc-100" data-testid="next-action-text">{na.text}</div>
            </div>
          </button>
          {doneCount < STEPS.length || showAllSteps ? (
            <div className="border border-zinc-800 bg-surface p-3" data-testid="tutorial-tracker">
              <div className="flex items-center justify-between">
                <button onClick={() => { setOpen(!open); localStorage.setItem("uw_tut_hide", open ? "1" : "0"); }} className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-300" data-testid="tutorial-toggle">
                  Street Lessons · {doneCount}/{STEPS.length} {open ? "▾" : "▸"}
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowAllSteps(!showAllSteps)}
                    className="flex items-center gap-1 text-[10px] font-semibold text-zinc-400 hover:text-sky-300"
                    title="Review all completed or active lessons"
                    data-testid="redo-tutorial-btn"
                  >
                    <RotateCcw className="h-3 w-3" />
                    {showAllSteps ? "Compact" : "Redo Lessons"}
                  </button>
                  {helpBtn}
                </div>
              </div>
              {open && (
                <ul className="mt-2 grid gap-1">
                  {STEPS.map((s) => {
                    const done = s.done(p);
                    return (
                      <li
                        key={s.id}
                        onClick={() => (s.more ? openMore(s.more) : s.tab && setTab(s.tab))}
                        className={`flex items-center gap-2 text-xs cursor-pointer hover:text-gold transition-colors ${done ? "text-zinc-500 line-through" : "text-zinc-200"}`}
                        data-testid={`tutorial-step-${s.id}`}
                      >
                        {done ? <CheckCircle2 className="h-4 w-4 text-kgreen shrink-0" /> : <Circle className="h-4 w-4 text-zinc-600 shrink-0" />}
                        <span>{s.label}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between px-1">
              <button
                onClick={() => setShowAllSteps(true)}
                className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 hover:text-sky-300"
                data-testid="reopen-tutorial-btn"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Redo Tutorial Lessons
              </button>
              {helpBtn}
            </div>
          )}
        </>
      )}
      
      {help && (
        <div className="grid gap-1.5 border border-zinc-800 bg-ink p-3 text-xs text-zinc-300" data-testid="money-help">
          <p><b className="text-gold">Dirty cedis</b> come from street hustles, raids, fights and heists. Spend them on crew payroll, guns, gear, bribes, repairs and bets. Raids can steal the part outside your vault.</p>
          <p><b className="text-kgreen">Clean cedis</b> come from laundering and your fronts' declared income. They are safe from raids and are the only cash that buys assets: land, street hustles, fronts, mansion upgrades and clothes.</p>
          <p><b className="text-zinc-100">Land</b>: every street hustle runs on its own land plot. Your first land + hustle is FREE; more land costs clean cash and gets pricier.</p>
          <p><b className="text-blood">Heat</b> rises with every collection, heist and rival hit. Higher heat = bigger laundering fee (10% → 30%) and more raids. It cools by itself over time.</p>
          <p><b className="text-zinc-100">Vault</b> protects {cedi(d.vault_cap)} of dirty cash. Anything above that is exposed.</p>
        </div>
      )}
    </div>
  );
}
