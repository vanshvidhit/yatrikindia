import React from "react";
import { HeaderNav } from "./components/common/HeaderNav";
import { MobileDeviceFrame } from "./components/mobile/MobileDeviceFrame";
import { RiderHomeScreen } from "./components/rider/RiderHomeScreen";
import { DriverDashboardScreen } from "./components/driver/DriverDashboardScreen";
import { SocketStreamInspector } from "./components/inspector/SocketStreamInspector";
import { CodebaseExplorer } from "./components/architecture/CodebaseExplorer";
import { SuperPromptView } from "./components/prompt/SuperPromptView";
import { useSocket } from "./hooks/useSocket";
import { useRideStore } from "./store/useRideStore";
import { ArrowRightLeft, Zap } from "lucide-react";

export default function App() {
  // Initialize Socket.io connection & event listeners
  useSocket();
  const {
    viewMode,
    theme,
  } = useRideStore();

  const isDark = theme === "dark";

  return (
    <div
      className={`flex flex-col h-screen w-screen transition-colors duration-200 overflow-hidden font-sans ${
        isDark
          ? "bg-slate-950 text-slate-100"
          : "bg-slate-100 text-slate-900"
      }`}
    >
      {/* Top Application Header Navigation */}
      <HeaderNav />

      {/* Main Body Stage */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Mode 1: Dual Device Split Screen */}
        {viewMode === "DUAL_SPLIT" && (
          <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto w-full">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 xl:gap-12 w-full max-w-6xl">
              {/* Left Device: Rider App */}
              <div className="flex flex-col items-center">
                <MobileDeviceFrame
                  deviceType="iphone"
                  title="Rider Client • iPhone 16 Pro"
                  roleBadge="Passenger Mode"
                  badgeColor="bg-blue-500/20 text-blue-400 border-blue-500/30"
                >
                  <RiderHomeScreen />
                </MobileDeviceFrame>
              </div>

              {/* Central Real-Time Bus Bridge Indicator */}
              <div
                className={`hidden lg:flex flex-col items-center justify-center gap-2 p-3 border rounded-3xl shadow-xl backdrop-blur-md transition-colors ${
                  isDark
                    ? "bg-slate-900/80 border-slate-800"
                    : "bg-white/90 border-slate-200"
                }`}
              >
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div className="text-center">
                  <div
                    className={`text-[11px] font-extrabold tracking-tight ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Real-Time Bus
                  </div>
                  <div className="text-[9px] font-mono text-emerald-500 font-semibold">
                    WebSocket + Redis
                  </div>
                </div>
                <div className="w-1.5 h-12 bg-gradient-to-b from-blue-500 via-emerald-400 to-teal-500 rounded-full animate-pulse" />
              </div>

              {/* Right Device: Driver Captain App */}
              <div className="flex flex-col items-center">
                <MobileDeviceFrame
                  deviceType="android"
                  title="Captain Partner • Pixel 9 Pro"
                  roleBadge="Captain Duty"
                  badgeColor="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                >
                  <DriverDashboardScreen />
                </MobileDeviceFrame>
              </div>
            </div>
          </div>
        )}

        {/* Mode 2: Rider App Full View */}
        {viewMode === "RIDER_ONLY" && (
          <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
            <MobileDeviceFrame
              deviceType="iphone"
              title="Rider Client • iPhone 16 Pro"
              roleBadge="Passenger Mode"
              badgeColor="bg-blue-500/20 text-blue-300 border-blue-500/30"
            >
              <RiderHomeScreen />
            </MobileDeviceFrame>
          </div>
        )}

        {/* Mode 3: Driver Captain Full View */}
        {viewMode === "DRIVER_ONLY" && (
          <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
            <MobileDeviceFrame
              deviceType="android"
              title="Captain Partner • Pixel 9 Pro"
              roleBadge="Captain Duty"
              badgeColor="bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
            >
              <DriverDashboardScreen />
            </MobileDeviceFrame>
          </div>
        )}

        {/* Mode 4: Super Prompt & System Architectural Blueprint */}
        {viewMode === "SUPER_PROMPT_GUIDE" && <SuperPromptView />}

        {/* Mode 5: Real-Time Telemetry & Socket Stream Inspector */}
        {viewMode === "TELEMETRY_INSPECTOR" && <SocketStreamInspector />}

        {/* Mode 6: Expo SDK 52 Codebase & Architecture Explorer */}
        {viewMode === "CODEBASE_EXPLORER" && <CodebaseExplorer />}
      </main>
    </div>
  );
}
