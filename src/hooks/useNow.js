import { useEffect, useState } from "react";
import { useGame } from "../store/game";

// Shared clock subscribers by interval so 10+ components don't each run their own setInterval
const buckets = new Map();

function subscribeClock(ms, cb) {
  let b = buckets.get(ms);
  if (!b) {
    const subs = new Set();
    const tick = () => {
      if (typeof document !== "undefined" && document.hidden) return;
      const t = useGame.getState().now();
      subs.forEach((fn) => fn(t));
    };
    const id = setInterval(tick, ms);
    b = { subs, id };
    buckets.set(ms, b);
  }
  b.subs.add(cb);
  return () => {
    b.subs.delete(cb);
    if (b.subs.size === 0) {
      clearInterval(b.id);
      buckets.delete(ms);
    }
  };
}

export function useNow(ms = 1000) {
  const [t, setT] = useState(() => useGame.getState().now());
  useEffect(() => {
    setT(useGame.getState().now());
    return subscribeClock(ms, setT);
  }, [ms]);
  return t;
}
