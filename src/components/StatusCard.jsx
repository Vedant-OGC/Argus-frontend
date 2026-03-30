/**
 * StatusCard.jsx — Reusable glass stat card with icon, label, and value
 */

export default function StatusCard({ icon, label, value, accent = "cyan", children, className = "" }) {
  const accentColors = {
    cyan: { text: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20", glow: "shadow-[0_0_15px_rgba(6,182,212,0.1)]" },
    violet: { text: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20", glow: "shadow-[0_0_15px_rgba(139,92,246,0.1)]" },
    emerald: { text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", glow: "shadow-[0_0_15px_rgba(16,185,129,0.1)]" },
    amber: { text: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", glow: "shadow-[0_0_15px_rgba(245,158,11,0.1)]" },
    rose: { text: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/20", glow: "shadow-[0_0_15px_rgba(244,63,94,0.1)]" },
  };

  const c = accentColors[accent] || accentColors.cyan;

  return (
    <div className={`glass-card p-4 ${c.glow} animate-slide-up ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${c.bg} ${c.border} border`}>
          <span className={`text-sm ${c.text}`}>{icon}</span>
        </div>
        <span className="text-xs font-medium tracking-wider uppercase text-slate-400">
          {label}
        </span>
      </div>

      {/* Value */}
      {value !== undefined && (
        <div className={`text-2xl font-bold ${c.text} font-mono`}>
          {value}
        </div>
      )}

      {/* Custom content */}
      {children}
    </div>
  );
}
