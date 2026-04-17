import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import VerticalReel from "./VerticalReel";
import Confetti from "./Confetti";
import spinSfx1Url from "../assets/spin-1.mp4";
import spinSfx2Url from "../assets/spin-2.mp4";
import spinSfx3Url from "../assets/spin-3.mp3";
import tadaSfxUrl from "../assets/tada.mp3";
import wheelSpinningSfxUrl from "../assets/wheel-spinning.wav";
import { useSfxOverlayWhile, useSoundSettings } from "../SoundSettingsContext";
import {
  getLuckyDrawBoardDigitStyle,
  getLuckyDrawSideBoardSlotClassName,
} from "../ticketDigitTheme";

type ResultTier = "gold" | "silver" | "bronze";

const SPIN_SFX_BY_TIER: Record<ResultTier, string> = {
  gold: spinSfx1Url,
  silver: spinSfx2Url,
  bronze: spinSfx3Url,
};

/** Bay lên + phóng to tại ô quay (giây), sau đó bay chậm vào ô kết quả */
const FLY_RISE_DURATION_SEC = 4;
const FLY_TO_SLOT_DURATION_SEC = 2.5;
const FLY_DIGIT_DURATION_SEC = FLY_RISE_DURATION_SEC + FLY_TO_SLOT_DURATION_SEC;
const FLY_T_RISE = FLY_RISE_DURATION_SEC / FLY_DIGIT_DURATION_SEC;

/** Khớp số ô spin (VerticalReel — span giữa khi locked) */
const REEL_DIGIT_FONT_SIZE = (compact: boolean) =>
  compact ? "clamp(124px, 24vw, 176px)" : "clamp(152px, 22vw, 216px)";
const REEL_DIGIT_TEXT_SHADOW = "0 1px 0 rgba(0,0,0,0.28)";

type FlyPosPayload = {
  from: { x: number; y: number };
  to: { x: number; y: number };
  digit: number;
  roundIndex: number;
};

type LandedPulse = { x: number; y: number; digit: number };

/** Số đang hiển thị tại ô giữa reel (ưu tiên DOM = đúng pixel đang thấy) */
const parseDigitFromReelEl = (el: Element | null | undefined) => {
  const raw = el?.textContent ?? "";
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 0) return null;
  const n = parseInt(digits[digits.length - 1], 10);
  if (Number.isFinite(n) && n >= 0 && n <= 9) return n;
  return null;
};

interface SlotMachineProps {
  compact?: boolean;
  /** Giới hạn trên khi quay (0…N); chỉ ô kết quả đầu tiên; hai ô sau luôn 0–9. */
  maxSpinDigit?: number;
  /** Màu 3 ô “Kết quả” theo hạng giải đang chơi. */
  resultTier?: ResultTier;
  boardSlotRefs?: React.MutableRefObject<(HTMLDivElement | null)[]> | null;
  onBoardStateChange?:
    | ((state: { board: (number | null)[]; results: number[] }) => void)
    | null;
}

/**
 * SlotMachine — Mỗi lượt quay cần kéo cần một lần (3 lần kéo = 3 lượt).
 * Optional `boardSlotRefs`: ô đích để đo vị trí bay (ví dụ vé trắng ở PrizeDetailScreen).
 * `onBoardStateChange`: đồng bộ board/results ra parent khi dùng refs ngoài.
 *
 * Phases: idle → spinning → flying → idle → … → celebration → idle
 */
