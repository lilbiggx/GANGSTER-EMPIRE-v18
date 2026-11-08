import { cedi } from "../../lib/fmt";
export const TYPE_LABEL = {
  hustle_attack: "Hustle attack", turf_raid: "Turf raid", robbery: "Robbery", sabotage: "Sabotage", threat: "Threat", poach: "Crew poaching",
  rival_war: "Rival war", kidnap: "Kidnap", ambush: "Ambush",
};
const money = (n, cur) => (n ? `${n > 0 ? "+" : "−"}${cedi(Math.abs(n))} ${cur}` : null);
export function outcomeText(o) {
  if (!o) return "Waiting for your call";
  const bits = [money(o.dirty, "dirty"), money(o.clean, "clean"), o.respect ? `respect ${o.respect > 0 ? "+" : ""}${o.respect}` : null, o.heat ? `heat ${o.heat > 0 ? "+" : ""}${o.heat}` : null, o.injuries?.length ? `injured: ${o.injuries.join(", ")}` : null].filter(Boolean);
  return [o.won === true ? "Won" : o.won === false ? "Lost" : null, o.note, bits.join(" · ") || "No cash change"].filter(Boolean).join(" — ");
}
export const when = (t) => new Date(t * 1000).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
