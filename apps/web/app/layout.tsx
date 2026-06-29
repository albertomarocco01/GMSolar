import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@gmgroup/ui/ThemeProvider";
import LenisProvider from "@gmgroup/ui/LenisProvider";
import SiteChrome from "@/components/SiteChrome";
import { GROUP, SITE_URL, groupJsonLd } from "@gmgroup/lib/site";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_DESCRIPTION =
  "Presentazione interattiva di servizi digitali: siti vetrina, dashboard e telemetria, assistenti AI, gestionale, app di ricarica EV e integrazioni API.";

/**
 * Sito unico multi-mondo: il tema NON è più fisso per app, ma deriva dalla
 * route (ThemeProvider lo deduce dal pathname). Questo script pre-paint allinea
 * `data-theme` su <html> PRIMA dell'hydration, così non c'è flash dell'accent
 * del gruppo (lime) prima che il client imposti l'accent del mondo. Deve restare
 * in sync con `themeFromPath` (@gmgroup/lib/theme).
 */
const NO_FLASH_THEME = `(function(){try{var p=location.pathname;var t=p.indexOf("/solar")===0?"solar":p.indexOf("/mobility")===0?"mobility":p.indexOf("/shop")===0?"shop":"hub";document.documentElement.dataset.theme=t;}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${GROUP.name} — ${GROUP.tagline}`, template: `%s — ${GROUP.name}` },
  description: SITE_DESCRIPTION,
  applicationName: GROUP.name,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: GROUP.name, locale: "it_IT", url: "/" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="it"
      data-theme="hub"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        {/* No-flash: imposta l'accent del mondo da pathname prima del paint.
            Script inline sincrono: viene eseguito durante il parsing dell'HTML,
            prima del primo paint. (Il warning React "script tag while rendering"
            compare solo se l'albero viene rigenerato lato client a causa di un
            hydration mismatch: si previene tenendo l'output SSR === client.) */}
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME }} />
        {/* Dati strutturati del gruppo (Organization/LocalBusiness). */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(groupJsonLd()) }}
        />
        {/* Tema dedotto dalla route (niente prop fissa: è un sito unico). */}
        <ThemeProvider>
          <LenisProvider>
            {/* La cornice (header/footer/FAB/deck) c'è ovunque TRANNE la home,
                che è la presentazione chromeless a tutto schermo. */}
            <SiteChrome>{children}</SiteChrome>
          </LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
