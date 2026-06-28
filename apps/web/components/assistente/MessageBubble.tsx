/**
 * MessageBubble — singola bolla di conversazione.
 *
 * Utente a destra (accent pieno), assistente a sinistra (superficie). Sotto la
 * risposta dell'assistente mostra i suggerimenti come chip cliccabili.
 */
import { Bot, User } from "lucide-react";
import { cn } from "@gmgroup/lib/utils";
import SuggestionChips from "./SuggestionChips";
import type { ChatMessage } from "./types";

export interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex flex-col gap-2", isUser ? "items-end" : "items-start")}>
      <div className={cn("flex max-w-[90%] items-start gap-2", isUser && "flex-row-reverse")}>
        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
            isUser ? "bg-accent text-accent-contrast" : "bg-accent-soft text-accent-ink",
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </span>
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
            isUser
              ? "bg-accent text-accent-contrast rounded-tr-sm"
              : "bg-surface text-foreground border-border rounded-tl-sm border",
          )}
        >
          <span className="sr-only">{isUser ? "Tu: " : "Assistente: "}</span>
          {message.content}
        </div>
      </div>

      {!isUser && message.suggestions && message.suggestions.length > 0 && (
        <SuggestionChips suggestions={message.suggestions} className="pl-9" />
      )}
    </div>
  );
}
