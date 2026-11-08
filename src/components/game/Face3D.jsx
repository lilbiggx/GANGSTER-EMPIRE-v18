import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const P = (x, y, z) => [x, z, -y];
const M = ({ c, roughness = 0.55, metalness = 0.05, ...r }) => (
  <meshStandardMaterial color={c} roughness={roughness} metalness={metalness} {...r} />
);
const shade = (hex, k) => `#${new THREE.Color(hex).multiplyScalar(k).getHexString()}`;
const tint = (hex, to, k) => `#${new THREE.Color(hex).lerp(new THREE.Color(to), k).getHexString()}`;
const EYE = { long: [1.15, 0.7], round: [1.05, 1], square: [1.2, 0.8], narrow: [1.15, 0.72], heavy_jaw: [1.1, 0.78] };
const R90 = [0, 0, Math.PI / 2];

export const EXPR = {
  cocky: { lid: 0.18, brow: 0.15, browY: 0, mouth: "smirk" },
  happy: { lid: 0.05, brow: -0.12, browY: 0.01, mouth: "smile" },
  angry: { lid: 0.35, brow: 0.45, browY: -0.018, mouth: "frown" },
  nervous: { lid: -0.1, brow: -0.38, browY: 0.012, mouth: "grimace", dart: true },
  shocked: { lid: -0.35, brow: -0.15, browY: 0.03, mouth: "o" },
  pain: { lid: 0.95, brow: -0.42, browY: -0.005, mouth: "grimace" },
  laugh: { lid: 0.7, brow: -0.15, browY: 0.015, mouth: "laugh" },
  rage: { lid: 0.35, brow: 0.52, browY: -0.02, mouth: "shout" },
};
const MOUTHS = ["smirk", "smile", "frown", "grimace", "o", "laugh", "shout"];

export const REACTIONS = {
  rage: ["Ei! You dey craze?!", "Kwasia! You think I be your mate?", "Wo yɛ aboa! Comot for here!", "I go deal with you small small!", "You wan die? Ask Dockside boys!"],
  shocked: ["Herh! Who send you?!", "Ei Jesus! This one dey find trouble!", "You slap ME? Me?!"],
  pain: ["Ayyy my face! My fine face!", "Ah! My drip! You go pay for this!", "Abeg abeg, e pain me!"],
  laugh: ["Hahaha! You slap like small boy!", "Is that all? My grandma hit harder!", "Chale, try again, I dey wait!"],
};

