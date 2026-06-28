"use client";

/**
 * @descrizione  Scena immersiva GESTIONALE (servizio 07). Full-screen, alta
 *   fedeltà: lo scroll scrubba un walkthrough — frasi-intermezzo DESCRITTIVE,
 *   cursore che naviga, pan orizzontale tra le funzioni (Panoramica → Ordini →
 *   Clienti → Agente AI), query in linguaggio naturale che filtra e un agente
 *   AI che ESEGUE operazioni nel gestionale (step + dati che si aggiornano).
 *   Usa il kit condiviso `./shared`. Reduced-motion: stato finale leggibile.
 */
import { gsap } from "@gmgroup/lib/gsap";
import { ImmersiveStage, Say, say, cursorTo, useImmersiveScene } from "./shared";

const NAV = ["Panoramica", "Ordini", "Clienti", "Agente AI"];

const ORDINI = [
  { c: "Rossi S.r.l.", v: "62.000 €", s: "Aperto", m: true },
  { c: "Bianchi S.p.A.", v: "12.500 €", s: "Inviato", m: false },
  { c: "Ferrari Group", v: "87.000 €", s: "Aperto", m: true },
  { c: "Conti S.r.l.", v: "34.200 €", s: "Chiuso", m: false },
  { c: "Masi & Figli", v: "9.800 €", s: "Inviato", m: false },
];

// Ordini di Marzo su cui l'agente AI opera (cambiano stato durante la demo).
const MARZO = [
  { c: "Rossi S.r.l.", v: "62.000 €" },
  { c: "Verdi & Co.", v: "18.400 €" },
  { c: "Neri S.p.A.", v: "9.100 €" },
  { c: "Gallo S.r.l.", v: "27.500 €" },
];

// Passi che l'agente AI mostra mentre esegue la richiesta in linguaggio naturale.
const AGENT_STEPS = [
  "Analizzo gli ordini di Marzo…",
  "Trovati 4 ordini da evadere…",
  "Aggiorno 4 record nel gestionale…",
  "Fatto ✓",
];

