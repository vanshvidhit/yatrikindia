import React, { useState, useEffect } from "react";
import {
  Smartphone,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Receipt,
  Volume2,
  CreditCard,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCw,
  Wallet,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import { ActiveRide } from "../../types";
import { useRideStore } from "../../store/useRideStore";
import { BRAND_CONFIG } from "../../config/brandConfig";

export interface UpiPaymentDetails {
  method: "UPI" | "CASH";
  app?: string;
  utr: string;
  amount: number;
  timestamp: number;
}

interface UpiPaymentModalProps {
  ride: ActiveRide;
  onPaymentComplete: (details: UpiPaymentDetails) => void;
  onClose?: () => void;
}

type UpiAppId = "GPAY" | "PHONEPE" | "PAYTM" | "CRED" | "BHIM" | "CASH";

interface UpiAppOption {
  id: UpiAppId;
  name: string;
  tagline: string;
  iconBg: string;
  badgeColor: string;
  logoType: "GPAY" | "PHONEPE" | "PAYTM" | "CRED" | "BHIM" | "CASH";
  scheme: string;
  popular?: boolean;
}

const UPI_APPS: UpiAppOption[] = [
  {
    id: "GPAY",
    name: "Google Pay (GPay)",
    tagline: "Instant UPI Intent • Official GPay app",
    iconBg: "bg-white text-slate-900 border border-slate-200",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    logoType: "GPAY",
    scheme: "gpay://upi/pay",
    popular: true,
  },
  {
    id: "PHONEPE",
    name: "PhonePe UPI",
    tagline: "Direct Bank UPI • Instant transfer",
    iconBg: "bg-[#5f259f] text-white",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    logoType: "PHONEPE",
    scheme: "phonepe://pay",
    popular: true,
  },
  {
    id: "PAYTM",
    name: "Paytm UPI",
    tagline: "Paytm Payments Bank / Wallet UPI",
    iconBg: "bg-[#002970] text-cyan-400",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    logoType: "PAYTM",
    scheme: "paytmmp://pay",
  },
  {
    id: "CRED",
    name: "CRED UPI",
    tagline: "Earn CRED coins & cashback rewards",
    iconBg: "bg-black text-white border border-slate-700",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    logoType: "CRED",
    scheme: "cred://upi/pay",
  },
  {
    id: "BHIM",
    name: "BHIM / Other UPI App",
    tagline: "NPCI Unified Payments Interface",
    iconBg: "bg-amber-600 text-white",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    logoType: "BHIM",
    scheme: "upi://pay",
  },
  {
    id: "CASH",
    name: "Pay Cash to Captain",
    tagline: "Hand over physical cash upon arrival",
    iconBg: "bg-emerald-700 text-white",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    logoType: "CASH",
    scheme: "",
  },
];

// Dual-tone chime replicating Indian UPI soundbox tone (587Hz & 880Hz)
function playUpiPaymentChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.25, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (err) {
    console.warn("Web Audio chime could not play:", err);
  }
}

