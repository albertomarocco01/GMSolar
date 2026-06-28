/**
 * Costruttori dei campi di dettaglio (drawer) per ogni entità. Restituiscono
 * un array `DetailField[]` che il DetailDrawer rende come lista etichetta/valore.
 */
import type { Cliente, Ordine, Progetto, Scadenza } from "@/data/erp-mock";
import type { DetailField } from "./types";
import { StatusPill } from "./columns";
import { formatDate, formatEuro, formatNumber } from "./format";

export function clienteDetail(c: Cliente): DetailField[] {
  return [
    { label: "Codice", value: <span className="font-mono">{c.id}</span> },
    { label: "Referente", value: c.referente },
    { label: "Settore", value: c.settore },
    { label: "Città", value: c.citta },
    { label: "Regione", value: c.regione },
    { label: "Valore cliente", value: formatEuro(c.valore) },
  ];
}

export function ordineDetail(o: Ordine): DetailField[] {
  return [
    { label: "Numero", value: <span className="font-mono">{o.numero}</span> },
    { label: "Cliente", value: o.cliente },
    { label: "Città", value: `${o.citta} (${o.regione})` },
    { label: "Importo", value: formatEuro(o.importo) },
    {
      label: "Stato",
      value: (
        <StatusPill
          tone={
            o.stato === "accettato"
              ? "positive"
              : o.stato === "perso"
                ? "danger"
                : o.stato === "inviato"
                  ? "info"
                  : "neutral"
          }
          label={o.stato}
        />
      ),
    },
    { label: "Data", value: formatDate(o.data) },
  ];
}

export function progettoDetail(p: Progetto): DetailField[] {
  return [
    { label: "Codice", value: <span className="font-mono">{p.id}</span> },
    { label: "Cliente", value: p.cliente },
    { label: "Tipo", value: p.tipo },
    { label: "Città", value: `${p.citta} (${p.regione})` },
    { label: "Avanzamento", value: `${p.avanzamento}%` },
    { label: "Potenza", value: `${formatNumber(p.potenzaKWp)} kWp` },
    { label: "Scadenza", value: formatDate(p.scadenza) },
  ];
}

export function scadenzaDetail(s: Scadenza): DetailField[] {
  return [
    { label: "Codice", value: <span className="font-mono">{s.id}</span> },
    { label: "Cliente", value: s.cliente },
    { label: "Tipo", value: s.tipo },
    { label: "Città", value: `${s.citta} (${s.regione})` },
    { label: "Importo", value: s.importo > 0 ? formatEuro(s.importo) : "—" },
    { label: "Data", value: formatDate(s.data) },
  ];
}
