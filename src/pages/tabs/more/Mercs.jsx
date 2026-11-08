import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, errMsg } from "../../../lib/api";
import { useGame } from "../../../store/game";
import { useNow } from "../../../hooks/useNow";
import { cedi, dur, big } from "../../../lib/fmt";
import { Btn, Card, SectionTitle } from "../../../components/game/ui";

export default function Mercs() {
  const { player: p, apply } = useGame();
  const now = useNow();
  const [data, setData] = useState(null);
  const load = () => api.get("/market").then((r) => setData(r.data)).catch((e) => toast.error(errMsg(e)));
  useEffect(() => { load(); }, []);

  const rent = async (l) => {
    try {
      const { data: res } = await api.post("/market/rent", { listing_id: l.id });
      apply(res);
      toast.success(`${l.crew.name} joined you for ${l.hours}h`);
      load();
    } catch (e) { toast.error(errMsg(e)); }
  };
  const cancel = async (l) => {
    try {
      const { data: res } = await api.post("/market/cancel", { listing_id: l.id });
      apply(res);
      load();
    } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <div>
      <SectionTitle kicker="Payment held until the job ends" title="Mercenary Market" />
      <p className="-mt-1 mb-3 text-xs text-zinc-500">Rent other players' crew for your heists. The owner gets paid only when the rental finishes. Prices are capped. List your own crew from the Crew tab.</p>
      {data?.mine.length > 0 && (
        <>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gold">Your listings</div>
          <div className="mb-4 grid gap-2">
            {data.mine.map((l) => (
              <Card key={l.id} accent="green" data-testid={`my-listing-${l.id}`}>
                <div className="flex items-center justify-between gap-2">
                  <div><div className="font-display uppercase text-zinc-100">{l.crew.name}</div><div className="text-[11px] text-zinc-500">{cedi(l.price)} · {l.hours}h · {l.status === "rented" ? `rented, pays out in ${dur(l.end - now)}` : "waiting"}</div></div>
                  {l.status === "open" && <Btn variant="ghost" onClick={() => cancel(l)} data-testid={`listing-cancel-btn-${l.id}`}>Cancel</Btn>}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
      <div className="grid gap-2">
        {data?.listings.map((l) => (
          <Card key={l.id} accent="gold" data-testid={`listing-${l.id}`}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-display uppercase text-zinc-100">{l.crew.name}</div>
                <div className="text-[11px] text-zinc-500">{l.crew.arch} · LV {l.crew.lvl} · from {l.crew.owner_name} · {l.hours}h</div>
              </div>
              <Btn disabled={big(p.dirty) < big(l.price)} onClick={() => rent(l)} data-testid={`listing-rent-btn-${l.id}`}>Rent {cedi(l.price)}</Btn>
            </div>
          </Card>
        ))}
        {data && !data.listings.length && <div className="stripes border p-6 text-center text-xs" data-testid="mercs-empty">No mercenaries for hire yet.</div>}
      </div>
    </div>
  );
}
