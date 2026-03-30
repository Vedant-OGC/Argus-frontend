/**
 * MQTTService.js — MQTT connection manager for Argus Dashboard
 *
 * Connects via WebSocket to an MQTT broker and subscribes to
 * the `dashboard/data` topic for real-time drone telemetry.
 *
 * Includes mock data simulation mode for development/testing.
 */

import mqtt from "mqtt";

// ─── Configuration ───
const BROKER_URL = import.meta.env.VITE_MQTT_BROKER_URL || "ws://localhost:9001";
const TOPIC = "dashboard/data";

// ─── Toggle mock mode (true = simulated data, no broker needed) ───
export const MOCK_MODE = false;

// ─── Default center coordinates (Pune, India) ───
const DEFAULT_LAT = 18.5204;
const DEFAULT_LON = 73.8567;

/**
 * Connect to the MQTT broker and subscribe to telemetry data.
 * @param {function} onMessage - Callback invoked with parsed JSON on each message
 * @param {function} onStatus  - Callback invoked with connection status string
 * @returns {{ disconnect: function }} Object with a disconnect method
 */
export function connectMQTT(onMessage, onStatus) {
  if (MOCK_MODE) {
    return startMockStream(onMessage, onStatus);
  }

  onStatus("connecting");
  console.log(`[MQTT] Connecting to ${BROKER_URL}...`);

  const client = mqtt.connect(BROKER_URL, {
    reconnectPeriod: 3000,
    connectTimeout: 10000,
    keepalive: 30,
  });

  client.on("connect", () => {
    console.log("[MQTT] Connected successfully");
    onStatus("connected");
    client.subscribe(TOPIC, { qos: 0 }, (err) => {
      if (err) {
        console.error("[MQTT] Subscribe error:", err);
        onStatus("error");
      } else {
        console.log(`[MQTT] Subscribed to ${TOPIC}`);
      }
    });
  });

  client.on("message", (topic, payload) => {
    try {
      const data = JSON.parse(payload.toString());
      console.log("[MQTT] Received:", data);
      onMessage(data);
    } catch (err) {
      console.error("[MQTT] Failed to parse message:", err);
    }
  });

  client.on("error", (err) => {
    console.error("[MQTT] Connection error:", err);
    onStatus("error");
  });

  client.on("reconnect", () => {
    console.log("[MQTT] Reconnecting...");
    onStatus("reconnecting");
  });

  client.on("close", () => {
    console.log("[MQTT] Connection closed");
    onStatus("disconnected");
  });

  client.on("offline", () => {
    console.log("[MQTT] Went offline");
    onStatus("disconnected");
  });

  return {
    disconnect: () => {
      client.end(true);
      onStatus("disconnected");
    },
  };
}

// ─── Mock Data Simulation ───

const MODES = ["GPS", "V2X", "IMU"];
const ALERTS = [null, null, null, "GPS SPOOFED", "SIGNAL DEGRADED"];
const REASON_POOL = [
  "Speed violation",
  "IMU mismatch",
  "Signal anomaly detected",
  "V2X beacon timeout",
  "Position jump detected",
  "Altitude discrepancy",
  "Heading divergence",
  "Satellite loss",
];

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function generateMockData(prevLat, prevLon) {
  const isSpoofed = Math.random() > 0.65;
  const mode = isSpoofed ? "IMU" : MODES[Math.floor(Math.random() * MODES.length)];
  const spoofScore = isSpoofed ? randomInRange(0.7, 1.0) : randomInRange(0.0, 0.3);
  const gpsTrust = 1 - spoofScore + randomInRange(-0.05, 0.05);
  const alert = isSpoofed
    ? ALERTS[Math.floor(Math.random() * 2) + 3]
    : ALERTS[Math.floor(Math.random() * 3)];

  // Small random walk from previous position
  const lat = prevLat + randomInRange(-0.0008, 0.0008);
  const lon = prevLon + randomInRange(-0.0008, 0.0008);

  // Pick 0-3 random reasons
  const numReasons = isSpoofed ? Math.floor(randomInRange(1, 4)) : Math.floor(randomInRange(0, 2));
  const reasons = [];
  const pool = [...REASON_POOL];
  for (let i = 0; i < numReasons && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    reasons.push(pool.splice(idx, 1)[0]);
  }

  return {
    mode,
    gps_trust: Math.max(0, Math.min(1, parseFloat(gpsTrust.toFixed(3)))),
    spoof_score: parseFloat(spoofScore.toFixed(3)),
    position: {
      lat: parseFloat(lat.toFixed(6)),
      lon: parseFloat(lon.toFixed(6)),
    },
    alert,
    v2x_nodes_count: Math.floor(randomInRange(0, 8)),
    reasons,
  };
}

function startMockStream(onMessage, onStatus) {
  console.log("[MOCK] Starting simulated data stream");
  onStatus("mock");

  let lat = DEFAULT_LAT;
  let lon = DEFAULT_LON;

  // Send initial data immediately
  const initialData = generateMockData(lat, lon);
  lat = initialData.position.lat;
  lon = initialData.position.lon;
  onMessage(initialData);

  const interval = setInterval(() => {
    const data = generateMockData(lat, lon);
    lat = data.position.lat;
    lon = data.position.lon;
    console.log("[MOCK] Simulated:", data);
    onMessage(data);
  }, 2000);

  return {
    disconnect: () => {
      clearInterval(interval);
      onStatus("disconnected");
      console.log("[MOCK] Stream stopped");
    },
  };
}
