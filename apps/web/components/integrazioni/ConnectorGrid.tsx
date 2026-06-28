/**
 * ConnectorGrid — griglia di ConnectorCard con reveal in cascata allo scroll.
 * Server component: non ha logica client-side, delega ScrollReveal (client)
 * per l'animazione tramite il pattern "children come opaque nodes".
 */

import ScrollReveal from "@gmgroup/ui/ScrollReveal";
import ConnectorCard from "./ConnectorCard";
import type { ConnectorDef } from "./types";

export type ConnectorGridProps = {
  connectors: ConnectorDef[];
};

export default function ConnectorGrid({ connectors }: ConnectorGridProps) {
  return (
    <ScrollReveal
      className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
      stagger={0.08}
      y={20}
    >
      {connectors.map((c) => (
        <ConnectorCard key={c.id} icon={c.icon} name={c.name} description={c.description} />
      ))}
    </ScrollReveal>
  );
}
