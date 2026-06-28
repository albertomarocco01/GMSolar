"use client";

/**
 * @descrizione  Scena immersiva INTEGRAZIONI (05 · Integrazioni). Tema CHIARO,
 *   tono DESCRITTIVO. Niente flusso/pipeline e niente spiegazione dei "perché":
 *   solo un MURO DI LOGHI dei sistemi a cui ci si può collegare, con una frase
 *   generica. Le icone sono loghi brand reali dal pacchetto `simple-icons`
 *   (oggetti con `.path`, `.hex`, `.title`), resi nel colore ufficiale del brand
 *   dentro tile neutre (token: bg-surface + border).
 *
 *   Motion: le tile entrano in stagger (scale + autoAlpha, back.out) e poi
 *   ondeggiano con un float continuo sfalsato per dare vita al muro. Il float è
 *   indipendente dallo scroll e parte SOLO se l'utente non ha richiesto meno
 *   movimento. Reduced-motion: la griglia è statica, completa e leggibile (la
 *   timeline viene portata al suo stato finale dal kit condiviso).
 *
 * Usa il kit condiviso `./shared`.
 */
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
import { ImmersiveStage, Say, say, useImmersiveScene } from "./shared";

// ─── Dati statici ────────────────────────────────────────────────────────────

/** Forma minima di un'icona di `simple-icons` usata da questa scena. */
type BrandIcon = { path: string; hex: string; title: string };

/**
 * Il "muro" di loghi: sistemi reali a cui un'azienda è già collegata ogni
 * giorno (messaggistica, calendari/documenti, pagamenti, e-commerce, CRM,
 * marketing). 18 voci → riempie pulito una griglia a 3 / 4 / 6 colonne.
 */
const ICONS: BrandIcon[] = [
  siWhatsapp,
  siGmail,
  siTelegram,
  siInstagram,
  siMeta,
  siDiscord,
  siGooglecalendar,
  siGooglesheets,
  siNotion,
  siTrello,
  siAirtable,
  siStripe,
  siPaypal,
  siShopify,
  siWoocommerce,
  siHubspot,
  siMailchimp,
  siZapier,
];

// ─── Componente ──────────────────────────────────────────────────────────────

export default function ImmersiveIntegrazioni() {
  const ref = useImmersiveScene((tl, section) => {
    // Rispettiamo la preferenza di sistema senza dipendenze esterne: il float
    // continuo (loop infinito, fuori dallo scroll) parte solo se NON ridotto.
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Le tile sono elementi reali → le animo per riferimento (no selettori
    // scoped) così il float per-tile può avere durate/ritardi diversi.
    const tiles = Array.from(section.querySelectorAll<HTMLElement>(".imm-tile"));

    // ── Stato iniziale: tile rimpicciolite e invisibili ────────────────────
    gsap.set(tiles, { scale: 0.6, autoAlpha: 0 });

    // ── ① Frase d'apertura (generica, descrittiva) ─────────────────────────
    say(tl, 0); // «Ci colleghiamo ai sistemi che usi già.»

    // ── ② Il muro di loghi entra in cascata (scale + autoAlpha, rimbalzo) ───
    tl.to(tiles, {
      scale: 1,
      autoAlpha: 1,
      duration: 0.5,
      stagger: { each: 0.045, from: "start" },
      ease: "back.out(1.8)",
    });

    // Pausa: lascia respirare il muro (e apprezzare il float) prima del finale.
    tl.to({}, { duration: 0.8 });

    // ── ③ Frase di chiusura ────────────────────────────────────────────────
    say(tl, 1); // «WhatsApp, email, CRM, pagamenti e molto altro.»
    tl.to({}, { duration: 0.5 });

    // ── Float continuo sfalsato (motion-safe, indipendente dallo scroll) ───
    // Anima SOLO `y`: l'ingresso scrubbato anima scale/autoAlpha, quindi le due
    // animazioni non si sovrascrivono (proprietà diverse, no overwrite).
    if (!reduced) {
      tiles.forEach((tile, i) => {
        gsap.to(tile, {
          y: "-=8",
          duration: 1.6 + (i % 5) * 0.2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: (i % 6) * 0.18,
        });
      });
    }
  });

  return (
    <ImmersiveStage
      ref={ref}
      heightVh={340}
      theme="platform"
      label="Integrazioni"
      eyebrow="05 · Integrazioni"
    >
      <div className="flex h-full flex-col items-center justify-center px-6 py-16 sm:px-10">
        {/* MURO DI LOGHI — griglia responsive 3 / 4 / 6 colonne */}
        <div className="grid w-full max-w-4xl grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6 lg:gap-5">
          {ICONS.map((icon) => (
            <div
              key={icon.title}
              className="imm-tile border-border bg-surface flex items-center justify-center rounded-xl border p-3 shadow-sm sm:rounded-2xl sm:p-4"
              style={{ opacity: 0 }}
            >
              {/* Logo nel colore ufficiale del brand (hex di simple-icons). */}
              <svg
                viewBox="0 0 24 24"
                role="img"
                aria-label={icon.title}
                className="h-7 w-7 sm:h-8 sm:w-8"
                focusable="false"
              >
                <title>{icon.title}</title>
                <path d={icon.path} fill={`#${icon.hex}`} />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* ── Frasi-intermezzo DESCRITTIVE (niente "perché/come") ───────────── */}
      <Say i={0}>Ci colleghiamo ai sistemi che usi già.</Say>
      <Say i={1}>WhatsApp, email, CRM, pagamenti e molto altro.</Say>
    </ImmersiveStage>
  );
}
