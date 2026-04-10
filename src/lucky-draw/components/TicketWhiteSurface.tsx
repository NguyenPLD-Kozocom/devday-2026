// @ts-nocheck
/**
 * White ticket surface: static border + wash + CSS shimmer (GPU-friendly).
 * You can later set `background-image` on the root div (with bg-cover / bg-center) for a full ticket graphic.
 * @param {{ children: import("react").ReactNode, className?: string }} props
 */
export default function TicketWhiteSurface({ children, className = "" }) {
  return (
    <div
      className={`relative overflow-hidden bg-white ${className}`.trim()}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(79,166,255,0.28)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] opacity-[0.42]"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 50% 0%, rgba(147,197,253,0.12) 0%, transparent 55%)",
        }}
      />
      <div
        aria-hidden
        className="ticket-white-shimmer pointer-events-none absolute -top-1/2 bottom-0 left-0 z-[2] w-[42%] rounded-[inherit]"
        style={{
          background:
            "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.55) 42%, rgba(186,230,253,0.32) 50%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit] opacity-[0.48]"
        style={{
          background:
            "repeating-linear-gradient(-12deg, transparent, transparent 6px, rgba(15,23,42,0.02) 6px, rgba(15,23,42,0.02) 7px)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
