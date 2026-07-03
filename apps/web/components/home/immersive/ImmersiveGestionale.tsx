"use client";

/**
 * @descrizione  Scena immersiva GESTIONALE COLONNINE (servizio 05). Full-screen,
 *   alta fedeltà. REGIA (ridisegnata per non ricalcare la Dashboard, che ha già
 *   il tour sidebar+pan a 4 pannelli): tre beat, con l'ASSISTENTE AI come climax.
 *     ① Panoramica — vista d'apertura (KPI + barre «Sessioni per giorno»),
 *        NESSUN pan.
 *     ② Colonnine — unico pan orizzontale; query in linguaggio naturale che
 *        filtra (typeInField + righe non-match che sfumano + evidenziazione a
 *        wipe delle 2 colonnine Offline).
 *     ③ Assistente AI — dal bottone AI in topbar si apre un PANNELLO LATERALE
 *        "copilot" sopra la vista Colonnine: richiesta in italiano, step
 *        operativi con check che "poppano", le 2 colonnine APPENA FILTRATE
 *        flippano Offline → Online ✓ e il contatore "Colonnine offline" scala
 *        2 → 0 (l'assistente ha EFFETTO sui dati, non solo sulla lista).
 *   La sidebar elenca anche voci NON visitate (Sessioni, Manutenzione): vendono
 *   l'ampiezza del prodotto senza allungare la demo.
 *   Usa il kit condiviso `./shared`. Reduced-motion: tl a progress(1) → drawer
 *   aperto, colonnine Online, contatore a 0 = stato finale leggibile; il binario
 *   a 2 pannelli diventa un carosello scrollabile (overflow-x-auto).
 *   CAMERA (P11) — shot-list della scena: whip-pan (d) sul cambio
 *   Panoramica→Colonnine, push-in (b) sulla barra query (SOSTITUISCE il vecchio
 *   clickZoom — regola 4), rack focus (e) dietro il drawer AI, micro-dutch 0.5°
 *   sul «Fatto», punch (a) sui flip Offline→Online ✓. Ogni inquadratura si
 *   chiude con cameraReset → camera NEUTRA a progress(1) (regola 3).
 */
import { gsap } from "@gmgroup/lib/gsap";
import { useReducedMotion } from "@gmgroup/lib/motion";
import {
  ImmersiveStage,
  Say,
  say,
  cursorTo,
  cameraTo,
  cameraReset,
  cameraWhip,
  rackFocus,
  useImmersiveScene,
  pressButton,
  typeInField,
  maskReveal,
} from "./shared";

// Voci sidebar: la demo visita solo le prime due; le altre sono "di catalogo".
const NAV = ["Panoramica", "Colonnine", "Sessioni", "Manutenzione"];

// Colonnine in tabella; `m` = match della query «colonnine offline».
// Le 2 match sono anche le colonnine su cui l'assistente AI opera al beat ③.
const COLONNINE = [
  { id: "COL-012 · Torino Nord", p: "150 kW", s: "Offline", m: true },
  { id: "COL-007 · Milano Est", p: "22 kW", s: "Online", m: false },
  { id: "COL-019 · Asti Centro", p: "22 kW", s: "Offline", m: true },
  { id: "COL-003 · Cuneo Sud", p: "50 kW", s: "Online", m: false },
  { id: "COL-015 · Alba", p: "22 kW", s: "In manutenzione", m: false },
];

// Le stesse 2 colonnine filtrate, dentro il pannello assistente (flip di stato
// lì: il pannello copre parte della tabella, la mini-lista resta sempre leggibile).
const FILTRATE = COLONNINE.filter((c) => c.m);

// Passi che l'assistente mostra mentre esegue. Ogni step ha un check che "poppa".
const AGENT_STEPS = [
  "Leggo le 2 colonnine offline…",
  "Invio il comando di riavvio…",
  "Verifico lo stato…",
  "Fatto",
];

