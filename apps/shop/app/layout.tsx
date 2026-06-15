import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@gmgroup/ui/Header";
import Footer from "@gmgroup/ui/Footer";
import PageTransition from "@gmgroup/ui/PageTransition";
import ThemeProvider from "@gmgroup/ui/ThemeProvider";
import LenisProvider from "@gmgroup/ui/LenisProvider";
import { GROUP, SITE_URL } from "@gmgroup/lib/site";
import CartProvider from "@/components/shop/cart/CartProvider";
import ShopChrome from "@/components/shop/cart/ShopChrome";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Cavo Perfetto — cavi di ricarica", template: `%s — ${GROUP.name}` },
  description:
    "Cavo Perfetto — e-commerce di cavi di ricarica Mennekes (Tipo 2 / Schuko, mono e trifase) con assistente AI per trovare il cavo giusto.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: GROUP.name, locale: "it_IT", url: "/" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="it"
      data-theme="shop"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider theme="shop">
          <LenisProvider>
            <Header />
            {/* Carrello locale (context + drawer + bottone flottante) attorno al contenuto. */}
            <CartProvider>
              <ShopChrome>
                <main className="flex-1">
                  <PageTransition>{children}</PageTransition>
                </main>
              </ShopChrome>
            </CartProvider>
            <Footer />
          </LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
