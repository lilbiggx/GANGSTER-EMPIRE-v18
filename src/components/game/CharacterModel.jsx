import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { ScanFace, PersonStanding } from "lucide-react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { outfitFrom } from "./characterUtils";
import { Face, REACTIONS } from "./Face3D";
import { TOP, PAT, BOT, HEIGHT, BUILDS, FACES } from "./characterUtils";

const VERT_HEAD = `varying vec3 vRest;\n`;
const FRAG_HEAD = `
varying vec3 vRest;
uniform vec3 uSkin, uTop, uUnder, uBottom, uShoes, uSocks;
uniform float uTopStyle, uPattern, uBotStyle, uBotPattern, uMinY, uH;
vec3 pat(vec3 base, float kind, vec2 q) {
  if (kind < 0.5) return base;
  if (kind < 1.5) return fract(q.y * 26.0) < 0.35 ? vec3(0.95) : base;
  if (kind < 2.5) { float c = mod(floor(q.x * 9.0) + floor(q.y * 18.0), 4.0);
    vec3 k = c < 1.0 ? vec3(1.0, 0.84, 0.0) : c < 2.0 ? vec3(0.85, 0.02, 0.16) : c < 3.0 ? vec3(0.0, 0.66, 0.42) : vec3(0.06);
    return fract(q.y * 18.0) < 0.12 ? vec3(0.05) : k; }
  if (kind < 3.5) { float n = sin(q.x * 31.0) * sin(q.y * 23.0) + sin(q.x * 13.0 + q.y * 17.0);
    return n > 0.6 ? vec3(0.17, 0.2, 0.12) : n < -0.5 ? vec3(0.42, 0.42, 0.23) : base; }
  vec2 f = fract(q * vec2(14.0, 20.0)) - 0.5; float d = length(f);
  return d < 0.17 ? vec3(0.98, 0.6, 0.1) : d < 0.24 ? vec3(0.95, 0.25, 0.2) : base;
}
vec3 clothe() {
  float h = (vRest.y - uMinY) / uH; float ax = abs(vRest.x) / uH; float front = vRest.z;
  bool arm = ax > 0.1 && h < 0.815 && h > 0.5;
  vec2 q = vec2(vRest.x, vRest.y) / uH;
  if (h < 0.066) return h < 0.018 ? vec3(0.95) : uShoes;
  if (h < 0.115) return uSocks;
  float botTop = 0.515; float botEnd = uBotStyle > 1.5 ? 0.066 : uBotStyle > 0.5 ? 0.3 : 0.34;
  if (!arm && h < botTop && h > botEnd) return pat(uBottom, uBotPattern, q);
  bool longS = uTopStyle > 1.5;
  if (arm) { float sleeveEnd = longS ? 0.585 : 0.735; return h > sleeveEnd ? pat(uTop, uPattern, q) : uSkin; }
  if (h >= botTop - 0.005 && h < 0.815) {
    bool open = (uTopStyle > 0.5 && uTopStyle < 1.5) || uTopStyle > 2.5;
    if (open && front > 0.0 && ax < 0.03) return uUnder;
    return pat(uTop, uPattern, q);
  }
  if (uTopStyle > 1.5 && uTopStyle < 2.5 && h > 0.8 && h < 0.86 && front < 0.0) return uTop;
  return uSkin;
}
`;

export function makeMaterial(flat = false) {
  const m = flat ? new THREE.MeshLambertMaterial({ skinning: true }) : new THREE.MeshStandardMaterial({ roughness: 0.7, metalness: 0.03, skinning: true });
  const u = {
    uSkin: { value: new THREE.Color() }, uTop: { value: new THREE.Color() }, uUnder: { value: new THREE.Color() },
    uBottom: { value: new THREE.Color() }, uShoes: { value: new THREE.Color() }, uSocks: { value: new THREE.Color() },
    uTopStyle: { value: 0 }, uPattern: { value: 0 }, uBotStyle: { value: 0 }, uBotPattern: { value: 0 }, uMinY: { value: 0 }, uH: { value: 4.8 },
  };
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = VERT_HEAD + sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\nvRest = position;");
    sh.fragmentShader = FRAG_HEAD + sh.fragmentShader.replace("vec4 diffuseColor = vec4( diffuse, opacity );", "vec4 diffuseColor = vec4( clothe(), opacity );");
  };
  m.userData.u = u;
  return m;
}

