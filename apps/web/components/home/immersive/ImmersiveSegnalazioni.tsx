"use client";

/**
 * @descrizione  Scena immersiva SEGNALAZIONI (servizio 03) — viene SUBITO dopo
 *   la Dashboard e ne riparte: Schermata A = la STESSA dashboard in versione
 *   compatta (sidebar, topbar con il bottone «Segnala un problema» — identico
 *   `imm-report-btn` della scena precedente) ma con un DIFETTO mock visibile:
 *   nella card «Hero homepage» l'immagine è ROTTA (riquadro grigio con icona
 *   immagine spezzata + badge rosso «Immagine non trovata») — lo speculare
 *   della card pubblicata con «impianto-2026.jpg» nella scena Dashboard.
 *
 *   • Beat ① — veil «Qualcosa non va? Lo segnali da dove sei.» Il cursore
 *     (mano) preme «Segnala un problema» (punch di camera + pressButton).
 *   • Beat ② — si apre il DRAWER del modulo: il campo «Pagina» è GIÀ COMPILATO
 *     (`gmsolar.it/dashboard/contenuti` in font-mono) con badge «Rilevata in
 *     automatico ✓» — NESSUN copia/incolla. Il cursore (caret) digita SOLO la
 *     descrizione, preme «Invia segnalazione» → toast «Segnalazione ricevuta ✓»
 *     con badge stato «In lavorazione».
 *   • Beat ③ — IL FIX: il drawer si richiude, il badge di stato FLIPPA in 3D
 *     «In lavorazione» → «Risolta ✓» (pattern rotateY del Gestionale), la foto
 *     corretta SOSTITUISCE l'immagine rotta con un wipe (maskReveal) e compare
 *     il mini-toast «Fix pubblicato ✓».
 *
 *   Usa il kit condiviso `./shared`. CAMERA (P11 — shot-list della scena):
 *   punch (a) su «Segnala un problema» → pull-back+rack focus (e) sul modulo
 *   (dashboard `.imm-seg-bg` attenuata dietro il drawer) → lock (c) sul typing
 *   della descrizione → push-in lento (b) sulla card mentre l'immagine si
 *   sistema → pull-back reveal (f) + cameraReset finale (camera neutra a
 *   progress(1), regola 3).
 *   Reduced-motion (kit → tl.progress(1)): stato finale leggibile = modulo
 *   inviato (toast «Segnalazione ricevuta ✓») + difetto RISOLTO (immagine ok,
 *   badge «Risolta ✓», mini-toast «Fix pubblicato ✓»); drawer richiuso.
 */
import { Check, ImageOff, MessageSquareWarning } from "lucide-react";
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
  maskReveal,
  cameraTo,
  cameraReset,
  cameraFollow,
  rackFocus,
  rackFocusOff,
} from "./shared";

// ── Dati mock (deterministici) ───────────────────────────────────────────────

/** Voci sidebar — replica compatta della Dashboard (attiva: «Contenuti»). */
const NAV = ["Contenuti", "Prodotti", "Visite", "Ordini"] as const;

/** Pagine del sito (come nella scena Dashboard; la hero è quella difettosa). */
const PAGINE = [
  { nome: "Hero homepage", hero: true },
  { nome: "Chi siamo", hero: false },
  { nome: "Impianti realizzati", hero: false },
] as const;

/** URL rilevato IN AUTOMATICO dal modulo (il cliente non copia nulla). */
const PAGINA_RILEVATA = "gmsolar.it/dashboard/contenuti";

/** "Foto" corretta che sostituisce l'immagine rotta: lo stesso gradient della
 *  «impianto-2026.jpg» pubblicata nella scena Dashboard → continuità visiva. */
const GRAD_FOTO_FIX =
  "repeating-linear-gradient(-45deg, color-mix(in oklab, var(--accent) 12%, transparent) 0px, color-mix(in oklab, var(--accent) 12%, transparent) 3px, transparent 3px, transparent 12px), linear-gradient(135deg, color-mix(in oklab, var(--accent) 30%, transparent), color-mix(in oklab, var(--accent) 52%, transparent))";

// ── Componente ────────────────────────────────────────────────────────────────

