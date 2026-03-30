import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LandingScreen from './components/LandingScreen';
import PrizeScreen from './components/PrizeScreen';
import SlotMachine from './components/SlotMachine';
import './index.css';

const STORAGE_KEY = 'lottery_currentScreen';

/**
 * App — Root component managing screen navigation.
 *
 * Screens:
 *  0 = LandingScreen (intro/rules)
 *  1 = PrizeScreen   (prize display)
 *  2 = SlotMachine    (the draw itself)
 */
function App() {
  const [currentScreen, setCurrentScreen] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved !== null ? Number(saved) : 0;
  });

  const goToScreen = (screen) => {
    localStorage.setItem(STORAGE_KEY, screen);
    setCurrentScreen(screen);
  };

  return (
    <AnimatePresence mode="wait">
      {currentScreen === 0 && (
        <motion.div
          key="landing"
          className="w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <LandingScreen onNext={() => goToScreen(1)} />
        </motion.div>
      )}
      {currentScreen === 1 && (
        <motion.div
          key="prizes"
          className="w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <PrizeScreen onBack={() => goToScreen(0)} onNext={() => goToScreen(2)} />
        </motion.div>
      )}
      {currentScreen === 2 && (
        <motion.div
          key="slotmachine"
          className="w-full h-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(160deg, #2d1810 0%, #1a0e08 40%, #0a0504 100%)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <SlotMachine />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
