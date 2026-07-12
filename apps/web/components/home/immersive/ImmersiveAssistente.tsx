"use client";

/**
 * @descrizione  Scena immersiva ASSISTENTE AI (capitolo 03). RISCRITTURA (P: mostrare
 *   il VANTAGGIO della richiesta in linguaggio naturale sulla navigazione classica).
 *   Lo scroll scrubba questi beat dentro un device frame 16:10:
 *     ① ChapterCard «Assistente AI» (chapterIntro; sotto reduced-motion un heading
 *        statico in cima supplisce alla card, nascosta a progress(1)).
 *     ② HOME di un sito vetrina fotovoltaico/EV generico (hero + nav). Il cursore
 *        apre il menu «Catalogo» → un megamenu VOLUTAMENTE SOVRACCARICO; ESITA
 *        sopra due voci SENZA cliccare (highlight hover) → si sente la fatica
 *        dell'interfaccia classica. Il megamenu si chiude.
 *     ③ Il cursore apre la barra assistente (.imm-bar) e DIGITA una richiesta con
 *        TRE sfumature (FV già presente, ricarica notturna, paura del distacco).
 *     ④ La chat si apre sopra la barra: la richiesta diventa la 1ª bolla; typing
 *        indicator → l'assistente fa UNA domanda di chiarimento.
 *     ⑤ Il visitatore digita nella barra la risposta breve → 2ª bolla utente.
 *     ⑥ Typing indicator → l'assistente RAGIONA (spiega cosa ha pensato) e COSTRUISCE
 *        nella chat, un pezzo alla volta, l'INTERFACCIA della risposta: card setup
 *        (wallbox + cavo), mini-grafico «finestra di ricarica notturna» (barre che
 *        si alzano), riga stima costi con cifre a rullo, CTA «Prenota un sopralluogo»
 *        che il cursore preme → conferma ✓.
 *     ⑦ Hold finale leggibile.
 *
 *   CAMERA (P11): push-in sul megamenu (②) e sulla barra durante il typing (③);
 *   pull-back reveal quando la chat si apre (③→④); push-in sul pannello generato
 *   mentre si costruisce (⑥); punch (a) sulla CTA; cameraReset prima del beat
 *   finale → a progress(1) camera NEUTRA (reduced-motion pulito).
 *
 *   Una sola sorgente di verità: la fase è derivata dalla timeline scrubbata (niente
 *   stato React che litiga con lo scroll). Reduced-motion (progress(1)): chat completa
 *   e leggibile, TUTTI i componenti generati visibili; home a fuoco ridotto; camera
 *   neutra; heading statico del capitolo. Usa il kit condiviso `./shared`.
 */
import { Check, ChevronDown, Send, Sparkles, Sun, Zap } from "lucide-react";
import { cn } from "@gmgroup/lib/utils";
import { gsap } from "@gmgroup/lib/gsap";
import { useReducedMotion } from "@gmgroup/lib/motion";
import {
  ImmersiveStage,
  Say,
  say,
  CHAPTERS,
  ChapterCard,
  chapterIntro,
  cursorTo,
  hideCursor,
  typeInField,
  pressButton,
  maskReveal,
  cameraTo,
  cameraReset,
  rackFocus,
  useImmersiveScene,
  enter,
  countUp,
  EASE_IN_SCENE,
  EASE_OUT_SCENE,
  EASE_SNAP,
  DUR,
  hold,
} from "./shared";
import {
  MEGA_COLUMNS,
  MEGA_HOVER,
  DIALOG,
  SETUP,
  NIGHT_WINDOW,
  COST,
  CTA,
  SITE,
} from "./_assistente-data";

// Quale voce del megamenu riceve il highlight hover N (−1 = nessuno).
function hoverIndex(col: number, row: number): number {
  return MEGA_HOVER.findIndex((h) => h.col === col && h.row === row);
}

