import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import buttonX from '../assets/button_X.png';
import arrowActive from '../assets/arrow_active.png';
import arrowInactive from '../assets/arrow_inactive.png';
import cellKozocom from '../assets/honey_cell_kozocom.png';
import cellBoom from '../assets/honey_cell_boom.png';
import cellGift from '../assets/honey_cell_gift.png';
import cellCombo3 from '../assets/honey_cell_kozocom_combo3.png';
import giftBig from '../assets/gift_big.png';
import giftMedium from '../assets/gift_medium.png';
import giftSmall from '../assets/gift_small.png';

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
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
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
            className="relative w-full max-w-[800px] h-[60vh] aspect-800/500 bg-[#FFF3C5] rounded-[2.5rem] border-[6px] border-[#F0BC3E] shadow-2xl overflow-hidden flex flex-col p-6 sm:p-10 select-none"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 active:scale-90 transition-transform z-20"
            >
              <img src={buttonX} alt="Close" className="w-full h-full object-contain" />
            </button>

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
                    <h2 className="text-[#6B441F] text-xl sm:text-2xl font-black mb-3">Cách thức tham gia:</h2>
                    <ul className="text-[#6B441F] text-sm sm:text-base space-y-1 mb-6 list-disc pl-5 font-semibold">
                      <li>Mỗi người chơi có tối đa 04 lần lựa chọn ô chữ trong một lượt chơi.</li>
                      <li>Người chơi lần lượt chọn từng ô để khám phá nội dung bên trong.</li>
                    </ul>

                    <div className="grid grid-cols-2 gap-4 flex-1">
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
                        icon={cellCombo3}
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
                    <h2 className="text-[#6B441F] text-xl sm:text-2xl font-black mb-3">Danh sách quà:</h2>
                    <p className="text-[#6B441F] text-sm sm:text-base mb-6 font-semibold list-disc pl-5">
                      • Mỗi trường hợp sẽ có các phần quà khác nhau, cùng khám phá
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
            <div className="flex justify-center gap-6 mt-4">
              <button onClick={handlePrev} className="active:scale-95 transition-transform">
                <img src={currentPage === 0 ? arrowInactive : arrowActive} alt="Next" className="w-12 sm:w-16 h-auto" />
              </button>
              <button onClick={handleNext} className="active:scale-95 transition-transform">
                <img src={currentPage === 1 ? arrowInactive : arrowActive} alt="Prev" className="w-12 sm:w-16 h-auto rotate-180" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function RuleBlock({ icon, text, className = "" }: { icon: string, text: string, className?: string }) {
  return (
    <div className={`bg-[#FFFBEC] rounded-2xl border-2 border-[#FFE49A] p-2 sm:p-3 flex items-center gap-3 drop-shadow-sm ${className}`}>
      <div className="w-14 sm:w-18 h-12 sm:h-16 shrink-0">
        <img src={icon} alt="" className="w-full h-full object-contain" />
      </div>
      <p className="text-[#6B441F] text-[11px] sm:text-[13px] font-bold leading-tight flex-1">{text}</p>
    </div>
  );
}

function GiftBlock({ icons, label, comboIcon, prizeIcon, text, noIconText }: { icons?: string[], label?: string, comboIcon?: string, prizeIcon: string, text: string, noIconText?: string }) {
  return (
    <div className="flex items-center gap-3 w-full h-[30%]">
      <div className="flex-1 h-full bg-[#FFFBEC] rounded-2xl border-2 border-[#FFE49A] p-2 flex items-center justify-center gap-2">
        {noIconText ? (
          <p className="text-[#6B441F] text-[11px] sm:text-[13px] font-bold text-center leading-tight px-4">{noIconText}</p>
        ) : (
          <>
            <div className="h-10 sm:h-12">
              <img src={icons?.[0]} alt="" className="h-full object-contain" />
            </div>
            {label && <span className="text-[#6B441F] font-bold text-xs">{label}</span>}
            {comboIcon && <div className="h-10 sm:h-12"><img src={comboIcon} alt="" className="h-full object-contain" /></div>}
          </>
        )}
      </div>

      <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="shrink-0">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="#B38F2B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>

      <div className="flex-[1.5] h-full bg-[#FFFBEC] rounded-2xl border-2 border-[#FFE49A] p-2 flex items-center gap-4">
        <div className="h-10 sm:h-14 shrink-0 ml-2">
          <img src={prizeIcon} alt="" className="h-full object-contain" />
        </div>
        <p className="text-[#6B441F] text-[12px] sm:text-[15px] font-black">{text}</p>
      </div>
    </div>
  )
}
