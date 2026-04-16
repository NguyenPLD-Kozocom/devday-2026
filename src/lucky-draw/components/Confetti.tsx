// @ts-nocheck
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Confetti — A celebratory particle burst overlay.
 *
 * Props:
 *  - active: boolean — when true, triggers the confetti animation
 *  - tier: 'gold' | 'silver' | 'bronze' — mật độ & palette (giải vàng rực hơn)
 *
 * Auto-fades out sau vài giây (giải vàng lâu hơn một chút).
 */

const TIER_PARTICLE_COUNT = {
  gold: 220,
  silver: 140,
  bronze: 135,
};

const PALETTE_BY_TIER = {
  gold: [
    "#FFD700",
    "#FFF8DC",
    "#FFEC8B",
    "#FBBF24",
    "#F59E0B",
    "#FFFFFF",
    "#FDE047",
    "#FACC15",
    "#FEF3C7",
    "#E9D5FF",
    "#F472B6",
  ],
  silver: [
    "#FFE14A",
    "#FF6B9D",
    "#6EE7FF",
    "#C4B5FD",
    "#FF9F43",
    "#FFF8DC",
    "#FFFFFF",
    "#22D3EE",
    "#E2E8F0",
  ],
  bronze: [
    "#FFE14A",
    "#fdba74",
    "#fb923c",
    "#fcd34d",
    "#fecaca",
    "#FF9F43",
    "#FFF8DC",
    "#fed7aa",
    "#f97316",
    "#FFFFFF",
  ],
};

function generateParticles(tier) {
  const count = TIER_PARTICLE_COUNT[tier] ?? TIER_PARTICLE_COUNT.silver;
  const colors = PALETTE_BY_TIER[tier] ?? PALETTE_BY_TIER.silver;

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: colors[Math.floor(Math.random() * colors.length)],
    x: Math.random() * 100, // start position (% of viewport width)
    delay: Math.random() * (tier === "gold" ? 1.05 : 0.85), // stagger start
    duration:
      (tier === "gold" ? 2.4 : 2) + Math.random() * (tier === "gold" ? 2.2 : 2),
    size:
      (tier === "gold" ? 7 : 6) +
      Math.random() * (tier === "gold" ? 12 : 10),
    rotation: Math.random() * 720 - 360,
    driftX: (Math.random() - 0.5) * (tier === "gold" ? 260 : 200), // horizontal drift in px
    shape: Math.random() > 0.5 ? "circle" : "rect",
  }));
}

export default function Confetti({ active, tier = "silver" }) {
  const [visible, setVisible] = useState(false);
  const particles = useMemo(() => generateParticles(tier), [active, tier]);

  const fadeMs = tier === "gold" ? 5200 : 4200;

  useEffect(() => {
    if (active) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), fadeMs);
      return () => clearTimeout(timer);
    }
  }, [active, fadeMs]);

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
