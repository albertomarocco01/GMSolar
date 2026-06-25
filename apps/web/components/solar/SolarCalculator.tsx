"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Section from "@gmgroup/ui/Section";
import Badge from "@gmgroup/ui/Badge";
import Card from "@gmgroup/ui/Card";
import SplitTextReveal from "@gmgroup/ui/SplitTextReveal";
import { cn } from "@gmgroup/lib/utils";
import { IconSun } from "@/components/solar/SolarIcons";
import { formatIt } from "@/components/solar/format";

/* =============================================================
   Assunzioni della stima (dichiarate, semplici e modificabili).
   NB: è una stima INDICATIVA, non un preventivo. Valori medi Italia.
   ============================================================= */
const PRICE_PER_KWH = 0.25; // €/kWh medio in bolletta (energia autoconsumata = risparmiata)
const EXPORT_PRICE = 0.1; // €/kWh valorizzazione dell'energia immessa in rete (ritiro dedicato)
const YIELD_KWH_PER_KWP = 1200; // producibilità media annua (kWh per kWp)
const KWP_PER_M2 = 0.17; // ~6 m² di tetto per kWp installabile
const CO2_KG_PER_KWH = 0.35; // fattore di emissione medio rete IT
// Quota di produzione consumata sul posto SENZA accumulo: il resto è immesso in
// rete. Realisticamente ~30-40% per un profilo domestico; con batteria sale.
const SELF_CONSUMPTION = 0.35;
const COST_PER_KWP = 1400; // costo "chiavi in mano" indicativo (€/kWp)
const LIFETIME_YEARS = 25; // vita utile considerata per il risparmio cumulato

type Mode = "spesa" | "consumo";

/** Ordine dei tab: usato dalla navigazione con le frecce. */
const MODES: Mode[] = ["spesa", "consumo"];

type Estimate = {
  kwp: number;
  produzioneKwh: number;
  risparmioEur: number; // beneficio annuo (autoconsumo evitato + immissione valorizzata)
  co2T: number;
  coperturaPct: number; // quota di consumi coperta dall'autoconsumo solare
  paybackAnni: number | null; // tempo di rientro dell'investimento (null se non rientra)
  risparmio25: number; // beneficio cumulato sulla vita utile dell'impianto
};

/** Calcolo puro: input → stima. Tenuto fuori dal componente per leggibilità. */
function computeEstimate(mode: Mode, amount: number, superficieM2: number): Estimate {
  const consumoKwh = mode === "spesa" ? amount / PRICE_PER_KWH : amount;

  const kwpDaTetto = superficieM2 * KWP_PER_M2;
  const kwpServiti = consumoKwh / YIELD_KWH_PER_KWP;
  // Si dimensiona l'impianto al minore tra quanto entra sul tetto e quanto
  // serve a coprire i consumi (niente sovradimensionamento nella stima).
  const kwp = Math.max(0, Math.min(kwpDaTetto, kwpServiti));

  const produzioneKwh = kwp * YIELD_KWH_PER_KWP;

  // Senza accumulo solo una quota della produzione è consumata sul posto (e non
  // può superare i consumi); il resto è immesso in rete a un prezzo inferiore.
  const autoconsumoKwh = Math.min(produzioneKwh * SELF_CONSUMPTION, consumoKwh);
  const immessaKwh = Math.max(0, produzioneKwh - autoconsumoKwh);
  const risparmioEur = autoconsumoKwh * PRICE_PER_KWH + immessaKwh * EXPORT_PRICE;

  const co2T = (produzioneKwh * CO2_KG_PER_KWH) / 1000;
  const coperturaPct = consumoKwh > 0 ? Math.min(100, (autoconsumoKwh / consumoKwh) * 100) : 0;

  const costoImpianto = kwp * COST_PER_KWP;
  const paybackAnni = risparmioEur > 0 ? costoImpianto / risparmioEur : null;
  const risparmio25 = risparmioEur * LIFETIME_YEARS;

  return { kwp, produzioneKwh, risparmioEur, co2T, coperturaPct, paybackAnni, risparmio25 };
}

