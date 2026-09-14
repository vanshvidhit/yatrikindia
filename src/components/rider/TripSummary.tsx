import React, { useState, useEffect, useMemo } from "react";
import {
  Star,
  CheckCircle,
  Receipt,
  Heart,
  MessageSquare,
  Sparkles,
  ThumbsUp,
  ArrowRight,
  DollarSign,
  ShieldCheck,
  Award,
  Car,
  MapPin,
  Clock,
  Navigation,
  Check,
  User,
  Zap,
  TrendingUp,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import { ActiveRide, VehicleType } from "../../types";
import { useRideStore } from "../../store/useRideStore";
import { VEHICLE_SPEC_MAP } from "../../data/vehicleSpecs";

export interface TripSummaryProps {
  ride: ActiveRide;
  onClose: () => void;
  onSubmit?: (feedback: {
    rating: number;
    comments?: string;
    compliments?: string[];
    acFeedback?: "CHILLED" | "COMFORTABLE" | "TOO_WARM" | "TOO_COLD" | "AC_OFF";
    tipAmount?: number;
  }) => void;
}

const CAR_VEHICLE_TYPES: VehicleType[] = ["CAB", "SEDAN", "XL", "GO", "OUTSTATION"];

const RATING_LABELS: Record<number, { label: string; color: string; desc: string }> = {
  1: { label: "Disappointing", color: "text-rose-400", desc: "We're sorry for the poor experience" },
  2: { label: "Below Average", color: "text-orange-400", desc: "Let us know how we can improve" },
  3: { label: "Average", color: "text-amber-400", desc: "Good, but could be better" },
  4: { label: "Great Ride", color: "text-emerald-400", desc: "Smooth and pleasant journey" },
  5: { label: "Exceptional!", color: "text-amber-300", desc: "Top-tier captain & ride quality!" },
};

export const TripSummary: React.FC<TripSummaryProps> = ({
  ride,
  onClose,
  onSubmit,
}) => {
  const { addRideToHistory } = useRideStore();
  const isCar = CAR_VEHICLE_TYPES.includes(ride.vehicleType);

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comments, setComments] = useState<string>("");
  const [selectedCompliments, setSelectedCompliments] = useState<string[]>([
    "Smooth Driving",
    isCar ? "Clean Car" : "Clean Vehicle",
  ]);
  const [acFeedback, setAcFeedback] = useState<"CHILLED" | "COMFORTABLE" | "TOO_WARM" | "TOO_COLD" | "AC_OFF" | null>(
    isCar ? "CHILLED" : null
  );
  const [tip, setTip] = useState<number>(20);
  const [customTip, setCustomTip] = useState<string>("");
  const [isCustomTip, setIsCustomTip] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const complimentOptions = useMemo(() => {
    const list = [
      { id: "smooth", label: "Smooth Driving", icon: "🚗" },
      { id: "clean", label: isCar ? "Clean Car" : "Clean Vehicle", icon: "✨" },
      { id: "safe", label: "Felt Very Safe", icon: "🛡️" },
      { id: "route", label: "Fast & Direct Route", icon: "⚡" },
      { id: "polite", label: "Polite & Helpful", icon: "💬" },
    ];
    if (isCar) {
      list.push({ id: "ac", label: "Chilled & Clean AC", icon: "❄️" });
    }
    return list;
  }, [isCar]);

  const suggestedComments = useMemo(() => {
    if (isCar) {
      return [
        "Very clean car and smooth driving!",
        "Chilled AC cooling and polite captain, 5 stars!",
        "Comfortable ride with great AC and fast route.",
      ];
    }
    return [
      "Smooth ride and arrived faster than expected.",
      "Courteous and polite captain, 5 stars!",
      "Safe ride with great route navigation.",
    ];
  }, [isCar]);

  useEffect(() => {
    try {
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"],
      });
    } catch {
      // ignore
    }
  }, []);

  const activeTip = isCustomTip ? Math.max(0, parseFloat(customTip) || 0) : tip;
  const baseFare = ride.payableAmount || ride.estimatedFare || 150.0;
  const totalPaid = (baseFare + activeTip).toFixed(2);
  const specs = VEHICLE_SPEC_MAP[ride.vehicleType] || VEHICLE_SPEC_MAP.CAB;
  const driverName = ride.driverDetails?.driverName || "Ramesh Kumar";
  const vehicleNumber = ride.driverDetails?.vehicleNumber || "KA-01-MJ-4092";

  const effectiveRating = hoverRating || rating;
  const ratingInfo = RATING_LABELS[effectiveRating] || RATING_LABELS[5];

  const toggleCompliment = (compLabel: string) => {
    setSelectedCompliments((prev) =>
      prev.includes(compLabel)
        ? prev.filter((item) => item !== compLabel)
        : [...prev, compLabel]
    );
  };

  const handleApplyPresetComment = (preset: string) => {
    setComments((prev) => (prev ? `${prev} ${preset}` : preset));
  };

  const handleSubmitFeedback = () => {
    setIsSubmitting(true);

    const feedbackData = {
      rating,
      feedbackComments: comments.trim() || undefined,
      compliments: selectedCompliments.length > 0 ? selectedCompliments : undefined,
      acFeedback: isCar ? (acFeedback || undefined) : undefined,
      tipAmount: activeTip,
    };

    // Save to state via addRideToHistory
    addRideToHistory(ride, feedbackData);

    if (onSubmit) {
      onSubmit({
        rating,
        comments: feedbackData.feedbackComments,
        compliments: feedbackData.compliments,
        acFeedback: feedbackData.acFeedback,
        tipAmount: activeTip,
      });
    }

    if (rating === 5) {
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.5 },
        });
      } catch {
        // ignore
      }
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    }, 400);
  };

  const handleSkip = () => {
    addRideToHistory(ride, {
      rating: undefined,
      feedbackComments: undefined,
      tipAmount: activeTip,
    });
    onClose();
  };

  return (
    <div
      id="trip-summary-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col justify-end sm:justify-center items-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Success Confirmation State */}
        {isSubmitted ? (
          <div className="py-12 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="w-9 h-9" />
            </div>
            <h2 className="text-xl font-black text-white">Trip Summary Recorded!</h2>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              Your {rating}★ rating and feedback have been saved to your trip history and shared with captain {driverName}.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-700/50 rounded-full text-emerald-300 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Ride Receipt & History Updated</span>
            </div>
          </div>
        ) : (
          <>
            {/* Modal Header */}
            <div className="text-center space-y-1 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Trip Completed</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                Trip Summary & Feedback
              </h2>
              <p className="text-xs text-slate-400">
                Review your ride details and rate your experience with captain {driverName}
              </p>
            </div>

            {/* KEY METRICS: Completed Fare, Duration & Distance */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/90 border border-slate-800 rounded-2xl shadow-inner">
              {/* Completed Ride Fare */}
              <div className="text-center p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col items-center justify-center">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  <span className="text-emerald-400 font-bold">₹</span>
                  Fare Paid
                </div>
                <div className="text-lg font-black text-emerald-400 font-mono tracking-tight">
                  ₹{baseFare.toFixed(2)}
                </div>
                <span className="text-[9px] text-slate-500">
                  {ride.paymentMethod || "UPI"}
                </span>
              </div>

              {/* Completed Ride Duration */}
              <div className="text-center p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col items-center justify-center">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-400" />
                  Duration
                </div>
                <div className="text-lg font-black text-white font-mono tracking-tight">
                  {ride.durationMin || 14} <span className="text-xs font-normal text-slate-400">min</span>
                </div>
                <span className="text-[9px] text-slate-500">
                  {ride.startedAt ? new Date(ride.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "On Time"}
                </span>
              </div>

              {/* Completed Ride Distance */}
              <div className="text-center p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col items-center justify-center">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-indigo-400" />
                  Distance
                </div>
                <div className="text-lg font-black text-white font-mono tracking-tight">
                  {ride.distanceKm || 4.8} <span className="text-xs font-normal text-slate-400">km</span>
                </div>
                <span className="text-[9px] text-slate-500">
                  {specs.displayName.split(" ")[0]}
                </span>
              </div>
            </div>

            {/* Route Overview */}
            <div className="p-2.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-slate-300 truncate text-[11px] font-medium">
                  {ride.pickup?.address || "Pickup Location"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                <span className="text-white font-semibold truncate text-[11px]">
                  {ride.drop?.address || "Destination"}
                </span>
              </div>
            </div>

            {/* Captain & Vehicle Profile Card */}
            <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white text-base font-bold shadow-md shadow-blue-600/30">
                  {driverName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{driverName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700/90 text-amber-400 font-semibold">
                      ★ {ride.driverDetails?.rating || "4.95"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <span className="font-mono text-emerald-400">{vehicleNumber}</span>
                    <span>•</span>
                    <span>{specs.displayName}</span>
                  </div>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-400 font-mono">
                #{ride.rideId}
              </div>
            </div>

            {/* Interactive Star Rating Deck */}
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-center space-y-2">
              <div className="text-xs font-semibold text-slate-300">
                Rate your driver
              </div>
              <div className="flex items-center justify-center gap-2 sm:gap-3 py-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= effectiveRating;
                  return (
                    <button
                      key={star}
                      type="button"
                      id={`rate-star-${star}`}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="p-1 sm:p-1.5 rounded-xl hover:bg-slate-800 transition-all transform hover:scale-125 active:scale-95 cursor-pointer focus:outline-none"
                      title={`${star} Star Rating`}
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                          isFilled
                            ? "text-amber-400 fill-amber-400 filter drop-shadow(0 0 8px rgba(251, 191, 36, 0.5))"
                            : "text-slate-600 hover:text-slate-500"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="space-y-0.5">
                <div className={`text-xs font-bold ${ratingInfo.color} transition-colors`}>
                  {ratingInfo.label}
                </div>
                <p className="text-[10px] text-slate-400">{ratingInfo.desc}</p>
              </div>
            </div>

            {/* Dedicated AC & Cooling System Feedback - ONLY shows when rider picked up a car */}
            {isCar && (
              <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs border border-sky-500/30">
                      ❄️
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Car AC & Cooling System Feedback
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        How was the cabin temperature and cooling?
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-medium text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded-full border border-sky-600/30">
                    Car Feature
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-0.5">
                  {[
                    { id: "CHILLED", label: "Chilled & Cool", icon: "❄️", desc: "Fast cooling" },
                    { id: "COMFORTABLE", label: "Just Right", icon: "🍃", desc: "Pleasant temp" },
                    { id: "TOO_WARM", label: "Warm / AC Off", icon: "🥵", desc: "Needs cooling" },
                    { id: "TOO_COLD", label: "Too Cold", icon: "🥶", desc: "Chilly airflow" },
                  ].map((item) => {
                    const isSelected = acFeedback === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setAcFeedback(item.id as any)}
                        className={`p-2 rounded-xl text-left border transition-all ${
                          isSelected
                            ? "bg-sky-500/20 border-sky-500 text-sky-200 shadow-sm ring-1 ring-sky-500/40"
                            : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                        }`}
                      >
                        <div className="flex items-center gap-1 text-xs font-bold">
                          <span>{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </div>
                        <div className="text-[9px] text-slate-500 mt-0.5">{item.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Compliment Badges Selector */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Compliments</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {complimentOptions.map((item) => {
                  const isSelected = selectedCompliments.includes(item.label);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleCompliment(item.label)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 border ${
                        isSelected
                          ? "bg-amber-500/20 border-amber-500/60 text-amber-200 shadow-sm"
                          : "bg-slate-800/70 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                      {isSelected && <Check className="w-3 h-3 text-amber-400 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Written Comments & Feedback Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                  Leave a Comment
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {comments.length}/300
                </span>
              </div>

              <textarea
                id="trip-summary-comment-field"
                rows={3}
                maxLength={300}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Write a message for your captain or feedback for your ride..."
                className="w-full bg-slate-950/90 border border-slate-700/80 rounded-2xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />

              {/* Quick suggestion pills */}
              <div className="flex flex-wrap gap-1 pt-0.5">
                {suggestedComments.slice(0, 2).map((sugg, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPresetComment(sugg)}
                    className="text-[10px] text-slate-400 hover:text-blue-300 bg-slate-850 hover:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700/60 transition-colors truncate max-w-full"
                  >
                    + "{sugg}"
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Tip Selector */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300 font-semibold flex items-center gap-1">
                  <span className="text-emerald-400 font-bold">₹</span>
                  Add a Tip (Optional)
                </span>
                <span className="text-emerald-400 font-mono font-bold">
                  {activeTip > 0 ? `+₹${activeTip.toFixed(2)}` : "None"}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {[0, 20, 30, 50].map((amt) => {
                  const isSelected = !isCustomTip && tip === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setIsCustomTip(false);
                        setTip(amt);
                      }}
                      className={`py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30"
                          : "bg-slate-850 border-slate-700/80 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {amt === 0 ? "No Tip" : `₹${amt}`}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setIsCustomTip(true)}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    isCustomTip
                      ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30"
                      : "bg-slate-850 border-slate-700/80 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Custom
                </button>
              </div>

              {isCustomTip && (
                <div className="pt-1 flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="text-slate-400 text-xs font-bold absolute left-2.5 top-2">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={customTip}
                      onChange={(e) => setCustomTip(e.target.value)}
                      placeholder="Enter tip in ₹"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-7 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Total Paid Row */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Total Amount</span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  ₹{totalPaid}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                id="submit-trip-summary-btn"
                onClick={handleSubmitFeedback}
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 transition-all transform active:scale-98 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Saving Summary...</span>
                ) : (
                  <>
                    <span>Submit Rating & Comments</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSkip}
                className="w-full py-2 text-slate-500 hover:text-slate-300 text-xs font-semibold transition-colors"
              >
                Skip Rating & Return Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
