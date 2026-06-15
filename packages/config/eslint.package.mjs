import { defineConfig } from "eslint/config";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

/**
 * Config ESLint per i package NON-Next (ui, lib): regole TypeScript + Prettier,
 * senza il plugin @next/next (che cerca una cartella pages/app e altrimenti avvisa).
 */
export default defineConfig([...nextTs, prettier]);
