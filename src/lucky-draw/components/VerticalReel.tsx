import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import borderSpin from "../assets/border-spin.svg";
import Lever from "./Lever";

const MotionDiv = motion.div;

/** Slot-window position inside the border-spin.svg viewBox (582x582) */
const VB = 582;
const SLOT = {
  left: 200 / VB,
  width: 120 / VB,
  top: 160 / VB,
  height: 295 / VB,
};

// ── Casino animation constants ────────────────────────────────────────────────
/**
 * Strip is divided into 5 animation phases (row counts with digitCount = 10):
 *
 *  Phase 2  ACCEL  : ACCEL_ROTATIONS  × digitCount =  30 rows  (ease-in)
 *  Phase 3  CRUISE : CRUISE_ROTATIONS × digitCount = 120 rows  (linear, full speed)
 *  Phase 4  DECEL  : DECEL_ROTATIONS  × digitCount =  30 rows  (ease-out)
 *  Phase 5  TICK   : TICK_STEPS rows                =   9 rows  (discrete steps)
 *  Phase 6  OSHOT  : OVERSHOOT_STEPS rows → spring back
 *
 * TOTAL_ROTATIONS = ACCEL + CRUISE + DECEL — must stay a multiple so that
 * strip[finalRowIndex] % digitCount === safeTargetValue.
 */
const ACCEL_ROTATIONS = 4; // Phase 2: slow → full speed
const CRUISE_ROTATIONS = 22; // Phase 3: constant full speed
const DECEL_ROTATIONS = 4; // Phase 4: full speed → slow
const TOTAL_ROTATIONS = ACCEL_ROTATIONS + CRUISE_ROTATIONS + DECEL_ROTATIONS; // 30

// Total spin ≈ 2.2 + 6.5 + 4.5 ≈ 13 s
const ACCEL_PHASE_SEC = 2.2; // Phase 2 duration
const CRUISE_PHASE_SEC = 6.5; // Phase 3 duration
const DECEL_PHASE_SEC = 4.5; // Phase 4 duration — dài hơn, lướt chậm tới đích

export type VerticalReelMode = "idle" | "spinning" | "locked";

export type VerticalReelProps = {
  targetValue: number;
  spinKey: number;
  mode: VerticalReelMode;
  maxDigit?: number;
  compact?: boolean;
  idleValue?: number;
  /** Currently-displayed digit captured just before the spin (parent). */
  spinFromDigit?: number | null;
  /** Hide the center digit while the fly-out overlay is shown. */
  hideCenterDigit?: boolean;
  /** Idle center slot appears empty (after a digit has flown out). */
  idleCenterEmpty?: boolean;
  onPull?: () => void;
  pullDisabled?: boolean;
  onSpinComplete?: () => void;
  /** Called on every Phase-3 tick — use to trigger a tick sound. */
  onTick?: () => void;
};

