export interface CellData {
  id: string;
  row: number;
  col: number;
  type: 'letter' | 'gift' | 'boom';
  content: string;
  isRevealed: boolean;
}

export interface TileData extends CellData {
  isDisabled: boolean;
}
