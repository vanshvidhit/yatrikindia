import React, { useState } from "react";
import {
  X,
  Sparkles,
  Download,
  Check,
  Palette,
  ExternalLink,
  Layers,
  Copy,
  Globe,
  ShieldCheck,
  ArrowRight,
  Code2,
} from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { useRideStore } from "../../store/useRideStore";
import { BRAND_CONFIG } from "../../config/brandConfig";

interface BrandIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BRAND_PRESETS = [
  {
    name: "Yatrik India",
    hindi: "यात्रिक इंडिया",
    tagline: "India’s Smart City Mobility",
    bilingual: "यात्रिक – हर सफर, सही कदर",
    desc: "National brand identity with strong domestic affinity, zero surge, and direct UPI settlements.",
  },
  {
    name: "Yatrik",
    hindi: "यात्रिक",
    tagline: "True Community Mobility Protocol",
    bilingual: "यात्री की अपनी सवारी",
    desc: "Pure grassroots traveler moniker honoring everyday auto and taxi commuters.",
  },
  {
    name: "Yatrik Go",
    hindi: "यात्रिक गो",
    tagline: "Express 2-Wheeler & Auto Corridors",
    bilingual: "झटपट बुकिंग, सही किराया",
    desc: "Speedy, hyper-local daily commute and intra-city parcel courier brand.",
  },
  {
    name: "RideFlow",
    hindi: "राइड-फ्लो",
    tagline: "Urban Mobility & Logistics Ecosystem",
    bilingual: "Seamless City Transport",
    desc: "International tech-forward multi-modal fleet and delivery identity.",
  },
];

export const BrandIdentityModal: React.FC<BrandIdentityModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { brandName, setBrandName } = useRideStore();
  const [customInput, setCustomInput] = useState(brandName);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "domains" | "code">("overview");

  if (!isOpen) return null;

  const handleSelectName = (name: string) => {
    setCustomInput(name);
    setBrandName(name);
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      setBrandName(customInput.trim());
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    if (id.startsWith("#")) {
      setCopiedColor(id);
      setTimeout(() => setCopiedColor(null), 1800);
    } else {
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 1800);
    }
  };

  const handleDownloadSVG = () => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" fill="none">
  <defs>
    <linearGradient id="pinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFC727" />
      <stop offset="45%" stop-color="#FFB800" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
    <filter id="pinShadow" x="-20%" y="-10%" width="140%" height="130%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#FFB800" flood-opacity="0.35" />
    </filter>
  </defs>
  <!-- Yellow-board Taxi Gold Pin -->
  <path d="M60 10 C32.3858 10 10 32.3858 10 60 C10 82.5 35 110 54.5 127 C57.6 129.7 62.4 129.7 65.5 127 C85 110 110 82.5 110 60 C110 32.3858 87.6142 10 60 10 Z" fill="url(#pinGradient)" filter="url(#pinShadow)" />
  <!-- Crisp Center Disc -->
  <circle cx="60" cy="58" r="26" fill="#FFFFFF" />
  <!-- Slate Asphalt Arrow -->
  <polygon points="54,43 73,58 54,73" fill="#121826" />
