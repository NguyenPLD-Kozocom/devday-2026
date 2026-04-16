// @ts-nocheck
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { PRIZE_IDS } from "../prizes";
import prizeResultStinger1Url from "../assets/prize-1-1.mp3";
import prizeResultStinger2Url from "../assets/prize-1-2.mp3";
import prizeResultBackgroundGoldUrl from "../assets/prize-1-background.mp3";
import prizeResultBackgroundSilverUrl from "../assets/prize-2-background.mp3";
import prizeResultBackgroundBronzeUrl from "../assets/prize-3-background.mp3";
import firstPrizeFinal from "../assets/1st-prize-final.svg";
import secondPrizeFinal from "../assets/2nd-prize-final.svg";
import thirdPrizeFinal from "../assets/3rd-prize.final.svg";
import {
  getLuckyDrawDigitSlotClassName,
  getLuckyDrawDigitTextStyle,
} from "../ticketDigitTheme";
import { useSoundSettings } from "../SoundSettingsContext";

/** Transition cho layoutId ô số (vé bay → modal). */
export const ldResultDigitLayoutTransition = {
  layout: {
    type: "tween",
    duration: 1.28,
    ease: [0.16, 1, 0.22, 1],
  },
};

const prizeRevealEase = [0.22, 0.99, 0.2, 1];

const PRIZE_FINAL_ART = {
  [PRIZE_IDS.gold]: firstPrizeFinal,
  [PRIZE_IDS.silver]: secondPrizeFinal,
  [PRIZE_IDS.bronze]: thirdPrizeFinal,
};

const PRIZE_FINAL_ART_BY_LABEL = {
  "GIẢI VÀNG": firstPrizeFinal,
  "GIẢI BẠC": secondPrizeFinal,
  "GIẢI ĐỒNG": thirdPrizeFinal,
};