export default function SlotMachine({
  compact = false,
  maxSpinDigit = 9,
  resultTier = "gold",
  boardSlotRefs: externalBoardSlotRefs = null,
  onBoardStateChange = null,
}: SlotMachineProps) {
  const MotionDiv = motion.div;
  const [phase, setPhase] = useState<
    "idle" | "spinning" | "flying" | "celebration"
  >("idle");
  const [roundIndex, setRoundIndex] = useState(0);
  const [spinKey, setSpinKey] = useState(0);
  const [results, setResults] = useState<number[]>([0, 0, 0]);
  const [idleDigit, setIdleDigit] = useState(0);
  const [board, setBoard] = useState<(number | null)[]>([null, null, null]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [flyPos, setFlyPos] = useState<FlyPosPayload | null>(null);
  const [landedPulse, setLandedPulse] = useState<LandedPulse | null>(null);
  const [reelSpinFromDigit, setReelSpinFromDigit] = useState<number | null>(
    null,
  );
  const [reelIdleShowsDigit, setReelIdleShowsDigit] = useState(true);
  const reelWrapRef = useRef<HTMLDivElement | null>(null);
  const internalBoardRefs = useRef<(HTMLDivElement | null)[]>([
    null,
    null,
    null,
  ]);
  const boardRefs = externalBoardSlotRefs ?? internalBoardRefs;
  const showInlineBoard = !externalBoardSlotRefs;
  const safeMaxSpinDigit = Math.max(0, Math.min(9, maxSpinDigit));
  const reelMaxDigit = roundIndex === 0 ? safeMaxSpinDigit : 9;
  const spinDoneRef = useRef(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const resultsRef = useRef(results);
  const flyPayloadRef = useRef<FlyPosPayload | null>(null);
  const spinAudioRef = useRef<HTMLAudioElement | null>(null);
  const tadaAudioRef = useRef<HTMLAudioElement | null>(null);
  const tickAudioRef = useRef<HTMLAudioElement | null>(null);
  const tadaPlayedForFlyKeyRef = useRef<string | null>(null);
  const { soundEnabled } = useSoundSettings();
  useSfxOverlayWhile(phase === "spinning" && soundEnabled);

  useLayoutEffect(() => {
    resultsRef.current = results;
  }, [results]);

  useEffect(() => {
    return () => {
      const a = spinAudioRef.current;
      if (a) {
        a.pause();
        a.currentTime = 0;
      }
      const t = tadaAudioRef.current;
      if (t) {
        t.pause();
        t.currentTime = 0;
      }
      const w = tickAudioRef.current;
      if (w) {
        w.pause();
        w.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    if (!flyPos || !soundEnabled) return;
    const flyKey = `${spinKey}-${flyPos.roundIndex}`;
    if (tadaPlayedForFlyKeyRef.current === flyKey) return;
    tadaPlayedForFlyKeyRef.current = flyKey;

    if (!tadaAudioRef.current) {
      const created = new Audio(tadaSfxUrl);
      created.loop = false;
      tadaAudioRef.current = created;
    }
    const tada = tadaAudioRef.current;
    if (!tada) return;
    tada.currentTime = 0;
    void tada.play().catch(() => {});
  }, [flyPos, soundEnabled, spinKey]);

  useEffect(() => {
    if (phase === "spinning") return;
    const a = spinAudioRef.current;
    if (!a) return;
    a.pause();
    a.currentTime = 0;
    const w = tickAudioRef.current;
    if (w) {
      w.pause();
      w.currentTime = 0;
    }
  }, [phase]);

  useEffect(() => {
    const a = spinAudioRef.current;
    if (!a) return;
    if (soundEnabled && phase === "spinning") {
      void a.play().catch(() => {});
    } else {
      a.pause();
    }
    const w = tickAudioRef.current;
    if (!w) return;
    if (soundEnabled && phase === "spinning") {
      void w.play().catch(() => {});
    } else {
      w.pause();
    }
  }, [soundEnabled, phase]);

  useEffect(() => {
    onBoardStateChange?.({ board, results });
  }, [board, results, onBoardStateChange]);

  useEffect(() => {
    return () => timeoutsRef.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!landedPulse) return;
    const timer = setTimeout(() => setLandedPulse(null), 320);
    return () => clearTimeout(timer);
  }, [landedPulse]);

  useEffect(() => {
    if (phase === "spinning") spinDoneRef.current = false;
  }, [phase, spinKey]);

  useEffect(() => {
    if (phase !== "idle") return;
    queueMicrotask(() => setReelSpinFromDigit(null));
  }, [phase]);

  useEffect(() => {
    setPhase("idle");
    setRoundIndex(0);
    setSpinKey((k) => k + 1);
    setResults([0, 0, 0]);
    setIdleDigit(0);
    setBoard([null, null, null]);
    setShowConfetti(false);
    setFlyPos(null);
    setLandedPulse(null);
    setReelSpinFromDigit(null);
    setReelIdleShowsDigit(true);
    spinDoneRef.current = false;
    flyPayloadRef.current = null;
  }, [safeMaxSpinDigit]);

  const completeRoundAfterDigit = useCallback(
    (ri: number, digitOverride?: number | null) => {
      const val =
        digitOverride !== undefined && digitOverride !== null
          ? digitOverride
          : resultsRef.current[ri];
      setIdleDigit(val);
      setBoard((prev) => {
        const next = [...prev];
        next[ri] = val;
        return next;
      });
      setResults((prev) => {
        if (prev[ri] === val) return prev;
        const next = [...prev];
        next[ri] = val;
        return next;
      });
      setReelIdleShowsDigit(false);
      if (ri < 2) {
        setRoundIndex(ri + 1);
        setPhase("idle");
      } else {
        setPhase("celebration");
        setShowConfetti(true);
      }
    },
    [],
  );

  useLayoutEffect(() => {
    if (phase !== "flying") {
      flyPayloadRef.current = null;
      return;
    }
    let raf1 = 0;
    let raf2 = 0;
    const measure = () => {
      const wrap = reelWrapRef.current;
      const reelEl = wrap?.querySelector("[data-reel-digit]");
      const slotEl = boardRefs.current[roundIndex];
      if (!reelEl || !slotEl) return false;
      const a = reelEl.getBoundingClientRect();
      const b = slotEl.getBoundingClientRect();
      const fromState = resultsRef.current[roundIndex];
      const digitFromDom = parseDigitFromReelEl(reelEl);
      const digit = digitFromDom !== null ? digitFromDom : fromState;
      const payload = {
        from: { x: a.left + a.width / 2, y: a.top + a.height / 2 },
        to: { x: b.left + b.width / 2, y: b.top + b.height / 2 },
        digit,
        roundIndex,
      };
      flyPayloadRef.current = payload;
      setFlyPos(payload);
      return true;
    };
    raf1 = requestAnimationFrame(() => {
      if (measure()) return;
      raf2 = requestAnimationFrame(() => {
        if (measure()) return;
        flyPayloadRef.current = null;
        setFlyPos(null);
        completeRoundAfterDigit(roundIndex);
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [phase, roundIndex, completeRoundAfterDigit, boardRefs]);

  useEffect(() => {
    if (phase !== "celebration") return;
    /** Màn vé (external board): giữ kết quả, chỉ về idle để kéo cần được bật lại */
    if (externalBoardSlotRefs) {
      const id = window.setTimeout(() => setPhase("idle"), 0);
      return () => clearTimeout(id);
    }
    const t = setTimeout(() => {
      setPhase("idle");
      setBoard([null, null, null]);
      setIdleDigit(0);
      setRoundIndex(0);
      setShowConfetti(false);
      setReelIdleShowsDigit(true);
    }, 5200);
    return () => clearTimeout(t);
  }, [phase, externalBoardSlotRefs]);

  const handleSpinComplete = useCallback(() => {
    if (spinDoneRef.current) return;
    spinDoneRef.current = true;
    setFlyPos(null);
    setPhase("flying");
  }, []);

  const handleFlyAnimationComplete = useCallback(() => {
    const payload = flyPayloadRef.current;
    if (!payload) return;
    flyPayloadRef.current = null;
    setFlyPos(null);
    setLandedPulse({
      x: payload.to.x,
      y: payload.to.y,
      digit: payload.digit,
    });
    completeRoundAfterDigit(payload.roundIndex, payload.digit);
  }, [completeRoundAfterDigit]);

  const handlePull = useCallback(() => {
    if (phase !== "idle") return;

    const digitShownOnReel = idleDigit;

    const isNewGame = board.every((b) => b === null);

    if (isNewGame) {
      setIdleDigit(0);
      setResults([
        Math.floor(Math.random() * (safeMaxSpinDigit + 1)),
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10),
      ]);
      setRoundIndex(0);
      setShowConfetti(false);
      setReelIdleShowsDigit(true);
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    }

    setFlyPos(null);
    setReelSpinFromDigit(digitShownOnReel);
    setSpinKey((k) => k + 1);
    setPhase("spinning");

    if (!spinAudioRef.current) {
      const created = new Audio();
      created.loop = true;
      spinAudioRef.current = created;
    }
    const spin = spinAudioRef.current;
    if (!spin) return;
    const nextSrc = SPIN_SFX_BY_TIER[resultTier];
    if (spin.getAttribute("data-spin-src") !== nextSrc) {
      spin.setAttribute("data-spin-src", nextSrc);
      spin.src = nextSrc;
      spin.load();
    }
    spin.currentTime = 0;
    if (soundEnabled) {
      void spin.play().catch(() => {});
    }

    // Start wheel-spinning sound looping in parallel with the BGM
    if (!tickAudioRef.current) {
      const wheel = new Audio(wheelSpinningSfxUrl);
      wheel.loop = true;
      tickAudioRef.current = wheel;
    }
    const wheel = tickAudioRef.current;
    wheel.currentTime = 0;
    if (soundEnabled) {
      void wheel.play().catch(() => {});
    }
  }, [phase, board, idleDigit, soundEnabled, safeMaxSpinDigit, resultTier]);

  const reelMode =
    phase === "spinning" ? "spinning" : phase === "flying" ? "locked" : "idle";

  const isCelebration = phase === "celebration";

  const flyDigitRisePx = compact ? 100 : 140;

  return (
    <div
      className={`relative flex flex-row w-full items-center justify-center ${
        compact
          ? showInlineBoard
            ? "max-w-[520px] flex-col gap-5 px-0 sm:flex-row sm:gap-6 md:max-w-none md:gap-8"
            : "w-full max-w-[620px] flex-row items-center justify-center gap-8"
          : "max-w-[1800px] flex-row gap-8 px-8 md:gap-16 md:px-14"
      }`}
    >
      {showInlineBoard && (
        <div
          className={`relative z-10 flex shrink-0 flex-col items-center ${
            compact ? "gap-2" : "gap-3 md:gap-4"
          }`}
          aria-label="Bảng kết quả ba chữ số"
        >
          <p
            className={`font-semibold uppercase tracking-[0.18em] text-white/75 ${
              compact ? "text-[9px] md:text-[10px]" : "text-[10px] md:text-xs"
            }`}
          >
            Kết quả
          </p>
          <div className={`flex flex-col ${compact ? "gap-1.5" : "gap-2"}`}>
            {[0, 1, 2].map((i) => {
              const filled = board[i] !== null;
              return (
                <div
                  key={i}
                  ref={(el) => {
                    boardRefs.current[i] = el;
                  }}
                  className={getLuckyDrawSideBoardSlotClassName({
                    tier: resultTier,
                    filled,
                    compact,
                  })}
                >
                  <span
                    className="select-none"
                    style={getLuckyDrawBoardDigitStyle({
                      tier: resultTier,
                      filled,
                      compact,
                    })}
                  >
                    {filled ? board[i] : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div ref={reelWrapRef}>
        <VerticalReel
          spinKey={spinKey}
          targetValue={results[roundIndex]}
          maxDigit={reelMaxDigit}
          idleValue={idleDigit}
          spinFromDigit={reelSpinFromDigit}
          mode={reelMode}
          compact={compact}
          idleCenterEmpty={phase === "idle" && !reelIdleShowsDigit}
          hideCenterDigit={phase === "flying" && flyPos != null}
          onPull={handlePull}
          pullDisabled={phase !== "idle"}
          onSpinComplete={handleSpinComplete}
        />
      </div>

      <AnimatePresence>
        {flyPos && (
          <MotionDiv
            key={`fly-${spinKey}-${flyPos.roundIndex}`}
            className="pointer-events-none fixed z-[60] flex select-none items-center justify-center"
            style={{
              left: flyPos.from.x,
              top: flyPos.from.y,
              translateX: "-50%",
              translateY: "-50%",
            }}
            initial={{
              left: flyPos.from.x,
              top: flyPos.from.y,
              opacity: 1,
            }}
            animate={{
              left: [flyPos.from.x, flyPos.from.x, flyPos.to.x],
              top: [flyPos.from.y, flyPos.from.y - flyDigitRisePx, flyPos.to.y],
              opacity: 1,
            }}
            transition={{
              duration: FLY_DIGIT_DURATION_SEC,
              times: [0, FLY_T_RISE, 1],
              ease: [
                [0.42, 0, 0.58, 1],
                [0.25, 0.1, 0.25, 1],
              ],
            }}
            exit={{ opacity: 1, transition: { duration: 0 } }}
            onAnimationComplete={handleFlyAnimationComplete}
          >
            <MotionDiv
              className="relative flex items-center justify-center"
              initial={{ scale: 1.5 }}
              animate={{
                scale: [1.5, 1.68, 0.85],
              }}
              transition={{
                duration: FLY_DIGIT_DURATION_SEC,
                times: [0, FLY_T_RISE, 1],
                ease: [
                  [0.42, 0, 0.58, 1],
                  [0.25, 0.1, 0.25, 1],
                ],
              }}
            >
              <MotionDiv
                aria-hidden
                className="pointer-events-none absolute rounded-full"
                style={{
                  width: compact ? "min(140px, 42vw)" : "min(200px, 38vw)",
                  height: compact ? "min(140px, 42vw)" : "min(200px, 38vw)",
                  background:
                    "radial-gradient(circle, rgba(255,248,220,0.75) 0%, rgba(130,200,255,0.45) 38%, transparent 72%)",
                  filter: "blur(14px)",
                }}
                initial={{ opacity: 0, scale: 0.55 }}
                animate={{
                  opacity: [0, 0.98, 0.88, 0.55, 0],
                  scale: [0.55, 1.22, 1.12, 1, 0.85],
                }}
                transition={{
                  duration: FLY_DIGIT_DURATION_SEC,
                  times: [0, 0.12, 0.28, 0.52, FLY_T_RISE],
                  ease: "easeOut",
                }}
              />
              <span
                className="relative z-10"
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 700,
                  fontSize: REEL_DIGIT_FONT_SIZE(compact),
                  letterSpacing: "0.01em",
                  fontVariantNumeric: "tabular-nums",
                  lineHeight: 1,
                  color: "#ffffff",
                  textShadow:
                    "0 0 10px rgba(59,130,246,0.35), " + REEL_DIGIT_TEXT_SHADOW,
                  WebkitTextStroke: "2px #1d4ed8",
                }}
              >
                {flyPos.digit}
              </span>
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {landedPulse && (
          <MotionDiv
            key={`land-${landedPulse.digit}-${landedPulse.x}-${landedPulse.y}`}
            className="pointer-events-none fixed z-[59] select-none"
            style={{
              left: landedPulse.x,
              top: landedPulse.y,
              translateX: "-50%",
              translateY: "-50%",
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 900,
              fontSize: REEL_DIGIT_FONT_SIZE(compact),
              color: "#ffffff",
              textShadow:
                "0 0 10px rgba(59,130,246,0.35), 0 1px 0 rgba(0,0,0,0.2)",
              WebkitTextStroke: "2px #1d4ed8",
            }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0, transition: { duration: 0 } }}
            transition={{
              duration: 0.3,
              ease: "easeIn",
            }}
          >
            {landedPulse.digit}
          </MotionDiv>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCelebration && !externalBoardSlotRefs && (
          <MotionDiv
            className="fixed inset-0 z-[55] flex flex-col items-center justify-center gap-6 bg-[radial-gradient(circle_at_center,rgba(6,28,92,0.92)_0%,rgba(2,12,40,0.97)_100%)] px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            role="dialog"
            aria-modal="true"
            aria-label="Chúc mừng"
          >
            <MotionDiv
              className="text-center text-sm font-bold uppercase tracking-[0.35em] text-[#ffd24a] md:text-base"
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Chúc mừng
            </MotionDiv>
            <div className="flex items-center justify-center gap-3 md:gap-6">
              {results.map((d, i) => (
                <MotionDiv
                  key={i}
                  className="select-none tabular-nums"
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontWeight: 900,
                    fontSize: "clamp(64px, 18vw, 140px)",
                    lineHeight: 1,
                    color: "#ffffff",
                    textShadow:
                      "0 0 24px rgba(255,255,255,0.9), 0 0 48px rgba(100,180,255,0.55)",
                  }}
                  initial={{ scale: 0.3, opacity: 0, y: 40 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.15 + i * 0.12,
                    type: "spring",
                    stiffness: 260,
                    damping: 18,
                  }}
                >
                  {d}
                </MotionDiv>
              ))}
            </div>
            <MotionDiv
              className="max-w-md text-center text-xs text-white/75 md:text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
            >
              Mã số của bạn: {results.join("")}
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>

      <Confetti active={showConfetti} tier={resultTier} />
    </div>
  );
}
