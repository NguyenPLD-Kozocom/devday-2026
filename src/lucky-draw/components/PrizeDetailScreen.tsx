// @ts-nocheck
import {
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
  useEffect,
} from "react";
import { motion, LayoutGroup } from "framer-motion";
import { Settings, X } from "lucide-react";
import backgroundImg from "../assets/background.jpg";
import logoKozocom from "../../assets/logo.png";
import { getPrizeById, PRIZE_IDS } from "../prizes";
import firstNameSvg from "../assets/1st-name.svg";
import secondNameSvg from "../assets/2nd-name.svg";
import thirdNameSvg from "../assets/3rd-name.svg";
import preActiveSvg from "../assets/image.png";
import wowSfxUrl from "../assets/wow.mp3";
import SlotMachine from "./SlotMachine";
import SoundToggleButton from "./SoundToggleButton";
import {
  LuckyDrawResultEffects,
  LuckyDrawExpandedTicketContent,
  luckyDrawLandedCardShellClass,
  ldResultDigitLayoutTransition,
} from "./LuckyDrawResultCelebration";
import TicketWhiteSurface from "./TicketWhiteSurface";
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

export default function PrizeDetailScreen({ prizeId, onBack }) {
  const { soundEnabled, registerSfxOverlay } = useSoundSettings();
  const prize = getPrizeById(prizeId);
  const digitTier = getDigitTier(prize.id);
  const detailImageSize = prize.detailImageSize ?? {
    width: "420px",
    height: "480px",
  };
  const detailImagePosition = prize.detailImagePosition ?? {
    bottom: "0px",
  };
  const MotionButton = motion.button;
  const MotionImg = motion.img;
  const MotionDiv = motion.div;

  const ticketSlotRefs = useRef([null, null, null]);
  const [ticketBoard, setTicketBoard] = useState(() => [null, null, null]);
  const [slotMachineKey, setSlotMachineKey] = useState(0);
  const [maxSpinDigit, setMaxSpinDigit] = useState(9);
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
      const endCx = vw / 2;
      const targetW = Math.min(vw * 0.94, 540);
      const scaleByWidth = targetW / r.width;
      const scaleByHeight = (vh * 0.88) / r.height;
      const finalScale =
        Math.min(2.45, Math.max(1.46, scaleByWidth, scaleByHeight)) * 0.98;
      const halfScaledH = (r.height * finalScale) / 2;
      const edgePad = 28;
      let endCy = vh * 0.56;
      endCy = Math.min(endCy, vh - edgePad - halfScaledH);
      endCy = Math.max(endCy, edgePad + halfScaledH);
      setTicketFly({
        startCx: r.left + r.width / 2,
        startCy: r.top + r.height / 2,
        w: r.width,
        h: r.height,
        endCx,
        endCy,
        scale: finalScale,
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
    setSlotMachineKey((k) => k + 1);
  }, []);

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

  const wowPlayedForFlyRef = useRef(false);
  useEffect(() => {
    if (!showTicketFlying) {
      wowPlayedForFlyRef.current = false;
      return;
    }
    if (!soundEnabled) return;
    if (wowPlayedForFlyRef.current) return;
    wowPlayedForFlyRef.current = true;
    const endOverlay = registerSfxOverlay();
    const audio = new Audio(wowSfxUrl);
    audio.volume = 0.88;
    const handleEnded = () => {
      endOverlay();
      audio.removeEventListener("ended", handleEnded);
    };
    audio.addEventListener("ended", handleEnded);
    void audio.play().catch(() => {
      endOverlay();
    });
    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audio.currentTime = 0;
      endOverlay();
    };
  }, [showTicketFlying, soundEnabled, registerSfxOverlay]);

  return (
    <LayoutGroup id={`ld-result-group-${prize.id}`}>
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
              aria-label="Mở cài đặt phạm vi số quay"
              onClick={() =>
                setShowSpinDigitSettings((currentState) => !currentState)
              }
            >
              <Settings className="h-4 w-4 md:h-[18px] md:w-[18px]" />
            </MotionButton>

            {showSpinDigitSettings && (
              <div
                role="dialog"
                aria-label="Chọn phạm vi số quay"
                className="absolute left-0 mt-2 w-[180px] rounded-xl border border-[#66b6ff]/45 bg-[#061741]/95 p-2 text-white shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-sm"
              >
                <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9fd6ff]">
                  Spin range
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
            className="h-9 w-auto max-w-full object-contain object-center md:h-11"
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
              {/* Ticket — kết quả: giữ size, đo vị trí → bay chậm lên giữa + ánh sáng */}
              {!showTicketFlying ? (
                <div className="absolute left-0 right-0 top-0 bottom-0 flex items-start">
                  <div className="relative z-10 flex h-[98%] w-full flex-col">
                    <div
                      ref={ticketMeasureRef}
                      className="relative flex h-full min-h-[220px] w-full min-w-0 flex-1 flex-col rounded-[14px] p-[5px] shadow-[0_14px_48px_rgba(0,0,0,0.38)] md:rounded-[16px] md:p-1.5"
                      style={{ background: prize.panelGradient }}
                    >
                      <div className="relative flex h-full min-h-[220px] min-w-0 flex-col overflow-hidden rounded-[10px] bg-white shadow-[inset_0_2px_0_rgba(255,255,255,0.95),inset_0_-2px_12px_rgba(15,23,42,0.04)] md:min-h-[280px] md:rounded-[12px]">
                        <div
                          className="flex min-h-0 flex-1 items-center justify-center gap-3 px-2 py-4 md:gap-5 md:px-6 md:py-6"
                          role="group"
                          aria-label="Ba chữ số kết quả"
                        >
                          {[0, 1, 2].map((i) => {
                            const filled = ticketBoard[i] !== null;
                            const slotClass = getLuckyDrawDigitSlotClassName({
                              tier: digitTier,
                              filled,
                            });
                            const textStyle = getLuckyDrawDigitTextStyle({
                              tier: digitTier,
                              filled,
                            });
                            const refCb = (el) => {
                              ticketSlotRefs.current[i] = el;
                            };
                            const digitBody = (
                              <span
                                className="select-none tabular-nums"
                                style={textStyle}
                              >
                                {filled ? ticketBoard[i] : "—"}
                              </span>
                            );
                            if (isTicketComplete && !showTicketFlying) {
                              return (
                                <MotionDiv
                                  key={i}
                                  ref={refCb}
                                  layout
                                  layoutId={`ld-result-digit-${prize.id}-${i}`}
                                  transition={ldResultDigitLayoutTransition}
                                  className={slotClass}
                                >
                                  {digitBody}
                                </MotionDiv>
                              );
                            }
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
                  <MotionButton
                    type="button"
                    className="fixed top-4 right-4 z-[115] flex h-11 min-h-[44px] w-11 min-w-[44px] cursor-pointer items-center justify-center rounded-full border border-white/45 bg-slate-950/55 text-white shadow-[0_8px_28px_rgba(0,0,0,0.45)] backdrop-blur-sm transition hover:bg-slate-950/70 hover:opacity-95 active:scale-95 md:top-5 md:right-5 md:h-12 md:w-12"
                    aria-label="Đóng và chơi lại từ đầu"
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: flyFinished ? 0.2 : 1.55,
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
                  {flyFinished && ticketFly && (
                    <LuckyDrawResultEffects prizeId={prize.id} />
                  )}
                  {ticketFly && (
                    <MotionDiv
                      role="dialog"
                      aria-modal={flyFinished}
                      aria-labelledby={
                        flyFinished ? "lucky-draw-result-label" : undefined
                      }
                      className="fixed z-[110] pointer-events-auto [isolation:isolate]"
                      style={{
                        left: 0,
                        top: 0,
                        width: ticketFly.w,
                        height: ticketFly.h,
                        transformOrigin: "50% 50%",
                        willChange: "transform",
                        backfaceVisibility: "hidden",
                      }}
                      initial={{
                        x: ticketFly.startCx - ticketFly.w / 2,
                        y: ticketFly.startCy - ticketFly.h / 2,
                        scale: 1,
                      }}
                      animate={{
                        x: ticketFly.endCx - ticketFly.w / 2,
                        y: ticketFly.endCy - ticketFly.h / 2,
                        scale: ticketFly.scale,
                      }}
                      transition={{
                        duration: 1.75,
                        ease: [0.22, 0.99, 0.2, 1],
                      }}
                      onAnimationComplete={() => {
                        if (!flyFinished) {
                          handleTicketFlyAnimationComplete();
                        }
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
                        }}
                      />
                      <div className="relative top-[100px] z-10 flex min-h-0 w-full flex-col">
                        <div
                          className={`flex h-full min-h-0 w-full flex-col overflow-hidden ${luckyDrawLandedCardShellClass(prize.id)}`}
                        >
                          <TicketWhiteSurface className="flex min-h-0 w-full flex-1 flex-col items-center gap-3 overflow-y-auto rounded-[22px] px-2 py-3 shadow-[inset_0_2px_0_rgba(255,255,255,0.95),inset_0_-2px_12px_rgba(15,23,42,0.04)] md:gap-4 md:rounded-[26px] md:px-3 md:py-4">
                            <LuckyDrawExpandedTicketContent
                              prizeId={prize.id}
                              digits={ticketBoard}
                              prizeLabel={prize.label}
                              prizeName={prize.name}
                              wide
                              revealPrize={flyFinished}
                              digitSlotRefs={ticketSlotRefs}
                            />
                          </TicketWhiteSurface>
                        </div>
                      </div>
                    </MotionDiv>
                  )}
                </>
              )}

              {/* Prize block (bottom-left like Figma) */}
              <div className="absolute left-0 bottom-4 z-30 flex items-end">
                <div
                  className="relative shrink-0"
                  style={{
                    width: detailImageSize.width,
                    height: detailImageSize.height,
                  }}
                >
                  <MotionImg
                    layoutId={`prize-image-${prize.id}`}
                    src={prize.detailImage ?? prize.image}
                    alt={prize.name}
                    className="absolute left-0 h-full w-full object-contain object-bottom-left"
                    style={{ bottom: detailImagePosition.bottom }}
                  />
                </div>
              </div>
            </div>

            {/* Right slot */}
            <div className="relative flex-[0_0_30%] h-full flex flex-col items-center justify-center gap-2">
              <div className="relative flex h-[72%] w-full max-w-[420px] items-center justify-center">
                <SlotMachine
                  key={slotMachineKey}
                  compact
                  maxSpinDigit={maxSpinDigit}
                  boardSlotRefs={ticketSlotRefs}
                  onBoardStateChange={handleBoardStateChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutGroup>
  );
}
