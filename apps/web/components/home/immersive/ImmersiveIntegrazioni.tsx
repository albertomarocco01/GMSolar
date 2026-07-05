"use client";

/**
 * @descrizione  Scena immersiva INTEGRAZIONI (08 · Integrazioni). Tema CHIARO,
 *   tono DESCRITTIVO. Il focus visivo è il MOVIMENTO: una CARRELLATA di loghi
 *   su 3 righe orizzontali (6 per riga) che scorrono in direzioni alternate,
 *   pilotate dalla timeline scrubbata (ease "none" → deterministiche avanti e
 *   indietro), mentre le tile compaiono a ondata. La scena culmina in un
 *   ESEMPIO CONCRETO: il cursore clicca la tile WhatsApp e si apre una chat
 *   mock in stile WhatsApp (header nel verde ufficiale del brand, bolle di
 *   notifica una alla volta). Le icone sono loghi brand reali da `simple-icons`,
 *   resi nel colore ufficiale (`#${icon.hex}`) dentro tile neutre (token).
 *
 *   REGIA DI CAMERA (P11) — inquadrature sul layer `.imm-camera` del kit:
 *   CONTRO-PAN laterale lieve in sync con la carrellata (tween diretto, ease
 *   "none"), PUNCH-IN (a) sulla tile WhatsApp, RACK FOCUS (e) sul wall quando
 *   si apre la chat, PUSH-IN lento (b) durante la lettura delle bolle e
 *   PULL-BACK reveal (f) = cameraReset sulla griglia piena. Il reset vive in
 *   ENTRAMBI i rami (animato e reduced) → camera neutra a progress(1).
 *
 *   CAPITOLI (P12): la scena si apre con la title card scura «07 · Integrazioni»
 *   (`<ChapterCard>` animata da `chapterIntro`, PRIMO beat — prima del
 *   contro-pan), che sostituisce la vecchia Say-veil di apertura; la caption
 *   resta invariata e a progress(1) la card finisce nascosta.
 *
 *   Reduced-motion: il kit porta la timeline a progress(1) → la RICHIUSURA
 *   della chat vive SOLO nel percorso animato (ramo `!reduced`), così lo stato
 *   finale ridotto è "tutte le tile visibili + chat aperta e leggibile", senza
 *   nulla a metà; in cima resta un heading statico del capitolo. Il float continuo per-tile (solo `y`, loop infinito, fuori
 *   dallo scroll) parte solo se l'utente non ha richiesto meno movimento;
 *   essendo fuori dalla timeline scrubbata, ascolta `presentation:pausechange`
 *   (pausa globale di AutoScroll) per fermarsi/riprendere insieme alla home.
 *
 * Usa il kit condiviso `./shared`.
 */
import { cn } from "@gmgroup/lib/utils";
import { gsap } from "@gmgroup/lib/gsap";
import { useReducedMotion } from "@gmgroup/lib/motion";
import {
  siAirtable,
  siDiscord,
  siGmail,
  siGooglecalendar,
  siGooglesheets,
  siHubspot,
  siInstagram,
  siMailchimp,
  siMeta,
  siNotion,
  siPaypal,
  siShopify,
  siStripe,
  siTelegram,
  siTrello,
  siWhatsapp,
  siWoocommerce,
  siZapier,
} from "simple-icons";
import {
  ImmersiveStage,
  Say,
  say,
  CHAPTERS,
  ChapterCard,
  chapterIntro,
  cameraReset,
  cameraTo,
  cursorTo,
  pressButton,
  rackFocus,
  rackFocusOff,
  useImmersiveScene,
} from "./shared";

// ─── Dati statici ────────────────────────────────────────────────────────────

/** Forma minima di un'icona di `simple-icons` usata da questa scena. */
type BrandIcon = { path: string; hex: string; title: string };

/**
 * La CARRELLATA: 3 righe da 6 loghi. WhatsApp sta nella riga centrale, vicino
 * al centro, così il click e la chat che si apre restano nel cuore dell'inquadratura.
 */
const ROWS: BrandIcon[][] = [
  [siGmail, siStripe, siShopify, siGooglesheets, siHubspot, siTelegram],
  [siInstagram, siMeta, siWhatsapp, siDiscord, siGooglecalendar, siNotion],
  [siTrello, siAirtable, siPaypal, siWoocommerce, siMailchimp, siZapier],
];

/** Direzione del pan per riga: la riga centrale va in contro-movimento. */
const rowDir = (i: number) => (i === 1 ? -1 : 1);