/**
 * VerticalReel — Casino slot machine with 4-phase animation.
 *
 *  Phase 1  FAST SPIN  — accelerate to full speed + motion blur
 *  Phase 2  SLOW DOWN  — ease-out-cubic deceleration, blur fades to clear
 *  Phase 3  TICKING    — discrete step-by-step with growing pauses
 *                        (80 ms → 120 ms → 160 ms … feels like a real click-wheel)
 *  Phase 4  OVERSHOOT  — lunges 1 digit past target, spring-bounces back
 *                        ("clunk" lock-in)
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
  onTick,
}: VerticalReelProps) {
  const digitCount = Math.max(1, Math.min(10, maxDigit + 1));
  const rowsPerRotation = digitCount;

  // rowsTravel must be a multiple of digitCount
  const rowsTravel = TOTAL_ROTATIONS * rowsPerRotation;

  const spinCycles = Math.ceil(
    (rowsTravel * 2 + (digitCount * 2 - 1)) / rowsPerRotation,
  );
  const strip = Array.from(
    { length: spinCycles * digitCount },
    (_, i) => i % digitCount,
  );

  const safeTargetValue = Math.max(0, Math.min(maxDigit, targetValue));
  const finalRowIndex = rowsTravel + safeTargetValue;

  // Phase boundary row indices (high → low as the reel scrolls)
  const cruiseEndRowIndex = finalRowIndex + DECEL_ROTATIONS * digitCount; // end of cruise / start of decel
  const accelEndRowIndex = cruiseEndRowIndex + CRUISE_ROTATIONS * digitCount; // end of accel / start of cruise

  const startDigit =
    spinFromDigit !== null && spinFromDigit !== undefined
      ? spinFromDigit
      : idleValue;
  const safeStartDigit = Math.max(0, Math.min(maxDigit, startDigit));
  const digitAlign =
    (safeStartDigit - safeTargetValue + digitCount) % digitCount;
  const initialRowIndex = finalRowIndex + rowsTravel + digitAlign;

  // Static strip for idle / locked rendering
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

  // ── Slot-window measurements ───────────────────────────────────────────────
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
        setRowH(h * 0.48);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const centerOffset = (slotH - rowH) / 2;

  // ── Motion values ──────────────────────────────────────────────────────────
  const yMotion = useMotionValue(0);
  const blurMotion = useMotionValue(0);
  const filterStyle = useTransform(
    blurMotion,
    (v) => `blur(${v.toFixed(2)}px)`,
  );

  // Triggers the shake animation exactly once per lock-in
  const [shakeKey, setShakeKey] = useState(0);

  // Stable callback refs — avoid restarting the effect on re-render
  const onSpinCompleteRef = useRef(onSpinComplete);
  const onTickRef = useRef(onTick);
  useEffect(() => {
    onSpinCompleteRef.current = onSpinComplete;
  }, [onSpinComplete]);
  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  // ── 7-Phase Animation ──────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== "spinning") return;
    if (rowH <= 0) return;

    const co = centerOffset;
    const toY = (rowIdx: number) => -rowIdx * rowH + co;

    //  Phase markers (all row-index → Y conversions)
    const iY = toY(initialRowIndex); // Phase 1: start (snap)
    const aeY = toY(accelEndRowIndex); // Phase 2→3 boundary
    const ceY = toY(cruiseEndRowIndex); // Phase 3→4 boundary
    const fY = toY(finalRowIndex); // exact target

    yMotion.set(iY);
    blurMotion.set(0);

    let cancelled = false;
    const stoppers: Array<() => void> = [];

    const run = async () => {
      // ── Phase 2: ACCELERATE ──────────────────────────────────────────────
      const accel = animate(yMotion, aeY, {
        duration: ACCEL_PHASE_SEC,
        ease: [0.42, 0, 1, 1], // easeInQuad — gentle ramp up
      });
      stoppers.push(() => accel.stop());
      await accel;
      if (cancelled) return;

      // ── Phase 3: CRUISE (full speed linear) ─────────────────────────────
      const cruise = animate(yMotion, ceY, {
        duration: CRUISE_PHASE_SEC,
        ease: "linear",
      });
      stoppers.push(() => cruise.stop());
      await cruise;
      if (cancelled) return;

      // ── Phase 4: DECELERATE → dừng hẳn tại số đích ────────────────────
      // ease [0, 0, 0.05, 1]: giảm tốc mạnh, lướt rất chậm ở cuối
      const decel = animate(yMotion, fY, {
        duration: DECEL_PHASE_SEC,
        ease: [0, 0, 0.05, 1],
      });
      stoppers.push(() => decel.stop());
      await decel;
      if (cancelled) return;

      setShakeKey((k) => k + 1);
      onSpinCompleteRef.current?.();
    };

    void run();
    return () => {
      cancelled = true;
      stoppers.forEach((s) => s());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinKey, mode, rowH]);

  // Sync idle / locked position (no animation needed)
  useEffect(() => {
    if (mode === "spinning") return;
    const co = (slotH - rowH) / 2;
    yMotion.set(-(staticTargetRowIndex * rowH) + co);
    blurMotion.set(0);
  }, [mode, slotH, rowH, staticTargetRowIndex, yMotion, blurMotion]);

  // ── Styling helpers ────────────────────────────────────────────────────────
  const frameClass = compact
    ? "h-[min(90vw,950px)] w-[min(90vw,620px)] max-h-[950px] max-w-[620px]"
    : "h-[1000px] w-[720px] md:w-[820px]";

  const fontSize = compact
    ? "clamp(124px, 24vw, 230px)"
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
    <div className="relative -top-[55px] -left-[20px] shrink-0">
      {/* Shake wrapper — brief x/y shake when the reel locks in */}
      <MotionDiv
        key={`shake-${shakeKey}`}
        animate={
          shakeKey > 0 ? { x: [0, -3, 3, -2, 1, 0], y: [0, 1, -1, 1, 0] } : {}
        }
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div
          className={`relative overflow-hidden rounded-[2px] ${frameClass}`}
          style={shellStyle}
        >
          <div
            ref={slotRef}
            className="absolute z-10 flex items-center justify-center overflow-hidden"
            style={slotStyle}
          >
            {/* ── IDLE / LOCKED ──────────────────────────────────────────── */}
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
                        {/* Pulsing glow only on the locked center digit */}
                        {isCenter && mode === "locked" && !isIdleEmptyCenter ? (
                          <MotionDiv
                            data-reel-digit={
                              showReelDigitForMeasure ? true : undefined
                            }
                            className="select-none leading-none"
                            aria-hidden={hideCenterDigit ? true : undefined}
                            animate={{
                              textShadow: [
                                "0 0 8px rgba(59,130,246,0.5), 0 0 18px rgba(59,130,246,0.3), 0 1px 0 rgba(0,0,0,0.28)",
                                "0 0 18px rgba(100,200,255,0.95), 0 0 36px rgba(59,130,246,0.75), 0 0 52px rgba(59,130,246,0.4), 0 1px 0 rgba(0,0,0,0.28)",
                                "0 0 8px rgba(59,130,246,0.5), 0 0 18px rgba(59,130,246,0.3), 0 1px 0 rgba(0,0,0,0.28)",
                              ],
                            }}
                            transition={{
                              duration: 1.4,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            style={{
                              display: "block",
                              fontFamily: "'Oswald', sans-serif",
                              fontSize,
                              fontWeight: 700,
                              lineHeight: 1,
                              letterSpacing: "0.01em",
                              fontVariantNumeric: "tabular-nums",
                              color: "#ffffff",
                              opacity: hideCenterDigit ? 0 : 1,
                              WebkitTextStroke: "2px #1d4ed8",
                            }}
                          >
                            {d}
                          </MotionDiv>
                        ) : (
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
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── SPINNING: driven by useMotionValue ─────────────────────── */}
            {mode === "spinning" && (
              <div className="relative z-10 h-full w-full overflow-hidden">
                {/* Top/bottom vignette fade */}
                <div
                  className="pointer-events-none absolute inset-0 z-20"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(0,40,90,0.42) 0%, transparent 22%, transparent 78%, rgba(0,40,90,0.42) 100%)",
                  }}
                  aria-hidden
                />
                <motion.div
                  key={spinKey}
                  className="will-change-transform"
                  style={{ y: yMotion, filter: filterStyle }}
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
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </MotionDiv>

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
