import { useEffect, Fragment, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { HexagonTile } from './HexagonCell';
import type { TileData } from '../App';

const MESSAGES = {
  gift: {
    titles: ["LỘC TRỜI CHO 🎁", "QUÀ TỚI CẢN KHÔNG KỊP 💝", "HÚP TRỌN LỘC LÁ 🎁", "WOW, QUÀ XỊN XÒ! 💝", "CƠ HỘI ĐỔI ĐỜI? 🎁", "LỘC LÁ ĐẦY NHÀ 💝", "TỔ ĐỘ RỒI BẠN ƠI 🎁"],
    bodies: [
      "Ê khoan, có quà nè! Húp luôn cho nóng hay 'tất tay' săn giải Đặc Biệt đây? Liều thì ăn nhiều, mà rén là 'còn cái nịt' nha!",
      "Quà tới cản không kịp! Nhận ngay kẻo lỡ hay định 'all-in' vào giải to hơn? Tổ nghề đang độ đó, tin tay lên!",
      "Một món quà nhỏ, một niềm vui to! Dừng lại hưởng thụ hay tiếp tục dấn thân vào con đường tơ lụa Kozocom?",
      "Lộc lá đầy nhà! Lấy luôn hay muốn thử thách nhân phẩm thêm chút nữa? Đừng để tiền rơi nhé bạn hiền!",
      "Wow, quà xịn xò con bò! Nhận luôn cho chắc hay muốn 'bay lắc' tiếp để tìm kho báu thực sự?",
      "Cơ hội ngàn năm! Húp luôn món quà này hay định chơi khô máu với admin? Cẩn thận cái nịt nha!",
      "Món quà này đủ làm bạn ấm lòng chưa? Hay muốn làm quả 'chốt đơn' Kozocom cho nó rực rỡ?"
    ],
    buttons: { claim: "Húp luôn", continue: "Chơi tới bến" }
  },
  lose: {
    boom: {
      titles: ["CÁI KẾT ĐẮNG 💥", "BÙM CHÍ CHÍ 💥", "ĐỜI KHÔNG NHƯ LÀ MƠ 💥", "QUÁ NHỌ CHO ĐỘI ĐỎ 💥", "NỔ VANG TRỜI 💥", "KIẾP NẠN THỨ 82 💥", "XUI THÔI ĐỪNG VUI QUÁ 💥"],
      bodies: [
        "Quá tam ba bận nhưng xui là dẫm phải mìn! 'Đúng người sai thời điểm' rồi sen ơi.",
        "Bùm! Một phút bốc đồng là cả đời bốc... mìn. Chia buồn cùng thí sinh xấu số nhất năm!",
        "Mìn này là mìn tình hay mìn tiền mà đau thế? Thôi thì kiếp này coi như bỏ, làm lại ván mới!",
        "Nổ vang trời dậy đất! Nhân phẩm hôm nay có vẻ đi vắng rồi, về thắp nhang khấn tổ thôi.",
        "Ăn mìn thay cơm là có thật! Cay đắng quá, ai thấu nỗi đau này cho bạn đây?",
        "Đang vui thì đứt dây đàn, đang săn Kozocom thì dẫm phải quả 'bom'. Quá nhọ!",
        "Ngã ở đâu chơi lại ở đó! Quả mìn này chỉ là thử thách cho ý chí của bạn thôi!"
      ],
      button: "LÀM LẠI CUỘC ĐỜI"
    },
    turns: {
      titles: ["HẾT NƯỚC CHẤM 😢", "NGUỒN LỰC CẠN KIỆT 😢", "TIẾC QUÁ ĐI À 😢", "NHÂN PHẨM HƠI LOW 😢", "HẾT LƯỢT RỒI SEN ƠI 😢", "DỪNG CUỘC CHƠI TẠI ĐÂY 😢", "HẸN KIẾP SAU NHA 😢"],
      bodies: [
        "Hết lượt rồi! Hôm nay 'nhân phẩm' hơi low, thôi thì vui thôi đừng vui quá.",
        "Cố quá thành quá cố! Hết lượt mà vẫn chưa thấy Kozocom đâu, buồn của bạn!",
        "Game là dễ... nếu bạn còn lượt! Tiếc là đời không cho phép, dừng cuộc chơi tại đây.",
        "Hết nước chấm thật sự! Tìm mãi không thấy, thôi thì về nhà ăn cơm mẹ nấu cho lành.",
        "Gần lắm mà cũng xa lắm! Hết lượt mất rồi, hẹn gặp lại ở ván sau nha.",
        "Quá buồn cho một cuộc tình! Hết lượt khi đang ở đỉnh cao phong độ. Đắng lòng!",
        "Dừng chân tại đây thôi chiến binh! Nạp thêm 'nhân phẩm' rồi quay lại phục thù nhé."
      ],
      button: "PHỤC THÙ"
    }
  },
  win: {
    special: {
      titles: ["ĐỈNH CỦA CHÓP 🏆", "HÀO QUANG RỰC RỠ 🏆", "NHÂN PHẨM VÔ CỰC 🏆", "VÔ ĐỊCH THIÊN HẠ 🏆", "HẾT SẢY CON BÀ BẢY 🏆", "CON CƯNG ADMIN 🏆", "CHÚC MỪNG PRO 🏆"],
      bodies: [
        "TUYỆT VỜI ÔNG MẶT TRỜI! Bạn đã húp trọn ô KOZOCOM ĐẶC BIỆT! Nhân phẩm vô cực luôn kìa!",
        "Đỉnh cao trí tuệ, đỉnh của chóp luôn! Ô Kozocom đặc biệt đã thuộc về bạn. Quá ghê gớm!",
        "Hào quang rực rỡ! Bạn chính là 'con cưng' của Kozocom rồi. Thắng lớn rồi nhé!",
        "Không tin vào mắt mình luôn! Ô đặc biệt hiện ra như một phép màu. Chúc mừng pro!",
        "Nhân phẩm này chắc phải tu 9 kiếp mới có được! Thắng quá thuyết phục luôn bạn ơi.",
        "Vô địch thiên hạ! Chỉ một phát chọn mà trúng ngay ô 'vàng'. Đỉnh thật sự!",
        "Hết sảy con bà bảy! Thắng thế này thì ai chơi lại? Chúc mừng chiến thắng rực rỡ!"
      ]
    },
    word: {
      titles: ["KEO LÌ TÁI CHÍ 🏆", "GHÊ CHƯA GHÊ CHƯA 🏆", "THÁNH GOM MẢNH 🏆", "HỢP THỂ THÀNH CÔNG 🏆", "CHIẾN THẮNG NGỌT NGÀO 🏆", "10 ĐIỂM KHÔNG CÓ NHƯNG 🏆", "CAO THỦ GHÉP CHỮ 🏆"],
      bodies: [
        "Ghê chưa ghê chưa! Ghép đủ chữ KOZOCOM luôn mới chịu. 10 điểm không có nhưng!",
        "Keo lì thật sự! Gom đủ 3 mảnh ghép như một vị thần. Chiến thắng này quá xứng đáng!",
        "Ghép chữ như ghép tình, quá chuẩn bài! Chúc mừng bạn đã hoàn thành bộ sưu tập Kozocom.",
        "Đã đẹp trai/xinh gái lại còn may mắn ghép đủ chữ. Quá nể phục bạn luôn!",
        "Kozocom đã hội tụ đủ anh tài! Bạn đã thắng nhờ sự kiên trì và một chút 'đỏ'. Quá xịn!",
        "Hợp thể thành công! Bộ ba Ko-Zo-Com đã giúp bạn lên đỉnh vinh quang. Quá cháy!",
        "Đúng là có làm có may mới thắng được! Chiến thắng này là dành cho bạn!"
      ]
    },
    gift: {
      titles: ["QUÀ XỊN VỀ TAY 🎁", "HÚP TRỌN LỘC LÁ 💝", "NHÂN PHẨM ĐỈNH CAO 🎁", "CHÚC MỪNG PHÚ HỘ 💝", "LỘC TRỜI CHO 🎁", "GIÀU SANG PHÚ QUÝ 💝", "TỔ ĐỘ THẬT SỰ 🎁"],
      bodies: [
        "Quá dữ luôn bạn ơi! Một món quà xịn xò đã chính thức thuộc về bạn. Chúc mừng nhé!",
        "Húp trọn quả lộc này thì còn gì bằng? Bạn đúng là cao thủ săn quà của Kozocom!",
        "Nhân phẩm thế này thì ai chơi lại? Quà về tay, tiền đầy túi, vui quá xá quà xa!",
        "Chúc mừng tân phú hộ! Món quà này là phần thưởng xứng đáng cho sự quyết đoán của bạn.",
        "Lộc trời đã định, không nhận không được! Chúc mừng bạn đã húp trọn món quà giá trị.",
        "Giàu sang phú quý là đây chứ đâu! Cầm quà trên tay mà lòng vui phơi phới đúng không?",
        "Tổ nghề độ bạn thật sự rồi! Một phát ăn ngay, quà xịn về đội. Quá tuyệt vời!"
      ]
    },
    button: "QUÁ GHÊ GỚM!"
  }
};

interface BaseModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
}

