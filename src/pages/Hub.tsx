import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/logo.png";

interface GameCard {
  id: string;
  path: string;
  title: string;
  description: string;
  emoji: string;
  gradient: string;
  accent: string;
}

const games: GameCard[] = [
  {
    id: "bee-word-search",
    path: "/bee-word-search",
    title: "Bee Word Search",
    description:
      "Tìm từ ẩn trong tổ ong lục giác. Thử thách trí tuệ và phản xạ của bạn!",
    emoji: "🐝",
    gradient: "from-amber-400 via-yellow-300 to-orange-400",
    accent: "#D4AF37",
  },
  {
    id: "lucky-draw",
    path: "/lucky-draw",
    title: "Lucky Draw",
    description:
      "Máy quay số may mắn phong cách vintage. Ai sẽ là người chiến thắng?",
    emoji: "🎰",
    gradient: "from-blue-600 via-indigo-500 to-blue-800",
    accent: "#35a3ef",
  },
  {
    id: "ten-seconds",
    path: "/ten-seconds",
    title: "Thử Thách 10 Giây",
    description:
      "Bạn có thể dừng đúng 10 giây không? Kiểm tra cảm giác thời gian của bạn!",
    emoji: "⏱️",
    gradient: "from-sky-400 via-cyan-300 to-blue-500",
    accent: "#9DD7FF",
  },
];

export default function Hub() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-screen overflow-hidden bg-[#06091a]">
      {/* Ambient background blobs */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-20 blur-[120px]"
        style={{
          background: "radial-gradient(circle, #2563eb, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full opacity-20 blur-[120px]"
        style={{
          background: "radial-gradient(circle, #d4af37, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-[140px]"
        style={{
          background: "radial-gradient(circle, #35a3ef, transparent 70%)",
        }}
      />

      {/* Top Navigation */}
      <nav className="absolute left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-6 md:px-12">
        <div></div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/60 backdrop-blur-sm md:px-5 md:py-2 md:text-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          DevDay 2026
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pb-16 pt-32 md:pt-40">
        {/* Hero Area */}
        <div className="mb-24 text-center flex flex-col items-center">
          <img
            src={logo}
            alt="Kozocom Logo"
            className="h-20 w-auto object-contain md:h-12"
          />
        </div>

        {/* Game cards */}
        <motion.div
          className="grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
        >
          {games.map((game) => (
            <motion.button
              key={game.id}
              onClick={() => navigate(game.path)}
              variants={{
                hidden: { opacity: 0, y: 40, scale: 0.9 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { type: "spring", stiffness: 300, damping: 24 },
                },
              }}
              whileHover={{
                scale: 1.04,
                y: -8,
                boxShadow: `0 20px 40px -10px ${game.accent}50`,
                transition: { duration: 0.2, ease: "easeOut" },
              }}
              whileTap={{ scale: 0.96 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-left backdrop-blur-sm transition-colors duration-300 hover:border-white/30 hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 cursor-pointer"
            >
              {/* Gradient top bar */}
              <div
                className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${game.gradient} opacity-60 transition-opacity duration-300 group-hover:opacity-100`}
              />

              {/* Glow on hover */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${game.accent}18 0%, transparent 60%)`,
                }}
              />

              {/* Emoji */}
              <div className="mb-5 text-5xl transition-transform duration-300 group-hover:scale-110">
                {game.emoji}
              </div>

              {/* Text */}
              <h2 className="mb-2 text-xl font-bold text-white">
                {game.title}
              </h2>
              <p className="text-sm leading-relaxed text-white/50">
                {game.description}
              </p>

              {/* Arrow */}
              <div className="mt-6 flex items-center gap-2 text-sm font-medium text-white/30 transition-all duration-300 group-hover:gap-3 group-hover:text-white/70">
                Chơi ngay
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Footer */}
        <p className="mt-16 text-center text-xs text-white/20">
          © 2026 DevDay — Kozocom
        </p>
      </div>
    </div>
  );
}
