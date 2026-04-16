import { useState, useEffect, useRef, useCallback } from "react";
import mainImg from "./assets/main.png";
import backgroundMp4 from "./assets/background.mp4";
import gift1Img from "./assets/gift-1.png";
import gift2Img from "./assets/gift-2.png";
import gift3Img from "./assets/gift-3.png";
import tenSecond from "./assets/10s.svg";
import logo from "../assets/logo.png";
import soundMp4 from "./assets/sound.mp4";
import prizeJackpotSfx from "./assets/prize-1.mp3";
import prizeNear1Sfx from "./assets/prize-2-1.mp3";
import prizeNear2Sfx from "./assets/prize-2-2.mp3";
import prizeDefaultSfx from "./assets/prize-3.mp3";
import tryAgainImg from "./assets/try-again.png";
import confetti from "canvas-confetti";
import { cn } from "@/utils/cn";
import { GiftGroup } from "./components/GiftGroup";

type GameState = "idle" | "running" | "result";

type PrizeTier = "jackpot" | "near" | "default";

type PrizeTierConfig = {
  tier: PrizeTier;
  displayLabel: string;
  /** Một ảnh composite theo từng mức: gift-1 (gần 10s), gift-2 (đúng 10s), gift-3 (còn lại). */
  imageSrc: string;
};

/**
 * Phân hạng theo thời gian làm tròn 2 chữ số (cùng quy tắc với `formatSecondsDisplay`):
 * gift-2: đúng 10.00s — jackpot
 * gift-1: 9.99s hoặc 10.01s — gần đích
 * gift-3: còn lại — default
 */
