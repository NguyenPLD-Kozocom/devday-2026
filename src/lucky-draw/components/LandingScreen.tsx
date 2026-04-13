// @ts-nocheck
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Assets
import backgroundImg from "../assets/background.jpg";
import logoGame from "../assets/logo-game.png";
import logoKozocom from "../../assets/logo.png";
import nextSvg from "../assets/next.svg";
import preDisableSvg from "../assets/preDisable.svg";
import preActiveSvg from "../assets/image.png";
import playNow from "../assets/playnow.png";
import SoundToggleButton from "./SoundToggleButton";

// ── Screen data ──
// Each screen has a `layout` key:
//   "two"   → two side-by-side InfoCards (left + right)
//   "single" → one centered InfoCard (center) + optional PLAY NOW
const SCREENS = [
  {
    layout: "two",
    left: {
      title: "ĐỐI TƯỢNG VÀ ĐIỀU KIỆN THAM GIA:",
      items: [
        "Sau khi check-in thành công tại sự kiện, mỗi người chơi sẽ được nhận 01 phiếu may mắn.",
        "Trên phiếu có in sẵn một dãy số gồm 3 chữ số",
        "Phiếu được coi là hợp lệ khi đã được Ban tổ chức đóng dấu xác nhận sau khi check-in.",
      ],
    },
    right: {
      title: "CÁCH THỨC DỰ THI:",
      items: [
        "Người chơi tiến hành bình luận (comment) con số may mắn ghi trên phiếu của mình vào bài viết được ghim trên Fanpage Facebook chính thức của công ty.",
        "Bình luận chỉ được tính là hợp lệ khi được thực hiện trong khoảng thời gian quy định (thời gian bắt đầu và kết thúc sẽ do MC thông báo).",
      ],
    },
  },
  {
    layout: "two",
    left: {
      title: "HÌNH THỨC QUAY THƯỞNG:",
      items: [
        "Ban tổ chức sẽ tiến hành quay số để tìm ra người thắng cuộc lần lượt cho 3 hạng mục: Giải Ba, Giải Nhì và Giải Nhất.",
        "Mỗi dãy số trúng thưởng gồm 3 chữ số, được quay ngẫu nhiên, lần lượt từ trái sang phải.",
      ],
    },
    right: {
      title: "ĐIỀU KIỆN CÔNG NHẬN THẮNG CUỘC:",
      items: [
        "Sở hữu phiếu may mắn có dãy số trùng khớp hoàn toàn với kết quả quay thưởng của giải đó.",
        "Đã thực hiện comment số may mắn trên Fanpage trong thời gian quy định.",
        "Có mặt trực tiếp tại khu vực Booth sự kiện ngay thời điểm công bố kết quả.",
        "Xuất trình được phiếu may mắn hợp lệ (có dấu mộc của Ban tổ chức).",
      ],
    },
  },
  {
    layout: "single",
    center: {
      title: "QUY ĐỊNH CHUNG",
      text: "Trong mọi trường hợp xảy ra tranh chấp hoặc phát sinh vấn đề ngoài dự kiến, quyết định cuối cùng sẽ thuộc về Ban tổ chức.",
    },
  },
];

const PAGE_STORAGE_KEY = "lottery_landingPage";

