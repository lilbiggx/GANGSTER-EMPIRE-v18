export const Btn = ({ variant = "gold", className = "", children, ...props }) => {
  const v = {
    gold: "bg-gold text-ink border-gold hover:bg-[#ffe34d]",
    red: "bg-blood text-white border-blood hover:bg-[#f0123a]",
    green: "bg-kgreen text-ink border-kgreen hover:bg-[#12c57f]",
    ghost: "bg-transparent text-zinc-200 border-zinc-700 hover:border-gold hover:text-gold",
  }[variant];
  return (
    <button
      className={`btn-press inline-flex items-center justify-center gap-1.5 border px-3 py-2 text-xs font-extrabold uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-40 disabled:stripes ${v} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Card = ({ accent = "gold", className = "", children, ...props }) => (
  <div className={`border border-zinc-800 bg-surface p-3 accent-${accent} ${className}`} {...props}>{children}</div>
);

export const Bar = ({ pct, color = "gold", testid }) => (
  <div className="h-1.5 w-full bg-zinc-800" data-testid={testid}>
    <div className={`h-full bar-${color} transition-[width] duration-1000 ease-linear`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
  </div>
);

export const SectionTitle = ({ kicker, title, right }) => (
  <div className="mb-3 mt-6 flex items-end justify-between">
    <div>
      {kicker && <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-blood">{kicker}</div>}
      <h2 className="font-display text-xl uppercase tracking-wide text-zinc-100">{title}</h2>
    </div>
    {right}
  </div>
);

export const Chip = ({ children, className = "", ...props }) => (
  <span className={`inline-flex items-center gap-1 border border-zinc-700 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${className}`} {...props}>
    {children}
  </span>
);

export const Sheet = ({ open, onClose, children, testid }) =>
  !open ? null : (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/80" onClick={onClose} data-testid={`${testid}-backdrop`}>
      <div
        className="sheet-up max-h-[85dvh] w-full max-w-[480px] overflow-y-auto border-t-2 border-gold bg-surface p-5 pb-8"
        onClick={(e) => e.stopPropagation()}
        data-testid={testid}
      >
        {children}
      </div>
    </div>
  );

export const ConfirmModal = ({ open, title, message, onConfirm, onCancel }) =>
  !open ? null : (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={onCancel}>
      <div className="w-full max-w-sm border border-gold bg-ink p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="text-lg font-display uppercase text-gold font-bold">{title}</div>
        <div className="text-xs text-zinc-300">{message}</div>
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={onCancel} className="flex-1">Cancel</Btn>
          <Btn variant="gold" onClick={onConfirm} className="flex-1">Confirm</Btn>
        </div>
      </div>
    </div>
  );
