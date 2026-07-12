"use client";

/**
 * @descrizione  Primitiva RIUSABILE: un <video> "scrubbato" dallo scroll. NON va
 *   in autoplay libero — la scena madre gli passa il proprio progress di
 *   ScrollTrigger (0→1) via il metodo imperativo `seek()`, e il video avanza/torna
 *   indietro mappando `currentTime = progress * durata`. Un lerp in rAF avvicina
 *   dolcemente il tempo reale al target → niente scatti, moto fluido in entrambe le
 *   direzioni anche se lo scroll salta. Richiede video ALL-KEYFRAME (ogni frame
 *   indipendente) per un seek istantaneo: i derivati in /public/assets sono già così
 *   (re-encode `-g 1`). Serve a più scene (solare, cavo EV), da qui l'estrazione.
 *
 *   - muted + playsInline + preload differito: parte a bufferare quando la scena si
 *     avvicina (IntersectionObserver con rootMargin), così è pronta al seek quando
 *     entra a schermo. Su iOS/mobile un play()→pause() muto "sblocca" il rendering
 *     dei frame in seek (senza, il video resta al poster).
 *   - reduced-motion: NIENTE scrub. Il video non si carica né parte → resta il
 *     poster statico (fallback leggibile). L'info tecnica la porta comunque il
 *     layer di callout della scena in versione statica.
 * @indice
 * - ScrubVideo → <video> full-bleed pilotato dallo scroll via ref.seek(progress)
 */
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { cn } from "@gmgroup/lib/utils";
import { useReducedMotion } from "@gmgroup/lib/motion";

export type ScrubVideoHandle = {
  /** Porta il video a `progress` (0→1) della sua durata. No-op finché non è pronto. */
  seek: (progress: number) => void;
};

type ScrubVideoProps = {
  src: string;
  poster: string;
  className?: string;
};

const ScrubVideo = forwardRef<ScrubVideoHandle, ScrubVideoProps>(function ScrubVideo(
  { src, poster, className },
  ref,
) {
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetRef = useRef(0); // secondi desiderati (scritti da seek)
  const readyRef = useRef(false); // true dopo loadedmetadata (durata nota)

  useImperativeHandle(
    ref,
    () => ({
      seek(progress) {
        const v = videoRef.current;
        if (!v || reduced || !readyRef.current) return;
        const dur = v.duration;
        if (!dur || !isFinite(dur)) return;
        targetRef.current = Math.max(0, Math.min(dur, progress * dur));
      },
    }),
    [reduced],
  );

  useEffect(() => {
    const v = videoRef.current;
    if (!v || reduced) return; // reduced-motion: resta il poster, nessun caricamento

    let primed = false;
    let raf = 0;
    const onMeta = () => {
      readyRef.current = true;
    };
    v.addEventListener("loadedmetadata", onMeta);

    // Buffer + "prime" in anticipo: quando la scena è entro ~un viewport, inizia a
    // scaricare e sblocca il seek dei frame con un play()→pause() muto.
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        v.preload = "auto";
        if (v.readyState < 1) v.load();
        if (!primed) {
          primed = true;
          void v
            .play()
            .then(() => v.pause())
            .catch(() => {});
        }
      },
      { rootMargin: "100% 0px", threshold: 0 },
    );
    io.observe(v);

    // Lerp del currentTime verso il target: seek fluido, niente thrash. fastSeek va
    // al keyframe più vicino (≤ time): con video all-keyframe è frame-accurate e veloce.
    // Passo INDIPENDENTE dal refresh rate: il fattore fisso 0.25/frame "correva" e
    // scattava su schermi a 120/144Hz — ora il catch-up è calcolato sul delta-time
    // reale (costante di tempo TAU) → stessa fluidità a ogni frequenza di refresh.
    const TAU = 0.06; // costante di tempo del catch-up (s): più bassa = più reattivo
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000); // clamp: tab in background non fa salti
      last = now;
      if (!readyRef.current || v.seeking) return;
      const cur = v.currentTime;
      const d = targetRef.current - cur;
      if (Math.abs(d) < 0.015) return; // già a destinazione
      const next = cur + d * (1 - Math.exp(-dt / TAU));
      if (typeof v.fastSeek === "function") v.fastSeek(next);
      else v.currentTime = next;
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      v.removeEventListener("loadedmetadata", onMeta);
    };
  }, [reduced]);

  return (
    <video
      ref={videoRef}
      className={cn("h-full w-full object-cover", className)}
      muted
      playsInline
      preload="none"
      poster={poster}
      aria-hidden
    >
      <source src={src} type="video/mp4" />
    </video>
  );
});

export default ScrubVideo;
