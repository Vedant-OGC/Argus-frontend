/**
 * App.jsx — Argus Dashboard: Real-Time Drone Navigation Monitor
 *
 * Connects to MQTT via WebSocket and displays live drone telemetry
 * including position on Leaflet map, navigation mode, GPS trust,
 * spoof detection alerts, V2X node count, and alert reasons.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import MapView from "./components/MapView";
import DashboardPanel from "./components/DashboardPanel";
import AlertBanner from "./components/AlertBanner";
import ConnectionStatus from "./components/ConnectionStatus";
import { connectMQTT, MOCK_MODE } from "./services/MQTTService";

// ─── Maximum trail points to keep ───
const MAX_TRAIL = 100;

// ─── Default state ───
const DEFAULT_DATA = {
  mode: "GPS",
  gps_trust: 0,
  spoof_score: 0,
  position: { lat: 18.5204, lon: 73.8567 },
  alert: null,
  v2x_nodes_count: 0,
  reasons: [],
};

export default function App() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [trail, setTrail] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messageCount, setMessageCount] = useState(0);
  const clientRef = useRef(null);

  // ─── MQTT message handler ───
  const handleMessage = useCallback((incoming) => {
    setData(incoming);
    setMessageCount((prev) => prev + 1);

    if (incoming.position?.lat && incoming.position?.lon) {
      setTrail((prev) => {
        const updated = [...prev, [incoming.position.lat, incoming.position.lon]];
        return updated.length > MAX_TRAIL ? updated.slice(-MAX_TRAIL) : updated;
      });
    }
  }, []);

  // ─── Connect on mount, disconnect on unmount ───
  useEffect(() => {
    const client = connectMQTT(handleMessage, setConnectionStatus);
    clientRef.current = client;

    return () => {
      client.disconnect();
    };
  }, [handleMessage]);

  const isSpoofed = data.spoof_score > 0.5;
  const position = data.position ? [data.position.lat, data.position.lon] : null;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0a0e1a]">

      {/* ── Full-screen Map ── */}
      <MapView position={position} trail={trail} isSpoofed={isSpoofed} />

      {/* ── Spoof Alert Banner ── */}
      <AlertBanner alert={data.alert} spoofScore={data.spoof_score} />

      {/* ── Top Bar ── */}
      <div className="absolute top-4 left-4 z-[1000] flex items-center gap-4 animate-fade-in">
        {/* Logo & Title */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/70 border border-slate-700/40 backdrop-blur-xl">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 shadow-lg shadow-cyan-500/20">
            <span className="text-white font-extrabold text-lg">A</span>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-none">
              Argus
            </h1>
            <span className="text-[10px] tracking-widest uppercase text-slate-400 font-medium">
              Drone Monitor
            </span>
          </div>
        </div>

        {/* Connection Status */}
        <ConnectionStatus status={connectionStatus} />

        {/* Message Counter */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm">
          <span className="text-[11px] font-mono text-slate-400">
            ⟐ {messageCount} msg{messageCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── Sidebar Toggle ── */}
      <button
        id="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-4 right-4 z-[1001] flex items-center justify-center w-10 h-10
                   rounded-xl bg-slate-900/70 border border-slate-700/40 backdrop-blur-xl
                   text-slate-300 hover:text-white hover:border-cyan-500/30
                   transition-all duration-300 cursor-pointer"
        title={sidebarOpen ? "Hide panel" : "Show panel"}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {sidebarOpen ? (
            <>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="15" y1="3" x2="15" y2="21" />
            </>
          ) : (
            <>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </>
          )}
        </svg>
      </button>

      {/* ── Side Dashboard Panel ── */}
      <div
        className={`absolute top-0 right-0 z-[999] h-full pt-20 px-4 pb-4 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                    ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ width: "clamp(300px, 22vw, 380px)" }}
      >
        <DashboardPanel data={data} />
      </div>

      {/* ── Bottom Status Bar ── */}
      <div className="absolute bottom-4 left-4 z-[1000] flex items-center gap-3 animate-fade-in">
        <div className="flex items-center gap-4 px-4 py-2 rounded-2xl bg-slate-900/70 border border-slate-700/40 backdrop-blur-xl">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            {MOCK_MODE ? "Simulation" : "Live Feed"}
          </span>
          <div className="w-px h-4 bg-slate-700" />
          <span className="text-[10px] font-mono text-slate-500">
            {data.position?.lat?.toFixed(4)}, {data.position?.lon?.toFixed(4)}
          </span>
          <div className="w-px h-4 bg-slate-700" />
          <span className={`text-[10px] font-mono font-semibold ${
            data.mode === "GPS" ? "text-emerald-400" :
            data.mode === "V2X" ? "text-amber-400" : "text-rose-400"
          }`}>
            {data.mode}
          </span>
        </div>
      </div>
    </div>
  );
}
