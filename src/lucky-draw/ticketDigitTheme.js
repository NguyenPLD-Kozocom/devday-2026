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

/** @param {{ tier: 'gold' | 'silver' | 'bronze', filled: boolean }} p */
export const getLuckyDrawDigitSlotClassName = ({ tier, filled }) => {
  if (!filled) {
    return `${SLOT_BASE} border border-slate-500/45 bg-linear-to-b from-slate-600 to-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] opacity-95`;
  }
  if (tier === "gold") {
    return `${SLOT_BASE} border-2 border-amber-400/90 bg-linear-to-b from-slate-900 via-slate-950 to-[#0a0a0f] shadow-[0_10px_28px_rgba(0,0,0,0.55),inset_0_2px_0_rgba(255,255,255,0.14),inset_0_-8px_20px_rgba(0,0,0,0.45)] ring-1 ring-amber-500/45`;
  }
  if (tier === "silver") {
    return `${SLOT_BASE} border-2 border-slate-200/80 bg-linear-to-b from-slate-700 via-slate-800 to-slate-950 shadow-[0_10px_26px_rgba(0,0,0,0.48),inset_0_2px_0_rgba(255,255,255,0.16),inset_0_-6px_16px_rgba(0,0,0,0.4)] ring-1 ring-slate-400/35`;
  }
  return `${SLOT_BASE} border-2 border-orange-700/75 bg-linear-to-b from-stone-900 via-neutral-900 to-[#1c1008] shadow-[0_10px_26px_rgba(0,0,0,0.5),inset_0_2px_0_rgba(255,237,213,0.1),inset_0_-6px_16px_rgba(0,0,0,0.42)] ring-1 ring-orange-600/35`;
};

/** @param {{ tier: 'gold' | 'silver' | 'bronze', filled: boolean }} p */
export const getLuckyDrawDigitTextStyle = ({ tier, filled }) => {
  const fontSize = "clamp(38px, 6.8vw + 8px, 76px)";
  if (!filled) {
    return {
      fontFamily: "'Oswald', sans-serif",
      fontWeight: 900,
      fontSize,
      lineHeight: 1,
      color: "#94a3b8",
      textShadow: "none",
    };
  }
  const goldGlow =
    "0 2px 6px rgba(0,0,0,0.75), 0 0 24px rgba(253,224,71,0.45), 0 1px 0 rgba(255,255,255,0.35)";
  const silverGlow =
    "0 2px 6px rgba(0,0,0,0.7), 0 0 22px rgba(248,250,252,0.35), 0 1px 0 rgba(255,255,255,0.4)";
  const bronzeGlow =
    "0 2px 6px rgba(0,0,0,0.72), 0 0 20px rgba(254,215,170,0.4), 0 1px 0 rgba(255,247,237,0.3)";
  return {
    fontFamily: "'Oswald', sans-serif",
    fontWeight: 900,
    fontSize,
    lineHeight: 1,
    color:
      tier === "gold"
        ? "#fffbeb"
        : tier === "silver"
          ? "#f8fafc"
          : "#ffedd5",
    textShadow:
      tier === "gold" ? goldGlow : tier === "silver" ? silverGlow : bronzeGlow,
  };
};
