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
  title: { default: "GM Solar — EPC fotovoltaico", template: `%s — ${GROUP.name}` },
  description:
    "GM Solar — EPC Contractor per impianti fotovoltaici di media e grande scala: progettazione, installazione, monitoraggio e manutenzione O&M.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: GROUP.name, locale: "it_IT", url: "/" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="it"
      data-theme="solar"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider theme="solar">
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
