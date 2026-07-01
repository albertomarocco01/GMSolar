"use client";

/**
 * @descrizione  Scena immersiva GESTIONALE (servizio 05). Full-screen, alta
 *   fedeltà. REGIA (ridisegnata per non ricalcare la Dashboard, che ha già il
 *   tour sidebar+pan a 4 pannelli): tre beat, con l'AGENTE AI come climax.
 *     ① Panoramica — vista d'apertura (KPI + barre), NESSUN pan.
 *     ② Ordini — unico pan orizzontale; query in linguaggio naturale che filtra
 *        (typeInField + righe non-match che sfumano + evidenziazione a wipe).
 *     ③ Agente AI — dal bottone AI in topbar si apre un PANNELLO LATERALE
 *        "copilot" sopra la vista Ordini: richiesta in italiano, step operativi
 *        con check che "poppano", i 2 ordini APPENA FILTRATI flippano
 *        Aperto → Evaso ✓ e il KPI "Ordini aperti" scala 23 → 21 (l'agente ha
 *        EFFETTO sui dati, non solo sulla lista).
 *   La sidebar elenca anche voci NON visitate (Preventivi, Magazzino): vendono
 *   l'ampiezza del prodotto senza allungare la demo.
 *   Usa il kit condiviso `./shared`. Reduced-motion: tl a progress(1) → drawer
 *   aperto, ordini evasi, KPI aggiornato = stato finale leggibile; il binario a
 *   2 pannelli diventa un carosello scrollabile (overflow-x-auto).
 */
import { gsap } from "@gmgroup/lib/gsap";
import { useReducedMotion } from "@gmgroup/lib/motion";
import {
  ImmersiveStage,
  Say,
  say,
  cursorTo,
  clickZoom,
  useImmersiveScene,
  pressButton,
  typeInField,
  maskReveal,
} from "./shared";

// Voci sidebar: la demo visita solo le prime due; le altre sono "di catalogo".
const NAV = ["Panoramica", "Ordini", "Preventivi", "Magazzino"];

// Ordini in tabella; `m` = match della query «ordini aperti sopra 50.000 €».
// I 2 match sono anche gli ordini su cui l'agente AI opera al beat ③.
const ORDINI = [
  { c: "Rossi S.r.l.", v: "62.000 €", s: "Aperto", m: true },
  { c: "Bianchi S.p.A.", v: "12.500 €", s: "Inviato", m: false },
  { c: "Ferrari Group", v: "87.000 €", s: "Aperto", m: true },
  { c: "Conti S.r.l.", v: "34.200 €", s: "Chiuso", m: false },
  { c: "Masi & Figli", v: "9.800 €", s: "Inviato", m: false },
];

// Gli stessi 2 ordini filtrati, dentro il pannello agente (flip di stato lì:
// il pannello copre parte della tabella, la mini-lista resta sempre leggibile).
const FILTRATI = ORDINI.filter((o) => o.m);

// Passi che l'agente mostra mentre esegue. Ogni step ha un check che "poppa".
const AGENT_STEPS = [
  "Leggo i 2 ordini filtrati…",
  "Preparo l'evasione…",
  "Aggiorno 2 record nel gestionale…",
  "Fatto",
];

