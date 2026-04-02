import type { KeyboardEvent } from "react";
import speakerIcon from "../assets/speaker.png";
import { useSoundSettings } from "../SoundSettingsContext";

const handleEnterKey = (
  event: KeyboardEvent,
  handler: () => void,
): void => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handler();
  }
};

type SoundToggleButtonProps = {
  className?: string;
};

/**
 * Bật/tắt toàn bộ âm thanh lucky-draw (đồng bộ với BGM, SFX, spin).
 */
export default function SoundToggleButton({
  className = "",
}: SoundToggleButtonProps) {
  const { soundEnabled, toggleSound } = useSoundSettings();

  const handleToggleSound = () => {
    toggleSound();
  };

  return (
    <button
      type="button"
      className={`w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full overflow-hidden cursor-pointer hover:scale-110 transition-transform focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40 ${soundEnabled ? "opacity-100" : "opacity-45"} ${className}`}
      aria-label={soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
      aria-pressed={soundEnabled}
      onClick={handleToggleSound}
      onKeyDown={(e) => handleEnterKey(e, handleToggleSound)}
    >
      <img
        src={speakerIcon}
        alt=""
        aria-hidden
        className="w-full h-full object-contain pointer-events-none"
      />
    </button>
  );
}
