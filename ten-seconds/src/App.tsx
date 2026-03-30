import { useState, useEffect, useRef, useCallback } from "react";
import mainImg from "./assets/main.png";
import backgroundMp4 from "./assets/background.mp4";
import gift1Img from "./assets/gift-1.png";
import gift2Img from "./assets/gift-2.png";
import gift3Img from "./assets/gift-3.png";
import soundMp4 from "./assets/sound.mp4";
import clapMp3 from "./assets/clap.mp3";

type GameState = "idle" | "running" | "result";

type PrizeTier = "jackpot" | "near" | "default";

type PrizeTierConfig = {
  tier: PrizeTier;
  displayLabel: string;
  /** Một ảnh composite theo từng mức: gift-1 (gần 10s), gift-2 (đúng 10s), gift-3 (còn lại). */
  imageSrc: string;
};

/**
 * gift-1: 9.91–9.99 hoặc 10.01–10.09 (Gấu + Quạt lụa)
 * gift-2: đúng 10 giây (9.99 < t < 10.01) — Áo thun + Gấu + Ly giữ nhiệt
 * gift-3: các trường hợp còn lại — Bút + Kẹo mút
 */
const getPrizeTier = (seconds: number): PrizeTierConfig => {
  if (seconds > 9.99 && seconds < 10.01) {
    return {
      tier: "jackpot",
      displayLabel: "Áo thun + Gấu + Ly giữ nhiệt",
      imageSrc: gift2Img,
    };
  }

  if (
    (seconds >= 9.91 && seconds <= 9.99) ||
    (seconds >= 10.01 && seconds <= 10.09)
  ) {
    return {
      tier: "near",
      displayLabel: "Gấu + Quạt lụa",
      imageSrc: gift1Img,
    };
  }

  return {
    tier: "default",
    displayLabel: "Bút + Kẹo mút",
    imageSrc: gift3Img,
  };
};

/** Hiển thị giây dạng `00.00` (phần nguyên tối thiểu 2 ký tự, 2 chữ số sau dấu phẩy). */
const formatSecondsDisplay = (seconds: number): string => {
  const [whole, frac] = seconds.toFixed(2).split(".");
  return `${whole.padStart(2, "0")}.${frac}`;
};

/** Mỗi ký tự trong ô cố định (`1ch` / dấu `.` hẹp hơn) để chuỗi không nhảy chiều ngang khi đổi số. */
const FixedWidthTimeText = ({
  value,
  className,
  ariaHidden,
}: {
  value: string;
  className?: string;
  ariaHidden?: boolean;
}) => (
  <span
    aria-hidden={ariaHidden}
    className={`inline-flex items-baseline tabular-nums ${className ?? ""}`}
  >
    {value.split("").map((char, index) => (
      <span
        key={`${index}-${char}`}
        className={
          char === "."
            ? "inline-block w-[0.55ch] shrink-0 text-center"
            : "inline-block w-[1ch] shrink-0 text-center"
        }
      >
        {char}
      </span>
    ))}
  </span>
);

