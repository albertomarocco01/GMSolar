import { ChatWidget } from './components/ChatWidget';

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-0 md:p-6 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-acid/10 via-zinc-950 to-zinc-950 pointer-events-none" />
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 relative z-10">
        
        {/* Left side hero text (optional for layout balance on desktop) */}
        <div className="hidden lg:block flex-1 text-left px-4">
          <h1 className="font-display text-5xl font-bold text-white leading-tight mb-6">
            Trova il cavo <br/>
            <span className="text-acid">perfetto</span> per la<br/>
            tua auto elettrica.
          </h1>
          <p className="text-zinc-400 text-lg max-w-md">
            Il nostro assistente virtuale ti guiderà nella scelta della soluzione di ricarica più sicura ed efficiente per il tuo veicolo, direttamente a casa tua o per strada.
          </p>
        </div>

        {/* Right side chat widget */}
        <div className="w-full lg:w-auto px-0 md:px-4">
          <ChatWidget />
        </div>
      </div>
    </div>
  );
}
