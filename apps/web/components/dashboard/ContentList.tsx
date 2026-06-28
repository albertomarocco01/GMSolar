/**
 * ContentList — tabella dei blocchi/pagine modificabili con stato e data.
 * Cliccando una riga si apre il ContentEditorPanel.
 */
"use client";

import { Edit2, FileText, Globe } from "lucide-react";
import Badge from "@gmgroup/ui/Badge";
import Card from "@gmgroup/ui/Card";
import type { ContentBlock } from "@/data/telemetry";

const SITE_LABEL: Record<ContentBlock["site"], string> = {
  hub: "Hub",
  solar: "Solar",
  mobility: "Mobility",
  shop: "Shop",
};

type Props = {
  blocks: ContentBlock[];
  selectedId: string | null;
  onSelect: (block: ContentBlock) => void;
};

export default function ContentList({ blocks, selectedId, onSelect }: Props) {
  return (
    <Card className="overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-border border-b">
            <th scope="col" className="text-muted px-5 py-3 text-left text-xs font-medium">
              Blocco
            </th>
            <th
              scope="col"
              className="text-muted hidden px-3 py-3 text-left text-xs font-medium sm:table-cell"
            >
              Sito
            </th>
            <th
              scope="col"
              className="text-muted hidden px-3 py-3 text-left text-xs font-medium md:table-cell"
            >
              Stato
            </th>
            <th
              scope="col"
              className="text-muted hidden px-3 py-3 text-left text-xs font-medium lg:table-cell"
            >
              Ultima modifica
            </th>
            {/* Colonna azioni — accessibile solo a lettori di schermo nella caption */}
            <th scope="col" className="sr-only px-5 py-3">
              Azioni
            </th>
          </tr>
        </thead>
        <tbody className="divide-border divide-y">
          {blocks.map((block) => {
            const isSelected = selectedId === block.id;
            return (
              <tr
                key={block.id}
                className={`cursor-pointer transition-colors ${
                  isSelected ? "bg-accent-soft" : "hover:bg-surface-2"
                }`}
                onClick={() => onSelect(block)}
                aria-selected={isSelected}
              >
                <td className="text-foreground px-5 py-3 font-medium">
                  <div className="flex items-center gap-2">
                    {block.stato === "pubblicato" ? (
                      <Globe
                        size={14}
                        className="shrink-0 text-emerald-500"
                        aria-label="Pubblicato"
                      />
                    ) : (
                      <FileText size={14} className="text-muted shrink-0" aria-label="Bozza" />
                    )}
                    {block.nome}
                  </div>
                </td>
                <td className="hidden px-3 py-3 sm:table-cell">
                  <Badge variant="neutral">{SITE_LABEL[block.site]}</Badge>
                </td>
                <td className="hidden px-3 py-3 md:table-cell">
                  <Badge variant={block.stato === "pubblicato" ? "accent" : "outline"}>
                    {block.stato === "pubblicato" ? "Pubblicato" : "Bozza"}
                  </Badge>
                </td>
                <td className="text-muted hidden px-3 py-3 text-xs lg:table-cell">
                  {new Date(block.ultimaModifica).toLocaleDateString("it-IT")}
                </td>
                <td className="px-5 py-3">
                  <button
                    className="text-muted hover:bg-surface hover:text-foreground rounded p-1.5 transition-colors"
                    aria-label={`Modifica ${block.nome}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(block);
                    }}
                  >
                    <Edit2 size={14} aria-hidden />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
