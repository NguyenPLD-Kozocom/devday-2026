import { AnimatePresence } from "framer-motion";
import { HexagonTile } from "./HexagonCell";
import type { TileData } from "../types/game";

interface CollectionTrayProps {
  tiles: TileData[];
  maxSlots: number;
  isGameOver?: boolean;
}

export function CollectionTray({
  tiles,
  maxSlots,
  isGameOver,
}: CollectionTrayProps) {
  const slots = Array.from({ length: maxSlots });

  return (
    <div className="fixed bottom-[-8px] w-full flex justify-center z-50 pointer-events-none px-4">
      <div className="flex items-center gap-[80px] justify-center pointer-events-auto">
        {slots.map((_, i) => {
          const tile = tiles[i];

          return (
            <div
              key={i}
              className="relative w-[157.23px] h-[136.45px] flex items-center justify-center shrink-0"
            >
              <AnimatePresence mode="wait">
                {tile && (
                  <HexagonTile
                    key={tile.id}
                    tile={tile}
                    duration={0.6}
                    revealGift={isGameOver}
                  />
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
