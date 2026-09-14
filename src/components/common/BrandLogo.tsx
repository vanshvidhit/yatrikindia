import React from "react";
import { BRAND_CONFIG } from "../../config/brandConfig";

interface BrandLogoProps {
  size?: number | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  brandName?: string;
  hindiName?: string;
  tagline?: string;
  className?: string;
  variant?: "light" | "dark" | "auto";
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = "md",
  showText = false,
  brandName = BRAND_CONFIG.name,
  hindiName = BRAND_CONFIG.hindiName,
  tagline = BRAND_CONFIG.tagline,
  className = "",
  variant = "auto",
}) => {
  const pixelSize =
    typeof size === "number"
      ? size
      : size === "sm"
      ? 28
      : size === "md"
      ? 36
      : size === "lg"
      ? 48
      : 64;

  const isLight = variant === "light";

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Exact Vector Pin Logo with Yellow-Board Amber (#FFB800) */}
      <div
        style={{ width: pixelSize, height: (pixelSize * 140) / 120 }}
        className="relative shrink-0 flex items-center justify-center filter drop-shadow-md transition-transform hover:scale-105"
      >
        <svg
          viewBox="0 0 120 140"
          className="w-full h-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="brandLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFC727" />
              <stop offset="45%" stopColor={BRAND_CONFIG.theme.primary} />
              <stop offset="100%" stopColor={BRAND_CONFIG.theme.ochre} />
            </linearGradient>
            <filter id="logoGlow" x="-20%" y="-10%" width="140%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#FFB800" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Golden Yellow Pin Body */}
          <path
            d="M60 10 C32.3858 10 10 32.3858 10 60 C10 82.5 35 110 54.5 127 C57.6 129.7 62.4 129.7 65.5 127 C85 110 110 82.5 110 60 C110 32.3858 87.6142 10 60 10 Z"
            fill="url(#brandLogoGrad)"
            filter="url(#logoGlow)"
          />

          {/* Center White Disc */}
          <circle cx="60" cy="58" r="26" fill="#FFFFFF" />

          {/* Right Navigation Triangle / Arrow in Slate Asphalt (#121826) */}
          <polygon points="54,43 73,58 54,73" fill={BRAND_CONFIG.theme.dark} />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-2">
            <span
              className={`font-black tracking-tight ${
                size === "xl"
                  ? "text-2xl"
                  : size === "lg"
                  ? "text-xl"
                  : size === "md"
                  ? "text-base"
                  : "text-sm"
              } ${isLight ? "text-slate-900" : "text-white"}`}
            >
              {brandName}
            </span>
            {hindiName && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {hindiName}
              </span>
            )}
          </div>
          {tagline && (
            <span
              className={`text-[10px] font-medium tracking-wide ${
                isLight ? "text-slate-500" : "text-slate-400"
              }`}
            >
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
