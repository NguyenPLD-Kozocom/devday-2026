// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * DigitDisplay — A single slot-machine digit cell.
 *
 * Props:
 *  - status: 'idle' | 'spinning' | 'revealed'
 *  - value:  number 0-9 (only meaningful when status === 'revealed')
 *  - index:  position index for stagger delay
 *
 * States:
 *  - idle     → shows "—"
 *  - spinning → rapidly cycles random digits with a blur effect
 *  - revealed → the final number, sharp and glowing
 */
export default function DigitDisplay({ status, value, index }) {
  // The digit shown while spinning (cycles rapidly)
  const [spinDigit, setSpinDigit] = useState(0);
  const intervalRef = useRef(null);

  // When in 'spinning' state, cycle through random numbers every 60ms
  useEffect(() => {
    if (status === 'spinning') {
      intervalRef.current = setInterval(() => {
        setSpinDigit(Math.floor(Math.random() * 10));
      }, 60);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [status]);

  // Determine what to display
  const displayValue =
    status === 'idle' ? '—' : status === 'spinning' ? spinDigit : value;

  const isRevealed = status === 'revealed';
  const isSpinning = status === 'spinning';

  return (
    <div className="relative flex h-[130px] w-[88px] items-center justify-center overflow-hidden rounded-[12px] border border-white/20 bg-[#041c4f] md:h-[168px] md:w-[112px]">
      {/* Dark panel background with inner border */}
      <div
        className="absolute inset-[4px] rounded-[9px]"
        style={{
          background: 'linear-gradient(180deg, #0c51d5 0%, #07359a 45%, #05286f 100%)',
          boxShadow: 'inset 0 12px 18px rgba(255,255,255,0.08), inset 0 -12px 18px rgba(0,0,0,0.35)',
        }}
      />

      {/* Top gradient sheen — mimics the reflection on physical displays */}
      <div
        className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)',
        }}
      />

      {/* Bottom gradient sheen */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/4 pointer-events-none"
        style={{
          background: 'linear-gradient(0deg, rgba(0,0,0,0.3) 0%, transparent 100%)',
        }}
      />

      {/* The digit itself, animated */}
      <AnimatePresence mode="wait">
        <motion.span
          key={status === 'spinning' ? `spin-${spinDigit}` : `final-${displayValue}`}
          className="relative z-10 select-none"
          style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: 'clamp(54px, 7vw, 88px)',
            fontWeight: 900,
            color: isRevealed ? '#ffffff' : isSpinning ? '#d9ecff' : '#8ab2eb',
            textShadow: isRevealed
              ? '0 0 18px rgba(255,255,255,0.8), 0 0 36px rgba(104,180,255,0.55)'
              : isSpinning
              ? '0 0 10px rgba(130,198,255,0.45)'
              : 'none',
            filter: isSpinning ? 'blur(1.4px)' : 'blur(0px)',
          }}
          initial={{ opacity: 0, y: isSpinning ? -14 : 0, scale: 0.86 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            filter: isSpinning ? 'blur(1.4px)' : 'blur(0px)',
          }}
          exit={{ opacity: 0, y: 14, scale: 0.86 }}
          transition={{
            duration: isSpinning ? 0.05 : 0.35,
            ease: isRevealed ? [0.34, 1.56, 0.64, 1] : 'easeOut',
          }}
        >
          {displayValue}
        </motion.span>
      </AnimatePresence>

      {/* Glow ring when revealed */}
      {isRevealed && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[12px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45 }}
          style={{
            boxShadow:
              'inset 0 0 20px rgba(160,214,255,0.28), 0 0 16px rgba(98,173,255,0.45)',
            border: '1px solid rgba(186,225,255,0.75)',
          }}
        />
      )}
    </div>
  );
}
