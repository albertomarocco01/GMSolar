import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@gmgroup/ui/Header";
import Footer from "@gmgroup/ui/Footer";
import PageTransition from "@gmgroup/ui/PageTransition";
import ThemeProvider from "@gmgroup/ui/ThemeProvider";
import LenisProvider from "@gmgroup/ui/LenisProvider";
import { GROUP, SITE_URL, groupJsonLd } from "@gmgroup/lib/site";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const SITE_DESCRIPTION =
  "Ecosistema GM Group: energia solare (GM Solar), mobilità elettrica (GMobility) e accessori di ricarica (Cavo Perfetto).";

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
        {/* Dati strutturati del gruppo (Organization/LocalBusiness). */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(groupJsonLd()) }}
        />
        <ThemeProvider theme="hub">
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