/** Cùng palette / hành vi `NearResultFireworks` trong ten-seconds/App.tsx */
const LD_NEAR_SILVER_COLORS = [
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

const LD_NEAR_BRONZE_COLORS = [
  "#FFE14A",
  "#fdba74",
  "#fb923c",
  "#fcd34d",
  "#fecaca",
  "#FF9F43",
  "#FFF8DC",
  "#fed7aa",
  "#f97316",
  "#FFFFFF",
];

const RESULT_LOOP_BACKGROUND_BY_TIER = {
  gold: prizeResultBackgroundGoldUrl,
  silver: prizeResultBackgroundSilverUrl,
  bronze: prizeResultBackgroundBronzeUrl,
};

/** Cùng palette `JACKPOT_CONFETTI_COLORS` trong ten-seconds/App.tsx */
const LD_JACKPOT_CONFETTI_COLORS = [
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

const LuckyDrawNearConfetti = ({ colors }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const fire = confetti.create(canvas, {
      resize: true,
      useWorker: true,
    });

    const burst = (originX, angle) => {
      void fire({
        disableForReducedMotion: true,
        particleCount: 62 + Math.floor(Math.random() * 38),
        spread: 52 + Math.random() * 26,
        startVelocity: 38 + Math.random() * 18,
        angle,
        origin: {
          x: Math.min(0.97, Math.max(0.03, originX)),
          y: 0.84 + Math.random() * 0.12,
        },
        colors,
        ticks: 300 + Math.floor(Math.random() * 100),
        gravity: 0.86,
        scalar: 0.88 + Math.random() * 0.32,
        drift: (Math.random() - 0.5) * 0.28,
        shapes: ["circle", "square"],
      });
    };

    const burstFan = (originX, baseAngle) => {
      burst(originX, baseAngle - 14 + Math.random() * 8);
      burst(originX + (Math.random() - 0.5) * 0.06, baseAngle + 10 + Math.random() * 8);
    };

    const burstSky = () => {
      void fire({
        disableForReducedMotion: true,
        particleCount: 48 + Math.floor(Math.random() * 32),
        angle: 90,
        spread: 68 + Math.random() * 18,
        startVelocity: 22 + Math.random() * 12,
        origin: {
          x: 0.35 + Math.random() * 0.3,
          y: 0.18 + Math.random() * 0.12,
        },
        colors,
        ticks: 280 + Math.floor(Math.random() * 90),
        gravity: 0.72,
        scalar: 0.75 + Math.random() * 0.25,
        drift: (Math.random() - 0.5) * 0.15,
        shapes: ["circle", "square"],
      });
    };

    let tick = 0;
    const runWave = () => {
      burstFan(0.07 + Math.random() * 0.12, 56 + Math.random() * 16);
      burstFan(0.8 + Math.random() * 0.12, 124 + Math.random() * 16);
      if (tick % 2 === 0) {
        burst(0.48 + (Math.random() - 0.5) * 0.08, 88 + Math.random() * 12);
      }
      if (tick % 3 === 0) burstSky();
      tick += 1;
    };

    runWave();
    const intervalId = window.setInterval(runWave, 720);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [colors]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
      aria-hidden
    />
  );
};

const LuckyDrawJackpotConfetti = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const fire = confetti.create(canvas, {
      resize: true,
      useWorker: true,
    });

    const burstFromTop = (x) => {
      void fire({
        disableForReducedMotion: true,
        particleCount: 58 + Math.floor(Math.random() * 42),
        angle: 90,
        spread: 58 + Math.random() * 28,
        startVelocity: 32 + Math.random() * 18,
        origin: {
          x: Math.min(0.94, Math.max(0.06, x)),
          y: -0.06,
        },
        colors: LD_JACKPOT_CONFETTI_COLORS,
        ticks: 380 + Math.floor(Math.random() * 120),
        gravity: 0.92,
        scalar: 0.95 + Math.random() * 0.45,
        drift: (Math.random() - 0.5) * 0.22,
        shapes: ["circle", "square", "star"],
      });
    };

    const burstSides = () => {
      void fire({
        disableForReducedMotion: true,
        particleCount: 38 + Math.floor(Math.random() * 26),
        angle: 62,
        spread: 48 + Math.random() * 12,
        startVelocity: 46 + Math.random() * 12,
        origin: { x: 0.02, y: 0.68 + Math.random() * 0.08 },
        colors: LD_JACKPOT_CONFETTI_COLORS,
        ticks: 340 + Math.floor(Math.random() * 80),
        shapes: ["circle", "square", "star"],
      });
      void fire({
        disableForReducedMotion: true,
        particleCount: 38 + Math.floor(Math.random() * 26),
        angle: 118,
        spread: 48 + Math.random() * 12,
        startVelocity: 46 + Math.random() * 12,
        origin: { x: 0.98, y: 0.68 + Math.random() * 0.08 },
        colors: LD_JACKPOT_CONFETTI_COLORS,
        ticks: 340 + Math.floor(Math.random() * 80),
        shapes: ["circle", "square", "star"],
      });
    };

    const burstCoronation = () => {
      void fire({
        disableForReducedMotion: true,
        particleCount: 110 + Math.floor(Math.random() * 50),
        spread: 360,
        startVelocity: 28 + Math.random() * 12,
        origin: { x: 0.5, y: 0.42 },
        colors: LD_JACKPOT_CONFETTI_COLORS,
        ticks: 420 + Math.floor(Math.random() * 100),
        gravity: 0.65,
        scalar: 1.05 + Math.random() * 0.35,
        drift: (Math.random() - 0.5) * 0.08,
        shapes: ["circle", "star"],
      });
    };

    const burstGoldenArc = () => {
      void fire({
        disableForReducedMotion: true,
        particleCount: 72 + Math.floor(Math.random() * 36),
        angle: 270,
        spread: 42 + Math.random() * 16,
        startVelocity: 38 + Math.random() * 14,
        origin: { x: 0.5, y: 0.92 },
        colors: LD_JACKPOT_CONFETTI_COLORS,
        ticks: 360 + Math.floor(Math.random() * 90),
        gravity: 0.55,
        scalar: 1.1 + Math.random() * 0.3,
        shapes: ["star", "square"],
      });
    };

    const timeoutIds = [];

    const openingSalvo = () => {
      burstCoronation();
      burstFromTop(0.22);
      burstFromTop(0.78);
      timeoutIds.push(
        window.setTimeout(() => {
          burstSides();
          burstGoldenArc();
        }, 140),
      );
      timeoutIds.push(
        window.setTimeout(() => {
          void fire({
            disableForReducedMotion: true,
            particleCount: 85 + Math.floor(Math.random() * 40),
            angle: 90,
            spread: 70,
            startVelocity: 48,
            origin: { x: 0.5, y: 0.05 },
            colors: LD_JACKPOT_CONFETTI_COLORS,
            ticks: 400,
            gravity: 1,
            scalar: 1.15,
            shapes: ["circle", "square", "star"],
          });
        }, 280),
      );
    };

    openingSalvo();

    let pulse = 0;
    const run = () => {
      burstFromTop(0.12 + Math.random() * 0.76);
      if (pulse % 2 === 0) burstFromTop(0.18 + Math.random() * 0.64);
      burstSides();
      if (pulse % 3 === 0) burstGoldenArc();
      if (pulse % 4 === 0) burstCoronation();
      pulse += 1;
    };

    run();
    const intervalId = window.setInterval(run, 520);

    return () => {
      window.clearInterval(intervalId);
      timeoutIds.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
      aria-hidden
    />
  );
};

