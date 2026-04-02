import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import backgroundMusicUrl from "./assets/background.mp3";

const STORAGE_KEY = "lucky_draw_sound_enabled";

/** Nhạc nền bình thường (các SFX khác dùng ~0.88–1) */
const BACKGROUND_MUSIC_VOLUME = 0.3;
/** Khi có SFX (spin, wow, …) — hạ BGM để SFX rõ */
const BACKGROUND_MUSIC_VOLUME_DUCKED = 0.1;

export type SoundSettingsValue = {
  soundEnabled: boolean;
  toggleSound: () => void;
  /** Số nguồn SFX đang “đè” nhạc nền (spin, wow, …). >0 → nhạc nền duck. */
  sfxOverlayCount: number;
  /** Tăng overlay; gọi hàm trả về khi SFX kết thúc (gọi nhiều lần an toàn). */
  registerSfxOverlay: () => () => void;
};

const SoundSettingsContext = createContext<SoundSettingsValue | null>(null);

export const SoundSettingsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return true;
    return saved === "1" || saved === "true";
  });

  const [sfxOverlayCount, setSfxOverlayCount] = useState(0);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  const registerSfxOverlay = useCallback(() => {
    setSfxOverlayCount((n) => n + 1);
    let released = false;
    return () => {
      if (released) return;
      released = true;
      setSfxOverlayCount((n) => Math.max(0, n - 1));
    };
  }, []);

  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(backgroundMusicUrl);
    audio.loop = true;
    bgMusicRef.current = audio;
    return () => {
      audio.pause();
      audio.currentTime = 0;
      bgMusicRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = bgMusicRef.current;
    if (!audio) return;
    if (!soundEnabled) {
      audio.pause();
      audio.volume = 0;
      return;
    }
    const vol =
      sfxOverlayCount > 0
        ? BACKGROUND_MUSIC_VOLUME_DUCKED
        : BACKGROUND_MUSIC_VOLUME;
    audio.volume = vol;
    void audio.play().catch(() => {});
  }, [soundEnabled, sfxOverlayCount]);

  const value = useMemo(
    () => ({
      soundEnabled,
      toggleSound,
      sfxOverlayCount,
      registerSfxOverlay,
    }),
    [soundEnabled, toggleSound, sfxOverlayCount, registerSfxOverlay],
  );

  return (
    <SoundSettingsContext.Provider value={value}>
      {children}
    </SoundSettingsContext.Provider>
  );
};

export const useSoundSettings = (): SoundSettingsValue => {
  const ctx = useContext(SoundSettingsContext);
  if (!ctx) {
    throw new Error(
      "useSoundSettings must be used within SoundSettingsProvider",
    );
  }
  return ctx;
};

/** Đăng ký duck nhạc nền trong khi `active` (ví dụ phase đang spin). */
export const useSfxOverlayWhile = (active: boolean): void => {
  const { registerSfxOverlay } = useSoundSettings();
  useEffect(() => {
    if (!active) return;
    return registerSfxOverlay();
  }, [active, registerSfxOverlay]);
};
