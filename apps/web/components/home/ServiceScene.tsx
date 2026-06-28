"use client";

/**
 * @descrizione  Scena verticale a tutto schermo per un servizio: testo (numero,
 *   titolo, claim) + il DEMO incorporato a fianco. Reveal "motion design" all'
 *   ingresso (testo e contenuto entrano sfalsati) via ScrollTrigger verticale —
 *   affidabile (niente pin orizzontale). Si ri-tematizza sull'accent del
 *   servizio. Reduced-motion: tutto già visibile.
 * @indice
 * - ServiceScene → una sezione full-screen della home, con demo a fianco
 */
import { useRef, type CSSProperties } from "react";
import { gsap } from "@gmgroup/lib/gsap";
import { prefersReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";
import Container from "@gmgroup/ui/Container";

type AccentTheme = "platform" | "mobility" | "solar";

const ACCENTS: Record<AccentTheme, { a: string; s: string; c: string }> = {
  platform: { a: "#7c5cff", s: "#6344e6", c: "#ffffff" },
  mobility: { a: "#3c9e3a", s: "#2f7e2e", c: "#ffffff" },
  solar: { a: "#a8d920", s: "#8fbc15", c: "#0b1020" },
};

function accentStyle(theme: string): CSSProperties {
  const t = ACCENTS[theme as AccentTheme] ?? ACCENTS.platform;
  return {
    ["--accent" as string]: t.a,
    ["--accent-strong" as string]: t.s,
    ["--accent-contrast" as string]: t.c,
  } as CSSProperties;
}

export default function ServiceScene({
  number,
  label,
  title,
  blurb,
  theme,
  reverse = false,
  children,
}: {
  number: string;
  label: string;
  title: string;
  blurb: string;
  theme: string;
  /** Inverte testo/demo (alternanza visiva tra scene). */
  reverse?: boolean;
  children: React.ReactNode;
}) {
  const rootRef = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".scene-text > *", {
        autoAlpha: 0,
        y: 28,
        stagger: 0.1,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: root, start: "top 65%", once: true },
      });
      gsap.from(".scene-demo", {
        autoAlpha: 0,
        y: 40,
        scale: 0.96,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: root, start: "top 65%", once: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      aria-label={label}
      style={accentStyle(theme)}
      className="bg-background flex min-h-screen items-center py-20"
    >
      <Container size="wide">
        <div
          className={`grid items-center gap-10 lg:grid-cols-2 ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}
        >
          {/* Testo */}
          <div className="scene-text max-w-md">
            <p className="text-muted flex items-center gap-3">
              <span className="font-mono text-sm font-bold tabular-nums">{number}</span>
              <span className="text-accent-ink text-sm font-semibold tracking-widest uppercase">
                {label}
              </span>
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-balance sm:text-5xl">
              {title}
            </h2>
            <p className="text-muted mt-5 text-lg leading-relaxed">{blurb}</p>
          </div>

          {/* Demo reale */}
          <div className="scene-demo w-full">{children}</div>
        </div>
      </Container>
    </section>
  );
}
