"use client";

/**
 * @descrizione  Scena immersiva SEGNALAZIONI (capitolo 04) — viene SUBITO dopo
 *   la Dashboard e ne riparte: l'app è la STESSA dashboard compatta (sidebar
 *   con la voce in più «Segnalazioni», topbar con il bottone «Segnala un
 *   problema» — identico della scena precedente). L'area principale è un TRACK
 *   orizzontale a 2 pannelli: «Contenuti» (con un DIFETTO mock: nella card
 *   «Hero homepage» l'immagine è ROTTA) e «Segnalazioni» (l'ELENCO dei ticket).
 *
 *   • Beat ① — title card di capitolo «Segnalazioni» (ChapterCard + chapterIntro,
 *     P12) con sottotitolo «Qualcosa non va? Lo segnali da dove sei.» Poi il
 *     cursore (mano) preme «Segnala un problema» (punch di camera + pressButton).
 *   • Beat ② — si apre il DRAWER del modulo: il campo «Pagina» è GIÀ COMPILATO
 *     (`gmsolar.it/dashboard/contenuti` in font-mono) con badge «Rilevata in
 *     automatico ✓» — NESSUN copia/incolla. Il cursore (caret) digita SOLO la
 *     descrizione, preme «Invia segnalazione».
 *   • Beat ②½ — LA LISTA: il drawer si richiude e il track SCORRE alla vista
 *     «Segnalazioni» (l'indicatore di sidebar passa a quella voce). È un elenco
 *     di ticket con lo STATO a colori: la maggior parte già «Risolta» (verde),
 *     una «In lavorazione» (azzurro). In cima ENTRA la segnalazione appena
 *     inviata, con badge «In elaborazione» (ambra) che pulsa. Caption.
 *   • Beat ③ — IL FIX: sulla riga nuova il badge FLIPPA in 3D da «In
 *     elaborazione» (ambra) a «Risolta ✓» (verde) e la sua mini-anteprima si
 *     ripara con un wipe (l'immagine rotta → la foto corretta); compare il
 *     mini-toast «Fix pubblicato ✓».
 *
 *   Usa il kit condiviso `./shared`. CAMERA (P11 — shot-list della scena):
 *   punch (a) su «Segnala un problema» → pull-back + rack focus (e) sul modulo
 *   (dashboard `.imm-seg-bg` attenuata dietro il drawer) → track del caret (4)
 *   sul typing della descrizione → cameraReset. Lo scorrimento del track e il
 *   fix vivono su tween DIRETTI (nessuna misura di camera su figli del track,
 *   che trasla — regola 2). Camera neutra a progress(1) (regola 3).
 *   Reduced-motion (kit → tl.progress(1)): stato finale leggibile = vista
 *   «Segnalazioni» aperta, la segnalazione nuova con badge «Risolta ✓» e
 *   anteprima riparata, mini-toast «Fix pubblicato ✓»; drawer richiuso. La
 *   ChapterCard a progress(1) è nascosta → heading statico in cima.
 */
import { Check, ImageOff, MessageSquareWarning } from "lucide-react";
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
  typeInField,
  maskReveal,
  cameraTo,
  cameraReset,
  cameraTrackType,
  rackFocus,
  rackFocusOff,
  EASE_IN_SCENE,
  EASE_OUT_SCENE,
  EASE_SNAP,
  EASE_CAMERA,
  DUR,
  hold,
  enter,
} from "./shared";

// ── Dati mock (deterministici) ───────────────────────────────────────────────

/** Voci sidebar — replica della Dashboard + la voce «Segnalazioni» di questa
 *  scena (l'indicatore parte su «Contenuti» e passa a «Segnalazioni»). */
const NAV = ["Contenuti", "Prodotti", "Visite", "Ordini", "Segnalazioni"] as const;

