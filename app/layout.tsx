import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import ThemeProvider from "@/components/providers/ThemeProvider";
import LenisProvider from "@/components/providers/LenisProvider";
import { GROUP } from "@/lib/site";

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

export const metadata: Metadata = {
  title: {
    default: GROUP.name,
    template: `%s — ${GROUP.name}`,
  },
  description:
    "Ecosistema GM Group: energia solare (GM Solar), mobilità elettrica (GMobility) e accessori di ricarica (Cavo Perfetto).",
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
