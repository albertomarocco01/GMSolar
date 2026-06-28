"use client";

import { useRef } from "react";
import { gsap } from "@gmgroup/lib/gsap";
import { cn } from "@gmgroup/lib/utils";
import { prefersReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";

/** Conversazione di esempio dell'assistente di sito. */
const MESSAGES = [
  { from: "user", text: "Avete impianti per aziende?" },
  { from: "bot", text: "Sì! Progettiamo impianti industriali su misura. Ti mostro la sezione?" },
  { from: "user", text: "Perfetto. E l'accumulo?" },
  { from: "bot", text: "Incluso: dimensioniamo le batterie sui tuoi consumi reali." },
] as const;

const CHIPS = ["Vedi gli impianti", "Chiedi un preventivo", "Parla con un umano"] as const;

/**
 * Visual "Assistente AI": le bolle di chat appaiono in sequenza, poi spuntano i
 * chip di suggerimento. Reduced-motion: tutto già visibile.
 */
export default function AssistenteVisual() {
  const rootRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.set([".chat-msg", ".chat-chip"], { autoAlpha: 0, y: 12 });
      gsap
        .timeline({ scrollTrigger: { trigger: root, start: "top 75%", once: true } })
        .to(".chat-msg", { autoAlpha: 1, y: 0, stagger: 0.35, duration: 0.5, ease: "power3.out" })
        .to(
          ".chat-chip",
          { autoAlpha: 1, y: 0, stagger: 0.12, duration: 0.4, ease: "back.out(1.6)" },
          "-=0.1",
        );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="border-border bg-background shadow-card rounded-xl border p-5"
    >
      <div className="flex flex-col gap-3">
        {MESSAGES.map((m, i) => (
          <div key={i} className={m.from === "user" ? "flex justify-end" : "flex justify-start"}>
            <p
              className={cn(
                "chat-msg max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-snug",
                m.from === "user"
                  ? "bg-accent text-accent-contrast rounded-br-sm"
                  : "bg-surface-2 text-foreground rounded-bl-sm",
              )}
            >
              {m.text}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {CHIPS.map((c) => (
          <span
            key={c}
            className="chat-chip border-accent text-accent-ink rounded-full border px-3 py-1 text-xs font-medium"
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}
