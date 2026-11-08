import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";

import { api, errMsg } from "../../lib/api";
import { useGame } from "../../store/game";
import { TIER_PALETTE } from "../../data/gameData";
import { useNow } from "../../hooks/useNow";
import { dur, cedi, big } from "../../lib/fmt";
import { Btn, Card, Bar, SectionTitle, Chip, Sheet } from "../../components/game/ui";
import { MiniAvatar, resolveGear, holderOf } from "../../lib/gear";
import { Portrait } from "../../components/game/v9";
import { useConfirm } from "../../components/game/ConfirmContext";
import IconInspect from "../../components/game/IconInspect";
import {
  Sword,
  Crosshair,
  Target,
  Shield,
  ShieldCheck,
  Shirt,
  Layers,
  HardHat,
  Footprints,
  Plus,
  Check,
  ArrowRight,
  Building2,
  Flame,
  Sparkles,
  X,
  ChevronRight,
  Brain,
  Car,
  Glasses,
  Swords,
  Heart,
  Coins,
  MapPin,
  BookOpen,
  Zap,
  Briefcase,
  Handshake,
  Hammer,
  Store,
  Siren,
  CheckCircle2,
  HeartPulse,
  AlertTriangle,
  Package,
  XCircle,
  Dumbbell,
  Lock,
  ShieldAlert,
  ShieldOff,
  Clock,
  DollarSign,
  Volume2,
  Ghost,
  Eye,
} from "lucide-react";

export const TRAIT_ICON_MAP = {
  iron_jaw: ShieldAlert,
  ghost_step: Ghost,
  quick_draw: Zap,
  tactician: Brain,
  heavy_hitter: Flame,
  gold_hound: Coins,
  street_medic: HeartPulse,
  deadeye: Crosshair,
  loose_cannon: AlertTriangle,
  lead_foot_clumsy: Footprints,
  glass_jaw: ShieldOff,
  slow_reloader: Clock,
  greedy_eyes: DollarSign,
  loudmouth: Volume2,
};

export const TRAIT_RANKS = [5, 18, 30];

export const STAT_INFO = {
  muscle: { name: "Muscle", desc: "Melee combat striking force, damage absorption and intimidation." },
  wheels: { name: "Wheels", desc: "Getaway driving speed, agility, reflexive dodging and quick aim." },
  brains: { name: "Brains", desc: "Hacking operations, tech security, and syndicate tactical planning." },
  stealth: { name: "Stealth", desc: "Silent movement in alleys, ambush surprises, and police heat reduction." },
};

export function getCrewTraits(c, config) {
  if (Array.isArray(c?.traits) && c.traits.length >= 3) {
    return c.traits.slice(0, 3);
  }
  const poolGood = (config?.crew_traits || []).filter((t) => t.type === "good");
  const poolBad = (config?.crew_traits || []).filter((t) => t.type === "bad");
  const t0 = c?.traits?.[0] || poolGood[0]?.id || "iron_jaw";
  const t1 = c?.traits?.[1] || poolBad[0]?.id || "loudmouth";
  const t2 = c?.traits?.[2] || poolGood[1]?.id || "ghost_step";
  return [t0, t1, t2];
}

const STAT_CONFIG = {
  brains: { label: "BRN", icon: Brain },
  wheels: { label: "WHL", icon: Car },
  muscle: { label: "MUS", icon: Swords },
  stealth: { label: "STL", icon: Glasses },
};
const STATS = STAT_CONFIG;
const ARCH_COLOR = { hacker: "bg-sky-500", driver: "bg-gold", enforcer: "bg-blood", infiltrator: "bg-kgreen" };
const RARITY = { common: "text-zinc-300", rare: "text-sky-300", legendary: "text-gold" };
const RARITY_BORDER = { common: "border-zinc-700 bg-surface", rare: "border-sky-500/60 bg-sky-950/30", legendary: "border-gold/70 bg-gold/15" };

const CORE_SLOTS = [
  { id: "primary", name: "Primary", icon: Crosshair, label: "Primary Firearm" },
  { id: "secondary", name: "Secondary", icon: Target, label: "Secondary Sidearm" },
  { id: "melee", name: "Melee", icon: Sword, label: "Melee Weapon" },
  { id: "hat", name: "Hat", icon: HardHat, label: "Headwear & Helmet" },
  { id: "top", name: "Top", icon: Shirt, label: "Top / Tactical Armor" },
  { id: "bottom", name: "Bottom", icon: Layers, label: "Bottom / Slacks" },
  { id: "shoes", name: "Shoes", icon: Footprints, label: "Footwear & Boots" },
];

