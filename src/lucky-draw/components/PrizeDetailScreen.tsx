// @ts-nocheck
import {
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
  useEffect,
} from "react";
import { motion } from "framer-motion";
import { ArrowRight, Settings, X } from "lucide-react";
import backgroundImg from "../assets/background.jpg";
import logoKozocom from "../../assets/logo.png";
import { getPrizeById, PRIZE_IDS } from "../prizes";
import firstNameSvg from "../assets/1st-name.svg";
import secondNameSvg from "../assets/2nd-name.svg";
import thirdNameSvg from "../assets/3rd-name.svg";
import firstBackgroundSvg from "../assets/1st-background.svg";
import secondBackgroundSvg from "../assets/2nd-background.svg";
import thirdBackgroundSvg from "../assets/3rd.background.svg";
import preActiveSvg from "../assets/image.png";
import SlotMachine from "./SlotMachine";
import SoundToggleButton from "./SoundToggleButton";
import { LuckyDrawResultEffects } from "./LuckyDrawResultCelebration";
import {
  getDigitTier,
  getLuckyDrawDigitSlotClassName,
  getLuckyDrawDigitTextStyle,
} from "../ticketDigitTheme";
import { useSoundSettings } from "../SoundSettingsContext";

const handleEnterKey = (event, handler) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handler();
  }
};

const PRIZE_TITLE_SVG = {
  [PRIZE_IDS.gold]: firstNameSvg,
  [PRIZE_IDS.silver]: secondNameSvg,
  [PRIZE_IDS.bronze]: thirdNameSvg,
};

const PRIZE_BACKGROUND_SVG = {
  [PRIZE_IDS.gold]: firstBackgroundSvg,
  [PRIZE_IDS.silver]: secondBackgroundSvg,
  [PRIZE_IDS.bronze]: thirdBackgroundSvg,
};

/** Một pha: bay về giữa và phóng to (ô số giữ nguyên layout trong vé). */
const LUCKY_DRAW_RESULT_MAX_HEIGHT_VH = 1;
const LUCKY_DRAW_RESULT_MAX_WIDTH_VW = 1;
/** Trần rất cao — thực tế thường bị chặn bởi giới hạn vh/vw. */
const LUCKY_DRAW_RESULT_SCALE_CAP = 14;
/** Lề tối thiểu so với viewport khi căn vé đã phóng (px). */
const LUCKY_DRAW_RESULT_EDGE_PAD_PX = 8;
/** Thời gian bay + scale (giây). */
const LUCKY_DRAW_FLY_DURATION_S = 5;
/** Rộng thêm hai bên khi bay (px); tâm khối = tâm vé (startCx). */
const LUCKY_DRAW_FLY_TICKET_EXTRA_WIDTH_PX = 400;

