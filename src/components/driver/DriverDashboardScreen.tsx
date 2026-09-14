import React from "react";
import {
  Power,
  DollarSign,
  TrendingUp,
  Award,
  Zap,
  MapPin,
  Compass,
  LogOut,
  Navigation,
  CheckCircle,
} from "lucide-react";
import { useRideStore } from "../../store/useRideStore";
import { MobilityMapView } from "../map/MobilityMapView";
import { IncomingRideOfferModal } from "./IncomingRideOfferModal";
import { DriverTurnByTurnNavScreen } from "./DriverTurnByTurnNavScreen";
import { DriverAuthView } from "./DriverAuthView";
import { useLocationTracker } from "../../hooks/useLocationTracker";

export const DriverDashboardScreen: React.FC = () => {
  const {
    driverAuth,
    toggleDriverOnline,
    logoutDriver,
    driverLocation,
    incomingOffer,
    setIncomingOffer,
    driverActiveRide,
    activeRoutePoints,
  } = useRideStore();

  // Activate location tracker throttled emitter
  useLocationTracker();

  if (!driverAuth.isLoggedIn) {
    return <DriverAuthView />;
  }

  return (
    <div className="relative flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Top Floating Glass Bar */}
      <div className="absolute top-2 inset-x-3 z-30 flex items-center justify-between pointer-events-none">
        {/* Duty Status Switch */}
        <button
          onClick={toggleDriverOnline}
          className={`pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-xl backdrop-blur-md transition-all ${
            driverAuth.isOnline
              ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-300"
              : "bg-slate-900/80 border-slate-700 text-slate-400"
          }`}
        >
          <Power
            className={`w-3.5 h-3.5 ${
              driverAuth.isOnline ? "text-emerald-400 animate-pulse" : "text-slate-500"
            }`}
          />
          <span className="text-xs font-bold uppercase tracking-wider">
            {driverAuth.isOnline ? "Online (GPS Active)" : "Offline (Duty Off)"}
          </span>
        </button>

        {/* Captain Profile & Sign Out */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          <div className="bg-slate-900/80 border border-slate-700/80 px-2.5 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-md">
            ★ {driverAuth.rating}
          </div>
          <button
            onClick={logoutDriver}
            className="w-8 h-8 rounded-full bg-slate-900/80 border border-slate-700/80 flex items-center justify-center text-slate-400 hover:text-rose-400 backdrop-blur-md shadow-lg"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Map Stage with Refined Curved Edges */}
      <div className="relative flex-1 w-full h-full p-2 pb-1 flex flex-col">
        <div className="relative w-full h-full rounded-[24px] sm:rounded-[28px] overflow-hidden border border-slate-800/90 shadow-lg shadow-black/60 ring-1 ring-white/10 isolate">
          <MobilityMapView
            mapId="driver-map"
            center={{ lat: driverLocation.lat, lng: driverLocation.lng }}
            zoom={15}
            driverLocation={driverLocation}
            routePoints={driverActiveRide ? activeRoutePoints : []}
            geofenceCorridor={!!driverActiveRide}
          />
        </div>
      </div>

      {/* Active Trip Navigation HUD */}
      {driverActiveRide && driverActiveRide.status !== "COMPLETED" && (
        <DriverTurnByTurnNavScreen ride={driverActiveRide} />
      )}

      {/* Offline Alert Overlay when duty off */}
      {!driverAuth.isOnline && !driverActiveRide && (
        <div className="absolute inset-x-4 bottom-24 z-30 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl text-center shadow-xl backdrop-blur-sm">
          <p className="text-xs text-slate-300 font-medium">
            You are currently offline. Turn online to receive ride requests.
          </p>
        </div>
      )}

      {/* Driver Daily Earnings Bottom Summary */}
      {!driverActiveRide && (
        <div className="absolute bottom-0 inset-x-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 rounded-t-3xl p-4 shadow-2xl space-y-3">
          <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto" />

          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Today's Earnings
              </div>
              <div className="text-2xl font-black text-white">
                ₹{driverAuth.earningsToday.toFixed(2)}
              </div>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <div className="text-[11px] text-slate-400">Trips</div>
                <div className="text-sm font-bold text-white">
                  {driverAuth.completedTrips}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Acceptance</div>
                <div className="text-sm font-bold text-emerald-400">
                  {driverAuth.acceptanceRate}%
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Info Badge */}
          <div className="p-2.5 bg-slate-800/60 rounded-xl flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-400">
                {driverAuth.vehicleType}
              </span>
              <span className="font-mono text-slate-400">
                {driverAuth.vehicleNumber}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400">
              <CheckCircle className="w-3 h-3" />
              Verified Fleet
            </div>
          </div>
        </div>
      )}

      {/* Incoming Ride Offer Modal (15-sec radial countdown) */}
      {incomingOffer && (
        <IncomingRideOfferModal
          offer={incomingOffer}
          onClose={() => setIncomingOffer(null)}
        />
      )}
    </div>
  );
};
