import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import DigitDisplay from './DigitDisplay';
import Lever from './Lever';
import Confetti from './Confetti';

/**
 * SlotMachine — The main Lucky Draw machine component.
 *
 * State Management:
 *  - machineState: 'idle' | 'spinning' | 'revealed'
 *    Controls the overall machine phase.
 *
 *  - digitStatuses: array of 3 statuses, one per digit
 *    Each digit transitions independently: 'idle' → 'spinning' → 'revealed'
 *    This allows the sequential stop effect (left → middle → right).
 *
 *  - digitValues: array of 3 numbers (the final random results)
 *
 *  - showConfetti: toggles the confetti overlay
 *
 * Sequencing:
 *  1. Lever pulled → all 3 digits start spinning simultaneously
 *  2. After 2s → digit 0 stops (reveals its random number)
 *  3. After 3s → digit 1 stops
 *  4. After 4s → digit 2 stops → confetti triggers
 */
export default function SlotMachine() {
  const [machineState, setMachineState] = useState('idle');
  const [digitStatuses, setDigitStatuses] = useState(['idle', 'idle', 'idle']);
  const [digitValues, setDigitValues] = useState([0, 0, 0]);
  const [showConfetti, setShowConfetti] = useState(false);
  const timeoutsRef = useRef([]);

  // Clean up any pending timeouts on unmount
  useEffect(() => {
    return () => timeoutsRef.current.forEach(clearTimeout);
  }, []);

  /**
   * handlePull — Triggered when the lever is successfully pulled.
   * Orchestrates the entire spin → reveal → confetti sequence.
   */
  const handlePull = useCallback(() => {
    if (machineState !== 'idle') return;

    // Generate 3 random digits upfront
    const newValues = [
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
    ];
    setDigitValues(newValues);

    // Phase 1: Start all digits spinning
    setMachineState('spinning');
    setDigitStatuses(['spinning', 'spinning', 'spinning']);
    setShowConfetti(false);

    // Clear any prior timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    // Phase 2: Sequentially stop each digit
    // Digit X stops at 2s
    const t1 = setTimeout(() => {
      setDigitStatuses((prev) => ['revealed', prev[1], prev[2]]);
    }, 2000);

    // Digit Y stops at 3s
    const t2 = setTimeout(() => {
      setDigitStatuses((prev) => [prev[0], 'revealed', prev[2]]);
    }, 3000);

    // Digit Z stops at 4s → then trigger confetti + reset to idle
    const t3 = setTimeout(() => {
      setDigitStatuses(['revealed', 'revealed', 'revealed']);
      setMachineState('revealed');
      setShowConfetti(true);
    }, 4000);

    // Phase 3: After celebration, allow re-pull
    const t4 = setTimeout(() => {
      setMachineState('idle');
    }, 7000);

    timeoutsRef.current = [t1, t2, t3, t4];
  }, [machineState]);

  return (
    <div className="relative flex items-center gap-6 md:gap-10">
      {/* ── Machine body ── */}
      <motion.div
        className="relative flex flex-col items-center p-6 md:p-10 rounded-2xl"
        style={{
          background: 'linear-gradient(145deg, #222 0%, #111 50%, #0a0a0a 100%)',
          border: '3px solid rgba(212, 164, 32, 0.6)',
          boxShadow:
            '0 0 40px rgba(212, 164, 32, 0.15), 0 0 80px rgba(212, 164, 32, 0.05), 0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Top decorative lights */}
        <div className="flex gap-3 mb-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="rounded-full"
              style={{
                width: '10px',
                height: '10px',
                background:
                  machineState === 'revealed'
                    ? '#FFD700'
                    : machineState === 'spinning'
                    ? '#aa8800'
                    : '#554400',
                boxShadow:
                  machineState === 'revealed'
                    ? '0 0 10px #FFD700, 0 0 20px rgba(255,215,0,0.5)'
                    : machineState === 'spinning'
                    ? '0 0 6px rgba(170,136,0,0.4)'
                    : '0 0 3px rgba(85,68,0,0.3)',
              }}
              animate={
                machineState === 'revealed'
                  ? {
                      opacity: [1, 0.4, 1],
                      scale: [1, 1.2, 1],
                    }
                  : {}
              }
              transition={
                machineState === 'revealed'
                  ? {
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }
                  : {}
              }
            />
          ))}
        </div>

        {/* Digit displays row */}
        <div className="flex gap-3 md:gap-5">
          {[0, 1, 2].map((i) => (
            <DigitDisplay
              key={i}
              status={digitStatuses[i]}
              value={digitValues[i]}
              index={i}
            />
          ))}
        </div>

        {/* Bottom decorative bar */}
        <div
          className="mt-6 rounded-full"
          style={{
            width: '60%',
            height: '4px',
            background:
              'linear-gradient(90deg, transparent 0%, rgba(212,164,32,0.4) 50%, transparent 100%)',
          }}
        />

        {/* Title plate */}
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <span
            className="text-xs md:text-sm tracking-[0.3em] uppercase"
            style={{
              color: '#d4a420',
              textShadow: '0 0 10px rgba(212, 164, 32, 0.3)',
              fontFamily: "'Orbitron', monospace",
              fontWeight: 700,
            }}
          >
            Lucky Draw
          </span>
        </motion.div>
      </motion.div>

      {/* ── Lever ── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <Lever
          onPull={handlePull}
          disabled={machineState !== 'idle'}
        />
      </motion.div>

      {/* ── Confetti overlay ── */}
      <Confetti active={showConfetti} />
    </div>
  );
}
