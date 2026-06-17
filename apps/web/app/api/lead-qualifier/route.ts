/**
 * LEAD-QUALIFIER — route handler server-side (GM Solar · /solar/lead).
 *
 * Porting di server.ts (Express → Gemini) sul nostro helper multi-provider.
 * Architettura a 3 livelli, in ordine di priorità:
 *   1) risposte PRE-BAKED per gli scenari chiave della demo (istantanee, sempre)
 *   2) LLM (se AI_API_KEY è presente) con output JSON strutturato
 *   3) fallback EURISTICO deterministico (nessuna chiave): la demo non si rompe mai
 *
 * La chiave vive SOLO qui (helper @/lib/ai). GET espone solo un booleano.
 */
import { resolveAiProvider, completeJSON, type AiMessage } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** Forma della risposta consumata dal client (LeadQualifierApp). */
type LeadResult = {
  replyContent: string;
  isOutOfScope: boolean;
  thought: string;
  toolUsed: string;
  recommendedProduct: string;
  qualificationStatus: string;
};

const SOLAR_CONTEXT = `
Contenuto della pagina "Tipologia di Impianti" di GM Solar:
1. Impianti Fotovoltaici Monofase: ideali per utenze domestiche/residenziali (case, villette). Potenze standard fino a 6 kW.
2. Impianti Fotovoltaici Trifase: per contesti commerciali, industriali, agricoli o grandi abitazioni con carichi elevati. Potenze superiori a 6 kW.
3. Sistemi di Accumulo (Batterie): immagazzinano l'energia prodotta in eccesso di giorno per usarla la sera/notte. Massimizzano l'autoconsumo.
`;

const SYSTEM_INSTRUCTION = `Sei il Product Selector Agent (PS_Agent) e Out-of-Scope Filter per GM Solar. Qualifichi i lead della pagina "Tipologia di Impianti".
Regole:
1. Sei un "Prototipo dimostrativo AI": dichiaralo nel benvenuto o se ti chiedono chi sei.
2. Fuori tema (Out-of-Scope): se la richiesta NON riguarda fotovoltaico, GM Solar, tipologie di impianto (Monofase/Trifase/Accumulo) o efficienza energetica, BLOCCALA con cortesia e riporta l'utente al solare. Film, ricette, sport e simili sono fuori tema.
3. Analisi del bisogno: residenziale/domestico → "Monofase"; consumi serali/notturni o "fuori casa di giorno" → aggiungi "Sistema di Accumulo (Batteria)"; aziendale/agricolo/commerciale/industriale o grandi carichi → "Trifase".
4. Rispondi SOLO con un oggetto JSON con esattamente queste chiavi (stringhe, tranne isOutOfScope booleano):
   isOutOfScope, thought, toolUsed, recommendedProduct, replyContent, qualificationStatus.
Le risposte (replyContent, thought, ...) sono in italiano.
${SOLAR_CONTEXT}`;

/* ---------------- 1) Risposte pre-baked (scenari della demo) ---------------- */
function prebaked(text: string): LeadResult | null {
  const t = text.trim().toLowerCase();

  if (t.includes("fantascienza") || t.includes("consigliami un buon film")) {
    return {
      replyContent:
        "Siamo spiacenti, ma essendo questo un prototipo dimostrativo focalizzato, posso rispondere solo a domande riguardanti la scelta dell'impianto solare ideale per GM Solar ed efficienza energetica. Posso aiutarti a capire se per la tua casa sia più indicato un impianto Monofase o Trifase?",
      isOutOfScope: true,
      thought:
        "L'utente ha chiesto consigli su film di fantascienza slegati al fotovoltaico. Attivato Out-of-Scope Filter per proteggere il brand GM Solar.",
      toolUsed: "Out-of-Scope Filter",
      recommendedProduct: "Nessuno (Richiesta bloccata)",
      qualificationStatus: "Analisi Bloccata - Fuori Tema",
    };
  }

  if (
    t.includes("novara") ||
    t.includes("villetta") ||
    (t.includes("consumiamo molto la sera") && t.includes("4 in famiglia"))
  ) {
    return {
      replyContent:
        "Per la tua villetta a Novara con 4 persone e consumi concentrati la sera, la soluzione ideale basata sui dati GM Solar è il nostro **Impianto Fotovoltaico Monofase** abbinato a un **Sistema di Accumulo (Batterie)**.\n\nPerché:\n- **Monofase**: perfetto per potenze residenziali fino a 6 kW, copre una famiglia di 4 persone.\n- **Accumulo**: essendo fuori casa di giorno, la batteria immagazzina l'energia del sole per la sera, azzerando quasi del tutto la bolletta.\n\nTi va di programmare una breve call con un nostro consulente per un preventivo gratuito personalizzato?",
      isOutOfScope: false,
      thought:
        "L'utente descrive una villetta residenziale a Novara con 4 persone (Monofase) e consumi serali perché fuori di giorno (Sistema di Accumulo). Richiamato il Context Tool sul catalogo GM Solar e applicate le regole di PS_Agent.",
      toolUsed: "PS_Agent + Context Tool",
      recommendedProduct: "Impianto Monofase + Batterie di Accumulo",
      qualificationStatus: "Qualificato - Preventivo Residenziale con Accumulo",
    };
  }

  return null;
}

/* ---------------- 3) Fallback euristico (nessuna chiave) ---------------- */
const SOLAR_KEYWORDS = [
  "solare", "pannell", "fotovoltaic", "energ", "accumul", "batteri", "kw", "monofas",
  "trifas", "corrent", "bollett", "gm solar", "casa", "villa", "azienda", "consum", "novara",
];

