import { isDevMode } from "./devMode";

const PEPPER_A = 0x811c9dc5;
const PEPPER_B = 0x9e3779b9;
const SECRET_SALT = "ge_accra_sovereign_v12_vault_seal_9941";

function hashStr(str: string, seed: number): number {
  let h = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Normalizes any cash string/number into a clean integer string (no decimals, no NaN, no scientific notation). */
export function sanitizeCashString(val: any, fallback = "0"): string {
  if (typeof val === "bigint") return (val < 0n ? 0n : val).toString();
  if (typeof val === "number") {
    if (!Number.isFinite(val) || val < 0) return fallback;
    return BigInt(Math.trunc(val)).toString();
  }
  if (typeof val === "string") {
    const s = val.trim();
    if (!s) return fallback;
    if (s.includes(".") || s.includes("e") || s.includes("E")) {
      const n = Number(s);
      if (!Number.isFinite(n) || n < 0) return fallback;
      return BigInt(Math.trunc(n)).toString();
    }
    try {
      const b = BigInt(s);
      return (b < 0n ? 0n : b).toString();
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function canonicalPayload(p: any): string {
  if (!p || typeof p !== "object") return "";
  const invKeys = Object.keys(p.inv || {}).sort();
  const invStr = invKeys.map((k) => `${k}:${Math.floor(Number(p.inv[k]) || 0)}`).join(",");
  const luxKeys = Object.keys(p.luxury || {}).sort();
  const luxStr = luxKeys.join(",");
  return [
    SECRET_SALT,
    String(p.user_id || ""),
    sanitizeCashString(p.dirty, "0"),
    sanitizeCashString(p.clean, "0"),
    sanitizeCashString(p.lifetime, "0"),
    Math.floor(Number(p.level) || 0),
    Math.floor(Number(p.xp) || 0),
    Math.floor(Number(p.skill_points) || 0),
    Math.floor(Number(p.prestige?.count) || 0),
    Math.floor(Number(p.prestige?.respect) || 0),
    invStr,
    luxStr,
  ].join("|");
}

export function computeSaveSignature(p: any): string {
  const payload = canonicalPayload(p);
  const h1 = hashStr(payload, PEPPER_A).toString(16).padStart(8, "0");
  const h2 = hashStr(payload.split("").reverse().join(""), PEPPER_B).toString(16).padStart(8, "0");
  return `v12_${h1}${h2}`;
}

/** Sanitizes all fields on a Player object to prevent float/BigInt crashes and invalid states. */
export function sanitizePlayerState(p: any): any {
  if (!p || typeof p !== "object") return p;
  p.dirty = sanitizeCashString(p.dirty, "0");
  p.clean = sanitizeCashString(p.clean, "0");
  p.lifetime = sanitizeCashString(p.lifetime, "0");
  p.level = Math.max(0, Math.min(9999, Math.floor(Number(p.level) || 0)));
  p.xp = Math.max(0, Math.floor(Number(p.xp) || 0));
  p.heat = Math.max(0, Math.min(100, Number.isFinite(Number(p.heat)) ? Number(p.heat) : 0));
  p.skill_points = Math.max(0, Math.floor(Number(p.skill_points) || 0));
  if (p.prestige && typeof p.prestige === "object") {
    p.prestige.count = Math.max(0, Math.floor(Number(p.prestige.count) || 0));
    p.prestige.respect = Math.max(0, Math.floor(Number(p.prestige.respect) || 0));
  }
  if (Array.isArray(p.log) && p.log.length > 150) {
    p.log = p.log.slice(0, 150);
  }
  if (Array.isArray(p.cash_statement) && p.cash_statement.length > 1500) {
    p.cash_statement = p.cash_statement.slice(0, 1500);
  }
  return p;
}

export function signPlayerSave(p: any): any {
  if (!p || typeof p !== "object") return p;
  sanitizePlayerState(p);
  p._sig = computeSaveSignature(p);
  return p;
}

export function verifyPlayerSave(p: any): boolean {
  if (!p || typeof p !== "object") return false;
  // Legacy saves without _sig are accepted once and immediately signed
  if (!p._sig) return true;
  if (isDevMode()) return true;
  const expected = computeSaveSignature(p);
  return p._sig === expected;
}
