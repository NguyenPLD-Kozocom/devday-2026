import type { CSSProperties } from "react";

export function getDigitTier(
  prizeId: string,
): "gold" | "silver" | "bronze";

export function getLuckyDrawDigitSlotClassName(p: {
  tier: "gold" | "silver" | "bronze";
  filled: boolean;
  variant?: "ticket" | "fly";
}): string;

export function getLuckyDrawSideBoardSlotClassName(p: {
  tier: "gold" | "silver" | "bronze";
  filled: boolean;
  compact?: boolean;
}): string;

export function getLuckyDrawDigitTextStyle(p: {
  tier: "gold" | "silver" | "bronze";
  filled: boolean;
  variant?: "ticket" | "fly";
}): CSSProperties;

export function getLuckyDrawBoardDigitStyle(p: {
  tier: "gold" | "silver" | "bronze";
  filled: boolean;
  compact: boolean;
}): CSSProperties;
