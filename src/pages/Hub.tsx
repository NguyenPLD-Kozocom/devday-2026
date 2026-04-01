import { useNavigate } from "react-router-dom";

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

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-white/60 backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            DevDay 2026
          </div>
          <h1 className="bg-gradient-to-b from-white via-white to-white/50 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl lg:text-7xl">
            Game Hub
          </h1>
          <p className="mt-4 max-w-md text-base text-white/45">
            Chọn một trò chơi để bắt đầu trải nghiệm DevDay 2026
          </p>
        </div>

        {/* Game cards */}
        <div className="grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => navigate(game.path)}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-left backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:bg-white/[0.07] hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
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
            </button>
          ))}
        </div>

        {/* Footer */}
        <p className="mt-16 text-center text-xs text-white/20">
          © 2026 DevDay — Kozo.com
        </p>
      </div>
    </div>
  );
}
