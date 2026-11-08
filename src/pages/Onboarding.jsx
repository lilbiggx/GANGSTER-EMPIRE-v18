import React, { useState } from "react";
import { TEST_TOOLS } from "../lib/devMode";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useGame } from "../store/game";
import { Btn } from "../components/game/ui";

export default function Onboarding() {
  const navigate = useNavigate();
  const config = useGame((s) => s.config);
  const createOfflineBoss = useGame((s) => s.createOfflineBoss);

  const [name, setName] = useState("Kojo Bullet");
  const [district, setDistrict] = useState("dockside");
  const [preset, setPreset] = useState("newbie");
  const [age, setAge] = useState(true);
  const [busy, setBusy] = useState(false);

  const create = () => {
    if (!name.trim()) {
      toast.error("Please enter a street name");
      return;
    }
    setBusy(true);
    createOfflineBoss(name.trim(), district, preset);
    toast.success("Akwaaba! Your empire starts now.");
    navigate("/");
  };

  return (
    <div className="mx-auto min-h-[100dvh] w-full max-w-[480px] bg-ink px-5 py-8" data-testid="onboarding-page">
      <div className="kente mb-6 h-2 w-32" />
      <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-blood">New boss in town</div>
      <h1 className="font-display mt-2 text-3xl uppercase text-zinc-100">Pick your street name</h1>

      <input
        data-testid="onboarding-name-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={24}
        placeholder="e.g. Kojo Bullet"
        className="mt-4 w-full border border-zinc-700 bg-surface px-4 py-3 text-lg font-bold text-zinc-100 outline-none focus:border-gold"
      />

      {TEST_TOOLS && (<>
      {/* Starting Setup */}
      <h2 className="font-display mt-6 text-sm uppercase text-zinc-300">Testing Start Level</h2>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {[
          { id: "newbie", label: "Rookie", sub: "Lv 1 · 50 Cedis" },
          { id: "mid", label: "Street General", sub: "Lv 12 · 500k Cedis" },
          { id: "kingpin", label: "Kingpin", sub: "Lv 25 · 20M Cedis" },
        ].map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPreset(p.id)}
            className={`border p-2 text-left transition-all ${
              preset === p.id ? "border-gold bg-surface2 text-gold" : "border-zinc-800 bg-surface text-zinc-400"
            }`}
          >
            <div className="font-display text-xs uppercase">{p.label}</div>
            <div className="text-[9px] text-zinc-500">{p.sub}</div>
          </button>
        ))}
      </div>

      </>)}

      <h2 className="font-display mt-6 text-sm uppercase text-zinc-300">Home district</h2>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {(config?.districts || []).map((d) => (
          <button
            key={d.id}
            type="button"
            data-testid={`onboarding-district-${d.id}`}
            onClick={() => setDistrict(d.id)}
            className={`btn-press border p-3 text-left transition-all ${
              district === d.id ? "border-gold bg-surface2" : "border-zinc-800 bg-surface"
            }`}
          >
            <div className={`font-display text-sm uppercase ${district === d.id ? "text-gold" : "text-zinc-200"}`}>
              {d.name}
            </div>
            <div className="text-[10px] text-zinc-500">{d.vibe}</div>
          </button>
        ))}
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3 text-xs text-zinc-300" data-testid="onboarding-age-label">
        <input
          type="checkbox"
          checked={age}
          onChange={(e) => setAge(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[#FFD700]"
          data-testid="onboarding-age-checkbox"
        />
        I confirm I am 18 or older. Fictional game; no real crime, real entertainment.
      </label>

      <Btn
        className="mt-6 w-full py-4 text-sm"
        disabled={!age || name.trim().length < 2 || busy}
        onClick={create}
        data-testid="onboarding-start-btn"
      >
        {busy ? "Starting..." : "Start My Empire (Offline)"}
      </Btn>

      <p className="mt-3 text-[11px] text-zinc-500 text-center">
        72 hours of newbie raid protection. All features fully unlocked for solo testing.
      </p>
    </div>
  );
}
