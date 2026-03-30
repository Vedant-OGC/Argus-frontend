/**
 * ConnectionStatus.jsx — MQTT connection status indicator
 */

const STATUS_CONFIG = {
  connected: { label: "Live", color: "bg-emerald-400", pulse: true, text: "text-emerald-400" },
  mock: { label: "Mock", color: "bg-violet-400", pulse: true, text: "text-violet-400" },
  connecting: { label: "Connecting", color: "bg-amber-400", pulse: true, text: "text-amber-400" },
  reconnecting: { label: "Reconnecting", color: "bg-amber-400", pulse: true, text: "text-amber-400" },
  disconnected: { label: "Disconnected", color: "bg-slate-500", pulse: false, text: "text-slate-400" },
  error: { label: "Error", color: "bg-rose-400", pulse: false, text: "text-rose-400" },
};

export default function ConnectionStatus({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.disconnected;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm">
      <div className="relative">
        <span className={`inline-block w-2 h-2 rounded-full ${cfg.color}`} />
        {cfg.pulse && (
          <span className={`absolute inset-0 w-2 h-2 rounded-full ${cfg.color} animate-ping`} />
        )}
      </div>
      <span className={`text-[11px] font-semibold tracking-wider uppercase ${cfg.text}`}>
        {cfg.label}
      </span>
    </div>
  );
}
