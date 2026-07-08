"use client";

/**
 * @descrizione  Scena immersiva RICARICA EV (capitolo 07 · «App con assistente AI integrato»).
 *   Full-screen sticky-scrub: un MOCKUP SMARTPHONE centrato (sfondo mappa tenue)
 *   con una chat-agent. La scena si apre con la TITLE CARD di capitolo (P12:
 *   ChapterCard + chapterIntro, sostituisce la vecchia <Say i={0}> veil).
 *   Lo scroll scrubba l'interazione ripresa dal legacy
 *   `EvAgentApp`/`DeviceSimulator` — assistente di ricarica di bordo:
 *     ① l'utente scrive «Devo ricaricare lungo la A1 verso Milano» (clip-path);
 *     ② l'agente risponde con generative-UI: card stazione (distanza, kW) +
 *        mini-mappa con rotta che si disegna (strokeDashoffset) e pin che pulsa;
 *     ③ «Prenoto lo stallo» → vista RICARICA: batteria che sale (scaleX, % via
 *        proxy+Intl), timer e costo live, bolla finale «Stallo prenotato».
 *   Il thread fa auto-scroll (translate Y misurato) per tenere a fuoco l'ultimo
 *   messaggio. Tema CHIARO, tono DESCRITTIVO. Usa il kit condiviso `./shared`.
 *   CAMERA (P11) — qui DISCRETA (il telefono è già centrato e piccolo):
 *   push-in 1.3 sul typing (b, più stretto per LEGGIBILITÀ del testo digitato)
 *   → punch leggero 1.24 sull'invio (a) → pull-back
 *   reveal (f) sul messaggio nel thread → follow lieve 1.08 verso il CTA (c) →
 *   push-in lento 1.14 sulla ricarica 20→80% (b) → reset finale; rack focus
 *   leggerissimo (e) sulla griglia-mappa dietro il telefono quando si apre la
 *   generative-UI. Regole di sequenziamento: vedi shared.tsx.
 *   Reduced-motion: gsap.set iniziale + tl.progress(1) → stato finale leggibile
 *   (la ChapterCard finisce nascosta → heading statico del capitolo in cima).
 */
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
  clickZoom,
  useImmersiveScene,
  pressButton,
  countUp,
  maskReveal,
  cameraTo,
  cameraFollow,
  cameraReset,
  rackFocus,
  rackFocusOff,
} from "./shared";

/** Formattatori Intl — singleton fuori dal componente (nessuna riallocazione). */
const fmtEur = new Intl.NumberFormat("it-IT", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const fmtInt = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0 });

/** Statistiche della colonnina mostrate nella card generativa. */
const STATION_STATS = [
  { l: "Distanza", v: "4,2 km" },
  { l: "Potenza", v: "175 kW" },
  { l: "Presa", v: "CCS2" },
  { l: "Stallo", v: "Libero" },
] satisfies { l: string; v: string }[];

