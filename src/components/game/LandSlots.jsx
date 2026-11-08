// v9 LAND: the Street Hustles section is a row of 8 land plots. Locked land -> buy it with clean cash -> start a
// street hustle on it -> the hustle runs with all its normal functions (levels, income, managers, wear, perks).
// The first land + first hustle are a one-time FREE claim. One price table: the street hustles (engine hustleCost).
import { useState } from "react";
import { Lock, Plus, Gift, MapPin, Bike, Smartphone, Shirt, Fuel, Package, Coins, Home, Ship, Building2, Hammer, Edit3, Clock, Users, CheckCircle2, Trash2 } from "lucide-react";
import { useGame } from "../../store/game";
import { useNow } from "../../hooks/useNow";
import { cedi, fmt, dur, big } from "../../lib/fmt";
import { getRushHustleFee } from "../../lib/valueOverrides";
import { IconBtn, Badge } from "./v9";
import BottomSheet from "./BottomSheet";
import { MiniAvatar } from "../../lib/gear";
import { Btn } from "./ui";
import { useConfirm } from "../../components/game/ConfirmContext";
import { accruedPlot } from "../../engine/gameEngine";

const HUSTLE_ICONS = { okada: Bike, phones: Smartphone, jerseys: Shirt, fuel: Fuel, container: Package, gold: Coins, estate: Home, port_cartel: Ship };
export const HUSTLE_COLORS = { okada: "#f5c518", phones: "#38bdf8", jerseys: "#a78bfa", fuel: "#f97316", container: "#22c55e", gold: "#eab308", estate: "#f472b6", port_cartel: "#60a5fa" };
export const HustleIcon = ({ hid, className }) => {
  const I = HUSTLE_ICONS[hid] || Building2;
  return <I className={className} />;
};

