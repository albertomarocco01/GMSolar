"use client";

/**
 * @descrizione  Scena immersiva INTEGRAZIONI (07 · Integrazioni). Tema CHIARO,
 *   tono DESCRITTIVO. Il focus visivo è il MOVIMENTO: una CARRELLATA di loghi
 *   su 3 righe orizzontali (6 per riga) che scorrono in direzioni alternate,
 *   pilotate dalla timeline scrubbata (ease "none" → deterministiche avanti e
 *   indietro), mentre le tile compaiono a ondata. La scena culmina in un
 *   ESEMPIO CONCRETO: il cursore clicca la tile WhatsApp e si apre una chat
 *   mock in stile WhatsApp (header nel verde ufficiale del brand, bolle di
 *   notifica una alla volta). Le icone sono loghi brand reali da `simple-icons`,
 *   resi nel colore ufficiale (`#${icon.hex}`) dentro tile neutre (token).
 *
 *   Reduced-motion: il kit porta la timeline a progress(1) → la RICHIUSURA
 *   della chat vive SOLO nel percorso animato (ramo `!reduced`), così lo stato
 *   finale ridotto è "tutte le tile visibili + chat aperta e leggibile", senza
 *   nulla a metà. Il float continuo per-tile (solo `y`, loop infinito, fuori
 *   dallo scroll) parte solo se l'utente non ha richiesto meno movimento;
 *   essendo fuori dalla timeline scrubbata, ascolta `presentation:pausechange`
 *   (pausa globale di AutoScroll) per fermarsi/riprendere insieme alla home.
 *
 * Usa il kit condiviso `./shared`.
 */
import { cn } from "@gmgroup/lib/utils";
import { gsap } from "@gmgroup/lib/gsap";
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
import { ImmersiveStage, Say, say, cursorTo, pressButton, useImmersiveScene } from "./shared";

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

    // ── ① CARRELLATA: le righe scorrono in direzioni alternate (riga 1: 8→-8,
    //    riga 2: -8→8, riga 3: 8→-8; ease "none" su TUTTO il beat → il moto è
    //    lineare e scrub-safe) mentre le tile compaiono a ondata dal centro ──
    say(tl, 0); // «Ci integriamo con i sistemi di tutti i giorni.»
    tl.addLabel("carrellata");
    rows.forEach((row, i) => {
      tl.to(row, { xPercent: -8 * rowDir(i), duration: 2.6, ease: "none" }, "carrellata");
    });
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

    // ── ② ESEMPIO WHATSAPP: il cursore clicca la tile, il resto sfuma, si apre
    //    la chat mock centrata ──
    cursorTo(tl, ".imm-int-wa", { mode: "hand" }); // parte a pan concluso (append in coda)
    pressButton(tl, ".imm-int-wa");
    tl.to(others, { autoAlpha: 0.25, duration: 0.5, ease: "power2.out" }, ">-0.2");
    tl.to(
      ".imm-int-chat",
      { autoAlpha: 1, scale: 1, y: 0, duration: 0.55, ease: "back.out(1.5)" },
      "<0.1",
    );
    tl.addLabel("chat", "<"); // inizio apertura chat: àncora per le bolle

    // ── ③ Sequenza bolle (fade+rise, una alla volta) con caption in parallelo ──
    say(tl, 1); // «Per esempio: le notifiche ti arrivano su WhatsApp.»
    tl.to(".imm-int-msg-1", { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, "chat+=0.7");
    tl.to(".imm-int-typing", { autoAlpha: 1, duration: 0.25, ease: "power2.out" }, ">0.35");
    tl.to(".imm-int-typing", { autoAlpha: 0, duration: 0.2, ease: "power2.in" }, ">0.55");
    tl.to(".imm-int-msg-2", { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, "<0.05");
    tl.to(".imm-int-msg-3", { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, ">0.4");
    tl.to({}, { duration: 0.6 }); // hold: tempo di lettura della conversazione

    // ── ④ CHIUSURA — solo nel percorso animato. Con reduced-motion il kit salta
    //    a progress(1) e lo stato finale richiesto è "chat aperta e leggibile":
    //    lì la chat NON si richiude, ma le tile tornano comunque a piena opacità
    //    (niente elementi a metà). ──
    if (!reduced) {
      tl.to(
        ".imm-int-chat",
        { autoAlpha: 0, scale: 0.92, y: 12, duration: 0.35, ease: "power2.in" },
        ">0.3",
      );
      tl.to(others, { autoAlpha: 1, duration: 0.45, ease: "power2.out" }, "<");
      tl.to({}, { duration: 0.5 }); // respiro finale sulla carrellata piena e pulita
    } else {
      tl.to(others, { autoAlpha: 1, duration: 0.3 }, ">");
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
    <ImmersiveStage
      ref={ref}
      heightVh={520}
      theme="platform"
      label="Integrazioni"
      eyebrow="07 · Integrazioni"
    >
      <div className="relative flex h-full flex-col items-center justify-center px-6 py-16 sm:px-10">
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

      {/* ── Frasi-intermezzo DESCRITTIVE ─────────────────────────────────────── */}
      <Say i={0}>Ci integriamo con i sistemi di tutti i giorni.</Say>
      <Say i={1} variant="caption">
        Per esempio: le notifiche ti arrivano su WhatsApp.
      </Say>
    </ImmersiveStage>
  );
}
