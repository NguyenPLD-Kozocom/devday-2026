import type { KeyboardEvent } from "react";
import { useEffect, useRef } from "react";
import { motion, useAnimation, useReducedMotion } from "framer-motion";
import logoGame from "../assets/logo-game.png";
// Assets
import backgroundImg from "../assets/background.jpg";
import logoKozocom from "../../assets/logo.png";
import { PRIZES } from "../prizes";
import SoundToggleButton from "./SoundToggleButton";
import preActiveSvg from "../assets/image.png";

type PrizeScreenProps = {
  onBack?: () => void;
  onSelectPrize?: (prizeId: string) => void;
};

const handleEnterKey = (event: KeyboardEvent, handler: () => void) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handler();
  }
};

type FloatingPrizeImageProps = {
  prizeId: string;
  prizeName: string;
  imageSrc: string;
  layoutId: string;
  width: string;
  height: string;
};

const FloatingPrizeImage = ({
  prizeId,
  prizeName,
  imageSrc,
  layoutId,
  width,
  height,
}: FloatingPrizeImageProps) => {
  const controls = useAnimation();
  const prefersReducedMotion = useReducedMotion();
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;

    let cancelled = false;

    const randomBetween = (min: number, max: number) =>
      min + Math.random() * (max - min);

    const step = async () => {
      if (cancelled) return;

      // Floating: stronger movement but still eased for smoothness.
      const verticalDir = Math.random() < 0.8 ? -1 : 1; // mostly upwards, sometimes down
      const nextY = verticalDir * randomBetween(12, 28);
      const nextX = randomBetween(-10, 10);
      const nextRotate = randomBetween(-7, 7);
      const nextScale = randomBetween(1.0, 1.05);

      const duration = randomBetween(1.2, 2.2);
      const pause = randomBetween(120, 420);

      await controls.start({
        y: nextY,
        x: nextX,
        rotate: nextRotate,
        scale: nextScale,
        transition: { duration, ease: "easeInOut" },
      });

      if (cancelled) return;

      timeoutRef.current = window.setTimeout(step, pause);
    };

    step();

    return () => {
      cancelled = true;
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [controls, prefersReducedMotion, prizeId]);

  return (
    <motion.img
      layoutId={layoutId}
      src={imageSrc}
      alt={prizeName}
      className="relative z-10 object-contain"
      style={{
        willChange: "transform",
        transformOrigin: "center",
        width,
        height,
      }}
      initial={{ y: 0, x: 0, rotate: 0, scale: 1 }}
      animate={controls}
    />
  );
};

export default function PrizeScreen({
  onBack,
  onSelectPrize,
}: PrizeScreenProps) {
  const MotionButton = motion.button;

  const getPrizeCardSize = (isMain: boolean) => {
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
      {/* ── Back to rules (LandingScreen) ── */}
      {onBack && (
        <MotionButton
          type="button"
          className="absolute top-4 left-4 z-20 w-10 h-10 md:w-12 md:h-12 cursor-pointer hover:scale-110 active:scale-95 transition-transform focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40 rounded-full"
          onClick={onBack}
          onKeyDown={(e) => handleEnterKey(e, onBack)}
          aria-label="Back to rules"
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
        <SoundToggleButton className="active:scale-95" />
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
            const prizeCardSize = getPrizeCardSize(Boolean(prize.isMain));

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
                  <FloatingPrizeImage
                    prizeId={prize.id}
                    prizeName={prize.name}
                    imageSrc={prize.image}
                    layoutId={`prize-image-${prize.id}`}
                    width={prizeCardSize.imageWidth}
                    height={prizeCardSize.imageHeight}
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
