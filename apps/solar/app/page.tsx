import type { Metadata } from "next";
import SolarHero from "@/components/solar/SolarHero";
import SolarStats from "@/components/solar/SolarStats";
import SolarTrust from "@/components/solar/SolarTrust";
import SolarTipologie from "@/components/solar/SolarTipologie";
import SolarServizi from "@/components/solar/SolarServizi";
import SolarCaseStudy from "@/components/solar/SolarCaseStudy";
import SolarMap from "@/components/solar/SolarMap";
import SolarCalculator from "@/components/solar/SolarCalculator";
import SolarCTA from "@/components/solar/SolarCTA";

export const metadata: Metadata = {
  title: "Solar",
  description:
    "GM Solar — EPC Contractor per impianti fotovoltaici di media e grande scala: progettazione, installazione, monitoraggio e manutenzione O&M.",
};

/**
 * Sezione GM Solar (taglio cinematografico). Composizione di blocchi piccoli
 * e riusabili da @/components/solar; i dati arrivano da data/solar-projects.json
 * e i video reali da lib/assets. Il theming (accent chartreuse) è già attivo su
 * questa route via ThemeProvider.
 */
export default function SolarPage() {
  return (
    <>
      <SolarHero />
      <SolarStats />
      <SolarTrust />
      <SolarTipologie />
      <SolarServizi />
      <SolarCaseStudy />
      <SolarMap />
      <SolarCalculator />
      <SolarCTA />
    </>
  );
}
