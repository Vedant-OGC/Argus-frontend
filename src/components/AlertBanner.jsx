/**
 * AlertBanner.jsx — Animated GPS spoofing alert banner
 */

export default function AlertBanner({ alert, spoofScore }) {
  if (!alert || spoofScore <= 0.5) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] animate-slide-up">
      <div className="relative overflow-hidden flex items-center gap-3 px-6 py-3 rounded-2xl
                      bg-rose-500/15 border border-rose-500/30 backdrop-blur-xl
                      shadow-[0_0_30px_rgba(244,63,94,0.2)]
                      animate-alert-pulse">
        {/* Shimmer effect */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(244,63,94,0.3), transparent)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2s linear infinite",
          }}
        />

        <div className="relative flex items-center gap-3">
          {/* Pulsing danger dot */}
          <div className="relative">
            <span className="inline-block w-3 h-3 rounded-full bg-rose-400 animate-pulse" />
            <span className="absolute inset-0 w-3 h-3 rounded-full bg-rose-400 animate-ping" />
          </div>

          <span className="text-sm font-bold tracking-wide text-rose-200">
            🚨 {alert}
          </span>

          <span className="text-xs font-mono text-rose-300/60 ml-2">
            Score: {(spoofScore * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}
