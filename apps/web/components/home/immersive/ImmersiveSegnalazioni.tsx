"use client";

/**
 * @descrizione  Scena immersiva SEGNALAZIONI (capitolo 05) — viene SUBITO dopo
 *   la Dashboard e ne riparte: Schermata A = la STESSA dashboard in versione
 *   compatta (sidebar, topbar con il bottone «Segnala un problema» — identico
 *   `imm-report-btn` della scena precedente) ma con un DIFETTO mock visibile:
 *   nella card «Hero homepage» l'immagine è ROTTA (foto reale «non caricata»:
 *   grayscale + velo + chip «Immagine non disponibile») — lo speculare
 *   della card pubblicata con «impianto-2026.jpg» nella scena Dashboard.
 *
 *   • Beat ① — title card di capitolo «04 · Segnalazioni» (ChapterCard +
 *     chapterIntro, P12 — sostituisce la vecchia veil) con sottotitolo
 *     «Qualcosa non va? Lo segnali da dove sei.» Poi il cursore (mano) preme
 *     «Segnala un problema» (punch di camera + pressButton).
 *   • Beat ② — si apre il DRAWER del modulo: il campo «Pagina» è GIÀ COMPILATO
 *     (`gmsolar.it/dashboard/contenuti` in font-mono) con badge «Rilevata in
 *     automatico ✓» — NESSUN copia/incolla. Il cursore (caret) digita SOLO la
 *     descrizione, preme «Invia segnalazione» → toast «Segnalazione ricevuta ✓»
 *     con timeline di stato a 3 tappe (Ricevuta ✓ → In lavorazione → Risolta).
 *   • Beat ②½ — PRESA IN CARICO (neutra, di servizio: nessuna persona in
 *     scena): la tappa 1→2 del binario si accende (linea che si riempie con
 *     `maskReveal`, come il wipe della foto), il dot «In lavorazione» pulsa,
 *     hold di lettura + caption. Chiude il vuoto tra «form inviato» e «fix
 *     pronto»: si VEDE che la richiesta è stata presa in carico.
 *   • Beat ③ — IL FIX: il drawer si richiude, la tappa 2→3 del binario si
 *     accende e il dot finale FLIPPA in 3D da «in attesa» a «Risolta ✓»
 *     (pattern rotateY del Gestionale, riusato solo per l'ultima tappa), la
 *     foto corretta SOSTITUISCE l'immagine rotta con un wipe (maskReveal) e
 *     compare il mini-toast «Fix pubblicato ✓».
 *
 *   Usa il kit condiviso `./shared`. CAMERA (P11 — shot-list della scena):
 *   punch (a) su «Segnala un problema» → pull-back+rack focus (e) sul modulo
 *   (dashboard `.imm-seg-bg` attenuata dietro il drawer) → lock (c) sul typing
 *   della descrizione → push-in lento (b) sulla card mentre l'immagine si
 *   sistema → pull-back reveal (f) + cameraReset finale (camera neutra a
 *   progress(1), regola 3).
 *   Reduced-motion (kit → tl.progress(1)): stato finale leggibile = modulo
 *   inviato (toast «Segnalazione ricevuta ✓»), timeline di stato tutta accesa
 *   su «Risolta ✓», mini-toast «Fix pubblicato ✓»; drawer richiuso. La
 *   ChapterCard a progress(1) è nascosta → heading statico «04 · Segnalazioni»
 *   in cima come titolo di capitolo.
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

/** Foto corretta che sostituisce l'immagine rotta: la STESSA foto che la scena
 *  Dashboard pubblica come «impianto-2026.jpg» → continuità visiva. */
const FOTO_FIX = "/assets/products/pannello-01.jpg";

// ── Componente ────────────────────────────────────────────────────────────────

