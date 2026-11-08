import { useState } from "react";
import { toast } from "sonner";
import {
  ShieldAlert,
  Wrench,
  Radio,
  Bed,
  Zap,
  Vault,
  Building2,
  HeartPulse,
  Car,
  Home,
  Crown,
  Users,
  AlertTriangle,
  Coins,
  CheckCircle2,
  Hammer,
  Sparkles,
  UserCheck,
  X,
  Shield,
  Bike,
  Truck,
  Award,
} from "lucide-react";
import { useGame } from "../../../store/game";
import { cedi, fmt, big } from "../../../lib/fmt";
import { Btn, Card, Bar, SectionTitle, Chip } from "../../../components/game/ui";
import { Badge, IconBtn, ConditionStrip, Details, TierChip } from "../../../components/game/v9";

const archMatch = (fac, arch) => !!fac && (arch === fac.recommended_arch || (fac.alt_archs || []).includes(arch));
const archLabel = (fac) => [fac.recommended_arch, ...(fac.alt_archs || [])].join(" / ");

const FACILITY_ICONS = {
  infirmary: HeartPulse,
  armoury: Wrench,
  radio_tower: Radio,
  barracks: Bed,
  generator: Zap,
  vault: Vault,
  walls: Building2,
};

export default function Skills() {
  const { player: p, derived: d, config, act } = useGame();
  // Sub-categories: 1. Boss perks, 2. Compound, 3. Garage
  const [activeTab, setActiveTab] = useState("boss"); // "boss" | "compound" | "garage"
  const [compoundSubSection, setCompoundSubSection] = useState("fixtures"); // "fixtures" | "facilities"
  const [assignModalFacility, setAssignModalFacility] = useState(null); // facility id for stationing crew
  const [assignSlot, setAssignSlot] = useState(0);

  const facilities = d?.facilities || [];
  const bossPerks = d?.boss_perks || [];
  const points = p.skill_points || 0;
  const baseIntegrity = d?.base_integrity ?? 100;

  const upgradeFac = (id) => {
    act("upgrade_facility", { facility_id: id }, {
      onResult: () => toast.success("Compound facility upgraded! Perks active & condition 100% Pristine."),
    });
  };

  const repairFac = (id, type) => {
    act("repair_facility", { facility_id: id, type }, {
      onResult: () => toast.success(type === "overhaul" ? "Facility completely overhauled to 100% Pristine!" : "Quick maintenance completed! +35% Condition restored."),
    });
  };

  const overhaulAll = () => {
    act("overhaul_all_facilities", {}, {
      onResult: () => toast.success("Emergency base overhaul complete! All compound facilities restored to 100% Pristine!"),
    });
  };

  const assignCrewStation = (facId, crewId, slot) => {
    act("assign_facility_crew", { facility_id: facId, crew_id: crewId, slot }, {
      onResult: () => {
        toast.success("Crew member stationed on base maintenance duty!");
        setAssignModalFacility(null);
      },
    });
  };

  const unassignCrewStation = (facId, crewId) => {
    act("unassign_facility_crew", { facility_id: facId, crew_id: crewId }, {
      onResult: () => toast.info("Crew member unassigned from maintenance duty."),
    });
  };

  const upgradePerk = (id) => {
    act("upgrade_boss_perk", { perk_id: id }, {
      onResult: () => toast.success("Boss perk unlocked! Mastery increased."),
    });
  };

  const trainBossStat = (stat) => {
    act("train_boss_stat", { stat }, {
      onResult: (r) => toast.success(`Boss ${stat.toUpperCase()} upgraded to ${r.value}! Power increased.`),
    });
  };

  const doUpgrade = (key) => {
    act("upgrade", { key }, {
      onResult: () => toast.success(`${config.upgrades?.[key]?.name || "Upgrade"} complete!`),
    });
  };

  const mansionUpgrades = Object.entries(config.upgrades || {}).filter(([, u]) => u.group === "mansion");
  const garageUpgrades = Object.entries(config.upgrades || {}).filter(([, u]) => u.group === "garage");

  // Crew candidates for stationing
  const activeFacDef = assignModalFacility ? facilities.find((f) => f.id === assignModalFacility) : null;

  const bossBadge = (d?.badges?.skill_tabs?.boss ?? d?.badges?.mansion_tabs?.boss) || 0;
  const compoundBadge = (d?.badges?.skill_tabs?.compound ?? d?.badges?.mansion_tabs?.mansion) || 0;
  const garageBadge = (d?.badges?.skill_tabs?.garage ?? d?.badges?.mansion_tabs?.garage) || 0;

  return (
    <div className="space-y-3 pb-8" data-testid="skills-compound-screen" id="skills-screen">
      <SectionTitle
        kicker="Syndicate Mastery & Upgrades"
        title="Skills"
        right={
          <div className="flex items-center gap-1.5">
            <Chip className="border-gold bg-gold/10 text-gold font-mono font-bold">
              {points} Attribute Pts
            </Chip>
            <Chip className="border-zinc-700 text-zinc-300">
              Def {d?.defence || 15}
            </Chip>
          </div>
        }
      />

      {/* Attribute Points Economy Banner */}
      <div className="rounded border border-gold/40 bg-gold/5 p-2.5 flex items-center justify-between text-xs" data-testid="skills-points-banner">
        <div>
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-gold fill-gold" />
            <span className="font-bold text-gold uppercase tracking-wider">Attribute Points Economy</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Attribute points are gained only when you level up (+1 Point per level up). Use points to master Boss Perks, fortify Compound fixtures, and upgrade Garage rides.
          </p>
        </div>
        <div className="text-right shrink-0 pl-3">
          <div className="text-[9px] uppercase text-zinc-500 font-bold">Available</div>
          <div className="font-display text-2xl text-gold" data-testid="mansion-available-points">{points}</div>
          <div className="text-[9px] text-zinc-400 font-mono">+1 / LV</div>
        </div>
      </div>

      {/* Sub-categories switcher: 1. Boss perks, 2. Compound, 3. Garage */}
      <div className="grid grid-cols-3 gap-1 text-[11px] font-extrabold uppercase tracking-wider" data-testid="skills-subtabs">
        <button
          onClick={() => setActiveTab("boss")}
          className={`relative border py-2 px-1 text-center truncate transition-colors ${
            activeTab === "boss" ? "border-gold bg-gold text-ink" : "border-zinc-800 bg-surface text-zinc-400 hover:text-zinc-200"
          }`}
          data-testid="skills-tab-boss"
        >
          1. Boss Perks
          <Badge n={bossBadge} testid="badge-skills-boss" />
        </button>
        <button
          onClick={() => setActiveTab("compound")}
          className={`relative border py-2 px-1 text-center truncate transition-colors ${
            activeTab === "compound" ? "border-gold bg-gold text-ink" : "border-zinc-800 bg-surface text-zinc-400 hover:text-zinc-200"
          }`}
          data-testid="skills-tab-compound"
        >
          2. Compound
          <Badge n={compoundBadge + (d?.badges?.facilities?.worn?.length || 0)} testid="badge-skills-compound" />
        </button>
        <button
          onClick={() => setActiveTab("garage")}
          className={`relative border py-2 px-1 text-center truncate transition-colors ${
            activeTab === "garage" ? "border-gold bg-gold text-ink" : "border-zinc-800 bg-surface text-zinc-400 hover:text-zinc-200"
          }`}
          data-testid="skills-tab-garage"
        >
          3. Garage
          <Badge n={garageBadge} testid="badge-skills-garage" />
        </button>
      </div>

      {/* 1. BOSS PERKS TAB */}
      {activeTab === "boss" && (
        <div className="grid gap-2" data-testid="boss-skills-view">
          <Card accent="gold" className="mb-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Boss Street Rank</div>
                <div className="font-display text-4xl text-gold" data-testid="boss-uncapped-level">
                  Level {p.level}
                </div>
                <div className="text-[11px] text-zinc-400">Uncapped Rank Progression · Syndicate Authority</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase text-zinc-500 font-bold">Attribute Points</div>
                <div className="font-display text-3xl text-kgreen" data-testid="boss-skill-points">
                  {points}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">+1 Point per Level Up</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                <span>XP Progress</span>
                <span>{fmt(p.xp)} / {fmt(d?.xp_needed || 100)} XP</span>
              </div>
              <Bar pct={((p.xp || 0) / (d?.xp_needed || 100)) * 100} color="gold" />
            </div>
          </Card>

          {/* Boss Attributes Training */}
          <SectionTitle kicker="Raw Leadership Stats" title="Boss Attributes" />
          <div className="grid grid-cols-2 gap-2 mb-2">
            {[
              { id: "muscle", label: "Muscle", desc: "+Syndicate combat power", icon: Shield, val: p.boss_stats?.muscle || 8 },
              { id: "brains", label: "Brains", desc: "+Hustle & planning boost", icon: Award, val: p.boss_stats?.brains || 6 },
              { id: "wheels", label: "Wheels", desc: "+Getaway & heist speed", icon: Bike, val: p.boss_stats?.wheels || 6 },
              { id: "stealth", label: "Stealth", desc: "-Heat & raid avoidance", icon: Users, val: p.boss_stats?.stealth || 6 },
            ].map((stat) => (
              <Card key={stat.id} className="p-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-zinc-400">{stat.label}</div>
                    <div className="font-display text-xl text-zinc-100 font-mono">{stat.val}</div>
                    <div className="text-[9px] text-zinc-500 mt-0.5">{stat.desc}</div>
                  </div>
                  <Btn
                    variant="gold"
                    disabled={points < 1}
                    onClick={() => trainBossStat(stat.id)}
                    className="text-[10px] py-1 px-2 shrink-0"
                    data-testid={`train-boss-${stat.id}`}
                  >
                    +1 (1 Pt)
                  </Btn>
                </div>
              </Card>
            ))}
          </div>

          <SectionTitle kicker="Syndicate Leader Mastery" title="Boss Perks" />
          {bossPerks.map((bp) => {
            const hasPoints = points > 0;
            const canRank = bp.can_upgrade;

            return (
              <Card key={bp.id} accent={bp.rank > 0 ? "gold" : "none"} data-testid={`boss-perk-card-${bp.id}`}>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-display text-base uppercase text-zinc-100 flex items-center gap-2">
                      {bp.name}
                      <span className="text-xs text-gold font-mono">
                        Rank {bp.rank}/{bp.max}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{bp.desc}</div>
                  </div>

                  <Btn
                    variant="gold"
                    disabled={!canRank || !hasPoints}
                    onClick={() => upgradePerk(bp.id)}
                    data-testid={`boss-perk-btn-${bp.id}`}
                    className="min-w-[100px] text-[11px] py-1.5"
                  >
                    {bp.rank >= bp.max ? "Maxed" : hasPoints ? "+1 Rank" : "Need Points"}
                  </Btn>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 2. COMPOUND TAB */}
      {activeTab === "compound" && (
        <div className="space-y-3" data-testid="mansion-upgrades-list">
          {/* Compound Sub-switcher: Compound Fixtures vs Syndicate Facilities */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div className="text-xs text-zinc-400">
              Compound architecture and security. Village Safehouse costs 5 Attribute Points (24h offline earnings cap). Quarters expand max crew up to 14. Vault uses Clean Cash.
            </div>
          </div>

          <div className="flex gap-1 border-b border-zinc-800 pb-2">
            <button
              onClick={() => setCompoundSubSection("fixtures")}
              className={`text-xs px-3 py-1 font-bold rounded uppercase ${
                compoundSubSection === "fixtures" ? "bg-gold text-ink" : "bg-surface text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Compound Fixtures
            </button>
            <button
              onClick={() => setCompoundSubSection("facilities")}
              className={`text-xs px-3 py-1 font-bold rounded uppercase flex items-center gap-1.5 ${
                compoundSubSection === "facilities" ? "bg-gold text-ink" : "bg-surface text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Syndicate Facilities
              {baseIntegrity < 80 && (
                <span className="h-1.5 w-1.5 rounded-full bg-blood animate-pulse" />
              )}
            </button>
          </div>

          {compoundSubSection === "fixtures" && (
            <div className="grid gap-2">
              {mansionUpgrades.map(([k, u]) => {
                const lvl = p.upgrades[k] || 0;
                const maxLvl = k === "quarters" ? 5 : u.max; // Quarters max level is 5!
                const isMaxed = lvl >= maxLvl;
                const isVault = k === "vault";
                const isSafehouse = k === "safehouse";
                const vaultCost = d?.upgrades?.[k] || u.cost;
                // Village safe house costs exactly 5 Attribute Points!
                const apCost = isSafehouse ? 5 : (u.ap_cost || 1);
                const canAfford = isVault ? big(p.clean) >= big(vaultCost) : points >= apCost;

                return (
                  <Card key={k} accent={lvl > 0 ? "gold" : "none"} data-testid={`mansion-upgrade-${k}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-display text-base uppercase text-zinc-100 flex items-center gap-2">
                          {u.name}
                          <span className="text-xs text-gold font-mono">
                            {lvl}/{maxLvl}
                          </span>
                          {isSafehouse && (
                            <span className="text-[10px] bg-gold/15 text-gold px-1.5 py-0.5 rounded border border-gold/40 font-bold">
                              5 Attribute Points
                            </span>
                          )}
                          {k === "quarters" && (
                            <span className="text-[10px] bg-gold/10 text-gold px-1 rounded border border-gold/30">
                              Cap: 14 Max Crew
                            </span>
                          )}
                          {isVault && (
                            <span className="text-[10px] bg-kgreen/10 text-kgreen px-1 rounded border border-kgreen/30">
                              Clean Cash Only
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">{u.desc}</div>
                        {isSafehouse && (
                          <div className="text-[10px] text-gold font-mono mt-1">
                            Offline earnings collection duration: 12h → <b>24 hours</b>
                          </div>
                        )}
                        {k === "quarters" && (
                          <div className="text-[10px] text-zinc-500 mt-1">
                            Current Crew Capacity: <b className="text-zinc-200">{9 + Math.min(5, lvl)}/14</b> (Base 9, max 14 at LV 5)
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <Btn
                          variant={isVault ? "green" : "gold"}
                          disabled={isMaxed || !canAfford}
                          onClick={() => doUpgrade(k)}
                          data-testid={`upgrade-btn-${k}`}
                          className="min-w-[110px]"
                        >
                          <div className="flex items-center gap-1">
                            <Coins className="h-3.5 w-3.5" />
                            <span>
                              {isMaxed
                                ? "Maxed"
                                : isVault
                                ? cedi(vaultCost)
                                : isSafehouse
                                ? "5 Attribute Pts"
                                : "1 Attribute Pt"}
                            </span>
                          </div>
                        </Btn>
                        <div className="text-[9px] text-zinc-500 mt-1 font-mono">
                          {isVault
                            ? "Paid in Clean Cedis"
                            : `Requires ${apCost} Attribute Point${apCost > 1 ? "s" : ""}`}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Syndicate Facilities (Base integrity, overhaul all, crew stationing) */}
          {compoundSubSection === "facilities" && (
            <div className="space-y-3" data-testid="compound-facilities-list">
              {/* Compound Structural Integrity Monitor */}
              <Card accent={baseIntegrity < 50 ? "red" : baseIntegrity < 80 ? "gold" : "green"}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-base uppercase text-zinc-100 flex items-center gap-1.5">
                        <ShieldAlert className="h-5 w-5 text-gold" /> Compound Base Integrity & Maintenance
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                          baseIntegrity >= 85
                            ? "bg-kgreen/20 text-kgreen border border-kgreen/40"
                            : baseIntegrity >= 50
                            ? "bg-gold/20 text-gold border border-gold/40"
                            : "bg-blood/20 text-blood border border-blood/40 animate-pulse"
                        }`}
                      >
                        {baseIntegrity >= 85 ? "PRISTINE" : baseIntegrity >= 50 ? "OPERATIONAL" : baseIntegrity >= 25 ? "WORN" : "CRITICAL"}
                      </span>
                    </div>
                    <Details label="How wear works" testid="base-integrity-details">
                      Built facilities wear 0.5%/min. Station crew to stop wear and auto-repair (+2%/min).
                    </Details>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[9px] uppercase text-zinc-500 font-bold">Base Health</div>
                    <div
                      className={`font-display text-3xl ${
                        baseIntegrity >= 85 ? "text-kgreen" : baseIntegrity >= 50 ? "text-gold" : "text-blood"
                      }`}
                    >
                      {baseIntegrity}%
                    </div>
                  </div>
                </div>

                <div className="mt-2.5">
                  <div className="flex justify-between text-[10px] text-zinc-400 mb-1 font-mono">
                    <span>Compound Structural Durability</span>
                    <span>{baseIntegrity}% / 100%</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        baseIntegrity >= 85 ? "bg-kgreen" : baseIntegrity >= 50 ? "bg-gold" : "bg-blood"
                      }`}
                      style={{ width: `${baseIntegrity}%` }}
                    />
                  </div>
                </div>

                {facilities.some((f) => (f.lvl || 0) > 0 && (f.condition ?? 100) < 100) && (
                  <div className="mt-3 pt-2.5 border-t border-zinc-800 flex items-center justify-between gap-2">
                    <div className="text-[10px] text-zinc-400">
                      Restore all damaged compound fixtures to 100% Pristine condition.
                    </div>
                    <Btn
                      variant="gold"
                      onClick={overhaulAll}
                      className="text-[10px] py-1 px-3 whitespace-nowrap"
                      data-testid="overhaul-all-btn"
                    >
                      <Hammer className="h-3 w-3 mr-1 inline" /> Emergency Overhaul All
                    </Btn>
                  </div>
                )}
              </Card>

              {/* Facility Cards */}
              <div className="grid gap-2">
                {facilities.map((fac) => {
                  const Icon = FACILITY_ICONS[fac.id] || Building2;
                  const lvl = fac.lvl || 0;
                  const isBuilt = lvl > 0;
                  const condition = fac.condition !== undefined ? fac.condition : 100;
                  const conditionState = fac.condition_state || "pristine";
                  const assignedCrew = fac.assigned_crew || [];
                  const maxSlots = fac.max_crew_slots || 1;
                  const cost = Math.floor((fac.base_cost_clean || 48000) * Math.pow(1.8, lvl));
                  const canAffordUpgrade = big(p.clean) >= big(cost);
                  const fb = d?.badges?.facilities || {};
                  const perkState = !isBuilt ? "locked" : conditionState === "critical" ? "off" : conditionState === "worn" ? "half" : "on";

                  return (
                    <Card
                      key={fac.id}
                      accent={!isBuilt ? "none" : conditionState === "critical" ? "red" : conditionState === "worn" ? "gold" : "none"}
                      data-testid={`facility-card-${fac.id}`}
                      className="relative min-w-0"
                    >
                      {(fb.worn || []).includes(fac.id) && <Badge dot testid={`badge-facility-worn-${fac.id}`} />}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="shrink-0 rounded border border-zinc-700 bg-ink p-1.5" title={fac.desc}>
                            <Icon className="h-4 w-4 text-gold" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 font-display text-sm uppercase text-zinc-100">
                              <span className="truncate">{fac.name}</span>
                              <span className="font-mono text-[10px] text-gold">{isBuilt ? `LV${fac.lvl}/${fac.max}` : "UNBUILT"}</span>
                            </div>
                            <div className="flex min-w-0 items-center gap-1 text-[10px] text-zinc-500">
                              <Users className="h-3 w-3 shrink-0" />
                              {assignedCrew.length}/{maxSlots}
                              <span className="ml-1 min-w-0 truncate uppercase" title="Recommended archetype(s) for synergy">★ {archLabel(fac)}</span>
                            </div>
                          </div>
                        </div>
                        {fac.can_upgrade ? (
                          <IconBtn
                            icon={isBuilt ? Hammer : Building2}
                            variant={canAffordUpgrade ? "green" : "ghost"}
                            disabled={!canAffordUpgrade}
                            onClick={() => upgradeFac(fac.id)}
                            data-testid={`facility-upgrade-btn-${fac.id}`}
                            label={`${isBuilt ? `Upgrade to LV ${lvl + 1}` : "Build facility"}: ${cedi(cost)} Clean Cash`}
                            className="shrink-0 text-[10px]"
                            badge={(fb.upgrade || []).includes(fac.id) ? <Badge dot /> : null}
                          >
                            <Coins className="h-3 w-3 text-kgreen" />
                            {isBuilt ? `LV${lvl + 1}` : "Build"} ({fmt(cost)})
                          </IconBtn>
                        ) : (
                          <Chip className="text-gold">Max</Chip>
                        )}
                      </div>

                      {isBuilt && (
                        <ConditionStrip
                          kind="facility"
                          id={fac.id}
                          cond={condition}
                          state={conditionState}
                          repair={{ quick_dirty: fac.quick_repair_dirty, overhaul_dirty: fac.overhaul_repair_dirty, overhaul_clean: fac.overhaul_repair_clean }}
                          managed={assignedCrew.length > 0}
                          rateText={assignedCrew.length > 0 ? `Crew on station: no wear, auto-repair` : "No crew: wears 0.5%/min"}
                          dirty={big(p.dirty)}
                          clean={big(p.clean)}
                          onQuick={() => repairFac(fac.id, "quick")}
                          onOverhaul={() => repairFac(fac.id, "overhaul")}
                          quickTestid={`repair-quick-${fac.id}`}
                          overhaulTestid={`repair-overhaul-${fac.id}`}
                        />
                      )}

                      {isBuilt && (
                        <div className="mt-2 flex flex-wrap gap-1" data-testid={`facility-stations-${fac.id}`}>
                          {Array.from({ length: maxSlots }).map((_, slotIdx) => {
                            const m = assignedCrew[slotIdx];
                            const isMatch = m && archMatch(fac, m.arch);
                            return m ? (
                              <span
                                key={slotIdx}
                                className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] ${isMatch ? "border-gold/50 bg-gold/5 text-zinc-100" : "border-zinc-700 text-zinc-300"}`}
                                title={`${m.name} · LV ${m.lvl} ${m.arch}`}
                                data-testid={`facility-station-${fac.id}-${slotIdx}`}
                              >
                                {isMatch && <Sparkles className="h-3 w-3 text-gold" />}
                                {m.name.split(" ")[0]} <span className="font-mono text-zinc-500">LV{m.lvl}</span>
                                <button
                                  onClick={() => unassignCrewStation(fac.id, m.id)}
                                  className="ml-0.5 text-zinc-500 hover:text-blood"
                                  title={`Unstation ${m.name}`}
                                  aria-label={`Unstation ${m.name}`}
                                  data-testid={`facility-unstation-${fac.id}-${slotIdx}`}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ) : (
                              <button
                                key={slotIdx}
                                onClick={() => { setAssignModalFacility(fac.id); setAssignSlot(slotIdx); }}
                                className="relative inline-flex items-center gap-1 rounded border border-dashed border-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-500 hover:border-gold hover:text-gold"
                                title={`Station slot #${slotIdx + 1}: assign ${archLabel(fac)} for maximum synergy`}
                                aria-label={`Station crew in slot ${slotIdx + 1}`}
                                data-testid={`facility-station-btn-${fac.id}-${slotIdx}`}
                              >
                                <UserCheck className="h-3 w-3" /> Station
                                {(fb.station || []).includes(fac.id) && <Badge dot />}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <Details label="Perks & info" testid={`facility-details-${fac.id}`}>
                        <div className="mb-1">{fac.desc}</div>
                        {fac.perks.map((perk, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-1.5 ${perkState === "on" ? "text-kgreen" : perkState === "half" ? "text-orange-400" : perkState === "off" ? "text-blood line-through" : "text-zinc-500"}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${perkState === "on" ? "bg-kgreen" : perkState === "half" ? "bg-orange-400" : perkState === "off" ? "bg-blood" : "bg-zinc-700"}`} />
                            {perk}
                            {perkState === "locked" && " (build to unlock)"}
                            {perkState === "half" && " (halved: Worn)"}
                            {perkState === "off" && " (shut down: Critical)"}
                          </div>
                        ))}
                        <div className="mt-1 text-gold">Synergy ({archLabel(fac)}): {fac.synergy_desc}</div>
                        {(perkState === "half" || perkState === "off") && (
                          <div className="mt-1 flex items-center gap-1 text-blood"><AlertTriangle className="h-3 w-3" />{fac.penalty_desc}</div>
                        )}
                        {fac.can_upgrade && <div className="mt-1">Next level: {cedi(cost)}.</div>}
                      </Details>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. GARAGE TAB */}
      {activeTab === "garage" && (
        <div className="space-y-2.5" data-testid="garage-upgrades-list">
          <div className="text-xs text-zinc-400">
            Syndicate fleet and getaway rides. Upgrading rides cuts heist durations, expands laundering batch sizes, and bolsters convoy defense using Attribute Points.
          </div>

          <div className="grid gap-2">
            {garageUpgrades.map(([k, u]) => {
              const lvl = p.upgrades[k] || 0;
              const isMaxed = lvl >= u.max;
              const canAfford = points >= 1;

              return (
                <Card key={k} accent={lvl > 0 ? "gold" : "none"} data-testid={`garage-upgrade-${k}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-display text-base uppercase text-zinc-100 flex items-center gap-2">
                        {u.name}
                        <span className="text-xs text-gold font-mono">
                          {lvl}/{u.max}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">{u.desc}</div>
                    </div>

                    <div className="text-right shrink-0">
                      <Btn
                        variant="gold"
                        disabled={isMaxed || !canAfford}
                        onClick={() => doUpgrade(k)}
                        data-testid={`upgrade-btn-${k}`}
                        className="min-w-[100px]"
                      >
                        {isMaxed ? "Maxed" : "1 Attribute Pt"}
                      </Btn>
                      <div className="text-[9px] text-zinc-500 mt-1 font-mono">
                        Requires 1 Attribute Point
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* CREW STATION SELECTION MODAL */}
      {assignModalFacility && activeFacDef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="max-w-[440px] w-full bg-surface border border-gold p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div>
                <div className="text-[10px] uppercase font-bold text-gold tracking-wider">
                  Station Maintenance Operative
                </div>
                <div className="font-display text-lg uppercase text-zinc-100 flex items-center gap-1.5">
                  {activeFacDef.name} (Slot #{assignSlot + 1})
                </div>
              </div>
              <button
                onClick={() => setAssignModalFacility(null)}
                className="text-zinc-400 hover:text-zinc-100 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-zinc-400">
              Stationing an operative stops facility wear and auto-repairs condition (+2%/min each) and earns them 2 XP/min.
              <div className="mt-1 p-2 bg-gold/10 border border-gold/30 rounded text-gold text-[11px]">
                <b>Recommended Archetype:</b> <span className="uppercase font-bold">{archLabel(activeFacDef)}</span> ({activeFacDef.synergy_desc})
              </div>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {(p.crew || []).map((c) => {
                const isMatch = archMatch(activeFacDef, c.arch);

                return (
                  <div
                    key={c.id}
                    className={`p-2.5 rounded border flex items-center justify-between gap-2 text-xs transition-all ${
                      isMatch ? "border-gold/60 bg-gold/5" : "border-zinc-800 bg-ink/70"
                    }`}
                  >
                    <div>
                      <div className="font-display text-sm text-zinc-100 flex items-center gap-1.5">
                        {c.name}
                        <span className="text-[10px] text-zinc-400 font-mono">
                          LV {c.lvl}
                        </span>
                        <span className={`text-[9px] px-1 rounded uppercase font-bold ${
                          isMatch ? "bg-gold text-ink" : "bg-zinc-800 text-zinc-300"
                        }`}>
                          {c.arch}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        {c.origin || "Syndicate Operative"} • Morale: {c.morale || 85}%
                      </div>
                    </div>

                    <Btn
                      variant={isMatch ? "gold" : "ghost"}
                      onClick={() => assignCrewStation(activeFacDef.id, c.id, assignSlot)}
                      className="text-[10px] py-1 px-2.5 whitespace-nowrap"
                    >
                      {isMatch ? "★ Assign Synergy" : "Assign"}
                    </Btn>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
