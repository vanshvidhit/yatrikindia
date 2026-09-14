import React, { useState } from "react";
import {
  Car,
  Bike,
  CreditCard,
  Info,
  Zap,
  ArrowRight,
  Package,
  Compass,
  Sparkles,
  Wallet,
  QrCode,
  ShieldCheck,
  Tag,
  CheckCircle2,
  Calendar,
  Eye,
  ChevronDown,
  ChevronUp,
  Flame,
  Clock,
  MapPin,
  Sliders,
  User,
  Users,
  Shield,
  Check,
  X,
  VolumeX,
  Volume2,
  ThermometerSnowflake,
  ThermometerSun,
  Briefcase,
  Smartphone,
  Banknote,
} from "lucide-react";
import { FareTier, ServiceMode, VehicleType, PaymentMethod } from "../../types";
import { useRideStore } from "../../store/useRideStore";
import { socketService } from "../../services/socketService";
import { VEHICLE_SPEC_MAP } from "../../data/vehicleSpecs";
import { ParcelBookingDeck } from "./ParcelBookingDeck";
import { PremiumVehicleIcon } from "../common/PremiumVehicleIcon";
import { calculateUpfrontFare, LocalizedTier } from "../../services/fareCalculator";
import { BookForOthersModal } from "./BookForOthersModal";
import { PickupLandmarkModal } from "./PickupLandmarkModal";
import { PassengerBookingDetails, RidePreferences } from "../../types";
import { RidePreferencesModal, DEFAULT_RIDE_PREFERENCES } from "./RidePreferencesModal";
import { CouponsModal } from "./CouponsModal";

interface FareSelectionSheetProps {
  onCancel?: () => void;
  onOpenSearchPickup?: () => void;
  onOpenSearchDrop?: () => void;
  splitMode?: "HALF" | "EXPAND_MAP" | "EXPAND_DETAILS";
  onToggleSplitMode?: () => void;
}

