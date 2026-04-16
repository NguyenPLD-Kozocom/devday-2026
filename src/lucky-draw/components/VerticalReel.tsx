import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import borderSpin from "../assets/border-spin.svg";
import Lever from "./Lever";

const MotionDiv = motion.div;

/** Tọa độ ô hiển thị số trong viewBox 582×582 của border-spin.svg (khe dọc giữa, giữa hai vùng gradient) */
const VB = 582;
const SLOT = {
  left: 213 / VB,
  width: 96 / VB,
  top: 195 / VB,
  height: 240 / VB,
};

/** Số vòng 0–9 (đủ dài, không kéo quá lâu) */
const FULL_ROTATIONS = 8;
const SPIN_DURATION_SEC = 13;

/**
 * Một đường cong duy nhất: p(t) = tích phân chuẩn từ v(t) ∝ t^a·(1−t)^b.
 * → tốc độ p'(t) chỉ có một đỉnh (tăng rồi giảm dần đến 0), không có “khúc” chậm rồi nhanh lại.
 */
const createSpinEase = () => {
  const a = 2.05;
  const b = 4.25;
  const STEPS = 384;
  const cumulative = new Float64Array(STEPS + 1);
  cumulative[0] = 0;
  for (let i = 0; i < STEPS; i++) {
    const t = (i + 0.5) / STEPS;
    const v = Math.pow(t, a) * Math.pow(1 - t, b);
    cumulative[i + 1] = cumulative[i] + v / STEPS;
  }
  const total = cumulative[STEPS];
  for (let i = 0; i <= STEPS; i++) cumulative[i] /= total;
  return (rawT: number) => {
    const t = Math.max(0, Math.min(1, rawT));
    const pos = t * STEPS;
    const i = Math.min(Math.floor(pos), STEPS - 1);
    const f = pos - i;
    return cumulative[i] * (1 - f) + cumulative[i + 1] * f;
  };
};

const SPIN_EASE = createSpinEase();

export type VerticalReelMode = "idle" | "spinning" | "locked";

export type VerticalReelProps = {
  targetValue: number;
  spinKey: number;
  mode: VerticalReelMode;
  maxDigit?: number;
  compact?: boolean;
  idleValue?: number;
  /** Số đang hiển thị lúc kéo (từ parent, chụp trước setIdleDigit). Ưu tiên hơn idleValue khi quay. */
  spinFromDigit?: number | null;
  /** Ẩn số giữa khe khi overlay bay (chỉ còn một số bay, không trùng hai số) */
  hideCenterDigit?: boolean;
  /** Khi idle: ô giữa trống (sau khi số đã bay đi); false = hiện đủ số (init / game mới) */
  idleCenterEmpty?: boolean;
  onPull?: () => void;
  pullDisabled?: boolean;
  onSpinComplete?: () => void;
};

/**
 * Khung quay: chỉ dùng border-spin.svg làm nền (viền có sẵn trong asset), số nằm trong ô cửa sổ.
 */