export default function ImmersiveGestionale() {
  // Reduced-motion: il binario a 2 pannelli diventa un carosello scrollabile.
  const reduced = useReducedMotion();
  const ref = useImmersiveScene((tl, section) => {
    // `() => navTop(i)`: valori FUNZIONE → ri-misurati da invalidateOnRefresh su resize.
    const navItems = Array.from(section.querySelectorAll<HTMLElement>(".imm-nav-item"));
    const navTop = (i: number) => navItems[i]?.offsetTop ?? 0;

    // Proxy per il contatore "Colonnine offline" nel footer del pannello
    // assistente: 2 → 0. (countUp del kit parte da 0 → qui serve un decremento,
    // quindi proxy inline.)
    const offline = { v: 2 };
    const offlineEl = section.querySelector<HTMLElement>(".imm-ag-kpi");

    gsap.set(".imm-badge", { autoAlpha: 0, scale: 0.8 });
    gsap.set(".imm-kpi", { autoAlpha: 0, y: 18 });
    // Barre Panoramica: crescono dal basso (scaleY).
    gsap.set(".imm-pano-bar", { scaleY: 0, transformOrigin: "bottom" });
    // Rack focus (P11): la scala 0.985 del binario deve respirare attorno al
    // pannello COLONNINE (metà destra del binario largo 200% → origin 75%),
    // non attorno al centro geometrico che a pan concluso cade sul bordo sinistro.
    gsap.set(".imm-track", { transformOrigin: "75% 50%" });
    // Pannello assistente: parte fuori campo a destra (drawer chiuso).
    gsap.set(".imm-ag-drawer", { xPercent: 100 });
    gsap.set(".imm-ag-step", { autoAlpha: 0, y: 8 });
    gsap.set(".imm-ag-check", { scale: 0, transformOrigin: "50% 50%" });
    // Flip di stato: "Offline" gira via, "Online ✓" gira dentro (rotateY 3D).
    gsap.set(".imm-ag-old", { transformPerspective: 400, transformOrigin: "50% 50%" });
    gsap.set(".imm-ag-new", {
      autoAlpha: 0,
      rotationY: -90,
      transformPerspective: 400,
      transformOrigin: "50% 50%",
    });
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

    // ── ② Colonnine + query in linguaggio naturale (unico pan della scena) ────
    say(tl, 1);
    cursorTo(tl, navItems[1], { mode: "hand" });
    tl.to(".imm-nav-ind", { top: () => navTop(1), duration: 0.45, ease: "power3.inOut" }, "<0.3");
    tl.to(".imm-track", { xPercent: -50, duration: 1.1, ease: "expo.inOut" }, "<0.1");
    // CAMERA · whip-pan (d) in sync col pan del binario: parte nel cuore del
    // movimento — DOPO che il cursore è atterrato sulla voce di nav (regola 2:
    // nessun movimento camera durante il viaggio del cursore) — e finisce neutro.
    cameraWhip(tl, "r", { position: "<0.55" });
    // CAMERA · push-in (b) sulla barra query: camera PRIMA, cursore per ultimo
    // (regola 2 — atterraggio preciso sul layout ormai assestato). ">0.25" =
    // dopo la fine del pan (1.1s): la misura function-based legge il binario FERMO.
    cameraTo(tl, ".imm-query", {
      scale: 1.2,
      duration: 1.1,
      ease: "power1.inOut",
      position: ">0.25",
    });
    cursorTo(tl, ".imm-query", { mode: "text", duration: 0.7 });
    typeInField(tl, ".imm-query", { steps: 17, duration: 1, position: ">0.05" });
    // (Il clickZoom sulla barra è stato SOSTITUITO dal push-in di camera —
    //  regola 4: punch locale e punch di camera non si sommano sullo stesso beat.)
    // Le righe che fanno match: l'evidenziazione accent entra a WIPE (maskReveal)
    // mentre la camera si RIAPRE — pull-back all'"invio" che svela il filtro.
    tl.to(".imm-row-n", { opacity: 0.35, duration: 0.4 }, ">0.1");
    maskReveal(tl, ".imm-match", { dir: "l", duration: 0.5, stagger: 0.12, position: "<" });
    tl.to(".imm-badge", { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(1.8)" }, "<");
    cameraReset(tl, { duration: 0.8, position: "<" });

    // ── ③ Assistente AI — si apre il pannello copilota ed ESEGUE l'operazione ─
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
    // CAMERA · rack focus (e): mentre il drawer entra, il contenuto DIETRO
    // (binario Colonnine) perde fuoco. Il drawer non si richiude mai → il
    // rack resta attivo a fine scena: stato finale legittimo a progress(1)
    // (vedi doc rackFocus in shared); la CAMERA invece finirà neutra.
    rackFocus(tl, ".imm-track", { position: "<0.1" });
    // 1. la richiesta in linguaggio naturale si "scrive" (kit: typeInField)
    cursorTo(tl, ".imm-ag-req", { mode: "text" });
    typeInField(tl, ".imm-ag-req", { steps: 26, duration: 0.9, position: "<0.2" });
    // 2. l'assistente esegue: gli step compaiono e ogni check "poppa" (scale 0→1 back)
    tl.to(
      ".imm-ag-step",
      { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.3, ease: "power2.out" },
      ">0.1",
    );
    tl.to(".imm-ag-check", { scale: 1, duration: 0.4, stagger: 0.3, ease: "back.out(3)" }, "<0.15");
    // CAMERA · micro-dutch 0.5° sul «Fatto» (regola 5: ≤0.6°, SEMPRE riportata
    // a 0). Sotto-timeline rotation-only in sync col pop dell'ultimo check
    // (">-0.4" = quando parte il 4° check); non esiste un helper dedicato nel
    // kit, il tween tocca SOLO rotation e chiude a 0 (cameraReset la azzera comunque).
    const dutch = gsap.timeline();
    dutch
      .to(".imm-camera", { rotation: 0.5, duration: 0.18, ease: "power2.out" })
      .to(".imm-camera", { rotation: 0, duration: 0.32, ease: "power2.inOut" });
    tl.add(dutch, ">-0.4");
    // 3. CAMERA · punch (a) sulla mini-lista: la camera "colpisce" (back.out(1.2)
    //    = micro-overshoot d'arrivo) mentre le 2 colonnine flippano con un
    //    rotateY "Offline" → "Online ✓". Parte a dutch concluso (rotation 0).
    cameraTo(tl, ".imm-ag-list", {
      scale: 1.4,
      duration: 0.45,
      ease: "back.out(1.2)",
      position: ">",
    });
    tl.to(
      ".imm-ag-old",
      { rotationY: 90, autoAlpha: 0, duration: 0.3, stagger: 0.08, ease: "power2.in" },
      "<0.15",
    );
    tl.to(
      ".imm-ag-new",
      { rotationY: 0, autoAlpha: 1, duration: 0.45, stagger: 0.08, ease: "back.out(1.4)" },
      "<0.05",
    );
    // 4. PULL-BACK e chiusura inquadratura (regola 3: camera NEUTRA a progress(1)):
    //    mentre la camera si riapre, la CONSEGUENZA sui dati — "Colonnine offline"
    //    scala 2 → 0 nel footer del drawer, di nuovo in campo.
    cameraReset(tl, { duration: 0.8, position: ">0.35" });
    tl.to(
      offline,
      {
        v: 0,
        duration: 0.7,
        ease: "power2.out",
        onUpdate() {
          if (offlineEl) offlineEl.textContent = String(Math.round(offline.v));
        },
      },
      "<0.2",
    );
    tl.to({}, { duration: 0.6 });
  });

  return (
    <ImmersiveStage
      ref={ref}
      heightVh={460}
      theme="platform"
      label="Gestionale colonnine"
      eyebrow="05 · Gestionale colonnine"
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
            {/* Bottone che apre il pannello assistente (il cursore lo preme al beat ③) */}
            <span className="imm-ai-btn bg-accent-soft text-accent-ink flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-bold">
              <span className="bg-accent h-1.5 w-1.5 rounded-full" aria-hidden />
              Assistente AI
            </span>
          </div>

          <div className="imm-track flex h-[calc(100%-3.5rem)]" style={{ width: "200%" }}>
            {/* 1 · Panoramica */}
            <div className="w-1/2 shrink-0 overflow-hidden p-6">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { v: "46", l: "Colonnine attive" },
                  { v: "128", l: "Sessioni oggi" },
                  { v: "97%", l: "Disponibilità" },
                ].map((k) => (
                  <div key={k.l} className="imm-kpi border-border bg-surface rounded-xl border p-5">
                    <p className="text-accent-ink font-display text-3xl font-bold">{k.v}</p>
                    <p className="text-muted mt-1 text-sm">{k.l}</p>
                  </div>
                ))}
              </div>
              <div className="imm-kpi border-border bg-surface mt-4 rounded-xl border p-6">
                <p className="text-muted mb-3 text-xs font-semibold tracking-wider uppercase">
                  Sessioni per giorno
                </p>
                <div className="flex h-36 items-end gap-3">
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
            </div>

            {/* 2 · Colonnine */}
            <div className="relative w-1/2 shrink-0 overflow-hidden p-6">
              <div className="mb-4 flex items-center justify-between">
                {/* Barra query: l'enfasi sul typing è il PUSH-IN di camera (P11),
                    niente più cluster clickZoom (imm-zoom-local rimosso). */}
                <div className="bg-surface-2 text-foreground flex h-9 max-w-sm flex-1 items-center rounded-full px-4 text-sm">
                  <span className="imm-query block whitespace-nowrap">colonnine offline</span>
                </div>
                <span className="imm-badge bg-accent text-accent-contrast ml-3 rounded-full px-3 py-1 text-xs font-semibold">
                  2 risultati
                </span>
              </div>
              <div className="border-border overflow-hidden rounded-xl border">
                <div className="bg-surface-2 text-muted grid grid-cols-3 gap-2 px-4 py-2.5 text-xs font-semibold tracking-wider uppercase">
                  <span>Colonnina</span>
                  <span>Potenza</span>
                  <span>Stato</span>
                </div>
                <div className="divide-border divide-y">
                  {COLONNINE.map((c, i) => (
                    <div
                      key={i}
                      className={`relative grid grid-cols-3 gap-2 px-4 py-3 text-sm ${c.m ? "imm-row-m" : "imm-row-n"}`}
                    >
                      {c.m && (
                        <span className="imm-match bg-accent-soft border-accent absolute inset-0 border-l-[3px]" />
                      )}
                      <span className="text-foreground relative font-medium">{c.id}</span>
                      <span className="text-foreground relative font-mono">{c.p}</span>
                      <span className="text-muted relative text-xs font-semibold">{c.s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Pannello ASSISTENTE AI (drawer "copilot", sopra la vista Colonnine)
              Fuori dal track: entra da destra via xPercent, non viene pannato. */}
          <div className="imm-ag-drawer border-border bg-surface absolute inset-y-0 right-0 z-10 flex w-[min(420px,46%)] flex-col border-l p-5 shadow-2xl">
            <div className="text-foreground mb-4 flex items-center gap-2 font-semibold">
              <span className="bg-accent-soft text-accent-ink flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold">
                AI
              </span>
              Assistente AI
            </div>

            {/* Richiesta dell'utente in linguaggio naturale */}
            <div className="flex items-start gap-3">
              <span className="bg-surface-2 text-muted flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                TU
              </span>
              <div className="bg-surface-2 text-foreground max-w-full rounded-2xl rounded-tl-none px-4 py-2.5 text-sm">
                <span className="imm-ag-req block whitespace-nowrap">
                  «riavvia le colonnine offline»
                </span>
              </div>
            </div>

            {/* L'assistente esegue: sequenza di step operativi */}
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

            {/* Le stesse 2 colonnine filtrate al beat ②: flippano Offline → Online ✓.
                `imm-ag-list` = target del PUNCH di camera (P11) sul flip. */}
            <div className="imm-ag-list border-border mt-5 overflow-hidden rounded-xl border">
              <div className="bg-surface-2 text-muted grid grid-cols-[1fr_auto_6rem] gap-3 px-4 py-2 text-xs font-semibold tracking-wider uppercase">
                <span>Colonnina</span>
                <span>Potenza</span>
                <span className="text-right">Stato</span>
              </div>
              <div className="divide-border divide-y">
                {FILTRATE.map((c, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_auto_6rem] items-center gap-3 px-4 py-2.5 text-sm"
                  >
                    <span className="text-foreground truncate font-medium">{c.id}</span>
                    <span className="text-foreground font-mono">{c.p}</span>
                    <span className="relative flex h-6 items-center justify-end">
                      {/* stato iniziale */}
                      <span className="imm-ag-old text-muted text-xs font-semibold">Offline</span>
                      {/* stato dopo l'azione dell'assistente */}
                      <span className="imm-ag-new bg-accent-soft text-accent-ink absolute right-0 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                        Online ✓
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CONSEGUENZA sul gestionale: il contatore di Panoramica si aggiorna */}
            <div className="bg-surface-2 mt-auto flex items-center justify-between rounded-xl px-4 py-3">
              <span className="text-muted text-xs font-semibold tracking-wider uppercase">
                Colonnine offline
              </span>
              <span className="text-accent-ink font-display text-xl font-bold tabular-nums">
                <span className="imm-ag-kpi">2</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Frasi-intermezzo DESCRITTIVE (spiegano, non vendono).
          Prima frase = veil (annuncia la scena); le altre = caption lower-third. */}
      <Say i={0}>Tutte le colonnine, in un unico gestionale.</Say>
      <Say i={1} variant="caption">
        Scrivi in italiano: i dati si filtrano da soli.
      </Say>
      <Say i={2} variant="caption">
        E l&apos;assistente AI risolve per te.
      </Say>
    </ImmersiveStage>
  );
}