function Modal({ isOpen, title, children }: BaseModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-kozo-dark/80 backdrop-blur-md z-100"
          />
          <div className="fixed inset-0 flex items-center justify-center z-101 pointer-events-none p-4">
            <motion.div
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-modal rounded-3xl p-8 sm:p-10 max-w-md w-full pointer-events-auto text-center relative overflow-hidden text-white border-t border-white/20 shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-white/5 to-transparent pointer-events-none" />
              <h2 className="text-2xl sm:text-3xl font-black mb-6 tracking-wider text-kozo-gold drop-shadow-md">{title}</h2>
              {children}
            </motion.div>
          </div>
        </Fragment>
      )}
    </AnimatePresence>
  );
}

export function GiftModal({ isOpen, onClaim, onContinue }: { isOpen: boolean, onClaim: () => void, onContinue: () => void }) {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setMsgIdx(Math.floor(Math.random() * MESSAGES.gift.titles.length));
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} title={MESSAGES.gift.titles[msgIdx]}>
      <p className="text-lg mb-8 text-gray-300 font-medium italic">{MESSAGES.gift.bodies[msgIdx]}</p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={onClaim} className="flex-1 bg-linear-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform active:scale-95 transition-all outline-none border border-pink-400/50">
          {MESSAGES.gift.buttons.claim}
        </button>
        <button onClick={onContinue} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-bold py-3 px-6 rounded-xl transition-all transform active:scale-95 outline-none">
          {MESSAGES.gift.buttons.continue}
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-6">* Lưu ý: Chơi tiếp mà dẫm mìn là "bay màu" luôn món quà này đó.</p>
    </Modal>
  );
}

