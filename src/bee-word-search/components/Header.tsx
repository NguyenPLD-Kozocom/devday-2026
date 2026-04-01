import { Volume2, VolumeX } from 'lucide-react';

interface HeaderProps {
  isMuted: boolean;
  toggleMute: () => void;
  turnsLeft: number;
  maxTurns?: number;
}

export function Header({ isMuted, toggleMute, turnsLeft, maxTurns = 4 }: HeaderProps) {
  return (
    <header className="flex justify-between items-center w-full px-6 sm:px-12 py-6 absolute top-0 left-0 z-50">
      <div className="flex items-center gap-4">
        {/* Sleek Corporate Logo Text */}
        <div className="text-2xl sm:text-3xl font-black tracking-[0.1em] text-white flex items-center drop-shadow-lg font-sans">
          <span className="text-gray-300">KOZO</span>
          <span className="text-[var(--color-kozo-gold)]">CO</span>
          <span className="text-gray-300">M</span>
        </div>
      </div>

      {/* Centered Game Title */}
      <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
        <h1 className="text-xl sm:text-2xl font-black tracking-[0.2em] uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          ONG TÌM <span className="text-[var(--color-kozo-gold)]">CHỮ</span>
        </h1>
        <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-[var(--color-kozo-gold)] to-transparent opacity-60 mt-1"></div>
      </div>
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="glass-premium px-5 py-2.5 rounded-full flex items-center gap-3 text-white border-[var(--color-kozo-gold)]/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
          <span className="text-xs uppercase tracking-widest text-[#94A3B8] font-bold mt-0.5 hidden sm:block">Lượt chơi</span>
          <span className="text-[var(--color-kozo-gold)] font-black text-xl leading-none">{turnsLeft}</span>
          <span className="text-white/40 font-medium text-sm leading-none">/{maxTurns}</span>
        </div>
        <button
          onClick={toggleMute}
          className="p-3.5 glass-premium rounded-full text-white hover:bg-white/10 transition-all active:scale-95 group focus:outline-none border-white/10"
          aria-label={isMuted ? "Unmute sound" : "Mute sound"}
        >
          {isMuted ? <VolumeX size={18} className="opacity-50 group-hover:opacity-100" /> : <Volume2 size={18} />}
        </button>
      </div>
    </header>
  );
}
