"use client";

/**
 * @descrizione  Scena immersiva RICARICA EV (06 · App ricarica EV con AI).
 *   Full-screen sticky-scrub: un MOCKUP SMARTPHONE centrato (sfondo mappa tenue)
 *   con una chat-agent. Lo scroll scrubba l'interazione ripresa dal legacy
 *   `EvAgentApp`/`DeviceSimulator` — assistente di ricarica di bordo:
 *     ① l'utente scrive «Devo ricaricare lungo la A1 verso Milano» (clip-path);
 *     ② l'agente risponde con generative-UI: card stazione (distanza, kW) +
 *        mini-mappa con rotta che si disegna (strokeDashoffset) e pin che pulsa;
 *     ③ «Prenoto lo stallo» → vista RICARICA: batteria che sale (scaleX, % via
 *        proxy+Intl), timer e costo live, bolla finale «Stallo prenotato».
 *   Il thread fa auto-scroll (translate Y misurato) per tenere a fuoco l'ultimo
 *   messaggio. Tema CHIARO, tono DESCRITTIVO. Usa il kit condiviso `./shared`.
 *   Reduced-motion: gsap.set iniziale + tl.progress(1) → stato finale leggibile.
 */
import { gsap } from "@gmgroup/lib/gsap";
import { ImmersiveStage, Say, say, cursorTo, useImmersiveScene } from "./shared";

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
  const ref = useImmersiveScene((tl, section) => {
    // ── Auto-scroll del thread ────────────────────────────────────────────────
    // Le bolle nascoste con autoAlpha mantengono lo spazio in layout: gli offset
    // sono stabili, quindi possiamo calcolare di quanto traslare il thread per
    // portare il fondo di un elemento a filo del viewport (come una chat reale).
    const viewport = section.querySelector<HTMLElement>(".imm-rc-viewport");
    const thread = section.querySelector<HTMLElement>(".imm-rc-thread");
    const vh = viewport?.clientHeight ?? 0;
    const scrollTo = (sel: string): number => {
      const el = section.querySelector<HTMLElement>(sel);
      if (!el || !thread) return 0;
      const bottom = el.offsetTop + el.offsetHeight;
      return -Math.max(0, bottom - vh + 14); // 14px di respiro sotto
    };

    // Proxy per i contatori testuali — onUpdate aggiorna il DOM durante lo scrub.
    const pct = { v: 20 };
    const cost = { v: 0 };
    const mins = { v: 0 };
    const pctEl = section.querySelector<HTMLElement>(".imm-rc-pct");
    const costEl = section.querySelector<HTMLElement>(".imm-rc-cost");
    const minsEl = section.querySelector<HTMLElement>(".imm-rc-timer");

    // ── Stato iniziale ────────────────────────────────────────────────────────
    gsap.set(".imm-rc-thread", { y: 0 });
    gsap.set(".imm-rc-placeholder", { autoAlpha: 1 });
    gsap.set(".imm-rc-input-text", { clipPath: "inset(0 100% 0 0)" });
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
    tl.set(".imm-cursor", { left: "50%", top: "82%" });

    // ── ① Frase introduttiva ──────────────────────────────────────────────────
    say(tl, 0); // «Un assistente di ricarica dentro l'app.»

    // ── ② L'utente scrive nel campo (clip-path steps) e invia ─────────────────
    tl.to(".imm-rc-placeholder", { autoAlpha: 0, duration: 0.2, ease: "power2.out" });
    tl.to(
      ".imm-rc-input-text",
      { clipPath: "inset(0 0% 0 0)", duration: 0.95, ease: "steps(28)" },
      "<",
    );
    // Il cursore va sul tasto invia e fa "tap"
    cursorTo(tl, "63%", "82%");
    tl.to(".imm-rc-send", { scale: 0.86, duration: 0.12, ease: "power2.in" }, ">-0.05");
    tl.to(".imm-rc-send", { scale: 1, duration: 0.2, ease: "back.out(2.4)" }, ">");
    // Il campo si svuota e il messaggio entra nel thread
    tl.to(
      ".imm-rc-input-text",
      { clipPath: "inset(0 100% 0 0)", duration: 0.22, ease: "power2.in" },
      "<",
    );
    tl.to(".imm-rc-placeholder", { autoAlpha: 1, duration: 0.25 }, "<");
    tl.to(
      ".imm-rc-user-1",
      { autoAlpha: 1, y: 0, duration: 0.45, ease: "back.out(1.7)" },
      ">-0.05",
    );
    tl.to(
      ".imm-rc-thread",
      { y: scrollTo(".imm-rc-user-1"), duration: 0.5, ease: "power2.inOut" },
      "<",
    );

    // ── ③ L'agente "sta scrivendo" → risponde ─────────────────────────────────
    tl.to(".imm-rc-typing", { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, ">0.1");
    say(tl, 1); // «Trova la colonnina giusta sul tuo percorso.»
    tl.to(".imm-rc-typing", { autoAlpha: 0, duration: 0.2, ease: "power2.in" });
    tl.to(".imm-rc-agent-1", { autoAlpha: 1, x: 0, duration: 0.5, ease: "back.out(1.6)" });
    tl.to(
      ".imm-rc-thread",
      { y: scrollTo(".imm-rc-agent-1"), duration: 0.5, ease: "power2.inOut" },
      "<0.1",
    );

    // ── ④ Generative-UI: card stazione + mini-mappa con rotta e pin ───────────
    tl.to(
      ".imm-rc-card-station",
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: "expo.out" },
      ">0.1",
    );
    tl.to(
      ".imm-rc-thread",
      { y: scrollTo(".imm-rc-card-station"), duration: 0.6, ease: "power2.inOut" },
      "<",
    );
    // La rotta si disegna lungo il percorso
    tl.to(".imm-rc-route", { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, "<0.2");
    // Il pin cade dall'alto con rimbalzo espressivo
    tl.to(".imm-rc-pin", { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2.6)" }, ">-0.4");
    // Ring sonar: si espande e si dissolve una volta (scrub-safe, no repeat)
    tl.fromTo(
      ".imm-rc-pin-ring",
      { scale: 1, opacity: 0.7 },
      { scale: 2.8, opacity: 0, duration: 0.9, ease: "power2.out" },
      "<0.1",
    );

    // ── ⑤ L'utente prenota lo stallo (cursore "tap" sul bottone della card) ───
    cursorTo(tl, "50%", "62%");
    tl.to(".imm-rc-book-btn", { scale: 0.94, duration: 0.12, ease: "power2.in" }, ">-0.05");
    tl.to(".imm-rc-book-btn", { scale: 1, duration: 0.2, ease: "back.out(2.2)" }, ">");
    tl.to(
      ".imm-rc-user-2",
      { autoAlpha: 1, y: 0, duration: 0.45, ease: "back.out(1.7)" },
      ">-0.05",
    );
    tl.to(
      ".imm-rc-thread",
      { y: scrollTo(".imm-rc-user-2"), duration: 0.5, ease: "power2.inOut" },
      "<",
    );

    // ── ⑥ Frase + vista RICARICA: batteria che sale, timer e costo live ───────
    say(tl, 2); // «Prenota lo stallo e segue tempi e costi in tempo reale.»
    tl.to(".imm-rc-card-charge", { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: "expo.out" });
    tl.to(
      ".imm-rc-thread",
      { y: scrollTo(".imm-rc-card-charge"), duration: 0.6, ease: "power2.inOut" },
      "<",
    );
    // Barra batteria 20% → 80% in sincronia con il contatore
    tl.to(".imm-rc-battery-fill", { scaleX: 0.8, duration: 1.3, ease: "power1.inOut" }, "<0.15");
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
    // Ticker costo 0 → 6,40 € e durata 0 → 18 min in parallelo
    tl.to(
      cost,
      {
        v: 6.4,
        duration: 1.3,
        ease: "power1.inOut",
        onUpdate() {
          if (costEl) costEl.textContent = fmtEur.format(cost.v) + " €";
        },
      },
      "<",
    );
    tl.to(
      mins,
      {
        v: 18,
        duration: 1.3,
        ease: "power1.inOut",
        onUpdate() {
          if (minsEl) minsEl.textContent = Math.round(mins.v) + " min";
        },
      },
      "<",
    );

    // ── ⑦ Bolla finale + pausa di respiro ─────────────────────────────────────
    tl.to(".imm-rc-final", { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out" }, ">0.1");
    tl.to(
      ".imm-rc-thread",
      { y: scrollTo(".imm-rc-final"), duration: 0.5, ease: "power2.inOut" },
      "<",
    );
    tl.to({}, { duration: 0.5 });
  });

  return (
    <ImmersiveStage
      ref={ref}
      heightVh={500}
      theme="mobility"
      label="Ricarica"
      eyebrow="06 · App ricarica EV con AI"
    >
      {/* Sfondo pagina: griglia mappa tenue (accent) su tono chiaro */}
      <div
        className="pointer-events-none absolute inset-0"
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
                  <div className="bg-surface-2 text-foreground rounded-2xl rounded-tl-sm px-3 py-2 text-[11.5px] leading-snug">
                    Ciao! Posso trovarti una colonnina lungo il tuo percorso.
                  </div>
                </div>

                {/* Bolla utente — il messaggio "scritto" entra dopo l'invio */}
                <div className="imm-rc-user-1 max-w-[86%] self-end" style={{ opacity: 0 }}>
                  <div className="bg-accent text-accent-contrast rounded-2xl rounded-tr-sm px-3 py-2 text-[11.5px] leading-snug font-medium">
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
                    className="imm-rc-agent-1 bg-surface-2 text-foreground rounded-2xl rounded-tl-sm px-3 py-2 text-[11.5px] leading-snug"
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
                      <p className="text-foreground truncate text-[11px] font-semibold">
                        Hub Ultra-Rapido · A1
                      </p>
                      <p className="text-muted text-[9px]">Rete Mennekes</p>
                    </div>
                    <span className="bg-accent-soft text-accent-ink shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-bold">
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
                      <div key={s.l} className="bg-surface px-1.5 py-2 text-center">
                        <p className="text-muted text-[7.5px] font-semibold tracking-wide uppercase">
                          {s.l}
                        </p>
                        <p className="text-foreground mt-0.5 text-[10px] font-bold">{s.v}</p>
                      </div>
                    ))}
                  </div>

                  {/* Azione: prenota lo stallo (il cursore vi fa "tap") */}
                  <div className="px-2.5 pb-2.5">
                    <span className="imm-rc-book-btn bg-accent text-accent-contrast block rounded-xl py-2 text-center text-[10.5px] font-bold">
                      Prenota lo stallo
                    </span>
                  </div>
                </div>

                {/* Bolla utente 2 — conferma prenotazione */}
                <div className="imm-rc-user-2 max-w-[86%] self-end" style={{ opacity: 0 }}>
                  <div className="bg-accent text-accent-contrast rounded-2xl rounded-tr-sm px-3 py-2 text-[11.5px] leading-snug font-medium">
                    Prenoto lo stallo
                  </div>
                </div>

                {/* ═══ Generative-UI · Vista ricarica (batteria, timer, costo) ═══ */}
                <div
                  className="imm-rc-card-charge border-border bg-surface w-full self-start rounded-2xl border p-3"
                  style={{ opacity: 0 }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-muted text-[8px] font-semibold tracking-widest uppercase">
                      In ricarica
                    </p>
                    <span className="text-accent-ink flex items-center gap-1 text-[8.5px] font-bold">
                      <span
                        className="bg-accent h-1.5 w-1.5 animate-pulse rounded-full"
                        aria-hidden
                      />
                      150 kW
                    </span>
                  </div>

                  <p className="text-accent-ink mt-1 font-mono text-2xl font-bold">
                    <span className="imm-rc-pct">20%</span>
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
                  <p className="text-muted mt-1 text-[8px]">
                    Obiettivo 80% · <span className="text-accent-ink font-semibold">~18 min</span>
                  </p>

                  {/* Contatori live: costo e durata */}
                  <div className="mt-2.5 flex gap-2">
                    <div className="bg-surface-2 flex-1 rounded-xl p-2 text-center">
                      <p className="text-foreground font-mono text-base font-bold">
                        <span className="imm-rc-cost">0,00 €</span>
                      </p>
                      <p className="text-muted mt-0.5 text-[8px]">Costo</p>
                    </div>
                    <div className="bg-surface-2 flex-1 rounded-xl p-2 text-center">
                      <p className="text-foreground font-mono text-base font-bold">
                        <span className="imm-rc-timer">0 min</span>
                      </p>
                      <p className="text-muted mt-0.5 text-[8px]">Durata</p>
                    </div>
                  </div>
                </div>

                {/* Bolla finale dell'agente */}
                <div className="imm-rc-final max-w-[86%] self-start" style={{ opacity: 0 }}>
                  <div className="bg-accent-soft text-accent-ink rounded-2xl rounded-tl-sm px-3 py-2 text-[11.5px] leading-snug font-semibold">
                    Stallo prenotato · navigazione avviata.
                  </div>
                </div>
              </div>
            </div>

            {/* Barra di input — l'utente "scrive" qui (clip-path) */}
            <div className="border-border bg-background flex shrink-0 items-center gap-2 border-t px-2.5 py-2.5">
              <div className="bg-surface-2 relative flex h-8 flex-1 items-center overflow-hidden rounded-full px-3">
                <span className="imm-rc-placeholder text-muted text-[10.5px]">
                  Scrivi all&apos;assistente…
                </span>
                <span className="imm-rc-input-text text-foreground absolute left-3 text-[10.5px] whitespace-nowrap">
                  Devo ricaricare lungo la A1 verso Milano
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

      {/* Frasi-intermezzo DESCRITTIVE — tono neutro, spiegano, non vendono */}
      <Say i={0}>Un assistente di ricarica dentro l&apos;app.</Say>
      <Say i={1}>Trova la colonnina giusta sul tuo percorso.</Say>
      <Say i={2}>Prenota lo stallo e segue tempi e costi in tempo reale.</Say>
    </ImmersiveStage>
  );
}
