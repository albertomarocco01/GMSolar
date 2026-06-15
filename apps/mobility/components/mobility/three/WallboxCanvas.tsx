"use client";

import { Suspense, useEffect, type RefObject } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import WallboxScene from "./WallboxScene";

/**
 * Ponte tra React e il render-loop "demand".
 * - Espone `invalidate` al genitore (lo scroll può così chiedere UN frame).
 * - "Posa" la scena al mount con un paio di render iniziali: in "demand" il
 *   primo frame va richiesto esplicitamente, altrimenti la scena resta nera.
 */
function RenderBridge({ invalidateRef }: { invalidateRef: RefObject<(() => void) | null> }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidateRef.current = invalidate;
    invalidate();
    const id = requestAnimationFrame(() => invalidate());
    return () => {
      cancelAnimationFrame(id);
      invalidateRef.current = null;
    };
  }, [invalidate, invalidateRef]);
  return null;
}

/**
 * Robustezza: se la GPU perde il contesto WebGL (driver, throttling, troppi
 * canvas) la scena diventerebbe nera. Intercettiamo l'evento e avvisiamo il
 * genitore → fallback automatico al poster statico. preventDefault evita lo
 * stato "contesto perso non gestito".
 */
function ContextLossGuard({ onLost }: { onLost?: () => void }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    if (!onLost) return;
    const canvas = gl.domElement;
    const handle = (e: Event) => {
      e.preventDefault();
      onLost();
    };
    canvas.addEventListener("webglcontextlost", handle, false);
    return () => canvas.removeEventListener("webglcontextlost", handle, false);
  }, [gl, onLost]);
  return null;
}

export type WallboxCanvasProps = {
  progressRef: RefObject<number>;
  /** false = reduced-motion / static: scena ferma. */
  animated: boolean;
  /** True quando i componenti sono "esplosi": rivela le label. */
  exploded: boolean;
  /**
   * True quando la scena è davvero nel viewport. Gating del render loop: fuori
   * schermo il frameloop va in "never" (nessun render possibile) per non
   * sprecare GPU/batteria.
   */
  inView: boolean;
  /** Il Canvas registra qui la sua `invalidate` per il render on-demand. */
  invalidateRef: RefObject<(() => void) | null>;
  /** Bloom (postprocessing): off su low-end / prefers-reduced-data. */
  bloom: boolean;
  /** Tetto del device pixel ratio, adattato al device. */
  dprMax: number;
  /** Chiamata se la GPU perde il contesto WebGL → fallback al poster. */
  onContextLost?: () => void;
  /** Explode interattivo: id del componente selezionato (o null). */
  selected: string | null;
  /** Seleziona/deseleziona un componente. */
  onSelect: (id: string | null) => void;
};

/**
 * Wrapper del <Canvas> R3F. Caricato in dynamic import (ssr:false) lato client.
 *
 * Performance: render-loop "demand" — NIENTE loop continuo. Ogni frame è
 * richiesto esplicitamente (lo scroll chiama `invalidate` via RenderBridge),
 * quindi a riposo CPU/GPU restano idle: meno batteria su mobile e la pagina
 * raggiunge un periodo di idle (TTI calcolabile da Lighthouse). Fuori dal
 * viewport il frameloop passa a "never". dpr limitato, dispose al dismount.
 */
export default function WallboxCanvas({
  progressRef,
  animated,
  exploded,
  inView,
  invalidateRef,
  bloom,
  dprMax,
  onContextLost,
  selected,
  onSelect,
}: WallboxCanvasProps) {
  // Sempre "demand"; solo quando la scena animata è fuori schermo → "never".
  const frameloop = animated && !inView ? "never" : "demand";

  // La className va sul wrapper, non sul <Canvas> (CanvasProps non espone
  // `className` nel typecheck). Il <Canvas> riempie il wrapper al 100%.
  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, dprMax]}
        // powerPreference "default": su laptop/mobile evita di forzare la GPU
        // discreta (più batteria). antialias off su low-end (niente bloom = low-end).
        gl={{ antialias: bloom, alpha: true, powerPreference: "default" }}
        camera={{ position: [0, 0.1, 5.8], fov: 38 }}
        frameloop={frameloop}
        // Click nel vuoto della scena → deseleziona (chiude il pannello).
        onPointerMissed={() => onSelect(null)}
      >
        {/* Illuminazione: niente HDR di rete (offline-friendly), solo luci. */}
        <ambientLight intensity={0.55} />
        <hemisphereLight args={["#cfe8ff", "#0a0c10", 0.5]} />
        <directionalLight position={[3, 4, 5]} intensity={1.15} />
        <directionalLight position={[-4, 1, -2]} intensity={0.4} color="#3c9e3a" />
        <pointLight position={[0, -1.5, 2]} intensity={1.2} color="#5ee36f" distance={6} />

        <Suspense fallback={null}>
          <WallboxScene
            progressRef={progressRef}
            animated={animated}
            exploded={exploded}
            selected={selected}
            onSelect={onSelect}
          />
        </Suspense>

        {/* Bloom selettivo sui materiali emissivi (barra LED, impulso del cavo).
            Spento su low-end / reduced-data: è il passaggio GPU più costoso. */}
        {bloom && (
          <EffectComposer>
            <Bloom intensity={0.9} luminanceThreshold={0.6} luminanceSmoothing={0.25} mipmapBlur />
          </EffectComposer>
        )}

        <RenderBridge invalidateRef={invalidateRef} />
        <ContextLossGuard onLost={onContextLost} />
      </Canvas>
    </div>
  );
}
