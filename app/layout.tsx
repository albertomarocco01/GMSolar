import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import ThemeProvider from "@/components/providers/ThemeProvider";
import LenisProvider from "@/components/providers/LenisProvider";
import { GROUP, SITE_URL, groupJsonLd } from "@/lib/site";

// Testo: Inter (workhorse super leggibile). Display: Space Grotesk (titoli/stat).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const SITE_DESCRIPTION =
  "Ecosistema GM Group: energia solare (GM Solar), mobilità elettrica (GMobility) e accessori di ricarica (Cavo Perfetto).";

export const metadata: Metadata = {
  // Base per risolvere OpenGraph/canonical in URL assoluti (vedi lib/site.ts).
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${GROUP.name} — ${GROUP.tagline}`,
    template: `%s — ${GROUP.name}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: GROUP.name,
  alternates: { canonical: "/" },
  // Niente title/description espliciti su openGraph/twitter: così Next li deriva
  // PER-ROUTE dal title/description risolti (es. "Solar — GM Group"). Qui restano
  // solo i campi strutturali condivisi.
  openGraph: {
    type: "website",
    siteName: GROUP.name,
    locale: "it_IT",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: { index: true, follow: true },
};

/**
 * Script no-FOUC: imposta data-theme su <html> PRIMA del primo paint leggendo
 * la pathname, così l'accent corretto è già attivo anche al caricamento diretto
 * di /solar, /mobility, /shop. Stessa logica di ThemeProvider.themeFromPath.
 */
const themeInitScript = `(function(){try{var p=location.pathname;var t=p.indexOf("/solar")===0?"solar":p.indexOf("/mobility")===0?"mobility":p.indexOf("/shop")===0?"shop":"hub";document.documentElement.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      data-theme="hub"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* Dati strutturati del gruppo (Organization/LocalBusiness), site-wide. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(groupJsonLd()) }}
        />
        <ThemeProvider>
          <LenisProvider>
            <Header />
            <main className="flex-1">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
