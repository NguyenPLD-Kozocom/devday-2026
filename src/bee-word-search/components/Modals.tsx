import { Fragment, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import buttonDefault from "../assets/button-default.svg";
import buttonDanger from "../assets/button-danger.svg";
import giftModal from "../assets/gift-modal.svg";
import boomModal from "../assets/boom-modal.svg";
import giftUnboxModal from "../assets/gift-unbox-modal.svg";
import gift1 from "../assets/gift-1.png";
import gift2 from "../assets/gift-2.png";
import gift3 from "../assets/gift-3.png";
import gift4 from "../assets/gift-4.png";
import gameOverGif from "../assets/game-over.gif";

import { audio } from "../utils/audio";
import kozocomVideo from "../assets/kozocom.webm";
import { CelebrationEffects } from "./CelebrationEffects";

interface BaseModalProps {
  isOpen: boolean;
  type?: "info" | "error";
  icon: string | React.ReactNode;
  title: string;
  titleClassName?: string;
  imgClassName?: string;
  children: React.ReactNode;
  isLarge?: boolean;
  isContentHidden?: boolean;
  isOverlayPersistent?: boolean;
  persistentFooter?: React.ReactNode;
  backgroundEffects?: React.ReactNode;
}

function Modal({
  isOpen,
  type = "info",
  icon,
  title,
  titleClassName,
  imgClassName,
  children,
  isLarge,
  isContentHidden,
  isOverlayPersistent,
  persistentFooter,
  backgroundEffects,
}: BaseModalProps) {
  const overlayOpacity = isContentHidden ? (isOverlayPersistent ? 0.35 : 0) : 0.65;
  const blurAmount = isContentHidden && isOverlayPersistent ? "4px" : "0px";

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{
              opacity: overlayOpacity,
              backdropFilter: `blur(${blurAmount})`
            }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-black z-100"
          />
          <div className="fixed inset-0 flex items-center justify-center z-101 pointer-events-none p-4">
            {backgroundEffects}
            <motion.div
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={cn(
                "px-[80px] flex items-center justify-between flex-col py-[60px] w-[930px] pointer-events-auto text-center relative text-white",
                isLarge ? "h-[792px]" : "h-[752px]",
              )}
            >
              {/* Background layer */}
              <motion.div
                initial={false}
                animate={{ opacity: isContentHidden ? 0 : 1 }}
                className="absolute inset-0 shadow-2xl z-[-1]"
                style={{
                  border: "8px solid transparent",
                  borderRadius: "40px",
                  background:
                    type === "error"
                      ? "linear-gradient(#FFD9DA, #FFD9DA) padding-box, linear-gradient(180deg, #D51F02 0%, #9D1701 100%) border-box"
                      : "linear-gradient(#FFE6A9, #FFE6A9) padding-box, linear-gradient(180deg, #E2B137 0%, #B26510 100%) border-box",
                  pointerEvents: isContentHidden ? "none" : "auto",
                }}
              />

              {/* Icon / Video */}
              {typeof icon === "string" ? (
                <img
                  src={icon}
                  alt=""
                  className={cn("mb-[40px]", imgClassName)}
                />
              ) : (
                <div className={cn("mb-[40px]", imgClassName)}>{icon}</div>
              )}

              {/* Main Content */}
              <motion.div
                initial={false}
                animate={{ opacity: isContentHidden ? 0 : 1 }}
                className="flex flex-col items-center flex-1 w-full h-full justify-between"
              >
                <h2
                  className={cn(
                    "font-main text-[38px] font-medium mb-1 tracking-wider text-[#623C00] leading-none",
                    titleClassName,
                  )}
                >
                  {title}
                </h2>
                {children}
              </motion.div>

              {/* Persistent elements like the restart button */}
              {persistentFooter}
            </motion.div>
          </div>
        </Fragment>
      )}
    </AnimatePresence>
  );
}

export function GiftModal({
  isOpen,
  onClaim,
  onContinue,
}: {
  isOpen: boolean;
  onClaim: () => void;
  onContinue: () => void;
}) {
  const handleClaim = () => {
    audio.playClick();
    onClaim();
  };

  const handleContinue = () => {
    audio.playClick();
    onContinue();
  };

  return (
    <Modal isOpen={isOpen} icon={giftModal} title={""} isLarge={true}>
      <p className="text-[38px] mb-2 text-[#623C00] font-medium leading-[1.2] mt-2">
        <strong>Chúc mừng!</strong> Bạn có thể chọn <strong>Chốt quà!</strong>{" "}
        để nhận quà ngay, hoặc <strong>Tiếp tục chơi</strong> để săn giải thưởng
        lớn hơn.
      </p>
      <p className="text-[38px] mb-8 text-[#623C00] font-medium leading-[1.2]">
        <strong>Cẩn thận nhé:</strong> Nếu trúng bom, toàn bộ quà trước đó sẽ bị
        hủy đấy!
      </p>
      <div className="flex items-center justify-center flex-row gap-[50px]">
        <button
          onClick={handleClaim}
          className="font-cubano group relative w-[375px] aspect-286/75 flex items-center justify-center transition-all duration-300 cursor-pointer"
        >
          <img
            src={buttonDanger}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <span className="btn-label relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
            Chốt quà!
          </span>
        </button>
        <button
          onClick={handleContinue}
          className="font-cubano group relative w-[375px] aspect-286/75 flex items-center justify-center transition-all duration-300 cursor-pointer"
        >
          <img
            src={buttonDefault}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <span className="btn-label relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
            Tiếp tục chơi
          </span>
        </button>
      </div>
    </Modal>
  );
}