export function HustlePicker({ land, onClose }) {
  const { player: p, derived: d, config, act } = useGame();
  const now = useNow(1000);
  const clean = big(p.clean);

  const currentPlot = (p.player_plots || []).find((pl) => pl.plotID === land);
  const isUpdating = Boolean(currentPlot?.hustleID);
  const currentHustle = currentPlot?.hustleID ? (config.hustles || []).find((h) => h.id === currentPlot.hustleID) : null;

  // Available crew: unassigned, not a mercenary, not kidnapped, not injured, not on a heist
  // If changing this plot, crew members currently assigned as managers to this plot's hustle are also available builders!
  const availableCrew = (p.crew || []).filter((cr) => {
    if (!cr) return false;
    if (cr.merc) return false;
    if (cr.status === "kidnapped") return false;
    if (cr.injury) return false;
    if (cr.injured_until && cr.injured_until > now) return false;
    if (cr.assign && (cr.assign.startsWith("heist") || cr.assign.startsWith("listed") || cr.assign.startsWith("build:"))) return false;
    if (isUpdating && currentPlot?.hustleID && cr.assign === `hustle:${currentPlot.hustleID}`) return true;
    return !cr.assign;
  });
  const idleCrewCount = availableCrew.length;

  const rows = d?.hustle_catalog || (config.hustles || []).map((h) => ({
    hid: h.id,
    name: h.name,
    income: h.income,
    cost: h.cost,
    owned: false,
    locked: false,
    tier: h.tier || 1,
    build_crew: h.build_crew || 1,
    build_time: h.build_time || 20,
  }));

  return (
    <BottomSheet
      title={isUpdating ? `Update Land ${land + 1}` : `Build on Land ${land + 1}`}
      kicker={isUpdating ? `Reassign or change this plot (currently ${currentHustle?.name || "Hustle"}) · clean cash only` : "Start a street hustle · clean cash only"}
      onClose={onClose}
      testid="land-hustle-sheet"
    >
      {/* Crew representation banner: show only available crew members */}
      <div className="mb-2.5 rounded border border-zinc-800 bg-surface/90 p-2.5">
        <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80 text-[11px]">
          <span className="flex items-center gap-1.5 text-zinc-300 font-bold">
            <Users className="h-3.5 w-3.5 text-gold" />
            <span>Available Crew for {isUpdating ? "Updating" : "Construction"}:</span>
            <b className="text-zinc-100 font-mono text-xs">{idleCrewCount}</b>
          </span>
          <span className="text-[10px] text-zinc-400">Clean Funds: <b className="text-kgreen font-mono text-xs">{cedi(p.clean)}</b></span>
        </div>

        {availableCrew.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {availableCrew.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-1.5 rounded-full border border-emerald-900/60 bg-emerald-950/20 px-2 py-0.5 text-[10px]"
                title={`${c.name} (${c.arch || "Crew"}) - Available to build`}
              >
                <div className="h-4 w-4 shrink-0 overflow-hidden rounded-full ring-1 ring-emerald-500/60 bg-ink">
                  <MiniAvatar look={c.look} size={16} />
                </div>
                <span className="font-bold text-zinc-200">{c.name}</span>
                <span className="text-[9px] uppercase px-1 rounded bg-zinc-800/80 text-zinc-400 font-mono">
                  {c.arch || "crew"}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" title="Ready" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-2 rounded bg-amber-950/20 border border-amber-900/40 p-1.5 text-[10px] text-amber-300 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0 text-amber-400" />
            <span>0 crew members are currently available. Free a manager in the Empire tab or recruit from the Crew tab to proceed.</span>
          </div>
        )}
      </div>

      {isUpdating && (
        <button
          type="button"
          onClick={() => {
            act("remove_hustle_plot", { plot: land });
            onClose();
          }}
          className="btn-press mb-2 flex w-full items-center justify-center gap-1.5 rounded border border-red-900/60 bg-red-950/30 py-2 text-xs font-bold text-red-400 hover:bg-red-900/40 hover:border-red-500 transition-all"
          data-testid={`sheet-remove-hustle-${land}`}
        >
          <Trash2 className="h-3.5 w-3.5" /> Remove {currentHustle?.name || "Hustle"} & Free Land {land + 1}
        </button>
      )}

      <div className="grid min-w-0 grid-cols-1 gap-1 max-h-[55vh] overflow-y-auto pr-0.5" data-testid="land-hustle-list">
        {rows.map((c) => {
          const afford = clean >= big(c.cost);
          const reqCrew = c.build_crew || 1;
          const hasCrew = idleCrewCount >= reqCrew;
          const disabled = c.locked || !afford || !hasCrew;
          const assignedCrew = availableCrew.slice(0, reqCrew);
          const state = c.locked
            ? "Locked"
            : !afford
            ? "Needs clean cash"
            : !hasCrew
            ? `Needs ${reqCrew} available crew`
            : isUpdating
            ? "Update Slot"
            : "Affordable";

          return (
            <button
              key={c.hid}
              type="button"
              disabled={disabled}
              onClick={() => {
                act("buy_hustle", {
                  hid: c.hid,
                  plot: land,
                  crew_ids: assignedCrew.map((cr) => cr.id),
                });
                onClose();
              }}
              data-testid={`land-pick-${c.hid}`}
              title={c.locked ? `Locked: ${c.lock_label}` : `${c.name}: ${cedi(c.cost)} clean, +${fmt(c.income)}/min dirty`}
              className="btn-press flex min-h-[50px] w-full min-w-0 items-center gap-2 rounded border border-zinc-800 bg-ink/60 px-2.5 py-1.5 text-left enabled:hover:border-gold disabled:cursor-not-allowed disabled:opacity-60 transition-all"
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded border border-zinc-700 ${disabled ? "opacity-50" : ""}`} style={{ color: HUSTLE_COLORS[c.hid] }}>
                {c.locked ? <Lock className="h-4 w-4 text-zinc-500" /> : <HustleIcon hid={c.hid} className="h-4 w-4" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block truncate text-xs font-bold ${disabled ? "text-zinc-400" : "text-zinc-100"}`}>{c.name}</span>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="font-mono text-gold font-bold">+{fmt(c.income)}/min dirty</span>
                  <span className="text-zinc-500">·</span>
                  <span className="text-zinc-400">T{c.tier || 1} · {reqCrew} Crew · {dur(c.build_time || 20)}</span>
                </div>
              </span>
              <span className="shrink-0 text-right font-mono text-[10px] leading-tight">
                <span className={`flex items-center gap-1 font-bold ${afford ? "text-kgreen" : "text-zinc-400"}`} data-testid={`land-price-${c.hid}`}>
                  <Coins className="h-2.5 w-2.5" />
                  {cedi(c.cost)}
                </span>
                <span className={`block text-[9px] font-bold uppercase ${!afford || !hasCrew ? "text-blood" : "text-kgreen"}`} data-testid={`land-state-${c.hid}`}>
                  {state}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="px-1 pt-2 text-[10px] text-zinc-500">
        Clean cash funds initial hustle setup. Multiple plots can run the same hustle to scale your empire. Building requires available crew members and time.
      </p>
    </BottomSheet>
  );
}

/** Big one-time CTA: free first land + free first hustle. Also used by onboarding. */
export function ClaimFirstBusiness({ compact = false }) {
  const { derived: d, act } = useGame();
  if (d?.first_business_claimed) return null;
  return (
    <button
      type="button"
      onClick={() => act("claim_first_business")}
      data-testid={compact ? "claim-first-business-onboarding" : "claim-first-business-btn"}
      className="btn-press relative flex min-h-[56px] w-full min-w-0 items-center gap-3 rounded border-2 border-kgreen bg-kgreen/10 px-3 py-2 text-left text-kgreen"
    >
      <Gift className="h-6 w-6 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block font-display text-base uppercase leading-tight">Claim your first business – FREE</span>
        <span className="block text-[11px] text-zinc-300">Land plot 1 + Okada Parcel Runs. No cash needed.</span>
      </span>
      {!compact && <Badge n={1} testid="badge-land-claim" />}
    </button>
  );
}

/** Component rendered when a land plot is under construction */
function ConstructionTile({ pl }) {
  const { player: p, config, act } = useGame();
  const now = useNow(1000);
  const building = pl.building;
  const h = (config.hustles || []).find((x) => x.id === building.hid) || { name: building.hid, tier: 1 };
  const timeLeft = Math.max(0, building.end - now);
  const isDone = timeLeft <= 0;
  const duration = Math.max(1, building.end - building.start);
  const progressPct = Math.min(100, Math.round(((now - building.start) / duration) * 100));
  const builders = (p.crew || []).filter((c) => (building.crew_ids || []).includes(c.id));
  const rushFee = getRushHustleFee();

  return (
    <div className="rounded border border-amber-500/60 bg-amber-950/20 p-2.5 space-y-2" data-testid={`land-building-${pl.plotID}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hammer className="h-4 w-4 text-gold animate-bounce" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gold">Under Construction · Land {pl.plotID + 1}</div>
            <div className="font-display text-sm text-zinc-100">{h.name} (Tier {h.tier || 1})</div>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-xs font-mono font-bold ${isDone ? "text-kgreen" : "text-gold"}`}>
            {isDone ? "READY" : dur(timeLeft)}
          </span>
          <div className="text-[9px] text-zinc-400 font-mono">{progressPct}%</div>
        </div>
      </div>

      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-gold transition-all duration-300" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="flex items-center justify-between text-[10px] text-zinc-400">
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3 text-zinc-400" />
          Builders: <b className="text-zinc-200">{builders.map((c) => c.name).join(", ") || `${building.crew_ids?.length || 1} Enforcers`}</b>
        </span>
        {isDone ? (
          <button
            type="button"
            onClick={() => act("complete_hustle_build", { plot: pl.plotID })}
            className="px-2.5 py-1 rounded bg-kgreen text-zinc-950 font-bold hover:brightness-110 font-mono text-[11px] uppercase tracking-wide"
            data-testid={`complete-build-${pl.plotID}`}
          >
            Open Hustle
          </button>
        ) : (
          <button
            type="button"
            onClick={() => act("rush_hustle_build", { plot: pl.plotID })}
            className="flex items-center gap-1 px-2 py-0.5 rounded border border-kgreen/60 text-kgreen hover:bg-kgreen/10 font-mono text-[10px]"
            data-testid={`rush-build-${pl.plotID}`}
          >
            <Coins className="h-3 w-3" />
            Rush (<span className="font-bold">{cedi(rushFee)}</span> clean)
          </button>
        )}
      </div>
    </div>
  );
}

/** One land slot that is not running a hustle: locked, buyable, or empty (start a hustle). */
function LandTile({ pl, isNext, onStart }) {
  const { player: p, derived: d, act } = useGame();
  const clean = big(p.clean);
  const claimed = !!d?.first_business_claimed;
  const n = pl.plotID + 1;
  if (pl.isUnlocked) {
    const canStart = (d?.badges?.land?.start || 0) > 0;
    return (
      <div className="flex min-h-[52px] min-w-0 items-center gap-2 rounded border border-dashed border-gold/50 bg-gold/5 px-2 py-1.5" data-testid={`land-slot-${pl.plotID}`} data-state="empty">
        <MapPin className="h-4 w-4 shrink-0 text-gold" />
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-bold text-zinc-100">{pl.streetName || `Land ${n}`} · empty</span>
          <span className="block text-[10px] text-zinc-400">Start any street hustle you can afford (clean cash)</span>
        </span>
        <IconBtn icon={Plus} label={`Start a hustle on land ${n}`} variant="gold" onClick={() => onStart(pl.plotID)} data-testid={`land-start-${pl.plotID}`} className="min-h-[44px] shrink-0 px-2 text-[11px]" badge={canStart ? <Badge dot /> : null}>
          Start hustle
        </IconBtn>
      </div>
    );
  }
  const fee = Number(pl.plotUnlockFee || 0);
  const afford = clean >= big(fee);
  const buyable = claimed && isNext;
  return (
    <div className={`flex min-h-[44px] min-w-0 items-center gap-2 rounded border border-zinc-800 px-2 py-1 ${buyable ? "bg-surface" : "bg-ink/40 opacity-70"}`} data-testid={`land-slot-${pl.plotID}`} data-state="locked">
      <Lock className="h-4 w-4 shrink-0 text-zinc-500" />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-bold text-zinc-300">{pl.streetName || `Land ${n}`} · locked</span>
        <span className="block font-mono text-[10px] text-kgreen font-bold" data-testid={`land-fee-${pl.plotID}`}>{cedi(fee)} clean</span>
      </span>
      {buyable ? (
        <IconBtn
          icon={Coins}
          label={afford ? `Buy land ${n} for ${cedi(fee)} clean` : `Needs clean cash: ${cedi(fee)} clean (launder dirty cash first)`}
          variant={afford ? "green" : "ghost"}
          disabled={!afford}
          onClick={() => act("land_buy", { plot: pl.plotID })}
          data-testid={`land-buy-${pl.plotID}`}
          className="min-h-[44px] shrink-0 px-2 text-[11px]"
          badge={afford && (d?.badges?.land?.buy || 0) ? <Badge dot /> : null}
        >
          {afford ? `Buy ${cedi(fee)}` : "Needs clean cash"}
        </IconBtn>
      ) : (
        <span className="shrink-0 text-[10px] text-zinc-500">{claimed ? `Buy land ${pl.plotID} first` : "Claim free first"}</span>
      )}
    </div>
  );
}

/** Renders the 8 land slots in order; occupied land renders the hustle card via renderHustle(hid, landNo, plotID, streetName). */
export function EditPlotModal({ plotIdx, current, originalName, onClose, onSave }) {
  const [name, setName] = useState(current.customName || "");
  
  return (
    <BottomSheet title="Customize Plot" onClose={onClose}>
        <div className="p-4 space-y-4">
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={originalName} className="w-full bg-surface border border-zinc-800 p-2 text-sm text-white" />
            <Btn variant="gold" onClick={() => onSave(plotIdx, { customName: name })} className="w-full">Save</Btn>
        </div>
    </BottomSheet>
  );
}

export default function LandSlots({ renderHustle }) {
  const { player: p, derived: d, config, act } = useGame();
  const { confirmAction } = useConfirm();
  const now = useNow(1000);
  const [picker, setPicker] = useState(null);
  const [editPlot, setEditPlot] = useState(null);
  const land = d?.land || [];
  const next = land.find((x) => !x.isUnlocked);
  const owned = land.filter((x) => x.isUnlocked).length;

  const handleSaveCustomization = (plotIdx, { customName }) => {
    act("customize_plot", { plotIdx, customName });
    const newPlots = land.map(pl => {
        if (pl.plotID === plotIdx) return { ...pl, customName };
        return pl;
    });
    act("update_land_plots", { plots: newPlots });
    setEditPlot(null);
  };

  return (
    <div className="grid min-w-0 gap-2" data-testid="land-slots">
      <div className="flex items-center justify-between text-[10px] text-zinc-500" data-testid="land-summary">
        <span>Land owned {owned}/{land.length || 8} · editable modular plots</span>
        {next && d?.first_business_claimed && (
          <span>Next land <b className="text-kgreen font-mono">{cedi(next.plotUnlockFee)}</b> clean</span>
        )}
      </div>
      {!d?.first_business_claimed && <ClaimFirstBusiness />}
      {land.map((pl) => {
        if (pl.building) {
          return <ConstructionTile key={pl.plotID} pl={pl} />;
        }
        if (pl.hustleID) {
          const hustleObj = (config.hustles || []).find((h) => h.id === pl.hustleID);
          return (
            <div key={pl.plotID} data-testid={`land-slot-${pl.plotID}`} data-state="hustle" className="min-w-0 space-y-1">
              <div className="flex items-center justify-between px-1 text-[10px]">
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                  <span className="text-zinc-300 font-bold">{pl.streetName || `Land ${pl.plotID + 1}`}</span>
                  <span className="text-zinc-500">·</span>
                  <span className="text-zinc-400">Price: <b className="text-kgreen font-mono font-bold">{cedi(hustleObj?.cost || 0)}</b> clean</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => confirmAction("Change Hustle?", "Are you sure you want to change this hustle?", () => setPicker(pl.plotID))}
                    disabled={!!pl.building}
                    className="flex items-center gap-1 font-bold text-sky-400 hover:text-sky-300 transition-colors border border-sky-900/60 bg-sky-950/30 px-2 py-0.5 rounded text-[10px] disabled:opacity-30 disabled:cursor-not-allowed"
                    data-testid={`edit-hustle-slot-${pl.plotID}`}
                  >
                    <Edit3 className="h-3 w-3" /> Change Hustle
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditPlot(pl.plotID)}
                    className="flex items-center gap-1 font-bold text-gold hover:text-gold/80 transition-colors border border-gold-900/60 bg-gold-950/30 px-2 py-0.5 rounded text-[10px]"
                    title="Customize plot and business"
                    data-testid={`customize-plot-${pl.plotID}`}
                  >
                    <Edit3 className="h-3 w-3" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmAction("Remove Hustle?", `Are you sure you want to remove ${hustleObj?.name || "hustle"} and clear the plot?`, () => act("remove_hustle_plot", { plot: pl.plotID }))}
                    disabled={!!pl.building}
                    className="flex items-center gap-1 font-bold text-red-400 hover:text-red-300 transition-colors border border-red-900/60 bg-red-950/30 px-2 py-0.5 rounded text-[10px] disabled:opacity-30 disabled:cursor-not-allowed"
                    data-testid={`remove-hustle-btn-${pl.plotID}`}
                  >
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>
              </div>
              {renderHustle(pl.hustleID, pl.plotID + 1, pl.plotID, pl.streetName, { customName: pl.customName })}
            </div>
          );
        }
        return <LandTile key={pl.plotID} pl={pl} isNext={next?.plotID === pl.plotID} onStart={setPicker} />;
      })}
      {picker !== null && <HustlePicker land={picker} onClose={() => setPicker(null)} />}
      {editPlot !== null && (
          <EditPlotModal 
            plotIdx={editPlot} 
            current={land[editPlot]} 
            originalName={(config.hustles || []).find(h => h.id === land[editPlot].hustleID)?.name}
            onClose={() => setEditPlot(null)} 
            onSave={handleSaveCustomization} 
          />
      )}
    </div>
  );
}