/**
 * `prize-1-1` → `prize-1-2` tuần tự; nhạc nền theo hạng (lặp).
 * Nhạc nền app đã tắt ở PrizeDetailScreen trong suốt màn kết quả.
 * @param {{ soundEnabled: boolean, looperBackgroundSrc: string }} props
 */
const LuckyDrawResultStingerSfx = ({ soundEnabled, looperBackgroundSrc }) => {
  useEffect(() => {
    if (!soundEnabled) return;

    const bg = new Audio(looperBackgroundSrc);
    bg.loop = true;
    bg.volume = 0.42;
    void bg.play().catch(() => {});

    const audio1 = new Audio(prizeResultStinger1Url);
    const audio2 = new Audio(prizeResultStinger2Url);
    audio1.volume = 0.88;
    audio2.volume = 0.88;

    const handleAudio1Ended = () => {
      audio1.removeEventListener("ended", handleAudio1Ended);
      void audio2.play().catch(() => {});
    };

    audio1.addEventListener("ended", handleAudio1Ended);
    void audio1.play().catch(() => {
      audio1.removeEventListener("ended", handleAudio1Ended);
    });

    return () => {
      audio1.removeEventListener("ended", handleAudio1Ended);
      bg.pause();
      bg.currentTime = 0;
      audio1.pause();
      audio1.currentTime = 0;
      audio2.pause();
      audio2.currentTime = 0;
    };
  }, [soundEnabled, looperBackgroundSrc]);

  return null;
};

const DiscoLights = () => (
  <div
    className="pointer-events-none absolute inset-0 overflow-hidden"
    aria-hidden
  >
    <div
      className="ld-disco-layer"
      style={{
        background:
          "conic-gradient(from 0deg, transparent 0deg, rgba(255,80,180,0.42) 42deg, transparent 82deg, rgba(0,255,255,0.38) 122deg, transparent 162deg, rgba(255,235,80,0.48) 202deg, transparent 242deg, rgba(180,100,255,0.36) 282deg, transparent 322deg)",
      }}
    />
  </div>
);

const funnelGradientByTier = {
  gold: "linear-gradient(to top, rgba(255,232,160,0.62) 0%, rgba(255,248,220,0.22) 38%, rgba(255,255,255,0.06) 58%, transparent 78%)",
  silver:
    "linear-gradient(to top, rgba(226,232,240,0.58) 0%, rgba(241,245,249,0.2) 40%, rgba(255,255,255,0.05) 58%, transparent 78%)",
  bronze:
    "linear-gradient(to top, rgba(254,215,170,0.55) 0%, rgba(255,237,213,0.18) 40%, rgba(255,250,245,0.05) 58%, transparent 78%)",
};

