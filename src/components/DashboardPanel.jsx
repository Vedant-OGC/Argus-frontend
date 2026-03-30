/**
 * DashboardPanel.jsx — Right sidebar showing all telemetry data panels
 */

import StatusCard from "./StatusCard";

// ─── Mode color mapping ───
const MODE_CONFIG = {
  GPS: { color: "emerald", label: "GPS", desc: "Satellite Navigation" },
  V2X: { color: "amber", label: "V2X", desc: "Vehicle-to-Everything" },
  IMU: { color: "rose", label: "IMU", desc: "Inertial Measurement" },
};

export default function DashboardPanel({ data }) {
  const mode = MODE_CONFIG[data.mode] || MODE_CONFIG.GPS;
  const gpsTrustPct = Math.round((data.gps_trust || 0) * 100);
  const spoofPct = Math.round((data.spoof_score || 0) * 100);
  const isSpoofed = data.spoof_score > 0.5;

  const modeAccentColors = {
    emerald: "#10b981",
    amber: "#f59e0b",
    rose: "#f43f5e",
  };

  return (
    <div className="flex flex-col gap-3 overflow-y-auto pr-1 pb-20 custom-scroll">

      {/* ── Navigation Mode ── */}
      <StatusCard icon="◎" label="Nav Mode" accent={mode.color}>
        <div className="flex items-center gap-3 mt-1">
          <div
            className="relative flex items-center justify-center w-14 h-14 rounded-xl border"
            style={{
              borderColor: `${modeAccentColors[mode.color]}33`,
              background: `${modeAccentColors[mode.color]}0d`,
            }}
          >
            <span className="text-2xl font-extrabold font-mono" style={{ color: modeAccentColors[mode.color] }}>
              {mode.label}
            </span>
            {/* Glow dot */}
            <span
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
              style={{ background: modeAccentColors[mode.color], boxShadow: `0 0 8px ${modeAccentColors[mode.color]}` }}
            />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-200">{mode.desc}</div>
            <div className="text-xs text-slate-500">Active mode</div>
          </div>
        </div>
      </StatusCard>

      {/* ── GPS Trust Score ── */}
      <StatusCard icon="🛡" label="GPS Trust" accent={gpsTrustPct > 60 ? "emerald" : gpsTrustPct > 30 ? "amber" : "rose"}>
        <div className="mt-1">
          <div className="flex items-end justify-between mb-2">
            <span className="text-3xl font-bold font-mono text-slate-100">{gpsTrustPct}%</span>
            <span className="text-xs text-slate-500">
              {gpsTrustPct > 60 ? "Trusted" : gpsTrustPct > 30 ? "Degraded" : "Untrusted"}
            </span>
          </div>
          <div className="relative w-full h-2 rounded-full bg-slate-700/50 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${gpsTrustPct}%`,
                background: gpsTrustPct > 60
                  ? "linear-gradient(90deg, #10b981, #34d399)"
                  : gpsTrustPct > 30
                    ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                    : "linear-gradient(90deg, #f43f5e, #fb7185)",
                boxShadow: gpsTrustPct > 60
                  ? "0 0 10px rgba(16,185,129,0.4)"
                  : gpsTrustPct > 30
                    ? "0 0 10px rgba(245,158,11,0.4)"
                    : "0 0 10px rgba(244,63,94,0.4)",
              }}
            />
          </div>
        </div>
      </StatusCard>

      {/* ── Spoof Score ── */}
      <StatusCard icon="⚡" label="Spoof Score" accent={isSpoofed ? "rose" : "cyan"}>
        <div className="mt-1">
          <div className="flex items-end justify-between mb-2">
            <span className={`text-3xl font-bold font-mono ${isSpoofed ? "text-rose-400" : "text-cyan-400"}`}>
              {spoofPct}%
            </span>
            <span className={`text-xs ${isSpoofed ? "text-rose-400/70" : "text-slate-500"}`}>
              {isSpoofed ? "⚠ High Risk" : "Normal"}
            </span>
          </div>
          <div className="relative w-full h-2 rounded-full bg-slate-700/50 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${spoofPct}%`,
                background: isSpoofed
                  ? "linear-gradient(90deg, #fb7185, #f43f5e)"
                  : "linear-gradient(90deg, #06b6d4, #22d3ee)",
                boxShadow: isSpoofed
                  ? "0 0 10px rgba(244,63,94,0.4)"
                  : "0 0 10px rgba(6,182,212,0.3)",
              }}
            />
          </div>
        </div>
      </StatusCard>

      {/* ── V2X Nodes ── */}
      <StatusCard
        icon="📡"
        label="V2X Nodes"
        value={data.v2x_nodes_count ?? 0}
        accent="violet"
      />

      {/* ── Position ── */}
      <StatusCard icon="📍" label="Position" accent="cyan">
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div className="bg-slate-800/50 rounded-lg px-3 py-2">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-0.5">Lat</div>
            <div className="text-sm font-mono font-semibold text-cyan-300">
              {data.position?.lat?.toFixed(6) ?? "—"}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg px-3 py-2">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-0.5">Lon</div>
            <div className="text-sm font-mono font-semibold text-cyan-300">
              {data.position?.lon?.toFixed(6) ?? "—"}
            </div>
          </div>
        </div>
      </StatusCard>

      {/* ── Reasons ── */}
      {data.reasons && data.reasons.length > 0 && (
        <StatusCard icon="📋" label="Alert Reasons" accent="amber">
          <ul className="mt-1 space-y-1.5">
            {data.reasons.map((reason, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-slate-300 bg-amber-500/5 border border-amber-500/10 rounded-lg px-3 py-2"
              >
                <span className="text-amber-400 mt-0.5 text-xs">▸</span>
                {reason}
              </li>
            ))}
          </ul>
        </StatusCard>
      )}
    </div>
  );
}
