import Image from "next/image";
import Link from "next/link";
import Card from "@gmgroup/ui/Card";
import ScrollReveal from "@gmgroup/ui/ScrollReveal";
import { WORLDS } from "@gmgroup/lib/site";

/**
 * Le tre "porte" verso i mondi del gruppo. Ogni porta usa il colore STATICO
 * del proprio brand (world.colorVar, via CSS var --door) per il bordo in hover,
 * la barra superiore e gli accenti — così i tre brand convivono nella stessa
 * vista (qui non si consuma l'accent attivo, che sarebbe uno solo).
 */
export default function WorldDoors() {
  return (
    <ScrollReveal className="grid gap-6 md:grid-cols-3" stagger={0.12} y={32}>
      {WORLDS.map((world) => (
        <Link
          key={world.href}
          href={world.href}
          aria-label={`Entra in ${world.brand} — ${world.role}`}
          className="group block h-full"
          style={{ "--door": world.colorVar, "--door-ink": world.inkVar } as React.CSSProperties}
        >
          <Card className="ease-out-expo group-hover:shadow-lift flex h-full flex-col overflow-hidden p-0 transition-[transform,box-shadow,border-color] duration-(--duration-base) group-hover:-translate-y-1 group-hover:border-(--door)">
            {/* Barra colore brand. */}
            <span
              aria-hidden
              className="block h-1.5 w-full"
              style={{ background: "var(--door)" }}
            />

            {/* Pannello logo su fondo chiaro: i loghi restano leggibili in ogni tema. */}
            <div className="flex h-28 items-center justify-center bg-white px-8">
              <Image
                src={world.logo}
                alt={`${world.brand} logo`}
                width={220}
                height={72}
                className="h-12 w-auto object-contain"
                sizes="(max-width: 768px) 60vw, 220px"
              />
            </div>

            <div className="flex flex-1 flex-col p-6">
              <div className="flex items-center gap-2">
                <span
                  className="font-display text-sm font-bold"
                  style={{ color: "var(--door-ink)" }}
                >
                  {world.step}
                </span>
                <span className="text-muted text-xs font-medium tracking-widest uppercase">
                  {world.role}
                </span>
              </div>

              <h3 className="font-display mt-2 text-xl font-bold tracking-tight">{world.brand}</h3>
              <p className="text-foreground/70 mt-0.5 text-sm font-medium">{world.tagline}</p>
              <p className="text-muted mt-3 flex-1 text-sm leading-relaxed">{world.description}</p>

              <span
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium transition-colors group-hover:gap-2.5"
                style={{ color: "var(--door)" }}
              >
                Entra
                <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </div>
          </Card>
        </Link>
      ))}
    </ScrollReveal>
  );
}
