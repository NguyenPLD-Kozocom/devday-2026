import { BeeDecorations } from './BeeDecorations';

interface LayoutProps {
  children: React.ReactNode;
  shake?: boolean;
}

export function Layout({ children, shake }: LayoutProps) {
  return (
    <div 
      className="relative min-h-[100svh] w-full flex flex-col bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: 'url("/src/bee-word-search/assets/on_game_background.png")' }}
    >
      <BeeDecorations />

      <main
        className={`flex-1 w-full h-full relative z-20 flex flex-col transition-transform duration-75 ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
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