export function statusOf(c, now, config = null, p = null) {
  if (c.injury || (c.injured_until && c.injured_until > now)) {
    return { label: "Injured", icon: HeartPulse, cls: "text-blood font-black border-blood/60 bg-blood/10", unfit: true };
  }
  if ((c.morale || 85) < 30) {
    return { label: "Low Morale", icon: AlertTriangle, cls: "text-blood font-black border-blood/60 bg-blood/10", unfit: true };
  }
  if (c.status === "kidnapped") {
    return { label: "Kidnapped", icon: Siren, cls: "text-blood font-black border-blood/60 bg-blood/10" };
  }
  if (!c.assign) return { label: "Free", icon: CheckCircle2, cls: "text-kgreen border-kgreen/40 bg-kgreen/10" };
  if (c.assign === "defense") return { label: "DEF", icon: Shield, cls: "text-gold border-gold/40 bg-gold/10" };
  if (c.assign.startsWith("heist")) return { label: "HST", icon: Crosshair, cls: "text-blood border-blood/40 bg-blood/10" };
  if (c.assign.startsWith("listed")) return { label: "MERC", icon: Handshake, cls: "text-sky-300 border-sky-700 bg-sky-950/30" };
  if (c.assign.startsWith("build:")) return { label: "BLD", icon: Hammer, cls: "text-amber-400 border-amber-600 bg-amber-950/30" };
  if (c.assign.startsWith("hustle:")) {
    const parts = c.assign.split(":");
    const plotPart = parts.find(x => x.startsWith("plot_"));
    const plotNum = plotPart ? Number(plotPart.replace("plot_", "")) : null;
    const plot = plotNum !== null ? p?.player_plots?.[plotNum] : null;
    const hustleName = plot?.hustleID ? (config?.hustles?.find(h => h.id === plot.hustleID)?.name || plot.hustleID) : "Hustle";
    const labelText = plotNum !== null ? `Plot ${plotNum + 1}: ${hustleName}` : hustleName;
    return { label: labelText.toUpperCase(), icon: Briefcase, cls: "text-sky-400 border-sky-600 bg-sky-950/30" };
  }
  if (c.assign.startsWith("front:")) return { label: "FNT", icon: Store, cls: "text-emerald-400 border-emerald-600 bg-emerald-950/30" };
  if (c.assign.startsWith("facility:")) return { label: "FAC", icon: Building2, cls: "text-purple-400 border-purple-600 bg-purple-950/30" };
  return { label: "ACT", icon: Zap, cls: "text-zinc-400 border-zinc-700 bg-zinc-900" };
}

