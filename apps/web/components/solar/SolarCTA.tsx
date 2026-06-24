import Section from "@gmgroup/ui/Section";
import Container from "@gmgroup/ui/Container";
import Button from "@gmgroup/ui/Button";
import SplitTextReveal from "@gmgroup/ui/SplitTextReveal";
import { IconArrowRight } from "@/components/solar/SolarIcons";
import SolarSceneGlow from "@/components/solar/SolarSceneGlow";
import { GROUP } from "@gmgroup/lib/site";

/**
 * CTA di chiusura della sezione Solar: invito al contatto, su banda scura con
 * bagliore accent in parallax (chiude la regia cinematografica della pagina).
 * L'email è quella del gruppo (placeholder in lib/site.ts, vedi NOTES-shared.md).
 */
export default function SolarCTA() {
  return (
    <Section
      id="contatti"
      fullBleed
      className="bg-brand-950 relative isolate overflow-hidden text-center text-white"
    >
      <SolarSceneGlow
        className="bottom-[-45%] left-1/2 h-[80vh] w-[120vw] -translate-x-1/2"
        intensity={0.3}
        from={18}
        to={-12}
      />

      <Container>
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
      </Container>
    </Section>
  );
}
