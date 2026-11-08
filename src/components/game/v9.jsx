// v9 shared UI bits: notification badges, icon buttons with tooltips, condition strips, tap-to-expand.
import { useState } from "react";
import { ShieldCheck, Shield, AlertTriangle, OctagonX, Wrench, Sparkles, ChevronDown, Info, Coins } from "lucide-react";
import { cedi, dur, big } from "../../lib/fmt";

/** Red badge. n>0 shows a count, dot shows a plain dot. Renders nothing when there's nothing to say. */
export function Badge({ n = 0, dot = false, className = "", testid }) {
  if (!dot && !(n > 0)) return null;
  return (
    <span
      data-testid={testid}
      aria-label={dot ? "New" : `${n} new`}
      className={`pointer-events-none absolute -right-1 -top-1 z-10 flex items-center justify-center rounded-full bg-blood text-[9px] font-black leading-4 text-white shadow ring-2 ring-ink ${dot ? "h-2.5 w-2.5" : "h-4 min-w-[16px] px-1"} ${className}`}
    >
      {dot ? "" : n > 99 ? "99+" : n}
    </span>
  );
}

const IB_VARIANT = {
  gold: "border-gold bg-gold text-ink",
  green: "border-kgreen bg-kgreen text-ink",
  red: "border-blood bg-blood text-white",
  ghost: "border-zinc-700 bg-transparent text-zinc-200 hover:border-gold hover:text-gold",
};

/** Compact icon button. `label` is the tooltip + aria-label; `children` is an optional short value. */
export function IconBtn({ icon: Icon, label, variant = "ghost", className = "", children, badge, ...props }) {
  const contrastClass = variant === "green" || variant === "gold" ? "[&_*]:!text-ink" : "";
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={`btn-press relative inline-flex items-center justify-center gap-1 border px-2 py-1.5 text-[11px] font-extrabold tracking-wide disabled:cursor-not-allowed disabled:opacity-40 ${IB_VARIANT[variant]} ${contrastClass} ${className}`}
      {...props}
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
      {children}
      {badge}
    </button>
  );
}

export const TIER_META = {
  pristine: { label: "Pristine", icon: ShieldCheck, cls: "text-kgreen border-kgreen/40 bg-kgreen/10", bar: "bg-kgreen", note: "+15% output" },
  operational: { label: "Operational", icon: Shield, cls: "text-gold border-gold/40 bg-gold/10", bar: "bg-gold", note: "normal output" },
  worn: { label: "Worn", icon: AlertTriangle, cls: "text-orange-400 border-orange-400/40 bg-orange-400/10", bar: "bg-orange-400", note: "half output" },
  critical: { label: "Critical", icon: OctagonX, cls: "text-blood border-blood/40 bg-blood/10", bar: "bg-blood", note: "shut down" },
};

export function TierChip({ state = "pristine", cond = 100, testid }) {
  const m = TIER_META[state] || TIER_META.pristine;
  const I = m.icon;
  return (
    <span
      data-testid={testid}
      title={`${m.label} (${Math.floor(cond)}%): ${m.note}. Pristine 85%+ · Operational 50–84% · Worn 25–49% · Critical <25%`}
      className={`inline-flex items-center gap-0.5 rounded border px-1 text-[9px] font-black uppercase ${m.cls}`}
    >
      <I className="h-3 w-3" />
      {Math.floor(cond)}%
    </span>
  );
}

/**
 * One-line condition strip used by all three maintenance systems.
 * kind: "hustle" | "front" | "facility"; repair: {quick_dirty, quick_clean, overhaul_dirty, overhaul_clean}
 */
export function ConditionStrip({ kind, id, cond = 100, state, repair = {}, managed, rateText, dirty, clean, onQuick, onOverhaul, quickTestid, overhaulTestid }) {
  const m = TIER_META[state] || TIER_META.pristine;
  const canQuick = dirty >= big(repair.quick_dirty || 0) && clean >= big(repair.quick_clean || 0);
  const canOver = dirty >= big(repair.overhaul_dirty || 0) && clean >= big(repair.overhaul_clean || 0);
  const full = cond >= 100;
  const overLabel = `Full Overhaul to 100%: ${cedi(repair.overhaul_dirty || 0)} dirty${repair.overhaul_clean ? ` + ${cedi(repair.overhaul_clean)} clean` : ""}`;
  return (
    <div className="mt-2 flex items-center gap-1.5" data-testid={`${kind}-condition-${id}`}>
      <TierChip state={state} cond={cond} testid={`${kind}-tier-${id}`} />
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-900" title={rateText || (managed ? "Crew stationed: no wear, auto-repairing" : "Wearing down over time")}>
        <div className={`h-full ${m.bar} transition-[width] duration-1000`} style={{ width: `${Math.max(0, Math.min(100, cond))}%` }} />
      </div>
      <span className={`text-[9px] font-mono ${managed ? "text-kgreen" : "text-zinc-500"}`} title={rateText}>
        {managed ? "▲" : "▼"}
      </span>
      <IconBtn
        icon={Wrench}
        label={`Quick Service (+35%): ${cedi(repair.quick_dirty || 0)} dirty`}
        variant="gold"
        disabled={full || !canQuick}
        onClick={onQuick}
        data-testid={quickTestid || `${kind}-repair-quick-${id}`}
        className="px-1.5 py-1"
      >
        <Coins className="h-2.5 w-2.5" />
      </IconBtn>
      <IconBtn
        icon={Sparkles}
        label={overLabel}
        variant="green"
        disabled={full || !canOver}
        onClick={onOverhaul}
        data-testid={overhaulTestid || `${kind}-repair-overhaul-${id}`}
        className="px-1.5 py-1"
      >
        <Coins className="h-2.5 w-2.5" />
      </IconBtn>
    </div>
  );
}

/** Tap-to-expand details block: keeps cards compact without losing information. */
export function Details({ children, label = "Details", testid }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-1.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? `Hide ${label}` : `Show ${label}`}
        title={open ? `Hide ${label}` : `Show ${label}`}
        data-testid={testid}
        className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-zinc-500 hover:text-gold"
      >
        <Info className="h-3 w-3" />
        {label}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="mt-1 space-y-1 rounded border border-zinc-800/80 bg-zinc-950/60 p-1.5 text-[10px] text-zinc-400">{children}</div>}
    </div>
  );
}

/** "Ready" or a live countdown. */
export const cdText = (left) => (left > 0 ? dur(left) : "Ready");

const PORTRAIT_BASE = (import.meta.env?.BASE_URL || "/").replace(/\/$/, "");
/** Static PNG portrait rendered from the character GLBs (fast for lists). */
export function Portrait({ gender = "male", size = 48, className = "", testid, title }) {
  const g = gender === "female" ? "female" : "male";
  return (
    <span
      className={`relative inline-flex shrink-0 items-end justify-center overflow-hidden rounded border border-zinc-800 bg-gradient-to-b from-zinc-800 to-ink ${className}`}
      style={{ width: size, height: size }}
      data-testid={testid}
      title={title}
    >
      <img src={`${PORTRAIT_BASE}/portraits/${g}.png`} alt={`${g} portrait`} width={size} height={size} loading="lazy" draggable={false} className="h-full w-full object-cover" />
    </span>
  );
}