export function CrewCard({ c, children, onInspectLoadout, onPickSlot }) {
  const { player: p, config } = useGame();
  const now = useNow();
  const st = statusOf(c, now, config, p);
  const StatusIcon = st.icon;
  const stats = c.stats || {};
  const salary = c.daily_rate || 150;
  const isBusy = Boolean(c.assign || c.status === "kidnapped" || c.injury || (c.injured_until && c.injured_until > now));
  return (
    <div className={`relative border p-3 transition-all rounded-sm ${RARITY_BORDER[c.rarity || "common"]}`} data-testid={`crew-card-${c.id}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Portrait gender={c.gender} size={48} className="border border-zinc-700" />
            <div className="absolute -bottom-1 -right-1 bg-black/90 text-gold text-[9px] font-mono px-1 rounded border border-gold/30">
              LV{c.lvl}
            </div>
            {c.hired && (
              <div className="absolute -top-1 -left-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-lg z-20 border border-white/20">
                <CheckCircle2 className="h-3 w-3" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold uppercase tracking-tight text-zinc-100">{c.name}</span>
              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded text-white ${ARCH_COLOR[c.arch] || "bg-zinc-700"}`}>
                {c.arch}
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>Str: <b className="text-zinc-200">{c.strength}</b></span>
              <span>·</span>
              <span>Flaw: <b className="text-zinc-400">{c.flaw}</b></span>
              <span>·</span>
              <IconInspect
                title="Daily Salary / Wage"
                subtitle={`Base Rate: GH₵${salary.toLocaleString()}/day`}
                desc="Calculated dynamically from this crew member's base stats. High base attributes increase daily wage."
              >
                <span className="flex items-center gap-1 text-gold font-mono font-bold cursor-pointer hover:underline">
                  <Coins className="h-2.5 w-2.5" />
                  GH₵{salary.toLocaleString()}/d
                </span>
              </IconInspect>
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {Object.entries(STATS).map(([k, meta]) => {
                const Icon = meta.icon;
                const baseVal = stats[k] || 0;
                let gearBonus = 0;
                Object.values(c.loadout || {}).forEach((uid) => {
                  const gi = p?.gear?.find((g) => g.uid === uid);
                  const def = gi && config?.gear?.find((g) => g.id === gi.id);
                  if (def) {
                    if (def.stat === k) gearBonus += (def.mod || 0) + (gi.lvl || 0);
                    if (def.effects && def.effects[k]) gearBonus += def.effects[k];
                    if (def.tier && k === "muscle") gearBonus += def.tier;
                  }
                });
                const statMeta = STAT_INFO[k] || { name: meta.label, desc: "Attribute" };
                return (
                  <IconInspect
                    key={k}
                    title={`${statMeta.name} (${meta.label})`}
                    subtitle={`Base: ${baseVal}${gearBonus > 0 ? ` · Loadout Bonus: +${gearBonus} (Total: ${baseVal + gearBonus})` : ""}`}
                    desc={statMeta.desc}
                  >
                    <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-300 hover:text-gold transition-colors cursor-pointer">
                      <Icon className="h-3 w-3 text-gold/70" />
                      <span>{baseVal}</span>
                      {gearBonus > 0 && <span className="text-[9px] text-gold font-bold">+{gearBonus}</span>}
                    </div>
                  </IconInspect>
                );
              })}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] ${st.cls}`}>
            <StatusIcon className="h-3 w-3 shrink-0" />
            <span className="uppercase font-bold">{st.label}</span>
          </div>
        </div>
      </div>
      <div className="mt-2.5 pt-2 border-t border-zinc-800/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-black uppercase tracking-wider text-zinc-500 mr-0.5">TRAITS:</span>
          {getCrewTraits(c, config).map((tid, idx) => {
            const tDef = config?.crew_traits?.find((t) => t.id === tid) || { name: tid, desc: "Crew perk", perk: "Special capability", type: "good" };
            const reqRank = TRAIT_RANKS[idx] || 5;
            const isUnlocked = (c.lvl || 1) >= reqRank;
            const isGood = tDef.type === "good";
            const TraitIcon = TRAIT_ICON_MAP[tid] || Sparkles;

            return (
              <IconInspect
                key={`${c.id}-trait-${idx}`}
                title={tDef.name}
                badge={isUnlocked ? "ACTIVE" : `UNLOCKS RANK ${reqRank}`}
                badgeCls={isUnlocked ? (isGood ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-red-500/20 text-rose-300 border border-red-500/40") : "bg-zinc-800 text-zinc-400 border border-zinc-700"}
                subtitle={isGood ? "Buff Perk" : "Penalty Flaw"}
                perk={tDef.perk}
                desc={tDef.desc}
              >
                <div
                  className={`flex items-center justify-center h-6 w-6 rounded border transition-all cursor-pointer select-none ${
                    isUnlocked
                      ? isGood
                        ? "bg-emerald-950/70 border-emerald-500/80 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)] hover:scale-110 active:scale-95"
                        : "bg-red-950/70 border-red-500/80 text-rose-300 shadow-[0_0_8px_rgba(239,68,68,0.3)] hover:scale-110 active:scale-95"
                      : "bg-zinc-900 border-zinc-800 text-zinc-600 opacity-50 hover:opacity-80 active:scale-95"
                  }`}
                >
                  {isUnlocked ? (
                    <TraitIcon className="h-3.5 w-3.5" />
                  ) : (
                    <div className="relative flex items-center justify-center">
                      <TraitIcon className="h-3.5 w-3.5 opacity-50" />
                      <Lock className="h-3 w-3 absolute -top-1 -right-1 text-zinc-400 bg-zinc-900 rounded-full p-0.5" />
                    </div>
                  )}
                </div>
              </IconInspect>
            );
          })}
        </div>
        {!c.merc && (
          <div className="flex-1 flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 text-[8px] font-mono text-zinc-500 uppercase tracking-tighter">
              <span>XP {c.xp || 0} / {Math.floor(50 * Math.pow(1.3, (c.lvl || 1) - 1))}</span>
              <span className="text-zinc-700">·</span>
              <span className="text-zinc-500">To Rank { (c.lvl || 1) + 1 }</span>
            </div>
            <div className="w-24 opacity-80">
              <Bar pct={((c.xp || 0) / Math.floor(50 * Math.pow(1.3, (c.lvl || 1) - 1))) * 100} color="gold" />
            </div>
          </div>
        )}
        {c.merc && (
          <div className="text-[8px] font-mono text-zinc-600 uppercase tracking-tighter">
            Hold icon to inspect
          </div>
        )}
      </div>
      <div className="mt-3 border-t border-zinc-800 pt-2.5">
        <div 
          onClick={() => onInspectLoadout?.(c)}
          className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider mb-1.5 cursor-pointer group"
          title="Click to inspect and change loadout"
        >
          <span className="flex items-center gap-1 text-zinc-300 group-hover:text-gold transition-colors">
            <Crosshair className="h-3 w-3 text-gold" />
            <span className="font-bold">Loadout & Weapons</span>
          </span>
          <span className="text-[9px] text-zinc-500 group-hover:text-gold font-mono transition-colors">
            Click slot to change →
          </span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {CORE_SLOTS.map((s) => {
            const eqUid = c.loadout?.[s.id];
            const gi = eqUid ? p.gear.find((gi) => gi.uid === eqUid) : null;
            const def = gi && config.gear.find((g) => g.id === gi.id);
            const tierColor = def ? (TIER_PALETTE[def.tier] || TIER_PALETTE[1]) : "#71717a";
            const SlotIcon = s.icon;
            return (
              <button
                key={s.id}
                type="button"
                className={`btn-press flex flex-col items-center justify-center p-1.5 rounded border transition-all cursor-pointer ${
                  eqUid
                    ? "border-zinc-700 bg-surface hover:border-gold hover:bg-gold/10 hover:scale-105"
                    : "border-dashed border-zinc-800 bg-black/40 text-zinc-600 hover:border-gold hover:text-gold hover:scale-105"
                }`}
                title={`Click to change ${s.name}: ${def?.name || 'Empty'}`}
                onClick={() => onPickSlot?.(c, s.id)}
              >
                <SlotIcon className="h-4 w-4 shrink-0" style={eqUid ? { color: tierColor } : undefined} />
                <span className="text-[7px] font-mono text-zinc-400 uppercase mt-0.5 truncate max-w-full font-bold">
                  {s.id.slice(0, 3)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {children}
    </div>
  );
}

function CrewLoadoutSheet({ crew, initialSlot = "primary", onClose }) {
  const { player: p, config, act, openLocker } = useGame();
  const [slot, setSlot] = useState(initialSlot);
  const live = p.crew.find((x) => x.id === crew.id) || crew;
  const currentUid = live.loadout?.[slot];
  const armoryItems = (p.gear || []).filter((gi) => {
    const d = config.gear.find(x => x.id === gi.id);
    return d && d.slot === slot;
  });
  const handleEquip = (gearUid, itemSlot) => {
    const holder = holderOf(p, gearUid);
    act("equip_gear", { target: live.id, slot: itemSlot, uid: gearUid });
    if (holder && holder !== live.name.split(" ")[0]) {
      toast.success(`Reassigned from ${holder} to ${live.name}`);
    } else {
      toast.success(`Equipped to ${live.name}`);
    }
  };
  const handleUnequip = () => {
    if (!currentUid) return;
    act("equip_gear", { target: live.id, slot, uid: null });
    toast.info(`Unequipped from ${live.name}`);
  };
  return (
    <Sheet open onClose={onClose} testid="crew-loadout-sheet">
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
        <Portrait gender={live.gender} size={56} className="border border-zinc-700 bg-zinc-900 rounded" />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-black uppercase tracking-tighter text-gold flex items-center gap-1.5">
            <Crosshair className="h-3 w-3" />
            <span>Tactical Loadout & Armory</span>
          </div>
          <h3 className="font-display text-2xl uppercase text-zinc-100 font-bold leading-none mt-1 tracking-tight truncate">{live.name}</h3>
          <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
            <span className="uppercase font-bold text-zinc-400">{live.arch}</span> · LV {live.lvl}
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onClose();
            openLocker(live.id);
          }}
          className="btn-press flex items-center gap-1 text-[10px] uppercase font-bold text-zinc-300 hover:text-gold border border-zinc-800 bg-zinc-900/80 hover:border-gold px-2.5 py-1.5 rounded shrink-0 transition-colors"
          title="Open in 3D Character Locker"
        >
          <Eye className="h-3.5 w-3.5 text-gold" />
          <span>3D Locker</span>
        </button>
      </div>
      <div className="mt-4 p-2.5 rounded border border-zinc-800 bg-zinc-950/70 flex items-center justify-between gap-3">
        <div>
          <div className="text-[9px] font-black uppercase tracking-wider text-gold flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-gold" />
            <span>Crew Traits (Rank 5 · 18 · 30)</span>
          </div>
          <div className="text-[8px] text-zinc-500 font-mono mt-0.5">
            Hold icon to inspect definition
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {getCrewTraits(live, config).map((tid, idx) => {
            const tDef = config?.crew_traits?.find((t) => t.id === tid) || { name: tid, desc: "Crew perk", perk: "Special capability", type: "good" };
            const reqRank = TRAIT_RANKS[idx] || 5;
            const isUnlocked = (live.lvl || 1) >= reqRank;
            const isGood = tDef.type === "good";
            const TraitIcon = TRAIT_ICON_MAP[tid] || Sparkles;
            return (
              <IconInspect
                key={`${live.id}-loadout-trait-${idx}`}
                title={tDef.name}
                badge={isUnlocked ? "ACTIVE" : `UNLOCKS RANK ${reqRank}`}
                badgeCls={isUnlocked ? (isGood ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-red-500/20 text-rose-300 border border-red-500/40") : "bg-zinc-800 text-zinc-400 border border-zinc-700"}
                subtitle={isGood ? "Buff Perk" : "Penalty Flaw"}
                perk={tDef.perk}
                desc={tDef.desc}
              >
                <div
                  className={`flex items-center justify-center h-7 w-7 rounded border transition-all cursor-pointer select-none ${
                    isUnlocked
                      ? isGood
                        ? "bg-emerald-950/70 border-emerald-500/80 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95"
                        : "bg-red-950/70 border-red-500/80 text-rose-300 shadow-[0_0_8px_rgba(239,68,68,0.3)] hover:scale-105 active:scale-95"
                      : "bg-zinc-900 border-zinc-800 text-zinc-600 opacity-50 hover:opacity-80 active:scale-95"
                  }`}
                >
                  {isUnlocked ? (
                    <TraitIcon className="h-4 w-4" />
                  ) : (
                    <div className="relative flex items-center justify-center">
                      <TraitIcon className="h-4 w-4 opacity-50" />
                      <Lock className="h-3.5 w-3.5 absolute -top-1 -right-1 text-zinc-400 bg-zinc-900 rounded-full p-0.5" />
                    </div>
                  )}
                </div>
              </IconInspect>
            );
          })}
        </div>
      </div>
      <div className="mt-5">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3 ml-1">Equipped Slots</div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
          {CORE_SLOTS.map((s) => {
            const eqUid = live.loadout?.[s.id];
            const active = slot === s.id;
            const gi = eqUid ? p.gear.find(g => g.uid === eqUid) : null;
            const def = gi ? config.gear.find(g => g.id === gi.id) : null;
            const tierColor = def ? (TIER_PALETTE[def.tier] || TIER_PALETTE[1]) : "#71717a";
            const SlotIcon = s.icon;
            
            return (
              <button
                key={s.id}
                onClick={() => setSlot(s.id)}
                className={`btn-press flex flex-col items-center justify-center min-w-[58px] h-[58px] rounded border transition-all ${
                  active 
                    ? "border-gold bg-gold/10 text-gold" 
                    : eqUid 
                      ? "border-zinc-600 bg-zinc-900 text-zinc-200" 
                      : "border-dashed border-zinc-800 bg-black/20 text-zinc-700"
                }`}
              >
                <SlotIcon className="h-4 w-4" style={eqUid ? { color: tierColor } : undefined} />
                <span className="text-[8px] font-black uppercase mt-1 tracking-tighter truncate w-full px-1">
                  {s.name.length > 5 ? s.name.slice(0, 5) + ".." : s.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Hero-Style Slot Loadout Armory (Age of Wonders cross-crew swap pattern) */}
        <div className="mt-4 border-t border-zinc-800 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
              Available {CORE_SLOTS.find((s) => s.id === slot)?.name} Items ({armoryItems.length})
            </span>
            {currentUid && (
              <button
                type="button"
                onClick={handleUnequip}
                className="btn-press text-[10px] text-rose-400 hover:text-rose-300 font-bold border border-rose-900/60 bg-rose-950/30 px-2 py-0.5 rounded"
              >
                [Unequip Slot]
              </button>
            )}
          </div>

          <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
            {armoryItems.map((gi) => {
              const def = config.gear.find((g) => g.id === gi.id);
              if (!def) return null;
              const isEquippedHere = live.loadout?.[slot] === gi.uid;
              const equippedCrew = p.crew.find((cr) => cr.id !== live.id && Object.values(cr.loadout || {}).includes(gi.uid));
              const equippedBoss = live.id !== "boss" && Object.values(p.loadout || {}).includes(gi.uid);
              const tierColor = TIER_PALETTE[def.tier] || TIER_PALETTE[1];

              return (
                <div
                  key={gi.uid}
                  className={`flex items-center justify-between p-2 rounded border text-xs ${
                    isEquippedHere
                      ? "border-gold/60 bg-gold/10"
                      : "border-zinc-800 bg-surface/70"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: tierColor }}
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-zinc-100 truncate flex items-center gap-1.5">
                        <span>{def.name}</span>
                        {(gi.lvl || 0) > 0 && <span className="text-[9px] text-gold font-mono">+{gi.lvl}</span>}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-2 flex-wrap">
                        <span>{def.stat ? `+${def.mod || 0} ${def.stat.toUpperCase()}` : "Equipment"}</span>
                        {isEquippedHere ? (
                          <span className="text-gold font-bold">[Equipped Here]</span>
                        ) : equippedCrew ? (
                          <span className="text-amber-400 font-bold">[Equipped by: {equippedCrew.name}]</span>
                        ) : equippedBoss ? (
                          <span className="text-sky-400 font-bold">[Equipped by: Boss]</span>
                        ) : (
                          <span className="text-emerald-400 font-bold">[In Armory]</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    {isEquippedHere ? (
                      <Btn
                        variant="red"
                        className="text-[10px] py-1 px-2.5"
                        onClick={handleUnequip}
                      >
                        [Unequip]
                      </Btn>
                    ) : equippedCrew ? (
                      <Btn
                        variant="gold"
                        className="text-[10px] py-1 px-2.5"
                        onClick={() => handleEquip(gi.uid, slot)}
                      >
                        [Swap & Equip Here]
                      </Btn>
                    ) : (
                      <Btn
                        variant="green"
                        className="text-[10px] py-1 px-2.5"
                        onClick={() => handleEquip(gi.uid, slot)}
                      >
                        [Equip]
                      </Btn>
                    )}
                  </div>
                </div>
              );
            })}
            {armoryItems.length === 0 && (
              <div className="p-4 text-center text-xs text-zinc-500 italic border border-dashed border-zinc-800 rounded">
                No owned {CORE_SLOTS.find((s) => s.id === slot)?.name} items in armory. Acquire gear in the Black Market or Boutique!
              </div>
            )}
          </div>
        </div>
      </div>
    </Sheet>
  );
}

