// @ts-nocheck
import { PRIZE_IDS } from "./prizes";

/** @param {string} prizeId */
export const getDigitTier = (prizeId) => {
  if (prizeId === PRIZE_IDS.gold) return "gold";
  if (prizeId === PRIZE_IDS.silver) return "silver";
  return "bronze";
};

const SLOT_BASE =
  "flex aspect-square flex-col items-center justify-center rounded-full min-h-[108px] w-[30%] max-w-[146px] min-w-[86px] md:min-h-[138px] md:max-w-[166px]";

/** Ô số trên vé bay (giữa màn — phóng to hơn vé tĩnh). */
const SLOT_FLY =
  "flex aspect-square flex-col items-center justify-center rounded-full min-h-[128px] w-[32%] max-w-[180px] min-w-[96px] md:min-h-[158px] md:max-w-[200px] md:min-w-[108px]";

const SIDE_BOARD_COMPACT =
  "flex h-14 w-12 shrink-0 items-center justify-center rounded-[10px] md:h-16 md:w-14";
const SIDE_BOARD =
  "flex h-20 w-16 shrink-0 items-center justify-center rounded-[14px] md:h-[92px] md:w-20";

/** @param {{ tier: 'gold' | 'silver' | 'bronze', filled: boolean, variant?: 'ticket' | 'fly' }} p */
export const getLuckyDrawDigitSlotClassName = ({
  tier,
  filled,
  variant = "ticket",
}) => {
  const slot = variant === "fly" ? SLOT_FLY : SLOT_BASE;
  if (!filled) {
    if (tier === "gold") {
      return `${slot} border-[3px] border-[#f6d84b] bg-white ring-2 ring-[#ffe98a]/85 shadow-[0_0_18px_rgba(250,204,21,0.38)]`;
    }
    if (tier === "silver") {
      return `${slot} border-[3px] border-[#cdd9ea] bg-white ring-2 ring-[#eef4ff]/90 shadow-[0_0_16px_rgba(203,213,225,0.35)]`;
    }
    return `${slot} border-[3px] border-[#f3ae78] bg-white ring-2 ring-[#ffd7b1]/85 shadow-[0_0_16px_rgba(251,146,60,0.34)]`;
  }
  if (tier === "gold") {
    return `${slot} border-[3px] border-[#f5cc2f] bg-white ring-2 ring-[#ffec99] shadow-[0_0_20px_rgba(250,204,21,0.48)]`;
  }
  if (tier === "silver") {
    return `${slot} border-[3px] border-[#bfcee3] bg-white ring-2 ring-[#f3f7ff] shadow-[0_0_18px_rgba(148,163,184,0.45)]`;
  }
  return `${slot} border-[3px] border-[#ee9b5f] bg-white ring-2 ring-[#ffd2ad] shadow-[0_0_18px_rgba(249,115,22,0.42)]`;
};

/**
 * Ô “Kết quả” cạnh máy quay (layout cố định, không dùng SLOT_BASE).
 * @param {{ tier: 'gold' | 'silver' | 'bronze', filled: boolean, compact?: boolean }} p
 */