const ResultSpotlightFunnel = ({ tier }) => {
  const gradient = funnelGradientByTier[tier] ?? funnelGradientByTier.silver;
  const glowBg =
    tier === "gold"
      ? "radial-gradient(ellipse, rgba(253,224,71,0.32) 0%, rgba(255,255,255,0.08) 48%, transparent 72%)"
      : tier === "silver"
        ? "radial-gradient(ellipse, rgba(226,232,240,0.34) 0%, rgba(147,197,253,0.1) 48%, transparent 72%)"
        : "radial-gradient(ellipse, rgba(251,146,60,0.28) 0%, rgba(254,243,199,0.1) 48%, transparent 72%)";
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
      aria-hidden
    >
      <div
        className="ld-result-funnel-fill absolute left-1/2 bottom-[-6%] h-[92%] w-[min(190%,560px)] max-w-[200vw] -translate-x-1/2"
        style={{
          clipPath: "polygon(5% 100%, 50% 2%, 95% 100%)",
          background: gradient,
        }}
      />
      <div
        className="ld-result-funnel-glow absolute bottom-[-14%] h-[38%] w-[min(120%,400px)] rounded-[100%] opacity-50 [filter:blur(12px)]"
        style={{ background: glowBg }}
      />
      <div
        className="absolute left-1/2 top-[8%] h-[16%] w-[min(50%,220px)] -translate-x-1/2 rounded-[100%] opacity-40 [filter:blur(10px)]"
        style={{
          background:
            "radial-gradient(ellipse, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.06) 55%, transparent 70%)",
        }}
      />
    </div>
  );
};

/** @param {{ prizeId: string, digits: number[] }} props */
export const getResultTier = (prizeId) =>
  prizeId === PRIZE_IDS.gold
    ? "gold"
    : prizeId === PRIZE_IDS.silver
      ? "silver"
      : "bronze";

/**
 * Fireworks + disco overlay (no scrim). Keep z-index below the ticket card.
 * @param {{ prizeId: string }} props
 */
export const LuckyDrawResultEffects = ({ prizeId }) => {
  const tier = getResultTier(prizeId);
  const { soundEnabled } = useSoundSettings();
  const looperBackgroundSrc = RESULT_LOOP_BACKGROUND_BY_TIER[tier];
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[112] overflow-hidden"
      aria-hidden
    >
      <LuckyDrawResultStingerSfx
        soundEnabled={soundEnabled}
        looperBackgroundSrc={looperBackgroundSrc}
      />
      {tier === "gold" && (
        <>
          <DiscoLights />
          <LuckyDrawJackpotConfetti />
        </>
      )}
      {tier === "silver" && (
        <LuckyDrawNearConfetti colors={LD_NEAR_SILVER_COLORS} />
      )}
      {tier === "bronze" && (
        <LuckyDrawNearConfetti colors={LD_NEAR_BRONZE_COLORS} />
      )}
    </div>
  );
};

/**
 * Nội dung rộng trong TicketWhiteSurface (ảnh giải + funnel + label + 3 số).
 * @param {{ prizeId: string, digits: number[], prizeLabel: string, prizeName: string, wide?: boolean, revealPrize?: boolean, digitSlotRefs?: React.MutableRefObject<(HTMLElement | null)[]> | null }} props
 */
