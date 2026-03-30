import { BeeDecorations } from './BeeDecorations';

interface LayoutProps {
  children: React.ReactNode;
  shake?: boolean;
}

export function Layout({ children, shake }: LayoutProps) {
  return (
    <div className="relative min-h-[100svh] w-full flex flex-col">
      {/* Subtle modern corporate grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20" />

      {/* Spotlight glow behind the grid */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-kozo-blue)]/10 blur-[100px] rounded-full pointer-events-none" />

      <BeeDecorations />

      <main
        className={`flex-1 w-full h-full relative z-20 flex flex-col overflow-hidden transition-transform duration-75 ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
      >
        {children}
      </main>

      {/* Shake Keyframes injected safely */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(0, 0) rotate(0); }
          20% { transform: translate(-8px, 4px) rotate(-1deg); }
          40% { transform: translate(6px, -4px) rotate(1deg); }
          60% { transform: translate(-6px, 2px) rotate(-1deg); }
          80% { transform: translate(4px, -2px) rotate(1deg); }
        }
      `}</style>
    </div>
  );
}
