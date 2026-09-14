import React, { useState, useEffect } from "react";
import {
  Phone,
  MessageSquare,
  ShieldAlert,
  X,
  Package,
  Compass,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  RotateCw,
  Eye,
  Play,
  Pause,
  ChevronRight,
  Navigation2,
  Car,
  Clock,
  MapPin,
  Users,
  Briefcase,
  Share2,
} from "lucide-react";
import { ActiveRide, VehicleType } from "../../types";
import { useRideStore } from "../../store/useRideStore";
import { socketService } from "../../services/socketService";
import { SafetySOSSheet } from "./SafetySOSSheet";
import { VEHICLE_SPEC_MAP } from "../../data/vehicleSpecs";

interface ActiveRideTrackingViewProps {
  ride: ActiveRide;
}

export const ActiveRideTrackingView: React.FC<ActiveRideTrackingViewProps> = ({
  ride,
}) => {
  const {
    setRiderActiveRide,
    updateAcFeedback,
    isSimulatingTrip,
    setIsSimulatingTrip,
    simulationStep,
    brandName,
  } = useRideStore();

  const [showSos, setShowSos] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"TRIP_TIMELINE" | "VEHICLE_INFO" | "ROUTE_INFO">("TRIP_TIMELINE");
  const [messages, setMessages] = useState<
    Array<{ sender: string; text: string; time: string }>
  >([
    {
      sender: "driver",
      text: "Hello! I am navigating to your pickup location right now.",
      time: "Just now",
    },
  ]);

  const handleCancelRide = () => {
    socketService.cancelRide(ride.rideId, "Passenger cancelled");
    setRiderActiveRide(null);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    setMessages((prev) => [
      ...prev,
      { sender: "rider", text: chatMsg, time: "Just now" },
    ]);
    setChatMsg("");
  };

  const isAssigned = ride.status === "DRIVER_ASSIGNED";
  const isArrived = ride.status === "DRIVER_ARRIVED";
  const isInTrip = ride.status === "IN_PROGRESS" || ride.status === "ONGOING";
  const isParcelPicked = ride.status === "PARCEL_PICKED";
  const isCompleted = ride.status === "COMPLETED";

  // Ensure AC control is completely unmounted before pickup
  const isCarPickedUp = ride.status === "ONGOING" || ride.status === "IN_PROGRESS";
  const rideCategory = (ride.category || ride.vehicleType || "").toLowerCase();
  const isFourWheeler = ["go", "sedan", "xl", "cab", "outstation"].includes(rideCategory);

  const specs = VEHICLE_SPEC_MAP[ride.vehicleType] || VEHICLE_SPEC_MAP.CAB;
  const driverSpeed = ride.driverDetails?.speed || (isInTrip ? 36 : 24);
  const isCar = ["CAB", "SEDAN", "XL", "GO", "OUTSTATION"].includes(ride.vehicleType);

  // Manual demo stage advance helper
  const handleAdvanceSimulationStage = () => {
    if (isAssigned) {
      socketService.notifyDriverArrived(ride.rideId);
      setRiderActiveRide({ ...ride, status: "DRIVER_ARRIVED" });
    } else if (isArrived) {
      socketService.verifyOtpAndStart(ride.rideId, ride.otp);
      setRiderActiveRide({ ...ride, status: "ONGOING", startedAt: Date.now() });
      setIsSimulatingTrip(true);
    } else if (isInTrip) {
      socketService.completeRide(ride.rideId);
      setRiderActiveRide({ ...ride, status: "COMPLETED", completedAt: Date.now() });
      setIsSimulatingTrip(false);
    }
  };

  const handleShareOnWhatsApp = () => {
    const passengerInfo = ride.passengerDetails?.isForOther
      ? `${ride.passengerDetails.passengerName} (${ride.passengerDetails.relationship || "Passenger"})`
      : ride.riderName;
    const text = encodeURIComponent(
      `🚗 *${brandName} Live Trip Update* 🇮🇳\n\n` +
      `👤 *Passenger:* ${passengerInfo}\n` +
      `🚘 *Vehicle:* ${specs.displayName} (${ride.driverDetails?.vehicleNumber || "KA-01-YK-9042"})\n` +
      `👨‍✈️ *Captain:* ${ride.driverDetails?.driverName || "Alex Vance"} (★ ${ride.driverDetails?.rating || "4.95"})\n` +
      `📍 *Pickup:* ${ride.pickup.address}${ride.pickupLandmark ? `\n🏷️ *Meeting Spot:* ${ride.pickupLandmark}` : ""}\n` +
      `🏁 *Destination:* ${ride.drop.address}\n` +
      `🔢 *OTP:* ${ride.otp}\n\n` +
      `🔗 *Live GPS Tracking:* ${window.location.href}\n` +
      `🛡️ *${brandName} 24x7 Safety Helpline:* 112 / 1800-YATRIK (Zero-Commission Transit)`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <>
      {/* 1. Top Floating Live Activity Island / HUD */}
      <div className="absolute top-12 inset-x-3 z-30 pointer-events-none">
        <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2.5 shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <div className="min-w-0">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 truncate">
                {isAssigned && "Captain En Route • 3 mins"}
                {isArrived && "Captain Arrived at Pickup Spot"}
                {isInTrip && `Trip in Progress • ${driverSpeed} km/h`}
                {isParcelPicked && "Package In Transit"}
                {isCompleted && "Destination Arrived"}
              </div>
              <div className="text-[10px] text-slate-300 flex items-center gap-1.5 truncate">
                <span>{ride.driverDetails?.vehicleNumber || "KA-01-MB-4092"}</span>
                <span>•</span>
                <span className="text-slate-400">{specs.displayName}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setChatOpen(true)}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              title="Chat"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => window.open(`tel:${ride.driverDetails?.phone || "555-234-5678"}`)}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              title="Call"
            >
              <Phone className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowSos(true)}
              className="w-7 h-7 rounded-lg bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-600/30 transition-colors"
              title="Emergency SOS"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Well-Divided Modular Tracking Control Panel */}
      <div className="w-full h-full bg-slate-900/98 backdrop-blur-xl border-t border-slate-800 p-3 shadow-2xl flex flex-col gap-2.5 overflow-y-auto">
        {/* Grab Handle */}
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto" />

        {/* Section A: Boarding OTP Handshake Bar */}
        {ride.serviceMode === "PARCEL" ? (
          <div className="grid grid-cols-2 gap-2 p-2 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 font-semibold">Pickup OTP</div>
              <div className="font-mono text-base font-black text-amber-300 tracking-wider">
                {ride.otp}
              </div>
              <div className="text-[9px] text-emerald-400 mt-0.5">Share with Captain</div>
            </div>
            <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 font-semibold">Delivery OTP</div>
              <div className="font-mono text-base font-black text-pink-300 tracking-wider">
                {ride.deliveryOtp || "7914"}
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">For Receiver</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-2xl border border-slate-800/90 shadow-inner">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-black text-xs">
                OTP
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Boarding Passcode
                </div>
                <div className="text-xs text-slate-300">
                  Give to Captain when boarding
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-xl shadow-sm">
              <span className="font-mono text-base font-black text-amber-200 tracking-widest">
                {ride.otp}
              </span>
            </div>
          </div>
        )}

        {/* Passenger Banner if Booked for Someone Else */}
        {ride.passengerDetails?.isForOther && (
          <div className="p-2.5 bg-amber-950/30 border border-amber-500/40 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                  Booking for {ride.passengerDetails.relationship || "Passenger"}
                </div>
                <div className="text-xs font-bold text-white truncate">
                  {ride.passengerDetails.passengerName} ({ride.passengerDetails.passengerPhone})
                </div>
              </div>
            </div>
            <button
              onClick={() => window.open(`tel:${ride.passengerDetails?.passengerPhone}`)}
              className="px-2.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-[11px] flex items-center gap-1 shadow-sm shrink-0 transition-transform active:scale-95"
            >
              <Phone className="w-3 h-3" />
              <span>Call</span>
            </button>
          </div>
        )}

        {/* Pickup Landmark Badge if Specified */}
        {ride.pickupLandmark && (
          <div className="p-2 bg-emerald-950/30 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Meeting Spot:</span>
              <span className="text-slate-200 font-semibold">{ride.pickupLandmark}</span>
            </div>
          </div>
        )}

        {/* Active Cabin Preferences for Trip */}
        {ride.ridePreferences && (
          <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px] font-bold">Cabin Preferences:</span>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="px-2 py-0.5 rounded-md bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 font-semibold">
                {ride.ridePreferences.acMode === "COOL_MAX" ? "❄️ Chilled AC" : ride.ridePreferences.acMode === "COMFORT_24" ? "🍃 Comfort AC" : "💨 Fresh Air"}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 font-semibold">
                {ride.ridePreferences.conversation === "QUIET" ? "🤫 Quiet" : ride.ridePreferences.conversation === "FRIENDLY" ? "💬 Friendly" : "🎵 Music"}
              </span>
              {ride.ridePreferences.luggage !== "NONE" && (
                <span className="px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-300 border border-amber-500/30 font-semibold">
                  🧳 Luggage
                </span>
              )}
            </div>
          </div>
        )}

        {/* 1-Tap WhatsApp Live Trip Sharing */}
        <button
          onClick={handleShareOnWhatsApp}
          className="w-full py-2.5 px-3 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/40 hover:border-emerald-500/70 text-emerald-300 font-bold rounded-2xl flex items-center justify-between text-xs transition-all group shadow-sm"
        >
          <div className="flex items-center gap-2">
            <span className="text-base">💬</span>
            <div className="text-left">
              <div className="font-extrabold text-emerald-200 flex items-center gap-1.5">
                <span>Share Live Trip on WhatsApp</span>
                <span className="text-[9px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.2 rounded-full font-bold">Safety</span>
              </div>
              <div className="text-[10px] text-emerald-400/80 font-medium">Send real-time GPS link to family or friends</div>
            </div>
          </div>
          <Share2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
        </button>

        {/* AC / Temperature Feedback ONLY after pickup */}
        {isCarPickedUp && isFourWheeler && (
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 shadow-sm animate-in fade-in space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <span>❄️</span>
                <span>In-Ride Comfort & AC Feedback</span>
              </p>
              {ride.acFeedback && (
                <span className="text-[10px] font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded-full border border-sky-600/40">
                  {ride.acFeedback === "AC_ON" && "Active: AC Requested"}
                  {ride.acFeedback === "AC_TOO_COLD" && "Active: Moderate Temp"}
                  {ride.acFeedback === "WINDOWS_DOWN" && "Active: Windows Down"}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => updateAcFeedback(ride.rideId, "AC_ON")}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all shadow-sm active:bg-slate-800 ${
                  ride.acFeedback === "AC_ON"
                    ? "bg-sky-500/20 text-sky-300 border-sky-500 font-bold"
                    : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                }`}
              >
                ❄️ Request AC On
              </button>
              <button
                type="button"
                onClick={() => updateAcFeedback(ride.rideId, "AC_TOO_COLD")}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all shadow-sm active:bg-slate-800 ${
                  ride.acFeedback === "AC_TOO_COLD"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500 font-bold"
                    : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                }`}
              >
                🌡️ Moderate Temp
              </button>
              <button
                type="button"
                onClick={() => updateAcFeedback(ride.rideId, "WINDOWS_DOWN")}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all shadow-sm active:bg-slate-800 ${
                  ride.acFeedback === "WINDOWS_DOWN"
                    ? "bg-teal-500/20 text-teal-300 border-teal-500 font-bold"
                    : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                }`}
              >
                💨 Windows Down
              </button>
            </div>
          </div>
        )}

        {/* Section B: Tab Navigation for Clear Modular Division */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-semibold">
          <button
            onClick={() => setActiveTab("TRIP_TIMELINE")}
            className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-all ${
              activeTab === "TRIP_TIMELINE"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Navigation2 className="w-3 h-3 text-emerald-400" />
            <span>Live Stage</span>
          </button>

          <button
            onClick={() => setActiveTab("VEHICLE_INFO")}
            className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-all ${
              activeTab === "VEHICLE_INFO"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-sky-400" />
            <span>Vehicle Info</span>
          </button>

          <button
            onClick={() => setActiveTab("ROUTE_INFO")}
            className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-all ${
              activeTab === "ROUTE_INFO"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MapPin className="w-3 h-3 text-indigo-400" />
            <span>Fare & Route</span>
          </button>
        </div>

        {/* TAB 1: Professional Vehicle Details & Safety Deck */}
        {activeTab === "VEHICLE_INFO" && (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-3 space-y-2.5">
            {/* Header with License Plate Badge */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">{specs.displayName}</div>
                <div className="text-[10px] text-slate-400">{specs.categoryName}</div>
              </div>
              <div className="flex items-center border border-slate-700 bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-mono font-black text-xs shadow-sm tracking-wider">
                <span className="text-[8px] mr-1 text-slate-800 border-r border-slate-700 pr-1 font-sans font-bold">IND</span>
                {ride.driverDetails?.vehicleNumber || "KA-01-RF-9042"}
              </div>
            </div>

            {/* Vehicle Specs Pill Grid */}
            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800/80 text-center space-y-0.5">
                <div className="text-slate-400 flex items-center justify-center gap-1 text-[9px]">
                  <Users className="w-2.5 h-2.5" />
                  <span>Capacity</span>
                </div>
                <div className="font-bold text-white text-[11px]">{specs.seatingCapacity} Seats</div>
              </div>
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800/80 text-center space-y-0.5">
                <div className="text-slate-400 flex items-center justify-center gap-1 text-[9px]">
                  <Briefcase className="w-2.5 h-2.5" />
                  <span>Luggage</span>
                </div>
                <div className="font-bold text-slate-200 text-[11px] truncate">{specs.bootCapacity}</div>
              </div>
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-800/80 text-center space-y-0.5">
                <div className="text-slate-400 flex items-center justify-center gap-1 text-[9px]">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  <span>Drive</span>
                </div>
                <div className="font-bold text-emerald-400 text-[11px] truncate">
                  {isCar ? "Dual Jet" : ride.vehicleType === "AUTO" ? "CNG 4-Stroke" : "Electric"}
                </div>
              </div>
            </div>

            {/* Commercial Verification Badge */}
            <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-white text-[11px]">RTO Verified Commercial Partner</div>
                  <div className="text-[9px] text-slate-400">Safety kit & background check certified</div>
                </div>
              </div>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Verified
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: Live Trip Journey Milestone Progress */}
        {activeTab === "TRIP_TIMELINE" && (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-3 space-y-3">
            <div className="text-xs font-bold text-white flex items-center justify-between">
              <span>Trip Progress Milestones</span>
              <span className="text-[10px] text-emerald-400 font-mono">Real-Time Sync</span>
            </div>

            {/* Stepper Timeline */}
            <div className="space-y-2.5 text-xs">
              {/* Step 1 */}
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-xs">Booking Confirmed</div>
                  <div className="text-[10px] text-slate-400">Captain {ride.driverDetails?.driverName || "Alex"} assigned</div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isArrived || isInTrip || isCompleted
                    ? "bg-emerald-500 text-slate-950"
                    : isAssigned
                    ? "bg-amber-500 text-slate-950 animate-pulse"
                    : "bg-slate-800 text-slate-500"
                }`}>
                  {isArrived || isInTrip || isCompleted ? "✓" : "2"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-bold text-xs ${isArrived ? "text-amber-400" : isAssigned ? "text-slate-200" : "text-slate-400"}`}>
                    Captain at Pickup Spot
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {isArrived ? "Waiting for rider boarding OTP" : "En route (~3 mins)"}
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isCompleted
                    ? "bg-emerald-500 text-slate-950"
                    : isInTrip
                    ? "bg-blue-500 text-white animate-pulse"
                    : "bg-slate-800 text-slate-500"
                }`}>
                  {isCompleted ? "✓" : "3"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-bold text-xs ${isInTrip ? "text-blue-400" : "text-slate-400"}`}>
                    Driving to Destination
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {isInTrip ? "GPS corridor active • Moving" : "Pending trip start"}
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isCompleted
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-slate-800 text-slate-500"
                }`}>
                  {isCompleted ? "✓" : "4"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-bold text-xs ${isCompleted ? "text-emerald-400" : "text-slate-500"}`}>
                    Destination Drop-Off
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Receipt & payment settlement
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Demo Simulator Controller */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Demo Controller:</span>
              <button
                onClick={handleAdvanceSimulationStage}
                className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg text-[10px] shadow-sm flex items-center gap-1 transition-all"
              >
                <span>
                  {isAssigned && "Simulate Captain Arrival"}
                  {isArrived && "Verify OTP & Start Ride"}
                  {isInTrip && "Simulate Arrival Drop-off"}
                  {isCompleted && "Completed"}
                </span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: Route & Fare Breakdown */}
        {activeTab === "ROUTE_INFO" && (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-2.5 space-y-2 text-xs">
            <div className="space-y-1.5 text-slate-300">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-500 font-semibold">PICKUP SPOT</div>
                  <div className="font-medium text-white truncate text-xs">
                    {ride.pickup.address}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-400 mt-1 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-500 font-semibold">DROP DESTINATION</div>
                  <div className="font-medium text-white truncate text-xs">
                    {ride.drop.address}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-xs">
              <span className="text-slate-400">Total Payable ({ride.paymentMethod || "WALLET"}):</span>
              <span className="text-emerald-400 font-black font-mono text-sm">
                ₹{(ride.payableAmount || ride.estimatedFare).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Driver Captain Profile Card */}
        <div className="p-2.5 bg-slate-800/80 border border-slate-700/70 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md text-sm shrink-0">
              {ride.driverDetails?.driverName?.charAt(0) || "A"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white truncate">
                  {ride.driverDetails?.driverName || "Alex Vance"}
                </span>
                <span className="text-[10px] bg-slate-700 text-amber-400 px-1 py-0.2 rounded font-medium shrink-0">
                  ★ {ride.driverDetails?.rating || "4.95"}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                <span className="text-emerald-400 font-mono font-semibold">
                  {ride.driverDetails?.vehicleNumber || "KA-01-MB-4092"}
                </span>
                <span>•</span>
                <span>{specs.displayName}</span>
              </div>
            </div>
          </div>

          {/* Cancel button */}
          {!isInTrip && !isParcelPicked && !isCompleted && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 font-semibold rounded-lg border border-slate-700 transition-colors shrink-0"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Cancel this booking?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your assigned captain is already en route. Are you sure you want to cancel this booking?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelRide}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Chat Modal */}
      {chatOpen && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col justify-end p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 h-[70%] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                  {ride.driverDetails?.driverName?.charAt(0) || "D"}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    {ride.driverDetails?.driverName || "Driver"}
                  </div>
                  <div className="text-[10px] text-emerald-400">
                    Online • Verified Captain
                  </div>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 py-3">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    m.sender === "rider" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs ${
                      m.sender === "rider"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-slate-800 text-slate-200 rounded-bl-none"
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-0.5">
                    {m.time}
                  </span>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="flex gap-2 pt-2 border-t border-slate-800"
            >
              <input
                type="text"
                value={chatMsg}
                onChange={(e) => setChatMsg(e.target.value)}
                placeholder="Message driver..."
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Safety SOS Sheet */}
      <SafetySOSSheet isOpen={showSos} onClose={() => setShowSos(false)} />
    </>
  );
};