function heuristic(text: string): LeadResult {
  const t = text.toLowerCase();
  const onTopic = SOLAR_KEYWORDS.some((k) => t.includes(k));

  if (!onTopic) {
    return {
      isOutOfScope: true,
      thought:
        "Domanda non attinente ai temi di GM Solar (fotovoltaico ed efficienza). Filtro di sicurezza attivato per prevenire deviazioni dal brand.",
      toolUsed: "Out-of-Scope Filter",
      recommendedProduct: "Nessuno (Richiesta filtrata)",
      replyContent:
        "Siamo spiacenti, ma trattandosi di un prototipo dimostrativo per l'efficienza energetica di GM Solar, posso rispondere esclusivamente a quesiti sulla scelta dell'impianto solare ideale. Posso aiutarti a decidere quale soluzione si adatti meglio alle tue esigenze residenziali o commerciali?",
      qualificationStatus: "Analisi Bloccata - Fuori Tema",
    };
  }

  if (t.includes("aziend") || t.includes("commerc") || t.includes("fabbric") || t.includes("trifas")) {
    return {
      isOutOfScope: false,
      thought:
        "L'utente menziona scopi commerciali o industriali. Attivato PS_Agent e Context Tool. Consigliata categoria: Impianto Trifase.",
      recommendedProduct: "Impianto Fotovoltaico Trifase (potenze > 6 kW)",
      toolUsed: "PS_Agent + Context Tool",
      replyContent:
        "Per la tua attività lavorativa o commerciale, offriamo l'Impianto Fotovoltaico Trifase di GM Solar. È progettato per gestire carichi elevati (superiori a 6 kW) e macchinari professionali, massimizzando l'efficienza operativa della tua azienda. Desideri programmare un contatto con un nostro tecnico esperto?",
      qualificationStatus: "Qualificato - Lead Aziendale / Commerciale",
    };
  }

  if (t.includes("accumul") || t.includes("batteri")) {
    return {
      isOutOfScope: false,
      thought: "L'utente chiede di batterie o sistemi di accumulo. Attivato PS_Agent.",
      recommendedProduct: "Sistemi di Accumulo (Batterie)",
      toolUsed: "PS_Agent + Context Tool",
      replyContent:
        "I sistemi di accumulo a batterie di GM Solar consentono di immagazzinare l'energia prodotta in eccesso durante le ore di sole e utilizzarla la sera e la notte. È il modo più efficace per raggiungere l'indipendenza energetica residenziale! Vorresti ricevere maggiori dettagli o una stima di risparmio?",
      qualificationStatus: "Qualificato - Interessato ad Accumulo",
    };
  }

  return {
    isOutOfScope: false,
    thought: "Richiesta inerente al solare. Attivato Context Tool e PS_Agent per guidare la qualificazione.",
    recommendedProduct: "Impianto Fotovoltaico Monofase / Accumulo",
    toolUsed: "Context Tool",
    replyContent:
      "Benvenuto su GM Solar! In qualità di assistente demo per l'efficienza energetica, posso indirizzarti verso l'impianto solare ottimale. Per quantificare la soluzione ideale, potresti dirmi se l'impianto servirà una casa privata (residenziale) o un'azienda, e se consumate energia principalmente di giorno o di sera?",
    qualificationStatus: "Lead in Profilazione",
  };
}

/** Valida che il JSON del modello abbia la forma attesa. */
function isLeadResult(v: unknown): v is LeadResult {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.replyContent === "string" &&
    typeof o.thought === "string" &&
    typeof o.toolUsed === "string" &&
    typeof o.recommendedProduct === "string" &&
    typeof o.qualificationStatus === "string" &&
    typeof o.isOutOfScope === "boolean"
  );
}

export function GET() {
  return Response.json({ aiEnabled: resolveAiProvider() !== null });
}

const MAX_CONTENT_CHARS = 2000;
const MAX_MESSAGES = 16;

export async function POST(req: Request) {
  let currentMessage = "";
  let history: AiMessage[] = [];
  try {
    const body = (await req.json()) as {
      currentMessage?: unknown;
      messages?: unknown;
    };
    if (typeof body.currentMessage === "string") {
      currentMessage = body.currentMessage.slice(0, MAX_CONTENT_CHARS);
    }
    if (Array.isArray(body.messages)) {
      history = body.messages
        .slice(-MAX_MESSAGES)
        .map((m) => m as { role?: unknown; content?: unknown })
        .filter(
          (m): m is AiMessage =>
            (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
        )
        .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CONTENT_CHARS) }));
    }
  } catch {
    return Response.json({ error: "Richiesta non valida." }, { status: 400 });
  }

  if (!currentMessage.trim()) {
    return Response.json({ error: "Messaggio corrente vuoto." }, { status: 400 });
  }

  // 1) Scenari pre-baked: risposta immediata e precisa.
  const baked = prebaked(currentMessage);
  if (baked) return Response.json(baked);

  // 2) LLM (se configurato). Su qualunque errore/parsing fallito → euristica.
  const provider = resolveAiProvider();
  if (provider) {
    try {
      const messages: AiMessage[] = [
        ...history.filter((m) => m.role === "user" || m.role === "assistant"),
        {
          role: "user",
          content: `Nuovo messaggio dell'utente:\n"${currentMessage}"\n\nRispondi compilando rigorosamente il JSON richiesto.`,
        },
      ];
      // Il primo turno deve essere "user".
      while (messages.length && messages[0].role !== "user") messages.shift();

      const parsed = await completeJSON<LeadResult>(provider, {
        system: SYSTEM_INSTRUCTION,
        messages,
      });
      if (isLeadResult(parsed)) return Response.json(parsed);
    } catch {
      /* rete/modello KO → fallback euristico sotto */
    }
  }

  // 3) Fallback deterministico.
  return Response.json(heuristic(currentMessage));
}
