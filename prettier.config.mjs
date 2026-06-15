import { createRequire } from "node:module";

// Config Prettier base condivisa, da packages/config (fonte unica del monorepo).
const require = createRequire(import.meta.url);

/** @type {import("prettier").Config} */
export default require("./packages/config/prettier.config.json");
