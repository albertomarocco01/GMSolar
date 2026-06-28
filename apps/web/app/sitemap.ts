import type { MetadataRoute } from "next";
import { SITE_URL, WORLDS, SERVICES } from "@gmgroup/lib/site";
import productsData from "@/data/products.json";
import type { Product } from "@gmgroup/lib/types";

const products = productsData as unknown as Product[];

/**
 * Sitemap del SITO UNICO: landing + le pagine dei 7 servizi (registry) + i tre
 * mondi-esempio con le loro sotto-route demo + una entry per ogni PDP dello shop.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Landing + servizi + mondi-esempio + sotto-route demo (deduplicati).
  const pages = Array.from(
    new Set<string>([
      "/",
      ...SERVICES.map((s) => s.href), // /solar, /assistente, /dashboard, /gestionale, /mobility/agent, /integrazioni, /segnalazioni
      ...WORLDS.map((w) => w.href), // /solar, /mobility, /shop
      "/solar/lead",
      "/solar/analytics",
    ]),
  );

  return [
    ...pages.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.8,
    })),
    // Pagine prodotto dello shop.
    ...products.map((p) => ({
      url: `${SITE_URL}/shop/${p.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
