import type { MetadataRoute } from "next";
import { SITE_URL } from "@gmgroup/lib/site";

// Demo non-produzione: niente indicizzazione (in sync col metadata robots del layout).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
    host: SITE_URL,
  };
}