const getPrizeTier = (seconds: number): PrizeTierConfig => {
  const roundedCentis = Math.round(seconds * 100) / 100;

  if (roundedCentis === 10) {
    return {
      tier: "jackpot",
      displayLabel: "Áo thun + Gấu + Ly giữ nhiệt",
      imageSrc: gift2Img,
    };
  }

  if (roundedCentis === 9.99 || roundedCentis === 10.01) {
    return {
      tier: "near",
      displayLabel: "Gấu/Quạt lụa",
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

type TryAgainParticle = {
  id: number;
  xPct: number;
  durSec: number;
  driftPx: number;
  wRem: number;
  flip: boolean;
};

const TRY_AGAIN_BURST_MAX = 42;
const TRY_AGAIN_BURST_INTERVAL_MS = 420;
const ENTER_ACTION_COOLDOWN_MS = 2000;

/** Many small icons float up and fade; stops when the modal unmounts (Chơi lại). */
const TryAgainParticleBurst = ({ imageSrc }: { imageSrc: string }) => {
  const idSeqRef = useRef(0);
  const [particles, setParticles] = useState<TryAgainParticle[]>([]);

  const spawnOne = useCallback(() => {
    setParticles((prev) => {
      const id = idSeqRef.current++;
      const particle: TryAgainParticle = {
        id,
        xPct: 5 + Math.random() * 90,
        durSec: 5 + Math.random() * 4,
        driftPx: (Math.random() - 0.5) * 100,
        wRem: 2.35 + Math.random() * 2.15,
        flip: Math.random() > 0.5,
      };
      const next = [...prev, particle];
      return next.length > TRY_AGAIN_BURST_MAX
        ? next.slice(-TRY_AGAIN_BURST_MAX)
        : next;
    });
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    spawnOne();
    const intervalId = window.setInterval(
      spawnOne,
      TRY_AGAIN_BURST_INTERVAL_MS,
    );
    return () => window.clearInterval(intervalId);
  }, [spawnOne]);

  const handleAnimationEnd = useCallback((particleId: number) => {
    setParticles((prev) => prev.filter((p) => p.id !== particleId));
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-visible"
      aria-hidden
    >
      {particles.map((p) => (
        <img
          key={p.id}
          src={imageSrc}
          alt=""
          draggable={false}
          className={cn(
            "animate-try-again-rise absolute bottom-[8%] max-w-[min(5.5rem,72%)] select-none object-contain",
            p.flip && "scale-x-[-1]",
          )}
          style={{
            left: `${p.xPct}%`,
            width: `${p.wRem}rem`,
            ["--drift" as string]: `${p.driftPx}px`,
            animationDuration: `${p.durSec}s`,
          }}
          onAnimationEnd={() => handleAnimationEnd(p.id)}
        />
      ))}
    </div>
  );
};

const NEAR_FIREWORK_COLORS = [
  "#FFE14A",
  "#FF6B9D",
  "#6EE7FF",
  "#C4B5FD",
  "#FF9F43",
  "#FFF8DC",
  "#FF4D6D",
  "#22D3EE",
  "#FDE047",
  "#FFFFFF",
];

/** Fireworks via canvas-confetti from both lower sides; stops when the modal closes. */
const NearResultFireworks = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const fire = confetti.create(canvas, {
      resize: true,
      useWorker: true,
    });

    const burst = (originX: number, angle: number) => {
      void fire({
        disableForReducedMotion: true,
        particleCount: 38 + Math.floor(Math.random() * 28),
        spread: 48 + Math.random() * 20,
        startVelocity: 36 + Math.random() * 16,
        angle,
        origin: {
          x: Math.min(0.97, Math.max(0.03, originX)),
          y: 0.86 + Math.random() * 0.11,
        },
        colors: NEAR_FIREWORK_COLORS,
        ticks: 260 + Math.floor(Math.random() * 80),
        gravity: 0.88,
        scalar: 0.85 + Math.random() * 0.3,
        drift: (Math.random() - 0.5) * 0.25,
        shapes: ["circle", "square"],
      });
    };

    const runPair = () => {
      burst(0.09 + Math.random() * 0.1, 58 + Math.random() * 18);
      burst(0.81 + Math.random() * 0.1, 122 + Math.random() * 18);
    };

    runPair();
    const intervalId = window.setInterval(runPair, 1100);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-[55] h-full w-full"
      aria-hidden
    />
  );
};

const JACKPOT_CONFETTI_COLORS = [
  "#FFD700",
  "#FFF8DC",
  "#FFEC8B",
  "#FBBF24",
  "#F59E0B",
  "#FFFFFF",
  "#FDE047",
  "#FACC15",
  "#FEF3C7",
  "#E9D5FF",
  "#F472B6",
];

/** Jackpot: heavy confetti, disco beams from top, vignette; stops when modal closes. */
const JackpotCelebrationLayer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const fire = confetti.create(canvas, {
      resize: true,
      useWorker: true,
    });

    const burstFromTop = (x: number) => {
      void fire({
        disableForReducedMotion: true,
        particleCount: 56 + Math.floor(Math.random() * 34),
        angle: 90,
        spread: 62 + Math.random() * 28,
        startVelocity: 34 + Math.random() * 18,
        origin: {
          x: Math.min(0.94, Math.max(0.06, x)),
          y: -0.04,
        },
        colors: JACKPOT_CONFETTI_COLORS,
        ticks: 320 + Math.floor(Math.random() * 80),
        gravity: 0.95,
        scalar: 0.9 + Math.random() * 0.35,
        drift: (Math.random() - 0.5) * 0.2,
        shapes: ["circle", "square", "star"],
      });
    };

    const burstSides = () => {
      void fire({
        disableForReducedMotion: true,
        particleCount: 36 + Math.floor(Math.random() * 24),
        angle: 65,
        spread: 52,
        startVelocity: 48,
        origin: { x: 0.04, y: 0.72 },
        colors: JACKPOT_CONFETTI_COLORS,
        shapes: ["circle", "star"],
      });
      void fire({
        disableForReducedMotion: true,
        particleCount: 36 + Math.floor(Math.random() * 24),
        angle: 115,
        spread: 52,
        startVelocity: 48,
        origin: { x: 0.96, y: 0.72 },
        colors: JACKPOT_CONFETTI_COLORS,
        shapes: ["circle", "star"],
      });
    };

    const run = () => {
      burstFromTop(0.2 + Math.random() * 0.2);
      burstFromTop(0.4 + Math.random() * 0.2);
      burstFromTop(0.6 + Math.random() * 0.2);
      burstSides();
      if (Math.random() > 0.35) {
        burstSides();
      }
    };

    run();
    const intervalId = window.setInterval(run, 680);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-[72] h-full w-full"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[73] overflow-hidden"
        aria-hidden
      >
        <div className="jackpot-disco-rig absolute inset-0">
          {[8, 24, 40, 56, 72, 88].map((left, i) => {
            const delay = `${i * 0.26}s`;
            return (
              <div
                key={i}
                className="jackpot-spotlight-beam"
                style={{
                  left: `${left}%`,
                  animationDelay: delay,
                }}
              >
                <div
                  className="jackpot-spotlight-core"
                  style={{ animationDelay: delay }}
                />
              </div>
            );
          })}
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_56%_60%_at_50%_38%,rgba(255,248,220,0.22)_0%,rgba(255,223,128,0.08)_45%,rgba(255,255,255,0)_100%)]" />
      </div>
    </>
  );
};

