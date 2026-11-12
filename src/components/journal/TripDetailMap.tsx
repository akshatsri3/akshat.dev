"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { JournalLocation } from "@/lib/journal-store";
import { MapPin } from "lucide-react";

interface TripDetailMapProps {
  locations: JournalLocation[];
}

type ValidLocation = JournalLocation & { latitude: number; longitude: number };

const mapMarkerIcon = new L.DivIcon({
  html: `<div style="width:16px;height:16px;background:#818cf8;border-radius:50%;border:2.5px solid #ffffff;box-shadow:0 0 12px rgba(129,140,248,0.85), 0 0 0 2px #6366f1;"></div>`,
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -10],
});

function MapBoundsFitter({ locations }: { locations: ValidLocation[] }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length === 1) {
      map.setView([locations[0].latitude, locations[0].longitude], 10);
    } else if (locations.length > 1) {
      const bounds = L.latLngBounds(
        locations.map((loc) => [loc.latitude, loc.longitude] as [number, number])
      );
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
    }
  }, [locations, map]);

  return null;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          style={{ color: i < rating ? "#fbbf24" : "#4b5563", fontSize: 13 }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function TripDetailMap({ locations }: TripDetailMapProps) {
  useEffect(() => {
    // Fix Leaflet default icon (broken with webpack)
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  const validLocations = locations.filter(
    (l): l is ValidLocation =>
      typeof l.latitude === "number" &&
      typeof l.longitude === "number" &&
      !isNaN(l.latitude) &&
      !isNaN(l.longitude)
  );

  if (validLocations.length === 0) {
    return (
      <div className="w-full h-[350px] rounded-3xl overflow-hidden border border-border/50 flex flex-col items-center justify-center bg-card/40 backdrop-blur-sm p-6 text-center">
        <MapPin className="size-8 text-muted-foreground/40 mb-2" />
        <p className="text-sm font-medium text-muted-foreground">
          No map coordinates specified for this journey yet
        </p>
      </div>
    );
  }

  const center: [number, number] =
    validLocations.length > 0
      ? [validLocations[0].latitude, validLocations[0].longitude]
      : [20, 0];

  return (
    <div className="w-full h-[350px] rounded-3xl overflow-hidden border border-border/50 shadow-sm relative">
      <style>{`
        .leaflet-popup-content-wrapper {
          background: #0f0d19;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          color: #f8fafc;
          box-shadow: 0 12px 32px rgba(0,0,0,0.6);
        }
        .leaflet-popup-tip {
          background: #0f0d19;
        }
        .leaflet-popup-content {
          margin: 0;
        }
        .leaflet-container {
          background: #0b0914;
          font-family: inherit;
        }
        .leaflet-tile-pane {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3);
        }
        .leaflet-control-attribution {
          background: rgba(15, 13, 25, 0.85) !important;
          color: #94a3b8 !important;
          font-size: 10px !important;
        }
        .leaflet-control-attribution a {
          color: #cbd5e1 !important;
        }
        .leaflet-control-zoom {
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 10px !important;
          overflow: hidden;
        }
        .leaflet-control-zoom a {
          background: #0f0d19 !important;
          color: #f8fafc !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        .leaflet-control-zoom a:hover {
          background: #1e1b2e !important;
          color: #818cf8 !important;
        }
      `}</style>
      <MapContainer
        center={center}
        zoom={6}
        maxZoom={10}
        minZoom={1}
        style={{ width: "100%", height: "100%", background: "#0b0914" }}
        attributionControl={true}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        <MapBoundsFitter locations={validLocations} />
        {validLocations.map((loc) => (
          <Marker
            key={loc.id}
            position={[loc.latitude, loc.longitude]}
            icon={mapMarkerIcon}
          >
            <Popup>
              <div style={{ padding: "14px", minWidth: 180 }}>
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#ffffff",
                    margin: "0 0 6px",
                    lineHeight: 1.3,
                  }}
                >
                  {loc.name}
                </h3>
                {loc.rating != null && loc.rating > 0 && (
                  <div style={{ marginBottom: 6 }}>
                    <StarRating rating={loc.rating} />
                  </div>
                )}
                {loc.description && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "rgba(255, 255, 255, 0.75)",
                      margin: "0 0 8px",
                      lineHeight: 1.45,
                    }}
                  >
                    {loc.description}
                  </p>
                )}
                {loc.maps_url && (
                  <a
                    href={loc.maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      fontSize: 12,
                      color: "#818cf8",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    View on Google Maps →
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
