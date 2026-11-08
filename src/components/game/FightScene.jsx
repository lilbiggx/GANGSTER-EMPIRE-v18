import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Swords, Shield, Target, Bomb, RefreshCw, EyeOff, Sparkles, Trophy, Zap, AlertTriangle } from "lucide-react";

/**
 * 32-Bit Pixel Combat Simulator
 * Pure 2D Canvas rendering with 32x32 pixel-matrix silhouettes.
 * 100% Automated combat driven by Boss & Crew 4 stats (Muscle, Wheels, Brains, Stealth) + Power & Defense.
 * No manual buttons: Computer auto-fights seamlessly. User can watch the entire fight or skip match.
 */

const MATRIX_SIZE = 32;

// Accra Underworld 32-bit palette
const PALETTE = {
  skyDark: "#080a0c",
  skyHaze: "#141a20",
  groundAsphalt: "#181a18",
  groundSidewalk: "#252825",
  groundLine: "#eab308",
  sandbags: "#785834",
  sandbagsShadow: "#4d3820",
  streetlampGlow: "rgba(234, 179, 8, 0.08)",
  skinGhanaDark: "#3d2415",
  skinGhanaMid: "#5c3a21",
  skinGhanaGold: "#8d5524",
  hoodieDark: "#18181b",
  hoodieGold: "#ca8a04",
  hoodieCrimson: "#991b1b",
  pantsDark: "#09090b",
  pantsCamo: "#27272a",
  shoesWhite: "#e4e4e7",
  shoesDark: "#27272a",
  goldTrim: "#ffd700",
  bloodRed: "#ef4444",
  sparkYellow: "#fde047",
  muzzleFlash: "#ffedd5",
  shieldBlue: "#38bdf8",
  smokeGray: "#71717a",
};

