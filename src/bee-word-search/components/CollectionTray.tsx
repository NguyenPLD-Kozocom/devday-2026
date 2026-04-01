import { AnimatePresence } from 'framer-motion';
import { HexagonTile } from './HexagonCell';
import type { TileData } from '../types/game';

interface CollectionTrayProps {
  tiles: TileData[];
  maxSlots: number;
}

export function CollectionTray({ tiles, maxSlots }: CollectionTrayProps) {
  const slots = Array.from({ length: maxSlots });

  return (
    <div className="fixed bottom-24 w-full flex justify-center z-50 pointer-events-none px-4">
      {/* Dock Background */}
      <div className="glass-premium px-6 sm:px-8 py-5 rounded-[2.5rem] flex items-center gap-4 sm:gap-6 min-w-[380px] sm:min-w-[480px] justify-center pointer-events-auto">
        {slots.map((_, i) => {
          const tile = tiles[i];

          return (
            <div
              key={i}
              className="relative w-[72px] h-[82px] sm:w-[90px] sm:h-[102px] flex items-center justify-center shrink-0"
            >
              {/* Empty placeholder slot with gentle inner shadow */}
              <div className="absolute inset-0 hex-clip bg-black/40 border border-white/5 shadow-[inset_0_4px_12px_rgba(0,0,0,0.6)]"></div>

              <AnimatePresence>
                {tile && (
                  <HexagonTile key={tile.id} tile={tile} />
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
