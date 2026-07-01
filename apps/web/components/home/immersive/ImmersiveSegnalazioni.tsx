"use client";

/**
 * @descrizione  Scena immersiva SEGNALAZIONI (servizio 03). Full-screen, alta
 *   fedeltà, tema CHIARO, tono DESCRITTIVO. Lo scroll scrubba un walkthrough a
 *   DUE schermate affiancate con PAN ORIZZONTALE tra loro:
 *
 *   • Schermata A — un GESTIONALE con toolbar a 3 funzioni («Esporta», «Filtra»,
 *     «Stampa») e una pagina dati sotto. Il cursore preme «Copia link» → toast
 *     «Link pagina copiato».
 *   • PAN → Schermata B — il MODULO DI SEGNALAZIONE: il cursore incolla il link
 *     (il campo si riempie), scrive la richiesta (clip-path steps) e preme INVIA
 *     → «Segnalazione ricevuta ✓».
 *   • PAN → ritorno alla Schermata A: il 4° bottone «Invia per email» APPARE
 *     (back.out), si illumina e "funziona" (pulse + mini toast «Email inviata»).
 *
 *   Usa il kit condiviso `./shared`. Camera/skew ereditati dallo stage.
 *   Reduced-motion (kit → tl.progress(1)): stato finale leggibile = 4° bottone
 *   presente sulla Schermata A + «Segnalazione ricevuta ✓» visibile.
 */
import { gsap } from "@gmgroup/lib/gsap";
import {
  ImmersiveStage,
  Say,
  say,
  cursorTo,
  clickZoom,
  useImmersiveScene,
  pressButton,
  typeInField,
} from "./shared";

// ── Dati Schermata A (pagina del gestionale) ─────────────────────────────────

const TOOLBAR = ["Esporta", "Filtra", "Stampa"] as const;

const RIGHE = [
  { c: "Rossi S.r.l.", v: "62.000 €", s: "Attivo" },
  { c: "Bianchi S.p.A.", v: "12.500 €", s: "Attivo" },
  { c: "Ferrari Group", v: "87.000 €", s: "In trattativa" },
  { c: "Conti S.r.l.", v: "34.200 €", s: "Attivo" },
] as const;

// Link "incollato" nel modulo e testo della richiesta digitato carattere/carattere.
const LINK_PAGINA = "gestionale.demo/clienti";

// ── Icona check (riusata nei toast) ──────────────────────────────────────────