export default function ImmersiveGestionale() {
  // Reduced-motion: il binario a 2 pannelli diventa un carosello scrollabile.
  const reduced = useReducedMotion();
  const ref = useImmersiveScene((tl, section) => {
    // `() => navTop(i)`: valori FUNZIONE → ri-misurati da invalidateOnRefresh su resize.
    const navItems = Array.from(section.querySelectorAll<HTMLElement>(".imm-nav-item"));
    const navTop = (i: number) => navItems[i]?.offsetTop ?? 0;

    // Proxy per il KPI "Ordini aperti" nel footer del pannello agente: 23 → 21.
    // (countUp del kit parte da 0 → qui serve un decremento, quindi proxy inline.)
    const aperti = { v: 23 };
    const apertiEl = section.querySelector<HTMLElement>(".imm-ag-kpi");

    gsap.set(".imm-badge", { autoAlpha: 0, scale: 0.8 });
    gsap.set(".imm-kpi", { autoAlpha: 0, y: 18 });
    // Barre Panoramica: crescono dal basso (scaleY).
    gsap.set(".imm-pano-bar", { scaleY: 0, transformOrigin: "bottom" });
    // Pannello agente: parte fuori campo a destra (drawer chiuso).
    gsap.set(".imm-ag-drawer", { xPercent: 100 });
    gsap.set(".imm-ag-step", { autoAlpha: 0, y: 8 });
    gsap.set(".imm-ag-check", { scale: 0, transformOrigin: "50% 50%" });
    // Flip di stato: "Aperto" gira via, "Evaso ✓" gira dentro (rotateY 3D).
    gsap.set(".imm-ag-old", { transformPerspective: 400, transformOrigin: "50% 50%" });
    gsap.set(".imm-ag-new", {
      autoAlpha: 0,
      rotationY: -90,
      transformPerspective: 400,
      transformOrigin: "50% 50%",
    });
    tl.set(".imm-cursor", { left: "50%", top: "55%" });
    tl.set(".imm-nav-ind", { top: () => navTop(0) });

    // ── ① Panoramica — le KPI entrano, poi le barre crescono dal basso ────────
    say(tl, 0);
    tl.to(
      ".imm-kpi",
      { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "back.out(1.6)" },
      "<0.2",
    );
    tl.to(
      ".imm-pano-bar",
      { scaleY: 1, duration: 0.6, stagger: 0.07, ease: "back.out(1.7)" },
      ">-0.1",
    );

    // ── ② Ordini + query in linguaggio naturale (unico pan della scena) ───────
    say(tl, 1);
    cursorTo(tl, navItems[1], { mode: "hand" });
    tl.to(".imm-nav-ind", { top: () => navTop(1), duration: 0.45, ease: "power3.inOut" }, "<0.3");
    tl.to(".imm-track", { xPercent: -50, duration: 1.1, ease: "expo.inOut" }, "<0.1");
    cursorTo(tl, ".imm-query", { mode: "text" });
    typeInField(tl, ".imm-query", { steps: 22, duration: 1, position: "<0.2" });
    clickZoom(tl, ".imm-zoom-local", { position: "<0.3" }); // punch-zoom barra ricerca durante il typing
    // Le righe che fanno match: l'evidenziazione accent entra a WIPE (maskReveal).
    tl.to(".imm-row-n", { opacity: 0.35, duration: 0.4 }, ">0.1");
    maskReveal(tl, ".imm-match", { dir: "l", duration: 0.5, stagger: 0.12, position: "<" });
    tl.to(".imm-badge", { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(1.8)" }, "<");

    // ── ③ Agente AI — si apre il pannello copilota ed ESEGUE l'operazione ─────
    say(tl, 2);
    // Il cursore preme il bottone AI in topbar → il drawer entra da destra.
    cursorTo(tl, ".imm-ai-btn", { mode: "hand" });
    pressButton(tl, ".imm-ai-btn", {
      down: 0.9,
      downDur: 0.1,
      upDur: 0.3,
      back: 2.6,
      position: ">-0.05",
    });
    tl.to(".imm-ag-drawer", { xPercent: 0, duration: 0.9, ease: "expo.out" }, ">-0.1");
    // 1. la richiesta in linguaggio naturale si "scrive" (kit: typeInField)
    cursorTo(tl, ".imm-ag-req", { mode: "text" });
    typeInField(tl, ".imm-ag-req", { steps: 20, duration: 0.9, position: "<0.2" });
    // 2. l'agente esegue: gli step compaiono e ogni check "poppa" (scale 0→1 back)
    tl.to(
      ".imm-ag-step",
      { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.3, ease: "power2.out" },
      ">0.1",
    );
    tl.to(".imm-ag-check", { scale: 1, duration: 0.4, stagger: 0.3, ease: "back.out(3)" }, "<0.15");
    // 3. i 2 ordini filtrati cambiano stato con un FLIP rotateY: "Aperto" → "Evaso ✓"
    tl.to(
      ".imm-ag-old",
      { rotationY: 90, autoAlpha: 0, duration: 0.3, stagger: 0.08, ease: "power2.in" },
      ">-0.05",
    );
    tl.to(
      ".imm-ag-new",
      { rotationY: 0, autoAlpha: 1, duration: 0.45, stagger: 0.08, ease: "back.out(1.4)" },
      "<0.05",
    );
    // 4. CONSEGUENZA sui dati: il KPI "Ordini aperti" scala 23 → 21.
    tl.to(
      aperti,
      {
        v: 21,
        duration: 0.7,
        ease: "power2.out",
        onUpdate() {
          if (apertiEl) apertiEl.textContent = String(Math.round(aperti.v));
        },
      },
      ">0.05",
    );
    tl.to({}, { duration: 0.6 });
  });

  return (
    <ImmersiveStage
      ref={ref}
      heightVh={460}
      theme="platform"
      label="Gestionale"
      eyebrow="05 · Gestionale con AI"
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

        {/* Reduced-motion: overflow-x-auto → binario a 2 pannelli scorribile a mano. */}
        <div
          className={`relative flex-1 ${
            reduced ? "overflow-x-auto overflow-y-hidden" : "overflow-hidden"
          }`}
        >
          <div className="border-border bg-surface/60 flex h-14 items-center gap-3 border-b px-6 backdrop-blur">
            <div className="bg-surface-2 text-muted flex h-8 max-w-md flex-1 items-center rounded-full px-4 text-sm">
              Cerca o chiedi all&apos;AI…
            </div>
            {/* Bottone che apre il pannello agente (il cursore lo preme al beat ③) */}
            <span className="imm-ai-btn bg-accent-soft text-accent-ink flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-bold">
              <span className="bg-accent h-1.5 w-1.5 rounded-full" aria-hidden />
              Agente AI
            </span>
          </div>

          <div className="imm-track flex h-[calc(100%-3.5rem)]" style={{ width: "200%" }}>
            {/* 1 · Panoramica */}
            <div className="w-1/2 shrink-0 overflow-hidden p-6">
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
                      i === 5
                        ? "imm-pano-bar bg-accent flex-1 rounded-t"
                        : "imm-pano-bar bg-accent/30 flex-1 rounded-t"
                    }
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            {/* 2 · Ordini */}
            <div className="relative w-1/2 shrink-0 overflow-hidden p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="imm-zoom-local bg-surface-2 text-foreground flex h-9 max-w-sm flex-1 items-center rounded-full px-4 text-sm">
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
          </div>

          {/* ── Pannello AGENTE AI (drawer "copilot", sopra la vista Ordini) ──
              Fuori dal track: entra da destra via xPercent, non viene pannato. */}
          <div className="imm-ag-drawer border-border bg-surface absolute inset-y-0 right-0 z-10 flex w-[min(420px,46%)] flex-col border-l p-5 shadow-2xl">
            <div className="text-foreground mb-4 flex items-center gap-2 font-semibold">
              <span className="bg-accent-soft text-accent-ink flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold">
                AI
              </span>
              Agente AI
            </div>

            {/* Richiesta dell'utente in linguaggio naturale */}
            <div className="flex items-start gap-3">
              <span className="bg-surface-2 text-muted flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                TU
              </span>
              <div className="bg-surface-2 text-foreground max-w-full rounded-2xl rounded-tl-none px-4 py-2.5 text-sm">
                <span className="imm-ag-req block whitespace-nowrap">
                  «evadi gli ordini filtrati»
                </span>
              </div>
            </div>

            {/* L'agente esegue: sequenza di step operativi */}
            <ul className="mt-4 space-y-1.5">
              {AGENT_STEPS.map((s, i) => (
                <li key={i} className="imm-ag-step text-foreground flex items-center gap-2 text-sm">
                  {/* Check che "poppa" (scale 0→1) quando lo step è fatto */}
                  <span className="imm-ag-check bg-accent text-accent-contrast flex h-4 w-4 shrink-0 items-center justify-center rounded-full">
                    <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5" aria-hidden>
                      <path
                        d="m5 13 4 4L19 7"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {s}
                </li>
              ))}
            </ul>

            {/* Gli stessi 2 ordini filtrati al beat ②: flippano Aperto → Evaso ✓ */}
            <div className="border-border mt-5 overflow-hidden rounded-xl border">
              <div className="bg-surface-2 text-muted grid grid-cols-[1fr_auto_6rem] gap-3 px-4 py-2 text-xs font-semibold tracking-wider uppercase">
                <span>Ordine</span>
                <span>Importo</span>
                <span className="text-right">Stato</span>
              </div>
              <div className="divide-border divide-y">
                {FILTRATI.map((o, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_auto_6rem] items-center gap-3 px-4 py-2.5 text-sm"
                  >
                    <span className="text-foreground truncate font-medium">{o.c}</span>
                    <span className="text-foreground font-mono">{o.v}</span>
                    <span className="relative flex h-6 items-center justify-end">
                      {/* stato iniziale */}
                      <span className="imm-ag-old text-muted text-xs font-semibold">Aperto</span>
                      {/* stato dopo l'azione dell'agente */}
                      <span className="imm-ag-new bg-accent-soft text-accent-ink absolute right-0 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                        Evaso ✓
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CONSEGUENZA sul gestionale: il KPI di Panoramica si aggiorna */}
            <div className="bg-surface-2 mt-auto flex items-center justify-between rounded-xl px-4 py-3">
              <span className="text-muted text-xs font-semibold tracking-wider uppercase">
                Ordini aperti
              </span>
              <span className="text-accent-ink font-display text-xl font-bold tabular-nums">
                <span className="imm-ag-kpi">23</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Frasi-intermezzo DESCRITTIVE (spiegano, non vendono).
          Prima frase = veil (annuncia la scena); le altre = caption lower-third. */}
      <Say i={0}>Clienti, ordini e progetti in un&apos;unica interfaccia.</Say>
      <Say i={1} variant="caption">
        Scrivi una richiesta in italiano: i dati si filtrano da soli.
      </Say>
      <Say i={2} variant="caption">
        E un agente AI esegue le operazioni per te.
      </Say>
    </ImmersiveStage>
  );
}