/** Pagine del sito (come nella scena Dashboard; la hero è quella difettosa). */
const PAGINE = [
  { nome: "Hero homepage", hero: true },
  { nome: "Chi siamo", hero: false },
  { nome: "Impianti realizzati", hero: false },
] as const;

/** URL rilevato IN AUTOMATICO dal modulo (il cliente non copia nulla). */
const PAGINA_RILEVATA = "gmsolar.it/dashboard/contenuti";

/** Foto corretta che sostituisce l'immagine rotta: la STESSA foto che la scena
 *  Dashboard pubblica come «impianto-2026.jpg» → continuità visiva. */
const FOTO_FIX = "/assets/products/pannello-01.jpg";

/** Classi badge/dot per stato ticket. Verde = Risolta, azzurro = In lavorazione
 *  (presa in carico dal team), ambra = In elaborazione (quella appena inviata).
 *  Colori-convenzione di stato, non brand (cfr. DEBITO-TECNICO #17). */
const STATO_CLS: Record<string, { badge: string; dot: string }> = {
  Risolta: { badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  "In lavorazione": { badge: "bg-sky-100 text-sky-700", dot: "bg-sky-500" },
  "In elaborazione": { badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
};

/** Elenco segnalazioni GIÀ presenti: la maggioranza risolte, una in lavorazione.
 *  Sono problemi di sito eterogenei (non tutti d'immagine) → la riga nuova
 *  «Immagine hero non si carica» è l'unica con l'anteprima che si ripara. */
const SEGNALAZIONI: ReadonlyArray<{
  oggetto: string;
  pagina: string;
  data: string;
  stato: string;
}> = [
  {
    oggetto: "Modulo contatti non invia",
    pagina: "gmsolar.it/contatti",
    data: "10/07",
    stato: "Risolta",
  },
  {
    oggetto: "Link «Preventivo» rotto",
    pagina: "gmsolar.it/servizi",
    data: "08/07",
    stato: "Risolta",
  },
  {
    oggetto: "Lentezza nella gallery",
    pagina: "gmsolar.it/gallery",
    data: "05/07",
    stato: "In lavorazione",
  },
  {
    oggetto: "Errore 404 su una scheda",
    pagina: "gmsolar.it/impianti",
    data: "02/07",
    stato: "Risolta",
  },
  {
    oggetto: "Testo tagliato su mobile",
    pagina: "gmsolar.it/chi-siamo",
    data: "28/06",
    stato: "Risolta",
  },
];

// ── Componente ────────────────────────────────────────────────────────────────

export default function ImmersiveSegnalazioni() {
  // Reduced-motion: la ChapterCard finisce nascosta (progress(1)) → il numero di
  // capitolo va reso da un heading STATICO in cima alla scena.
  const reduced = useReducedMotion();
  const ref = useImmersiveScene((tl) => {
    // ── Stato iniziale ───────────────────────────────────────────────────────
    // Drawer chiuso fuori campo a destra; track sulla vista «Contenuti»
    // (indicatore su «Contenuti», non su «Segnalazioni»); ticket nuovo nascosto;
    // badge stato pronto al flip (ambra in piano, verde a -90°); toast nascosti.
    // La foto corretta `.imm-img-fix` è coperta dal maskReveal (fromTo).
    gsap.set(".imm-seg-drawer", { xPercent: 100 });
    gsap.set(".imm-seg-track", { xPercent: 0 });
    gsap.set(".imm-nav-hl-seg", { autoAlpha: 0 });
    gsap.set(".imm-newticket", { autoAlpha: 0, y: 16 });
    gsap.set(".imm-fix-toast", { autoAlpha: 0, y: -28 });
    gsap.set(".imm-badge-old", { transformPerspective: 400, transformOrigin: "50% 50%" });
    gsap.set(".imm-badge-new", {
      autoAlpha: 0,
      rotationY: -90,
      transformPerspective: 400,
      transformOrigin: "50% 50%",
    });

    // ── Beat ① — title card «Segnalazioni» (P12), poi il click ───────────────
    // PRIMO beat della scena (prima di ogni movimento di camera): la card entra,
    // presenta il capitolo col sottotitolo e esce → a progress(1) è nascosta.
    chapterIntro(tl);
    // CAMERA · punch (a) sul bottone «Segnala un problema» (regola 4: punch di
    // camera e non un clickZoom locale sommato). Attacco rapido, ease del kit.
    cameraTo(tl, ".imm-report-wrap", { scale: 1.4, duration: DUR.beat });
    // Cursore per ULTIMO (regola 2): misura il layout a camera FERMA.
    cursorTo(tl, ".imm-report-btn", { mode: "hand" });
    tl.to({}, { duration: DUR.micro / 2 });
    pressButton(tl, ".imm-report-btn", { down: 0.93, upDur: DUR.micro });

    // ── Beat ② — il modulo: link auto-rilevato, si scrive solo la descrizione ─
    tl.to(".imm-seg-drawer", { xPercent: 0, duration: DUR.scene, ease: EASE_IN_SCENE }, ">-0.05");
    // CAMERA · l'inquadratura ① si chiude (regola 3): pull-back a neutro in sync
    // con l'ingresso del drawer (valori fissi → nessuna misura in corsa).
    cameraReset(tl, { position: "<" });
    // CAMERA · rack focus (e): la dashboard dietro (.imm-seg-bg) si attenua; il
    // drawer è un fratello e resta a fuoco.
    rackFocus(tl, ".imm-seg-bg", { position: "<" });
    // Enfasi sul campo «Pagina» GIÀ compilato (nessun copia/incolla) — punch
    // LOCALE ammesso (beat senza camera).
    clickZoom(tl, ".imm-seg-page", { position: ">0.1", scale: 1.06 });
    say(tl, 1); // «Il link della pagina si compila da solo.»

    // CAMERA · track del caret (item 4): la camera TRASLA seguendo il punto di
    // scrittura per tutta la digitazione (cameraTrackType); il caret resta al
    // centro-schermo → niente cursorTo(campo) dedicato.
    cameraTrackType(tl, ".imm-seg-desc", { scale: 1.22, duration: DUR.scene * 2 });
    typeInField(tl, ".imm-seg-desc", { steps: 35, duration: DUR.scene * 2, position: "<" });

    // «Invia segnalazione» → pressione. Il cursore (fuori da .imm-camera) sfuma
    // qui: da ora solo movimenti di sola camera / tween diretti (scrub-safe, a
    // progress(1) autoAlpha 0 come le scene sorelle).
    cursorTo(tl, ".imm-seg-send", { mode: "hand" });
    pressButton(tl, ".imm-seg-send", { position: ">0.2" });
    hideCursor(tl, { duration: DUR.micro });

    // ── Beat ②½ — LA LISTA: drawer chiuso, il track scorre a «Segnalazioni» ───
    tl.to(".imm-seg-drawer", { xPercent: 100, duration: DUR.scene, ease: EASE_CAMERA }, ">0.1");
    // La dashboard torna a fuoco e la camera è neutra prima dello scorrimento
    // (rackFocus/off bilanciati — regola 3).
    rackFocusOff(tl, ".imm-seg-bg", { position: "<" });
    cameraReset(tl, { position: "<" });
    // SCORRIMENTO del track (tween diretto, non camera: il track è ciò che
    // trasla, i suoi figli non vanno misurati dalla camera) → vista «Segnalazioni».
    tl.to(".imm-seg-track", { xPercent: -50, duration: DUR.scene, ease: EASE_CAMERA }, ">-0.3");
    // L'indicatore di sidebar passa da «Contenuti» a «Segnalazioni» (crossfade).
    tl.to(".imm-nav-hl-cont", { autoAlpha: 0, duration: DUR.beat, ease: EASE_OUT_SCENE }, "<");
    tl.to(".imm-nav-hl-seg", { autoAlpha: 1, duration: DUR.beat, ease: EASE_IN_SCENE }, "<");
    // La segnalazione appena inviata ENTRA in cima alla lista (anticipazione R2).
    enter(tl, ".imm-newticket", { y: 16, duration: DUR.beat, anticipate: true, position: ">-0.1" });
    // Il badge «In elaborazione» (ambra) pulsa: la richiesta è in corso.
    tl.to(".imm-badge-old", { scale: 1.12, duration: DUR.micro, ease: EASE_SNAP }, ">");
    tl.to(".imm-badge-old", { scale: 1, duration: DUR.micro, ease: EASE_IN_SCENE }, ">");
    hold(tl); // si legge la lista e lo stato "in elaborazione"
    say(tl, 2); // «Entra nell'elenco, insieme alle altre: la maggior parte già risolte.»

    // ── Beat ③ — IL FIX: il badge della riga nuova flippa ambra → verde ───────
    // Il badge «In elaborazione» gira via e «Risolta ✓» entra (flip 3D rotateY,
    // pattern del Gestionale riusato solo qui).
    tl.to(
      ".imm-badge-old",
      { rotationY: 90, autoAlpha: 0, duration: DUR.micro, ease: EASE_OUT_SCENE },
      ">0.3",
    );
    tl.to(
      ".imm-badge-new",
      { rotationY: 0, autoAlpha: 1, duration: DUR.beat, ease: EASE_SNAP },
      "<0.05",
    );
    // La mini-anteprima della riga si RIPARA: l'immagine rotta è coperta dalla
    // foto corretta con un wipe da sinistra (stesso maskReveal della hero).
    maskReveal(tl, ".imm-img-fix", { dir: "l", duration: DUR.beat, position: "<0.1" });
    // Mini-toast di conferma (rientra dall'alto al centro).
    tl.to(".imm-fix-toast", { autoAlpha: 1, y: 0, duration: DUR.beat, ease: EASE_SNAP }, ">0.1");

    hold(tl); // hold finale
  });

  return (
    <ImmersiveStage ref={ref} heightVh={640} label={CHAPTERS[3].title} chapterIndex={3}>
      {/* Reduced-motion: heading statico di capitolo (la ChapterCard animata a
          progress(1) è nascosta) — nella fascia alta libera sopra il device frame. */}
      {reduced ? (
        <h2 className="text-muted absolute top-3 left-1/2 z-40 -translate-x-1/2 font-mono text-xs font-semibold tracking-[0.35em] uppercase">
          {CHAPTERS[3].title}
        </h2>
      ) : null}

      {/* ════ App (dashboard compatta): sidebar + area con track a 2 viste ════
          Device frame (R3, regola 1): l'app vive in una "finestra" centrata con
          proporzioni da laptop (16:10, max-w-6xl). I toast restano FUORI dal
          frame (notifiche a livello schermo). */}
      <div className="flex h-full items-center justify-center px-16 py-12">
        <div className="border-border bg-background text-foreground flex aspect-[16/10] w-full max-w-6xl overflow-hidden rounded-2xl border shadow-2xl">
          {/* Sidebar — replica della Dashboard + voce «Segnalazioni». L'indicatore
              (bg-accent-soft) è un overlay che crossfade da «Contenuti» a
              «Segnalazioni». `imm-seg-bg` = layer "dietro" del rack focus. */}
          <aside className="imm-seg-bg border-border bg-surface hidden w-44 shrink-0 border-r p-4 sm:block">
            <div className="text-foreground mb-6 flex items-center gap-2 px-2 font-semibold">
              <span className="bg-accent h-4 w-4 rounded-[5px]" />
              Dashboard
            </div>
            <nav className="space-y-1">
              {NAV.map((n, i) => (
                <div key={n} className="relative rounded-lg px-3 py-2.5 text-sm font-medium">
                  {/* Indicatore voce attiva: «Contenuti» acceso all'inizio,
                      «Segnalazioni» al termine dello scorrimento (crossfade). */}
                  {i === 0 && (
                    <span
                      className="imm-nav-hl-cont bg-accent-soft absolute inset-0 rounded-lg"
                      aria-hidden
                    />
                  )}
                  {i === 4 && (
                    <span
                      className="imm-nav-hl-seg bg-accent-soft absolute inset-0 rounded-lg"
                      aria-hidden
                    />
                  )}
                  <span
                    className={`relative ${i === 0 || i === 4 ? "text-foreground" : "text-muted"}`}
                  >
                    {n}
                  </span>
                </div>
              ))}
            </nav>
          </aside>

          {/* Area principale: topbar (persistente) + track a 2 viste + drawer */}
          <div className="relative flex-1 overflow-hidden">
            {/* Topbar — con lo STESSO bottone «Segnala un problema» della Dashboard */}
            <div className="imm-seg-bg border-border bg-background/80 flex h-12 items-center gap-3 border-b px-5 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-muted text-xs font-semibold">3 siti connessi</span>
              <div className="ml-auto flex items-center gap-1.5">
                {/* Wrapper = target del punch di CAMERA (cameraTo, P11) */}
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

            {/* TRACK orizzontale a 2 viste (largo 200%): «Contenuti» → «Segnalazioni».
                Lo scorrimento (xPercent -50) è un tween diretto (beat ②½). */}
            <div className="imm-seg-track flex h-[calc(100%-3rem)] w-[200%]">
              {/* ═══ Vista 1 · CONTENUTI (con il difetto: hero senza immagine) ═══ */}
              <div className="imm-seg-bg w-1/2 shrink-0 overflow-hidden p-5">
                <div className="mx-auto max-w-4xl">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-foreground font-semibold">Contenuti del sito</p>
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
                              <span className="mt-0.5 inline-block rounded-full bg-emerald-100 px-1.5 py-px text-[11px] font-semibold text-emerald-700">
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
                        {/* Immagine ROTTA: placeholder puro (nessuna foto dietro).
                            Aspect 16/9 esplicito (R3, regola 3). */}
                        <div className="relative aspect-video overflow-hidden rounded-lg">
                          <div
                            className="bg-surface-2 absolute inset-0 flex flex-col items-center justify-center gap-1.5"
                            aria-hidden
                          >
                            <ImageOff className="text-muted h-6 w-6" aria-hidden />
                            <span className="text-muted text-[11px] font-semibold">
                              Immagine non disponibile
                            </span>
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
                              Impianti fotovoltaici e ricarica EV chiavi in mano, dal sopralluogo
                              all&apos;allaccio.
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

              {/* ═══ Vista 2 · SEGNALAZIONI (l'elenco dei ticket, stati a colori) ═══ */}
              <div className="w-1/2 shrink-0 overflow-hidden p-5">
                <div className="mx-auto max-w-4xl">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-foreground font-semibold">Segnalazioni</p>
                    <span className="text-muted text-xs">
                      {SEGNALAZIONI.length + 1} totali · 1 in elaborazione
                    </span>
                  </div>

                  <div className="border-border bg-surface overflow-hidden rounded-xl border shadow-sm">
                    {/* Intestazione tabella */}
                    <div className="bg-surface-2 text-muted grid grid-cols-[2.25rem_minmax(0,1fr)_4rem_7rem] items-center gap-3 px-4 py-2 text-[11px] font-semibold tracking-wider uppercase">
                      <span />
                      <span>Oggetto</span>
                      <span>Data</span>
                      <span>Stato</span>
                    </div>

                    <div className="divide-border divide-y">
                      {/* Riga NUOVA (in cima): entra nel beat ②½, badge «In
                          elaborazione» (ambra) → «Risolta ✓» (verde) nel beat ③;
                          la mini-anteprima si ripara col wipe. */}
                      <div className="imm-newticket bg-accent/5 grid grid-cols-[2.25rem_minmax(0,1fr)_4rem_7rem] items-center gap-3 px-4 py-2.5">
                        {/* Anteprima: rotta (placeholder) + foto corretta coperta dal wipe */}
                        <span className="relative block aspect-square w-8 overflow-hidden rounded-md">
                          <span
                            className="bg-surface-2 absolute inset-0 flex items-center justify-center"
                            aria-hidden
                          >
                            <ImageOff className="text-muted h-3.5 w-3.5" aria-hidden />
                          </span>
                          <span className="imm-img-fix absolute inset-0" aria-hidden>
                            <img
                              src={FOTO_FIX}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover"
                            />
                          </span>
                        </span>
                        <span className="min-w-0">
                          <span className="text-foreground block truncate text-sm font-semibold">
                            Immagine hero non si carica
                          </span>
                          <span className="text-muted block truncate font-mono text-[11px]">
                            {PAGINA_RILEVATA}
                          </span>
                        </span>
                        <span className="text-muted font-mono text-xs">Oggi</span>
                        {/* Badge stato: flip 3D ambra → verde (gli stati occupano
                            la stessa cella grid: la rotazione gira sul posto). */}
                        <span className="relative inline-grid justify-items-start">
                          <span
                            className={`imm-badge-old col-start-1 row-start-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATO_CLS["In elaborazione"].badge}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${STATO_CLS["In elaborazione"].dot}`}
                              aria-hidden
                            />
                            In elaborazione
                          </span>
                          <span
                            className={`imm-badge-new col-start-1 row-start-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATO_CLS["Risolta"].badge}`}
                          >
                            <Check className="h-3 w-3" aria-hidden />
                            Risolta
                          </span>
                        </span>
                      </div>

                      {/* Righe GIÀ presenti: maggioranza «Risolta» (verde), una
                          «In lavorazione» (azzurro). */}
                      {SEGNALAZIONI.map((s) => {
                        const cls = STATO_CLS[s.stato] ?? STATO_CLS["In lavorazione"];
                        return (
                          <div
                            key={s.oggetto}
                            className="grid grid-cols-[2.25rem_minmax(0,1fr)_4rem_7rem] items-center gap-3 px-4 py-2.5"
                          >
                            {/* Colonna anteprima: icona di stato (non-immagine) */}
                            <span
                              className={`flex h-8 w-8 items-center justify-center rounded-md ${cls.badge}`}
                              aria-hidden
                            >
                              {s.stato === "Risolta" ? (
                                <Check className="h-4 w-4" aria-hidden />
                              ) : (
                                <MessageSquareWarning className="h-4 w-4" aria-hidden />
                              )}
                            </span>
                            <span className="min-w-0">
                              <span className="text-foreground block truncate text-sm font-medium">
                                {s.oggetto}
                              </span>
                              <span className="text-muted block truncate font-mono text-[11px]">
                                {s.pagina}
                              </span>
                            </span>
                            <span className="text-muted font-mono text-xs">{s.data}</span>
                            <span
                              className={`inline-flex items-center gap-1.5 justify-self-start rounded-full px-2.5 py-1 text-[11px] font-semibold ${cls.badge}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${cls.dot}`} aria-hidden />
                              {s.stato}
                            </span>
                          </div>
                        );
                      })}
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
                      <span className="bg-accent-soft text-accent-ink ml-auto shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold">
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

      {/* Title card di capitolo (P12) — apre la scena al posto della vecchia veil */}
      <ChapterCard chapter={CHAPTERS[3]} subtitle="Qualcosa non va? Lo segnali da dove sei." />

      {/* Frasi-intermezzo DESCRITTIVE (spiegano, non vendono) */}
      <Say i={1} variant="caption">
        Il link della pagina si compila da solo.
      </Say>
      <Say i={2} variant="caption">
        Entra nell&apos;elenco con tutte le altre: la maggior parte già risolte.
      </Say>
    </ImmersiveStage>
  );
}
