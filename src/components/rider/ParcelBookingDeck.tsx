import React, { useState } from "react";
import {
  Package,
  FileText,
  Box,
  Truck,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  User,
  Phone,
  HelpCircle,
  Scale,
  Maximize2,
  Check,
  Info,
} from "lucide-react";
import { PackageCategory, ParcelDetails, ParcelDimensions } from "../../types";
import { useRideStore } from "../../store/useRideStore";

const CATEGORY_CONFIGS: Record<
  PackageCategory,
  {
    label: string;
    description: string;
    maxWeight: string;
    icon: string;
    defaultDimensions: ParcelDimensions;
    defaultWeight: number;
    recommendedVehicle: string;
  }
> = {
  DOCUMENT: {
    label: "Document & Envelope",
    description: "Legal papers, passports, certificates, letters",
    maxWeight: "Up to 1.0 kg",
    icon: "📄",
    defaultDimensions: { lengthCm: 30, widthCm: 22, heightCm: 2 },
    defaultWeight: 0.5,
    recommendedVehicle: "Swift Moto Bike (Secure envelope sleeve)",
  },
  SMALL_BOX: {
    label: "Small Box",
    description: "Smartphones, electronics, medicines, books, gifts",
    maxWeight: "Up to 3.5 kg",
    icon: "📦",
    defaultDimensions: { lengthCm: 25, widthCm: 18, heightCm: 12 },
    defaultWeight: 2.5,
    recommendedVehicle: "Courier Moto / EV Scooty (Padded cargo bag)",
  },
  MEDIUM_BOX: {
    label: "Medium Carton",
    description: "Apparel, shoe boxes, food hampers, household goods",
    maxWeight: "Up to 8.0 kg",
    icon: "📦",
    defaultDimensions: { lengthCm: 40, widthCm: 30, heightCm: 20 },
    defaultWeight: 6.0,
    recommendedVehicle: "Auto Rickshaw / Express Courier Boot",
  },
  HEAVY_CARGO: {
    label: "Heavy / Bulky Parcel",
    description: "Appliances, computer monitors, multi-item crates",
    maxWeight: "Up to 25.0 kg",
    icon: "🚚",
    defaultDimensions: { lengthCm: 55, widthCm: 45, heightCm: 35 },
    defaultWeight: 15.0,
    recommendedVehicle: "Full Cargo Boot / Dedicated Courier",
  },
};

const PRESET_DIMENSIONS: Array<{
  name: string;
  category: PackageCategory;
  dim: ParcelDimensions;
  weight: number;
}> = [
  {
    name: "Doc A4 Mailer",
    category: "DOCUMENT",
    dim: { lengthCm: 30, widthCm: 22, heightCm: 2 },
    weight: 0.5,
  },
  {
    name: "Shoe Box / Gadget",
    category: "SMALL_BOX",
    dim: { lengthCm: 32, widthCm: 20, heightCm: 14 },
    weight: 2.5,
  },
  {
    name: "Standard Carton",
    category: "MEDIUM_BOX",
    dim: { lengthCm: 42, widthCm: 32, heightCm: 24 },
    weight: 6.0,
  },
  {
    name: "Large Crate",
    category: "HEAVY_CARGO",
    dim: { lengthCm: 60, widthCm: 50, heightCm: 40 },
    weight: 18.0,
  },
];

