import Section from "@gmgroup/ui/Section";
import ScrollReveal from "@gmgroup/ui/ScrollReveal";
import { IconShield } from "@/components/solar/SolarIcons";

/* =============================================================
   PLACEHOLDER demo (vedi NOTES-shared.md): nomi clienti/partner e
   certificazioni sono SEGNAPOSTO, da sostituire con i loghi reali e le
   certificazioni effettivamente possedute da GM Solar. Non sono claim
   verificati. Strutturati per la sostituzione (basta cambiare le liste).
   ============================================================= */
const CLIENTS = [
  "Industrie Po",
  "Logistica Nord",
  "AgriTech",
  "MetalCo",
  "ColdStore",
  "Comune di Esempio",
];

const CERTS = [
  { label: "ISO 9001", sub: "Qualità" },
  { label: "ISO 14001", sub: "Ambiente" },
  { label: "ISO 45001", sub: "Sicurezza" },
] as const;

/** Wordmark monocromo: faux-logo placeholder, uniforme, stile "logo wall". */
function ClientLogo({ name }: { name: string }) {
  return (
    <span className="text-muted hover:text-foreground inline-flex items-center gap-2 opacity-70 transition-colors hover:opacity-100">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="3.4" fill="currentColor" />
      </svg>
      <span className="font-display text-lg font-bold tracking-tight">{name}</span>
    </span>
  );
}

/**
 * Trust band: prova sociale (loghi clienti/partner) + certificazioni del
 * processo EPC. Tutti i contenuti sono PLACEHOLDER sostituibili (vedi sopra).
 */
export default function SolarTrust() {
  return (
    <Section
      id="referenze"
      className="bg-surface border-border border-y"
      aria-label="Clienti e certificazioni"
    >
      <p className="text-accent-ink text-center text-xs font-medium tracking-[0.25em] uppercase">
        Aziende ed enti che hanno scelto GM Solar
      </p>

      <ScrollReveal
        className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6"
        stagger={0.06}
        y={16}
      >
        {CLIENTS.map((name) => (
          <ClientLogo key={name} name={name} />
        ))}
      </ScrollReveal>

      <div className="border-border mx-auto mt-12 max-w-3xl border-t pt-10">
        <p className="text-muted text-center text-sm">
          Qualità, ambiente e sicurezza certificati lungo tutto il processo EPC.
        </p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-4">
          {CERTS.map((c) => (
            <li
              key={c.label}
              className="border-border bg-background inline-flex items-center gap-3 rounded-lg border px-4 py-2.5"
            >
              <span className="text-accent-ink shrink-0">
                <IconShield className="h-6 w-6" />
              </span>
              <span>
                <span className="font-display block text-sm leading-none font-bold">{c.label}</span>
                <span className="text-muted text-xs">{c.sub}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
