import { useState, useMemo } from "react";
import {
  Receipt,
  TrendingUp,
  TrendingDown,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Calendar,
  Sparkles,
} from "lucide-react";
import { useGame } from "../../../store/game";
import { cedi, dur } from "../../../lib/fmt";
import { Card, SectionTitle, Chip, Btn } from "../../../components/game/ui";
import { ledgerSummary } from "../../../engine/gameEngine";

export default function CashStatement() {
  const { player: p, derived: d } = useGame();
  const [filterType, setFilterType] = useState("all"); // "all" | "inflow" | "outflow" | "clean" | "dirty"
  const [categoryFilter, setCategoryFilter] = useState("all");

  // entries store an absolute amount + type; sign it once here
  const transactions = useMemo(() => (p.cash_statement || []).map((t) => ({ ...t, amount: t.type === "outflow" ? -Math.abs(t.amount) : Math.abs(t.amount) })), [p.cash_statement]);
  const summary = useMemo(() => ledgerSummary(p, Date.now() / 1000), [p]);
  const [showCats, setShowCats] = useState(true);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(transactions.map((t) => t.category).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [transactions]);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
      if (filterType === "inflow" && t.amount <= 0) return false;
      if (filterType === "outflow" && t.amount >= 0) return false;
      if (filterType === "clean" && t.currency !== "clean") return false;
      if (filterType === "dirty" && t.currency !== "dirty") return false;
      return true;
    });
  }, [transactions, filterType, categoryFilter]);

  // 30-Day metrics from the complete per-day ledger (every cash movement, by category)
  const stats = useMemo(() => {
    let inflowClean = 0, inflowDirty = 0, outflowClean = 0, outflowDirty = 0;
    summary.rows.forEach((r) => { inflowClean += r.cin; inflowDirty += r.din; outflowClean += r.cout; outflowDirty += r.dout; });
    const totalInflow = inflowClean + inflowDirty;
    const totalOutflow = outflowClean + outflowDirty;
    return { inflowClean, inflowDirty, outflowClean, outflowDirty, totalInflow, totalOutflow, netFlow: totalInflow - totalOutflow };
  }, [summary]);
  const sgn = (n) => (n > 0 ? "+" : n < 0 ? "-" : "") + cedi(Math.abs(n));
  const reconciles = BigInt(summary.opening_dirty) + BigInt(summary.net_dirty) === BigInt(p.dirty) && BigInt(summary.opening_clean) + BigInt(summary.net_clean) === BigInt(p.clean);

  const formatDate = (ts) => {
    const d = new Date(ts * 1000);
    return d.toLocaleString("en-GB", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-3 pb-8" data-testid="cash-statement-screen">
      <SectionTitle
        kicker="Rolling 30-Day Financial Ledger & Audit"
        title="Syndicate Cash Statement"
        right={
          <Chip className="border-gold text-gold font-mono font-bold">
            {transactions.length} Records (30D)
          </Chip>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-2">
        <Card accent={stats.netFlow >= 0 ? "green" : "red"}>
          <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
            Net Cash Flow
          </div>
          <div
            className={`font-display text-lg leading-tight mt-0.5 ${
              stats.netFlow >= 0 ? "text-kgreen" : "text-blood"
            }`}
            data-testid="statement-net-flow"
          >
            {sgn(stats.netFlow)}
          </div>
          <div className="text-[9px] text-zinc-500 mt-1">Last 30 days</div>
        </Card>

        <Card accent="green">
          <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3 text-kgreen" /> Inflows
          </div>
          <div className="font-display text-lg leading-tight text-kgreen mt-0.5" data-testid="statement-total-inflows">
            +{cedi(stats.totalInflow)}
          </div>
          <div className="text-[9px] text-zinc-500 mt-1">
            {cedi(stats.inflowClean)} clean
          </div>
        </Card>

        <Card accent="none">
          <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1">
            <ArrowDownRight className="h-3 w-3 text-blood" /> Outflows
          </div>
          <div className="font-display text-lg leading-tight text-blood mt-0.5" data-testid="statement-total-outflows">
            -{cedi(stats.totalOutflow)}
          </div>
          <div className="text-[9px] text-zinc-500 mt-1">
            {cedi(stats.outflowClean)} clean
          </div>
        </Card>
      </div>

      {/* DAILY CREW PAYROLL BAR */}
      <div className="flex items-center justify-between rounded border border-zinc-800 bg-surface px-3 py-2 text-xs" data-testid="statement-payroll-bar">
        <span className="text-zinc-400 font-medium">Daily Crew Payroll (Deducted at midnight):</span>
        <span className="font-mono font-bold text-gold">GH₵{(d?.crew_daily_payroll || 0).toLocaleString()} / day</span>
      </div>

      {/* Net clean / dirty + reconciliation */}
      <div className="grid grid-cols-2 gap-2" data-testid="statement-net">
        <Card accent="green">
          <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Net clean (30d)</div>
          <div className={`font-display text-base ${summary.net_clean >= 0 ? "text-kgreen" : "text-blood"}`} data-testid="statement-net-clean">{sgn(summary.net_clean)}</div>
          <div className="text-[9px] text-zinc-500">in {cedi(stats.inflowClean)} · out {cedi(stats.outflowClean)}</div>
        </Card>
        <Card accent="gold">
          <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Net dirty (30d)</div>
          <div className={`font-display text-base ${summary.net_dirty >= 0 ? "text-kgreen" : "text-blood"}`} data-testid="statement-net-dirty">{sgn(summary.net_dirty)}</div>
          <div className="text-[9px] text-zinc-500">in {cedi(stats.inflowDirty)} · out {cedi(stats.outflowDirty)}</div>
        </Card>
      </div>
      <div className="rounded border border-zinc-800 bg-zinc-950/60 p-2 text-[10px] text-zinc-400" data-testid="statement-reconcile" data-ok={reconciles ? "1" : "0"}>
        <div className="font-bold uppercase tracking-wider text-zinc-300 mb-0.5">Reconciliation {reconciles ? "✓ balanced" : "✗ mismatch"}</div>
        <div className="font-mono">Clean: opening {cedi(summary.opening_clean)} {sgn(summary.net_clean)} = {cedi(p.clean)} now</div>
        <div className="font-mono">Dirty: opening {cedi(summary.opening_dirty)} {sgn(summary.net_dirty)} = {cedi(p.dirty)} now</div>
      </div>

      {/* Totals by category */}
      <div className="rounded border border-zinc-800 bg-surface" data-testid="statement-categories">
        <button className="flex w-full min-h-[44px] items-center justify-between px-2.5 text-[11px] font-bold uppercase tracking-wider text-zinc-300" onClick={() => setShowCats((v) => !v)}>
          <span>Totals by category ({summary.rows.length})</span><span className="text-zinc-500">{showCats ? "Hide" : "Show"}</span>
        </button>
        {showCats && (
          <div className="divide-y divide-zinc-800/80 border-t border-zinc-800">
            <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-2.5 py-1 text-[9px] uppercase text-zinc-500"><span>Category</span><span className="w-20 text-right">Clean</span><span className="w-20 text-right">Dirty</span></div>
            {summary.rows.length === 0 && <div className="px-2.5 py-2 text-[10px] text-zinc-500">No cash movements yet.</div>}
            {summary.rows.map((r) => (
              <button key={r.category} onClick={() => setCategoryFilter(r.category)} className="grid w-full grid-cols-[1fr_auto_auto] gap-2 px-2.5 py-1.5 text-left text-[11px]" data-testid={`statement-cat-${r.category.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}>
                <span className="truncate text-zinc-200">{r.category}</span>
                <span className={`w-20 text-right font-mono ${r.net_clean > 0 ? "text-kgreen" : r.net_clean < 0 ? "text-blood" : "text-zinc-600"}`}>{r.net_clean ? sgn(r.net_clean) : "—"}</span>
                <span className={`w-20 text-right font-mono ${r.net_dirty > 0 ? "text-kgreen" : r.net_dirty < 0 ? "text-blood" : "text-zinc-600"}`}>{r.net_dirty ? sgn(r.net_dirty) : "—"}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 border-y border-zinc-800/80 py-2 text-[10px]">
        <div className="flex flex-wrap gap-1">
          {[
            ["all", "All Flows"],
            ["inflow", "Inflows (+)"],
            ["outflow", "Outflows (-)"],
            ["clean", "Clean Only"],
            ["dirty", "Dirty Only"],
          ].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilterType(k)}
              className={`px-2 py-0.5 rounded font-extrabold uppercase tracking-wider border ${
                filterType === k
                  ? "border-gold bg-gold text-ink"
                  : "border-zinc-800 bg-surface text-zinc-400 hover:text-zinc-200"
              }`}
              data-testid={`filter-${k}`}
            >
              {label}
            </button>
          ))}
        </div>

        {categories.length > 2 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-zinc-800 bg-ink px-2 py-1 text-[10px] text-zinc-300 outline-none focus:border-gold"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All Categories" : c}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Transactions List */}
      <div className="space-y-1.5" data-testid="statement-transactions-list">
        {filtered.length === 0 ? (
          <div className="rounded border border-zinc-800 bg-surface p-6 text-center text-zinc-500">
            <Receipt className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
            <div className="font-display uppercase text-sm text-zinc-400">
              No Cash Flow Records Found
            </div>
            <p className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto">
              Transactions are logged in real-time whenever money moves through street hustles, heists, laundering, payroll, upgrades, or the betting exchange. Records automatically retain 30 days of activity.
            </p>
          </div>
        ) : (
          filtered.map((tx) => {
            const isInflow = tx.amount > 0;
            const isClean = tx.currency === "clean";

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between gap-2 border border-zinc-800/80 bg-zinc-950/60 p-2.5 text-xs rounded hover:border-zinc-700"
                data-testid={`statement-row-${tx.id}`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-mono px-1 rounded uppercase font-bold ${
                        isClean
                          ? "bg-kgreen/15 text-kgreen border border-kgreen/30"
                          : "bg-gold/15 text-gold border border-gold/30"
                      }`}
                    >
                      {tx.currency}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-zinc-400">
                      {tx.category}
                    </span>
                    <span className="text-[9px] text-zinc-600 font-mono">
                      {formatDate(tx.t)}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-200 mt-0.5 truncate font-medium">
                    {tx.description}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`font-display text-sm font-bold font-mono ${
                      isInflow ? "text-kgreen" : "text-blood"
                    }`}
                  >
                    {isInflow ? "+" : "-"}
                    {cedi(Math.abs(tx.amount))}
                  </div>
                  <div className="text-[9px] text-zinc-500 capitalize">
                    {isClean ? "Clean Cedi" : "Dirty Cash"}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
