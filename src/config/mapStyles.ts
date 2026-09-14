import { MapLayerMode } from "../types";

export type CoreMapStyleMode = "DEFAULT" | "SATELLITE" | "TERRAIN" | "TRAFFIC";

export interface MapStyleConfig {
  id: CoreMapStyleMode;
  label: string;
  shortLabel: string;
  description: string;
  badge: string;
  tileUrl: string;
  subdomains: string;
  maxZoom: number;
  attribution: string;
  hasTrafficOverlay: boolean;
  accentColor: string;
  gradientBadge: string;
  previewBg: string;
}

export const MAP_STYLE_CONFIGS: Record<CoreMapStyleMode, MapStyleConfig> = {
  DEFAULT: {
    id: "DEFAULT",
    label: "Google Streets",
    shortLabel: "Google Roads",
    description: "Every Indian city street, lane, cross & landmark via Google Maps",
    badge: "Google Roads HD",
    tileUrl: "https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    subdomains: "0123",
    maxZoom: 21,
    attribution: "© Google Maps Platform — India Street & Road Network",
    hasTrafficOverlay: false,
    accentColor: "#3b82f6", // Electric Blue
    gradientBadge: "from-blue-500 to-indigo-600",
    previewBg: "bg-slate-800 border-slate-700",
  },
  SATELLITE: {
    id: "SATELLITE",
    label: "Google Satellite",
    shortLabel: "Satellite",
    description: "Photorealistic Google orbital imagery with street & road labels",
    badge: "Google Hybrid",
    tileUrl: "https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    subdomains: "0123",
    maxZoom: 20,
    attribution: "© Google Maps Satellite & Imagery",
    hasTrafficOverlay: false,
    accentColor: "#f59e0b", // Amber Gold
    gradientBadge: "from-amber-500 to-orange-600",
    previewBg: "bg-emerald-950 border-emerald-800",
  },
  TERRAIN: {
    id: "TERRAIN",
    label: "Google Terrain",
    shortLabel: "Terrain",
    description: "Google Topographic relief, ghat contours & road highways",
    badge: "3D Elevation",
    tileUrl: "https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
    subdomains: "0123",
    maxZoom: 20,
    attribution: "© Google Maps Topographic & Elevation",
    hasTrafficOverlay: false,
    accentColor: "#10b981", // Emerald
    gradientBadge: "from-emerald-500 to-teal-600",
    previewBg: "bg-teal-950 border-teal-800",
  },
  TRAFFIC: {
    id: "TRAFFIC",
    label: "Google Live Traffic",
    shortLabel: "Live Traffic",
    description: "Real-time Google traffic congestion telemetry & delay speeds",
    badge: "Live Telemetry",
    tileUrl: "https://mt{s}.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}",
    subdomains: "0123",
    maxZoom: 21,
    attribution: "© Google Maps Live Traffic & Congestion Flow",
    hasTrafficOverlay: true,
    accentColor: "#ef4444", // Rose Red
    gradientBadge: "from-rose-500 to-red-600",
    previewBg: "bg-rose-950 border-rose-800",
  },
};

/**
 * Normalizes any legacy or extended MapLayerMode to one of the primary 4 modes
 */
export function normalizeMapLayerMode(mode: MapLayerMode): CoreMapStyleMode {
  if (mode === "SATELLITE") return "SATELLITE";
  if (mode === "TERRAIN") return "TERRAIN";
  if (mode === "TRAFFIC" || mode === "TRAFFIC_FLOW") return "TRAFFIC";
  return "DEFAULT";
}
