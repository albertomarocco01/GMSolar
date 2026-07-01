/**
 * @descrizione  Avvio dev di Next con SELEZIONE AUTOMATICA della porta libera.
 *   Next 16 su Windows, se la porta è occupata, esce con errore invece di
 *   incrementare: questo wrapper trova la prima porta libera a partire da
 *   PORT (o 3000) e lancia `next dev -p <porta>`.
 * @indice
 * - (default) → scansiona 3000..3019, avvia next dev sulla prima libera
 */
import { createServer } from "node:net";
import { spawn } from "node:child_process";

/**
 * True se la porta è libera. NB: niente host esplicito → bind dual-stack su `::`
 * come fa Next; così intercetta anche un server che tiene la porta su IPv6 (su
 * Windows IPv4 127.0.0.1 e IPv6 :: sono separati: un probe solo-IPv4 darebbe un
 * falso "libera").
 */
function isFree(port) {
  return new Promise((resolve) => {
    const srv = createServer();
    srv.once("error", () => resolve(false));
    srv.once("listening", () => srv.close(() => resolve(true)));
    srv.listen(port);
  });
}

const base = Number(process.env.PORT) || 3000;
let port = base;
for (let i = 0; i < 20; i++) {
  if (await isFree(base + i)) {
    port = base + i;
    break;
  }
}

if (port !== base) {
  console.log(`⚠ Porta ${base} occupata → uso ${port}`);
}
console.log(`▶ Next dev su http://localhost:${port}`);

// shell:true → su Windows risolve `next` (next.cmd) dal PATH di pnpm/.bin.
// Comando come stringa unica (niente array args) → niente DEP0190, porta è un Number quindi safe.
const child = spawn(`next dev -p ${port}`, { stdio: "inherit", shell: true });
child.on("exit", (code) => process.exit(code ?? 0));
