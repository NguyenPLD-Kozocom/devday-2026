// @ts-nocheck
import {
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
  useEffect,
} from "react";
import { motion } from "framer-motion";
import backgroundImg from "../assets/background.jpg";
import logoGame from "../assets/logo-game.png";
import logoKozocom from "../../assets/logo.png";
import { getPrizeById } from "../prizes";
import preActiveSvg from "../assets/image.png";
import wowSfxUrl from "../assets/wow.mp3";
import SlotMachine from "./SlotMachine";
import SoundToggleButton from "./SoundToggleButton";
import { useSoundSettings } from "../SoundSettingsContext";

const handleEnterKey = (event, handler) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handler();
  }
};

export default function PrizeDetailScreen({ prizeId, onBack }) {
  const { soundEnabled, registerSfxOverlay } = useSoundSettings();
  const prize = getPrizeById(prizeId);
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

  const handleBoardStateChange = useCallback(({ board }) => {
    setTicketBoard([...board]);
  }, []);

  const isTicketComplete =
    ticketBoard[0] !== null &&
    ticketBoard[1] !== null &&
    ticketBoard[2] !== null;

  const ticketMeasureRef = useRef(null);
  const [ticketFly, setTicketFly] = useState(null);

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
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const endScale = Math.min(
      1.58,
      Math.max(1.36, (Math.min(vw, 900) * 0.42) / r.width),
    );
    setTicketFly({
      startCx: r.left + r.width / 2,
      startCy: r.top + r.height / 2,
      w: r.width,
      h: r.height,
      endCx: vw / 2,
      endCy: vh / 2,
      scale: endScale,
    });
  }, [isTicketComplete, ticketFly]);

  const showTicketFlying = isTicketComplete && ticketFly;

  const handleCloseAndResetGame = useCallback(() => {
    setTicketBoard([null, null, null]);
    setTicketFly(null);
    setSlotMachineKey((k) => k + 1);
  }, []);

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
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <MotionButton
        type="button"
        className="absolute top-4 left-4 z-20 w-10 h-10 md:w-12 md:h-12 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
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

      <img
        src={logoGame}
        alt="Lottery Game"
        className="absolute left-30 top-4 h-8 md:h-10 object-contain"
      />

      <div className="absolute top-4 md:top-6 right-4 md:right-8 z-20 flex items-center gap-3">
        <img
          src={logoKozocom}
          alt="KOZOCOM"
          className="h-7 md:h-8 object-contain"
        />
        <SoundToggleButton className="active:scale-95" />
      </div>

      <div className="relative w-full aspect-video h-full overflow-hidden ">
        <div className="absolute left-12 top-12 inset-0 px-6 md:px-12 pt-20 md:pt-24 pb-14 md:pb-14 flex items-center justify-between gap-10">
          {/* Left: Prize + Ticket */}
          <div className="relative flex-[0_0_66%] h-full">
            {/* Ticket — kết quả: giữ size, đo vị trí → bay chậm lên giữa + ánh sáng */}
            {!showTicketFlying ? (
              <div className="absolute left-0 right-0 top-0 bottom-0 flex items-start">
                <div
                  ref={ticketMeasureRef}
                  className="relative z-10 flex h-[90%] w-full flex-col"
                >
                  <div
                    className="relative flex h-full min-h-[200px] w-full min-w-0 flex-1 flex-col rounded-[14px] p-[5px] shadow-[0_14px_48px_rgba(0,0,0,0.38)] md:rounded-[16px] md:p-1.5"
                    style={{ background: prize.panelGradient }}
                  >
                    <div className="relative flex h-full min-h-[200px] min-w-0 flex-col overflow-hidden rounded-[10px] bg-white shadow-[inset_0_2px_0_rgba(255,255,255,0.95),inset_0_-2px_12px_rgba(15,23,42,0.04)] md:min-h-[240px] md:rounded-[12px]">
                      <div
                        className="flex min-h-0 flex-1 items-center justify-center gap-3 px-2 py-4 md:gap-5 md:px-6 md:py-6"
                        role="group"
                        aria-label="Ba chữ số kết quả"
                      >
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            ref={(el) => {
                              ticketSlotRefs.current[i] = el;
                            }}
                            className="flex aspect-3/4 min-h-[92px] w-[24%] max-w-[112px] min-w-[64px] flex-col items-center justify-center rounded-[10px] border border-[#4fa6ff]/45 bg-[#0b4d8f] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] md:min-h-[120px] md:max-w-[132px] md:rounded-[12px]"
                          >
                            <span
                              className="select-none tabular-nums"
                              style={{
                                fontFamily: "'Oswald', sans-serif",
                                fontWeight: 900,
                                fontSize: "clamp(36px, 6.5vw + 10px, 72px)",
                                lineHeight: 1,
                                color:
                                  ticketBoard[i] !== null
                                    ? "#ffffff"
                                    : "#b8d4ff",
                                textShadow:
                                  ticketBoard[i] !== null
                                    ? "0 0 10px rgba(255,255,255,0.45), 0 1px 0 rgba(0,0,0,0.2)"
                                    : "none",
                              }}
                            >
                              {ticketBoard[i] !== null ? ticketBoard[i] : "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <MotionDiv
                  aria-hidden
                  className="pointer-events-none fixed inset-0 z-100 bg-black/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                />
                <MotionButton
                  type="button"
                  className="fixed bottom-8 left-1/2 z-110 flex h-12 min-h-[44px] min-w-[120px] -translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-white/40 bg-[#0b4d8f] px-8 text-base font-semibold text-white shadow-[0_10px_32px_rgba(0,0,0,0.4)] transition hover:opacity-80 active:scale-95 md:bottom-10 md:min-w-[140px] md:px-10 md:text-lg"
                  aria-label="Đóng và chơi lại từ đầu"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.55, duration: 0.4 }}
                  onClick={handleCloseAndResetGame}
                  onKeyDown={(e) => handleEnterKey(e, handleCloseAndResetGame)}
                >
                  Đóng
                </MotionButton>
                <MotionDiv
                  className="fixed z-100"
                  style={{
                    left: ticketFly.startCx - ticketFly.w / 2,
                    top: ticketFly.startCy - ticketFly.h / 2,
                    width: ticketFly.w,
                    height: ticketFly.h,
                    transformOrigin: "50% 50%",
                    willChange: "transform",
                  }}
                  initial={{
                    x: 0,
                    y: 0,
                    scale: 1,
                  }}
                  animate={{
                    x: ticketFly.endCx - ticketFly.startCx,
                    y: ticketFly.endCy - ticketFly.startCy,
                    scale: ticketFly.scale,
                  }}
                  transition={{
                    duration: 1.65,
                    ease: [0.28, 0.08, 0.22, 1],
                  }}
                >
                  <MotionDiv
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[155%] w-[155%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(255,248,220,0.55) 0%, rgba(130,205,255,0.28) 38%, transparent 68%)",
                      boxShadow:
                        "0 0 80px 40px rgba(255,230,170,0.35), 0 0 120px 60px rgba(100,185,255,0.2)",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 0.95, 0.78],
                    }}
                    transition={{
                      duration: 1.65,
                      times: [0, 0.45, 1],
                      ease: "easeOut",
                    }}
                  />
                  <MotionDiv
                    aria-hidden
                    className="pointer-events-none absolute -inset-3 z-0 rounded-[18px] md:-inset-4 md:rounded-[22px]"
                    style={{
                      boxShadow:
                        "0 0 52px 24px rgba(255,230,170,0.5), 0 0 96px 40px rgba(100,185,255,0.3)",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.92, 0.58] }}
                    transition={{
                      duration: 1.65,
                      times: [0, 0.42, 1],
                      ease: "easeOut",
                    }}
                  />
                  <div className="relative z-10 flex h-full w-full min-h-0 flex-col [contain:paint]">
                    <div
                      className="relative flex h-full min-h-[200px] w-full min-w-0 flex-1 flex-col rounded-[14px] p-[5px] shadow-[0_14px_48px_rgba(0,0,0,0.38)] md:rounded-[16px] md:p-1.5"
                      style={{ background: prize.panelGradient }}
                    >
                      <div className="relative flex h-full min-h-[200px] min-w-0 flex-col overflow-hidden rounded-[10px] bg-white shadow-[inset_0_2px_0_rgba(255,255,255,0.95),inset_0_-2px_12px_rgba(15,23,42,0.04)] md:min-h-[240px] md:rounded-[12px]">
                        <div
                          className="flex min-h-0 flex-1 items-center justify-center gap-3 px-2 py-4 md:gap-5 md:px-6 md:py-6"
                          role="group"
                          aria-label="Ba chữ số kết quả"
                        >
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              ref={(el) => {
                                ticketSlotRefs.current[i] = el;
                              }}
                              className="flex aspect-3/4 min-h-[92px] w-[24%] max-w-[112px] min-w-[64px] flex-col items-center justify-center rounded-[10px] border border-[#4fa6ff]/45 bg-[#0b4d8f] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] md:min-h-[120px] md:max-w-[132px] md:rounded-[12px]"
                            >
                              <span
                                className="select-none tabular-nums"
                                style={{
                                  fontFamily: "'Oswald', sans-serif",
                                  fontWeight: 900,
                                  fontSize: "clamp(36px, 6.5vw + 10px, 72px)",
                                  lineHeight: 1,
                                  color:
                                    ticketBoard[i] !== null
                                      ? "#ffffff"
                                      : "#b8d4ff",
                                  textShadow:
                                    ticketBoard[i] !== null
                                      ? "0 0 10px rgba(255,255,255,0.45), 0 1px 0 rgba(0,0,0,0.2)"
                                      : "none",
                                }}
                              >
                                {ticketBoard[i] !== null ? ticketBoard[i] : "—"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </MotionDiv>
              </>
            )}

            {/* Prize block (bottom-left like Figma) */}
            <div className="absolute left-0 bottom-0 z-30 flex items-end">
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
                boardSlotRefs={ticketSlotRefs}
                onBoardStateChange={handleBoardStateChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
