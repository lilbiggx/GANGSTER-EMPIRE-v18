import { lazy, Suspense, useState } from "react";
import { toast } from "sonner";
import { HardHat, Shirt, Layers, Footprints, Sword, Crosshair, Target, Plus, Coins } from "lucide-react";
import { useGame } from "../../../store/game";
import { TIER_PALETTE } from "../../../data/gameData";
import { cedi } from "../../../lib/fmt";
import { resolveGear, holderOf, MiniAvatar, moodOf, MOOD_LABEL } from "../../../lib/gear";
import { Btn, Card, SectionTitle, Chip, Sheet } from "../../../components/game/ui";
import { Portrait } from "../../../components/game/v9";

const Character3D = lazy(() => import("../../../components/game/CharacterModel"));
const RARITY = { common: "text-zinc-300", rare: "text-sky-300", legendary: "text-gold" };
const SLOT_LABEL = { hat: "Hat", top: "Top", bottom: "Bottom", shoes: "Shoes", melee: "Melee", primary: "Primary", secondary: "Secondary" };
const AV_LABEL = { gender: "Gender", skin: "Skin", hair: "Hair", hair_color: "Hair colour", build: "Body type", height: "Height", face: "Face shape", nose: "Nose", brows: "Eyebrows", ears: "Ears", marks: "Face marks", glasses: "Glasses", beard: "Beard" };
const SLOT_ICON = { hat: HardHat, top: Shirt, bottom: Layers, shoes: Footprints, melee: Sword, primary: Crosshair, secondary: Target };
const RARITY_BORDER = { common: "border-zinc-600", rare: "border-sky-400", legendary: "border-gold" };


