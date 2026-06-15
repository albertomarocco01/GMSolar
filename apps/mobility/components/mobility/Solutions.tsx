import Section from "@gmgroup/ui/Section";
import Badge from "@gmgroup/ui/Badge";
import Card from "@gmgroup/ui/Card";
import Button from "@gmgroup/ui/Button";
import ScrollReveal from "@gmgroup/ui/ScrollReveal";
import { SOLUTIONS } from "@/components/mobility/content";

/* Spunta in accent per gli elenchi feature. */
function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className="text-accent-ink mt-0.5 size-4 shrink-0">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 10.5l4 4 8-9"
      />
    </svg>
  );
}

/**
 * Sezione 4 — due percorsi: Aziende vs Residenziali. Partner tecnologico:
 * Mennekes (lo standard del connettore Tipo 2). Card riusabili dal design system.
 */
export default function Solutions() {
  return (
    <Section id="soluzioni">
      <div className="mx-auto max-w-2xl text-center">
        <Badge>Le soluzioni</Badge>
        <h2 className="font-display text-display-sm mt-4 font-bold text-balance">
          Due strade, una sola energia
        </h2>
        <p className="text-muted mt-4 text-lg text-pretty">
          Che tu gestisca una flotta o cerchi la wallbox di casa, costruiamo la soluzione di
          ricarica su misura.
        </p>
      </div>

      <ScrollReveal stagger={0.12} className="mt-12 grid gap-5 md:grid-cols-2">
        {SOLUTIONS.map((sol) => (
          <Card key={sol.id} className="flex flex-col p-7 md:p-8">
            <Badge variant="accent" className="self-start">
              {sol.eyebrow}
            </Badge>
            <h3 className="font-display mt-4 text-2xl font-bold">{sol.title}</h3>
            <p className="text-muted mt-2">{sol.description}</p>
            <ul className="mt-6 grid gap-2.5">
              {sol.features.map((f) => (
                <li key={f} className="flex gap-2.5 text-sm">
                  <CheckIcon />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-7 pt-1">
              <Button href={`#configuratore`} variant={sol.id === "business" ? "solid" : "outline"}>
                {sol.cta}
              </Button>
            </div>
          </Card>
        ))}
      </ScrollReveal>

      {/* Partner tecnologico */}
      <div className="border-border mt-12 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-7 text-center sm:flex-row sm:gap-5">
        <span className="text-muted text-xs tracking-widest uppercase">Partner tecnologico</span>
        <span className="font-display text-2xl font-bold tracking-tight">MENNEKES</span>
        <span className="text-muted max-w-xs text-sm">
          Inventori del connettore Tipo 2, lo standard europeo di ricarica.
        </span>
      </div>
    </Section>
  );
}
