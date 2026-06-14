import Link from "next/link";
import Container from "@/components/ui/Container";
import { GROUP, WORLDS } from "@/lib/site";

/** Footer con anagrafica reale del gruppo e navigazione ai tre mondi. */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-border/70 text-muted mt-auto border-t py-12 text-sm">
      <Container className="grid gap-10 md:grid-cols-3">
        {/* Gruppo + anagrafica societaria (dati reali). */}
        <div className="space-y-3">
          <p className="font-display text-foreground text-base font-bold tracking-tight">
            GM<span className="text-accent-ink">Group</span>
          </p>
          <p className="max-w-xs">{GROUP.tagline}</p>
          <address className="text-muted/90 space-y-0.5 not-italic">
            <p className="text-foreground/80 font-medium">{GROUP.legalName}</p>
            <p>{GROUP.city}</p>
            <p>P.IVA {GROUP.vat}</p>
          </address>
        </div>

        {/* I tre mondi. */}
        <nav aria-label="I mondi del gruppo" className="space-y-3">
          <p className="text-foreground/80 font-medium">I nostri mondi</p>
          <ul className="space-y-2">
            {WORLDS.map((world) => (
              <li key={world.href}>
                <Link href={world.href} className="hover:text-foreground transition-colors">
                  {world.brand}
                  <span className="text-muted"> — {world.role}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contatti. */}
        <div className="space-y-3">
          <p className="text-foreground/80 font-medium">Contatti</p>
          <a href={`mailto:${GROUP.email}`} className="hover:text-foreground transition-colors">
            {GROUP.email}
          </a>
        </div>
      </Container>

      <Container className="border-border/60 text-muted/80 mt-10 flex flex-col gap-2 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} {GROUP.legalName} — demo dimostrativa
        </p>
        <p>Energia solare · Mobilità elettrica · Accessori di ricarica</p>
      </Container>
    </footer>
  );
}
