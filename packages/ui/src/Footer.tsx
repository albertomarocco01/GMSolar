import Link from "next/link";
import Container from "./Container";
import { GROUP, SERVICES } from "@gmgroup/lib/site";

/** Footer neutro (no branding): tagline della presentazione + indice servizi + contatto demo. */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-border/70 text-muted mt-auto border-t py-12 text-sm">
      <Container className="grid gap-10 md:grid-cols-3">
        {/* Presentazione (no anagrafica reale). */}
        <div className="space-y-3">
          <p className="font-display text-foreground flex items-center gap-2 text-base font-bold tracking-tight">
            <span aria-hidden className="bg-accent inline-block h-4 w-4 rounded-[5px]" />
            {GROUP.name}
          </p>
          <p className="max-w-xs">{GROUP.tagline}</p>
        </div>

        {/* Indice dei servizi. */}
        <nav aria-label="I servizi" className="space-y-3">
          <p className="text-foreground/80 font-medium">Servizi</p>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SERVICES.map((s) => (
              <li key={s.key}>
                <Link href={s.href} className="hover:text-foreground transition-colors">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contatto demo. */}
        <div className="space-y-3">
          <p className="text-foreground/80 font-medium">Parla con noi</p>
          <a href={`mailto:${GROUP.email}`} className="hover:text-foreground transition-colors">
            {GROUP.email}
          </a>
        </div>
      </Container>

      <Container className="border-border/60 text-muted/80 mt-10 flex flex-col gap-2 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} — presentazione dimostrativa</p>
        <p>Siti vetrina · Assistenti AI · Dashboard · Gestionale · Integrazioni</p>
      </Container>
    </footer>
  );
}