export const FareSelectionSheet: React.FC<FareSelectionSheetProps> = ({
  onCancel,
  onOpenSearchPickup,
  onOpenSearchDrop,
  splitMode = "HALF",
  onToggleSplitMode,
}) => {
  const {
    pickupLocation,
    dropLocation,
    fareTiers,
    selectedVehicleType,
    setSelectedVehicleType,
    estimatedDistanceKm,
    estimatedDurationMin,
    riderAuth,
    setRiderActiveRide,
    serviceMode,
    setServiceMode,
    parcelDetails,
    outstationDetails,
    paymentMethod,
    setPaymentMethod,
    walletBalance,
    brandName,
  } = useRideStore();

  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "POPULAR" | "PREMIUM" | "MOTO" | "GREEN">("ALL");
  const [showFareBreakdown, setShowFareBreakdown] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [fareBoostAmount, setFareBoostAmount] = useState<number>(0);

  // Cabin Ride Preferences
  const [ridePreferences, setRidePreferences] = useState<RidePreferences>(DEFAULT_RIDE_PREFERENCES);

  // Indian Commute Specifics: Book for Family/Friends & Precise Meeting Spots
  const [showBookForOthersModal, setShowBookForOthersModal] = useState(false);
  const [passengerDetails, setPassengerDetails] = useState<PassengerBookingDetails | undefined>(undefined);
  const [showPickupLandmarkModal, setShowPickupLandmarkModal] = useState(false);
  const [pickupLandmark, setPickupLandmark] = useState<string>("");

  // Promo / Offers Engine
  const [showCouponsModal, setShowCouponsModal] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoCode, setPromoCode] = useState("YATRIK50");
  const [promoApplied, setPromoApplied] = useState(true);
  const [promoDiscountAmount, setPromoDiscountAmount] = useState(50.0);
  const [promoMessage, setPromoMessage] = useState(`Welcome to ${brandName}: ₹50.00 OFF on your ride!`);

  // Filter fare tiers matching active service mode
  const filteredTiers = fareTiers.filter((t) => {
    if (serviceMode === "OUTSTATION") return t.id === "OUTSTATION";
    if (serviceMode === "PARCEL") return t.id === "PARCEL";
    return t.id !== "OUTSTATION" && t.id !== "PARCEL";
  });

  // Filtered by Indian ride category chips and deduplicated by tier.id
  const displayedTiers = React.useMemo(() => {
    const rawFiltered = filteredTiers.filter((tier) => {
      if (serviceMode !== "CITY_RIDE") return true;
      if (categoryFilter === "ALL") return true;
      if (categoryFilter === "POPULAR") return tier.id === "AUTO" || tier.id === "GO" || tier.id === "SEDAN";
      if (categoryFilter === "PREMIUM") return tier.id === "SEDAN" || tier.id === "XL" || tier.id === "CAB";
      if (categoryFilter === "MOTO") return tier.id === "BIKE" || tier.id === "SCOOTY" || tier.id === "AUTO";
      if (categoryFilter === "GREEN") return tier.id === "SCOOTY" || tier.hasCNGCylinder;
      return true;
    });

    const seen = new Set<string>();
    return rawFiltered.filter((tier) => {
      if (seen.has(tier.id)) return false;
      seen.add(tier.id);
      return true;
    });
  }, [filteredTiers, serviceMode, categoryFilter]);

  const rawActiveTier =
    filteredTiers.find((t) => t.id === selectedVehicleType) || filteredTiers[0] || fareTiers[0];

  // Dynamically compute adjusted parcel fare if in parcel mode based on configured weight
  const weightSurcharge = parseFloat((parcelDetails.weightKg * 10.0).toFixed(2));
  const activeTier: FareTier = React.useMemo(() => {
    if (!rawActiveTier) return rawActiveTier;
    if (serviceMode === "PARCEL") {
      const baseAmt = 40.0;
      const distAmt = parseFloat((estimatedDistanceKm * 11.0).toFixed(2));
      const total = parseFloat((baseAmt + distAmt + weightSurcharge).toFixed(2));
      const payable = parseFloat(
        Math.max(25.0, baseAmt + distAmt + weightSurcharge + 10.0 - (promoApplied ? promoDiscountAmount : 0)).toFixed(2)
      );
      return {
        ...rawActiveTier,
        totalFare: total,
        breakdown: {
          ...rawActiveTier.breakdown,
          baseAmount: baseAmt,
          distanceAmount: distAmt,
          parcelWeightSurcharge: weightSurcharge,
          discount: promoApplied ? promoDiscountAmount : 0,
          payableAmount: payable,
        },
      };
    }
    // For Indian localized rides (AUTO, GO, SEDAN, XL), dynamically calculate upfront guaranteed fare
    const tierKey = rawActiveTier.id.toLowerCase() as LocalizedTier;
    if (["auto", "go", "sedan", "xl"].includes(tierKey)) {
      const upfront = calculateUpfrontFare(
        tierKey,
        estimatedDistanceKm,
        estimatedDurationMin,
        Math.max(5, Math.round((estimatedDistanceKm / 30) * 60)),
        rawActiveTier.surgeMultiplier || 1.0
      );
      const discount = promoApplied ? promoDiscountAmount : 0;
      const payable = Math.max(15.0, parseFloat((upfront.total - discount).toFixed(2)));

      return {
        ...rawActiveTier,
        totalFare: upfront.total,
        breakdown: {
          baseAmount: upfront.baseFare,
          distanceAmount: upfront.distanceFare,
          durationAmount: upfront.congestionCharge, // Dynamic delay charge
          tollsAndStateTaxes: 0,
          parcelWeightSurcharge: 0,
          gstAndPlatformFee: upfront.gst + upfront.platformFee,
          discount,
          payableAmount: payable,
        },
      };
    }

    const currentBase = rawActiveTier.totalFare;
    const discount = promoApplied ? promoDiscountAmount : 0;
    const payable = Math.max(15.0, parseFloat((currentBase - discount).toFixed(2)));

    return {
      ...rawActiveTier,
      breakdown: {
        ...rawActiveTier.breakdown,
        discount,
        payableAmount: payable,
      },
    };
  }, [rawActiveTier, serviceMode, estimatedDistanceKm, estimatedDurationMin, weightSurcharge, promoApplied, promoDiscountAmount]);

  const basePayable = activeTier?.breakdown?.payableAmount || activeTier?.totalFare || 150.0;
  const payableAmt = parseFloat((basePayable + fareBoostAmount).toFixed(2));

  // Compute calculated arrival drop-off time (e.g., "11:45 AM")
  const arrivalTimeFormatted = React.useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + (estimatedDurationMin || 15));
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, [estimatedDurationMin]);

  const handleApplyPromo = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === "YATRIK50" || clean === "FIRST50" || clean === "NAMMA50") {
      setPromoCode(clean);
      setPromoApplied(true);
      setPromoDiscountAmount(50.0);
      setPromoMessage("Coupon Applied: Flat ₹50.00 OFF on your ride!");
    } else if (clean === "BHIMUPI" || clean === "UPIPAY" || clean === "YATRIK25") {
      setPromoCode(clean);
      setPromoApplied(true);
      setPromoDiscountAmount(25.0);
      setPromoMessage("UPI Offer Applied: Instant ₹25.00 discount!");
    } else if (clean === "NAMMA25" || clean === "GREENEV") {
      setPromoCode(clean);
      setPromoApplied(true);
      setPromoDiscountAmount(25.0);
      setPromoMessage("Eco Commute Applied: ₹25.00 OFF on Auto/EV!");
    } else if (clean === "AIRPORT100" || clean === "OUTSTATION100") {
      setPromoCode(clean);
      setPromoApplied(true);
      setPromoDiscountAmount(100.0);
      setPromoMessage("Premier Pass Applied: Flat ₹100.00 OFF!");
    } else if (clean === "OFFICE15") {
      setPromoCode(clean);
      setPromoApplied(true);
      setPromoDiscountAmount(15.0);
      setPromoMessage("Rush Hour Pass Applied: ₹15.00 OFF!");
    } else {
      setPromoMessage("Invalid coupon code. Try YATRIK50, BHIMUPI, or NAMMA25");
    }
  };

  const handleBookRide = () => {
    if (!pickupLocation || !dropLocation || !activeTier) return;
    setIsRequesting(true);

    const pickupOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const deliveryOtp = serviceMode === "PARCEL" ? parcelDetails.deliveryOtp || "7914" : undefined;

    const finalParcelDetails =
      serviceMode === "PARCEL"
        ? {
            ...parcelDetails,
            pickupOtp,
            deliveryOtp: deliveryOtp || "7914",
          }
        : undefined;

    // Emit real-time ride request over socket
    socketService.requestRide({
      riderId: riderAuth.id,
      riderName: riderAuth.name,
      riderPhone: riderAuth.phone,
      serviceMode,
      pickup: {
        address: pickupLocation.title,
        coords: pickupLocation.coords,
      },
      drop: {
        address: dropLocation.title,
        coords: dropLocation.coords,
      },
      vehicleType: activeTier.id,
      distanceKm: estimatedDistanceKm,
      durationMin: estimatedDurationMin,
      estimatedFare: parseFloat((activeTier.totalFare + fareBoostAmount).toFixed(2)),
      payableAmount: payableAmt,
      parcelDetails: finalParcelDetails,
      outstationDetails: serviceMode === "OUTSTATION" ? outstationDetails : undefined,
      passengerDetails,
      pickupLandmark: pickupLandmark || undefined,
      ridePreferences,
    });

    // Set local state
    setRiderActiveRide({
      rideId: `YK-${Date.now().toString().slice(-6)}`,
      riderId: riderAuth.id,
      riderName: riderAuth.name,
      riderPhone: riderAuth.phone,
      serviceMode,
      pickup: {
        address: pickupLocation.title,
        coords: pickupLocation.coords,
      },
      drop: {
        address: dropLocation.title,
        coords: dropLocation.coords,
      },
      vehicleType: activeTier.id,
      distanceKm: estimatedDistanceKm,
      durationMin: estimatedDurationMin,
      estimatedFare: parseFloat((activeTier.totalFare + fareBoostAmount).toFixed(2)),
      payableAmount: payableAmt,
      paymentMethod,
      paymentStatus: "PENDING",
      otp: pickupOtp,
      deliveryOtp,
      status: "SEARCHING",
      parcelDetails: finalParcelDetails,
      outstationDetails: serviceMode === "OUTSTATION" ? outstationDetails : undefined,
      passengerDetails,
      pickupLandmark: pickupLandmark || undefined,
      ridePreferences,
      createdAt: Date.now(),
    });
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-slate-900/98 backdrop-blur-2xl p-3 sm:p-3.5 shadow-2xl gap-2 overflow-hidden select-none">
      {/* Top Grab Handle & Mode Indicator */}
      <div
        onClick={onToggleSplitMode}
        className="w-full flex items-center justify-center cursor-pointer group py-0.5"
        title="Tap to switch Half Screen / Full Details / Map View"
      >
        <div className="w-12 h-1.5 bg-slate-700 group-hover:bg-blue-500 rounded-full transition-colors" />
      </div>

      {/* Uber Route Header Overview Bar (Clickable to change pickup/drop) */}
      <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-2.5 flex items-center justify-between shadow-inner shrink-0">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Connected dots */}
          <div className="flex flex-col items-center gap-0.5 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-emerald-500 shadow-sm" />
            <div className="w-0.5 h-3 bg-slate-700" />
            <div className="w-2.5 h-2.5 bg-white rounded-sm border border-slate-300 shadow-sm" />
          </div>

          {/* Route text */}
          <div className="min-w-0 flex-1 space-y-0.5">
            <div
              onClick={onOpenSearchPickup}
              className="text-[11px] text-slate-300 hover:text-blue-300 truncate font-semibold cursor-pointer transition-colors"
            >
              {pickupLocation?.title || "Current Location"}
            </div>
            <div
              onClick={onOpenSearchDrop}
              className="text-xs text-white hover:text-blue-400 font-black truncate flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>{dropLocation?.title || "Select Destination"}</span>
            </div>
          </div>
        </div>

        {/* Distance & Time badge */}
        <div className="text-right shrink-0 pl-2">
          <div className="text-xs font-black text-blue-400 font-mono">
            {estimatedDistanceKm} km
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            ~{estimatedDurationMin} mins
          </div>
        </div>
      </div>

      {/* Indian Mobility Quick Settings: "Book for Others" & "Pickup Landmark / Spot" */}
      <div className="flex items-center gap-1.5 shrink-0 text-xs">
        {/* Book for someone else button / badge */}
        <button
          type="button"
          onClick={() => setShowBookForOthersModal(true)}
          className={`flex-1 py-1.5 px-2.5 rounded-xl border flex items-center justify-between gap-1.5 transition-all ${
            passengerDetails?.isForOther
              ? "bg-amber-950/40 border-amber-500/50 text-amber-300 shadow-sm"
              : "bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            <Users className={`w-3.5 h-3.5 shrink-0 ${passengerDetails?.isForOther ? "text-amber-400" : "text-blue-400"}`} />
            <span className="truncate text-[11px] font-semibold">
              {passengerDetails?.isForOther
                ? `For: ${passengerDetails.passengerName}`
                : `For: Myself (${riderAuth.name.split(" ")[0]})`}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 underline font-medium shrink-0">
            {passengerDetails?.isForOther ? "Edit" : "Change"}
          </span>
        </button>

        {/* Pickup Landmark / Spot Assist */}
        <button
          type="button"
          onClick={() => setShowPickupLandmarkModal(true)}
          className={`flex-1 py-1.5 px-2.5 rounded-xl border flex items-center justify-between gap-1.5 transition-all ${
            pickupLandmark
              ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-sm"
              : "bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className={`w-3.5 h-3.5 shrink-0 ${pickupLandmark ? "text-emerald-400" : "text-amber-400"}`} />
            <span className="truncate text-[11px] font-semibold">
              {pickupLandmark ? pickupLandmark : "Pickup Landmark / Gate"}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 underline font-medium shrink-0">
            {pickupLandmark ? "Edit" : "+ Add"}
          </span>
        </button>
      </div>

      {/* Service Mode Tabs (City Ride, Outstation, Parcel) */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-2xl border border-slate-800/80 shrink-0">
        <button
          onClick={() => {
            setServiceMode("CITY_RIDE");
            setSelectedVehicleType("CAB");
          }}
          className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            serviceMode === "CITY_RIDE"
              ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30 font-black"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>City Rides</span>
        </button>

        <button
          onClick={() => {
            setServiceMode("OUTSTATION");
            setSelectedVehicleType("OUTSTATION");
          }}
          className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            serviceMode === "OUTSTATION"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 font-black"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Outstation</span>
        </button>

        <button
          onClick={() => {
            setServiceMode("PARCEL");
            setSelectedVehicleType("PARCEL");
          }}
          className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            serviceMode === "PARCEL"
              ? "bg-pink-600 text-white shadow-md shadow-pink-600/30 font-black"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Parcel Express</span>
        </button>
      </div>

      {/* In City Rides Mode: Category Filter Chips */}
      {serviceMode === "CITY_RIDE" && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {[
            { id: "ALL", label: "All Rides" },
            { id: "POPULAR", label: "⭐ Popular" },
            { id: "PREMIUM", label: "👑 Prime Sedan" },
            { id: "MOTO", label: "🏍️ Rapido Moto & Auto" },
            { id: "GREEN", label: "🌱 Green EV" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id as any)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border ${
                categoryFilter === cat.id
                  ? "bg-amber-400 text-slate-950 border-amber-300 shadow-sm"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* When in Parcel Mode: Render Comprehensive Parcel Dimensions & Weight Deck */}
      {serviceMode === "PARCEL" ? (
        <ParcelBookingDeck />
      ) : (
        /* Rapido & RideFlow Premium Fleet Vehicle Cards */
        <div className="flex-1 min-h-0 space-y-1.5 overflow-y-auto pr-1">
          {displayedTiers.map((tier, idx) => {
            const isSelected = activeTier?.id === tier.id;
            const tierSpecs = VEHICLE_SPEC_MAP[tier.id] || VEHICLE_SPEC_MAP.CAB;

            // Rapido-style branding badges
            let badgeText = "Popular";
            let badgeColor = "bg-blue-500/20 text-blue-300 border-blue-500/30";
            if (tier.id === "BIKE") {
              badgeText = "⚡ Fastest • 2 min";
              badgeColor = "bg-amber-400/20 text-amber-300 border-amber-400/40";
            } else if (tier.id === "SCOOTY") {
              badgeText = "🌱 Zero Emission";
              badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
            } else if (tier.id === "AUTO") {
              badgeText = "🛺 Doorstep Pickup";
              badgeColor = "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
            } else if (tier.id === "CAB") {
              badgeText = "Top Rated";
              badgeColor = "bg-blue-500/20 text-blue-300 border-blue-500/30";
            } else if (tier.id === "OUTSTATION") {
              badgeText = "👥 6 Passengers";
              badgeColor = "bg-purple-500/20 text-purple-300 border-purple-500/30";
            }

            // Compute upfront MoRTH fare for tier dynamically if applicable
            const tierKey = tier.id.toLowerCase() as LocalizedTier;
            let displayFare = tier.totalFare;
            if (["auto", "go", "sedan", "xl"].includes(tierKey)) {
              const upfront = calculateUpfrontFare(
                tierKey,
                estimatedDistanceKm,
                estimatedDurationMin,
                Math.max(5, Math.round((estimatedDistanceKm / 30) * 60)),
                tier.surgeMultiplier || 1.0
              );
              displayFare = upfront.total;
            }

            return (
              <div
                key={`tier-${tier.id}-${idx}`}
                onClick={() => setSelectedVehicleType(tier.id)}
                className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between relative ${
                  isSelected
                    ? "bg-slate-850/95 border-amber-400 shadow-lg ring-2 ring-amber-400/30"
                    : "bg-slate-950/80 hover:bg-slate-850 border-slate-800/80"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Premium Automotive Vector Icon */}
                  <div className="relative shrink-0">
                    <PremiumVehicleIcon type={tier.id} size="lg" selected={isSelected} />
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] shadow font-bold">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white truncate">
                        {tier.name}
                      </span>
                      <span className="flex items-center gap-0.5 text-[10px] text-slate-300 bg-slate-800/90 px-1.5 py-0.5 rounded-md font-semibold shrink-0">
                        <User className="w-2.5 h-2.5" />
                        {tier.capacity}
                      </span>
                      {tier.hasCNGCylinder ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded border border-blue-500/40 bg-blue-950/60 text-blue-300 font-bold hidden sm:inline">
                          CNG Boot (1 Bag)
                        </span>
                      ) : tier.bootSpaceClearance ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded border border-emerald-500/40 bg-emerald-950/60 text-emerald-300 font-bold hidden sm:inline">
                          Clear Trunk
                        </span>
                      ) : (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold hidden sm:inline ${badgeColor}`}>
                          {badgeText}
                        </span>
                      )}
                    </div>

                    {/* Vehicle capacity & luggage space only */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span>{tier.capacity} seats</span>
                      <span>•</span>
                      <span>
                        {["auto", "moto", "bike", "scooty"].includes((tier.category || tier.id || "").toLowerCase())
                          ? "No large bags"
                          : "CNG / Compact luggage"}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate mt-0.5">
                      <span className="font-semibold text-slate-200">
                        {tier.etaMinutes} mins away
                      </span>
                      <span>•</span>
                      <span>{arrivalTimeFormatted} dropoff</span>
                    </div>
                  </div>
                </div>

                {/* Pricing Display */}
                <div className="text-right shrink-0 pl-2">
                  <div className="font-mono text-base font-black text-white">
                    ₹{(displayFare - (promoApplied ? promoDiscountAmount : 0) + (isSelected ? fareBoostAmount : 0)).toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-500 line-through">
                    ₹{(displayFare * 1.25).toFixed(2)}
                  </div>
                  {isSelected && fareBoostAmount > 0 && (
                    <div className="text-[9px] text-amber-400 font-bold">
                      +₹{fareBoostAmount} boost
                    </div>
                  )}
                  {promoApplied && (
                    <div className="text-[9px] text-emerald-400 font-bold">
                      -₹{promoDiscountAmount.toFixed(0)} promo
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rapido-Style Instant Captain Fare Boost Selector (10, 20, 30, 50, 100) */}
      <div className="p-2.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-black text-amber-400">
              ⚡ Captain Fare Boost (Faster Pickup)
            </span>
          </div>
          {fareBoostAmount > 0 && (
            <button
              type="button"
              onClick={() => setFareBoostAmount(0)}
              className="text-[10px] font-bold text-slate-400 hover:text-white"
            >
              Reset (+₹0)
            </button>
          )}
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Incentivize nearest captains with higher payout if booking is taking time:
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {[10, 20, 30, 50, 100].map((amt) => {
            const isSelected = fareBoostAmount === amt;
            return (
              <button
                key={amt}
                type="button"
                onClick={() => setFareBoostAmount(isSelected ? 0 : amt)}
                className={`py-1.5 px-1 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center border ${
                  isSelected
                    ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/25 scale-[1.02]"
                    : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                }`}
              >
                <span>+₹{amt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Premium Indian Cabin Experience: Ride Preferences & Offers Bar */}
      <div className="space-y-2">
        {/* Row 1: Interactive Cabin Preferences Card with prominent badges */}
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowPreferencesModal(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-amber-300 transition-colors group"
            >
              <div className="w-5 h-5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Sliders className="w-3 h-3" />
              </div>
              <span className="tracking-tight">Cabin Ride Preferences</span>
              <span className="text-[10px] text-amber-400 font-medium group-hover:underline flex items-center gap-0.5">
                Customize <ArrowRight className="w-2.5 h-2.5" />
              </span>
            </button>

            {/* Quick MoRTH Bill Breakdown Toggle */}
            <button
              type="button"
              onClick={() => setShowFareBreakdown(!showFareBreakdown)}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white transition-colors"
            >
              <Info className="w-3 h-3 text-cyan-400" />
              <span>Fare Details</span>
              {showFareBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Active Cabin Preference Badges (Directly Visible on screen) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
            <button
              type="button"
              onClick={() => setShowPreferencesModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold whitespace-nowrap hover:bg-cyan-900/50 transition-colors"
            >
              <span>
                {ridePreferences.acMode === "COOL_MAX"
                  ? "❄️ Chilled AC (18°-20°C)"
                  : ridePreferences.acMode === "COMFORT_24"
                  ? "🍃 Comfort AC (24°C)"
                  : "💨 Fresh Air"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowPreferencesModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 text-[11px] font-bold whitespace-nowrap hover:bg-indigo-900/50 transition-colors"
            >
              <span>
                {ridePreferences.conversation === "QUIET"
                  ? "🤫 Quiet Commute"
                  : ridePreferences.conversation === "FRIENDLY"
                  ? "💬 Friendly Chat"
                  : "🎵 Soft Music/FM"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowPreferencesModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-300 text-[11px] font-bold whitespace-nowrap hover:bg-amber-900/50 transition-colors"
            >
              <span>
                {ridePreferences.luggage === "NONE"
                  ? "🎒 Backpack"
                  : ridePreferences.luggage === "LIGHT"
                  ? "🧳 1 Bag (CNG OK)"
                  : "✈️ Heavy Airport Bags"}
              </span>
            </button>

            {ridePreferences.routePreference === "FASTEST_TOLLS" && (
              <button
                type="button"
                onClick={() => setShowPreferencesModal(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold whitespace-nowrap hover:bg-emerald-900/50 transition-colors"
              >
                <span>⚡ Fastag Tolls</span>
              </button>
            )}

            {ridePreferences.driverLanguage && ridePreferences.driverLanguage !== "ANY" && (
              <button
                type="button"
                onClick={() => setShowPreferencesModal(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-950/70 border border-purple-500/40 text-purple-300 text-[11px] font-bold whitespace-nowrap hover:bg-purple-900/50 transition-colors"
              >
                <span>🗣️ {ridePreferences.driverLanguage}</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Dedicated Offers & Coupons Bar */}
        <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Tag className="w-3.5 h-3.5" />
            </div>
            {promoApplied ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white font-mono">{promoCode}</span>
                <span className="text-xs font-bold text-emerald-400">Saved ₹{promoDiscountAmount.toFixed(0)}</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded font-bold border border-emerald-500/30">
                  APPLIED
                </span>
              </div>
            ) : (
              <div>
                <span className="text-xs font-bold text-slate-300">Coupons & Offers</span>
                <span className="text-[10px] text-slate-500 ml-1.5 hidden sm:inline">Save up to ₹50 on this ride</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowCouponsModal(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 ${
              promoApplied
                ? "bg-slate-900 hover:bg-slate-850 text-amber-300 border border-slate-700"
                : "bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-md shadow-emerald-400/20"
            }`}
          >
            {promoApplied ? "Change Offer" : "View Offers"}
          </button>
        </div>
      </div>

      {/* Itemized Fare Bill Breakdown Drawer */}
      {/* Expandable Transparent Upfront MoRTH Regulatory Fare Breakdown */}
      {showFareBreakdown && activeTier && (
        <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1.5 text-slate-300 animate-in fade-in shadow-xl">
          <div className="flex justify-between font-semibold pb-1.5 border-b border-slate-800">
            <span className="text-white font-bold">MoRTH Regulated Fare Bill ({activeTier.name})</span>
            <span className="text-emerald-400 font-mono text-[10px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              Zero Hidden Surge (≤ 2.0x Capped)
            </span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Base Fare</span>
            <span className="font-mono text-white">₹{(activeTier.breakdown?.baseAmount || activeTier.baseFare || 30.0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Distance Cost ({estimatedDistanceKm} km)</span>
            <span className="font-mono text-white">₹{(activeTier.breakdown?.distanceAmount || 60.0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Low Speed Congestion Time Factor</span>
            <span className="font-mono text-white">₹{(activeTier.breakdown?.durationAmount || 0.0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Platform Convenience & Safety Fee</span>
            <span className="font-mono text-white">₹15.00</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Transport GST (5% CGST + SGST)</span>
            <span className="font-mono text-white">₹{(activeTier.breakdown?.gstAndPlatformFee || 10.0).toFixed(2)}</span>
          </div>
          {serviceMode === "PARCEL" && (
            <div className="flex justify-between text-[11px] text-pink-400">
              <span>Parcel Weight Surcharge ({parcelDetails.weightKg} kg)</span>
              <span className="font-mono">+₹{weightSurcharge.toFixed(2)}</span>
            </div>
          )}
          {promoApplied && (
            <div className="flex justify-between text-[11px] text-emerald-400 font-bold">
              <span>Promo Discount ({promoCode})</span>
              <span className="font-mono">-₹{promoDiscountAmount.toFixed(2)}</span>
            </div>
          )}
          {fareBoostAmount > 0 && (
            <div className="flex justify-between text-[11px] text-amber-400 font-bold">
              <span>Captain Fare Boost Incentive</span>
              <span className="font-mono">+₹{fareBoostAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-white pt-2 border-t border-slate-800">
            <span>Total Payable Fare</span>
            <span className="font-mono text-emerald-400 font-black text-sm">₹{payableAmt.toFixed(2)}</span>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-800/80 text-[11px]">
            <span className="text-slate-400">Applied Discount</span>
            <button
              type="button"
              onClick={() => setShowCouponsModal(true)}
              className="text-amber-400 hover:text-amber-300 font-bold underline"
            >
              {promoApplied ? `Change "${promoCode}"` : "Apply a Promo Coupon"}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Payment Selector & Confirm CTA */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          {/* Payment Method Switcher Pill */}
          <button
            type="button"
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-semibold transition-colors"
          >
            {paymentMethod === "WALLET" && <Wallet className="w-3.5 h-3.5 text-emerald-400" />}
            {paymentMethod === "CARD" && <CreditCard className="w-3.5 h-3.5 text-blue-400" />}
            {paymentMethod === "UPI_QR" && <Smartphone className="w-3.5 h-3.5 text-indigo-400" />}
            {paymentMethod === "CASH" && <Banknote className="w-3.5 h-3.5 text-amber-400" />}
            <span>
              {paymentMethod === "WALLET"
                ? `${brandName} Wallet (₹${walletBalance.toFixed(2)})`
                : paymentMethod === "CARD"
                ? "Visa / RuPay •••• 4242"
                : paymentMethod === "UPI_QR"
                ? "UPI / GPay / Paytm"
                : "Cash to Captain"}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-rose-400 font-semibold transition-colors"
          >
            Change Route
          </button>
        </div>

        {/* Rapido-Inspired High-Impact Booking Button */}
        <button
          onClick={handleBookRide}
          disabled={isRequesting}
          className={`w-full py-3.5 font-black rounded-2xl text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            serviceMode === "PARCEL"
              ? "bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-pink-600/30"
              : "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/30 shadow-lg font-black"
          }`}
        >
          <Zap className={`w-4 h-4 ${serviceMode === "PARCEL" ? "fill-white" : "fill-slate-950 text-slate-950"}`} />
          <span>
            {isRequesting
              ? "Connecting Nearest Captain..."
              : serviceMode === "PARCEL"
              ? `Confirm & Book Courier • ₹${payableAmt.toFixed(2)}`
              : `Book ${
                  activeTier?.id === "CAB"
                    ? "Prime Sedan"
                    : activeTier?.id === "BIKE"
                    ? "Rapido Bike-Taxi"
                    : activeTier?.id === "AUTO"
                    ? "Namma Auto"
                    : activeTier?.name || "Ride"
                } • ₹${payableAmt.toFixed(2)}`}
          </span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>

      {/* Payment Method Switcher Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Payment Options (India)</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {[
                {
                  id: "WALLET",
                  label: `${brandName} INR Wallet`,
                  sub: `Current Balance: ₹${walletBalance.toFixed(2)}`,
                  icon: Wallet,
                  color: "text-emerald-400",
                },
                {
                  id: "CARD",
                  label: "Credit / Debit Card (RuPay/Visa)",
                  sub: "Card ending in 4242",
                  icon: CreditCard,
                  color: "text-blue-400",
                },
                {
                  id: "UPI_QR",
                  label: "UPI (Google Pay / PhonePe / Paytm)",
                  sub: "Instant 1-Tap UPI QR / VPA Intent",
                  icon: Smartphone,
                  color: "text-indigo-400",
                },
                {
                  id: "CASH",
                  label: "Cash to Captain",
                  sub: "Pay with physical INR currency at destination",
                  icon: Banknote,
                  color: "text-amber-400",
                },
              ].map((method) => {
                const IconComponent = method.icon;
                const isSelected = paymentMethod === method.id;
                return (
                  <div
                    key={method.id}
                    onClick={() => {
                      setPaymentMethod(method.id as PaymentMethod);
                      setShowPaymentModal(false);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-slate-800 border-blue-500 ring-1 ring-blue-500"
                        : "bg-slate-950 hover:bg-slate-850 border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center ${method.color}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{method.label}</div>
                        <div className="text-[10px] text-slate-400">{method.sub}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-400 stroke-[3]" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Premium Cabin Ride Preferences Studio Modal */}
      <RidePreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        preferences={ridePreferences}
        onSave={(updated) => setRidePreferences(updated)}
        selectedVehicleType={activeTier?.id}
        hasCNGCylinder={activeTier?.hasCNGCylinder}
      />

      {/* Verified Offers & Indian Coupons Modal */}
      <CouponsModal
        isOpen={showCouponsModal}
        onClose={() => setShowCouponsModal(false)}
        activePromoCode={promoApplied ? promoCode : undefined}
        currentFare={basePayable}
        selectedTierId={activeTier?.id}
        onApplyCoupon={(code, discount, msg) => {
          setPromoCode(code);
          setPromoDiscountAmount(discount);
          setPromoApplied(true);
          setPromoMessage(msg);
        }}
        onRemoveCoupon={() => {
          setPromoCode("");
          setPromoDiscountAmount(0);
          setPromoApplied(false);
          setPromoMessage("");
        }}
      />

      {/* Book For Others (Family & Friends) Modal */}
      <BookForOthersModal
        isOpen={showBookForOthersModal}
        onClose={() => setShowBookForOthersModal(false)}
        currentDetails={passengerDetails}
        riderName={riderAuth.name}
        onSave={(details) => setPassengerDetails(details)}
      />

      {/* Pickup Landmark & Meeting Spot Modal */}
      <PickupLandmarkModal
        isOpen={showPickupLandmarkModal}
        onClose={() => setShowPickupLandmarkModal(false)}
        currentLandmark={pickupLandmark}
        onSaveLandmark={(lm) => setPickupLandmark(lm)}
      />
    </div>
  );
};
