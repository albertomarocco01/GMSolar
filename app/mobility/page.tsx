import type { Metadata } from "next";
import MobilityStage from "@/components/mobility/MobilityStage";
import MarketStats from "@/components/mobility/MarketStats";
import Solutions from "@/components/mobility/Solutions";
import ChargingMap from "@/components/mobility/ChargingMap";
import Configurator from "@/components/mobility/Configurator";

export const metadata: Metadata = {
  title: "Mobility",
  description:
    "GMobility — wallbox e colonnine di ricarica Mennekes per casa, azienda e spazi pubblici. Esplora la colonnina in 3D, il mercato dell'elettrico e la rete di ricarica.",
};

/**
 * Sezione GMobility — taglio "3D scroll storytelling".
 * 1+2) Stage 3D pinnato: la colonnina ruota e i componenti si separano (explode).
 * 3) Il mercato in numeri. 4) Soluzioni aziende/casa + partner Mennekes.
 * 5) Mappa della rete di ricarica. 6) Configuratore "che soluzione ti serve".
 */
export default function MobilityPage() {
  return (
    <>
      <MobilityStage />
      <MarketStats />
      <Solutions />
      <ChargingMap />
      <Configurator />
    </>
  );
}
