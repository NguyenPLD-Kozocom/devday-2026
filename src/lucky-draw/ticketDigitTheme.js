// @ts-nocheck
import { PRIZE_IDS } from "./prizes";

/** @param {string} prizeId */
export const getDigitTier = (prizeId) => {
  if (prizeId === PRIZE_IDS.gold) return "gold";
  if (prizeId === PRIZE_IDS.silver) return "silver";
  return "bronze";
};

const SLOT_BASE =
  "flex aspect-3/4 flex-col items-center justify-center rounded-[11px] md:rounded-[13px] min-h-[92px] w-[24%] max-w-[118px] min-w-[66px] md:min-h-[124px] md:max-w-[138px]";

const SIDE_BOARD_COMPACT =
  "flex h-14 w-12 shrink-0 items-center justify-center rounded-[10px] md:h-16 md:w-14";
const SIDE_BOARD =
  "flex h-20 w-16 shrink-0 items-center justify-center rounded-[14px] md:h-[92px] md:w-20";

/** @param {{ tier: 'gold' | 'silver' | 'bronze', filled: boolean }} p */
export const getLuckyDrawDigitSlotClassName = ({ tier, filled }) => {
  if (!filled) {
    if (tier === "gold") {
      return `${SLOT_BASE} border-2 border-amber-400/85 bg-linear-to-b from-amber-800/55 via-amber-950/95 to-black shadow-[0_0_20px_rgba(250,204,21,0.35),inset_0_2px_0_rgba(254,243,199,0.35),inset_0_-10px_24px_rgba(0,0,0,0.55)] ring-2 ring-amber-300/40`;
    }
    if (tier === "silver") {
      return `${SLOT_BASE} border-2 border-slate-200/75 bg-linear-to-b from-slate-500/90 via-slate-800 to-slate-950 shadow-[0_0_18px_rgba(226,232,240,0.28),inset_0_2px_0_rgba(255,255,255,0.45),inset_0_-8px_20px_rgba(0,0,0,0.5)] ring-2 ring-slate-300/45`;
    }
    return `${SLOT_BASE} border-2 border-[#E8935A]/85 bg-linear-to-b from-[#5c3014]/90 via-[#2a150a] to-black shadow-[0_0_20px_rgba(249,115,22,0.32),inset_0_2px_0_rgba(254,215,170,0.28),inset_0_-8px_22px_rgba(0,0,0,0.55)] ring-2 ring-orange-400/40`;
  }
  if (tier === "gold") {
    return `${SLOT_BASE} border-[3px] border-[#FFEA00] bg-linear-to-b from-[#6b5200] via-[#3d2e00] to-[#1a0f00] shadow-[0_0_28px_rgba(255,215,0,0.65),0_0_52px_rgba(251,191,36,0.35),0_12px_28px_rgba(0,0,0,0.6),inset_0_3px_0_rgba(255,250,205,0.55),inset_0_-10px_28px_rgba(0,0,0,0.55)] ring-[3px] ring-amber-200/70`;
  }
  if (tier === "silver") {
    return `${SLOT_BASE} border-[3px] border-white bg-linear-to-b from-[#8b9cb3] via-[#4a5568] to-[#0f1218] shadow-[0_0_26px_rgba(255,255,255,0.45),0_0_40px_rgba(186,230,253,0.22),0_12px_28px_rgba(0,0,0,0.55),inset_0_3px_0_rgba(255,255,255,0.5),inset_0_-8px_22px_rgba(0,0,0,0.5)] ring-[3px] ring-cyan-100/50`;
  }
  return `${SLOT_BASE} border-[3px] border-[#FF9F43] bg-linear-to-b from-[#8B4513] via-[#5c2e0e] to-[#1a0d04] shadow-[0_0_26px_rgba(251,146,60,0.55),0_0_44px_rgba(234,88,12,0.28),0_12px_28px_rgba(0,0,0,0.58),inset_0_3px_0_rgba(255,215,180,0.4),inset_0_-8px_22px_rgba(0,0,0,0.52)] ring-[3px] ring-orange-300/65`;
};

/**
 * Ô “Kết quả” cạnh máy quay (layout cố định, không dùng SLOT_BASE).
 * @param {{ tier: 'gold' | 'silver' | 'bronze', filled: boolean, compact?: boolean }} p
 */
export const getLuckyDrawSideBoardSlotClassName = ({ tier, filled, compact }) => {
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

/** @param {{ tier: 'gold' | 'silver' | 'bronze', filled: boolean }} p */
export const getLuckyDrawDigitTextStyle = ({ tier, filled }) => {
  const fontSize = "clamp(38px, 6.8vw + 8px, 76px)";
  if (!filled) {
    const emptyColor =
      tier === "gold"
        ? "#fde68a"
        : tier === "silver"
          ? "#e2e8f0"
          : "#fdba74";
    return {
      fontFamily: "'Oswald', sans-serif",
      fontWeight: 900,
      fontSize,
      lineHeight: 1,
      color: emptyColor,
      textShadow:
        tier === "gold"
          ? "0 0 12px rgba(250,204,21,0.5)"
          : tier === "silver"
            ? "0 0 10px rgba(255,255,255,0.35)"
            : "0 0 12px rgba(251,146,60,0.45)",
    };
  }
  const goldGlow =
    "0 2px 0 rgba(0,0,0,0.85), 0 0 8px rgba(0,0,0,0.6), 0 0 36px rgba(255,215,0,0.85), 0 0 56px rgba(250,204,21,0.45), 0 1px 0 rgba(255,255,255,0.65)";
  const silverGlow =
    "0 2px 0 rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.55), 0 0 32px rgba(255,255,255,0.65), 0 0 48px rgba(186,230,253,0.35), 0 1px 0 rgba(255,255,255,0.9)";
  const bronzeGlow =
    "0 2px 0 rgba(0,0,0,0.82), 0 0 8px rgba(0,0,0,0.58), 0 0 34px rgba(251,146,60,0.75), 0 0 50px rgba(234,88,12,0.35), 0 1px 0 rgba(255,237,213,0.55)";
  return {
    fontFamily: "'Oswald', sans-serif",
    fontWeight: 900,
    fontSize,
    lineHeight: 1,
    color:
      tier === "gold"
        ? "#FFFACD"
        : tier === "silver"
          ? "#FFFFFF"
          : "#FFE4C4",
    textShadow:
      tier === "gold" ? goldGlow : tier === "silver" ? silverGlow : bronzeGlow,
  };
};

/**
 * @param {{ tier: 'gold' | 'silver' | 'bronze', filled: boolean, compact: boolean }} p
 */
export const getLuckyDrawBoardDigitStyle = ({ tier, filled, compact }) => {
  const fontSize = compact
    ? "clamp(28px, 5.5vw, 38px)"
    : "clamp(38px, 3.8vw, 56px)";
  if (!filled) {
    const emptyColor =
      tier === "gold"
        ? "#fde047"
        : tier === "silver"
          ? "#f1f5f9"
          : "#fdba74";
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
      tier === "gold"
        ? "#FFFACD"
        : tier === "silver"
          ? "#FFFFFF"
          : "#FFE4C4",
    textShadow:
      tier === "gold" ? goldGlow : tier === "silver" ? silverGlow : bronzeGlow,
  };
};
