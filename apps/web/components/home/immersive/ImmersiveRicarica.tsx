"use client";

/**
 * @descrizione  Scena immersiva RICARICA EV (06 · App ricarica EV con AI).
 *   Full-screen sticky-scrub: un mockup telefono al centro guida l'utente
 *   attraverso un assistente di ricarica — trova la colonnina più vicina,
 *   disegna la rotta, riempie la batteria e prenota lo stallo.
 *   Usa il kit condiviso `./shared`. Tono DESCRITTIVO, non promozionale.
 *   Reduced-motion: gsap.set iniziale + tl.progress(1) → stato finale leggibile.
 */
import { gsap } from "@gmgroup/lib/gsap";
import { ImmersiveStage, Say, say, useImmersiveScene } from "./shared";

/** Formattatori Intl — singleton fuori dal componente (nessuna riallocazione). */
const fmtEur = new Intl.NumberFormat("it-IT", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const fmtInt = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0 });

const CHARGE_DETAILS = [
  { l: "Potenza", v: "150 kW" },
  { l: "Tipo presa", v: "CCS2" },
  { l: "Rete", v: "Mennekes" },
  { l: "Tariffa", v: "0,45 €/kWh" },
] satisfies { l: string; v: string }[];

export default function ImmersiveRicarica() {
  const ref = useImmersiveScene((tl, section) => {
    // ── Stato iniziale ───────────────────────────────────────────────────────
    // gsap.set garantisce che in reduced-motion (tl.progress(1)) lo stato
    // finale sia corretto e leggibile, senza flash al mount.
    gsap.set(".imm-rc-screen-map", { autoAlpha: 1 });
    gsap.set(".imm-rc-screen-charge", { autoAlpha: 0 });
    gsap.set(".imm-rc-screen-book", { autoAlpha: 0 });
    // pathLength="1" sul <path> SVG normalizza la lunghezza → dashoffset 1 = nascosta
    gsap.set(".imm-rc-route", { strokeDashoffset: 1 });
    // Pin: nascosto; xPercent/yPercent centra il tip sul punto di ancoraggio
    gsap.set(".imm-rc-pin", {
      autoAlpha: 0,
      scale: 0.5,
      xPercent: -50,
      yPercent: -100,
      transformOrigin: "50% 100%",
    });
    gsap.set(".imm-rc-pin-ring", { scale: 1, opacity: 0 });
    gsap.set(".imm-rc-bubble-1", { autoAlpha: 0, y: 10 });
    // scaleX 0.2 = 20% batteria iniziale
    gsap.set(".imm-rc-battery-fill", { scaleX: 0.2, transformOrigin: "left center" });
    gsap.set(".imm-rc-bubble-2", { autoAlpha: 0, y: 10 });

    // Proxy per i contatori testuali — onUpdate aggiorna il DOM durante lo scrub
    const pct = { v: 20 };
    const cost = { v: 0 };
    const mins = { v: 0 };
    const pctEl = section.querySelector<HTMLElement>(".imm-rc-pct");
    const costEl = section.querySelector<HTMLElement>(".imm-rc-cost");
    const minsEl = section.querySelector<HTMLElement>(".imm-rc-timer");

    // ── ① Frase introduttiva ─────────────────────────────────────────────────
    say(tl, 0);

    // ── ② Rotta che si disegna + leggero pan mappa + pin che appare ──────────
    // Il pan dello sfondo griglia crea una sottile sensazione di movimento.
    tl.to(".imm-rc-map-bg", { xPercent: -5, duration: 1.4, ease: "power1.inOut" });
    tl.to(".imm-rc-route", { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut" }, "<");
    // Il pin cade dall'alto (scale + autoAlpha) con rimbalzo espressivo
    tl.to(
      ".imm-rc-pin",
      { scale: 1, autoAlpha: 1, duration: 0.55, ease: "back.out(2.5)" },
      ">-0.3",
    );
    // Ring sonar: si espande e si dissolve una volta (scrub-safe, no repeat)
    tl.fromTo(
      ".imm-rc-pin-ring",
      { scale: 1, opacity: 0.75 },
      { scale: 2.9, opacity: 0, duration: 0.9, ease: "power2.out" },
      "<0.1",
    );

    // ── ③ Frase + bolla "colonnina" ──────────────────────────────────────────
    say(tl, 1);
    tl.to(".imm-rc-bubble-1", { autoAlpha: 1, y: 0, duration: 0.55, ease: "expo.out" }, "<0.2");

    // ── ④ Transizione → schermata batteria ───────────────────────────────────
    tl.to(".imm-rc-screen-map", { autoAlpha: 0, duration: 0.45, ease: "power2.inOut" }, "+=0.55");
    tl.to(".imm-rc-screen-charge", { autoAlpha: 1, duration: 0.45, ease: "power2.inOut" }, "<");

    // Barra batteria: scaleX 0.2 → 0.8 in sincronia con il contatore 20 → 80 %
    tl.to(".imm-rc-battery-fill", { scaleX: 0.8, duration: 1.4, ease: "power1.inOut" }, "+=0.15");
    tl.to(
      pct,
      {
        v: 80,
        duration: 1.4,
        ease: "power1.inOut",
        onUpdate() {
          if (pctEl) pctEl.textContent = fmtInt.format(pct.v) + "%";
        },
      },
      "<",
    );

    // ── ⑤ Frase "rotta e stallo" ─────────────────────────────────────────────
    say(tl, 2);

    // ── ⑥ Transizione → schermata conferma prenotazione ──────────────────────
    tl.to(
      ".imm-rc-screen-charge",
      { autoAlpha: 0, duration: 0.45, ease: "power2.inOut" },
      "+=0.25",
    );
    tl.to(".imm-rc-screen-book", { autoAlpha: 1, duration: 0.45, ease: "power2.inOut" }, "<");

    // Ticker costo 0 → 6,40 € e timer 0 → 18 min in parallelo
    tl.to(
      cost,
      {
        v: 6.4,
        duration: 1.2,
        ease: "power1.inOut",
        onUpdate() {
          if (costEl) costEl.textContent = fmtEur.format(cost.v) + " €";
        },
      },
      "+=0.1",
    );
    tl.to(
      mins,
      {
        v: 18,
        duration: 1.2,
        ease: "power1.inOut",
        onUpdate() {
          if (minsEl) minsEl.textContent = Math.round(mins.v) + " min";
        },
      },
      "<",
    );

    // Bolla finale "Stallo prenotato"
    tl.to(".imm-rc-bubble-2", { autoAlpha: 1, y: 0, duration: 0.55, ease: "expo.out" }, ">-0.15");

    // Pausa finale per dare respiro alla scena
    tl.to({}, { duration: 0.5 });
  });

  return (
    <ImmersiveStage
      ref={ref}
      heightVh={420}
      theme="mobility"
      label="Ricarica"
      eyebrow="06 · App ricarica EV con AI"
    >
      {/* Sfondo pagina: griglia mappa tenue su tono chiaro */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: [
            "linear-gradient(to right, rgba(60,158,58,0.07) 1px, transparent 1px)",
            "linear-gradient(to bottom, rgba(60,158,58,0.07) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "32px 32px",
        }}
        aria-hidden
      />

      {/* ── Mockup telefono centrato ──────────────────────────────────────── */}
      <div className="absolute inset-0 flex items-center justify-center pt-10">
        <div
          className="relative overflow-hidden rounded-[2.6rem] border-[5px] border-neutral-200 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.16)]"
          style={{ width: "min(250px, 40vw)", aspectRatio: "9 / 18.5" }}
          role="img"
          aria-label="Mockup dell'app di ricarica EV"
        >
          {/* Notch decorativo */}
          <div
            className="absolute top-0 left-1/2 z-20 h-5 w-20 -translate-x-1/2 rounded-b-2xl bg-neutral-200"
            aria-hidden
          />

          {/* Area schermo */}
          <div className="absolute inset-0 overflow-hidden rounded-[2.1rem]">
            {/* ════════════════════════════════════════════════════════════
                Screen A · Mappa con rotta SVG
            ════════════════════════════════════════════════════════════ */}
            <div className="imm-rc-screen-map absolute inset-0 flex flex-col">
              {/* Zona mappa */}
              <div className="relative flex-1 overflow-hidden bg-[#eaf1ea]">
                {/* Sfondo griglia mappa (si muove orizzontalmente durante il pan) */}
                <div
                  className="imm-rc-map-bg absolute inset-y-0 left-0"
                  style={{
                    width: "130%",
                    backgroundImage: [
                      "linear-gradient(to right, rgba(60,158,58,0.14) 1px, transparent 1px)",
                      "linear-gradient(to bottom, rgba(60,158,58,0.14) 1px, transparent 1px)",
                    ].join(", "),
                    backgroundSize: "18px 18px",
                  }}
                  aria-hidden
                />

                {/* Strade semplificate (decorazione statica) */}
                <svg
                  className="absolute inset-0 h-full w-full"
                  viewBox="0 0 200 230"
                  fill="none"
                  aria-hidden
                >
                  <rect
                    x="0"
                    y="108"
                    width="200"
                    height="8"
                    fill="white"
                    fillOpacity={0.55}
                    rx={1}
                  />
                  <rect
                    x="92"
                    y="0"
                    width="8"
                    height="230"
                    fill="white"
                    fillOpacity={0.45}
                    rx={1}
                  />
                  <rect
                    x="0"
                    y="60"
                    width="200"
                    height="5"
                    fill="white"
                    fillOpacity={0.28}
                    rx={1}
                  />
                  <rect
                    x="42"
                    y="0"
                    width="5"
                    height="230"
                    fill="white"
                    fillOpacity={0.22}
                    rx={1}
                  />
                  <rect
                    x="148"
                    y="0"
                    width="5"
                    height="230"
                    fill="white"
                    fillOpacity={0.18}
                    rx={1}
                  />
                  <rect
                    x="0"
                    y="172"
                    width="200"
                    height="4"
                    fill="white"
                    fillOpacity={0.18}
                    rx={1}
                  />
                </svg>

                {/* Rotta SVG — pathLength="1" → dashoffset 1=nascosta, 0=visibile */}
                <svg
                  className="absolute inset-0 h-full w-full"
                  viewBox="0 0 200 230"
                  fill="none"
                  aria-hidden
                >
                  {/* Alone verde della rotta (statico, non animato) */}
                  <path
                    d="M 96 212 L 96 146 L 138 146 L 138 60"
                    stroke="#3c9e3a"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity={0.15}
                  />
                  {/* Rotta principale — animata via strokeDashoffset */}
                  <path
                    className="imm-rc-route"
                    d="M 96 212 L 96 146 L 138 146 L 138 60"
                    stroke="#3c9e3a"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1}
                  />
                  {/* Punto di partenza (posizione auto) */}
                  <circle cx="96" cy="212" r="7" fill="#3c9e3a" />
                  <circle cx="96" cy="212" r="3.5" fill="white" />
                </svg>

                {/* Pin colonnina — il wrapper esterno posiziona, l'interno è il target GSAP */}
                <div className="absolute" style={{ left: "69%", top: "26%" }} aria-hidden>
                  <div className="imm-rc-pin flex flex-col items-center">
                    {/* Icona con ring sonar (ring assoluto rispetto all'icona) */}
                    <div className="relative">
                      <div
                        className="imm-rc-pin-ring absolute -inset-2.5 rounded-full border-2 border-[#3c9e3a]"
                        style={{ opacity: 0 }}
                      />
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3c9e3a] shadow-lg outline-2 outline-offset-0 outline-white">
                        {/* Icona lampo / ricarica */}
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" />
                        </svg>
                      </div>
                    </div>
                    {/* Stelo del pin */}
                    <div className="h-2.5 w-0.5 bg-[#3c9e3a]" />
                  </div>
                </div>
              </div>

              {/* Bolla assistente 1 — compare dopo che la rotta si disegna */}
              <div
                className="imm-rc-bubble-1 shrink-0 border-t border-neutral-100 bg-white px-3 py-3"
                style={{ opacity: 0 }}
              >
                <div className="flex items-start gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#3c9e3a] text-[9px] font-bold text-white">
                    AI
                  </div>
                  <div className="max-w-[82%] rounded-2xl rounded-tl-none bg-[#eaf4ea] px-3 py-2">
                    <p className="text-[11.5px] leading-snug text-neutral-700">
                      Colonnina ultra-rapida a&nbsp;1,2&nbsp;km
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ════════════════════════════════════════════════════════════
                Screen B · Batteria in ricarica
            ════════════════════════════════════════════════════════════ */}
            <div
              className="imm-rc-screen-charge absolute inset-0 flex flex-col bg-white p-4 pt-8"
              style={{ opacity: 0 }}
            >
              <p className="text-[8.5px] font-semibold tracking-widest text-neutral-400 uppercase">
                In ricarica · Mennekes Ultra
              </p>
              <p className="mt-1 font-mono text-3xl font-bold text-[#3c9e3a]">
                <span className="imm-rc-pct">20%</span>
              </p>

              {/* Barra batteria: scaleX animato da 0.2 a 0.8 */}
              <div className="mt-4 h-6 w-full overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="imm-rc-battery-fill h-full rounded-full bg-gradient-to-r from-[#3c9e3a] to-[#6abf68]"
                  style={{
                    width: "100%",
                    transformOrigin: "left center",
                    transform: "scaleX(0.2)",
                  }}
                />
              </div>
              <p className="mt-1.5 text-[8.5px] text-neutral-400">
                Obiettivo: 80% · <span className="font-semibold text-[#3c9e3a]">~18 min</span>
              </p>

              {/* Dettagli sessione */}
              <div className="mt-5 grid grid-cols-2 gap-2">
                {CHARGE_DETAILS.map((d) => (
                  <div key={d.l} className="rounded-xl bg-neutral-50 p-3">
                    <p className="text-[8px] font-semibold tracking-wider text-neutral-400 uppercase">
                      {d.l}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-neutral-700">{d.v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ════════════════════════════════════════════════════════════
                Screen C · Riepilogo sessione + stallo prenotato
            ════════════════════════════════════════════════════════════ */}
            <div
              className="imm-rc-screen-book absolute inset-0 flex flex-col bg-white p-4 pt-8"
              style={{ opacity: 0 }}
            >
              <p className="text-[8.5px] font-semibold tracking-widest text-neutral-400 uppercase">
                Sessione completata
              </p>

              {/* Ticker costo e timer */}
              <div className="mt-3 flex gap-3">
                <div className="flex-1 rounded-2xl bg-neutral-50 p-3 text-center">
                  <p className="font-mono text-xl font-bold text-neutral-800">
                    <span className="imm-rc-cost">0,00&nbsp;€</span>
                  </p>
                  <p className="mt-0.5 text-[8px] text-neutral-400">Costo sessione</p>
                </div>
                <div className="flex-1 rounded-2xl bg-neutral-50 p-3 text-center">
                  <p className="font-mono text-xl font-bold text-neutral-800">
                    <span className="imm-rc-timer">0&nbsp;min</span>
                  </p>
                  <p className="mt-0.5 text-[8px] text-neutral-400">Durata</p>
                </div>
              </div>

              {/* Riepilogo energia */}
              <div className="mt-3 rounded-xl bg-[#eaf4ea] px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[8.5px] font-semibold text-[#3c9e3a]">Energia erogata</span>
                  <span className="font-mono text-xs font-bold text-[#3c9e3a]">14,2 kWh</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[8.5px] font-semibold text-[#3c9e3a]">Stato batteria</span>
                  <span className="font-mono text-xs font-bold text-[#3c9e3a]">20% → 80%</span>
                </div>
              </div>

              {/* Bolla finale "Stallo prenotato" */}
              <div className="imm-rc-bubble-2 mt-4" style={{ opacity: 0 }}>
                <div className="flex items-start gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#3c9e3a] text-[9px] font-bold text-white">
                    AI
                  </div>
                  <div className="max-w-[82%] rounded-2xl rounded-tl-none bg-[#eaf4ea] px-3 py-2">
                    <p className="text-[11.5px] leading-snug text-neutral-700">Stallo prenotato.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frasi-intermezzo DESCRITTIVE — tono neutro, spiegano, non vendono */}
      <Say i={0}>Un assistente di ricarica dentro l&apos;app.</Say>
      <Say i={1}>Trova la colonnina e stima tempi e costi.</Say>
      <Say i={2}>Imposta la rotta e prenota lo stallo.</Say>
    </ImmersiveStage>
  );
}
