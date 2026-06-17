"use client";

/* eslint-disable react/no-unescaped-entities --
   Copy della demo in italiano, fittissima di apostrofi (l', dell', un'…):
   l'escape HTML di ognuno non aggiunge valore e peggiora la leggibilità. */

import React, { useState, useEffect, useRef } from "react";
import {
  Sun,
  Battery,
  Zap,
  ShieldAlert,
  Send,
  Cpu,
  CheckCircle,
  Building2,
  Home,
  Sparkles,
  Lock,
  User,
  Mail,
  X,
  Info,
} from "lucide-react";
import { Message } from "./types";

// Id incrementale per i messaggi (puro: niente Math.random durante il render).
let msgSeq = 0;
const nextMsgId = () => `lead-msg-${++msgSeq}`;

// Messaggio di benvenuto: fattoria usata come stato iniziale (no setState in effetto).
function createWelcomeMessages(): Message[] {
  return [
    {
      id: "welcome-msg",
      role: "assistant",
      content: `**[Prototipo Dimostrativo AI • GM SOLAR]**

Salve! Benvenuto sul canale di consulenza pre-vendita intelligente di **GM Solar**.

Sono un assistente agentico demo, ideato appositamente per guidarti nella scoperta delle nostre soluzioni fotovoltaiche. Posso analizzare le tue necessità residenziali o aziendali per raccomandarti la tipologia di impianto ideale come:
- ☀️ **Impianti Monofase** (per contesti domestici standard fino a 6 kW)
- 🏢 **Impianti Trifase** (per carichi domestici elevati o industriali)
- 🔋 **Sistemi di Accumulo** (batterie per ottimizzare l'autoconsumo serale)

Seleziona una delle domande suggerite in basso oppure scrivimi direttamente la tua esigenza energetica!`,
      timestamp: new Date(),
      metadata: {
        isOutOfScope: false,
        thought: "Avvio della sessione.",
        toolUsed: "System Loader",
        recommendedProduct: "Nessuno (Benvenuto)",
        qualificationStatus: "Trasparenza Avviata",
      },
    },
  ];
}

