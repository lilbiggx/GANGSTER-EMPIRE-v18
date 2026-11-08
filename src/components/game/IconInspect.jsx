import { useState, useRef, useEffect } from "react";

/**
 * IconInspect: Press-and-hold / tap-to-inspect popup definition component.
 * Allows icons with meanings (traits, stats, archetypes, loadout slots) to have rich explanations
 * without cluttering the screen with wording.
 * Pops up when held or clicked, and vanishes immediately when released or dismissed.
 */
export default function IconInspect({
  children,
  title,
  desc,
  perk,
  subtitle,
  badge,
  badgeCls = "bg-zinc-800 text-zinc-300",
  align = "center",
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);

  const show = (e) => {
    e?.stopPropagation?.();
    setOpen(true);
  };

  const hide = () => {
    setOpen(false);
  };

  // Close when tapping outside
  useEffect(() => {
    if (!open) return;
    const handleGlobalClick = (e) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    window.addEventListener("pointerdown", handleGlobalClick);
    return () => window.removeEventListener("pointerdown", handleGlobalClick);
  }, [open]);

  const alignCls =
    align === "left"
      ? "left-0 -translate-x-2"
      : align === "right"
      ? "right-0 translate-x-2"
      : "left-1/2 -translate-x-1/2";

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex items-center cursor-pointer select-none"
      onMouseDown={show}
      onMouseUp={hide}
      onMouseLeave={hide}
      onTouchStart={show}
      onTouchEnd={hide}
      onTouchCancel={hide}
      onClick={(e) => {
        e.stopPropagation();
        setOpen((v) => !v);
      }}
    >
      {children}
      {open && (
        <div
          className={`absolute bottom-full ${alignCls} mb-2 z-[999] min-w-[170px] max-w-[240px] p-2 bg-zinc-950/98 border border-zinc-700/90 rounded shadow-2xl backdrop-blur-md text-left pointer-events-none animate-in fade-in zoom-in-95 duration-100`}
          style={{ boxShadow: "0 10px 25px -5px rgba(0,0,0,0.85), 0 0 12px rgba(234,179,8,0.2)" }}
        >
          <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-zinc-800">
            <span className="font-display text-[11px] font-black uppercase tracking-tight text-gold truncate">
              {title}
            </span>
            {badge && (
              <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${badgeCls}`}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <div className="text-[9px] font-mono font-bold text-zinc-400 mt-1">
              {subtitle}
            </div>
          )}
          {perk && (
            <div className="text-[9px] font-mono text-emerald-400 mt-1 leading-snug font-bold">
              {perk}
            </div>
          )}
          {desc && (
            <div className="text-[9px] text-zinc-300 mt-0.5 leading-snug">
              {desc}
            </div>
          )}
          <div className="text-[7px] text-zinc-500 mt-1.5 uppercase font-mono tracking-wider flex items-center justify-between">
            <span>Hold to inspect</span>
            <span className="text-zinc-600">Release to dismiss</span>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-700" />
        </div>
      )}
    </div>
  );
}