// Formattazione IT deterministica (server === client) a decimali fissi. Vedi
// `formatIt`: evita gli hydration mismatch di `Intl.NumberFormat` legati all'ICU.
const nf = (decimals = 0) => ({
  format: (value: number) => formatIt(value, decimals, decimals),
});

/** Slider + input numerico legati allo stesso valore. */
function RangeField({
  label,
  unit,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const id = useId();
  const clamp = (v: number) => Math.min(max, Math.max(min, Number.isFinite(v) ? v : min));

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <div className="flex items-baseline gap-1">
          <input
            id={id}
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(clamp(e.target.valueAsNumber))}
            className="border-border focus-visible:border-accent w-24 rounded-md border bg-transparent px-2 py-1 text-right text-sm tabular-nums outline-none"
          />
          <span className="text-muted text-sm">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(clamp(e.target.valueAsNumber))}
        className="accent-accent mt-3 w-full"
      />
    </div>
  );
}

export default function SolarCalculator() {
  const [mode, setMode] = useState<Mode>("spesa");
  const [spesa, setSpesa] = useState(1500); // €/anno
  const [consumo, setConsumo] = useState(6000); // kWh/anno
  const [superficie, setSuperficie] = useState(40); // m²

  const amount = mode === "spesa" ? spesa : consumo;
  const est = useMemo(() => computeEstimate(mode, amount, superficie), [mode, amount, superficie]);

  // a11y: tablist con pattern WAI-ARIA. Ogni tab governa il proprio tabpanel e
  // le frecce spostano la selezione + il focus (focus segue la selezione).
  const tabsId = useId();
  const tabId = (m: Mode) => `${tabsId}-tab-${m}`;
  const panelId = (m: Mode) => `${tabsId}-panel-${m}`;
  const tabRefs = useRef<Record<Mode, HTMLButtonElement | null>>({ spesa: null, consumo: null });

  function handleTabKey(e: KeyboardEvent<HTMLButtonElement>) {
    const i = MODES.indexOf(mode);
    let next: Mode | null = null;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = MODES[(i + 1) % MODES.length];
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = MODES[(i - 1 + MODES.length) % MODES.length];
        break;
      case "Home":
        next = MODES[0];
        break;
      case "End":
        next = MODES[MODES.length - 1];
        break;
      default:
        return;
    }
    e.preventDefault();
    setMode(next);
    tabRefs.current[next]?.focus();
  }

  const results = [
    { label: "Potenza consigliata", value: nf(1).format(est.kwp), unit: "kWp" },
    { label: "Produzione stimata", value: nf(0).format(est.produzioneKwh), unit: "kWh/anno" },
    { label: "Risparmio stimato", value: nf(0).format(est.risparmioEur), unit: "€/anno" },
    { label: "CO₂ evitata", value: nf(1).format(est.co2T), unit: "t/anno" },
    {
      label: "Tempo di rientro",
      value: est.paybackAnni != null ? nf(1).format(est.paybackAnni) : "—",
      unit: est.paybackAnni != null ? "anni" : "",
    },
    { label: "Risparmio in 25 anni", value: nf(0).format(est.risparmio25), unit: "€" },
  ];

  return (
    <Section id="calcolatore">
      <div className="max-w-2xl">
        <Badge>
          <IconSun className="h-3.5 w-3.5" />
          Calcolatore
        </Badge>
        <SplitTextReveal
          as="h2"
          text="Quanto potresti risparmiare?"
          className="font-display text-display-sm mt-4 font-bold tracking-tight text-balance"
        />
        <p className="text-muted mt-4 text-lg">
          Due numeri e ti diamo un ordine di grandezza. Poi ne parliamo davvero, sui tuoi consumi
          reali.
        </p>
      </div>

      <Card className="mt-10 grid gap-8 p-6 md:grid-cols-2 md:p-8">
        {/* ----- Input ----- */}
        <div className="flex flex-col gap-6">
          {/* Toggle spesa / consumo (tablist accessibile) */}
          <div
            role="tablist"
            aria-label="Tipo di dato in ingresso"
            className="bg-surface-2 inline-flex w-full rounded-full p-1 text-sm"
          >
            {MODES.map((m) => (
              <button
                key={m}
                ref={(el) => {
                  tabRefs.current[m] = el;
                }}
                id={tabId(m)}
                role="tab"
                aria-selected={mode === m}
                aria-controls={panelId(m)}
                tabIndex={mode === m ? 0 : -1}
                onClick={() => setMode(m)}
                onKeyDown={handleTabKey}
                className={cn(
                  "ease-out-expo flex-1 rounded-full px-4 py-2 font-medium transition-colors duration-(--duration-fast)",
                  mode === m
                    ? "bg-accent text-accent-contrast shadow-sm"
                    : "text-muted hover:text-foreground",
                )}
              >
                {m === "spesa" ? "Spesa annua (€)" : "Consumo (kWh)"}
              </button>
            ))}
          </div>

          {/* Un tabpanel per tab: il non attivo è rimosso dall'accessibility tree. */}
          <div
            role="tabpanel"
            id={panelId("spesa")}
            aria-labelledby={tabId("spesa")}
            hidden={mode !== "spesa"}
          >
            <RangeField
              label="Spesa elettrica annua"
              unit="€"
              value={spesa}
              min={300}
              max={30000}
              step={50}
              onChange={setSpesa}
            />
          </div>
          <div
            role="tabpanel"
            id={panelId("consumo")}
            aria-labelledby={tabId("consumo")}
            hidden={mode !== "consumo"}
          >
            <RangeField
              label="Consumo annuo"
              unit="kWh"
              value={consumo}
              min={1000}
              max={120000}
              step={100}
              onChange={setConsumo}
            />
          </div>

          <RangeField
            label="Superficie tetto disponibile"
            unit="m²"
            value={superficie}
            min={10}
            max={5000}
            step={5}
            onChange={setSuperficie}
          />

          <p className="text-muted text-xs leading-relaxed">
            Ipotesi: {nf(2).format(PRICE_PER_KWH)} €/kWh in bolletta,{" "}
            {nf(0).format(YIELD_KWH_PER_KWP)} kWh/kWp l&apos;anno, ~6 m² di tetto per kWp,
            autoconsumo {nf(0).format(SELF_CONSUMPTION * 100)}% senza accumulo (il resto immesso in
            rete a {nf(2).format(EXPORT_PRICE)} €/kWh), impianto ~{nf(0).format(COST_PER_KWP)} €/kWp
            su una vita di {LIFETIME_YEARS} anni.
          </p>
        </div>

        {/* ----- Risultati ----- */}
        <div className="bg-surface-2 flex flex-col rounded-lg p-6">
          <div className="grid grid-cols-2 gap-x-6 gap-y-8">
            {results.map((r) => (
              <div key={r.label}>
                <p className="font-display text-accent-ink text-3xl font-bold tabular-nums">
                  {r.value}
                  <span className="text-muted ml-1 text-base font-medium">{r.unit}</span>
                </p>
                <p className="text-muted mt-1 text-sm">{r.label}</p>
              </div>
            ))}
          </div>

          {/* Copertura consumi */}
          <div className="mt-8">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Copertura dei consumi</span>
              <span className="text-accent-ink font-semibold tabular-nums">
                ~{nf(0).format(est.coperturaPct)}%
              </span>
            </div>
            <div className="bg-border mt-2 h-2 overflow-hidden rounded-full">
              <div
                className="bg-accent ease-out-expo h-full rounded-full transition-[width] duration-(--duration-base)"
                style={{ width: `${est.coperturaPct}%` }}
              />
            </div>
          </div>

          <p className="text-muted mt-auto pt-6 text-xs leading-relaxed">
            Stima indicativa a scopo illustrativo, non un preventivo. I valori reali dipendono da
            esposizione, ombreggiamenti, profilo di consumo e dalla soluzione progettata.
          </p>
        </div>
      </Card>
    </Section>
  );
}
