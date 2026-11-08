// Test Tools FPS overlay (test builds only). Toggle from Test Tools > Debug.
import { useEffect, useState } from "react";
const KEY = "ge_fps_overlay";
const subs = new Set();
export const fpsOverlayOn = () => localStorage.getItem(KEY) === "1";
export function setFpsOverlay(on) { localStorage.setItem(KEY, on ? "1" : "0"); subs.forEach((f) => f(on)); }
export default function FpsOverlay() {
  const [on, setOn] = useState(fpsOverlayOn());
  const [fps, setFps] = useState(0);
  useEffect(() => { subs.add(setOn); return () => subs.delete(setOn); }, []);
  useEffect(() => {
    if (!on) return;
    let raf, n = 0, t0 = performance.now();
    const loop = (t) => { n++; if (t - t0 >= 500) { setFps(Math.round((n * 1000) / (t - t0))); n = 0; t0 = t; } raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [on]);
  if (!on) return null;
  const tris = typeof window !== "undefined" && window.__uwFight?.tris;
  return (
    <div className="pointer-events-none fixed left-2 top-2 z-[200] border border-gold/60 bg-black/80 px-1.5 py-0.5 font-mono text-[10px] text-gold" data-testid="fps-overlay">
      {fps} FPS{tris ? ` · ${tris} tris` : ""}
    </div>
  );
}
