// v9: injured crew, recovery timers, paid private doctor, blood bank plasma boosts, and trauma specialist systems.
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { HeartPulse, Coins, Droplets, Zap, ShieldAlert, Sparkles, Timer, Syringe } from "lucide-react";
import { useGame } from "../../../store/game";
import { cedi, big, dur } from "../../../lib/fmt";
import { Btn, Card, Bar, SectionTitle, Chip } from "../../../components/game/ui";
import { Badge } from "../../../components/game/v9";
import { useNow } from "../../../hooks/useNow";

export default function Medical() {
  const { player: p, derived: d, act } = useGame();
  const now = useNow(1000);
  const m = d?.medical || { patients: [] };
  const [subsys, setSubsys] = useState("infirmary");

  useEffect(() => { if (d?.badges?.medical?.healed) act("medical_seen", {}); }, []); // eslint-disable-line

  const all = m.patients.reduce((a, x) => a + x.heal_cost, 0);
  const heal = (payload, cost) => act("heal_crew", payload, { onResult: (r) => toast.success(`Private doctor: ${r.healed.length} back on duty (−${cedi(r.cost)} clean)`) });

  const hasPlasmaBoost = (p.medical_boost_until || 0) > now;
  const plasmaCost = 10000;
  const canAffordPlasma = big(p.clean) >= BigInt(plasmaCost);

  return (
    <div data-testid="medical-page" className="space-y-4 pb-12">
      <SectionTitle kicker="Accra Trauma Center & Infirmary" title="Advanced Medical Systems" />

      {/* Subsystem Nav Pills */}
      <div className="grid grid-cols-2 gap-1.5">
        {[
          ["infirmary", "Infirmary & Patients"],
          ["bloodbank", "Blood Bank & Plasma"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setSubsys(id)}
            className={`btn-press border py-2 text-[10px] font-black uppercase tracking-wider ${
              subsys === id ? "border-blood bg-blood text-white" : "border-zinc-800 bg-surface text-zinc-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {subsys === "infirmary" ? (
        <>
          <Card accent="red">
            <div className="flex items-center gap-2.5 text-xs text-zinc-300">
              <HeartPulse className="h-6 w-6 text-blood shrink-0" />
              <div>
                <div className="font-bold text-zinc-100 uppercase">
                  {m.level ? `Infirmary Lv ${m.level} Active` : `No Infirmary Built`}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  {m.level ? `${m.capacity} bed${m.capacity > 1 ? "s" : ""} · Heals at ${m.speed.toFixed(2)}x speed` : "Crews rest at slow street speed. Build an infirmary in Compound Facilities."}
                </div>
              </div>
            </div>
            <div className="mt-2.5 text-[11px] text-zinc-400 font-mono" data-testid="medical-counts">
              {m.injured} injured crew{m.waiting ? ` · ${m.waiting} waiting for a bed` : ""}
              {hasPlasmaBoost && <span className="text-kgreen font-bold ml-2">⚡ Plasma Boost Active ({dur((p.medical_boost_until || 0) - now)})</span>}
            </div>
          </Card>

          {!m.patients.length && (
            <div className="border border-dashed border-zinc-800 p-8 text-center text-xs text-zinc-500" data-testid="medical-empty">
              Everyone is fit for duty. No crew currently recovering in the infirmary.
            </div>
          )}

          <div className="grid gap-2.5">
            {m.patients.map((x) => (
              <Card key={x.id} data-testid={`medical-patient-${x.id}`} className="p-3">
                <div className="flex justify-between items-center text-xs">
                  <b className="text-zinc-100 font-display uppercase">{x.name}</b>
                  <span className="text-blood font-black text-[10px] uppercase border border-blood/40 px-1.5 py-0.5 bg-blood/10 rounded">{x.sev_name}</span>
                </div>
                <div className="mt-2"><Bar pct={x.pct} color="red" /></div>
                <div className="mt-1.5 flex justify-between text-[11px] text-zinc-400">
                  <span>{x.in_clinic ? "In infirmary bed" : "Resting in safehouse"} · {x.pct}% healed</span>
                  <span className="font-mono font-bold text-gold" data-testid="medical-left">{dur(x.left)} left</span>
                </div>
                <Btn variant="green" className="mt-3 w-full py-2.5 text-xs font-black uppercase" disabled={big(p.clean) < big(x.heal_cost)} data-testid={`medical-heal-${x.id}`} onClick={() => heal({ cid: x.id })}>
                  <div className="flex items-center justify-center gap-1.5">
                    <Coins className="h-4 w-4" />
                    <span>Fast-heal now · {cedi(x.heal_cost)} clean</span>
                  </div>
                </Btn>
              </Card>
            ))}
          </div>

          {m.patients.length > 1 && (
            <Btn variant="green" className="w-full py-3 text-xs font-black uppercase" disabled={big(p.clean) < big(all)} data-testid="medical-heal-all" onClick={() => heal({ all: true })}>
              <div className="flex items-center justify-center gap-1.5">
                <Coins className="h-4 w-4" />
                <span>Heal everyone ({m.patients.length}) · {cedi(all)} clean</span>
              </div>
            </Btn>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <Card accent="green">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-sky-500/20 border border-sky-500/40 rounded text-sky-400">
                <Droplets className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-display uppercase text-sm text-zinc-100 font-bold">Emergency Blood Bank & Plasma</h4>
                <p className="text-xs text-zinc-400">Secure high-grade plasma reserves from Korle-Bu Teaching Hospital contacts to supercharge crew recovery.</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-zinc-200">Plasma Infusion Boost (+50% Speed · 24h)</div>
                <div className="text-[10px] text-zinc-400 font-mono">Cost: {cedi(plasmaCost)} clean cedis</div>
              </div>
              <Btn
                variant={hasPlasmaBoost ? "ghost" : "green"}
                disabled={hasPlasmaBoost || !canAffordPlasma}
                className="px-4 py-2 text-xs font-black uppercase"
                onClick={() => {
                  act("buy_item_effect", { effect: "medical_boost", cost: plasmaCost });
                  toast.success("Plasma reserves secured! Crew healing speed increased by +50% for 24h.");
                }}
              >
                <div className="flex items-center gap-1.5">
                  <Coins className="h-3.5 w-3.5" />
                  <span>{hasPlasmaBoost ? `Active (${dur((p.medical_boost_until || 0) - now)})` : "Infuse Plasma"}</span>
                </div>
              </Btn>
            </div>
          </Card>

          <Card accent="gold">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-gold/20 border border-gold/40 rounded text-gold">
                <Syringe className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-display uppercase text-sm text-zinc-100 font-bold">Trauma Stimulants & Painkillers</h4>
                <p className="text-xs text-zinc-400">Inject fast-acting military-grade painkillers to dull pain and accelerate active patient wound recovery.</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between">
              <div className="text-xs text-zinc-300">Stash: <b className="text-gold font-mono">{p.inv?.energy || 0} Stimulant Doses</b></div>
              <Btn
                variant="gold"
                disabled={!(p.inv?.energy > 0) || m.patients.length === 0}
                className="px-4 py-2 text-xs font-black uppercase"
                onClick={() => {
                  act("use_item", { item: "energy" });
                  toast.success("Stimulant administered! Patient recovery expedited.");
                }}
              >
                Administer Stimulant
              </Btn>
            </div>
          </Card>
        </div>
      )}

      <p className="text-[10px] text-zinc-600 text-center">All advanced medical services and private doctor consultations bill clean cedis strictly.</p>
    </div>
  );
}