export const getLuckyDrawSideBoardSlotClassName = ({
  tier,
  filled,
  compact,
}) => {
  const base = compact ? SIDE_BOARD_COMPACT : SIDE_BOARD;
  if (!filled) {
    if (tier === "gold") {
      return `${base} border-2 border-amber-400/80 bg-linear-to-b from-amber-900/70 to-black shadow-[0_0_14px_rgba(250,204,21,0.35)] ring-1 ring-amber-300/35`;
    }
    if (tier === "silver") {
      return `${base} border-2 border-slate-200/70 bg-linear-to-b from-slate-600/85 to-slate-950 shadow-[0_0_12px_rgba(226,232,240,0.25)] ring-1 ring-slate-300/40`;
    }
    return `${base} border-2 border-[#E8935A]/75 bg-linear-to-b from-[#4a2610]/85 to-black shadow-[0_0_14px_rgba(249,115,22,0.28)] ring-1 ring-orange-400/35`;
  }
  if (tier === "gold") {
    return `${base} border-[3px] border-[#FFEA00] bg-linear-to-b from-[#6b5200] via-[#3d2e00] to-[#1a0f00] shadow-[0_0_22px_rgba(255,215,0,0.55),0_0_36px_rgba(251,191,36,0.25),inset_0_2px_0_rgba(255,250,205,0.45)] ring-2 ring-amber-200/60`;
  }
  if (tier === "silver") {
    return `${base} border-[3px] border-white bg-linear-to-b from-[#8b9cb3] via-[#4a5568] to-[#0f1218] shadow-[0_0_20px_rgba(255,255,255,0.4),0_0_32px_rgba(186,230,253,0.18),inset_0_2px_0_rgba(255,255,255,0.42)] ring-2 ring-cyan-100/45`;
  }
  return `${base} border-[3px] border-[#FF9F43] bg-linear-to-b from-[#8B4513] via-[#5c2e0e] to-[#1a0d04] shadow-[0_0_20px_rgba(251,146,60,0.48),0_0_34px_rgba(234,88,12,0.22),inset_0_2px_0_rgba(255,215,180,0.35)] ring-2 ring-orange-300/55`;
};

/** @param {{ tier: 'gold' | 'silver' | 'bronze', filled: boolean, variant?: 'ticket' | 'fly' }} p */
export const getLuckyDrawDigitTextStyle = ({
  tier,
  filled,
  variant = "ticket",
}) => {
  const fontSize =
    variant === "fly"
      ? "clamp(96px, 13.5vw + 14px, 188px)"
      : "clamp(80px, 11.2vw + 12px, 154px)";
  return {
    fontFamily: "'Oswald', sans-serif",
    fontWeight: 900,
    fontSize,
    lineHeight: 1,
    color: filled ? "#0d3c9f" : "#5d7fc8",
    textShadow: "none",
  };
};

/**
 * @param {{ tier: 'gold' | 'silver' | 'bronze', filled: boolean, compact: boolean }} p
 */
export const getLuckyDrawBoardDigitStyle = ({ tier, filled, compact }) => {
  const fontSize = compact
    ? "clamp(34px, 6.8vw, 48px)"
    : "clamp(38px, 3.8vw, 56px)";
  if (!filled) {
    const emptyColor =
      tier === "gold" ? "#fde047" : tier === "silver" ? "#f1f5f9" : "#fdba74";
    return {
      fontFamily: "'Oswald', sans-serif",
      fontWeight: 900,
      fontSize,
      lineHeight: 1,
      color: emptyColor,
      textShadow:
        tier === "gold"
          ? "0 0 10px rgba(250,204,21,0.55)"
          : tier === "silver"
            ? "0 0 8px rgba(255,255,255,0.4)"
            : "0 0 10px rgba(251,146,60,0.5)",
    };
  }
  const goldGlow =
    "0 1px 0 rgba(0,0,0,0.5), 0 0 16px rgba(255,215,0,0.9), 0 0 28px rgba(250,204,21,0.55)";
  const silverGlow =
    "0 1px 0 rgba(0,0,0,0.45), 0 0 14px rgba(255,255,255,0.75), 0 0 26px rgba(186,230,253,0.4)";
  const bronzeGlow =
    "0 1px 0 rgba(0,0,0,0.48), 0 0 16px rgba(251,146,60,0.75), 0 0 26px rgba(234,88,12,0.4)";
  return {
    fontFamily: "'Oswald', sans-serif",
    fontWeight: 900,
    fontSize,
    lineHeight: 1,
    color:
      tier === "gold" ? "#FFFACD" : tier === "silver" ? "#FFFFFF" : "#FFE4C4",
    textShadow:
      tier === "gold" ? goldGlow : tier === "silver" ? silverGlow : bronzeGlow,
  };
};
