import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Coordinates, DriverTelemetry, MapLayerMode, PlaceItem, TrafficSegment } from "../../types";
import { Layers, Eye, Compass, AlertTriangle, Sparkles, Navigation, Sun, Moon, Image as ImageIcon, Mountain, Activity, Map as MapIcon } from "lucide-react";
import { MAP_STYLE_CONFIGS, normalizeMapLayerMode } from "../../config/mapStyles";

interface MobilityMapViewProps {
  center: Coordinates;
  zoom?: number;
  riderLocation?: Coordinates;
  driverLocation?: Coordinates & { heading?: number; speed?: number };
  nearbyDrivers?: DriverTelemetry[];
  pickupPlace?: PlaceItem | null;
  dropPlace?: PlaceItem | null;
  routePoints?: Coordinates[];
  geofenceCorridor?: boolean;
  onMapClick?: (coords: Coordinates) => void;
  interactive?: boolean;
  mapId: string;
  initialLayerMode?: MapLayerMode;
  layerMode?: MapLayerMode;
  onLayerModeChange?: (mode: MapLayerMode) => void;
  hideBuiltinLayerMenu?: boolean;
}

// Tile provider URLs for different map visualization modes
const MAP_TILE_PROVIDERS = {
  DEFAULT: {
    url: MAP_STYLE_CONFIGS.DEFAULT.tileUrl,
    subdomains: MAP_STYLE_CONFIGS.DEFAULT.subdomains,
    maxZoom: MAP_STYLE_CONFIGS.DEFAULT.maxZoom,
    attribution: MAP_STYLE_CONFIGS.DEFAULT.attribution,
  },
  STANDARD: {
    url: MAP_STYLE_CONFIGS.DEFAULT.tileUrl,
    subdomains: MAP_STYLE_CONFIGS.DEFAULT.subdomains,
    maxZoom: MAP_STYLE_CONFIGS.DEFAULT.maxZoom,
    attribution: MAP_STYLE_CONFIGS.DEFAULT.attribution,
  },
  SATELLITE: {
    url: MAP_STYLE_CONFIGS.SATELLITE.tileUrl,
    subdomains: MAP_STYLE_CONFIGS.SATELLITE.subdomains,
    maxZoom: MAP_STYLE_CONFIGS.SATELLITE.maxZoom,
    attribution: MAP_STYLE_CONFIGS.SATELLITE.attribution,
  },
  TERRAIN: {
    url: MAP_STYLE_CONFIGS.TERRAIN.tileUrl,
    subdomains: MAP_STYLE_CONFIGS.TERRAIN.subdomains,
    maxZoom: MAP_STYLE_CONFIGS.TERRAIN.maxZoom,
    attribution: MAP_STYLE_CONFIGS.TERRAIN.attribution,
  },
  TRAFFIC: {
    url: MAP_STYLE_CONFIGS.TRAFFIC.tileUrl,
    subdomains: MAP_STYLE_CONFIGS.TRAFFIC.subdomains,
    maxZoom: MAP_STYLE_CONFIGS.TRAFFIC.maxZoom,
    attribution: MAP_STYLE_CONFIGS.TRAFFIC.attribution,
  },
  TRAFFIC_FLOW: {
    url: MAP_STYLE_CONFIGS.TRAFFIC.tileUrl,
    subdomains: MAP_STYLE_CONFIGS.TRAFFIC.subdomains,
    maxZoom: MAP_STYLE_CONFIGS.TRAFFIC.maxZoom,
    attribution: MAP_STYLE_CONFIGS.TRAFFIC.attribution,
  },
  DARK_NIGHT: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    subdomains: "abcd",
    maxZoom: 19,
    attribution: "© CartoDB Dark Matter (Night)",
  },
  ISOMETRIC_3D: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    subdomains: "abcd",
    maxZoom: 19,
    attribution: "© CartoDB Light (3D Building Mode)",
  },
};