// Fascia «ore attive» del mini-grafico: derivata dai dati (run contiguo di attive).
const FIRST_ACTIVE = NIGHT_WINDOW.findIndex((x) => x.active);
const ACTIVE_COUNT = NIGHT_WINDOW.filter((x) => x.active).length;
const BAND_LEFT = (FIRST_ACTIVE / NIGHT_WINDOW.length) * 100;
const BAND_WIDTH = (ACTIVE_COUNT / NIGHT_WINDOW.length) * 100;

export default function ImmersiveAssistente() {
  // Reduced-motion: la timeline va a progress(1) → la ChapterCard finisce nascosta.
  // Serve un heading testuale statico del capitolo (vedi markup).
  const reduced = useReducedMotion();
  const ref = useImmersiveScene((tl) => {
    // ── Stato iniziale (selettori scoped alla section da gsap.context) ─────────
    gsap.set(".imm-mega", { autoAlpha: 0, y: -8 });
    gsap.set([".imm-mega-hi-0", ".imm-mega-hi-1"], { autoAlpha: 0 });
    gsap.set(".imm-bar-ring", { autoAlpha: 0 });
    gsap.set([".imm-bar-typed", ".imm-bar-typed2"], { autoAlpha: 0 });
    gsap.set(".imm-chat", { autoAlpha: 0, y: 24 });
    gsap.set(".imm-gen", { autoAlpha: 0, y: 16 });
    gsap.set(".imm-chart-bar", { scaleY: 0, transformOrigin: "50% 100%" });
    gsap.set(".imm-chart-band", { autoAlpha: 0 });
    gsap.set([".imm-clarify-text", ".imm-reason-text"], { autoAlpha: 0 });
    gsap.set(".imm-cta-done", { autoAlpha: 0 });

    // ── ① Title card di capitolo (P12) — SEMPRE primo beat della timeline ──────
    chapterIntro(tl);

    // ── ② HOME → megamenu «Catalogo» sovraccarico (fatica dell'UI classica) ────
    // CAMERA · push-in sulla nav; il cursore atterra per ULTIMO (regola 2).
    cameraTo(tl, ".imm-nav", { scale: 1.16, duration: DUR.beat });
    cursorTo(tl, ".imm-catalogo", { mode: "hand" });
    tl.to(".imm-mega", { autoAlpha: 1, y: 0, duration: DUR.beat, ease: EASE_IN_SCENE }, ">-0.05");
    // Esita sopra la 1ª voce (highlight, nessun click).
    cursorTo(tl, ".imm-mega-hi-0", { mode: "hand" });
    tl.to(".imm-mega-hi-0", { autoAlpha: 1, duration: DUR.micro, ease: EASE_IN_SCENE }, "<0.25");
    hold(tl, 0.6); // esitazione: "quale sarà quella giusta?"
    // Esita sopra la 2ª voce (ancora nessun click).
    cursorTo(tl, ".imm-mega-hi-1", { mode: "hand" });
    tl.to(".imm-mega-hi-0", { autoAlpha: 0, duration: DUR.micro, ease: EASE_OUT_SCENE }, "<0.2");
    tl.to(".imm-mega-hi-1", { autoAlpha: 1, duration: DUR.micro, ease: EASE_IN_SCENE }, "<");
    hold(tl, 0.6);
    // Il megamenu si chiude, la fatica resta (nessuna scelta fatta).
    tl.to(".imm-mega-hi-1", { autoAlpha: 0, duration: DUR.micro, ease: EASE_OUT_SCENE });
    tl.to(".imm-mega", { autoAlpha: 0, y: -8, duration: DUR.beat, ease: EASE_OUT_SCENE }, "<");
    hideCursor(tl, { position: "<" });
    cameraReset(tl, { duration: DUR.scene });

    // ── ③ La richiesta con TRE sfumature nella barra assistente ────────────────
    say(tl, 1);
    // CAMERA · push-in leggero sulla barra; cursore per ultimo (regola 2).
    cameraTo(tl, ".imm-bar", { scale: 1.12, duration: DUR.beat });
    cursorTo(tl, ".imm-bar-typed", { mode: "text" });
    tl.to(".imm-bar-ring", { autoAlpha: 1, duration: DUR.micro, ease: EASE_IN_SCENE }, "<0.3");
    // Placeholder → testo digitato (crossfade), poi typewriter (kit: typeInField).
    tl.to(".imm-bar-ph", { autoAlpha: 0, duration: DUR.micro / 2, ease: EASE_OUT_SCENE });
    tl.to(".imm-bar-typed", { autoAlpha: 1, duration: DUR.micro / 2, ease: EASE_IN_SCENE }, "<");
    typeInField(tl, ".imm-bar-typed", { steps: 44, duration: DUR.scene * 2 });

    // Invio → la chat si apre (pull-back reveal).
    cameraTo(tl, ".imm-send", { scale: 1.3, duration: DUR.beat });
    cameraTo(tl, ".imm-send", { scale: 1.22, duration: DUR.micro });
    cursorTo(tl, ".imm-send", { mode: "hand", duration: DUR.beat });
    pressButton(tl, ".imm-send", {
      down: 0.88,
      downDur: DUR.micro / 2,
      upDur: DUR.micro,
      position: ">-0.05",
    });
    // CAMERA · PULL-BACK REVEAL: dal punch dell'invio alla neutra mentre la chat
    // sale sopra la barra e la home passa in secondo piano (rack focus).
    cameraReset(tl, { duration: DUR.scene });
    hideCursor(tl, { position: "<" });
    tl.to(".imm-bar-ring", { autoAlpha: 0, duration: DUR.micro }, "<");
    // La barra torna vuota (il messaggio è "partito"): il testo digitato sfuma,
    // il placeholder torna → a progress(1) il composer è pulito.
    tl.to(".imm-bar-typed", { autoAlpha: 0, duration: DUR.micro, ease: EASE_OUT_SCENE }, "<");
    tl.to(".imm-bar-ph", { autoAlpha: 1, duration: DUR.micro, ease: EASE_IN_SCENE }, "<");
    rackFocus(tl, ".imm-home", { position: "<" });
    tl.to(".imm-chat", { autoAlpha: 1, y: 0, duration: DUR.scene, ease: EASE_IN_SCENE }, "<0.1");
    // La richiesta inviata appare come 1ª bolla utente (testo completo, leggibile).
    enter(tl, ".imm-msg-q", { y: 14, duration: DUR.beat, position: ">-0.2" });
    hold(tl, 0.4);

    // ── ④ L'assistente chiede SOLO quello che serve ────────────────────────────
    say(tl, 2);
    enter(tl, ".imm-msg-clarify", { y: 14, duration: DUR.beat }); // bolla con i puntini
    hold(tl, 0.5); // "sta scrivendo…"
    tl.to(".imm-clarify-dots", { autoAlpha: 0, duration: DUR.micro / 2, ease: EASE_OUT_SCENE });
    tl.to(".imm-clarify-text", { autoAlpha: 1, duration: DUR.micro, ease: EASE_IN_SCENE }, "<");
    hold(tl, 0.4);

    // ── ⑤ La risposta breve del visitatore ─────────────────────────────────────
    cursorTo(tl, ".imm-bar-typed2", { mode: "text" });
    tl.to(".imm-bar-ring", { autoAlpha: 1, duration: DUR.micro, ease: EASE_IN_SCENE }, "<0.3");
    tl.to(".imm-bar-ph", { autoAlpha: 0, duration: DUR.micro / 2, ease: EASE_OUT_SCENE });
    tl.to(".imm-bar-typed2", { autoAlpha: 1, duration: DUR.micro / 2, ease: EASE_IN_SCENE }, "<");
    typeInField(tl, ".imm-bar-typed2", { steps: 20, duration: DUR.scene * 1.1 });
    cursorTo(tl, ".imm-send", { mode: "hand" });
    pressButton(tl, ".imm-send", {
      down: 0.88,
      downDur: DUR.micro / 2,
      upDur: DUR.micro,
      position: ">-0.05",
    });
    tl.to(".imm-bar-ring", { autoAlpha: 0, duration: DUR.micro }, ">-0.1");
    tl.to(".imm-bar-typed2", { autoAlpha: 0, duration: DUR.micro, ease: EASE_OUT_SCENE }, "<");
    tl.to(".imm-bar-ph", { autoAlpha: 1, duration: DUR.micro, ease: EASE_IN_SCENE }, "<");
    hideCursor(tl, { position: "<" });
    enter(tl, ".imm-msg-a", { y: 14, duration: DUR.beat, position: ">-0.1" });
    hold(tl, 0.4);

    // ── ⑥ Ragionamento + COSTRUZIONE dell'interfaccia della risposta ───────────
    enter(tl, ".imm-msg-reason", { y: 14, duration: DUR.beat }); // bolla con i puntini
    hold(tl, 0.5);
    tl.to(".imm-reason-dots", { autoAlpha: 0, duration: DUR.micro / 2, ease: EASE_OUT_SCENE });
    tl.to(".imm-reason-text", { autoAlpha: 1, duration: DUR.micro, ease: EASE_IN_SCENE }, "<");
    say(tl, 3);
    // CAMERA · push-in sul pannello generato mentre si popola.
    cameraTo(tl, ".imm-gen", { scale: 1.14, duration: DUR.scene });
    // Il frame del pannello entra (poi si popola un componente alla volta).
    tl.to(".imm-gen", { autoAlpha: 1, y: 0, duration: DUR.beat, ease: EASE_IN_SCENE }, "<0.15");
    // a. card setup (wallbox + cavo): entra con un WIPE (kit: maskReveal, anticipate).
    maskReveal(tl, ".imm-gen-setup", {
      dir: "l",
      duration: DUR.beat,
      anticipate: true,
      position: ">-0.05",
    });
    hold(tl, 0.3);
    // b. mini-grafico «finestra di ricarica notturna»: le barre si alzano (scaleY,
    //    stagger) e la fascia delle ore attive si accende.
    enter(tl, ".imm-gen-chart", { y: 12, duration: DUR.beat });
    tl.to(
      ".imm-chart-bar",
      { scaleY: 1, duration: DUR.beat, stagger: 0.05, ease: EASE_SNAP },
      ">-0.15",
    );
    tl.to(".imm-chart-band", { autoAlpha: 1, duration: DUR.beat, ease: EASE_IN_SCENE }, "<0.25");
    hold(tl, 0.3);
    // c. riga stima costi: cifre a rullo (kit: countUp).
    enter(tl, ".imm-gen-cost", { y: 12, duration: DUR.beat });
    countUp(
      tl,
      [
        { el: ".imm-cost-h", to: COST.hours },
        { el: ".imm-cost-m", to: COST.perMonth },
      ],
      { duration: DUR.scene, position: ">-0.2" },
    );
    hold(tl, 0.3);
    // d. CTA «Prenota un sopralluogo».
    enter(tl, ".imm-gen-cta", { y: 12, duration: DUR.beat });
    // Chiudo il push-in del pannello prima del punch sulla CTA (inquadratura pulita).
    cameraReset(tl, { duration: DUR.beat, position: ">-0.1" });
    hold(tl, 0.3);
    // Il cursore preme la CTA → conferma ✓. CAMERA · punch (a); cursore per ultimo.
    cameraTo(tl, ".imm-gen-cta", { scale: 1.3, duration: DUR.beat });
    cameraTo(tl, ".imm-gen-cta", { scale: 1.22, duration: DUR.micro });
    cursorTo(tl, ".imm-gen-cta", { mode: "hand", duration: DUR.beat });
    pressButton(tl, ".imm-gen-cta", {
      down: 0.9,
      downDur: DUR.micro / 2,
      upDur: DUR.micro,
      position: ">-0.05",
    });
    tl.to(
      ".imm-cta-label",
      { autoAlpha: 0, duration: DUR.micro / 2, ease: EASE_OUT_SCENE },
      ">-0.05",
    );
    tl.to(".imm-cta-done", { autoAlpha: 1, duration: DUR.micro, ease: EASE_IN_SCENE }, "<");

    // ── ⑦ Chiusura: camera neutra (regola 3), cursore via, hold leggibile ──────
    cameraReset(tl, { duration: DUR.scene });
    hideCursor(tl, { duration: DUR.micro });
    hold(tl, 0.8);
  });

  return (
    <ImmersiveStage ref={ref} heightVh={640} label={CHAPTERS[2].title} chapterIndex={2}>
      {/* Fallback reduced-motion: a progress(1) la ChapterCard è nascosta → heading
          statico del capitolo sullo stage, FUORI dal device frame. */}
      {reduced && (
        <p className="text-accent-ink absolute top-4 left-6 z-20 font-mono text-xs font-semibold tracking-[0.3em] uppercase">
          {CHAPTERS[2].title}
        </p>
      )}
      {/* Device frame (R3, regola 1): il sito mock vive in una cornice ~16:10
          centrata sullo stage (max-w-6xl). Tutti i target GSAP (.imm-*) restano
          dentro la cornice → misure runtime (camera/cursore) corrette. */}
      <div className="flex h-full items-center justify-center px-8 pt-12">
        <div className="border-border bg-background relative flex aspect-[16/10] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border shadow-2xl">
          {/* ══ HOME del sito vetrina (dietro la chat; sfuma col rack focus) ══════ */}
          <div className="imm-home relative flex min-h-0 flex-1 flex-col">
            {/* Header + nav (il megamenu si apre da «Catalogo») */}
            <header className="imm-nav border-border bg-surface/90 relative z-30 flex h-14 shrink-0 items-center justify-between border-b px-6 backdrop-blur">
              <div className="flex items-center gap-2">
                <span className="bg-accent flex h-6 w-6 items-center justify-center rounded-[7px]">
                  <Sun className="text-accent-contrast h-4 w-4" aria-hidden />
                </span>
                <span className="font-display text-foreground text-base font-bold tracking-tight">
                  {SITE.name}
                </span>
              </div>
              <nav className="hidden items-center gap-6 sm:flex" aria-hidden>
                {SITE.nav.map((l) => {
                  const isCatalogo = l === "Catalogo";
                  return (
                    <span
                      key={l}
                      className={cn(
                        "flex cursor-default items-center gap-1 text-sm",
                        isCatalogo ? "imm-catalogo text-foreground font-semibold" : "text-muted",
                      )}
                    >
                      {l}
                      {isCatalogo && <ChevronDown className="h-3.5 w-3.5" aria-hidden />}
                    </span>
                  );
                })}
              </nav>
              <span className="bg-accent-soft text-accent-ink hidden rounded-full px-3 py-1 text-xs font-semibold sm:inline">
                Preventivo
              </span>
            </header>

            {/* Megamenu VOLUTAMENTE SOVRACCARICO: troppe diramazioni, il cursore
                esita senza decidere. Overlay assoluto sotto l'header. */}
            <div
              className="imm-mega border-border bg-background absolute inset-x-0 top-14 z-20 border-b px-6 py-5 shadow-xl"
              style={{ opacity: 0 }}
              aria-hidden
            >
              <div className="mx-auto grid max-w-4xl grid-cols-3 gap-6">
                {MEGA_COLUMNS.map((colonna, col) => (
                  <div key={colonna.title}>
                    <p className="text-accent-ink mb-2 text-xs font-bold tracking-wider uppercase">
                      {colonna.title}
                    </p>
                    <ul className="space-y-0.5">
                      {colonna.items.map((item, row) => {
                        const hi = hoverIndex(col, row);
                        return (
                          <li
                            key={item}
                            className="text-muted relative rounded-md px-2 py-1 text-[0.78rem]"
                          >
                            {hi >= 0 && (
                              <span
                                className={cn(
                                  "bg-accent-soft ring-accent-ring absolute inset-0 rounded-md ring-1",
                                  `imm-mega-hi-${hi}`,
                                )}
                                style={{ opacity: 0 }}
                              />
                            )}
                            <span className="relative">{item}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero del sito (accennato, NON un catalogo) */}
            <div className="grid flex-1 grid-cols-1 items-center gap-6 px-8 py-6 sm:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
              <div className="min-w-0">
                <span className="bg-accent-soft text-accent-ink inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
                  <Zap className="h-3.5 w-3.5" aria-hidden />
                  {SITE.heroKicker}
                </span>
                <h1 className="font-display text-foreground mt-3 text-2xl leading-tight font-bold tracking-tight text-balance sm:text-3xl">
                  {SITE.heroTitle}
                </h1>
                <p className="text-muted mt-3 max-w-md text-sm leading-relaxed">{SITE.heroText}</p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="bg-accent text-accent-contrast rounded-full px-4 py-2 text-sm font-semibold">
                    Scopri le soluzioni
                  </span>
                  <span className="text-foreground text-sm font-medium">Come funziona →</span>
                </div>
              </div>
              {/* Foto hero (impianto fotovoltaico) — aspect ampio, decorativa */}
              <div className="border-border relative hidden aspect-[4/3] overflow-hidden rounded-2xl border sm:block">
                <img
                  src={SITE.heroImg}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* ══ CHAT ASSISTENTE: pannello messaggi che si apre sopra la barra ══════
              Overlay che copre la home (dimmata). La barra resta sotto come composer.
              flex-col justify-end: i messaggi si "appoggiano" al composer, i più
              recenti (ragionamento + interfaccia generata) sempre in basso e visibili. */}
          <div
            className="imm-chat border-border bg-background absolute inset-x-4 top-4 bottom-[4.75rem] z-30 flex flex-col overflow-hidden rounded-2xl border shadow-2xl"
            style={{ opacity: 0 }}
          >
            {/* Header chat */}
            <div className="border-border bg-surface/80 flex h-11 shrink-0 items-center gap-2 border-b px-4 backdrop-blur">
              <span className="bg-accent text-accent-contrast flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span className="text-foreground text-sm font-semibold">
                Assistente · {SITE.name}
              </span>
              <span className="text-muted ml-auto flex items-center gap-1.5 text-[0.7rem] font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                online
              </span>
            </div>

            {/* Thread messaggi */}
            <div className="flex min-h-0 flex-1 flex-col justify-end gap-2.5 overflow-hidden px-4 py-3">
              {/* Bolla utente: la richiesta con tre sfumature (testo completo) */}
              <div className="imm-msg-q bg-accent text-accent-contrast max-w-[80%] self-end rounded-2xl rounded-br-sm px-3.5 py-2 text-[0.8rem] leading-snug">
                {DIALOG.request}
              </div>

              {/* Bolla assistente: domanda di chiarimento (puntini → testo) */}
              <div className="imm-msg-clarify bg-surface-2 text-foreground relative max-w-[80%] self-start rounded-2xl rounded-bl-sm px-3.5 py-2 text-[0.8rem] leading-snug">
                <span className="imm-clarify-text block">{DIALOG.clarify}</span>
                <TypingDots className="imm-clarify-dots" />
              </div>

              {/* Bolla utente: risposta breve */}
              <div className="imm-msg-a bg-accent text-accent-contrast max-w-[80%] self-end rounded-2xl rounded-br-sm px-3.5 py-2 text-[0.8rem] leading-snug">
                {DIALOG.answer}
              </div>

              {/* Bolla assistente: ragionamento (puntini → testo) */}
              <div className="imm-msg-reason bg-surface-2 text-foreground relative max-w-[86%] self-start rounded-2xl rounded-bl-sm px-3.5 py-2 text-[0.8rem] leading-snug">
                <span className="imm-reason-text block">{DIALOG.reasoning}</span>
                <TypingDots className="imm-reason-dots" />
              </div>

              {/* INTERFACCIA GENERATA: si costruisce un componente alla volta. */}
              <div
                className="imm-gen border-border bg-background self-stretch rounded-xl border p-3 shadow-sm"
                style={{ opacity: 0 }}
              >
                <div className="mb-2 flex items-center gap-1.5">
                  <Sparkles className="text-accent-ink h-3.5 w-3.5" aria-hidden />
                  <span className="text-accent-ink text-[0.68rem] font-bold tracking-widest uppercase">
                    {SETUP.eyebrow}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  {/* a. Card SETUP: due prodotti, rettangoli verticali, foto ≥ quadrate */}
                  <div className="imm-gen-setup">
                    <p className="text-foreground mb-1.5 text-xs font-semibold">{SETUP.title}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {SETUP.items.map((p) => (
                        <article
                          key={p.name}
                          className="border-border bg-surface flex flex-col overflow-hidden rounded-lg border"
                        >
                          {/* Foto del prodotto INDICATO — quadrata (mai striscia bassa) */}
                          <div className="aspect-square overflow-hidden">
                            <img
                              src={p.img}
                              alt=""
                              aria-hidden
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex flex-1 flex-col p-2">
                            <p className="text-accent-ink text-[0.6rem] font-bold tracking-wider uppercase">
                              {p.kind}
                            </p>
                            <p className="text-foreground mt-0.5 line-clamp-2 text-[0.72rem] leading-snug font-semibold">
                              {p.name}
                            </p>
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {p.badges.map((b, bi) => (
                                <span
                                  key={b}
                                  className={cn(
                                    "rounded-full px-1.5 py-0.5 text-[0.58rem] font-semibold",
                                    bi === 0
                                      ? "bg-accent text-accent-contrast"
                                      : "bg-surface-2 text-muted",
                                  )}
                                >
                                  {b}
                                </span>
                              ))}
                            </div>
                            <p className="text-foreground mt-auto pt-1.5 text-sm font-bold">
                              {p.price}
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>

                  {/* Colonna destra: grafico + stima + CTA */}
                  <div className="flex min-w-0 flex-col gap-2.5">
                    {/* b. Mini-grafico «finestra di ricarica notturna» */}
                    <div className="imm-gen-chart border-border bg-surface rounded-lg border p-2.5">
                      <p className="text-muted mb-1.5 text-[0.62rem] font-bold tracking-wider uppercase">
                        Finestra di ricarica notturna
                      </p>
                      <div className="relative flex h-16 items-end gap-1">
                        {/* Fascia delle ore attive (carica in corso) */}
                        <span
                          className="imm-chart-band bg-accent-soft border-accent absolute inset-y-0 rounded border-x"
                          style={{ left: `${BAND_LEFT}%`, width: `${BAND_WIDTH}%`, opacity: 0 }}
                          aria-hidden
                        />
                        {NIGHT_WINDOW.map((o) => (
                          <span
                            key={o.h}
                            className={cn(
                              "imm-chart-bar relative flex-1 rounded-t-sm",
                              o.active ? "bg-accent" : "bg-brand-200",
                            )}
                            style={{ height: `${o.level}%` }}
                            aria-hidden
                          />
                        ))}
                      </div>
                      <div className="mt-1 flex justify-between">
                        <span className="text-muted text-[0.55rem]">22</span>
                        <span className="text-accent-ink text-[0.55rem] font-semibold">
                          00–03 · carica
                        </span>
                        <span className="text-muted text-[0.55rem]">07</span>
                      </div>
                    </div>

                    {/* c. Riga stima costi (cifre a rullo) */}
                    <div className="imm-gen-cost border-border bg-surface rounded-lg border px-2.5 py-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-muted text-[0.62rem] font-semibold">
                          {COST.label}
                        </span>
                        <span className="text-foreground text-xs font-bold tabular-nums">
                          ≈ <span className="imm-cost-h">0</span> h · ≈{" "}
                          <span className="imm-cost-m text-accent-ink">0</span> €/mese
                        </span>
                      </div>
                      <p className="text-muted mt-1 flex items-center gap-1 text-[0.6rem]">
                        <Sun className="text-accent-ink h-3 w-3 shrink-0" aria-hidden />
                        {COST.note}
                      </p>
                    </div>

                    {/* d. CTA «Prenota un sopralluogo» → conferma ✓ */}
                    <span className="imm-gen-cta bg-accent text-accent-contrast relative mt-auto rounded-full px-3 py-2 text-center text-xs font-semibold">
                      <span className="imm-cta-label inline-block">{CTA.label} →</span>
                      <span
                        className="imm-cta-done absolute inset-0 flex items-center justify-center gap-1.5"
                        style={{ opacity: 0 }}
                      >
                        <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        {CTA.done}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══ Barra assistente / composer (in basso, sempre visibile) ══════════ */}
          <div className="absolute inset-x-0 bottom-0 z-40 px-5 pb-4" aria-hidden>
            <div className="imm-bar border-border bg-background/95 relative mx-auto flex max-w-3xl items-center gap-3 rounded-full border px-4 py-2.5 shadow-lg backdrop-blur">
              <span className="imm-bar-ring border-accent pointer-events-none absolute -inset-px rounded-full border-2" />
              <span className="bg-accent text-accent-contrast flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                <Sparkles className="h-4 w-4" aria-hidden />
              </span>
              <div className="relative flex h-7 min-w-0 flex-1 items-center overflow-hidden text-sm">
                <span className="imm-bar-ph text-muted absolute left-0 whitespace-nowrap">
                  Chiedi all&apos;assistente, in parole tue…
                </span>
                <span className="imm-bar-typed text-foreground absolute left-0 whitespace-nowrap">
                  {DIALOG.request}
                </span>
                <span className="imm-bar-typed2 text-foreground absolute left-0 whitespace-nowrap">
                  {DIALOG.answer}
                </span>
              </div>
              <span className="imm-send bg-accent text-accent-contrast flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                <Send className="h-4 w-4" aria-hidden />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Title card di capitolo (apre la scena) + caption descrittive ──────── */}
      <ChapterCard chapter={CHAPTERS[2]} subtitle="Un assistente AI dentro il sito vetrina." />
      <Say i={1} variant="caption">
        Una richiesta con tre sfumature: nessun filtro le coglie.
      </Say>
      <Say i={2} variant="caption">
        L&apos;assistente chiede solo quello che serve…
      </Say>
      <Say i={3} variant="caption">
        …e costruisce l&apos;interfaccia della risposta, su misura.
      </Say>
    </ImmersiveStage>
  );
}

/* ── Sotto-componenti ─────────────────────────────────────────────────────── */

/** Indicatore "sta scrivendo…": tre puntini che rimbalzano (overlay nella bolla,
 *  a sinistra; l'animazione CSS si mette in pausa con la pausa globale della demo). */
function TypingDots({ className }: { className?: string }) {
  return (
    <span className={cn("absolute inset-0 flex items-center px-3.5", className)} aria-hidden>
      <span className="flex items-center gap-1">
        {[0, 1, 2].map((d) => (
          <span
            key={d}
            className="bg-muted h-1.5 w-1.5 animate-bounce rounded-full"
            style={{ animationDelay: `${d * 0.16}s` }}
          />
        ))}
      </span>
    </span>
  );
}