function RentOut({ c, onClose }) {
  const { act } = useGame();
  const [hours, setHours] = useState(4);
  const [price, setPrice] = useState(5000);
  return (
    <Sheet open onClose={onClose} testid="rent-sheet">
      <h3 className="font-display text-lg uppercase text-zinc-100 mb-2">Rent out {c.name}</h3>
      <p className="text-xs text-zinc-400 mb-4">List this crew member on the mercenary market for rival syndicates to hire.</p>
      <div className="space-y-3">
        <div>
          <label className="text-[10px] uppercase text-zinc-400 block mb-1">Hours ({hours}h)</label>
          <input type="range" min="1" max="24" value={hours} onChange={(e) => setHours(Number(e.target.value))} className="w-full" />
        </div>
        <div>
          <label className="text-[10px] uppercase text-zinc-400 block mb-1">Price (GH₵{price.toLocaleString()})</label>
          <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-xs" />
        </div>
        <Btn variant="gold" onClick={() => { act("rent_crew", { crew_id: c.id, hours, price }); onClose(); }} className="w-full py-2.5 text-xs font-black uppercase">
          List on Mercenary Market
        </Btn>
      </div>
    </Sheet>
  );
}

function TrainSheet({ c, onClose }) {
  const { act } = useGame();
  return (
    <Sheet open onClose={onClose} testid="train-sheet">
      <h3 className="font-display text-lg uppercase text-zinc-100 mb-2">Tactical Drills: {c.name}</h3>
      <p className="text-xs text-zinc-400 mb-4">Put {c.name} through rigorous syndicate tactical drills to boost combat stats and level.</p>
      <div className="space-y-2">
        <Btn variant="gold" onClick={() => { act("crew_train", { crew_id: c.id, type: "stats" }); onClose(); }} className="w-full py-2.5 text-xs font-black uppercase">
          Intensive Drill (GH₵15,000)
        </Btn>
      </div>
    </Sheet>
  );
}

