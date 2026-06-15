"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import Section from "@gmgroup/ui/Section";
import Badge from "@gmgroup/ui/Badge";
import SplitTextReveal from "@gmgroup/ui/SplitTextReveal";
import solar from "@/data/solar-projects.json";

/* MapLibre è pesante: dynamic ssr:false + mount pigro all'avvicinarsi al
   viewport, così non entra nel bundle iniziale né compete con l'LCP. */
const SolarMapInner = dynamic(() => import("./SolarMapInner"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

/** Voce di legenda. */
function Legend({ swatch, label }: { swatch: React.ReactNode; label: string }) {
  return (
    <span className="text-muted inline-flex items-center gap-2 text-xs">
      {swatch}
      {label}
    </span>
  );
}

/**
 * Mappa dei progetti GM Solar: una selezione di impianti sul territorio, con
 * clustering interattivo (i punti vicini si raggruppano e si espandono al
 * click) e popup con potenza e anno. La mappa monta solo quando ci si avvicina.
 * NB: posizioni e dati sono PLACEHOLDER demo (vedi solar-projects.json).
 */
export default function SolarMap() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Section id="mappa" size="wide">
      <div ref={sectionRef} className="max-w-2xl">
        <Badge>Sul territorio</Badge>
        <SplitTextReveal
          as="h2"
          text="I nostri impianti, sulla mappa"
          className="font-display text-display-sm mt-4 font-bold tracking-tight text-balance"
        />
        <p className="text-muted mt-4 text-lg">
          Una selezione dei progetti GM Solar in nord Italia. Tocca un punto per potenza e anno;
          i gruppi si aprono con un click.
        </p>
      </div>

      {/* Legenda */}
      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
        <Legend
          swatch={<span className="size-3 rounded-full border-2 border-white bg-accent" />}
          label="Impianto"
        />
        <Legend
          swatch={
            <span className="grid size-4 place-items-center rounded-full border-2 border-white bg-accent text-[0.5rem] font-bold text-accent-contrast">
              n
            </span>
          }
          label="Gruppo di impianti (click per aprire)"
        />
        <span className="text-muted text-xs">{solar.mappaProgetti.length} progetti in mappa</span>
      </div>

      <div className="border-border relative mt-8 h-[60vh] min-h-[420px] overflow-hidden rounded-xl border bg-brand-950">
        {near ? <SolarMapInner /> : <MapSkeleton />}
        {/* Onestà demo: le posizioni sono indicative, da sostituire coi progetti reali. */}
        <div className="bg-background/80 text-muted pointer-events-none absolute bottom-3 left-3 max-w-[16rem] rounded-md px-3 py-1.5 text-xs backdrop-blur">
          Posizioni indicative — selezione showcase, da sostituire con l&apos;elenco reale.
        </div>
      </div>
    </Section>
  );
}

function MapSkeleton() {
  return (
    <div className="bg-surface-2/50 absolute inset-0 grid place-items-center">
      <span className="text-muted animate-pulse text-sm">Carico la mappa…</span>
    </div>
  );
}
