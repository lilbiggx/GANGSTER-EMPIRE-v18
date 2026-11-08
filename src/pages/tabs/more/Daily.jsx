import { useEffect } from "react";
import { toast } from "sonner";
import { Flame, CheckCircle2, Gift } from "lucide-react";
import { useGame } from "../../../store/game";
import { cedi } from "../../../lib/fmt";
import { Btn, Card, Bar, SectionTitle } from "../../../components/game/ui";

export default function Daily() {
  const { player: p, derived: d, act, markViewSeen } = useGame();
  const st = p.streak || { count: 1, grace_used: false };

  // Mark Daily as viewed so badge vanishes
  useEffect(() => {
    if (markViewSeen) markViewSeen("more_daily");
  }, [markViewSeen]);

  const isClaimed = Boolean(p.daily?.login_claimed);
  const nextStreak = isClaimed ? (st.count || 1) : ((st.count || 0) + 1);
  const rewardClean = d?.scaled?.daily || Math.max(100 * nextStreak, Math.floor((d?.net_income || 100) * 0.15 * Math.min(10, nextStreak)));

  return (
    <div>
      <SectionTitle kicker="Come back every day" title="Login Streak" />
      <Card accent="gold" data-testid="streak-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-8 w-8 text-blood" />
            <div>
              <div className="font-display text-4xl text-gold" data-testid="streak-count">{st.count}</div>
              <div className="text-[10px] uppercase text-zinc-500">day streak</div>
            </div>
          </div>
          <div className="text-right text-[11px] text-zinc-400">
            Grace day<br />
            <b className={st.grace_used ? "text-blood" : "text-kgreen"} data-testid="streak-grace">
              {st.grace_used ? "used" : "available"}
            </b>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className={`h-2 ${i < (st.count % 7 || (st.count ? 7 : 0)) ? "bg-gold" : "bg-zinc-800"}`} />
          ))}
        </div>
        <p className="mt-2 text-[11px] text-zinc-500">Miss one day and the streak survives with your grace day. It refills every 7 days.</p>

        {/* Claim Daily Login Streak Button */}
        <div className="mt-3.5 border-t border-zinc-800/80 pt-3">
          {isClaimed ? (
            <div className="flex items-center justify-between rounded border border-kgreen/40 bg-kgreen/10 px-3 py-2 text-xs" data-testid="streak-claimed-badge">
              <div className="flex items-center gap-2 text-kgreen font-bold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Day {st.count} Streak Reward Received</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">Resets at midnight</span>
            </div>
          ) : (
            <Btn
              variant="gold"
              className="w-full py-2.5 text-xs font-black tracking-wider flex items-center justify-center gap-2 shadow-lg border border-gold/60"
              onClick={() => {
                act("daily_claim", {}, {
                  onResult: (res) => {
                    toast.success(`🔥 Day ${res?.streak || nextStreak} Login Streak received! +GH₵${(res?.reward || rewardClean).toLocaleString()} clean cash deposited to Statement.`);
                  }
                });
              }}
              data-testid="daily-streak-claim-btn"
            >
              <Gift className="h-4 w-4 text-ink" />
              <span>RECEIVE DAY {nextStreak} LOGIN STREAK (+{cedi(rewardClean)} CLEAN & +50 PASS XP)</span>
            </Btn>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-zinc-800/80 pt-2.5 text-xs text-zinc-400">
          <span>Streak Status: <b className="text-gold font-bold">Day {st.count} Active</b></span>
          <span className="text-[10px] text-zinc-500">Auto-recorded to Statement</span>
        </div>
      </Card>
      <SectionTitle kicker="Resets at midnight (server time)" title="Daily Contracts" />
      <div className="grid gap-2">
        {p.daily.contracts.map((c) => {
          const done = c.progress >= c.target;
          return (
            <Card key={c.idx} accent={c.claimed ? "none" : done ? "green" : "gold"} data-testid={`contract-${c.idx}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-bold text-zinc-100">{c.label}</div>
                <span className="text-[11px] text-kgreen">+{cedi(c.reward_clean)}</span>
              </div>
              <div className="my-2"><Bar pct={(c.progress / c.target) * 100} color={done ? "green" : "gold"} /></div>
              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                <span>{Math.min(c.progress, c.target).toLocaleString()} / {c.target.toLocaleString()}</span>
                <Btn variant="green" disabled={!done || c.claimed} onClick={() => act("contract_claim", { idx: c.idx })} data-testid={`contract-claim-btn-${c.idx}`}>{c.claimed ? "Done" : "Claim"}</Btn>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
