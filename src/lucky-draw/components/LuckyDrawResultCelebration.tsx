// @ts-nocheck
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { PRIZE_IDS } from "../prizes";
import firstPrizeFinal from "../assets/1st-prize-final.svg";
import secondPrizeFinal from "../assets/2nd-prize-final.svg";
import thirdPrizeFinal from "../assets/3rd-prize.final.svg";
import {
  getLuckyDrawDigitSlotClassName,
  getLuckyDrawDigitTextStyle,
} from "../ticketDigitTheme";

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
        particleCount: 38 + Math.floor(Math.random() * 28),
        spread: 48 + Math.random() * 20,
        startVelocity: 36 + Math.random() * 16,
        angle,
        origin: {
          x: Math.min(0.97, Math.max(0.03, originX)),
          y: 0.86 + Math.random() * 0.11,
        },
        colors,
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
        particleCount: 32 + Math.floor(Math.random() * 24),
        angle: 90,
        spread: 52 + Math.random() * 22,
        startVelocity: 28 + Math.random() * 14,
        origin: {
          x: Math.min(0.94, Math.max(0.06, x)),
          y: -0.04,
        },
        colors: LD_JACKPOT_CONFETTI_COLORS,
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
        particleCount: 22 + Math.floor(Math.random() * 16),
        angle: 65,
        spread: 42,
        startVelocity: 42,
        origin: { x: 0.04, y: 0.72 },
        colors: LD_JACKPOT_CONFETTI_COLORS,
        shapes: ["circle", "star"],
      });
      void fire({
        disableForReducedMotion: true,
        particleCount: 22 + Math.floor(Math.random() * 16),
        angle: 115,
        spread: 42,
        startVelocity: 42,
        origin: { x: 0.96, y: 0.72 },
        colors: LD_JACKPOT_CONFETTI_COLORS,
        shapes: ["circle", "star"],
      });
    };

    const run = () => {
      burstFromTop(0.35 + Math.random() * 0.3);
      if (Math.random() > 0.55) burstSides();
    };

    run();
    const intervalId = window.setInterval(run, 980);

    return () => {
      window.clearInterval(intervalId);
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
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[112] overflow-hidden"
      aria-hidden
    >
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

  const prizeBlockClass =
    tier === "gold"
      ? "h-[360px] shrink-0 md:h-[400px]"
      : "h-[320px] shrink-0 md:h-[360px]";

  return (
    <div className="relative isolate flex w-full flex-col items-center gap-3 overflow-hidden rounded-[20px] md:gap-4 md:rounded-[24px]">
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
        initial={false}
        animate={prizeHidden ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.65, ease: prizeRevealEase }}
      >
        <ResultSpotlightFunnel tier={tier} />
      </motion.div>
      <div
        className={`relative flex w-full flex-col items-center justify-center gap-1 overflow-hidden ${prizeBlockClass}`}
      >
        <motion.img
          src={artSrc}
          alt={prizeName}
          className={`relative z-[1] w-full max-w-full flex-1 min-h-0 origin-center object-contain drop-shadow-[0_12px_32px_rgba(15,23,42,0.22)] ${
            tier === "gold"
              ? "max-h-[min(300px,52vh)] md:max-h-[min(340px,48vh)]"
              : "max-h-[min(260px,46vh)] md:max-h-[min(300px,44vh)]"
          }`}
          initial={false}
          animate={
            prizeHidden ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }
          }
          transition={prizeTransition}
        />
        <motion.p
          id="lucky-draw-result-label"
          className={`relative z-[1] shrink-0 text-center font-semibold uppercase tracking-[0.18em] md:tracking-[0.22em] ${
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
      <div
        className={`relative z-[1] flex w-full justify-center gap-2 sm:gap-3 md:gap-4 ${wide ? "max-w-none" : "max-w-[400px]"}`}
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
              className="select-none tabular-nums"
              style={getLuckyDrawDigitTextStyle({ tier, filled: true })}
            >
              {d}
            </span>
          </motion.div>
        ))}
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
