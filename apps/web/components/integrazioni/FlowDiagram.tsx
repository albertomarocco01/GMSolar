/**
 * FlowDiagram — visualizza uno scenario di orchestrazione API come diagramma
 * a nodi collegati da linee SVG, con un "pacchetto" animato che percorre ogni
 * arco e illumina i nodi in sequenza. Un log simulato scorre in parallelo.
 *
 * Strategia animazione:
 *   - GSAP: anima il cerchio SVG lungo ogni arco (attr.cx da -10 a larghezza+10)
 *   - setTimeout: aggiorna lo stato React (nodo illuminato + log) in sincronia
 *   - reduced-motion: skip animazione, mostra tutto completato immediatamente
 *
 * SIMULAZIONE DIMOSTRATIVA — nessuna chiamata reale viene effettuata.
 *
 * Punti d'innesto reali (per riferimento):
 *   Scenario "lead":    form → WhatsApp POST /{phone-id}/messages
 *                             → Resend POST https://api.resend.com/emails
 *                             → HubSpot POST /crm/v3/objects/contacts
 *                             → Google Calendar POST /calendar/v3/calendars/{id}/events
 *   Scenario "payment": Stripe webhook → Resend → HubSpot → LLM → Sheets
 */

"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Play, RotateCcw } from "lucide-react";
import { gsap } from "@gmgroup/lib/gsap";
import { useReducedMotion } from "@gmgroup/lib/motion";
import Button from "@gmgroup/ui/Button";
import FlowNode from "./FlowNode";
import FlowLog from "./FlowLog";
import { SCENARIOS } from "./data";

/** Durata del "pacchetto" che percorre un arco, in secondi (GSAP). */
const PULSE_S = 0.7;
/** Pausa sul nodo dopo l'arrivo del pacchetto, in secondi. */
const PAUSE_S = 0.35;
/** Equivalenti in millisecondi per i setTimeout React. */
const PULSE_MS = PULSE_S * 1000;
const STEP_MS = (PULSE_S + PAUSE_S) * 1000;

export type FlowDiagramProps = {
  /** ID dello scenario da mostrare (cfr. data.ts SCENARIOS). */
  scenarioId: string;
};

export default function FlowDiagram({ scenarioId }: FlowDiagramProps) {
  const scenario = SCENARIOS.find((s) => s.id === scenarioId);

  // Stato animazione
  const [completedUpTo, setCompletedUpTo] = useState(-1);
  const [logCount, setLogCount] = useState(0);

  // Refs per gli elementi SVG degli archi
  const svgRefs = useRef<(SVGSVGElement | null)[]>([]);
  const circleRefs = useRef<(SVGCircleElement | null)[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const reducedMotion = useReducedMotion();

  // Cleanup su unmount
  useEffect(() => {
    return () => {
      tlRef.current?.kill();
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const reset = useCallback(() => {
    tlRef.current?.kill();
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setCompletedUpTo(-1);
    setLogCount(0);
  }, []);

  const play = useCallback(() => {
    if (!scenario) return;
    reset();

    const n = scenario.steps.length;

    // reduced-motion: mostra tutto completato immediatamente
    if (reducedMotion) {
      setCompletedUpTo(n - 1);
      setLogCount(scenario.logEntries.length);
      return;
    }

    // Primo nodo e prima voce di log: immediati
    setCompletedUpTo(0);
    setLogCount(1);

    // Timeout per illuminare i nodi successivi in sincronia con GSAP
    const ts = scenario.steps.slice(1).map((_, i) =>
      setTimeout(
        () => {
          setCompletedUpTo(i + 1);
          setLogCount(i + 2);
        },
        PULSE_MS + i * STEP_MS,
      ),
    );
    timeoutsRef.current = ts;

    // Timeline GSAP: cerchio SVG che percorre ogni arco
    const tl = gsap.timeline();
    tlRef.current = tl;

    scenario.steps.forEach((_, i) => {
      if (i >= n - 1) return;
      const svg = svgRefs.current[i];
      const circle = circleRefs.current[i];
      if (!svg || !circle) return;

      const w = svg.getBoundingClientRect().width;
      const startAt = i * (PULSE_S + PAUSE_S);

      tl.set(circle, { attr: { cx: -10, opacity: 1 } }, startAt)
        .to(circle, { attr: { cx: w + 10 }, duration: PULSE_S, ease: "power2.inOut" }, startAt)
        .set(circle, { attr: { opacity: 0 } }, startAt + PULSE_S);
    });
  }, [scenario, reset, reducedMotion]);

  if (!scenario) return null;

  const { steps, logEntries } = scenario;
  const n = steps.length;
  const minW = n * 64 + (n - 1) * 40;

  return (
    <div className="flex flex-col gap-6">
      {/* A11y: equivalente testuale ordinato (visivamente nascosto) */}
      <ol className="sr-only">
        {steps.map((step, i) => (
          <li key={step.id}>
            {i + 1}. {step.label}
          </li>
        ))}
      </ol>

      {/* Diagramma visuale — scrollabile in orizzontale su mobile */}
      <div className="overflow-x-auto pb-2" aria-hidden>
        <div className="flex items-center" style={{ minWidth: `${minW}px` }}>
          {steps.map((step, i) => (
            <div
              key={step.id}
              className="flex items-center"
              style={{ flex: i < n - 1 ? "0 0 auto" : "0 0 auto" }}
            >
              {/* Nodo */}
              <FlowNode icon={step.icon} label={step.label} completed={completedUpTo >= i} />

              {/* Arco SVG tra questo nodo e il prossimo */}
              {i < n - 1 && (
                <div className="min-w-[40px] flex-1 px-1">
                  <svg
                    ref={(el) => {
                      svgRefs.current[i] = el;
                    }}
                    width="100%"
                    height="12"
                    className="overflow-visible"
                    focusable="false"
                  >
                    {/* Linea statica */}
                    <line x1="0" y1="6" x2="100%" y2="6" stroke="var(--border)" strokeWidth="1.5" />
                    {/* Cerchio/pacchetto animato da GSAP */}
                    <circle
                      ref={(el) => {
                        circleRefs.current[i] = el;
                      }}
                      cx="-10"
                      cy="6"
                      r="5"
                      fill="var(--accent)"
                      opacity="0"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Log simulato */}
      <FlowLog entries={logEntries} visibleCount={logCount} />

      {/* Controlli */}
      <div className="flex items-center gap-3">
        <Button onClick={play} size="sm" variant="solid">
          <Play size={14} aria-hidden />
          Riproduci
        </Button>
        {completedUpTo >= 0 && (
          <Button onClick={reset} size="sm" variant="ghost">
            <RotateCcw size={14} aria-hidden />
            Riavvia
          </Button>
        )}
      </div>
    </div>
  );
}
