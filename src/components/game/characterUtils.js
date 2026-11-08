export const TOP = { tee: 0, open_shirt: 1, hoodie: 2, jacket: 3 };
export const PAT = { plain: 0, stripes: 1, kente: 2, camo: 3, flowers: 4 };
export const BOT = { shorts: 0, cargo_shorts: 1, pants: 2 };
export const HEIGHT = { tiny: 0.84, short: 0.92, average: 1, tall: 1.07, towering: 1.14 };
export const BUILDS = ["heavy", "slim", "muscular", "skinny", "belly", "chubby", "curvy", "brute"];
export const FACES = ["round", "square", "long", "heavy_jaw", "narrow"];

export const BASE_OUTFIT = { top_style: "tee", pattern: "plain", top: "#2a2a2a", under: "#111111", graphic: "none", bottom_style: "shorts", bottom: "#3a4a3f", shoes: "#4a2c1a", socks: "#f3f4f6" };

export function outfitFrom(look, gear) {
  const o = { ...BASE_OUTFIT, ...(look.outfit || {}) };
  if (gear.top) Object.assign(o, { top: gear.top.color, top_style: gear.top.style || "tee", pattern: gear.top.pattern || "plain", graphic: gear.top.graphic || (gear.top.style === "open_shirt" ? o.graphic : "none") });
  if (gear.bottom) Object.assign(o, { bottom: gear.bottom.color, bottom_style: gear.bottom.style || "pants", bottom_pattern: gear.bottom.pattern });
  if (gear.shoes) o.shoes = gear.shoes.color;
  return o;
}
