import { useMemo } from "react";
import { HexagonSlot } from "./HexagonCell";
import type { CellData, TileData } from "../types/game";

interface HexagonGridProps {
  cells: CellData[];
  collectedTiles: TileData[];
  onCellClick: (cell: CellData) => void;
  flippingCellId?: string | null;
}

export function HexagonGrid({
  cells,
  onCellClick,
  flippingCellId,
}: HexagonGridProps) {
  const COLS = 9;

  const groupedCells = useMemo(() => {
    return Array.from({ length: COLS }).map((_, colIndex) => {
      const colCells = cells
        .filter((c) => c.col === colIndex)
        .sort((a, b) => a.row - b.row);
      return { colIndex, colCells };
    });
  }, [cells]);

  return (
    <div className="flex flex-row items-center justify-center py-8 relative">
      {groupedCells.map(({ colIndex, colCells }) => {
        if (colCells.length === 0) return null;

        return (
          <div
            key={colIndex}
            className="flex flex-col items-center justify-center relative z-10"
            style={{
              marginLeft: colIndex === 0 ? 0 : "-39.3075px", // Horizontal overlap for flat-topped (25% of 157.23)
            }}
          >
            {colCells.map((cell) => (
              <div key={cell.id} className="hex-shadow-wrapper">
                <HexagonSlot
                  data={cell}
                  onClick={onCellClick}
                  isFlipping={flippingCellId === cell.id}
                />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
