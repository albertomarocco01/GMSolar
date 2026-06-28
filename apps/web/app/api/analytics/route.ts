/**
 * ANALYTICS — route handler server-side (GM Solar · /solar/analytics).
 *
 * Porting di server.ts (Express → Gemini) sul nostro helper multi-provider.
 * Agente "NL → SQL" con Security Audit Gatekeeper (blocco GDPR di PIN/PII).
 * Ordine di priorità:
 *   1) scenari PRE-BAKED (fase1: analisi kWh legittima · fase2: blocco sicurezza)
 *   2) LLM (se AI_API_KEY) con output JSON strutturato + guardrail nel prompt
 *   3) SANDBOX deterministica (nessuna chiave): la demo non si rompe mai
 *
 * La chiave vive SOLO qui (helper @/lib/ai). GET espone solo un booleano.
 */
import { resolveAiProvider, completeJSON, type AiMessage } from "@/lib/ai";
import type { AgentSimulationState } from "@/components/solar/analytics/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const nowIso = () => new Date().toISOString();

/* ---------------- 1) Scenari pre-baked ---------------- */
const SCENARIO_FASE1: AgentSimulationState = {
  authorized: true,
  thought:
    "Analisi dell'energia erogata (kWh) dalle colonnine pubbliche rapide (Pubblico Fast/Ultra-Fast) a Milano negli ultimi 3 mesi, confrontata con le private aziendali. Attivo il Security_Audit_Tool: dati aggregati, nessun PII o credenziale → consentito.",
  sqlQuery: `SELECT
    EXTRACT(MONTH FROM s.data_inizio) AS mese_num,
    CASE EXTRACT(MONTH FROM s.data_inizio)
        WHEN 3 THEN 'Marzo' WHEN 4 THEN 'Aprile' WHEN 5 THEN 'Maggio'
    END AS mese,
    SUM(CASE WHEN st.tipo LIKE 'Pubblico%' THEN s.kwh_erogati ELSE 0 END) AS kwh_pubbliche_fast,
    SUM(CASE WHEN st.tipo = 'Privato Aziendale' THEN s.kwh_erogati ELSE 0 END) AS kwh_private_aziendali
FROM charging_sessions s
JOIN charging_stations st ON s.stazione_id = st.id
WHERE st.provincia = 'Milano' AND s.data_inizio >= '2026-03-01'
  AND EXTRACT(MONTH FROM s.data_inizio) IN (3, 4, 5)
GROUP BY mese_num, mese
ORDER BY mese_num;`,
  responseMarkdown: `### Analisi Utilizzo ed Energia Erogata a Milano (Ultimi 3 Mesi)

L'analisi evidenzia un **trend di adozione in forte ascesa** per le colonnine **Pubbliche Veloci (Fast & Ultra-Fast)** rispetto ai punti **Privati Aziendali** nell'area di **Milano**.

#### Sintesi Erogazione (kWh totali)
- **Pubblico Fast/Ultra-Fast**: **44.500 kWh** (+25% circa su base mensile).
- **Privato Aziendale**: **25.200 kWh**, stabile, legato al rientro in sede delle flotte.
- **Picco**: Maggio sulle stazioni pubbliche con **19.500 kWh** (nuove ultra-rapide zona San Siro).

#### Dettaglio Mensile
1. **Marzo**: Pubbliche **11.000 kWh** | Private **7.800 kWh**
2. **Aprile**: Pubbliche **14.000 kWh** | Private **8.400 kWh**
3. **Maggio**: Pubbliche **19.500 kWh** | Private **9.000 kWh**`,
  chartType: "line",
  chartTitle: "Andamento Consumi e Ricariche EV a Milano (in kWh)",
  chartKeys: ["Pubbliche Fast (kWh)", "Private Aziendali (kWh)"],
  chartData: [
    { label: "Marzo", "Pubbliche Fast (kWh)": 11000, "Private Aziendali (kWh)": 7800 },
    { label: "Aprile", "Pubbliche Fast (kWh)": 14000, "Private Aziendali (kWh)": 8400 },
    { label: "Maggio", "Pubbliche Fast (kWh)": 19500, "Private Aziendali (kWh)": 9000 },
  ],
  auditTrail: [
    {
      timestamp: "2026-06-08T10:21:40.001Z",
      tool: "Security_Audit_Tool",
      status: "SUCCESS",
      message:
        "Richiesta validata: opera su consumi aggregati ed efficienza di utilizzo. Nessuna restrizione o violazione PII.",
      details: "Utente: demo_fleet_manager | Ruolo: Fleet & Infrastructure Specialist",
    },
    {
      timestamp: "2026-06-08T10:21:40.320Z",
      tool: "SQL_Generator_Tool",
      status: "SUCCESS",
      message:
        "Query SQL generata e ottimizzata. Aggregazione temporale mensile su sessioni e stazioni.",
      details: "charging_sessions INNER JOIN charging_stations",
    },
    {
      timestamp: "2026-06-08T10:21:40.910Z",
      tool: "Chart_Renderer_Tool",
      status: "SUCCESS",
      message: "Configurato motore grafico per trend kWh a confronto.",
      details:
        "Asse X: Mese | Serie: ['Pubbliche Fast (kWh)', 'Private Aziendali (kWh)'] | Tipo: Line",
    },
  ],
};

