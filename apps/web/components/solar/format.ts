/**
 * Formattazione numerica italiana DETERMINISTICA — separatore migliaia ".",
 * decimali ",".
 *
 * Perché non `Intl.NumberFormat("it-IT")`: l'output di Intl dipende dai dati ICU
 * del runtime, che possono differire tra il render SSR (Node/Vercel) e quello del
 * browser. Quando differiscono, un numero come 7560 viene reso "7560" da una parte
 * e "7.560" dall'altra → hydration mismatch (React rigenera l'albero lato client).
 * Questa funzione non dipende dall'ICU, quindi server e client producono SEMPRE la
 * stessa stringa.
 *
 * @param value       valore numerico
 * @param maxDecimals massimo numero di decimali (arrotonda)
 * @param minDecimals minimo numero di decimali (riempie con zeri)
 */
export function formatIt(value: number, maxDecimals = 0, minDecimals = 0): string {
  const sign = value < 0 ? "-" : "";
  const fixed = Math.abs(value).toFixed(maxDecimals);
  const dot = fixed.indexOf(".");
  let intPart = dot === -1 ? fixed : fixed.slice(0, dot);
  let decPart = dot === -1 ? "" : fixed.slice(dot + 1);

  // Taglia gli zeri finali, ma mantieni almeno `minDecimals` cifre decimali.
  while (decPart.length > minDecimals && decPart.endsWith("0")) {
    decPart = decPart.slice(0, -1);
  }

  // Raggruppamento migliaia all'italiana (punto ogni 3 cifre).
  intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  const out = decPart ? `${intPart},${decPart}` : intPart;
  // Evita "-0".
  return out === "0" ? out : `${sign}${out}`;
}
