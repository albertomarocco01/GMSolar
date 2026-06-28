/**
 * Dati simulati per la sezione Integrazioni API.
 *
 * SIMULAZIONE DIMOSTRATIVA — nessuna chiamata reale viene effettuata.
 * Punti d'innesto reali (commentati per riferimento):
 *   WhatsApp Cloud API : POST /{phone-number-id}/messages   (Meta Graph API v18+)
 *   Resend email       : POST https://api.resend.com/emails
 *   HubSpot CRM        : POST https://api.hubapi.com/crm/v3/objects/contacts
 *   Google Calendar    : POST https://www.googleapis.com/calendar/v3/calendars/{id}/events
 *   Stripe webhook     : event `payment_intent.succeeded`
 *   Google Sheets      : POST https://sheets.googleapis.com/v4/spreadsheets/{id}/values/{range}:append
 *   OpenAI / Claude    : POST https://api.openai.com/v1/chat/completions
 */

import {
  MessageCircle,
  Mail,
  Users,
  CreditCard,
  CalendarDays,
  Bot,
  BarChart3,
  Globe,
} from "lucide-react";
import type { ConnectorDef, FlowScenario } from "./types";

export const CONNECTORS: ConnectorDef[] = [
  {
    id: "whatsapp",
    icon: MessageCircle,
    name: "WhatsApp",
    description: "Messaggi automatici di benvenuto, notifiche e aggiornamenti via Cloud API.",
  },
  {
    id: "email",
    icon: Mail,
    name: "Email (Resend)",
    description: "Email transazionali con template React e consegna ad alta deliverability.",
  },
  {
    id: "crm",
    icon: Users,
    name: "CRM",
    description:
      "Sync bidirezionale di contatti, lead e opportunità con HubSpot, Salesforce e altri.",
  },
  {
    id: "stripe",
    icon: CreditCard,
    name: "Pagamenti (Stripe)",
    description: "Webhook post-pagamento per ricevute istantanee e automazioni di follow-up.",
  },
  {
    id: "calendar",
    icon: CalendarDays,
    name: "Calendar",
    description: "Creazione automatica di appuntamenti e promemoria su Google Calendar.",
  },
  {
    id: "ai",
    icon: Bot,
    name: "AI / LLM",
    description: "Classificazione, riassunto e risposta automatica via modelli linguistici.",
  },
  {
    id: "sheets",
    icon: BarChart3,
    name: "Fogli / Sheets",
    description: "Lettura e scrittura su Google Sheets per report, log e dashboard leggere.",
  },
];

export const SCENARIOS: FlowScenario[] = [
  {
    id: "lead",
    title: "Nuovo lead dal sito",
    description:
      "Un visitatore compila il form di contatto: in pochi secondi riceve un messaggio WhatsApp di benvenuto, un'email di follow-up, viene registrato nel CRM e viene creato un promemoria in Calendar per il commerciale.",
    steps: [
      { id: "site", icon: Globe, label: "Form sito" },
      { id: "wa", icon: MessageCircle, label: "WhatsApp" },
      { id: "email", icon: Mail, label: "Email" },
      { id: "crm", icon: Users, label: "CRM" },
      { id: "cal", icon: CalendarDays, label: "Calendar" },
    ],
    logEntries: [
      { time: "09:41:02", text: "Nuovo lead ricevuto — form di contatto" },
      { time: "09:41:03", text: "✓ WhatsApp di benvenuto inviato" },
      { time: "09:41:04", text: "✓ Email follow-up consegnata via Resend" },
      { time: "09:41:05", text: "✓ Contatto creato nel CRM" },
      { time: "09:41:06", text: "✓ Promemoria aggiunto in Calendar" },
    ],
  },
  {
    id: "payment",
    title: "Pagamento ricevuto",
    description:
      "Un pagamento Stripe va a buon fine: viene inviata una ricevuta email, il CRM viene aggiornato con l'ordine, un modello AI analizza l'acquisto e genera un tag cliente, il report viene scritto su Google Sheets.",
    steps: [
      { id: "stripe", icon: CreditCard, label: "Stripe" },
      { id: "email", icon: Mail, label: "Ricevuta" },
      { id: "crm", icon: Users, label: "CRM" },
      { id: "ai", icon: Bot, label: "AI / LLM" },
      { id: "sheets", icon: BarChart3, label: "Sheets" },
    ],
    logEntries: [
      { time: "14:22:11", text: "Evento payment.succeeded ricevuto da Stripe" },
      { time: "14:22:12", text: "✓ Ricevuta inviata via Resend" },
      { time: "14:22:13", text: "✓ Record aggiornato nel CRM" },
      { time: "14:22:14", text: "✓ Analisi AI generata — cliente: high-value" },
      { time: "14:22:15", text: "✓ Report scritto su Google Sheets" },
    ],
  },
];
