import React, { useState } from "react";
import { TEST_TOOLS } from "../../../lib/devMode";
import { toast } from "sonner";
import { useGame } from "../../../store/game";
import { Btn, Card, SectionTitle } from "../../../components/game/ui";
import { ShieldCheck, Download, Upload, RotateCcw, Smartphone, Zap } from "lucide-react";

export default function Settings() {
  const { player: p, logout, createOfflineBoss } = useGame();
  const [installEvt, setInstallEvt] = useState(window.__uwInstall || null);

  const exportSave = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(p, null, 2));
      const dlAnchor = document.createElement("a");
      dlAnchor.setAttribute("href", dataStr);
      dlAnchor.setAttribute("download", `underworld_${p.name.replace(/\s+/g, "_")}_save.json`);
      dlAnchor.click();
      toast.success("Save exported successfully!");
    } catch (e) {
      toast.error("Export failed");
    }
  };

  const importSave = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target.result);
        if (imported.name && imported.user_id) {
          localStorage.setItem("uw_offline_player_v2", JSON.stringify(imported));
          useGame.getState().load();
          toast.success(`Imported save: Boss ${imported.name}!`);
        } else {
          toast.error("Invalid save file structure");
        }
      } catch (err) {
        toast.error("Failed to parse save file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <SectionTitle title="Settings & Offline Turf" />
      <div className="grid gap-2">
        <Card accent="gold">
          <div className="flex items-center gap-2 font-display uppercase text-zinc-100">
            <ShieldCheck className="h-4 w-4 text-gold" /> Offline Standalone Mode
          </div>
          <p className="mt-1 text-[11px] text-zinc-400">
            All features, heists, crew mechanics, shops, and rivals run standalone directly in this browser. No external login or server connection required.
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <Btn variant="gold" onClick={exportSave} className="py-2 text-[10px]">
              <Download className="h-3 w-3" /> Export Save
            </Btn>
            <label className="btn-press inline-flex cursor-pointer items-center justify-center gap-1.5 border border-zinc-700 bg-surface px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-zinc-200 hover:border-gold hover:text-gold">
              <Upload className="h-3 w-3" /> Import Save
              <input type="file" accept=".json" onChange={importSave} className="hidden" />
            </label>
          </div>
        </Card>

        {TEST_TOOLS && (
        <Card accent="red">
          <div className="font-display uppercase text-zinc-100">Quick Test Profile Switcher</div>
          <p className="text-[11px] text-zinc-400">Instantly switch between testing levels with loaded cedis and gear.</p>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            <button
              onClick={() => createOfflineBoss("Kofi Rookie", "dockside", "newbie")}
              className="border border-zinc-700 bg-surface2 p-2 text-left hover:border-gold"
            >
              <div className="font-display text-[11px] text-zinc-200">🔰 Rookie</div>
              <div className="text-[9px] text-zinc-500">Lv 1 · Starter</div>
            </button>
            <button
              onClick={() => createOfflineBoss("Kwame MidBoss", "dockside", "mid")}
              className="border border-zinc-700 bg-surface2 p-2 text-left hover:border-gold"
            >
              <div className="font-display text-[11px] text-gold">⚔️ Mid General</div>
              <div className="text-[9px] text-zinc-500">Lv 12 · 500k Cedis</div>
            </button>
            <button
              onClick={() => createOfflineBoss("Kingpin Shatta", "dockside", "kingpin")}
              className="border border-zinc-700 bg-surface2 p-2 text-left hover:border-gold"
            >
              <div className="font-display text-[11px] text-kgreen">👑 Kingpin</div>
              <div className="text-[9px] text-zinc-500">Lv 25 · 20M Cedis</div>
            </button>
          </div>
        </Card>
        )}

        <Card accent="none" data-testid="settings-sync-status">
          <div className="text-[11px] text-zinc-400">
            Current Boss: <b className="text-gold">{p.name}</b> · District: <b className="text-zinc-100 uppercase">{p.district}</b> · Age confirmed: <b className="text-zinc-100">{p.age_confirmed ? "Yes" : "No"}</b>
          </div>
        </Card>

        <Btn
          variant="ghost"
          className="mt-3 w-full border-red-900/50 text-blood hover:bg-blood/20"
          onClick={() => logout()}
          data-testid="settings-signout-btn"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1" /> Log Out to Title Screen
        </Btn>
      </div>
    </div>
  );
}
