import React from "react";
import { Shield, WifiOff, Siren, Swords, ShieldCheck, Users, Heart, Coins, Crosshair, Droplets, Flame, Hammer, Bike, HeartPulse, Activity, User } from "lucide-react";
import { useGame } from "../../store/game";
import { calcPower, calcDefence, calcCrewDailyRate } from "../../engine/gameEngine";
import { cedi, dur, big } from "../../lib/fmt";
import { useNow } from "../../hooks/useNow";

export default function Hud() {
  const { player: p, derived: d, online, openLocker, openMore, act } = useGame();
  const now = useNow(1000);

  if (!p || !d) return null;

  const shielded = (p.shield_until || 0) > now || (p.newbie_until || 0) > now;
  const isArrested = !!p.arrested_until && now < p.arrested_until;
  const arrestTimeLeft = isArrested ? Math.max(0, p.arrested_until - now) : 0;
  const totalCrew = p.crew.length;
  const activeCrew = p.crew.filter((c) => !c.merc);
  const dailyPayroll = Math.round(activeCrew.reduce((acc, c) => acc + (c.daily_rate || calcCrewDailyRate(c)), 0));
  const hasFunds = big(p.clean) >= big(dailyPayroll) || big(p.dirty) >= big(dailyPayroll);
  const sickCrew = d.medical?.injured || 0;
  const busyCrew = p.crew.filter(c => c.assign).length;
  const idleCrew = Math.max(0, totalCrew - sickCrew - busyCrew);
  const avgMorale = Math.round(p.crew.reduce((sum, c) => sum + (c.morale || 85), 0) / Math.max(1, totalCrew));
  const atkPower = calcPower(p);
  const defPower = calcDefence(p);

  const heat = p.heat || 0;
  const stars = Math.min(5, Math.max(0, Math.ceil(heat / 20)));

  const activeHeists = p.heists?.length || 0;
  const activeBatches = p.batches?.length || 0;
  const growingCrops = (p.farm?.plots || []).filter(pl => pl.strain && pl.end > now).length;
  const craftingBenches = (p.workshop?.benches || []).filter(b => b.weaponId && b.end > now).length;
  const pendingDeliveries = (p.pending_deliveries || []).length;

  return (
    <header className="z-50 shrink-0 border-b border-gold bg-ink font-bold text-[10px]" data-testid="hud">
      {isArrested && (
        <div className="border-b border-blood bg-blood/20 px-2 py-0.5 text-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[9px] font-black uppercase">
            <Siren className="h-2.5 w-2.5 animate-spin" />
            <span>LOCKED · {dur(arrestTimeLeft)}</span>
          </div>
          <button onClick={() => act("post_bail")} className="px-1.5 py-0.5 bg-kgreen text-ink text-[8px] rounded-sm font-black uppercase flex items-center gap-1">
            <Coins className="h-2.5 w-2.5" /> BAIL
          </button>
        </div>
      )}

      {/* LINE 1: Identity, Level, Payroll, Happenings, Wanted Stars */}
      <div className="flex items-center justify-between px-2 py-1 bg-black/40 border-b border-zinc-900 gap-1">
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={() => openMore("skills")} className="font-display uppercase text-zinc-100 truncate hover:text-gold font-bold">
            {p.name}
          </button>
          <span className="text-gold font-mono">LV{p.level}</span>
          <span className="text-zinc-600">|</span>
          {/* Payroll Display */}
          <div className="flex items-center gap-1" title="Daily Payroll">
             <Coins className={`h-2.5 w-2.5 ${hasFunds ? "text-zinc-500" : "text-blood"}`} />
             <span className={`${hasFunds ? "text-zinc-300" : "text-blood font-bold"}`}>{cedi(dailyPayroll)}/d</span>
          </div>
          <span className="text-zinc-600">|</span>
          {/* Happenings indicators */}
          <div className="flex items-center gap-1.5 flex-wrap shrink-0 text-[9px] text-zinc-400">
            {activeHeists > 0 && <span className="text-blood font-mono" title="Heists">{activeHeists}H</span>}
            {activeBatches > 0 && <span className="text-sky-400 font-mono" title="Wash">{activeBatches}W</span>}
            {growingCrops > 0 && <span className="text-kgreen font-mono" title="Farm">{growingCrops}F</span>}
            {craftingBenches > 0 && <span className="text-gold font-mono" title="Craft">{craftingBenches}C</span>}
            {pendingDeliveries > 0 && <span className="text-amber-300 font-mono" title="Drop">{pendingDeliveries}D</span>}
            {(d.medical?.waiting || 0) > 0 && <span className="text-zinc-500 font-mono" title="Waiting">{d.medical.waiting}Wait</span>}
          </div>
        </div>

        {/* SkillPoints, Wanted Stars (Far Right) */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {(p.skill_points || 0) > 0 && (
            <button onClick={() => openMore("skills")} className="bg-gold px-1 text-ink rounded font-black text-[8px]">
              {p.skill_points}AP
            </button>
          )}
          <button
            onClick={() => openMore("heat")}
            className="btn-press flex items-center gap-1 group cursor-pointer"
            title={`Wanted: ${stars}/5 - Click to manage Heat`}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-[9px] transition-colors group-hover:scale-110 ${i < stars ? "text-amber-400" : "text-zinc-800"}`}>★</span>
            ))}
          </button>
        </div>
      </div>

      {/* LINE 2: Dirty Money, Power/Defense + Crew Info, Clean Money */}
      <div className="flex px-2 py-2.5 bg-black/60 items-center justify-between gap-1 flex-nowrap overflow-hidden whitespace-nowrap">
        <button
          onClick={() => openMore("statement")}
          className="btn-press flex items-center gap-1.5 shrink-0 hover:opacity-80"
          title="Click to view Cash Statement"
        >
          <Coins className="h-5 w-5 text-gold shrink-0" />
          <span className="font-display text-lg text-gold font-black tracking-tight">{cedi(p.dirty)}</span>
        </button>
        <div className="flex-1 flex flex-col items-center justify-center text-zinc-300 min-w-0">
          <div className="flex items-center gap-3 text-gold font-mono mb-0.5">
            <span className="flex items-center gap-0.5"><Swords className="h-3 w-3" />{atkPower}</span>
            <span className="flex items-center gap-0.5"><Shield className="h-3 w-3" />{defPower}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400 text-[8px] justify-center leading-none flex-nowrap">
            <span className="flex items-center gap-0.5" title="Total"><Users className="h-2 w-2" />{totalCrew}</span>
            <span className="flex items-center gap-0.5" title="Sick"><HeartPulse className="h-2 w-2 text-blood" />{sickCrew}</span>
            <span className="flex items-center gap-0.5" title="Busy"><Activity className="h-2 w-2 text-amber-500" />{busyCrew}</span>
            <span className="flex items-center gap-0.5" title="Idle"><User className="h-2 w-2 text-kgreen" />{idleCrew}</span>
          </div>
        </div>
        <button
          onClick={() => openMore("statement")}
          className="btn-press flex items-center justify-end gap-1.5 shrink-0 hover:opacity-80"
          title="Click to view Cash Statement"
        >
          <Coins className="h-5 w-5 text-kgreen shrink-0" />
          <span className="font-display text-lg text-kgreen font-black tracking-tight">{cedi(p.clean)}</span>
        </button>
      </div>
    </header>
  );
}