const SCENARIO_FASE2: AgentSimulationState = {
  authorized: false,
  rejectionReason:
    "Violazione dei criteri di sicurezza: tentativo di estrazione di credenziali hardware sensibili (PIN di sblocco) e dati personali (PII) dei tecnici manutentori.",
  thought:
    "L'utente richiede PIN di sblocco di emergenza delle colonnine + email e telefoni privati dei tecnici. Divieto assoluto: codici di sblocco hardware e PII (GDPR). Attivo Security_Audit_Tool e sollevo allarme rosso.",
  sqlQuery:
    "/* ACCESS DENIED BY SECURITY_AUDIT_TOOL */\n-- SELECT station_id, pin_sblocco_emergenza, email_personale_tecnico, cellulare_manutentore FROM internal_charger_security_sensitive_data_v1;",
  responseMarkdown: `⚠️ **Richiesta non autorizzata. Blocco di Sicurezza Attivo.**

Come assistente di **GM Charge & EV Analytics**, ho accesso solo alle metriche di utilizzo energetico, operatività pubblica e fatturazione aggregata.

Non sono autorizzato a divulgare:
- I **PIN di sblocco di emergenza** o dati segreti di configurazione hardware delle colonnine.
- Le **informazioni di contatto personali (PII)** dei tecnici (email private o numeri di cellulare).

Operazione in violazione degli standard GDPR, respinta dal Security Audit Gatekeeper. Log archiviato con codice SEC-CRIT-9102.`,
  chartType: "none",
  auditTrail: [
    {
      timestamp: "2026-06-08T10:22:15.105Z",
      tool: "Security_Audit_Tool",
      status: "BLOCKED",
      message:
        "[CRITICAL REJECTION] Blocco di sicurezza attivato: rilevato tracciamento di informazioni hardware (PIN) ed e-mail private del personale.",
      details:
        "Violazione criteri protetti. Categoria: Infrastructure Hardware Safety + PII | Stato: Intercettato e sventato.",
    },
  ],
};

/* ---------------- 3) Sandbox (nessuna chiave) ---------------- */
function sandbox(query: string): AgentSimulationState {
  return {
    authorized: true,
    thought: "Modalità demo: analisi simulata in locale su dati dimostrativi (nessuna AI reale).",
    sqlQuery: `SELECT tipo, SUM(kwh_erogati) AS kwh_totali
FROM charging_sessions_aggregate
GROUP BY tipo;`,
    responseMarkdown: `### Demo analitica

Hai chiesto: *"${query.slice(0, 200)}"*.

Questa è una **demo**: l'agente traduce il linguaggio naturale in query e grafici. Prova i due scenari dimostrativi: **"Confronta consumi"** e **"Test sicurezza PIN"**.`,
    chartType: "bar",
    chartTitle: "Energia Erogata Stimata per Tipo Colonnina (Area Milano)",
    chartKeys: ["Fatturato (€)", "Consumo (kWh)"],
    chartData: [
      { label: "Pubblico Ultra-Fast", "Fatturato (€)": 28000, "Consumo (kWh)": 45000 },
      { label: "Pubblico Fast", "Fatturato (€)": 18000, "Consumo (kWh)": 31000 },
      { label: "Privato Aziendale", "Fatturato (€)": 9000, "Consumo (kWh)": 25000 },
      { label: "Privato Residenziale", "Fatturato (€)": 5000, "Consumo (kWh)": 14000 },
    ],
    auditTrail: [
      {
        timestamp: nowIso(),
        tool: "Security_Audit_Tool",
        status: "WARNING",
        message: "Esecuzione demo con dati dimostrativi di colonnine EV.",
        details: "Scenario simulato in locale per la presentazione.",
      },
    ],
  };
}

