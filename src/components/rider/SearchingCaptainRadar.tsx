import React, { useState, useEffect } from "react";
import {
  Zap,
  Clock,
  Shield,
  MapPin,
  X,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { ActiveRide } from "../../types";
import { useRideStore } from "../../store/useRideStore";
import { socketService } from "../../services/socketService";
import { PremiumVehicleIcon } from "../common/PremiumVehicleIcon";

interface SearchingCaptainRadarProps {
  ride: ActiveRide;
  onCancel: () => void;
}

export const SearchingCaptainRadar: React.FC<SearchingCaptainRadarProps> = ({
  ride,
  onCancel,
}) => {
  const { setRiderActiveRide, theme } = useRideStore();
  const [boostToast, setBoostToast] = useState<string | null>(null);
  const [totalBoosted, setTotalBoosted] = useState<number>(0);
  const [searchSeconds, setSearchSeconds] = useState<number>(0);
  const isDark = theme === "dark";

  // Searching timer & Standalone Vercel auto-assign fallback
  useEffect(() => {
    const timer = setInterval(() => {
      setSearchSeconds((s) => s + 1);
    }, 1000);

    const socket = socketService.getSocket();
    // Auto-match captain after 4.5s in standalone/Vercel static mode if socket is not connected
    const fallbackMatchTimer = setTimeout(() => {
      if (!socket?.connected && ride.status === "SEARCHING") {
        setRiderActiveRide({
          ...ride,
          status: "DRIVER_ASSIGNED",
          driverId: "DRV-101",
          driverDetails: {
            driverName: "Rajesh Sharma",
            vehicleNumber: "MP-04-AB-1234",
            vehicleModel:
              ride.vehicleType === "CAB"
                ? "Maruti Dzire Tour"
                : ride.vehicleType === "AUTO"
                ? "Bajaj Compact RE"
                : "Hero Splendor Plus",
            phone: "+91 98260 12345",
            rating: 4.96,
            lat: ride.pickup.coords.lat + 0.0035,
            lng: ride.pickup.coords.lng + 0.0025,
            heading: 45,
            speed: 28,
          },
        });
      }
    }, 4500);

    return () => {
      clearInterval(timer);
      clearTimeout(fallbackMatchTimer);
    };
  }, [ride, setRiderActiveRide]);

  // Socket listener for server fare updates
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleFareUpdated = (data: {
      rideId: string;
      boostAmount: number;
      newFare: number;
    }) => {
      if (data.rideId === ride.rideId) {
        setRiderActiveRide({
          ...ride,
          payableAmount: data.newFare,
          estimatedFare: data.newFare,
        });
        setBoostToast(`⚡ Fare increased to ₹${data.newFare.toFixed(2)}!`);
        setTimeout(() => setBoostToast(null), 3000);
      }
    };

    socket.on("ride:fare_updated", handleFareUpdated);
    return () => {
      socket.off("ride:fare_updated", handleFareUpdated);
    };
  }, [ride, setRiderActiveRide]);

  const handleBoostFare = (amount: number, immediateMatch: boolean = false) => {
    const newTotal = parseFloat(((ride.payableAmount || ride.estimatedFare) + amount).toFixed(2));
    setTotalBoosted((prev) => prev + amount);

    // Update local state immediately
    setRiderActiveRide({
      ...ride,
      payableAmount: newTotal,
      estimatedFare: newTotal,
    });

    // Send socket update to dispatch to captains
    socketService.boostFare(ride.rideId, amount, immediateMatch);

    setBoostToast(`+₹${amount} Added! Notifying nearby captains with higher payout.`);
    setTimeout(() => setBoostToast(null), 3500);
  };

  const BOOST_TIERS = [10, 20, 30, 50, 100];

  const currentFare = ride.payableAmount || ride.estimatedFare || 80.0;

  return (
    <div
      className={`w-full h-full flex flex-col justify-between p-3.5 sm:p-4 select-none animate-in fade-in transition-colors ${
        isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Top Banner: Status & Live Radar Graphic */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className="absolute w-8 h-8 rounded-full bg-amber-400/30 animate-ping" />
            <span className="absolute w-6 h-6 rounded-full bg-amber-400/50 animate-pulse" />
            <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/50 z-10">
              <Zap className="w-3 h-3 text-slate-950 fill-slate-950" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight text-amber-400">
                LOOKING FOR CAPTAINS
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                ({searchSeconds}s)
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Broadcasting offer to nearest {ride.vehicleType} captains
            </p>
          </div>
        </div>

        {/* Current Offered Fare Display */}
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Your Offer
          </span>
          <div className="text-base font-black font-mono text-emerald-400 flex items-center justify-end gap-1">
            <span>₹{currentFare.toFixed(2)}</span>
            {totalBoosted > 0 && (
              <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1 py-0.2 rounded border border-amber-400/30">
                +₹{totalBoosted}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Middle Interactive Section: Vehicle Card + Fare Boost Prompt */}
      <div className="my-auto space-y-3 py-2">
        {/* Vehicle Representation */}
        <div
          className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
            isDark
              ? "bg-slate-900/90 border-slate-800 shadow-md"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <div className="flex items-center gap-3">
            <PremiumVehicleIcon type={ride.vehicleType} size="lg" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold">
                  {ride.vehicleType === "BIKE"
                    ? "Rapido Bike-Taxi"
                    : ride.vehicleType === "AUTO"
                    ? "Namma Auto"
                    : ride.vehicleType === "CAB"
                    ? "Prime AC Sedan"
                    : ride.vehicleType === "SCOOTY"
                    ? "Namma EV Scooty"
                    : ride.vehicleType}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-400 border border-amber-400/30">
                  {ride.vehicleType === "BIKE" ? "⚡ Beat Traffic" : "Direct Cab"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate max-w-[190px]">{ride.pickup.address}</span>
              </p>
            </div>
          </div>

          <div className="text-right shrink-0 pl-2">
            <span className="text-xs font-mono font-bold text-slate-400">
              {ride.distanceKm} km
            </span>
            <span className="block text-[10px] text-slate-500">
              ~{ride.durationMin} mins
            </span>
          </div>
        </div>

        {/* Dynamic Toast for Fare Boost */}
        {boostToast && (
          <div className="p-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-amber-400/30 animate-in slide-in-from-top-2">
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            <span>{boostToast}</span>
          </div>
        )}

        {/* Dynamic Rapido Fare Surge Controls (User requested: 10, 20, 30, 50, 100) */}
        <div
          className={`p-3 rounded-2xl border space-y-2.5 ${
            isDark
              ? "bg-slate-900/60 border-amber-400/30"
              : "bg-amber-50/70 border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-extrabold text-amber-400">
                Captains taking time? Increase Fare
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400">
              Instant Captain Alert
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-tight">
            Boost your fare to attract captains who are currently further away or in traffic:
          </p>

          {/* Fare Surge Increment Chips: 10, 20, 30, 50, 100 */}
          <div className="grid grid-cols-5 gap-1.5">
            {BOOST_TIERS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handleBoostFare(amt, false)}
                className="py-2 px-1 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all flex flex-col items-center justify-center border border-amber-300"
              >
                <span>+₹{amt}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA & Emergency / Cancellation Controls */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center gap-2">
          {/* Instant Match With Nearest Captain CTA */}
          <button
            onClick={() => handleBoostFare(0, true)}
            className="flex-1 py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>⚡ Match Nearest Captain Now</span>
          </button>

          {/* Cancel Request */}
          <button
            onClick={onCancel}
            className={`py-3 px-3 rounded-xl border text-xs font-bold transition-colors ${
              isDark
                ? "bg-slate-900 border-slate-800 text-rose-400 hover:bg-rose-950/40 hover:border-rose-800"
                : "bg-slate-100 border-slate-200 text-rose-600 hover:bg-rose-50"
            }`}
          >
            Cancel
          </button>
        </div>

        {/* Safety & Zero-Commission Rapido Reassurance Pill */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-0.5">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>100% Fare to Captain • No Cut</span>
          </span>
          <span className="text-slate-400 font-medium">
            Insured by Acko
          </span>
        </div>
      </div>
    </div>
  );
};
