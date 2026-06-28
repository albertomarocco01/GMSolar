"use client";

/**
 * @descrizione  Scena immersiva INTEGRAZIONI API (05 · Integrazioni API).
 *   Full-screen, alta fedeltà: lo scroll scrubba un walkthrough — una "canvas
 *   di automazione" che mostra un flusso orizzontale sinistro→destra: un evento
 *   di partenza ("Nuovo lead dal sito") → nodi connettori in fila (WhatsApp →
 *   Email/Resend → CRM → Calendar), collegati da linee SVG animate con
 *   strokeDashoffset. Un pacchetto luminoso viaggia lungo il flusso illuminando
 *   ogni nodo all'arrivo; un log in basso appende righe descrittive in sincronia.
 *
 * ⚠ SIMULAZIONE VISIVA — nessuna chiamata API reale viene effettuata.
 *   Tutti i nodi, le connessioni e le voci di log sono dati placeholder a puro
 *   scopo dimostrativo. Le integrazioni vere richiedono configurazione back-end.
 *
 * Usa il kit condiviso `./shared`. Reduced-motion: lo scroll porta la timeline
 *   al suo stato finale (tl.progress(1)) così ogni elemento è visibile.
 */
import { gsap } from "@gmgroup/lib/gsap";
import { CalendarDays, CreditCard, Mail, MessageCircle, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ImmersiveStage, Say, say, useImmersiveScene } from "./shared";

// ─── Dati statici ────────────────────────────────────────────────────────────

interface FlowNode {
  readonly Icon: LucideIcon;
  /** Testo breve dentro la scheda nodo (max ~8 caratteri per stare in 64 px). */
  readonly short: string;
  /** Etichetta estesa sotto la scheda (supporta \n via whitespace-pre-line). */
  readonly label: string;
  /** Classe CSS univoca per l'anello glow di questo nodo. */
  readonly ringCls: string;
}

const NODES: FlowNode[] = [
  { Icon: Users, short: "Lead", label: "Nuovo lead\ndal sito", ringCls: "imm-n0-ring" },
  { Icon: MessageCircle, short: "WhatsApp", label: "WhatsApp", ringCls: "imm-n1-ring" },
  { Icon: Mail, short: "Email", label: "Email · Resend", ringCls: "imm-n2-ring" },
  { Icon: CreditCard, short: "CRM", label: "CRM", ringCls: "imm-n3-ring" },
  { Icon: CalendarDays, short: "Calendar", label: "Calendar", ringCls: "imm-n4-ring" },
];

/**
 * Posizione orizzontale del centro di ciascun nodo (% della larghezza canvas).
 * Scelta per avere ~3 % di margine sui bordi in modo da non essere ritagliati
 * dall'overflow-hidden dello sticky wrapper anche su mobile 375 px.
 */
const NODE_LEFT = ["12%", "31%", "50%", "69%", "88%"] as const;

/** Posizione verticale comune a tutti i nodi e al pacchetto. */
const NODE_TOP = "40%" as const;

/**
 * Coordinate dei segmenti SVG.
 * Gli endpoint x sono sfasati di ~3 % rispetto al centro del nodo adiacente
 * in modo che la linea si fermi sul bordo della scheda, non dietro di essa.
 */
const LINES = [
  { x1: "15%", y1: "40%", x2: "28%", y2: "40%" },
  { x1: "34%", y1: "40%", x2: "47%", y2: "40%" },
  { x1: "53%", y1: "40%", x2: "66%", y2: "40%" },
  { x1: "72%", y1: "40%", x2: "85%", y2: "40%" },
] as const;

/** Voci del log di automazione — una per ogni nodo di destinazione. */
const LOG_ENTRIES = [
  "Messaggio WhatsApp inviato",
  "Email di follow-up (Resend) recapitata",
  "Contatto creato nel CRM",
  "Promemoria in Calendar aggiunto",
] as const;

