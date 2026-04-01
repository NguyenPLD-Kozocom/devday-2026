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

/**
 * Khung quay: chỉ dùng border-spin.svg làm nền (viền có sẵn trong asset), số nằm trong ô cửa sổ.
 */
export default function VerticalReel({
  targetValue,
  spinKey,
  mode,
  compact = false,
  idleValue = 0,
  onPull,
  pullDisabled = false,
  onSpinComplete,
}) {
  const CYCLES = 6;
  const strip = Array.from({ length: CYCLES * 10 }, (_, i) => i % 10);
  const targetRowIndex = (CYCLES - 1) * 10 + targetValue;
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
  const [spinY, setSpinY] = useState(0);

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
  const initialY = -(targetRowIndex - 42) * rowH + centerOffset;
  const finalY = -targetRowIndex * rowH + centerOffset;
  const slotCenterY = slotH / 2;

  const frameClass = compact
    ? "h-[min(88vw,800px)] w-[min(88vw,500px)] max-h-[800px] max-w-[800px]"
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
    <div className="relative shrink-0">
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
                  return (
                    <div
                      key={`static-${i}`}
                      className="flex items-center justify-center"
                      style={{ height: rowH }}
                    >
                      <span
                        data-reel-digit={isCenter ? true : undefined}
                        className="select-none leading-none"
                        style={{
                          fontFamily: "'Oswald', sans-serif",
                          fontSize,
                          fontWeight: 700,
                          lineHeight: 1,
                          letterSpacing: "0.01em",
                          fontVariantNumeric: "tabular-nums",
                          color: isCenter ? "#ffffff" : "#9fc9ff",
                          opacity: isCenter ? 1 : 0.72,
                          textShadow: isCenter
                            ? "0 1px 0 rgba(0,0,0,0.28)"
                            : "0 0 4px rgba(130,198,255,0.22)",
                          filter: isCenter ? "blur(0px)" : "blur(0.9px)",
                        }}
                      >
                        {d}
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
                transition={{
                  duration: 2.35,
                  ease: [0.22, 0.82, 0.24, 1],
                }}
                onUpdate={(latest) => {
                  if (typeof latest.y === "number") setSpinY(latest.y);
                }}
                onAnimationComplete={() => onSpinComplete?.()}
              >
                {strip.map((d, i) => {
                  const rowCenter = i * rowH + spinY + rowH / 2;
                  const distanceToCenter = Math.abs(rowCenter - slotCenterY);
                  const proximity = Math.max(
                    0,
                    1 - distanceToCenter / (rowH * 0.9),
                  );
                  const isAtCenter = distanceToCenter <= rowH * 0.22;
                  const opacity = 0.62 + proximity * 0.38;
                  const blurPx = (1 - proximity) * 1.15;
                  const glow = 0.2 + proximity * 0.28;

                  return (
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
                          color: isAtCenter ? "#ffffff" : "#9fc9ff",
                          opacity: isAtCenter ? 1 : opacity,
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
          compact ? "scale-75 md:scale-90" : "scale-95 md:scale-100"
        }`}
      >
        <Lever onPull={onPull} disabled={pullDisabled} />
      </div>
    </div>
  );
}
