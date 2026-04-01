import { motion } from 'framer-motion';
import logoKozocom from '../assets/logo_kozocom.png';
import gameBanner from '../assets/game_banner.png';
import buttonDefault from '../assets/button_default.png';
import buttonSoundOn from '../assets/button_sound_on.png';
import buttonSoundOff from '../assets/button_sound_off.png';

interface StartScreenProps {
  onStart: () => void;
  onShowRules: () => void;
  isMuted: boolean;
  toggleMute: () => void;
}

export function StartScreen({ onStart, onShowRules, isMuted, toggleMute }: StartScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-start-game select-none">
      {/* Background with honeycomb and dripping honey is handled via CSS class bg-start-game */}

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-4 mt-24 mb-4"
      >
        <img src={logoKozocom} alt="Kozocom" className="h-9 sm:h-11 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] contrast-125" />
      </motion.div>

      {/* Hero / Title */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 1,
          ease: "backOut",
          delay: 0.2
        }}
        className="relative z-10 flex flex-col items-center mt-12"
      >
        <motion.img
          src={gameBanner}
          alt="Ong Tìm Chữ"
          className="w-[85vw] max-w-[500px] object-contain drop-shadow-2xl"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Buttons Container */}
      <div className="relative z-10 flex flex-col items-center gap-4 mt-12 w-full max-w-[280px]">
        {/* Play Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="group relative w-full aspect-286/75 flex items-center justify-center transition-all duration-300"
        >
          <img src={buttonDefault} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <span className="relative z-10 text-white text-xl sm:text-2xl font-black tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
            CHƠI NGAY
          </span>
        </motion.button>

        {/* Rules Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onShowRules}
          className="group relative w-full aspect-286/75 flex items-center justify-center transition-all duration-300"
        >
          <img src={buttonDefault} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <span className="relative z-10 text-white text-xl sm:text-2xl font-black tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
            LUẬT & QUÀ
          </span>
        </motion.button>
      </div>

      {/* Sound Toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={toggleMute}
        className="absolute bottom-8 right-8 z-20 w-14 h-14 sm:w-16 sm:h-16 active:scale-90 transition-transform"
      >
        <img
          src={isMuted ? buttonSoundOff : buttonSoundOn}
          alt="Sound Toggle"
          className="w-full h-full object-contain drop-shadow-lg"
        />
      </motion.button>
    </div>
  );
}
