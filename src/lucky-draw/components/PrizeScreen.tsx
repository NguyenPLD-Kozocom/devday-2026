// @ts-nocheck
import { motion } from "framer-motion";
import logoGame from "../assets/logo-game.png";
// Assets
import backgroundImg from "../assets/background.jpg";
import logoKozocom from "../assets/logo.png";
import speakerIcon from "../assets/speaker.png";
import { PRIZES } from "../prizes";

const handleEnterKey = (event, handler) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handler();
  }
};

export default function PrizeScreen({ onBack, onSelectPrize }) {
  const getPrizeCardSize = (isMain) => {
    if (isMain) {
      return {
        width: "700px",
        height: "900px",
        imageWidth: "70%",
        imageHeight: "70%",
      };
    }

    return {
      width: "600px",
      height: "650px",
      imageWidth: "62%",
      imageHeight: "62%",
    };
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
        <button
          className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden cursor-pointer hover:scale-110 transition-transform"
          aria-label="Toggle sound"
        >
          <img
            src={speakerIcon}
            alt="Speaker"
            className="w-full h-full object-contain"
          />
        </button>
      </motion.div>

      {/* ── Title Logo ── */}
      <motion.div
        className="shrink-0 z-10"
        style={{ marginTop: "40px" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <img
          src={logoGame}
          alt="Lottery Game"
          className="w-[480px] md:w-[620px] lg:w-[720px] object-contain"
        />
      </motion.div>

      {/* ── Prizes Section ── */}
      <div className="flex-1 flex items-center justify-center w-full z-10 px-8 md:px-16">
        <div className="flex items-end justify-center">
          {PRIZES.map((prize, i) => {
            const prizeCardSize = getPrizeCardSize(prize.isMain);

            return (
              <motion.div
                key={prize.id}
                className={`relative flex flex-col items-center -top-[100px]`}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                {/* Frame + Product Image */}
                <motion.button
                  type="button"
                  layoutId={`prize-card-${prize.id}`}
                  className="relative flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40 rounded-[28px] cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-transform"
                  style={{
                    width: prizeCardSize.width,
                    height: prizeCardSize.height,
                  }}
                  aria-label={`Xem chi tiết ${prize.label}`}
                  onClick={() => onSelectPrize?.(prize.id)}
                  onKeyDown={(e) =>
                    handleEnterKey(e, () => onSelectPrize?.(prize.id))
                  }
                >
                  {/* Frame SVG */}
                  <motion.img
                    layoutId={`prize-frame-${prize.id}`}
                    src={prize.frame}
                    alt=""
                    className={`absolute inset-0 w-full h-full object-contain ${
                      prize.isMain ? "-top-[80px]" : "-top-[40px]"
                    }`}
                  />
                  {/* Product Image — centered inside frame */}
                  <motion.img
                    layoutId={`prize-image-${prize.id}`}
                    src={prize.image}
                    alt={prize.name}
                    className="relative z-10 object-contain"
                    style={{
                      width: prizeCardSize.imageWidth,
                      height: prizeCardSize.imageHeight,
                    }}
                  />
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
