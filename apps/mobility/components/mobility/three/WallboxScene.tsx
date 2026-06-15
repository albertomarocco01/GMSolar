"use client";

import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html, Instance, Instances, RoundedBox } from "@react-three/drei";
import { WALLBOX_PARTS } from "@/components/mobility/content";

/* Palette della scena. Verde "foresta" del brand mobility + una variante più
   luminosa per l'emissivo (così il Bloom la "cattura"). */
const BODY = "#171b22";
const BODY_EDGE = "#232b34";
const ACCENT = "#3c9e3a"; // brand mobility
const GLOW = "#5ee36f"; // emissivo (più chiaro → bloom)

type Vec3 = [number, number, number];

/* Posizioni "assemblate" di ogni pezzo (= la posa di partenza). */
const HOME: Record<string, Vec3> = {
  plate: [0, 0, -0.34],
  shell: [0, 0, 0],
  screen: [0, 0.55, 0.26],
  strip: [-0.5, -0.1, 0.27],
  socket: [0.18, -0.58, 0.32],
  cable: [0.18, -0.78, 0.34],
};

/* Direzioni di "explode": offset locale di ogni pezzo a esplosione piena. */
const EXPLODE: Record<string, Vec3> = {
  plate: [-0.2, -0.35, -1.9],
  shell: [-0.95, 0.05, -0.15],
  screen: [0.85, 1.05, 0.65],
  strip: [-1.75, 0.15, 0.55],
  socket: [1.5, -0.55, 0.95],
  cable: [0.65, -1.6, 0.6],
};

/* Layout dei 7 contatti del connettore Tipo 2 (stilizzato), su un cerchio. */
const PIN_LAYOUT: [number, number][] = [
  [0, 0.13],
  [-0.11, 0.06],
  [0.11, 0.06],
  [-0.11, -0.07],
  [0.11, -0.07],
  [-0.05, -0.14],
  [0.05, -0.14],
];

function clamp01(n: number) {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}
/** Interpolazione "smussata" tra due soglie (come GLSL smoothstep). */
function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}
/** Posa un pezzo da HOME verso l'offset di explode (fattore e = 0..1). */
function place(g: THREE.Group | null, key: string, e: number) {
  if (!g) return;
  const h = HOME[key];
  const o = EXPLODE[key];
  g.position.set(h[0] + o[0] * e, h[1] + o[1] * e, h[2] + o[2] * e);
}

type SceneProps = {
  /** Progresso di scroll 0..1 (ref, niente re-render per frame). */
  progressRef: RefObject<number>;
  /** Se false (reduced-motion/static): scena ferma, niente pulse. */
  animated: boolean;
  /** True quando i componenti sono "esplosi": rivela le label (via CSS). */
  exploded: boolean;
};

/**
 * La colonnina/wallbox costruita interamente da PRIMITIVE (nessun glTF):
 * scocca a box arrotondato, barra LED emissiva, connettore Tipo 2 con contatti
 * istanziati, cavo Mode 3 con impulso di energia. Lo scroll fa ruotare il tutto
 * e "separa" i componenti (explode). Tutto guidato in useFrame da un ref →
 * nessun re-render React nel loop di rendering.
 */
