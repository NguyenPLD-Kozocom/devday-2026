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

  return (
    <div className="relative flex items-center justify-center w-[120px] h-[180px] md:w-[160px] md:h-[220px] rounded-lg overflow-hidden">
      {/* Dark panel background with inner border */}
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 50%, #1a1a1a 100%)',
          border: '2px solid rgba(212, 164, 32, 0.4)',
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8), inset 0 2px 4px rgba(212,164,32,0.1)',
        }}
      />

      {/* Top gradient sheen — mimics the reflection on physical displays */}
      <div
        className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(212,164,32,0.08) 0%, transparent 100%)',
        }}
      />

      {/* Bottom gradient sheen */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/4 pointer-events-none"
        style={{
          background: 'linear-gradient(0deg, rgba(212,164,32,0.06) 0%, transparent 100%)',
        }}
      />

      {/* The digit itself, animated */}
      <AnimatePresence mode="wait">
        <motion.span
          key={status === 'spinning' ? `spin-${spinDigit}` : `final-${displayValue}`}
          className="relative z-10 select-none"
          style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: 'clamp(60px, 8vw, 100px)',
            fontWeight: 900,
            color:
              status === 'revealed'
                ? '#f0d060'
                : status === 'spinning'
                ? '#d4a420'
                : '#555',
            textShadow:
              status === 'revealed'
                ? '0 0 20px rgba(240, 208, 96, 0.8), 0 0 40px rgba(212, 164, 32, 0.4)'
                : status === 'spinning'
                ? '0 0 8px rgba(212, 164, 32, 0.3)'
                : 'none',
            filter: status === 'spinning' ? 'blur(2px)' : 'blur(0px)',
          }}
          initial={{ opacity: 0, y: status === 'spinning' ? -20 : 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            filter: status === 'spinning' ? 'blur(2px)' : 'blur(0px)',
          }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          transition={{
            duration: status === 'spinning' ? 0.05 : 0.4,
            ease: status === 'revealed' ? [0.34, 1.56, 0.64, 1] : 'easeOut',
          }}
        >
          {displayValue}
        </motion.span>
      </AnimatePresence>

      {/* Glow ring when revealed */}
      {status === 'revealed' && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{
            boxShadow:
              'inset 0 0 20px rgba(240, 208, 96, 0.15), 0 0 15px rgba(212, 164, 32, 0.3)',
            border: '2px solid rgba(240, 208, 96, 0.5)',
          }}
        />
      )}
    </div>
  );
}
