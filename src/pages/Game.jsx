import React, { lazy, Suspense, useEffect } from "react";
import { useGame } from "../store/game";
import Hud from "../components/game/Hud";
import BottomNav from "../components/game/BottomNav";
import RaidBanner from "../components/game/RaidBanner";
import WelcomeSheet from "../components/game/WelcomeSheet";
import AdModal from "../components/game/AdModal";
import ArrestModal from "../components/game/ArrestModal";
import { useNow } from "../hooks/useNow";
import { TEST_TOOLS } from "../lib/devMode";
// Test tools chunk only exists in test builds (TEST_TOOLS is a compile-time false in production).
const FpsOverlay = TEST_TOOLS ? lazy(() => import("../components/game/testtools/FpsOverlay")) : null;
import ArchrivalModal from "../components/game/ArchrivalModal";
import AwaySummary from "../components/game/AwaySummary";
import BattlePlayback from "../components/game/BattlePlayback";
import Onboarding from "./Onboarding";

const TABS = {
  empire: lazy(() => import("./tabs/Empire")),
  crew: lazy(() => import("./tabs/Crew")),
  heists: lazy(() => import("./tabs/Heists")),
  market: lazy(() => import("./tabs/Market")),
  more: lazy(() => import("./tabs/More")),
};

const Spinner = () => (
  <div className="p-8 text-center text-xs uppercase tracking-widest text-zinc-500">
    Loading turf...
  </div>
);

export default function Game() {
  const { loaded, noPlayer, player, tab, load, act } = useGame();
  const now = useNow(1000);

  useEffect(() => {
    if (!loaded) load();
  }, [loaded, load]);

  if (!loaded) {
    return (
      <div className="flex h-[100dvh] items-center justify-center font-display text-2xl uppercase text-gold" data-testid="game-loading">
        Loading turf...
      </div>
    );
  }

  if (noPlayer || !player) {
    return <Onboarding />;
  }

  const isArrested = !!player.arrested_until && now < player.arrested_until;
  const Tab = TABS[tab] || TABS.empire;

  return (
    <div className="relative mx-auto flex h-[100dvh] w-full max-w-[480px] flex-col overflow-hidden border-x border-zinc-900 bg-ink shadow-2xl" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }} data-testid="game-shell">
      <Hud />
      <RaidBanner />
      <main className="hide-scrollbar flex-1 overflow-y-auto px-4 pb-24" data-testid={`tab-${tab}`}>
        <Suspense fallback={<Spinner />}>
          <Tab />
        </Suspense>
      </main>
      <BottomNav />
      <WelcomeSheet />
      <AdModal />
      <ArrestModal open={isArrested} player={player} now={now} act={act} />
      <ArchrivalModal />
      <AwaySummary />
      <BattlePlayback />
      {TEST_TOOLS && FpsOverlay && <Suspense fallback={null}><FpsOverlay /></Suspense>}
    </div>
  );
}