// ─── Componente ──────────────────────────────────────────────────────────────

export default function ImmersiveIntegrazioni() {
  const ref = useImmersiveScene((tl, section) => {
    // ── Stato iniziale ─────────────────────────────────────────────────────

    // Linee SVG: calcolo la lunghezza reale (px) per il trick strokeDashoffset
    const svgLines = Array.from(section.querySelectorAll<SVGLineElement>(".imm-line"));
    svgLines.forEach((line) => {
      const len = line.getTotalLength();
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
    });

    // Nodi: partono invisibili e ridotti
    gsap.set(".imm-node", { scale: 0, autoAlpha: 0 });

    // Anelli glow: invisibili finché il pacchetto non arriva
    gsap.set(".imm-node-ring", { autoAlpha: 0, scale: 0.6 });

    // Pacchetto: invisibile, centrato sul nodo 0, transform via GSAP
    gsap.set(".imm-packet", {
      autoAlpha: 0,
      scale: 0,
      xPercent: -50,
      yPercent: -50,
      left: NODE_LEFT[0],
      top: NODE_TOP,
    });

    // Righe di log: invisibili, leggermente abbassate
    gsap.set(".imm-log-row", { autoAlpha: 0, y: 8 });

    // Cursore finto: non usato in questa scena (il pacchetto svolge quel ruolo)
    gsap.set(".imm-cursor", { autoAlpha: 0 });

    // ── ① Linee e nodi compaiono ───────────────────────────────────────────
    say(tl, 0); // «Colleghiamo i sistemi che già usi.»

    // Le linee si "disegnano" una dopo l'altra (strokeDashoffset → 0)
    tl.to(
      ".imm-line",
      {
        strokeDashoffset: 0,
        duration: 0.55,
        stagger: 0.13,
        ease: "power2.inOut",
      },
      "<0.2",
    );

    // I nodi compaiono in cascata con rimbalzo espressivo
    tl.to(
      ".imm-node",
      {
        scale: 1,
        autoAlpha: 1,
        duration: 0.5,
        stagger: 0.11,
        ease: "back.out(1.7)",
      },
      "<0.4",
    );

    // ── ② Pacchetto in viaggio ─────────────────────────────────────────────
    say(tl, 1); // «Un evento sul sito avvia un flusso automatico.»

    // Il pacchetto "sboccia" sul nodo di partenza
    tl.to(".imm-packet", {
      autoAlpha: 1,
      scale: 1,
      duration: 0.35,
      ease: "back.out(1.5)",
    });

    // Helper: sposta il pacchetto verso il nodo i, illumina l'anello, aggiunge log
    const reach = (nodeIdx: 1 | 2 | 3 | 4, logIdx: 0 | 1 | 2 | 3) => {
      tl.to(".imm-packet", {
        left: NODE_LEFT[nodeIdx],
        duration: 0.75,
        ease: "expo.inOut",
      });
      tl.to(
        `.imm-n${nodeIdx}-ring`,
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.42,
          ease: "back.out(1.8)",
        },
        ">-0.12",
      );
      tl.to(
        `.imm-log-row-${logIdx}`,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.38,
          ease: "power3.out",
        },
        "<0.08",
      );
    };

    reach(1, 0); // → WhatsApp   | «Messaggio WhatsApp inviato»
    reach(2, 1); // → Email      | «Email di follow-up recapitata»
    reach(3, 2); // → CRM        | «Contatto creato nel CRM»
    reach(4, 3); // → Calendar   | «Promemoria in Calendar aggiunto»

    // ── ③ Frase finale + pausa ─────────────────────────────────────────────
    say(tl, 2); // «WhatsApp, email, CRM e calendario, orchestrati via API.»
    tl.to({}, { duration: 0.6 });
  });

  return (
    <ImmersiveStage
      ref={ref}
      heightVh={420}
      theme="platform"
      label="Integrazioni"
      eyebrow="05 · Integrazioni API"
    >
      <div className="relative h-full">
        {/* ── Linee SVG connettore ──────────────────────────────────────── */}
        {/*
         * Le linee sono disegnate in percentuale: x1/y1/x2/y2 in % si mappano
         * all'altezza/larghezza effettiva dell'elemento SVG (absolute inset-0).
         * getTotalLength() al mount restituisce la lunghezza in px per il trick
         * strokeDashoffset, indipendente dalla risoluzione dello schermo.
         */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          aria-hidden
        >
          {LINES.map(({ x1, y1, x2, y2 }, i) => (
            <line
              key={i}
              className={`imm-line imm-line-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              style={{ stroke: "var(--border)" }}
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))}
        </svg>

        {/* ── Nodi del flusso ───────────────────────────────────────────── */}
        {NODES.map(({ Icon, short, label, ringCls }, i) => (
          <div
            key={i}
            className="imm-node absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: NODE_LEFT[i], top: NODE_TOP }}
          >
            {/* Anello luminoso: compare quando il pacchetto raggiunge il nodo */}
            <div
              className={`imm-node-ring ${ringCls} border-accent absolute inset-[-5px] rounded-[20px] border-2`}
              aria-hidden
            />

            {/* Scheda nodo */}
            <div className="border-border bg-surface relative flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-2xl border shadow-sm">
              <Icon className="text-accent h-5 w-5" aria-hidden />
              <span className="text-muted px-1 text-center text-[9px] leading-tight font-medium">
                {short}
              </span>
            </div>

            {/* Etichetta estesa sotto la scheda */}
            <p
              className="text-muted mt-2 text-center text-[10px] leading-snug font-medium whitespace-pre-line"
              aria-label={label.replace("\n", " ")}
            >
              {label}
            </p>
          </div>
        ))}

        {/* ── Pacchetto viaggiante (dot bg-accent) ─────────────────────── */}
        {/*
         * Posizionato e animato interamente via GSAP: xPercent/yPercent per il
         * centramento, left per la traslazione orizzontale lungo il flusso.
         * opacity: 0 nel markup — GSAP gestisce autoAlpha.
         */}
        <div
          className="imm-packet pointer-events-none absolute z-10"
          style={{ opacity: 0 }}
          aria-hidden
        >
          <div className="bg-accent shadow-accent/40 ring-accent/30 h-4 w-4 rounded-full shadow-lg ring-4" />
        </div>

        {/* ── Log di automazione ────────────────────────────────────────── */}
        {/*
         * Pannello centrato in basso: le voci appaiono una alla volta in
         * sincronia con l'arrivo del pacchetto su ciascun nodo.
         */}
        <div className="absolute bottom-8 left-1/2 w-full max-w-sm -translate-x-1/2 px-4">
          <p className="text-muted mb-1.5 text-[9px] font-semibold tracking-widest uppercase">
            Log · Automazione
          </p>
          <div className="border-border bg-surface/90 divide-border divide-y overflow-hidden rounded-xl border backdrop-blur-sm">
            {LOG_ENTRIES.map((entry, i) => (
              <div
                key={i}
                className={`imm-log-row imm-log-row-${i} flex items-center gap-2.5 px-4 py-2.5`}
                style={{ opacity: 0 }}
              >
                {/* Verde minimo per i segni di spunta: token colore standard */}
                <span className="shrink-0 text-[13px] font-bold text-green-500" aria-hidden>
                  ✓
                </span>
                <span className="text-foreground text-sm">{entry}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Frasi-intermezzo DESCRITTIVE (tono neutro, non promozionale) ── */}
      <Say i={0}>Colleghiamo i sistemi che già usi.</Say>
      <Say i={1}>Un evento sul sito avvia un flusso automatico.</Say>
      <Say i={2}>WhatsApp, email, CRM e calendario, orchestrati via API.</Say>
    </ImmersiveStage>
  );
}
