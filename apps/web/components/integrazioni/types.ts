/**
 * Tipi condivisi per la sezione Integrazioni API.
 * Usati da ConnectorCard, FlowNode, FlowDiagram, FlowLog.
 */

import type { LucideIcon } from "lucide-react";

export type ConnectorDef = {
  id: string;
  icon: LucideIcon;
  name: string;
  /** Una riga di spiegazione del connettore. */
  description: string;
};

export type FlowStep = {
  id: string;
  icon: LucideIcon;
  label: string;
};

export type FlowLogEntry = {
  /** Timestamp fittizio (HH:MM:SS) — simulazione dimostrativa. */
  time: string;
  text: string;
};

export type FlowScenario = {
  id: string;
  title: string;
  description: string;
  /** Step da sinistra a destra nel diagramma. */
  steps: FlowStep[];
  /** Una voce di log per ogni step (indice 0 = primo step attivato). */
  logEntries: FlowLogEntry[];
};
