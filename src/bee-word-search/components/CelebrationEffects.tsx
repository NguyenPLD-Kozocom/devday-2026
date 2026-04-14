import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { cn } from "../../utils/cn";

function DiscoLamp({ position }: { position: "left" | "right" }) {
  return (
    <div
      className={cn(
        "absolute top-0 flex flex-col items-center",
        position === "left" ? "left-[8%]" : "right-[8%]"
      )}
    >
      {/* Hanging Cord */}
      <div className="w-[3px] h-[120px] bg-neutral-400" />

      {/* Disco Ball (Animated Emoji) */}
      <div className="relative w-32 h-32 -mt-4">
        <picture>
          <source srcSet="https://fonts.gstatic.com/s/e/notoemoji/latest/1faa9/512.webp" type="image/webp" />
          <img
            src="https://fonts.gstatic.com/s/e/notoemoji/latest/1faa9/512.gif"
            alt="🪩"
            className="w-full h-full object-contain"
          />
        </picture>

        {/* Beams container rotating with the ball */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute left-1/2 top-1/2 w-0 h-0"
        >
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <div
              key={angle}
              className="jackpot-spotlight-beam absolute top-0 left-1/2 origin-top h-[900px] w-48 opacity-25"
              style={{
                transform: `translateX(-50%) rotate(${angle}deg)`,
                background: "linear-gradient(to bottom, rgba(255,255,255,0.7) 0%, rgba(200,220,255,0.15) 35%, transparent 100%)",
                filter: "blur(6px)",
              }}
            />
          ))}
        </motion.div>

        {/* Refined Glow Core */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-blue-400/20 blur-2xl"
        />
      </div>
    </div>
  );
}

export function CelebrationEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const myConfetti = confetti.create(canvas, {
      resize: true,
      useWorker: true,
    });

    const fire = () => {
      myConfetti({
        particleCount: 25,
        spread: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ["#fbbf24", "#fb923c", "#6ee7ff", "#f472b6", "#ffffff"],
      });
    };

    const interval = setInterval(fire, 1000);
    fire();

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      {/* Disco Lamps */}
      <DiscoLamp position="left" />
      <DiscoLamp position="right" />

      {/* Confetti Canvas */}
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
