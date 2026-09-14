import React, { useState } from "react";
import { Phone, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { sendOtpApi, verifyOtpApi } from "../../services/api";
import { useRideStore } from "../../store/useRideStore";
import { BrandLogo } from "../common/BrandLogo";

export const RiderAuthView: React.FC = () => {
  const { setRiderAuth, brandName } = useRideStore();
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [phone, setPhone] = useState("+1 (555) 789-2045");
  const [otp, setOtp] = useState("4821");
  const [name, setName] = useState("Alex Vance");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    setError("");
    const res = await sendOtpApi(phone, "rider");
    setLoading(false);
    if (res.success) {
      setStep("OTP");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await verifyOtpApi({
      phone,
      otp,
      role: "rider",
      name,
    });
    setLoading(false);
    if (res.success) {
      setRiderAuth({
        isLoggedIn: true,
        id: res.user.id,
        name: res.user.name,
        phone: res.user.phone,
        rating: res.user.rating || 4.98,
      });
    } else {
      setError(res.error || "Verification failed");
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-slate-900 text-white">
      <div className="pt-6">
        <div className="mb-5">
          <BrandLogo size={44} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          {step === "PHONE" ? `Get Moving with ${brandName}` : "Enter Verification Code"}
        </h1>
        <p className="text-sm text-slate-400">
          {step === "PHONE"
            ? "Enter your phone number to sign in or create your rider account."
            : `We sent a 4-digit verification code to ${phone}. (Mock OTP: 4821)`}
        </p>
      </div>

      <div className="my-auto">
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {step === "PHONE" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Vance"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all text-sm mt-4"
            >
              {loading ? "Sending Code..." : "Continue"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                4-Digit OTP Code
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="4821"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white tracking-widest text-center text-lg font-mono focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep("PHONE")}
                className="w-1/3 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-all"
              >
                Change
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all text-sm"
              >
                {loading ? "Verifying..." : "Verify & Sign In"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="pt-4 border-t border-slate-800 text-center">
        <p className="text-[11px] text-slate-500">
          By signing in, you agree to Yatrik India Safety Policy & Terms.
        </p>
      </div>
    </div>
  );
};
