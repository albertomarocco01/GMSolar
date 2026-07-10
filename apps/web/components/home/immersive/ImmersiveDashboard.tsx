"use client";

/**
 * @descrizione  Scena immersiva DASHBOARD multi-sito (tema CHIARO). Full-screen
 *   admin panel denso in light mode: sidebar con 4 voci (Contenuti / Prodotti /
 *   Visite / Ordini) e track orizzontale a 4 schermate scrubbed dallo scroll.
 *   Beat ①: il cursore MODIFICA un contenuto
 *   ESISTENTE del sito (lista «Pagine del sito» → editor «Hero homepage» già
 *   compilato: sostituzione immagine con wipe, riscrittura titolo, Pubblica →
 *   toast). Poi catalogo prodotti (griglia 3 col), KPI compatti + grafici
 *   affiancati, tabella ordini con Data/Canale. Tono DESCRITTIVO. Kit ./shared.
 *   CAMERA (P11): follow sidebar→editor, push-in sul typing del titolo, punch su
 *   «Pubblica» + pull-back reveal sul toast, whip su OGNI pan del binario,
 *   push-in lento sui KPI durante il countUp → reset. La camera è NEUTRA a
 *   progress(1). Ritmo TARATO PER LETTURA (utente non tecnico): typing e countUp
 *   lenti + pause di lettura dopo ogni contenuto che atterra.
 *   Reduced-motion: timeline a progress(1) → stato finale leggibile (editor con
 *   foto e titolo nuovi, KPI pieni, tabella completa; binario = carosello).
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
  cameraTo,
  cameraReset,
  cameraFollow,
  cameraTrackType,
  cameraWhip,
  useImmersiveScene,
  pressButton,
  typeInField,
  drawPath,
  countUp,
  maskReveal,
} from "./shared";

// ── Dati statici ───────────────────────────────────────────────────────────────

const NAV = ["Contenuti", "Prodotti", "Visite", "Ordini"] as const;

/** Pagine già pubblicate del sito (beat ① — si modifica la prima). */
const PAGINE = [
  { nome: "Hero homepage", hero: true },
  { nome: "Chi siamo", hero: false },
  { nome: "Impianti realizzati", hero: false },
] as const;

/**
 * KPI schermata Visite. `dir`/`delta` = trend mock rispetto al periodo prima;
 * `fmt` sceglie il formatter del countUp ("int" = intero it-IT, "time" = m:ss).
 */
const KPI = [
  { label: "Visite", target: 18_340, dir: "up", delta: "12%", fmt: "int" },
  { label: "Utenti unici", target: 11_290, dir: "up", delta: "8%", fmt: "int" },
  { label: "Conversioni", target: 342, dir: "down", delta: "3%", fmt: "int" },
  { label: "Tempo medio", target: 161, dir: "up", delta: "5%", fmt: "time" }, // 161 s = 2:41
] as const;

/**
 * Formattatori cached a livello modulo — non vengono mai ricreati dentro
 * onUpdate (rispetta il requisito della specifica).
 */
