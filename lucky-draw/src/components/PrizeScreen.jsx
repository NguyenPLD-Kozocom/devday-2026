import { motion } from "framer-motion";

// Assets
import backgroundImg from "../assets/background.jpg";
import logoGame from "../assets/logo-game.png";
import logoKozocom from "../assets/logo.png";
import speakerIcon from "../assets/speaker.png";

import frame1st from "../assets/1st-frame.svg";
import frame2nd from "../assets/2nd-frame.svg";
import frame3rd from "../assets/3rd-frame.svg";
import img1st from "../assets/1st.png";
import img2nd from "../assets/2nd.png";
import img3rd from "../assets/3rd.png";

const PRIZES = [
  {
    label: "2nd PRIZE",
    name: "SMART WATCH MIBAND 10",
    frame: frame2nd,
    image: img2nd,
    labelBg: "linear-gradient(180deg, #35A3EF 0%, #0039BB 100%)",
  },
  {
    label: "1st PRIZE",
    name: "SCREEN: LG 24K",
    frame: frame1st,
    image: img1st,
    labelBg: "linear-gradient(180deg, #FFD54F 0%, #FF8F00 100%)",
    isMain: true,
  },
  {
    label: "3rd PRIZE",
    name: "KEYBOARD AULA F75",
    frame: frame3rd,
    image: img3rd,
    labelBg: "linear-gradient(180deg, #F38B55 0%, #A64B21 100%)",
  },
];

export default function PrizeScreen({ onBack }) {
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
          className="w-[360px] md:w-[480px] lg:w-[560px] object-contain"
        />
      </motion.div>

      {/* ── Prizes Section ── */}
      <div className="flex-1 flex items-center justify-center w-full z-10 px-8 md:px-16">
        <div className="flex items-end justify-center gap-6 md:gap-10 lg:gap-14">
          {PRIZES.map((prize, i) => (
            <motion.div
              key={prize.label}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              {/* Prize Label Badge */}
              <div
                className="rounded-full px-5 py-1.5 text-white font-bold text-sm md:text-base z-20 relative"
                style={{
                  background: prize.labelBg,
                  marginBottom: "-18px",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                {prize.label}
              </div>

              {/* Frame + Product Image */}
              <div
                className="relative flex items-center justify-center"
                style={{
                  width: prize.isMain ? "320px" : "240px",
                  height: prize.isMain ? "320px" : "240px",
                }}
              >
                {/* Frame SVG */}
                <img
                  src={prize.frame}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain"
                />
                {/* Product Image — centered inside frame */}
                <img
                  src={prize.image}
                  alt={prize.name}
                  className="relative z-10 object-contain"
                  style={{
                    width: prize.isMain ? "65%" : "60%",
                    height: prize.isMain ? "65%" : "60%",
                  }}
                />
              </div>

              {/* Product Name */}
              <p
                className="text-white font-bold text-center mt-2 tracking-wider uppercase"
                style={{
                  fontSize: prize.isMain ? "18px" : "14px",
                }}
              >
                {prize.name}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