export const MobilityMapView: React.FC<MobilityMapViewProps> = ({
  center,
  zoom = 14,
  riderLocation,
  driverLocation,
  nearbyDrivers = [],
  pickupPlace,
  dropPlace,
  routePoints = [],
  geofenceCorridor = false,
  onMapClick,
  interactive = true,
  mapId,
  initialLayerMode = "DEFAULT",
  layerMode,
  onLayerModeChange,
  hideBuiltinLayerMenu = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const trafficGroupRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const corridorLayerRef = useRef<L.Polyline | null>(null);

  const [activeLayerMode, setActiveLayerMode] = useState<MapLayerMode>(
    layerMode || initialLayerMode
  );
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showStreetViewPreview, setShowStreetViewPreview] = useState(false);
  const [streetViewTarget, setStreetViewTarget] = useState<"PICKUP" | "DROP">("PICKUP");

  // Keep activeLayerMode in sync when controlled via layerMode prop
  useEffect(() => {
    if (layerMode && layerMode !== activeLayerMode) {
      setActiveLayerMode(layerMode);
    }
  }, [layerMode]);

  const handleSetLayer = (mode: MapLayerMode) => {
    setActiveLayerMode(mode);
    onLayerModeChange?.(mode);
  };

  // Simulated live traffic flow segments on Bhopal urban corridors
  const sampleTrafficSegments: TrafficSegment[] = [
    {
      id: "tr-1",
      startPoint: { lat: 23.2517, lng: 77.4650 },
      endPoint: { lat: 23.2420, lng: 77.4480 },
      severity: "HEAVY",
      color: "#ef4444", // Red
      delayMin: 5,
      roadName: "Raisen Road (Indrapuri Sector C to Chetak Bridge)",
    },
    {
      id: "tr-2",
      startPoint: { lat: 23.2420, lng: 77.4480 },
      endPoint: { lat: 23.2332, lng: 77.4326 },
      severity: "MODERATE",
      color: "#f59e0b", // Orange
      delayMin: 3,
      roadName: "Chetak Bridge to MP Nagar Zone-1 (DB City)",
    },
    {
      id: "tr-3",
      startPoint: { lat: 23.2517, lng: 77.4650 },
      endPoint: { lat: 23.2625, lng: 77.4780 },
      severity: "LOW",
      color: "#10b981", // Green (Clear)
      delayMin: 0,
      roadName: "Indrapuri Sector C to BHEL Kasturba Gate Corridor",
    },
  ];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [center.lat, center.lng],
        zoom: zoom,
        zoomControl: false,
        attributionControl: false,
        dragging: interactive,
        touchZoom: interactive,
        scrollWheelZoom: interactive,
      });

      // Default Tile Layer
      const initialModeKey = normalizeMapLayerMode(activeLayerMode);
      const provider = MAP_TILE_PROVIDERS[initialModeKey] || MAP_TILE_PROVIDERS.DEFAULT;
      const tileLayer = L.tileLayer(provider.url, {
        subdomains: provider.subdomains,
        maxZoom: provider.maxZoom,
      }).addTo(map);
      tileLayerRef.current = tileLayer;

      const trafficGroup = L.layerGroup().addTo(map);
      trafficGroupRef.current = trafficGroup;

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;

      if (onMapClick) {
        map.on("click", (e: L.LeafletMouseEvent) => {
          onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
        });
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapId]);

  // Handle Dynamic Map Layer Mode Switching
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    let targetProvider = MAP_TILE_PROVIDERS.DEFAULT;
    if (activeLayerMode === "SATELLITE") {
      targetProvider = MAP_TILE_PROVIDERS.SATELLITE;
    } else if (activeLayerMode === "TERRAIN") {
      targetProvider = MAP_TILE_PROVIDERS.TERRAIN;
    } else if (activeLayerMode === "TRAFFIC" || activeLayerMode === "TRAFFIC_FLOW") {
      targetProvider = MAP_TILE_PROVIDERS.TRAFFIC;
    } else if (activeLayerMode === "DARK_NIGHT") {
      targetProvider = MAP_TILE_PROVIDERS.DARK_NIGHT;
    } else if (activeLayerMode === "ISOMETRIC_3D") {
      targetProvider = MAP_TILE_PROVIDERS.ISOMETRIC_3D;
    }

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const newTileLayer = L.tileLayer(targetProvider.url, {
      subdomains: targetProvider.subdomains,
      maxZoom: targetProvider.maxZoom,
    }).addTo(map);
    tileLayerRef.current = newTileLayer;

    // Traffic Flow Layer Management
    const trafficGroup = trafficGroupRef.current;
    if (trafficGroup) {
      trafficGroup.clearLayers();

      const showTraffic =
        activeLayerMode === "TRAFFIC" ||
        activeLayerMode === "TRAFFIC_FLOW" ||
        activeLayerMode === "DEFAULT" ||
        activeLayerMode === "STANDARD";

      if (showTraffic) {
        sampleTrafficSegments.forEach((seg) => {
          const latlngs: L.LatLngTuple[] = [
            [seg.startPoint.lat, seg.startPoint.lng],
            [seg.endPoint.lat, seg.endPoint.lng],
          ];

          const isTrafficMode =
            activeLayerMode === "TRAFFIC" || activeLayerMode === "TRAFFIC_FLOW";

          // Draw Traffic Congestion Flow Line
          L.polyline(latlngs, {
            color: seg.color,
            weight: isTrafficMode ? 7 : 4,
            opacity: isTrafficMode ? 0.95 : 0.6,
            dashArray: seg.severity === "HEAVY" ? "4, 6" : undefined,
          })
            .addTo(trafficGroup)
            .bindTooltip(
              `🚦 ${seg.roadName}: ${seg.severity} Congestion (${seg.delayMin > 0 ? `+${seg.delayMin}m delay` : "Smooth Flow"})`,
              { direction: "top" }
            );
        });
      }
    }
  }, [activeLayerMode]);

  // Update center when center prop changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([center.lat, center.lng], zoom, {
        animate: true,
        duration: 0.8,
      });
    }
  }, [center.lat, center.lng, zoom]);

  // Render Markers and Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // 1. Rider Location Pin (Pulsating Blue Ring)
    if (riderLocation) {
      const riderHtml = `
        <div class="relative flex items-center justify-center">
          <span class="absolute w-8 h-8 rounded-full bg-blue-500/40 animate-ping"></span>
          <span class="absolute w-5 h-5 rounded-full bg-blue-500/50"></span>
          <div class="relative w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-[8px] text-white font-bold">
            YOU
          </div>
        </div>
      `;
      const riderIcon = L.divIcon({
        className: "custom-rider-pin",
        html: riderHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      L.marker([riderLocation.lat, riderLocation.lng], { icon: riderIcon })
        .addTo(markersGroup)
        .bindTooltip("You are here (GPS locked)", { direction: "top", offset: [0, -10] });
    }

    // 2. Nearby Drivers Markers (Streaming from Redis Geospatial with 3D/Isometric Pin styling)
    nearbyDrivers.forEach((driver) => {
      let iconColor = "bg-blue-600";
      let vehicleBadge = "🚗";

      if (driver.vehicleType === "BIKE") {
        iconColor = "bg-amber-500";
        vehicleBadge = "🏍️";
      } else if (driver.vehicleType === "SCOOTY") {
        iconColor = "bg-emerald-500";
        vehicleBadge = "🛵";
      } else if (driver.vehicleType === "AUTO") {
        iconColor = "bg-yellow-500";
        vehicleBadge = "🛺";
      } else if (driver.vehicleType === "OUTSTATION") {
        iconColor = "bg-purple-600";
        vehicleBadge = "🚙";
      } else if (driver.vehicleType === "PARCEL") {
        iconColor = "bg-pink-600";
        vehicleBadge = "📦";
      }

      const driverHtml = `
        <div style="transform: rotate(${driver.heading}deg); transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);" class="relative flex items-center justify-center">
          <div class="w-8 h-8 rounded-full ${iconColor} border-2 border-white shadow-xl flex items-center justify-center text-sm transform hover:scale-110 transition-transform">
            ${vehicleBadge}
          </div>
          <div class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900 animate-pulse"></div>
        </div>
      `;

      const driverIcon = L.divIcon({
        className: `custom-driver-pin-${driver.driverId}`,
        html: driverHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([driver.lat, driver.lng], { icon: driverIcon })
        .addTo(markersGroup)
        .bindTooltip(
          `<b>${driver.driverName}</b><br/>${driver.vehicleType} (${driver.rating}⭐) • ${driver.speed || 30} km/h`,
          { direction: "top", offset: [0, -12] }
        );
    });

    // 3. Primary Active Driver Pin (Smooth glide interpolation during trip)
    if (driverLocation) {
      const activeDriverHtml = `
        <div style="transform: rotate(${driverLocation.heading || 0}deg); transition: transform 0.4s ease-out;" class="relative flex items-center justify-center">
          <span class="absolute w-12 h-12 rounded-full bg-emerald-500/30 animate-pulse"></span>
          <div class="relative w-9 h-9 rounded-full bg-emerald-600 border-2 border-white shadow-2xl flex items-center justify-center text-white text-base">
            🚖
          </div>
          <div class="absolute -bottom-2 bg-slate-900/90 text-emerald-400 text-[9px] font-mono px-1 rounded border border-emerald-500/40">
            ${driverLocation.speed || 34}km/h
          </div>
        </div>
      `;
      const activeDriverIcon = L.divIcon({
        className: "custom-active-driver",
        html: activeDriverHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      L.marker([driverLocation.lat, driverLocation.lng], {
        icon: activeDriverIcon,
      }).addTo(markersGroup);
    }

    // 4. Pickup Pin (Green Pin with Street View Peek)
    if (pickupPlace) {
      const pickupHtml = `
        <div class="relative flex flex-col items-center group cursor-pointer">
          <div class="w-7 h-7 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shadow-xl border-2 border-white">
            P
          </div>
          <div class="w-1.5 h-2.5 bg-emerald-600 rounded-b"></div>
        </div>
      `;
      const pickupIcon = L.divIcon({
        className: "custom-pickup-pin",
        html: pickupHtml,
        iconSize: [28, 34],
        iconAnchor: [14, 34],
      });
      L.marker([pickupPlace.coords.lat, pickupPlace.coords.lng], {
        icon: pickupIcon,
      })
        .addTo(markersGroup)
        .bindTooltip(`📍 Pickup: ${pickupPlace.title}`, {
          direction: "top",
          offset: [0, -28],
        });
    }

    // 5. Drop Pin (Red Pin)
    if (dropPlace) {
      const dropHtml = `
        <div class="relative flex flex-col items-center group cursor-pointer">
          <div class="w-7 h-7 rounded-full bg-rose-500 text-white font-black text-xs flex items-center justify-center shadow-xl border-2 border-white">
            D
          </div>
          <div class="w-1.5 h-2.5 bg-rose-600 rounded-b"></div>
        </div>
      `;
      const dropIcon = L.divIcon({
        className: "custom-drop-pin",
        html: dropHtml,
        iconSize: [28, 34],
        iconAnchor: [14, 34],
      });
      L.marker([dropPlace.coords.lat, dropPlace.coords.lng], {
        icon: dropIcon,
      })
        .addTo(markersGroup)
        .bindTooltip(`🏁 Destination: ${dropPlace.title}`, {
          direction: "top",
          offset: [0, -28],
        });
    }

    // 6. Route Polyline & Geofence Safety Corridor
    if (routePoints && routePoints.length > 1) {
      const latlngs: L.LatLngTuple[] = routePoints.map((p) => [p.lat, p.lng]);

      if (corridorLayerRef.current) {
        map.removeLayer(corridorLayerRef.current);
      }
      if (routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current);
      }

      // Safety Corridor Buffer (250m width visual band)
      if (geofenceCorridor) {
        corridorLayerRef.current = L.polyline(latlngs, {
          color: "#38bdf8",
          weight: 24,
          opacity: 0.22,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);
      }

      // High-precision Route Polyline with gradient neon styling
      routeLayerRef.current = L.polyline(latlngs, {
        color: activeLayerMode === "DARK_NIGHT" ? "#38bdf8" : "#10b981",
        weight: 6,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      // Auto fit bounds
      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [
    riderLocation,
    driverLocation?.lat,
    driverLocation?.lng,
    driverLocation?.heading,
    nearbyDrivers,
    pickupPlace,
    dropPlace,
    routePoints,
    geofenceCorridor,
    activeLayerMode,
  ]);

  return (
    <div
      className={`relative w-full h-full rounded-[inherit] overflow-hidden isolate ${
        activeLayerMode === "ISOMETRIC_3D" ? "perspective-[1000px]" : ""
      }`}
    >
      {/* Map Tile Canvas Container with optional 3D Tilt transform */}
      <div
        id={mapId}
        ref={mapContainerRef}
        className={`w-full h-full rounded-[inherit] transition-transform duration-700 ease-out ${
          activeLayerMode === "ISOMETRIC_3D"
            ? "rotate-x-[22deg] scale-105 origin-bottom"
            : ""
        }`}
      />

      {/* Floating Map Mode Switcher HUD (when not hidden by parent) */}
      {!hideBuiltinLayerMenu && (
        <div className="absolute top-14 left-3 z-30 flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="px-2.5 py-1.5 bg-slate-900/90 backdrop-blur-md hover:bg-slate-800 text-white font-bold text-[11px] rounded-xl border border-slate-700/80 shadow-xl flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span className="capitalize font-semibold">
              {activeLayerMode.replace("_", " ")}
            </span>
          </button>

          {/* Map Layers Dropdown Picker */}
          {showLayerMenu && (
            <div className="absolute top-10 left-0 p-2 bg-slate-950/98 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col gap-1 w-52 animate-in fade-in slide-in-from-top-2 z-50">
              <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Map Perspectives
              </div>

              <button
                onClick={() => {
                  handleSetLayer("DEFAULT");
                  setShowLayerMenu(false);
                }}
                className={`px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                  activeLayerMode === "DEFAULT" || activeLayerMode === "STANDARD"
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapIcon className="w-3.5 h-3.5 text-blue-300" />
                  <span>Default Streets</span>
                </div>
              </button>

              <button
                onClick={() => {
                  handleSetLayer("SATELLITE");
                  setShowLayerMenu(false);
                }}
                className={`px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                  activeLayerMode === "SATELLITE"
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Satellite Photoreal</span>
                </div>
              </button>

              <button
                onClick={() => {
                  handleSetLayer("TERRAIN");
                  setShowLayerMenu(false);
                }}
                className={`px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                  activeLayerMode === "TERRAIN"
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Mountain className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Terrain Topo</span>
                </div>
              </button>

              <button
                onClick={() => {
                  handleSetLayer("TRAFFIC");
                  setShowLayerMenu(false);
                }}
                className={`px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                  activeLayerMode === "TRAFFIC" || activeLayerMode === "TRAFFIC_FLOW"
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-rose-400" />
                  <span>Live Traffic Flow</span>
                </div>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Street View Quick Peek Button (floating on right if pickup/drop is set) */}
      {(pickupPlace || dropPlace) && (
        <div className="absolute top-14 right-3 z-30 pointer-events-auto">
          <button
            onClick={() => {
              setStreetViewTarget(pickupPlace ? "PICKUP" : "DROP");
              setShowStreetViewPreview(true);
            }}
            className="px-2.5 py-1.5 bg-slate-900/90 backdrop-blur-md hover:bg-slate-800 text-slate-200 hover:text-white text-[11px] font-bold rounded-xl border border-slate-700/80 shadow-xl flex items-center gap-1.5 transition-all"
            title="Preview 360 Street View of Pickup / Drop spot"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>360° View</span>
          </button>
        </div>
      )}

      {/* Live Traffic Legend Badge (when in Traffic mode) */}
      {(activeLayerMode === "TRAFFIC" || activeLayerMode === "TRAFFIC_FLOW") && (
        <div className="absolute top-14 left-3 z-30 pointer-events-none bg-slate-950/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-rose-900/60 shadow-xl text-[10px] text-slate-300 flex items-center gap-2.5 animate-in fade-in">
          <span className="text-[9px] font-bold uppercase tracking-wider text-rose-400 font-mono">
            Traffic
          </span>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[9px]">Clear</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-[9px]">Slow</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span className="text-[9px]">Congested</span>
          </div>
        </div>
      )}

      {/* Street View 360 Panorama Preview Modal */}
      {showStreetViewPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    Ground-Level Street View Panorama
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {streetViewTarget === "PICKUP"
                      ? pickupPlace?.title || "Pickup Spot"
                      : dropPlace?.title || "Destination Spot"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {pickupPlace && dropPlace && (
                  <div className="flex bg-slate-800 rounded-lg p-0.5 text-[10px]">
                    <button
                      onClick={() => setStreetViewTarget("PICKUP")}
                      className={`px-2 py-1 rounded font-bold ${
                        streetViewTarget === "PICKUP"
                          ? "bg-blue-600 text-white"
                          : "text-slate-400"
                      }`}
                    >
                      Pickup
                    </button>
                    <button
                      onClick={() => setStreetViewTarget("DROP")}
                      className={`px-2 py-1 rounded font-bold ${
                        streetViewTarget === "DROP"
                          ? "bg-blue-600 text-white"
                          : "text-slate-400"
                      }`}
                    >
                      Drop
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setShowStreetViewPreview(false)}
                  className="px-2 py-1 text-slate-400 hover:text-white font-bold text-xs"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* High-Res Street View Visual Canvas */}
            <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
              <img
                src={
                  streetViewTarget === "PICKUP"
                    ? "https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?w=800&q=80&auto=format&fit=crop"
                    : "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=800&q=80&auto=format&fit=crop"
                }
                alt="Street View"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-3">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Exact Curbside Visual Landmark</span>
                  </div>
                  <span className="text-[10px] bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-700">
                    Heading 145° SE
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Captain and Passenger can verify exact storefront signs, terminal pillars, and curbside gates to eliminate pickup confusion.
            </p>

            <button
              onClick={() => setShowStreetViewPreview(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 font-bold text-white text-xs rounded-xl transition-colors"
            >
              Back to Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
