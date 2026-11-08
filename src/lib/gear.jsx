export function resolveGear(p, config, loadout) {
  const out = {};
  Object.entries(loadout || {}).forEach(([slot, uid]) => {
    const gi = p.gear.find((g) => g.uid === uid);
    const def = gi && config.gear.find((g) => g.id === gi.id);
    if (def) out[slot] = def;
  });
  return out;
}

export function holderOf(p, uid) {
  if (Object.values(p.loadout || {}).includes(uid)) return "Boss";
  const c = p.crew.find((x) => Object.values(x.loadout || {}).includes(uid));
  return c ? c.name.split(" ")[0] : null;
}

export function moodOf(p) {
  const now = Date.now() / 1000;
  const last = p.log?.[0];
  const recent = last && now - last.t < 900;
  if (recent && last.kind === "bad") return "angry";
  if (p.raid || p.heat >= 60) return "nervous";
  if (recent && last.kind === "good") return "happy";
  return "cocky";
}

export const MOOD_LABEL = { angry: "Vexed after a hit", nervous: "Sweating the heat", happy: "Feeling the payday", cocky: "Cool and cocky" };

export const MiniAvatar = ({ look, size = 48, testid }) => {
  const top = look?.outfit?.top || "#1f1f1f";
  const hairH = { bald: 0, fade: 0.14, cornrows: 0.14, braids: 0.2, dreads: 0.24, afro: 0.34 }[look?.hair] ?? 0.14;
  return (
    <div className="relative shrink-0 overflow-hidden border border-zinc-800 bg-surface2" style={{ width: size, height: size }} data-testid={testid}>
      <div className="absolute left-1/2 -translate-x-1/2 rounded-full" style={{ top: size * 0.12, width: size * 0.42, height: size * 0.42, background: look?.skin || "#5a3825" }} />
      {hairH > 0 && <div className="absolute left-1/2 -translate-x-1/2 rounded-t-full" style={{ top: size * (0.12 - hairH * 0.5), width: size * (0.44 + hairH * 0.3), height: size * (0.14 + hairH * 0.5), background: look?.hair_color }} />}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ width: size * 0.7, height: size * 0.36, background: top }} />
    </div>
  );
};
