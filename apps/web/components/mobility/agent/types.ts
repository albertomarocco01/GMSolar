/**
 * Tipi del prototipo "assistente di ricarica a bordo" (GMobility · /mobility/agent).
 * Demo CLIENT-SIDE: nessuna chiamata server, nessuna chiave. La "AI" è uno script
 * a keyword-matching (vedi EvAgentApp.tsx) — il fascino è nella generative UI.
 */
export interface Message {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
  thinking?: boolean;
  guardrail?: boolean;
  toolLogs?: ToolLog[];
  /** UI generativa allegata al messaggio dell'agente: timer di ricarica o scontrino costi. */
  genUiType?: "timer" | "receipt";
}

export interface ToolLog {
  id: string;
  name: "EV_Status_Tool" | "Geolocation_Tool" | "Booking_Tool";
  status: "idle" | "running" | "success" | "error";
  input: string;
  output: string;
  timestamp: string;
}

export interface VehicleState {
  model: string;
  soc: number;
  portType: string;
  rangeKm: number;
  isCharging: boolean;
  destination: string;
}

export interface ChargingStation {
  id: string;
  name: string;
  powerKw: number;
  distanceKm: number;
  stallsCount: number;
  availableStalls: number;
  nearbyPoi: string;
  address: string;
  coordinates: { x: number; y: number };
}
