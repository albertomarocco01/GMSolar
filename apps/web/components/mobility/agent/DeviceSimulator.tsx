"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Wifi,
  Signal,
  Battery as BatteryIcon,
  Zap,
  Car,
  Navigation,
  MessageSquare,
  Coffee,
  Clock,
  Send,
  Compass,
  RotateCcw,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Message, VehicleState, ChargingStation } from "./types";

interface DeviceSimulatorProps {
  vehicleState: VehicleState;
  setVehicleState: React.Dispatch<React.SetStateAction<VehicleState>>;
  messages: Message[];
  isThinking: boolean;
  onSendMessage: (text: string) => void;
  stations: ChargingStation[];
  bookedStationId: string | null;
  activeTab: "assistente" | "veicolo" | "mappa" | "stazione";
  setActiveTab: (tab: "assistente" | "veicolo" | "mappa" | "stazione") => void;
  triggerScenario: () => void;
  triggerGuardrailScenario: () => void;
  isCavoConnesso: boolean;
  setIsCavoConnesso: (val: boolean) => void;
  activeTimerSeconds: number | null;
}

export default function DeviceSimulator({
  vehicleState,
  setVehicleState,
  messages,
  isThinking,
  onSendMessage,
  stations,
  bookedStationId,
  activeTab,
  setActiveTab,
  triggerScenario,
  triggerGuardrailScenario,
  isCavoConnesso,
  setIsCavoConnesso,
  activeTimerSeconds,
}: DeviceSimulatorProps) {
  const [inputText, setInputText] = useState("");
  const [bookingSecondsLeft, setBookingSecondsLeft] = useState(900); // 15 mins
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Reservation Countdown timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (bookedStationId && bookingSecondsLeft > 0 && !isCavoConnesso) {
      interval = setInterval(() => {
        setBookingSecondsLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [bookedStationId, bookingSecondsLeft, isCavoConnesso]);

  // Charging progress simulator
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isCavoConnesso && vehicleState.isCharging && activeTimerSeconds === null) {
      interval = setInterval(() => {
        setVehicleState((prev) => {
          if (prev.soc >= 100) {
            clearInterval(interval);
            return { ...prev, isCharging: false, rangeKm: 420 };
          }
          const nextSoc = prev.soc + 1;
          return {
            ...prev,
            soc: nextSoc,
            rangeKm: Math.round(nextSoc * 4.2),
          };
        });
      }, 150); // fast charging climb
    }
    return () => clearInterval(interval);
  }, [isCavoConnesso, vehicleState.isCharging, activeTimerSeconds, setVehicleState]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText("");
  };

  const padTime = (num: number) => num.toString().padStart(2, "0");
  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${padTime(mins)}:${padTime(secs)}`;
  };

  const bookedStation = stations.find((s) => s.id === bookedStationId) || stations[0];

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center justify-center py-4">
      {/* Smartphone Outer Container */}
      <div className="relative flex h-[750px] w-[370px] flex-col overflow-hidden rounded-[50px] border-10 border-zinc-900 bg-[#050505] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] ring-1 ring-white/10">
        {/* Notch / Dynamic Island */}
        <div className="absolute top-2 left-1/2 z-50 flex h-6 w-32 -translate-x-1/2 items-center justify-center rounded-full bg-zinc-900">
          <div className="absolute left-4 h-2.5 w-2.5 rounded-full bg-[#050505]" />
          <div className="ml-6 h-1 w-10 rounded-full bg-white/10" />
        </div>

        {/* Mobile Status Bar */}
        <div className="z-40 flex h-12 items-center justify-between border-b border-white/5 bg-[#050505] px-6 pt-3 font-sans text-[11px] text-zinc-400 select-none">
          <span className="font-semibold tracking-tight">10:16</span>
          <div className="flex items-center gap-1.5">
            <Signal className="h-3.5 w-3.5 text-zinc-300" />
            <span className="text-accent text-[10px] font-bold">5G</span>
            <Wifi className="h-3.5 w-3.5 text-zinc-300" />
            <div className="flex items-center gap-0.5">
              <span className="text-accent mr-0.5 text-[9px] font-bold">{vehicleState.soc}%</span>
              <BatteryIcon className="text-accent h-4 w-4 shrink-0" />
            </div>
          </div>
        </div>

        {/* Smartphone Screen Core Content */}
        <div className="relative flex flex-1 flex-col overflow-hidden bg-[#050505]">
          <AnimatePresence mode="wait">
            {/* TAB: ASSISTENTE */}
            {activeTab === "assistente" && (
              <motion.div
                key="tab-assistente"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex h-full flex-1 flex-col overflow-hidden"
              >
                {/* Visual Header */}
                <div className="col-span-2 flex items-center justify-between border-b border-white/5 bg-black/40 p-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-accent h-2 w-2 animate-pulse rounded-full" />
                    <div>
                      <h4 className="font-sans text-xs font-bold tracking-tight text-zinc-100">
                        Assistente AI
                      </h4>
                      <p className="text-[10px] text-zinc-400">Sistema Assistenziale Integrato</p>
                    </div>
                  </div>
                  <div className="rounded-md border border-white/5 bg-[#050505] px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                    Auto Connessa
                  </div>
                </div>

                {/* Messages Panel */}
                <div className="flex-1 space-y-4 overflow-y-auto px-4 py-3">
                  {/* Driver Prompt Helper */}
                  {messages.length <= 1 && (
                    <div className="glass mt-1 mb-2 rounded-2xl p-3.5">
                      <div className="text-accent mb-1.5 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase">
                        <Zap className="text-accent h-3.5 w-3.5" />
                        Scorciatoie Consigliate
                      </div>
                      <p className="mb-3 font-sans text-[11px] leading-normal text-zinc-400">
                        Il tuo veicolo ha una carica critica del{" "}
                        <strong className="font-semibold text-rose-400">{vehicleState.soc}%</strong>
                        . Clicca la scorciatoia per attivare l&apos;assistenza predittiva sul
                        percorso.
                      </p>
                      <div className="space-y-1.5">
                        <button
                          onClick={() => triggerScenario()}
                          className="hover:border-accent/45 flex w-full cursor-pointer items-center justify-between rounded-lg border border-white/5 bg-white/5 px-2.5 py-2 text-left font-mono text-[10px] text-zinc-200 transition-colors hover:bg-white/10"
                        >
                          <span>🔊 &quot;Trova colonnina ultra-fast verso Torino...&quot;</span>
                          <ChevronRight className="text-accent h-3 w-3" />
                        </button>
                        <button
                          onClick={() => triggerGuardrailScenario()}
                          className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-white/5 bg-white/5 px-2.5 py-2 text-left font-mono text-[10px] text-zinc-400 transition-colors hover:border-rose-400/40 hover:bg-white/10"
                        >
                          <span>💬 &quot;Trovami una ricetta per la carbonara&quot;</span>
                          <ChevronRight className="h-3 w-3 text-rose-400" />
                        </button>
                      </div>
                    </div>
                  )}

                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"} w-full space-y-1.5`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-accent text-accent-contrast rounded-tr-none font-semibold"
                            : msg.guardrail
                              ? "rounded-tl-none border border-rose-900/40 bg-rose-950/20 font-sans text-rose-200"
                              : "glass rounded-tl-none font-sans text-zinc-100"
                        }`}
                      >
                        {/* Text */}
                        <p className="font-sans whitespace-pre-line">{msg.text}</p>

                        {/* Timestamp */}
                        <div className="mt-1.5 flex items-center justify-end gap-1.5 font-mono text-[9px] text-zinc-500">
                          {msg.guardrail && (
                            <span className="mr-auto font-mono text-[9px] text-rose-400 italic">
                              [Blocco Sicurezza]
                            </span>
                          )}
                          <span>{msg.timestamp}</span>
                        </div>
                      </div>

                      {/* Gen UI: Active Countdown Timer */}
                      {msg.sender === "agent" && msg.genUiType === "timer" && (
                        <div className="glass border-accent/20 flex w-[85%] flex-col space-y-3 rounded-2xl border p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-accent flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider uppercase">
                              <span className="bg-accent h-1.5 w-1.5 animate-ping rounded-full" />
                              RICARICA IN CORSO
                            </span>
                            <span className="flex items-center gap-1 font-mono text-[10px] text-zinc-400">
                              <Zap className="text-accent h-3.5 w-3.5 fill-current" />
                              150 kW
                            </span>
                          </div>

                          {/* Countdown Indicator */}
                          <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/40 p-3">
                            <div className="border-accent/30 border-t-accent flex h-8 w-8 shrink-0 animate-spin items-center justify-center rounded-full border-2">
                              <Clock className="text-accent h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1">
                              <span className="block font-mono text-[9px] text-zinc-500 uppercase">
                                TEMPO RIMANENTE
                              </span>
                              <span className="block font-mono text-base font-extrabold tracking-tight text-white">
                                {activeTimerSeconds !== null
                                  ? formatTimer(activeTimerSeconds)
                                  : "10:00"}
                              </span>
                            </div>
                          </div>

                          {/* Mini progress tracker */}
                          <div className="grid grid-cols-2 gap-2 font-sans text-[10px] text-zinc-400">
                            <div className="rounded-lg border border-white/5 bg-white/5 p-2">
                              <span className="block text-zinc-500">Stato Ricarica</span>
                              <span className="mt-0.5 flex items-center gap-1 font-mono font-semibold text-white">
                                {vehicleState.soc}%
                                <span className="text-accent text-[8px]">
                                  +{Math.max(0, vehicleState.soc - 12)}%
                                </span>
                              </span>
                            </div>
                            <div className="rounded-lg border border-white/5 bg-white/5 p-2">
                              <span className="block text-zinc-500">Costo Stimato</span>
                              <span className="mt-0.5 block font-mono font-semibold text-white">
                                €{(Math.max(0, vehicleState.soc - 12) * 0.3 + 1.25).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Gen UI: Costs Receipt */}
                      {msg.sender === "agent" && msg.genUiType === "receipt" && (
                        <div className="glass flex w-[85%] flex-col space-y-3 rounded-2xl border border-white/10 p-4">
                          <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <span className="font-mono text-[10px] font-bold tracking-wider text-zinc-300 uppercase">
                              DETTAGLIO COSTI
                            </span>
                            <span className="font-mono text-[10px] text-zinc-500">
                              Stima Sessione
                            </span>
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-center justify-between text-zinc-400">
                              <span>Tariffa Energia DC:</span>
                              <span className="font-mono text-zinc-200">€0,49 / kWh</span>
                            </div>
                            <div className="flex items-center justify-between text-zinc-400">
                              <span>Tassa di Prenotazione:</span>
                              <span className="font-mono text-zinc-200">€1,50</span>
                            </div>
                            <div className="flex items-center justify-between text-zinc-400">
                              <span>Occupazione Stallo:</span>
                              <span className="text-accent font-mono">Inclusa</span>
                            </div>
                            <div className="mt-1 flex items-center justify-between border-t border-white/5 pt-2 text-zinc-400">
                              <span className="font-semibold text-zinc-300">
                                Costo Stimato Totale:
                              </span>
                              <span className="font-mono font-bold text-white">€28,50</span>
                            </div>
                          </div>

                          <div className="bg-accent/10 text-accent border-accent/20 flex items-center gap-1.5 rounded-xl border p-2 text-[10px]">
                            <Check className="h-3.5 w-3.5 shrink-0" />
                            <span>
                              Tariffa Flat attiva. Risparmi €0,16/kWh rispetto a tariffe roaming.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isThinking && (
                    <div className="flex justify-start">
                      <div className="glass max-w-[80%] rounded-tl-none p-3 text-xs text-zinc-400">
                        <div className="mb-1 flex items-center gap-1.5 font-mono text-[9px] text-zinc-500">
                          <Compass className="text-accent h-3 w-3 animate-spin" />
                          AGENT IS THINKING...
                        </div>
                        <div className="flex gap-1 py-1">
                          <span
                            className="bg-accent h-1.5 w-1.5 animate-bounce rounded-full"
                            style={{ animationDelay: "0ms" }}
                          />
                          <span
                            className="bg-accent h-1.5 w-1.5 animate-bounce rounded-full"
                            style={{ animationDelay: "150ms" }}
                          />
                          <span
                            className="bg-accent h-1.5 w-1.5 animate-bounce rounded-full"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <form
                  onSubmit={handleSend}
                  className="flex gap-2 border-t border-white/5 bg-black/40 p-3"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Chiedi all'assistente..."
                    className="focus:border-accent flex-1 rounded-xl border border-white/10 bg-[#050505] px-3 py-2 font-sans text-xs text-zinc-100 placeholder-zinc-500 transition-colors focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-accent hover:bg-accent-strong text-accent-contrast flex shrink-0 cursor-pointer items-center justify-center rounded-xl p-2.5 font-bold transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </motion.div>
            )}

            {/* TAB: VEICOLO */}
            {activeTab === "veicolo" && (
              <motion.div
                key="tab-veicolo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 space-y-5 overflow-y-auto px-4 py-5"
              >
                {/* 3D-like Car Ring Widget */}
                <div className="glass relative flex flex-col items-center justify-center overflow-hidden rounded-3xl p-6">
                  <div className="pointer-events-none absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_top,var(--accent-soft),transparent_70%)]" />

                  {/* Circular energy ring */}
                  <div className="relative flex h-44 w-44 items-center justify-center">
                    {/* SVG ring background */}
                    <svg className="absolute h-full w-full -rotate-90 transform">
                      <circle
                        cx="88"
                        cy="88"
                        r="76"
                        className="stroke-zinc-900/30 text-zinc-900"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <motion.circle
                        cx="88"
                        cy="88"
                        r="76"
                        className={`${vehicleState.soc <= 15 ? "stroke-rose-500" : "stroke-accent"}`}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 76}
                        strokeDashoffset={2 * Math.PI * 76 * (1 - vehicleState.soc / 100)}
                        transition={{ duration: 0.5 }}
                      />
                    </svg>

                    <div className="z-10 text-center">
                      <Zap
                        className={`mx-auto mb-1 h-8 w-8 ${vehicleState.soc <= 15 ? "animate-pulse text-rose-500" : "text-accent animate-bounce"}`}
                      />
                      <span className="block font-sans text-4xl font-extrabold tracking-tight text-white">
                        {vehicleState.soc}%
                      </span>
                      <span className="font-mono text-[10px] tracking-widest text-zinc-400 uppercase">
                        Stato di Carica
                      </span>
                    </div>
                  </div>

                  {/* Warning overlay if SoC below 15% */}
                  {vehicleState.soc <= 15 && !vehicleState.isCharging && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-900/40 bg-rose-950/20 px-3 py-2 text-[10px]/normal text-rose-300">
                      <AlertTriangle className="h-4 w-4 shrink-0 animate-pulse text-rose-400" />
                      <span>
                        <strong>Ricarica Consigliata:</strong> Batteria al limite critico (
                        {vehicleState.soc}%)
                      </span>
                    </div>
                  )}

                  {vehicleState.isCharging && (
                    <div className="bg-accent/10 border-accent/25 text-accent mt-4 flex items-center gap-2 rounded-xl border px-3 py-2 text-[10px]/normal">
                      <Zap className="text-accent h-4 w-4 shrink-0 animate-spin" />
                      <span>
                        <strong>In Ricarica Rapida...</strong> Range stimato: {vehicleState.rangeKm}{" "}
                        km
                      </span>
                    </div>
                  )}
                </div>

                {/* Car Spec Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass rounded-2xl p-3.5">
                    <span className="block font-mono text-[9px] text-zinc-500 uppercase">
                      Range Stimato
                    </span>
                    <span className="mt-1 block font-mono text-base font-bold text-white">
                      {vehicleState.rangeKm}{" "}
                      <span className="text-accent text-xs font-normal">km</span>
                    </span>
                  </div>
                  <div className="glass rounded-2xl p-3.5">
                    <span className="block font-mono text-[9px] text-zinc-500 uppercase">
                      Compatibilità Auto
                    </span>
                    <span className="mt-1.5 block font-mono text-xs font-bold text-white">
                      Cavo Standard DC
                    </span>
                  </div>
                </div>

                {/* Default Pricing and Cost type details (Requested: 'stato ricarica e costo tipo') */}
                <div className="glass space-y-2 rounded-2xl border border-white/5 p-4 shadow-inner">
                  <div className="flex items-center justify-between font-mono text-[9px] text-zinc-500 uppercase">
                    <span>Modello Tariffa di Bordo</span>
                    <span className="text-accent font-bold">Consumo Flat</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs text-zinc-300">Costo Energia DC</span>
                    <span className="font-mono text-sm font-bold text-white">
                      €0,49 <span className="text-[10px] font-normal text-zinc-500">/ kWh</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[10px] text-zinc-400">
                    <span>Costo Sblocco Stallo</span>
                    <span className="font-mono text-zinc-200">€1,50 (Fisso)</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400">
                    <span>Stima Sessione (Fino al 100%)</span>
                    <span className="font-mono text-white">~€28,50</span>
                  </div>
                </div>

                {/* Generic vehicle detail widget */}
                <div className="glass flex items-center justify-between rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white/5 p-2.5 text-zinc-300">
                      <Car className="text-accent h-5 w-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-zinc-200">Veicolo Collegato</h5>
                      <p className="text-[10px] text-zinc-500">SISTEMA DI BORDO ATTIVO</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-accent block text-[9px] font-bold">MOTORE OK</span>
                    <span className="block text-[10px] text-zinc-400">Pneumatici: 2.5 bar</span>
                  </div>
                </div>
              </motion.div>
            )}
            {/* TAB: MAPPA */}
            {activeTab === "mappa" && (
              <motion.div
                key="tab-mappa"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex h-full flex-1 flex-col overflow-hidden"
              >
                {/* SVG Route Map */}
                <div className="relative min-h-[250px] flex-1 overflow-hidden bg-[#050505]">
                  {/* Grid Lines */}
                  <svg
                    className="absolute inset-0 h-full w-full text-zinc-900/40"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                        <path
                          d="M 30 0 L 0 0 0 30"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="0.5"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>

                  {/* Stylized Road Network (SVG Paths) */}
                  <svg
                    className="absolute inset-0 h-full w-full"
                    viewBox="0 0 300 400"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Background generic route */}
                    <path
                      d="M50,380 C120,320 80,240 180,180 C230,150 160,80 220,20"
                      stroke="#1c1c1f"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />

                    {/* Active Navigation Path (Highlighting towards Turin) */}
                    <motion.path
                      d="M50,340 C110,290 90,210 180,160 M180,160 C230,130 190,80 200,40"
                      stroke="#00F5FF"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeDasharray="8 4"
                      className="animate-[dash_10s_linear_infinite]"
                      initial={{ strokeDashoffset: 100 }}
                      animate={{ strokeDashoffset: 0 }}
                    />

                    {/* Booked segment guide to station */}
                    {bookedStationId && (
                      <path
                        d="M180,160 L140,150"
                        className="stroke-accent"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    )}

                    {/* Torino Landmark Circle */}
                    <circle
                      cx="200"
                      cy="40"
                      r="16"
                      fill="#0c4a6e/30"
                      stroke="#00F5FF"
                      strokeWidth="1.5"
                      strokeOpacity="0.70"
                    />
                    <text
                      x="195"
                      y="44"
                      fill="#00F5FF"
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      TO
                    </text>

                    {/* Auto location marker */}
                    <g transform="translate(180, 160)">
                      <circle
                        cx="0"
                        cy="0"
                        r="8"
                        fill="#00F5FF"
                        fillOpacity="0.5"
                        className="animate-ping"
                      />
                      <circle cx="0" cy="0" r="4.5" fill="#00F5FF" stroke="#fff" strokeWidth="1" />
                    </g>

                    {/* Other static untargeted EV Stations */}
                    <g transform="translate(70, 270)">
                      <circle cx="0" cy="0" r="4.5" fill="#1f1f23" stroke="#444" strokeWidth="1" />
                      <circle cx="0" cy="0" r="1.5" fill="#555" />
                    </g>
                    <g transform="translate(210, 290)">
                      <circle cx="0" cy="0" r="4.5" fill="#1f1f23" stroke="#444" strokeWidth="1" />
                    </g>

                    {/* Charged Station Pin (Enel X / Booking Station at 140, 150) */}
                    {bookedStationId && (
                      <g transform="translate(140, 150)">
                        <motion.circle
                          r="12"
                          className="fill-accent"
                          fillOpacity="0.25"
                          animate={{ scale: [1, 1.4, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        />
                        <circle
                          cx="0"
                          cy="0"
                          r="6"
                          className="fill-accent"
                          stroke="#000"
                          strokeWidth="1.5"
                        />
                      </g>
                    )}
                  </svg>

                  {/* Top floating HUD */}
                  <div className="absolute top-3 right-3 left-3 flex items-center justify-between rounded-xl border border-white/10 bg-black/80 p-2.5 text-zinc-200">
                    <div className="flex items-center gap-2">
                      <div className="rounded bg-[#00F5FF]/10 p-1 text-[#00F5FF]">
                        <Navigation className="h-4 w-4 rotate-45 transform" />
                      </div>
                      <span className="font-sans text-[10px]">
                        Percorso attivo:{" "}
                        <strong className="font-semibold text-zinc-100">A6 - Torino</strong>
                      </span>
                    </div>
                    <span className="rounded border border-white/5 bg-[#050505] px-2 py-0.5 font-mono text-[9px] font-semibold text-[#00F5FF]">
                      ETA 32 min
                    </span>
                  </div>

                  {/* Selected station overlay if station is booked */}
                  {bookedStationId && (
                    <div className="absolute right-3 bottom-3 left-3 rounded-2xl border border-white/10 bg-black/90 p-3">
                      <div className="mb-1.5 flex items-center justify-between border-b border-white/5 pb-1">
                        <span className="text-accent flex items-center gap-1 font-mono text-[9px] font-bold tracking-widest uppercase">
                          <Zap className="text-accent h-3.5 w-3.5" />
                          RISERVATO AUTOMATICAMENTE
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[10px] text-zinc-400">
                          <Coffee className="h-3.5 w-3.5 text-amber-400" /> + Bar
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-zinc-100">{bookedStation.name}</h4>
                          <p className="mt-0.5 text-[9px] text-zinc-500">
                            {bookedStation.address} ({bookedStation.distanceKm} km)
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab("stazione")}
                          className="bg-accent text-accent-contrast shadow-accent/10 flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-sans text-[10px] font-extrabold shadow-md"
                        >
                          Dettagli
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: STAZIONE DETTAGLI */}
            {activeTab === "stazione" && (
              <motion.div
                key="tab-stazione"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 space-y-5 overflow-y-auto px-4 py-5"
              >
                {bookedStationId ? (
                  <>
                    {/* Active Booking Summary Ticket */}
                    <div className="glass relative overflow-hidden rounded-3xl p-5">
                      <div className="absolute -right-6 -bottom-6 text-white/5 opacity-10">
                        <Zap className="h-32 w-32" />
                      </div>

                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-accent rounded-full border border-white/5 bg-black/40 px-2.5 py-1 font-mono text-[10px] font-bold uppercase">
                          PRENOTAZIONE DI BORDO
                        </span>
                        <div className="flex items-center gap-1 font-mono text-[11px] text-zinc-300">
                          <Clock className="text-accent h-3.5 w-3.5" />
                          <span>{formatTimer(bookingSecondsLeft)}</span>
                        </div>
                      </div>

                      <div className="mb-4 border-b border-white/5 pb-4">
                        <h4 className="text-base font-bold tracking-tight text-white">
                          {bookedStation.name}
                        </h4>
                        <p className="mt-1 text-[11px] text-zinc-400">{bookedStation.address}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="rounded border border-white/5 bg-white/5 px-2 py-0.5 text-[10px] text-zinc-300">
                            Stallo #2
                          </span>
                          <span className="text-accent rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold">
                            {bookedStation.powerKw} kW Ultra-Fast
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-zinc-400">
                          <span>Distanza:</span>
                          <span className="font-mono text-zinc-200">
                            {bookedStation.distanceKm} km
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-zinc-400">
                          <span>Servizi limitrofi:</span>
                          <span className="flex items-center justify-end gap-1.5 font-semibold text-amber-400">
                            <Coffee className="h-3.5 w-3.5" /> Bar Centrale (12m)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Plug simulator block */}
                    <div className="glass flex flex-col items-center rounded-2xl p-4">
                      <h5 className="mb-3 text-center text-xs font-bold text-zinc-300">
                        Connessione Fisica Colonnina
                      </h5>

                      {!isCavoConnesso ? (
                        <>
                          <p className="mb-4 max-w-[250px] text-center text-[11px] text-zinc-400">
                            Sei arrivato allo stallo? Connetti virtualmente il cavo CCS Combo 2 per
                            avviare il caricamento della batteria.
                          </p>
                          <button
                            onClick={() => {
                              setIsCavoConnesso(true);
                              setVehicleState((prev) => ({ ...prev, isCharging: true }));
                            }}
                            className="bg-accent hover:bg-accent-strong text-accent-contrast inline-flex cursor-pointer items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold shadow-[0_0_20px_var(--accent-soft)] transition-all"
                          >
                            <Zap className="h-4 w-4 fill-current" />
                            CONNETTI CAVO CORRENTE
                          </button>
                        </>
                      ) : (
                        <div className="flex w-full flex-col items-center py-2">
                          <div className="bg-accent/10 border-accent/30 text-accent mb-2.5 rounded-full border p-3">
                            <ShieldCheck className="h-6 w-6 animate-pulse" />
                          </div>

                          <p className="text-accent mb-1 text-xs font-bold">
                            CAVO CORRETTAMENTE CONNESSO
                          </p>
                          <p className="mb-4 font-mono text-[10px] text-zinc-500">
                            Energia erogata CCS Combo @ 172kW
                          </p>

                          {vehicleState.isCharging ? (
                            <button
                              onClick={() => {
                                setVehicleState((prev) => ({ ...prev, isCharging: false }));
                              }}
                              className="cursor-pointer rounded-lg border border-rose-500/30 px-3 py-1.5 font-mono text-[10px] text-rose-400 transition-colors hover:bg-rose-950/20"
                            >
                              Pausa Ricarica
                            </button>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className="mb-1 text-[11px] text-zinc-400">
                                Ricarica completata al 100%!
                              </span>
                              <button
                                onClick={() => {
                                  setIsCavoConnesso(false);
                                  setVehicleState((prev) => ({
                                    ...prev,
                                    soc: 12,
                                    rangeKm: 50,
                                    isCharging: false,
                                  }));
                                  setBookingSecondsLeft(900);
                                }}
                                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 font-mono text-[10px] text-zinc-300 hover:bg-white/5"
                              >
                                <RotateCcw className="h-3 w-3" /> Reincolla 12% per demo
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
                    <Compass className="mb-3 h-12 w-12 animate-pulse text-zinc-700" />
                    <h4 className="text-xs font-bold text-zinc-300">Nessuna Prenotazione Attiva</h4>
                    <p className="mt-1 max-w-[220px] text-[11px] leading-normal text-zinc-500">
                      Puoi sbloccare questo pannello chiedendo all&apos;assistente di bordo di
                      cercare una stazione ultra-rapida.
                    </p>
                    <button
                      onClick={() => triggerScenario()}
                      className="text-accent border-accent/20 hover:border-accent/40 mt-4 cursor-pointer rounded-lg border bg-white/5 px-4 py-2 font-mono text-xs transition-all"
                    >
                      Trova Colonnina Adesso
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Smartphone Bottom Navigation Bar */}
        <div className="z-40 flex h-16 items-center justify-around border-t border-white/5 bg-[#050505] px-3 select-none">
          <button
            onClick={() => setActiveTab("assistente")}
            className={`flex cursor-pointer flex-col items-center gap-1 transition-colors ${activeTab === "assistente" ? "text-accent" : "text-zinc-500 hover:text-zinc-400"}`}
          >
            <MessageSquare className="h-4 w-4 text-inherit" />
            <span className="font-sans text-[8.5px] font-medium text-inherit">Assistente</span>
          </button>

          <button
            onClick={() => setActiveTab("veicolo")}
            className={`flex cursor-pointer flex-col items-center gap-1 transition-colors ${activeTab === "veicolo" ? "text-accent" : "text-zinc-500 hover:text-zinc-400"}`}
          >
            <Car className="h-4 w-4 text-inherit" />
            <span className="font-sans text-[8.5px] font-medium text-inherit">Veicolo</span>
          </button>

          <button
            onClick={() => setActiveTab("mappa")}
            className={`flex cursor-pointer flex-col items-center gap-1 transition-colors ${activeTab === "mappa" ? "text-accent" : "text-zinc-500 hover:text-zinc-400"}`}
          >
            <Navigation className="h-4 w-4 text-inherit" />
            <span className="font-sans text-[8.5px] font-medium text-inherit">Mappa GPS</span>
          </button>

          <button
            onClick={() => setActiveTab("stazione")}
            className={`flex cursor-pointer flex-col items-center gap-1 transition-colors ${activeTab === "stazione" ? "text-accent" : "text-zinc-500 hover:text-zinc-400"}`}
          >
            <div className="relative text-inherit">
              <Zap className="h-4 w-4 text-inherit" />
              {bookedStationId && !isCavoConnesso && (
                <span className="bg-accent absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full shadow-[0_0_8px_var(--accent)]" />
              )}
            </div>
            <span className="font-sans text-[8.5px] font-medium text-inherit">Ricarica</span>
          </button>
        </div>

        {/* Smartphone Home bar indicator */}
        <div className="flex h-4 items-center justify-center bg-[#050505] pb-2 select-none">
          <div className="h-1 w-24 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}
