import { memo } from "react";
import { motion } from "framer-motion";
import type { TileData, CellData } from "../types/game";
import honeyCellKo from "../assets/honey_cell_ko.png";
import honeyCellZo from "../assets/honey_cell_zo.png";
import honeyCellCom from "../assets/honey_cell_com.png";
import honeyCellKozocom from "../assets/honey_cell_kozocom.png";
import honeyCellGift from "../assets/honey_cell_gift.png";
import honeyCellBoom from "../assets/honey_cell_boom.png";
import backHoneyCell from "../assets/back_honey_cell.png";

const CONTENT_IMAGES: Record<string, string> = {
  Ko: honeyCellKo,
  Zo: honeyCellZo,
  Com: honeyCellCom,
  Kozocom: honeyCellKozocom,
  gift: honeyCellGift,
  boom: honeyCellBoom,
};

export const HexagonTile = memo(function HexagonTile({
  tile,
  inGrid,
  duration,
}: {
  tile: TileData | CellData;
  inGrid?: boolean;
  duration?: number;
}) {
  const isDisabled = "isDisabled" in tile && tile.isDisabled;

  const defaultDuration = 0.15;
  const animDuration =
    duration || (tile.content === "Kozocom" ? 1.0 : defaultDuration);

  const imageSrc =
    tile.type === "letter"
      ? CONTENT_IMAGES[tile.content]
      : CONTENT_IMAGES[tile.type];

  return (
    <motion.div
      layoutId={tile.id}
      className={`absolute inset-0
        ${isDisabled ? "opacity-40 grayscale" : ""}
        ${inGrid ? "z-50" : "z-10"}
      `}
      initial={inGrid ? { rotateY: 180, scale: 1 } : false}
      animate={{ rotateY: 0, scale: 1 }}
      transition={{ type: "spring", bounce: 0.15, duration: animDuration }}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {/* Front Face (The Revealed Content) */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
      >
        <img
          src={imageSrc || CONTENT_IMAGES["Ko"]}
          alt={tile.content}
          className="w-full h-full object-contain drop-shadow-md"
        />
      </div>

      {/* Back Face (The Golden Cover) */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
        }}
      >
        <img
          src={backHoneyCell}
          alt="Back"
          className="w-full h-full object-contain drop-shadow-sm"
        />
      </div>
    </motion.div>
  );
});

export const HexagonSlot = memo(function HexagonSlot({
  data,
  onClick,
  isFlipping,
}: {
  data: CellData;
  onClick: (cell: CellData) => void;
  isFlipping?: boolean;
}) {
  return (
    <div
      className="hex-container group cursor-pointer transition-transform active:scale-90"
      onClick={() => !data.isRevealed && onClick(data)}
    >
      {!data.isRevealed && !isFlipping && (
        <motion.div
          layoutId={data.id}
          className="absolute inset-0 flex items-center justify-center transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]"
        >
          <img
            src={backHoneyCell}
            alt="Slot"
            className="w-full h-full object-contain"
          />
        </motion.div>
      )}

      {data.isRevealed && !isFlipping && (
        <div className="absolute inset-0 flex items-center justify-center opacity-20 brightness-50">
          <img
            src={backHoneyCell}
            alt="Revealed Slot"
            className="w-full h-full object-contain grayscale"
          />
        </div>
      )}

      {isFlipping && (
        <HexagonTile tile={{ ...data, isDisabled: false } as TileData} inGrid />
      )}
    </div>
  );
});