// Voice announcement replicating BharatPe/Paytm Soundbox
function announceUpiPayment(amount: number, brand: string = "Yatrik") {
  try {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        `Payment of ${Math.round(amount)} rupees received on ${brand} UPI.`
      );
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      utterance.lang = "en-IN";
      window.speechSynthesis.speak(utterance);
    }
  } catch (err) {
    console.warn("Speech synthesis error:", err);
  }
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  ride,
  onPaymentComplete,
  onClose,
}) => {
  const { brandName } = useRideStore();
  const [captainTip, setCaptainTip] = useState<number>(0);
  const basePayable = ride.payableAmount || ride.estimatedFare || 150.0;
  const payableAmount = basePayable + captainTip;
  const captainName = ride.driverDetails?.driverName || "Ramesh Kumar";
  const vehicleNumber = ride.driverDetails?.vehicleNumber || "KA-01-MJ-4092";

  const [step, setStep] = useState<
    "SELECT_APP" | "INTENT_LAUNCHING" | "PIN_PROMPT" | "PROCESSING" | "SUCCESS" | "CASH_COLLECT"
  >("SELECT_APP");
  const [selectedApp, setSelectedApp] = useState<UpiAppOption>(UPI_APPS[0]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showFareBreakdown, setShowFareBreakdown] = useState(false);
  const [enteredPin, setEnteredPin] = useState<string>("");
  const [processingStage, setProcessingStage] = useState<number>(1);
  const [utrNumber, setUtrNumber] = useState<string>("");
  const [soundAnnounced, setSoundAnnounced] = useState(false);

  // Generate NPCI UPI standard URI with brand parameters
  const upiId = `${brandName.toLowerCase().replace(/[^a-z0-9]/g, "")}.mobility@icici`;
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    brandName + " Mobility"
  )}&tr=YK-${ride.rideId}&am=${payableAmount.toFixed(
    2
  )}&cu=INR&mc=4121&tn=${encodeURIComponent(brandName + " Trip Payment")}`;

  const handleCopyUpiUri = () => {
    navigator.clipboard.writeText(upiUri);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Trigger Intent Flow
  const handleSelectApp = (app: UpiAppOption) => {
    setSelectedApp(app);
    if (app.id === "CASH") {
      setStep("CASH_COLLECT");
      return;
    }

    // Move to simulated Intent Trigger
    setStep("INTENT_LAUNCHING");
    setTimeout(() => {
      setStep("PIN_PROMPT");
    }, 1400);
  };

  // Authorize UPI Payment
  const handleAuthorizePayment = () => {
    setStep("PROCESSING");
    setProcessingStage(1);

    // Multi-stage realistic NPCI UPI verification
    setTimeout(() => {
      setProcessingStage(2);
    }, 900);

    setTimeout(() => {
      setProcessingStage(3);
    }, 1800);

    setTimeout(() => {
      const generatedUtr = `4289${Math.floor(10000000 + Math.random() * 90000000)}`;
      setUtrNumber(generatedUtr);
      setStep("SUCCESS");

      // Play Soundbox Chime & Confetti
      playUpiPaymentChime();
      try {
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.55 },
          colors: ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"],
        });
      } catch {
        // ignore
      }

      // Voice alert
      announceUpiPayment(payableAmount);
      setSoundAnnounced(true);
    }, 2800);
  };

  // Cash confirmed by captain
  const handleConfirmCash = () => {
    const cashUtr = `CASH-${Math.floor(100000 + Math.random() * 900000)}`;
    setUtrNumber(cashUtr);
    setStep("SUCCESS");
    playUpiPaymentChime();
  };

  // Finish and return details
  const handleFinish = () => {
    onPaymentComplete({
      method: selectedApp.id === "CASH" ? "CASH" : "UPI",
      app: selectedApp.name,
      utr: utrNumber || `4289${Math.floor(10000000 + Math.random() * 90000000)}`,
      amount: payableAmount,
      timestamp: Date.now(),
    });
  };

  return (
    <div
      id="upi-payment-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col justify-end sm:justify-center items-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-slate-200 flex flex-col max-h-[92vh]">
        {/* TOP STATUS BAR: Trip Arrived & Destination */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-4 py-3 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              Trip Completed • Payment Due
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>NPCI 256-bit Secure</span>
          </div>
        </div>

        {/* STEP 1: SELECT UPI APP VIEW */}
        {step === "SELECT_APP" && (
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
            {/* Amount Card */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-center space-y-1 relative shadow-inner">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Amount Payable to Captain {captainName}
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight flex items-center justify-center gap-1">
                <span className="text-emerald-400 text-2xl sm:text-3xl">₹</span>
                <span>{payableAmount.toFixed(2)}</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-center gap-2">
                <span>{vehicleNumber}</span>
                <span>•</span>
                <span>{ride.distanceKm} km</span>
                <span>•</span>
                <span>{ride.durationMin} mins</span>
              </div>

              {/* Collapsible Upfront Fare Itemization */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowFareBreakdown(!showFareBreakdown)}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1 transition-colors"
                >
                  <Receipt className="w-3 h-3" />
                  <span>{showFareBreakdown ? "Hide Fare Breakup" : "View Upfront Fare Breakup"}</span>
                  {showFareBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {showFareBreakdown && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 text-left text-xs space-y-1 text-slate-400">
                    <div className="flex justify-between">
                      <span>Base Fare</span>
                      <span className="font-mono text-slate-200">₹30.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Distance Fare ({ride.distanceKm} km)</span>
                      <span className="font-mono text-slate-200">
                        ₹{(Math.max(10, ride.distanceKm * 14)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Convenience Fee</span>
                      <span className="font-mono text-slate-200">₹15.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transport GST (5%)</span>
                      <span className="font-mono text-slate-200">
                        ₹{(payableAmount * 0.05).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-800 font-bold text-white">
                      <span>Total Upfront Guaranteed</span>
                      <span className="font-mono text-emerald-400">₹{payableAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Captain Appreciation Tip: Indian Tradition of Chai / Fuel Tip */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <span>☕</span>
                  <span>Captain Appreciation Tip</span>
                </span>
                {captainTip > 0 && (
                  <span className="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                    +₹{captainTip} Added
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { amount: 10, label: "₹10", title: "Chai" },
                  { amount: 20, label: "₹20", title: "Fuel" },
                  { amount: 30, label: "₹30", title: "Superb" },
                  { amount: 50, label: "₹50", title: "Hero" },
                ].map((t) => (
                  <button
                    key={t.amount}
                    type="button"
                    onClick={() => setCaptainTip(captainTip === t.amount ? 0 : t.amount)}
                    className={`py-1.5 px-2 rounded-xl text-center border transition-all ${
                      captainTip === t.amount
                        ? "bg-amber-400 text-slate-950 font-black border-amber-300 shadow-sm"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-xs font-bold leading-none">{t.label}</div>
                    <div className={`text-[9px] mt-0.5 ${captainTip === t.amount ? "text-slate-900 font-bold" : "text-slate-500"}`}>
                      {t.title}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* UPI Intent Trigger Options */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                  Choose UPI Payment App
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Direct Intent Launch
                </span>
              </div>

              <div className="space-y-2">
                {UPI_APPS.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => handleSelectApp(app)}
                    id={`upi-intent-${app.id.toLowerCase()}-btn`}
                    className="w-full text-left p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* App Custom Logo Badge */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-md ${app.iconBg}`}
                      >
                        {app.logoType === "GPAY" && (
                          <div className="flex items-center font-black text-xs tracking-tighter">
                            <span className="text-blue-500">G</span>
                            <span className="text-red-500">P</span>
                            <span className="text-amber-500">a</span>
                            <span className="text-green-500">y</span>
                          </div>
                        )}
                        {app.logoType === "PHONEPE" && <span className="font-bold text-base">पे</span>}
                        {app.logoType === "PAYTM" && (
                          <span className="font-extrabold text-[10px] tracking-tight">Paytm</span>
                        )}
                        {app.logoType === "CRED" && <span className="font-black text-xs">CRED</span>}
                        {app.logoType === "BHIM" && <span className="font-bold text-xs">BHIM</span>}
                        {app.logoType === "CASH" && <Wallet className="w-5 h-5 text-white" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors truncate">
                            {app.name}
                          </span>
                          {app.popular && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded border bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                              Instant
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">{app.tagline}</div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5 pl-2">
                      <span className="text-xs font-mono font-bold text-slate-300 group-hover:text-white">
                        ₹{payableAmount.toFixed(2)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Action: Copy Raw UPI Deep Link Scheme */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-mono text-[10px] text-slate-500">UPI VPA: yatrik.mobility@icici</span>
                <button
                  type="button"
                  onClick={handleCopyUpiUri}
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors font-semibold"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Intent Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Intent URI</span>
                    </>
                  )}
                </button>
              </div>
              <div className="font-mono text-[10px] text-slate-500 truncate select-all bg-slate-900 px-2 py-1 rounded border border-slate-800">
                {upiUri}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SIMULATING UPI INTENT TRIGGER DISPATCH */}
        {step === "INTENT_LAUNCHING" && (
          <div className="p-8 text-center space-y-5 my-auto">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
              <Smartphone className="w-7 h-7 text-blue-400" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-white">
                Launching {selectedApp.name}...
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Triggering native mobile UPI Intent scheme (
                <span className="font-mono text-slate-300">{selectedApp.scheme}</span>) for {brandName} Mobility.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1 max-w-xs mx-auto text-left">
              <div className="text-slate-500 text-[9px] uppercase">Intent Parameter Payload</div>
              <div className="truncate text-blue-400">pa: {upiId}</div>
              <div className="truncate text-emerald-400">am: ₹{payableAmount.toFixed(2)}</div>
              <div className="truncate text-amber-400">tr: YK-{ride.rideId}</div>
            </div>
          </div>
        )}

        {/* STEP 3: MOCK IN-APP UPI PAYMENT & PIN SCREEN */}
        {step === "PIN_PROMPT" && (
          <div className="p-5 space-y-4 overflow-y-auto">
            {/* Authentic Simulated App Header */}
            <div
              className={`p-3.5 rounded-2xl flex items-center justify-between text-white shadow-lg ${
                selectedApp.id === "PHONEPE"
                  ? "bg-[#5f259f]"
                  : selectedApp.id === "GPAY"
                  ? "bg-slate-800 border border-slate-700"
                  : selectedApp.id === "PAYTM"
                  ? "bg-[#002970]"
                  : "bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-xs">
                  {selectedApp.id === "GPAY"
                    ? "G"
                    : selectedApp.id === "PHONEPE"
                    ? "पे"
                    : selectedApp.id === "PAYTM"
                    ? "P"
                    : "UPI"}
                </div>
                <div>
                  <div className="text-xs font-black leading-none">{selectedApp.name}</div>
                  <div className="text-[10px] text-white/80 mt-0.5">UPI Auto-Intent Active</div>
                </div>
              </div>

              <div className="text-right font-mono font-bold text-sm">
                ₹{payableAmount.toFixed(2)}
              </div>
            </div>

            {/* Merchant & Bank Details */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-semibold">Paying To</div>
                  <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
                    <span>{brandName} Mobility India</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">{upiId}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Verified
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="font-semibold text-white">HDFC Bank •••• 4018</div>
                    <div className="text-[10px] text-slate-400">Savings Account (Primary)</div>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                  Bal: ₹14,250
                </span>
              </div>
            </div>

            {/* Interactive Simulated UPI PIN Pad */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <Lock className="w-3 h-3 text-amber-400" />
                <span className="font-semibold">Enter 4 or 6-digit UPI PIN</span>
              </div>

              {/* Masked PIN circles */}
              <div className="flex justify-center gap-3 py-1">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full border transition-all ${
                      enteredPin.length > idx
                        ? "bg-blue-400 border-blue-300 scale-110 shadow-sm shadow-blue-500/50"
                        : "bg-slate-800 border-slate-700"
                    }`}
                  />
                ))}
              </div>

              {/* Quick keypad input or instant authorize */}
              <div className="grid grid-cols-3 gap-1.5 max-w-[220px] mx-auto pt-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, "C", 0, "✓"].map((keyVal) => (
                  <button
                    key={keyVal}
                    type="button"
                    onClick={() => {
                      if (keyVal === "C") {
                        setEnteredPin("");
                      } else if (keyVal === "✓") {
                        handleAuthorizePayment();
                      } else {
                        if (enteredPin.length < 6) {
                          const nextPin = enteredPin + keyVal;
                          setEnteredPin(nextPin);
                          if (nextPin.length >= 4) {
                            // Auto trigger authorize
                            setTimeout(() => handleAuthorizePayment(), 300);
                          }
                        }
                      }
                    }}
                    className="h-9 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800/80 text-xs font-mono font-bold text-slate-200 active:scale-95 transition-all"
                  >
                    {keyVal}
                  </button>
                ))}
              </div>

              <div className="text-[10px] text-slate-500 pt-1">
                NPCI UPI 256-bit encrypted. Never share your UPI PIN.
              </div>
            </div>

            {/* Direct Pay Action Button */}
            <button
              onClick={handleAuthorizePayment}
              id="upi-confirm-authorize-btn"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Authorize Payment of ₹{payableAmount.toFixed(2)}</span>
            </button>
          </div>
        )}

        {/* STEP 4: PROCESSING WITH NPCI & ISSUING BANK */}
        {step === "PROCESSING" && (
          <div className="p-8 text-center space-y-6 my-auto">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-t-emerald-400 animate-spin" />
              <RefreshCw className="w-7 h-7 text-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-white">Processing UPI Transaction...</h3>
              <p className="text-xs text-slate-400">
                Please do not press back or close the window while we confirm with NPCI.
              </p>
            </div>

            {/* Stages indicator */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-left text-xs space-y-2 max-w-xs mx-auto">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`w-3.5 h-3.5 ${
                    processingStage >= 1 ? "text-emerald-400" : "text-slate-600"
                  }`}
                />
                <span className={processingStage >= 1 ? "text-white" : "text-slate-500"}>
                  Contacting NPCI Central Switch...
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`w-3.5 h-3.5 ${
                    processingStage >= 2 ? "text-emerald-400" : "text-slate-600"
                  }`}
                />
                <span className={processingStage >= 2 ? "text-white" : "text-slate-500"}>
                  Debiting HDFC Bank account...
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`w-3.5 h-3.5 ${
                    processingStage >= 3 ? "text-emerald-400" : "text-slate-600"
                  }`}
                />
                <span className={processingStage >= 3 ? "text-white" : "text-slate-500"}>
                  Direct settlement to Captain UPI Escrow...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: CASH COLLECTION VIEW */}
        {step === "CASH_COLLECT" && (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
              <Wallet className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-white">Pay Cash to Captain</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Please hand over the exact cash amount to Captain {captainName} ({vehicleNumber}).
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-1">
              <div className="text-[11px] uppercase text-slate-500 font-semibold">Total Cash to Collect</div>
              <div className="text-3xl font-black text-emerald-400 font-mono">
                ₹{payableAmount.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400">No additional platform surcharge applied</div>
            </div>

            <button
              type="button"
              onClick={handleConfirmCash}
              id="cash-handed-over-btn"
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Captain Confirms Cash Received</span>
            </button>

            <button
              type="button"
              onClick={() => setStep("SELECT_APP")}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Switch back to UPI payment
            </button>
          </div>
        )}

        {/* STEP 6: PAYMENT SUCCESS & SOUNDBOX CONFIRMATION */}
        {step === "SUCCESS" && (
          <div className="p-6 text-center space-y-4 my-auto animate-in zoom-in-95 duration-200">
            {/* Animated Checkmark */}
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto animate-bounce shadow-xl">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                <Sparkles className="w-3 h-3" />
                <span>Payment Successful</span>
              </div>
              <h2 className="text-2xl font-black text-white font-mono">
                ₹{payableAmount.toFixed(2)}
              </h2>
              <p className="text-xs text-slate-300">
                Paid to {brandName} Mobility via {selectedApp.name}
              </p>
            </div>

            {/* Soundbox Announcement Banner */}
            <div className="p-3 bg-emerald-950/60 border border-emerald-600/40 rounded-2xl flex items-center justify-between text-xs text-emerald-300 text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 shrink-0 animate-pulse">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-[11px]">UPI Soundbox Broadcast</div>
                  <div className="text-[10px] text-emerald-400/90">
                    "₹{payableAmount.toFixed(2)} received on {brandName} UPI!"
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  playUpiPaymentChime();
                  announceUpiPayment(payableAmount, brandName);
                }}
                className="text-[10px] font-semibold bg-emerald-800/60 hover:bg-emerald-700/80 px-2 py-1 rounded-lg text-white border border-emerald-500/30 transition-colors"
                title="Replay payment audio chime"
              >
                Replay
              </button>
            </div>

            {/* NPCI UTR & Transaction Details Card */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-1.5 text-left font-mono">
              <div className="flex justify-between text-slate-400">
                <span className="text-[10px] uppercase">Bank UTR</span>
                <span className="font-bold text-slate-200">{utrNumber}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="text-[10px] uppercase">UPI Reference</span>
                <span className="text-slate-300">UPI/{utrNumber?.slice(0, 6)}/CR</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="text-[10px] uppercase">Payment Mode</span>
                <span className="text-slate-300">
                  {selectedApp.id === "CASH" ? "Physical Cash" : `${selectedApp.name} (UPI Intent)`}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="text-[10px] uppercase">Paid At</span>
                <span className="text-slate-300">
                  {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              </div>
            </div>

            {/* Continue to Trip Summary CTA */}
            <button
              onClick={handleFinish}
              id="upi-payment-finish-btn"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
            >
              <span>View Trip Receipt & Rate Captain</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