export default function LeadQualifierApp() {
  // Chat state — benvenuto come stato iniziale (lazy initializer).
  const [messages, setMessages] = useState<Message[]>(createWelcomeMessages);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Dynamic generative state based on conversation context:
  // 'initial' | 'out_of_scope' | 'residenziale_accumulo' | 'industriale_trifase' | 'generico'
  const [generativeState, setGenerativeState] = useState<'initial' | 'out_of_scope' | 'residenziale_accumulo' | 'industriale_trifase' | 'generico'>('initial');
  
  // Custom contact modal state for the "Contattaci" button
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({
    nome: '',
    email: '',
    telefono: '',
    note: ''
  });

  // Chat container reference for auto-scroll
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Suggestions for 1-click test of the 4 requested phases
  const suggestions = [
    {
      id: 'f1',
      title: "Fase 1: Presentazione AI",
      query: "Ciao! Spiegami che cosa fai e come mi puoi aiutare.",
      badge: "Benvenuto"
    },
    {
      id: 'f2',
      title: "Fase 2: Test Fuori Tema",
      query: "Consigliami un buon film di fantascienza da vedere stasera.",
      badge: "Brand Shield"
    },
    {
      id: 'f3',
      title: "Fase 3: Esprimi Bisogno",
      query: "Abito in una villetta a Novara, siamo in 4 in famiglia e consumiamo molto la sera perché di giorno siamo al lavoro.",
      badge: "Lead Profile"
    },
    {
      id: 'f4',
      title: "Fase 4: Raccomandazione",
      query: "In base ai miei consumi serali, consigliate l'impianto monofase con batterie di accumulo?",
      badge: "Raccomandazione"
    }
  ];

  // Sync scroll on message update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle messages and map answers to states
  const processMessageFlow = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: nextMsgId(),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch("/api/lead-qualifier", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: messages.concat(userMessage),
          currentMessage: textToSend
        })
      });

      if (!response.ok) {
        throw new Error("Errore remoti");
      }

      const data = await response.json();
      
      // Mutate Generative state based on model reaction
      if (data.isOutOfScope) {
        setGenerativeState('out_of_scope');
      } else if (
        (data.recommendedProduct && data.recommendedProduct.toLowerCase().includes('monofase')) || 
        data.replyContent.toLowerCase().includes('monofase') || 
        data.replyContent.toLowerCase().includes('novara') ||
        data.replyContent.toLowerCase().includes('villetta')
      ) {
        setGenerativeState('residenziale_accumulo');
        setContactForm(prev => ({
          ...prev,
          note: "Richiesta preventivo per: Impianto Residenziale Monofase con Accumulo (Novara, 4 persone)"
        }));
      } else if (
        (data.recommendedProduct && data.recommendedProduct.toLowerCase().includes('trifase')) || 
        data.replyContent.toLowerCase().includes('trifase') || 
        data.replyContent.toLowerCase().includes('azienda') ||
        data.replyContent.toLowerCase().includes('industriale')
      ) {
        setGenerativeState('industriale_trifase');
        setContactForm(prev => ({
          ...prev,
          note: "Richiesta preventivo per: Impianto Industriale Trifase"
        }));
      } else {
        setGenerativeState('generico');
      }

      setMessages(prev => [...prev, {
        id: nextMsgId(),
        role: 'assistant',
        content: data.replyContent,
        timestamp: new Date(),
        metadata: {
          isOutOfScope: data.isOutOfScope,
          thought: data.thought,
          toolUsed: data.toolUsed,
          recommendedProduct: data.recommendedProduct,
          qualificationStatus: data.qualificationStatus
        }
      }]);

    } catch {
      // Robust offline fallback simulation
      const textLower = textToSend.toLowerCase();
      let replyContent = "";
      let isOutOfScope = false;
      let targetState: 'initial' | 'out_of_scope' | 'residenziale_accumulo' | 'industriale_trifase' | 'generico' = 'generico';
      let recommendedProduct = "";
      let qualificationStatus = "";
      let thought = "";

      if (textLower.includes("fantascienza") || textLower.includes("film") || textLower.includes("carbonara") || textLower.includes("scudetto") || textLower.includes("ricetta")) {
        isOutOfScope = true;
        targetState = 'out_of_scope';
        thought = "Rilevato argomento fuori tema. Blocco preventivo.";
        replyContent = "Siamo spiacenti, ma trattandosi di un prototipo dimostrativo per l'efficienza energetica di GM Solar, ho la capacità di rispondere solo a domande riguardanti la scelta dell'impianto solare ideale. Posso aiutarti a decidere quale soluzione si adatti meglio alle tue esigenze residenziali o commerciali?";
        qualificationStatus = "Bloccato - Fuori Tema";
      } else if (textLower.includes("novara") || textLower.includes("villetta") || textLower.includes("famiglia") || textLower.includes("accumulo") || textLower.includes("monofase")) {
        isOutOfScope = false;
        targetState = 'residenziale_accumulo';
        thought = "Identificato bisogno residenziale domestico.";
        recommendedProduct = "Impianto Monofase + Accumulo";
        replyContent = "In base alle caratteristiche emerse per la tua villetta a Novara con una famiglia di 4 persone e consumi concentrati la sera, la soluzione ottimale raccomandata è l'**Impianto Fotovoltaico Monofase GM Solar** integrato con un **Sistema di Accumulo intelligente a Batterie**.\n\nQuesta configurazione immagazzina l'energia solare di giorno per renderla fruibile la sera, portando l'autonomia energetica fino all'85% dell'intero fabbisogno.\n\nTi piacerebbe ricevere un preventivo dettagliato o un contatto telefonico di approfondimento?";
        qualificationStatus = "Qualificato - Residenziale con Accumulo";
      } else if (textLower.includes("azienda") || textLower.includes("industriale") || textLower.includes("commerciale") || textLower.includes("trifase")) {
        isOutOfScope = false;
        targetState = 'industriale_trifase';
        thought = "Identificato profilo aziendale trifase.";
        recommendedProduct = "Impianto Trifase GM Solar";
        replyContent = "Per ottimizzare i consumi strutturati di una media-grande impresa o carichi industriali superiori, l'**Impianto Fotovoltaico Trifase GM Solar** (superiore a 6 kW) è l'ideale. Consente di alimentare i macchinari e i flussi commerciali diurni tagliando nettamente i costi operativi aziendali.\n\nPuoi richiedere un sopralluogo tecnico gratuito direttamente cliccando sul tasto Contattaci qui a fianco!";
        qualificationStatus = "Qualificato - Industriale/PMI";
      } else {
        isOutOfScope = false;
        targetState = 'generico';
        thought = "Input generico.";
        replyContent = "Ottima domanda! Per darti una raccomandazione personalizzata, potresti dirmi se l'impianto solare è per un'abitazione privata (residenziale) o per un'azienda, e se consumate energia prevalentemente di giorno o di sera?";
        qualificationStatus = "Lead in Profilazione";
      }

      setGenerativeState(targetState);
      
      if (targetState === 'residenziale_accumulo') {
        setContactForm(prev => ({ ...prev, note: "Preventivo consigliato: Impianto Residenziale Monofase da 6 kW con Batterie di Accumulo 10 kWh" }));
      } else if (targetState === 'industriale_trifase') {
        setContactForm(prev => ({ ...prev, note: "Preventivo consigliato: Impianto Industriale Trifase per utenze commerciali" }));
      }

      setMessages(prev => [...prev, {
        id: nextMsgId(),
        role: 'assistant',
        content: replyContent,
        timestamp: new Date(),
        metadata: {
          isOutOfScope,
          thought,
          toolUsed: "PS_Agent System",
          recommendedProduct,
          qualificationStatus
        }
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit contact lead mock handler
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.nome || !contactForm.email) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setShowContactModal(false);
      // Reset state
      setContactSubmitted(false);
      setContactForm({ nome: '', email: '', telefono: '', note: '' });
      
      // Post clear visual confirmation directly in chat messages
      setMessages(prev => [...prev, {
        id: nextMsgId(),
        role: 'assistant',
        content: `📬 **[Notifica CRM] Richiesta Contatto Inviata**\n\nGrazie, **${contactForm.nome}**! I tuoi dettagli di pre-qualificazione sono stati salvati correttamente. Riceverai un'analisi tecnica di fattibilità direttamente per email all'indirizzo **${contactForm.email}** o tramite contatto telefonico a brevissimo giro.`,
        timestamp: new Date()
      }]);
    }, 1500);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fa] font-sans text-slate-800 antialiased">
      {/* La barra-identità dell'agente è fornita dalla pagina (intro tematizzata);
          qui resta solo lo "studio" generativo + chat + footer di conformità. */}

      {/* TWO COLUMN GRID: LEFT = GENERATIVE INTERFACE, RIGHT = CHATBOX */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* PARTE SINISTRA: INTERFACCIA GENERATIVA (Si trasforma dinamicamente in base alla conversazione) */}
        <section className="lg:col-span-7 flex flex-col justify-center min-h-[500px]" id="generative-left-container">
          
          {/* STATE 1: INITIAL / PRESENTAZIONE DI PARTENZA COPRI ACCOLTO */}
          {generativeState === 'initial' && (
            <div className="space-y-6 animate-fade-in transition-all duration-500">
              <div className="space-y-2">
                <span className="bg-accent/15 text-accent-ink text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full w-fit block">
                  Configuratore AI • GM Solar
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  Progetta la tua indipendenza energetica con un assistente intelligente
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
                  Invia un messaggio nella chat a destra o utilizza i pulsanti di scelta rapida sottostanti per avviare il configuratore generativo dell'impianto solare perfetto per te.
                </p>
              </div>

              {/* Le tre grandi card richieste all'avvio: Residenziale, Industriale, Accumulo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                
                {/* Card 1: Residenziali Monofase */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-accent/50 transition-all group" id="card-design-monofase">
                  <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent-ink flex items-center justify-center mb-4">
                    <Home className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-base text-slate-900 mb-2">Impianti Residenziali</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    Soluzioni domestiche progettate per case e villette. Coprono il fabbisogno quotidiano standard.
                  </p>
                  <div className="text-[10px] font-mono font-bold text-accent-ink bg-accent/10 w-fit px-2 py-0.5 rounded">
                    Sistemi Monofase fino a 6 kW
                  </div>
                </div>

                {/* Card 2: Commerciali Trifase */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group" id="card-design-trifase">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-base text-slate-900 mb-2">Impianti Industriali</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    Ideali per grandi utenze, aziende o attività con carichi importanti di consumo diurno.
                  </p>
                  <div className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100/60 w-fit px-2 py-0.5 rounded">
                    Sistemi Trifase &gt; 6 kW
                  </div>
                </div>

                {/* Card 3: Accumulo Batterie */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group" id="card-design-accumulo">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                    <Battery className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-base text-slate-900 mb-2">Sistemi di Accumulo</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    Batterie per immagazzinare il surplus diurno per azzerare i consumi serali.
                  </p>
                  <div className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/60 w-fit px-2 py-0.5 rounded">
                    Litio Ferro Fosfato (LFP)
                  </div>
                </div>

              </div>

              {/* Informazione all'utente su come testare la demo */}
              <div className="bg-accent/10 border border-accent/30 p-4 rounded-xl flex items-start gap-3">
                <Info className="h-5 w-5 text-accent-ink shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 space-y-1">
                  <p className="font-bold text-slate-900">Come funziona la demo interattiva?</p>
                  <p>In base alle risposte dell'agente a destra, questa colonna muterà in tempo reale mostrando il kit tecnologico calcolato apposta per rispondere all'esigenza energetica rilevata.</p>
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: OUT OF SCOPE / BLOCCO FUORI TEMA COERENTE CON IL DESIGN SYSTEM */}
          {generativeState === 'out_of_scope' && (
            <div className="bg-white border-2 border-red-200 rounded-3xl p-6 md:p-8 shadow-md space-y-5 animate-fade-in transition-all duration-500">
              <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                <ShieldAlert className="h-6 w-6" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-accent bg-slate-900 px-2.5 py-1 rounded w-fit block">
                  FILTRO BRAND SHIELD ATTIVO
                </span>
                <h3 className="text-2xl font-black text-slate-900 leading-tight">
                  Richiesta Fuori Tema Mitigata Con Successo
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  L'utente ha provato ad allontanare l'AI chiedendo argomenti di svago o non autorizzati. L'agente ha attivato l'<strong>Out-of-Scope Shield</strong> bloccando la conversazione in conformità con la brand protection e riconducendola al solare in maniera educata.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 space-y-2 text-xs">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span> Guardrail di Sicurezza Applicati:
                </h4>
                <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                  <li>Nessuna allucinazione o dispersione di risorse computazionali.</li>
                  <li>Inibizione attiva di raccomandazioni estranee (es. film, intrattenimento, politica).</li>
                  <li>Incentivazione a riprendere la qualifica per un impianto GM Solar.</li>
                </ul>
              </div>

              <button
                id="btn-return-home"
                onClick={() => {
                  setGenerativeState('initial');
                }}
                className="bg-accent hover:bg-accent-strong text-slate-950 font-bold text-xs px-5 py-2.5 rounded-lg transition"
              >
                Ripristina Schermata Iniziale &rarr;
              </button>
            </div>
          )}

          {/* STATE 3: DYNAMIC CONFIGURATOR RESIDENZIALE + ACCUMULO (Novara Villetta) */}
          {generativeState === 'residenziale_accumulo' && (
            <div className="bg-white border-2 border-accent/40 rounded-3xl p-6 md:p-8 shadow-md space-y-6 animate-fade-in transition-all duration-500" id="g-residenziale-panel">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-accent-ink bg-accent/15 px-2.5 py-1 rounded w-fit block">
                    Kit Consigliato Generato
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                    Residenziale Smart + Accumulo
                  </h3>
                </div>
                
                {/* TASTO CONTATTACI RICHIESTO DALL'UTENTE */}
                <button 
                  id="btn-trigger-contact-res"
                  onClick={() => setShowContactModal(true)}
                  className="bg-accent hover:bg-accent-strong text-slate-950 font-extrabold text-xs px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-1.5"
                >
                  <Mail className="h-4 w-4" /> Contattaci Ora
                </button>
              </div>

              {/* Dati dell'Impianto consigliato in base al match semantico */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-accent-ink border-b border-slate-200 pb-2">
                    <Home className="h-5 w-5" />
                    <span className="font-bold text-xs text-slate-800">DETTAGLI IMPIANTO MONOFASE</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex justify-between">
                      <span>Destinatario:</span>
                      <strong className="text-slate-900">Nucleo Familiare (4 persone)</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>Località Target:</span>
                      <strong className="text-accent-ink font-bold">Novara (Piemonte)</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>Potenza Ideale:</span>
                      <strong className="text-slate-900">6.0 kWp di picco</strong>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600 border-b border-slate-200 pb-2">
                    <Battery className="h-5 w-5" />
                    <span className="font-bold text-xs text-slate-800">ACCUMULO AD ALTE PRESTAZIONI</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex justify-between">
                      <span>Capacità Consigliata:</span>
                      <strong className="text-slate-900">10 kWh nominali</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>Tecnologia Batteria:</span>
                      <strong className="text-slate-900">LFP ultra-sicura</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>Autoconsumo Stimato la sera:</span>
                      <strong className="text-emerald-600 font-bold">Fino all'85%</strong>
                    </li>
                  </ul>
                </div>

              </div>

              {/* Visualizzatore energetico */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-amber-500 animate-pulse" /> Simulazione dell'Autoconsumo Serale (Novara)
                </h4>
                
                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Carica Batteria di Giorno (Energia in Eccesso)</span>
                      <strong className="text-accent-ink">100% Completata</strong>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-accent h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Energia Coperta da Batteria la Sera / Notte</span>
                      <strong className="text-emerald-600">85% Autonomia</strong>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[11.5px] italic text-slate-500 text-center">
                Pre-qualifica completata con successo. Il dimensionamento suggerito minimizza il prelievo serale dalla rete elettrica.
              </p>

            </div>
          )}

          {/* STATE 4: DYNAMIC CONFIGURATOR TRIFASE INDUSTRIALE */}
          {generativeState === 'industriale_trifase' && (
            <div className="bg-white border-2 border-blue-200 rounded-3xl p-6 md:p-8 shadow-md space-y-6 animate-fade-in transition-all duration-500" id="g-trifase-panel">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-blue-700 bg-blue-50 px-2.5 py-1 rounded w-fit block">
                    Kit Consigliato Industriale
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                    Impianto Trifase Business
                  </h3>
                </div>
                
                {/* TASTO CONTATTACI RICHIESTO DALL'UTENTE */}
                <button 
                  id="btn-trigger-contact-tri"
                  onClick={() => setShowContactModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-1.5"
                >
                  <Mail className="h-4 w-4" /> Contattaci Ora
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-blue-600 border-b border-slate-200 pb-2">
                    <Building2 className="h-5 w-5" />
                    <span className="font-bold text-xs text-slate-800">PECULIARITÀ UTENZA TRIFASE</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex justify-between">
                      <span>Carichi di Lavoro:</span>
                      <strong className="text-slate-900">PMI / Grandi Macchinari</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>Rete Supportata:</span>
                      <strong className="text-slate-900">Trifase 400V</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>Potenza Consigliata:</span>
                      <strong className="text-blue-600 font-bold">&gt; 6 kWp con scambio</strong>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600 border-b border-slate-200 pb-2">
                    <Zap className="h-5 w-5" />
                    <span className="font-bold text-xs text-slate-800">RIENTRO DELL'INVESTIMENTO</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex justify-between">
                      <span>Ammortamento Stimato:</span>
                      <strong className="text-emerald-600 font-bold">4-5 Anni</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>Incentivi Fiscali:</span>
                      <strong className="text-slate-900">Fino al 50% Detrazione</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>Autoconsumo Diurno:</span>
                      <strong className="text-slate-900">Massimo (Ottimizzato)</strong>
                    </li>
                  </ul>
                </div>

              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
                <p className="font-bold text-slate-800 mb-1">Vantaggi per PMI:</p>
                La fornitura trifase di GM Solar assicura la continuità operativa ed evita stacchi imprevisti del contatore di rete per picchi indotti dai processi aziendali o dai climatizzatori. Un investimento eccellente con rivalutazione ESG.
              </div>

            </div>
          )}

          {/* STATE 5: GENERIC PROFILE ANSWER */}
          {generativeState === 'generico' && (
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-5 animate-fade-in transition-all duration-500">
              <div className="bg-accent/10 text-accent-ink flex h-12 w-12 items-center justify-center rounded-2xl">
                <Sparkles className="h-6 w-6 animate-pulse" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-accent-ink bg-accent/15 px-2 py-0.5 rounded w-fit block">
                  CANALE DI PROFILAZIONE AI
                </span>
                <h3 className="text-2xl font-black text-slate-900">
                  Ottimizzazione Consumi in Corso...
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  L'agente sta dialogando per mappare se ti serve un impianto residenziale o industriale. Specifica la tua zona, la composizione del nucleo abitativo o i carichi d'uso aziendali per sbloccare la scheda generativa su misura!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 border-t border-slate-100 pt-4 gap-2">
                <span>Profilo attuale: <strong>In attesa di dati geografici o tecnici</strong></span>
                <button 
                  id="btn-trigger-contact-gen"
                  onClick={() => setShowContactModal(true)}
                  className="text-accent-ink font-bold hover:underline"
                >
                  Contattaci Ora comunque &rarr;
                </button>
              </div>
            </div>
          )}

        </section>

        {/* PARTE DESTRA: CHAT ASSISTENTE AI IN STILE PURE LUMINOSO, MODERNO E COORDINATO */}
        <section className="lg:col-span-5 flex flex-col gap-6" id="chat-right-container">
          
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl flex flex-col h-[580px] overflow-hidden" id="chat-widget-panel">
            
            {/* Header del widget conversazionale */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
                </span>
                <h3 className="font-bold text-xs uppercase text-slate-100 tracking-wider">
                  CANALE DI ACCOGLIENZA GM SOLAR
                </h3>
              </div>
              <div className="text-[9px] font-mono bg-accent/20 text-accent px-2 py-0.5 rounded font-bold uppercase border border-accent/30">
                AI CONVERSATIONAL
              </div>
            </div>

            {/* Listato messaggi (Log in grigio dei passaggi CRM rimossi per non farli vedere al consumatore!) */}
            <div className="flex-1 bg-slate-50 p-4 overflow-y-auto space-y-4 flex flex-col">
              {messages.map((m) => (
                <div 
                  key={m.id} 
                  className={`flex flex-col max-w-[90%] ${
                    m.role === 'user' ? 'self-end items-end' : 'self-start items-start'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400 font-mono">
                    {m.role === 'user' ? (
                      <>
                        <span>Visitatore</span>
                        <User className="h-3 w-3 text-slate-400" />
                      </>
                    ) : (
                      <>
                        <Cpu className="h-3 w-3 text-accent-ink" />
                        <span className="text-accent-ink font-bold">GM Assistente AI</span>
                      </>
                    )}
                    <span>• {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user' 
                      ? 'bg-accent text-slate-950 rounded-tr-none font-semibold shadow-sm border border-accent-strong/20'
                      : m.metadata?.isOutOfScope
                        ? 'bg-red-50 text-red-800 border-2 border-red-200 rounded-tl-none font-medium'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="self-start flex flex-col max-w-[85%]">
                  <div className="flex items-center gap-1 mb-1 text-[9px] text-slate-400 font-mono">
                    <Cpu className="h-2.5 w-2.5 text-accent-ink" />
                    <span>GM AI Agent sta elaborando...</span>
                  </div>
                  <div className="bg-white text-slate-500 border border-slate-200 p-3.5 rounded-2xl rounded-tl-none text-xs flex items-center gap-2 shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce delay-100"></span>
                      <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce delay-200"></span>
                    </div>
                    <span className="text-[10px] text-slate-400 italic font-mono">Esecuzione criteri...</span>
                  </div>
                </div>
              )}

              {!isLoading && (
                <div className="mt-2 space-y-2 animate-fade-in self-stretch">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                    Suggerimenti per il test (Clicca per selezionare):
                  </p>
                  <div className="flex flex-col gap-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        id={`chat-suggestion-${suggestion.id}`}
                        onClick={() => {
                          processMessageFlow(suggestion.query);
                        }}
                        className="text-left bg-white active:bg-slate-100 hover:bg-accent/10 border border-slate-200 hover:border-accent rounded-2xl p-3 transition-all text-xs text-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 group cursor-pointer focus:outline-none"
                      >
                        <div className="flex flex-col">
                          <span className="font-mono text-[9px] text-accent-ink font-extrabold uppercase tracking-wider">{suggestion.title}</span>
                          <span className="text-slate-700 group-hover:text-slate-950 transition font-medium">"{suggestion.query}"</span>
                        </div>
                        <span className="bg-slate-100 text-slate-600 text-[9px] font-mono font-bold px-2.5 py-1 rounded-full group-hover:bg-accent group-hover:text-slate-950 transition shrink-0 self-start sm:self-center">
                          {suggestion.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Form per scrivere e inviare direttamente */}
            <form 
              id="chat-message-form"
              onSubmit={(e) => {
                e.preventDefault();
                processMessageFlow(inputText);
              }}
              className="p-3 bg-white border-t border-slate-200 flex gap-2"
            >
              <input
                id="message-text-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Digita la domanda o seleziona un bottone qui sopra..."
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-accent text-xs px-3 py-2.5 rounded-xl focus:outline-none text-slate-800 placeholder:text-slate-400 font-sans"
                disabled={isLoading}
              />
              <button
                id="submit-send-msg"
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="bg-accent hover:bg-accent-strong text-slate-950 px-4 py-2.5 rounded-xl font-bold text-xs transition duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-md"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            <div className="bg-slate-50 border-t border-slate-200 px-3 py-2 text-center text-[9px] text-slate-400 font-mono flex items-center justify-between">
              <span>Guardrails: <strong className="text-emerald-600">SICUREZZA ATTIVA</strong></span>
              <span>GM AI v2.2</span>
            </div>

          </div>

        </section>

      </main>

      {/* FOOTER DI SPECIFICA DELLA CONFORMITÀ */}
      <footer className="border-t border-slate-200 py-6 px-6 text-center text-xs text-slate-500 mt-auto bg-white relative z-10" id="brand-compliance-footer">
        <div className="max-w-4xl mx-auto space-y-1">
          <p className="font-bold text-slate-700 flex items-center justify-center gap-1 text-[11px]">
            <Lock className="h-3.5 w-3.5 text-accent-ink" /> Demo di Qualificazione e Brand Protection per GM Solar
          </p>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            I pre-dimensionamenti stimati sono calcolati dal sistema a fini puramente dimostrativi ed interattivi. La qualificazione del cliente avviene offrendo un aggancio offline sicuro e conforme per una conversione ottimale dei lead pre-vendita nel CRM aziendale.
          </p>
        </div>
      </footer>

      {/* MODAL DI CONTATTO RIGENERATORE IN STILE CHIARO CON GLOSS ELEGANTE */}
      {showContactModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="contact-lead-modal">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            
            <button 
              id="close-contact-modal"
              onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h4 className="font-bold text-lg text-slate-900 flex items-center gap-1.5">
                <Sun className="h-5 w-5 text-accent-ink" /> Contatta un Esperto GM Solar
              </h4>
              <p className="text-xs text-slate-500">I dati rilevati verranno trasmessi per fornirti uno studio di fattibilità accurato.</p>
            </div>

            {contactSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-accent/20 text-accent-ink flex items-center justify-center mx-auto">
                  <CheckCircle className="h-6 w-6 animate-pulse" />
                </div>
                <h5 className="font-bold text-slate-900 text-sm">Richiesta Inviata!</h5>
                <p className="text-xs text-slate-500">I tuoi dettagli sono stati acquisiti per simulare la catena di conversione pre-vendita.</p>
              </div>
            ) : (
              <form id="lead-submit-form" onSubmit={handleContactSubmit} className="space-y-3 pt-1 text-xs">
                
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Nome e Cognome *</label>
                  <input 
                    id="lead-name"
                    type="text" 
                    required
                    value={contactForm.nome}
                    onChange={(e) => setContactForm({...contactForm, nome: e.target.value})}
                    placeholder="Esempio: Marco Rossi"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Email di Contatto *</label>
                  <input 
                    id="lead-email"
                    type="email" 
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    placeholder="Esempio: marco.rossi@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Telefono di Contatto</label>
                  <input 
                    id="lead-phone"
                    type="tel" 
                    value={contactForm.telefono}
                    onChange={(e) => setContactForm({...contactForm, telefono: e.target.value})}
                    placeholder="Esempio: +39 345 6789012"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Configurazione Rilevata dall'AI</label>
                  <textarea 
                    id="lead-notes"
                    rows={3}
                    value={contactForm.note}
                    onChange={(e) => setContactForm({...contactForm, note: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-accent resize-none"
                  />
                </div>

                <button 
                  id="submit-lead-btn"
                  type="submit"
                  className="w-full bg-accent hover:bg-accent-strong text-slate-950 font-extrabold py-3 rounded-xl transition shadow-md hover:shadow-lg mt-3"
                >
                  Conferma e Invia &rarr;
                </button>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