function App() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [timer, setTimer] = useState(0);
  const animationFrame = useRef<number | undefined>(undefined);
  const startTime = useRef<number | undefined>(undefined);
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const gameSoundVideoRef = useRef<HTMLVideoElement>(null);
  const clapAudioRef = useRef<HTMLAudioElement>(null);

  const playBackgroundVideo = useCallback(() => {
    const el = backgroundVideoRef.current;
    if (!el) return;
    el.muted = true;
    el.defaultMuted = true;
    void el.play().catch(() => {});
  }, []);

  useEffect(() => {
    playBackgroundVideo();
    const el = backgroundVideoRef.current;
    if (!el) return;

    const onReady = () => playBackgroundVideo();
    el.addEventListener("canplay", onReady);
    el.addEventListener("loadeddata", onReady);

    const onVisibility = () => {
      if (document.visibilityState === "visible") playBackgroundVideo();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      el.removeEventListener("canplay", onReady);
      el.removeEventListener("loadeddata", onReady);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [playBackgroundVideo]);

  useEffect(() => {
    const el = gameSoundVideoRef.current;
    if (!el) return;

    if (gameState === "running") {
      el.muted = false;
      el.currentTime = 0;
      void el.play().catch(() => {});
      return;
    }

    el.pause();
    el.currentTime = 0;
  }, [gameState]);

  useEffect(() => {
    const el = clapAudioRef.current;
    if (!el) return;

    if (gameState !== "result") {
      el.pause();
      el.currentTime = 0;
      return;
    }

    el.currentTime = 0;
    void el.play().catch(() => {});

    return () => {
      el.pause();
      el.currentTime = 0;
    };
  }, [gameState]);

  const stopTimer = useCallback(() => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }

    const finalTime = startTime.current
      ? (performance.now() - startTime.current) / 1000
      : timer;

    setTimer(finalTime);
    setGameState("result");
  }, [timer]);

  const handleStart = useCallback(() => {
    playBackgroundVideo();
    setGameState("running");
    setTimer(0);
    startTime.current = performance.now();

    const animate = (currentTime: number) => {
      if (startTime.current) {
        const elapsed = (currentTime - startTime.current) / 1000;
        setTimer(elapsed);
        animationFrame.current = requestAnimationFrame(animate);
      }
    };
    animationFrame.current = requestAnimationFrame(animate);
  }, [playBackgroundVideo]);

  const handleReset = useCallback(() => {
    setGameState("idle");
    setTimer(0);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.repeat) return;

      if (gameState === "idle") {
        e.preventDefault();
        handleStart();
        return;
      }

      if (gameState === "running") {
        e.preventDefault();
        stopTimer();
        return;
      }

      if (gameState === "result") {
        e.preventDefault();
        handleReset();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, stopTimer, handleStart, handleReset]);

  const handleStopClick = () => {
    stopTimer();
  };

  const prizeTier = gameState === "result" ? getPrizeTier(timer) : null;

  return (
    <div className="fixed inset-0 h-[100dvh] max-h-[100dvh] w-screen overflow-hidden bg-[#00247F]">
      <img
        src={mainImg}
        alt=""
        className="absolute inset-0 z-0 h-full w-full select-none object-fit object-center"
        draggable={false}
      />

      <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
        <div className="absolute inset-0 opacity-[0.1]">
          <video
            ref={backgroundVideoRef}
            className="h-full w-full scale-[1.06] object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden
          >
            <source src={backgroundMp4} type="video/mp4" />
          </video>
        </div>
      </div>

      <video
        ref={gameSoundVideoRef}
        className="pointer-events-none fixed left-0 top-0 size-0 overflow-hidden opacity-0"
        loop
        playsInline
        preload="auto"
        aria-hidden
      >
        <source src={soundMp4} type="video/mp4" />
      </video>
      <audio
        ref={clapAudioRef}
        className="hidden"
        preload="auto"
        src={clapMp3}
      />

      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center">
        <div className="pointer-events-auto flex -translate-y-[min(6vh,3rem)] flex-col items-center gap-4 md:gap-6">
          <p
            className="font-technology text-[clamp(3rem,12vw,8rem)] leading-none tracking-tight text-white [text-shadow:2px_2px_8px_rgba(1,35,127,0.6)] [-webkit-text-stroke:1px_#DCFAFF]"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="sr-only">{formatSecondsDisplay(timer)}</span>
            <span className="text-[150px]">
              <FixedWidthTimeText
                value={formatSecondsDisplay(timer)}
                ariaHidden
              />
            </span>
          </p>

          {gameState === "idle" && (
            <button
              type="button"
              onClick={handleStart}
              className="px-10 pt-8 text-[clamp(1.25rem,3vw,2.5rem)] font-bold uppercase leading-[1.05] text-[#012A9E] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9DD7FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#00247F]"
            >
              Start
            </button>
          )}

          {gameState === "running" && (
            <button
              type="button"
              onClick={handleStopClick}
              className="px-10 pt-8 text-[clamp(1.25rem,3vw,2.5rem)] font-bold uppercase leading-[1.05] text-red-600 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#00247F]"
            >
              Stop
            </button>
          )}
        </div>
      </div>

      {gameState === "result" && (
        <div
          className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="result-title"
        >
          <div className="animate-scaleIn w-full max-w-[700px] rounded-[40px] bg-gradient-to-b from-[#35A3EF] to-[#0039BB] p-[4px] shadow-[0_8px_40px_rgba(0,0,0,0.45)]">
            <div className="rounded-[36px] bg-[rgba(1,41,161,0.8)] px-6 py-10 backdrop-blur-[18px] sm:px-10 sm:py-[60px] md:px-20">
              <div className="flex flex-col items-center gap-[30px] font-sans">
                <h2 id="result-title" className="sr-only">
                  {prizeTier?.tier === "jackpot"
                    ? "Chúc mừng, bạn đã dừng đúng 10 giây"
                    : "Kết quả thử thách"}
                </h2>
                <div className="flex flex-col items-center gap-[30px] self-stretch">
                  <div className="flex flex-col items-center gap-[6px]">
                    <p className="pb-6 text-center font-sans text-3xl font-light leading-[0.87] text-white [text-shadow:1px_2px_12px_rgba(0,0,0,0.25)]">
                      Bạn đạt được
                    </p>
                    <div
                      className="flex items-baseline justify-center gap-[6px]"
                      aria-live="polite"
                    >
                      <p className="font-technology text-[clamp(3.5rem,14vw,8.125rem)] leading-none text-white [text-shadow:2px_2px_8px_rgba(1,35,127,0.6)] [-webkit-text-stroke:1px_#DCFAFF]">
                        <FixedWidthTimeText
                          value={formatSecondsDisplay(timer)}
                        />
                      </p>
                      <span
                        className="font-sans text-[clamp(1.75rem,7vw,3.75rem)] font-medium uppercase leading-[0.87] text-white [text-shadow:1px_2px_12px_rgba(0,0,0,0.25)]"
                        aria-hidden
                      >
                        s
                      </span>
                    </div>
                  </div>
                  <div
                    className="w-full border-t border-dashed border-white/55"
                    aria-hidden
                  />
                </div>
                <div className="flex w-full flex-col items-center gap-[50px]">
                  <div className="flex flex-col items-center gap-5">
                    {prizeTier && (
                      <>
                        <div
                          className="mx-auto flex max-w-full shrink-0 justify-center"
                          aria-hidden
                        >
                          <img
                            src={prizeTier.imageSrc}
                            alt=""
                            className="h-[150px] w-auto max-w-full select-none object-contain"
                            draggable={false}
                          />
                        </div>
                        <p className="text-center text-[clamp(1.25rem,3.2vw,2.5rem)] font-medium leading-[1.3] text-white [text-shadow:1px_2px_12px_rgba(0,0,0,0.25)]">
                          {prizeTier.displayLabel}
                        </p>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex min-h-[90px] w-full items-center justify-center rounded-[60px] border-[3px] border-[#9DD7FF] bg-white px-10 text-[clamp(1.25rem,3.2vw,2.5rem)] font-bold uppercase leading-[1.05] text-[#012A9E] shadow-[0_4px_18px_rgba(0,0,0,0.25)] transition hover:brightness-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9DD7FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(1,41,161,0.8)]"
                  >
                    Chơi lại
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
