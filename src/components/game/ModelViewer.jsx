import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Body } from "./CharacterModel";

/** Interactive 3D character. gender: "male" | "female". */
export default function ModelViewer({ gender = "male", height = 260, testid, className = "", facing = 0, look, gear = {} }) {
  const spin = useRef(0.35);
  const hit = useRef(0);
  const react = useRef("rage");

  const avatarLook = { 
      gender, 
      skin: "#d2b48c", // Default fallback skin
      hair: "fade", 
      hair_color: "#1a1a1a", 
      build: "regular", 
      height: "average", 
      face: "round", 
      ...look 
  };

  return (
    <div className={`relative w-full ${className}`} style={{ height }} data-testid={testid || `model-viewer-${gender}`} aria-label={`${gender} character model`}>
      <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0.2, 3.45], fov: 36 }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} frameloop="always">
        <hemisphereLight args={["#fff6e0", "#1a1a1a", 0.9]} />
        <ambientLight intensity={0.45} />
        <directionalLight position={[2, 3, 2]} intensity={1.6} />
        <directionalLight position={[-2, 1, -2]} intensity={0.6} color="#ffd700" />
        <Suspense fallback={null}>
            <group rotation={[0, facing, 0]}>
                <Body look={avatarLook} gear={gear} spin={spin} hit={hit} react={react} mood="cocky" />
            </group>
        </Suspense>
      </Canvas>
    </div>
  );
}
