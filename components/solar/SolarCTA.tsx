import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import SplitTextReveal from "@/components/ui/SplitTextReveal";
import { IconArrowRight } from "@/components/solar/SolarIcons";
import { GROUP } from "@/lib/site";

/**
 * CTA di chiusura della sezione Solar: invito al contatto. L'email è quella del
 * gruppo (placeholder in lib/site.ts, vedi NOTES-shared.md).
 */
export default function SolarCTA() {
  return (
    <Section id="contatti" className="bg-brand-950 text-center text-white">
      <SplitTextReveal
        as="h2"
        text="Mettiamo il sole a lavorare per te"
        className="font-display text-display-sm md:text-display-md mx-auto max-w-3xl font-bold tracking-tight text-balance"
      />
      <p className="mx-auto mt-5 max-w-xl text-lg text-white/75">
        Raccontaci consumi e obiettivi: ti rispondiamo con una proposta EPC su misura, dalla
        progettazione alla manutenzione.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href={`mailto:${GROUP.email}`} size="lg">
          Richiedi un sopralluogo
          <IconArrowRight className="h-4 w-4" />
        </Button>
        <Button href="#calcolatore" variant="outline" size="lg" className="text-white">
          Rifai la stima
        </Button>
      </div>
      <p className="text-accent mt-8 text-sm font-medium">{GROUP.email}</p>
    </Section>
  );
}
