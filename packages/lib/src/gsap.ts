/**
 * Punto UNICO di registrazione di GSAP e dei suoi plugin.
 * Importa SEMPRE gsap/ScrollTrigger da qui (mai da "gsap" diretto nei
 * componenti) così il plugin viene registrato una sola volta e si evita
 * il doppio-registro in dev/StrictMode.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// La registrazione è idempotente; la guardia su window evita lavoro lato server.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