export default function ImmersiveSegnalazioni() {
  const ref = useImmersiveScene((tl) => {
    // ── Stato iniziale ───────────────────────────────────────────────────────
    // Il difetto (immagine rotta) è visibile dal frame 0; la foto corretta
    // `.imm-img-fix` è coperta dal maskReveal (fromTo + immediateRender).
    // Drawer chiuso fuori campo a destra; toast nascosti; flip di stato pronto
    // («In lavorazione» in piano, «Risolta ✓» girata via a -90°).
    gsap.set(".imm-seg-drawer", { xPercent: 100 });
    gsap.set(".imm-seg-toast", { autoAlpha: 0, y: 48 });
    gsap.set(".imm-fix-toast", { autoAlpha: 0, y: -28 });
    gsap.set(".imm-seg-old", { transformPerspective: 400, transformOrigin: "50% 50%" });
    gsap.set(".imm-seg-new", {
      autoAlpha: 0,
      rotationY: -90,
      transformPerspective: 400,
      transformOrigin: "50% 50%",
    });

    // ── Beat ① — qualcosa non va: si segnala da dove si è ────────────────────
    say(tl, 0); // «Qualcosa non va? Lo segnali da dove sei.»
    // CAMERA · punch (a) sul bottone «Segnala un problema»: sostituisce il vecchio
    // clickZoom sul wrapper (regola 4: punch locale e punch di camera non si
    // sommano). Attacco rapido + micro-overshoot d'arrivo (back.out).
    cameraTo(tl, ".imm-report-wrap", { scale: 1.4, duration: 0.5, ease: "back.out(1.2)" });
    // Cursore per ULTIMO (regola 2): misura il layout a camera FERMA → atterra
    // preciso sul bottone inquadrato. pressButton (scale del solo bottone) resta:
    // è l'affordance del click, non un punch che si somma.
    cursorTo(tl, ".imm-report-btn", { mode: "hand" });
    tl.to({}, { duration: 0.2 });
    pressButton(tl, ".imm-report-btn", { down: 0.93, downDur: 0.1, upDur: 0.35, back: 2.6 });

    // ── Beat ② — il modulo: link auto-rilevato, si scrive solo la descrizione ─
    tl.to(".imm-seg-drawer", { xPercent: 0, duration: 0.9, ease: "expo.out" }, ">-0.05");
    // CAMERA · l'inquadratura ① si chiude (regola 3): pull-back a neutro in sync
    // con l'ingresso del drawer (tween a valori fissi → nessuna misura in corsa).
    cameraReset(tl, { position: "<" });
    // CAMERA · rack focus (e): la dashboard dietro (.imm-seg-bg — sidebar, topbar,
    // pannello; il drawer è un fratello e resta a fuoco) si attenua.
    rackFocus(tl, ".imm-seg-bg", { position: "<" });
    // Enfasi sul campo «Pagina» GIÀ compilato (nessun copia/incolla) — beat senza
    // camera: il punch locale è ammesso.
    clickZoom(tl, ".imm-seg-page", { position: ">0.1", scale: 1.06 });
    say(tl, 1); // «Il link della pagina si compila da solo.»

    // CAMERA · lock (c) sul typing: la camera si aggancia al campo descrizione…
    cameraFollow(tl, ".imm-seg-desc", { scale: 1.22 });
    // …e il cursore (caret) parte per ultimo, a camera ferma (regola 2); poi la
    // camera resta AGGANCIATA (nessun movimento) per tutta la digitazione.
    // Il vecchio clickZoom su .imm-zoom-form è rimosso (regola 4).
    cursorTo(tl, ".imm-seg-desc", { mode: "text" });
    typeInField(tl, ".imm-seg-desc", { steps: 35, duration: 1.3, position: ">0.15" });

    // «Invia segnalazione» → pressione + toast di ricezione con stato
    cursorTo(tl, ".imm-seg-send", { mode: "hand" });
    pressButton(tl, ".imm-seg-send", { downDur: 0.1, upDur: 0.45, back: 3.5, position: ">0.2" });
    // CAMERA · si stacca dal modulo: pull-back a neutro mentre sale il toast
    // (nasce in basso al centro → rientra in campo con la camera larga).
    cameraReset(tl, { duration: 0.7 });
    tl.to(".imm-seg-toast", { autoAlpha: 1, y: 0, duration: 0.55, ease: "expo.out" }, "<0.1");
    clickZoom(tl, ".imm-seg-toast", { position: "<0.14", scale: 1.05 });

    // ── Beat ③ — IL FIX: si torna alla dashboard e il difetto è risolto ───────
    tl.to(".imm-seg-drawer", { xPercent: 100, duration: 0.8, ease: "expo.inOut" }, ">0.25");
    // CAMERA · il rack focus si chiude col drawer: la dashboard torna a fuoco
    // (rackFocus/rackFocusOff bilanciati — regola 3).
    rackFocusOff(tl, ".imm-seg-bg", { position: "<" });
    // Il badge di stato flippa in 3D: «In lavorazione» gira via, «Risolta ✓» entra
    tl.to(".imm-seg-old", { rotationY: 90, autoAlpha: 0, duration: 0.3, ease: "power2.in" }, ">0.1");
    tl.to(
      ".imm-seg-new",
      { rotationY: 0, autoAlpha: 1, duration: 0.45, ease: "back.out(1.4)" },
      "<0.05",
    );
    // CAMERA · push-in (b) LENTO sulla card mentre l'immagine si sistema (parte a
    // layout fermo: drawer chiuso e fuoco ripristinato → misura esatta).
    // Sostituisce il vecchio clickZoom sulla card (regola 4).
    cameraTo(tl, ".imm-seg-card", {
      scale: 1.3,
      duration: 1,
      ease: "power1.inOut",
      position: ">0.1",
    });
    // La foto corretta copre l'immagine rotta con un wipe da sinistra, DENTRO il
    // push-in (clip-path: nessuna dipendenza dalle misure di camera).
    maskReveal(tl, ".imm-img-fix", { dir: "l", duration: 0.8, position: "<0.25" });
    // CAMERA · pull-back reveal (f) + reset FINALE (regola 3): da 1.3 a neutra per
    // svelare la dashboard riparata → a progress(1) la camera è neutra.
    cameraReset(tl, { duration: 0.9, position: ">0.2" });
    // Mini-toast di conferma mentre il campo si allarga (rientra in alto al centro)
    tl.to(
      ".imm-fix-toast",
      { autoAlpha: 1, y: 0, duration: 0.45, ease: "back.out(1.7)" },
      ">-0.35",
    );
    say(tl, 2); // «Il team riceve, sistema, e tu vedi il fix.»

    tl.to({}, { duration: 0.6 }); // hold finale
  });

  return (
    <ImmersiveStage
      ref={ref}
      heightVh={480}
      theme="platform"
      label="Segnalazioni"
      eyebrow="03 · Segnalazioni"
    >
      {/* ════ Schermata A · la dashboard (compatta) con il difetto ════ */}
      <div className="bg-background text-foreground flex h-full pt-10">
        {/* Sidebar compatta — replica della Dashboard, voce «Contenuti» attiva.
            `imm-seg-bg` = layer "dietro" del rack focus (P11): sidebar + topbar +
            pannello si attenuano quando il drawer è aperto; il drawer (fratello,
            z-20) resta a fuoco. */}
        <aside className="imm-seg-bg border-border bg-surface hidden w-44 shrink-0 border-r p-4 sm:block">
          <div className="text-foreground mb-6 flex items-center gap-2 px-2 font-semibold">
            <span className="bg-accent h-4 w-4 rounded-[5px]" />
            Dashboard
          </div>
          <nav className="space-y-1">
            {NAV.map((n, i) => (
              <div
                key={n}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                  i === 0 ? "bg-accent-soft text-foreground" : "text-muted"
                }`}
              >
                {n}
              </div>
            ))}
          </nav>
        </aside>

        {/* Area principale: topbar + pannello «Contenuti» + drawer segnalazione */}
        <div className="relative flex-1 overflow-hidden">
          {/* Topbar — con lo STESSO bottone «Segnala un problema» della Dashboard */}
          <div className="imm-seg-bg border-border bg-background/80 flex h-12 items-center gap-3 border-b px-5 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-muted text-xs font-semibold">3 siti connessi</span>
            <div className="ml-auto flex items-center gap-1.5">
              {/* Wrapper = target del punch di CAMERA (cameraTo, P11): pressButton
                  anima la scale del solo bottone, la camera inquadra il wrapper */}
              <span className="imm-report-wrap inline-flex">
                <button
                  className="imm-report-btn bg-accent-soft text-accent-ink flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                  tabIndex={-1}
                  aria-hidden
                >
                  <MessageSquareWarning className="h-3.5 w-3.5" aria-hidden />
                  Segnala un problema
                </button>
              </span>
            </div>
          </div>

          {/* Pannello «Contenuti» compatto: lista pagine + editor con il difetto */}
          <div className="imm-seg-bg h-[calc(100%-3rem)] overflow-hidden p-5">
            <div className="mx-auto max-w-4xl">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-foreground font-semibold">Contenuti del sito</p>
                {/* Breadcrumb = la stessa pagina che il modulo rileva in automatico */}
                <span className="text-muted font-mono text-xs">{PAGINA_RILEVATA}</span>
              </div>

              <div className="grid grid-cols-[220px_minmax(0,1fr)] items-start gap-4">
                {/* Colonna sinistra: pagine del sito (come nella Dashboard) */}
                <div className="border-border bg-surface rounded-xl border shadow-sm">
                  <p className="text-muted border-border border-b px-3 py-2 text-[11px] font-semibold tracking-wider uppercase">
                    Pagine del sito
                  </p>
                  <div className="space-y-1 p-2">
                    {PAGINE.map(({ nome, hero }) => (
                      <div
                        key={nome}
                        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 ${
                          hero ? "bg-accent-soft" : ""
                        }`}
                      >
                        <span
                          className="bg-surface-2 border-border h-8 w-11 shrink-0 rounded-md border"
                          aria-hidden
                        />
                        <span className="min-w-0 flex-1">
                          <span className="text-foreground block truncate text-xs font-semibold">
                            {nome}
                          </span>
                          <span className="mt-0.5 inline-block rounded-full bg-emerald-100 px-1.5 py-px text-[9px] font-semibold text-emerald-700">
                            Pubblicata
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Colonna destra: editor «Hero homepage» — il DIFETTO è qui */}
                <div className="imm-seg-card border-border bg-surface relative rounded-xl border p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-foreground text-sm font-semibold">Hero homepage</p>
                    <span className="text-muted text-[11px]">Ultima modifica: oggi</span>
                  </div>

                  <div className="grid grid-cols-[260px_minmax(0,1fr)] gap-4">
                    {/* Immagine ROTTA sotto; la foto corretta sopra, scoperta dal
                        wipe (maskReveal) nel beat del fix */}
                    <div className="relative h-32 overflow-hidden rounded-lg">
                      <div
                        className="border-border bg-surface-2 absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed"
                        aria-hidden
                      >
                        <ImageOff className="text-muted h-6 w-6" aria-hidden />
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                          Immagine non trovata
                        </span>
                      </div>
                      <div
                        className="imm-img-fix absolute inset-0"
                        style={{ background: GRAD_FOTO_FIX }}
                        aria-hidden
                      >
                        <div className="flex h-full items-center justify-center">
                          <span className="bg-background/85 text-foreground rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm">
                            impianto-2026.jpg
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Campi già compilati (stato post-Dashboard: titolo «azienda») */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-muted mb-1 block text-[11px] font-semibold tracking-wider uppercase">
                          Titolo
                        </label>
                        <div className="border-border bg-surface-2 text-foreground rounded-lg border px-3 py-2 text-sm">
                          Energia solare per la tua azienda
                        </div>
                      </div>
                      <div>
                        <label className="text-muted mb-1 block text-[11px] font-semibold tracking-wider uppercase">
                          Descrizione
                        </label>
                        <div className="border-border bg-surface-2 text-muted min-h-[52px] rounded-lg border px-3 py-2 text-sm">
                          Impianti fotovoltaici e ricarica EV chiavi in mano, dal
                          sopralluogo all&apos;allaccio.
                        </div>
                      </div>
                      <div className="pt-1">
                        <span className="text-muted text-[11px]">
                          Stato: <span className="font-semibold">Pubblicata</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ════ Drawer · modulo di segnalazione (entra da destra) ════ */}
          <aside
            className="imm-seg-drawer border-border bg-surface absolute inset-y-0 right-0 z-20 w-[400px] border-l shadow-2xl"
            aria-hidden
          >
            <div className="imm-zoom-form flex h-full flex-col">
              <div className="border-border border-b px-6 py-4">
                <h2 className="text-foreground font-semibold tracking-tight">
                  Segnala un problema
                </h2>
                <p className="text-muted mt-0.5 text-sm">
                  La pagina è già allegata: descrivi cosa non va
                </p>
              </div>

              <div className="flex flex-1 flex-col gap-5 p-6">
                {/* Campo «Pagina» — GIÀ COMPILATO: link rilevato in automatico */}
                <div className="space-y-2">
                  <label className="text-muted text-xs font-semibold tracking-widest uppercase">
                    Pagina
                  </label>
                  <div className="imm-seg-page border-border bg-surface-2 flex h-10 items-center gap-2 rounded-lg border px-3">
                    <span className="text-foreground truncate font-mono text-xs">
                      {PAGINA_RILEVATA}
                    </span>
                    <span className="bg-accent-soft text-accent-ink ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                      Rilevata in automatico ✓
                    </span>
                  </div>
                </div>

                {/* Campo «Descrizione» — l'unica cosa che il cliente scrive */}
                <div className="space-y-2">
                  <label className="text-muted text-xs font-semibold tracking-widest uppercase">
                    Descrizione
                  </label>
                  <div className="border-border bg-surface min-h-20 overflow-hidden rounded-lg border px-3 py-2.5 text-sm">
                    <span className="imm-seg-desc text-foreground block font-medium whitespace-nowrap">
                      L&apos;immagine della hero non si carica
                    </span>
                  </div>
                </div>

                {/* Invio */}
                <button
                  type="button"
                  className="imm-seg-send bg-accent text-accent-contrast mt-auto self-start rounded-lg px-5 py-2 text-sm font-semibold"
                  tabIndex={-1}
                >
                  Invia segnalazione
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Toast globali (fuori dall'app: non vengono clippati dal drawer) ── */}

      {/* «Segnalazione ricevuta ✓» + badge stato con FLIP «In lavorazione» → «Risolta ✓» */}
      <div
        className="imm-seg-toast border-border bg-surface pointer-events-none absolute bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border px-5 py-3 shadow-lg"
        aria-live="polite"
        style={{ opacity: 0 }}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100">
          <Check className="h-4 w-4 text-emerald-600" aria-hidden />
        </span>
        <div>
          <p className="text-foreground text-sm font-semibold">Segnalazione ricevuta ✓</p>
          <p className="text-muted text-xs">Hero homepage · {PAGINA_RILEVATA}</p>
        </div>
        {/* I due stati occupano la stessa cella (grid) → il flip 3D gira sul posto */}
        <span className="ml-1 inline-grid shrink-0">
          <span className="imm-seg-old col-start-1 row-start-1 rounded-full bg-amber-100 px-2.5 py-1 text-center text-[11px] font-semibold text-amber-700">
            In lavorazione
          </span>
          <span className="imm-seg-new col-start-1 row-start-1 rounded-full bg-emerald-100 px-2.5 py-1 text-center text-[11px] font-semibold text-emerald-700">
            Risolta ✓
          </span>
        </span>
      </div>

      {/* Mini-toast «Fix pubblicato ✓» (conferma visiva del beat finale) */}
      <div
        className="imm-fix-toast border-border bg-surface pointer-events-none absolute top-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border px-4 py-2 shadow-lg"
        aria-live="polite"
        style={{ opacity: 0 }}
      >
        <Check className="h-4 w-4 text-emerald-600" aria-hidden />
        <p className="text-foreground text-sm font-semibold">Fix pubblicato ✓</p>
      </div>

      {/* Frasi-intermezzo DESCRITTIVE (spiegano, non vendono) */}
      <Say i={0}>Qualcosa non va? Lo segnali da dove sei.</Say>
      <Say i={1} variant="caption">
        Il link della pagina si compila da solo.
      </Say>
      <Say i={2} variant="caption">
        Il team riceve, sistema, e tu vedi il fix.
      </Say>
    </ImmersiveStage>
  );
}
