import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@gmgroup/ui/Header";
import Footer from "@gmgroup/ui/Footer";
import PageTransition from "@gmgroup/ui/PageTransition";
import ThemeProvider from "@gmgroup/ui/ThemeProvider";
import LenisProvider from "@gmgroup/ui/LenisProvider";
import { GROUP, SITE_URL } from "@gmgroup/lib/site";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "GMobility — ricarica elettrica", template: `%s — ${GROUP.name}` },
  description:
    "GMobility — wallbox e colonnine di ricarica Mennekes per casa, azienda e spazi pubblici. Esplora la colonnina in 3D, il mercato dell'elettrico e la rete di ricarica.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: GROUP.name, locale: "it_IT", url: "/" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="it"
      data-theme="mobility"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider theme="mobility">
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