export default function ImmersiveSegnalazioni() {
  // Reduced-motion: la ChapterCard finisce nascosta (progress(1)) → il numero di
  // capitolo va reso da un heading STATICO in cima alla scena.
  const reduced = useReducedMotion();
  const ref = useImmersiveScene((tl) => {
    // ── Stato iniziale ───────────────────────────────────────────────────────
    // Il difetto (immagine rotta) è visibile dal frame 0; la foto corretta
    // `.imm-img-fix` è coperta dal maskReveal (fromTo + immediateRender).
    // Drawer chiuso fuori campo a destra; toast nascosti; il dot finale della
    // timeline è pronto al flip (pending in piano, check a -90°).
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

    // ── Beat ① — title card «04 · Segnalazioni» (P12), poi il click ──────────
    // PRIMO beat della scena (prima di ogni movimento di camera): la card entra,
    // presenta il capitolo col sottotitolo e esce → a progress(1) è nascosta.
    chapterIntro(tl);
    // CAMERA · punch (a) sul bottone «Segnala un problema»: sostituisce il vecchio
    // clickZoom sul wrapper (regola 4: punch locale e punch di camera non si
    // sommano). Attacco rapido, ease di camera del kit (R2: la camera non fa back).
    cameraTo(tl, ".imm-report-wrap", { scale: 1.4, duration: DUR.beat });
    // Cursore per ULTIMO (regola 2): misura il layout a camera FERMA → atterra
    // preciso sul bottone inquadrato. pressButton (scale del solo bottone) resta:
    // è l'affordance del click, non un punch che si somma.
    cursorTo(tl, ".imm-report-btn", { mode: "hand" });
    tl.to({}, { duration: DUR.micro / 2 });
    pressButton(tl, ".imm-report-btn", { down: 0.93, upDur: DUR.micro });

    // ── Beat ② — il modulo: link auto-rilevato, si scrive solo la descrizione ─
    tl.to(".imm-seg-drawer", { xPercent: 0, duration: DUR.scene, ease: EASE_IN_SCENE }, ">-0.05");
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

    // CAMERA · track del caret (item 4): invece di agganciarsi FERMA al campo, la
    // camera TRASLA a dx seguendo il punto di scrittura per tutta la digitazione
    // (cameraTrackType sostituisce cameraFollow, regola 4). Il caret finto resta al
    // centro-schermo = punto di scrittura; niente cursorTo(campo) dedicato.
    cameraTrackType(tl, ".imm-seg-desc", { scale: 1.22, duration: DUR.scene * 2 });
    typeInField(tl, ".imm-seg-desc", { steps: 35, duration: DUR.scene * 2, position: "<" });

    // «Invia segnalazione» → pressione + toast di ricezione con stato
    cursorTo(tl, ".imm-seg-send", { mode: "hand" });
    pressButton(tl, ".imm-seg-send", { position: ">0.2" });
    // ULTIMA interazione della scena: il cursore (fuori da .imm-camera) sfuma qui,
    // così non resta "staccato/galleggiante" durante i movimenti di sola camera che
    // seguono (pull-back del toast, push-in sul fix, cameraReset finale) né congelato
    // a fine scena. Scrub-safe (reversibile) e a progress(1) → autoAlpha 0, coerente
    // con le scene sorelle: nessun cursorTo successivo lo rimostra.
    hideCursor(tl, { duration: DUR.micro });
    // CAMERA · si stacca dal modulo: pull-back a neutro mentre sale il toast
    // (nasce in basso al centro → rientra in campo con la camera larga).
    cameraReset(tl, { duration: DUR.beat });
    // ANTICIPAZIONE (R2): ingresso importante n.1 — il toast arriva con overshoot & settle.
    enter(tl, ".imm-seg-toast", { y: 48, duration: DUR.beat, anticipate: true, position: "<0.1" });
    clickZoom(tl, ".imm-seg-toast", { position: "<0.14", scale: 1.05 });

    // ── Beat ②½ — presa in carico (neutra, senza persona): sul binario di
    // stato la tappa 1→2 si accende (linea che si riempie — stesso pattern
    // maskReveal del wipe sulla foto corretta) e il dot «In lavorazione» pulsa.
    maskReveal(tl, ".imm-step-line-1", { dir: "l", duration: DUR.beat, position: ">0.2" });
    tl.to(".imm-step-2", { scale: 1.2, duration: DUR.micro, ease: EASE_SNAP }, "<");
    tl.to(".imm-step-2", { scale: 1, duration: DUR.micro, ease: EASE_IN_SCENE }, ">");
    // RESPIRO (R2) · si legge lo stato, poi la caption spiega cosa succede dopo.
    hold(tl);
    say(tl, 2); // «La segnalazione viene presa in carico...»

    // ── Beat ③ — IL FIX: si torna alla dashboard e il difetto è risolto ───────
    tl.to(".imm-seg-drawer", { xPercent: 100, duration: DUR.scene, ease: EASE_CAMERA }, ">0.25");
    // CAMERA · il rack focus si chiude col drawer: la dashboard torna a fuoco
    // (rackFocus/rackFocusOff bilanciati — regola 3).
    rackFocusOff(tl, ".imm-seg-bg", { position: "<" });
    // Sul binario di stato: la tappa 2→3 si accende in sync col flip finale.
    maskReveal(tl, ".imm-step-line-2", { dir: "l", duration: DUR.beat });
    // Il dot finale flippa in 3D: «in attesa» gira via, «Risolta ✓» entra
    // (pattern rotateY riusato SOLO per l'ultima tappa, come da roadmap).
    tl.to(
      ".imm-seg-old",
      { rotationY: 90, autoAlpha: 0, duration: DUR.micro, ease: EASE_OUT_SCENE },
      ">0.1",
    );
    tl.to(
      ".imm-seg-new",
      { rotationY: 0, autoAlpha: 1, duration: DUR.beat, ease: EASE_SNAP },
      "<0.05",
    );
    // RESPIRO (R2): la «Risolta ✓» si registra prima che la camera riparta sul fix.
    hold(tl, 0.5);
    // CAMERA · push-in (b) LENTO sulla card mentre l'immagine si sistema (parte a
    // layout fermo: drawer chiuso e fuoco ripristinato → misura esatta).
    // Sostituisce il vecchio clickZoom sulla card (regola 4).
    cameraTo(tl, ".imm-seg-card", {
      scale: 1.3,
      duration: DUR.scene,
      position: ">0.1",
    });
    // La foto corretta copre l'immagine rotta con un wipe da sinistra, DENTRO il
    // push-in (clip-path: nessuna dipendenza dalle misure di camera).
    maskReveal(tl, ".imm-img-fix", { dir: "l", duration: DUR.scene, position: "<0.25" });
    // CAMERA · pull-back reveal (f) + reset FINALE (regola 3): da 1.3 a neutra per
    // svelare la dashboard riparata → a progress(1) la camera è neutra.
    cameraReset(tl, { duration: DUR.scene, position: ">0.2" });
    // Mini-toast di conferma mentre il campo si allarga (rientra in alto al centro).
    tl.to(".imm-fix-toast", { autoAlpha: 1, y: 0, duration: DUR.beat, ease: EASE_SNAP }, ">-0.35");

    hold(tl); // hold finale
  });

  return (
    <ImmersiveStage ref={ref} heightVh={530} label={CHAPTERS[3].title} chapterIndex={3}>
      {/* Reduced-motion: heading statico di capitolo (la ChapterCard animata a
          progress(1) è nascosta) — nella fascia alta libera sopra il device frame. */}
      {reduced ? (
        <h2 className="text-muted absolute top-3 left-1/2 z-40 -translate-x-1/2 font-mono text-xs font-semibold tracking-[0.35em] uppercase">
          {CHAPTERS[3].title}
        </h2>
      ) : null}

      {/* ════ Schermata A · la dashboard (compatta) con il difetto ════
          Device frame (R3, regola 1): l'app vive in una "finestra" centrata con
          proporzioni da laptop (16:10, max-w-6xl), NON full-bleed da bordo a
          bordo. I toast restano FUORI dal frame (notifiche a livello schermo). */}
      <div className="flex h-full items-center justify-center px-16 py-12">
        <div className="border-border bg-background text-foreground flex aspect-[16/10] w-full max-w-6xl overflow-hidden rounded-2xl border shadow-2xl">
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
                      {/* Immagine ROTTA sotto: PLACEHOLDER puro (nessuna foto dietro →
                        niente spoiler del fix). La foto nitida sopra è scoperta dal
                        wipe (maskReveal) solo nel beat del fix. Aspect 16/9 esplicito
                        (R3, regola 3): niente altezza fissa che schiaccia la colonna. */}
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
                        <div className="imm-img-fix absolute inset-0" aria-hidden>
                          <img
                            src={FOTO_FIX}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
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

      {/* ── Toast globali (fuori dall'app: non vengono clippati dal drawer) ── */}

      {/* «Segnalazione ricevuta ✓» + timeline di stato a 3 tappe (beat ②/②½/③):
          Ricevuta ✓ → In lavorazione (dot neutro) → Risolta ✓. Le prime
          due tappe sono dot fissi; il binario tra loro si "accende" col beat
          ②½, il dot finale flippa in 3D (pattern del Gestionale, solo lì). */}
      <div
        className="imm-seg-toast border-border bg-surface pointer-events-none absolute bottom-8 left-1/2 z-50 w-[380px] -translate-x-1/2 rounded-xl border px-5 py-3.5 shadow-lg"
        aria-live="polite"
        style={{ opacity: 0 }}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-4 w-4 text-emerald-600" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-foreground text-sm font-semibold">Segnalazione ricevuta ✓</p>
            <p className="text-muted truncate text-xs">
              La richiesta sarà presa in carico · {PAGINA_RILEVATA}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 pl-1">
          {/* Tappa 1 · Ricevuta — attiva da subito (il toast appare solo a invio avvenuto) */}
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Check className="h-3 w-3" aria-hidden />
          </span>
          {/* Binario 1→2: si riempie nel beat ②½ (maskReveal, stesso pattern del wipe foto) */}
          <span className="bg-border relative h-0.5 w-9 shrink-0 overflow-hidden rounded-full">
            <span className="imm-step-line-1 bg-accent absolute inset-0" />
          </span>
          {/* Tappa 2 · In lavorazione — dot neutro (nessuna persona: la presa in
              carico è del servizio, non di un nome) */}
          <span className="imm-step-2 bg-accent flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
            <span className="bg-accent-contrast h-1.5 w-1.5 rounded-full" aria-hidden />
          </span>
          {/* Binario 2→3: si riempie nel beat ③, in sync col flip finale */}
          <span className="bg-border relative h-0.5 w-9 shrink-0 overflow-hidden rounded-full">
            <span className="imm-step-line-2 bg-accent absolute inset-0" />
          </span>
          {/* Tappa 3 · Risolta — gli stati occupano la stessa cella (grid): il flip 3D gira sul posto */}
          <span className="inline-grid shrink-0">
            <span className="imm-seg-old col-start-1 row-start-1 h-5 w-5 rounded-full border border-amber-300 bg-amber-100" />
            <span className="imm-seg-new col-start-1 row-start-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check className="h-3 w-3" aria-hidden />
            </span>
          </span>
        </div>
        <div className="text-muted mt-1 flex items-center justify-between pl-1 text-[11px] font-semibold tracking-wide uppercase">
          <span>Ricevuta</span>
          <span>In lavorazione</span>
          <span>Risolta</span>
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
        La segnalazione viene presa in carico e sistemata: tu vedi solo il risultato.
      </Say>
    </ImmersiveStage>
  );
}
