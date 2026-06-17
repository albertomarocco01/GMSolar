/**
 * Tipi del prototipo "intelligent analytics" (GM Solar · /solar/analytics).
 * Un agente traduce il linguaggio naturale in SQL, sintetizza i risultati e
 * disegna un grafico; un Security Audit Gatekeeper blocca le richieste di dati
 * sensibili (PIN, PII) per conformità GDPR, con audit-trail.
 */
export interface EVStationMetric {
  id: string;
  name: string;
  type: "Pubblico Ultra-Fast" | "Pubblico Fast" | "Privato Aziendale" | "Privato Residenziale";
  location: string;
  status: "Attiva" | "Manutenzione" | "Inattiva";
  totalKWh: number;
  usagePercentage: number;
  revenue: number;
}

export interface AuditLogEntry {
  timestamp: string;
  tool: "Security_Audit_Tool" | "SQL_Generator_Tool" | "Chart_Renderer_Tool" | "System";
  status: "INFO" | "WARNING" | "SUCCESS" | "BLOCKED" | "DANGER";
  message: string;
  details?: string;
}

/** Punto dati per Recharts: una label + serie numeriche/testuali nominate. */
export type ChartPoint = { label: string } & Record<string, string | number>;

export interface AgentSimulationState {
  thought: string;
  sqlQuery?: string;
  authorized: boolean;
  rejectionReason?: string;
  responseMarkdown: string;
  chartType?: "line" | "bar" | "pie" | "none";
  chartData?: ChartPoint[];
  chartKeys?: string[];
  chartTitle?: string;
  auditTrail: AuditLogEntry[];
}
