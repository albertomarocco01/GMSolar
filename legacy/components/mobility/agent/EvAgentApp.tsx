"use client";

import { useState, useEffect } from "react";
import { MotionConfig } from "motion/react";
import { RotateCcw } from "lucide-react";
import DeviceSimulator from "./DeviceSimulator";
import { Message, VehicleState, ChargingStation } from "./types";

// Generic stations en-route (completely cleaned of brands)
const DEMO_STATIONS: ChargingStation[] = [
  {
    id: "stazione-moncalieri",
    name: "Stazione Ultra-Rapida Est",
    powerKw: 175,
    distanceKm: 4.2,
    stallsCount: 2,
    availableStalls: 1,
    nearbyPoi: "Bar Centrale (12m), Tabaccheria (30m)",
    address: "Corso Trieste 142, Area Est",
    coordinates: { x: 140, y: 150 },
  },
  {
    id: "stazione-asti",
    name: "Porto di Ricarica Autostradale Nord",
    powerKw: 350,
    distanceKm: 18.5,
    stallsCount: 6,
    availableStalls: 4,
    nearbyPoi: "Area Servizio Ristoro (10m), Ristorante (40m)",
    address: "Autostrada A21 direzione Nord",
    coordinates: { x: 70, y: 270 },
  },
  {
    id: "stazione-sud",
    name: "Hub di Ricarica Sud",
    powerKw: 250,
    distanceKm: 8.0,
    stallsCount: 12,
    availableStalls: 8,
    nearbyPoi: "Centro Commerciale Outlet (100m)",
    address: "Svincolo Tangenziale Sud",
    coordinates: { x: 210, y: 290 },
  },
];

