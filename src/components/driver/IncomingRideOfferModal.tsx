import React, { useState, useEffect } from "react";
import { Navigation, MapPin, DollarSign, Check, X, ShieldAlert, Clock, User } from "lucide-react";
import { IncomingRideOffer } from "../../types";
import { useRideStore } from "../../store/useRideStore";
import { socketService } from "../../services/socketService";

interface IncomingRideOfferModalProps {
  offer: IncomingRideOffer;
  onClose: () => void;
}

export const IncomingRideOfferModal: React.FC<IncomingRideOfferModalProps> = ({
  offer,
  onClose,
}) => {
  const { driverAuth, setDriverActiveRide, setIncomingOffer } = useRideStore();
  const [timeLeft, setTimeLeft] = useState(offer.timeoutSeconds || 15);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);

  const handleAccept = () => {
    socketService.acceptOffer(offer.rideId, driverAuth.id);
    onClose();
  };

  const progressPercent = ((15 - timeLeft) / 15) * 100;
  const captainPayout = (offer.fare * 0.82).toFixed(2);

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col justify-end p-4 animate-in fade-in">
      <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-3xl p-5 shadow-2xl space-y-4">
        {/* Animated Countdown Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              New Ride Offer
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-mono font-bold text-amber-300">
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Linear Timeout Progress Bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-1000 ease-linear"
            style={{ width: `${100 - progressPercent}%` }}
          />
        </div>

        {/* Guaranteed Earnings Banner */}
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
              Guaranteed Net Payout
            </div>
            <div className="text-2xl font-black text-white">
              ₹{captainPayout}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-slate-300">
              {offer.distanceKm} km trip
            </div>
            <div className="text-[11px] text-slate-400">
              ~{offer.durationMin} mins duration
            </div>
          </div>
        </div>

        {/* Rider & Pickup / Drop Route */}
        <div className="p-3 bg-slate-800/60 rounded-2xl space-y-2 text-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-700/60">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-[10px]">
              {offer.riderName.charAt(0)}
            </div>
            <span className="font-semibold text-white">{offer.riderName}</span>
            {offer.passengerDetails?.isForOther && (
              <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-bold">
                For: {offer.passengerDetails.passengerName}
              </span>
            )}
            {offer.serviceMode === "PARCEL" && (
              <span className="text-[9px] bg-pink-500/20 text-pink-300 px-1.5 py-0.2 rounded font-bold">
                Parcel Courier
              </span>
            )}
            <span className="text-[10px] text-amber-400 ml-auto">★ 4.95 Rider</span>
          </div>

          {/* Pickup Landmark pill if present */}
          {offer.pickupLandmark && (
            <div className="px-2 py-1 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-[10px] text-emerald-300 flex items-center gap-1.5 font-medium">
              <span>📍</span>
              <span className="font-bold text-emerald-400">Meeting Spot:</span>
              <span className="truncate text-slate-200">{offer.pickupLandmark}</span>
            </div>
          )}

          {/* Parcel Specific Spec Pill if present */}
          {offer.serviceMode === "PARCEL" && offer.parcelDetails && (
            <div className="p-2 bg-slate-900 rounded-xl border border-pink-900/40 text-[10px] space-y-1">
              <div className="flex items-center justify-between text-slate-200">
                <span className="font-bold text-pink-300">
                  📦 {offer.parcelDetails.categoryLabel || "Package"} • {offer.parcelDetails.weightKg} kg
                </span>
                {offer.parcelDetails.isFragile && (
                  <span className="text-amber-400 font-bold bg-amber-950/40 px-1 py-0.2 rounded border border-amber-500/40 text-[9px]">
                    ⚠️ Fragile
                  </span>
                )}
              </div>
              {offer.parcelDetails.dimensions && (
                <div className="text-[9px] text-slate-400 font-mono">
                  Dim: {offer.parcelDetails.dimensions.lengthCm} × {offer.parcelDetails.dimensions.widthCm} × {offer.parcelDetails.dimensions.heightCm} cm
                </div>
              )}
              {offer.parcelDetails.description && (
                <div className="text-[9px] text-slate-300 truncate">
                  Item: {offer.parcelDetails.description}
                </div>
              )}
            </div>
          )}

          <div className="space-y-1.5 pt-1">
            <div className="flex items-start gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Pickup Location (0.6 km away)</div>
                <div className="font-semibold text-white line-clamp-1">
                  {offer.pickup.address}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400 mt-1 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                  <span>Drop Zone</span>
                  <span className="text-emerald-400 font-semibold bg-emerald-950/60 px-1 rounded text-[9px]">Cluster Masked</span>
                </div>
                <div className="font-semibold text-white line-clamp-1">
                  {offer.dropArea || offer.drop.address.split(",")[0] || offer.drop.address}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls: Reject & Accept */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="w-1/3 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-2xl text-xs flex items-center justify-center gap-1 transition-colors"
          >
            <X className="w-4 h-4" />
            Decline
          </button>

          <button
            onClick={handleAccept}
            className="w-2/3 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 text-sm transition-all"
          >
            <Check className="w-4 h-4" />
            Accept Ride
          </button>
        </div>
      </div>
    </div>
  );
};