export function LoseModal({
  isOpen,
  type,
  onRestart,
}: {
  isOpen: boolean;
  type: "boom" | "outOfTurns" | null;
  onRestart: () => void;
}) {
  const handleRestart = () => {
    audio.playClick();
    onRestart();
  };

  return (
    <Modal
      isOpen={isOpen}
      type="error"
      icon={type === "boom" ? boomModal : gameOverGif}
      title={type === "boom" ? "Ối giời ôi! Nổ rồi!" : "Chúc bạn may mắn lần sau!"}
      titleClassName="font-bold"
      imgClassName={type === "outOfTurns" ? "w-[440px] h-auto object-contain" : ""}
    >
      <p className="text-[38px] mb-8 text-[#623C00] font-medium">
        {type === "boom"
          ? "...nhưng là nổ bom. Xin chia buồn!"
          : "Bạn đã hết lượt chơi rồi."}
      </p>
      <button
        onClick={handleRestart}
        className="font-cubano group relative w-[375px] aspect-286/75 flex items-center justify-center transition-all duration-300 cursor-pointer"
      >
        <img
          src={buttonDanger}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <span className="btn-label relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
          Chơi lại
        </span>
      </button>
    </Modal>
  );
}

export function WinModal({
  isOpen,
  onRestart,
  winningTiles,
}: {
  isOpen: boolean;
  onRestart: () => void;
  winningTiles?: { content: string }[] | null;
}) {
  const isSpecial = winningTiles?.some((t) => t.content === "Kozocom");
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isContentHidden, setIsContentHidden] = useState(false);
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const [showRestartButton, setShowRestartButton] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      audio.playVictoryMusic();
      setIsVideoPlaying(false);
      setIsContentHidden(false);
      setIsVideoFinished(false);
      setShowRestartButton(false);

      const playTimer = setTimeout(() => {
        setIsVideoPlaying(true);
        videoRef.current?.play();
      }, 0);

      const hideTimer = setTimeout(() => {
        setIsContentHidden(true);
      }, 2000);

      return () => {
        clearTimeout(playTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (isVideoFinished) {
      setShowRestartButton(true);
    }
  }, [isVideoFinished]);

  const handleRestart = () => {
    audio.playClick();
    audio.stopVictoryMusic();
    onRestart();
  };

  return (
    <Modal
      isOpen={isOpen}
      isContentHidden={isContentHidden}
      isOverlayPersistent={true}
      backgroundEffects={isOpen && <CelebrationEffects />}
      persistentFooter={
        <AnimatePresence>
          {showRestartButton && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleRestart}
              className="font-cubano group relative w-[375px] aspect-286/75 flex items-center justify-center transition-all duration-300 cursor-pointer mb-[20px] translate-y-32 z-50"
            >
              <img
                src={buttonDefault}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
              <span className="btn-label relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                Chơi lại
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      }
      icon={
        <video
          ref={videoRef}
          src={kozocomVideo}
          muted
          playsInline
          className="w-screen scale-150 z-100 aspect-square object-contain"
          style={{ visibility: isVideoPlaying ? "visible" : "hidden" }}
          onEnded={() => setIsVideoFinished(true)}
        />
      }
      title={isSpecial ? "Đỉnh của chóp!" : "Chúc mừng! Bạn đã hoàn thành."}
      titleClassName="font-bold mt-[320px]"
      imgClassName="absolute -top-[160px]"
    >
      <p className="text-[38px] text-[#623C00] font-medium leading-[42px] mt-2 mb-[60px]">
        {isSpecial
          ? "May mắn nhất hệ mặt trời. Người đâu, ban ngay Phần quà đặc biệt!"
          : "Bạn đã ghép đủ chữ Kozocom. Tiếp tục phát huy nhé!"}
      </p>
    </Modal>
  );
}

export function GiftWinModal({
  isOpen,
  onRestart,
  giftContent,
}: {
  isOpen: boolean;
  onRestart: () => void;
  giftContent?: string;
}) {
  const handleRestart = () => {
    audio.playClick();
    onRestart();
  };

  const getGiftImage = () => {
    switch (giftContent) {
      case "gift-1":
        return gift1;
      case "gift-2":
        return gift2;
      case "gift-3":
        return gift3;
      case "gift-4":
        return gift4;
      default:
        return giftUnboxModal;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      icon={getGiftImage()}
      title={"Chốt quà thành công!"}
      isLarge={true}
      imgClassName={cn(
        "absolute left-1/2 -translate-x-1/2 transition-all duration-500 top-0",
        giftContent ? "w-[500px]" : "",
      )}
      titleClassName={cn(
        "font-bold transition-all duration-500",
        giftContent ? "mt-[400px]" : "mt-[345px]",
      )}
    >
      <p className="text-[38px] text-[#623C00] font-medium leading-[1.2] mt-4 mb-4 px-10">
        Đúng hệ "ăn chắc mặc bền". Chúc mừng bạn đã rinh về quà xịn từ Kozocom!
      </p>
      <button
        onClick={handleRestart}
        className="font-cubano group relative w-[375px] aspect-286/75 flex items-center justify-center transition-all duration-300 cursor-pointer mt-[20px]"
      >
        <img
          src={buttonDefault}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <span className="btn-label relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
          CHƠI LẠI
        </span>
      </button>
    </Modal>
  );
}
