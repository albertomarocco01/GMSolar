import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
// Disabilita le regole ESLint che confliggono con Prettier (la formattazione è di Prettier).
import prettier from "eslint-config-prettier/flat";

/**
 * Config ESLint base condivisa (flat) del monorepo. Ogni app/package la riusa
 * (`@gmgroup/config/eslint`) e aggiunge i propri globalIgnores locali.
 */
export default defineConfig([...nextVitals, ...nextTs, prettier]);
