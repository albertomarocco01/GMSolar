import AutoScroll from "@/components/home/AutoScroll";
import HeroScene from "@/components/home/scenes/HeroScene";
import VetrinaScene from "@/components/home/scenes/VetrinaScene";
import HorizontalServices from "@/components/home/scenes/HorizontalServices";
import ClosingScene from "@/components/home/scenes/ClosingScene";

/**
 * Home = UNA pagina scrollytelling seamless che racconta tutti i servizi:
 *   Hero → Vetrina (video scrubbato) → track ORIZZONTALE con gli altri 6
 *   servizi inline → chiusura. Lo scroll è AUTOMATICO (AutoScroll); muovendo il
 *   mouse l'utente prende il controllo e dopo l'inattività riparte. Tutto
 *   rispetta prefers-reduced-motion (auto-scroll e pin disattivati).
 */
export default function HomePage() {
  return (
    <div id="top">
      <AutoScroll />
      <HeroScene />
      <VetrinaScene />
      <HorizontalServices />
      <ClosingScene />
    </div>
  );
}
