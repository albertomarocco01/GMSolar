"use client";

import { usePathname } from "next/navigation";

/**
 * Transizione di pagina base: rimontando il contenuto a ogni cambio di
 * route si riavvia l'animazione CSS `.page-transition` (definita in
 * globals.css). Rispetta prefers-reduced-motion grazie alla regola
 * globale che azzera le animazioni.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="page-transition">
      {children}
    </div>
  );
}
