/**
 * GM Group — Pannello Segnalazioni
 * Dati seed realistici per la demo (nessun backend reale).
 * Sostituire con chiamata API / fetch in produzione.
 */

import type { Segnalazione } from "./types";

export const SEED_DATA: Segnalazione[] = [
  {
    id: "SEG-2026-0001",
    tipo: "bug",
    titolo: "Navbar non si chiude dopo navigazione su iOS 17",
    descrizione:
      "Su iPhone 13 con iOS 17.4 il menu hamburger rimane aperto dopo aver toccato un link. Testato con Safari e Chrome mobile. Non riproducibile su Android.",
    priorita: "urgente",
    sito: "solar",
    stato: "in_lavorazione",
    dataCreazione: "2026-01-10",
    timeline: [
      { stato: "aperta", data: "2026-01-10", nota: "Segnalazione creata" },
      { stato: "in_lavorazione", data: "2026-01-12", nota: "Presa in carico dal team frontend" },
    ],
  },
  {
    id: "SEG-2026-0002",
    tipo: "modifica",
    titolo: "Aggiornare listino prezzi cavi con tariffari Q2 2026",
    descrizione:
      "I prezzi per i cavi di ricarica Tipo 2 sono variati dal 1° aprile. Vanno aggiornati nella pagina prodotti, nel comparatore e nel PDF scaricabile.",
    priorita: "alta",
    sito: "shop",
    stato: "aperta",
    dataCreazione: "2026-02-03",
    timeline: [{ stato: "aperta", data: "2026-02-03", nota: "Segnalazione creata" }],
  },
  {
    id: "SEG-2026-0003",
    tipo: "domanda",
    titolo: "Come si aggiorna il catalogo prodotti dal pannello admin?",
    descrizione:
      "Non trovo la sezione per modificare le schede prodotto. Ho accesso admin ma la voce di menu non compare. Il permesso potrebbe non essere stato abilitato?",
    priorita: "bassa",
    sito: "shop",
    stato: "risolta",
    dataCreazione: "2026-02-15",
    timeline: [
      { stato: "aperta", data: "2026-02-15", nota: "Segnalazione creata" },
      { stato: "in_lavorazione", data: "2026-02-16", nota: "Verifica permessi utente avviata" },
      { stato: "risolta", data: "2026-02-17", nota: "Permessi corretti, voce di menu abilitata" },
    ],
  },
  {
    id: "SEG-2026-0004",
    tipo: "bug",
    titolo: "Grafico consumi dashboard sfasato di 1h dopo cambio ora legale",
    descrizione:
      "Dalla notte del 30 marzo i grafici della dashboard mostrano i dati con uno scarto di +1h. I totali giornalieri sono corretti ma i punti del grafico sono spostati.",
    priorita: "alta",
    sito: "dashboard",
    stato: "aperta",
    dataCreazione: "2026-03-31",
    timeline: [{ stato: "aperta", data: "2026-03-31", nota: "Segnalazione creata" }],
  },
  {
    id: "SEG-2026-0005",
    tipo: "modifica",
    titolo: "Aggiungere badge 'Novità' ai prodotti pubblicati negli ultimi 30 giorni",
    descrizione:
      "Vorremmo evidenziare i nuovi arrivi nel catalogo con un badge verde 'Novità'. La durata sarebbe di 30 giorni dalla data di pubblicazione, poi sparisce automaticamente.",
    priorita: "media",
    sito: "shop",
    stato: "risolta",
    dataCreazione: "2026-03-05",
    timeline: [
      { stato: "aperta", data: "2026-03-05", nota: "Segnalazione creata" },
      { stato: "in_lavorazione", data: "2026-03-07", nota: "Design e implementazione in corso" },
      { stato: "risolta", data: "2026-03-12", nota: "Badge live in produzione" },
    ],
  },
  {
    id: "SEG-2026-0006",
    tipo: "bug",
    titolo: "Calcolatore ROI fotovoltaico si blocca su Safari 16 a campi vuoti",
    descrizione:
      "Cliccando 'Calcola' senza inserire dati su Safari 16.x la pagina va in loop senza mostrare i messaggi di errore. Su Chrome e Firefox la validazione funziona correttamente.",
    priorita: "urgente",
    sito: "solar",
    allegatoNome: "screen-safari-calculator-bug.png",
    stato: "in_lavorazione",
    dataCreazione: "2026-04-02",
    timeline: [
      { stato: "aperta", data: "2026-04-02", nota: "Segnalazione creata" },
      {
        stato: "in_lavorazione",
        data: "2026-04-03",
        nota: "Bug riprodotto in ambiente di staging",
      },
    ],
  },
  {
    id: "SEG-2026-0007",
    tipo: "domanda",
    titolo: "Tempi di indicizzazione Google per articoli blog pubblicati",
    descrizione:
      "Abbiamo pubblicato 5 nuovi articoli blog la settimana scorsa ma non compaiono ancora su Google. È normale per contenuti nuovi? C'è una sitemap da inviare manualmente?",
    priorita: "bassa",
    sito: "altro",
    stato: "risolta",
    dataCreazione: "2026-04-10",
    timeline: [
      { stato: "aperta", data: "2026-04-10", nota: "Segnalazione creata" },
      {
        stato: "in_lavorazione",
        data: "2026-04-11",
        nota: "Verifica Google Search Console avviata",
      },
      {
        stato: "risolta",
        data: "2026-04-14",
        nota: "Sitemap inviata manualmente, indicizzazione completata",
      },
    ],
  },
  {
    id: "SEG-2026-0008",
    tipo: "modifica",
    titolo: "Sostituire mappa progetti statici con versione interattiva MapLibre",
    descrizione:
      "La mappa attuale è un'immagine statica. Vorremmo passare a una mappa interattiva con pin cliccabili e popup di dettaglio per ogni impianto fotovoltaico installato.",
    priorita: "media",
    sito: "solar",
    stato: "aperta",
    dataCreazione: "2026-04-18",
    timeline: [{ stato: "aperta", data: "2026-04-18", nota: "Segnalazione creata" }],
  },
  {
    id: "SEG-2026-0009",
    tipo: "bug",
    titolo: "Form contatto non invia email su iOS 16 (Safari)",
    descrizione:
      "Il form di contatto del sito GMobility non completa l'invio su iPhone con iOS 16 e Safari. La pagina torna all'inizio senza alcun messaggio di conferma o errore.",
    priorita: "alta",
    sito: "mobility",
    allegatoNome: "log-ios16-contact-form.txt",
    stato: "in_lavorazione",
    dataCreazione: "2026-05-08",
    timeline: [
      { stato: "aperta", data: "2026-05-08", nota: "Segnalazione creata" },
      { stato: "in_lavorazione", data: "2026-05-09", nota: "Indagine sull'handler POST in corso" },
    ],
  },
  {
    id: "SEG-2026-0010",
    tipo: "modifica",
    titolo: "Rivedere testi sezione 'Chi siamo' del sito GMobility",
    descrizione:
      "Il testo attuale riporta informazioni non aggiornate (anno fondazione, numero dipendenti, sede legale). Il documento con i nuovi testi approvati dall'ufficio legale è allegato.",
    priorita: "bassa",
    sito: "mobility",
    allegatoNome: "testi-chi-siamo-v2-approvati.docx",
    stato: "aperta",
    dataCreazione: "2026-05-20",
    timeline: [{ stato: "aperta", data: "2026-05-20", nota: "Segnalazione creata" }],
  },
  {
    id: "SEG-2026-0011",
    tipo: "bug",
    titolo: "Widget meteo dashboard fallisce le richieste API tra le 02:00 e le 04:00",
    descrizione:
      "In quella fascia oraria il widget mostra '--' invece dei dati meteorologici. I log mostrano timeout sull'API di terze parti. Probabilmente un problema di rate-limit notturno.",
    priorita: "media",
    sito: "dashboard",
    stato: "risolta",
    dataCreazione: "2026-05-25",
    timeline: [
      { stato: "aperta", data: "2026-05-25", nota: "Segnalazione creata" },
      { stato: "in_lavorazione", data: "2026-05-26", nota: "Analisi log API in corso" },
      {
        stato: "risolta",
        data: "2026-05-28",
        nota: "Aggiunta cache locale per i dati meteo notturni",
      },
    ],
  },
  {
    id: "SEG-2026-0012",
    tipo: "domanda",
    titolo: "Integrazione gestionale con Fatture in Cloud: è fattibile?",
    descrizione:
      "Siamo interessati a collegare il gestionale interno con Fatture in Cloud per automatizzare l'emissione delle fatture ai clienti. C'è un'API disponibile o conviene usare Zapier/Make?",
    priorita: "media",
    sito: "altro",
    stato: "aperta",
    dataCreazione: "2026-06-10",
    timeline: [{ stato: "aperta", data: "2026-06-10", nota: "Segnalazione creata" }],
  },
];
