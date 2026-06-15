/* eslint-disable @typescript-eslint/no-empty-object-type -- shim di augmentation:
   le interfacce vuote che estendono ThreeElements sono il pattern voluto. */
// React Three Fiber v9 espone gli elementi three (<mesh>, <group>, <ambientLight>…)
// come IntrinsicElements JSX tramite `declare module` nei propri tipi. In questo
// setup (Next 16 + React 19 + `moduleResolution: "bundler"`) quell'augmentation del
// pacchetto non viene raccolta dal program TypeScript, quindi la ri-dichiariamo qui —
// in un file sicuramente incluso da tsconfig — riusando il catalogo `ThreeElements`
// ufficiale di R3F (nessuna lista manuale da mantenere).
import type { ThreeElements } from "@react-three/fiber";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

declare module "react/jsx-dev-runtime" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
