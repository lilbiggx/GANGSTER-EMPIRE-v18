import { useState } from "react";
import { toast } from "sonner";
import { ShieldAlert, FileText, Lock, Coins, Sparkles, UserCheck, Flame, Scale, Skull } from "lucide-react";
import { useGame } from "../../../store/game";
import { cedi, dur, fmt } from "../../../lib/fmt";
import { Btn, Card, Bar, SectionTitle, Chip } from "../../../components/game/ui";
import { useNow } from "../../../hooks/useNow";

const TARGETS = [
  { id: "judge", name: "Justice Kojo Mensah", role: "High Court Judge", tier: 1, color: "zinc", cost: 50000, reward: 150000, heatRed: 30, desc: "Controls judicial injunctions and warrant dismissals across Accra." },
  { id: "commissioner", name: "ACP Emmanuel Addo", role: "Police Commissioner", tier: 2, color: "gold", cost: 80000, reward: 250000, heatRed: 50, desc: "Head of Greater Accra Police Command. Ultimate insider on raids." },
  { id: "minister", name: "Hon. Kofi Darko", role: "Deputy Minister of Interior", tier: 3, color: "blood", cost: 200000, reward: 600000, heatRed: 80, desc: "Has direct sway over national security task forces and port customs." },
];

export default function Blackmail() {
  const { player: p, act } = useGame();
  const now = useNow();

  const blackmailData = p.blackmail || {};
  const cdUntil = p.cooldowns?.blackmail_until || 0;
  const blackmailDay = p.cooldowns?.blackmail_day || "";
  const today = new Date(now * 1000).toISOString().slice(0, 10);
  
  const isCoolingDown = cdUntil > now;
  const isDayLimitReached = blackmailDay === today;
  const globalLock = isCoolingDown || isDayLimitReached;

  const handleExtort = (target) => {
    act("blackmail_extort", { target_id: target.id }, {
      onResult: (r) => {
        if (r.ok) {
          toast.success(`Extortion successful on ${target.name}! Secured GH₵${r.payout?.toLocaleString()} clean + political leverage.`);
        } else {
          toast.error(r.error);
        }
      }
    });
  };

  return (
    <div data-testid="blackmail-page" className="space-y-4 pb-12">
      <SectionTitle kicker="Political Leverage & Secrets" title="Blackmail & Intelligence Hub" />
      
      <div className="rounded border border-zinc-800 bg-surface/50 p-3">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[10px] text-zinc-400 leading-relaxed">
            Gather compromising dossiers on Accra’s elite. Use political leverage to silence heat or extort clean payoffs.
            <span className="block mt-1 font-bold text-gold">Limit: One operation per day. 8-hour tactical cooldown applies.</span>
          </p>
          {isCoolingDown && (
            <div className="text-right shrink-0">
              <div className="text-[9px] font-black uppercase text-blood mb-0.5 flex items-center justify-end gap-1">
                <Skull className="h-3 w-3" /> Cooldown
              </div>
              <div className="font-mono text-xs font-bold text-zinc-100">{dur(cdUntil - now)}</div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        {TARGETS.map((t) => {
          const leverage = blackmailData[t.id] || 0;
          const canAfford = BigInt(p.dirty) >= BigInt(t.cost);
          const isSelected = blackmailDay === today; // This is a bit simplified, usually it would track which one was picked if we care, but requirement says "one per day" total.

          return (
            <Card key={t.id} accent={t.color} className={`p-3 transition-opacity ${globalLock ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="font-display text-sm uppercase text-zinc-100 font-bold">{t.name}</span>
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                      t.tier === 1 ? "bg-zinc-800 text-zinc-400" :
                      t.tier === 2 ? "bg-gold/20 text-gold" :
                      "bg-blood/20 text-blood"
                    }`}>Tier {t.tier}: {t.role}</span>
                  </div>
                  <p className="text-xs text-zinc-400 mb-2 leading-relaxed">{t.desc}</p>
                  <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-mono">
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3 text-zinc-600" />
                      <span>Dossiers: <b className="text-zinc-300">{leverage}</b></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="h-3 w-3 text-blood/70" />
                      <span>Heat: <b className="text-blood-400">−{t.heatRed}</b></span>
                    </div>
                  </div>
                </div>

                <Btn
                  variant={globalLock ? "zinc" : t.color === "blood" ? "blood" : "gold"}
                  disabled={!canAfford || globalLock}
                  onClick={() => handleExtort(t)}
                  className="px-4 py-3 text-[10px] font-black uppercase tracking-wider shrink-0 min-w-[100px]"
                >
                  <div className="flex flex-col items-center gap-1">
                    <Coins className="h-3.5 w-3.5" />
                    <span>{isDayLimitReached ? "Daily Limit" : isCoolingDown ? "Cooldown" : `Extort ${fmt(t.cost)}`}</span>
                  </div>
                </Btn>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
