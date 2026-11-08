import { useState } from "react";
import { toast } from "sonner";
import { Hand, Clock, Phone, Scale, Timer, Vault, Hammer, Droplets, Hourglass, Coins, MapPin, Plus, HeartPulse, Sparkles, Crosshair, Briefcase, Shield, CheckCircle2, TrendingUp, Users, AlertTriangle, Siren, ArrowUp, Building2, Flame, Skull } from "lucide-react";
import { HustleIcon } from "../../components/game/LandSlots";
import { useGame } from "../../store/game";
import { useNow } from "../../hooks/useNow";
import { cedi, dur, fmt, big } from "../../lib/fmt";
import { Btn, Card, Bar, SectionTitle, Chip } from "../../components/game/ui";
import ObjectivePanel from "../../components/game/ObjectivePanel";
import TipSheet from "../../components/game/TipSheet";
import LandSlots from "../../components/game/LandSlots";
import FrontSlots from "../../components/game/FrontSlots";
import BottomSheet from "../../components/game/BottomSheet";
import { Badge, IconBtn, ConditionStrip, Details, cdText } from "../../components/game/v9";

import { accruedPlot, hustleRate, hustleCost, repairCosts, conditionMult, conditionTier } from "../../engine/gameEngine";

const accruedOf = (p, d, hid) => (p?.hustles?.[hid] ? Number(d?.hustles?.[hid]?.accrued || 0) : 0);

function NewsTicker() {
  const news = useGame((s) => s.news);
  if (!news.length) return null;
  const line = news.join("   ·   ");
  return (
    <div className="-mx-4 overflow-hidden border-b border-zinc-800 bg-surface py-1" data-testid="street-news-ticker">
      <div className="ticker flex w-max whitespace-nowrap text-[10px] font-bold text-zinc-500 uppercase tracking-tight">
        <span className="px-4"><b className="text-blood">STREET NEWS</b> {line}</span>
        <span className="px-4"><b className="text-blood">STREET NEWS</b> {line}</span>
      </div>
    </div>
  );
}

function TapHustle({ pending }) {
  const { derived: d, tap, act, player: p } = useGame();
  const [pops, setPops] = useState([]);
  const onTap = () => {
    tap();
    const id = Math.random();
    setPops((x) => [...x.slice(-6), { id, left: 30 + Math.random() * 40 }]);
    setTimeout(() => setPops((x) => x.filter((y) => y.id !== id)), 800);
  };
  const collect = () => act("collect", { hid: "all" });
  return (
    <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
      <button
        onClick={onTap}
        className="btn-press hard-shadow relative select-none overflow-hidden border border-gold bg-gold/10 px-4 py-4 text-left text-gold active:scale-95"
      >
        <div className="flex items-center gap-3 font-display text-2xl uppercase"><Hand className="h-6 w-6" /> Hustle</div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase opacity-60">
          <TrendingUp className="h-3 w-3" /> {cedi(d.tap_value)}/tap · <Clock className="h-3 w-3" /> {fmt(d.rate)}/min
        </div>
        {pops.map((x) => (
          <span key={x.id} className="float-up pointer-events-none absolute top-2 font-display text-xl text-gold" style={{ left: `${x.left}%` }}>
            +{fmt(d.tap_value)}
          </span>
        ))}
      </button>
      <button
        onClick={collect}
        disabled={pending <= 0}
        className="btn-press relative flex w-24 flex-col items-center justify-center border border-kgreen bg-kgreen/5 text-kgreen disabled:opacity-20"
      >
        <Badge n={d.badges?.hustles?.collect || 0} />
        <Coins className="h-5 w-5 mb-1" />
        <span className="font-display text-base leading-tight">{cedi(pending)}</span>
      </button>
    </div>
  );
}