function Eye({ x, look, lidRef, irisRef, skinD }) {
  const [w, h] = EYE[look.face] || [1.1, 0.85];
  const fem = look.gender === "female";
  return (
    <group position={P(x, -0.212, 4.545)}>
      {/* High-poly sclera with subtle corneal moisture */}
      <mesh scale={[w, h, 0.55]}>
        <sphereGeometry args={[0.046, 48, 36]} />
        <M c="#f6f4ee" roughness={0.15} />
      </mesh>

      <group ref={irisRef}>
        {/* Detailed High-Polygon Iris with limbal ring */}
        <mesh position={[0, 0, 0.02]} scale={[1, 1, 0.35]}>
          <sphereGeometry args={[0.026, 36, 24]} />
          <M c="#2b170a" roughness={0.25} />
        </mesh>
        {/* Inner amber/brown iris fibers */}
        <mesh position={[0, 0, 0.023]} scale={[0.85, 0.85, 0.3]}>
          <sphereGeometry args={[0.02, 28, 20]} />
          <M c="#5c381e" roughness={0.3} />
        </mesh>
        {/* Deep black pupil */}
        <mesh position={[0, 0, 0.027]} scale={[1, 1, 0.3]}>
          <sphereGeometry args={[0.012, 24, 16]} />
          <M c="#030303" roughness={0.05} />
        </mesh>
        {/* Realistic primary catchlight */}
        <mesh position={[0.009, 0.009, 0.03]}>
          <sphereGeometry args={[0.005, 16, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Secondary softer specular catchlight */}
        <mesh position={[-0.006, -0.007, 0.029]}>
          <sphereGeometry args={[0.0025, 12, 10]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.65} />
        </mesh>
      </group>

      {/* Smooth high-density articulated eyelid */}
      <group ref={lidRef} position={[0, 0.002, 0.002]}>
        <mesh rotation={[-0.55, 0, 0]} scale={[w * 1.08, h * 1.08, 0.62]}>
          <sphereGeometry args={[0.047, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <M c={skinD} roughness={0.6} />
        </mesh>
        {fem && (
          <mesh position={[0, 0.013, 0.023]} rotation={[0.2, 0, Math.PI / 2]} scale={[1, w, 1]}>
            <capsuleGeometry args={[0.0055, 0.065, 8, 16]} />
            <M c="#050505" roughness={0.4} />
          </mesh>
        )}
      </group>

      {/* Under-eye crease shadow */}
      <mesh position={[0, -0.033, 0.008]} rotation={R90}>
        <capsuleGeometry args={[0.007, 0.055, 6, 14]} />
        <M c={shade(skinD, 0.88)} roughness={0.7} />
      </mesh>
    </group>
  );
}

function Brow({ look, side, bref }) {
  const kind = look.brows || "thick";
  const fem = look.gender === "female";
  const r = { thin: 0.0065, thick: 0.014, bushy: 0.02, unibrow: 0.015 }[kind] * (fem ? 0.72 : 1);
  return (
    <group ref={bref} position={[side * 0.1, 4.605, 0.235]}>
      <mesh rotation={R90} scale={[1, 1, kind === "bushy" ? 1.4 : 1]}>
        <capsuleGeometry args={[r, kind === "bushy" ? 0.105 : 0.092, 8, 20]} />
        <M c={look.hair_color} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Nose({ look, skinD }) {
  const s = look.skin;
  const n = look.nose || "broad";
  const fem = look.gender === "female";
  const wing = (x, r) =>
    [-1, 1].map((sd) => (
      <mesh key={sd} position={[sd * x, -0.012, 0]}>
        <sphereGeometry args={[r, 28, 20]} />
        <M c={skinD} roughness={0.58} />
      </mesh>
    ));
  const k = fem ? 0.85 : 1;
  return (
    <group position={P(0, -0.25, 4.45)} scale={[k, k, k]}>
      {n === "broad" && (
        <>
          <mesh position={[0, 0.045, -0.005]} rotation={[-0.2, 0, 0]} scale={[0.8, 1, 1]}>
            <capsuleGeometry args={[0.022, 0.075, 12, 24]} />
            <M c={s} roughness={0.55} />
          </mesh>
          <mesh position={[0, -0.005, 0.02]} scale={[1.15, 0.9, 0.85]}>
            <sphereGeometry args={[0.034, 32, 24]} />
            <M c={s} roughness={0.55} />
          </mesh>
          {wing(0.04, 0.026)}
        </>
      )}
      {n === "button" && (
        <>
          <mesh position={[0, 0.04, -0.008]} rotation={[-0.2, 0, 0]}>
            <capsuleGeometry args={[0.015, 0.055, 12, 20]} />
            <M c={s} roughness={0.55} />
          </mesh>
          <mesh position={[0, 0, 0.012]}>
            <sphereGeometry args={[0.026, 28, 20]} />
            <M c={s} roughness={0.55} />
          </mesh>
          {wing(0.025, 0.017)}
        </>
      )}
      {n === "hook" && (
        <>
          <mesh position={[0, 0.03, 0.012]} rotation={[-0.45, 0, 0]}>
            <capsuleGeometry args={[0.021, 0.095, 12, 24]} />
            <M c={s} roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.048, 0.022]}>
            <sphereGeometry args={[0.024, 24, 18]} />
            <M c={s} roughness={0.55} />
          </mesh>
          <mesh position={[0, -0.02, 0.032]}>
            <sphereGeometry args={[0.03, 28, 20]} />
            <M c={s} roughness={0.55} />
          </mesh>
          {wing(0.032, 0.022)}
        </>
      )}
      {n === "big" && (
        <>
          <mesh position={[0, 0.04, 0.002]} rotation={[-0.3, 0, 0]}>
            <capsuleGeometry args={[0.03, 0.085, 12, 24]} />
            <M c={s} roughness={0.55} />
          </mesh>
          <mesh position={[0, -0.012, 0.032]} scale={[1.1, 0.95, 0.9]}>
            <sphereGeometry args={[0.052, 36, 28]} />
            <M c={s} roughness={0.55} />
          </mesh>
          {wing(0.05, 0.032)}
        </>
      )}
      {n === "pointy" && (
        <>
          <mesh position={[0, 0.03, 0.01]} rotation={[-0.35, 0, 0]}>
            <capsuleGeometry args={[0.017, 0.085, 12, 24]} />
            <M c={s} roughness={0.55} />
          </mesh>
          <mesh position={[0, -0.006, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.024, 0.075, 24]} />
            <M c={s} roughness={0.55} />
          </mesh>
          {wing(0.028, 0.018)}
        </>
      )}
    </group>
  );
}

function Mouth({ look, refs }) {
  const fem = look.gender === "female";
  const lip = fem ? tint(look.skin, "#991b1b", 0.48) : tint(shade(look.skin, 0.72), "#5a2a22", 0.28);
  const lip2 = shade(lip, 1.12);
  const dark = "#220505";
  const rough = fem ? 0.3 : 0.55;
  const teeth = (y, w = 0.075, h = 0.013) => (
    <mesh position={[0, y, 0.008]}>
      <boxGeometry args={[w, h, 0.01]} />
      <M c="#f6f4ee" roughness={0.25} />
    </mesh>
  );
  const set = (k) => (el) => {
    refs.current[k] = el;
  };
  return (
    <group position={P(0, -0.247, 4.365)}>
      <group ref={set("smirk")} rotation={[0, 0, 0.14]} position={[0.008, 0.002, 0]}>
        <mesh position={[0, 0.01, 0]} rotation={R90} scale={[0.75, 1, 0.8]}>
          <capsuleGeometry args={[0.017, fem ? 0.065 : 0.075, 8, 20]} />
          <M c={lip} roughness={rough} />
        </mesh>
        <mesh position={[0, -0.013, 0.004]} rotation={R90} scale={[0.95, 1, 0.85]}>
          <capsuleGeometry args={[0.02, fem ? 0.058 : 0.066, 8, 20]} />
          <M c={lip2} roughness={rough} />
        </mesh>
        <mesh position={[0, -0.002, 0.008]} rotation={R90}>
          <capsuleGeometry args={[0.0035, 0.075, 6, 14]} />
          <M c={shade(lip, 0.45)} />
        </mesh>
      </group>
      <group ref={set("smile")}>
        <mesh position={[0, 0.032, 0.004]} rotation={[0, 0, Math.PI * 1.12]}>
          <torusGeometry args={[0.05, 0.013, 14, 40, Math.PI * 0.76]} />
          <M c={lip} roughness={rough} />
        </mesh>
      </group>
      <group ref={set("frown")}>
        <mesh position={[0, -0.04, 0.004]} rotation={[0, 0, Math.PI * 0.14]}>
          <torusGeometry args={[0.046, 0.013, 14, 40, Math.PI * 0.72]} />
          <M c={lip} roughness={rough} />
        </mesh>
      </group>
      <group ref={set("grimace")}>
        {teeth(0, 0.082, 0.025)}
        <mesh position={[0, 0, 0.014]}>
          <boxGeometry args={[0.082, 0.002, 0.001]} />
          <M c="#8a8478" />
        </mesh>
        <mesh position={[0, 0.018, 0.004]} rotation={R90} scale={[0.6, 1, 0.7]}>
          <capsuleGeometry args={[0.013, 0.078, 6, 18]} />
          <M c={lip} roughness={rough} />
        </mesh>
        <mesh position={[0, -0.018, 0.004]} rotation={R90} scale={[0.6, 1, 0.7]}>
          <capsuleGeometry args={[0.013, 0.078, 6, 18]} />
          <M c={lip2} roughness={rough} />
        </mesh>
      </group>
      <group ref={set("o")}>
        <mesh position={[0, -0.006, 0]} scale={[0.75, 1, 0.3]}>
          <sphereGeometry args={[0.032, 28, 20]} />
          <meshBasicMaterial color={dark} />
        </mesh>
        <mesh position={[0, -0.006, 0.006]} scale={[0.75, 1, 1]}>
          <torusGeometry args={[0.032, 0.011, 14, 36]} />
          <M c={lip} roughness={rough} />
        </mesh>
      </group>
      <group ref={set("laugh")}>
        <mesh position={[0, 0.012, 0.007]}>
          <circleGeometry args={[0.048, 36, Math.PI, Math.PI]} />
          <meshBasicMaterial color={dark} />
        </mesh>
        {teeth(0.007)}
        <mesh position={[0, 0.017, 0.006]} rotation={R90} scale={[0.6, 1, 0.7]}>
          <capsuleGeometry args={[0.012, 0.088, 6, 18]} />
          <M c={lip} roughness={rough} />
        </mesh>
        <mesh position={[0, 0.012, 0.004]} rotation={[0, 0, Math.PI * 1.02]}>
          <torusGeometry args={[0.048, 0.012, 14, 40, Math.PI * 0.96]} />
          <M c={lip2} roughness={rough} />
        </mesh>
      </group>
      <group ref={set("shout")}>
        <mesh position={[0, -0.01, 0.002]} scale={[1.1, 0.85, 0.3]}>
          <sphereGeometry args={[0.045, 32, 24]} />
          <meshBasicMaterial color={dark} />
        </mesh>
        {teeth(0.017, 0.065, 0.011)}
        {teeth(-0.036, 0.055, 0.01)}
        <mesh position={[0, -0.01, 0.008]} scale={[1.1, 0.85, 1]}>
          <torusGeometry args={[0.045, 0.012, 14, 42]} />
          <M c={lip} roughness={rough} />
        </mesh>
      </group>
    </group>
  );
}

function Marks({ look }) {
  const dk = shade(look.skin, 0.62);
  switch (look.marks) {
    case "scar":
      return (
        <group>
          {/* Main keloid scar line */}
          <mesh position={P(0.14, -0.215, 4.6)} rotation={[0.3, 0, 0.9]}>
            <capsuleGeometry args={[0.0065, 0.11, 8, 16]} />
            <M c={tint(look.skin, "#e11d48", 0.35)} roughness={0.45} />
          </mesh>
          {/* Scar edge highlights */}
          <mesh position={P(0.142, -0.216, 4.602)} rotation={[0.3, 0, 0.9]}>
            <capsuleGeometry args={[0.003, 0.09, 6, 12]} />
            <M c={tint(look.skin, "#fecdd3", 0.4)} roughness={0.3} />
          </mesh>
        </group>
      );
    case "mole":
      return (
        <mesh position={P(0.105, -0.232, 4.4)}>
          <sphereGeometry args={[0.0095, 16, 12]} />
          <M c="#160904" roughness={0.5} />
        </mesh>
      );
    case "wrinkles":
      return (
        <group>
          {[4.632, 4.652].map((z) => (
            <mesh key={z} position={P(0, -0.226, z)} rotation={R90}>
              <capsuleGeometry args={[0.0035, 0.105, 6, 14]} />
              <M c={dk} roughness={0.8} />
            </mesh>
          ))}
          {[-1, 1].map((sd) => (
            <mesh key={sd} position={P(sd * 0.165, -0.2, 4.55)} rotation={[0, 0, sd * 0.4]}>
              <capsuleGeometry args={[0.003, 0.028, 6, 12]} />
              <M c={dk} roughness={0.8} />
            </mesh>
          ))}
        </group>
      );
    case "freckles":
      return (
        <group>
          {[[0.07, 4.49], [0.09, 4.475], [0.11, 4.49], [0.13, 4.47], [0.085, 4.455], [0.12, 4.455]].flatMap(([x, z]) =>
            [-1, 1].map((sd) => (
              <mesh key={`${sd}${x}${z}`} position={P(sd * x, -0.226, z)}>
                <sphereGeometry args={[0.0048, 12, 10]} />
                <M c={dk} roughness={0.65} />
              </mesh>
            ))
          )}
        </group>
      );
    case "warpaint":
      return (
        <group>
          {[-1, 1].flatMap((sd) =>
            [-0.02, 0.012].map((dx) => (
              <mesh key={`${sd}${dx}`} position={P(sd * (0.095 + dx), -0.222, 4.475)}>
                <capsuleGeometry args={[0.0055, 0.055, 6, 14]} />
                <M c="#f8fafc" roughness={0.4} />
              </mesh>
            ))
          )}
        </group>
      );
    default:
      return null;
  }
}

function Beard({ look }) {
  const c = look.hair_color;
  const tache = (o = 1) => (
    <group>
      <mesh position={P(0, -0.26, 4.393)} rotation={R90} scale={[0.75, 1, 0.65]}>
        <capsuleGeometry args={[0.018, 0.08, 8, 18]} />
        <M c={c} roughness={0.9} transparent={o < 1} opacity={o} />
      </mesh>
      {o === 1 &&
        [-1, 1].map((sd) => (
          <mesh key={sd} position={P(sd * 0.055, -0.252, 4.375)} rotation={[0, 0, sd * 0.5]}>
            <capsuleGeometry args={[0.012, 0.035, 6, 14]} />
            <M c={c} roughness={0.9} />
          </mesh>
        ))}
    </group>
  );
  const shell = (o) => (
    <mesh position={P(0, -0.12, 4.36)} scale={[1.1, 0.9, 0.8]}>
      <sphereGeometry args={[0.205, 36, 24, 0, Math.PI * 2, Math.PI * 0.6, Math.PI * 0.4]} />
      <M c={c} roughness={0.9} transparent={o < 1} opacity={o} side={THREE.DoubleSide} />
    </mesh>
  );
  switch (look.beard) {
    case "stubble":
      return (
        <group>
          {shell(0.4)}
          {tache(0.4)}
        </group>
      );
    case "goatee":
      return (
        <group>
          <mesh position={P(0, -0.222, 4.3)} scale={[0.85, 0.55, 1.05]}>
            <sphereGeometry args={[0.048, 28, 20]} />
            <M c={c} roughness={0.9} />
          </mesh>
          {tache()}
        </group>
      );
    case "moustache":
      return tache();
    case "full":
      return (
        <group>
          {shell(1)}
          {tache()}
        </group>
      );
    default:
      return null;
  }
}

function Glasses({ g }) {
  if (!g || g === "none") return null;
  return (
    <group>
      {[-0.1, 0.1].map((x) =>
        g === "round" ? (
          <group key={x}>
            {/* Gold metallic frame rim */}
            <mesh position={P(x, -0.262, 4.545)}>
              <torusGeometry args={[0.056, 0.007, 16, 40]} />
              <M c="#ffd700" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Translucent glass lens */}
            <mesh position={P(x, -0.262, 4.545)}>
              <circleGeometry args={[0.053, 32]} />
              <meshPhysicalMaterial
                color="#60a5fa"
                transmission={0.85}
                roughness={0.05}
                transparent
                opacity={0.65}
                reflectivity={0.9}
              />
            </mesh>
          </group>
        ) : (
          <group key={x}>
            {/* Square frame */}
            <mesh position={P(x, -0.262, 4.545)}>
              <boxGeometry args={[0.135, 0.088, 0.012]} />
              <M
                c={g === "shades" ? "#09090b" : "#38bdf8"}
                metalness={g === "shades" ? 0.3 : 0.8}
                roughness={0.15}
                transparent
                opacity={g === "shades" ? 0.98 : 0.65}
              />
            </mesh>
          </group>
        )
      )}
      {/* Bridge connector */}
      <mesh position={P(0, -0.268, 4.55)}>
        <boxGeometry args={[0.075, 0.012, 0.012]} />
        <M c="#ffd700" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

export function Face({ look, mood = "cocky", hit, react }) {
  const fem = look.gender === "female";
  const skinD = shade(look.skin, 0.82);
  const browL = useRef(), browR = useRef(), lidL = useRef(), lidR = useRef(), irisL = useRef(), irisR = useRef();
  const mouths = useRef({});
  const earK = { small: 0.75, normal: 1, big: 1.45 }[look.ears] || 1;

  useFrame((st) => {
    const t = st.clock.elapsedTime;
    const active = hit.current > 0 && t - hit.current < 2.6;
    const e = EXPR[active ? react.current : mood] || EXPR.cocky;
    const blink = !active && t % 3.7 < 0.13;
    [lidL, lidR].forEach((l) => l.current && (l.current.rotation.x = blink ? 0.9 : e.lid));
    const dx = e.dart ? Math.sin(t * 7) * 0.008 : 0;
    [irisL, irisR].forEach((l) => l.current && (l.current.position.x = dx));
    if (browL.current) {
      browL.current.rotation.z = -e.brow;
      browL.current.position.y = 4.605 + e.browY;
    }
    if (browR.current) {
      browR.current.rotation.z = e.brow;
      browR.current.position.y = 4.605 + e.browY;
    }
    MOUTHS.forEach((k) => mouths.current[k] && (mouths.current[k].visible = k === e.mouth));
  });

  return (
    <group>
      <Eye x={-0.095} look={look} lidRef={lidL} irisRef={irisL} skinD={skinD} />
      <Eye x={0.095} look={look} lidRef={lidR} irisRef={irisR} skinD={skinD} />
      <Brow look={look} side={-1} bref={browL} />
      <Brow look={look} side={1} bref={browR} />
      {look.brows === "unibrow" && (
        <mesh position={P(0, -0.24, 4.598)} rotation={R90}>
          <capsuleGeometry args={[0.012, 0.045, 8, 16]} />
          <M c={look.hair_color} roughness={0.9} />
        </mesh>
      )}
      <Nose look={look} skinD={skinD} />
      <Mouth look={look} refs={mouths} />
      {[-1, 1].map((sd) => (
        <group key={sd} position={P(sd * 0.238, 0.01, 4.5)} rotation={[0, sd * 0.25, 0]} scale={[earK, earK, earK]}>
          <mesh scale={[0.35, 1, 0.7]}>
            <sphereGeometry args={[0.068, 28, 20]} />
            <M c={look.skin} roughness={0.58} />
          </mesh>
          {fem && (
            <mesh position={[sd * 0.012, -0.065, 0]}>
              <torusGeometry args={[0.016, 0.004, 12, 28]} />
              <M c="#FFD700" metalness={0.95} roughness={0.15} />
            </mesh>
          )}
        </group>
      ))}
      <Marks look={look} />
      {!fem && <Beard look={look} />}
      <Glasses g={look.glasses} />
    </group>
  );
}
