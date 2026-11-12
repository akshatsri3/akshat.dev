"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { JournalTrip, JournalLocation } from "@/lib/journal-store";
import Link from "next/link";
import Image from "next/image";
import { Compass } from "lucide-react";

interface WorldMapProps {
  trips: JournalTrip[];
  locations: JournalLocation[];
  tripsByLocationId?: Record<string, JournalTrip>; // locationId -> trip
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
    if (locations.length > 0) {
      const bounds = L.latLngBounds(
        locations.map((loc) => [loc.latitude, loc.longitude] as [number, number])
      );
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
    }
  }, [locations, map]);

  return null;
}

export default function JournalWorldMap({
  trips,
  locations,
  tripsByLocationId = {},
}: WorldMapProps) {
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
      <div className="w-full h-[500px] rounded-3xl overflow-hidden border border-border/50 flex flex-col items-center justify-center bg-card/40 backdrop-blur-sm p-6 text-center shadow-sm">
        <Compass className="size-10 text-muted-foreground/40 mb-3" />
        <p className="text-base font-medium text-muted-foreground">
          Your journey locations will be plotted across this map
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1 max-w-sm">
          Add trips with locations in the admin panel to see your travels visualized worldwide.
        </p>
      </div>
    );
  }

  // De-duplicate markers by lat/lng (keep the last one for each unique position)
  const seen = new Map<string, ValidLocation>();
  for (const loc of validLocations) {
    const key = `${loc.latitude.toFixed(6)},${loc.longitude.toFixed(6)}`;
    seen.set(key, loc);
  }
  const dedupedLocations = Array.from(seen.values());

  return (
    <div className="w-full h-[500px] rounded-3xl overflow-hidden border border-border/50 shadow-sm relative">
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
        center={[20, 0]}
        zoom={2}
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
        <MapBoundsFitter locations={dedupedLocations} />
        {dedupedLocations.map((loc) => {
          const trip = tripsByLocationId[loc.id];
          return (
            <Marker
              key={loc.id}
              position={[loc.latitude, loc.longitude]}
              icon={mapMarkerIcon}
            >
              <Popup>
                <div style={{ width: 220, padding: "14px" }}>
                  {trip ? (
                    <>
                      {trip.cover_image && (
                        <div
                          style={{
                            width: "100%",
                            height: 110,
                            position: "relative",
                            borderRadius: 10,
                            overflow: "hidden",
                            marginBottom: 10,
                          }}
                        >
                          <Image
                            src={trip.cover_image}
                            alt={trip.title}
                            fill
                            unoptimized
                            style={{ objectFit: "cover" }}
                            sizes="220px"
                          />
                        </div>
                      )}
                      <h3
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: "#ffffff",
                          margin: "0 0 4px",
                          lineHeight: 1.3,
                        }}
                      >
                        {trip.title}
                      </h3>
                      <p
                        style={{
                          fontSize: 11,
                          color: "#818cf8",
                          margin: "0 0 6px",
                          textTransform: "uppercase",
                          fontWeight: 600,
                          letterSpacing: "0.06em",
                        }}
                      >
                        {[trip.city, trip.country].filter(Boolean).join(", ")}
                      </p>
                      {(trip.start_date || trip.end_date) && (
                        <p
                          style={{
                            fontSize: 11,
                            color: "rgba(255, 255, 255, 0.55)",
                            margin: "0 0 8px",
                          }}
                        >
                          {trip.start_date}
                          {trip.end_date && trip.end_date !== trip.start_date
                            ? ` – ${trip.end_date}`
                            : ""}
                        </p>
                      )}
                      {trip.description && (
                        <p
                          style={{
                            fontSize: 12,
                            color: "rgba(255, 255, 255, 0.75)",
                            margin: "0 0 12px",
                            lineHeight: 1.4,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {trip.description}
                        </p>
                      )}
                      <Link
                        href={`/journal/${trip.slug}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: 12,
                          color: "#818cf8",
                          textDecoration: "none",
                          fontWeight: 600,
                        }}
                      >
                        Explore Journey →
                      </Link>
                    </>
                  ) : (
                    <>
                      <h3
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: "#ffffff",
                          margin: "0 0 4px",
                        }}
                      >
                        {loc.name}
                      </h3>
                      {loc.description && (
                        <p
                          style={{
                            fontSize: 12,
                            color: "rgba(255, 255, 255, 0.75)",
                            margin: 0,
                            lineHeight: 1.4,
                          }}
                        >
                          {loc.description}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
