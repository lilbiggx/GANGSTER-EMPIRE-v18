import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  Coins,
  TrendingUp,
  History,
  AlertCircle,
  Sparkles,
  Dice5,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCw,
} from "lucide-react";
import { useGame } from "../../../store/game";
import { cedi, big, fmt } from "../../../lib/fmt";
import { Btn, Card, SectionTitle, Chip } from "../../../components/game/ui";
import { BETTING_TIERS, BETTING_CONFIG } from "../../../data/gameData";

export default function Betting() {
  const { player: p, act } = useGame();
  const [currency, setCurrency] = useState("dirty"); // "dirty" | "clean"
  const [stakeInput, setStakeInput] = useState("500");
  const [selectedMultiplier, setSelectedMultiplier] = useState(2.0);
  const [lastResult, setLastResult] = useState(null);

  // 3-Second countdown & pop-up modal anticipation states
  const [countdown, setCountdown] = useState(null); // null | 3 | 2 | 1 | 0
  const [isRolling, setIsRolling] = useState(false);
  const [pendingBetInfo, setPendingBetInfo] = useState(null);
  const [resultModal, setResultModal] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // v9: free-form stake. Validated against the minimum, the table maximum and what the player can afford.
  const minStake = BETTING_CONFIG.min_stake;
  const maxStake = BETTING_CONFIG.max_stake_base;
  const parsedStake = /^\d+$/.test(String(stakeInput).trim()) ? parseInt(stakeInput, 10) : NaN;
  const stake = Number.isFinite(parsedStake) ? parsedStake : 0;
  const selectedTier =
    BETTING_TIERS.find((t) => t.multiplier === selectedMultiplier) ||
    BETTING_TIERS[2];

  // Financial calculations
  const grossWin = Math.floor(stake * selectedTier.multiplier);
  const feeAmt = Math.floor(grossWin * BETTING_CONFIG.take_rate);
  const netCleanPayout = grossWin - feeAmt;

  const currentBalance = currency === "clean" ? BigInt(p.clean) : BigInt(p.dirty);
  const canAfford = currentBalance >= BigInt(stake);
  const affordMax = Number(currentBalance < BigInt(maxStake) ? currentBalance : BigInt(maxStake));
  const stakeError = !Number.isFinite(parsedStake)
    ? "Enter a whole number of cedis"
    : stake < minStake
    ? `Minimum stake is ${cedi(minStake)}`
    : stake > maxStake
    ? `Table maximum is ${cedi(maxStake)}`
    : !canAfford
    ? `You only have ${cedi(currentBalance.toString())} ${currency}`
    : null;

  const handleInitiateBet = () => {
    if (stakeError) {
      toast.error(stakeError);
      return;
    }
    if (stake < 100) {
      toast.error("Minimum stake is GH₵100 cedis.");
      return;
    }

    const betInfo = {
      stake,
      currency,
      multiplier: selectedMultiplier,
      tier: selectedTier,
      grossWin,
      netCleanPayout,
      feeAmt,
    };
    setPendingBetInfo(betInfo);
    setIsRolling(true);
    setCountdown(3);

    let count = 3;
    timerRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setCountdown(0);

        // Execute the authoritative bet in the engine
        act(
          "bet_place",
          {
            stake: betInfo.stake,
            currency: betInfo.currency,
            multiplier: betInfo.multiplier,
            stake_amount: betInfo.stake,
            stake_currency: betInfo.currency,
          },
          {
            onResult: (res) => {
              setIsRolling(false);
              setCountdown(null);
              setLastResult(res);
              setResultModal(res);
              if (res.won) {
                toast.success(
                  `WAGER WON! +${cedi(res.payout)} Clean Cedis collected! (10% Operator Take: ${cedi(res.fee)})`
                );
              } else {
                toast.error(`Wager lost. Forfeited ${cedi(betInfo.stake)} (${betInfo.currency}).`);
              }
            },
          }
        );
      }
    }, 1000);
  };

  const betHistory = p.betting?.history || [];

  return (
    <div className="space-y-3 pb-8" data-testid="underground-betting-screen">
      <SectionTitle
        kicker="Underground Syndicate Wagering · High Stakes High Volatility"
        title="Betting Exchange (GDD)"
        right={
          <Chip className="border-gold text-gold font-mono font-bold">
            10% Operator Take
          </Chip>
        }
      />

      {/* Rules Notice */}
      <div className="rounded border border-zinc-800 bg-surface p-2.5 text-xs text-zinc-300">
        <div className="flex items-center gap-1.5 font-bold text-gold uppercase tracking-wider">
          <Dice5 className="h-4 w-4 text-gold" /> Dual-Currency Betting Rules
        </div>
        <p className="mt-1 text-[11px] text-zinc-400">
          Stake either Dirty Cash or Clean Cedis. On a winning outcome, a 10% operator take is deducted from gross winnings, and payouts are disbursed strictly in <b className="text-kgreen">Clean Cedis</b>. Losing bets forfeit the stake with ₵0 payout and zero fee.
        </p>
      </div>

      {/* Betting Form */}
      <Card accent="gold">
        <div className="space-y-3">
          {/* Stake Currency Toggle */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Stake Currency
            </label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isRolling}
                onClick={() => setCurrency("dirty")}
                className={`py-2 px-3 text-xs font-bold uppercase border rounded text-center transition-all ${
                  currency === "dirty"
                    ? "border-gold bg-gold text-ink"
                    : "border-zinc-800 bg-ink text-zinc-400 hover:border-zinc-700"
                } ${isRolling ? "opacity-50 cursor-not-allowed" : ""}`}
                data-testid="stake-currency-dirty"
              >
                Dirty Cedis ({cedi(p.dirty)})
              </button>
              <button
                type="button"
                disabled={isRolling}
                onClick={() => setCurrency("clean")}
                className={`py-2 px-3 text-xs font-bold uppercase border rounded text-center transition-all ${
                  currency === "clean"
                    ? "border-kgreen bg-kgreen text-ink"
                    : "border-zinc-800 bg-ink text-zinc-400 hover:border-zinc-700"
                } ${isRolling ? "opacity-50 cursor-not-allowed" : ""}`}
                data-testid="stake-currency-clean"
              >
                Clean Cedis ({cedi(p.clean)})
              </button>
            </div>
          </div>

          {/* Stake Amount */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              <span>Stake ({fmt(minStake)} – {fmt(maxStake)})</span>
              <span>Available: {cedi(currency === "clean" ? p.clean : p.dirty)}</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                step={1}
                min={minStake}
                max={maxStake}
                aria-label="Stake amount"
                aria-invalid={!!stakeError}
                disabled={isRolling}
                value={stakeInput}
                onChange={(e) => setStakeInput(e.target.value)}
                className={`w-full border ${stakeError ? "border-blood" : "border-zinc-700"} bg-ink px-3 py-2 text-base font-bold text-zinc-100 outline-none focus:border-gold rounded font-mono disabled:opacity-50`}
                data-testid="bet-stake-input"
              />
              <div className="flex gap-1">
                {[500, 2000, 10000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    disabled={isRolling}
                    onClick={() => setStakeInput(v.toString())}
                    data-testid={`bet-preset-${v}`}
                    className="border border-zinc-800 bg-zinc-900 px-2 py-1 text-[10px] text-zinc-300 font-bold hover:border-gold disabled:opacity-50"
                  >
                    {v >= 1000 ? `${v / 1000}k` : v}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={isRolling || affordMax < minStake}
                  onClick={() => setStakeInput(String(affordMax))}
                  data-testid="bet-preset-max"
                  title="Largest stake you can afford (up to the table maximum)"
                  className="border border-zinc-800 bg-zinc-900 px-2 py-1 text-[10px] text-gold font-bold hover:border-gold disabled:opacity-50"
                >
                  Max
                </button>
              </div>
            </div>
          </div>

          {stakeError && (
            <div className="-mt-1 text-[11px] text-blood" data-testid="bet-stake-error">{stakeError}</div>
          )}

          {/* Odds Tiers Grid */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1 block">
              Select Multiplier Tier & Win Probability
            </label>
            <div className="grid grid-cols-3 gap-1.5" data-testid="bet-tiers-grid">
              {BETTING_TIERS.map((tier) => {
                const isSelected = selectedMultiplier === tier.multiplier;
                return (
                  <button
                    key={tier.multiplier}
                    type="button"
                    disabled={isRolling}
                    onClick={() => setSelectedMultiplier(tier.multiplier)}
                    className={`p-2 rounded border text-left transition-all ${
                      isSelected
                        ? "border-gold bg-gold/15 shadow-sm shadow-gold/20"
                        : "border-zinc-800 bg-ink hover:border-zinc-700"
                    } ${isRolling ? "opacity-50 cursor-not-allowed" : ""}`}
                    data-testid={`bet-tier-${tier.multiplier}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-base text-gold font-bold">
                        {tier.multiplier}x
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-zinc-400">
                        {tier.label}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                      Win: {(tier.probability * 100).toFixed(1)}%
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payout Calculation Ledger */}
          <div className="rounded border border-zinc-800 bg-ink/80 p-2.5 text-xs space-y-1">
            <div className="flex justify-between text-zinc-400 text-[11px]">
              <span>Stake Amount:</span>
              <span className="font-mono text-zinc-200">{cedi(stake)} ({currency})</span>
            </div>
            <div className="flex justify-between text-zinc-400 text-[11px]">
              <span>Gross Winning Payout ({selectedTier.multiplier}x):</span>
              <span className="font-mono text-gold">{cedi(grossWin)}</span>
            </div>
            <div className="flex justify-between text-zinc-400 text-[11px]">
              <span>10% Operator Take Fee:</span>
              <span className="font-mono text-blood">-{cedi(feeAmt)}</span>
            </div>
            <div className="border-t border-zinc-800 pt-1 flex justify-between font-bold text-sm">
              <span className="text-kgreen">Net Clean Payout on Win:</span>
              <span className="font-mono text-kgreen" data-testid="bet-net-payout">
                +{cedi(netCleanPayout)} Clean Cedis
              </span>
            </div>
          </div>

          {/* Place Bet Action Button */}
          <Btn
            variant={canAfford && !isRolling ? "gold" : "ghost"}
            disabled={!!stakeError || isRolling}
            onClick={handleInitiateBet}
            className="w-full py-3 text-sm font-display tracking-wider"
            data-testid="place-bet-btn"
          >
            {isRolling ? (
              <span className="flex items-center justify-center gap-2">
                <Dice5 className="h-4 w-4 animate-spin text-gold" />
                Rolling Underground Wager... ({countdown}s)
              </span>
            ) : !stakeError ? (
              `Place Bet (${cedi(stake)} ${currency})`
            ) : !canAfford && stake >= minStake ? (
              "Insufficient Funds"
            ) : (
              "Enter a valid stake"
            )}
          </Btn>
        </div>
      </Card>

      {/* 3-Second Anticipation Suspense Modal */}
      {isRolling && countdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-lg border-2 border-gold bg-zinc-950 p-6 text-center shadow-2xl shadow-gold/30 space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-gold">
              <Dice5 className="h-5 w-5 animate-spin text-gold" />
              Underground Syndicate Wager
            </div>

            {/* Suspense Countdown Number */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="h-28 w-28 rounded-full border-4 border-gold/40 flex items-center justify-center bg-gold/10 animate-pulse shadow-inner shadow-gold/40">
                <span className="font-display text-6xl text-gold font-extrabold tracking-tight">
                  {countdown === 0 ? "..." : countdown}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-display text-lg uppercase text-zinc-100 tracking-wide">
                {countdown === 3 && "Shaking the Gold Dice Cup..."}
                {countdown === 2 && "Dice Rolling Across the Felt..."}
                {countdown === 1 && "Pit Boss Revealing the Roll..."}
                {countdown === 0 && "Authorizing Syndicate Payout..."}
              </div>
              <p className="text-xs text-zinc-400">
                Holding breath for {pendingBetInfo?.multiplier}x odds
              </p>
            </div>

            {/* Wager Summary Box */}
            <div className="rounded border border-zinc-800 bg-ink p-2.5 text-xs text-zinc-300 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Locked Stake</span>
                <b className="font-mono text-zinc-200">
                  {cedi(pendingBetInfo?.stake)} ({pendingBetInfo?.currency})
                </b>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 uppercase block">Potential Clean Win</span>
                <b className="font-mono text-kgreen font-bold">
                  +{cedi(pendingBetInfo?.netCleanPayout)} Clean
                </b>
              </div>
            </div>

            <div className="text-[10px] text-zinc-500 uppercase tracking-widest animate-pulse">
              ● Live Syndicate Exchange Resolution ●
            </div>
          </div>
        </div>
      )}

      {/* Result Pop-Up Modal */}
      {resultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
          <div
            className={`w-full max-w-sm rounded-lg border-2 bg-zinc-950 p-6 text-center shadow-2xl space-y-4 ${
              resultModal.won
                ? "border-kgreen shadow-kgreen/25"
                : "border-blood shadow-blood/25"
            }`}
            data-testid="bet-result-modal"
          >
            {/* Header Icon & Title */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`h-16 w-16 rounded-full flex items-center justify-center ${
                  resultModal.won
                    ? "bg-kgreen/20 text-kgreen border-2 border-kgreen/50 shadow-lg shadow-kgreen/30 animate-bounce"
                    : "bg-blood/20 text-blood border-2 border-blood/50"
                }`}
              >
                {resultModal.won ? (
                  <Sparkles className="h-9 w-9" />
                ) : (
                  <XCircle className="h-9 w-9" />
                )}
              </div>
              <div>
                <div
                  className={`font-display text-2xl uppercase tracking-wider ${
                    resultModal.won ? "text-kgreen font-extrabold" : "text-blood font-extrabold"
                  }`}
                >
                  {resultModal.won ? "Wager Won!" : "Wager Lost!"}
                </div>
                <div className="text-xs text-zinc-400">
                  {resultModal.won
                    ? "Clean Cedis Disbursed to Syndicate Account"
                    : "Stake Forfeited to the Syndicate House"}
                </div>
              </div>
            </div>

            {/* Main Payout Callout */}
            <div
              className={`rounded border p-3 ${
                resultModal.won
                  ? "border-kgreen/40 bg-kgreen/10"
                  : "border-blood/40 bg-blood/10"
              }`}
            >
              <div className="text-[10px] uppercase font-bold text-zinc-400">
                {resultModal.won ? "Net Clean Payout Credited" : "Forfeited Stake"}
              </div>
              <div
                className={`font-display text-3xl font-extrabold ${
                  resultModal.won ? "text-kgreen" : "text-blood"
                }`}
              >
                {resultModal.won ? `+${cedi(resultModal.payout)}` : `-${cedi(resultModal.stake)}`}
              </div>
              <div className="text-[11px] text-zinc-300 mt-0.5">
                {resultModal.won ? "Strictly Clean Cedis" : `${resultModal.currency?.toUpperCase()} Cash`}
              </div>
            </div>

            {/* Financial Ledger Breakdown */}
            <div className="rounded border border-zinc-800 bg-ink p-3 text-xs space-y-1.5 text-left">
              <div className="flex justify-between text-zinc-400">
                <span>Wagered Stake:</span>
                <span className="font-mono text-zinc-200">
                  {cedi(resultModal.stake)} ({resultModal.currency})
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Selected Odds:</span>
                <span className="font-mono text-gold font-bold">
                  {resultModal.multiplier}x Multiplier
                </span>
              </div>
              {resultModal.won ? (
                <>
                  <div className="flex justify-between text-zinc-400">
                    <span>Gross Winnings:</span>
                    <span className="font-mono text-zinc-200">
                      {cedi(resultModal.grossPayout || resultModal.stake * resultModal.multiplier)}
                    </span>
                  </div>
                  <div className="flex justify-between text-blood">
                    <span>10% Operator Take:</span>
                    <span className="font-mono">-{cedi(resultModal.fee)}</span>
                  </div>
                  <div className="border-t border-zinc-800 pt-1 flex justify-between font-bold text-kgreen">
                    <span>Net Clean Cedis:</span>
                    <span className="font-mono">+{cedi(resultModal.payout)} Clean</span>
                  </div>
                </>
              ) : (
                <div className="border-t border-zinc-800 pt-1 flex justify-between font-bold text-blood">
                  <span>Net Loss:</span>
                  <span className="font-mono">-{cedi(resultModal.stake)}</span>
                </div>
              )}
              {resultModal.roll !== undefined && (
                <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-800/60 font-mono">
                  Roll: {(resultModal.roll * 100).toFixed(1)}% (Target: &lt;= {((resultModal.target || 0.5) * 100).toFixed(1)}%)
                </div>
              )}
            </div>

            {/* Dismiss / Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Btn
                variant="ghost"
                onClick={() => setResultModal(null)}
                className="w-full text-xs py-2.5"
              >
                Close
              </Btn>
              <Btn
                variant={resultModal.won ? "kgreen" : "gold"}
                onClick={() => setResultModal(null)}
                className="w-full text-xs py-2.5 font-bold"
                data-testid="bet-modal-continue-btn"
              >
                {resultModal.won ? "Collect & Continue" : "Try Again"}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* Last Result Card */}
      {lastResult && (
        <div
          className={`p-3 rounded border flex items-center justify-between text-xs ${
            lastResult.won
              ? "border-kgreen bg-kgreen/10 text-kgreen"
              : "border-blood bg-blood/10 text-blood"
          }`}
          data-testid="bet-last-result"
        >
          <div className="flex items-center gap-2">
            {lastResult.won ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 shrink-0" />
            )}
            <div>
              <div className="font-bold uppercase tracking-wider">
                {lastResult.won ? "WINNING WAGER!" : "BET LOST"}
              </div>
              <div className="text-[11px] text-zinc-300">
                {lastResult.won
                  ? `Roll: ${((lastResult.roll || 0) * 100).toFixed(1)}% <= ${((lastResult.target || 0.5) * 100).toFixed(1)}%. Net Payout: +${cedi(lastResult.payout)} Clean Cedis (10% Fee: ${cedi(lastResult.fee)}).`
                  : `Roll: ${((lastResult.roll || 0) * 100).toFixed(1)}% > ${((lastResult.target || 0.5) * 100).toFixed(1)}%. Stake of ${cedi(lastResult.stake)} forfeited.`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bet History Ledger */}
      <SectionTitle
        kicker="Exchange Transaction Ledger"
        title="Bet History"
        right={<Chip>{betHistory.length} Recorded</Chip>}
      />

      <div className="space-y-1.5" data-testid="bet-history-list">
        {betHistory.length === 0 ? (
          <div className="rounded border border-zinc-800 bg-surface p-4 text-center text-xs text-zinc-500">
            No bets placed yet. Choose your stake and multiplier tier above.
          </div>
        ) : (
          betHistory.map((item, idx) => {
            const dateStr = new Date((item.created_at || item.t || 0) * 1000).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            const isWon = item.won !== undefined ? item.won : item.outcome === "WIN";
            const itemStake = item.stake || item.stake_amount || 0;
            const itemCurrency = item.currency || item.stake_currency || "dirty";
            const itemPayout = item.payout || item.net_clean_payout || 0;
            const itemFee = item.fee || item.take_amount || 0;
            const itemRoll = item.roll !== undefined ? item.roll : 0.5;

            return (
              <div
                key={idx}
                className="flex items-center justify-between border border-zinc-800/80 bg-zinc-950/60 p-2 text-xs rounded"
                data-testid={`bet-history-item-${idx}`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] px-1 rounded font-bold uppercase ${
                        isWon
                          ? "bg-kgreen/15 text-kgreen border border-kgreen/30"
                          : "bg-blood/15 text-blood border border-blood/30"
                      }`}
                    >
                      {isWon ? "WON" : "LOST"}
                    </span>
                    <span className="font-bold text-zinc-200 font-mono">
                      {item.multiplier}x
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Stake: {cedi(itemStake)} ({itemCurrency})
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">
                    {dateStr} · Roll: {(itemRoll * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="text-right">
                  {isWon ? (
                    <div>
                      <div className="font-mono text-kgreen font-bold text-sm">
                        +{cedi(itemPayout)}
                      </div>
                      <div className="text-[9px] text-zinc-500">
                        Clean (Fee: {cedi(itemFee)})
                      </div>
                    </div>
                  ) : (
                    <div className="font-mono text-blood font-bold text-sm">
                      -{cedi(itemStake)}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
