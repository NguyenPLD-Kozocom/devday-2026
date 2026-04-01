// @ts-nocheck
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Confetti — A celebratory particle burst overlay.
 *
 * Props:
 *  - active: boolean — when true, triggers the confetti animation
 *
 * Generates ~80 particles with random colors, positions, and trajectories.
 * Auto-fades out after ~4 seconds.
 */

function generateParticles(count = 80) {
  const colors = [
    "#FFD700",
    "#FF6B6B",
    "#4ECDC4",
    "#FF9F43",
    "#A29BFE",
    "#FD79A8",
    "#00B894",
    "#E17055",
    "#74B9FF",
    "#FDCB6E",
    "#E84393",
    "#00CEC9",
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: colors[Math.floor(Math.random() * colors.length)],
    x: Math.random() * 100, // start position (% of viewport width)
    delay: Math.random() * 0.8, // stagger start
    duration: 2 + Math.random() * 2,
    size: 6 + Math.random() * 10,
    rotation: Math.random() * 720 - 360,
    driftX: (Math.random() - 0.5) * 200, // horizontal drift in px
    shape: Math.random() > 0.5 ? "circle" : "rect",
  }));
}

export default function Confetti({ active }) {
  const [visible, setVisible] = useState(false);
  // Regenerate particles each time confetti is triggered
  const particles = useMemo(() => generateParticles(80), [active]);

  useEffect(() => {
    if (active) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [active]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              x: `${p.x}vw`,
              y: "-5vh",
              rotate: 0,
              opacity: 1,
              scale: 1,
            }}
            animate={{
              x: `calc(${p.x}vw + ${p.driftX}px)`,
              y: "110vh",
              rotate: p.rotation,
              opacity: [1, 1, 0.8, 0],
              scale: [1, 1.2, 0.8, 0.4],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            style={{
              position: "absolute",
              width: p.shape === "circle" ? p.size : p.size * 0.6,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.shape === "circle" ? "50%" : "2px",
              boxShadow: `0 0 6px ${p.color}44`,
            }}
          />
        ))}
      </div>
    </AnimatePresence>
  );
}