export default function FightScene({
  us,
  them,
  beat,
  playing = true,
  battle,
  height = 290,
}) {
  const canvasRef = useRef(null);

  // Derived Combat Stats
  const playerStats = useMemo(() => {
    const s = us?.stats || battle?.us?.stats || {};
    return {
      power: Math.max(10, Number(us?.power || battle?.us?.power) || 250),
      defense: Math.max(10, Number(us?.defense || battle?.us?.defense) || 120),
    };
  }, [us, battle]);

  const rivalStats = useMemo(() => {
    const rivalPow = Math.max(10, Number(them?.power || battle?.them?.power) || 220);
    return {
      power: rivalPow,
      defense: Math.max(10, Math.round(rivalPow * 0.45)),
    };
  }, [them, battle]);

  // Visual states
  const [currentAction, setCurrentAction] = useState("idle");
  const [rivalAction, setRivalAction] = useState("idle");
  const [screenShake, setScreenShake] = useState(0);

  // Particles & Floating Damage Texts
  const particlesRef = useRef([]);
  const floatTextsRef = useRef([]);
  const stateRef = useRef({ action: "idle", rivalAction: "idle" });

  // HP derived from beat (engine report)
  const playerHp = beat?.us ?? 100;
  const rivalHp = beat?.them ?? 100;

  // React to beat changes
  useEffect(() => {
    if (!beat || beat.id === "approach" || beat.id === "results") return;

    const r = beat.r;
    if (!r) return;

    const isUs = r.a === "us";
    const move = r.move || "punch";
    const dmg = r.dmg || 0;
    const isCrit = r.kd || dmg > 35;

    if (isUs) {
      stateRef.current.action = move;
      setCurrentAction(move);
      triggerShake(isCrit ? 10 : 5);
      
      setTimeout(() => {
        spawnFloatText(isCrit ? `CRIT! −${dmg}` : `−${dmg}`, 340, 160, isCrit ? "#ffd700" : "#ffedd5", isCrit);
        for (let i = 0; i < (isCrit ? 16 : 8); i++) {
          spawnParticle(340, 165, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, PALETTE.sparkYellow, 3, 20);
        }
        setRivalAction(r.kd ? "knockdown" : "hit");
        setTimeout(() => setRivalAction("idle"), r.kd ? 800 : 280);
        setTimeout(() => {
          stateRef.current.action = "idle";
          setCurrentAction("idle");
        }, 400);
      }, 150);
    } else {
      stateRef.current.rivalAction = move;
      setRivalAction(move);
      
      setTimeout(() => {
        spawnFloatText(`−${dmg}`, 140, 170, "#f87171");
        triggerShake(5);
        for (let i = 0; i < 8; i++) {
          spawnParticle(140, 175, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, PALETTE.bloodRed, 3, 20);
        }
        setCurrentAction(r.kd ? "knockdown" : "hit");
        setTimeout(() => setCurrentAction("idle"), r.kd ? 800 : 280);
        setTimeout(() => {
          stateRef.current.rivalAction = "idle";
          setRivalAction("idle");
        }, 400);
      }, 150);
    }
  }, [beat]);

  // Particles & Text Helpers
  const spawnParticle = (x, y, vx, vy, color, size, life) => {
    particlesRef.current.push({ x, y, vx, vy, color, size, life, maxLife: life });
  };
  const spawnFloatText = (text, x, y, color = "#fff", isCrit = false) => {
    floatTextsRef.current.push({ text, x, y, vy: -1.2, alpha: 1.0, color, isCrit });
  };
  const triggerShake = (intensity = 6) => {
    setScreenShake(intensity);
    setTimeout(() => setScreenShake(0), 180);
  };

  // Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    let animId = 0;
    let frame = 0;

    const render = () => {
      frame++;
      const time = frame * 0.05;

      // 1. Draw Background
      ctx.fillStyle = PALETTE.skyDark;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Distant city silhouette
      ctx.fillStyle = "#111417";
      for (let i = 0; i < 15; i++) {
        const bx = i * 34, bw = 28, bh = 50 + ((i * 37) % 60);
        ctx.fillRect(bx, 170 - bh, bw, bh);
      }

      // Ground
      ctx.fillStyle = PALETTE.groundSidewalk;
      ctx.fillRect(0, 180, canvas.width, 18);
      ctx.fillStyle = PALETTE.groundAsphalt;
      ctx.fillRect(0, 198, canvas.width, canvas.height - 198);

      // 2. Draw Fighters
      const playerBob = Math.sin(time * 3) * 2;
      const rivalBob = Math.cos(time * 3) * 2;

      drawFighterMatrix(
        ctx, 130, 145 + (stateRef.current.action === "cover" ? 18 : playerBob),
        currentAction, "west", us?.look?.skin || PALETTE.skinGhanaGold, PALETTE.hoodieDark, PALETTE.goldTrim
      );

      drawFighterMatrix(
        ctx, 330, 145 + rivalBob,
        rivalAction, "east", PALETTE.skinGhanaDark, PALETTE.hoodieCrimson, "#dc2626"
      );

      // 3. Update & Draw Particles
      for (let pIdx = particlesRef.current.length - 1; pIdx >= 0; pIdx--) {
        const p = particlesRef.current[pIdx];
        p.x += p.vx; p.y += p.vy; p.life -= 1;
        const alpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color; ctx.globalAlpha = alpha;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.globalAlpha = 1.0;
        if (p.life <= 0) particlesRef.current.splice(pIdx, 1);
      }

      // 4. Update & Draw Floating Damage Texts
      for (let fIdx = floatTextsRef.current.length - 1; fIdx >= 0; fIdx--) {
        const ft = floatTextsRef.current[fIdx];
        ft.y += ft.vy; ft.alpha -= 0.025;
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.font = ft.isCrit ? "bold 13px monospace" : "bold 11px monospace";
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
        if (ft.alpha <= 0) floatTextsRef.current.splice(fIdx, 1);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [us, them, currentAction, rivalAction]);

  return (
    <div className={`relative w-full rounded border border-zinc-800 bg-ink overflow-hidden shadow-2xl ${screenShake ? "translate-x-1" : ""}`}>
      {/* Top HUD Overlay (HP Bars, Power, Defend) */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-3 py-2 bg-gradient-to-b from-black/95 via-black/75 to-transparent">
        <div className="w-[42%]">
          <div className="flex items-center justify-between text-[10px] font-black uppercase text-zinc-200">
            <span className="truncate max-w-[100px] text-gold">{us?.name || battle?.us?.name || "Player Boss"}</span>
            <span className="font-mono text-zinc-300">{playerHp}%</span>
          </div>
          <div className="h-2 w-full bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden mt-0.5">
            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${Math.max(0, playerHp)}%` }} />
          </div>
          <div className="flex items-center gap-2 mt-1 text-[8px] font-mono font-bold text-zinc-400 uppercase">
            <span>POW: <b className="text-zinc-200">{playerStats.power}</b></span>
            <span>DEF: <b className="text-zinc-200">{playerStats.defense}</b></span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="font-display text-[9px] font-black text-gold border border-gold/40 bg-black/80 px-2 py-0.5 rounded tracking-wider uppercase">
            Accra Streets
          </span>
          <span className="text-[7px] font-mono uppercase text-zinc-400 mt-0.5">Battle Playback</span>
        </div>

        <div className="w-[42%] text-right">
          <div className="flex items-center justify-between text-[10px] font-black uppercase text-zinc-200">
            <span className="font-mono text-zinc-300">{rivalHp}%</span>
            <span className="truncate max-w-[100px] text-blood">{them?.name || battle?.them?.name || "Rival Gang"}</span>
          </div>
          <div className="h-2 w-full bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden mt-0.5">
            <div className="h-full bg-blood transition-all duration-300 ml-auto" style={{ width: `${Math.max(0, rivalHp)}%` }} />
          </div>
          <div className="flex items-center justify-end gap-2 mt-1 text-[8px] font-mono font-bold text-zinc-400 uppercase">
            <span>POW: <b className="text-zinc-200">{rivalStats.power}</b></span>
            <span>DEF: <b className="text-zinc-200">{rivalStats.defense}</b></span>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} width={480} height={240} className="block w-full h-[240px] image-rendering-pixelated bg-ink" />
    </div>
  );
}

/**
 * Procedural 32-bit pixel matrix fighter rendering
 */
function drawFighterMatrix(ctx, x, y, action, facing, skinColor, outfitColor, accentColor) {
  const scale = 2.4;
  const isWest = facing === "west";

  ctx.save();
  ctx.translate(x, y);
  if (!isWest) {
    ctx.scale(-1, 1);
  }

  // Draw pixel block helper
  const px = (bx, by, color, w = 1, h = 1) => {
    ctx.fillStyle = color;
    ctx.fillRect(bx * scale, by * scale, w * scale, h * scale);
  };

  // Stance variations based on action
  let armOffset = 0;
  let legOffset = 0;
  let torsoLean = 0;

  if (action === "punch") {
    armOffset = 9;
    torsoLean = 3;
  } else if (action === "kick") {
    legOffset = 10;
    torsoLean = -2;
  } else if (action === "block") {
    armOffset = -3;
  } else if (action === "knockdown") {
    ctx.rotate(0.9);
  }

  // Headwear / Cap / Hair (pixels 8-15)
  px(10 + torsoLean, 4, "#111111", 8, 4); // Hat crown
  px(12 + torsoLean, 7, accentColor, 8, 1); // Cap brim or headband

  // Face / Skin (pixels 10-18)
  px(11 + torsoLean, 8, skinColor, 6, 6);
  px(15 + torsoLean, 10, "#111111", 2, 1); // Eyes

  // Neck & Gold Chain
  px(12 + torsoLean, 14, skinColor, 4, 2);
  px(12 + torsoLean, 15, PALETTE.goldTrim, 4, 1);

  // Torso / Hoodie / Jacket (pixels 16-25)
  px(9 + torsoLean, 16, outfitColor, 10, 10);
  px(13 + torsoLean, 16, accentColor, 2, 10); // Center zipper / trim

  // Arms & Action Poses
  if (action === "punch") {
    // Extended fist
    px(16 + torsoLean, 18, outfitColor, 6, 3);
    px(22 + torsoLean, 18, skinColor, 4, 3); // Fist
  } else if (action === "block") {
    // Cross guard
    px(16, 15, outfitColor, 4, 7);
    px(17, 13, skinColor, 3, 3);
  } else {
    // Normal / Idle guard
    px(15 + torsoLean, 18, outfitColor, 4, 4);
    px(16 + torsoLean, 16, skinColor, 3, 3);
  }

  // Pants / Bottoms (pixels 26-34)
  px(10, 26, PALETTE.pantsDark, 4, 8);
  if (action === "kick") {
    // Extended leg
    px(14, 25, PALETTE.pantsDark, 10, 4);
    px(24, 24, PALETTE.shoesWhite, 4, 4); // Foot
  } else {
    px(14, 26, PALETTE.pantsDark, 4, 8);
    // Shoes
    px(9, 34, PALETTE.shoesWhite, 5, 2);
    px(14, 34, PALETTE.shoesWhite, 5, 2);
  }

  // Weapon / Prop
  if (action === "fire") {
    px(19 + torsoLean, 17, "#27272a", 6, 3); // Handgun barrel
  }

  ctx.restore();
}
