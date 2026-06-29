import Section from "@gmgroup/ui/Section";
import Badge from "@gmgroup/ui/Badge";
import Button from "@gmgroup/ui/Button";
import { SERVICES, type ServiceKey } from "@gmgroup/lib/site";

/**
 * Placeholder condiviso di una pagina-servizio: legge il servizio dal registry
 * e mostra titolo/claim + nota "in costruzione". È il fallback finché la demo
 * vera non sostituisce la pagina; tematizzato dall'accent della route.
 */
export default function ServiceStub({ serviceKey }: { serviceKey: ServiceKey }) {
  const service = SERVICES.find((s) => s.key === serviceKey);
  if (!service) return null;

  return (
    <Section className="flex min-h-[70vh] flex-col justify-center">
      <Badge>
        Servizio {service.number} · {service.label}
      </Badge>
      <h1 className="font-display text-display-sm mt-4 max-w-3xl font-bold tracking-tight text-balance">
        {service.title}
      </h1>
      <p className="text-muted mt-4 max-w-xl text-lg">{service.blurb}</p>
      <p className="text-accent-ink mt-8 text-sm font-medium">Demo interattiva in arrivo.</p>
      <div className="mt-4">
        <Button href="/" variant="outline">
          ← Torna alla presentazione
        </Button>
      </div>
    </Section>
  );
}