export function LoseModal({ isOpen, type, onRestart }: { isOpen: boolean, type: 'boom' | 'outOfTurns' | null, onRestart: () => void }) {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setMsgIdx(Math.floor(Math.random() * 7)); // 7 options for each
    }
  }, [isOpen]);

  const config = type === 'boom' ? MESSAGES.lose.boom : MESSAGES.lose.turns;

  return (
    <Modal isOpen={isOpen} title={config.titles[msgIdx]}>
      <div className="mb-6 flex justify-center">
        <div className={`text-6xl ${type === 'boom' ? 'animate-pulse drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'animate-bounce drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]'}`}>
          {type === 'boom' ? '💣' : '😢'}
        </div>
      </div>
      <p className={`text-xl font-bold mb-8 text-center px-4 ${type === 'boom' ? 'text-red-400' : 'text-gray-300'}`}>
        {config.bodies[msgIdx]}
      </p>
      <button onClick={onRestart} className={`w-full ${type === 'boom' ? 'bg-[#1e293b] hover:bg-[#334155] border-red-900/50' : 'bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 border-indigo-400/50'} border text-white font-black py-4 px-6 rounded-xl shadow-lg transform active:scale-95 transition-all text-lg tracking-widest`}>
        {config.button}
      </button>
    </Modal>
  );
}

