import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/cn";
import buttonX from "../assets/button_X.png";
import arrowActive from "../assets/arrow_active.png";
import arrowInactive from "../assets/arrow_inactive.png";
import cellKozocom from "../assets/honey_cell_kozocom.png";
import cellBoom from "../assets/honey_cell_boom.png";
import cellGift from "../assets/honey_cell_gift.png";
import cellCombo3 from "../assets/honey_cell_kozocom_combo3.png";
import giftBig from "../assets/gift_big.png";
import giftMedium from "../assets/gift_medium.png";
import giftSmall from "../assets/gift_small.png";
import cellKo from "../assets/honey_cell_ko.png";
import cellZo from "../assets/honey_cell_zo.png";
import cellCom from "../assets/honey_cell_com.png";

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
  const [currentPage, setCurrentPage] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => setCurrentPage(1);
  const handlePrev = () => setCurrentPage(0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center px-[100px] py-[46.5px]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-full max-h-full aspect-800/500 bg-[#FFE6A9] rounded-[2.5rem] border-[6px] border-[#F0BC3E] shadow-2xl flex flex-col md:p-16 md:pb-[60px] select-none"
          >
            {/* Close Button — outside overflow-hidden so it's never clipped */}
            <button
              onClick={onClose}
              className="cursor-pointer absolute -top-[35px] -right-[35px] w-[66px] h-[68px] active:scale-90 transition-transform z-20"
            >
              <img
                src={buttonX}
                alt="Close"
                className="w-full h-full object-contain"
              />
            </button>

            {/* Inner wrapper clips only content, not the Close Button */}
            <div className="overflow-hidden flex-1 h-full flex flex-col justify-between">
              {/* Content Area */}
              <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                  {currentPage === 0 ? (
                    <motion.div
                      key="page-rules"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      className="h-full flex flex-col"
                    >
                      <h2 className="text-[#623C00] text-[38px] font-black font-main">
                        Cách thức tham gia:
                      </h2>
                      <ul className="list-none text-[#623C00] text-[38px] space-y-1 mb-6 pl-5 font-medium font-main ">
                        <li className="mb-0">
                          <span className="mr-4">•</span>
                          <span className="leading-none">
                            Mỗi người chơi có tối đa 04 lần lựa chọn ô chữ trong
                            một lượt chơi.
                          </span>
                        </li>
                        <li className="mb-0">
                          <span className="mr-4">•</span>
                          <span className="leading-none">
                            Người chơi lần lượt chọn từng ô để khám phá nội dung
                            bên trong.
                          </span>
                        </li>
                      </ul>

                      <div className="grid grid-cols-2 gap-7.5 flex-1">
                        <RuleBlock
                          icon={cellKozocom}
                          text="Nhận ngay Phần quà đặc biệt của chương trình."
                        />
                        <RuleBlock
                          icon={cellBoom}
                          text="Lượt chơi kết thúc ngay lập tức, người chơi mất quyền lựa chọn các ô còn lại."
                        />
                        <RuleBlock
                          icon={cellGift}
                          text="MC sẽ xác nhận bạn muốn 'Dừng lại nhận quà' hay 'Tiếp tục chơi' để tìm kiếm giải thưởng lớn hơn. Nếu tiếp tục và không may trúng Boom, quà trước đó sẽ bị hủy."
                          className="col-span-2"
                        />
                        <RuleBlock
                          icons={[cellKo, cellZo, cellCom]}
                          text="Nếu chọn đủ và ghép được 3 chữ lẻ 'Ko' + 'Zo' + 'Com' (trong 4 lần chọn): Nhận ngay Phần quà đặc biệt."
                          className="col-span-2"
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="page-gifts"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      className="h-full flex flex-col"
                    >
                      <h2 className="text-[#6B441F] text-xl sm:text-2xl font-black mb-3">
                        Danh sách quà:
                      </h2>
                      <p className="text-[#6B441F] text-sm sm:text-base mb-6 font-semibold list-disc pl-5">
                        • Mỗi trường hợp sẽ có các phần quà khác nhau, cùng khám
                        phá
                      </p>

                      <div className="flex flex-col gap-3 flex-1 h-full">
                        <GiftBlock
                          icons={[cellKozocom]}
                          label="Hoặc"
                          comboIcon={cellCombo3}
                          prizeIcon={giftBig}
                          text="Áo thun + Quạt + Ly giữ nhiệt"
                        />
                        <GiftBlock
                          icons={[cellGift]}
                          prizeIcon={giftMedium}
                          text="Gấu / Quạt / Bút + Quạt / Bút x2"
                        />
                        <GiftBlock
                          noIconText="Các trường hợp không đủ ghép thành chữ Kozocom"
                          prizeIcon={giftSmall}
                          text="Kẹo mút"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation Arrows */}
              <div className="flex justify-center gap-6 mt-[30px]">
                <button
                  onClick={handlePrev}
                  className={cn(
                    "active:scale-95 transition-transform",
                    currentPage !== 0 ? "cursor-pointer" : "cursor-default",
                  )}
                >
                  <img
                    src={currentPage === 0 ? arrowInactive : arrowActive}
                    alt="Next"
                    className="w-12 sm:w-16 h-auto"
                  />
                </button>
                <button
                  onClick={handleNext}
                  className={cn(
                    "active:scale-95 transition-transform",
                    currentPage !== 1 ? "cursor-pointer" : "cursor-default",
                  )}
                >
                  <img
                    src={currentPage === 1 ? arrowInactive : arrowActive}
                    alt="Prev"
                    className="w-12 sm:w-16 h-auto rotate-180"
                  />
                </button>
              </div>
            </div>
            {/* end inner overflow-hidden wrapper */}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function RuleBlock({
  icon,
  icons,
  text,
  className = "",
}: {
  /** Single icon (fallback when `icons` is not provided) */
  icon?: string;
  /** Multiple icons rendered side by side */
  icons?: string[];
  text: string;
  className?: string;
}) {
  const iconList = icons ?? (icon ? [icon] : []);

  return (
    <div
      className={`bg-[#F4D78F] rounded-2xl border-2 border-[#E2B137] p-2 md:p-5 flex items-center gap-10 drop-shadow-sm ${className}`}
    >
      <div className="w-auto sm:w-auto h-12 sm:h-[130px] shrink-0 flex items-center justify-center gap-2">
        {iconList.map((src, i) => (
          <img key={i} src={src} alt="" className="h-full object-contain" />
        ))}
      </div>
      <p className="text-[#623C00] text-[32px] sm:text-[32px] font-medium font-main leading-tight flex-1">
        {text}
      </p>
    </div>
  );
}

function GiftBlock({
  icons,
  label,
  comboIcon,
  prizeIcon,
  text,
  noIconText,
}: {
  icons?: string[];
  label?: string;
  comboIcon?: string;
  prizeIcon: string;
  text: string;
  noIconText?: string;
}) {
  return (
    <div className="flex items-center gap-3 w-full h-[30%]">
      <div className="flex-1 h-full bg-[#FFFBEC] rounded-2xl border-2 border-[#FFE49A] p-2 flex items-center justify-center gap-2">
        {noIconText ? (
          <p className="text-[#6B441F] text-[11px] sm:text-[13px] font-bold text-center leading-tight px-4">
            {noIconText}
          </p>
        ) : (
          <>
            <div className="h-10 sm:h-12">
              <img src={icons?.[0]} alt="" className="h-full object-contain" />
            </div>
            {label && (
              <span className="text-[#6B441F] font-bold text-xs">{label}</span>
            )}
            {comboIcon && (
              <div className="h-10 sm:h-12">
                <img src={comboIcon} alt="" className="h-full object-contain" />
              </div>
            )}
          </>
        )}
      </div>

      <motion.div
        animate={{ x: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="shrink-0"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 12H19M19 12L13 6M19 12L13 18"
            stroke="#B38F2B"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      <div className="flex-[1.5] h-full bg-[#FFFBEC] rounded-2xl border-2 border-[#FFE49A] p-2 flex items-center gap-4">
        <div className="h-10 sm:h-14 shrink-0 ml-2">
          <img src={prizeIcon} alt="" className="h-full object-contain" />
        </div>
        <p className="text-[#6B441F] text-[12px] sm:text-[15px] font-black">
          {text}
        </p>
      </div>
    </div>
  );
}
