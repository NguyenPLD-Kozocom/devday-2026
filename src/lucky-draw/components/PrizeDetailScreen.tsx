// @ts-nocheck
import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import backgroundImg from "../assets/background.jpg";
import logoGame from "../assets/logo-game.png";
import logoKozocom from "../../assets/logo.png";
import speakerIcon from "../assets/speaker.png";
import { getPrizeById } from "../prizes";
import preActiveSvg from "../assets/image.png";
import SlotMachine from "./SlotMachine";

const handleEnterKey = (event, handler) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handler();
  }
};

export default function PrizeDetailScreen({ prizeId, onBack }) {
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

  const ticketSlotRefs = useRef([null, null, null]);
  const [ticketBoard, setTicketBoard] = useState(() => [null, null, null]);

  const handleBoardStateChange = useCallback(({ board }) => {
    setTicketBoard([...board]);
  }, []);

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
        <button
          className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden cursor-pointer hover:scale-110 active:scale-95 transition-transform focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
          aria-label="Toggle sound"
          type="button"
        >
          <img
            src={speakerIcon}
            alt="Speaker"
            className="w-full h-full object-contain"
          />
        </button>
      </div>

      <div className="relative w-full aspect-video h-full overflow-hidden ">
        <div className="absolute left-12 top-12 inset-0 px-6 md:px-12 pt-20 md:pt-24 pb-14 md:pb-14 flex items-center justify-between gap-10">
          {/* Left: Prize + Ticket */}
          <div className="relative flex-[0_0_66%] h-full">
            {/* Ticket (white background like Figma) */}
            <div className="absolute left-0 right-0 top-0 bottom-0 flex items-start">
              <div
                className="relative w-full h-[90%] rounded-[14px] p-[5px] shadow-[0_14px_48px_rgba(0,0,0,0.38)] md:rounded-[16px] md:p-1.5"
                style={{ background: prize.panelGradient }}
              >
                <div className="relative flex h-full min-h-[200px] w-full min-w-0 flex-col overflow-hidden rounded-[10px] bg-white shadow-[inset_0_2px_0_rgba(255,255,255,0.95),inset_0_-2px_12px_rgba(15,23,42,0.04)] md:min-h-[240px] md:rounded-[12px]">
                  <div
                    className="flex min-h-0 flex-1 items-center justify-center gap-2 px-2 py-4 md:gap-4 md:px-6 md:py-6"
                    role="group"
                    aria-label="Ba chữ số kết quả"
                  >
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        ref={(el) => {
                          ticketSlotRefs.current[i] = el;
                        }}
                        className="flex aspect-3/4 min-h-[72px] w-[22%] max-w-[88px] min-w-[52px] flex-col items-center justify-center rounded-[10px] border-2 border-dashed border-slate-200/95 bg-linear-to-b from-slate-50/90 to-white shadow-[0_1px_0_rgba(255,255,255,0.9)] md:min-h-[96px] md:max-w-[104px] md:rounded-[12px]"
                      >
                        <span
                          className="select-none tabular-nums"
                          style={{
                            fontFamily: "'Oswald', sans-serif",
                            fontWeight: 900,
                            fontSize: "clamp(28px, 5vw + 8px, 56px)",
                            lineHeight: 1,
                            color:
                              ticketBoard[i] !== null ? "#000000" : "#b8d4ff",
                            textShadow:
                              ticketBoard[i] !== null
                                ? "0 1px 0 rgba(255,255,255,0.18)"
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