export function WinModal({ isOpen, onRestart, winningTiles }: { isOpen: boolean, onRestart: () => void, winningTiles?: TileData[] | null }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const isSpecial = winningTiles?.some(t => t.content === 'Kozocom');

  useEffect(() => {
    if (isOpen) {
      setMsgIdx(Math.floor(Math.random() * 7));
      setShowContent(false);

      // Wait for tiles to arrive before showing modal background and text
      const timer = setTimeout(() => setShowContent(true), 800);

      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 200, colors: ['#D4AF37', '#ffffff', '#2563EB'] };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [isOpen]);

  const config = isSpecial ? MESSAGES.win.special : MESSAGES.win.word;

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-kozo-dark/80 backdrop-blur-md z-100"
          />
          <div className="fixed inset-0 flex items-center justify-center z-101 pointer-events-none p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="rounded-3xl p-8 sm:p-10 max-w-md w-full pointer-events-auto text-center relative overflow-hidden text-white border-t border-white/20 shadow-2xl"
            >
              {/* Delayed Background Visuals */}
              <motion.div
                animate={{ opacity: showContent ? 1 : 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 z-0 glass-modal border-white/20"
              />
              <motion.div
                animate={{ opacity: showContent ? 1 : 0 }}
                transition={{ duration: 0.8 }}
                className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-white/5 to-transparent pointer-events-none z-0"
              />

              <div className="relative z-10">
                <motion.h2
                  animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : -10 }}
                  transition={{ duration: 0.5 }}
                  className="text-2xl sm:text-3xl font-black mb-6 tracking-wider text-kozo-gold drop-shadow-md"
                >
                  {config.titles[msgIdx]}
                </motion.h2>

                <div className="mb-12 flex justify-center relative min-h-[160px] sm:min-h-[180px] items-center">
                  {winningTiles && winningTiles.length > 0 ? (
                    <div className="relative flex items-center justify-center gap-2 sm:gap-4">
                      {/* Realistic Sunshine Layers */}
                      <motion.div
                        animate={{ opacity: showContent ? 1 : 0, scale: showContent ? 1 : 0.5 }}
                        transition={{ duration: 1 }}
                        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 ${winningTiles.length > 1 ? 'scale-[2]' : 'scale-150'}`}
                      >
                        <div className="radiant-sun" />
                        <div className="light-rays" />
                      </motion.div>

                      {winningTiles.map((tile) => (
                        <div
                          key={tile.id}
                          className={`relative z-20 sun-shine hex-clip ${winningTiles.length > 1 ? 'w-24 h-28 sm:w-28 sm:h-32' : 'w-32 h-36 sm:w-40 sm:h-44'}`}
                        >
                          <HexagonTile tile={tile} duration={0.8} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-6xl animate-bounce drop-shadow-[0_0_25px_rgba(255,215,0,0.5)]">🎁</div>
                  )}
                </div>

                <motion.div animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 10 }} transition={{ duration: 0.5 }}>
                  <p className="text-xl font-bold mb-8 text-gray-200">
                    {config.bodies[msgIdx]}
                  </p>
                  <button
                    onClick={onRestart}
                    className="w-full bg-linear-to-r from-kozo-gold to-[#FDE047] hover:brightness-110 text-kozo-navy font-black py-4 px-6 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] transform active:scale-95 transition-all text-lg tracking-widest border border-white/40"
                  >
                    {MESSAGES.win.button}
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </Fragment>
      )}
    </AnimatePresence>
  );
}

export function GiftWinModal({ isOpen, onRestart, giftTile }: { isOpen: boolean, onRestart: () => void, giftTile: TileData | null }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMsgIdx(Math.floor(Math.random() * 7));
      setShowContent(false);

      const timer = setTimeout(() => setShowContent(true), 800);

      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 200, colors: ['#FF69B4', '#DA70D6', '#FFFFFF'] };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [isOpen]);

  const config = MESSAGES.win.gift;

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-kozo-dark/80 backdrop-blur-md z-100"
          />
          <div className="fixed inset-0 flex items-center justify-center z-101 pointer-events-none p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="rounded-3xl p-8 sm:p-10 max-w-md w-full pointer-events-auto text-center relative overflow-hidden text-white border-t border-white/20 shadow-2xl"
            >
              <motion.div
                animate={{ opacity: showContent ? 1 : 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 z-0 glass-modal border-white/20"
              />
              <motion.div
                animate={{ opacity: showContent ? 1 : 0 }}
                transition={{ duration: 0.8 }}
                className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-white/5 to-transparent pointer-events-none z-0"
              />

              <div className="relative z-10">
                <motion.h2
                  animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : -10 }}
                  transition={{ duration: 0.5 }}
                  className="text-2xl sm:text-3xl font-black mb-6 tracking-wider text-kozo-gold drop-shadow-md"
                >
                  {config.titles[msgIdx]}
                </motion.h2>

                <div className="mb-12 flex justify-center relative min-h-[160px] sm:min-h-[180px] items-center">
                  {giftTile ? (
                    <div className="relative flex items-center justify-center">
                      <motion.div
                        animate={{ opacity: showContent ? 1 : 0, scale: showContent ? 1 : 0.5 }}
                        transition={{ duration: 1 }}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 scale-150"
                      >
                        <div className="radiant-sun" style={{ filter: 'hue-rotate(300deg)' }} />
                        <div className="light-rays" style={{ filter: 'hue-rotate(300deg)' }} />
                      </motion.div>

                      <div className="relative z-20 sun-shine hex-clip w-32 h-36 sm:w-40 sm:h-44">
                        <HexagonTile tile={giftTile} duration={0.8} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-6xl animate-bounce drop-shadow-[0_0_25px_rgba(255,215,0,0.5)]">🎁</div>
                  )}
                </div>

                <motion.div animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 10 }} transition={{ duration: 0.5 }}>
                  <p className="text-xl font-bold mb-8 text-gray-200">
                    {config.bodies[msgIdx]}
                  </p>
                  <button
                    onClick={onRestart}
                    className="w-full bg-linear-to-r from-pink-500 to-purple-600 hover:brightness-110 text-white font-black py-4 px-6 rounded-xl shadow-[0_0_20px_rgba(236,72,153,0.3)] transform active:scale-95 transition-all text-lg tracking-widest border border-white/40"
                  >
                    {MESSAGES.win.button}
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </Fragment>
      )}
    </AnimatePresence>
  );
}
