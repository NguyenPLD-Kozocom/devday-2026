// @ts-nocheck
import { useRef } from "react";
import { useMotionValue, useTransform, useAnimation } from "framer-motion";
import { motion } from "framer-motion";

export default function Lever({ onPull, disabled }) {
  const PULL_THRESHOLD = 80;
  const MAX_PULL = 120;

  const controls = useAnimation();
  const y = useMotionValue(0);
  const isDragging = useRef(false);

  // Derive a subtle glow intensity from pull distance
  const glowOpacity = useTransform(y, [0, MAX_PULL], [0.3, 1]);
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
    <div className="flex flex-col items-center gap-3 select-none">
      {/* Lever assembly */}
      <div
        className="relative flex flex-col items-center"
        style={{ height: `${MAX_PULL + 80}px`, width: "60px" }}
      >
        {/* Shaft track (static background) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: "14px",
            height: `${MAX_PULL + 50}px`,
            top: "30px",
            background:
              "linear-gradient(90deg, #667788 0%, #aabbcc 40%, #99aabb 60%, #556677 100%)",
            boxShadow:
              "inset -2px 0 4px rgba(0,0,0,0.4), inset 2px 0 4px rgba(255,255,255,0.1)",
          }}
        />

        {/* Shaft slot groove */}
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: "6px",
            height: `${MAX_PULL + 30}px`,
            top: "40px",
            background:
              "linear-gradient(90deg, #334455 0%, #556677 50%, #334455 100%)",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.6)",
          }}
        />

        {/* Draggable knob */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing z-10"
          style={{ top: "0px", y }}
          drag={disabled ? false : "y"}
          dragConstraints={{ top: 0, bottom: MAX_PULL }}
          dragElastic={0.05}
          onDragStart={() => {
            isDragging.current = true;
          }}
          onDragEnd={handleDragEnd}
          animate={controls}
          whileTap={{ scale: disabled ? 1 : 1.05 }}
        >
          {/* Knob head — red square with rounded corners */}
          <motion.div
            className="flex items-center justify-center rounded-lg"
            style={{
              width: "50px",
              height: "50px",
              background: disabled
                ? "linear-gradient(135deg, #884455 0%, #663344 50%, #552233 100%)"
                : "linear-gradient(135deg, #ff6677 0%, #cc3344 50%, #aa2233 100%)",
              boxShadow: disabled
                ? "0 4px 12px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.1)"
                : "0 4px 16px rgba(204, 51, 68, 0.5), inset 0 1px 2px rgba(255,255,255,0.3), 0 0 20px rgba(255, 102, 119, 0.3)",
              scale: knobScale,
              border: "2px solid rgba(255,255,255,0.15)",
            }}
          >
            {/* Decorative inner circle */}
            <motion.div
              className="rounded-md"
              style={{
                width: "28px",
                height: "28px",
                background: disabled
                  ? "radial-gradient(circle, #995566 0%, #774455 100%)"
                  : "radial-gradient(circle, #ff8899 0%, #cc4455 100%)",
                opacity: glowOpacity,
                boxShadow: disabled
                  ? "none"
                  : "inset 0 0 8px rgba(255,255,255,0.2)",
              }}
            />
          </motion.div>
        </motion.div>

        {/* Base plate */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: "24px",
            height: "12px",
            background: "linear-gradient(180deg, #556677 0%, #334455 100%)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
          }}
        />
      </div>

      {/* Label */}
      <span
        className="text-xs font-bold tracking-widest text-center uppercase"
        style={{
          color: "#8899aa",
          textShadow: "0 1px 2px rgba(0,0,0,0.5)",
          letterSpacing: "0.15em",
        }}
      >
        Pull
        <br />
        Handle
      </span>
    </div>
  );
}
