"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { DURATION, EASE, prefersReducedMotion, useIsoLayoutEffect } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type SplitTextRevealProps = {
  text: string;
  /** Elemento del wrapper (h1, h2, p…). Default "div". */
  as?: React.ElementType;
  className?: string;
  /** Unità di split: parole (default) o caratteri. */
  by?: "word" | "char";
  duration?: number;
  /** Sfasamento in secondi tra un'unità e la successiva. */
  stagger?: number;
  delay?: number;
  start?: string;
  once?: boolean;
};

type Piece = { type: "space" } | { type: "unit"; text: string };

function toPieces(text: string, by: "word" | "char"): Piece[] {
  if (by === "char") {
    return [...text].map((ch) => (ch === " " ? { type: "space" } : { type: "unit", text: ch }));
  }
  // by word: alterna parola / spazio così il wrapping resta naturale.
  const pieces: Piece[] = [];
  text.split(" ").forEach((word, i) => {
    if (i > 0) pieces.push({ type: "space" });
    if (word.length) pieces.push({ type: "unit", text: word });
  });
  return pieces;
}

/**
 * Reveal tipografico con maschera: ogni parola/carattere "sale" da sotto una
 * maschera (overflow hidden) in cascata, allo scroll. NON usa il plugin
 * premium SplitText: splitting fatto a mano. Accessibile (aria-label col testo
 * intero, split marcato aria-hidden). Rispetta prefers-reduced-motion.
 */
export default function SplitTextReveal({
  text,
  as = "div",
  className,
  by = "word",
  duration = DURATION.slow,
  stagger = 0.06,
  delay = 0,
  start = "top 85%",
  once = true,
}: SplitTextRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.from(".split-inner", {
        yPercent: 110,
        duration,
        delay,
        ease: EASE.out,
        stagger,
        scrollTrigger: { trigger: el, start, once },
      });
    }, ref);

    return () => ctx.revert();
  }, [text, by, duration, stagger, delay, start, once]);

  const pieces = toPieces(text, by);
  // Cast necessario: con React Three Fiber nel progetto, `React.JSX.IntrinsicElements`
  // include gli elementi three e allarga `React.ElementType`, facendo collassare a
  // `never` le prop del tag polimorfico. Il cast riporta le prop attese (no-op a
  // runtime). Vedi NOTES-shared.md → richiesta Mobility.
  const Tag = as as React.ComponentType<{
    ref?: React.Ref<HTMLElement>;
    className?: string;
    "aria-label"?: string;
    children?: React.ReactNode;
  }>;

  return (
    <Tag ref={ref} className={cn(className)} aria-label={text}>
      <span aria-hidden="true">
        {pieces.map((piece, i) =>
          piece.type === "space" ? (
            " "
          ) : (
            // Maschera: overflow-hidden con padding per non tagliare le discendenti.
            <span
              key={i}
              className="mb-[-0.15em] inline-block overflow-hidden pb-[0.15em] align-bottom"
            >
              <span className="split-inner inline-block will-change-transform">{piece.text}</span>
            </span>
          ),
        )}
      </span>
    </Tag>
  );
}
