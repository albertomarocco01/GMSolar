/**
 * /integrazioni — Showcase Integrazioni API.
 *
 * Struttura (sotto-componenti in components/integrazioni/, stesso markup a runtime):
 *   1. Hero: titolo + disclaimer "simulazione dimostrativa"
 *   2. ConnettoriSection: griglia connettori (7 card: WhatsApp, Email, CRM, Stripe, Calendar, AI, Sheets)
 *   3. FlussiSection: 2 scenari con diagramma a nodi SVG + log simulato
 *   4. CtaSection: chiusura
 *
 * L'accent della pagina è il lime del gruppo ("hub"), impostato automaticamente
 * dal ThemeProvider in base alla route (cfr. packages/lib/src/theme.ts).
 *
 * RECINTO: questo file e apps/web/components/integrazioni/** — non toccare
 * la zona condivisa (packages/**, layout, globals, tokens, Header/Footer).
 */

import type { Metadata } from "next";
import Hero from "@/components/integrazioni/Hero";
import ConnettoriSection from "@/components/integrazioni/ConnettoriSection";
import FlussiSection from "@/components/integrazioni/FlussiSection";
import CtaSection from "@/components/integrazioni/CtaSection";
import { CONNECTORS, SCENARIOS } from "@/components/integrazioni/data";

export const metadata: Metadata = {
  title: "Integrazioni API — Ci integriamo con molti sistemi su richiesta",
  description:
    "WhatsApp, email, CRM, pagamenti, AI: orchestriamo qualunque sistema con API in flussi automatici.",
};

export default function IntegrazioniPage() {
  return (
    <>
      <Hero />
      <ConnettoriSection connectors={CONNECTORS} />
      <FlussiSection scenarios={SCENARIOS} />
      <CtaSection />
    </>
  );
}
