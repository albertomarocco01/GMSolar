import { Product } from './types';

export const CATALOG: Product[] = [
  {
    id: 'm3-liscio',
    title: 'Mennekes Mode 3 Type 2 (Liscio)',
    price: 219,
    badges: ['Mode 3', 'Type 2', '22kW'],
    reasons: [
      'Facile da riporre nel bagagliaio',
      'Massima velocità alle colonnine pubbliche',
      'Ideale per ricariche frequenti e veloci'
    ],
    icon: 'Cable'
  },
  {
    id: 'm3-spiralato',
    title: 'Mennekes Mode 3 Type 2 (Spiralato)',
    price: 219,
    badges: ['Mode 3', 'Type 2', 'Best Seller'],
    reasons: [
      'Non tocca terra, restando sempre pulito',
      'Si estende agilmente per occupare meno spazio',
      "Costruzione premium resistente all'usura"
    ],
    icon: 'Activity'
  },
  {
    id: 'm2-schuko',
    title: 'Mennekes Mode 2 Type 2 (Schuko)',
    price: 389,
    badges: ['Mode 2', 'Schuko', 'Domestico'],
    reasons: [
      'Ricarica da qualsiasi presa domestica standard',
      'Nessuna installazione a muro necessaria',
      'Sensore di temperatura integrato per la massima sicurezza'
    ],
    icon: 'PlugZap'
  }
];

export const generateResponse = (input: string) => {
  const normalized = input.toLowerCase();
  let recId = 'm3-spiralato'; // default best seller
  let text = "Basato sul tuo veicolo, ecco la nostra raccomandazione principale per un'esperienza di ricarica impeccabile.";

  if (normalized.includes('casa') || normalized.includes('schuko') || normalized.includes('domestica') || normalized.includes('garage') || normalized.includes('box')) {
    recId = 'm2-schuko';
    text = "Per ricaricare comodamente a casa senza wallbox, il caricatore portatile Mode 2 è la scelta ideale e sicura.";
  } else if (normalized.includes('liscio')) {
    recId = 'm3-liscio';
    text = "Come preferisci: ecco il cavo liscio Mode 3, perfetto per riporlo rapidamente e mantenere un ordine impeccabile.";
  } else if (normalized.includes('tesla') || normalized.includes('fiat') || normalized.includes('500') || normalized.includes('volkswagen')) {
    text = `Ottima scelta! Per la tua ${input.trim()}, i nostri clienti preferiscono in assoluto la comodità del cavo spiralato. Non tocca mai terra.`;
  } else {
    text = `Perfetto, per ricaricare la tua ${input.trim() || 'auto'} al meglio, ti suggerisco il nostro Best Seller.`;
  }

  const recommendation = CATALOG.find(p => p.id === recId);

  return {
    id: Math.random().toString(36).substring(7),
    role: 'assistant' as const,
    text,
    recommendation,
    comparison: CATALOG
  };
};
