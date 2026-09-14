import React, { useState } from "react";
import { Car, Bike, Phone, ShieldCheck, ArrowRight, Award } from "lucide-react";
import { sendOtpApi, verifyOtpApi } from "../../services/api";
import { useRideStore } from "../../store/useRideStore";
import { VehicleType } from "../../types";

export const DriverAuthView: React.FC = () => {
  const { setDriverAuth } = useRideStore();
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [phone, setPhone] = useState("+1 (555) 456-7890");
  const [otp, setOtp] = useState("4821");
  const [name, setName] = useState("Devon Miller");
  const [vehicleType, setVehicleType] = useState<VehicleType>("CAB");
  const [vehicleNumber, setVehicleNumber] = useState("KA-01-RF-9042");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    setError("");
    const res = await sendOtpApi(phone, "driver");
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
      role: "driver",
      name,
      vehicleType,
      vehicleNumber,
    });
    setLoading(false);
    if (res.success) {
      setDriverAuth({
        isLoggedIn: true,
        id: res.user.id,
        name: res.user.name,
        phone: res.user.phone,
        vehicleType,
        vehicleNumber,
        rating: 4.94,
        isOnline: true,
        earningsToday: 142.5,
        completedTrips: 8,
        acceptanceRate: 96,
      });
    } else {
      setError(res.error || "Verification failed");
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-slate-900 text-white overflow-y-auto">
      <div className="pt-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg mb-4">
          <Award className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
          {step === "PHONE" ? "Captain Partner Onboarding" : "Verify Captain Passcode"}
        </h1>
        <p className="text-xs text-slate-400">
          {step === "PHONE"
            ? "Drive, earn on your terms with real-time dispatch and instant payouts."
            : `Enter the 4-digit code sent to ${phone}. (Mock OTP: 4821)`}
        </p>
      </div>

      <div className="my-auto py-4">
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {step === "PHONE" ? (
          <form onSubmit={handleSendOtp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Captain Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Devon Miller"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                  required
                />
              </div>
            </div>

            {/* Vehicle Tier Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Vehicle Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "CAB" as VehicleType, label: "Premier Cab", icon: Car },
                  { id: "AUTO" as VehicleType, label: "Auto 3W", icon: Car },
                  { id: "BIKE" as VehicleType, label: "Moto Bike", icon: Bike },
                ].map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVehicleType(v.id)}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      vehicleType === v.id
                        ? "bg-emerald-600/20 border-emerald-500 text-emerald-400 font-bold"
                        : "bg-slate-800 border-slate-700 text-slate-400"
                    }`}
                  >
                    <div className="text-xs">{v.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Vehicle License Number
              </label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="KA-01-RF-9042"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all text-sm mt-4"
            >
              {loading ? "Sending Code..." : "Continue to Verify"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                4-Digit Captain OTP
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="4821"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white tracking-widest text-center text-lg font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep("PHONE")}
                className="w-1/3 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 text-sm"
              >
                {loading ? "Authorizing..." : "Start Driving"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="pt-3 border-t border-slate-800 text-center">
        <p className="text-[11px] text-slate-500">
          Commercial License & Background Verification Checked ✓
        </p>
      </div>
    </div>
  );
};