export default function LandingScreen({ onNext }) {
  const [page, setPage] = useState(() => {
    const saved = localStorage.getItem(PAGE_STORAGE_KEY);
    return saved !== null ? Number(saved) : 0;
  });
  const isFirst = page === 0;
  const isLast = page === SCREENS.length - 1;
  const screen = SCREENS[page];

  const goToPage = (p) => {
    localStorage.setItem(PAGE_STORAGE_KEY, p);
    setPage(p);
  };

  const handlePrev = () => {
    if (!isFirst) goToPage(page - 1);
  };

  const handleNext = () => {
    if (isLast) {
      onNext(); // go to slot machine
    } else {
      goToPage(page + 1);
    }
  };

  return (
    <div
      className="relative w-full h-screen flex flex-col items-center overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* ── Top-left Back button (only on PLAY NOW screen) ── */}
      {isLast && (
        <motion.button
          className="absolute top-4 left-4 md:top-6 md:left-8 w-10 h-10 md:w-12 md:h-12 z-10 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
          onClick={handlePrev}
          aria-label="Back"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <img
            src={preActiveSvg}
            alt="Back"
            className="w-full h-full object-contain"
          />
        </motion.button>
      )}

      {/* ── Header: Logo + Speaker ── */}
      <motion.div
        className="absolute top-4 right-4 md:top-6 md:right-8 flex items-center gap-3 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={logoKozocom}
          alt="KOZOCOM"
          className="h-6 md:h-8 object-contain"
        />
        <SoundToggleButton />
      </motion.div>

      {/* ── Title Logo — compact top so cards (~60vh) fit one screen ── */}
      <motion.div
        className="shrink-0 z-10 px-4"
        style={{ marginTop: "clamp(4.5rem, 9vh, 6.875rem)" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <img
          src={logoGame}
          alt="Lottery Game"
          className="w-[min(92vw,720px)] max-h-[min(11vh,120px)] md:max-h-[min(13vh,140px)] object-contain mx-auto"
        />
      </motion.div>

      {/* ── Info Cards — two-column ~50vh; single “Quy định chung” compact + centered ── */}
      <div className="flex-1 min-h-0 flex items-center justify-center w-full z-10 px-6 md:px-10 lg:px-16 xl:px-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            className={
              screen.layout === "single"
                ? "flex flex-col justify-center items-center w-full h-full min-h-0"
                : "flex flex-col md:flex-row w-full"
            }
            style={
              screen.layout === "single"
                ? {}
                : { gap: "clamp(1rem, 3vw, 3.75rem)" }
            }
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            {screen.layout === "two" ? (
              <>
                <InfoCard title={screen.left.title}>
                  <ul
                    className="list-disc pl-5 md:pl-6 space-y-2 md:space-y-3 text-[clamp(15px,1.35vw,20px)] leading-snug md:leading-relaxed"
                    style={{ listStyleType: "disc" }}
                  >
                    {screen.left.items.map((text, i) => (
                      <li key={i} style={{ color: "#00CCFF" }}>
                        <span className="text-white text-[28px]">{text}</span>
                      </li>
                    ))}
                  </ul>
                </InfoCard>

                <InfoCard title={screen.right.title}>
                  <ul
                    className="list-disc pl-5 md:pl-6 space-y-2 md:space-y-3 text-[clamp(15px,1.35vw,20px)] leading-snug md:leading-relaxed"
                    style={{ listStyleType: "disc" }}
                  >
                    {screen.right.items.map((text, i) => (
                      <li key={i} style={{ color: "#00CCFF" }}>
                        <span className="text-white text-[28px]">{text}</span>
                      </li>
                    ))}
                  </ul>
                </InfoCard>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center w-full shrink-0">
                <InfoCard title={screen.center.title} centerTitle singleCard>
                  <p className="text-white text-[40px] leading-relaxed text-center px-1">
                    {screen.center.text}
                  </p>
                </InfoCard>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Navigation / Play Now — last screen: ~30px from viewport bottom ── */}
      <div
        className={`shrink-0 flex items-center justify-center gap-6 z-10 pt-2 ${isLast ? "pb-[100px]" : "pb-4 md:pb-6"}`}
      >
        {isLast ? (
          /* PLAY NOW button on the last screen */
          <button
            className="cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            onClick={onNext}
            aria-label="Play Now"
          >
            <img
              src={playNow}
              alt="Play Now"
              className="object-contain h-14 md:h-[6.375rem]"
            />
          </button>
        ) : (
          <>
            {/* Prev button */}
            <button
              className={`w-12 h-12 md:w-14 md:h-14 ${isFirst ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-110 active:scale-95 transition-transform"}`}
              disabled={isFirst}
              onClick={handlePrev}
              aria-label="Previous"
            >
              <img
                src={isFirst ? preDisableSvg : preActiveSvg}
                alt="Previous"
                className="w-full h-full object-contain"
              />
            </button>

            {/* Next button */}
            <button
              className="w-12 h-12 md:w-14 md:h-14 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
              onClick={handleNext}
              aria-label="Next"
            >
              <img
                src={nextSvg}
                alt="Next"
                className="w-full h-full object-contain"
              />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * InfoCard — A card with a gradient border, semi-transparent blue background.
 */
function InfoCard({
  title,
  children,
  centerTitle = false,
  singleCard = false,
}) {
  const outerClass = singleCard
    ? "flex-none w-full max-w-[min(52rem,92vw)] mx-auto rounded-xl"
    : "flex-1 min-w-0 w-full max-w-full rounded-xl";

  const innerClass = singleCard
    ? "flex flex-col justify-center items-center rounded-[calc(0.75rem-4.19px)] w-full h-auto min-h-0 overflow-visible"
    : "flex flex-col justify-start items-center rounded-[calc(0.75rem-4.19px)] w-full h-[30vh] min-h-[180px] max-h-[30vh] md:h-[50vh] md:min-h-[200px] md:max-h-[50vh] overflow-y-auto overscroll-contain";

  const innerPadding = singleCard
    ? "clamp(0.875rem, 2vw, 1.5rem)"
    : "clamp(1.25rem, 2.5vw, 2.5rem)";

  const titleSize = singleCard
    ? "clamp(2rem, 2.2vw, 3rem)"
    : "clamp(1.25rem, 2.8vw, 2.25rem)";

  const titleMb = singleCard ? "mb-2 md:mb-3" : "mb-3 md:mb-4";

  return (
    <div
      className={outerClass}
      style={{
        padding: "4px",
        background: "linear-gradient(180deg, #35A3EF 0%, #0039BB 100%)",
      }}
    >
      <div
        className={innerClass}
        style={{
          padding: innerPadding,
          background: "rgba(1, 41, 161, 0.7)",
          backdropFilter: "blur(8px)",
          borderImageSource:
            "linear-gradient(180deg, #35A3EF 0%, #0039BB 100%)",
          borderImageSlice: 1,
        }}
      >
        <h3
          className={`${titleMb} tracking-wide text-white text-center shrink-0 ${centerTitle ? "text-center" : ""}`}
          style={{
            fontSize: titleSize,
            fontWeight: 700,
          }}
        >
          {title}
        </h3>
        <div className="w-full min-h-0">{children}</div>
      </div>
    </div>
  );
}