</svg>`;

    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${brandName.toLowerCase().replace(/\s+/g, "-")}-logo.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Yatrik Bilingual Lockup */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <BrandLogo size="md" brandName={brandName} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">{brandName}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {BRAND_CONFIG.hindiName} Official Brand
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Zero Commission
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {BRAND_CONFIG.bilingualTagline} • {BRAND_CONFIG.tagline}
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

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 px-5 bg-slate-950/40">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === "overview"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Identity & Color System
          </button>
          <button
            onClick={() => setActiveTab("domains")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "domains"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Domains & Trademark Strategy</span>
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "code"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Config & Env Snippets</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 space-y-6 overflow-y-auto">
          {activeTab === "overview" && (
            <>
              {/* Logo Presentation Surfaces */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Dark Mode */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center gap-2">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Asphalt Dark Canvas (#121826)
                  </div>
                  <BrandLogo size="lg" brandName={brandName} showText />
                </div>

                {/* Light Mode */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center gap-2">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Clean White Canvas
                  </div>
                  <BrandLogo size="lg" brandName={brandName} showText variant="light" />
                </div>

                {/* App Icon Square */}
                <div className="p-4 bg-[#121826] rounded-2xl border border-amber-500/30 flex flex-col items-center justify-center text-center gap-2">
                  <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
                    Official Mobile Icon
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-amber-400/40 flex items-center justify-center shadow-lg shadow-amber-400/20">
                    <BrandLogo size={28} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-200">
                    {brandName}
                  </span>
                </div>
              </div>

              {/* Brand Presets Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Choose Brand Preset or Customize</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Instant live rebrand
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {BRAND_PRESETS.map((preset) => {
                    const isSelected = brandName === preset.name;
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleSelectName(preset.name)}
                        className={`p-3.5 rounded-2xl text-left border transition-all flex items-start gap-3 ${
                          isSelected
                            ? "bg-amber-950/40 border-amber-400 text-white shadow-lg shadow-amber-400/10"
                            : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? "bg-amber-400 text-slate-950 font-black"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : "•"}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black flex items-center gap-2">
                            <span>{preset.name}</span>
                            <span className="text-[10px] text-amber-400 font-bold">
                              {preset.hindi}
                            </span>
                            {isSelected && (
                              <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-bold">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-300 font-semibold mt-0.5">
                            {preset.bilingual}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                            {preset.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Input */}
                <form onSubmit={handleApplyCustom} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter custom brand name..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-semibold"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-400/20 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Apply Name</span>
                  </button>
                </form>
              </div>

              {/* Exact Brand Palette Specified in User Strategy */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-amber-400" />
                    <span>Yatrik Mobility India Color Tokens</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Click to copy hex
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { name: "Yellow-board Amber", hex: "#FFB800", role: "Primary / Taxi Gold" },
                    { name: "Slate Asphalt", hex: "#121826", role: "Dark Theme Base" },
                    { name: "Verified / EV Green", hex: "#00D284", role: "Accent / Clean Fleet" },
                    { name: "Deep Ochre Edge", hex: "#D97706", role: "Gradient Shadow" },
                  ].map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => copyText(c.hex, c.hex)}
                      className="p-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center gap-2.5 text-left group transition-all"
                    >
                      <div
                        className="w-8 h-8 rounded-lg border border-white/20 shrink-0 shadow-inner"
                        style={{ backgroundColor: c.hex }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-mono font-bold text-white flex items-center justify-between">
                          <span>{c.hex}</span>
                          {copiedColor === c.hex ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{c.name}</div>
                        <div className="text-[9px] text-slate-500 truncate">{c.role}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Core USPs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {BRAND_CONFIG.usps.map((usp) => (
                  <div
                    key={usp.title}
                    className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-start gap-2.5"
                  >
                    <span className="text-xl">{usp.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-white">{usp.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {usp.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "domains" && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Domain & Trademark Landscape: Yatrik India</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  The word <strong>यात्रिक (Yatrik)</strong> signifies "passenger/traveler." Unlike foreign ride-hailing brands, it carries immediate local trust, affordability, and grassroots pride. Because <code className="text-amber-400 font-mono">yatrik.com</code> is an older premium domain, pairing with <em>India</em> or action prefixes provides clean, high-affinity alternatives:
                </p>
              </div>

              {/* Domain Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Domain / Handle</th>
                      <th className="py-2.5 px-4 font-semibold">Viability</th>
                      <th className="py-2.5 px-4 font-semibold">Brand Angle & Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                    {BRAND_CONFIG.domains.map((d) => (
                      <tr key={d.domain} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-bold text-amber-300">
                          {d.domain}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                            {d.viability}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-[11px]">
                          {d.role}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tagline Positioning Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    English Tagline
                  </div>
                  <div className="text-xs font-black text-white">
                    “Yatrik – India’s Smart City Mobility”
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Modern, national appeal for metropolitan tech corridors.
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    Bilingual / Hindi Belt Tagline
                  </div>
                  <div className="text-xs font-black text-white">
                    “यात्रिक – हर सफर, सही कदर”
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Communicates transparent rates and zero surge gouging.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "code" && (
            <div className="space-y-4">
              {/* JavaScript Configuration Object */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Brand Configuration Object (<code>src/config/brandConfig.ts</code>)</span>
                  </span>
                  <button
                    onClick={() =>
                      copyText(
                        `export const BRAND_CONFIG = {
  name: "Yatrik",
  legalName: "Yatrik Mobility India",
  tagline: "India's Smart City Mobility",
  bilingualTagline: "यात्रिक – हर सफर, सही कदर",
  theme: {
    primary: "#FFB800", // Yellow-board amber
    dark: "#121826",    // Slate asphalt
    accent: "#00D284"   // Verified / Green EV
  }
};`,
                        "brand_config_code"
                      )
                    }
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                  >
                    {copiedCode === "brand_config_code" ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedCode === "brand_config_code" ? "Copied" : "Copy Object"}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 rounded-xl text-[11px] font-mono text-slate-300 border border-slate-800 overflow-x-auto">
{`export const BRAND_CONFIG = {
  name: "Yatrik",
  legalName: "Yatrik Mobility India",
  tagline: "India's Smart City Mobility",
  bilingualTagline: "यात्रिक – हर सफर, सही कदर",
  theme: {
    primary: "#FFB800", // Yellow-board amber
    dark: "#121826",    // Slate asphalt
    accent: "#00D284"   // Verified / Green EV
  }
};`}
                </pre>
              </div>

              {/* Environment Variables */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Environment Variables (<code>.env.example</code>)</span>
                  </span>
                  <button
                    onClick={() =>
                      copyText(
                        `VITE_BRAND_NAME="Yatrik India"
REACT_APP_BRAND_NAME="Yatrik India"
REACT_APP_SUPPORT_EMAIL="support@yatrikindia.com"
REACT_APP_PLAYSTORE_URL="https://yatrik.app/download"`,
                        "env_vars_code"
                      )
                    }
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                  >
                    {copiedCode === "env_vars_code" ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedCode === "env_vars_code" ? "Copied" : "Copy Env"}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 rounded-xl text-[11px] font-mono text-slate-300 border border-slate-800 overflow-x-auto">
{`VITE_BRAND_NAME="Yatrik India"
REACT_APP_BRAND_NAME="Yatrik India"
REACT_APP_SUPPORT_EMAIL="support@yatrikindia.com"
REACT_APP_PLAYSTORE_URL="https://yatrik.app/download"`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
            <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">
              Vector Pin Artwork in <code className="text-amber-300 font-mono">/public/logo.svg</code>
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadSVG}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadSuccess ? "Downloaded!" : "Download SVG"}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl shadow-md shadow-amber-400/20"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
