/**
 * ConnectorCard — card singola nella griglia dei connettori disponibili.
 * Mostra icona, nome, descrizione breve e badge "Disponibile".
 * Server component: nessun hook, nessun handler client-side.
 */

import { type LucideIcon } from "lucide-react";
import Card from "@gmgroup/ui/Card";
import Badge from "@gmgroup/ui/Badge";

export type ConnectorCardProps = {
  icon: LucideIcon;
  name: string;
  /** Una riga che spiega cosa fa il connettore. */
  description: string;
};

export default function ConnectorCard({ icon: Icon, name, description }: ConnectorCardProps) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      {/* Icona su sfondo accent-soft */}
      <div className="bg-accent-soft text-accent-ink flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
        <Icon size={20} aria-hidden />
      </div>

      <div className="flex flex-col gap-0.5">
        <p className="text-foreground text-sm font-semibold">{name}</p>
        <p className="text-muted text-xs leading-relaxed">{description}</p>
      </div>

      <Badge variant="accent" className="w-fit">
        Disponibile
      </Badge>
    </Card>
  );
}
