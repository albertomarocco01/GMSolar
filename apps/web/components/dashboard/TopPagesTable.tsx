/**
 * TopPagesTable — tabella semantica delle pagine più visitate, filtrata per
 * sito e periodo. Colonne progressive: nasconde le meno importanti su schermi
 * piccoli per mantenere la leggibilità.
 */
"use client";

import Badge from "@gmgroup/ui/Badge";
import Card from "@gmgroup/ui/Card";
import { getTopPages } from "@/data/telemetry";
import type { RangeKey, SiteFilter } from "@/data/telemetry";

const SITE_LABEL: Record<string, string> = {
  solar: "Solar",
  mobility: "Mobility",
  shop: "Shop",
};

type Props = {
  siteFilter: SiteFilter;
  range: RangeKey;
};

export default function TopPagesTable({ siteFilter, range }: Props) {
  const pages = getTopPages(siteFilter, range);

  return (
    <Card className="overflow-hidden">
      <div className="px-5 pt-5 pb-0">
        <h3 className="text-foreground text-sm font-semibold">Top pagine</h3>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border border-b">
              <th scope="col" className="text-muted px-5 pb-3 text-left text-xs font-medium">
                Pagina
              </th>
              <th
                scope="col"
                className="text-muted hidden px-3 pb-3 text-left text-xs font-medium sm:table-cell"
              >
                Sito
              </th>
              <th scope="col" className="text-muted px-3 pb-3 text-right text-xs font-medium">
                Visite
              </th>
              <th
                scope="col"
                className="text-muted hidden px-3 pb-3 text-right text-xs font-medium md:table-cell"
              >
                Utenti
              </th>
              <th
                scope="col"
                className="text-muted hidden px-3 pb-3 text-right text-xs font-medium lg:table-cell"
              >
                Interaz.
              </th>
              <th
                scope="col"
                className="text-muted hidden px-5 pb-3 text-right text-xs font-medium xl:table-cell"
              >
                Conv.
              </th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {pages.map((page) => (
              <tr key={page.path} className="hover:bg-surface-2 transition-colors">
                <td className="text-foreground px-5 py-3 text-xs font-medium">{page.label}</td>
                <td className="hidden px-3 py-3 sm:table-cell">
                  <Badge variant="neutral">{SITE_LABEL[page.site] ?? page.site}</Badge>
                </td>
                <td className="text-muted px-3 py-3 text-right tabular-nums">
                  {page.visite.toLocaleString("it-IT")}
                </td>
                <td className="text-muted hidden px-3 py-3 text-right tabular-nums md:table-cell">
                  {page.utenti.toLocaleString("it-IT")}
                </td>
                <td className="text-muted hidden px-3 py-3 text-right tabular-nums lg:table-cell">
                  {page.interazioni.toLocaleString("it-IT")}
                </td>
                <td className="text-muted hidden px-5 py-3 text-right tabular-nums xl:table-cell">
                  {page.conversioni.toLocaleString("it-IT")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
