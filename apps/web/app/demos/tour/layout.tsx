import type { Metadata } from "next";

/**
 * Layout della route /demos/tour — il player "Demo Wrapped".
 *
 * La route eredita già il layout di /demos (che nasconde header/footer globali),
 * ma qui RIBADISCE la stessa tecnica con ambito limitato — uno <style> attivo
 * solo quando esiste `[data-tour-shell]` — così il player resta immersivo e
 * autosufficiente anche se il layout genitore cambia. Nessun file condiviso
 * viene toccato. Gli header/footer globali sono figli diretti di <body>, quindi
 * `body > header`/`body > footer` li colpiscono; il player è `fixed`, fuori dal
 * flusso, e copre lo schermo.
 */
const HIDE_GLOBAL_CHROME = `
  body:has([data-tour-shell]) > header,
  body:has([data-tour-shell]) > footer { display: none !important; }
`;

export const metadata: Metadata = {
  title: "Demo Wrapped — il tour",
  description: "Story-tour a schermo intero delle demo dell'ecosistema GM Group.",
  // Pagina interna alla presentazione: fuori dall'indice.
  robots: { index: false, follow: false },
};

export default function TourLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-tour-shell>
      <style dangerouslySetInnerHTML={{ __html: HIDE_GLOBAL_CHROME }} />
      {children}
    </div>
  );
}
