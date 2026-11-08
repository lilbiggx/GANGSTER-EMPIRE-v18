import React, { useState } from "react";
import { Siren, Coins, Lock, AlertTriangle, Scale } from "lucide-react";
import { cedi, dur } from "../../lib/fmt";
import { Btn } from "./ui";
import { useConfirm } from "./ConfirmContext";

export default function ArrestModal({ open, player, now, act }) {
  const { confirmAction } = useConfirm();
  if (!open || !player) return null;

  const arrestTimeLeft = Math.max(0, (player.arrested_until || 0) - now);
  const cleanN = Number(player.clean || 0);
  const dirtyN = Number(player.dirty || 0);
  
  const bailClean = Math.floor(cleanN / 3);
  const bailDirty = Math.floor(dirtyN / 2);
  const lawyers = player.inv?.lawyer || 0;

  const canClean = bailClean > 0 && cleanN >= bailClean;
  const canDirty = bailDirty > 0 && dirtyN >= bailDirty;
  const canLawyer = lawyers > 0;
  const canBail = canClean || canDirty || canLawyer;

  const handlePayBribe = (method) => {
    const costText =
      method === "lawyer"
        ? "1 Lawyer Shield"
        : method === "dirty"
        ? `GH₵${bailDirty.toLocaleString()} Dirty`
        : `GH₵${bailClean.toLocaleString()} Clean`;

    confirmAction(
      "Pay Bribe",
      `Pay ${costText} to secure immediate release?`,
      () => act("post_bail", { method })
    );
  };

  return (
    <div
      className="absolute inset-0 z-[90] flex flex-col items-center justify-center bg-black/95 p-6 text-center backdrop-blur-xl animate-fade-in"
      data-testid="arrest-modal"
    >
      <div className="w-full max-w-sm border-2 border-blood bg-surface p-6 shadow-2xl relative overflow-hidden space-y-4">
        {/* Background glow & stripes */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ff1e38_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blood/20 border border-blood animate-pulse">
          <Siren className="h-7 w-7 text-blood animate-spin" style={{ animationDuration: "3s" }} />
        </div>

        <div className="space-y-1">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blood flex items-center justify-center gap-1">
            <Lock className="h-3 w-3" /> Ghana Police Service
          </div>
          <h2 className="font-display text-2xl uppercase tracking-wider text-zinc-100">
            You Are Arrested!
          </h2>
          <p className="text-xs text-zinc-400">
            You are locked in a holding cell and cannot perform operations until your sentence expires or you pay a bribe.
          </p>
        </div>

        {/* Countdown Box */}
        <div className="bg-black/60 border border-zinc-800 p-2.5 space-y-0.5">
          <div className="text-[9px] uppercase text-zinc-500 font-bold tracking-wider">Time Until Release</div>
          <div className="font-display text-2xl text-gold font-black tracking-widest">
            {dur(arrestTimeLeft)}
          </div>
        </div>

        {/* Pay Bribe Section */}
        <div className="space-y-2 pt-2">
          <div className="text-xs font-display uppercase tracking-widest text-gold font-bold">
            Pay Bribe
          </div>

          <div className="space-y-2">
            <Btn
              variant={canClean ? "green" : "ghost"}
              className="w-full py-4 text-sm flex items-center justify-between px-4 font-bold border-2"
              onClick={() => handlePayBribe("clean")}
              disabled={!canClean}
              data-testid="post-bail-clean-btn"
            >
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-emerald-400" />
                <span>Pay Clean</span>
              </div>
              <span className="font-mono text-emerald-400 font-black text-lg">{cedi(bailClean)}</span>
            </Btn>

            <Btn
              variant={canDirty ? "gold" : "ghost"}
              className="w-full py-4 text-sm flex items-center justify-between px-4 font-bold border-2"
              onClick={() => handlePayBribe("dirty")}
              disabled={!canDirty}
              data-testid="post-bail-dirty-btn"
            >
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-amber-400" />
                <span>Pay Dirty</span>
              </div>
              <span className="font-mono text-amber-400 font-black text-lg">{cedi(bailDirty)}</span>
            </Btn>

            {canLawyer && (
              <Btn
                variant="ghost"
                className="w-full py-2.5 text-xs flex items-center justify-between px-4 border-zinc-700 text-zinc-200"
                onClick={() => handlePayBribe("lawyer")}
                data-testid="post-bail-lawyer-btn"
              >
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-sky-400" />
                  <span>Use Lawyer Shield</span>
                </div>
                <span className="font-mono text-zinc-400">1 Available</span>
              </Btn>
            )}
          </div>

          {!canBail && (
            <div className="text-[10px] text-blood font-bold uppercase flex items-center justify-center gap-1 pt-1">
              <AlertTriangle className="h-3 w-3" /> Insufficient funds for bribe. Wait for timer to release.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
