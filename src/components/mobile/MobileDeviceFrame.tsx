import React, { useState } from "react";
import {
  Wifi,
  BatteryMedium,
  Signal,
  Shield,
  Navigation,
  Smartphone,
  Sparkles,
  Car,
} from "lucide-react";
import { useRideStore } from "../../store/useRideStore";

interface MobileDeviceFrameProps {
  children: React.ReactNode;
  deviceType?: "iphone" | "android";
  title?: string;
  roleBadge?: string;
  badgeColor?: string;
  onRefresh?: () => void;
  className?: string;
}

export const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({
  children,
  deviceType: initialDeviceType = "iphone",
  title = "Device",
  roleBadge,
  badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  className = "",
}) => {
  const [selectedOS, setSelectedOS] = useState<"iphone" | "android">(initialDeviceType);
  const { riderActiveRide } = useRideStore();

  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Device Label Bar & OS Switcher */}
      <div className="flex items-center justify-between w-full max-w-[390px] px-3 py-1.5 mb-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-medium tracking-wide">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-200 font-bold">{title}</span>
        </div>

        {/* OS Platform Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setSelectedOS("iphone")}
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
              selectedOS === "iphone"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            iOS
          </button>
          <button
            onClick={() => setSelectedOS("android")}
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
              selectedOS === "android"
                ? "bg-emerald-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Android
          </button>
        </div>
      </div>

      {/* Hardware Frame Shell with Refined Curvature */}
      <div className="relative w-[375px] max-w-[calc(100vw-24px)] h-[min(790px,calc(100vh-80px))] bg-slate-950 rounded-[52px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border-[4px] border-slate-800 ring-1 ring-slate-700/60 overflow-hidden flex flex-col transition-all">
        {/* Subtle Hardware Edge Buttons (Left Volume & Right Power) */}
        <div className="hidden sm:block absolute -left-1 top-24 w-1 h-8 bg-slate-700 rounded-l-sm" />
        <div className="hidden sm:block absolute -left-1 top-36 w-1 h-12 bg-slate-700 rounded-l-sm" />
        <div className="hidden sm:block absolute -left-1 top-52 w-1 h-12 bg-slate-700 rounded-l-sm" />
        <div className="hidden sm:block absolute -right-1 top-32 w-1 h-16 bg-slate-700 rounded-r-sm" />

        {/* Device Bezel Specular Inset Rim */}
        <div className="absolute inset-0 rounded-[48px] pointer-events-none border border-white/10 shadow-inner" />

        {/* Screen Container with Continuous Curvature */}
        <div className="relative w-full h-full bg-slate-900 rounded-[42px] overflow-hidden flex flex-col text-slate-100 isolate">
          {/* Status Bar */}
          <div className="relative z-30 h-11 px-6 flex items-center justify-between text-xs font-semibold tracking-tight text-white bg-slate-900/80 backdrop-blur-md">
            <span className="text-[13px]">{currentTime}</span>

            {/* Dynamic Island (iPhone) or Punch Hole (Android) */}
            {selectedOS === "iphone" ? (
              <div className="absolute left-1/2 -translate-x-1/2 top-2 h-6 w-28 bg-black rounded-full flex items-center justify-between px-2.5 shadow-inner">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700/60 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-blue-900" />
                </div>
                {riderActiveRide ? (
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-emerald-400 font-mono font-bold">3m</span>
                    <Car className="w-3 h-3 text-emerald-400 animate-pulse" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <Navigation className="w-3 h-3 text-emerald-400" />
                  </div>
                )}
              </div>
            ) : (
              <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-3.5 h-3.5 rounded-full bg-black border border-slate-800" />
            )}

            <div className="flex items-center gap-1.5 text-slate-300">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <BatteryMedium className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* Screen Dynamic Content */}
          <div className="relative flex-1 overflow-hidden flex flex-col">
            {children}
          </div>

          {/* iOS Home Indicator Bar or Android 3-Button Nav */}
          {selectedOS === "iphone" ? (
            <div className="relative z-30 h-5 w-full flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
              <div className="w-32 h-1 bg-white/40 rounded-full" />
            </div>
          ) : (
            <div className="relative z-30 h-5 w-full flex items-center justify-center gap-12 bg-slate-950/60 backdrop-blur-sm text-slate-500 text-[10px]">
              <span>◀</span>
              <span>●</span>
              <span>■</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
