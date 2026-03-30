import { motion } from 'framer-motion';
import type { TileData, CellData } from '../App';

export function HexagonTile({ tile, inGrid, duration }: { tile: TileData | CellData, inGrid?: boolean, duration?: number }) {
  const isSpecial = tile.type === 'gift' || tile.type === 'boom' || tile.content.includes('Kozocom');
  const isDisabled = 'isDisabled' in tile && tile.isDisabled;

  const defaultDuration = inGrid ? 1.2 : 0.8;
  const animDuration = duration || (tile.content === 'Kozocom' ? 1.8 : defaultDuration);

  return (
    <motion.div
      layoutId={tile.id}
      className={`absolute inset-0
        ${isDisabled ? 'opacity-40 grayscale' : 'shadow-2xl'}
        ${inGrid ? 'z-50' : 'z-10'}
      `}
      initial={inGrid ? { rotateY: 180, scale: 0.8 } : false}
      animate={{ rotateY: 0, scale: 1 }}
      transition={{ type: "spring", bounce: 0.15, duration: animDuration }}
      style={{
        transformStyle: "preserve-3d"
      }}
    >
      {/* Front Face (The Revealed Content) */}
      <div
        className="absolute inset-0 hex-clip flex items-center justify-center p-1"
        style={{
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          background: tile.type === 'boom' ? 'linear-gradient(135deg, #1f2937, #000)' :
            tile.type === 'gift' ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' :
              tile.content === 'Kozocom' ? 'var(--color-kozo-navy)' :
                'linear-gradient(135deg, #ffffff, #f1f5f9)'
        }}
      >
        <div className={`absolute inset-1 hex-clip border ${isSpecial ? 'border-white/30' : 'border-[var(--color-kozo-navy)]/20'}`}></div>
        <div className={`text-xl sm:text-2xl font-black tracking-widest drop-shadow-sm z-10
            ${tile.type === 'boom' ? 'text-white text-3xl' : ''}
            ${tile.type === 'gift' ? 'text-white text-4xl' : ''}
            ${tile.type === 'letter' && tile.content !== 'Kozocom' ? 'text-[var(--color-kozo-navy)]' : ''}
          `}>
          {tile.content === 'Kozocom' ? (
            <div className="flex items-center text-[22px] sm:text-[28px] tracking-normal font-[300]">
              <span className="text-white">kozo</span>
              <span className="text-[#94A3B8] -ml-[0.15em] mix-blend-screen">com</span>
            </div>
          ) : (
            tile.content
          )}
        </div>
      </div>

      {/* Back Face (The Golden Cover) */}
      <div
        className="absolute inset-0 hex-clip bg-gradient-to-br from-[var(--color-kozo-gold)] to-[#B38F2B] flex items-center justify-center"
        style={{
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(180deg)"
        }}
      >
        <div className="absolute inset-1 hex-clip border border-white/30 shadow-[inset_0_0_15px_rgba(255,255,255,0.4)]"></div>
        <div className="absolute inset-2 hex-clip border border-black/5"></div>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="opacity-40 drop-shadow-sm">
          <path d="M12 2L2 7L2 17L12 22L22 17L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      </div>
    </motion.div>
  );
}

export function HexagonSlot({ data, onClick, isFlipping }: { data: CellData, onClick: () => void, isFlipping?: boolean }) {
  return (
    <div className="hex-container group cursor-pointer" onClick={() => !data.isRevealed && onClick()}>
      {!data.isRevealed && !isFlipping && (
        <motion.div
          layoutId={data.id}
          className="absolute inset-0 hex-clip bg-gradient-to-br from-[var(--color-kozo-gold)] to-[#B38F2B] flex items-center justify-center transition-all duration-300 group-hover:brightness-110"
        >
          <div className="absolute inset-1 hex-clip border border-white/30 shadow-[inset_0_0_15px_rgba(255,255,255,0.4)]"></div>
          <div className="absolute inset-2 hex-clip border border-black/5"></div>
          {/* Abstract Honeycomb Pattern / Logo Mark */}
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="opacity-40 drop-shadow-sm">
            <path d="M12 2L2 7L2 17L12 22L22 17L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </motion.div>
      )}

      {data.isRevealed && !isFlipping && (
        <div className="absolute inset-0 hex-clip bg-black/50 shadow-[inset_0_10px_20px_rgba(0,0,0,0.6)] border border-white/5"></div>
      )}

      {isFlipping && (
        <HexagonTile tile={{ ...data, isDisabled: false } as TileData} inGrid />
      )}
    </div>
  );
}
