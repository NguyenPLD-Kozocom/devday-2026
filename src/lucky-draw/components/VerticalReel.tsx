// @ts-nocheck
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
const FULL_ROTATIONS = 15;
const ROWS_PER_ROTATION = 10;
const ROWS_TRAVEL = FULL_ROTATIONS * ROWS_PER_ROTATION;
/** Đủ hàng: mốc đầu có thể = đích + ROWS_TRAVEL + căn chữ số (tối đa ~2×ROWS_TRAVEL) */
const SPIN_CYCLES = Math.ceil((ROWS_TRAVEL * 2 + 19) / ROWS_PER_ROTATION);
const SPIN_DURATION_SEC = 14;

/**
 * Một đường cong duy nhất: p(t) = tích phân chuẩn từ v(t) ∝ t^a·(1−t)^b.
 * → tốc độ p'(t) chỉ có một đỉnh (tăng rồi giảm dần đến 0), không có “khúc” chậm rồi nhanh lại.
 */
const createSpinEase = () => {
  const a = 2.05;
  const b = 4.25;
  const STEPS = 2048;
  const cumulative = new Float64Array(STEPS + 1);
  cumulative[0] = 0;
  for (let i = 0; i < STEPS; i++) {
    const t = (i + 0.5) / STEPS;
    const v = Math.pow(t, a) * Math.pow(1 - t, b);
    cumulative[i + 1] = cumulative[i] + v / STEPS;
  }
  const total = cumulative[STEPS];
  for (let i = 0; i <= STEPS; i++) cumulative[i] /= total;
  return (rawT) => {
    const t = Math.max(0, Math.min(1, rawT));
    const pos = t * STEPS;
    const i = Math.min(Math.floor(pos), STEPS - 1);
    const f = pos - i;
    return cumulative[i] * (1 - f) + cumulative[i + 1] * f;
  };
};

const SPIN_EASE = createSpinEase();

/**
 * Khung quay: chỉ dùng border-spin.svg làm nền (viền có sẵn trong asset), số nằm trong ô cửa sổ.
 */
export default function VerticalReel({
  targetValue,
  spinKey,
  mode,
  compact = false,
  idleValue = 0,
  /** Số đang hiển thị lúc kéo (từ parent, chụp trước setIdleDigit). Ưu tiên hơn idleValue khi quay. */
  spinFromDigit = null,
  /** Ẩn số giữa khe khi overlay bay (chỉ còn một số bay, không trùng hai số) */
  hideCenterDigit = false,
  /** Khi idle: ô giữa trống (sau khi số đã bay đi); false = hiện đủ số (init / game mới) */
  idleCenterEmpty = false,
  onPull,
  pullDisabled = false,
  onSpinComplete,
}) {
  const strip = Array.from(
    { length: SPIN_CYCLES * ROWS_PER_ROTATION },
    (_, i) => i % 10,
  );
  /** Đích */
  const finalRowIndex = ROWS_TRAVEL + targetValue;
  /**
   * Chiều từ trên xuống: translateY tăng dần (từ âm hơn → ít âm hơn) → bắt đầu ở hàng chỉ số lớn, về đích nhỏ hơn.
   * Căn modulo 10 để ô đầu vẫn hiển thị đúng số lúc kéo (startDigit).
   */
  const startDigit =
    spinFromDigit !== null && spinFromDigit !== undefined
      ? spinFromDigit
      : idleValue;
  const digitAlign = (startDigit - targetValue + 10) % 10;
  const initialRowIndex = finalRowIndex + ROWS_TRAVEL + digitAlign;
  const staticCycles = 3;
  const staticStrip = Array.from(
    { length: staticCycles * 10 },
    (_, i) => i % 10,
  );
  const staticValue = mode === "idle" ? idleValue : targetValue;
  const staticTargetRowIndex = 10 + staticValue;

  const slotRef = useRef(null);
  const [slotH, setSlotH] = useState(48);
  const [rowH, setRowH] = useState(28.8);
  /** null = chưa nhận frame đầu từ motion (dùng initialY để tính quãng cuộn) */
  const [spinYTrack, setSpinYTrack] = useState(null);

  useEffect(() => {
    if (mode === "spinning") {
      setSpinYTrack(null);
    }
  }, [mode, spinKey]);

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
  const slotCenterY = slotH / 2;

  const effectiveSpinY =
    spinYTrack === null || spinYTrack === undefined ? initialY : spinYTrack;
  const scrolledFromSpinStartPx = Math.abs(effectiveSpinY - initialY);
  const oneRotationPx = ROWS_PER_ROTATION * rowH;
  const targetDigitVisibleAtCenter =
    rowH > 0 && scrolledFromSpinStartPx >= oneRotationPx - 0.5;

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
    <div className="relative -left-[20px] shrink-0">
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
                          color: isCenter ? "#ffffff" : "#9fc9ff",
                          opacity: isIdleEmptyCenter
                            ? 0
                            : isCenter
                              ? hideCenterDigit
                                ? 0
                                : 1
                              : 0.72,
                          textShadow: isCenter
                            ? "0 1px 0 rgba(0,0,0,0.28)"
                            : "0 0 4px rgba(130,198,255,0.22)",
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
              <MotionDiv
                key={spinKey}
                className="will-change-transform"
                initial={{ y: initialY }}
                animate={{ y: finalY }}
                transition={spinTransition}
                onUpdate={(latest) => {
                  if (typeof latest.y === "number") setSpinYTrack(latest.y);
                }}
                onAnimationComplete={() => onSpinComplete?.()}
              >
                {strip.map((d, i) => {
                  const rowCenter = i * rowH + effectiveSpinY + rowH / 2;
                  const distanceToCenter = Math.abs(rowCenter - slotCenterY);
                  const proximity = Math.max(
                    0,
                    1 - distanceToCenter / (rowH * 0.9),
                  );
                  const isAtCenter = distanceToCenter <= rowH * 0.22;
                  const opacity = 0.62 + proximity * 0.38;
                  const blurPx = (1 - proximity) * 1.15;
                  const glow = 0.2 + proximity * 0.28;
                  /** Chỉ ẩn đúng chữ số trúng ở giữa khe cho đến khi cuộn đủ 1 vòng (10 hàng) */
                  const hideTargetUntilOneRotation =
                    isAtCenter &&
                    d === targetValue &&
                    !targetDigitVisibleAtCenter;
                  const spanOpacity = hideTargetUntilOneRotation
                    ? 0
                    : isAtCenter
                      ? 1
                      : opacity;

                  return (
                    <div
                      key={`${spinKey}-${i}`}
                      className="flex items-center justify-center"
                      style={{ height: rowH }}
                    >
                      <span
                        className="select-none leading-none"
                        aria-hidden={hideTargetUntilOneRotation ? true : undefined}
                        style={{
                          fontFamily: "'Oswald', sans-serif",
                          fontSize,
                          fontWeight: 700,
                          lineHeight: 1,
                          letterSpacing: "0.01em",
                          fontVariantNumeric: "tabular-nums",
                          color: isAtCenter ? "#ffffff" : "#9fc9ff",
                          opacity: spanOpacity,
                          textShadow: isAtCenter
                            ? "0 1px 0 rgba(0,0,0,0.28)"
                            : `0 0 ${6 + proximity * 8}px rgba(155,220,255,${glow})`,
                          filter: isAtCenter
                            ? "blur(0px)"
                            : `blur(${blurPx}px)`,
                        }}
                      >
                        {d}
                      </span>
                    </div>
                  );
                })}
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
