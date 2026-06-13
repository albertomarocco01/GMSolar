"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import Section from "@/components/ui/Section";
import Badge from "@/components/ui/Badge";
import type { ApiChargingPoint } from "@/app/mobility/api/charging-points/route";
import { SHOWCASE_PINS } from "@/components/mobility/content";

/* MapLibre è pesante: dynamic ssr:false + mount pigro all'avvicinarsi al viewport. */
const ChargingMapInner = dynamic(() => import("./ChargingMapInner"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

type Status = "idle" | "ready" | "empty";

/* Voce di legenda. */
function Legend({ swatch, label }: { swatch: React.ReactNode; label: string }) {
  return (
    <span className="text-muted inline-flex items-center gap-2 text-xs">
      {swatch}
      {label}
    </span>
  );
}

/**
 * Sezione 5 — Mappa dei punti di ricarica. Dati pubblici REALI da Open Charge
 * Map (via /mobility/api/charging-points) + pin showcase dei clienti GMobility.
 * La mappa si carica solo quando ci si avvicina (performance).
 */
export default function ChargingMap() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [points, setPoints] = useState<ApiChargingPoint[]>([]);
  const [status, setStatus] = useState<Status>("idle");

  // Mount pigro: osserva la sezione.
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

  // Fetch dei punti pubblici una volta che la sezione è vicina.
  useEffect(() => {
    if (!near) return;
    let alive = true;
    fetch("/mobility/api/charging-points")
      .then((r) => r.json())
      .then((data: { points: ApiChargingPoint[] }) => {
        if (!alive) return;
        const pts = Array.isArray(data.points) ? data.points : [];
        setPoints(pts);
        setStatus(pts.length ? "ready" : "empty");
      })
      .catch(() => alive && setStatus("empty"));
    return () => {
      alive = false;
    };
  }, [near]);

  return (
    <Section id="mappa" size="wide">
      <div ref={sectionRef} className="mx-auto max-w-2xl text-center">
        <Badge>La rete</Badge>
        <h2 className="font-display text-display-sm mt-4 font-bold text-balance">
          Dove puoi ricaricare
        </h2>
        <p className="text-muted mt-4 text-lg text-pretty">
          Punti pubblici in tempo reale dalla rete Open Charge Map, più le installazioni GMobility
          presso i nostri clienti in Piemonte.
        </p>
      </div>

      {/* Legenda */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <Legend
          swatch={<span className="size-2.5 rounded-full border border-white/60 bg-[#3c9e3a]" />}
          label="Ricarica pubblica"
        />
        <Legend
          swatch={<span className="size-2.5 rounded-full border border-white/60 bg-[#7cf08a]" />}
          label="Fast (≥50 kW)"
        />
        <Legend
          swatch={<span className="bg-accent size-3 rounded-full border-2 border-white" />}
          label={`Clienti GMobility (${SHOWCASE_PINS.length})`}
        />
      </div>

      <div className="border-border bg-surface relative mt-8 h-[60vh] min-h-[420px] overflow-hidden rounded-xl border">
        {near ? <ChargingMapInner points={points} /> : <MapSkeleton />}
        {status === "empty" && (
          <div className="bg-background/80 text-muted pointer-events-none absolute bottom-3 left-3 rounded-md px-3 py-1.5 text-xs backdrop-blur">
            Rete pubblica non disponibile ora — mostriamo le installazioni GMobility.
          </div>
        )}
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
