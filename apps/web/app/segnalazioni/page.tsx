/**
 * /segnalazioni — pannello per inviarci bug e richieste di modifica.
 * Accent "hub" (lime) — unico accent de-brandizzato — impostato dal ThemeProvider.
 */

import type { Metadata } from "next";
import SegnalazioniPanel from "@/components/segnalazioni/SegnalazioniPanel";

export const metadata: Metadata = {
  title: "Segnalazioni",
  description: "Pannello per inviarci bug e richieste di modifica, con stato, priorità e storico.",
};

export default function SegnalazioniPage() {
  return <SegnalazioniPanel />;
}
