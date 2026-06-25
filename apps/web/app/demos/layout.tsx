import type { Metadata } from "next";

/**
 * Layout della route /demos — il "Demo launcher" interno.
 *
 * Dà alla pagina un guscio pulito e a tutta altezza con il proprio header/footer
 * (vedi page.tsx), così legge come una dashboard a sé. Per ottenerlo SENZA
 * toccare la zona condivisa (root layout, Header/Footer di gruppo), nasconde
 * l'header e il footer GLOBALI solo finché questa route è montata, tramite uno
 * stile con ambito limitato: il selettore è attivo unicamente quando esiste
 * `[data-demos-shell]` (presente solo qui). Niente file condiviso viene
 * modificato; le altre sezioni non sono toccate. L'header/footer globali sono
 * figli diretti di <body> (i provider non aggiungono DOM), quindi `body > header`
 * e `body > footer` li colpiscono in modo affidabile.
 *
 * NB: il proprio header/footer della dashboard sono annidati dentro <main>,
 * quindi NON sono figli diretti di <body> e restano visibili.
 */
const HIDE_GLOBAL_CHROME = `
  body:has([data-demos-shell]) > header,
  body:has([data-demos-shell]) > footer { display: none !important; }
`;

export const metadata: Metadata = {
  title: "Demo launcher",
  description: "Indice interno delle demo dell'ecosistema GM Group per la presentazione.",
  // Pagina interna: fuori dall'indice dei motori di ricerca.
  robots: { index: false, follow: false },
};

export default function DemosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-demos-shell className="bg-background flex min-h-screen flex-col">
      <style dangerouslySetInnerHTML={{ __html: HIDE_GLOBAL_CHROME }} />
      {children}
    </div>
  );
}
