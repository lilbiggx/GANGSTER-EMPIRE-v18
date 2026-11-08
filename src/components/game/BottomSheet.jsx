// v9: shared bottom sheet. Portalled to <body> so no ancestor transform/overflow can offset or clip it,
// then pinned to the same centered 440px column as the app shell. Lighter backdrop, internal scroll only.
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function BottomSheet({ title, kicker, onClose, children, testid = "sheet", maxH = "62dvh", footer = null }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[85] flex items-end justify-center bg-black/45"
      onClick={onClose}
      data-testid={`${testid}-backdrop`}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-testid={testid}
        onClick={(e) => e.stopPropagation()}
        className="sheet-up flex max-h-[62vh] w-full min-w-0 max-w-[440px] flex-col overflow-hidden rounded-t-xl border-x border-t-2 border-zinc-800 border-t-gold bg-surface shadow-[0_-8px_30px_rgba(0,0,0,0.5)]"
        style={{ maxHeight: maxH, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-zinc-800 py-1.5 pl-3 pr-1">
          <div className="min-w-0">
            {kicker && <div className="truncate text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">{kicker}</div>}
            <h2 className="truncate font-display text-base uppercase leading-tight text-gold" data-testid={`${testid}-title`}>{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            title="Close"
            data-testid={`${testid}-close`}
            className="btn-press flex h-11 w-11 shrink-0 items-center justify-center text-zinc-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-2">{children}</div>
        {footer && <div className="shrink-0 border-t border-zinc-800 p-2">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