export default function ImmersiveGestionale() {
  const ref = useImmersiveScene((tl, section) => {
    const navItems = Array.from(section.querySelectorAll<HTMLElement>(".imm-nav-item"));
    const navTop = (i: number) => navItems[i]?.offsetTop ?? 0;

    gsap.set(".imm-query", { clipPath: "inset(0 100% 0 0)" });
    gsap.set(".imm-match", { opacity: 0 });
    gsap.set(".imm-badge", { autoAlpha: 0, scale: 0.8 });
    gsap.set(".imm-kpi", { autoAlpha: 0, y: 18 });
    // Agente AI: richiesta da "digitare", step da rivelare, righe che cambiano stato.
    gsap.set(".imm-ag-req", { clipPath: "inset(0 100% 0 0)" });
    gsap.set(".imm-ag-step", { autoAlpha: 0, y: 8 });
    gsap.set(".imm-ag-new", { autoAlpha: 0, scale: 0.8 });
    tl.set(".imm-cursor", { left: "50%", top: "55%" });
    tl.set(".imm-nav-ind", { top: navTop(0) });

    // ① Panoramica
    say(tl, 0);
    tl.to(
      ".imm-kpi",
      { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "back.out(1.6)" },
      "<0.2",
    );

    // ② Ordini + query in linguaggio naturale
    say(tl, 1);
    cursorTo(tl, "7%", "33%");
    tl.to(".imm-nav-ind", { top: navTop(1), duration: 0.45, ease: "power3.inOut" }, "<0.3");
    tl.to(".imm-track", { xPercent: -25, duration: 1.1, ease: "expo.inOut" }, "<0.1");
    cursorTo(tl, "44%", "30%");
    tl.to(".imm-query", { clipPath: "inset(0 0% 0 0)", duration: 1, ease: "steps(22)" }, "<0.2");
    tl.to(".imm-match", { opacity: 1, duration: 0.45, ease: "power2.out" }, ">0.1");
    tl.to(".imm-row-n", { opacity: 0.35, duration: 0.4 }, "<");
    tl.to(".imm-badge", { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(1.8)" }, "<");

    // ③ Clienti
    say(tl, 2);
    cursorTo(tl, "7%", "44%");
    tl.to(".imm-nav-ind", { top: navTop(2), duration: 0.45, ease: "power3.inOut" }, "<0.3");
    tl.to(".imm-track", { xPercent: -50, duration: 1.1, ease: "expo.inOut" }, "<0.1");

    // ④ Agente AI — riceve una richiesta in italiano ed ESEGUE l'operazione
    say(tl, 3);
    cursorTo(tl, "7%", "55%");
    tl.to(".imm-nav-ind", { top: navTop(3), duration: 0.45, ease: "power3.inOut" }, "<0.3");
    tl.to(".imm-track", { xPercent: -75, duration: 1.1, ease: "expo.inOut" }, "<0.1");
    // 1. la richiesta in linguaggio naturale si "scrive"
    cursorTo(tl, "50%", "30%");
    tl.to(".imm-ag-req", { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "steps(20)" }, "<0.2");
    // 2. l'agente esegue: gli step compaiono uno dopo l'altro
    tl.to(
      ".imm-ag-step",
      { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.3, ease: "power2.out" },
      ">0.1",
    );
    // 3. i dati nel gestionale si aggiornano: lo stato delle righe cambia
    tl.to(".imm-ag-old", { autoAlpha: 0, duration: 0.3, stagger: 0.08 }, ">-0.05");
    tl.to(
      ".imm-ag-new",
      { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.08, ease: "back.out(1.8)" },
      "<0.05",
    );
    tl.to({}, { duration: 0.6 });
  });

  return (
    <ImmersiveStage
      ref={ref}
      heightVh={460}
      theme="platform"
      label="Gestionale"
      eyebrow="07 · Gestionale con AI"
    >
      <div className="flex h-full pt-12">
        <aside className="border-border bg-surface relative hidden w-56 shrink-0 border-r p-4 sm:block">
          <div className="text-foreground mb-6 flex items-center gap-2 px-2 font-semibold">
            <span className="bg-accent h-4 w-4 rounded-[5px]" /> Gestionale
          </div>
          <nav className="relative space-y-1">
            <span
              className="imm-nav-ind bg-accent-soft pointer-events-none absolute inset-x-0 h-10 rounded-lg"
              style={{ top: 0 }}
              aria-hidden
            />
            {NAV.map((n) => (
              <div
                key={n}
                className="imm-nav-item text-foreground relative rounded-lg px-3 py-2.5 text-sm font-medium"
              >
                {n}
              </div>
            ))}
          </nav>
        </aside>

        <div className="relative flex-1 overflow-hidden">
          <div className="border-border bg-surface/60 flex h-14 items-center gap-3 border-b px-6 backdrop-blur">
            <div className="bg-surface-2 text-muted flex h-8 max-w-md flex-1 items-center rounded-full px-4 text-sm">
              Cerca o chiedi all&apos;AI…
            </div>
            <span className="bg-accent-soft text-accent-ink flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
              AI
            </span>
          </div>

          <div className="imm-track flex h-[calc(100%-3.5rem)]" style={{ width: "400%" }}>
            {/* 1 · Panoramica */}
            <div className="w-1/4 shrink-0 overflow-hidden p-6">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { v: "23", l: "Ordini aperti" },
                  { v: "1,2 M€", l: "Pipeline" },
                  { v: "148", l: "Clienti" },
                ].map((k) => (
                  <div key={k.l} className="imm-kpi border-border bg-surface rounded-xl border p-5">
                    <p className="text-accent-ink font-display text-3xl font-bold">{k.v}</p>
                    <p className="text-muted mt-1 text-sm">{k.l}</p>
                  </div>
                ))}
              </div>
              <div className="imm-kpi border-border bg-surface mt-4 flex h-48 items-end gap-3 rounded-xl border p-6">
                {[45, 62, 50, 80, 68, 92, 74].map((h, i) => (
                  <span
                    key={i}
                    className={
                      i === 5 ? "bg-accent flex-1 rounded-t" : "bg-accent/30 flex-1 rounded-t"
                    }
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            {/* 2 · Ordini */}
            <div className="relative w-1/4 shrink-0 overflow-hidden p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="bg-surface-2 text-foreground flex h-9 max-w-sm flex-1 items-center rounded-full px-4 text-sm">
                  <span className="imm-query block whitespace-nowrap">
                    ordini aperti sopra 50.000&nbsp;€
                  </span>
                </div>
                <span className="imm-badge bg-accent text-accent-contrast ml-3 rounded-full px-3 py-1 text-xs font-semibold">
                  2 risultati
                </span>
              </div>
              <div className="border-border overflow-hidden rounded-xl border">
                <div className="bg-surface-2 text-muted grid grid-cols-3 gap-2 px-4 py-2.5 text-xs font-semibold tracking-wider uppercase">
                  <span>Cliente</span>
                  <span>Importo</span>
                  <span>Stato</span>
                </div>
                <div className="divide-border divide-y">
                  {ORDINI.map((o, i) => (
                    <div
                      key={i}
                      className={`relative grid grid-cols-3 gap-2 px-4 py-3 text-sm ${o.m ? "imm-row-m" : "imm-row-n"}`}
                    >
                      {o.m && (
                        <span className="imm-match bg-accent-soft border-accent absolute inset-0 border-l-[3px]" />
                      )}
                      <span className="text-foreground relative font-medium">{o.c}</span>
                      <span className="text-foreground relative font-mono">{o.v}</span>
                      <span className="text-muted relative text-xs font-semibold">{o.s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3 · Clienti */}
            <div className="w-1/4 shrink-0 overflow-hidden p-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { n: "Rossi S.r.l.", c: "Torino · Industria", v: "62.000 €" },
                  { n: "Ferrari Group", c: "Modena · Automotive", v: "87.000 €" },
                  { n: "Bianchi S.p.A.", c: "Milano · Retail", v: "12.500 €" },
                  { n: "Conti S.r.l.", c: "Roma · Servizi", v: "34.200 €" },
                ].map((c) => (
                  <div
                    key={c.n}
                    className="border-border bg-surface flex items-center gap-4 rounded-xl border p-5"
                  >
                    <span className="bg-accent-soft text-accent-ink flex h-12 w-12 items-center justify-center rounded-full font-bold">
                      {c.n.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-foreground font-semibold">{c.n}</p>
                      <p className="text-muted text-sm">{c.c}</p>
                    </div>
                    <span className="text-foreground ml-auto font-mono">{c.v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4 · Agente AI — riceve una richiesta in italiano ed ESEGUE l'azione */}
            <div className="w-1/4 shrink-0 overflow-hidden p-6">
              <div className="border-border bg-surface flex h-full flex-col rounded-xl border p-5">
                {/* Richiesta dell'utente in linguaggio naturale */}
                <div className="flex items-start gap-3">
                  <span className="bg-surface-2 text-muted flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                    TU
                  </span>
                  <div className="bg-surface-2 text-foreground max-w-full rounded-2xl rounded-tl-none px-4 py-2.5 text-sm">
                    <span className="imm-ag-req block whitespace-nowrap">
                      «segna come evasi gli ordini di Marzo»
                    </span>
                  </div>
                </div>

                {/* L'agente esegue: sequenza di step operativi */}
                <div className="mt-4 flex items-start gap-3">
                  <span className="bg-accent-soft text-accent-ink flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                    AI
                  </span>
                  <ul className="space-y-1.5">
                    {AGENT_STEPS.map((s, i) => (
                      <li
                        key={i}
                        className="imm-ag-step text-foreground flex items-center gap-2 text-sm"
                      >
                        <span className="bg-accent h-1.5 w-1.5 shrink-0 rounded-full" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* I dati nel gestionale si aggiornano di conseguenza */}
                <div className="border-border mt-5 overflow-hidden rounded-xl border">
                  <div className="bg-surface-2 text-muted grid grid-cols-[1fr_auto_7rem] gap-3 px-4 py-2 text-xs font-semibold tracking-wider uppercase">
                    <span>Ordine · Marzo</span>
                    <span>Importo</span>
                    <span className="text-right">Stato</span>
                  </div>
                  <div className="divide-border divide-y">
                    {MARZO.map((o, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[1fr_auto_7rem] items-center gap-3 px-4 py-2.5 text-sm"
                      >
                        <span className="text-foreground font-medium">{o.c}</span>
                        <span className="text-foreground font-mono">{o.v}</span>
                        <span className="relative flex h-6 items-center justify-end">
                          {/* stato iniziale */}
                          <span className="imm-ag-old text-muted text-xs font-semibold">
                            In lavorazione
                          </span>
                          {/* stato dopo l'azione dell'agente */}
                          <span className="imm-ag-new bg-accent-soft text-accent-ink absolute right-0 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                            Evaso ✓
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frasi-intermezzo DESCRITTIVE (spiegano, non vendono) */}
      <Say i={0}>Clienti, ordini e progetti in un&apos;unica interfaccia.</Say>
      <Say i={1}>Scrivi una richiesta in italiano: i dati si filtrano da soli.</Say>
      <Say i={2}>Ogni scheda cliente: anagrafica, valore e storico in un colpo d&apos;occhio.</Say>
      <Say i={3}>Un agente AI che esegue operazioni nel gestionale.</Say>
    </ImmersiveStage>
  );
}
