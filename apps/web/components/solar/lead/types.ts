/**
 * Tipi del prototipo "lead qualifier" (GM Solar · /solar/lead).
 * Il Product-Selector Agent consiglia Monofase / Trifase / Accumulo e filtra le
 * richieste fuori tema (brand safety). `metadata` alimenta il pannello di
 * agent-reasoning (thought / toolUsed / recommendedProduct / qualificationStatus).
 */
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    isOutOfScope?: boolean;
    thought?: string;
    toolUsed?: string;
    recommendedProduct?: string;
    qualificationStatus?: string;
  };
}