export const LuckyDrawExpandedTicketContent = ({
  prizeId,
  digits,
  prizeLabel,
  prizeName,
  wide = true,
  revealPrize = true,
  digitSlotRefs = null,
}) => {
  const tier = getResultTier(prizeId);
  const normalizedPrizeLabel = String(prizeLabel ?? "")
    .trim()
    .toUpperCase();
  const artSrc =
    PRIZE_FINAL_ART_BY_LABEL[normalizedPrizeLabel] ??
    PRIZE_FINAL_ART[prizeId] ??
    PRIZE_FINAL_ART[PRIZE_IDS.silver];

  const prizeHidden = !revealPrize;
  const prizeTransition = {
    duration: 4,
    ease: prizeRevealEase,
  };

  /** Khung dialog giống giải vàng cho cả ba hạng. */
  const prizeBlockClass = "h-[min(336px,56vh)] shrink-0 md:h-[min(392px,50vh)]";
  const prizeArtMaxHClass =
    "max-h-[min(600px,72vh)] md:max-h-[min(640px,58vh)]";
  const isBronze = tier === "bronze";
  const isSilver = tier === "silver";
  const prizeArtRevealScale = isBronze ? 1.5 : isSilver ? 0.8 : 1.2;
  const prizeBlockOverflow = isBronze ? "overflow-visible" : "overflow-hidden";
  const rootOverflow = isBronze ? "overflow-visible" : "overflow-hidden";

  return (
    <div
      className={`relative isolate flex w-full flex-col items-center gap-4 ${rootOverflow} rounded-[20px] md:gap-5 md:rounded-[24px]`}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
        initial={false}
        animate={prizeHidden ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.65, ease: prizeRevealEase }}
      >
        <ResultSpotlightFunnel tier={tier} />
      </motion.div>
      <div className="relative z-[1] flex w-full items-center justify-between gap-4 md:gap-6">
        <div
          className={`flex flex-1 justify-start gap-3 sm:gap-4 md:gap-5 ${wide ? "max-w-none" : "max-w-[400px]"}`}
          role="group"
          aria-label="Ba chữ số kết quả"
        >
          {digits.map((d, i) => (
            <motion.div
              key={i}
              ref={(el) => {
                if (digitSlotRefs) digitSlotRefs.current[i] = el;
              }}
              layout
              layoutId={`ld-result-digit-${prizeId}-${i}`}
              transition={ldResultDigitLayoutTransition}
              className={getLuckyDrawDigitSlotClassName({
                tier,
                filled: true,
              })}
            >
              <span
                className="flex h-full w-full items-center justify-center select-none tabular-nums leading-none"
                style={getLuckyDrawDigitTextStyle({
                  tier,
                  filled: true,
                })}
              >
                <span className="block leading-none translate-y-[2px]">
                  {d}
                </span>
              </span>
            </motion.div>
          ))}
        </div>
        <div
          className={`relative flex flex-1 flex-col items-center justify-center gap-1 ${prizeBlockOverflow} ${prizeBlockClass}`}
        >
          <motion.img
            src={artSrc}
            alt={prizeName}
            className={`relative z-[1] w-full max-w-full flex-1 min-h-0 origin-center object-contain drop-shadow-[0_12px_32px_rgba(15,23,42,0.22)] ${prizeArtMaxHClass}`}
            initial={false}
            animate={
              prizeHidden
                ? { opacity: 0, scale: 0 }
                : { opacity: 1, scale: prizeArtRevealScale }
            }
            transition={prizeTransition}
          />
          <motion.p
            id="lucky-draw-result-label"
            className={`relative z-[1] shrink-0 text-center font-semibold uppercase leading-tight tracking-[0.16em] md:tracking-[0.2em] ${
              tier === "gold"
                ? "text-sm text-amber-900/90 md:text-base"
                : tier === "silver"
                  ? "text-xs text-slate-700 md:text-sm"
                  : "text-xs text-amber-950/85 md:text-sm"
            }`}
            initial={false}
            animate={
              prizeHidden ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }
            }
            transition={{
              ...prizeTransition,
              delay: prizeHidden ? 0 : 0.14,
            }}
          >
            {prizeLabel}
          </motion.p>
        </div>
      </div>
    </div>
  );
};

/** Viền / shadow theo hạng — bọc ngoài TicketWhiteSurface khi đã land. */
export const luckyDrawLandedCardShellClass = (prizeId) => {
  const tier = getResultTier(prizeId);
  if (tier === "gold") {
    return "rounded-[28px] border-2 border-amber-200/95 bg-slate-950/20 p-1.5 shadow-[0_0_100px_rgba(251,191,36,0.5),0_30px_90px_rgba(0,0,0,0.55)] ring-4 ring-amber-400/35 md:rounded-[32px] md:p-2";
  }
  if (tier === "silver") {
    return "rounded-2xl border border-slate-300/55 bg-slate-950/20 p-1.5 shadow-[0_0_52px_rgba(148,163,184,0.38),0_20px_60px_rgba(0,0,0,0.45)] md:rounded-3xl md:p-2";
  }
  return "rounded-2xl border border-amber-800/45 bg-slate-950/20 p-1.5 shadow-[0_0_44px_rgba(180,83,9,0.32),0_20px_55px_rgba(0,0,0,0.42)] md:rounded-3xl md:p-2";
};
