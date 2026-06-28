import TourPlayer from "@/components/demos/TourPlayer";
import { buildTourSlides } from "@/components/demos/tour";

/**
 * /demos/tour — "Demo Wrapped". Le slide sono costruite dallo STESSO catalogo
 * del launcher (data/demos.json via catalog.ts): intro → una per demo → recap.
 * Il rendering interattivo è nel TourPlayer (client); qui passiamo solo i dati.
 */
export default function TourPage() {
  return <TourPlayer slides={buildTourSlides()} />;
}
