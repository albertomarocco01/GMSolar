/**
 * /segnalazioni — pannello per inviarci bug e richieste di modifica.
 * Tema "platform" (viola elettrico) impostato automaticamente da ThemeProvider.
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
