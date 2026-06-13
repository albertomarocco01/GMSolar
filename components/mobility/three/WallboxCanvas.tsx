"use client";

import { Suspense, useEffect, type RefObject } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import WallboxScene from "./WallboxScene";

/** In frameloop="demand" forza un paio di render per "posare" la scena statica. */
function Settle() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
    const id = requestAnimationFrame(() => invalidate());
    return () => cancelAnimationFrame(id);
  }, [invalidate]);
  return null;
}

export type WallboxCanvasProps = {
  progressRef: RefObject<number>;
  /** false = reduced-motion / static: scena ferma, frameloop on demand. */
  animated: boolean;
  /** True quando i componenti sono "esplosi": rivela le label. */
  exploded: boolean;
};

/**
 * Wrapper del <Canvas> R3F. Caricato in dynamic import (ssr:false) dal lato
 * client: qui dentro vivono camera, luci, Bloom e la scena. Performance: dpr
 * limitato, frameloop "demand" quando non serve animare, dispose automatico al
 * dismount (lo gestisce R3F + il gating in MobilityStage).
 */
export default function WallboxCanvas({ progressRef, animated, exploded }: WallboxCanvasProps) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.1, 5.8], fov: 38 }}
      frameloop={animated ? "always" : "demand"}
    >
      {/* Illuminazione: niente HDR di rete (offline-friendly), solo luci. */}
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#cfe8ff", "#0a0c10", 0.5]} />
      <directionalLight position={[3, 4, 5]} intensity={1.15} />
      <directionalLight position={[-4, 1, -2]} intensity={0.4} color="#3c9e3a" />
      <pointLight position={[0, -1.5, 2]} intensity={1.2} color="#5ee36f" distance={6} />

      <Suspense fallback={null}>
        <WallboxScene progressRef={progressRef} animated={animated} exploded={exploded} />
      </Suspense>

      {/* Bloom selettivo sui materiali emissivi (barra LED, impulso del cavo). */}
      <EffectComposer>
        <Bloom
          intensity={0.9}
          luminanceThreshold={0.6}
          luminanceSmoothing={0.25}
          mipmapBlur
        />
      </EffectComposer>

      {!animated && <Settle />}
    </Canvas>
  );
}
