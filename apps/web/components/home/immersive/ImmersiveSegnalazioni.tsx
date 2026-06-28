"use client";

/**
 * @descrizione  Scena immersiva SEGNALAZIONI (servizio 04). Full-screen, alta
 *   fedeltà: lo scroll scrubba un walkthrough — il cursore compila il form
 *   (tipo, titolo, priorità), preme Invia, vede il ticket comparire nella lista
 *   con cambio di stato e mini-timeline (creata → presa in carico → risolta).
 *   Usa il kit condiviso `./shared`. Reduced-motion: stato finale leggibile
 *   (tl.progress(1) gestito dal kit).
 */
import { gsap } from "@gmgroup/lib/gsap";
import { ImmersiveStage, Say, say, cursorTo, useImmersiveScene } from "./shared";

// ── Dati ─────────────────────────────────────────────────────────────────────

const TIPO_PILLS = ["Bug", "Richiesta", "Miglioramento"] as const;
const PRIO_PILLS = ["Bassa", "Media", "Alta"] as const;

type TipoPill = (typeof TIPO_PILLS)[number];
type PrioPill = (typeof PRIO_PILLS)[number];
type TicketStatus = "Aperta" | "In lavorazione" | "Risolta";

interface Ticket {
  id: string;
  title: string;
  type: TipoPill;
  prio: PrioPill;
  status: TicketStatus;
}

const TICKETS: Ticket[] = [
  {
    id: "SEG-2026-0039",
    title: "Errore nel PDF fattura",
    type: "Bug",
    prio: "Alta",
    status: "Risolta",
  },
  {
    id: "SEG-2026-0040",
    title: "Aggiungere filtro per data",
    type: "Richiesta",
    prio: "Media",
    status: "In lavorazione",
  },
  {
    id: "SEG-2026-0041",
    title: "Logo non centrato nel footer",
    type: "Miglioramento",
    prio: "Bassa",
    status: "Aperta",
  },
];

// ── Token colore badge (sky / amber / emerald ammessi per i badge di stato) ──

const STATUS_CLS: Record<TicketStatus, string> = {
  Aperta: "bg-sky-100 text-sky-800 border border-sky-200",
  "In lavorazione": "bg-amber-100 text-amber-800 border border-amber-200",
  Risolta: "bg-emerald-100 text-emerald-800 border border-emerald-200",
};

const PRIO_CLS: Record<PrioPill, string> = {
  Alta: "bg-amber-100 text-amber-800 border border-amber-200",
  Media: "bg-surface-2 text-muted border border-border",
  Bassa: "bg-surface-2 text-muted border border-border",
};

const TYPE_CLS: Record<TipoPill, string> = {
  Bug: "bg-sky-100 text-sky-800 border border-sky-200",
  Richiesta: "bg-surface-2 text-muted border border-border",
  Miglioramento: "bg-emerald-100 text-emerald-800 border border-emerald-200",
};

// ── Componente ────────────────────────────────────────────────────────────────

