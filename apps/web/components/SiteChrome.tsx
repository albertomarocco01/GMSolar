"use client";

/**
 * @descrizione  Decide se mostrare la "cornice" del sito (Header, Footer, FAB
 *   assistente, deck) oppure no. La HOME ("/") è la presentazione scrollytelling
 *   a tutto schermo: deve essere CHROMELESS (motion design), quindi niente
 *   header/footer. Tutte le altre route mantengono la cornice completa.
 * @indice
 * - SiteChrome → wrappa i children nel layout, mostrando la cornice solo fuori da "/"
 */
import { usePathname } from "next/navigation";
import Header from "@gmgroup/ui/Header";
import Footer from "@gmgroup/ui/Footer";
import PageTransition from "@gmgroup/ui/PageTransition";
import GlobalAssistant from "@/components/assistente/GlobalAssistant";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = pathname === "/";

  if (bare) {
    // Home: nessuna cornice. La pagina gestisce da sé l'intera esperienza.
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <GlobalAssistant />
    </>
  );
}
