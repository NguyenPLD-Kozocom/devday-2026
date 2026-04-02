import { useEffect, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import LandingScreen from "./components/LandingScreen";
import PrizeScreen from "./components/PrizeScreen";
import PrizeDetailScreen from "./components/PrizeDetailScreen";
import { SoundSettingsProvider } from "./SoundSettingsContext";

const STORAGE_KEY = "lottery_currentScreen";
const PRIZE_STORAGE_KEY = "lottery_selectedPrize";
const LEFT_GAME_ENTRY_FLAG = "lottery_leftGameEntryFlag";

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

  // When leaving `/lucky-draw` (e.g. going back to Hub/home), reset to the main game screen
  // next time we enter `/lucky-draw`, instead of resuming directly in "detail".
  useEffect(() => {
    const resetOnNextEntry = sessionStorage.getItem(LEFT_GAME_ENTRY_FLAG) === "1";
    if (resetOnNextEntry) {
      sessionStorage.removeItem(LEFT_GAME_ENTRY_FLAG);
      localStorage.setItem(STORAGE_KEY, "1");
      setCurrentScreen(1);
    }
  }, []);

  useEffect(() => {
    return () => {
      sessionStorage.setItem(LEFT_GAME_ENTRY_FLAG, "1");
    };
  }, []);

  const goToScreen = (screen: number) => {
    localStorage.setItem(STORAGE_KEY, String(screen));
    setCurrentScreen(screen);
  };

  const handleSelectPrize = (prizeId: string) => {
    localStorage.setItem(PRIZE_STORAGE_KEY, prizeId);
    setSelectedPrizeId(prizeId);
    goToScreen(3);
  };

  return (
    <SoundSettingsProvider>
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
    </SoundSettingsProvider>
  );
}

export default App;
