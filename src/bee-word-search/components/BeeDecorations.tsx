import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

const beeMotion: Variants = {
  hover: {
    y: ["-8px", "8px", "-8px"],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

/* Modern Abstract Geometric Bee Icon */
const SleekBee = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={`w-16 h-16 sm:w-20 sm:h-20 drop-shadow-xl ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 20 L25 50 L50 80 L75 50 Z" fill="url(#goldGradient)" />
    <path d="M25 50 C 0 30, 20 10, 50 20" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
    <path d="M75 50 C 100 30, 80 10, 50 20" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
    {/* Body stripes abstract */}
    <path d="M35 40 L65 40 M30 50 L70 50 M35 60 L65 60" stroke="#0F172A" strokeWidth="4" strokeLinecap="round"/>
    <defs>
      <linearGradient id="goldGradient" x1="50" y1="20" x2="50" y2="80" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE047" />
        <stop offset="1" stopColor="#D4AF37" />
      </linearGradient>
    </defs>
  </svg>
);

export function BeeDecorations() {
  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      <motion.div variants={beeMotion} animate="hover" className="absolute top-12 left-6 md:top-20 md:left-16 opacity-80">
        <SleekBee />
      </motion.div>
      <motion.div variants={beeMotion} animate="hover" className="absolute top-12 right-6 md:top-20 md:right-16 opacity-80" style={{ animationDelay: '-1.5s' }}>
        <SleekBee className="scale-x-[-1]" />
      </motion.div>
      <motion.div variants={beeMotion} animate="hover" className="absolute bottom-32 left-6 md:bottom-28 md:left-16 opacity-80" style={{ animationDelay: '-3s' }}>
        <SleekBee />
      </motion.div>
      <motion.div variants={beeMotion} animate="hover" className="absolute bottom-32 right-6 md:bottom-28 md:right-16 opacity-80" style={{ animationDelay: '-4.5s' }}>
        <SleekBee className="scale-x-[-1]" />
      </motion.div>
    </div>
  );
}
