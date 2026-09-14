import React, { useState } from "react";
import {
  Smartphone,
  SplitSquareVertical,
  Activity,
  Code2,
  Car,
  User,
  Zap,
  Sparkles,
  Sun,
  Moon,
  Palette,
  Rocket,
} from "lucide-react";
import { useRideStore, ViewMode } from "../../store/useRideStore";
import { MobileAppGuideModal } from "../mobile/MobileAppGuideModal";
import { BrandLogo } from "./BrandLogo";
import { BrandIdentityModal } from "./BrandIdentityModal";
import { VercelDeployModal } from "./VercelDeployModal";

export const HeaderNav: React.FC = () => {
  const { viewMode, setViewMode, theme, toggleTheme, brandName } = useRideStore();
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showVercelModal, setShowVercelModal] = useState(false);

  const NAV_ITEMS: {
    id: ViewMode;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    highlight?: boolean;
  }[] = [
    {
      id: "DUAL_SPLIT",
      label: "Dual Simulator",
      icon: SplitSquareVertical,
    },
    {
      id: "RIDER_ONLY",
      label: "Rider Client",
      icon: User,
    },
    {
      id: "DRIVER_ONLY",
      label: "Captain Partner",
      icon: Car,
    },
    {
      id: "SUPER_PROMPT_GUIDE",
      label: "Super Prompt & Specs",
      icon: Code2,
    },
    {
      id: "TELEMETRY_INSPECTOR",
      label: "Redis & WS Stream",
      icon: Activity,
    },
    {
      id: "CODEBASE_EXPLORER",
      label: "Expo SDK 52 Code",
      icon: Code2,
    },
  ];

  const isDark = theme === "dark";

  return (
    <>
      <header
        className={`w-full px-4 py-2.5 flex items-center justify-between border-b transition-colors duration-200 z-40 ${
          isDark
            ? "bg-slate-900 border-slate-800 text-slate-100 shadow-md"
            : "bg-white border-slate-200 text-slate-900 shadow-sm"
        }`}
      >
        {/* Brand Logo & India Hub Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBrandModal(true)}
            title="Click to customize Brand Name & download official Logo SVG"
            className="group flex items-center gap-2.5 text-left focus:outline-none"
          >
            <BrandLogo size={32} />
            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`font-extrabold text-sm tracking-tight group-hover:text-amber-400 transition-colors ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {brandName}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  यात्रिक
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live GPS
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <span>🇮🇳</span>
                  <span>₹ Zero Surge</span>
                </span>
              </div>
              <p
                className={`text-[10px] hidden sm:block ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                हर सफर, सही कदर • India’s Smart City Mobility
              </p>
            </div>
          </button>
        </div>

        {/* Mode Navigation Tabs & Right Action Controls */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1 p-1 rounded-2xl border overflow-x-auto max-w-full ${
              isDark
                ? "bg-slate-950 border-slate-800"
                : "bg-slate-100 border-slate-200"
            }`}
          >
            {NAV_ITEMS.map((item) => {
              const isSelected = viewMode === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id.toLowerCase()}`}
                  onClick={() => setViewMode(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? item.highlight
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/30"
                        : "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : item.highlight
                      ? isDark
                        ? "text-purple-300 hover:text-white hover:bg-purple-950/40"
                        : "text-purple-700 hover:text-purple-900 hover:bg-purple-100"
                      : isDark
                      ? "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Quick Action: Android & iOS Mobile Native Guide */}
            <button
              id="mobile-guide-btn"
              onClick={() => setShowMobileModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/40 whitespace-nowrap transition-all ml-1 shadow-sm"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mobile App</span>
            </button>

            {/* Brand Name & Logo Customizer */}
            <button
              id="brand-logo-btn"
              onClick={() => setShowBrandModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 whitespace-nowrap transition-all shadow-sm"
              title="View brand identity, download official logo SVG, or customize name"
            >
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span>Brand & Logo</span>
            </button>

            {/* Deploy with Vercel */}
            <button
              id="vercel-deploy-btn"
              onClick={() => setShowVercelModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-white hover:bg-slate-100 text-slate-950 whitespace-nowrap transition-all shadow-md active:scale-95"
              title="Deploy directly to Vercel with zero config"
            >
              <svg viewBox="0 0 1155 1000" className="w-3.5 h-3.5 fill-black" xmlns="http://www.w3.org/2000/svg">
                <path d="m577.3 0 577.4 1000H0z" />
              </svg>
              <span>Deploy Vercel</span>
            </button>
          </div>

          {/* Global Dark / Light Theme Toggle */}
          <button
            id="global-theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? "Light" : "Dark"} mode`}
            title={`Switch to ${isDark ? "Light" : "Dark"} mode (Persisted in Zustand)`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold border transition-all shadow-sm ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700"
                : "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
            }`}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                <span className="hidden md:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700" />
                <span className="hidden md:inline">Dark</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Native Mobile Build Guide Modal */}
      <MobileAppGuideModal
        isOpen={showMobileModal}
        onClose={() => setShowMobileModal(false)}
      />

      {/* Brand Name & Logo System Modal */}
      <BrandIdentityModal
        isOpen={showBrandModal}
        onClose={() => setShowBrandModal(false)}
      />

      {/* Vercel Deployment Modal */}
      <VercelDeployModal
        isOpen={showVercelModal}
        onClose={() => setShowVercelModal(false)}
        brandName={brandName}
      />
    </>
  );
};
