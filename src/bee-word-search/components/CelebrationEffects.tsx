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

function SwayingSpotlights() {
  return (
    <div className="jackpot-disco-rig absolute inset-0 overflow-hidden" aria-hidden>
      {[8, 24, 40, 56, 72, 88].map((left, i) => {
        const delay = `${i * 0.26}s`;
        return (
          <div
            key={i}
            className="jackpot-spotlight-beam"
            style={{
              left: `${left}%`,
              animationDelay: delay,
            }}
          >
            <div
              className="jackpot-spotlight-core"
              style={{ animationDelay: delay }}
            />
          </div>
        );
      })}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_56%_60%_at_50%_38%,rgba(255,248,220,0.22)_0%,rgba(255,223,128,0.08)_45%,rgba(255,255,255,0)_100%)]" />
    </div>
  );
}

export function CelebrationEffects({
  showLights = true,
  intensity = "intense",
}: {
  showLights?: boolean;
  intensity?: "intense" | "subtle";
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const myConfetti = confetti.create(canvas, {
      resize: true,
      useWorker: true,
    });

    const fireBurst = (x: number, y: number) => {
      const isSubtle = intensity === "subtle";
      myConfetti({
        particleCount: isSubtle ? 40 : 50 + Math.floor(Math.random() * 50),
        spread: isSubtle ? 60 : 80,
        origin: { x, y },
        colors: [
          "#fbbf24",
          "#fb923c",
          "#6ee7ff",
          "#f472b6",
          "#ffffff",
          "#FFD700",
        ],
        gravity: 1,
        scalar: isSubtle ? 0.9 : 1,
        ticks: isSubtle ? 180 : 200,
      });
    };

    const run = () => {
      if (intensity === "subtle") {
        fireBurst(Math.random() * 0.4 + 0.3, 0.4);
        return;
      }

      // Intense mode
      fireBurst(0.15, 0.5);
      fireBurst(0.5, 0.4);
      fireBurst(0.85, 0.5);

      // Occasional massive center burst
      if (Math.random() > 0.4) {
        myConfetti({
          particleCount: 150,
          spread: 180,
          origin: { x: 0.5, y: 0.7 },
          colors: ["#FFD700", "#FFFFFF"],
          scalar: 1.5,
        });
      }
    };

    const interval = setInterval(run, intensity === "subtle" ? 900 : 700);
    run();

    return () => clearInterval(interval);
  }, [intensity]);

  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      {showLights && (
        <>
          {/* Swaying Spotlights from 10s Game */}
          <SwayingSpotlights />

          {/* Disco Lamps */}
          <DiscoLamp position="left" />
          <DiscoLamp position="right" />
        </>
      )}

      {/* Confetti Canvas */}
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