/** Durata (unità timeline scrubbata) del pan della carrellata: la condividono
 *  le righe e il CONTRO-PAN della camera, e àncora il punch sulla tile WhatsApp
 *  che parte SOLO a pan concluso (le misure function-based della camera vanno
 *  fatte su layout fermo — regola 2 del kit). */
const PAN_DUR = 2.6;

/** Chat mock deterministica (orari fissi, testo fisso): esempio WhatsApp. */
const CHAT = {
  name: "GM Solar",
  msg1: "⚡ Ricarica completata — 12,6 kWh · Colonnina Torino Nord",
  msg2: "Ricevuta n. 0421 disponibile nell'app.",
  reply: "Grazie! 👍",
  t1: "14:32",
  t2: "14:33",
};

// ─── Componente ──────────────────────────────────────────────────────────────

export default function ImmersiveIntegrazioni() {
  // Reduced-motion (markup): il kit porta la timeline a progress(1) → la
  // ChapterCard finisce nascosta come il vecchio veil. L'heading statico del
  // capitolo in cima (vedi markup) tiene leggibile il contesto nel fallback.
  const reducedStatic = useReducedMotion();
  const ref = useImmersiveScene((tl, section) => {
    // Rispettiamo la preferenza di sistema senza dipendenze esterne: decide sia
    // il float continuo sia il ramo di RICHIUSURA della chat (vedi beat ④).
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Elementi reali → animati per riferimento: le righe portano il pan della
    // carrellata, le tile l'entrata a ondata + il float; il filtro "dim" al
    // click esclude la tile WhatsApp (che resta protagonista).
    const rows = Array.from(section.querySelectorAll<HTMLElement>(".imm-int-row"));
    const tiles = Array.from(section.querySelectorAll<HTMLElement>(".imm-tile"));
    const wa = section.querySelector<HTMLElement>(".imm-int-wa");
    const others = tiles.filter((t) => t !== wa);

    // ── Stato iniziale: tile rimpicciolite/invisibili; righe già "fuori asse"
    //    nel verso di partenza del pan; chat e bolle spente ──
    gsap.set(tiles, { scale: 0.6, autoAlpha: 0 });
    rows.forEach((row, i) => gsap.set(row, { xPercent: 8 * rowDir(i), willChange: "transform" }));
    gsap.set(".imm-int-chat", { autoAlpha: 0, scale: 0.9, y: 12, transformOrigin: "50% 50%" });
    gsap.set([".imm-int-msg-1", ".imm-int-msg-2", ".imm-int-msg-3"], { autoAlpha: 0, y: 10 });
    gsap.set(".imm-int-typing", { autoAlpha: 0 });

    // ── ⓪ TITLE CARD di capitolo (P12): «07 · Integrazioni». PRIMO beat della
    //    timeline, PRIMA del primo beat camera (il contro-pan alla label
    //    "carrellata" qui sotto). Sostituisce la vecchia Say-veil di apertura:
    //    la frase del velo vive ora nel sottotitolo della <ChapterCard>. ──
    chapterIntro(tl);

    // ── ① CARRELLATA: le righe scorrono in direzioni alternate (riga 1: 8→-8,
    //    riga 2: -8→8, riga 3: 8→-8; ease "none" su TUTTO il beat → il moto è
    //    lineare e scrub-safe) mentre le tile compaiono a ondata dal centro ──
    tl.addLabel("carrellata");
    rows.forEach((row, i) => {
      tl.to(row, { xPercent: -8 * rowDir(i), duration: PAN_DUR, ease: "none" }, "carrellata");
    });
    // CAMERA · CONTRO-PAN laterale (P11): la camera scivola CONTRO le due righe
    // esterne (che dominano il moto verso sinistra) — parallasse da carrello che
    // ne amplifica la velocità relativa. Tween DIRETTO su `.imm-camera` (solo
    // `x`, lieve): eccezione prevista dal prompt P11 perché nessun helper copre
    // il pan lineare scrubbato; ease "none" e stessa finestra della label
    // "carrellata" → deterministico avanti/indietro, in sync con le righe. La
    // `x` residua viene riassorbita dal punch successivo (cameraTo è robusto a
    // camera già trasformata) e azzerata dal cameraReset finale.
    tl.to(".imm-camera", { x: -16, duration: PAN_DUR, ease: "none" }, "carrellata");
    tl.to(
      tiles,
      {
        scale: 1,
        autoAlpha: 1,
        duration: 0.5,
        // Ondata radiale deterministica: le tile sono in DOM in ordine di riga
        // (3×6), quindi il grid-stagger dal centro produce un'onda concentrica.
        stagger: { each: 0.07, grid: [3, 6], from: "center" },
        ease: "back.out(1.7)",
      },
      "carrellata+=0.1",
    );

    // ── ② ESEMPIO WHATSAPP: PUNCH di camera sulla tile, il cursore clicca, il
    //    resto perde fuoco (rack focus) e si apre la chat mock centrata ──
    // CAMERA · PUNCH-IN (a): la camera si tuffa sulla tile WhatsApp con micro-
    // overshoot (back.out). Parte SOLO a pan concluso (àncora esplicita, NON
    // ">": l'ultimo tween inserito è la stagger delle tile che finisce prima
    // delle righe) così la misura function-based avviene su tile ferma. Nessun
    // clickZoom locale da rimuovere su questo beat (regola 4): c'era solo il
    // pressButton, che resta — è la pressione del bottone, non uno zoom.
    cameraTo(tl, ".imm-int-wa", {
      scale: 1.45,
      duration: 0.5,
      ease: "back.out(1.2)",
      position: `carrellata+=${PAN_DUR}`,
    });
    // Regola 2 del kit: camera PRIMA, cursore per ULTIMO (append in coda, parte
    // a punch concluso) → cursorTo misura il layout ormai zoomato e assestato;
    // il cursore vive FUORI da `.imm-camera`, quindi la mira resta esatta.
    cursorTo(tl, ".imm-int-wa", { mode: "hand" });
    pressButton(tl, ".imm-int-wa");
    // Dim locale dei loghi non protagonisti: 0.45 (non più 0.25) perché ora si
    // SOMMA al rack focus sul wall (0.45 × 0.55 ≈ 0.25 → resa percepita di prima).
    tl.to(others, { autoAlpha: 0.45, duration: 0.5, ease: "power2.out" }, ">-0.2");
    tl.to(
      ".imm-int-chat",
      { autoAlpha: 1, scale: 1, y: 0, duration: 0.55, ease: "back.out(1.5)" },
      "<0.1",
    );
    tl.addLabel("chat", "<"); // inizio apertura chat: àncora per le bolle
    // CAMERA · RACK FOCUS (e): la chat prende il primo piano, la carrellata
    // dietro perde fuoco (opacity+scale sul wall, niente blur). Si ripristina
    // con rackFocusOff alla chiusura (ramo !reduced); se la chat resta aperta
    // (reduced) lo stato sfocato è un finale legittimo — la CAMERA invece torna
    // comunque neutra (vedi beat ④).
    rackFocus(tl, ".imm-int-wall", { position: "chat" });
    // Il cursore esce di scena con l'apertura della chat: ha finito il compito
    // e i movimenti di camera successivi (push-in, pull-back) lo lascerebbero
    // visibilmente disallineato dalla tile (criterio P11: mai offset cursore↔
    // target dopo un movimento di camera). Scrubbando indietro riappare.
    tl.to(".imm-cursor", { autoAlpha: 0, duration: 0.3, ease: "power2.out" }, "chat");

    // ── ③ Sequenza bolle (fade+rise, una alla volta) con caption in parallelo ──
    say(tl, 1); // «Per esempio: le notifiche ti arrivano su WhatsApp.»
    tl.to(".imm-int-msg-1", { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, "chat+=0.7");
    tl.to(".imm-int-typing", { autoAlpha: 1, duration: 0.25, ease: "power2.out" }, ">0.35");
    tl.to(".imm-int-typing", { autoAlpha: 0, duration: 0.2, ease: "power2.in" }, ">0.55");
    tl.to(".imm-int-msg-2", { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, "<0.05");
    tl.to(".imm-int-msg-3", { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, ">0.4");
    // CAMERA · PUSH-IN lento (b): mentre le bolle arrivano, la camera avanza
    // piano sulla chat (1.45 → 1.5, respiro da documentario). Àncora esplicita
    // "chat+=0.6": a tween start la chat è già aperta e ferma (apertura 0.55s)
    // → misura function-based stabile; finisce prima della chiusura, quindi non
    // si sovrappone mai al pull-back (un solo tween di camera alla volta).
    cameraTo(tl, ".imm-int-chat", {
      scale: 1.5,
      duration: 2.2,
      ease: "power1.inOut",
      position: "chat+=0.6",
    });
    tl.to({}, { duration: 0.6 }); // hold: tempo di lettura della conversazione

    // ── ④ CHIUSURA — la richiusura della chat vive solo nel percorso animato.
    //    Con reduced-motion il kit salta a progress(1) e lo stato finale è "chat
    //    aperta e leggibile" (il rack focus resta: finale legittimo); le tile
    //    tornano comunque a piena opacità (niente elementi a metà). La CAMERA
    //    invece torna NEUTRA in ENTRAMBI i rami (regola 3 del kit: a progress(1)
    //    deve essere x:0 / y:0 / scale:1, per reduced-motion e hand-off puliti). ──
    if (!reduced) {
      tl.to(
        ".imm-int-chat",
        { autoAlpha: 0, scale: 0.92, y: 12, duration: 0.35, ease: "power2.in" },
        ">0.3",
      );
      // Il fondale torna a fuoco insieme alla chiusura della chat…
      rackFocusOff(tl, ".imm-int-wall", { position: "<" });
      tl.to(others, { autoAlpha: 1, duration: 0.45, ease: "power2.out" }, "<");
      // …e CAMERA · PULL-BACK REVEAL (f): dal push sulla chat (1.5) a campo
      // largo (1) sulla griglia piena — il cameraReset È il pull-back, in sync
      // con la riapertura del fondale. Obbligatorio prima della fine timeline.
      cameraReset(tl, { duration: 0.9, position: "<" });
      tl.to({}, { duration: 0.5 }); // respiro finale sulla carrellata piena e pulita
    } else {
      tl.to(others, { autoAlpha: 1, duration: 0.3 }, ">");
      // Ramo reduced: la chat resta aperta ma la camera DEVE finire neutra anche
      // qui — a progress(1) l'ultimo stato di camera è questo reset (regola 3).
      cameraReset(tl, { duration: 0.3, position: "<" });
    }

    // ── Float continuo sfalsato (motion-safe, indipendente dallo scroll) ─────
    // Anima SOLO `y`: entrata (scale/autoAlpha), dim (autoAlpha) e pan delle
    // righe (xPercent su ALTRI elementi) usano altre proprietà/nodi, quindi le
    // animazioni non si sovrascrivono.
    if (!reduced) {
      // Tween raccolti in un array: essendo repeat:-1 FUORI dalla timeline
      // scrubbata, sono gli unici moti qui che la PAUSA GLOBALE della
      // presentazione (click → AutoScroll) non fermerebbe da sola.
      const floats = tiles.map((tile, i) =>
        gsap.to(tile, {
          y: "-=8",
          duration: 1.6 + (i % 5) * 0.2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: (i % 6) * 0.18,
        }),
      );

      // PAUSA GLOBALE: AutoScroll emette `presentation:pausechange` al click di
      // pausa/ripresa → i float si congelano e ripartono dallo stato in cui erano.
      const onPauseChange = (e: Event) => {
        const paused = Boolean((e as CustomEvent<{ paused: boolean }>).detail?.paused);
        floats.forEach((t) => (paused ? t.pause() : t.resume()));
      };
      window.addEventListener("presentation:pausechange", onPauseChange);
      // Montaggio a presentazione GIÀ in pausa (es. remount): parte congelato.
      if (document.documentElement.hasAttribute("data-presentation-paused")) {
        floats.forEach((t) => t.pause());
      }
      // Cleanup nel revert del gsap.context: `build` non ha un canale di ritorno,
      // ma il revert del kit KILLA i float — che, infiniti, non completano mai →
      // scatta `onInterrupt` ed è lì che togliamo il listener. Sentinella sul
      // primo tween (delay 0, sempre attivo); removeEventListener è idempotente.
      floats[0]?.eventCallback("onInterrupt", () =>
        window.removeEventListener("presentation:pausechange", onPauseChange),
      );
    }
  });

  return (
    // `label` (→ aria-label della section) e HUD leggono entrambi da CHAPTERS:
    // fonte unica per nome e numero del capitolo (P12).
    <ImmersiveStage
      ref={ref}
      heightVh={520}
      theme="platform"
      label={CHAPTERS[7].title}
      chapterIndex={7}
    >
      <div className="relative flex h-full flex-col items-center justify-center px-6 py-16 sm:px-10">
        {/* Reduced-motion: a progress(1) la ChapterCard è nascosta → heading
            statico del capitolo in cima, coerente col fallback "chat aperta e
            tile piene" (nulla di animato, solo contesto leggibile). */}
        {reducedStatic && (
          <p className="text-muted absolute top-6 left-1/2 -translate-x-1/2 font-mono text-xs tracking-[0.35em] uppercase">
            {CHAPTERS[7].n} · {CHAPTERS[7].title}
          </p>
        )}
        {/* CARRELLATA DI LOGHI — 3 righe orizzontali da 6 tile, pan alternato */}
        <div className="imm-int-wall flex w-full flex-col items-center gap-4 sm:gap-5">
          {ROWS.map((row, r) => (
            <div key={r} className="imm-int-row flex justify-center gap-4 sm:gap-5">
              {row.map((icon) => (
                <div
                  key={icon.title}
                  className={cn(
                    "imm-tile border-border bg-surface flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border shadow-sm sm:h-24 sm:w-24",
                    icon === siWhatsapp && "imm-int-wa",
                  )}
                  style={{ opacity: 0 }}
                >
                  {/* Logo nel colore ufficiale del brand (hex di simple-icons). */}
                  <svg
                    viewBox="0 0 24 24"
                    role="img"
                    aria-label={icon.title}
                    className="h-9 w-9 sm:h-10 sm:w-10"
                    focusable="false"
                  >
                    <title>{icon.title}</title>
                    <path d={icon.path} fill={`#${icon.hex}`} />
                  </svg>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* CHAT WHATSAPP (mock) — si apre al click sulla tile; wrapper flex per il
            centraggio così GSAP anima scale/y senza pestare i translate CSS */}
        <div
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
          aria-hidden
        >
          <div
            className="imm-int-chat border-border bg-background w-[340px] overflow-hidden rounded-2xl border shadow-2xl"
            style={{ opacity: 0 }}
          >
            {/* Header nel verde UFFICIALE del brand (hex da simple-icons, mai hardcodato) */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ background: `#${siWhatsapp.hex}` }}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold"
                style={{ color: `#${siWhatsapp.hex}` }}
              >
                GM
              </span>
              <div className="min-w-0 leading-tight">
                <p className="text-sm font-semibold text-white">{CHAT.name}</p>
                <p className="text-xs text-white/80">online</p>
              </div>
              <svg viewBox="0 0 24 24" className="ml-auto h-5 w-5 shrink-0" aria-hidden>
                <path d={siWhatsapp.path} fill="#ffffff" />
              </svg>
            </div>

            {/* Corpo chat su fondo chiaro (token): bolle in entrata a sinistra,
                risposta del cliente a destra */}
            <div className="bg-surface-2 flex flex-col gap-2 px-3 py-4">
              {/* ① Notifica in entrata dal sistema */}
              <div
                className="imm-int-msg-1 border-border bg-surface max-w-[85%] self-start rounded-xl rounded-tl-sm border px-3 py-2 shadow-sm"
                style={{ opacity: 0 }}
              >
                <p className="text-foreground text-xs">{CHAT.msg1}</p>
                <p className="text-muted mt-1 text-right text-[0.6rem]">{CHAT.t1}</p>
              </div>

              {/* ② Typing-dots e seconda bolla nella STESSA cella: l'indicatore
                  sfuma e lascia il posto al messaggio, senza buchi nel layout */}
              <div className="relative max-w-[85%] self-start">
                <div
                  className="imm-int-typing border-border bg-surface text-muted absolute top-0 left-0 flex items-center gap-1 rounded-xl rounded-tl-sm border px-3 py-2.5 shadow-sm"
                  style={{ opacity: 0 }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                </div>
                <div
                  className="imm-int-msg-2 border-border bg-surface rounded-xl rounded-tl-sm border px-3 py-2 shadow-sm"
                  style={{ opacity: 0 }}
                >
                  <p className="text-foreground text-xs">{CHAT.msg2}</p>
                  <p className="text-muted mt-1 text-right text-[0.6rem]">{CHAT.t1}</p>
                </div>
              </div>

              {/* ③ Risposta del cliente: bolla verde tenue derivata dal hex brand */}
              <div
                className="imm-int-msg-3 max-w-[85%] self-end rounded-xl rounded-tr-sm px-3 py-2 shadow-sm"
                style={{ opacity: 0, background: `#${siWhatsapp.hex}26` }}
              >
                <p className="text-foreground text-xs">{CHAT.reply}</p>
                <p className="text-muted mt-1 flex items-center justify-end gap-1 text-[0.6rem]">
                  {CHAT.t2}
                  <span style={{ color: `#${siWhatsapp.hex}` }}>✓✓</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Title card di capitolo (P12) + caption descrittiva ───────────────
          La ChapterCard sostituisce la vecchia Say-veil di apertura (la frase
          del velo è il suo sottotitolo); la caption resta invariata. */}
      <ChapterCard chapter={CHAPTERS[7]} subtitle="Ci integriamo con i sistemi di tutti i giorni." />
      <Say i={1} variant="caption">
        Per esempio: le notifiche ti arrivano su WhatsApp.
      </Say>
    </ImmersiveStage>
  );
}
