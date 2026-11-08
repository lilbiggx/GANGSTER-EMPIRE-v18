import { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Pixelation } from "@react-three/postprocessing";
import { Body } from "./CharacterModel";
import { outfitFrom } from "./characterUtils";

export default function Character3D({ look, gear = {}, height = 300, testid = "character-3d", mood = "cocky" }) {
  const spin = useRef(0.35);
  const hit = useRef(0);
  const react = useRef("rage");
  return (
    <div
      className="relative w-full touch-pan-y select-none border border-zinc-800 bg-[radial-gradient(circle_at_50%_35%,#2b2b2b,#141414_75%)]"
      style={{ height }}
      data-testid={testid}
      onPointerDown={(e) => { }}
      onPointerMove={(e) => { }}
      onPointerUp={() => { }}
    >
      <Canvas dpr={[1, 1.75]} gl={{ antialias: true, powerPreference: "low-power" }} camera={{ position: [0, 0.2, 3.45], fov: 36 }}>
        <hemisphereLight args={["#fff6e0", "#1a1a1a", 0.9]} />
        <ambientLight intensity={0.45} />
        <directionalLight position={[2.5, 3, 2.5]} intensity={1.6} />
        <directionalLight position={[-2, 1.5, -2]} intensity={0.6} color="#ffd700" />
        <EffectComposer>
          <Pixelation granularity={3} />
        </EffectComposer>
        <Body look={look} gear={gear} spin={spin} hit={hit} react={react} mood={mood} />
      </Canvas>
      <div className="pointer-events-none absolute bottom-1.5 right-2 text-[9px] uppercase tracking-widest text-zinc-500">drag to turn</div>
    </div>
  );
}
