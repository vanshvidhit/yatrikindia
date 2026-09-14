import React, { useState } from "react";
import { X, Tag, Check, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

export interface AvailableCoupon {
  code: string;
  title: string;
  description: string;
  discountType: "PERCENT" | "FLAT";
  discountValue: number;
  maxDiscount?: number;
  minFare?: number;
  badge: string;
  applicableTiers?: string[]; // e.g. ["AUTO", "GO", "SEDAN", "XL"]
}

export const VERIFIED_INDIAN_COUPONS: AvailableCoupon[] = [
  {
    code: "YATRIK50",
    title: "50% Welcome Discount",
    description: "Flat 50% OFF up to ₹50 on your ride across all city categories",
    discountType: "PERCENT",
    discountValue: 50,
    maxDiscount: 50,
    badge: "Most Popular",
  },
  {
    code: "BHIMUPI",
    title: "Instant UPI Direct Offer",
    description: "₹25 instant cashback on paying directly to captain via UPI QR",
    discountType: "FLAT",
    discountValue: 25,
    badge: "UPI Exclusive",
  },
  {
    code: "NAMMA25",
    title: "Green & Auto Commute",
    description: "₹25 OFF on Yatrik Auto Rickshaw & Eco Green Scooty rides",
    discountType: "FLAT",
    discountValue: 25,
    badge: "Eco Saver",
    applicableTiers: ["AUTO", "SCOOTY", "BIKE"],
  },
  {
    code: "AIRPORT100",
    title: "Airport & Outstation Special",
    description: "₹100 OFF on Prime Sedan, SUV XL, and Intercity Outstation bookings",
    discountType: "FLAT",
    discountValue: 100,
    minFare: 350,
    badge: "Premier",
    applicableTiers: ["SEDAN", "XL", "CAB", "OUTSTATION"],
  },
  {
    code: "OFFICE15",
    title: "Daily Office Commute Pass",
    description: "Flat ₹15 OFF during peak rush hours (8-11 AM & 5-9 PM)",
    discountType: "FLAT",
    discountValue: 15,
    badge: "Daily Rush",
  },
];

interface CouponsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePromoCode?: string;
  onApplyCoupon: (code: string, discountAmount: number, message: string) => void;
  onRemoveCoupon: () => void;
  currentFare: number;
  selectedTierId?: string;
}

export const CouponsModal: React.FC<CouponsModalProps> = ({
  isOpen,
  onClose,
  activePromoCode,
  onApplyCoupon,
  onRemoveCoupon,
  currentFare,
  selectedTierId,
}) => {
  const [manualCode, setManualCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const calculateDiscount = (coupon: AvailableCoupon): number => {
    if (coupon.discountType === "PERCENT") {
      const calculated = (currentFare * coupon.discountValue) / 100;
      return Math.min(calculated, coupon.maxDiscount || calculated);
    }
    return coupon.discountValue;
  };

  const handleApplyCouponObj = (coupon: AvailableCoupon) => {
    if (coupon.minFare && currentFare < coupon.minFare) {
      setErrorMsg(`Minimum trip fare for ${coupon.code} is ₹${coupon.minFare}. Current fare is ₹${currentFare.toFixed(0)}.`);
      return;
    }
    if (coupon.applicableTiers && selectedTierId && !coupon.applicableTiers.includes(selectedTierId)) {
      setErrorMsg(`Coupon ${coupon.code} is only valid on ${coupon.applicableTiers.join(", ")} rides.`);
      return;
    }

    const discount = calculateDiscount(coupon);
    setErrorMsg("");
    setSuccessMsg(`Coupon "${coupon.code}" applied! You saved ₹${discount.toFixed(0)}`);
    onApplyCoupon(coupon.code, discount, `Coupon "${coupon.code}" applied! You save ₹${discount.toFixed(0)}`);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  const handleManualApply = () => {
    const clean = manualCode.trim().toUpperCase();
    if (!clean) {
      setErrorMsg("Please enter a valid coupon code");
      return;
    }

    const matched = VERIFIED_INDIAN_COUPONS.find((c) => c.code === clean);
    if (matched) {
      handleApplyCouponObj(matched);
      return;
    }

    // Generic fallback for custom codes
    if (clean === "YATRIK25" || clean === "FIRSTTRIP") {
      const discount = 25;
      setErrorMsg("");
      setSuccessMsg(`Welcome offer "${clean}" applied! Saved ₹${discount}`);
      onApplyCoupon(clean, discount, `Welcome offer applied: ₹${discount} OFF!`);
      setTimeout(() => onClose(), 700);
    } else {
      setErrorMsg(`Invalid promo code "${clean}". Try YATRIK50, BHIMUPI, or NAMMA25.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Offers & Promotions</h3>
              <p className="text-[11px] text-slate-400">Apply verified coupons for instant discounts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Manual Coupon Input */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Have a Promo Code?</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => {
                setManualCode(e.target.value.toUpperCase());
                setErrorMsg("");
              }}
              placeholder="e.g. YATRIK50, BHIMUPI"
              className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-2xl text-xs font-mono font-bold text-white uppercase placeholder-slate-500 focus:outline-none transition-colors"
            />
            <button
              onClick={handleManualApply}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl text-xs shadow-md transition-all active:scale-95 flex items-center gap-1"
            >
              <span>Apply</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {errorMsg && <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>}
          {successMsg && <p className="text-xs text-emerald-400 font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> {successMsg}</p>}
        </div>

        {/* Active Applied Banner if applicable */}
        {activePromoCode && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-white font-mono">{activePromoCode}</span>
                <span className="text-[10px] text-emerald-400 ml-2 font-semibold">Active & Applied</span>
              </div>
            </div>
            <button
              onClick={() => {
                onRemoveCoupon();
                setSuccessMsg("");
              }}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 underline"
            >
              Remove
            </button>
          </div>
        )}

        {/* Verified Indian Coupons List */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Available Offers</span>
            <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Auto-computed for your ride
            </span>
          </div>

          <div className="space-y-2.5">
            {VERIFIED_INDIAN_COUPONS.map((coupon) => {
              const isApplied = activePromoCode === coupon.code;
              const discount = calculateDiscount(coupon);

              return (
                <div
                  key={coupon.code}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isApplied
                      ? "bg-emerald-950/30 border-emerald-500/60 ring-1 ring-emerald-500/30"
                      : "bg-slate-950 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                          {coupon.code}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          {coupon.badge}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-200">{coupon.title}</div>
                      <div className="text-[11px] text-slate-400 leading-snug">{coupon.description}</div>
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      <div className="text-xs font-black text-emerald-400 font-mono">
                        Save ₹{discount.toFixed(0)}
                      </div>
                      {isApplied ? (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                          <Check className="w-3.5 h-3.5" />
                          <span>Applied</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApplyCouponObj(coupon)}
                          className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-xl text-xs transition-all active:scale-95 shadow"
                        >
                          APPLY
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
