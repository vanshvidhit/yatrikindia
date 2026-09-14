import React, { useState } from "react";
import {
  X,
  Smartphone,
  Apple,
  Download,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Terminal,
  ShieldCheck,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";

interface MobileAppGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileAppGuideModal: React.FC<MobileAppGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"EXPO_RN" | "CAPACITOR" | "PWA_INSTALL">("EXPO_RN");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const EXPO_SETUP_COMMANDS = `# 1. Initialize Expo React Native SDK 52 Project
npx create-expo-app RideFlowApp --template blank-typescript
cd RideFlowApp

# 2. Install Native Mobility, Map & Real-time Dependencies
npx expo install react-native-maps expo-location expo-sensors
npx expo install lucide-react-native react-native-reanimated react-native-gesture-handler
npx expo install socket.io-client zustand

# 3. Start Expo Dev Client (iOS Simulator / Android Emulator / Expo Go)
npx expo start --clear

# 4. Generate Production Android APK & iOS IPA Bundles (EAS Build)
npm install -g eas-cli
eas login
eas build --platform all --profile production`;

  const CAPACITOR_COMMANDS = `# 1. Install Capacitor in current project
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init RideFlow com.rideflow.mobility --web-dir dist

# 2. Build production web bundle
npm run build

# 3. Add Android & iOS native platform projects
npx cap add android
npx cap add ios
npx cap sync

# 4. Open in Android Studio or Xcode to compile APK / IPA
npx cap open android
npx cap open ios`;

  const APP_JSON_CONFIG = `{
  "expo": {
    "name": "RideFlow",
    "slug": "rideflow-mobility",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#020617"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.rideflow.rider",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "RideFlow requires your GPS location to pinpoint pickup spots and provide real-time route tracking.",
        "UIBackgroundModes": ["location", "remote-notification"]
      }
    },
    "android": {
      "package": "com.rideflow.rider",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#020617"
      },
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "INTERNET",
        "VIBRATE"
      ]
    }
  }
}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Mobile App Engine (iOS & Android)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Native Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Turn RideFlow into standalone Android APK/AAB & Apple iOS App Store bundles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("EXPO_RN")}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === "EXPO_RN"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>React Native (Expo)</span>
          </button>

          <button
            onClick={() => setActiveTab("CAPACITOR")}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === "CAPACITOR"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Capacitor Wrapper</span>
          </button>

          <button
            onClick={() => setActiveTab("PWA_INSTALL")}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === "PWA_INSTALL"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Instant PWA Install</span>
          </button>
        </div>

        {/* Tab 1: Expo React Native */}
        {activeTab === "EXPO_RN" && (
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Apple className="w-4 h-4 text-blue-400" />
                <span>Expo SDK 52 Native Mobile Stack</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Uses <strong>react-native-maps</strong> for high-performance vector rendering, real-time vehicle GPS tracking, and <strong>socket.io-client</strong> for sub-second driver dispatch.
              </p>
            </div>

            {/* Terminal Commands */}
            <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden font-mono text-xs">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px]">
                <span className="flex items-center gap-1.5 font-sans font-bold text-slate-300">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Setup Commands
                </span>
                <button
                  onClick={() => handleCopy(EXPO_SETUP_COMMANDS, "expo-cmd")}
                  className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                >
                  {copiedKey === "expo-cmd" ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy All</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 text-slate-300 overflow-x-auto leading-relaxed max-h-56">
                <code>{EXPO_SETUP_COMMANDS}</code>
              </pre>
            </div>

            {/* App JSON Config */}
            <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden font-mono text-xs">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px]">
                <span className="flex items-center gap-1.5 font-sans font-bold text-slate-300">
                  <Code2 className="w-3.5 h-3.5 text-blue-400" /> app.json (GPS & Permissions)
                </span>
                <button
                  onClick={() => handleCopy(APP_JSON_CONFIG, "app-json")}
                  className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                >
                  {copiedKey === "app-json" ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 text-slate-300 overflow-x-auto leading-relaxed max-h-48">
                <code>{APP_JSON_CONFIG}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Tab 2: Capacitor Native Wrapper */}
        {activeTab === "CAPACITOR" && (
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-indigo-400" />
                <span>Capacitor 6.x Direct Native Bridge</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Wraps this exact React + Vite + Three.js application directly into native Android Studio and Xcode projects with zero code changes.
              </p>
            </div>

            <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden font-mono text-xs">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px]">
                <span className="flex items-center gap-1.5 font-sans font-bold text-slate-300">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" /> 1-Command Capacitor CLI
                </span>
                <button
                  onClick={() => handleCopy(CAPACITOR_COMMANDS, "cap-cmd")}
                  className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                >
                  {copiedKey === "cap-cmd" ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy All</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 text-slate-300 overflow-x-auto leading-relaxed max-h-64">
                <code>{CAPACITOR_COMMANDS}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: Progressive Web App (PWA) */}
        {activeTab === "PWA_INSTALL" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* iOS Safari */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Apple className="w-4 h-4 text-slate-200" />
                  <span>iOS (iPhone / iPad)</span>
                </div>
                <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>Open this app URL in Apple Safari.</li>
                  <li>Tap the <strong>Share</strong> icon (box with upward arrow).</li>
                  <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                  <li>Enjoy fullscreen native app feel with zero URL bar.</li>
                </ol>
              </div>

              {/* Android Chrome */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Android (Pixel / Samsung)</span>
                </div>
                <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>Open this app URL in Google Chrome.</li>
                  <li>Tap the <strong>Three Dots (⋮)</strong> menu top-right.</li>
                  <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                  <li>Launch directly from your Android App Drawer!</li>
                </ol>
              </div>
            </div>

            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full GPS location tracking, WebSockets, and battery-optimized vector mapping run at 60 FPS natively in both iOS and Android browsers.</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-colors"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
};