export default function PrizeDetailScreen({ prizeId, onBack }) {
  const { soundEnabled, registerBackgroundMusicMute } = useSoundSettings();
  const prize = getPrizeById(prizeId);
  const resultDigitTier = getDigitTier(prize.id);
  const MotionButton = motion.button;
  const MotionDiv = motion.div;

  const ticketSlotRefs = useRef([null, null, null]);
  const [ticketBoard, setTicketBoard] = useState(() => [null, null, null]);
  const [slotMachineKey, setSlotMachineKey] = useState(0);
  const [maxSpinDigit, setMaxSpinDigit] = useState(5);
  const [showSpinDigitSettings, setShowSpinDigitSettings] = useState(false);
  const settingsPanelRef = useRef(null);

  const isTicketComplete =
    ticketBoard[0] !== null &&
    ticketBoard[1] !== null &&
    ticketBoard[2] !== null;

  const ticketMeasureRef = useRef(null);
  const [ticketFly, setTicketFly] = useState(null);
  const [flyFinished, setFlyFinished] = useState(false);
  const flyCompleteRef = useRef(false);

  const handleBoardStateChange = useCallback(({ board }) => {
    const next = [...board];
    const complete = next[0] !== null && next[1] !== null && next[2] !== null;
    if (!complete) {
      setFlyFinished(false);
      flyCompleteRef.current = false;
    }
    setTicketBoard(next);
  }, []);

  useEffect(() => {
    if (isTicketComplete) return;
    const id = window.setTimeout(() => setTicketFly(null), 0);
    return () => window.clearTimeout(id);
  }, [isTicketComplete]);

  // DEV ONLY: nhấn Shift+D để fill ngay ticketBoard và trigger modal
  useEffect(() => {
    if (import.meta.env.PROD) return;
    const handler = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "D") {
        setFlyFinished(false);
        flyCompleteRef.current = false;
        setTicketBoard([1, 2, 3]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useLayoutEffect(() => {
    if (!isTicketComplete) return;
    if (ticketFly) return;
    const el = ticketMeasureRef.current;
    if (!el) return;
    let cancelled = false;
    const measureAndFly = () => {
      const r = el.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      const maxScaledH = vh * LUCKY_DRAW_RESULT_MAX_HEIGHT_VH;
      const maxScaledW = vw * LUCKY_DRAW_RESULT_MAX_WIDTH_VW;
      const flyOuterW = r.width + LUCKY_DRAW_FLY_TICKET_EXTRA_WIDTH_PX;
      const endScale = Math.min(
        LUCKY_DRAW_RESULT_SCALE_CAP,
        maxScaledH / r.height,
        maxScaledW / flyOuterW,
      );
      const halfScaledH = (r.height * endScale) / 2;
      const halfScaledW = (flyOuterW * endScale) / 2;
      const edgePad = LUCKY_DRAW_RESULT_EDGE_PAD_PX;
      let endCy = vh * 0.5;
      endCy = Math.min(endCy, vh - edgePad - halfScaledH);
      endCy = Math.max(endCy, edgePad + halfScaledH);
      let endCx = vw * 0.5;
      endCx = Math.min(endCx, vw - edgePad - halfScaledW);
      endCx = Math.max(endCx, edgePad + halfScaledW);
      setTicketFly({
        startCx: r.left + r.width / 2,
        startCy: r.top + r.height / 2,
        w: r.width,
        h: r.height,
        endCx,
        endCy,
        endScale,
      });
    };
    let id1 = 0;
    const id0 = requestAnimationFrame(() => {
      id1 = requestAnimationFrame(() => {
        if (!cancelled) measureAndFly();
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id0);
      cancelAnimationFrame(id1);
    };
  }, [isTicketComplete, ticketFly]);

  const showTicketFlying = isTicketComplete && ticketFly;

  useEffect(() => {
    if (!ticketFly) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevOverscroll = html.style.overscrollBehavior;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      html.style.overscrollBehavior = prevOverscroll;
    };
  }, [ticketFly]);

  /** Tắt nhạc nền trong suốt màn kết quả (bay vé → land), mọi hạng giải. */
  useEffect(() => {
    if (!soundEnabled) return;
    if (!isTicketComplete || !ticketFly) return;
    return registerBackgroundMusicMute();
  }, [soundEnabled, isTicketComplete, ticketFly, registerBackgroundMusicMute]);

  const handleTicketFlyAnimationComplete = useCallback(() => {
    if (flyCompleteRef.current) return;
    flyCompleteRef.current = true;
    window.setTimeout(() => {
      setFlyFinished(true);
    }, 48);
  }, []);

  const handleCloseAndResetGame = useCallback(() => {
    setTicketBoard([null, null, null]);
    setTicketFly(null);
    setFlyFinished(false);
    flyCompleteRef.current = false;
    setMaxSpinDigit(5);
    setSlotMachineKey((k) => k + 1);
  }, []);

  const handleBackToPrizeLobby = useCallback(() => {
    handleCloseAndResetGame();
    onBack();
  }, [handleCloseAndResetGame, onBack]);

  const handleSelectMaxSpinDigit = useCallback((nextMaxDigit) => {
    setMaxSpinDigit(nextMaxDigit);
    setShowSpinDigitSettings(false);
  }, []);

  useEffect(() => {
    if (!showSpinDigitSettings) return undefined;

    const handlePointerDownOutside = (event) => {
      const panelNode = settingsPanelRef.current;
      if (!panelNode) return;
      if (!panelNode.contains(event.target)) {
        setShowSpinDigitSettings(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        setShowSpinDigitSettings(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDownOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handlePointerDownOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showSpinDigitSettings]);

  return (
    <>
      <div
        className="relative w-full h-screen overflow-hidden"
        style={{
          backgroundImage: `url(${backgroundImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="relative z-20 flex justify-start items-center gap-4 pt-4 pl-4">
          <MotionButton
            type="button"
            className="w-10 h-10 md:w-12 md:h-12 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
            aria-label="Quay lại danh sách giải"
            onClick={onBack}
            onKeyDown={(e) => handleEnterKey(e, onBack)}
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
          >
            <img
              src={preActiveSvg}
              alt="Back"
              className="w-full h-full object-contain"
            />
          </MotionButton>

          <SoundToggleButton className="active:scale-95" />

          <div className="relative" ref={settingsPanelRef}>
            <MotionButton
              type="button"
              className="flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-full border border-white/35 bg-[#081a4d]/65 text-white shadow-[0_6px_20px_rgba(0,0,0,0.35)] backdrop-blur-sm transition hover:bg-[#0d2670]/75 active:scale-95 md:h-11 md:w-11 md:min-h-[44px] md:min-w-[44px]"
              aria-label="Mở cài đặt phạm vi số quay cho chữ số đầu tiên"
              onClick={() =>
                setShowSpinDigitSettings((currentState) => !currentState)
              }
            >
              <Settings className="h-4 w-4 md:h-[18px] md:w-[18px]" />
            </MotionButton>

            {showSpinDigitSettings && (
              <div
                role="dialog"
                aria-label="Chọn phạm vi số quay cho chữ số đầu tiên"
                className="absolute left-0 mt-2 w-[200px] rounded-xl border border-[#66b6ff]/45 bg-[#061741]/95 p-2 text-white shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-sm"
              >
                <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9fd6ff]">
                  Ô đầu tiên
                </p>
                <p className="px-2 pb-2 text-[10px] leading-snug text-white/65">
                  Hai ô sau luôn quay 0–9.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 10 }, (_, idx) => 9 - idx).map(
                    (digitMax) => {
                      const isActive = digitMax === maxSpinDigit;
                      return (
                        <button
                          key={digitMax}
                          type="button"
                          className={`rounded-md border px-2 py-1.5 text-xs font-semibold transition ${
                            isActive
                              ? "border-[#8dddff] bg-[#0f5e98] text-white"
                              : "border-white/20 bg-white/5 text-white/85 hover:border-[#7cc9ff]/65 hover:bg-[#0d2e66]"
                          }`}
                          onClick={() => handleSelectMaxSpinDigit(digitMax)}
                        >
                          0-{digitMax}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="absolute top-4 md:top-6 left-1/2 z-20 flex w-[min(92vw,440px)] max-w-full -translate-x-1/2 justify-center px-2">
          <img
            src={PRIZE_TITLE_SVG[prize.id]}
            alt={prize.label}
            className="w-auto max-w-full object-contain object-center h-36"
          />
        </div>

        <div className="absolute top-4 md:top-6 right-4 md:right-8 z-20 flex items-center gap-3">
          <img
            src={logoKozocom}
            alt="KOZOCOM"
            className="h-7 md:h-8 object-contain"
          />
        </div>

        <div className="relative w-full aspect-video h-full overflow-hidden ">
          <div className="absolute left-12 top-12 inset-0 pb-20 flex items-center justify-between gap-10">
            {/* Left: Prize + Ticket */}
            <div className="relative flex-[0_0_66%] h-full">
              {/* Ticket — đo vị trí → một pha bay giữa màn hình + phóng to */}
              {!showTicketFlying ? (
                <div className="absolute left-0 right-0 top-0 bottom-0 flex items-start">
                  <div className="relative z-10 flex h-[98%] w-full flex-col">
                    <div
                      ref={ticketMeasureRef}
                      className="relative flex h-full min-h-[220px] w-full min-w-0 flex-1 flex-col rounded-[14px] p-[5px]  md:rounded-[16px] md:p-1.5"
                      style={{
                        backgroundImage: `url(${PRIZE_BACKGROUND_SVG[prize.id]})`,
                        backgroundSize: "contain",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }}
                    >
                      <div className="relative flex h-full min-h-[220px] min-w-0 flex-col overflow-hidden rounded-[10px] bg-transparent md:min-h-[280px] md:rounded-[12px]">
                        <div
                          className="absolute left-100 right-0 top-70 bottom-0 flex min-h-0 flex-1 items-center justify-center gap-3 px-2 py-4 md:gap-5 md:px-6 md:py-6"
                          role="group"
                          aria-label="Ba chữ số kết quả"
                        >
                          {[0, 1, 2].map((i) => {
                            const filled = ticketBoard[i] !== null;
                            const slotClass = getLuckyDrawDigitSlotClassName({
                              tier: resultDigitTier,
                              filled,
                            });
                            const textStyle = getLuckyDrawDigitTextStyle({
                              tier: resultDigitTier,
                              filled,
                            });
                            const refCb = (el) => {
                              ticketSlotRefs.current[i] = el;
                            };
                            const digitBody = (
                              <span
                                className="flex h-full w-full items-center justify-center select-none tabular-nums leading-none"
                                style={textStyle}
                              >
                                <span className="block leading-none -translate-y-[4px]">
                                  {filled ? ticketBoard[i] : ""}
                                </span>
                              </span>
                            );
                            return (
                              <div key={i} ref={refCb} className={slotClass}>
                                {digitBody}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <MotionDiv
                    aria-hidden
                    className="pointer-events-none fixed inset-0 z-[100] bg-slate-950/[0.86]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <MotionDiv
                    className="fixed top-4 right-4 z-[115] flex items-center gap-2 md:top-5 md:right-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      delay: flyFinished ? 0.2 : LUCKY_DRAW_FLY_DURATION_S,
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <MotionButton
                      type="button"
                      className="flex h-11 min-h-[44px] w-11 min-w-[44px] cursor-pointer items-center justify-center rounded-full border border-white/45 bg-slate-950/55 text-white shadow-[0_8px_28px_rgba(0,0,0,0.45)] backdrop-blur-sm transition hover:bg-slate-950/70 hover:opacity-95 active:scale-95 md:h-12 md:w-12"
                      aria-label="Về sảnh chọn ba giải thưởng"
                      initial={{ opacity: 0, scale: 0.88 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: flyFinished ? 0.2 : LUCKY_DRAW_FLY_DURATION_S,
                        duration: 0.4,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      onClick={handleBackToPrizeLobby}
                      onKeyDown={(e) =>
                        handleEnterKey(e, handleBackToPrizeLobby)
                      }
                    >
                      <ArrowRight
                        className="h-5 w-5 md:h-[22px] md:w-[22px]"
                        strokeWidth={2.25}
                        aria-hidden
                      />
                    </MotionButton>
                    <MotionButton
                      type="button"
                      className="flex h-11 min-h-[44px] w-11 min-w-[44px] cursor-pointer items-center justify-center rounded-full border border-white/45 bg-slate-950/55 text-white shadow-[0_8px_28px_rgba(0,0,0,0.45)] backdrop-blur-sm transition hover:bg-slate-950/70 hover:opacity-95 active:scale-95 md:h-12 md:w-12"
                      aria-label="Đóng và chơi lại từ đầu"
                      initial={{ opacity: 0, scale: 0.88 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: flyFinished ? 0.2 : LUCKY_DRAW_FLY_DURATION_S,
                        duration: 0.4,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      onClick={handleCloseAndResetGame}
                      onKeyDown={(e) =>
                        handleEnterKey(e, handleCloseAndResetGame)
                      }
                    >
                      <X
                        className="h-5 w-5 md:h-[22px] md:w-[22px]"
                        strokeWidth={2.25}
                        aria-hidden
                      />
                    </MotionButton>
                  </MotionDiv>
                  {showTicketFlying && (
                    <LuckyDrawResultEffects prizeId={prize.id} />
                  )}
                  {ticketFly && (
                    <MotionDiv
                      role="dialog"
                      aria-modal={flyFinished}
                      aria-labelledby={
                        flyFinished ? "lucky-draw-result-label" : undefined
                      }
                      className="fixed z-[110] pointer-events-auto overflow-visible [isolation:isolate]"
                      style={{
                        left: 0,
                        top: 0,
                        width:
                          ticketFly.w + LUCKY_DRAW_FLY_TICKET_EXTRA_WIDTH_PX,
                        height: ticketFly.h,
                        transformOrigin: "50% 50%",
                        willChange: "transform",
                        backfaceVisibility: "hidden",
                      }}
                      initial={{
                        x:
                          ticketFly.startCx -
                          (ticketFly.w + LUCKY_DRAW_FLY_TICKET_EXTRA_WIDTH_PX) /
                            2,
                        y: ticketFly.startCy - ticketFly.h / 2,
                      }}
                      animate={{
                        x:
                          ticketFly.endCx -
                          (ticketFly.w + LUCKY_DRAW_FLY_TICKET_EXTRA_WIDTH_PX) /
                            2,
                        y: ticketFly.endCy - ticketFly.h / 2,
                      }}
                      transition={{
                        duration: LUCKY_DRAW_FLY_DURATION_S,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      onAnimationComplete={() => {
                        if (!flyFinished) {
                          handleTicketFlyAnimationComplete();
                        }
                      }}
                    >
                      {/*
                        Tách translate (lớp ngoài) và scale (lớp trong): Framer 12 gộp transform
                        có thể khiến scale không áp dụng cùng x/y.
                      */}
                      <MotionDiv
                        className="h-full w-full overflow-visible"
                        style={{
                          transformOrigin: "50% 50%",
                          willChange: "transform",
                        }}
                        initial={{
                          scale:
                            ticketFly.w /
                            (ticketFly.w +
                              LUCKY_DRAW_FLY_TICKET_EXTRA_WIDTH_PX),
                        }}
                        animate={{ scale: ticketFly.endScale }}
                        transition={{
                          duration: LUCKY_DRAW_FLY_DURATION_S,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <div
                          aria-hidden
                          className="ld-fly-ticket-glow pointer-events-none absolute left-1/2 top-1/2 z-0 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                          style={{
                            background:
                              "radial-gradient(circle, rgba(255,248,220,0.48) 0%, rgba(130,205,255,0.22) 40%, transparent 68%)",
                            boxShadow:
                              "0 0 56px 28px rgba(255,230,170,0.28), 0 0 88px 44px rgba(100,185,255,0.14)",
                            animationDuration: `${LUCKY_DRAW_FLY_DURATION_S}s`,
                          }}
                        />
                        <div
                          className="relative z-10 flex h-full min-h-[220px] w-full min-w-0 flex-1 flex-col rounded-[14px] p-[5px] md:rounded-[16px] md:p-1.5"
                          style={{
                            backgroundImage: `url(${PRIZE_BACKGROUND_SVG[prize.id]})`,
                            backgroundSize: "contain",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                          }}
                        >
                          <div className="relative flex h-full min-h-[220px] min-w-0 flex-col overflow-hidden rounded-[10px] bg-transparent md:min-h-[280px] md:rounded-[12px]">
                            <div
                              className="absolute left-150 right-0 top-90 bottom-0 flex min-h-0 flex-1 items-center justify-center gap-4 px-2 py-4 md:gap-6 md:px-6 md:py-6"
                              role="group"
                              aria-label="Ba chữ số kết quả"
                            >
                              {[0, 1, 2].map((i) => {
                                const filled = ticketBoard[i] !== null;
                                return (
                                  <div
                                    key={i}
                                    className={getLuckyDrawDigitSlotClassName({
                                      tier: resultDigitTier,
                                      filled,
                                      variant: "fly",
                                    })}
                                  >
                                    <span
                                      className="flex h-full w-full items-center justify-center select-none tabular-nums leading-none"
                                      style={getLuckyDrawDigitTextStyle({
                                        tier: resultDigitTier,
                                        filled,
                                        variant: "fly",
                                      })}
                                    >
                                      <span className="block leading-none -translate-y-[4px]">
                                        {filled ? ticketBoard[i] : ""}
                                      </span>
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </MotionDiv>
                    </MotionDiv>
                  )}
                </>
              )}
            </div>

            {/* Right slot */}
            <div className="relative right-15 flex-[0_0_30%] h-full flex flex-col items-center justify-center gap-2">
              <div className="relative flex h-[72%] w-full max-w-[420px] items-center justify-center">
                <SlotMachine
                  key={slotMachineKey}
                  compact
                  maxSpinDigit={maxSpinDigit}
                  resultTier={resultDigitTier}
                  boardSlotRefs={ticketSlotRefs}
                  onBoardStateChange={handleBoardStateChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
