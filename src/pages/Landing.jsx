import React, { useState } from "react";
import { TEST_TOOLS } from "../lib/devMode";
import { Link } from "react-router-dom";
import { Banknote, Flame, ShieldCheck, Users, WifiOff, Trophy, Zap, Shield, Play } from "lucide-react";
import { useGame } from "../store/game";

const FEATURES = [
  { icon: Banknote, title: "Wash dirty cedis", text: "Run hustles, then clean the money through chop bars, MoMo kiosks and trotro fleets." },
  { icon: Flame, title: "Heat tiers 1-5", text: "From police patrol to National Bureau. Bribe, lie low or call your lawyer." },
  { icon: Users, title: "Crew & heists", text: "Hackers, drivers, enforcers, infiltrators. Each with strengths and flaws." },
  { icon: ShieldCheck, title: "Fair raids", text: "Warnings before every raid, vault money is safe, shields after you get hit." },
  { icon: Trophy, title: "Turf seasons", text: "Monthly city control, leaderboards and PvP only against people your size." },
  { icon: WifiOff, title: "100% Offline Capable", text: "Runs directly in your browser. All alone features active without server lag." },
];

export default function Landing() {
  const { createOfflineBoss } = useGame();
  const [showPresets, setShowPresets] = useState(false);

  const startPreset = (preset, name) => {
    createOfflineBoss(name, "dockside", preset);
  };

  return (
    <div className="mx-auto min-h-[100dvh] w-full max-w-[480px] bg-ink" data-testid="landing-page">
      <div className="kente h-2" />
      <section className="relative isolate overflow-hidden px-6 pb-8 pt-12 grain">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-blood rise">Accra Edition · 18+</span>
          <span className="border border-gold/40 bg-gold/10 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-gold">Offline Bypass Active</span>
        </div>

        <h1 className="relative z-10 font-display mt-3 text-5xl uppercase leading-[0.95] text-zinc-100 rise sm:text-6xl" style={{ animationDelay: "60ms" }}>
          Underworld<br /><span className="text-gold">Empire</span>
        </h1>
        <p className="mt-4 max-w-xs text-sm text-zinc-400 rise" style={{ animationDelay: "120ms" }}>
          Chale, the city no dey sleep. Start with one okada run, end up running Dockside to Hills Estate.
        </p>

        {/* Primary Offline Testing Bypass Buttons */}
        <div className="mt-6 flex flex-col gap-2.5 rise" style={{ animationDelay: "180ms" }}>
          <button
            onClick={() => startPreset("newbie", "Kofi Bullet")}
            data-testid="landing-quick-play-btn"
            className="btn-press hard-shadow flex items-center justify-center gap-2 bg-gold px-6 py-4 font-display text-xl uppercase tracking-wider text-ink transition-transform"
          >
            <Zap className="h-6 w-6" /> Quick Play (Offline Boss)
          </button>

          {TEST_TOOLS && (
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="border border-zinc-700 bg-surface px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:border-gold hover:text-gold"
          >
            {showPresets ? "Hide Test Presets ▴" : "⚡ Choose Test Preset (Rookie / Mid / Kingpin) ▾"}
          </button>
          )}

          {TEST_TOOLS && showPresets && (
            <div className="grid gap-2 border border-zinc-800 bg-[#161616] p-3 text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Select Test Setup:</div>
              <button
                onClick={() => startPreset("newbie", "Kofi Starter")}
                className="flex items-center justify-between border border-zinc-800 bg-surface p-2.5 hover:border-gold"
              >
                <div>
                  <div className="font-display text-sm uppercase text-zinc-200">🔰 Rookie Hustler</div>
                  <div className="text-[10px] text-zinc-500">Level 0 · GH₵0 Cash · Start with Nothing</div>
                </div>
                <Play className="h-4 w-4 text-gold" />
              </button>

              <button
                onClick={() => startPreset("mid", "Kwame General")}
                className="flex items-center justify-between border border-zinc-800 bg-surface p-2.5 hover:border-gold"
              >
                <div>
                  <div className="font-display text-sm uppercase text-gold">⚔️ Street General</div>
                  <div className="text-[10px] text-zinc-500">Level 12 · GH₵500K · 4 Crew · Fronts & Guns</div>
                </div>
                <Play className="h-4 w-4 text-gold" />
              </button>

              <button
                onClick={() => startPreset("kingpin", "Kingpin Shatta")}
                className="flex items-center justify-between border border-zinc-800 bg-surface p-2.5 hover:border-gold"
              >
                <div>
                  <div className="font-display text-sm uppercase text-kgreen">👑 Underworld Kingpin</div>
                  <div className="text-[10px] text-zinc-500">Level 100 · GH₵50M Dirty / 100M Clean · Max Gear</div>
                </div>
                <Play className="h-4 w-4 text-kgreen" />
              </button>
            </div>
          )}

          <Link
            to="/onboarding"
            data-testid="landing-custom-btn"
            className="border border-zinc-700 bg-transparent px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-gold"
          >
            Create Custom Boss & Pick District
          </Link>
        </div>

        <div className="font-display pointer-events-none absolute -right-6 top-10 -z-10 select-none text-[150px] leading-none text-zinc-900/70">
          GH₵
        </div>
      </section>

      <section className="grid gap-px border-y border-zinc-800 bg-zinc-800">
        {FEATURES.map((f, i) => (
          <div key={f.title} className="flex gap-4 bg-ink px-6 py-4 rise" style={{ animationDelay: `${200 + i * 40}ms` }}>
            <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
            <div>
              <div className="font-display text-base uppercase text-zinc-100">{f.title}</div>
              <div className="text-xs text-zinc-400">{f.text}</div>
            </div>
          </div>
        ))}
      </section>

      <footer className="px-6 py-6 text-[11px] text-zinc-600">
        Accra Edition. Fictional city, fictional crime, real fun. All standalone features fully unlocked for testing.
      </footer>
      <div className="kente h-2" />
    </div>
  );
}