const CONGRATULATIONS_LABEL = "Congratulations!";

const CongratulationsBanner = ({ tier }: { tier: "jackpot" | "near" }) => {
  return (
    <div className="congratulations-banner pointer-events-none flex w-full max-w-[min(100%,920px)] flex-col items-center px-2">
      <span className="sr-only">{CONGRATULATIONS_LABEL}</span>
      <div
        className={cn(
          "congratulations-ribbon relative overflow-hidden rounded-full border border-white/45 px-[clamp(1rem,4.5vw,2.5rem)] py-[clamp(0.4rem,1.5vw,0.75rem)] backdrop-blur-md",
          tier === "jackpot"
            ? "congratulations-ribbon--jackpot bg-gradient-to-br from-amber-300/35 via-white/18 to-yellow-500/25"
            : "congratulations-ribbon--near bg-gradient-to-br from-cyan-300/30 via-white/14 to-fuchsia-400/22",
        )}
        aria-hidden
      >
        <div
          className="congratulations-ribbon-shine pointer-events-none absolute inset-0 opacity-50"
          aria-hidden
        />
        <p
          className={cn(
            "relative text-center font-black uppercase tracking-[0.08em] sm:tracking-[0.14em]",
            tier === "jackpot"
              ? "congratulations-title-jackpot-wrap font-technology text-[clamp(1.15rem,4.9vw,2.85rem)] sm:tracking-[0.16em]"
              : "font-main text-[clamp(1rem,3.8vw,2.15rem)]",
          )}
        >
          {CONGRATULATIONS_LABEL.split("").map((char, index) => (
            <span
              key={`${index}-${char}`}
              className={cn(
                "congratulations-char",
                tier === "jackpot"
                  ? "congratulations-char--jackpot"
                  : "congratulations-char--near",
              )}
              style={{
                animationDelay: `${0.08 + index * 0.04}s`,
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </p>
      </div>
      <p
        className={cn(
          "mt-1.5 font-main text-[clamp(0.65rem,1.8vw,0.9rem)] font-medium uppercase tracking-[0.28em]",
          tier === "jackpot"
            ? "text-amber-100/88 [text-shadow:0_0_18px_rgba(250,204,21,0.45)]"
            : "text-white/75",
        )}
        aria-hidden
      >
        {"Ch\u00fac m\u1eebng b\u1ea1n"}
      </p>
    </div>
  );
};

const tryAgainSideColumnClass =
  "relative hidden max-h-[min(22rem,40vh)] w-[min(12rem,26vw)] shrink-0 overflow-visible sm:flex sm:flex-col sm:justify-end lg:w-[min(16rem,22vw)] xl:w-[min(20rem,20vw)]";

function App() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [timer, setTimer] = useState(0);
  const animationFrame = useRef<number | undefined>(undefined);
  const startTime = useRef<number | undefined>(undefined);
  const enterActionLockUntilRef = useRef(0);
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

  /** Prize sting per tier when result modal opens; once, no loop. Near: prize-2-1 then prize-2-2. */
  useEffect(() => {
    if (gameState !== "result") return;

    const { tier } = getPrizeTier(timer);
    let cancelled = false;

    const stopAudio = (a: HTMLAudioElement) => {
      a.pause();
      a.currentTime = 0;
    };

    if (tier === "jackpot") {
      const mainLoopAudio = new Audio(prizeJackpotSfx);
      mainLoopAudio.loop = true;
      mainLoopAudio.currentTime = 0;
      void mainLoopAudio.play().catch(() => {});

      const fireworkAudio = new Audio(prizeNear1Sfx);
      fireworkAudio.loop = false;
      const onFireworkPart1Ended = () => {
        if (cancelled) return;
        fireworkAudio.removeEventListener("ended", onFireworkPart1Ended);
        fireworkAudio.src = prizeNear2Sfx;
        fireworkAudio.load();
        fireworkAudio.loop = false;
        fireworkAudio.currentTime = 0;
        void fireworkAudio.play().catch(() => {});
      };

      fireworkAudio.addEventListener("ended", onFireworkPart1Ended);
      void fireworkAudio.play().catch(() => {});

      return () => {
        cancelled = true;
        fireworkAudio.removeEventListener("ended", onFireworkPart1Ended);
        stopAudio(mainLoopAudio);
        stopAudio(fireworkAudio);
      };
    }

    if (tier === "near") {
      const a = new Audio(prizeNear1Sfx);
      a.loop = false;
      const onFirstEnded = () => {
        if (cancelled) return;
        a.removeEventListener("ended", onFirstEnded);
        a.src = prizeNear2Sfx;
        a.load();
        a.loop = false;
        a.currentTime = 0;
        void a.play().catch(() => {});
      };
      a.addEventListener("ended", onFirstEnded);
      void a.play().catch(() => {});
      return () => {
        cancelled = true;
        a.removeEventListener("ended", onFirstEnded);
        stopAudio(a);
      };
    }

    const a = new Audio(prizeDefaultSfx);
    a.loop = false;
    void a.play().catch(() => {});
    return () => {
      stopAudio(a);
    };
  }, [gameState, timer]);

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

      const now = Date.now();
      if (now < enterActionLockUntilRef.current) return;

      if (gameState === "idle") {
        e.preventDefault();
        handleStart();
        return;
      }

      if (gameState === "running") {
        e.preventDefault();
        enterActionLockUntilRef.current = now + ENTER_ACTION_COOLDOWN_MS;
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
    <div
      className="fixed inset-0 h-dvh max-h-dvh w-screen overflow-hidden bg-[#00247F] bg-center bg-no-repeat bg-size-[94%]"
      style={{ backgroundImage: `url(${mainImg})` }}
    >
      <div className="absolute top-7.5 left-0 w-full h-full">
        <div className="flex items-center justify-between pointer-events-none">
          <img
            src={tenSecond}
            alt="10 Seconds"
            className="h-[clamp(40px,80px)] w-auto"
            draggable={false}
          />
          <img
            src={logo}
            alt="logo"
            className="h-[clamp(24px,4vh,40px)] w-auto pr-[clamp(12px,3vw,80px)] object-contain"
            draggable={false}
          />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 z-5 overflow-hidden">
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
      {/* <audio
        ref={clapAudioRef}
        className="hidden"
        preload="auto"
        src={clapMp3}
      /> */}

      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center">
        <div className="pointer-events-auto flex -translate-y-[max(50px,5vh)] flex-col items-center gap-[clamp(1rem,7vh,4rem)]">
          <p
            className="pt-6 font-technology leading-none tracking-tight text-white [text-shadow:2px_2px_8px_rgba(1,35,127,0.6)] [-webkit-text-stroke:1px_#DCFAFF]"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="sr-only">{formatSecondsDisplay(timer)}</span>
            <span
              className={cn(
                "inline-block origin-center text-[min(11.25rem,9.375vw)]",
                gameState !== "running" && "animate-time-heartbeat",
              )}
            >
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
              className={cn(
                "w-[min(310px,16.15vw)] h-[min(90px,8.33vh)] text-center text-[min(2.5rem,2.08vw)] font-bold uppercase leading-1 text-[#012A9E] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9DD7FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#00247F]",
                "z-10 cursor-pointer bg-white border-[3px] border-[#9DD7FF] rounded-[60px] shadow-[0_4px_18px_rgba(0,0,0,0.25)] hover:brightness-[0.98]",
              )}
            >
              Start
            </button>
          )}

          {gameState === "running" && (
            <button
              type="button"
              onClick={handleStopClick}
              className={cn(
                "w-[min(310px,16.15vw)] h-[min(90px,8.33vh)] text-center text-[min(2.5rem,2.08vw)] font-bold uppercase leading-[1.05] text-red-600 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#00247F]",
                "z-10 cursor-pointer bg-[#FFE8E8] border-[3px] border-[#FF9D9D] rounded-[60px] shadow-[0_4px_18px_rgba(0,0,0,0.25)] hover:brightness-[0.98]",
              )}
            >
              Stop
            </button>
          )}
        </div>
      </div>

      <div
        className="absolute -bottom-[2px] left-[min(80px,4.17vw)] right-[min(80px,4.17vw)] h-[min(476px,44.1vh)] rounded-tl-[40px] rounded-tr-[40px] p-[3px]"
        style={{
          background: "linear-gradient(180deg, #35A3EF 0%, #0039BB 100%)",
        }}
      >
        <div
          className="h-full w-full rounded-tl-[37px] rounded-tr-[37px] flex flex-col items-center justify-center pt-10"
          style={{ background: "#0129A1CC" }}
        >
          {/* <p className="text-white text-[min(1.875rem,1.5625vw)] font-main text-center">
            {gameState === "idle"
              ? "Hoặc nhấn ENTER để bắt đầu"
              : "Hoặc nhấn ENTER để dừng"}
          </p> */}
          <div className="flex items-center justify-center gap-[min(60px,3.125vw)]">
            <GiftGroup
              imageSrc={gift1Img}
              className="pt-[100px]"
              imageClassName="w-[400px] h-[150px]"
              label="Gấu/Quạt lụa"
              description="9.99 - 10.01"
            />
            <GiftGroup
              imageSrc={gift2Img}
              variant="jackpot"
              className="gap-4"
              imageClassName="w-[min(383px,19.95vw)] h-[250px]"
              label="Áo thun + Gấu + Ly giữ nhiệt"
              description="10.00"
            />
            <GiftGroup
              imageSrc={gift3Img}
              className="pt-[100px]"
              imageClassName="w-[400px] h-[150px]"
              label="Bút + Kẹo mút"
              description="Còn lại"
            />
          </div>
        </div>
      </div>

      {gameState === "result" && (
        <div
          className={cn(
            "animate-fadeIn fixed inset-0 z-50 flex items-center justify-center overflow-visible p-4",
            prizeTier?.tier === "jackpot"
              ? "bg-black/82 backdrop-blur-[4px]"
              : "bg-black/55 backdrop-blur-[2px]",
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="result-title"
        >
          {prizeTier?.tier === "jackpot" && <JackpotCelebrationLayer />}
          {prizeTier?.tier === "near" && <NearResultFireworks />}
          <div className="relative z-[60] flex w-full max-w-[min(100%,1550px)] flex-col items-center gap-4 px-1 sm:gap-5 sm:px-2">
            {(prizeTier?.tier === "jackpot" || prizeTier?.tier === "near") && (
              <CongratulationsBanner tier={prizeTier.tier} />
            )}
            <div className="flex w-full flex-row items-end justify-center gap-[clamp(0.25rem,2vw,1.5rem)]">
              {prizeTier?.tier === "default" && (
                <div
                  className={cn(tryAgainSideColumnClass, "sm:items-end")}
                  aria-hidden
                >
                  <TryAgainParticleBurst imageSrc={tryAgainImg} />
                  <img
                    src={tryAgainImg}
                    alt=""
                    draggable={false}
                    className="relative z-10 max-h-[min(22rem,40vh)] w-full shrink-0 origin-bottom scale-x-[-1] object-contain object-bottom -rotate-[8deg]"
                  />
                </div>
              )}
              <div
                className={cn(
                  "animate-scaleIn relative w-full min-w-0 overflow-visible",
                  prizeTier?.tier === "jackpot"
                    ? "jackpot-result-card-host max-w-[min(100%,820px)]"
                    : "max-w-[700px] rounded-[40px] bg-gradient-to-b from-[#35A3EF] to-[#0039BB] p-[4px] shadow-[0_8px_40px_rgba(0,0,0,0.45)]",
                )}
              >
                {prizeTier?.tier === "jackpot" && (
                  <div className="jackpot-card-spin-ring" aria-hidden />
                )}
                <div
                  className={cn(
                    "relative z-10 overflow-visible px-6 py-10 backdrop-blur-[18px] sm:px-10 sm:py-[60px] md:px-20",
                    prizeTier?.tier === "jackpot"
                      ? "jackpot-card-inner-premium m-[3px] rounded-[41px] ring-1 ring-amber-200/45"
                      : "rounded-[36px] bg-[rgba(1,41,161,0.8)]",
                  )}
                >
                  {prizeTier?.tier === "jackpot" && (
                    <>
                      <span
                        className="jackpot-card-corner jackpot-card-corner--tl"
                        aria-hidden
                      />
                      <span
                        className="jackpot-card-corner jackpot-card-corner--tr"
                        aria-hidden
                      />
                      <span
                        className="jackpot-card-corner jackpot-card-corner--bl"
                        aria-hidden
                      />
                      <span
                        className="jackpot-card-corner jackpot-card-corner--br"
                        aria-hidden
                      />
                      <div
                        className="pointer-events-none absolute inset-0 z-0 rounded-[41px] jackpot-card-radial-wash"
                        aria-hidden
                      />
                      <div
                        className="pointer-events-none absolute inset-0 z-0 rounded-[41px] jackpot-card-shimmer opacity-90"
                        aria-hidden
                      />
                    </>
                  )}
                  <div className="relative z-10 flex flex-col items-center gap-[30px] font-sans">
                    <h2 id="result-title" className="sr-only">
                      {prizeTier?.tier === "jackpot"
                        ? "Chúc mừng, bạn đã dừng đúng 10 giây"
                        : "Kết quả thử thách"}
                    </h2>
                    <div className="flex flex-col items-center gap-[30px] self-stretch">
                      <div className="flex flex-col items-center gap-[6px]">
                        {prizeTier?.tier === "jackpot" && (
                          <span
                            className="mb-2 flex items-center gap-2 rounded-full border border-amber-200/90 bg-gradient-to-r from-amber-500/45 via-yellow-400/25 to-amber-600/40 px-[clamp(0.85rem,3.2vw,1.4rem)] py-1.5 font-main text-[clamp(0.55rem,1.5vw,0.72rem)] font-black uppercase tracking-[0.38em] text-[#fffef5] shadow-[0_0_28px_rgba(250,204,21,0.5),inset_0_1px_0_rgba(255,255,255,0.35)]"
                            aria-hidden
                          >
                            <span className="text-[1.1em] leading-none text-amber-100 drop-shadow-[0_0_8px_rgba(250,204,21,0.9)]">
                              {"\u2726"}
                            </span>
                            Jackpot{" "}
                            <span className="text-[1.1em] leading-none text-amber-100 drop-shadow-[0_0_8px_rgba(250,204,21,0.9)]">
                              {"\u2726"}
                            </span>
                          </span>
                        )}
                        <p
                          className={cn(
                            "pb-6 text-center font-main text-3xl font-light leading-[0.87] [text-shadow:1px_2px_12px_rgba(0,0,0,0.25)]",
                            prizeTier?.tier === "jackpot"
                              ? "bg-gradient-to-b from-amber-50 to-amber-200/90 bg-clip-text text-transparent"
                              : "text-white",
                          )}
                        >
                          Bạn đạt được
                        </p>
                        <div
                          className="flex items-baseline justify-center gap-[6px]"
                          aria-live="polite"
                        >
                          <p
                            className={cn(
                              "font-technology text-[clamp(3.5rem,14vw,8.125rem)] leading-none",
                              prizeTier?.tier === "jackpot"
                                ? "[&>span>span]:bg-gradient-to-b [&>span>span]:from-[#fffef5] [&>span>span]:via-[#fef08a] [&>span>span]:to-[#ca8a04] [&>span>span]:bg-clip-text [&>span>span]:text-transparent [&>span>span]:drop-shadow-[0_4px_18px_rgba(250,204,21,0.5)] [&>span>span]:[-webkit-text-stroke:1px_rgba(180,83,9,0.28)]"
                                : "text-white [text-shadow:2px_2px_8px_rgba(1,35,127,0.6)] [-webkit-text-stroke:1px_#DCFAFF]",
                            )}
                          >
                            <FixedWidthTimeText
                              value={formatSecondsDisplay(timer)}
                            />
                          </p>
                          <span
                            className={cn(
                              "font-main text-[clamp(1.75rem,7vw,3.75rem)] font-medium uppercase leading-[0.87]",
                              prizeTier?.tier === "jackpot"
                                ? "text-amber-100 [text-shadow:0_0_16px_rgba(250,204,21,0.45),1px_2px_12px_rgba(0,0,0,0.35)]"
                                : "text-white [text-shadow:1px_2px_12px_rgba(0,0,0,0.25)]",
                            )}
                            aria-hidden
                          >
                            s
                          </span>
                        </div>
                      </div>
                      {prizeTier?.tier === "jackpot" ? (
                        <div
                          className="flex w-full items-center gap-3 px-3 sm:px-6"
                          aria-hidden
                        >
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300/85 to-amber-400/50 shadow-[0_0_12px_rgba(250,204,21,0.45)]" />
                          <div className="h-2.5 w-2.5 shrink-0 rotate-45 bg-gradient-to-br from-amber-100 via-yellow-300 to-amber-600 shadow-[0_0_14px_rgba(250,204,21,0.85)]" />
                          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-300/85 to-amber-400/50 shadow-[0_0_12px_rgba(250,204,21,0.45)]" />
                        </div>
                      ) : (
                        <div
                          className="w-full border-t border-dashed border-white/55"
                          aria-hidden
                        />
                      )}
                    </div>
                    <div className="flex w-full flex-col items-center gap-[50px]">
                      <div className="flex flex-col items-center gap-5">
                        {prizeTier && (
                          <>
                            <div
                              className={cn(
                                "mx-auto flex max-w-full shrink-0 justify-center",
                                prizeTier.tier === "jackpot" &&
                                  "jackpot-prize-glow jackpot-prize-pedestal relative",
                              )}
                              aria-hidden
                            >
                              <img
                                src={prizeTier.imageSrc}
                                alt=""
                                className={cn(
                                  "relative z-[1] h-[300px] w-auto max-w-full select-none object-contain",
                                  prizeTier.tier === "jackpot"
                                    ? "drop-shadow-[0_12px_36px_rgba(0,0,0,0.45),0_0_24px_rgba(250,204,21,0.25)]"
                                    : "drop-shadow-[0_6px_24px_rgba(0,0,0,0.35)]",
                                )}
                                draggable={false}
                              />
                            </div>
                            <p
                              className={cn(
                                "text-center text-[clamp(1.25rem,3.2vw,2.5rem)] font-medium leading-[1.3] text-white [text-shadow:1px_2px_12px_rgba(0,0,0,0.25)]",
                                prizeTier.tier === "jackpot" &&
                                  "font-semibold text-[#FFFEF0] [text-shadow:0_0_24px_rgba(250,204,21,0.55),0_2px_12px_rgba(0,0,0,0.45)]",
                              )}
                            >
                              {prizeTier.displayLabel}
                            </p>
                          </>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleReset}
                        className={cn(
                          "cursor-pointer flex min-h-[90px] w-full items-center justify-center rounded-[60px] border-[3px] border-[#9DD7FF] bg-white px-10 text-[clamp(1.25rem,3.2vw,2.5rem)] font-bold uppercase leading-[1.05] text-[#012A9E] shadow-[0_4px_18px_rgba(0,0,0,0.25)] transition hover:brightness-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9DD7FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(1,41,161,0.8)] font-main",
                          prizeTier?.tier === "jackpot" &&
                            "border-2 border-amber-200/90 bg-gradient-to-b from-[#fffef5] via-[#fef9c3] to-[#fde68a] font-black text-amber-950 shadow-[0_0_36px_rgba(250,204,21,0.55),0_6px_24px_rgba(0,0,0,0.35)] hover:brightness-[1.02] focus-visible:ring-amber-300",
                        )}
                      >
                        Chơi lại
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {prizeTier?.tier === "default" && (
                <div
                  className={cn(tryAgainSideColumnClass, "sm:items-start")}
                  aria-hidden
                >
                  <TryAgainParticleBurst imageSrc={tryAgainImg} />
                  <img
                    src={tryAgainImg}
                    alt=""
                    draggable={false}
                    className="relative z-10 max-h-[min(22rem,40vh)] w-full shrink-0 origin-bottom object-contain object-bottom rotate-[8deg]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
