const SUF = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];

export function fmt(v) {
  let n = typeof v === "bigint" ? Number(v) : Number(v || 0);
  if (!isFinite(n)) return "∞";
  const neg = n < 0;
  n = Math.abs(n);
  if (n < 10000) return (neg ? "-" : "") + Math.floor(n).toLocaleString();
  let i = 0;
  while (n >= 1000 && i < SUF.length - 1) { n /= 1000; i++; }
  if (n >= 1000) return (neg ? "-" : "") + Number(v).toExponential(2);
  return (neg ? "-" : "") + n.toFixed(n < 10 ? 2 : n < 100 ? 1 : 0) + SUF[i];
}

export const cedi = (v) => `GH₵${fmt(v)}`;

export function dur(s) {
  s = Math.max(0, Math.floor(s));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  if (h) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m) return `${m}m ${String(sec).padStart(2, "0")}s`;
  return `${sec}s`;
}

export const big = (v) => {
  try {
    if (typeof v === "bigint") return v;
    if (typeof v === "number") return BigInt(Math.trunc(Number.isFinite(v) ? v : 0));
    if (typeof v === "string") {
      const s = v.trim();
      if (!s) return 0n;
      if (s.includes(".") || s.includes("e") || s.includes("E")) {
        const n = Number(s);
        return BigInt(Math.trunc(Number.isFinite(n) ? n : 0));
      }
      return BigInt(s);
    }
    return 0n;
  } catch {
    return 0n;
  }
};
