"use client";

import { useMemo, useState } from "react";
import Section from "@gmgroup/ui/Section";
import Badge from "@gmgroup/ui/Badge";
import Card from "@gmgroup/ui/Card";
import Button from "@gmgroup/ui/Button";
import { cn } from "@gmgroup/lib/utils";
import { GROUP } from "@gmgroup/lib/site";
import { COUNT_OPTIONS, POWER_OPTIONS, type ConfigUsage } from "@/components/mobility/content";

type Selection = {
  usage: ConfigUsage | null;
  power: string | null;
  count: string | null;
};

const STEPS = ["Dove", "Potenza", "Punti"] as const;

const USAGE_OPTIONS: { value: ConfigUsage; label: string; hint: string }[] = [
  { value: "home", label: "Residenziale", hint: "Casa, box o posto auto privato" },
  { value: "business", label: "Azienda", hint: "Flotte, dipendenti o spazi pubblici" },
];

/* Bottone-opzione riusabile: evidenziato quando selezionato (accent). */
function Option({
  selected,
  title,
  hint,
  onClick,
}: {
  selected: boolean;
  title: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-lg border p-4 text-left transition-colors duration-(--duration-fast)",
        selected
          ? "border-accent bg-accent-soft text-accent-ink"
          : "border-border hover:border-accent/50 hover:bg-surface-2",
      )}
    >
      <span className="block font-semibold">{title}</span>
      {hint && <span className="text-muted mt-0.5 block text-xs">{hint}</span>}
    </button>
  );
}

/**
 * Sezione 6 — Configuratore "che soluzione ti serve": wizard a 3 passi
 * (uso → potenza → numero di punti) → riepilogo + CTA preventivo. Tutto
 * client-side: nessuna chiamata di rete, solo un mailto pre-compilato.
 */
export default function Configurator() {
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState<Selection>({ usage: null, power: null, count: null });

  const powerOptions = useMemo(() => (sel.usage ? POWER_OPTIONS[sel.usage] : []), [sel.usage]);
  const done = sel.usage && sel.power && sel.count;

  // mailto pre-compilato per la richiesta di preventivo.
  const mailto = useMemo(() => {
    const usageLabel = USAGE_OPTIONS.find((u) => u.value === sel.usage)?.label ?? "";
    const powerLabel = powerOptions.find((p) => p.value === sel.power)?.label ?? "";
    const countLabel = COUNT_OPTIONS.find((c) => c.value === sel.count)?.label ?? "";
    const subject = "Richiesta preventivo ricarica GMobility";
    const body = [
      "Salve,",
      "vorrei un preventivo per una soluzione di ricarica con queste caratteristiche:",
      `• Contesto: ${usageLabel}`,
      `• Potenza: ${powerLabel}`,
      `• Numero di punti: ${countLabel}`,
      "",
      "Grazie.",
    ].join("\n");
    return `mailto:${GROUP.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [sel, powerOptions]);

  function reset() {
    setSel({ usage: null, power: null, count: null });
    setStep(0);
  }

  return (
    <Section id="configuratore" size="narrow">
      <div className="mx-auto max-w-2xl text-center">
        <Badge>Configuratore</Badge>
        <h2 className="font-display text-display-sm mt-4 font-bold text-balance">
          Che soluzione ti serve?
        </h2>
        <p className="text-muted mt-4 text-lg text-pretty">
          Tre domande e ti diciamo da dove partire. Poi richiedi il preventivo in un clic.
        </p>
      </div>

      <Card className="mt-10 p-6 sm:p-8">
        {/* Stepper */}
        <ol className="mb-7 flex items-center gap-2">
          {STEPS.map((label, i) => {
            // "done" se il dato di quel passo è stato scelto; "active" = passo corrente.
            const filled = [sel.usage, sel.power, sel.count][i] != null;
            const state = filled ? "done" : i === step ? "active" : "idle";
            return (
              <li key={label} className="flex flex-1 items-center gap-2">
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold",
                    state === "done"
                      ? "bg-accent text-accent-contrast"
                      : state === "active"
                        ? "border-accent text-accent-ink border-2"
                        : "bg-surface-2 text-muted",
                  )}
                >
                  {i + 1}
                </span>
                <span className="text-muted hidden text-sm sm:block">{label}</span>
                {i < STEPS.length - 1 && <span className="bg-border h-px flex-1" />}
              </li>
            );
          })}
        </ol>

        {/* Step 0 — uso */}
        {step === 0 && (
          <div>
            <p className="mb-4 font-semibold">Dove ti serve la ricarica?</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {USAGE_OPTIONS.map((o) => (
                <Option
                  key={o.value}
                  selected={sel.usage === o.value}
                  title={o.label}
                  hint={o.hint}
                  onClick={() => {
                    // cambiando contesto la potenza scelta potrebbe non esistere più
                    setSel({ usage: o.value, power: null, count: sel.count });
                    setStep(1);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 1 — potenza */}
        {step === 1 && (
          <div>
            <p className="mb-4 font-semibold">Che potenza ti serve?</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {powerOptions.map((o) => (
                <Option
                  key={o.value}
                  selected={sel.power === o.value}
                  title={o.label}
                  hint={o.hint}
                  onClick={() => {
                    setSel((s) => ({ ...s, power: o.value }));
                    setStep(2);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — numero di punti */}
        {step === 2 && (
          <div>
            <p className="mb-4 font-semibold">Quanti punti di ricarica?</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {COUNT_OPTIONS.map((o) => (
                <Option
                  key={o.value}
                  selected={sel.count === o.value}
                  title={o.label}
                  onClick={() => setSel((s) => ({ ...s, count: o.value }))}
                />
              ))}
            </div>
          </div>
        )}

        {/* Riepilogo + CTA (compare quando tutto è scelto) */}
        {done && step === 2 && (
          <div className="border-border bg-surface-2/60 mt-6 rounded-lg border p-5">
            <p className="text-muted text-xs tracking-widest uppercase">Il tuo profilo</p>
            <p className="mt-2 text-lg font-semibold">
              {USAGE_OPTIONS.find((u) => u.value === sel.usage)?.label} ·{" "}
              {powerOptions.find((p) => p.value === sel.power)?.label} ·{" "}
              {COUNT_OPTIONS.find((c) => c.value === sel.count)?.label}
            </p>
            <p className="text-muted mt-2 text-sm">
              {sel.usage === "business"
                ? "Soluzione business: colonnine gestite con accessi e rendicontazione."
                : "Soluzione casa: wallbox Mennekes, integrabile con il tuo fotovoltaico GM Solar."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button href={mailto} size="lg">
                Richiedi il preventivo
              </Button>
              <Button onClick={reset} variant="ghost">
                Ricomincia
              </Button>
            </div>
          </div>
        )}

        {/* Navigazione indietro */}
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="text-muted hover:text-foreground mt-6 text-sm transition-colors"
          >
            ← Indietro
          </button>
        )}
      </Card>
    </Section>
  );
}