function HustleCard({ h, now, landNo, plotIdx, streetName, custom }) {
  const { player: p, derived: d, config, act } = useGame();
  const [pickerSlot, setPickerSlot] = useState(null);
  const pl = plotIdx !== undefined ? (p.player_plots || [])[plotIdx] : null;
  const owned = Boolean(pl?.hustleID === h.id);
  const lvl = pl?.lvl || 1;
  const managersList = plotIdx !== undefined ? (p.plot_hustle_managers?.[plotIdx] || []) : [];
  const acc = plotIdx !== undefined ? accruedPlot(p, plotIdx, now) : 0;
  const rate = hustleRate(h, lvl, p, now, plotIdx);
  const condition = pl?.condition !== undefined ? pl.condition : 100;
  const condTierVal = conditionTier(condition);
  const condState = condTierVal === 3 ? "pristine" : condTierVal === 2 ? "worn" : "critical";
  const maxed = lvl >= 25;


  const clean = big(p.clean);
  const cost = h.cost || 0;
  const canAfford = clean >= big(cost);
  const district = useGame((s) => s.config.districts.find((x) => x.id === h.district)?.name);
  
  return (
    <Card accent={owned ? (condState === "critical" ? "red" : "gold") : "none"} className="p-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 font-display text-xs uppercase text-zinc-100">
            <HustleIcon hid={h.id} className="h-4 w-4 text-gold" />
            <span className="truncate">{custom?.customName || h.name}</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
             <div className="flex items-center gap-0.5 text-[10px] text-zinc-500 font-bold">
               <MapPin className="h-3 w-3 text-gold" />
               <span className="truncate max-w-[80px]">{streetName || (landNo ? `P${landNo}` : district)}</span>
             </div>
             {owned ? (
               <div className="flex items-center gap-1 text-[10px] text-kgreen font-black">
                 <TrendingUp className="h-3 w-3" /> +{fmt(rate)}/min
               </div>
             ) : (
               <div className="flex items-center gap-1 text-[10px] text-kgreen font-black">
                 <Coins className="h-3 w-3" /> {fmt(cost)}
               </div>
             )}
          </div>
        </div>

        {owned ? (
          <div className="flex flex-col items-end">
            <div className="font-display text-lg text-gold leading-none">{cedi(acc)}</div>
            <div className="flex items-center gap-1 mt-1">
              {managersList.map((mid, i) => (
                <div key={i} className="h-1.5 w-1.5 rounded-full bg-gold" />
              ))}
              {managersList.length === 0 && <Users className="h-3 w-3 text-zinc-700" />}
            </div>
          </div>
        ) : (
          <Btn variant={canAfford ? "green" : "ghost"} size="sm" onClick={() => act("buy_land_hustle", { plot: plotIdx, hid: h.id })} disabled={!canAfford}>
            <div className="flex items-center gap-1">
              <Coins className="h-3 w-3" />
              <span>CLAIM</span>
            </div>
          </Btn>
        )}
      </div>

      {owned && (
        <div className="mt-2 space-y-1.5">
          <ConditionStrip
            kind="hustle"
            id={h.id}
            cond={condition}
            state={condState}
            repair={repairCosts("hustle", h.id, lvl, condition)}
            managed={managersList.length > 0}
            rateText={managersList.length > 0 ? "Manager stationed: no wear, auto-repairing" : "No manager: wears over time"}
            dirty={big(p.dirty)}
            clean={big(p.clean)}
            onQuick={() => act("repair_hustle", { hid: h.id, plot: plotIdx, type: "quick" })}
            onOverhaul={() => act("repair_hustle", { hid: h.id, plot: plotIdx, type: "overhaul" })}
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-1 flex-1">
              {[0, 1, 2].map((idx) => {
                const mid = managersList[idx];
                const crew = p.crew.find(c => c.id === mid);
                return (
                  <button
                    key={idx}
                    onClick={() => setPickerSlot(idx)}
                    className={`flex-1 h-6 rounded border flex items-center justify-center px-1 text-[8px] font-black uppercase transition-all ${crew ? "border-gold/30 bg-gold/10 text-gold" : "border-dashed border-zinc-800 text-zinc-700"}`}
                  >
                    {crew ? crew.name.split(" ")[0] : <Plus className="h-2.5 w-2.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}


      {pickerSlot !== null && (
        <BottomSheet title={`Assign Manager · Slot ${pickerSlot + 1}`} kicker={h.name} onClose={() => setPickerSlot(null)}>
           <div className="space-y-1.5 p-1">
              <button
                onClick={() => { act("assign_hustle", { hid: h.id, cid: null, slot: pickerSlot, plot: plotIdx }); setPickerSlot(null); }}
                className="w-full text-center py-2 text-xs text-zinc-500 border border-zinc-900 mb-2"
              >
                Clear Assignment
              </button>
              {p.crew.map(c => {
                const busy = Boolean(c.assign);
                return (
                  <button
                    key={c.id}
                    disabled={busy}
                    onClick={() => { act("assign_hustle", { hid: h.id, cid: c.id, slot: pickerSlot, plot: plotIdx }); setPickerSlot(null); }}
                    className={`w-full flex items-center justify-between p-2 border rounded bg-surface ${busy ? "border-zinc-900 opacity-40 cursor-not-allowed" : "border-zinc-800 hover:border-gold"}`}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gold" />
                      <span className="text-sm font-bold">{c.name}</span>
                    </div>
                    {busy ? (
                      <span className="text-[10px] text-rose-400 font-bold">Busy ({c.assign})</span>
                    ) : (
                      <span className="text-xs text-kgreen font-mono">{c.morale}%</span>
                    )}
                  </button>
                );
              })}
           </div>
        </BottomSheet>
      )}
    </Card>
  );
}

function FrontCard({ f, now, custom }) {
  const { player: p, derived: d, config, act } = useGame();
  const [pickerOpen, setPickerOpen] = useState(false);
  const lvl = p.fronts[f.id] || 0;
  const fd = d.fronts[f.id] || {};
  const batch = p.batches.find((b) => b.front === f.id);
  const cap = fd.cap;
  const maxWash = big(p.dirty) < big(cap) ? big(p.dirty) : big(cap);
  const [amtText, setAmtText] = useState("");
  const cds = d.cooldowns || {};
  const frontLeft = Math.max(0, (cds.front_until?.[f.id] || 0) - now);
  const globalLeft = Math.max(0, (cds.launder_until || 0) - now);
  const critical = fd.condition_state === "critical";

  const mgrId = p.front_assign?.[f.id];
  const mgr = p.crew.find((c) => c.id === mgrId);
  const canBuy = big(p.clean) >= big(fd.cost);

  const ownedFrontsCount = Object.values(p.fronts || {}).filter((v) => v > 0).length;
  const isFrontLimitReached = lvl === 0 && ownedFrontsCount >= config.fronts.length;

  let blocked = null;
  if (d.is_arrested) blocked = <Siren className="h-4 w-4 text-blood animate-pulse" />;
  else if (critical) blocked = <AlertTriangle className="h-4 w-4 text-blood" />;
  else if (globalLeft > 0) blocked = <Clock className="h-4 w-4 text-orange-400" />;
  else if (frontLeft > 0) blocked = <Hourglass className="h-4 w-4 text-zinc-600" />;

  const washAmt = big(amtText || "0") || maxWash;
  const IconC = Building2;

  return (
    <Card accent={batch ? "green" : lvl ? (critical ? "red" : "gold") : "none"} className="p-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 font-display text-xs uppercase text-zinc-100">
            <IconC className="h-3 w-3 text-gold" />
            <span className="truncate">{custom?.customName || f.name}</span>
            {lvl > 0 && <span className="text-[10px] text-gold font-mono">LV{lvl}</span>}
          </div>
          <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-500 font-bold">
            <div className="flex items-center gap-0.5"><Droplets className="h-3 w-3 text-sky-400" /> {fmt(cap)}</div>
            <div className="flex items-center gap-0.5"><Clock className="h-3 w-3 text-zinc-600" /> {dur(fd.dur || f.dur)}</div>
            <div className="flex items-center gap-0.5 text-blood"><Scale className="h-3 w-3" /> {Math.round((fd.fee ?? d.fee) * 100)}%</div>
          </div>
        </div>

        {lvl === 0 ? (
          <Btn variant={canBuy && !isFrontLimitReached ? "green" : "ghost"} size="sm" onClick={() => act("buy_front", { fid: f.id })} disabled={!canBuy || isFrontLimitReached} title={isFrontLimitReached ? "Front business limit reached" : undefined}>
            <div className="flex items-center gap-1">
              <Coins className="h-3 w-3" />
              <span>{isFrontLimitReached ? "LIMIT" : fmt(fd.cost)}</span>
            </div>
          </Btn>
        ) : (
          <button onClick={() => setPickerOpen(true)} className={`h-8 px-2 rounded border border-zinc-800 flex items-center justify-center text-[9px] font-black uppercase ${mgr ? "border-gold/40 bg-gold/10 text-gold" : "text-zinc-700"}`}>
            {mgr ? mgr.name.split(" ")[0] : "ASSIGN"}
          </button>
        )}
      </div>

      {lvl > 0 && (
        <div className="mt-2">
          <ConditionStrip
            kind="front"
            id={f.id}
            cond={fd.condition ?? 100}
            state={fd.condition_state || "pristine"}
            repair={fd.repair || { quick_dirty: 75, overhaul_dirty: 300 }}
            managed={Boolean(mgr)}
            rateText={mgr ? "Manager stationed: no wear, auto-repairing" : "No manager: wears over time"}
            dirty={big(p.dirty)}
            clean={big(p.clean)}
            onQuick={() => act("repair_front", { fid: f.id, type: "quick" })}
            onOverhaul={() => act("repair_front", { fid: f.id, type: "overhaul" })}
          />
        </div>
      )}

      {lvl > 0 && !batch && (
        <div className="mt-2 flex items-center gap-1">
           <input
            type="number"
            placeholder={fmt(maxWash)}
            value={amtText}
            onChange={(e) => setAmtText(e.target.value)}
            className="flex-1 h-8 bg-ink border border-zinc-800 px-2 text-xs text-gold font-display"
          />
          <button
            disabled={!!blocked || washAmt <= 0n}
            onClick={() => act("launder", { fid: f.id, amount: washAmt.toString() })}
            className="h-8 px-3 bg-kgreen text-ink font-black text-[10px] uppercase rounded disabled:opacity-20"
          >
            {blocked || <CheckCircle2 className="h-4 w-4" />}
          </button>
        </div>
      )}

      {batch && (
        <div className="mt-2">
          <div className="flex justify-between items-center mb-1 text-[10px] font-black text-kgreen uppercase tracking-tight">
            <span>{batch.end > now ? dur(batch.end - now) : "Ready"}</span>
            <span>{cedi(batch.out)}</span>
          </div>
          <Bar pct={((now - batch.start) / (batch.end - batch.start)) * 100} color="green" h={2} />
          {batch.end <= now && (
            <button onClick={() => act("collect_batch", { bid: batch.id })} className="w-full mt-2 h-7 bg-kgreen text-ink font-black text-[10px] uppercase rounded">
              Collect
            </button>
          )}
        </div>
      )}

      {pickerOpen && (
        <BottomSheet title={`Front Manager: ${f.name}`} onClose={() => setPickerOpen(false)}>
           <div className="space-y-1.5 p-1">
              <button
                onClick={() => { act("assign_front", { fid: f.id, cid: null }); setPickerOpen(false); }}
                className="w-full text-center py-2 text-xs text-zinc-500 border border-zinc-900 mb-2"
              >
                No Manager
              </button>
              {p.crew.map(c => {
                const busy = Boolean(c.assign);
                return (
                  <button
                    key={c.id}
                    disabled={busy}
                    onClick={() => { act("assign_front", { fid: f.id, cid: c.id }); setPickerOpen(false); }}
                    className={`w-full flex items-center justify-between p-2 border rounded bg-surface ${busy ? "border-zinc-900 opacity-40 cursor-not-allowed" : "border-zinc-800 hover:border-gold"}`}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gold" />
                      <span className="text-sm font-bold">{c.name}</span>
                    </div>
                    {busy ? (
                      <span className="text-[10px] text-rose-400 font-bold">Busy ({c.assign})</span>
                    ) : (
                      <span className="text-xs text-kgreen font-mono">{c.morale}%</span>
                    )}
                  </button>
                );
              })}
           </div>
        </BottomSheet>
      )}
    </Card>
  );
}

export default function Empire() {
  const { player: p, derived: d, config, act } = useGame();
  const now = useNow();
  const pending = Object.keys(p.hustles).reduce((s, k) => s + accruedOf(p, d, k), 0);
  const exposed = Math.max(0, Number(p.dirty) - Number(d.vault_cap));

  return (
    <div className="pb-8">
      <NewsTicker />
      


      <ObjectivePanel />
      
      <TapHustle pending={pending} />

      {d.susu_surge && (
        <div className="mt-3 rounded border border-amber-500/40 bg-amber-950/20 p-2.5 flex items-center justify-between text-xs" data-testid="susu-surge-banner">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-amber-400 shrink-0 animate-pulse" />
            <div>
              <div className="font-bold text-amber-300 uppercase tracking-tight flex items-center gap-1.5">
                <span>🔥 Susu Surge Active ({d.susu_surge.multiplier}x Wash Speed)</span>
                <span className="text-[9px] px-1.5 rounded bg-amber-900/60 text-amber-200 font-mono">
                  {d.susu_surge.variant}
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono">
                Targeting: {d.susu_surge.targetPlots.map((idx) => `Plot ${idx + 1}`).join(", ")}
              </div>
            </div>
          </div>
          <div className="text-right font-mono text-[11px] text-amber-400 font-bold">
            <Clock className="h-3 w-3 inline mr-1 text-amber-400" />
            {dur(d.susu_surge.left)}
          </div>
        </div>
      )}

      {d.area_don && (
        <div className="mt-2 rounded border border-blood/40 bg-rose-950/20 p-2.5 flex items-center justify-between text-xs" data-testid="area-don-banner">
          <div className="flex items-center gap-2">
            <Skull className="h-5 w-5 text-blood shrink-0" />
            <div>
              <div className="font-bold text-zinc-100 uppercase tracking-tight flex items-center gap-1.5">
                <span>Area Don: {d.area_don.name}</span>
                <span className="text-[9px] px-1 rounded bg-zinc-800 text-rose-300 font-mono">
                  {d.area_don.archetypeName}
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono">
                Tactic: <b className="text-zinc-300">{d.area_don.tacticName}</b> · Bounty: <b className="text-kgreen">{cedi(d.area_don.bounty)}</b>
              </div>
            </div>
          </div>
          <button
            onClick={() => act("attack_area_don")}
            className="btn-press px-2.5 py-1 text-[10px] font-bold uppercase rounded border border-blood bg-blood/20 text-rose-200 hover:bg-blood/40 shrink-0 ml-2"
          >
            Clash
          </button>
        </div>
      )}

      <SectionTitle
        kicker="District Control"
        title="Street Hustles"
        right={<IconBtn icon={Hammer} variant="green" label="Repair All Hustles (Clean Cash)" onClick={() => act("overhaul_all_hustles")} badge={<Badge n={d.badges?.hustles?.worn || 0} />}><Coins className="h-3 w-3" /></IconBtn>}
      />
      <LandSlots renderHustle={(hid, landNo, plotIdx, streetName, custom) => { 
        const h = config.hustles.find((x) => x.id === hid); 
        return h ? <HustleCard h={h} now={now} landNo={landNo} plotIdx={plotIdx} streetName={streetName} custom={custom} /> : null; 
      }} />

      <SectionTitle
        kicker={`Money Laundering · Commercial Plots: ${Object.values(p.fronts || {}).filter(v => v > 0).length}/8`}
        title="Commercial Fronts"
        right={<IconBtn icon={Hammer} variant="green" label="Repair All Fronts (Clean Cash)" onClick={() => act("overhaul_all_fronts")} badge={<Badge n={d.badges?.fronts?.worn || 0} />}><Coins className="h-3 w-3" /></IconBtn>}
      />
      <FrontSlots renderFront={(f, custom) => <FrontCard key={f.id} f={f} now={now} custom={custom} />} />
    </div>
  );
}