const P = (x, y, z) => [x, z, -y];
export const AX = { x: new THREE.Vector3(1, 0, 0), y: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1) };
const _root = new THREE.Quaternion(), _rootInv = new THREE.Quaternion(), _par = new THREE.Quaternion();
const _q = new THREE.Quaternion(), _m = new THREE.Quaternion();

// Rotate a bone around model-space axes, starting from its rest pose.
/** Fight scene helper: rotations below are relative to this root. */
export function setRotateRoot(obj) { obj.getWorldQuaternion(_root); _rootInv.copy(_root).invert(); }
export function rotate({ b, rest }, rots) {
  b.quaternion.copy(rest);
  b.parent.updateWorldMatrix(true, false);
  b.parent.getWorldQuaternion(_par);
  _par.premultiply(_rootInv);
  for (const [ax, a] of rots) {
    if (!a) continue;
    _q.setFromAxisAngle(ax, a);
    _m.copy(_par).invert().multiply(_q).multiply(_par);
    b.quaternion.premultiply(_m);
  }
  b.updateMatrixWorld(true);
}

const mix = (a, b, k) => a + (b - a) * k;
const ease = (x) => x * x * (3 - 2 * x);
const POSES = {
  idle: (t) => ({ L: { z: -0.62 + Math.sin(t * 1.3) * 0.04, x: -0.1, fore: 0.25 }, R: { z: -0.62 - Math.sin(t * 1.3) * 0.04, x: -0.1, fore: 0.25 }, headX: Math.sin(t * 2.2) * 0.06, headY: 0, bounce: 0, lean: 0 }),
  flex: (t) => ({ L: { z: 0.8, x: 0, fore: 1.7 + Math.sin(t * 6) * 0.12 }, R: { z: 0.8, x: 0, fore: 1.7 - Math.sin(t * 6) * 0.12 }, headX: -0.12, headY: Math.sin(t * 1.5) * 0.25, bounce: 0, lean: 0 }),
  point: (t) => ({ L: { z: -0.6, x: 0, fore: 0.3 }, R: { z: -0.35, x: -1.25 + Math.sin(t * 5) * 0.05, fore: 0.1 }, headX: -0.08, headY: -0.15, bounce: 0, lean: 0.03 }),
  bounce: (t) => ({ L: { z: -0.45 + Math.sin(t * 6) * 0.25, x: -0.3, fore: 0.9 }, R: { z: -0.45 - Math.sin(t * 6) * 0.25, x: -0.3, fore: 0.9 }, headX: Math.abs(Math.sin(t * 6)) * 0.15 - 0.05, headY: 0, bounce: Math.abs(Math.sin(t * 6)) * 0.04, lean: Math.sin(t * 3) * 0.04 }),
  cross: () => ({ L: { z: -0.55, x: -0.9, fore: 0.2, foreX: -1.5 }, R: { z: -0.55, x: -0.9, fore: 0.2, foreX: -1.4 }, headX: -0.1, headY: 0.2, bounce: 0, lean: -0.02 }),
  walk: (t) => ({ 
    L: { z: Math.sin(t * 4) * 0.5, x: -0.2, fore: 0.2 }, 
    R: { z: -Math.sin(t * 4) * 0.5, x: -0.2, fore: 0.2 }, 
    headX: 0, 
    headY: Math.sin(t * 2) * 0.05, 
    bounce: Math.abs(Math.cos(t * 4)) * 0.05, 
    lean: Math.sin(t * 2) * 0.05 
  }),
};
const CYCLE = ["idle", "walk", "flex", "idle", "bounce", "cross", "idle", "point"];

function blendPose(a, b, k) {
  const arm = (x, y) => ({ z: mix(x.z, y.z, k), x: mix(x.x, y.x, k), fore: mix(x.fore, y.fore, k), foreX: mix(x.foreX || 0, y.foreX || 0, k) });
  return { L: arm(a.L, b.L), R: arm(a.R, b.R), headX: mix(a.headX, b.headX, k), headY: mix(a.headY, b.headY, k), bounce: mix(a.bounce, b.bounce, k), lean: mix(a.lean, b.lean, k) };
}

