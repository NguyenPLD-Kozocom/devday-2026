import { HexagonSlot } from './HexagonCell';
import type { CellData, TileData } from '../App';

interface HexagonGridProps {
  cells: CellData[];
  collectedTiles: TileData[];
  onCellClick: (cell: CellData) => void;
  flippingCellId?: string | null;
}

export function HexagonGrid({ cells, onCellClick, flippingCellId }: HexagonGridProps) {
  const ROWS = 5;

  return (
    <div className="flex flex-col items-center justify-center py-4 relative -translate-y-1/5">
      {Array.from({ length: ROWS }).map((_, rowIndex) => {
        const rowCells = cells.filter(c => c.row === rowIndex).sort((a, b) => a.col - b.col);

        if (rowCells.length === 0) return null;

        return (
          <div
            key={rowIndex}
            className="flex justify-center relative z-10"
            style={{
              marginTop: rowIndex === 0 ? 0 : '-24px',
            }}
          >
            {rowCells.map(cell => (
              <div
                key={cell.id}
                className="mx-[2px]"
              >
                <HexagonSlot data={cell} onClick={() => onCellClick(cell)} isFlipping={flippingCellId === cell.id} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