export const ParcelBookingDeck: React.FC = () => {
  const { parcelDetails, setParcelDetails } = useRideStore();
  const [activeSubTab, setActiveSubTab] = useState<"SPECS" | "RECIPIENT">("SPECS");

  const currentDim: ParcelDimensions = parcelDetails.dimensions || {
    lengthCm: 25,
    widthCm: 18,
    heightCm: 12,
  };

  // Calculate volume in Liters and volumetric approx weight (L*W*H / 5000)
  const volumeLiters = (
    (currentDim.lengthCm * currentDim.widthCm * currentDim.heightCm) /
    1000
  ).toFixed(1);
  const volumetricWeightKg = (
    (currentDim.lengthCm * currentDim.widthCm * currentDim.heightCm) /
    5000
  ).toFixed(1);

  const handleCategorySelect = (cat: PackageCategory) => {
    const config = CATEGORY_CONFIGS[cat];
    setParcelDetails({
      category: cat,
      categoryLabel: config.label,
      weightKg: config.defaultWeight,
      dimensions: config.defaultDimensions,
    });
  };

  const handleDimensionChange = (
    key: keyof ParcelDimensions,
    value: number
  ) => {
    const safeVal = Math.max(1, Math.min(200, isNaN(value) ? 1 : value));
    setParcelDetails({
      dimensions: {
        ...currentDim,
        [key]: safeVal,
      },
    });
  };

  const handleWeightChange = (delta: number) => {
    const newWeight = Math.max(
      0.2,
      Math.min(30, parseFloat((parcelDetails.weightKg + delta).toFixed(1)))
    );
    setParcelDetails({ weightKg: newWeight });
  };

  const handleDirectWeight = (val: number) => {
    const safeWeight = Math.max(0.1, Math.min(30, isNaN(val) ? 1 : val));
    setParcelDetails({ weightKg: safeWeight });
  };

  const weightSurcharge = (parcelDetails.weightKg * 0.75).toFixed(2);

  return (
    <div className="space-y-2.5 bg-slate-950/90 rounded-2xl border border-pink-900/40 p-3 shadow-inner">
      {/* Sub-Header & Navigation Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs font-black">
            📦
          </div>
          <div>
            <span className="text-xs font-bold text-white">Package Specifications</span>
            <span className="text-[10px] text-pink-400 font-mono ml-1.5">
              +${weightSurcharge} wt
            </span>
          </div>
        </div>

        {/* Tab switch between Specs and Recipient details */}
        <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px] font-semibold">
          <button
            type="button"
            onClick={() => setActiveSubTab("SPECS")}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              activeSubTab === "SPECS"
                ? "bg-pink-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Size & Weight
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("RECIPIENT")}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              activeSubTab === "RECIPIENT"
                ? "bg-pink-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Recipient & Security
          </button>
        </div>
      </div>

      {activeSubTab === "SPECS" ? (
        <div className="space-y-2.5">
          {/* 1. Category Selection Cards (Replaces passenger seats) */}
          <div className="grid grid-cols-2 gap-1.5">
            {(Object.keys(CATEGORY_CONFIGS) as PackageCategory[]).map((cat) => {
              const cfg = CATEGORY_CONFIGS[cat];
              const isSelected = parcelDetails.category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? "bg-pink-950/40 border-pink-500 shadow-md ring-1 ring-pink-500/40"
                      : "bg-slate-900/80 hover:bg-slate-800/80 border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{cfg.icon}</span>
                      <span className="text-[11px] font-bold text-white truncate">
                        {cfg.label}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="w-3.5 h-3.5 rounded-full bg-pink-500 text-slate-950 flex items-center justify-center text-[9px] font-bold shrink-0">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1 line-clamp-1">
                    {cfg.description}
                  </div>
                  <div className="text-[9px] font-mono text-pink-300 font-semibold mt-1">
                    {cfg.maxWeight}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 2. Package Dimensions (Length × Width × Height in cm) */}
          <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Maximize2 className="w-3 h-3 text-pink-400" />
                <span>Dimensions (L × W × H in cm)</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {volumeLiters} L • Vol. {volumetricWeightKg} kg
              </div>
            </div>

            {/* 3 Coordinated Dimension Inputs */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800 focus-within:border-pink-500">
                <label className="block text-[9px] text-slate-500 font-semibold uppercase">
                  Length
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={currentDim.lengthCm}
                    onChange={(e) =>
                      handleDimensionChange("lengthCm", parseFloat(e.target.value))
                    }
                    className="w-full bg-transparent text-white font-mono font-bold text-xs focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">cm</span>
                </div>
              </div>

              <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800 focus-within:border-pink-500">
                <label className="block text-[9px] text-slate-500 font-semibold uppercase">
                  Width
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={currentDim.widthCm}
                    onChange={(e) =>
                      handleDimensionChange("widthCm", parseFloat(e.target.value))
                    }
                    className="w-full bg-transparent text-white font-mono font-bold text-xs focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">cm</span>
                </div>
              </div>

              <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800 focus-within:border-pink-500">
                <label className="block text-[9px] text-slate-500 font-semibold uppercase">
                  Height
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={currentDim.heightCm}
                    onChange={(e) =>
                      handleDimensionChange("heightCm", parseFloat(e.target.value))
                    }
                    className="w-full bg-transparent text-white font-mono font-bold text-xs focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">cm</span>
                </div>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              {PRESET_DIMENSIONS.map((p) => {
                const isMatch =
                  currentDim.lengthCm === p.dim.lengthCm &&
                  currentDim.widthCm === p.dim.widthCm &&
                  currentDim.heightCm === p.dim.heightCm;
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setParcelDetails({
                        category: p.category,
                        categoryLabel: CATEGORY_CONFIGS[p.category].label,
                        dimensions: p.dim,
                        weightKg: p.weight,
                      });
                    }}
                    className={`text-[9px] px-2 py-0.5 rounded-md whitespace-nowrap transition-colors border ${
                      isMatch
                        ? "bg-pink-500/20 border-pink-500 text-pink-300 font-bold"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {p.name} ({p.dim.lengthCm}×{p.dim.widthCm}×{p.dim.heightCm})
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Weight Input & Surcharge Counter */}
          <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <span>Package Weight</span>
                  <span className="text-[9px] bg-slate-800 text-pink-300 px-1.5 py-0.2 rounded font-mono">
                    +$0.75/kg
                  </span>
                </div>
                <div className="text-[9px] text-slate-400">
                  {parcelDetails.weightKg < 3
                    ? "Standard courier tier"
                    : parcelDetails.weightKg < 10
                    ? "Medium cargo tier"
                    : "Heavy cargo surcharge tier"}
                </div>
              </div>
            </div>

            {/* Weight Stepper */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => handleWeightChange(-0.5)}
                className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs transition-colors"
              >
                -
              </button>

              <div className="w-12 text-center">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="30"
                  value={parcelDetails.weightKg}
                  onChange={(e) => handleDirectWeight(parseFloat(e.target.value))}
                  className="w-full bg-transparent text-center font-mono font-black text-xs text-white focus:outline-none"
                />
                <span className="text-[8px] text-slate-500 font-mono block -mt-0.5">
                  KG
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleWeightChange(0.5)}
                className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* 4. Contents Description & Fragile Toggle */}
          <div className="grid grid-cols-1 gap-1.5">
            <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800 focus-within:border-pink-500">
              <label className="block text-[9px] text-slate-400 font-semibold uppercase">
                Package Contents Description
              </label>
              <input
                type="text"
                value={parcelDetails.description}
                onChange={(e) => setParcelDetails({ description: e.target.value })}
                placeholder="e.g. Office Documents, Laptop & Accessories, Gift Hamper"
                className="w-full bg-transparent text-white text-xs mt-0.5 focus:outline-none placeholder:text-slate-600"
              />
            </div>

            {/* Fragile Toggle */}
            <div
              onClick={() =>
                setParcelDetails({ isFragile: !parcelDetails.isFragile })
              }
              className={`p-2 rounded-xl border cursor-pointer flex items-center justify-between transition-colors ${
                parcelDetails.isFragile
                  ? "bg-amber-950/30 border-amber-500/60 text-amber-200"
                  : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle
                  className={`w-4 h-4 ${
                    parcelDetails.isFragile ? "text-amber-400" : "text-slate-500"
                  }`}
                />
                <div>
                  <div className="text-[11px] font-bold text-white">
                    Fragile / Handle With Extra Care
                  </div>
                  <div className="text-[9px] text-slate-400">
                    Captain alerted for shock-absorbent upright transit
                  </div>
                </div>
              </div>

              <div
                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                  parcelDetails.isFragile ? "bg-amber-500" : "bg-slate-800"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    parcelDetails.isFragile ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: RECIPIENT & DUAL OTP SECURITY */
        <div className="space-y-2.5">
          {/* Recipient Name & Phone */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 focus-within:border-pink-500">
              <label className="block text-[9px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                <User className="w-2.5 h-2.5 text-pink-400" />
                <span>Recipient Name</span>
              </label>
              <input
                type="text"
                value={parcelDetails.recipientName}
                onChange={(e) =>
                  setParcelDetails({ recipientName: e.target.value })
                }
                placeholder="e.g. Sophia Miller"
                className="w-full bg-transparent text-white text-xs font-semibold mt-0.5 focus:outline-none"
              />
            </div>

            <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 focus-within:border-pink-500">
              <label className="block text-[9px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                <Phone className="w-2.5 h-2.5 text-emerald-400" />
                <span>Recipient Phone</span>
              </label>
              <input
                type="text"
                value={parcelDetails.recipientPhone}
                onChange={(e) =>
                  setParcelDetails({ recipientPhone: e.target.value })
                }
                placeholder="+1 (555) 000-0000"
                className="w-full bg-transparent text-white text-xs font-mono font-semibold mt-0.5 focus:outline-none"
              />
            </div>
          </div>

          {/* Delivery Handling Instructions */}
          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 focus-within:border-pink-500">
            <label className="block text-[9px] text-slate-400 font-semibold uppercase flex items-center gap-1">
              <Info className="w-2.5 h-2.5 text-blue-400" />
              <span>Drop-Off / Handover Instructions</span>
            </label>
            <input
              type="text"
              value={parcelDetails.handlingInstructions || ""}
              onChange={(e) =>
                setParcelDetails({ handlingInstructions: e.target.value })
              }
              placeholder="e.g. Ring Apt 4B or leave with building receptionist"
              className="w-full bg-transparent text-white text-xs mt-0.5 focus:outline-none"
            />
          </div>

          {/* Dual OTP Protocol Explainer Card */}
          <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Dual OTP Handshake Protocol</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-amber-300 font-bold uppercase text-[9px]">
                  Step 1 • Pickup OTP
                </div>
                <div className="text-slate-300 font-medium mt-0.5">
                  Sender (You) provides code to courier on package collection.
                </div>
              </div>

              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-pink-300 font-bold uppercase text-[9px]">
                  Step 2 • Delivery OTP
                </div>
                <div className="text-slate-300 font-medium mt-0.5">
                  Recipient provides code to courier before package handover.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