function AgencyShop() {
  const p = useGame(s => s.player);
  const d = useGame(s => s.derived);
  const act = useGame(s => s.act);
  const config = useGame(s => s.config);
  const [selectedItem, setSelectedItem] = useState(null);
  const agencyRecruits = d.store?.agency || [];
  return (
    <div className="space-y-4 mt-3" data-testid="agency-shop">
      <SectionTitle 
        kicker={`Payroll: GH₵${(d.crew_daily_payroll || 0).toLocaleString()}/day · Reset every 12h`}
        title="Crew Recruitment Agency"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {agencyRecruits.map((c) => (
            <CrewCard key={c.id} c={c}>
                <div className="mt-2">
                    <Btn 
                        variant={c.elite ? "green" : "gold"} 
                        className="w-full text-[10px]"
                        onClick={() => setSelectedItem(c)}
                        disabled={!!c.hired}
                    >
                        {c.hired ? "Hired" : `Hire: ${cedi(c.elite ? c.clean_price : c.price)}`}
                    </Btn>
                </div>
            </CrewCard>
        ))}
      </div>
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent>
          {selectedItem && (() => {
            const cost = selectedItem.elite ? selectedItem.clean_price : selectedItem.price;
            const isClean = !!selectedItem.elite;
            const canAfford = isClean ? big(p.clean) >= big(cost) : big(p.dirty) >= big(cost);
            const traits = getCrewTraits(selectedItem, config);
            const stats = selectedItem.stats || {};
            return (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle>{selectedItem.name}</DialogTitle>
                  <DialogDescription className="space-y-2" asChild>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded text-white ${selectedItem.elite ? "bg-emerald-600" : "bg-zinc-700"}`}>
                          {selectedItem.elite ? "Elite Recruit" : selectedItem.arch}
                        </span>
                        <span className="text-zinc-400 font-mono text-[10px]">Rank {selectedItem.lvl} · {selectedItem.gender}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {Object.entries(stats).map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between border border-zinc-800 bg-black/20 p-1.5 rounded-[1px]">
                            <span className="text-[9px] uppercase font-bold text-zinc-500">{k}</span>
                            <span className="text-xs font-mono font-black text-gold">{v}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Traits:</div>
                        <div className="flex flex-wrap gap-1">
                          {traits.map((tid, idx) => {
                            const tDef = config?.crew_traits?.find(t => t.id === tid);
                            const Icon = TRAIT_ICON_MAP[tid] || Sparkles;
                            return (
                              <div key={idx} className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-[1px]">
                                <Icon className="h-3 w-3 text-gold/80" />
                                <span className="text-[10px] text-zinc-200">{tDef?.name || tid}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                  <div className="text-sm font-mono text-zinc-300">
                    Contract: <span className={isClean ? "text-kgreen" : "text-gold"}>{cedi(cost)} {isClean ? "clean" : "dirty"}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono uppercase">
                    Wage: {cedi(selectedItem.daily_rate || 0)}/d
                  </div>
                </div>
                <DialogFooter>
                  <Btn variant="ghost" onClick={() => setSelectedItem(null)}>Cancel</Btn>
                  <Btn 
                    variant={isClean ? "green" : "gold"} 
                    disabled={!canAfford} 
                    onClick={() => {
                      act("store_buy", { store: "agency", id: selectedItem.id });
                      setSelectedItem(null);
                      toast.success(`Recruited ${selectedItem.name}!`);
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <Plus className="h-4 w-4" />
                      <span>{isClean ? "Hire Elite" : "Hire Recruit"}</span>
                    </div>
                  </Btn>
                </DialogFooter>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Crew() {
  const { player: p, derived: d, config, act } = useGame();
  const now = useNow();
  const { confirmAction } = useConfirm();
  const [crewTab, setCrewTab] = useState("roster");
  const [renting, setRenting] = useState(null);
  const [training, setTraining] = useState(null);
  const [loadoutCrew, setLoadoutCrew] = useState(null);
  const [loadoutSlot, setLoadoutSlot] = useState("primary");

  const own = p.crew.filter((c) => !c.merc);
  const mercs = p.crew.filter((c) => c.merc);

  const handleInspectLoadout = (crewMember) => {
    setLoadoutCrew(crewMember);
    setLoadoutSlot("primary");
  };

  const handlePickSlot = (crewMember, slotId) => {
    setLoadoutCrew(crewMember);
    setLoadoutSlot(slotId);
  };

  return (
    <div className="space-y-4 pb-12" data-testid="crew-tab">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-gold flex items-center gap-1.5">
            <Shield className="h-3 w-3" />
            <span>Syndicate Command</span>
          </div>
          <h2 className="font-display text-2xl uppercase text-zinc-100 font-bold leading-tight">
            Crew & Agency ({own.length}/{d.crew_cap})
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCrewTab("roster")}
            className={`btn-press px-3 py-1.5 text-xs font-black uppercase rounded ${crewTab === "roster" ? "bg-gold text-ink" : "bg-surface text-zinc-400 border border-zinc-800"}`}
            data-testid="crew-subtab-roster"
          >
            Roster
          </button>
          <button
            onClick={() => setCrewTab("agency")}
            className={`btn-press px-3 py-1.5 text-xs font-black uppercase rounded ${crewTab === "agency" ? "bg-gold text-ink" : "bg-surface text-zinc-400 border border-zinc-800"}`}
            data-testid="crew-subtab-agency"
          >
            Agency
          </button>
        </div>
      </div>

      {crewTab === "roster" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {own.map((c) => {
            const isBusy = Boolean(c.assign || c.status === "kidnapped" || c.injury || (c.injured_until && c.injured_until > now));
            return (
              <CrewCard key={c.id} c={c} onInspectLoadout={handleInspectLoadout} onPickSlot={handlePickSlot}>
                 <div className="mt-2.5 flex items-center gap-1.5">
                    <Btn
                      variant="zinc"
                      className="flex-1 h-9 text-xs uppercase font-black tracking-wide flex items-center justify-center gap-1.5"
                      title={isBusy ? "Crew member is busy" : "Train"}
                      disabled={isBusy}
                      onClick={() => setTraining(c)}
                    >
                      <Dumbbell className="h-3.5 w-3.5" />
                      <span>Train</span>
                    </Btn>
                    <Btn
                      variant="zinc"
                      className="flex-1 h-9 text-xs uppercase font-black tracking-wide flex items-center justify-center gap-1.5"
                      title={isBusy ? "Crew member is busy" : "Rent Out"}
                      disabled={isBusy}
                      onClick={() => setRenting(c)}
                    >
                      <Handshake className="h-3.5 w-3.5" />
                      <span>Rent Out</span>
                    </Btn>
                    <Btn 
                      variant={c.assign === "defense" ? "red" : "zinc"} 
                      className="w-9 h-9 px-0 justify-center shrink-0" 
                      title={c.assign === "defense" ? "Relieve Duty" : isBusy ? "Crew member is busy" : "Defend Base"}
                      disabled={isBusy && c.assign !== "defense"}
                      onClick={() => {
                          if (c.assign !== null && c.assign !== "defense") {
                               toast.error("Crew member is busy");
                               return;
                          }
                          if (!c.assign) {
                               confirmAction("Defend Base?", "Assign this free crew member to defend the base?", () => act("assign", { crew_id: c.id, assign: "defense" }));
                          } else {
                               act("assign", { crew_id: c.id, assign: null });
                          }
                      }}
                    >
                      <Shield className="h-4 w-4" />
                    </Btn>
                    <Btn 
                      variant="red" 
                      className="w-9 h-9 px-0 justify-center shrink-0" 
                      title={isBusy ? "Crew member is busy" : "Fire Crew"}
                      disabled={isBusy}
                      onClick={() => {
                          if (c.assign) {
                              toast.error("Crew member is busy");
                              return;
                          }
                          confirmAction("Fire Crew?", `Are you sure you want to fire ${c.name}?`, () => act("dismiss_crew", { crew_id: c.id }));
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Btn>
                 </div>
              </CrewCard>
            );
          })}
          {own.length === 0 && <div className="p-8 text-center text-zinc-500 italic">No active crew members. Recruit in the Agency tab.</div>}
        </div>
      )}

      {crewTab === "agency" && <AgencyShop />}

      {loadoutCrew && <CrewLoadoutSheet crew={loadoutCrew} initialSlot={loadoutSlot} onClose={() => setLoadoutCrew(null)} />}
      {renting && <RentOut c={renting} onClose={() => setRenting(null)} />}
      {training && <TrainSheet c={training} onClose={() => setTraining(null)} />}
    </div>
  );
}
