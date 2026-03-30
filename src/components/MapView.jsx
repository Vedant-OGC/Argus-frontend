/**
 * MapView.jsx — Leaflet map showing live drone position with trail
 */

import { useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

// ─── Custom Drone Marker Icon ───
function createDroneIcon(isSpoofed) {
  const color = isSpoofed ? "#f43f5e" : "#06b6d4";
  const glowColor = isSpoofed ? "rgba(244,63,94,0.4)" : "rgba(6,182,212,0.4)";

  return L.divIcon({
    className: "drone-marker-wrapper",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    html: `
      <div class="drone-marker ${isSpoofed ? "drone-marker-spoofed" : ""}" style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
        <div class="drone-marker-ring"></div>
        <div class="drone-marker-dot" style="
          width:16px;height:16px;border-radius:50%;
          background:${color};
          border:3px solid ${glowColor};
          box-shadow:0 0 20px ${glowColor}, 0 0 40px ${glowColor.replace("0.4", "0.15")};
          position:relative;z-index:2;
        "></div>
      </div>
    `,
  });
}

// ─── Map view updater (recenters smoothly) ───
function MapUpdater({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom(), { duration: 1.2 });
    }
  }, [position, map]);
  return null;
}

export default function MapView({ position, trail, isSpoofed }) {
  const defaultCenter = [18.5204, 73.8567];
  const center = position || defaultCenter;
  const markerRef = useRef(null);

  const icon = useMemo(() => createDroneIcon(isSpoofed), [isSpoofed]);

  // Trail polyline options
  const trailOptions = {
    color: isSpoofed ? "#f43f5e" : "#06b6d4",
    weight: 2.5,
    opacity: 0.45,
    dashArray: "8, 6",
    lineCap: "round",
  };

  return (
    <div className="absolute inset-0">
      <MapContainer
        center={center}
        zoom={16}
        zoomControl={true}
        attributionControl={false}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapUpdater position={center} />

        {/* Trail path */}
        {trail && trail.length > 1 && (
          <Polyline positions={trail} pathOptions={trailOptions} />
        )}

        {/* Drone marker */}
        {position && (
          <Marker ref={markerRef} position={position} icon={icon} />
        )}
      </MapContainer>

      {/* Map overlay gradient (bottom fade for readability) */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0e1a]/80 to-transparent z-[500]" />
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#0a0e1a]/60 to-transparent z-[500]" />
    </div>
  );
}
