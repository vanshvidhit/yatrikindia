import React, { useState, useRef, useEffect } from "react";
import {
  Layers,
  Map as MapIcon,
  Globe,
  Mountain,
  Activity,
  Check,
  ChevronDown,
  Info,
  Radio,
} from "lucide-react";
import { MapLayerMode } from "../../types";
import {
  CoreMapStyleMode,
  MAP_STYLE_CONFIGS,
  normalizeMapLayerMode,
} from "../../config/mapStyles";
import { useRideStore } from "../../store/useRideStore";

interface MapLayerControlProps {
  className?: string;
  onLayerChange?: (mode: CoreMapStyleMode) => void;
  compact?: boolean;
}

export const MapLayerControl: React.FC<MapLayerControlProps> = ({
  className = "",
  onLayerChange,
  compact = false,
}) => {
  const { mapLayerMode, setMapLayerMode } = useRideStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeMode: CoreMapStyleMode = normalizeMapLayerMode(mapLayerMode);
  const activeConfig = MAP_STYLE_CONFIGS[activeMode];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectMode = (mode: CoreMapStyleMode) => {
    setMapLayerMode(mode);
    onLayerChange?.(mode);
    setIsOpen(false);
  };

  const getModeIcon = (mode: CoreMapStyleMode, sizeClass = "w-3.5 h-3.5") => {
    switch (mode) {
      case "DEFAULT":
        return <MapIcon className={sizeClass} />;
      case "SATELLITE":
        return <Globe className={sizeClass} />;
      case "TERRAIN":
        return <Mountain className={sizeClass} />;
      case "TRAFFIC":
        return <Activity className={sizeClass} />;
    }
  };

  const styleKeys: CoreMapStyleMode[] = [
    "DEFAULT",
    "SATELLITE",
    "TERRAIN",
    "TRAFFIC",
  ];

  return (
    <div
      ref={dropdownRef}
      className={`relative pointer-events-auto ${className}`}
    >
      {/* Floating Trigger Button */}
      <button
        type="button"
        id="map-layer-control-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-slate-900/95 hover:bg-slate-850 backdrop-blur-xl border transition-all duration-200 shadow-xl ${
          isOpen
            ? "border-blue-500 ring-2 ring-blue-500/30"
            : "border-slate-700/70 hover:border-slate-600"
        }`}
        title="Toggle Map Layers (Default, Satellite, Terrain, Traffic)"
      >
        <div
          className="w-6 h-6 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105"
          style={{ backgroundColor: activeConfig.accentColor }}
        >
          {getModeIcon(activeMode, "w-3.5 h-3.5")}
        </div>

        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-white tracking-tight">
              {activeConfig.label}
            </span>
            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-mono hidden sm:inline">
              Map
            </span>
          </div>
        </div>

        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ml-0.5 ${
            isOpen ? "rotate-180 text-blue-400" : "group-hover:text-slate-200"
          }`}
        />
      </button>

      {/* Flyout Panel / Layer Selection Modal */}
      {isOpen && (
        <div
          id="map-layer-control-panel"
          className="absolute top-full mt-2 right-0 z-50 w-72 bg-slate-900/98 backdrop-blur-2xl border border-slate-700/80 rounded-2xl p-2.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-2"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Map View Modes
              </span>
            </div>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
              Live GIS
            </span>
          </div>

          {/* 4 Core Map Style Cards */}
          <div className="grid grid-cols-1 gap-1.5">
            {styleKeys.map((key) => {
              const cfg = MAP_STYLE_CONFIGS[key];
              const isSelected = activeMode === key;

              return (
                <button
                  key={key}
                  type="button"
                  id={`map-layer-btn-${key.toLowerCase()}`}
                  onClick={() => handleSelectMode(key)}
                  className={`relative p-2 rounded-xl text-left transition-all border flex items-center justify-between group ${
                    isSelected
                      ? "bg-slate-850/90 border-blue-500/80 shadow-md ring-1 ring-blue-500/40"
                      : "bg-slate-950/60 hover:bg-slate-800/80 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Icon Badge */}
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm transition-all group-hover:scale-105"
                      style={{
                        backgroundColor: isSelected
                          ? cfg.accentColor
                          : "#1e293b",
                        border: `1px solid ${
                          isSelected ? cfg.accentColor : "#334155"
                        }`,
                      }}
                    >
                      {getModeIcon(key, "w-4 h-4")}
                    </div>

                    {/* Text Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-bold ${
                            isSelected ? "text-white" : "text-slate-200"
                          }`}
                        >
                          {cfg.label}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-semibold font-mono ${
                            isSelected
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {cfg.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {cfg.description}
                      </p>
                    </div>
                  </div>

                  {/* Active Radio / Check Indicator */}
                  <div className="shrink-0 ml-2">
                    {isSelected ? (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white shadow-sm"
                        style={{ backgroundColor: cfg.accentColor }}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-600 group-hover:border-slate-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Traffic Congestion Note if Traffic mode is on */}
          {activeMode === "TRAFFIC" && (
            <div className="p-2 bg-rose-950/40 rounded-xl border border-rose-900/50 flex items-center justify-between text-[9px] text-rose-300">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="font-semibold">Live Traffic Flow Active</span>
              </div>
              <span className="font-mono text-slate-400">Delay: +0-5m</span>
            </div>
          )}

          {/* Quick Attribution */}
          <div className="text-[9px] text-slate-500 px-1 truncate text-center">
            {activeConfig.attribution}
          </div>
        </div>
      )}
    </div>
  );
};