function Check({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden>
      <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 1 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
    </svg>
  );
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function ImmersiveSegnalazioni() {
  const ref = useImmersiveScene((tl) => {
    // ── Stato iniziale ───────────────────────────────────────────────────────
    // Il track parte sulla Schermata A. Link e richiesta del modulo partono
    // "vuoti" (clip-path). Toast, conferma e 4° bottone partono nascosti.
    gsap.set(".imm-track", { xPercent: 0 });
    // Link e richiesta (typing) sono nascosti dai loro helper typeInField.
    gsap.set(".imm-copy-toast", { autoAlpha: 0, y: 48 });
    gsap.set(".imm-received-toast", { autoAlpha: 0, y: 48 });
    gsap.set(".imm-email-toast", { autoAlpha: 0, y: -28 });
    gsap.set(".imm-new-btn", { autoAlpha: 0, scale: 0.8 });
    gsap.set(".imm-new-btn-ring", { autoAlpha: 0, scale: 0.85 });
    tl.set(".imm-cursor", { left: "50%", top: "55%" });

    // ① Frase: si segnala in un attimo
    say(tl, 0);

    // ② Schermata A → il cursore (mano) preme «Copia link»
    cursorTo(tl, ".imm-copy-link", { mode: "hand" });
    pressButton(tl, ".imm-copy-link", { downDur: 0.1, upDur: 0.4, back: 3, position: ">0.25" });
    // Toast «Link pagina copiato» (entra dal basso, con punch-zoom d'ingresso)
    tl.to(".imm-copy-toast", { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out" }, ">0.05");
    clickZoom(tl, ".imm-copy-toast", { position: "<0.12", scale: 1.05 });

    // ③ Frase: copi il link, scrivi cosa serve, invii
    say(tl, 1);

    // ── PAN ORIZZONTALE → Schermata B (modulo di segnalazione) ───────────────
    tl.to(".imm-copy-toast", { autoAlpha: 0, y: 48, duration: 0.4, ease: "power2.in" });
    tl.to(".imm-track", { xPercent: -50, duration: 1.1, ease: "expo.inOut" }, "<0.1");

    // ④ Il cursore (caret) incolla il link → il campo si riempie (reveal rapido = "paste")
    cursorTo(tl, ".imm-link-text", { mode: "text" });
    typeInField(tl, ".imm-link-text", { steps: 10, duration: 0.4, position: ">0.1" });

    // ⑤ Il cursore (caret) scrive la richiesta → digitazione carattere per carattere
    cursorTo(tl, ".imm-req-text", { mode: "text" });
    typeInField(tl, ".imm-req-text", { steps: 36, duration: 1.4, position: ">0.15" });
    clickZoom(tl, ".imm-zoom-local", { position: "<" }); // punch-zoom del modulo durante il typing

    // ⑥ Il cursore (mano) preme INVIA → pulse di conferma
    cursorTo(tl, ".imm-send-btn", { mode: "hand" });
    pressButton(tl, ".imm-send-btn", { downDur: 0.1, upDur: 0.45, back: 3.5, position: ">0.25" });

    // ⑦ «Segnalazione ricevuta ✓» (toast globale, resta visibile) + punch-zoom
    tl.to(".imm-received-toast", { autoAlpha: 1, y: 0, duration: 0.55, ease: "expo.out" }, ">0.1");
    clickZoom(tl, ".imm-received-toast", { position: "<0.14", scale: 1.05 });

    // ⑧ Frase: la richiesta arriva e prende vita
    say(tl, 2);

    // ── PAN ORIZZONTALE → ritorno alla Schermata A ───────────────────────────
    // PRIMA il pan (track torna a xPercent 0), POI il cursore: cursorTo misura
    // `.imm-new-btn` via getBoundingClientRect quando è già ON-SCREEN. Se il cursore
    // partisse insieme al pan ("<"), leggerebbe il bottone ancora fuori campo a
    // sinistra e planerebbe nel vuoto (come fa correttamente il pan in andata).
    tl.to(".imm-track", { xPercent: 0, duration: 1.1, ease: "expo.inOut" });
    cursorTo(tl, ".imm-new-btn", { mode: "hand" });

    // ⑨ Il 4° bottone «Invia per email» APPARE (ease espressivo back.out)
    tl.to(
      ".imm-new-btn",
      { autoAlpha: 1, scale: 1, duration: 0.65, ease: "back.out(2.4)" },
      ">-0.15",
    );
    // Highlight: un anello pulsa e svanisce attorno al nuovo bottone
    tl.fromTo(
      ".imm-new-btn-ring",
      { autoAlpha: 0.9, scale: 0.85 },
      { autoAlpha: 0, scale: 1.35, duration: 0.7, ease: "power2.out" },
      ">0.02",
    );

    // ⑩ Il bottone "funziona": pressione + mini toast «Email inviata»
    pressButton(tl, ".imm-new-btn", { downDur: 0.1, upDur: 0.4, back: 3, position: ">0.05" });
    tl.to(
      ".imm-email-toast",
      { autoAlpha: 1, y: 0, duration: 0.45, ease: "back.out(1.7)" },
      ">0.05",
    );

    tl.to({}, { duration: 0.6 });
  });

  return (
    <ImmersiveStage
      ref={ref}
      heightVh={480}
      theme="platform"
      label="Segnalazioni"
      eyebrow="03 · Segnalazioni"
    >
      {/* Viewport del pan: clippa la schermata fuori campo */}
      <div className="h-full overflow-hidden pt-12">
        <div className="imm-track flex h-[calc(100%-3rem)]" style={{ width: "200%" }}>
          {/* ════════════ SCHERMATA A · Gestionale ════════════ */}
          <div className="w-1/2 shrink-0 overflow-hidden p-6 sm:p-8">
            <div className="border-border bg-surface flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm">
              {/* Header pagina + bottone «Copia link» */}
              <div className="border-border flex items-center justify-between gap-4 border-b px-6 py-4">
                <div className="min-w-0">
                  <div className="text-foreground flex items-center gap-2 font-semibold">
                    <span className="bg-accent h-4 w-4 rounded-[5px]" />
                    Anagrafica clienti
                  </div>
                  <p className="text-muted mt-0.5 text-sm">148 record · aggiornata oggi</p>
                </div>
                <button
                  type="button"
                  className="imm-copy-link border-border bg-surface-2 text-foreground inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium"
                  aria-label="Copia link della pagina"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1m-1 8a5 5 0 0 1-7 0 5 5 0 0 1 0-7l2-2a5 5 0 0 1 7 0"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Copia link
                </button>
              </div>

              {/* Toolbar: 3 funzioni + (a fine animazione) la 4ª */}
              <div className="border-border bg-surface/60 flex items-center gap-2 border-b px-6 py-3">
                <span className="text-muted mr-1 text-xs font-semibold tracking-widest uppercase">
                  Azioni
                </span>
                {TOOLBAR.map((t) => (
                  <span
                    key={t}
                    className="border-border bg-surface text-foreground rounded-lg border px-3 py-1.5 text-sm font-medium select-none"
                  >
                    {t}
                  </span>
                ))}

                {/* 4° bottone — nascosto finché la segnalazione non lo "crea" */}
                <span className="relative ml-1 inline-flex">
                  <span
                    className="imm-new-btn-ring border-accent pointer-events-none absolute -inset-1 rounded-xl border-2"
                    style={{ opacity: 0 }}
                    aria-hidden
                  />
                  <span
                    className="imm-new-btn bg-accent text-accent-contrast inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold"
                    style={{ opacity: 0 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M3 7l9 6 9-6M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Invia per email
                  </span>
                </span>
              </div>

              {/* Contenuto: tabella record */}
              <div className="flex-1 overflow-hidden p-6">
                <div className="border-border overflow-hidden rounded-xl border">
                  <div className="bg-surface-2 text-muted grid grid-cols-3 gap-2 px-4 py-2.5 text-xs font-semibold tracking-wider uppercase">
                    <span>Cliente</span>
                    <span>Valore</span>
                    <span>Stato</span>
                  </div>
                  <div className="divide-border divide-y">
                    {RIGHE.map((r) => (
                      <div key={r.c} className="grid grid-cols-3 gap-2 px-4 py-3 text-sm">
                        <span className="text-foreground font-medium">{r.c}</span>
                        <span className="text-foreground font-mono">{r.v}</span>
                        <span className="text-muted text-xs font-semibold">{r.s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ════════════ SCHERMATA B · Modulo di segnalazione ════════════ */}
          <div className="w-1/2 shrink-0 overflow-hidden p-6 sm:p-8">
            <div className="imm-zoom-local border-border bg-surface mx-auto flex h-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-sm">
              <div className="border-border border-b px-6 py-4">
                <h2 className="text-foreground font-semibold tracking-tight">
                  Modulo di segnalazione
                </h2>
                <p className="text-muted mt-0.5 text-sm">Invia una richiesta al team prodotto</p>
              </div>

              <div className="flex flex-1 flex-col gap-5 p-6">
                {/* Campo Link — si riempie quando il cursore "incolla" */}
                <div className="space-y-2">
                  <label className="text-muted text-xs font-semibold tracking-widest uppercase">
                    Link della pagina
                  </label>
                  <div className="border-border bg-surface flex h-10 items-center overflow-hidden rounded-lg border px-3 text-sm">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-muted mr-2 shrink-0"
                      aria-hidden
                    >
                      <path
                        d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1m-1 8a5 5 0 0 1-7 0 5 5 0 0 1 0-7l2-2a5 5 0 0 1 7 0"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="imm-link-text text-accent-ink block font-mono whitespace-nowrap">
                      {LINK_PAGINA}
                    </span>
                  </div>
                </div>

                {/* Campo Richiesta — testo digitato carattere per carattere */}
                <div className="space-y-2">
                  <label className="text-muted text-xs font-semibold tracking-widest uppercase">
                    La tua richiesta
                  </label>
                  <div className="border-border bg-surface min-h-22 overflow-hidden rounded-lg border px-3 py-2.5 text-sm">
                    <span className="imm-req-text text-foreground block font-medium whitespace-nowrap">
                      Vorrei una 4ª funzione: &apos;Invia per email&apos;
                    </span>
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
            </div>
          </div>
        </div>
      </div>

      {/* ── Toast globali (fuori dal track: non vengono clippati né spostati) ── */}

      {/* «Link pagina copiato» (Schermata A, poi svanisce prima del pan) */}
      <div
        className="imm-copy-toast border-border bg-surface pointer-events-none absolute bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border px-5 py-3 shadow-lg"
        aria-live="polite"
        style={{ opacity: 0 }}
      >
        <span className="bg-surface-2 text-accent-ink flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1m-1 8a5 5 0 0 1-7 0 5 5 0 0 1 0-7l2-2a5 5 0 0 1 7 0"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <p className="text-foreground text-sm font-semibold">Link pagina copiato</p>
      </div>

      {/* «Segnalazione ricevuta ✓» (resta visibile fino allo stato finale) */}
      <div
        className="imm-received-toast border-border bg-surface pointer-events-none absolute bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border px-5 py-3 shadow-lg"
        aria-live="polite"
        style={{ opacity: 0 }}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100">
          <Check className="h-4 w-4 text-emerald-600" />
        </span>
        <div>
          <p className="text-foreground text-sm font-semibold">Segnalazione ricevuta ✓</p>
          <p className="text-muted text-xs">Inoltrata al team prodotto</p>
        </div>
      </div>

      {/* Mini toast «Email inviata» (Schermata A, conferma che il 4° bottone funziona) */}
      <div
        className="imm-email-toast border-border bg-surface pointer-events-none absolute top-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border px-4 py-2 shadow-lg"
        aria-live="polite"
        style={{ opacity: 0 }}
      >
        <Check className="h-4 w-4 text-emerald-600" />
        <p className="text-foreground text-sm font-semibold">Email inviata</p>
      </div>

      {/* Frasi-intermezzo DESCRITTIVE (spiegano, non vendono) */}
      <Say i={0}>Segnali un problema o una richiesta in un attimo.</Say>
      <Say i={1} variant="caption">
        Copi il link, scrivi cosa serve, invii.
      </Say>
      <Say i={2} variant="caption">
        La richiesta arriva e prende vita.
      </Say>
    </ImmersiveStage>
  );
}