export default function EvAgentApp() {
  // Generic vehicle state tracker
  const [vehicleState, setVehicleState] = useState<VehicleState>({
    model: "Berlina Elettrica",
    soc: 12, // Critical battery level
    portType: "Standard DC Combo",
    rangeKm: 50,
    isCharging: false,
    destination: "Torino",
  });

  // State of the application
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "agent",
      text: "Benvenuto a bordo. Sono il tuo assistente di viaggio intelligente. Ho rilevato una carica residua del 12% (circa 50 km). Posso aiutarti a trovare una stazione di ricarica rapida sul tuo percorso, monitorare i costi o stimare con precisione i tempi. Fammi pure una domanda, ad esempio: 'quanto costa ricaricare?' oppure 'tra quanto tempo sarà caricata l'auto?'.",
      timestamp: "10:16",
    },
  ]);

  const [bookedStationId, setBookedStationId] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [activeTab, setActiveTab] = useState<"assistente" | "veicolo" | "mappa" | "stazione">(
    "assistente",
  );
  const [isCavoConnesso, setIsCavoConnesso] = useState(false);
  const [activeTimerSeconds, setActiveTimerSeconds] = useState<number | null>(null);

  // Formats time strings nicely
  const getCurrentTime = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  // Synchronized active countdown timer for battery charging
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (activeTimerSeconds !== null && activeTimerSeconds > 0) {
      interval = setInterval(() => {
        setActiveTimerSeconds((prev) => {
          if (prev === null) return null;
          const nextSec = prev - 1;
          if (nextSec <= 0) {
            // Charging complete!
            setVehicleState((v) => ({ ...v, soc: 100, rangeKm: 420, isCharging: false }));
            return null;
          }
          // Increment SoC dynamically during 10 mins countdown (600s total, initial soc is 12%, final 100%, so +88% over 600s)
          const elapsed = 600 - nextSec;
          const currentSoc = Math.min(100, Math.floor(12 + elapsed * (88 / 600)));
          setVehicleState((v) => ({
            ...v,
            soc: currentSoc,
            rangeKm: Math.round(currentSoc * 4.2),
            isCharging: true,
          }));
          return nextSec;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimerSeconds]);

  // Resets the prototype back to initial conditions
  const resetSimulation = () => {
    setVehicleState({
      model: "Berlina Elettrica",
      soc: 12,
      portType: "Standard DC Combo",
      rangeKm: 50,
      isCharging: false,
      destination: "Torino",
    });
    setMessages([
      {
        id: "welcome",
        sender: "agent",
        text: "Benvenuto a bordo. Sono il tuo assistente di viaggio intelligente. Ho rilevato una carica residua del 12% (circa 50 km). Posso aiutarti a trovare una stazione di ricarica rapida sul tuo percorso, monitorare i costi o stimare con precisione i tempi. Fammi pure una domanda, ad esempio: 'quanto costa ricaricare?' oppure 'tra quanto tempo sarà caricata l'auto?'.",
        timestamp: "10:16",
      },
    ]);
    setBookedStationId(null);
    setIsThinking(false);
    setActiveTab("assistente");
    setIsCavoConnesso(false);
    setActiveTimerSeconds(null);
  };

  // Orchestrator: Find stations and reserve stallo
  const triggerScenario = () => {
    if (isThinking) return;

    setIsThinking(true);
    setActiveTab("assistente");

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: "Trovami una stazione ultra-rapida libera sul percorso per Torino, prenotami uno stallo e imposta la rotta nel navigatore.",
      timestamp: getCurrentTime(),
    };
    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `ag-${Date.now()}`,
          sender: "agent",
          text: "Ho individuato la Stazione Ultra-Rapida Est a 4.2 km di distanza sul tuo tragitto. Lo stallo n. 2 è stato riservato per i prossimi 15 minuti ed è abilitato alla ricarica rapida a 175 kW. Ti ho inviato le coordinate sul navigatore GPS.",
          timestamp: getCurrentTime(),
        },
      ]);
      setBookedStationId("stazione-moncalieri");
      setIsThinking(false);

      setTimeout(() => {
        setActiveTab("stazione");
      }, 2000);
    }, 1500);
  };

  // Guardrail simulation: Non-driving deflection
  const triggerGuardrailScenario = () => {
    if (isThinking) return;

    setIsThinking(true);
    setActiveTab("assistente");

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: "Trovami una ricetta per fare la carbonara stasera.",
      timestamp: getCurrentTime(),
    };
    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `ag-gr-${Date.now()}`,
          sender: "agent",
          guardrail: true,
          text: "Le mie funzionalità di bordo sono configurate esclusivamente per assisterti con la navigazione dell'auto, il monitoraggio energetico ed i costi di ricarica. Non posso darti ricette di cucina.",
          timestamp: getCurrentTime(),
        },
      ]);
      setIsThinking(false);
    }, 1500);
  };

  // Handle standard user text message
  const handleUserMessage = (text: string) => {
    const lower = text.toLowerCase();

    // 1. Guardrail matching (carbonara, recipies, cuisine, etc.)
    if (
      lower.includes("ricetta") ||
      lower.includes("carbonara") ||
      lower.includes("cucinare") ||
      lower.includes("pasta")
    ) {
      triggerGuardrailScenario();
      return;
    }

    // 2. Search charging stations matching
    if (
      lower.includes("trova") ||
      lower.includes("colonnina") ||
      lower.includes("stazione") ||
      lower.includes("prenota")
    ) {
      triggerScenario();
      return;
    }

    // 3. Charging duration time matching (REQUESTED FLOW: "tra quanto tempo sarà caricata l'auto?")
    if (
      lower.includes("tempo") ||
      lower.includes("caricata") ||
      lower.includes("durata") ||
      lower.includes("minuti") ||
      lower.includes("quando è carica") ||
      lower.includes("quando sarà carica") ||
      lower.includes("quanto manca") ||
      lower.includes("manca alla carica")
    ) {
      setIsThinking(true);
      const userMsg: Message = {
        id: `usr-${Date.now()}`,
        sender: "user",
        text,
        timestamp: getCurrentTime(),
      };
      setMessages((prev) => [...prev, userMsg]);

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `ag-timer-${Date.now()}`,
            sender: "agent",
            text: "Stimo che la ricarica sarà finita entro 10 minuti. Ho attivato l'erogazione di picco a 150 kW per velocizzare lo riempimento e ottimizzare il costo complessivo.",
            timestamp: getCurrentTime(),
            genUiType: "timer",
          },
        ]);
        setIsThinking(false);
        setIsCavoConnesso(true);
        setActiveTimerSeconds(600); // 10 minutes = 600s
        setVehicleState((prev) => ({ ...prev, isCharging: true }));
      }, 1200);
      return;
    }

    // 4. Cost and Pricing matching (REQUESTED FLOW: "quanto costa?")
    if (
      lower.includes("costa") ||
      lower.includes("costo") ||
      lower.includes("prezzo") ||
      lower.includes("prezzi") ||
      lower.includes("tariffa") ||
      lower.includes("tariffe")
    ) {
      setIsThinking(true);
      const userMsg: Message = {
        id: `usr-${Date.now()}`,
        sender: "user",
        text,
        timestamp: getCurrentTime(),
      };
      setMessages((prev) => [...prev, userMsg]);

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `ag-costo-${Date.now()}`,
            sender: "agent",
            text: "Ecco il prospetto dettagliato sul costo complessivo della ricarica stimato sulla tariffe in vigore:",
            timestamp: getCurrentTime(),
            genUiType: "receipt",
          },
        ]);
        setIsThinking(false);
      }, 1200);
      return;
    }

    // 5. Default conversational greeting/deflection
    setIsThinking(true);
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text,
      timestamp: getCurrentTime(),
    };
    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `ag-${Date.now()}`,
          sender: "agent",
          text: "Ho appreso la tua richiesta. Puoi chiedermi cose legate all'autonomia del veicolo, ad esempio 'quanto costa ricaricare?' oppure 'tra quanto tempo sarà caricata l'auto?'. Sono incentrato sulla guida ed efficienza energetica.",
          timestamp: getCurrentTime(),
        },
      ]);
      setIsThinking(false);
    }, 1200);
  };

  return (
    // reducedMotion="user": motion (JS) rispetta prefers-reduced-motion, oltre
    // alla regola CSS globale che azzera le animazioni dichiarative.
    <MotionConfig reducedMotion="user">
      <div className="selection:bg-accent relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#050505] p-4 font-sans text-[#ffffff] selection:text-black md:p-6">
        {/* Background Radial Ambiance */}
        <div className="bg-accent/5 pointer-events-none absolute top-1/2 left-1/2 h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px]" />

        {/* Centered Device Frame */}
        <div className="relative z-10 flex w-full max-w-sm flex-col items-center justify-center">
          <DeviceSimulator
            vehicleState={vehicleState}
            setVehicleState={setVehicleState}
            messages={messages}
            isThinking={isThinking}
            onSendMessage={handleUserMessage}
            stations={DEMO_STATIONS}
            bookedStationId={bookedStationId}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            triggerScenario={triggerScenario}
            triggerGuardrailScenario={triggerGuardrailScenario}
            isCavoConnesso={isCavoConnesso}
            setIsCavoConnesso={setIsCavoConnesso}
            activeTimerSeconds={activeTimerSeconds}
          />

          {/* Discrete floating restoration helper below the device mockup */}
          <button
            onClick={resetSimulation}
            className="hover:text-accent mt-4 flex cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-[10px] tracking-widest text-zinc-500 uppercase transition-colors"
          >
            <RotateCcw className="h-3 w-3" /> Ripristina Simulatore
          </button>
        </div>
      </div>
    </MotionConfig>
  );
}
