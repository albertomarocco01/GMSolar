import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@gmgroup/ui/Header";
import Footer from "@gmgroup/ui/Footer";
import PageTransition from "@gmgroup/ui/PageTransition";
import ThemeProvider from "@gmgroup/ui/ThemeProvider";
import LenisProvider from "@gmgroup/ui/LenisProvider";
import PresentationDeck from "@/components/PresentationDeck";
import { GROUP, SITE_URL, groupJsonLd } from "@gmgroup/lib/site";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const SITE_DESCRIPTION =
  "Ecosistema GM Group: energia solare (GM Solar), mobilità elettrica (GMobility) e accessori di ricarica (Cavo Perfetto).";

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
      className={`${inter.variable} ${spaceGrotesk.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        {/* No-flash: imposta l'accent del mondo da pathname prima del paint.
            `next/script` con strategy beforeInteractive inietta lo script
            nell'HTML iniziale ed evita il warning React sugli <script> inline
            (che non verrebbero eseguiti nei render lato client). */}
        <Script id="no-flash-theme" strategy="beforeInteractive">
          {NO_FLASH_THEME}
        </Script>
        {/* Dati strutturati del gruppo (Organization/LocalBusiness). */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(groupJsonLd()) }}
        />
        {/* Tema dedotto dalla route (niente prop fissa: è un sito unico). */}
        <ThemeProvider>
          <LenisProvider>
            <Header />
            <main className="flex-1">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
            {/* Regia presentazione (nascosta di default: Shift+D o ?deck=1). */}
            <PresentationDeck />
          </LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
