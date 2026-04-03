import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

const beeMotion: Variants = {
  hover: {
    y: ["-8px", "8px", "-8px"],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export function BeeDecorations() {
  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      <motion.div
        variants={beeMotion}
        animate="hover"
        className="absolute top-[46%] left-[3%] opacity-90"
      >
        <img
          src="/src/bee-word-search/assets/bee_1.png"
          alt="Bee"
          className="w-full h-auto"
        />
      </motion.div>
      <motion.div
        variants={beeMotion}
        animate="hover"
        className="absolute top-[25%] right-[19%] opacity-90"
        style={{ animationDelay: "-1.5s" }}
      >
        <img
          src="/src/bee-word-search/assets/bee_2.png"
          alt="Bee"
          className="w-full h-auto"
        />
      </motion.div>
    </div>
  );
}
