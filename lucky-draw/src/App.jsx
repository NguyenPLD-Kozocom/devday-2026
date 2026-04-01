import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import LandingScreen from "./components/LandingScreen";
import PrizeScreen from "./components/PrizeScreen";
import PrizeDetailScreen from "./components/PrizeDetailScreen";
import SlotMachine from "./components/SlotMachine";
import "./index.css";

const STORAGE_KEY = "lottery_currentScreen";
const PRIZE_STORAGE_KEY = "lottery_selectedPrize";

/**
 * App — Root component managing screen navigation.
 *
 * Screens:
 *  0 = LandingScreen (intro/rules)
 *  1 = PrizeScreen   (prize display)
 *  2 = SlotMachine    (the draw itself)
 *  3 = PrizeDetail    (gold/silver/bronze)
 */
function App() {
  const MotionDiv = motion.div;
  const [currentScreen, setCurrentScreen] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved !== null ? Number(saved) : 0;
  });
  const [selectedPrizeId, setSelectedPrizeId] = useState(() => {
    const saved = localStorage.getItem(PRIZE_STORAGE_KEY);
    return saved ?? "gold";
  });

  const goToScreen = (screen) => {
    localStorage.setItem(STORAGE_KEY, screen);
    setCurrentScreen(screen);
  };

  const handleSelectPrize = (prizeId) => {
    localStorage.setItem(PRIZE_STORAGE_KEY, prizeId);
    setSelectedPrizeId(prizeId);
    goToScreen(3);
  };

  return (
    <LayoutGroup id="lucky-draw-layout">
      <AnimatePresence mode="wait">
        {currentScreen === 0 && (
          <MotionDiv
            key="landing"
            className="w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <LandingScreen onNext={() => goToScreen(1)} />
          </MotionDiv>
        )}
        {currentScreen === 1 && (
          <MotionDiv
            key="prizes"
            className="w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <PrizeScreen
              onBack={() => goToScreen(0)}
              onSelectPrize={handleSelectPrize}
            />
          </MotionDiv>
        )}
        {currentScreen === 3 && (
          <MotionDiv
            key={`prize-${selectedPrizeId}`}
            className="w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PrizeDetailScreen
              prizeId={selectedPrizeId}
              onBack={() => goToScreen(1)}
            />
          </MotionDiv>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}

export default App;
