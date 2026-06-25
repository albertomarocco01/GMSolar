import Button from "@gmgroup/ui/Button";
import Card from "@gmgroup/ui/Card";
import { cn } from "@gmgroup/lib/utils";
import DemoThumb from "./DemoThumb";
import { ACCENTS, BRAND_LABEL, STATUS } from "./catalog";
import type { Demo } from "./types";

/**
 * Card di una demo nel launcher. Pattern di accessibilità:
 *  - è un `<article>` con un solo link: il bottone "Apri demo" è "stretched"
 *    (`after:absolute after:inset-0`) e copre tutta la card → un'unica area
 *    cliccabile, un solo nome accessibile (niente link annidati o duplicati);
 *  - l'anteprima è decorativa (`aria-hidden`), il titolo è un `<h3>`;
 *  - focus da tastiera: anello attorno all'intera card via `:has(a:focus-visible)`;
 *  - le demo non ancora pronte (`wip`, senza `href`) mostrano un bottone disabilitato.
 * Il colore del brand viaggia in CSS var locali, così la card resta corretta anche
 * se l'accent runtime della pagina è quello del gruppo.
 */
export default function DemoCard({ demo }: { demo: Demo }) {
  const accent = ACCENTS[demo.world];
  const status = STATUS[demo.status];
  const isLive = Boolean(demo.href);

  return (
    <article
      data-demo-card
      style={
        {
          "--card-accent": accent.fill,
          "--card-ink": accent.ink,
          "--card-soft": accent.soft,
        } as React.CSSProperties
      }
      className={cn(
        "group relative h-full rounded-lg",
        // Anello di focus sull'intera card quando il link interno è a fuoco.
        "has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-(--card-ink) has-[a:focus-visible]:ring-offset-2 has-[a:focus-visible]:ring-offset-background",
      )}
    >
      <Card
        interactive={isLive}
        className="flex h-full flex-col overflow-hidden border-t-4 border-t-(--card-accent)"
      >
        <DemoThumb demo={demo} />

        <div className="flex flex-1 flex-col p-5">
          {/* Meta: stato + brand. */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted inline-flex items-center gap-1.5 text-xs font-medium">
              <span className={cn("h-2 w-2 rounded-full", status.dot)} aria-hidden />
              {status.label}
            </span>
            {/* Etichetta brand in neutro: l'accent-ink come testo piccolo non
                garantisce AA su superficie chiara (solar ~4.2:1). Il colore del
                brand resta dato dal bordo superiore e dall'anteprima. */}
            <span className="text-muted text-xs font-semibold tracking-wide uppercase">
              {BRAND_LABEL[demo.world]}
            </span>
          </div>

          <h3 className="font-display mt-3 text-lg font-bold tracking-tight text-balance">
            {demo.title}
          </h3>
          <p className="text-muted mt-2 text-sm leading-relaxed">{demo.description}</p>

          {/* Azione: in fondo (card di altezza uniforme). */}
          <div className="mt-auto pt-5">
            {isLive ? (
              <Button
                href={demo.href}
                size="sm"
                aria-label={`Apri la demo: ${demo.title}`}
                className="after:absolute after:inset-0"
              >
                Apri demo
                <span aria-hidden>→</span>
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                disabled
                aria-label={`«${demo.title}» — in arrivo`}
              >
                In arrivo
              </Button>
            )}
          </div>
        </div>
      </Card>
    </article>
  );
}