const FMT = new Intl.NumberFormat("it-IT");
/** Secondi → "m:ss" (KPI «Tempo medio»: 161 → "2:41"). */
const fmtTempo = (n: number) => {
  const s = Math.round(n);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/** Path SVG sparkline (viewBox 0 0 200 60). */
const SPARK_D = "M0,54 L28,42 L56,46 L84,28 L112,32 L140,15 L168,19 L200,8";

/** Path SVG del grafico DETTAGLIO visite (viewBox 0 0 400 80) — compare al
 *  click sulla card KPI «Visite». */
const DETAIL_D =
  "M0,64 L44,58 L88,62 L132,44 L176,50 L220,34 L264,40 L308,22 L352,28 L400,10";

/** Mini-KPI della vista Ordini (mock deterministici, coerenti con la tabella). */
const ORD_STATS = [
  { label: "Ordini del mese", value: 24, fmt: "int" },
  { label: "In lavorazione", value: 3, fmt: "int" },
  { label: "Incasso periodo", value: 16_889, fmt: "eur" },
] as const;

/** Altezze barre giornaliere (%). */
const BARS = [32, 48, 41, 67, 58, 80, 72] as const;

/** Prodotti già presenti nel catalogo (fotovoltaico + ricarica EV, coerenti).
 *  `img` = foto placeholder in /assets/products/ — le STESSE che l'AI consiglia
 *  nella scena Assistente → dashboard e vetrina combaciano. */
const PRODOTTI_INIT: ReadonlyArray<{ nome: string; prezzo: string; img: string }> = [
  { nome: "Cavo Type 2 · 5 m", prezzo: "149 €", img: "/assets/products/cavo-01.jpg" },
  { nome: "Wallbox 22 kW", prezzo: "899 €", img: "/assets/products/wallbox-detail.jpg" },
  { nome: "Pannello 400 W", prezzo: "210 €", img: "/assets/products/pannello-01.jpg" },
  { nome: "Inverter 6 kW", prezzo: "1.490 €", img: "/assets/products/inverter-01.jpg" },
  { nome: "Kit staffe tetto", prezzo: "89 €", img: "/assets/products/cavo-04.jpg" },
];

/** Righe tabella ordini (Data/Canale mock deterministici; somma = 16.889 €). */
const ORDINI: ReadonlyArray<{
  n: string;
  cliente: string;
  data: string;
  canale: string;
  importo: string;
  stato: string;
}> = [
  { n: "#1042", cliente: "Rossi S.r.l.", data: "28/06", canale: "Online", importo: "2.340 €", stato: "Completato" },
  { n: "#1041", cliente: "Bianchi S.p.A.", data: "27/06", canale: "Preventivo", importo: "899 €", stato: "Spedito" },
  { n: "#1040", cliente: "Ferrari Group", data: "26/06", canale: "Preventivo", importo: "12.600 €", stato: "In attesa" },
  { n: "#1039", cliente: "Conti S.r.l.", data: "24/06", canale: "Online", importo: "630 €", stato: "Completato" },
  { n: "#1038", cliente: "Masi & Figli", data: "23/06", canale: "Telefono", importo: "420 €", stato: "Spedito" },
];

/** Classi badge colore per stato ordine (sky / amber / emerald — minimi token). */
const STATO_CLS: Record<string, string> = {
  Completato: "bg-emerald-100 text-emerald-700",
  Spedito: "bg-sky-100 text-sky-700",
  "In attesa": "bg-amber-100 text-amber-700",
};

/** Foto reali della hero: ATTUALE (wallbox) → NUOVA (impianto fotovoltaico).
 *  Due foto DIVERSE a colpo d'occhio → il wipe di sostituzione si vede.
 *  FOTO_NUOVA («impianto-2026.jpg») è la STESSA che la scena Segnalazioni usa
 *  come stato «risolto» → continuità tra i due capitoli. */
const FOTO_ATTUALE = "/assets/products/wallbox-detail.jpg";
const FOTO_NUOVA = "/assets/products/pannello-01.jpg";

// ── Componente ─────────────────────────────────────────────────────────────────

export default function ImmersiveDashboard() {
  // Reduced-motion: niente pan scrubbato → il binario a 4 pannelli diventa un
  // carosello scrollabile in orizzontale (tutti i pannelli raggiungibili).
  const reduced = useReducedMotion();
  const ref = useImmersiveScene((tl, section) => {
    // Indicatore scorrevole nella sidebar. `() => navTop(i)`: valori FUNZIONE così
    // `invalidateOnRefresh` li ri-misura su resize/cambio breakpoint (la sidebar è
    // `hidden sm:block`: a build sotto sm gli offsetTop sono 0).
    const navItems = Array.from(section.querySelectorAll<HTMLElement>(".imm-nav-item"));
    const navTop = (i: number) => navItems[i]?.offsetTop ?? 0;

    // ── Set iniziali ───────────────────────────────────────────────────────────
    // Immagine nuova (maskReveal) e titolo nuovo (typing) sono nascosti dai loro
    // helper; il bottone «Segnala un problema» NON ha set → visibile dal frame 0.
    gsap.set(".imm-bar", { scaleY: 0, transformOrigin: "bottom" });
    gsap.set(".imm-kpi-card", { autoAlpha: 0, y: 20 });
    gsap.set(".imm-ord-row", { autoAlpha: 0, x: -16 });
    gsap.set(".imm-new-card", { autoAlpha: 0, scale: 0.85 });
    gsap.set(".imm-page-active", { autoAlpha: 0 });
    gsap.set(".imm-toast", { autoAlpha: 0, y: 8 });
    // Mini-form «Nuovo prodotto», grafico dettaglio visite, KPI/dettaglio ordini:
    // partono nascosti, li rivelano i rispettivi beat.
    gsap.set(".imm-add-form", { autoAlpha: 0, y: 14, scale: 0.94 });
    gsap.set(".imm-visits-detail", { autoAlpha: 0, y: 16 });
    gsap.set(".imm-ord-stat", { autoAlpha: 0, y: 14 });
    gsap.set(".imm-ord-detail", { autoAlpha: 0, y: 14 });
    gsap.set(".imm-ord-active", { autoAlpha: 0 });
    tl.set(".imm-nav-ind", { top: () => navTop(0) });

    // ── ① Contenuti: si MODIFICA un contenuto ESISTENTE ───────────────────────
    // Title card «03 · Dashboard» (P12): PRIMO beat, sostituisce il vecchio
    // say(tl, 0) col velo. Dura ~2.7s → il primo beat di camera (cameraFollow
    // sull'editor, ~3.4s) parte a card già uscita: nessun conflitto.
    chapterIntro(tl);

    // Il cursore seleziona la pagina «Hero homepage» nella lista → highlight
    cursorTo(tl, ".imm-page-hero", { mode: "hand" });
    tl.to({}, { duration: 0.25 });
    pressButton(tl, ".imm-page-hero", { down: 0.96, downDur: 0.12, upDur: 0.22, back: 2.2 });
    tl.to(".imm-page-active", { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, "<");
    // FOLLOW (c) — sostituisce il clickZoom sull'editor: dal click sulla lista
    // la camera fa il pan verso l'editor, POI il cursore lo raggiunge (regola 2:
    // camera prima, cursorTo per ultimo → misura il layout ormai assestato).
    cameraFollow(tl, ".imm-zoom-local", { scale: 1.15 });
    // Il cursore vive FUORI dalla camera: durante il pan camera-only sfuma
    // (sennò galleggerebbe sulla voce di sinistra). Il cursorTo sotto lo riporta.
    hideCursor(tl);

    // «Sostituisci immagine»: la foto attuale viene COPERTA dalla nuova (wipe)
    cursorTo(tl, ".imm-replace-btn", { mode: "hand" });
    tl.to({}, { duration: 0.2 });
    pressButton(tl, ".imm-replace-btn", { down: 0.93, downDur: 0.1, upDur: 0.18, back: 2.5 });
    maskReveal(tl, ".imm-img-new", { dir: "l", duration: 0.8, position: "<0.1" });

    // Il titolo si RISCRIVE: il vecchio sfuma e il nuovo si digita mentre la CAMERA
    // SEGUE IL CARET (item 4) — trasla a dx col punto di scrittura invece del push-in
    // FERMO (cameraTrackType sostituisce il vecchio cameraTo, regola 4). Il track
    // porta lui il caret al centro-schermo: niente cursorTo(campo) dedicato.
    tl.to({}, { duration: 0.2 });
    tl.to(".imm-title-old", { autoAlpha: 0, duration: 0.15, ease: "power1.out" });
    cameraTrackType(tl, ".imm-title-new", { scale: 1.2, duration: 1.6 });
    typeInField(tl, ".imm-title-new", { steps: 32, duration: 1.6, position: "<" });

    // «Pubblica» → PUNCH (a) DI CAMERA + toast. Camera PRIMA — snap expo.out e
    // micro-overshoot back.out(1.2) sull'arrivo — poi il cursore (regola 2);
    // il vecchio clickZoom locale è rimosso (regola 4: mai i due sommati).
    tl.to({}, { duration: 0.25 });
    cameraTo(tl, ".imm-publish-btn", { scale: 1.45, duration: 0.45, ease: "expo.out" });
    hideCursor(tl); // sfuma col punch (era fermo sul campo titolo) → niente galleggiamento
    cameraTo(tl, ".imm-publish-btn", { scale: 1.38, duration: 0.3, ease: "back.out(1.2)" });
    cursorTo(tl, ".imm-publish-btn", { mode: "hand", duration: 0.5 });
    tl.to({}, { duration: 0.15 });
    pressButton(tl, ".imm-publish-btn", { down: 0.93, downDur: 0.1, upDur: 0.2, back: 2.5 });
    tl.to(".imm-toast", { autoAlpha: 1, y: 0, duration: 0.4, ease: "back.out(2)" }, ">-0.1");
    // PULL-BACK REVEAL (f): dalla stretta sul bottone si svela l'editor
    // pubblicato con il toast → camera neutra prima del cambio pannello.
    cameraReset(tl, { duration: 0.9 });
    hideCursor(tl); // sfuma col pull-back (era sul bottone); il beat ② lo riporta
    say(tl, 1); // «Modifichi i contenuti del sito: online subito.»

    // ── ② Prodotti ────────────────────────────────────────────────────────────
    cursorTo(tl, navItems[1], { mode: "hand" }); // click "Prodotti" nella sidebar
    tl.to(".imm-nav-ind", { top: () => navTop(1), duration: 0.45, ease: "power3.inOut" }, "<0.3");
    tl.to(".imm-track", { xPercent: -25, duration: 1.1, ease: "expo.inOut" }, "<0.1");
    // WHIP (d) in sync col pan: il burst (0.35s) cade sul picco di velocità
    // dell'expo.inOut (~metà pan). Finisce neutro da solo.
    cameraWhip(tl, "r", { position: "<0.35" });
    say(tl, 2); // «Il catalogo prodotti: aggiungi e aggiorni in un click.»

    // Cursore (mano) sul bottone "Aggiungi prodotto" → si APRE il mini-form:
    // i campi si COMPILANO (typing), la foto si carica (wipe), «Salva» → il
    // form si chiude e la nuova card entra nel catalogo. Flusso leggibile al
    // posto della vecchia comparsa istantanea della card.
    tl.to({}, { duration: 0.35 });
    cursorTo(tl, ".imm-add-btn", { mode: "hand" });
    pressButton(tl, ".imm-add-btn", { down: 0.93, downDur: 0.1, upDur: 0.18, back: 2.5 });
    tl.to(
      ".imm-add-form",
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.6)" },
      ">-0.05",
    );
    // Push-in discreto sul form; il typing avviene a camera FERMA (regola 2),
    // il cursore parte DOPO il cameraTo → misura il layout assestato.
    cameraTo(tl, ".imm-add-form", { scale: 1.18, duration: 0.6, ease: "power2.inOut" });
    tl.to({}, { duration: 0.4 }); // si legge il form vuoto «Nuovo prodotto» prima del typing
    // Typing LENTO e leggibile (l'utente deve poter leggere nome e prezzo).
    cursorTo(tl, ".imm-form-nome", { mode: "text", duration: 0.5 });
    typeInField(tl, ".imm-form-nome", { steps: 22, duration: 1.9 });
    cursorTo(tl, ".imm-form-prezzo", { mode: "text", duration: 0.4 });
    typeInField(tl, ".imm-form-prezzo", { steps: 12, duration: 1.2 });
    // La foto del prodotto "si carica" con un wipe
    maskReveal(tl, ".imm-form-foto", { dir: "l", duration: 0.6 });
    tl.to({}, { duration: 0.7 }); // pausa: il form compilato resta leggibile prima del «Salva»
    cursorTo(tl, ".imm-form-save", { mode: "hand", duration: 0.5 });
    pressButton(tl, ".imm-form-save", { down: 0.93, downDur: 0.1, upDur: 0.18, back: 2.5 });
    // Il form si chiude, la camera si riapre e la nuova card ENTRA nel catalogo
    tl.to(".imm-add-form", { autoAlpha: 0, y: -10, scale: 0.97, duration: 0.35, ease: "power2.in" });
    cameraReset(tl, { duration: 0.7, position: "<" });
    hideCursor(tl, { position: "<" });
    tl.to(
      ".imm-new-card",
      { autoAlpha: 1, scale: 1, duration: 0.55, ease: "back.out(1.8)" },
      ">-0.1",
    );
    tl.to({}, { duration: 1.0 }); // pausa: si legge la nuova card al suo posto nel catalogo

    // ── ③ Visite ──────────────────────────────────────────────────────────────
    cursorTo(tl, navItems[2], { mode: "hand" }); // click "Visite"
    tl.to(".imm-nav-ind", { top: () => navTop(2), duration: 0.45, ease: "power3.inOut" }, "<0.3");
    tl.to(".imm-track", { xPercent: -50, duration: 1.1, ease: "expo.inOut" }, "<0.1");
    cameraWhip(tl, "r", { position: "<0.35" }); // WHIP (d) in sync col pan
    say(tl, 3); // «Visite, utenti e conversioni, sempre aggiornati.»

    // Card KPI entrano con back.out staggered
    tl.to(
      ".imm-kpi-card",
      { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "back.out(1.6)" },
      "<0.25",
    );
    // Proxy counter: i 4 valori salgono in parallelo (interi it-IT + tempo m:ss)
    countUp(
      tl,
      KPI.map((k, i) => ({
        el: `.imm-kpi-val-${i}`,
        to: k.target,
        format: k.fmt === "time" ? fmtTempo : (n: number) => FMT.format(Math.round(n)),
      })),
      { duration: 2.2, ease: "power2.out", position: "<0.3" }, // countUp LENTO: i numeri salgono leggibili
    );
    // PUSH-IN (b) lento sulla fila KPI per TUTTA la durata del countUp (parte
    // insieme al counter; il cursore è fermo in sidebar → nessun conflitto).
    cameraTo(tl, ".imm-kpi-grid", {
      scale: 1.15,
      duration: 2.2, // = durata del countUp
      ease: "power1.inOut",
      position: "<",
    });
    // Sparkline si disegna da sinistra (dashoffset → 0)
    drawPath(tl, ".imm-spark-path", { duration: 1.2, ease: "power2.inOut", position: "<0.4" });
    // Barre crescono dal basso con stagger
    tl.to(".imm-bar", { scaleY: 1, duration: 0.6, stagger: 0.07, ease: "back.out(1.7)" }, "<0.3");
    // Click LEGGIBILE sulla card KPI «Visite» → si apre il GRAFICO DI DETTAGLIO
    // dedicato (prima era un punch rapido senza payoff). La camera è ferma a
    // 1.15 durante il click (misura corretta, regola 4: niente cameraTo qui).
    tl.to({}, { duration: 0.7 }); // pausa: i KPI restano leggibili prima del click
    cursorTo(tl, ".imm-kpi-zoom", { mode: "hand" });
    tl.to({}, { duration: 0.2 });
    pressButton(tl, ".imm-kpi-zoom", { down: 0.95, downDur: 0.12, upDur: 0.25, back: 2.2 });
    // Chiusura del push-in KPI PRIMA del reveal (regola 3): il dettaglio sta
    // più in basso e va letto a inquadratura piena; da qui in poi solo whip
    // auto-neutri → a progress(1) e sul beat finale la camera è neutra.
    cameraReset(tl, { duration: 0.7 });
    hideCursor(tl, { position: "<" });
    // Il grafico dedicato entra, la linea si disegna, l'area si riempie…
    tl.to(".imm-visits-detail", { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" });
    drawPath(tl, ".imm-detail-path", { duration: 1.1, ease: "power2.inOut", position: ">-0.2" });
    tl.to(".imm-detail-area", { opacity: 1, duration: 0.5, ease: "power2.out" }, ">-0.3");
    tl.to({}, { duration: 1.4 }); // …e c'è TEMPO PIENO per leggerlo

    // ── ④ Ordini ──────────────────────────────────────────────────────────────
    cursorTo(tl, navItems[3], { mode: "hand" }); // click "Ordini"
    tl.to(".imm-nav-ind", { top: () => navTop(3), duration: 0.45, ease: "power3.inOut" }, "<0.3");
    tl.to(".imm-track", { xPercent: -75, duration: 1.1, ease: "expo.inOut" }, "<0.1");
    cameraWhip(tl, "r", { position: "<0.35" }); // WHIP (d) in sync col pan
    say(tl, 4); // «Gli ordini, con data e canale, in un'unica vista.»
    // Mini-KPI ordini: entrano e CONTANO prima della tabella (vista ampliata)
    tl.to(
      ".imm-ord-stat",
      { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.08, ease: "back.out(1.6)" },
      "<0.25",
    );
    countUp(
      tl,
      ORD_STATS.map((s, i) => ({
        el: `.imm-ord-stat-val-${i}`,
        to: s.value,
        format:
          s.fmt === "eur"
            ? (n: number) => `${FMT.format(Math.round(n))} €`
            : (n: number) => FMT.format(Math.round(n)),
      })),
      { duration: 1.7, ease: "power2.out", position: "<0.2" }, // countUp LENTO: i numeri restano leggibili
    );
    // Righe tabella entrano con slide+fade staggered
    tl.to(
      ".imm-ord-row",
      { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.14, ease: "power3.out" },
      "<0.3",
    );
    tl.to({}, { duration: 0.7 }); // pausa: la tabella ordini resta leggibile prima del click
    // Click sulla PRIMA riga → si apre il DETTAGLIO dell'ordine (righe articolo,
    // spedizione, consegna): la vista ordini non è più solo la lista.
    cursorTo(tl, ".imm-ord-first", { mode: "hand", duration: 0.7 });
    pressButton(tl, ".imm-ord-first", { down: 0.98, downDur: 0.1, upDur: 0.2, back: 2 });
    tl.to(".imm-ord-active", { autoAlpha: 1, duration: 0.25, ease: "power2.out" }, "<");
    tl.to(".imm-ord-detail", { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" });
    // Chiusura scena: pausa PIENA sul dettaglio ordine (la scena finisce qui; il
    // gancio «Segnala un problema» è rimosso — quel capitolo arriva scrollando).
    tl.to({}, { duration: 1.4 });
  });

  return (
    <ImmersiveStage
      ref={ref}
      // 900 → 1200: typing/countUp rallentati + pause di lettura hanno bisogno
      // di più corsa di scroll → scrub più dolce, tutto resta leggibile anche
      // per un utente non tecnico che scrolla veloce.
      heightVh={1200}
      label={CHAPTERS[3].title}
      chapterIndex={3}
    >
      {/* Reduced-motion: la ChapterCard animata finisce NASCOSTA a progress(1)
          → heading statico col numero/nome capitolo in cima alla scena (il
          fallback reduced esistente resta: editor pubblicato, KPI pieni,
          binario = carosello). Ancorato al contenitore sticky del kit. */}
      {reduced && (
        <h2 className="text-muted absolute top-3 left-5 z-20 font-mono text-xs font-semibold tracking-[0.35em] uppercase">
          {CHAPTERS[3].title}
        </h2>
      )}
      {/* Stessi token della scena Gestionale adiacente: fondi, grigi e accent
          identici (prima era bg-white + scala slate hardcoded → salto di tono). */}
      <div className="bg-background text-foreground flex h-full pt-10">
        {/* ── Sidebar ────────────────────────────────────────────────────────── */}
        <aside className="border-border bg-surface relative hidden w-52 shrink-0 border-r p-4 sm:block">
          <div className="text-foreground mb-6 flex items-center gap-2 px-2 font-semibold">
            <span className="bg-accent h-4 w-4 rounded-[5px]" />
            Dashboard
          </div>

          <nav className="relative space-y-1">
            {/* Indicatore scorrevole della voce attiva */}
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

          {/* Siti connessi */}
          <div className="border-border mt-6 border-t pt-4">
            <p className="text-muted mb-2 px-2 text-[11px] font-semibold tracking-wider uppercase">
              Siti
            </p>
            {["Solar", "Mobility", "Shop"].map((s) => (
              <div
                key={s}
                className="text-muted flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
              >
                <span className="bg-accent/60 h-2 w-2 rounded-full" />
                {s}
              </div>
            ))}
          </div>
        </aside>

        {/* ── Area principale ───────────────────────────────────────────────── */}
        {/* Reduced-motion: overflow-x-auto → il binario a 4 pannelli si scorre a mano
            (il pan scrubbato non c'è, vedi useReducedMotion sopra). */}
        <div
          className={`relative flex-1 ${
            reduced ? "overflow-x-auto overflow-y-hidden" : "overflow-hidden"
          }`}
        >
          {/* Topbar */}
          <div className="border-border bg-background/80 flex h-12 items-center gap-3 border-b px-5 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-muted text-xs font-semibold">3 siti connessi</span>
            <div className="ml-auto flex items-center gap-1.5">
              {["Solar", "Mobility"].map((s) => (
                <span
                  key={s}
                  className="bg-surface-2 text-muted rounded-full px-3 py-1 text-[11px] font-semibold"
                >
                  {s}
                </span>
              ))}
              <span className="bg-accent text-accent-contrast rounded-full px-3 py-1 text-[11px] font-semibold">
                Shop ✓
              </span>
            </div>
          </div>

          {/* Track orizzontale: 4 schermate → width 400%, ogni pannello w-1/4.
              Ogni pannello: contenuto centrato in max-w-5xl, griglie dense. */}
          <div className="imm-track flex h-[calc(100%-3rem)]" style={{ width: "400%" }}>
            {/* ① CONTENUTI: lista pagine + editor della voce selezionata ─────── */}
            <div className="w-1/4 shrink-0 overflow-hidden p-5">
              <div className="mx-auto max-w-5xl">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-foreground font-semibold">Contenuti del sito</p>
                  <span className="text-muted text-xs">gmsolar.it · 3 pagine pubblicate</span>
                </div>

                <div className="grid grid-cols-[240px_minmax(0,1fr)] items-start gap-4">
                  {/* Colonna sinistra: pagine GIÀ popolate, con anteprima e stato */}
                  <div className="border-border bg-surface rounded-xl border shadow-sm">
                    <p className="text-muted border-border border-b px-3 py-2 text-[11px] font-semibold tracking-wider uppercase">
                      Pagine del sito
                    </p>
                    <div className="space-y-1 p-2">
                      {PAGINE.map(({ nome, hero }) => (
                        <div
                          key={nome}
                          className={`relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 ${
                            hero ? "imm-page-hero" : ""
                          }`}
                        >
                          {/* Highlight della voce selezionata: appare al click del cursore */}
                          {hero && (
                            <span
                              className="imm-page-active bg-accent-soft absolute inset-0 rounded-lg"
                              aria-hidden
                            />
                          )}
                          {/* Mini-anteprima: foto reale della pagina */}
                          {hero ? (
                            <img
                              src={FOTO_ATTUALE}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              className="relative h-8 w-11 shrink-0 rounded-md object-cover"
                              aria-hidden
                            />
                          ) : (
                            <img
                              src="/assets/products/cavo-02.jpg"
                              alt=""
                              loading="lazy"
                              decoding="async"
                              className="border-border relative h-8 w-11 shrink-0 rounded-md border object-cover"
                              aria-hidden
                            />
                          )}
                          <span className="relative min-w-0 flex-1">
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

                  {/* Colonna destra: editor «Hero homepage», GIÀ COMPILATO */}
                  <div className="imm-zoom-local border-border bg-surface relative rounded-xl border p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-foreground text-sm font-semibold">Hero homepage</p>
                      <span className="text-muted text-[11px]">Ultima modifica: 12/06/2026</span>
                    </div>

                    <div className="grid grid-cols-[280px_minmax(0,1fr)] gap-4">
                      {/* Immagine: attuale sotto, NUOVA sopra (coperta → wipe maskReveal) */}
                      <div>
                        <div className="relative h-32 overflow-hidden rounded-lg">
                          <div className="absolute inset-0" aria-hidden>
                            <img
                              src={FOTO_ATTUALE}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="bg-background/85 text-foreground rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm">
                                foto-attuale.jpg
                              </span>
                            </div>
                          </div>
                          <div className="imm-img-new absolute inset-0" aria-hidden>
                            <img
                              src={FOTO_NUOVA}
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
                        <button
                          className="imm-replace-btn border-border bg-surface-2 text-foreground mt-2 rounded-lg border px-3 py-1.5 text-xs font-semibold"
                          tabIndex={-1}
                          aria-hidden
                        >
                          Sostituisci immagine
                        </button>
                      </div>

                      {/* Campi testo: GIÀ compilati (si modifica, non si parte da zero) */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-muted mb-1 block text-[11px] font-semibold tracking-wider uppercase">
                            Titolo
                          </label>
                          {/* Titolo vecchio in flusso; il NUOVO è in overlay e si
                              digita per clip-path (typeInField) mentre il vecchio sfuma */}
                          <div className="imm-title-field border-border bg-surface-2 text-foreground relative min-h-[34px] rounded-lg border px-3 py-2 text-sm">
                            <span className="imm-title-old inline-block whitespace-nowrap">
                              Energia solare per la tua casa
                            </span>
                            <span className="imm-title-new absolute top-2 left-3 inline-block whitespace-nowrap">
                              Energia solare per la tua azienda
                            </span>
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

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-muted text-[11px]">
                            Stato: <span className="font-semibold">Pubblicata</span>
                          </span>
                          <button
                            className="imm-publish-btn bg-accent text-accent-contrast rounded-lg px-4 py-1.5 text-sm font-semibold"
                            tabIndex={-1}
                            aria-hidden
                          >
                            Pubblica
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Toast di conferma: appare dopo «Pubblica» */}
                    <div
                      className="imm-toast bg-foreground text-background absolute top-3 right-3 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-lg"
                      aria-hidden
                    >
                      Modifiche pubblicate ✓
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ② PRODOTTI: griglia densa a 3 colonne + mini-form di aggiunta ─── */}
            <div className="relative w-1/4 shrink-0 overflow-hidden p-5">
              <div className="mx-auto max-w-5xl">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-foreground font-semibold">Catalogo prodotti</p>
                  <button
                    className="imm-add-btn bg-accent text-accent-contrast rounded-lg px-4 py-1.5 text-xs font-semibold shadow-sm"
                    tabIndex={-1}
                    aria-hidden
                  >
                    + Aggiungi prodotto
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {PRODOTTI_INIT.map((p) => (
                    <div
                      key={p.nome}
                      className="border-border bg-surface rounded-xl border p-3 shadow-sm"
                    >
                      <img
                        src={p.img}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="mb-2 h-10 w-full rounded-lg object-cover"
                      />
                      <p className="text-foreground text-sm font-semibold">{p.nome}</p>
                      <p className="text-accent-ink text-xs font-bold">{p.prezzo}</p>
                    </div>
                  ))}

                  {/* Nuova card: entra con back.out dopo il «Salva» del form */}
                  <div className="imm-new-card border-accent/40 bg-accent/5 rounded-xl border-2 p-3 shadow-sm">
                    <img
                      src="/assets/products/cavo-05.jpg"
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="mb-2 h-10 w-full rounded-lg object-cover"
                    />
                    <p className="text-foreground text-sm font-semibold">Batteria 10 kWh</p>
                    <p className="text-accent-ink text-xs font-bold">3.200 €</p>
                  </div>
                </div>
              </div>

              {/* Mini-form «Nuovo prodotto»: si apre al click su «+ Aggiungi
                  prodotto», i campi si digitano da soli (typeInField), la foto
                  si carica con un wipe, «Salva prodotto» lo chiude e fa entrare
                  la card qui sopra. Parte nascosto (set nel build). */}
              <div
                className="imm-add-form border-border bg-background absolute top-1/2 left-1/2 z-10 w-80 -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-4 shadow-2xl"
                style={{ opacity: 0 }}
                aria-hidden
              >
                <p className="text-foreground mb-3 text-sm font-semibold">Nuovo prodotto</p>
                <div className="space-y-2.5">
                  <div>
                    <label className="text-muted mb-1 block text-[11px] font-semibold tracking-wider uppercase">
                      Nome
                    </label>
                    <div className="border-border bg-surface-2 text-foreground min-h-[32px] overflow-hidden rounded-lg border px-3 py-1.5 text-sm">
                      <span className="imm-form-nome inline-block whitespace-nowrap">
                        Batteria 10 kWh
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-muted mb-1 block text-[11px] font-semibold tracking-wider uppercase">
                      Prezzo
                    </label>
                    <div className="border-border bg-surface-2 text-foreground min-h-[32px] overflow-hidden rounded-lg border px-3 py-1.5 text-sm">
                      <span className="imm-form-prezzo inline-block whitespace-nowrap">3.200 €</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-muted mb-1 block text-[11px] font-semibold tracking-wider uppercase">
                      Foto
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="imm-form-foto block h-10 w-14 overflow-hidden rounded-lg">
                        <img
                          src="/assets/products/cavo-05.jpg"
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      </span>
                      <span className="text-muted text-xs">batteria-10kwh.jpg</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    className="imm-form-save bg-accent text-accent-contrast rounded-lg px-4 py-1.5 text-sm font-semibold"
                    tabIndex={-1}
                    aria-hidden
                  >
                    Salva prodotto
                  </button>
                </div>
              </div>
            </div>

            {/* ③ VISITE: 4 KPI compatti + sparkline|barre affiancate ─────────── */}
            {/* overflow-y-auto: su viewport molto bassi (landscape) i grafici in fondo
                restano raggiungibili invece di essere clippati. */}
            <div className="w-1/4 shrink-0 overflow-y-auto p-5">
              <div className="mx-auto max-w-5xl">
                <p className="text-foreground mb-3 font-semibold">Visite · ultimi 30 giorni</p>

                {/* 4 card KPI compatte: counter animato via proxy GSAP.
                    `imm-kpi-grid` = target del push-in di camera durante il countUp. */}
                <div className="imm-kpi-grid mb-3 grid grid-cols-4 gap-3">
                  {KPI.map(({ label, dir, delta, fmt }, i) => (
                    <div
                      key={label}
                      className={`imm-kpi-card border-border bg-surface rounded-xl border p-3 shadow-sm ${
                        i === 0 ? "imm-kpi-zoom" : ""
                      }`}
                    >
                      <p
                        className={`imm-kpi-val-${i} text-accent-ink font-display text-xl font-bold tabular-nums`}
                      >
                        {fmt === "time" ? "0:00" : "0"}
                      </p>
                      <p className="text-muted mt-0.5 text-xs">{label}</p>
                      {/* Trend mock: freccia + delta (su = accent, giù = muted). */}
                      <p
                        className={`mt-1 flex items-center gap-0.5 text-[0.65rem] font-semibold ${
                          dir === "up" ? "text-accent-ink" : "text-muted"
                        }`}
                      >
                        <span aria-hidden>{dir === "up" ? "▲" : "▼"}</span>
                        {delta}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Due colonne affiancate: sparkline | barre giornaliere */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Sparkline: disegnata tramite strokeDashoffset → 0 */}
                  <div className="border-border bg-surface rounded-xl border p-4 shadow-sm">
                    <p className="text-muted mb-2 text-[11px] font-semibold tracking-wider uppercase">
                      Trend visite
                    </p>
                    <svg
                      viewBox="0 0 200 60"
                      className="h-20 w-full"
                      preserveAspectRatio="none"
                      aria-hidden
                    >
                      <defs>
                        <linearGradient id="imm-db2-spark-grad" x1="0" y1="0" x2="0" y2="1">
                          {/* var() non è valido negli attributi SVG di presentazione → style */}
                          <stop
                            offset="0%"
                            style={{ stopColor: "var(--accent)" }}
                            stopOpacity="0.15"
                          />
                          <stop
                            offset="100%"
                            style={{ stopColor: "var(--accent)" }}
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>
                      <path d={`${SPARK_D} L200,60 L0,60 Z`} fill="url(#imm-db2-spark-grad)" />
                      <path
                        className="imm-spark-path stroke-accent"
                        d={SPARK_D}
                        fill="none"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  {/* Barre giornaliere: scaleY 0→1 dal basso con stagger */}
                  <div className="border-border bg-surface rounded-xl border p-4 shadow-sm">
                    <p className="text-muted mb-2 text-[11px] font-semibold tracking-wider uppercase">
                      Visite per giorno
                    </p>
                    <div className="flex h-20 items-end gap-1.5">
                      {BARS.map((h, i) => (
                        <span
                          key={i}
                          className={`imm-bar flex-1 rounded-t ${
                            i === BARS.length - 1 ? "bg-accent" : "bg-accent/25"
                          }`}
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                    {/* Etichette giorno (mock statico) */}
                    <div className="text-muted mt-1.5 flex gap-1.5 text-[9px] font-medium">
                      {["L", "M", "M", "G", "V", "S", "D"].map((d, i) => (
                        <span key={i} className="flex-1 text-center">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Grafico DETTAGLIO visite: compare al click sulla card KPI
                    «Visite» (beat ③) — area chart dedicato, con tempo di lettura. */}
                <div
                  className="imm-visits-detail border-border bg-surface mt-3 rounded-xl border p-4 shadow-sm"
                  style={{ opacity: 0 }}
                  aria-hidden
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-muted text-[11px] font-semibold tracking-wider uppercase">
                      Dettaglio visite · per settimana
                    </p>
                    <span className="text-accent-ink text-[11px] font-semibold">
                      ▲ 12% vs periodo precedente
                    </span>
                  </div>
                  <svg
                    viewBox="0 0 400 80"
                    className="h-24 w-full"
                    preserveAspectRatio="none"
                    aria-hidden
                  >
                    <defs>
                      <linearGradient id="imm-db2-detail-grad" x1="0" y1="0" x2="0" y2="1">
                        {/* var() non è valido negli attributi SVG di presentazione → style */}
                        <stop offset="0%" style={{ stopColor: "var(--accent)" }} stopOpacity="0.2" />
                        <stop
                          offset="100%"
                          style={{ stopColor: "var(--accent)" }}
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                    {/* Area: si riempie dopo che la linea si è disegnata */}
                    <path
                      className="imm-detail-area"
                      d={`${DETAIL_D} L400,80 L0,80 Z`}
                      fill="url(#imm-db2-detail-grad)"
                      style={{ opacity: 0 }}
                    />
                    <path
                      className="imm-detail-path stroke-accent"
                      d={DETAIL_D}
                      fill="none"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="text-muted mt-1 flex justify-between text-[9px] font-medium">
                    {["Sett. 1", "Sett. 2", "Sett. 3", "Sett. 4"].map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ④ ORDINI: mini-KPI + tabella + dettaglio ordine ───────────────── */}
            <div className="w-1/4 shrink-0 overflow-hidden p-5">
              <div className="mx-auto max-w-5xl">
                <p className="text-foreground mb-3 font-semibold">Ordini recenti</p>

                {/* Mini-KPI della vista ordini: entrano e contano prima della tabella */}
                <div className="mb-3 grid grid-cols-3 gap-3">
                  {ORD_STATS.map((s, i) => (
                    <div
                      key={s.label}
                      className="imm-ord-stat border-border bg-surface rounded-xl border p-3 shadow-sm"
                    >
                      <p
                        className={`imm-ord-stat-val-${i} text-accent-ink font-display text-xl font-bold tabular-nums`}
                      >
                        0
                      </p>
                      <p className="text-muted mt-0.5 text-xs">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="border-border bg-surface overflow-hidden rounded-xl border shadow-sm">
                  {/* Intestazione tabella */}
                  <div className="bg-surface-2 text-muted grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-3 px-4 py-2 text-[11px] font-semibold tracking-wider uppercase">
                    <span>N°</span>
                    <span>Cliente</span>
                    <span>Data</span>
                    <span>Canale</span>
                    <span>Importo</span>
                    <span>Stato</span>
                  </div>

                  {/* Righe compatte: entrano con slide+fade staggered. La PRIMA
                      (`imm-ord-first`) è il bersaglio del click che apre il
                      dettaglio; `imm-ord-active` = highlight della selezione. */}
                  <div className="divide-border divide-y">
                    {ORDINI.map((o, oi) => (
                      <div
                        key={o.n}
                        className={`imm-ord-row relative grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-3 px-4 py-2 text-sm ${
                          oi === 0 ? "imm-ord-first" : ""
                        }`}
                      >
                        {oi === 0 && (
                          <span
                            className="imm-ord-active bg-accent-soft pointer-events-none absolute inset-0"
                            aria-hidden
                          />
                        )}
                        <span className="text-muted font-mono text-xs">{o.n}</span>
                        <span className="text-foreground font-medium">{o.cliente}</span>
                        <span className="text-muted font-mono text-xs">{o.data}</span>
                        <span className="text-muted text-xs">{o.canale}</span>
                        <span className="text-foreground font-mono">{o.importo}</span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATO_CLS[o.stato] ?? "bg-surface-2 text-muted"}`}
                        >
                          {o.stato}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totale periodo (mock statico) — somma degli importi sopra. */}
                  <div className="border-border bg-surface-2 flex items-center justify-between border-t px-4 py-2.5">
                    <span className="text-muted text-xs font-semibold tracking-wide uppercase">
                      Totale periodo
                    </span>
                    <span className="text-foreground font-mono text-sm font-bold">16.889 €</span>
                  </div>
                </div>

                {/* DETTAGLIO ordine #1042: si apre al click sulla prima riga —
                    righe articolo, spedizione e consegna (somma = 2.340 €). */}
                <div
                  className="imm-ord-detail border-accent/40 bg-surface mt-3 rounded-xl border-2 p-4 shadow-sm"
                  style={{ opacity: 0 }}
                  aria-hidden
                >
                  <div className="mb-2.5 flex items-center justify-between">
                    <p className="text-foreground text-sm font-semibold">
                      Ordine <span className="font-mono">#1042</span> · Rossi S.r.l.
                    </p>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                      Completato
                    </span>
                  </div>
                  <div className="divide-border divide-y text-sm">
                    {[
                      { articolo: "Wallbox 22 kW", qta: "×2", importo: "1.798 €" },
                      { articolo: "Cavo Type 2 · 5 m", qta: "×3", importo: "447 €" },
                      { articolo: "Spedizione espressa", qta: "—", importo: "95 €" },
                    ].map((r) => (
                      <div
                        key={r.articolo}
                        className="grid grid-cols-[1fr_auto_auto] items-center gap-4 py-1.5"
                      >
                        <span className="text-foreground">{r.articolo}</span>
                        <span className="text-muted text-xs">{r.qta}</span>
                        <span className="text-foreground font-mono text-xs">{r.importo}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-border mt-1 flex items-center justify-between border-t pt-2">
                    <span className="text-muted text-xs">
                      Consegna: <span className="text-foreground font-semibold">30/06 · Torino</span>
                    </span>
                    <span className="text-foreground font-mono text-sm font-bold">2.340 €</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Title card di capitolo (P12): apre la scena al posto del vecchio veil
          <Say i={0}>; la frase del veil diventa il sottotitolo della card. */}
      <ChapterCard
        chapter={CHAPTERS[3]}
        subtitle="La dashboard: il tuo business, in tempo reale."
      />

      {/* Frasi-intermezzo DESCRITTIVE (spiegano, non vendono): caption lower-third. */}
      <Say i={1} variant="caption">
        Modifichi i contenuti del sito: online subito.
      </Say>
      <Say i={2} variant="caption">
        Il catalogo prodotti: aggiungi e aggiorni in un click.
      </Say>
      <Say i={3} variant="caption">
        Visite, utenti e conversioni, sempre aggiornati.
      </Say>
      <Say i={4} variant="caption">
        Gli ordini, con data e canale, in un&apos;unica vista.
      </Say>
    </ImmersiveStage>
  );
}
