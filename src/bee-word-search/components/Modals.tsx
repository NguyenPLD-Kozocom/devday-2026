import { Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import buttonDefault from "../assets/button-default.svg";
import buttonDanger from "../assets/button-danger.svg";
import giftModal from "../assets/gift-modal.svg";
import boomModal from "../assets/boom-modal.svg";
import giftSpecial from "../assets/gift-spectial.svg";
import giftUnboxModal from "../assets/gift-unbox-modal.svg";

import { audio } from "../utils/audio";

interface BaseModalProps {
  isOpen: boolean;
  type?: "info" | "error";
  icon: string;
  title: string;
  titleClassName?: string;
  imgClassName?: string;
  children: React.ReactNode;
  isLarge?: boolean;
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
}: BaseModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#5E4400] z-100 opacity-65!"
          />
          <div className="fixed inset-0 flex items-center justify-center z-101 pointer-events-none p-4">
            <motion.div
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={cn(
                "px-[80px] flex items-center justify-between flex-col py-[60px] w-[930px] pointer-events-auto text-center relative text-white shadow-2xl",
                isLarge ? "h-[792px]" : "h-[752px]"
              )}
              style={{
                border: "8px solid transparent",
                borderRadius: "40px",
                background:
                  type === "error"
                    ? "linear-gradient(#FFD9DA, #FFD9DA) padding-box, linear-gradient(180deg, #D51F02 0%, #9D1701 100%) border-box"
                    : "linear-gradient(#FFE6A9, #FFE6A9) padding-box, linear-gradient(180deg, #E2B137 0%, #B26510 100%) border-box",
              }}
            >
              <img
                src={icon}
                alt=""
                className={cn("mb-[40px]", imgClassName)}
              />
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
    <Modal
      isOpen={isOpen}
      icon={giftModal}
      title={""}
      isLarge={true}
    >
      <p className="text-[38px] mb-2 text-[#623C00] font-medium leading-[1.2] mt-2">
        <strong>Chúc mừng!</strong> Bạn có thể chọn <strong>Chốt quà!</strong> để nhận quà ngay, hoặc <strong>Tiếp tục chơi</strong> để săn giải thưởng lớn hơn.
      </p>
      <p className="text-[38px] mb-8 text-[#623C00] font-medium leading-[1.2]">
        <strong>Cẩn thận nhé:</strong> Nếu trúng bom, toàn bộ quà trước đó sẽ bị hủy đấy!
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
      icon={boomModal}
      title={"Ối giời ôi! Nổ rồi!"}
      titleClassName="font-bold"
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

  const handleRestart = () => {
    audio.playClick();
    onRestart();
  };

  return (
    <Modal
      isOpen={isOpen}
      icon={giftSpecial}
      title={isSpecial ? "Đỉnh của chóp!" : "Chúc mừng! Bạn đã hoàn thành."}
      titleClassName="font-bold mt-[320px]"
      imgClassName="absolute -top-[68px]"
    >
      <p className="text-[38px] text-[#623C00] font-medium leading-[42px] mt-2 mb-[60px]">
        {isSpecial
          ? "May mắn nhất hệ mặt trời. Người đâu, ban ngay Phần quà đặc biệt!"
          : "Bạn đã ghép đủ chữ Kozocom. Tiếp tục phát huy nhé!"}
      </p>

      <button
        onClick={handleRestart}
        className="font-cubano group relative w-[375px] aspect-286/75 flex items-center justify-center transition-all duration-300 cursor-pointer"
      >
        <img
          src={buttonDefault}
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

export function GiftWinModal({
  isOpen,
  onRestart,
}: {
  isOpen: boolean;
  onRestart: () => void;
}) {
  const handleRestart = () => {
    audio.playClick();
    onRestart();
  };

  return (
    <Modal
      isOpen={isOpen}
      icon={giftUnboxModal}
      title={"Chốt quà thành công!"}
      imgClassName="absolute top-0"
      titleClassName="mt-[345px] font-bold"
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