function Builder() {
  const { player: p, config, act } = useGame();
  const set = (k, v) => act("set_avatar", { ...p.avatar, [k]: v }, { optimistic: (pl) => { pl.avatar = { ...pl.avatar, [k]: v }; } });
  return (
    <div className="grid gap-3" data-testid="character-builder">
      {Object.entries(config.avatar_options).filter(([k]) => !(k === "beard" && p.avatar.gender === "female")).map(([k, opts]) => (
        <div key={k}>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gold">{AV_LABEL[k]}</div>
          <div className="flex flex-wrap gap-1.5">
            {opts.map((o) => {
              const on = p.avatar[k] === o;
              const color = o.startsWith("#");
              return (
                <button key={o} onClick={() => set(k, o)} data-testid={`builder-${k}-${o.replace("#", "")}`}
                  className={`btn-press border text-[11px] font-bold uppercase ${on ? "border-gold" : "border-zinc-700"} ${color ? "h-8 w-8" : "px-2.5 py-1.5"} ${!color && on ? "bg-gold text-ink" : "text-zinc-300"}`}
                  style={color ? { background: o, outline: on ? "2px solid #FFD700" : "none", outlineOffset: 2 } : undefined}>
                  {!color && o.replace("_", " ")}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function SlotPicker({ slot, target, onClose }) {
  const { player: p, config, act } = useGame();
  const currentLoadout = target === "boss" ? p.loadout : (p.crew.find(c => c.id === target)?.loadout || {});
  const currentUid = currentLoadout[slot];

  const items = p.gear.filter((g) => {
    const d = config.gear.find((x) => x.id === g.id);
    return d && d.slot === slot;
  });
  const equip = (uid) => {
    const holder = uid ? holderOf(p, uid) : null;
    act("equip_gear", { target, slot, uid });
    if (holder && holder !== (target === "boss" ? "Boss" : p.crew.find(c => c.id === target)?.name?.split(" ")[0])) {
      toast.success(`Transferred from ${holder}`);
    } else if (uid) {
      toast.success("Equipped item");
    }
    onClose();
  };
  return (
    <Sheet open onClose={onClose} testid="slot-picker-sheet">
      <h3 className="font-display text-2xl uppercase text-zinc-100">{SLOT_LABEL[slot]}</h3>
      <div className="mt-3 grid gap-2">
        <Btn variant="ghost" onClick={() => equip(null)} data-testid="slot-picker-remove-btn">Take off</Btn>
        {items.map((g) => {
          const d = config.gear.find((x) => x.id === g.id);
          const holder = holderOf(p, g.uid);
          const tierColor = TIER_PALETTE[d.tier] || TIER_PALETTE[1];
          const Icon = SLOT_ICON[d.slot] || Package;
          return (
            <button key={g.uid} onClick={() => equip(g.uid)} data-testid={`slot-picker-item-${g.uid}`}
              className="btn-press flex items-center justify-between border border-zinc-800 bg-ink p-2.5 text-left hover:border-gold">
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 shrink-0" style={{ color: tierColor }} />
                <div>
                  <div className="text-sm font-bold text-zinc-100">{d.name}</div>
                  <div className={`text-[10px] uppercase ${RARITY[d.rarity]}`}>{d.rarity}{d.power ? ` · +${d.power} power · +${d.mod} ${d.stat}` : " · looks only"}</div>
                </div>
              </div>
              {holder && <Chip className="text-zinc-400">on {holder}</Chip>}
            </button>
          );
        })}
        {!items.length && <div className="stripes border p-4 text-center text-xs">You no get any {SLOT_LABEL[slot].toLowerCase()} yet. Try the Gun Shop or Boutique.</div>}
      </div>
    </Sheet>
  );
}

function SlotTile({ s, g, lvl, onClick }) {
  const tierColor = g ? (TIER_PALETTE[g.tier] || TIER_PALETTE[1]) : "#71717a";
  return (
    <button onClick={onClick} data-testid={`loadout-slot-${s}`} className="btn-press group flex w-full flex-col items-center gap-0.5">
      <div className={`relative flex h-[60px] w-[60px] items-center justify-center border-2 ${g ? `${RARITY_BORDER[g.rarity]} bg-surface` : "border-dashed border-zinc-700 bg-ink"} transition-colors group-hover:border-gold`}>
        <Icon className="h-7 w-7" style={{ color: tierColor }} />
        {lvl > 0 && <span className="absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-zinc-600 bg-ink text-[9px] font-extrabold text-gold">+{lvl}</span>}
        <Plus className="absolute -bottom-1.5 -right-1.5 h-4 w-4 bg-ink text-zinc-300" />
      </div>
      <span className={`w-full truncate text-center text-[9px] font-bold uppercase ${g ? RARITY[g.rarity] : "text-zinc-600"}`}>{g ? g.name : SLOT_LABEL[s]}</span>
    </button>
  );
}

/** Character stage: The outfit/gear 3D view. */
function CharView({ look, gear, height = 340, testid }) {
  const { player: p } = useGame();
  return (
    <div className="relative" data-testid={testid}>
      <Suspense fallback={<div style={{ height }} className="border border-zinc-800" />}>
        <Character3D look={look} gear={gear} height={height} mood={moodOf(p)} testid="builder-character-3d" />
      </Suspense>
    </div>
  );
}

function Loadout({ target, setTarget }) {
  const { player: p, config, derived: d } = useGame();
  const [slot, setSlot] = useState(null);
  const own = p.crew.filter((c) => !c.merc);
  const who = target === "boss" ? null : own.find((c) => c.id === target);
  const loadout = who ? who.loadout : p.loadout;
  const gear = resolveGear(p, config, loadout);
  const look = who ? who.look : { ...p.avatar, outfit: {} };
  const lvlOf = (s) => p.gear.find((g) => g.uid === (loadout || {})[s])?.lvl || 0;
  const wpow = Object.values(gear).reduce((s, g) => s + (g.power || 0), 0);
  const col = (slots) => <div className="flex flex-col justify-around gap-2">{slots.map((s) => <SlotTile key={s} s={s} g={gear[s]} lvl={lvlOf(s)} onClick={() => setSlot(s)} />)}</div>;
  return (
    <div>
      <div className="hide-scrollbar -mx-4 mb-3 flex gap-1.5 overflow-x-auto px-4" data-testid="loadout-target-picker">
        <button onClick={() => setTarget("boss")} data-testid="loadout-target-boss"
          className={`btn-press flex shrink-0 items-center gap-1.5 border p-1 pr-2 ${target === "boss" ? "border-gold" : "border-zinc-800"}`}>
          <Portrait gender={p.avatar?.gender} size={32} testid="loadout-portrait-boss" /><span className="text-[11px] font-bold uppercase text-zinc-200">Boss</span>
        </button>
        {own.map((c) => (
          <button key={c.id} onClick={() => setTarget(c.id)} data-testid={`loadout-target-${c.id}`}
            className={`btn-press flex shrink-0 items-center gap-1.5 border p-1 pr-2 ${target === c.id ? "border-gold" : "border-zinc-800"}`}>
            <Portrait gender={c.look?.gender} size={32} testid={`loadout-portrait-${c.id}`} /><span className="text-[11px] font-bold uppercase text-zinc-200">{c.name.split(" ")[0]}</span>
          </button>
        ))}
      </div>
      <div className="text-center">
        <div className="font-display text-xl uppercase leading-none text-zinc-100" data-testid="loadout-name">{who ? who.name : p.name}</div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{who ? `${who.arch} · level ${who.lvl}` : `Boss · level ${p.level}`}</div>
      </div>
      <div className="mt-2 grid grid-cols-[64px_minmax(0,1fr)_64px] gap-2" data-testid="gear-screen">
        {col(["hat", "top", "bottom", "shoes"])}
        <CharView look={look} gear={gear} height={340} />
        {col(["melee", "primary", "secondary"])}
      </div>
      <div className="mx-auto mt-3 max-w-[260px] border-t-2 border-gold bg-surface px-4 py-2 text-center" data-testid="loadout-power">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-zinc-500">{who ? "Weapon power" : "Boss power"}</div>
        <div className="font-display text-3xl leading-tight text-gold" data-testid="loadout-power-value">{(who ? wpow : (d?.boss_power || 0)).toLocaleString()}</div>
        {!who && <div className="text-[10px] text-zinc-500">weapons +{wpow}</div>}
      </div>
      {slot && <SlotPicker slot={slot} target={target} onClose={() => setSlot(null)} />}
    </div>
  );
}

function Armoury() {
  const { player: p, config, act } = useGame();
  const sell = (type, payload) => act(type, payload, { onResult: (r) => toast.success(`Sold for ${cedi(r.value)} ${r.currency}`) });
  return (
    <div className="grid gap-2" data-testid="armoury-list">
      <p className="text-[11px] text-zinc-500">Items you got from rewards (heists, raids, rival hits, Street Pass) can be sold for {Math.round(config.sell_rate * 100)}% of shop value. Weapons sell for dirty cash, clothes for clean.</p>
      {p.gear.map((g) => {
        const d = config.gear.find((x) => x.id === g.id);
        const holder = holderOf(p, g.uid);
        const tierColor = TIER_PALETTE[d.tier] || TIER_PALETTE[1];
        const Icon = SLOT_ICON[d.slot] || Package;
        return (
          <Card key={g.uid} accent={config.weapon_slots.includes(d.slot) ? "red" : "gold"} data-testid={`armoury-item-${g.uid}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 shrink-0" style={{ color: tierColor }} />
                <div>
                  <div className="text-sm font-bold text-zinc-100">{d.name}{g.lvl ? <span className="text-gold"> +{g.lvl}</span> : ""}</div>
                  <div className={`text-[10px] uppercase ${RARITY[d.rarity]}`}>{SLOT_LABEL[d.slot]} · {d.rarity}{d.power ? ` · ${Math.floor(d.power * (1 + 0.25 * (g.lvl || 0)))} pwr` : ""}{d.stat ? ` · +${d.mod} ${d.stat}` : ""} · {g.src === "reward" ? "reward" : "bought"}{holder ? ` · on ${holder}` : ""}</div>
                </div>
              </div>
              {config.weapon_slots.includes(d.slot) && (g.lvl || 0) < config.weapon_max_lvl && (
                <Btn variant="gold" disabled={Number(p.dirty) < Math.floor(d.price * 0.6 * ((g.lvl || 0) + 1))} onClick={() => act("gear_upgrade", { uid: g.uid })} data-testid={`armoury-upgrade-btn-${g.uid}`}>
                  <div className="flex items-center gap-1">
                    <Coins className="h-3 w-3" />
                    <span>+1 {cedi(Math.floor(d.price * 0.6 * ((g.lvl || 0) + 1)))}</span>
                  </div>
                </Btn>
              )}
              {g.src === "reward" && (
                <Btn variant="ghost" disabled={!!holder} onClick={() => sell("sell_gear", { uid: g.uid })} data-testid={`armoury-sell-btn-${g.uid}`}>
                  {`Sell ${cedi(Math.floor(d.price * config.sell_rate * (1 + 0.3 * (g.lvl || 0))))}`}
                </Btn>
              )}
            </div>
          </Card>
        );
      })}
      {p.reward_cosmetics.map((id) => {
        const c = config.cosmetics.find((x) => x.id === id);
        return (
          <Card key={id} accent="green" data-testid={`armoury-cosmetic-${id}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 shrink-0" style={{ color: TIER_PALETTE[c.tier || 1] || "#71717a" }} />
                <div>
                  <div className="text-sm font-bold text-zinc-100">{c.name}</div>
                  <div className={`text-[10px] uppercase ${RARITY[c.rarity]}`}>{c.slot} · reward cosmetic</div>
                </div>
              </div>
              <Btn variant="ghost" disabled={Object.values(p.equipped).includes(id)} onClick={() => sell("sell_cosmetic", { id })} data-testid={`armoury-sell-cosmetic-btn-${id}`}>Sell</Btn>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default function Locker() {
  const { lockerTarget, setLockerTarget } = useGame();
  const [sub, setSub] = useState(lockerTarget && lockerTarget !== "boss" ? "loadout" : "builder");
  const target = lockerTarget || "boss";
  return (
    <div>
      <SectionTitle kicker="Look the part" title="Boss & Locker" />
      <div className="mb-3 grid grid-cols-3 gap-1">
        {[["builder", "Builder"], ["loadout", "Loadout"], ["armoury", "Armoury"]].map(([id, l]) => (
          <button key={id} onClick={() => setSub(id)} data-testid={`locker-sub-${id}`}
            className={`btn-press border py-1.5 text-[11px] font-extrabold uppercase ${sub === id ? "border-gold bg-gold text-ink" : "border-zinc-800 text-zinc-400"}`}>{l}</button>
        ))}
      </div>
      {sub === "builder" && <BuilderView />}
      {sub === "loadout" && <Loadout target={target} setTarget={setLockerTarget} />}
      {sub === "armoury" && <Armoury />}
    </div>
  );
}

function BuilderView() {
  const { player: p, config } = useGame();
  const gear = resolveGear(p, config, p.loadout);
  return (
    <div>
      <CharView look={{ ...p.avatar, outfit: {} }} gear={gear} height={280} />
      <div className="mt-1 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-500" data-testid="builder-mood">Mood: {MOOD_LABEL[moodOf(p)]}</div>
      <div className="mt-4"><Builder /></div>
    </div>
  );
}