export default function ImmersiveRicarica() {
  // Reduced-motion: la timeline va a progress(1) → la ChapterCard finisce
  // NASCOSTA. Il capitolo resta leggibile con un heading statico (vedi markup).
  const reduced = useReducedMotion();
  const ref = useImmersiveScene((tl, section) => {
    // ── Auto-scroll del thread ────────────────────────────────────────────────
    // Le bolle nascoste con autoAlpha mantengono lo spazio in layout: gli offset
    // sono stabili, quindi possiamo calcolare di quanto traslare il thread per
    // portare il fondo di un elemento a filo del viewport (come una chat reale).
    const viewport = section.querySelector<HTMLElement>(".imm-rc-viewport");
    const thread = section.querySelector<HTMLElement>(".imm-rc-thread");
    const scrollTo = (sel: string): number => {
      const el = section.querySelector<HTMLElement>(sel);
      if (!el || !thread) return 0;
      // vh + offset RI-LETTI ad ogni chiamata: sotto usiamo `y: () => scrollTo(...)`
      // così invalidateOnRefresh li ricalcola su resize (il telefono è min(264px,42vw),
      // quindi l'altezza del viewport chat scala con la larghezza).
      const vh = viewport?.clientHeight ?? 0;
      const bottom = el.offsetTop + el.offsetHeight;
      return -Math.max(0, bottom - vh + 14); // 14px di respiro sotto
    };

    // Proxy per la % batteria (parte da 20, non da 0 → resta manuale; costo e
    // durata partono da 0 e passano a countUp del kit più sotto).
    const pct = { v: 20 };
    const pctEl = section.querySelector<HTMLElement>(".imm-rc-pct");

    // ── Stato iniziale ────────────────────────────────────────────────────────
    gsap.set(".imm-rc-thread", { y: 0 });
    gsap.set(".imm-rc-placeholder", { autoAlpha: 1 });
    // Le parole del messaggio partono nascoste (set pre-paint → niente flash);
    // il beat ② le rivela in cascata.
    gsap.set(".imm-rc-word", { autoAlpha: 0, y: 4 });
    gsap.set(".imm-rc-user-1", { autoAlpha: 0, y: 14 });
    gsap.set(".imm-rc-typing", { autoAlpha: 0 });
    gsap.set(".imm-rc-agent-1", { autoAlpha: 0, x: -18 });
    gsap.set(".imm-rc-card-station", {
      autoAlpha: 0,
      y: 18,
      scale: 0.94,
      transformOrigin: "left center",
    });
    // pathLength="1" normalizza la rotta → dashoffset 1 = nascosta, 0 = visibile
    gsap.set(".imm-rc-route", { strokeDashoffset: 1 });
    gsap.set(".imm-rc-pin", {
      autoAlpha: 0,
      scale: 0.5,
      xPercent: -50,
      yPercent: -100,
      transformOrigin: "50% 100%",
    });
    gsap.set(".imm-rc-pin-ring", { scale: 1, opacity: 0 });
    gsap.set(".imm-rc-user-2", { autoAlpha: 0, y: 14 });
    gsap.set(".imm-rc-card-charge", {
      autoAlpha: 0,
      y: 18,
      scale: 0.94,
      transformOrigin: "left center",
    });
    gsap.set(".imm-rc-battery-fill", { scaleX: 0.2, transformOrigin: "left center" });
    gsap.set(".imm-rc-final", { autoAlpha: 0, y: 12 });

    // ── ① Title card di capitolo (P12) ────────────────────────────────────────
    // PRIMO beat della timeline (sostituisce il vecchio say(tl, 0) col velo):
    // «06 · App di ricarica» + sottotitolo. Nessun conflitto camera: il primo
    // beat camera è il push-in sul typing di ②.
    chapterIntro(tl);

    // ── ② L'utente scrive nel campo (reveal parola-per-parola) e invia ─────────
    tl.to(".imm-rc-placeholder", { autoAlpha: 0, duration: 0.2, ease: "power2.out" });
    // Digitazione PAROLA-PER-PAROLA: la frase compare da sinistra e VA A CAPO su
    // due righe (input più alto), così l'intero messaggio resta LEGGIBILE quando
    // finisce di scriversi. Prima era single-line con overflow + scroll-x: a fine
    // scrittura la testa del messaggio finiva clippata fuori dal campo del telefono.
    tl.to(
      ".imm-rc-word",
      { autoAlpha: 1, y: 0, duration: 0.14, ease: "power2.out", stagger: 0.12 },
      "<",
    );
    // (b) PUSH-IN sulla digitazione: 1.3 (era 1.15) — la scritta nel mockup
    // telefono era troppo piccola per leggersi mentre si digita (richiesta
    // leggibilità); il resto della scena resta su scale discrete. Sostituisce
    // il vecchio clickZoom della barra: punch locale e punch di camera non si
    // sommano sullo stesso beat (regola 4).
    cameraTo(tl, ".imm-zoom-local", {
      scale: 1.3,
      duration: 0.95,
      ease: "power1.inOut",
      position: "<",
    });
    // (a) PUNCH leggero sul tasto invia: prima la camera (breve, expo.out), POI
    // il cursore-mano che atterra a inquadratura assestata (regola 2: mai
    // partenze simultanee camera+cursore sullo stesso target).
    cameraTo(tl, ".imm-rc-send", { scale: 1.24, duration: 0.4, ease: "expo.out" });
    cursorTo(tl, ".imm-rc-send", { mode: "hand" });
    pressButton(tl, ".imm-rc-send", {
      down: 0.86,
      downDur: 0.12,
      upDur: 0.2,
      back: 2.4,
      position: ">-0.05",
    });
    // Il campo si svuota (le parole si dissolvono) e il messaggio entra nel thread
    tl.to(".imm-rc-word", { autoAlpha: 0, duration: 0.22, ease: "power2.in" }, "<");
    tl.to(".imm-rc-placeholder", { autoAlpha: 1, duration: 0.25 }, "<");
    tl.to(
      ".imm-rc-user-1",
      { autoAlpha: 1, y: 0, duration: 0.45, ease: "back.out(1.7)" },
      ">-0.05",
    );
    tl.to(
      ".imm-rc-thread",
      { y: () => scrollTo(".imm-rc-user-1"), duration: 0.5, ease: "power2.inOut" },
      "<",
    );
    // (f) PULL-BACK REVEAL: dal punch sull'invio la camera si riapre a neutro
    // mentre il messaggio entra nel thread → "svela" la conversazione.
    cameraReset(tl, { duration: 0.7, position: "<" });

    // ── ③ L'agente "sta scrivendo" → risponde ─────────────────────────────────
    tl.to(".imm-rc-typing", { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, ">0.1");
    say(tl, 1); // «Trova la colonnina giusta sul tuo percorso.»
    tl.to(".imm-rc-typing", { autoAlpha: 0, duration: 0.2, ease: "power2.in" });
    tl.to(".imm-rc-agent-1", { autoAlpha: 1, x: 0, duration: 0.5, ease: "back.out(1.6)" });
    tl.to(
      ".imm-rc-thread",
      { y: () => scrollTo(".imm-rc-agent-1"), duration: 0.5, ease: "power2.inOut" },
      "<0.1",
    );

    // ── ④ Generative-UI: card stazione + mini-mappa con rotta e pin ───────────
    tl.to(
      ".imm-rc-card-station",
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: "expo.out" },
      ">0.1",
    );
    // (e) RACK FOCUS leggerissimo: la griglia-mappa di sfondo si attenua mentre
    // si "apre" la generative-UI → profondità dietro il telefono (chiuso con
    // rackFocusOff al beat finale; niente blur — regola 6).
    rackFocus(tl, ".imm-rc-bg", { opacity: 0.45, scale: 0.99, duration: 0.5, position: "<" });
    tl.to(
      ".imm-rc-thread",
      { y: () => scrollTo(".imm-rc-card-station"), duration: 0.6, ease: "power2.inOut" },
      "<",
    );
    // La rotta si disegna lungo il percorso
    tl.to(".imm-rc-route", { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, "<0.2");
    // Il pin cade dall'alto con rimbalzo espressivo
    tl.to(".imm-rc-pin", { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2.6)" }, ">-0.4");
    // Sonar a PIÙ anelli: i due ring si espandono e si dissolvono sfalsati
    // (scrub-safe, no repeat) → effetto radar attorno al pin.
    tl.fromTo(
      ".imm-rc-pin-ring",
      { scale: 1, opacity: 0.7 },
      { scale: 2.8, opacity: 0, duration: 0.9, ease: "power2.out", stagger: 0.18 },
      "<0.1",
    );
    // Le statistiche della stazione si scoprono a WIPE (kit: maskReveal).
    maskReveal(tl, ".imm-rc-stat", { dir: "t", duration: 0.4, stagger: 0.07, position: "<0.15" });

    // ── ⑤ L'utente prenota lo stallo (cursore-mano "tap" + punch-zoom della card) ──
    // (c) FOLLOW leggero: la camera accompagna la traversata verso il CTA con un
    // lieve avvicinamento (1.08); camera PRIMA, cursorTo per ULTIMO così il
    // cursore misura il layout ormai assestato (regola 2).
    cameraFollow(tl, ".imm-rc-book-btn", { scale: 1.08, duration: 0.7 });
    cursorTo(tl, ".imm-rc-book-btn", { mode: "hand" });
    // Punch LOCALE (clickZoom 1.03): ammesso perché su questo beat la camera è
    // FERMA in hold a 1.08 — nessun cameraTo concorrente (regola 4).
    clickZoom(tl, ".imm-rc-card-station", { position: ">-0.05", scale: 1.03 });
    pressButton(tl, ".imm-rc-book-btn", {
      down: 0.94,
      downDur: 0.12,
      upDur: 0.2,
      back: 2.2,
      position: "<",
    });
    tl.to(
      ".imm-rc-user-2",
      { autoAlpha: 1, y: 0, duration: 0.45, ease: "back.out(1.7)" },
      ">-0.05",
    );
    tl.to(
      ".imm-rc-thread",
      { y: () => scrollTo(".imm-rc-user-2"), duration: 0.5, ease: "power2.inOut" },
      "<",
    );
    // Nasconde il cursore-mano DOPO che la bolla user-2 si è assestata e PRIMA del
    // cameraTo sulla vista ricarica: altrimenti resta congelato sopra il telefono
    // fino al reset finale. A progress(1) l'ultimo tween sul cursore è autoAlpha:0
    // → nascosto anche in reduced-motion (il cursorTo successivo lo rimostra).
    hideCursor(tl, { duration: 0.3, position: ">" });

    // ── ⑥ Frase + vista RICARICA: batteria che sale, timer e costo live ───────
    say(tl, 2); // «Prenota lo stallo e segue tempi e costi in tempo reale.»
    tl.to(".imm-rc-card-charge", { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: "expo.out" });
    tl.to(
      ".imm-rc-thread",
      { y: () => scrollTo(".imm-rc-card-charge"), duration: 0.6, ease: "power2.inOut" },
      "<",
    );
    // (b) PUSH-IN lento sulla vista ricarica, in respiro con la batteria 20→80%.
    // Appeso DOPO l'auto-scroll del thread: la camera misura i target a tween
    // start e una misura a thread in movimento darebbe coordinate sbagliate.
    cameraTo(tl, ".imm-rc-card-charge", { scale: 1.14, duration: 1.2, ease: "power1.inOut" });
    // Barra batteria 20% → 80% in sincronia con il contatore
    tl.to(".imm-rc-battery-fill", { scaleX: 0.8, duration: 1.3, ease: "power1.inOut" }, "<0.1");
    tl.to(
      pct,
      {
        v: 80,
        duration: 1.3,
        ease: "power1.inOut",
        onUpdate() {
          if (pctEl) pctEl.textContent = fmtInt.format(pct.v) + "%";
        },
      },
      "<",
    );
    // La % pulsa (scale) in sincrono con la barra → senso di "carica in corso".
    // yoyo+repeat:1 = 1→1.12→1: stato finale scale 1 (ok reduced-motion).
    tl.fromTo(
      ".imm-rc-pct",
      { scale: 1 },
      {
        scale: 1.12,
        duration: 0.65,
        ease: "power1.inOut",
        yoyo: true,
        repeat: 1,
        transformOrigin: "left center",
      },
      "<",
    );
    // Ticker costo 0 → 6,40 € e durata 0 → 18 min in parallelo (kit: countUp)
    countUp(
      tl,
      [
        { el: ".imm-rc-cost", to: 6.4, format: (n) => fmtEur.format(n) + " €" },
        { el: ".imm-rc-timer", to: 18, format: (n) => Math.round(n) + " min" },
      ],
      { duration: 1.3, ease: "power1.inOut", position: "<" },
    );

    // ── ⑦ Bolla finale + pausa di respiro ─────────────────────────────────────
    tl.to(".imm-rc-final", { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out" }, ">0.1");
    tl.to(
      ".imm-rc-thread",
      { y: () => scrollTo(".imm-rc-final"), duration: 0.5, ease: "power2.inOut" },
      "<",
    );
    // RESET FINALE (regola 3): pull-back a camera NEUTRA sulla bolla conclusiva
    // → a progress(1) x:0 y:0 scale:1 rot:0 (reduced-motion pulito, hand-off
    // .imm-stage invariato); la griglia di sfondo torna a fuoco (chiude il
    // rack focus di ④). La pausa di respiro resta DOPO: il reset si completa
    // sempre prima della fine timeline.
    cameraReset(tl, { duration: 0.8, position: "<" });
    rackFocusOff(tl, ".imm-rc-bg", { duration: 0.5, position: "<" });
    tl.to({}, { duration: 0.5 });
  });

  return (
    <ImmersiveStage
      ref={ref}
      heightVh={520}
      theme="platform"
      label={CHAPTERS[6].title}
      chapterIndex={6}
    >
      {/* Reduced-motion: la ChapterCard animata finisce nascosta a progress(1)
          → heading statico del capitolo in cima, coerente con lo stato finale
          leggibile del mockup. */}
      {reduced ? (
        <p className="text-foreground absolute top-6 left-1/2 z-20 -translate-x-1/2 font-mono text-xs font-bold tracking-[0.35em] uppercase">
          {CHAPTERS[6].title}
        </p>
      ) : null}

      {/* Sfondo pagina: griglia mappa tenue (accent) su tono chiaro.
          `.imm-rc-bg` = bersaglio del rack focus (si attenua dietro la
          generative-UI, torna a fuoco al reset finale). */}
      <div
        className="imm-rc-bg pointer-events-none absolute inset-0"
        style={{
          backgroundImage: [
            "linear-gradient(to right, color-mix(in oklab, var(--accent) 7%, transparent) 1px, transparent 1px)",
            "linear-gradient(to bottom, color-mix(in oklab, var(--accent) 7%, transparent) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "32px 32px",
        }}
        aria-hidden
      />

      {/* ── Mockup smartphone centrato ──────────────────────────────────────── */}
      <div className="absolute inset-0 flex items-center justify-center pt-10">
        <div
          className="bg-surface-2 border-border relative flex flex-col overflow-hidden rounded-[2.6rem] border-[5px] shadow-[0_24px_60px_rgba(2,6,23,0.18)]"
          style={{ width: "min(264px, 42vw)", aspectRatio: "9 / 18.6" }}
          role="img"
          aria-label="Mockup dell'app di ricarica EV con assistente di bordo"
        >
          {/* Notch decorativo */}
          <div
            className="bg-surface-2 absolute top-0 left-1/2 z-20 h-5 w-20 -translate-x-1/2 rounded-b-2xl"
            aria-hidden
          />

          {/* Schermo */}
          <div className="bg-background absolute inset-[3px] flex flex-col overflow-hidden rounded-[2.2rem]">
            {/* Testata: identità dell'assistente */}
            <header className="border-border bg-background/90 flex shrink-0 items-center gap-2.5 border-b px-3.5 pt-6 pb-2.5 backdrop-blur">
              <span className="bg-accent text-accent-contrast flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold">
                AI
              </span>
              <div className="min-w-0">
                <p className="text-foreground text-[11.5px] leading-tight font-semibold">
                  Assistente di ricarica
                </p>
                <p className="text-accent-ink flex items-center gap-1 text-[9px] leading-tight font-medium">
                  <span className="bg-accent h-1.5 w-1.5 animate-pulse rounded-full" aria-hidden />
                  Auto connessa
                </p>
              </div>
            </header>

            {/* Viewport chat (clip) + thread che fa auto-scroll via translate Y */}
            <div className="imm-rc-viewport relative flex-1 overflow-hidden">
              <div className="imm-rc-thread relative flex flex-col gap-2.5 px-3 py-3">
                {/* Bolla di benvenuto (sempre visibile) */}
                <div className="max-w-[86%] self-start">
                  <div className="bg-surface-2 text-foreground rounded-2xl rounded-tl-sm px-3 py-2 text-[13px] leading-snug">
                    Ciao! Posso trovarti una colonnina lungo il tuo percorso.
                  </div>
                </div>

                {/* Bolla utente — il messaggio "scritto" entra dopo l'invio */}
                <div className="imm-rc-user-1 max-w-[86%] self-end" style={{ opacity: 0 }}>
                  <div className="bg-accent text-accent-contrast rounded-2xl rounded-tr-sm px-3 py-2 text-[13px] leading-snug font-medium">
                    Devo ricaricare lungo la A1 verso Milano
                  </div>
                </div>

                {/* Risposta agente — il "sta scrivendo…" la sovrasta e si dissolve */}
                <div className="relative max-w-[86%] self-start">
                  <div
                    className="imm-rc-typing bg-surface-2 absolute top-0 left-0 flex items-center gap-1 rounded-2xl rounded-tl-sm px-3 py-2.5"
                    style={{ opacity: 0 }}
                    aria-hidden
                  >
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="bg-muted h-1.5 w-1.5 animate-bounce rounded-full"
                        style={{ animationDelay: `${d * 0.16}s` }}
                      />
                    ))}
                  </div>
                  <div
                    className="imm-rc-agent-1 bg-surface-2 text-foreground rounded-2xl rounded-tl-sm px-3 py-2 text-[13px] leading-snug"
                    style={{ opacity: 0 }}
                  >
                    Trovata una colonnina ultra-rapida sul percorso:
                  </div>
                </div>

                {/* ═══ Generative-UI · Card stazione con mini-mappa ═══ */}
                <div
                  className="imm-rc-card-station border-border bg-surface w-full self-start overflow-hidden rounded-2xl border"
                  style={{ opacity: 0 }}
                >
                  {/* Intestazione card */}
                  <div className="border-border flex items-center justify-between gap-2 border-b px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-foreground truncate text-[12px] font-semibold">
                        Hub Ultra-Rapido · A1
                      </p>
                      <p className="text-muted text-[10px]">Rete partner</p>
                    </div>
                    <span className="bg-accent-soft text-accent-ink shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold">
                      175 kW
                    </span>
                  </div>

                  {/* Mini-mappa: rotta che si disegna + pin che pulsa */}
                  <div className="bg-accent-soft relative h-[88px] w-full overflow-hidden">
                    {/* Strade semplificate (statiche) */}
                    <svg
                      className="absolute inset-0 h-full w-full"
                      viewBox="0 0 220 120"
                      fill="none"
                      preserveAspectRatio="none"
                      aria-hidden
                    >
                      <rect
                        x="0"
                        y="62"
                        width="220"
                        height="6"
                        rx="1"
                        style={{ fill: "var(--background)" }}
                        fillOpacity={0.7}
                      />
                      <rect
                        x="116"
                        y="0"
                        width="6"
                        height="120"
                        rx="1"
                        style={{ fill: "var(--background)" }}
                        fillOpacity={0.6}
                      />
                      <rect
                        x="0"
                        y="26"
                        width="220"
                        height="4"
                        rx="1"
                        style={{ fill: "var(--background)" }}
                        fillOpacity={0.4}
                      />
                      <rect
                        x="58"
                        y="0"
                        width="4"
                        height="120"
                        rx="1"
                        style={{ fill: "var(--background)" }}
                        fillOpacity={0.35}
                      />
                    </svg>

                    {/* Rotta — alone statico + tracciato animato via strokeDashoffset */}
                    <svg
                      className="absolute inset-0 h-full w-full"
                      viewBox="0 0 220 120"
                      fill="none"
                      preserveAspectRatio="none"
                      aria-hidden
                    >
                      <path
                        className="stroke-accent"
                        d="M 24 104 L 24 66 L 120 66 L 120 29 L 185 29"
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeOpacity={0.18}
                      />
                      <path
                        className="imm-rc-route stroke-accent"
                        d="M 24 104 L 24 66 L 120 66 L 120 29 L 185 29"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        pathLength={1}
                        strokeDasharray={1}
                        strokeDashoffset={1}
                      />
                      {/* Posizione di partenza (auto) */}
                      <circle cx="24" cy="104" r="5" className="fill-accent" />
                      <circle cx="24" cy="104" r="2.5" style={{ fill: "var(--background)" }} />
                    </svg>

                    {/* Pin colonnina — wrapper posiziona, interno è il target GSAP */}
                    <div className="absolute" style={{ left: "84%", top: "24%" }} aria-hidden>
                      <div className="imm-rc-pin flex flex-col items-center">
                        <div className="relative">
                          {/* Sonar a più anelli (stessa classe → fromTo con stagger) */}
                          <div
                            className="imm-rc-pin-ring border-accent absolute -inset-2 rounded-full border-2"
                            style={{ opacity: 0 }}
                          />
                          <div
                            className="imm-rc-pin-ring border-accent absolute -inset-2 rounded-full border-2"
                            style={{ opacity: 0 }}
                          />
                          <div className="bg-accent flex h-7 w-7 items-center justify-center rounded-full shadow-md outline-2 outline-offset-0 outline-white">
                            <svg
                              className="text-accent-contrast"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden
                            >
                              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
                            </svg>
                          </div>
                        </div>
                        <div className="bg-accent h-2 w-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Statistiche stazione */}
                  <div className="grid grid-cols-4 gap-px">
                    {STATION_STATS.map((s) => (
                      <div key={s.l} className="imm-rc-stat bg-surface px-1.5 py-2 text-center">
                        <p className="text-muted text-[8.5px] font-semibold tracking-wide uppercase">
                          {s.l}
                        </p>
                        <p className="text-foreground mt-0.5 text-[11px] font-bold">{s.v}</p>
                      </div>
                    ))}
                  </div>

                  {/* Azione: prenota lo stallo (il cursore vi fa "tap") */}
                  <div className="px-2.5 pb-2.5">
                    <span className="imm-rc-book-btn bg-accent text-accent-contrast block rounded-xl py-2 text-center text-[12px] font-bold">
                      Prenota lo stallo
                    </span>
                  </div>
                </div>

                {/* Bolla utente 2 — conferma prenotazione */}
                <div className="imm-rc-user-2 max-w-[86%] self-end" style={{ opacity: 0 }}>
                  <div className="bg-accent text-accent-contrast rounded-2xl rounded-tr-sm px-3 py-2 text-[13px] leading-snug font-medium">
                    Prenoto lo stallo
                  </div>
                </div>

                {/* ═══ Generative-UI · Vista ricarica (batteria, timer, costo) ═══ */}
                <div
                  className="imm-rc-card-charge border-border bg-surface w-full self-start rounded-2xl border p-3"
                  style={{ opacity: 0 }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-muted text-[9px] font-semibold tracking-widest uppercase">
                      In ricarica
                    </p>
                    <span className="text-accent-ink flex items-center gap-1 text-[9.5px] font-bold">
                      <span
                        className="bg-accent h-1.5 w-1.5 animate-pulse rounded-full"
                        aria-hidden
                      />
                      150 kW
                    </span>
                  </div>

                  <p className="text-accent-ink mt-1 font-mono text-2xl font-bold">
                    <span className="imm-rc-pct inline-block">20%</span>
                  </p>

                  {/* Barra batteria: scaleX da 0.2 a 0.8 */}
                  <div className="bg-surface-2 mt-2 h-4 w-full overflow-hidden rounded-full">
                    <div
                      className="imm-rc-battery-fill h-full rounded-full"
                      style={{
                        width: "100%",
                        transformOrigin: "left center",
                        transform: "scaleX(0.2)",
                        background:
                          "linear-gradient(to right, var(--accent), var(--accent-strong))",
                      }}
                    />
                  </div>
                  <p className="text-muted mt-1 text-[9px]">
                    Obiettivo 80% · <span className="text-accent-ink font-semibold">~18 min</span>
                  </p>

                  {/* Contatori live: costo e durata */}
                  <div className="mt-2.5 flex gap-2">
                    <div className="bg-surface-2 flex-1 rounded-xl p-2 text-center">
                      <p className="text-foreground font-mono text-base font-bold">
                        <span className="imm-rc-cost">0,00 €</span>
                      </p>
                      <p className="text-muted mt-0.5 text-[9px]">Costo</p>
                    </div>
                    <div className="bg-surface-2 flex-1 rounded-xl p-2 text-center">
                      <p className="text-foreground font-mono text-base font-bold">
                        <span className="imm-rc-timer">0 min</span>
                      </p>
                      <p className="text-muted mt-0.5 text-[9px]">Durata</p>
                    </div>
                  </div>
                </div>

                {/* Bolla finale dell'agente */}
                <div className="imm-rc-final max-w-[86%] self-start" style={{ opacity: 0 }}>
                  <div className="bg-accent-soft text-accent-ink rounded-2xl rounded-tl-sm px-3 py-2 text-[13px] leading-snug font-semibold">
                    Stallo prenotato · navigazione avviata.
                  </div>
                </div>
              </div>
            </div>

            {/* Barra di input — l'utente "scrive" qui parola per parola; il testo
                VA A CAPO su due righe (campo più alto) così l'intero messaggio
                resta leggibile quando finisce di scriversi. Placeholder e testo
                condividono la stessa cella grid (crossfade, altezza = due righe). */}
            <div className="imm-zoom-local border-border bg-background flex shrink-0 items-end gap-2 border-t px-2.5 py-2.5">
              <div className="bg-surface-2 grid min-h-8 flex-1 items-center rounded-2xl px-3 py-1.5">
                <span className="imm-rc-placeholder text-muted col-start-1 row-start-1 text-[12px]">
                  Scrivi all&apos;assistente…
                </span>
                <span className="imm-rc-input-text text-foreground col-start-1 row-start-1 text-[12px] leading-snug">
                  {"Devo ricaricare lungo la A1 verso Milano".split(" ").map((w, i, arr) => (
                    <span key={i}>
                      <span className="imm-rc-word inline-block">{w}</span>
                      {i < arr.length - 1 ? " " : ""}
                    </span>
                  ))}
                </span>
              </div>
              <span
                className="imm-rc-send bg-accent text-accent-contrast flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                aria-hidden
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M3 11l18-8-8 18-2.5-7.5L3 11z" fill="currentColor" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Title card di capitolo (P12) — apre la scena, animata da chapterIntro */}
      <ChapterCard chapter={CHAPTERS[6]} subtitle="Un'app con assistente AI integrato." />

      {/* Frasi-intermezzo DESCRITTIVE — tono neutro, spiegano, non vendono */}
      <Say i={1} variant="caption">
        Trova la colonnina giusta sul tuo percorso.
      </Say>
      <Say i={2} variant="caption">
        Prenota lo stallo e segue tempi e costi in tempo reale.
      </Say>
    </ImmersiveStage>
  );
}
