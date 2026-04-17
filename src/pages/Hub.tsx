import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/logo.png";

interface GameCard {
  id: string;
  path: string;
  title: string;
  subtitle: string;
  icon: string;
  bgIcon: string;
  accent: string;
  glowColor: string;
  cardBg: string;
  borderColor: string;
}

const games: GameCard[] = [
  {
    id: "ten-seconds",
    path: "/ten-seconds",
    title: "10s Challenge",
    subtitle: "Stop exactly at 10 seconds",
    icon: "10",
    bgIcon: "10",
    accent: "#06b6d4",
    glowColor: "rgba(6,182,212,0.35)",
    cardBg: "from-[#021118] via-[#030e14] to-[#01090f]",
    borderColor: "rgba(6,182,212,0.22)",
  },
  {
    id: "bee-word-search",
    path: "/bee-word-search",
    title: "Bee Quest",
    subtitle: "Find hidden words in the hive",
    icon: "🐝",
    bgIcon: "🐝",
    accent: "#fbbf24",
    glowColor: "rgba(251,191,36,0.32)",
    cardBg: "from-[#130e00] via-[#0e0a00] to-[#070600]",
    borderColor: "rgba(251,191,36,0.22)",
  },
  {
    id: "lucky-draw",
    path: "/lucky-draw",
    title: "Lucky Lottery",
    subtitle: "Spin the wheel, claim your prize",
    icon: "🎰",
    bgIcon: "🎰",
    accent: "#3b82f6",
    glowColor: "rgba(59,130,246,0.32)",
    cardBg: "from-[#030d1e] via-[#030a18] to-[#020610]",
    borderColor: "rgba(59,130,246,0.25)",
  },
];

export default function Hub() {
  const navigate = useNavigate();

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#010108]">
      {/* ── Ambient blobs ── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute -left-60 -top-60 h-[900px] w-[900px] rounded-full opacity-20 blur-[200px]"
          style={{
            background: "radial-gradient(circle, #3b82f6, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-60 -right-60 h-[900px] w-[900px] rounded-full opacity-15 blur-[200px]"
          style={{
            background: "radial-gradient(circle, #fb7185, transparent 70%)",
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.08] blur-[160px]"
          style={{
            background: "radial-gradient(circle, #7c3aed, transparent 70%)",
          }}
        />
        {/* dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* ── Header ── */}
      <header className="relative z-50 flex shrink-0 items-center justify-between px-12 py-5 md:px-20">
        {/* Left spacer */}
        <div className="w-40" />

        {/* Badge right */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex w-40 justify-end"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40 backdrop-blur-md">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            DevDay 2026
          </div>
        </motion.div>
      </header>

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-12 pb-8 md:px-20">
        {/* Logo centered */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center gap-1 absolute top-45"
        >
          <img
            src={logo}
            alt="Kozocom Logo"
            className="w-auto object-contain h-16 md:h-16"
          />
        </motion.div>
        {/* Game cards */}
        <motion.div
          className="grid w-full max-w-[1200px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
        >
          {games.map((game) => (
            <motion.div
              key={game.id}
              variants={{
                hidden: { opacity: 0, y: 36, scale: 0.94 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { type: "spring", stiffness: 280, damping: 26 },
                },
              }}
              whileHover={{
                scale: 1.025,
                y: -8,
                transition: { duration: 0.2, ease: "easeOut" },
              }}
              whileTap={{ scale: 0.975 }}
              className="group relative"
            >
              {/* Outer glow ring on hover */}
              <div
                className="pointer-events-none absolute -inset-px rounded-[28px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ boxShadow: `0 0 36px 6px ${game.glowColor}` }}
              />

              <button
                onClick={() => navigate(game.path)}
                className={`relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-[28px] bg-gradient-to-br p-9 text-left focus:outline-none ${game.cardBg}`}
                style={{ border: `1px solid ${game.borderColor}` }}
              >
                {/* Background watermark icon */}
                <div
                  className="pointer-events-none absolute -bottom-6 -right-6 select-none leading-none opacity-[0.065] transition-opacity duration-300 group-hover:opacity-[0.11]"
                  style={{
                    fontSize: game.id === "ten-seconds" ? "180px" : "170px",
                    fontWeight: game.id === "ten-seconds" ? 900 : undefined,
                    color: game.id === "ten-seconds" ? game.accent : undefined,
                    fontFamily:
                      game.id === "ten-seconds"
                        ? "'Oswald', sans-serif"
                        : undefined,
                    lineHeight: 1,
                  }}
                >
                  {game.bgIcon}
                </div>

                {/* Radial glow from top */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-50 transition-opacity duration-300 group-hover:opacity-80"
                  style={{
                    background: `radial-gradient(ellipse at 50% -5%, ${game.glowColor} 0%, transparent 60%)`,
                  }}
                />

                {/* Top accent line */}
                <div
                  className="absolute inset-x-0 top-0 h-[2px] opacity-60 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${game.accent}, transparent)`,
                  }}
                />

                {/* Foreground icon */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 3.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative z-10 mb-6"
                >
                  {game.id === "ten-seconds" ? (
                    <span
                      className="inline-block font-black leading-none"
                      style={{
                        fontFamily: "'Oswald', sans-serif",
                        fontSize: "clamp(36px, 3.5vw, 52px)",
                        color: game.accent,
                        textShadow: `0 0 24px ${game.accent}, 0 0 48px ${game.glowColor}`,
                      }}
                    >
                      10s
                    </span>
                  ) : (
                    <span
                      className="inline-block leading-none"
                      style={{
                        fontSize: "clamp(40px, 3.8vw, 56px)",
                        filter: `drop-shadow(0 0 16px ${game.glowColor})`,
                      }}
                    >
                      {game.icon}
                    </span>
                  )}
                </motion.div>

                {/* Title */}
                <h3
                  className="relative z-10 mb-2 font-extrabold text-white"
                  style={{
                    fontSize: "clamp(18px, 1.6vw, 24px)",
                    textShadow: `0 0 28px ${game.glowColor}`,
                  }}
                >
                  {game.title}
                </h3>

                {/* Subtitle */}
                <p
                  className="relative z-10 font-medium text-white/40"
                  style={{ fontSize: "clamp(12px, 1vw, 14px)" }}
                >
                  {game.subtitle}
                </p>

                {/* CTA */}
                <div className="relative z-10 mt-8 flex items-center justify-between">
                  <div
                    className="flex items-center gap-2 rounded-xl font-bold transition-all duration-200 group-hover:brightness-110"
                    style={{
                      padding: "clamp(8px,0.7vw,12px) clamp(16px,1.4vw,24px)",
                      fontSize: "clamp(12px,0.9vw,14px)",
                      background: `linear-gradient(135deg, ${game.accent}cc, ${game.accent}77)`,
                      color: "#fff",
                      boxShadow: `0 0 18px ${game.glowColor}`,
                    }}
                  >
                    Play Now
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 8h10M9 4l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  {/* <div
                    className="h-2 w-2 rounded-full opacity-55"
                    style={{
                      background: game.accent,
                      boxShadow: `0 0 8px ${game.accent}`,
                    }}
                  /> */}
                </div>
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── Footer ── */}
      <footer className="relative z-10 shrink-0 pb-5 text-center text-sm text-white/30">
        &copy; 2026 DevDay &mdash; Kozocom
      </footer>
    </div>
  );
}
