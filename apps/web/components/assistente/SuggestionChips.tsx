/**
 * SuggestionChips — chip di approfondimento cliccabili.
 *
 * Ogni chip è un <Link> verso una sezione/servizio: sono i suggerimenti che
 * l'assistente allega a una risposta per indirizzare l'utente. Tematizzati
 * sull'accent attivo (viola su /assistente).
 */
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@gmgroup/lib/utils";
import type { Suggestion } from "./types";

export interface SuggestionChipsProps {
  suggestions: Suggestion[];
  className?: string;
}

export default function SuggestionChips({ suggestions, className }: SuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {suggestions.map((s) => (
        <li key={`${s.href}-${s.label}`}>
          <Link
            href={s.href}
            className={cn(
              "border-accent text-accent-ink inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium",
              "hover:bg-accent-soft focus-visible:ring-accent-ring transition-colors focus-visible:ring-2 focus-visible:outline-none",
            )}
          >
            {s.label}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
