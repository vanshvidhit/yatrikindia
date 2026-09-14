import React, { useState } from "react";
import {
  Copy,
  Check,
  Sparkles,
  Layers,
  Car,
  Package,
  Compass,
  ShieldCheck,
  Cpu,
  Smartphone,
  Navigation,
  Globe,
  DollarSign,
  KeyRound,
  FileCode,
} from "lucide-react";

export const SuperPromptView: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const MASTER_SUPER_PROMPT = `
# SYSTEM ROLE & ARCHITECTURE MANDATE:
You are a Principal Mobile Architect and Lead Distributed Systems Engineer specializing in hyper-scale, real-time mobility and logistics platforms (equivalent to Uber, Grab, Rapido, and Porter).

You are tasked with building a state-of-the-art multi-modal transportation and logistics ecosystem named "RideFlow" supporting:
1. Multi-Modal Fleet: Bike (Moto), Scooty (EV 2-Wheeler), Auto (3-Wheeler Rickshaw), Premier Sedan Cab, Outstation SUV (Interstate/Intercity), and Parcel Courier Van.
2. Production Vehicle Specifications: Verified passenger capacity, luggage clearance limits, engine/powertrain ratings, and commercial licensing.
3. Multi-Mode Map Engine & Traffic Visualization:
   - Standard Street Map (Vector clean tiles)
   - High-Resolution Satellite & Aerial Imagery (Orbital raster)
   - 3D Isometric View (Extruded building footprints with 45° dynamic pitch tilt)
   - Live Traffic Flow Layer (Color-coded vector heat congestion: Green Free-flow, Orange Moderate, Red Heavy Jam)
   - Dark Night Mode (OLED battery saver with high-contrast glowing neon routes)
   - Street View 360° Panoramic Peek (First-person road level preview)
4. Km & Package Pricing Engine:
   - Base fare + Per-km rate + Per-minute congestion charge
   - Parcel Weight Surcharges (<3kg, <8kg, <25kg) with Fragile handling
   - Interstate Outstation Trips: State permit taxes, highway toll estimation, and daily driver allowance
   - Itemized Payable Amount breakdown with instant voucher/discount engine
5. Dual OTP Security & Verification System:
   - Passenger Rides: 4-digit boarding OTP verified by Captain before GPS start.
   - Parcel Deliveries: Two-Factor Handshake with Sender Pickup OTP and Recipient Delivery Confirmation OTP.
6. Real-Time Tech Stack:
   - Client: React / React Native (Expo SDK 52+), TypeScript, Zustand, Tailwind CSS / NativeWind
   - Map & GIS: Mapbox GL / Leaflet with dynamic polyline route smoothing and bearing rotation
   - Real-Time State: Socket.io bidirectional event bus with live captain telemetry
   - Backend: Node.js, Express, Socket.io for WebSocket event bus, and Redis Geospatial (GEOADD / GEORADIUS) for sub-millisecond driver dispatch.

---

### INSTRUCTIONS FOR CODE GENERATION & INTEGRATION:
- Ensure all map mode switches seamlessly swap raster/vector tiles without losing active ride markers or navigation polylines.
- Provide verified commercial fleet specifications and fare breakdowns on vehicle selection cards.
- Provide a clean split-view simulator displaying both the Rider Client (iPhone) and Captain Partner (Pixel) in real-time sync over WebSockets.
- Enforce strict OTP verification steps on the Captain's HUD before transitioning trip status from ARRIVED to IN_PROGRESS or COMPLETED.
`.trim();

  const MAP_MODES_EXPLANATION = [
    {
      title: "1. Standard View (Default Vector Streets)",
      desc: "Clean, high-contrast vector cartography optimized for rapid street name recognition and turn-by-turn navigation clarity.",
      techName: "OSM / Mapbox Streets v11",
      badge: "Standard",
    },
    {
      title: "2. Satellite / Hybrid Aerial View",
      desc: "High-resolution orbital satellite photography overlaid with road networks and landmark identifiers for photographic spatial awareness.",
      techName: "Esri World Imagery / Google Satellite",
      badge: "Satellite",
    },
    {
      title: "3. 3D Isometric / 3D Buildings View",
      desc: "Applies camera perspective pitch and CSS isometric tilt with extruded 3D building polygons for urban navigation depth.",
      techName: "WebGL Camera Pitch (45°) + 3D Building Extrusions",
      badge: "3D View",
    },
    {
      title: "4. Live Traffic Flow Layer",
      desc: "Real-time vector traffic congestion heatmap with green (free-flow >50 km/h), yellow/orange (moderate slowdown), and red (congested gridlock) indicators.",
      techName: "Real-time Traffic Tile Vector Protocol",
      badge: "Traffic",
    },
    {
      title: "5. Street View 360° Panoramic Peek",
      desc: "Ground-level 360° interactive photo sphere allowing riders and drivers to visually identify exact pickup gates, alleyways, and landmarks.",
      techName: "Google Street View Panorama / PhotoSphere API",
      badge: "Street View",
    },
    {
      title: "6. Dark Night Navigation Mode",
      desc: "High-contrast OLED-optimized night map preventing driver glare, featuring luminescent cyan navigation polylines.",
      techName: "Carto Dark Matter / Alidade Smooth Dark",
      badge: "Night",
    },
  ];

  const VEHICLE_SPECS_DATA = [
    {
      type: "BIKE",
      name: "Swift Moto Bike",
      specs: "150cc Fuel-Injected, Solo Rider, Helmet Provided",
      rate: "$0.85 / km",
      ideal: "Solo commuters cutting through dense urban gridlock.",
    },
    {
      type: "SCOOTY",
      name: "Smart EV Scooty",
      specs: "Electric 4kW BLDC Hub, Zero Emission, Extra Footdeck",
      rate: "$0.95 / km",
      ideal: "Eco-conscious short distance city commutes & grocery hops.",
    },
    {
      type: "AUTO",
      name: "Eco Auto Rickshaw",
      specs: "3-Wheeler CNG Engine, 3 Passenger Capacity, Open-air Cabin",
      rate: "$1.25 / km",
      ideal: "Affordable shared city commute for 2-3 passengers with bags.",
    },
    {
      type: "CAB",
      name: "RideFlow Premier Sedan",
      specs: "1.5L Turbo Petrol, 4 Passengers, Chilled Dual-Zone AC, Generous Trunk",
      rate: "$1.95 / km",
      ideal: "Business travel, airport transfers, and family city trips.",
    },
    {
      type: "OUTSTATION",
      name: "Highway Cruiser SUV",
      specs: "2.2L Diesel Turbo, 6-7 Passengers, Roof Rack, All-Terrain",
      rate: "$1.65 / km",
      ideal: "Interstate & intercity long-distance travel with luggage.",
    },
    {
      type: "PARCEL",
      name: "Express Parcel Courier",
      specs: "Insulated Heavy-Duty Cargo Box (<25kg), Dual OTP Handshake",
      rate: "$1.10 / km + Wt",
      ideal: "Doorstep documents, electronics, medicines, and packages.",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-8 text-slate-200">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Hero Banner */}
        <div className="p-6 md:p-8 bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-800/50 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Mobility Master Engineering Prompt
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold">
                Production Ready
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
              RideFlow: Complete Full-Stack Blueprint & Super Prompt
            </h1>

            <p className="text-sm md:text-base text-slate-300 max-w-3xl leading-relaxed">
              Comprehensive architectural specifications covering 3D interactive vehicle characters (Bike, Scooty, Auto, Cab, SUV, Parcel), dynamic Map modes (Satellite, 3D Isometric, Traffic Flow, Street View), kilometer & package pricing calculations, outstation interstate permits, and dual OTP security protocols.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => handleCopy(MASTER_SUPER_PROMPT, "master")}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold rounded-2xl text-xs md:text-sm flex items-center gap-2 shadow-xl shadow-blue-600/30 transition-all"
              >
                {copiedSection === "master" ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    Copied Master Super Prompt!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Full Master Super Prompt
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Section 1: The Master Super Prompt Block */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <FileCode className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-white">
                Master Prompt for AI / Mobile Development Agents
              </h2>
            </div>
            <button
              onClick={() => handleCopy(MASTER_SUPER_PROMPT, "master-card")}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              {copiedSection === "master-card" ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>Copy Code</span>
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-96">
            {MASTER_SUPER_PROMPT}
          </div>
        </div>

        {/* Section 2: Map Modes & Traffic Visualizations Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Map Modes, Layers & Traffic Engines Explained
              </h2>
              <p className="text-xs text-slate-400">
                What each layer is called, how it works in production GIS, and its practical mobility use-case.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MAP_MODES_EXPLANATION.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-950 rounded-2xl border border-slate-800/90 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">
                    {item.title}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-300 font-bold rounded-full border border-blue-500/30">
                    {item.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.desc}
                </p>
                <div className="text-[10px] font-mono text-purple-400 bg-purple-950/40 px-2 py-1 rounded-lg inline-block">
                  Engine: {item.techName}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Fleet Matrix & 3D Character Models */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Fleet Specifications & Commercial Rate Cards
              </h2>
              <p className="text-xs text-slate-400">
                Standard commercial vehicle tiers, passenger capacity, luggage volume, and upfront rate calculations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {VEHICLE_SPECS_DATA.map((v, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{v.name}</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {v.rate}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">
                    {v.specs}
                  </div>
                  <div className="text-xs text-slate-300 mt-2">
                    {v.ideal}
                  </div>
                </div>
                <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 pt-2 border-t border-slate-800">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Commercial Fleet Spec Verified
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Dual OTP Security Protocol & Outstation / Parcel Pricing Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dual OTP System */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">
                Dual OTP Security Handshake
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Standard passenger rides use a single 4-digit code generated upon booking. For high-security Parcel Delivery, RideFlow executes a Dual OTP protocol:
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-amber-300 block">
                  1. Pickup Handshake OTP (Sender to Captain)
                </span>
                <span className="text-slate-400 text-[11px]">
                  Generated in sender's app. Verified by driver to officially take custody of the package.
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-pink-300 block">
                  2. Delivery Confirmation OTP (Recipient to Captain)
                </span>
                <span className="text-slate-400 text-[11px]">
                  Sent via SMS / Push to recipient. Required for captain to finalize delivery and receive payout.
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Engine Formula */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">
                Payable Amount Formula & Outstation Math
              </h3>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-300 leading-relaxed">
              Payable = BaseFare + (Distance × RateKm) + (Duration × RateMin) + (ParcelWeight × Surcharge) + TollsAndTaxes + GST(5%) - PromoDiscount
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>
                <span className="font-bold text-white">Outstation / Outer-state:</span> Includes state road entry permits + estimated highway fast-tag tolls.
              </li>
              <li>
                <span className="font-bold text-white">Driver Daily Allowance:</span> $20.00 / day added automatically on outstation journeys.
              </li>
              <li>
                <span className="font-bold text-white">Multi-Payment Support:</span> RideFlow Wallet, Instant UPI / QR, Credit Cards, and Cash on Delivery.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