export default function VerticalReel({
  targetValue,
  spinKey,
  mode,
  maxDigit = 9,
  compact = false,
  idleValue = 0,
  spinFromDigit = null,
  hideCenterDigit = false,
  idleCenterEmpty = false,
  onPull,
  pullDisabled = false,
  onSpinComplete,
}: VerticalReelProps) {
  const digitCount = Math.max(1, Math.min(10, maxDigit + 1));
  const rowsPerRotation = digitCount;
  const rowsTravel = FULL_ROTATIONS * rowsPerRotation;
  const spinCycles = Math.ceil(
    (rowsTravel * 2 + (digitCount * 2 - 1)) / rowsPerRotation,
  );
  const strip = Array.from(
    { length: spinCycles * digitCount },
    (_, i) => i % digitCount,
  );
  /** Đích */
  const safeTargetValue = Math.max(0, Math.min(maxDigit, targetValue));
  const finalRowIndex = rowsTravel + safeTargetValue;
  /**
   * Chiều từ trên xuống: translateY tăng dần (từ âm hơn → ít âm hơn) → bắt đầu ở hàng chỉ số lớn, về đích nhỏ hơn.
   * Căn modulo 10 để ô đầu vẫn hiển thị đúng số lúc kéo (startDigit).
   */
  const startDigit =
    spinFromDigit !== null && spinFromDigit !== undefined
      ? spinFromDigit
      : idleValue;
  const safeStartDigit = Math.max(0, Math.min(maxDigit, startDigit));
  const digitAlign =
    (safeStartDigit - safeTargetValue + digitCount) % digitCount;
  const initialRowIndex = finalRowIndex + rowsTravel + digitAlign;
  const staticCycles = 3;
  const staticStrip = Array.from(
    { length: staticCycles * digitCount },
    (_, i) => i % digitCount,
  );
  const staticValue =
    mode === "idle"
      ? Math.max(0, Math.min(maxDigit, idleValue))
      : safeTargetValue;
  const staticTargetRowIndex = digitCount + staticValue;

  const slotRef = useRef<HTMLDivElement | null>(null);
  const [slotH, setSlotH] = useState(48);
  const [rowH, setRowH] = useState(28.8);

  useEffect(() => {
    const el = slotRef.current;
    if (!el) return;
    const measure = () => {
      const h = el.clientHeight;
      if (h > 0) {
        setSlotH(h);
        // Tăng phần hiển thị số trên/dưới để tiệm cận tỷ lệ trong ảnh mẫu
        setRowH(h * 0.48);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const centerOffset = (slotH - rowH) / 2;
  const initialY = -initialRowIndex * rowH + centerOffset;
  const finalY = -finalRowIndex * rowH + centerOffset;
  const travelDelta = finalY - initialY;
  const spinTransition =
    travelDelta === 0
      ? { duration: 0 }
      : {
          duration: SPIN_DURATION_SEC,
          ease: SPIN_EASE,
        };
  const frameClass = compact
    ? "h-[min(90vw,950px)] w-[min(90vw,620px)] max-h-[950px] max-w-[620px]"
    : "h-[1000px] w-[720px] md:w-[820px]";

  const fontSize = compact
    ? "clamp(124px, 24vw, 176px)"
    : "clamp(152px, 22vw, 216px)";

  const shellStyle = {
    backgroundImage: `url(${borderSpin})`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain",
  };

  const slotStyle = {
    left: `${SLOT.left * 100}%`,
    top: `${SLOT.top * 100}%`,
    width: `${SLOT.width * 100}%`,
    height: `${SLOT.height * 100}%`,
  };

  return (
    <div className="relative -top-[150px] -left-[20px] shrink-0">
      <div
        className={`relative overflow-hidden rounded-[2px] ${frameClass}`}
        style={shellStyle}
      >
        <div
          ref={slotRef}
          className="absolute z-10 flex items-center justify-center overflow-hidden"
          style={slotStyle}
        >
          {(mode === "idle" || mode === "locked") && (
            <div className="relative z-10 h-full w-full overflow-hidden">
              <div
                className="will-change-transform"
                style={{
                  transform: `translateY(${-(staticTargetRowIndex * rowH) + centerOffset}px)`,
                }}
              >
                {staticStrip.map((d, i) => {
                  const isCenter = i === staticTargetRowIndex;
                  /** Idle: ô giữa trống khi parent yêu cầu (sau khi số đã bay) */
                  const isIdleEmptyCenter =
                    mode === "idle" && idleCenterEmpty && isCenter;
                  const showReelDigitForMeasure =
                    isCenter && mode === "locked" && !hideCenterDigit;
                  return (
                    <div
                      key={`static-${i}`}
                      className="flex items-center justify-center"
                      style={{ height: rowH }}
                    >
                      <span
                        data-reel-digit={
                          showReelDigitForMeasure ? true : undefined
                        }
                        className="select-none leading-none"
                        aria-hidden={
                          (hideCenterDigit && isCenter) || isIdleEmptyCenter
                            ? true
                            : undefined
                        }
                        style={{
                          fontFamily: "'Oswald', sans-serif",
                          fontSize,
                          fontWeight: 700,
                          lineHeight: 1,
                          letterSpacing: "0.01em",
                          fontVariantNumeric: "tabular-nums",
                          color: "#ffffff",
                          opacity: isIdleEmptyCenter
                            ? 0
                            : isCenter
                              ? hideCenterDigit
                                ? 0
                                : 1
                              : 0.72,
                          textShadow: isCenter
                            ? "0 0 8px rgba(59,130,246,0.35), 0 1px 0 rgba(0,0,0,0.2)"
                            : "0 0 4px rgba(130,198,255,0.22)",
                          WebkitTextStroke: "2px #1d4ed8",
                          filter: isCenter ? "blur(0px)" : "blur(0.9px)",
                        }}
                      >
                        {isIdleEmptyCenter ? "\u00a0" : d}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {mode === "spinning" && (
            <div className="relative z-10 h-full w-full overflow-hidden">
              <div
                className="pointer-events-none absolute inset-0 z-20"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(0,40,90,0.42) 0%, transparent 22%, transparent 78%, rgba(0,40,90,0.42) 100%)",
                }}
                aria-hidden
              />
              <MotionDiv
                key={spinKey}
                className="will-change-transform"
                initial={{ y: initialY }}
                animate={{ y: finalY }}
                transition={spinTransition}
                onAnimationComplete={() => onSpinComplete?.()}
              >
                {strip.map((d, i) => (
                  <div
                    key={`${spinKey}-${i}`}
                    className="flex items-center justify-center"
                    style={{ height: rowH }}
                  >
                    <span
                      className="select-none leading-none"
                      style={{
                        fontFamily: "'Oswald', sans-serif",
                        fontSize,
                        fontWeight: 700,
                        lineHeight: 1,
                        letterSpacing: "0.01em",
                        fontVariantNumeric: "tabular-nums",
                        color: "#ffffff",
                        opacity: 0.9,
                        textShadow:
                          "0 0 10px rgba(59,130,246,0.35), 0 1px 0 rgba(0,0,0,0.2)",
                        WebkitTextStroke: "2px #1d4ed8",
                      }}
                    >
                      {d}
                    </span>
                  </div>
                ))}
              </MotionDiv>
            </div>
          )}
        </div>
      </div>

      <div
        className={`absolute top-1/2 right-14 z-30 -translate-y-1/2 origin-right ${
          compact ? "scale-90 md:scale-105" : "scale-105 md:scale-115"
        }`}
      >
        <Lever onPull={onPull} disabled={pullDisabled} />
      </div>
    </div>
  );
}
