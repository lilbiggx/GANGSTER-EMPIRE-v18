import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, errMsg } from "../../../lib/api";
import { useGame } from "../../../store/game";
import { useNow } from "../../../hooks/useNow";
import { cedi, dur } from "../../../lib/fmt";
import { Btn, Card, SectionTitle, Chip } from "../../../components/game/ui";

export default function Turf() {
  const { config, apply, act } = useGame();
  const now = useNow();
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(null);
  const load = () => api.get("/pvp/targets").then((r) => setData(r.data)).catch((e) => toast.error(errMsg(e)));
  useEffect(() => { load(); }, []);

  const attack = async (t) => {
    setBusy(t.user_id);
    try {
      const { data: res } = await api.post("/pvp/attack", { action_id: `${Date.now()}${Math.random()}`.replace(".", ""), target: t.user_id, target_name: t.name });
      if (!res.ok) toast.error(res.error);
      else {
        apply(res);
        act("battle_record", { won: res.result.won, loot: res.result.loot, target: res.result.target || t.name, my_power: res.result.my_power, opp_power: res.result.opp_power });
        res.result.won ? toast.success(`You took ${cedi(res.result.loot)} from ${res.result.target}`) : toast.error(`${res.result.target} held their turf`);
      }
      load();
    } catch (e) { toast.error(errMsg(e)); }
    setBusy(null);
  };

  const cd = (data?.cooldown_until || 0) - now;
  return (
    <div>
      <SectionTitle kicker="Fair fights only" title="Turf War" right={data && <Chip data-testid="pvp-my-power">Power {data.my_power}</Chip>} />
      <p className="-mt-1 mb-3 text-xs text-zinc-500">You can only hit players within ±15% of your power. Loot is 20–35% of their cash outside the vault and shrinks fast against weaker players. Targets get a 4h shield after a hit.</p>
      {cd > 0 && <div className="mb-2 border border-zinc-800 px-3 py-2 text-xs text-zinc-400" data-testid="pvp-cooldown">Your boys rest for {dur(cd)}</div>}
      <div className="grid gap-2">
        {data?.targets.map((t) => (
          <Card key={t.user_id} accent="red" data-testid={`pvp-target-${t.user_id}`}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-display uppercase text-zinc-100">{t.name}</div>
                <div className="text-[11px] text-zinc-500">LV {t.level} · {config.districts.find((d) => d.id === t.district)?.name} · Power {t.power}</div>
              </div>
              <Btn variant="red" disabled={cd > 0 || busy} onClick={() => attack(t)} data-testid={`pvp-attack-btn-${t.user_id}`}>{busy === t.user_id ? "..." : "Attack"}</Btn>
            </div>
          </Card>
        ))}
        {data && !data.targets.length && <div className="stripes border p-6 text-center text-xs" data-testid="pvp-empty">Nobody in your power band right now. Check back later.</div>}
      </div>
    </div>
  );
}
