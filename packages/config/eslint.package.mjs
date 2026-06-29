import { defineConfig } from "eslint/config";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

/**
 * Config ESLint per i package NON-Next (ui, lib): regole TypeScript + Prettier,
 * senza il plugin @next/next (che cerca una cartella pages/app e altrimenti avvisa).
 */
export default defineConfig([
  ...nextTs,
  prettier,
  {
    /*
     * Convenzione del monorepo (come in eslint.base.mjs): un identificatore col
     * prefisso "_" è INTENZIONALMENTE inutilizzato (es. parametri di firma tenuti
     * per uniformità d'API). Onoriamo la convenzione anche nei package, non solo
     * nell'app, così il segnale dell'autore non genera falsi positivi.
     */
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
]);