function posesAt(t, hitAge) {
  if (hitAge < 2.6) {
    if (hitAge < 0.3) {
      const k = Math.sin((hitAge / 0.3) * Math.PI);
      return { ...POSES.idle(t), lean: 0.12 * k * Math.sign(Math.sin(hitAge * 40) + 0.01), headX: 0.35 * k, bounce: -0.02 * k };
    }
    const angry = POSES.point(t * 3);
    angry.R.x += Math.sin(t * 18) * 0.12;
    return blendPose(POSES.idle(t), angry, ease(Math.min(1, (hitAge - 0.3) / 0.25)));
  }
  const seg = 3.2;
  const i = Math.floor(t / seg) % CYCLE.length;
  const k = ease(Math.min(1, (t % seg) / 0.6));
  return blendPose(POSES[CYCLE[(i + CYCLE.length - 1) % CYCLE.length]](t), POSES[CYCLE[i]](t), k);
}

const M = ({ c, roughness = 0.5, metalness = 0.05, ...r }) => (
  <meshStandardMaterial color={c} roughness={roughness} metalness={metalness} {...r} />
);

export function Hair({ look }) {
  const c = look.hair_color;
  // High-poly sculpted skullcap with smooth curvature
  const cap = (
    <mesh position={P(0, 0.035, 4.665)} scale={[1, 0.72, 1.02]}>
      <sphereGeometry args={[0.275, 36, 28]} />
      <M c={c} roughness={0.8} />
    </mesh>
  );

  // Lifelike dreadlocks with gold cuffs
  const dreads = (len = 0.58) => (
    <group>
      {cap}
      {[-0.22, -0.14, -0.06, 0.06, 0.14, 0.22].map((x, idx) => {
        const yOffset = 0.22 + (idx % 2) * 0.03;
        const curveRot = [0.15, (x * 0.8), -x * 0.5];
        return (
          <group key={x} position={P(x, yOffset, 4.45 - len / 2)} rotation={curveRot}>
            {/* Sculpted dread strand */}
            <mesh>
              <capsuleGeometry args={[0.042, len, 16, 24]} />
              <M c={c} roughness={0.85} />
            </mesh>
            {/* 24K Gold decorative cuff */}
            {idx % 2 === 0 && (
              <mesh position={[0, -len * 0.2, 0]}>
                <cylinderGeometry args={[0.048, 0.048, 0.04, 24]} />
                <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.15} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );

  // Volumetric puffy Afro with organic clusters
  const afro = (
    <group>
      {/* Main spherical volume */}
      <mesh position={P(0, 0.08, 4.68)}>
        <sphereGeometry args={[0.38, 36, 28]} />
        <M c={c} roughness={0.95} />
      </mesh>
      {/* Secondary volume clusters for authentic texture */}
      {[-0.18, 0, 0.18].map((x) => (
        <mesh key={x} position={P(x, 0.12, 4.8)}>
          <sphereGeometry args={[0.16, 20, 16]} />
          <M c={c} roughness={0.95} />
        </mesh>
      ))}
      {[-0.22, 0.22].map((x) => (
        <mesh key={x} position={P(x, 0.08, 4.58)}>
          <sphereGeometry args={[0.18, 20, 16]} />
          <M c={c} roughness={0.95} />
        </mesh>
      ))}
    </group>
  );

  // Geometric Cornrow Braids along scalp contours
  const cornrows = (
    <group>
      {cap}
      {[-0.18, -0.11, -0.04, 0.04, 0.11, 0.18].map((x) => (
        <mesh key={x} position={P(x, 0.02, 4.76)} rotation={[0.26, 0, -x * 0.35]}>
          <capsuleGeometry args={[0.028, 0.44, 12, 20]} />
          <M c={c} roughness={0.75} />
        </mesh>
      ))}
    </group>
  );

  // Tapered Spiky Hair with golden tip accents
  const spiky = (
    <group>
      {cap}
      {[-0.15, -0.08, 0, 0.08, 0.15].map((x, i) => (
        <mesh
          key={x}
          position={P(x, -0.04 + (i % 2) * 0.04, 4.88)}
          rotation={[-0.32, 0, -x * 2.2]}
        >
          <coneGeometry args={[0.065, 0.24, 20]} />
          <M c={c} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );

  switch (look.hair) {
    case "bald":
      return null;
    case "afro":
      return afro;
    case "spiky":
      return spiky;
    case "dreads":
      return dreads(0.58);
    case "braids":
      return dreads(0.82);
    case "cornrows":
      return cornrows;
    case "long":
      return (
        <group>
          {cap}
          <mesh position={P(0, 0.14, 4.22)} scale={[1, 1.6, 0.65]}>
            <sphereGeometry args={[0.29, 32, 24]} />
            <M c={c} roughness={0.65} />
          </mesh>
        </group>
      );
    case "ponytail":
      return (
        <group>
          {cap}
          {/* Hair tie band */}
          <mesh position={P(0, 0.32, 4.5)}>
            <torusGeometry args={[0.08, 0.025, 12, 24]} />
            <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={P(0, 0.4, 4.3)} rotation={[0.35, 0, 0]}>
            <capsuleGeometry args={[0.075, 0.48, 16, 24]} />
            <M c={c} roughness={0.7} />
          </mesh>
        </group>
      );
    default:
      return cap;
  }
}

export function Hat({ g }) {
  if (!g) return null;
  const col = g.color || "#111111";

  if (g.model === "cap") {
    return (
      <group>
        {/* Crown dome */}
        <mesh position={P(0, 0.02, 4.67)} scale={[1.06, 0.65, 1.08]}>
          <sphereGeometry args={[0.285, 32, 24]} />
          <M c={col} roughness={0.7} />
        </mesh>
        {/* Curved visor brim */}
        <mesh position={P(0, -0.31, 4.61)} rotation={[-0.1, 0, 0]}>
          <boxGeometry args={[0.38, 0.03, 0.22]} />
          <M c={col} roughness={0.6} />
        </mesh>
        {/* Crown button */}
        <mesh position={P(0, 0.02, 4.88)}>
          <cylinderGeometry args={[0.025, 0.025, 0.02, 16]} />
          <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    );
  }

  if (g.model === "kufi") {
    return (
      <group>
        <mesh position={P(0, 0, 4.75)}>
          <cylinderGeometry args={[0.265, 0.275, 0.22, 36]} />
          <M c={col} roughness={0.65} />
        </mesh>
        {/* Gold embroidered brim ring */}
        <mesh position={P(0, 0, 4.65)}>
          <torusGeometry args={[0.272, 0.015, 16, 36]} />
          <meshStandardMaterial color="#ffd700" metalness={0.85} roughness={0.2} />
        </mesh>
      </group>
    );
  }

  // Beanie with ribbed turn-up cuff
  return (
    <group>
      <mesh position={P(0, 0.02, 4.68)} scale={[1.05, 0.76, 1.06]}>
        <sphereGeometry args={[0.29, 32, 24]} />
        <M c={col} roughness={0.85} />
      </mesh>
      <mesh position={P(0, 0.02, 4.58)}>
        <torusGeometry args={[0.28, 0.03, 16, 36]} />
        <M c={col} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Weapons({ gear }) {
  const m = gear.melee, s = gear.secondary, pr = gear.primary;
  return (
    <group>
      {/* MELEE WEAPON */}
      {m && (
        <group position={P(1.68, -0.05, 2.62)} rotation={[0, 0, 0.35]}>
          {m.model === "knuckles" ? (
            <group position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
              {/* 4 Knuckle finger rings */}
              {[-0.075, -0.025, 0.025, 0.075].map((kx) => (
                <group key={kx} position={[kx, 0, 0]}>
                  <mesh>
                    <torusGeometry args={[0.03, 0.014, 14, 24]} />
                    <meshStandardMaterial color={m.color || "#ffd700"} metalness={0.9} roughness={0.15} />
                  </mesh>
                  {/* Spiked strike pyramid */}
                  <mesh position={[0, 0.045, 0]}>
                    <coneGeometry args={[0.014, 0.03, 12]} />
                    <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
                  </mesh>
                </group>
              ))}
              {/* Palm reinforcement bar */}
              <mesh position={[0, -0.035, 0]}>
                <boxGeometry args={[0.22, 0.02, 0.03]} />
                <meshStandardMaterial color={m.color || "#ffd700"} metalness={0.9} roughness={0.2} />
              </mesh>
            </group>
          ) : m.model === "bat" ? (
            <group position={[0, -0.55, 0]}>
              {/* Tapered baseball bat */}
              <mesh>
                <cylinderGeometry args={[0.045, 0.088, 0.96, 28]} />
                <M c={m.color || "#a16207"} roughness={0.4} />
              </mesh>
              {/* Wrapped grip handle */}
              <mesh position={[0, -0.38, 0]}>
                <cylinderGeometry args={[0.042, 0.042, 0.28, 20]} />
                <M c="#1c1917" roughness={0.9} />
              </mesh>
              {/* Pommel knob */}
              <mesh position={[0, -0.52, 0]}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <M c="#1c1917" roughness={0.8} />
              </mesh>
            </group>
          ) : (
            /* High-Detail Machete / Cutlass / Cleaver */
            <group position={[0, -0.6, 0]}>
              {/* Polished steel blade with beveled spine */}
              <mesh position={[0, 0.1, 0]}>
                <boxGeometry args={[0.022, 0.95, 0.15]} />
                <meshStandardMaterial color={m.color || "#e2e8f0"} metalness={0.85} roughness={0.2} />
              </mesh>
              {/* Brass Crossguard */}
              <mesh position={[0, -0.38, 0]}>
                <boxGeometry args={[0.05, 0.03, 0.2]} />
                <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
              </mesh>
              {/* Hardwood grip */}
              <mesh position={[0, -0.52, 0]}>
                <cylinderGeometry args={[0.032, 0.032, 0.25, 16]} />
                <M c="#451a03" roughness={0.65} />
              </mesh>
              {/* Brass Pommel ring */}
              <mesh position={[0, -0.65, 0]}>
                <torusGeometry args={[0.035, 0.012, 12, 20]} />
                <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
              </mesh>
            </group>
          )}
        </group>
      )}

      {/* SECONDARY WEAPON (Detailed Pistol / Revolver) */}
      {s && (
        <group position={P(-0.48, -0.1, 2.35)}>
          {/* Grip frame */}
          <mesh position={[0, -0.05, -0.02]} rotation={[0.25, 0, 0]}>
            <boxGeometry args={[0.065, 0.22, 0.09]} />
            <meshStandardMaterial color="#18181b" roughness={0.7} />
          </mesh>
          {/* Slide & Barrel with metallic sheen */}
          <mesh position={[0, 0.12, 0.08]}>
            <boxGeometry args={[0.07, 0.085, 0.32]} />
            <meshStandardMaterial color={s.color || "#3f3f46"} metalness={0.8} roughness={0.25} />
          </mesh>
          {/* Trigger guard */}
          <mesh position={[0, 0.02, 0.04]}>
            <torusGeometry args={[0.03, 0.008, 10, 16]} />
            <meshStandardMaterial color="#27272a" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Hammer */}
          <mesh position={[0, 0.15, -0.07]}>
            <boxGeometry args={[0.02, 0.04, 0.03]} />
            <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      )}

      {/* PRIMARY WEAPON (Detailed Rifle / Shotgun / LMG) */}
      {pr && (
        <group position={P(0, 0.33, 3.3)} rotation={[0, 0, 0.75]}>
          {/* Main receiver chassis */}
          <mesh>
            <boxGeometry args={[0.09, 1.45, 0.11]} />
            <meshStandardMaterial color={pr.color || "#27272a"} metalness={0.8} roughness={0.28} />
          </mesh>
          {/* Barrel & Flash Hider */}
          <mesh position={[0, 0.85, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.35, 16]} />
            <meshStandardMaterial color="#09090b" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Curved Banana Magazine / Box Drum */}
          <mesh position={[0, -0.1, 0.12]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.06, 0.38, 0.14]} />
            <meshStandardMaterial color={pr.model === "shotgun" ? "#713f12" : "#ffd700"} metalness={0.85} roughness={0.25} />
          </mesh>
          {/* Tactical Stock */}
          <mesh position={[0, -0.85, -0.02]}>
            <boxGeometry args={[0.08, 0.42, 0.12]} />
            <M c={pr.model === "shotgun" ? "#713f12" : "#18181b"} roughness={0.7} />
          </mesh>
          {/* Optical Scope / Top Sight */}
          <mesh position={[0, 0.2, -0.08]}>
            <boxGeometry args={[0.04, 0.28, 0.05]} />
            <meshStandardMaterial color="#09090b" metalness={0.85} roughness={0.2} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export function Body({ look, gear, spin, hit, react, mood }) {
  const gltf = useLoader(GLTFLoader, "/models/character-base.glb", (l) => l.setMeshoptDecoder(MeshoptDecoder));
  const ref = useRef();
  const { scene, mesh, mat, bones: bonesMap } = useMemo(() => {
    const sc = cloneSkinned(gltf.scene);
    const mt = makeMaterial();
    let mh = null;
    sc.traverse((n) => { if (n.isSkinnedMesh || n.isMesh) { n.material = mt; mh = n; n.frustumCulled = false; } });
    window.__uwMesh = mh;
    const bb = new THREE.Box3().setFromBufferAttribute(mh.geometry.attributes.position);
    mt.userData.u.uMinY.value = bb.min.y;
    mt.userData.u.uH.value = bb.max.y - bb.min.y;
    const B = {};
    ["upperarmL", "upperarmR", "lowerarmL", "lowerarmR", "head", "handL", "handR", "chest"].forEach((n) => {
      const b = sc.getObjectByName(n);
      if (b) B[n] = { b, rest: b.quaternion.clone() };
    });
    return { scene: sc, mesh: mh, mat: mt, bones: B };
  }, [gltf]);
  const headRef = useRef();
  const handLRef = useRef();
  const hipRef = useRef();
  useEffect(() => {
    Object.values(bonesMap).forEach(({ b, rest }) => b.quaternion.copy(rest));
    scene.updateMatrixWorld(true);
    if (bonesMap.head && headRef.current) bonesMap.head.b.attach(headRef.current);
    if (bonesMap.handL && handLRef.current) bonesMap.handL.b.attach(handLRef.current);
    if (bonesMap.chest && hipRef.current) bonesMap.chest.b.attach(hipRef.current);
  }, [scene, bonesMap]);
  const o = outfitFrom(look, gear);
  const u = mat.userData.u;
  u.uSkin.value.set(look.skin); u.uTop.value.set(o.top); u.uUnder.value.set(o.under); u.uBottom.value.set(o.bottom);
  u.uShoes.value.set(o.shoes); u.uSocks.value.set(o.socks);
  u.uTopStyle.value = TOP[o.top_style] ?? 0; u.uPattern.value = PAT[o.pattern] ?? 0;
  u.uBotStyle.value = BOT[o.bottom_style] ?? 0; u.uBotPattern.value = PAT[o.bottom_pattern] ?? 0;
  const dict = mesh.morphTargetDictionary || {};
  const inf = mesh.morphTargetInfluences || [];
  const setM = (k, v) => { if (dict[k] !== undefined) inf[dict[k]] = v; };
  setM("female", look.gender === "female" ? 1 : 0);
  BUILDS.forEach((k) => setM(k, look.build === k ? 1 : 0));
  FACES.forEach((k) => setM(`face_${k === "heavy_jaw" ? "jaw" : k}`, look.face === k ? 1 : 0));
  const lastFrameTime = useRef(0);
  useFrame((st) => {
    if (!ref.current) return;
    const t = st.clock.elapsedTime;
    
    // Stop motion: limit to 12 FPS
    if (t - lastFrameTime.current < 1/12) return;
    lastFrameTime.current = t;

    const hitAge = hit.current ? t - hit.current : 99;
    if (hit.current === -1) hit.current = t;
    ref.current.rotation.y = spin.current + Math.sin(t * 0.5) * 0.12;
    const pose = posesAt(t, hitAge);
    ref.current.position.y = -1.12 + pose.bounce;
    ref.current.rotation.z = pose.lean;
    ref.current.scale.y = HEIGHT[look.height] || 1;
    scene.getWorldQuaternion(_root);
    _rootInv.copy(_root).invert();
    const b = bonesMap;
    const side = (s) => (s === "L" ? 1 : -1);
    ["L", "R"].forEach((s) => {
      const a = pose[s];
      if (b[`upperarm${s}`]) rotate(b[`upperarm${s}`], [[AX.z, a.z * side(s)], [AX.x, a.x]]);
      if (b[`lowerarm${s}`]) rotate(b[`lowerarm${s}`], [[AX.z, a.fore * side(s)], [AX.x, a.foreX || 0]]);
    });
    if (b.head) rotate(b.head, [[AX.x, pose.headX], [AX.y, pose.headY]]);
  });
  const s = 2.15 / 4.82;
  return (
    <group ref={ref} position={[0, -1.12, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}><circleGeometry args={[0.45, 32]} /><meshBasicMaterial color="#000" transparent opacity={0.45} /></mesh>
      <group scale={[s, s, s]}>
        <primitive object={scene} />
        <group ref={headRef}><Face look={look} hit={hit} react={react} mood={mood} />{gear.hat ? <Hat g={gear.hat} /> : <Hair look={look} />}</group>
        <group ref={handLRef}><Weapons gear={{ melee: gear.melee }} /></group>
        <group ref={hipRef}><Weapons gear={{ secondary: gear.secondary, primary: gear.primary }} /></group>
      </group>
    </group>
  );
}

const _cam = new THREE.Vector3();
function CamRig({ close }) {
  useFrame(({ camera }) => {
    _cam.set(0, close ? 0.93 : 0.2, close ? 1.25 : 3.9);
    camera.position.lerp(_cam, 0.12);
    camera.lookAt(0, close ? 0.9 : 0, 0);
  });
  return null;
}

export default function CharacterModel({ look, gear = {}, height = 300, testid = "character-3d", mood = "cocky" }) {
  const spin = useRef(0.35);
  const drag = useRef(null);
  const moved = useRef(0);
  const hit = useRef(0);
  const react = useRef("rage");
  const [bubble, setBubble] = useState(null);
  const [close, setClose] = useState(false);
  const timer = useRef(null);
  const onHit = () => {
    const kinds = Object.keys(REACTIONS);
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    const lines = REACTIONS[kind];
    react.current = kind;
    hit.current = -1;
    setBubble(lines[Math.floor(Math.random() * lines.length)]);
    if (navigator.vibrate) navigator.vibrate(40);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setBubble(null), 2400);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <div
      className="relative w-full touch-pan-y select-none border border-zinc-800 bg-[radial-gradient(circle_at_50%_35%,#2b2b2b,#141414_75%)]"
      style={{ height }}
      data-testid={testid}
      onPointerDown={(e) => { drag.current = e.clientX; moved.current = 0; }}
      onPointerMove={(e) => { if (drag.current !== null) { const dx = e.clientX - drag.current; moved.current += Math.abs(dx); spin.current += dx * 0.012; drag.current = e.clientX; } }}
      onPointerUp={() => { if (drag.current !== null && moved.current < 6) onHit(); drag.current = null; }}
      onPointerLeave={() => { drag.current = null; }}
      onPointerCancel={() => { drag.current = null; }}
    >
      {bubble && (
        <div className="rise pointer-events-none absolute left-1/2 top-3 z-10 max-w-[80%] -translate-x-1/2 border-2 border-ink bg-gold px-3 py-2 text-center font-display text-base uppercase leading-tight text-ink hard-shadow" data-testid="character-curse-bubble">
          {bubble}
        </div>
      )}
      <Canvas dpr={[1, 1.75]} gl={{ antialias: true, powerPreference: "low-power" }} camera={{ position: [0, 0.2, 3.9], fov: 36 }}>
        <hemisphereLight args={["#fff6e0", "#1a1a1a", 0.9]} />
        <ambientLight intensity={0.45} />
        <directionalLight position={[2.5, 3, 2.5]} intensity={1.6} />
        <directionalLight position={[-2, 1.5, -2]} intensity={0.6} color="#ffd700" />
        <CamRig close={close} />
        <Suspense fallback={null}><Body look={look} gear={gear} spin={spin} hit={hit} react={react} mood={mood} /></Suspense>
      </Canvas>
      <button
        onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()}
        onClick={() => setClose(!close)}
        className="btn-press absolute left-2 top-2 z-10 flex items-center gap-1 border border-zinc-700 bg-ink/80 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-zinc-300 hover:border-gold hover:text-gold"
        data-testid={`${testid}-zoom-btn`}
      >
        {close ? <PersonStanding className="h-3.5 w-3.5" /> : <ScanFace className="h-3.5 w-3.5" />}{close ? "Full body" : "Face"}
      </button>
      <div className="pointer-events-none absolute bottom-1.5 right-2 text-[9px] uppercase tracking-widest text-zinc-500">drag to turn · tap to slap</div>
    </div>
  );
}
