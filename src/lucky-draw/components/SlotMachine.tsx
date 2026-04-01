// @ts-nocheck
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

/**
 * SlotMachine — Mỗi lượt quay cần kéo cần một lần (3 lần kéo = 3 lượt).
 * Optional `boardSlotRefs`: ô đích để đo vị trí bay (ví dụ vé trắng ở PrizeDetailScreen).
 * `onBoardStateChange`: đồng bộ board/results ra parent khi dùng refs ngoài.
 *
 * Phases: idle → spinning → flying → idle → … → celebration → idle
 */
export default function SlotMachine({
  compact = false,
  boardSlotRefs: externalBoardSlotRefs = null,
  onBoardStateChange = null,
}) {
  const MotionDiv = motion.div;
  const [phase, setPhase] = useState("idle");
  const [roundIndex, setRoundIndex] = useState(0);
  const [spinKey, setSpinKey] = useState(0);
  const [results, setResults] = useState([0, 0, 0]);
  const [idleDigit, setIdleDigit] = useState(0);
  const [board, setBoard] = useState([null, null, null]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [flyPos, setFlyPos] = useState(null);
  const [landedPulse, setLandedPulse] = useState(null);
  const reelWrapRef = useRef(null);
  const internalBoardRefs = useRef([null, null, null]);
  const boardRefs = externalBoardSlotRefs ?? internalBoardRefs;
  const showInlineBoard = !externalBoardSlotRefs;
  const spinDoneRef = useRef(false);
  const timeoutsRef = useRef([]);
  const resultsRef = useRef(results);
  const flyPayloadRef = useRef(null);

  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

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

  const completeRoundAfterDigit = useCallback((ri) => {
    const val = resultsRef.current[ri];
    setIdleDigit(val);
    setBoard((prev) => {
      const next = [...prev];
      next[ri] = val;
      return next;
    });
    if (ri < 2) {
      setRoundIndex(ri + 1);
      setPhase("idle");
    } else {
      setPhase("celebration");
      setShowConfetti(true);
    }
  }, []);

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
      const payload = {
        from: { x: a.left + a.width / 2, y: a.top + a.height / 2 },
        to: { x: b.left + b.width / 2, y: b.top + b.height / 2 },
        digit: resultsRef.current[roundIndex],
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
    const t = setTimeout(() => {
      setPhase("idle");
      setBoard([null, null, null]);
      setIdleDigit(0);
      setRoundIndex(0);
      setShowConfetti(false);
    }, 5200);
    return () => clearTimeout(t);
  }, [phase]);

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
    completeRoundAfterDigit(payload.roundIndex);
  }, [completeRoundAfterDigit]);

  const handlePull = useCallback(() => {
    if (phase !== "idle") return;

    const isNewGame = board.every((b) => b === null);

    if (isNewGame) {
      setIdleDigit(0);
      setResults([
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10),
      ]);
      setRoundIndex(0);
      setShowConfetti(false);
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    }

    setFlyPos(null);
    setSpinKey((k) => k + 1);
    setPhase("spinning");
  }, [phase, board]);

  const reelMode =
    phase === "spinning" ? "spinning" : phase === "flying" ? "locked" : "idle";

  const isCelebration = phase === "celebration";
  const boardSlotClass = compact
    ? "flex h-14 w-12 items-center justify-center rounded-[10px] border border-[#4fa6ff]/35 bg-[#041c4f] md:h-16 md:w-14"
    : "flex h-20 w-16 items-center justify-center rounded-[14px] border border-[#4fa6ff]/35 bg-[#041c4f] md:h-[92px] md:w-20";

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
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                ref={(el) => {
                  boardRefs.current[i] = el;
                }}
                className={boardSlotClass}
              >
                <span
                  className="select-none"
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontWeight: 900,
                    fontSize: compact
                      ? "clamp(28px, 5.5vw, 38px)"
                      : "clamp(38px, 3.8vw, 56px)",
                    color: board[i] !== null ? "#ffffff" : "#b8d4ff",
                    textShadow:
                      board[i] !== null
                        ? "0 0 14px rgba(255,255,255,0.65)"
                        : "none",
                  }}
                >
                  {board[i] !== null ? board[i] : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div ref={reelWrapRef}>
        <VerticalReel
          key={spinKey}
          spinKey={spinKey}
          targetValue={results[roundIndex]}
          idleValue={idleDigit}
          mode={reelMode}
          compact={compact}
          onPull={handlePull}
          pullDisabled={phase !== "idle"}
          onSpinComplete={handleSpinComplete}
        />
      </div>

      <AnimatePresence>
        {flyPos && (
          <MotionDiv
            key={`fly-${flyPos.roundIndex}`}
            className="pointer-events-none fixed z-[60] select-none"
            style={{
              left: flyPos.from.x,
              top: flyPos.from.y,
              translateX: "-50%",
              translateY: "-50%",
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 900,
              fontSize: compact
                ? "clamp(40px, 8vw, 56px)"
                : "clamp(54px, 7vw, 88px)",
              color: externalBoardSlotRefs ? "#0f172a" : "#ffffff",
              textShadow: externalBoardSlotRefs
                ? "0 2px 14px rgba(15,23,42,0.12)"
                : "0 0 18px rgba(255,255,255,0.85), 0 0 32px rgba(104,180,255,0.6)",
            }}
            initial={{
              left: flyPos.from.x,
              top: flyPos.from.y,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              left: flyPos.to.x,
              top: flyPos.to.y,
              scale: 0.92,
              opacity: 1,
            }}
            transition={{
              duration: 0.92,
              ease: [0.22, 0.61, 0.36, 1],
            }}
            exit={{ opacity: 0 }}
            onAnimationComplete={handleFlyAnimationComplete}
          >
            {flyPos.digit}
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
              fontSize: compact
                ? "clamp(34px, 7vw, 50px)"
                : "clamp(46px, 6vw, 74px)",
              color: externalBoardSlotRefs ? "#0f172a" : "#ffffff",
              textShadow: externalBoardSlotRefs
                ? "0 2px 10px rgba(15,23,42,0.18)"
                : "0 0 12px rgba(255,255,255,0.8)",
            }}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: [0.7, 1.12, 1], opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut", times: [0, 0.5, 1] }}
          >
            {landedPulse.digit}
          </MotionDiv>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCelebration && (
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

      <Confetti active={showConfetti} />
    </div>
  );
}
