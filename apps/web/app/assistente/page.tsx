import type { Metadata } from "next";
import {
  Bot,
  MessagesSquare,
  Compass,
  ShieldCheck,
  ServerCog,
  Puzzle,
  Sparkles,
} from "lucide-react";
import Section from "@gmgroup/ui/Section";
import Badge from "@gmgroup/ui/Badge";
import Button from "@gmgroup/ui/Button";
import Card from "@gmgroup/ui/Card";
import ScrollReveal from "@gmgroup/ui/ScrollReveal";
import SplitTextReveal from "@gmgroup/ui/SplitTextReveal";
import { SERVICES } from "@gmgroup/lib/site";
import SiteAssistant from "@/components/assistente/SiteAssistant";

const service = SERVICES.find((s) => s.key === "assistente");

export const metadata: Metadata = {
  title: "Assistente AI di sito",
  description:
    "Chatbot AI integrato nel sito vetrina: capisce la domanda, risponde sui contenuti e indirizza l'utente alla sezione o al prodotto giusto. Funziona anche senza chiave AI grazie a un motore deterministico locale.",
  alternates: { canonical: "/assistente" },
};

/** Cosa fa l'assistente — i tre comportamenti chiave. */
const CAPABILITIES = [
  {
    icon: MessagesSquare,
    title: "Capisce la domanda",
    body: "Interpreta richieste in linguaggio naturale e risponde in italiano, in modo conciso e pertinente ai contenuti del sito.",
  },
  {
    icon: Compass,
    title: "Indirizza alla sezione giusta",
    body: "Allega a ogni risposta dei link cliccabili che portano al servizio o alla pagina più adatta all'esigenza.",
  },
  {
    icon: ShieldCheck,
    title: "Sicuro per definizione",
    body: "Le chiavi restano lato server, gli input sono trattati come non fidati e i link proposti vengono validati contro una whitelist.",
  },
];

/** Come si integra — punti tecnici per il committente. */
const INTEGRATION = [
  {
    icon: ServerCog,
    title: "AI lato server, con fallback",
    body: "La logica gira in una route server-side, isolata dal client: le eventuali chiavi non toccano mai il browser e il sito resta veloce e sicuro.",
  },
  {
    icon: Puzzle,
    title: "Componente autosufficiente",
    body: "<SiteAssistant /> ha stato interno e parla da solo con l'endpoint. Lo monti una volta come riquadro in pagina o come widget globale nel layout.",
  },
  {
    icon: Sparkles,
    title: "Eredita il tuo design",
    body: "Consuma i token del design system: tema, accent, tipografia e dark mode arrivano automaticamente, senza stili da riallineare.",
  },
];

/**
 * /assistente — Servizio #2 della vetrina. Presenta il chatbot AI di sito
 * (cosa fa, come si integra) e ne incorpora una demo interattiva: il widget
 * <SiteAssistant /> è autosufficiente e parla con `/api/assistant`, che funziona
 * anche senza chiave AI (ranking deterministico sulla KB locale). Accent viola
 * "platform" ereditato dalla route.
 */
export default function AssistentePage() {
  return (
    <>
      {/* HERO — presentazione del servizio */}
      <Section className="pt-28">
        <div className="max-w-2xl">
          <Badge>
            Servizio {service?.number ?? "02"} · {service?.label ?? "Assistente AI di sito"}
          </Badge>
          <SplitTextReveal
            as="h1"
            text="Un assistente che risponde e indirizza"
            className="font-display text-display-sm mt-4 font-bold tracking-tight text-balance"
          />
          <p className="text-muted mt-4 text-lg">
            Un chatbot AI nel sito vetrina che capisce la domanda, risponde sui contenuti e
            accompagna l&apos;utente alla sezione o al prodotto giusto.{" "}
            <strong className="text-accent-ink">Provalo qui sotto.</strong>
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="#demo" size="lg">
              Prova l&apos;assistente
            </Button>
            <Button href="/" variant="ghost" size="lg">
              ← Torna alla presentazione
            </Button>
          </div>
        </div>
      </Section>

      {/* COSA FA */}
      <Section className="pt-0">
        <ScrollReveal className="grid gap-5 md:grid-cols-3" stagger={0.08}>
          {CAPABILITIES.map(({ icon: Icon, title, body }) => (
            <Card key={title} className="p-6">
              <span className="bg-accent-soft text-accent-ink flex h-11 w-11 items-center justify-center rounded-lg">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="text-foreground mt-4 text-lg font-semibold">{title}</h2>
              <p className="text-muted mt-2 text-sm leading-relaxed">{body}</p>
            </Card>
          ))}
        </ScrollReveal>
      </Section>

      {/* DEMO + COME SI INTEGRA */}
      <Section id="demo" className="scroll-mt-24 pt-0">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <Badge variant="outline">
              <Bot className="h-3.5 w-3.5" aria-hidden="true" /> Demo interattiva
            </Badge>
            <h2 className="font-display mt-3 text-2xl font-bold tracking-tight text-balance md:text-3xl">
              Come si integra nel tuo sito
            </h2>
            <p className="text-muted mt-3 max-w-xl">
              Un solo componente, autosufficiente e sicuro. Ecco cosa lo rende facile da adottare.
            </p>
            <ul className="mt-6 space-y-5">
              {INTEGRATION.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-4">
                  <span className="bg-accent-soft text-accent-ink flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-foreground font-semibold">{title}</h3>
                    <p className="text-muted mt-1 text-sm leading-relaxed">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Widget riusabile, autosufficiente */}
          <SiteAssistant />
        </div>
        <p className="text-muted mt-6 text-xs">
          Demo: l&apos;assistente risponde dai contenuti del sito con risposte preconfezionate per
          la presentazione.
        </p>
      </Section>
    </>
  );
}
