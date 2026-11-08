import { useState } from "react";
import { toast } from "sonner";
import { Package, Coins, Clock, CheckCircle2 } from "lucide-react";
import { useGame } from "../../../store/game";
import { cedi, dur } from "../../../lib/fmt";
import { Btn, Card, SectionTitle } from "../../../components/game/ui";
import { useNow } from "../../../hooks/useNow";

export default function Smuggler() {
  const { player: p, config, act } = useGame();
  const now = useNow();

  const [selectedItems, setSelectedItems] = useState([]);

  const farmStash = Object.entries(p.farm?.stash || {}).filter(([id, qty]) => qty > 0);
  const gearItems = (p.gear || []).filter(g => !Object.values(p.loadout || {}).includes(g.uid));
  const luxuryItems = Object.entries(p.luxury || {}).filter(([id, qty]) => qty > 0);

  const toggleItem = (item) => {
    if (selectedItems.find(i => (i.type === item.type && i.id === item.id && i.uid === item.uid))) {
      setSelectedItems(selectedItems.filter(i => !(i.type === item.type && i.id === item.id && i.uid === item.uid)));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const totalValue = selectedItems.reduce((sum, item) => {
    if (item.type === 'farm') return sum + (item.qty * (config.farm_strains?.find(s => s.id === item.id)?.price || 0));
    if (item.type === 'weapon') return sum + (config.gear?.find(g => g.id === item.id)?.price || 0);
    if (item.type === 'luxury') return sum + (item.qty * (config.luxury?.find(l => l.id === item.id)?.price || 0));
    return sum;
  }, 0);

  const profit = Math.floor(totalValue * 0.5);
  const payout = totalValue + profit;
  const duration = Math.max(2 * 3600, Math.floor(totalValue / 1000) * 3600);

  const handleSmuggle = () => {
    act("smuggler_start", { items: selectedItems }, {
      onResult: (r) => {
        if (r.ok) {
          toast.success("Smuggler dispatched!");
          setSelectedItems([]);
        } else {
          toast.error(r.error);
        }
      }
    });
  };

  return (
    <div className="space-y-4 pb-12" data-testid="smuggler-page">
      <SectionTitle kicker="Underground Trading" title="The Smuggler" />
      
      <div className="bg-surface border border-zinc-800 p-4 space-y-4">
        <div className="text-xs text-zinc-400">Select items from your stash to smuggle for a 50% profit markup. Smuggling takes time based on total value.</div>
        
        <div className="space-y-2">
            {farmStash.map(([id, qty]) => (
                <button key={`farm-${id}`} onClick={() => toggleItem({type: 'farm', id, qty})} className={`w-full flex justify-between p-2 border ${selectedItems.find(i => i.type === 'farm' && i.id === id) ? 'border-gold bg-gold/10' : 'border-zinc-800'}`}>
                    <span className="text-xs font-bold text-zinc-100">{id} (x{qty})</span>
                    <span className="text-xs text-kgreen">Value: {cedi(qty * (config.farm_strains?.find(s => s.id === id)?.price || 0))}</span>
                </button>
            ))}
            {gearItems.map((g) => {
                const def = config.gear.find(x => x.id === g.id);
                if(!def) return null;
                return (
                    <button key={`weapon-${g.uid}`} onClick={() => toggleItem({type: 'weapon', id: g.id, uid: g.uid, qty: 1})} className={`w-full flex justify-between p-2 border ${selectedItems.find(i => i.uid === g.uid) ? 'border-gold bg-gold/10' : 'border-zinc-800'}`}>
                        <span className="text-xs font-bold text-zinc-100">{def.name}</span>
                        <span className="text-xs text-kgreen">Value: {cedi(def.price)}</span>
                    </button>
                );
            })}
        </div>

        <div className="border-t border-zinc-800 pt-3 space-y-2">
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Total Value:</span>
            <span>{cedi(totalValue)}</span>
          </div>
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Profit (50%):</span>
            <span className="text-kgreen">+{cedi(profit)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-gold">
            <span>Total Payout:</span>
            <span>{cedi(payout)}</span>
          </div>
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Duration:</span>
            <span className="text-zinc-100">{dur(duration)}</span>
          </div>

          <Btn variant="gold" disabled={selectedItems.length === 0} onClick={handleSmuggle} className="w-full">
            Ask Smuggler to Smuggle
          </Btn>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-bold uppercase text-zinc-500">Active Shipments</div>
        {(p.smuggler_shipments || []).filter(s => s.status === 'active').map(s => (
            <Card key={s.id} className="p-3 flex justify-between items-center">
                <div className="text-xs text-zinc-300">Transit: {s.items.length} items</div>
                {now < s.end ? (
                    <div className="text-xs text-gold flex items-center gap-1"><Clock className="h-3 w-3"/>{dur(s.end - now)}</div>
                ) : (
                    <Btn variant="green" onClick={() => act('smuggler_claim', {shipment_id: s.id})}>Claim Payout</Btn>
                )}
            </Card>
        ))}
      </div>
    </div>
  );
}
