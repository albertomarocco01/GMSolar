/**
 * Copy DETERMINISTICA derivata dai dati reali del prodotto (`specs`).
 *
 * Regola di progetto: niente testo inventato. Ogni frase nasce dai campi
 * presenti; le clausole mancanti vengono OMESSE (mai "undefined", mai claim
 * non verificabili). Usata dalla PDP (descrizione, "perché questo cavo",
 * sottotitolo) e dalla card (riga di specifiche).
 */
import type { Product } from "@gmgroup/lib/types";

/** `length`/`current` non sono nel tipo condiviso: estensione locale opzionale. */
type ExtendedSpecs = Product["specs"] & { length?: string; current?: string };

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Servizio/add-on senza prezzo fisso (es. estensione garanzia). */
export const isService = (p: Product) =>
  p.price === null || (p.specs as ExtendedSpecs).type === "add-on";

/** Adattatore (Tipo 2 → Schuko), categoria "Adattatori". */
export const isAdapter = (p: Product) => (p.specs as ExtendedSpecs).type === "adattatore";

/** Cavo con spina domestica Schuko (Modo 2). */
export const isSchuko = (p: Product) => (p.specs as ExtendedSpecs).plug === "Schuko";

/** Fino a 3 specifiche brevi per la riga della card (le più parlanti). */
export function cardSpecLine(product: Product): string[] {
  const s = product.specs as ExtendedSpecs;
  const out: string[] = [];
  if (s.mode) out.push(s.mode);
  if (s.phase) out.push(cap(s.phase));
  else if (s.plug) out.push(s.plug);
  if (s.length) out.push(s.length);
  else if (s.current) out.push(s.current);
  else if (s.coverage) out.push(s.coverage);
  return out.slice(0, 3);
}

/** Sottotitolo (deck) della PDP, montato dalle specifiche disponibili. */
export function buildDeck(product: Product): string {
  const s = product.specs as ExtendedSpecs;
  if (isService(product)) {
    const cov = s.coverage ? ` fino a ${s.coverage}` : "";
    return `Estendi la copertura e la tranquillità del tuo cavo di ricarica${cov}.`;
  }
  if (isAdapter(product)) {
    const from = s.connector ?? "Tipo 2";
    const to = s.plug ?? "Schuko";
    return `Adattatore ${from} → ${to} per la ricarica domestica occasionale, compatto e pronto all'uso.`;
  }
  const seg: string[] = [s.mode ? `Cavo Mennekes ${s.mode}` : "Cavo di ricarica Mennekes"];
  const tech = [s.connector, s.phase].filter(Boolean).join(" ");
  if (tech) seg.push(tech);
  if (s.length) seg.push(`da ${s.length}`);
  if (s.shape) seg.push(`forma ${s.shape}`);
  let deck = seg.join(", ");
  if (s.use) deck += `, per ${s.use}`;
  return `${deck}.`;
}

/** Descrizione lunga (1–3 frasi), tutte derivate dai dati, clausole guardate. */
export function buildDescription(product: Product): string {
  const s = product.specs as ExtendedSpecs;

  if (isService(product)) {
    const cov = s.coverage ?? "il periodo previsto";
    return (
      `Estendi la copertura del tuo cavo di ricarica fino a ${cov}. ` +
      `Una tranquillità in più sull'accessorio che usi ogni giorno, a un costo dedicato.`
    );
  }

  if (isAdapter(product)) {
    const from = s.connector ?? "Tipo 2";
    const to = s.plug ?? "Schuko";
    const cur = s.current ? ` a ${s.current}` : "";
    return (
      `Adattatore da ${from} a ${to}${cur} per la ricarica domestica occasionale. ` +
      `Soluzione compatta da tenere in auto per le emergenze, quando non c'è una colonnina nei paraggi.`
    );
  }

  const sentences: string[] = [];
  if (s.use) sentences.push(`${product.name.split("–")[0].trim()} pensato per ${s.use}.`);

  const conf = [s.phase, s.current ? `a ${s.current}` : null].filter(Boolean).join(" ");
  if (conf || s.connector) {
    const onConn = s.connector ? ` su connettore ${s.connector}` : "";
    sentences.push(
      `La configurazione ${conf || "standard"}${onConn} assicura una ricarica sicura e costante.`,
    );
  }

  const tail: string[] = [];
  if (s.length) tail.push(`i suoi ${s.length} di lunghezza`);
  if (s.shape) tail.push(`la forma ${s.shape}`);
  if (tail.length) {
    sentences.push(`Con ${tail.join(" e ")}, è pratico da usare e da riporre dopo ogni ricarica.`);
  }

  return sentences.length
    ? sentences.join(" ")
    : "Cavo di ricarica Mennekes, conforme allo standard Tipo 2 usato da colonnine e wallbox in Europa.";
}

export type Reason = { title: string; body: string };

/**
 * "Perché questo cavo" — fino a 3 motivi, scelti per rilevanza dalle specifiche.
 * Restituisce [] quando non c'è nulla di derivabile (es. servizio): in tal caso
 * la PDP non mostra il blocco.
 */
export function whyReasons(product: Product): Reason[] {
  const s = product.specs as ExtendedSpecs;
  const out: Reason[] = [];

  if (s.phase === "trifase") {
    out.push({
      title: "Più potenza disponibile",
      body: "Configurazione trifase: ricarica più veloce dove la colonnina lo consente.",
    });
  } else if (s.phase === "monofase") {
    out.push({
      title: "Pronto per casa",
      body: "Monofase, compatibile con la maggior parte dei wallbox residenziali.",
    });
  }

  if (s.shape === "spiralato") {
    out.push({
      title: "Sempre in ordine",
      body: "Si raccoglie da solo: niente cavo per terra, niente grovigli.",
    });
  } else if (s.shape === "liscio") {
    out.push({
      title: "Maneggevole",
      body: "Leggero e facile da arrotolare dopo ogni ricarica.",
    });
  }

  if (s.plug === "Schuko") {
    out.push({
      title: "Usa la presa di casa",
      body: "Per la ricarica di emergenza da una normale presa domestica.",
    });
  }

  if (s.length === "10 m") {
    out.push({
      title: "Raggio extra-lungo",
      body: "Dieci metri per arrivare comodi anche quando la presa è lontana.",
    });
  }

  if (s.connector === "Tipo 2") {
    out.push({
      title: "Standard Mennekes certificato",
      body: "Tipo 2, lo standard di colonnine e wallbox in Europa.",
    });
  }

  return out.slice(0, 3);
}
