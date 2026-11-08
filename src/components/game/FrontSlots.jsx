import { useState } from "react";
import { Plus, MapPin, Building2, Droplets, Clock, Scale, Coins, Edit3, Trash2, Users, CheckCircle2 } from "lucide-react";
import { useGame } from "../../store/game";
import { useNow } from "../../hooks/useNow";
import { cedi, fmt, dur, big } from "../../lib/fmt";
import BottomSheet from "./BottomSheet";
import { MiniAvatar } from "../../lib/gear";
import { useConfirm } from "../../components/game/ConfirmContext";

export const GHANA_COMMERCIAL_LOCATIONS = [
  "Commercial Plot 1: Oxford Street (Osu)",
  "Commercial Plot 2: East Legon Strip",
];

export function FrontPicker({ plot, onClose, onSelectFront }) {
  const { player: p, derived: d, config, act } = useGame();
  const now = useNow(1000);

  const availableCrew = (p.crew || []).filter((cr) => {
    if (!cr || cr.merc || cr.status === "kidnapped" || cr.injury) return false;
    if (cr.injured_until && cr.injured_until > now) return false;
    if (cr.assign && (cr.assign.startsWith("heist") || cr.assign.startsWith("listed") || cr.assign.startsWith("build:"))) return false;
    return !cr.assign;
  });

  const locationName = GHANA_COMMERCIAL_LOCATIONS[plot] || `Commercial Plot ${plot + 1}`;

  return (
    <BottomSheet
      title={`Commercial Plot ${plot + 1}: ${locationName}`}
      kicker="Establish or change money laundering front business · clean cash only"
      onClose={onClose}
      testid="front-picker-sheet"
    >
      {/* Available Crew Status */}
      <div className="mb-3 rounded border border-zinc-800 bg-surface/90 p-2.5">
        <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80 text-[11px]">
          <span className="flex items-center gap-1.5 text-zinc-300 font-bold">
            <Users className="h-3.5 w-3.5 text-gold" />
            <span>Available Front Operators:</span>
            <b className="text-zinc-100 font-mono text-xs">{availableCrew.length}</b>
          </span>
          <span className="text-[10px] text-zinc-400">Clean Funds: <b className="text-kgreen font-mono text-xs">{cedi(p.clean)}</b></span>
        </div>

        {availableCrew.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {availableCrew.slice(0, 6).map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-1.5 rounded-full border border-emerald-900/60 bg-emerald-950/20 px-2 py-0.5 text-[10px]"
              >
                <div className="h-4 w-4 shrink-0 overflow-hidden rounded-full ring-1 ring-emerald-500/60 bg-ink">
                  <MiniAvatar look={c.look} size={16} />
                </div>
                <span className="font-bold text-zinc-200">{c.name}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-1.5 text-[9px] text-amber-400 font-mono">
            All crew members currently assigned. Stationing a manager reduces wear and automates repairs.
          </div>
        )}
      </div>

      {/* Front Catalog Grid */}
      <div className="space-y-2">
        {(config.fronts || []).map((f) => {
          const lvl = p.fronts?.[f.id] || 0;
          const fd = d.fronts?.[f.id] || {};
          const cost = fd.cost || f.cost;
          const canAfford = big(p.clean) >= big(cost);

          return (
            <div
              key={f.id}
              className={`p-2.5 rounded border transition-all ${
                lvl > 0
                  ? "border-gold/40 bg-gold/5"
                  : canAfford
                  ? "border-zinc-800 bg-surface hover:border-zinc-700"
                  : "border-zinc-900 bg-black/40 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 font-display text-xs uppercase text-zinc-100 font-bold">
                    <Building2 className="h-3.5 w-3.5 text-gold" />
                    <span>{f.name}</span>
                    {lvl > 0 && <span className="text-[9px] font-mono text-gold px-1 rounded bg-black/50 border border-gold/30">LV{lvl}</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-400 font-mono font-bold">
                    <span className="flex items-center gap-0.5 text-sky-400">
                      <Droplets className="h-3 w-3" /> Max {fmt(fd.cap || f.cap)}
                    </span>
                    <span className="flex items-center gap-0.5 text-zinc-400">
                      <Clock className="h-3 w-3" /> {dur(fd.dur || f.dur)}
                    </span>
                    <span className="flex items-center gap-0.5 text-rose-400">
                      <Scale className="h-3 w-3" /> {Math.round((fd.fee ?? d.fee ?? 0.15) * 100)}% Fee
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectFront(f.id)}
                  disabled={lvl === 0 && !canAfford}
                  className={`btn-press shrink-0 px-3 py-1.5 text-[10px] font-black uppercase rounded border transition-colors ${
                    lvl > 0
                      ? "bg-amber-500/20 border-gold text-gold hover:bg-amber-500/30"
                      : canAfford
                      ? "bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500"
                      : "bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed"
                  }`}
                >
                  {lvl > 0 ? "Assign Front" : `Buy ${fmt(cost)}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </BottomSheet>
  );
}

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

export default function FrontSlots({ renderFront }) {
  const { player: p, derived: d, config, act } = useGame();
  const { confirmAction } = useConfirm();
  const [pickerPlot, setPickerPlot] = useState(null);
  const [editPlot, setEditPlot] = useState(null);

  // Maintain 8 modular commercial plots for Front Businesses
  // Map owned fronts onto plots, preserving any custom plot allocations
  const activeFronts = Object.keys(p.fronts || {}).filter((k) => (p.fronts[k] || 0) > 0);
  
  const plots = GHANA_COMMERCIAL_LOCATIONS.map((loc, idx) => {
    const savedPlot = p.player_front_plots?.[idx];
    const frontId = savedPlot?.frontID !== undefined ? savedPlot.frontID : activeFronts[idx] || null;
    return {
      plotID: idx,
      locationName: loc,
      frontID: frontId,
      customName: savedPlot?.customName,
      customIcon: savedPlot?.customIcon,
    };
  });

  const handleSelectFront = (plotIdx, frontId) => {
    // If front is not yet purchased, purchase it
    const currentLvl = p.fronts?.[frontId] || 0;
    if (currentLvl === 0) {
      act("buy_front", { fid: frontId });
    }
    // Update player front plots, ensuring each front only appears once
    const newPlots = plots.map(pl => {
        if (pl.frontID === frontId) return { ...pl, frontID: null };
        if (pl.plotID === plotIdx) return { ...pl, frontID: frontId };
        return pl;
    });
    act("update_front_plots", { plots: newPlots });
    setPickerPlot(null);
  };

  const handleRemoveFront = (plotIdx) => {
    const newPlots = [...plots];
    newPlots[plotIdx] = { ...newPlots[plotIdx], frontID: null };
    act("update_front_plots", { plots: newPlots });
  };

  const handleSaveCustomization = (plotIdx, { customName }) => {
    const newPlots = [...plots];
    newPlots[plotIdx] = { ...newPlots[plotIdx], customName };
    act("update_front_plots", { plots: newPlots });
    setEditPlot(null);
  };

  const activeCount = plots.filter((pl) => pl.frontID).length;

  return (
    <div className="w-full min-w-0 gap-2.5" data-testid="front-slots">
      <div className="flex items-center justify-between text-[10px] text-zinc-500 px-1 font-mono">
        <span>Commercial plots occupied: <b className="text-zinc-200">{activeCount}/{plots.length}</b> · Editable modular fronts</span>
        <span>Clean laundering network</span>
      </div>

      {plots.map((pl) => {
        const frontObj = pl.frontID ? (config.fronts || []).find((f) => f.id === pl.frontID) : null;

        if (frontObj) {
          return (
            <div key={pl.plotID} className="space-y-1 rounded border border-zinc-800/80 bg-zinc-950/40 p-1.5" data-testid={`front-plot-${pl.plotID}`}>
              {/* Plot Header Bar with Location, Change Front, and Remove buttons */}
              <div className="flex items-center justify-between px-1.5 py-0.5 text-[10px] font-mono">
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                  <MapPin className="h-3 w-3 text-gold shrink-0" />
                  <span className="text-zinc-200 font-bold truncate">{pl.customName || pl.locationName}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => confirmAction("Change Front?", "Are you sure you want to change this front business?", () => setPickerPlot(pl.plotID))}
                    disabled={(p.batches?.some(b => b.front === pl.frontID)) || (d.fronts?.[pl.frontID]?.condition === 100)}
                    className="btn-press flex items-center gap-1 font-bold text-sky-400 hover:text-sky-300 transition-colors border border-sky-900/60 bg-sky-950/30 px-2 py-0.5 rounded text-[9px] disabled:opacity-30 disabled:cursor-not-allowed"
                    title={
                        (p.batches?.some(b => b.front === pl.frontID) ? "Cannot change working business" : "") +
                        (d.fronts?.[pl.frontID]?.condition === 100 ? "Cannot change fixed business" : "")
                    }
                    data-testid={`edit-front-plot-${pl.plotID}`}
                  >
                    <Edit3 className="h-2.5 w-2.5" />
                    <span>Change Front</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditPlot(pl.plotID)}
                    className="btn-press flex items-center gap-1 font-bold text-gold hover:text-gold/80 transition-colors border border-gold-900/60 bg-gold-950/30 px-2 py-0.5 rounded text-[9px]"
                    title="Customize plot and business"
                    data-testid={`customize-plot-${pl.plotID}`}
                  >
                    <Edit3 className="h-2.5 w-2.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmAction("Remove Business?", "Are you sure you want to remove this front business?", () => handleRemoveFront(pl.plotID))}
                    disabled={(p.batches?.some(b => b.front === pl.frontID)) || (d.fronts?.[pl.frontID]?.condition === 100)}
                    className="btn-press flex items-center gap-1 font-bold text-rose-400 hover:text-rose-300 transition-colors border border-red-900/60 bg-red-950/30 px-2 py-0.5 rounded text-[9px] disabled:opacity-30 disabled:cursor-not-allowed"
                    title={
                        (p.batches?.some(b => b.front === pl.frontID) ? "Cannot remove working business" : "") +
                        (d.fronts?.[pl.frontID]?.condition === 100 ? "Cannot remove fixed business" : "")
                    }
                    data-testid={`remove-front-plot-${pl.plotID}`}
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>

              {/* Renders the front business card */}
              {renderFront(frontObj, { customName: pl.customName, customIcon: pl.customIcon })}
            </div>
          );
        }
        return (
            <div
            key={pl.plotID}
            className="flex items-center justify-between p-3 rounded border border-dashed border-zinc-800 bg-surface/30 hover:border-zinc-700 transition-all"
            data-testid={`empty-front-plot-${pl.plotID}`}
          >
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded border border-zinc-800 bg-zinc-900/80 flex items-center justify-center text-zinc-600">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[11px] font-black uppercase text-zinc-300 tracking-tight font-display">
                  {pl.customName || pl.locationName}
                </div>
                <div className="text-[9px] text-zinc-500 font-mono">
                  Empty Commercial Location · Ready to establish front business
                </div>
              </div>
            </div>

            <button
              onClick={() => setPickerPlot(pl.plotID)}
              className="btn-press flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-gold border border-gold/40 text-[10px] font-black uppercase rounded shadow-sm"
              data-testid={`establish-front-btn-${pl.plotID}`}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Establish Front</span>
            </button>
          </div>
        );
      })}

      {pickerPlot !== null && (
        <FrontPicker
          plot={pickerPlot}
          onClose={() => setPickerPlot(null)}
          onSelectFront={(fid) => handleSelectFront(pickerPlot, fid)}
        />
      )}
      {editPlot !== null && (
          <EditPlotModal 
            plotIdx={editPlot} 
            current={plots[editPlot]} 
            originalName={(config.fronts || []).find(f => f.id === plots[editPlot].frontID)?.name}
            onClose={() => setEditPlot(null)} 
            onSave={handleSaveCustomization} 
          />
      )}
    </div>
  );
}
