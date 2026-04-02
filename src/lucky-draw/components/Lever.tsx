// @ts-nocheck
import { useRef } from "react";
import { useMotionValue, useTransform, useAnimation } from "framer-motion";
import { motion } from "framer-motion";
import spinHandle from "../assets/spin.svg";
import spinBody from "../assets/body-spin.svg";

export default function Lever({ onPull, disabled }) {
  const PULL_THRESHOLD = 180;
  const MAX_PULL = 300;
  const HANDLE_WIDTH = 240;
  const HANDLE_HEIGHT = 160;
  const BODY_WIDTH = 42;
  const BODY_HEIGHT = 414;
  const BODY_TOP = 68;

  const controls = useAnimation();
  const y = useMotionValue(0);
  const isDragging = useRef(false);

  const knobScale = useTransform(y, [0, MAX_PULL], [1, 1.08]);

  const handleDragEnd = () => {
    isDragging.current = false;
    const currentY = y.get();

    if (currentY >= PULL_THRESHOLD && !disabled) {
      // Successful pull — fire callback
      onPull?.();
    }

    // Always spring back to origin
    controls.start({
      y: 0,
      transition: { type: "spring", stiffness: 500, damping: 20 },
    });
  };

  return (
    <div className="relative top-[30px] left-[100px] flex flex-col items-center gap-3 select-none">
      {/* Lever assembly */}
      <div
        className="relative flex flex-col items-center"
        style={{ height: `${MAX_PULL + 200}px`, width: "280px" }}
      >
        {/* Shaft body asset */}
        <img
          src={spinBody}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 -translate-x-1/2"
          style={{
            width: `${BODY_WIDTH}px`,
            height: `${BODY_HEIGHT}px`,
            top: `${BODY_TOP}px`,
          }}
        />

        {/* Draggable knob */}
        <motion.div
          className="absolute left-1/2 z-10 -translate-x-1/2 cursor-grab active:cursor-grabbing touch-none"
          style={{ top: "0px", y, scale: knobScale, touchAction: "none" }}
          drag={disabled ? false : "y"}
          dragConstraints={{ top: 0, bottom: MAX_PULL }}
          dragElastic={0.05}
          onDragStart={() => {
            isDragging.current = true;
          }}
          onDragEnd={handleDragEnd}
          animate={controls}
          whileTap={{ scale: disabled ? 1 : 1.04 }}
        >
          <img
            src={spinHandle}
            alt="Spin handle"
            draggable={false}
            className={`pointer-events-none select-none ${
              disabled ? "opacity-75 saturate-50" : ""
            }`}
            style={{
              width: `${HANDLE_WIDTH}px`,
              height: `${HANDLE_HEIGHT}px`,
              filter: disabled
                ? "none"
                : "drop-shadow(0 6px 14px rgba(0, 90, 255, 0.35))",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