export default function WallboxScene({ progressRef, animated, exploded }: SceneProps) {
  const group = useRef<THREE.Group>(null);
  const plate = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Group>(null);
  const screen = useRef<THREE.Group>(null);
  const strip = useRef<THREE.Group>(null);
  const socket = useRef<THREE.Group>(null);
  const cable = useRef<THREE.Group>(null);
  const bead = useRef<THREE.Mesh>(null);
  const eased = useRef(0);

  // Curva del cavo (CatmullRom): parte dal connettore e scende a tendina.
  const cableCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.05, 0.05),
        new THREE.Vector3(0.12, -0.5, 0.18),
        new THREE.Vector3(-0.04, -1.0, 0.05),
        new THREE.Vector3(0.16, -1.45, -0.08),
      ]),
    [],
  );

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;

    // Target di progresso: scroll se animato, altrimenti la posa "assemblata".
    const target = animated ? clamp01(progressRef.current ?? 0) : 0;
    // Lerp morbido (frame-rate independent). In static si aggancia subito.
    eased.current += (target - eased.current) * (animated ? Math.min(1, dt * 4) : 1);
    const p = eased.current;

    // Rotazione complessiva.
    g.rotation.x = -0.12;
    g.rotation.y = animated ? -0.35 + p * Math.PI * 1.15 : -0.5;

    // Explode: ogni pezzo si allontana dalla sua posizione assemblata.
    const e = smoothstep(0.1, 0.85, p);
    place(plate.current, "plate", e);
    place(shell.current, "shell", e);
    place(screen.current, "screen", e);
    place(strip.current, "strip", e);
    place(socket.current, "socket", e);
    place(cable.current, "cable", e);

    // Camera dolly: si allontana per inquadrare i pezzi separati. Uso state.camera
    // (non un valore catturato in render) così resta una mutazione "imperativa".
    const cam = state.camera;
    const camK = animated ? Math.min(1, dt * 3) : 1;
    cam.position.z += (5.8 + e * 1.7 - cam.position.z) * camK;
    cam.position.y += (0.1 + e * 0.25 - cam.position.y) * camK;
    cam.lookAt(0, 0, 0);

    // Impulso di energia lungo il cavo (solo animato): bead che scorre + glow.
    if (animated && bead.current) {
      const t = (state.clock.elapsedTime * 0.45) % 1;
      bead.current.position.copy(cableCurve.getPointAt(t));
      const mat = bead.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 2 + Math.sin(t * Math.PI) * 3;
    }
  });

  return (
    <group ref={group} scale={0.92}>
      {/* --- Piastra a muro --- */}
      <group ref={plate} position={HOME.plate}>
        <RoundedBox args={[1.7, 2.55, 0.12]} radius={0.08} smoothness={3}>
          <meshStandardMaterial color={"#0e1116"} metalness={0.3} roughness={0.8} />
        </RoundedBox>
        {animated && <PartLabel index={4} show={exploded} position={[0, -1.45, 0]} />}
      </group>

      {/* --- Scocca / corpo IP55 --- */}
      <group ref={shell} position={HOME.shell}>
        <RoundedBox args={[1.4, 2.2, 0.5]} radius={0.18} smoothness={4}>
          <meshStandardMaterial color={BODY} metalness={0.45} roughness={0.45} />
        </RoundedBox>
        {/* bordo superiore appena più chiaro per leggere il volume */}
        <RoundedBox args={[1.42, 0.06, 0.52]} radius={0.03} position={[0, 1.05, 0]}>
          <meshStandardMaterial color={BODY_EDGE} metalness={0.6} roughness={0.3} />
        </RoundedBox>
        {animated && <PartLabel index={0} show={exploded} position={[-0.85, 0.7, 0.3]} />}
      </group>

      {/* --- Display / logo (lieve emissivo) --- */}
      <group ref={screen} position={HOME.screen}>
        <RoundedBox args={[0.92, 0.52, 0.06]} radius={0.05}>
          <meshStandardMaterial
            color={"#0a0e0b"}
            emissive={ACCENT}
            emissiveIntensity={0.5}
            metalness={0.2}
            roughness={0.3}
          />
        </RoundedBox>
      </group>

      {/* --- Barra di stato LED (emissiva → bloom) --- */}
      <group ref={strip} position={HOME.strip}>
        <mesh>
          <boxGeometry args={[0.12, 1.5, 0.06]} />
          <meshStandardMaterial
            color={GLOW}
            emissive={GLOW}
            emissiveIntensity={2.4}
            toneMapped={false}
          />
        </mesh>
        {animated && <PartLabel index={1} show={exploded} position={[-0.45, 0.2, 0.2]} />}
      </group>

      {/* --- Connettore Tipo 2 (contatti ISTANZIATI) --- */}
      <group ref={socket} position={HOME.socket}>
        {/* alloggiamento rotondo */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.27, 0.29, 0.2, 36]} />
          <meshStandardMaterial color={"#0c0f14"} metalness={0.5} roughness={0.4} />
        </mesh>
        {/* faccia frontale */}
        <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.23, 0.23, 0.02, 36]} />
          <meshStandardMaterial color={"#1b2026"} metalness={0.3} roughness={0.6} />
        </mesh>
        {/* 7 contatti istanziati */}
        <Instances range={PIN_LAYOUT.length} position={[0, 0, 0.12]}>
          <cylinderGeometry args={[0.045, 0.045, 0.08, 14]} />
          <meshStandardMaterial color={"#cdd3da"} metalness={0.8} roughness={0.25} />
          {PIN_LAYOUT.map(([x, y], i) => (
            <Instance key={i} position={[x, y, 0]} rotation={[Math.PI / 2, 0, 0]} />
          ))}
        </Instances>
        {animated && <PartLabel index={2} show={exploded} position={[0.55, 0.1, 0.2]} />}
      </group>

      {/* --- Cavo Mode 3 + impulso di energia --- */}
      <group ref={cable} position={HOME.cable}>
        <mesh>
          <tubeGeometry args={[cableCurve, 64, 0.05, 12, false]} />
          <meshStandardMaterial color={"#0d100f"} metalness={0.2} roughness={0.7} />
        </mesh>
        {animated && (
          <mesh ref={bead}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial
              color={GLOW}
              emissive={GLOW}
              emissiveIntensity={3}
              toneMapped={false}
            />
          </mesh>
        )}
        {animated && <PartLabel index={3} show={exploded} position={[0.35, -0.9, 0.2]} />}
      </group>
    </group>
  );
}

/* Label "in-world" attaccata al pezzo (si muove con l'explode). La comparsa è
   gestita in CSS (opacity + transition) dal flag `show`: niente lavoro per frame.
   Lo stagger è dato dal transitionDelay in base all'indice. */
function PartLabel({
  index,
  show,
  position,
}: {
  index: number;
  show: boolean;
  position: [number, number, number];
}) {
  const part = WALLBOX_PARTS[index];
  return (
    <Html
      position={position}
      center
      distanceFactor={7}
      zIndexRange={[20, 0]}
      wrapperClass="pointer-events-none"
    >
      <div
        style={{ opacity: show ? 1 : 0, transitionDelay: `${index * 70}ms` }}
        className="pointer-events-none w-max max-w-[10rem] -translate-y-1/2 transition-opacity duration-500 select-none"
      >
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/70 px-3 py-1 backdrop-blur">
          <span className="bg-accent inline-block size-1.5 rounded-full" />
          <span className="text-xs font-semibold whitespace-nowrap text-white">{part.label}</span>
        </div>
        <p className="mt-1 ml-3 text-[0.65rem] leading-tight text-white/55">{part.hint}</p>
      </div>
    </Html>
  );
}