export default function ImmersiveSegnalazioni() {
  const ref = useImmersiveScene((tl, _section) => {
    // ── Stato iniziale ───────────────────────────────────────────────────────
    // Il testo del titolo parte nascosto (clip-path); i pill di tipo/priorità
    // partono neutrali e vengono colorati dalla timeline quando il cursore li
    // "clicca". Toast, nuovo ticket, badge-stato e mini-timeline sono nascosti.
    gsap.set(".imm-title-text", { clipPath: "inset(0 100% 0 0)" });
    gsap.set(".imm-toast", { autoAlpha: 0, y: 48 });
    gsap.set(".imm-new-ticket", { autoAlpha: 0, y: 14 });
    gsap.set(".imm-badge-lavorazione", { autoAlpha: 0, scale: 0.8 });
    gsap.set(".imm-tl-step", { opacity: 0, scale: 0.5 });
    gsap.set(".imm-tl-label", { opacity: 0 });
    gsap.set(".imm-tl-line", { scaleX: 0, transformOrigin: "left center" });
    tl.set(".imm-cursor", { left: "50%", top: "55%" });

    // ① Frase: canale unico per segnalazioni
    say(tl, 0);

    // ② Cursore → pill «Bug», selezione col click
    cursorTo(tl, "22%", "37%");
    tl.to(
      ".imm-tipo-bug",
      {
        backgroundColor: "rgb(224 242 254)", // sky-100
        color: "rgb(12 74 110)", // sky-900
        duration: 0.35,
        ease: "power2.out",
      },
      ">0.25",
    );

    // ③ Cursore → campo Titolo; il testo «digita» con clip-path steps
    cursorTo(tl, "30%", "49%");
    tl.to(
      ".imm-title-text",
      { clipPath: "inset(0 0% 0 0)", duration: 1.3, ease: "steps(28)" },
      ">0.2",
    );

    // ④ Cursore → pill «Alta» priorità, selezione
    cursorTo(tl, "22%", "61%");
    tl.to(
      ".imm-prio-alta",
      {
        backgroundColor: "rgb(254 243 199)", // amber-100
        color: "rgb(120 53 15)", // amber-900
        duration: 0.35,
        ease: "power2.out",
      },
      ">0.25",
    );

    // ⑤ Frase: ogni invio genera un ticket
    say(tl, 1);

    // ⑥ Cursore → pulsante Invia; pulse di conferma
    cursorTo(tl, "19%", "74%");
    tl.to(".imm-send-btn", { scale: 0.94, duration: 0.1, ease: "power2.in" }, ">0.3");
    tl.to(".imm-send-btn", { scale: 1, duration: 0.45, ease: "back.out(3.5)" }, ">");

    // ⑦ Toast di conferma: entra dal basso
    tl.to(".imm-toast", { autoAlpha: 1, y: 0, duration: 0.55, ease: "expo.out" }, ">0.1");

    // ⑧ Nuovo ticket: appare nella lista a destra
    tl.to(
      ".imm-new-ticket",
      { autoAlpha: 1, y: 0, duration: 0.55, ease: "back.out(1.6)" },
      ">0.35",
    );

    // ⑨ Badge stato: cross-fade «Aperta» → «In lavorazione»
    tl.to(
      ".imm-badge-aperta",
      { autoAlpha: 0, scale: 0.8, duration: 0.3, ease: "back.in(1.6)" },
      ">0.55",
    );
    tl.to(
      ".imm-badge-lavorazione",
      { autoAlpha: 1, scale: 1, duration: 0.4, ease: "back.out(1.8)" },
      ">0.1",
    );

    // ⑩ Mini-timeline: dot e linee rivelati in cascata (creata → presa → risolta)
    tl.to(
      ".imm-tl-step-0",
      { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2.5)" },
      ">0.2",
    );
    tl.to(".imm-tl-label-0", { opacity: 1, duration: 0.25, ease: "power2.out" }, "<0.05");
    tl.to(".imm-tl-line-0", { scaleX: 1, duration: 0.45, ease: "power2.inOut" }, ">0.1");
    tl.to(
      ".imm-tl-step-1",
      { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2.5)" },
      ">0.05",
    );
    tl.to(".imm-tl-label-1", { opacity: 1, duration: 0.25, ease: "power2.out" }, "<0.05");
    tl.to(".imm-tl-line-1", { scaleX: 1, duration: 0.45, ease: "power2.inOut" }, ">0.1");
    tl.to(
      ".imm-tl-step-2",
      { opacity: 0.4, scale: 1, duration: 0.35, ease: "back.out(2.5)" },
      ">0.05",
    );
    tl.to(".imm-tl-label-2", { opacity: 0.4, duration: 0.25, ease: "power2.out" }, "<0.05");

    // ⑪ Frase: storico sempre sotto controllo
    say(tl, 2);

    tl.to({}, { duration: 0.6 });
  });

  return (
    <ImmersiveStage
      ref={ref}
      heightVh={420}
      theme="platform"
      label="Segnalazioni"
      eyebrow="04 · Segnalazioni"
    >
      <div className="flex h-full pt-12">
        {/* ── Colonna sinistra: form nuova segnalazione ────────────────────── */}
        <div className="border-border bg-surface/40 flex w-1/2 shrink-0 flex-col gap-5 overflow-hidden border-r p-6 backdrop-blur-sm">
          <h2 className="text-foreground font-semibold tracking-tight">Nuova segnalazione</h2>

          {/* Tipo */}
          <fieldset className="space-y-2">
            <legend className="text-muted text-xs font-semibold tracking-widest uppercase">
              Tipo
            </legend>
            <div className="flex flex-wrap gap-2">
              {TIPO_PILLS.map((p) => (
                <span
                  key={p}
                  className={[
                    "border-border bg-surface-2 text-muted cursor-default rounded-full border px-3 py-1 text-sm font-medium select-none",
                    p === "Bug" ? "imm-tipo-bug" : "",
                  ]
                    .join(" ")
                    .trim()}
                >
                  {p}
                </span>
              ))}
            </div>
          </fieldset>

          {/* Titolo */}
          <div className="space-y-2">
            <label className="text-muted text-xs font-semibold tracking-widest uppercase">
              Titolo
            </label>
            <div className="border-border bg-surface flex h-9 items-center overflow-hidden rounded-lg border px-3 text-sm">
              {/* Il clip-path steps simula la digitazione carattere per carattere */}
              <span className="imm-title-text text-foreground block font-medium whitespace-nowrap">
                Checkout non risponde su mobile
              </span>
            </div>
          </div>

          {/* Priorità */}
          <fieldset className="space-y-2">
            <legend className="text-muted text-xs font-semibold tracking-widest uppercase">
              Priorità
            </legend>
            <div className="flex flex-wrap gap-2">
              {PRIO_PILLS.map((p) => (
                <span
                  key={p}
                  className={[
                    "border-border bg-surface-2 text-muted cursor-default rounded-full border px-3 py-1 text-sm font-medium select-none",
                    p === "Alta" ? "imm-prio-alta" : "",
                  ]
                    .join(" ")
                    .trim()}
                >
                  {p}
                </span>
              ))}
            </div>
          </fieldset>

          {/* Descrizione (placeholder statico, non animata) */}
          <div className="space-y-2">
            <label className="text-muted text-xs font-semibold tracking-widest uppercase">
              Descrizione
            </label>
            <div className="border-border bg-surface text-muted h-20 rounded-lg border px-3 py-2 text-sm italic">
              Riproducibile su Safari iOS 17, solo al checkout…
            </div>
          </div>

          {/* Pulsante Invia */}
          <button
            type="button"
            className="imm-send-btn bg-accent text-accent-contrast mt-auto self-start rounded-lg px-5 py-2 text-sm font-semibold"
            aria-label="Invia segnalazione"
          >
            Invia segnalazione
          </button>
        </div>

        {/* ── Colonna destra: lista ticket ──────────────────────────────────── */}
        <div className="flex w-1/2 shrink-0 flex-col gap-3 overflow-hidden p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground font-semibold tracking-tight">Ticket recenti</h2>
            <span className="bg-surface-2 text-muted rounded-full px-2.5 py-0.5 text-xs font-semibold">
              {TICKETS.length} aperti
            </span>
          </div>

          {/* Ticket esistenti */}
          <div className="border-border divide-border divide-y overflow-hidden rounded-xl border">
            {TICKETS.map((t) => (
              <div key={t.id} className="bg-surface px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-foreground truncate text-sm font-medium">{t.title}</p>
                    <p className="text-muted mt-0.5 text-xs">{t.id}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-1.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_CLS[t.type]}`}
                    >
                      {t.type}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PRIO_CLS[t.prio]}`}
                    >
                      {t.prio}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_CLS[t.status]}`}
                    >
                      {t.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Nuovo ticket (nascosto inizialmente; compare dopo «Invia») */}
          <div className="imm-new-ticket border-accent bg-surface overflow-hidden rounded-xl border-2">
            <div className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-foreground text-sm font-medium">
                    Checkout non risponde su mobile
                  </p>
                  <p className="text-muted mt-0.5 text-xs">SEG-2026-0042</p>
                </div>

                {/* Badge tipo + priorità fissi, badge stato con transizione */}
                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_CLS["Bug"]}`}
                  >
                    Bug
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PRIO_CLS["Alta"]}`}
                  >
                    Alta
                  </span>

                  {/* Slot badge stato: i due badge si sovrappongono, cross-fade via GSAP */}
                  <div className="relative h-5 min-w-[7.5rem]">
                    <span className="imm-badge-aperta absolute top-0 left-0 rounded-full border border-sky-200 bg-sky-100 px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-sky-800">
                      Aperta
                    </span>
                    <span className="imm-badge-lavorazione absolute top-0 left-0 rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-amber-800">
                      In lavorazione
                    </span>
                  </div>
                </div>
              </div>

              {/* Mini-timeline: creata → presa in carico → risolta */}
              <div className="mt-4 w-52">
                {/* Dot e linee in una riga flex */}
                <div className="flex items-center">
                  <span className="imm-tl-step imm-tl-step-0 bg-accent block h-2.5 w-2.5 shrink-0 rounded-full" />
                  <div className="imm-tl-line imm-tl-line-0 bg-accent h-px flex-1" />
                  <span className="imm-tl-step imm-tl-step-1 bg-accent block h-2.5 w-2.5 shrink-0 rounded-full" />
                  <div className="imm-tl-line imm-tl-line-1 bg-border h-px flex-1" />
                  <span className="imm-tl-step imm-tl-step-2 bg-border block h-2.5 w-2.5 shrink-0 rounded-full" />
                </div>
                {/* Etichette allineate ai dot via justify-between */}
                <div className="mt-1.5 flex justify-between">
                  <span className="imm-tl-label imm-tl-label-0 text-foreground text-xs font-medium">
                    Creata
                  </span>
                  <span className="imm-tl-label imm-tl-label-1 text-foreground text-xs font-medium">
                    Presa in carico
                  </span>
                  <span className="imm-tl-label imm-tl-label-2 text-muted text-xs">Risolta</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast conferma creazione ticket (entra dal basso, rimane visibile) */}
      <div
        className="imm-toast border-border bg-surface pointer-events-none absolute bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border px-5 py-3 shadow-lg"
        aria-live="polite"
        style={{ opacity: 0 }}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100">
          <svg
            className="h-4 w-4 text-emerald-600"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden
          >
            <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 1 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
          </svg>
        </span>
        <div>
          <p className="text-foreground text-sm font-semibold">Ticket SEG-2026-0042 creato</p>
          <p className="text-muted text-xs">Assegnato automaticamente al team prodotto</p>
        </div>
      </div>

      {/* Frasi-intermezzo DESCRITTIVE (tono descrittivo, non promozionale) */}
      <Say i={0}>Un canale unico per bug e richieste di modifica.</Say>
      <Say i={1}>Ogni invio diventa un ticket tracciato.</Say>
      <Say i={2}>Stato, priorità e storico sempre sotto controllo.</Say>
    </ImmersiveStage>
  );
}