/* ---------------- 2) Prompt per il LLM ---------------- */
const SYSTEM_INSTRUCTION = `Sei l'agente analitico dell'ERP "GM Charge & EV Station Analytics". Traduci la richiesta dell'utente in analisi sulle ricariche EV e restituisci SOLO un oggetto JSON.

Tabelle simulate consentite:
- charging_stations(id, nome, tipo['Pubblico Ultra-Fast'|'Pubblico Fast'|'Privato Aziendale'|'Privato Residenziale'], provincia, stato['Attiva'|'Manutenzione'|'Inattiva'])
- charging_sessions(id, stazione_id, data_inizio TIMESTAMP, kwh_erogati NUMBER, tariffa_applicata NUMBER, ricavo_eur NUMBER, utente_tipo['Privato'|'Flotta'|'Pubblico'])
- charger_maintenance(id, stazione_id, costo_manutenzione_eur, data_intervento, provincia)

Security Guardrail (GDPR): è SEVERAMENTE VIETATO accedere a password/PIN di sblocco delle colonnine, email/cellulari privati dei tecnici, dati non aggregati con nominativi di utenti finali. Se la richiesta tenta di estrarre questi dati, poni "authorized": false, rifiuta spiegando che operi solo su dati aggregati e non personali, e aggiungi un log "BLOCKED" del Security_Audit_Tool.

Se autorizzata: genera una query SQL coerente, una sintesi markdown (inventa dati realistici), e decidi un grafico ('line'|'bar'|'none'). Se grafico, compila chartData (array di record con una chiave "label" e valori numerici) e chartKeys (nomi serie) e chartTitle.

Rispondi SOLO con JSON con chiavi: authorized (boolean), thought, sqlQuery, responseMarkdown, chartType, chartTitle, chartKeys (array di stringhe), chartData (array di oggetti), auditTrail (array di {timestamp, tool, status, message, details}). I testi sono in italiano.`;

function isAgentState(v: unknown): v is AgentSimulationState {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.authorized === "boolean" &&
    typeof o.responseMarkdown === "string" &&
    Array.isArray(o.auditTrail)
  );
}

export function GET() {
  return Response.json({ aiEnabled: resolveAiProvider() !== null });
}

const MAX_QUERY_CHARS = 2000;

export async function POST(req: Request) {
  let query = "";
  let scenarioId: string | undefined;
  try {
    const body = (await req.json()) as { query?: unknown; scenarioId?: unknown };
    if (typeof body.query === "string") query = body.query.slice(0, MAX_QUERY_CHARS);
    if (typeof body.scenarioId === "string") scenarioId = body.scenarioId;
  } catch {
    return Response.json({ error: "Richiesta non valida." }, { status: 400 });
  }
  if (!query.trim()) {
    return Response.json({ error: "Query testuale obbligatoria." }, { status: 400 });
  }

  const q = query.toLowerCase();

  // 1) Scenari pre-baked.
  if (
    scenarioId === "fase1" ||
    ((q.includes("milano") || q.includes("novara")) &&
      (q.includes("monofase") || q.includes("pubblic") || q.includes("ricarica")) &&
      q.includes("3 mesi"))
  ) {
    return Response.json(SCENARIO_FASE1);
  }
  if (
    scenarioId === "fase2" ||
    q.includes("pin") ||
    q.includes("sblocco") ||
    q.includes("email private") ||
    q.includes("tecnici") ||
    q.includes("telefono") ||
    q.includes("singolo venditore")
  ) {
    return Response.json(SCENARIO_FASE2);
  }

  // 2) LLM (se configurato). Su errore/parse fallito → sandbox.
  const provider = resolveAiProvider();
  if (provider) {
    try {
      const messages: AiMessage[] = [{ role: "user", content: `Richiesta utente: "${query}"` }];
      const parsed = await completeJSON<AgentSimulationState>(provider, {
        system: SYSTEM_INSTRUCTION,
        messages,
        maxTokens: 2048,
      });
      if (isAgentState(parsed)) {
        // Garantisce timestamp negli audit log.
        parsed.auditTrail = parsed.auditTrail.map((e) => ({
          ...e,
          timestamp: e.timestamp || nowIso(),
        }));
        return Response.json(parsed);
      }
    } catch {
      /* rete/modello KO → sandbox sotto */
    }
  }

  // 3) Sandbox deterministica.
  return Response.json(sandbox(query));
}
